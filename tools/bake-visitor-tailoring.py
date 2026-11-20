"""Unwrap the clothing panels from the project's six-view casting sheet."""
from pathlib import Path
import sys
import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt

DEST = Path(__file__).resolve().parents[1] / 'characters'


def panel(source, rows, height, width, vertical, back, facing, sweep=None):
    # Each station records the visible left seam, centre fastening and right seam.
    # Their different heights preserve the camera perspective in the close view.
    rows = np.asarray(rows, float)
    level, column = np.meshgrid(vertical, np.linspace(-np.pi,np.pi,width), indexing='ij')
    s = np.sin(column)
    middle_x, middle_y = (np.interp(level,rows[:,0],rows[:,k]) for k in (3,4))
    left = s<0
    outer_x,outer_y = (np.where(left,np.interp(level,rows[:,0],rows[:,l]),
                                    np.interp(level,rows[:,0],rows[:,r])) for l,r in ((1,5),(2,6)))
    x=middle_x+(outer_x-middle_x)*abs(s)
    y=middle_y+(outer_y-middle_y)*abs(s)**1.65
    photo=cv2.remap(source,x.astype('f'),y.astype('f'),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
    if sweep is not None:
        photo=sweep(photo,x,y)
    blend=np.clip((np.cos(column)+.12)/.64,0,1)*facing
    return back*(1-blend[...,None])+photo*blend[...,None]


def cloth(source,bounds,height,width,tone):
    x,y,w,h=bounds
    swatch=source[y:y+h,x:x+w].astype(float)
    grey=cv2.cvtColor(swatch.astype('uint8'),cv2.COLOR_RGB2GRAY).astype(float)
    grain=np.clip(grey-cv2.GaussianBlur(grey,(0,0),2.0),-4,4)
    mirrored=np.hstack([grain,grain[:,::-1]])
    tile=np.vstack([mirrored,mirrored[::-1]])
    yy,xx=np.indices((height,width))
    return np.asarray(tone)+tile[yy%tile.shape[0],xx%tile.shape[1],None]


def isolated(source,polygon,female):
    # Pad the photographed edge with the nearest valid cloth colour. This
    # keeps skin, the studio wall and the floor out of the cylindrical seam.
    vertices=np.int32(polygon)
    x,y,w,h=cv2.boundingRect(vertices)
    crop=source[y:y+h,x:x+w].copy()
    mask=np.zeros((h,w),np.uint8)
    cv2.fillPoly(mask,[vertices-[x,y]],1)
    red,green,blue=np.moveaxis(crop.astype(float),-1,0)
    if female:
        strap=(red>blue+12)&(red>green+8)&(mask>0)
        crop=cv2.inpaint(crop,np.uint8(strap)*255,5,cv2.INPAINT_TELEA)
        valid=(mask>0)&((blue>=red-5)|strap)
    else:
        valid=(mask>0)&(red-blue<13)&(crop.max(axis=2)<118)
    iy,ix=distance_transform_edt(~valid,return_distances=False,return_indices=True)
    return cv2.copyMakeBorder(crop[iy,ix],y,source.shape[0]-y-h,x,source.shape[1]-x-w,cv2.BORDER_REPLICATE)


def bake(source,female):
    atlas=np.full((1024,1024,3),255,np.uint8)
    patch=(117,379,58,48) if not female else (114,923,64,57)
    tone=(48,49,54) if not female else (151,155,169)
    # Torso local y relative to the waist pivot.
    low=.208 if female else -.11
    y=np.linspace(.554,low,570)
    back=cloth(source,patch,570,1024,tone)
    standing=[
        [-.11,704,244,736,245,788,246],[0,704,220,737,222,789,222],
        [.15,711,180,740,179,789,182],[.31,711,143,745,144,792,145],
        [.42,714,117,748,118,795,119],[.50,710,97,752,98,791,96],
        [.554,734,83,750,86,776,82]
    ] if not female else [
        [.208,729,668,759,674,799,671],[.285,730,650,757,649,796,651],
        [.38,728,621,753,627,797,623],[.46,727,598,752,601,797,601],
        [.50,717,582,753,588,782,583],[.554,740,569,756,579,774,573]
    ]
    shirt_polygon=([(734,86),(749,88),(776,84),(791,99),(795,135),(786,188),(782,239),
                    (711,240),(712,191),(714,153),(712,107)] if not female else
                   [(735,577),(754,582),(773,579),(796,599),(789,644),(789,670),(730,667),(730,629)])
    shirt=isolated(source,shirt_polygon,female)
    # Back yoke, waist tension and hanging folds share the reference cloth grain.
    theta,level=np.meshgrid(np.linspace(-np.pi,np.pi,1024),y)
    seam=.438+.009*np.cos(theta)
    folds=(1.9*np.cos(13*theta+1.1*np.sin(10*level))+1.3*np.cos(24*theta-9*level))
    folds*=np.clip((.46-level)*2.6,0,1)
    yoke=-4*np.exp(-((level-seam)/.0032)**2)+2*np.exp(-((level-seam-.004)/.004)**2)
    back+=((folds+yoke*(not female))*np.clip(-np.cos(theta)+.25,0,1))[...,None]
    front=panel(shirt,standing,570,1024,y,back,1)
    close=[
        [.30,118,520,338,560,476,510],[.38,106,454,325,482,474,448],
        [.425,101,413,316,442,472,408],[.478,85,367,308,402,474,366],
        [.506,75,345,306,376,459,336],[.535,153,301,302,351,379,301],
        [.554,199,273,298,324,344,279]
    ] if not female else [
        [.30,155,1122,265,1175,458,1130],[.40,140,1015,289,1062,466,1019],
        [.465,124,951,294,990,459,942],[.50,111,913,303,949,437,909],
        [.53,168,876,306,918,384,883],[.554,202,842,307,892,341,850]
    ]
    # At close range only pixels above the lower border of the portrait exist.
    def join(img,x,py):
        limit=1021 if female else 482
        amount=np.clip((limit-py)/22,0,1)[...,None]
        return img*amount+front*(1-amount)
    close_polygon=([(12,482),(40,366),(72,345),(179,294),(206,267),(221,285),
                    (295,321),(333,268),(350,295),(478,344),(508,480)] if not female else
                   [(53,1023),(83,914),(184,862),(201,835),(297,895),(335,850),
                    (373,878),(451,902),(474,943),(485,1023)])
    jacket=isolated(source,close_polygon,female)
    atlas[:570]=np.clip(panel(jacket,close,570,1024,y,back,1,join),0,255)
    # Trace the actual unfolded collar, from the far rear around both leaves.
    if female:
        ang=[-1.57,-1.22,-.80,-.39,-.06,.06,.40,.88,1.57]
        upper=[(201,811),(210,824),(246,843),(279,861),(298,885),(307,887),(319,855),(330,839),(328,823)]
        lower=[(184,856),(199,869),(242,888),(275,894),(300,899),(308,899),(327,883),(338,868),(337,852)]
    else:
        ang=[-1.57,-1.22,-.8,-.38,-.065,.065,.38,.8,1.22,1.57]
        upper=[(208,254),(218,268),(246,285),(272,299),(294,310),(300,309),(312,297),(322,285),(331,270),(330,255)]
        lower=[(188,295),(208,315),(242,341),(274,356),(289,351),(302,326),(320,349),(332,338),(343,308),(346,291)]
    u,v=np.meshgrid(np.linspace(-np.pi,np.pi,1024),np.linspace(0,1,128))
    coords=[]
    for i in (0,1):
        t=np.interp(u,ang,np.array(upper)[:,i])
        b=np.interp(u,ang,np.array(lower)[:,i])
        coords.append((t+(b-t)*v).astype('f'))
    collar_source=isolated(source,[*upper,*reversed(lower)],female)
    collar=cv2.remap(collar_source,*coords,cv2.INTER_LINEAR)
    front_weight=np.clip((2.0-abs(u))/.55,0,1)[...,None]
    backing=cloth(source,patch,128,1024,tone)
    backing*=1-.14*v[...,None]
    collar=collar*front_weight+backing*(1-front_weight)
    if female:
        # The dark binding follows the sewn rim all the way around. Preserve
        # the blue cloth grain without projecting her neck into the far leaf.
        grain=cloth(source,patch,128,1024,(157,160,172))
        grain+=(3*np.cos(u+.2)-4*v)[...,None]
        binding=np.clip(np.maximum((.104-v)/.022,(v-.955)/.025),0,1)[...,None]
        collar=grain*(1-binding)+(grain*.23+np.array([5,6,12]))*binding
    atlas[578:706]=np.clip(collar,0,255)
    # Sleeve seam-to-seam, from the rounded shoulder down to its cuff.
    sy=np.linspace(0,1,306)
    sleeve=[
        [0,706,95,711,93,718,94],[.22,696,120,706,121,715,122],
        [.52,692,158,701,162,710,158],[.77,688,199,698,201,705,198],
        [1,687,232,696,233,704,233]
    ] if not female else [
        [0,715,585,720,584,726,586],[.33,705,613,714,612,723,614],
        [.75,699,654,708,652,717,653],[1,698,680,707,683,719,682]
    ]
    sleeve_base=cloth(source,patch,306,504,tone)
    sleeve_polygon=([(690,232),(694,193),(699,154),(705,117),(711,99),(719,94),(722,107),
                      (715,151),(710,190),(705,232)] if not female else
                    [(702,679),(705,643),(712,604),(719,585),(729,591),(727,625),(722,680)])
    sleeve_photo=isolated(source,sleeve_polygon,female)
    sleeve_colour=panel(sleeve_photo,sleeve,306,504,sy,sleeve_base,1)
    # The small full-length views have enough resolution for arm folds. Use
    # the portrait sleeve for the shoulder cap and the physical weave.
    shoulder_poly=([(15,480),(41,376),(65,355),(84,350),(95,403),(89,480)] if not female else
                   [(60,1022),(83,932),(107,912),(131,902),(144,940),(145,1022)])
    shoulder=isolated(source,shoulder_poly,female)
    stations=([[0,49,378,72,362,84,355],[.24,31,428,64,408,89,399],
               [.48,17,478,51,476,86,467]] if not female else
              [[0,87,936,113,917,130,910],[.24,75,973,111,958,140,946],
               [.48,62,1021,104,1017,142,1003]])
    cap_colour=panel(shoulder,stations,306,504,sy,sleeve_base,.85)
    amount=np.clip((.49-sy)/.22,0,1)[:,None,None]
    atlas[714:1020,:504]=np.clip(sleeve_colour*(1-amount)+cap_colour*amount,0,255)
    # The lower garment has its own longitudinal creases. Keep their direction
    # stable as the skirt deforms and the trouser knee bends.
    u,v=np.meshgrid(np.linspace(-np.pi,np.pi,504),np.linspace(0,1,306))
    if female:
        # Sample the unobstructed lower panel; continue its pleats up to the waistband.
        skirt=isolated(source,[(720,797),(776,798),(804,785),(815,797),
                              (822,874),(811,884),(761,887),(706,880)],False)
        x=762+np.sin(u)*48
        y=800+77*v
        lower=cv2.remap(skirt,x.astype('f'),y.astype('f'),cv2.INTER_LINEAR)
        reverse=cv2.remap(skirt,(761+np.sin(u+.42)*47).astype('f'),y.astype('f'),cv2.INTER_LINEAR)
    else:
        # A single trouser pattern can be mirrored across the two trouser legs.
        levels=[0,.28,.58,.81,1]
        xmid=np.interp(v,levels,[732,733,736,741,745])
        spread=np.interp(v,levels,[18,18,17,16,14])
        x=xmid+spread*np.sin(u)
        y=248+187*v
        trouser=isolated(source,[(713,248),(750,248),(758,320),(759,368),(766,430),
                                 (732,433),(726,395),(721,359),(717,312)],False)
        lower=cv2.remap(trouser,x.astype('f'),y.astype('f'),cv2.INTER_LINEAR)
        reverse=cloth(source,patch,306,504,(47,46,48))
    blend=np.clip((np.cos(u)+.5)/.9,0,1)[...,None]
    atlas[714:1020,510:1014]=np.clip(blend*lower+(1-blend)*reverse,0,255)
    if female:
        # The walking profile gives the panel, flap and brass tongue. Extend
        # only the thin strip of leather hidden by her fingers on the left.
        atlas[578:706,:800]=cv2.resize(atlas[578:706],(800,128),interpolation=cv2.INTER_AREA)
        u,v=np.meshgrid(np.linspace(0,1,208),np.linspace(0,1,128))
        x=(1251-9*v)+(49-2*v)*u
        y=719+48*v-1.3*u
        visible=np.interp(v,[0,.35,.65,1],[1265,1262,1260,1259])
        x=np.where(x<visible,visible+(visible-x)*.28,x)
        leather=cv2.remap(source,x.astype('f'),y.astype('f'),cv2.INTER_CUBIC)
        atlas[578:706,808:1016]=leather
    collar_islands=[(578,706,0,800),(578,706,808,1016)] if female else [(578,706,0,1024)]
    # Extend each island into its gutter to avoid dark lines in mipmaps.
    for a,b,l,r in [(0,570,0,1024),*collar_islands,(714,1020,0,504),(714,1020,510,1014)]:
        if a:atlas[a-2:a,l:r]=atlas[a:a+1,l:r]
        atlas[b:b+2,l:r]=atlas[b-1:b,l:r]
        if l:atlas[a:b,l-2:l]=atlas[a:b,l:l+1]
        if r<1024:atlas[a:b,r:r+2]=atlas[a:b,r-1:r]
    Image.fromarray(atlas).save(DEST/('visitor-'+('blouse' if female else 'jacket')+'.webp'),quality=94,method=6)


if __name__=='__main__':
    sheet=np.array(Image.open(sys.argv[1]).convert('RGB'))
    if sheet.shape[:2]!=(1024,1536):
        raise ValueError('Expected the 1536 by 1024 casting sheet')
    for female in (False,True):
        bake(sheet,female)
