"""Bake fitted MakeHuman heads. Usage: python bake-visitor-heads.py SOURCE_DIR CASTING_SHEET"""
import io
import json
from pathlib import Path
import struct
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def obj(path):
    points, texels, faces, group = [], [], [], None
    for line in path.read_text().splitlines():
        fields = line.split()
        if not fields:
            continue
        if fields[0] == "v":
            points.append(list(map(float, fields[1:4])))
        elif fields[0] == "vt":
            texels.append(list(map(float, fields[1:3])))
        elif fields[0] == "g":
            group = fields[1]
        elif fields[0] == "f":
            polygon = [tuple(int(val)-1 for val in token.split("/")[:2]) for token in fields[1:]]
            faces.extend((group, [polygon[0], polygon[index], polygon[index+1]]) for index in range(1, len(polygon)-1))
    return np.array(points), np.array(texels), faces


def fit(path, points, body):
    mapping = [line for line in path.read_text().split("verts 0\n", 1)[1].splitlines() if line.strip() and line.split()[0].isdigit()]
    result = points.copy()
    for index, line in enumerate(mapping[:len(points)]):
        values = line.split()
        if len(values) == 1:
            result[index] = body[int(values[0])]
        else:
            result[index] = np.array(values[3:6], float) @ body[np.array(values[:3], int)] + np.array(values[6:9], float)
    return result


def build(source, sex, dest, reference):
    base, base_uv, base_faces = obj(source / "base.obj")
    delta = np.zeros_like(base)
    target = np.loadtxt(source / (sex+".target"))
    delta[target[:, 0].astype(int)] = target[:, 1:4]
    blink = np.zeros_like(base)
    for name, strength in [("mouth-corner-puller", .45 if sex == "female" else .38), ("l-eye-height2-incr", .22), ("r-eye-height2-incr", .22), ("eye-left-closure", 1), ("eye-right-closure", 1)]:
        target = np.loadtxt(source / (name+".target"))
        offsets = blink if "closure" in name else delta
        offsets[target[:, 0].astype(int)] += strength*target[:, 1:4]
    origin = np.array([0., 7.30, .60])
    eye_ids = sorted({vertex for group, face in base_faces if group in ("joint-l-eye", "joint-r-eye") for vertex, _ in face})
    origin += delta[eye_ids].mean(axis=0)
    data = bytearray()
    doc = dict(asset=dict(version="2.0", generator="Sansi visitor portrait baker"), scene=0, scenes=[dict(nodes=[])], nodes=[], meshes=[], materials=[], textures=[], images=[], buffers=[], bufferViews=[], accessors=[])

    def buffer(blob):
        while len(data) % 4:
            data.append(0)
        doc["bufferViews"].append(dict(buffer=0, byteOffset=len(data), byteLength=len(blob)))
        data.extend(blob)
        return len(doc["bufferViews"])-1

    def accessor(values, index=False):
        values = np.asarray(values, dtype="<u2" if index else "<f4")
        record = dict(bufferView=buffer(values.tobytes()), componentType=5123 if index else 5126, count=len(values), type="SCALAR" if index else "VEC"+str(values.shape[1]))
        record.update(min=np.atleast_1d(values.min(axis=0)).tolist(), max=np.atleast_1d(values.max(axis=0)).tolist())
        doc["accessors"].append(record)
        return len(doc["accessors"])-1

    hair, brow = ("short01" if sex == "male" else "ponytail01"), "eyebrow009"
    for name in ("skin", "eyes", hair, brow, "eyelashes01"):
        morph = None
        if name == "skin":
            points, texels = base + delta, base_uv
            morph = blink
            faces = [face for group, face in base_faces if group == "body" and all(base[vertex, 1] > 5.88 for vertex, _ in face)]
        else:
            proxy = "hi-eyes" if name == "eyes" else name
            points, texels, polygons = obj(source / (proxy+".obj"))
            points = fit(source / (proxy+".mhclo"), points, base+delta)
            if name == "eyelashes01":
                morph = fit(source / (proxy+".mhclo"), points, base+delta+blink)-points
            if name == brow:
                points[:, 1] += .053
                points[:, 2] += .042
                if sex == "female":
                    points[:, 1] = points[:, 1].mean()+.72*(points[:, 1]-points[:, 1].mean())+.022*np.sin(np.abs(points[:, 0])*6)
            faces = [face for _, face in polygons]
        points = (points-origin)*[.111, .108, .111]
        if name == "skin":
            neck = np.clip((-.105-points[:, 1])/.037, 0, 1)
            points[:, 0] *= 1-.32*neck
            points[:, 2] *= 1-.29*neck
            corner = np.exp(-((np.abs(points[:, 0])-.026)/.013)**2-((points[:, 1]+.064)/.014)**2)*np.clip((points[:, 2]-.05)/.03, 0, 1)
            points[:, 1] += .0025*corner
        x, y, z = points.T.copy()
        if name == "skin":
            # Broader cheekbones above a narrower jaw. Fade before the neck.
            jaw = np.exp(-((y+.078)/.031)**2)
            points[:, 0] *= 1+(.012 if sex == "male" else -.042)*jaw
            cheek = np.exp(-((np.abs(x)-.053)/.028)**2-((y+.035)/.026)**2)
            points[:, 2] += (.0027 if sex == "male" else .0036)*cheek
        elif name == hair:
            if sex == "male":
                crown = np.clip((y-.020)/.070,0,1)
                part = np.exp(-((x-.037)/.011)**2)*np.clip((z+.035)/.08,0,1)
                points[:, 0] -= .013*crown*(1-part)
                points[:, 1] += crown*(.012-.020*part)
                fringe = np.exp(-((x+.033)/.044)**2)*np.clip((z-.033)/.053,0,1)
                points[:, 1] -= .023*fringe
                points[:, 2] += .007*fringe
            else:
                # Draw the hanging length back from the collar and ease the tie low.
                tail = np.clip((-y-.01)/.12,0,1)*np.clip((-z-.035)/.052,0,1)
                points[:, 1] -= .019*tail
                points[:, 2] -= .035*tail
                points[:, 0] += .012*tail**2
        if name == hair:
            hair_points = points.copy()
        normals = np.zeros_like(points)
        lookup, vertices, corners = {}, [], []
        for face in faces:
            ids = [vertex for vertex, _ in face]
            normal = np.cross(points[ids[1]]-points[ids[0]], points[ids[2]]-points[ids[0]])
            normals[ids] += normal
            for key in face:
                if key not in lookup:
                    lookup[key] = len(vertices)
                    vertices.append(key)
                corners.append(lookup[key])
        normals /= np.maximum(1e-12, np.linalg.norm(normals, axis=1, keepdims=True))
        vertex_ids, uv_ids = np.array(vertices).T
        uv = texels[uv_ids].copy()
        uv[:, 1] = 1-uv[:, 1]
        image = Image.open(source / ((sex if name == "skin" else name)+".png"))
        if name == "skin":
            pixels = uv*np.array(image.size)
            mask = Image.new("L", image.size)
            draw = ImageDraw.Draw(mask)
            for polygon in pixels[np.array(corners).reshape(-1, 3)]:
                draw.polygon(list(map(tuple, polygon)), fill=255)
            mask = mask.filter(ImageFilter.MaxFilter(9))
            bounds = mask.getbbox()
            image = Image.composite(image, Image.new(image.mode, image.size, (174, 129, 102)), mask).crop(bounds)
            uv = (pixels-np.array(bounds[:2]))/np.array(image.size)
        image.thumbnail((1024, 1024) if name in ("skin", hair) else (384, 384), Image.Resampling.LANCZOS)
        if name == "skin":
            from visitor_likeness import paint
            image = paint(image, uv, corners, points[vertex_ids], reference, sex)
        if name == hair:
            light = np.asarray(image.convert("L"), dtype=float)
            toned = np.array(image.convert("RGBA"))
            for channel, gain in enumerate([.48, .40, .36]):
                toned[:, :, channel] = np.clip(11+gain*light, 0, 255)
            image = Image.fromarray(toned)
        stream = io.BytesIO()
        opaque = name == "skin"
        if opaque:
            image.convert("RGB").save(stream, format="JPEG", quality=90, optimize=True)
        else:
            image.convert("RGBA").quantize(colors=256).save(stream, format="PNG", optimize=True)
        slot = len(doc["meshes"])
        doc["images"].append(dict(bufferView=buffer(stream.getvalue()), mimeType="image/jpeg" if opaque else "image/png"))
        doc["textures"].append(dict(source=slot))
        tint = [.56,.53,.52,1] if name == hair else [1,1,1,1]
        material = dict(name=name, pbrMetallicRoughness=dict(baseColorTexture=dict(index=slot), baseColorFactor=tint, metallicFactor=0, roughnessFactor=.45 if name == "eyes" else .86))
        if name == "eyes" or name == hair:
            material.update(alphaMode="MASK", alphaCutoff=.28, doubleSided=name == hair)
        elif not opaque:
            material.update(alphaMode="BLEND", doubleSided=True)
        doc["materials"].append(material)
        attrs = dict(POSITION=accessor(points[vertex_ids]), NORMAL=accessor(normals[vertex_ids]), TEXCOORD_0=accessor(uv))
        if name == hair:
            px, py, pz = points[vertex_ids].T
            front = np.clip((pz+.040)/.1,0,1)
            height = np.clip((py-.018)/.080,0,1)
            division = .037 if sex == "male" else .022
            swept = px-division + .17*(py-.087) + (pz-.035)**2*1.8
            groove = np.exp(-(swept/.005)**2)
            locks = .5+.5*np.cos(410*swept + 11*py)
            light = .78 + front*height*(.16*locks - .46*groove)
            attrs["COLOR_0"] = accessor(np.repeat(light[:,None],3,axis=1))
        doc["meshes"].append(dict(primitives=[dict(attributes=attrs, indices=accessor(corners, True), material=slot)]))
        if morph is not None:
            doc["meshes"][-1]["primitives"][0]["targets"] = [dict(POSITION=accessor(morph[vertex_ids]*[.111, .108, .111]))]
            doc["meshes"][-1].update(weights=[0], extras=dict(targetNames=["blink"]))
        doc["nodes"].append(dict(name=name, mesh=slot))
        doc["scenes"][0]["nodes"].append(slot)
    # Lay shallow, tapered locks over the cap along the part. Use the convex
    # scalp surface to fit the strips individually to the baked hair volume.
    from scipy.spatial import ConvexHull
    scalp = hair_points[hair_points[:,1]>-.038]
    center = np.array([0,.028,-.013])
    planes = ConvexHull(scalp-center).equations
    def scalp_point(angle, drop):
        limit = 1.54-.38*np.cos(angle)+.065*np.sin(2*angle)
        theta = .12+drop*(limit-.12)
        turn = angle + (.52 if sex=="male" else .37)*(1-drop)**2
        direction = np.array([np.sin(theta)*np.sin(turn), np.cos(theta), np.sin(theta)*np.cos(turn)])
        direction[0] += (.34 if sex=="male" else .23)*(1-drop)**2
        direction /= np.linalg.norm(direction)
        dots = planes[:,:3] @ direction
        valid = dots>1e-6
        radius = np.min(-planes[valid,3]/dots[valid])
        inset = .0025 if sex == "male" else .0013
        return center+(radius-inset)*direction,direction
    strands, normals, shades, triangles = [],[],[],[]
    for k in range(82):
        angle=(k+.37*np.sin(k*5))*2*np.pi/82
        start=.055+.14*(.5+.5*np.sin(k*7))
        stop=.78+.17*(.5+.5*np.cos(k*4))
        for j in range(20):
            v=j/19
            width=(.007+.011*np.sin(v*np.pi))*(.3+.7*np.sin(np.pi*v)**.4)
            for side in [-1,0,1]:
                position,normal=scalp_point(angle+side*width,start+v*(stop-start))
                strands.append(position+normal*(.00065 if side==0 else 0))
                normals.append(normal)
                light=(.019 if side==0 else .012)*(.84+.24*np.sin(k*2.4))*(.85+.15*np.sin(v*np.pi))
                shades.append([light*1.14,light,light*.89])
            a=len(strands)-3
            if j:
                for c in [0,1]:
                    triangles.extend([a-3+c,a+c,a-2+c,a-2+c,a+c,a+1+c])
    material=len(doc["materials"])
    doc["materials"].append(dict(name="combed locks",doubleSided=True,pbrMetallicRoughness=dict(metallicFactor=0,roughnessFactor=.62)))
    doc["meshes"][2]["primitives"].append(dict(material=material,indices=accessor(triangles,True),
        attributes=dict(POSITION=accessor(strands),NORMAL=accessor(normals),COLOR_0=accessor(shades))))
    while len(data)%4:
        data.append(0)
    doc["buffers"].append(dict(byteLength=len(data)))
    header = json.dumps(doc, separators=(",", ":")).encode()
    header += b" "*(-len(header)%4)
    dest.write_bytes(struct.pack("<4sII", b"glTF", 2, 28+len(header)+len(data))+struct.pack("<I4s", len(header), b"JSON")+header+struct.pack("<I4s", len(data), b"BIN\0")+data)


if __name__ == "__main__":
    reference = Image.open(sys.argv[2])
    for sex in ("male", "female"):
        build(Path(sys.argv[1]), sex, Path(__file__).resolve().parents[1]/"characters"/("visitor-"+sex+".glb"), reference)
