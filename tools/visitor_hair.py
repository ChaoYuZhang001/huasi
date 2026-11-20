"""Construct the two hairstyles in head-local metres and bake their hairlines."""
import cv2
import numpy as np
from PIL import Image
from scipy.interpolate import PchipInterpolator
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


def bake_hair(sex, likeness):
    src, camera = likeness.reference, likeness.camera
    female = sex == 'female'
    mask = hair_mask(src, (112,486,395,747) if female else (134,0,371,181),
                     [(314,637),(350,625),(357,638),(328,648),(311,649)] if female else None)
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
        return xyz+(dx[...,None]*camera.rotation[0]-(sy-y)[...,None]*camera.rotation[1])/camera.scale

    def braid(u,v):
        phi=2*np.pi*u
        t=[0,.09,.25,.45,.68,.84,.96,1]
        y=np.interp(v,t,[-.052,-.075,-.100,-.139,-.173,-.203,-.226,-.234])
        z=np.interp(v,t,[-.104,-.120,-.138,-.151,-.157,-.166,-.178,-.187])
        r=np.interp(v,t,[.019,.016,.031,.034,.032,.026,.013,.001])
        return np.stack([-.008-.014*v+r*np.sin(phi),y,z+r*.83*np.cos(phi)],axis=-1)

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
            rgb=rgb*(.9+.10*np.cos(phi))[...,None]
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
        return np.uint8(np.dstack([np.clip(rgb,0,255),opacity*255]))

    width,height=768,384
    atlas=np.zeros((height,width,4),np.uint8)
    islands=[(2,600 if female else width-3,hairstyle,113,56)]
    if female:
        islands.append((604,width-3,braid,49,30))
    vertices,uvs,indices=[],[],[]
    for start,end,model,ring,levels in islands:
        u,v=np.meshgrid(np.linspace(0,1,end-start+1),np.linspace(0,1,height))
        atlas[:,start:end+1]=texels(u,v,model(u,v),model is braid)
        atlas[:,start-2:start]=atlas[:,start:start+1]
        atlas[:,end+1:end+3]=atlas[:,end:end+1]
        u,v=np.meshgrid(np.linspace(0,1,ring),np.linspace(0,1,levels))
        coords=model(u,v)
        base=len(vertices)
        vertices.extend(coords.reshape(-1,3))
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
    # Tapered sections of hair lift from the temple and sweep over the ear.
    # They share the cap material and remain attached through the turn to profile.
    start,end=islands[0][:2]
    for sign in (-1,1):
        for lock in range(13):
            t=np.linspace(0,1,21)
            angle=sign*(.79+.087*lock+(.22 if female else .11)*t+
                        .035*np.sin(t*np.pi*1.8+lock*.62))
            v=.57+t*.42
            thickness=(.013+.008*np.sin(lock*.4)**2)*(1-.93*t**2)
            phi=np.stack([angle-thickness,angle+thickness],axis=1)
            u=.5+phi/(2*np.pi)
            levels=np.broadcast_to(v[:,None],u.shape)
            patch=hairstyle(u,levels)
            length=(.011 if female else .006)*(1+.65*np.sin(lock*1.79))
            lift=.0011+.0015*np.sin(t*np.pi)
            patch[:,:,0]+=np.sin(phi)*lift[:,None]
            patch[:,:,2]+=np.cos(phi)*lift[:,None]
            patch[:,:,1]-=length*t[:,None]**3
            base=len(vertices)
            vertices.extend(patch.reshape(-1,3))
            uvs.extend(np.stack([(start+.5+(end-start)*u)/width,
                                 (.5+(height-1)*np.minimum(levels,.92))/height],axis=-1).reshape(-1,2))
            for j in range(len(t)-1):
                k=base+2*j
                indices.extend([k,k+2,k+1,k+1,k+2,k+3])
    vertices=np.array(vertices)
    tri=np.array(indices).reshape(-1,3)
    n=np.cross(vertices[tri[:,1]]-vertices[tri[:,0]],vertices[tri[:,2]]-vertices[tri[:,0]])
    normals=np.zeros_like(vertices)
    for column in tri.T:
        np.add.at(normals,column,n)
    normals/=np.maximum(1e-12,np.linalg.norm(normals,axis=1,keepdims=True))
    return vertices,normals,np.array(uvs),np.array(indices),Image.fromarray(atlas)
