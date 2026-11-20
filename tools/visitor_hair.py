"""Construct the two hairstyles in head-local metres and bake their hairlines."""
import cv2
import numpy as np
from PIL import Image
from scipy.interpolate import PchipInterpolator
from scipy.spatial import cKDTree
from scipy.ndimage import distance_transform_edt, gaussian_filter1d


def hair_mask(image, bounds, eyebrow=None):
    x, y, right, bottom = bounds
    crop = image[y:bottom, x:right]
    binary = (crop.max(axis=2) < 94).astype(np.uint8)
    if eyebrow is not None:
        cv2.fillPoly(binary, [(np.array(eyebrow) - [x, y]).astype(np.int32)], 0)
    _, labels, stats, _ = cv2.connectedComponentsWithStats(binary)
    mask = np.zeros(image.shape[:2], np.uint8)
    mask[y:bottom, x:right] = labels == 1 + stats[1:, cv2.CC_STAT_AREA].argmax()
    return mask


def bake_hair(sex, likeness, skin, triangles):
    src, camera = likeness.reference, likeness.camera
    female = sex == 'female'
    mask = hair_mask(src, (112,486,395,747) if female else (134,0,371,181),
                     [(314,637),(350,625),(357,638),(328,648),(311,649)] if female else None)
    # Keep lighter streaks inside the crown. A luminance threshold alone
    # removes these from the photographed albedo and flattens the part.
    contours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    crown=np.zeros_like(mask)
    cv2.drawContours(crown,contours,-1,1,cv2.FILLED)
    mask=np.where(np.indices(mask.shape)[0]<(632 if female else 99),crown,mask).astype(np.uint8)
    hair_distance=cv2.distanceTransform(mask,cv2.DIST_L2,5)-cv2.distanceTransform(1-mask,cv2.DIST_L2,5)
    yy, xx = distance_transform_edt(1-mask, return_distances=False, return_indices=True)
    clean = src[yy, xx]
    # Horizontal sections measured against the skull, from nape to crown.
    # Each row stores the height, half-width, front, rear and lateral offset.
    rows = np.array([
        [-.096,.064,.072,-.092,0],[-.064,.083,.090,-.109,0],
        [-.028,.093,.101,-.123,-.002],[.010,.095,.107,-.129,-.004],
        [.050,.094,.105,-.129,-.004],[.080,.087,.095,-.118,-.005],
        [.104,.074,.082,-.098,-.007],[.122,.057,.062,-.078,-.008],
        [.136,.031,.026,-.048,-.010],[.140,.001,-.010,-.012,-.011]
    ] if female else [
        [-.084,.064,.078,-.095,0],[-.059,.077,.085,-.120,0],
        [-.024,.088,.097,-.135,0],[.012,.096,.108,-.142,-.002],
        [.046,.099,.112,-.140,-.004],[.080,.100,.108,-.129,-.006],
        [.105,.090,.097,-.110,-.008],[.127,.068,.079,-.085,-.010],
        [.141,.042,.051,-.057,-.013],[.149,.001,-.001,-.003,-.014]
    ])
    top = rows[-1,0]
    sections = PchipInterpolator(rows[:,0], rows[:,1:], extrapolate=False)

    def section(phi, height):
        width, front, rear, offset = np.moveaxis(sections(height), -1, 0)
        depth = (front-rear)/2
        return np.stack([offset+width*np.sin(phi),height,(front+rear)/2+depth*np.cos(phi)],axis=-1)

    def sample(tex, xy):
        return cv2.remap(tex,xy.astype(np.float32),None,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)

    # Trace the observed lower edge in the portrait only on camera-facing hair.
    # The ear and nape behind it are shaped in model space for a continuous rim.
    angles = np.linspace(-np.pi,np.pi,257)
    grid, levels = np.meshgrid(angles,np.linspace(top-.003,rows[0,0],170))
    visible = sample(mask.astype(np.float32),camera.project(section(grid,levels)))>.5
    edge = np.full_like(angles,.055)
    for i, col in enumerate(visible.T):
        covered=np.flatnonzero(col)
        if len(covered):
            edge[i]=levels[covered[-1],i]
    a=np.abs(angles)
    rim=np.interp(a,[0,.84,1.19,1.38,1.64,1.86,2.2,np.pi],
                  [.06,.040,.016,-.014,.009,.005,-.039,-.076] if female else
                  [.063,.050,.024,-.012,.016,.012,-.021,-.047])
    camera_facing=np.sin(angles)*camera.rotation[2,0]+np.cos(angles)*camera.rotation[2,2]
    influence=np.clip((camera_facing-.27)/.43,0,1)
    # A sideburn tapers ahead of the pinna; the earlobe remains exposed.
    edge=np.maximum(edge,-.036 if female else -.023)
    edge=gaussian_filter1d(influence*edge+(1-influence)*rim,1.5,mode='wrap')

    def cap(u,v):
        phi=(u-.5)*2*np.pi
        height=top-(top-np.interp(phi,angles,edge))*v**1.48
        return section(phi,np.clip(height,rows[0,0],top))

    # Match the outline in the same tilted camera as the close photograph.
    # A smooth displacement in its image plane preserves the volume seen in profile.
    u,v=np.meshgrid(np.linspace(0,1,361),np.linspace(0,1,151))
    coarse=cap(u,v)
    projected=camera.project(coarse).reshape(-1,2)
    all_rows=np.arange(len(mask))
    photo_top=np.flatnonzero(mask.any(axis=1))[0]
    model_top=projected[:,1].min()
    brow=636 if female else 115
    def shift_row(y):
        return y+(photo_top-model_top)*np.clip((brow-y)/(brow-model_top),0,1)
    def bounds(x,y):
        low=np.full(len(mask),np.inf)
        high=np.full(len(mask),-np.inf)
        line=np.clip(np.rint(y).astype(int),0,len(mask)-1)
        np.minimum.at(low,line,x)
        np.maximum.at(high,line,x)
        found=np.flatnonzero(np.isfinite(low))
        return [gaussian_filter1d(np.interp(all_rows,found,a[found]),1.2) for a in (low,high)]
    lo,hi=bounds(projected[:,0],shift_row(projected[:,1]))
    my,mx=np.nonzero(mask)
    pl,pr=bounds(mx,my)
    # Rasterize the fitted skin in the portrait camera. Seat the roots against
    # the forehead and pinna instead of suspending the outer shell above them.
    skin_camera=skin@camera.rotation.T
    pixel=camera.project(skin)
    skin_depth=np.full(src.shape[:2],-.4,np.float32)
    for tri in np.asarray(triangles).reshape(-1,3):
        q=pixel[tri]
        lower=np.maximum(np.floor(q.min(0)).astype(int),0)
        upper=np.minimum(np.ceil(q.max(0)).astype(int),[src.shape[1]-1,src.shape[0]-1])
        basis=(q[1:]-q[0]).T
        if min(upper-lower)<0 or abs(np.linalg.det(basis))<1e-5:continue
        xs,ys=np.meshgrid(np.arange(lower[0],upper[0]+1),np.arange(lower[1],upper[1]+1))
        bary=(np.stack([xs,ys],-1)-q[0])@np.linalg.inv(basis).T
        valid=(bary.min(-1)>=0)&(bary.sum(-1)<=1)
        yy,xx=ys[valid],xs[valid]
        z=skin_camera[tri,2]
        skin_depth[yy,xx]=np.maximum(skin_depth[yy,xx],z[0]+bary[valid]@(z[1:]-z[0]))
    def hairstyle(u,v):
        xyz=cap(u,v)
        x,y=np.moveaxis(camera.project(xyz),-1,0)
        sy=shift_row(y)
        at=lambda a:np.interp(sy,all_rows,a)
        left,right=at(lo),at(hi)
        ratio=np.clip((x-left)/np.maximum(1,right-left),0,1)
        # Near either ear, the other side may already be below its sideburn.
        dl=np.clip(at(pl)-left,-18,18)
        dr=np.clip(at(pr)-right,-18,18)
        weight=np.clip((brow+30-sy)/38,0,1)
        dx=(dl*(1-ratio)+dr*ratio)*weight
        phi=(u-.5)*2*np.pi
        # Give the swept locks relief so the part catches light in profile.
        flow=phi+.49*(1-v)*np.sin(phi-.24)+.35*np.sin(np.pi*v)
        relief=(.0017*np.cos(14*flow)+.0009*np.cos(27*flow+.6))*np.sin(np.pi*v)**.8
        xyz[...,0]+=np.sin(phi)*relief
        xyz[...,2]+=np.cos(phi)*relief
        xyz+=(dx[...,None]*camera.rotation[0]-(sy-y)[...,None]*camera.rotation[1])/camera.scale
        pixels=camera.project(xyz)
        scalp=sample(skin_depth,pixels)
        facing=np.sin(phi)*camera.rotation[2,0]+np.cos(phi)*camera.rotation[2,2]
        root=np.clip((v-.48)/.45,0,1)**1.2*np.clip((facing+.28)/.67,0,1)
        depth=xyz@camera.rotation[2]
        offset=np.where(scalp>-.19,np.clip(scalp+.0009-depth,-.038,.015),0)
        return xyz+(root*offset)[...,None]*camera.rotation[2]

    def braid(u,v):
        phi=2*np.pi*u
        t=[0,.09,.25,.45,.68,.84,.96,1]
        y=np.interp(v,t,[-.052,-.075,-.100,-.139,-.173,-.203,-.226,-.234])
        z=np.interp(v,t,[-.104,-.120,-.138,-.151,-.157,-.166,-.178,-.187])
        r=np.interp(v,t,[.019,.016,.031,.034,.032,.026,.013,.001])
        r*=1+.10*np.cos(7*phi+3*v)+.045*np.sin(13*phi-5*v)
        xyz=np.stack([-.009-.020*v+r*np.sin(phi),y,z+r*.83*np.cos(phi)],axis=-1)
        photo=camera.project(xyz)
        mid=camera.project(np.stack([-.009-.020*v,y,z],axis=-1))
        reference_y=[751,771,794,816,839,865,903]
        left=np.interp(photo[...,1],reference_y,[196,185,171,158,154,153,151])
        right=np.interp(photo[...,1],reference_y,[217,215,212,210,205,192,174])
        side=(photo[...,0]-mid[...,0])/np.maximum(1,r*camera.scale)
        observed=(left+right)/2+side*(right-left)*.50
        shift=np.clip(observed-photo[...,0],-31,31)*np.clip((mid[...,1]-750)/32,0,1)
        return xyz+shift[...,None]*camera.rotation[0]/camera.scale

    def texels(u,v,pos,tail):
        phi=(u-.5)*2*np.pi
        # Directional strands converge toward the low tie or the tapered neckline.
        flow=phi+.40*np.sin(np.pi*v)+.15*np.sin(2*phi+v)-.22*v*np.sin(phi)
        if female and not tail:
            flow+=.85*(1-v)*np.sin(phi)
        rng=np.random.default_rng(147)
        strand=np.zeros_like(u)
        for freq in [29,47,71,127,213,291]:
            strand+=np.sin(freq*flow+rng.uniform(-3,3)+.4*np.sin(3*phi+v))*(2.1 if freq<100 else 1.2)
        sheen=4*np.cos(2*flow+2*v)+2.7*np.cos(9*flow+v)
        basic=np.array([40,34,30] if female else [38,32,28])
        rgb=basic+(strand+sheen)[...,None]
        if tail:
            # Wrap the photographed bundle around the ponytail. All angles
            # keep the same root-to-tip flow and the clumps rotate at the tie.
            path_y=772+80*v
            axis=np.interp(path_y,[772,796,825,852],[199,186,175,162])
            path_x=axis+8*np.sin(phi+.72*v)+1.3*np.sin(3*phi-2*v)
            gathered=sample(src,np.stack([path_x,path_y],axis=-1)).astype(float)
            rgb=rgb*.40+np.clip(gathered,14,70)*.60
            xy=camera.project(pos)
            # The close view records the gathering below the ear and the loose
            # upper tail. The source stops at the shoulder.
            pix=sample(src,xy).astype(float)
            valid=np.clip((86-pix.max(axis=-1))/23,0,1)*np.clip((884-xy[...,1])/18,0,1)
            valid*=np.clip((np.cos(phi)+.35)/.9,0,1)
            rgb=rgb*(1-valid[...,None])+pix*valid[...,None]
            rgb+=3.5*np.cos(37*flow+1.6*np.sin(v*4))[...,None]
        else:
            xy=camera.project(pos)
            face=np.sin(phi)*camera.rotation[2,0]+np.cos(phi)*camera.rotation[2,2]
            front=np.clip((face-.06)/.64,0,1)*np.clip(sample(mask.astype(np.float32),xy)*1.1,0,1)
            photo=sample(clean,xy).astype(float)
            rgb=rgb*(1-front[...,None])+(photo*1.03+1)*front[...,None]
        # Vary the tips along individual bundles to break up the edge,
        # especially around the ear, nape and ends of the tied hair.
        tips=.009*(np.sin(47*phi+2*np.sin(6*phi))+1)+.007*(np.sin(117*phi+.9)+1)
        tips+=.005*(np.sin(257*phi+3*v)+1)
        opacity=np.clip((1-v-tips)*130+.6,0,1)
        if not tail:
            edge_distance=sample(hair_distance,xy)
            # The observed hairline has small skin gaps even inside its silhouette.
            coverage=np.clip((edge_distance+1.8)/3.6,0,1)
            strength=np.clip((face+.06)/.53,0,1)*np.clip((v-.50)/.24,0,1)
            opacity*=1-strength*(1-coverage)
            # Let the photographed fine hair on the skin show between locks
            # at the temple and along the forehead. Cull even the far rim if
            # its projection would cover the visible pinna in the close view.
            scalp=sample(skin_depth,xy)
            toward=camera.rotation[2]
            near_skin=(scalp>-.19)&(np.abs(pos@toward-scalp)<.042)
            strength=np.clip((v-.65)/.25,0,1)*near_skin
            opacity*=1-strength*(1-coverage)
            roots=np.clip((v-.77)/.23,0,1)
            spacing=.5+.5*np.cos(179*flow+3*np.sin(23*flow))
            opacity*=1-roots*spacing*near_skin*.53
        return np.uint8(np.dstack([np.clip(rgb,0,255),opacity*255]))

    width,height=1024,448
    atlas=np.zeros((height,width,4),np.uint8)
    islands=[(2,782 if female else width-3,hairstyle,113,56)]
    if female:
        islands.append((786,width-3,braid,49,30))
    vertices,uvs,indices=[],[],[]
    sway=None
    for start,end,model,ring,levels in islands:
        u,v=np.meshgrid(np.linspace(0,1,end-start+1),np.linspace(0,1,height))
        atlas[:,start:end+1]=texels(u,v,model(u,v),model is braid)
        atlas[:,start-2:start]=atlas[:,start:start+1]
        atlas[:,end+1:end+3]=atlas[:,end:end+1]
        u,v=np.meshgrid(np.linspace(0,1,ring),np.linspace(0,1,levels))
        coords=model(u,v)
        base=len(vertices)
        vertices.extend(coords.reshape(-1,3))
        if model is braid:
            # Only the free length below the tie participates in the walk cycle.
            ids=base+np.arange(v.size,dtype=np.uint16)
            weight=np.clip((v.ravel()-.11)/.89,0,1)**1.65
            sway=(ids,np.column_stack([.034*weight,.002*weight,-.008*weight]))
        uvs.extend(np.stack([(start+.5+(end-start)*u)/width,(.5+(height-1)*v)/height],axis=-1).reshape(-1,2))
        for j in range(levels-1):
            for i in range(ring-1):
                k=base+j*ring+i
                indices.extend([k,k+ring,k+1,k+1,k+ring,k+ring+1])
        for i in range(1,ring-2):
            indices.extend([base,base+i,base+i+1])
        if model is braid:
            bottom=base+(levels-1)*ring
            for i in range(1,ring-2):
                indices.extend([bottom,bottom+i+1,bottom+i])
    # Follow the loose locks visible in the casting photo. Each ribbon has
    # a real root depth sampled from the fitted scalp at that image position.
    u,v=np.meshgrid(np.linspace(.18,.80,230),np.linspace(.1,1,100))
    scalp=hairstyle(u,v).reshape(-1,3)
    projected=camera.project(scalp)
    nearest=cKDTree(projected)
    locks=([
        [(175,587),(147,631),(138,676),(144,708),(152,729)],
        [(154,639),(138,672),(144,709),(151,737),(166,755)],
        [(163,657),(151,686),(151,720),(163,754),(182,774)],
        [(180,663),(163,688),(166,716),(177,741),(193,750)],
        [(355,610),(374,639),(376,665),(372,691),(376,710)],
        [(364,635),(379,658),(377,682),(379,714),(370,740)],
    ] if female else [
        [(170,63),(152,86),(149,111),(155,131),(164,146)],
        [(182,65),(164,95),(163,120),(166,137),(172,153)],
        [(322,48),(348,73),(355,98),(351,117),(348,137)],
    ])
    rng=np.random.default_rng(419)
    for path in locks:
        for strand in range(3):
            stations=np.array(path,float)+rng.normal(0,1.6,(len(path),2))
            t=np.linspace(0,1,17)
            px=PchipInterpolator(np.linspace(0,1,len(path)),stations)(t)
            _,ids=nearest.query(px,k=4)
            depth=gaussian_filter1d(np.mean(scalp[ids]@camera.rotation[2],axis=1),2)
            center=(px-camera.center)/[camera.scale,-camera.scale]
            xyz=np.column_stack([center,depth+.0017])@camera.rotation
            tangent=np.gradient(px,axis=0)
            normal=np.stack([-tangent[:,1],tangent[:,0]],axis=1)
            normal/=np.maximum(1e-9,np.linalg.norm(normal,axis=1,keepdims=True))
            wide=(.00018+.00022*rng.random())*(1-t**2)
            arm=(normal[:,0,None]*camera.rotation[0]-normal[:,1,None]*camera.rotation[1])*wide[:,None]
            base=len(vertices)
            vertices.extend(np.stack([xyz-arm,xyz+arm],axis=1).reshape(-1,3))
            uvs.extend(np.column_stack([np.full(34,.18+strand*.006),np.repeat(.38+t*.27,2)]))
            for k in range(base,base+32,2):
                indices.extend([k,k+2,k+1,k+1,k+2,k+3])
    vertices=np.array(vertices)
    tri=np.array(indices).reshape(-1,3)
    n=np.cross(vertices[tri[:,1]]-vertices[tri[:,0]],vertices[tri[:,2]]-vertices[tri[:,0]])
    normals=np.zeros_like(vertices)
    for column in tri.T:
        np.add.at(normals,column,n)
    normals/=np.maximum(1e-12,np.linalg.norm(normals,axis=1,keepdims=True))
    return vertices,normals,np.array(uvs),np.array(indices),Image.fromarray(atlas),sway
