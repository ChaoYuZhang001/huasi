"""Bake the original Shaolin sculpture reference sheets into textured closed meshes.
Offline dependencies: numpy, Pillow, scipy, scikit-image, opencv-python, onnxruntime.
Supply the Depth Anything V2 Small ONNX model as the positional argument.
"""
import argparse
import io
import json
import math
import struct
import subprocess
import tempfile
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image
from scipy import ndimage
from skimage.measure import marching_cubes

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / 'art/refs'
SHEETS = REF / 'shaolin'
OUT = ROOT / 'models/shaolin'


def crop_view(path, columns=1, rows=1, index=0, studio=False):
    full = Image.open(path).convert('RGB')
    col, row = index % columns, index // columns
    width, height = full.size
    crop = full.crop((col*width//columns,row*height//rows,(col+1)*width//columns,(row+1)*height//rows))
    rgb = np.array(crop)
    if studio:
        labels = np.zeros(rgb.shape[:2], np.uint8)
        h,w = labels.shape
        cv2.setRNGSeed(11)
        cv2.grabCut(rgb,labels,(int(w*.07),1,int(w*.86),h-3),None,None,7,cv2.GC_INIT_WITH_RECT)
        mask = (labels & 1).astype(bool)
    else:
        mask = rgb.min(axis=2) < 208
        mask = ndimage.binary_closing(mask,iterations=2)
    components, count = ndimage.label(mask)
    if not count:
        raise ValueError(f'Empty sculpture in {path} cell {index}')
    # Discard touching fragments of a neighbour across a contact-sheet gutter.
    mask = components == np.bincount(components.ravel())[1:].argmax()+1
    ys,xs = np.where(mask)
    bounds = np.s_[ys.min():ys.max()+1,xs.min():xs.max()+1]
    mask, rgb = mask[bounds],rgb[bounds]
    inside = ndimage.binary_erosion(mask,iterations=2)
    edge_source = ndimage.distance_transform_edt(~inside,return_distances=False,return_indices=True)
    clean = np.ascontiguousarray(rgb[tuple(edge_source)])
    return clean,mask


def relief(rgb,mask,session):
    h,w=mask.shape
    scale=448/max(h,w)
    size=(max(14,round(w*scale/14)*14),max(14,round(h*scale/14)*14))
    isolated=np.where(mask[:,:,None],rgb,222).astype(np.uint8)
    img=cv2.resize(isolated,size,interpolation=cv2.INTER_AREA).astype('float32')/255
    img=(img-np.float32([.485,.456,.406]))/np.float32([.229,.224,.225])
    inp=np.ascontiguousarray(img.transpose(2,0,1)[None])
    result=session.run(None,{session.get_inputs()[0].name:inp})[0].squeeze()
    depth=cv2.resize(result,(w,h),interpolation=cv2.INTER_CUBIC)
    lo,hi=np.percentile(depth[mask],[2,98])
    return np.clip((depth-lo)/max(1e-5,hi-lo),0,1)


def write_glb(dest, name, xyz, triangles, uv, img):
    xyz=np.asarray(xyz,dtype='<f4')
    tri=np.asarray(triangles,dtype=np.int32)
    normals=np.zeros_like(xyz)
    delta=np.cross(xyz[tri[:,1]]-xyz[tri[:,0]],xyz[tri[:,2]]-xyz[tri[:,0]])
    for corner in range(3):
        np.add.at(normals,tri[:,corner],delta)
    normals/=np.maximum(np.linalg.norm(normals,axis=1,keepdims=True),1e-9)
    data=bytearray()
    views,accessors=[],[]
    def block(raw,target=None):
        data.extend(b'\0'*(-len(data)%4))
        view={'buffer':0,'byteOffset':len(data),'byteLength':len(raw)}
        if target: view['target']=target
        views.append(view)
        data.extend(raw)
        return len(views)-1
    small=len(xyz)<65536
    for arr,kind,ct,target in [(xyz,'VEC3',5126,34962),(normals,'VEC3',5126,34962),(np.asarray(uv,dtype='<f4'),'VEC2',5126,34962),(tri.astype('<u2' if small else '<u4').ravel(),'SCALAR',5123 if small else 5125,34963)]:
        acc=dict(bufferView=block(arr.tobytes(),target),count=len(arr),componentType=ct,type=kind)
        if arr is xyz: acc.update(min=arr.min(0).tolist(),max=arr.max(0).tolist())
        accessors.append(acc)
    buf=io.BytesIO()
    Image.fromarray(img).save(buf,'JPEG',quality=91,optimize=True)
    picture=block(buf.getvalue())
    doc=dict(asset=dict(version='2.0',generator='Sansi sculpture workshop'),scene=0,scenes=[dict(nodes=[0])],
             nodes=[dict(mesh=0,name=name)],meshes=[dict(primitives=[dict(attributes=dict(POSITION=0,NORMAL=1,TEXCOORD_0=2),indices=3,material=0)])],
             materials=[dict(name='Carved and painted surface',pbrMetallicRoughness=dict(baseColorTexture=dict(index=0),metallicFactor=.09,roughnessFactor=.82))],
             textures=[dict(source=0)],images=[dict(bufferView=picture,mimeType='image/jpeg')],accessors=accessors,bufferViews=views,buffers=[dict(byteLength=len(data))])
    meta=json.dumps(doc,separators=(',',':')).encode();meta+=b' '*(-len(meta)%4);data+=b'\0'*(-len(data)%4)
    dest.write_bytes(struct.pack('<4sIIII',b'glTF',2,28+len(meta)+len(data),len(meta),0x4e4f534a)+meta+struct.pack('<II',len(data),0x004e4942)+data)
    print(name,len(tri),'triangles',dest.stat().st_size,'bytes',flush=True)


def cloth_back(rgb,mask):
    # Unpictured backs have carved robe grain. Keep frontal faces, hands and
    # inscriptions exclusively on their actual surface.
    h,w=mask.shape
    patch=rgb[int(h*.66):int(h*.79),int(w*.23):int(w*.44)]
    patch=cv2.GaussianBlur(patch,(0,0),2.3)
    y,x=np.indices((h,w))
    uu=(x/w*2.5+.15*np.sin(y/h*5))%2
    vv=(y/h*4+.21*(x/w-.5)**2)%2
    return patch[(abs(1-vv)*(len(patch)-1)).astype(int),(abs(1-uu)*(patch.shape[1]-1)).astype(int)]


def carve(name,front,side,session,output=OUT):
    rgb,mask=front
    side_rgb,side_mask=side
    h,w=mask.shape
    sh,sw=side_mask.shape
    depth=relief(rgb,mask,session)
    # Intersect the two silhouettes, retaining open spaces between limbs and
    # implements. Round each cross section and sculpt the front with relief.
    res=148
    gw=max(20,round(res*w/h));gz=max(18,round(res*sw/sh))
    fm=np.pad(cv2.resize(mask.astype('uint8'),(gw,res),interpolation=cv2.INTER_NEAREST)>0,2)
    sm=np.pad(cv2.resize(side_mask.astype('uint8'),(gz,res),interpolation=cv2.INTER_NEAREST)>0,2)
    depth=np.pad(cv2.resize(depth,(gw,res)),2,mode='edge')
    def signed_distance(m):
        return ndimage.distance_transform_edt(m)-ndimage.distance_transform_edt(~m)
    def section(m):
        left=m.argmax(1);right=m.shape[1]-1-m[:,::-1].argmax(1)
        middle=(left+right)*.5
        return (np.arange(m.shape[1])[None,:]-middle[:,None])/np.maximum((right-left)*.5,1)[:,None]
    nx,nz=section(fm),section(sm)
    # Negative Z in the game is the rear. In the side plate the nose points right.
    face_depth=.78+.22*depth
    nz_grid=nz[:,None,:]
    nz_carved=nz_grid/np.where(nz_grid>0,face_depth[:,:,None],1)
    oval=(1-np.abs(nx[:,:,None])**2.4-np.abs(nz_carved)**2.4)*12
    volume=np.minimum(np.minimum(signed_distance(fm)[:,:,None],signed_distance(sm)[:,None,:]),oval)
    verts,faces,_,_=marching_cubes(volume,level=0,allow_degenerate=False)
    xyz=np.column_stack(((verts[:,1]-2-(gw-1)*.5)/res,1-(verts[:,0]-2)/(res-1),(verts[:,2]-2-(gz-1)*.5)/res))
    signed=np.einsum('ij,ij->i',xyz[faces[:,0]],np.cross(xyz[faces[:,1]],xyz[faces[:,2]])).sum()
    if signed<0: faces=faces[:,::-1]
    # Three orthographic UV islands. For the armoured figures the aisle sees
    # a side at close range, so the profile has a dedicated texture island.
    # Use stable radial directions near the head / knees instead of letting
    # a fine wrinkle switch between photos on neighbouring triangles.
    rx=ndimage.map_coordinates(nx,verts[:,:2].T,order=1,mode='nearest')
    rz=ndimage.map_coordinates(nz,verts[:,[0,2]].T,order=1,mode='nearest')
    side_on=np.abs(rx[faces].mean(1))>np.abs(rz[faces].mean(1))*.98
    view=np.where(side_on,2,np.where(rz[faces].mean(1)>=0,0,1))
    side_rgb=cv2.resize(side_rgb,(w,h))
    atlas=np.concatenate([rgb,cloth_back(rgb,mask),side_rgb],axis=1)
    parts=[];coords=[];indices=[];offset=0
    for i in range(3):
        vertices,remap=np.unique(faces[view==i],return_inverse=True)
        u=(verts[vertices,2]-2)/(gz-1) if i==2 else (verts[vertices,1]-2)/(gw-1)
        if i==1: u=1-u
        v=(verts[vertices,0]-2)/(res-1)
        coords.append(np.column_stack(((i+np.clip(u,.001,.999))/3,np.clip(v,0,1))))
        parts.append(xyz[vertices]);indices.append(remap.reshape(-1,3)+offset);offset+=len(vertices)
    write_glb(output/(name+'.glb'),name,np.concatenate(parts),np.concatenate(indices),np.concatenate(coords),atlas)


def carve_turn(name, front_view, side_view, session, back_view=None, output=OUT):
    # A three-view loft. In the old frontal model the lip colour continued
    # around the jaw. Here the silhouette AND colour of the face in profile
    # come from the side view, including the recess between the two lips.
    front,m=front_view
    side,sm=side_view
    rear,rm=back_view if back_view is not None else (cloth_back(front,m),m)
    h,w=m.shape;sh,sw=sm.shape
    dep=relief(front,m,session)
    def profile(mask):
        left=mask.argmax(1);right=mask.shape[1]-1-mask[:,::-1].argmax(1)
        return left,right
    left,right=profile(m);sl,sr=profile(sm);rl,rr=profile(rm)
    dark_wood=name=='damo'
    if dark_wood:
        # Anatomical landmarks matched in the two plates.
        front_y=[0,.125,.168,.203,.278,.36,.68,.945,1]
        side_y=[0,.139,.186,.216,.305,.37,.68,.945,1]
    else:
        front_y=side_y=[0,1]
    # Suppress single-pixel breaks in the photographed silhouette.
    sl=ndimage.gaussian_filter1d(sl.astype(float),2.2 if dark_wood else 1.1)
    sr=ndimage.gaussian_filter1d(sr.astype(float),2.2 if dark_wood else 1.1)
    center=(sl[-5]+sr[-5])*.5
    def surface(v,theta):
        iy=np.minimum(h-1,(v*(h-1)).astype(int))
        sy=np.interp(v,front_y,side_y);si=np.minimum(sh-1,(sy*(sh-1)).astype(int))
        xfrac=.5+.5*np.sin(theta);px=left[iy]+(right[iy]-left[iy])*xfrac
        b=(sl[si]-center)/sh;f=(sr[si]-center)/sh
        cz=(b+f)*.5;rz=(f-b)*.5
        co=np.cos(theta)
        # At the brow and nose the front ridge narrows before the temples.
        # This brings an eye seen in profile onto the corresponding frontal eye.
        power=np.interp(v,[0,.078,.12,.175,.245,.285,1],[1,1,3.9,3.5,2.9,1,1]) if dark_wood else 1.25
        z=cz+rz*np.sign(co)*abs(co)**np.where(co>0,power,1)
        # Bind midline depth to the exact sculptural profile while retaining
        # hollows around the eye sockets and rolls across the robe.
        depth=dep[iy,np.clip(px.astype(int),0,w-1)]
        mid=dep[iy,((left[iy]+right[iy])//2)]
        z+=np.where(co>0,(depth-mid)*.085*co**2,0)
        return px,iy,si,z
    small=name.startswith('seven-')
    rings,sides=(96,64) if small else (210,128)
    v,theta=np.meshgrid(np.linspace(0,1,rings),np.linspace(-math.pi,math.pi,sides+1),indexing='ij')
    px,iy,si,z=surface(v,theta)
    xyz=np.stack([(px-w*.5)/h,1-v,z],axis=-1).reshape(-1,3)*(1.66 if dark_wood else 1)
    uv=np.stack([(theta+math.pi)/(2*math.pi),v],axis=-1).reshape(-1,2)
    idx=np.arange((rings-1)*(sides+1)).reshape(rings-1,sides+1)[:,:-1].ravel()
    faces=np.vstack([np.stack([idx,idx+sides+1,idx+1],1),np.stack([idx+1,idx+sides+1,idx+sides+2],1)])
    for top,i in [(True,0),(False,rings-1)]:
        start=i*(sides+1);center_index=len(xyz);xyz=np.vstack([xyz,xyz[start:start+sides].mean(0)]);uv=np.vstack([uv,[.5,float(not top)]])
        a=np.arange(start,start+sides);cap=np.stack([a,np.full_like(a,center_index),a+1],1)
        faces=np.vstack([faces,cap[:,::-1] if top else cap])
    height,width=(512,768) if small else ((1152,1792) if dark_wood else (960,1440))
    v,theta=np.meshgrid(np.linspace(0,1,height),np.linspace(-math.pi,math.pi,width),indexing='ij')
    px,iy,si,z=surface(v,theta)
    ry=np.rint(v*(len(rm)-1)).astype(int)
    bx=rr[ry]-(rr[ry]-rl[ry])*(.5+.5*np.sin(theta))
    tex_front=front[iy,px.astype(int)].astype(float)
    tex_back=rear[ry,bx.astype(int)].astype(float)
    tex_side=side[si,np.clip((z*sh+center).astype(int),0,sw-1)].astype(float)
    abs_angle=abs(theta)
    def ease(a,b):
        t=np.clip((abs_angle-a)/(b-a),0,1);return (t*t*(3-2*t))[:,:,None]
    # At the mouth the strictly lateral image takes over before the profile.
    fac=ease(.51,.92);lat=tex_front*(1-fac)+tex_side*fac
    fac=ease(1.99,2.48)
    colour=lat*(1-fac)+tex_back*fac
    if dark_wood:
        # A frontal or lateral photograph sees very little of the underside
        # of the beard. Sample carved curls there in surface coordinates so
        # a narrow band of photo pixels cannot stretch across the whole chin.
        x=(px-w*.5)/h
        x_u=np.gradient(x,axis=1);z_u=np.gradient(z,axis=1)
        x_v=np.gradient(x,axis=0)*(len(v)-1);z_v=np.gradient(z,axis=0)*(len(v)-1)
        n_y=x_u*z_v-z_u*x_v
        down=-n_y/np.maximum(1.e-10,np.sqrt(n_y*n_y+x_u*x_u+z_u*z_u))
        # Planar XZ projection on the underside gives every curl actual area
        # even where the cheek and neck share nearly the same image row.
        def mirror(t): return 1-np.abs(1-np.mod(t,2))
        ux=mirror(x*7.5+.14*np.sin(23*z)+.57)
        uz=mirror(z*12.3+.17*np.sin(22*x)+.32)
        hair=front[(h*(.221+.047*uz)).astype(int),(w*(.451+.099*ux)).astype(int)].astype(float)
        daylight=np.clip(.78+.06*np.cos(21*z)+.055*np.sin(22*x),.68,.92)[:,:,None]
        under=np.clip((down-.16)/.52,0,1)*np.clip((v-.222)/.03,0,1)*np.clip((.354-v)/.024,0,1)
        colour=colour*(1-under[:,:,None])+hair*daylight*under[:,:,None]
    dest=ROOT/'models/shaolin-damo.glb' if dark_wood else output/(name+'.glb')
    write_glb(dest,name,xyz,faces,uv,np.uint8(np.clip(colour,0,255)))


def bake_schools(session):
    sheets=REF/'schools'
    output=ROOT/'models/schools'
    output.mkdir(exist_ok=True)
    groups={'dao':['zhenwu','father','mother','jade'],
            'mountain':['chen','budai','puxian','scholar'],
            'guards':['dragon-general','tiger-general','daoist','grotto-buddha'],
            'seven':[f'seven-{i+1}' for i in range(7)]}
    files=[]
    for title,names in groups.items():
        for i,name in enumerate(names):
            front=crop_view(sheets/(title+'.jpg'),len(names),2,i)
            profile=crop_view(sheets/(title+'.jpg'),len(names),2,len(names)+i)
            if name in ('dragon-general','tiger-general','jade','puxian'):
                carve(name,front,profile,session,output)
            else:
                carve_turn(name,front,profile,session,output=output)
            files.append(output/(name+'.glb'))
    return files


def bake_sanqing_caishen(session):
    sheet = REF / 'schools/sanqing-caishen.jpg'
    output = ROOT / 'models/schools'
    output.mkdir(parents=True, exist_ok=True)
    files = []
    for i, name in enumerate(['lingbao', 'yuanshi', 'daode', 'zhao-gongming']):
        front, side = crop_view(sheet, 4, 2, i), crop_view(sheet, 4, 2, i + 4)
        carve_turn(name, front, side, session, output=output)
        files.append(output / (name + '.glb'))
    return files


def bake_gate_protectors(session):
    sheet = SHEETS / 'gate-protectors.jpg'
    for index, name in enumerate(['weituo', 'vajra-open', 'vajra-closed']):
        carve(name, crop_view(sheet, 3, 2, index), crop_view(sheet, 3, 2, index+3), session)


def bake_shaolin(session):
    OUT.mkdir(exist_ok=True)
    carve_turn('damo',crop_view(SHEETS/'damo.jpg'),crop_view(SHEETS/'damo-turn.jpg',2,1,0),session,crop_view(SHEETS/'damo-turn.jpg',2,1,1))
    bake_gate_protectors(session)
    for index,name in enumerate(['east-king','south-king','north-king','west-king']):
        carve(name,crop_view(SHEETS/'guardians.jpg',4,1,index),crop_view(SHEETS/'guardian-profiles.jpg',4,1,index),session)
    for index,name in enumerate(['huike','sengcan','daoxin','hongren','huineng','kinnara','vairocana','amitabha']):
        if name!='amitabha': carve(name,crop_view(SHEETS/'monastery.jpg',4,2,index),crop_view(SHEETS/'monastery-profiles.jpg',4,2,index),session)
    buddha=REF/'buddha-main-hall-reference.png'
    def side(index): return crop_view(SHEETS/'hall-profiles.jpg',4,1,index)
    carve_turn('shakyamuni',crop_view(buddha,2,1,0,True),side(0),session,crop_view(buddha,2,1,1,True))
    carve_turn('medicine',crop_view(SHEETS/'medicine.jpg',2,1,0),side(1),session,crop_view(SHEETS/'medicine.jpg',2,1,1))
    carve_turn('amitabha',crop_view(SHEETS/'monastery.jpg',4,2,7),side(2),session)
    carve_turn('guanyin',crop_view(REF/'guanyin-reference.png',studio=True),side(3),session)
    return [ROOT/'models/shaolin-damo.glb',*sorted(OUT.glob('*.glb'))]


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('model',type=Path)
    parser.add_argument('--packer',type=Path,help='gltf-transform executable for producing the web distribution meshes')
    parser.add_argument('--collection',choices=['shaolin','schools','sanqing-caishen'],default='shaolin')
    args=parser.parse_args()
    opts=ort.SessionOptions();opts.intra_op_num_threads=3;opts.inter_op_num_threads=1
    session=ort.InferenceSession(str(args.model),sess_options=opts,providers=['CPUExecutionProvider'])
    if args.collection=='sanqing-caishen':
        sources=bake_sanqing_caishen(session)
    elif args.collection=='schools':
        sources=bake_schools(session)
    else:
        sources=bake_shaolin(session)
    if args.packer:
        for source in sources:
            with tempfile.TemporaryDirectory(dir=source.parent) as temp:
                slim=Path(temp)/'slim.glb'
                packed=Path(temp)/'packed.glb'
                subprocess.run([args.packer,'simplify',source,slim,'--ratio','.20','--error','.002'],check=True)
                subprocess.run([args.packer,'meshopt',slim,packed,'--level','high'],check=True)
                packed.replace(source)


if __name__=='__main__': main()
