"""Project the two approved left-column portraits into the head UVs.

Landmarks are measured on the 1536 x 1024 casting sheet and on an orthographic
head projection (1850 pixels/metre). Eyes, brows and hair keep their own meshes.
"""
import cv2
import numpy as np
from PIL import Image
from scipy.interpolate import LinearNDInterpolator


def paint(image, uv, faces, xyz, reference, sex):
    male = sex == "male"
    # Forehead, temples, brows, eyelids, nose, lips, cheeks, jaw and chin.
    model = [
        (280,130),(200,155),(360,155),(153,215),(407,215),
        (180,224),(214,216),(251,225),(309,225),(346,216),(378,224),
        (185,258),(215,255),(242,258),(318,258),(345,255),(375,258),
        (280,270),(280,315),(257,340),(280,348),(303,340),
        (235,392),(280,388),(325,392),(280,408),
        (168,322),(392,322),(175,377),(385,377),(204,421),(356,421),(280,457)
    ]
    if male:
        photo = [
            (258,79),(207,93),(310,71),(181,127),(336,104),
            (205,131),(224,123),(247,125),(282,119),(305,114),(323,115),
            (208,149),(228,145),(247,144),(286,138),(302,136),(316,136),
            (270,147),(272,170),(251,181),(271,186),(286,178),
            (241,214),(268,210),(298,204),(271,220),
            (201,173),(332,158),(212,207),(325,192),(228,236),(310,222),(278,253)]
    else:
        model[17:25] = [(280,307),(257,329),(280,338),(303,329),
                            (235,372),(280,369),(325,372),(280,389)]
        model[-3:] = [(204,401),(356,401),(280,437)]
        photo = [
            (277,591),(232,612),(326,587),(203,650),(352,625),
            (221,652),(242,645),(270,644),(313,638),(335,630),(351,633),
            (239,674),(255,671),(277,672),(319,664),(331,659),(350,656),
            (292,671),(304,694),(286,722),(302,719),(329,710),
            (272,748),(305,744),(341,735),(309,752),
            (215,701),(358,681),(230,748),(355,722),(254,775),(343,765),(310,798)]

    correspondence = LinearNDInterpolator(model, photo, fill_value=-1)
    height, width = image.height, image.width
    # UV seams may duplicate vertices. Rasterize each UV island separately.
    coord = np.full((height, width, 3), -1., np.float32)
    pixels = uv * [width, height] - .5
    for tri in np.asarray(faces).reshape(-1, 3):
        p = pixels[tri]
        lower = np.maximum(np.floor(p.min(axis=0)).astype(int), 0)
        upper = np.minimum(np.ceil(p.max(axis=0)).astype(int), [width-1,height-1])
        if np.any(lower > upper):
            continue
        basis = (p[1:] - p[0]).T
        if abs(np.linalg.det(basis)) < 1e-6:
            continue
        x,y = np.meshgrid(np.arange(lower[0],upper[0]+1),np.arange(lower[1],upper[1]+1))
        weights = (np.stack([x,y],-1)-p[0]) @ np.linalg.inv(basis).T
        inside = (weights.min(axis=-1)>=-1e-5) & (weights.sum(axis=-1)<=1.00001)
        coord[y[inside],x[inside]] = xyz[tri[0]] + weights[inside] @ (xyz[tri[1:]]-xyz[tri[0]])
    px = 280 + 1850*coord[:,:,0]
    py = 250 - 1850*coord[:,:,1]
    mapped = correspondence(px,py).astype('float32')
    src = np.asarray(reference.convert('RGB').resize((1536,1024)))
    sample = cv2.remap(src,mapped,None,cv2.INTER_LINEAR).astype(float)
    base = np.asarray(image.convert('RGB')).astype(float)
    # Keep highlights and skin detail while reducing the reference's side lighting.
    lighting = cv2.GaussianBlur(src,(0,0),14)
    ambient = cv2.remap(lighting,mapped,None,cv2.INTER_LINEAR)
    # Transfer albedo variation; do not bake the sitter's directional shadows
    # into the mesh, where the game lights the sculpted features a second time.
    detail = np.clip(sample-ambient,-16,16)
    sample = .42*base + .58*np.clip(ambient,[142,102,78],[221,182,158]) + .86*detail
    edge = np.clip(1-((px-280)/136)**2-((py-296)/180)**2,0,1)
    alpha = np.clip(edge*3,0,1)*np.clip((coord[:,:,2]-.044)/.035,0,1)
    inside = (mapped[:,:,0]>=0).astype(np.uint8)
    feather = cv2.distanceTransform(inside, cv2.DIST_L2, 3)
    alpha *= np.clip(feather/18,0,1)
    # Movable lids and actual eyebrows are already textured separately.
    for ex in [215,345]:
        eye = ((px-ex)/38)**2 + ((py-248)/29)**2
        alpha *= np.clip((eye-.74)*1.7,0,1)
    return Image.fromarray(np.clip(base+(sample-base)*alpha[:,:,None],0,255).astype('uint8'))
