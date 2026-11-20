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
    from visitor_likeness import Likeness
    likeness = Likeness(sex, reference)
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

    for name in ("skin", "eyes", "eyelashes01"):
        morph = None
        if name == "skin":
            points, texels = base + delta, base_uv
            morph = blink
            faces = [face for group, face in base_faces if group == "body" and all(base[vertex, 1] > 5.16 for vertex, _ in face)]
        else:
            proxy = "hi-eyes" if name == "eyes" else name
            points, texels, polygons = obj(source / (proxy+".obj"))
            points = fit(source / (proxy+".mhclo"), points, base+delta)
            if name == "eyelashes01":
                morph = fit(source / (proxy+".mhclo"), points, base+delta+blink)-points
            faces = [face for _, face in polygons]
        points = (points-origin)*[.111, .108, .111]
        if name == "skin":
            neck = np.clip((-.105-points[:, 1])/.037, 0, 1)
            points[:, 0] *= 1-.15*neck
            points[:, 2] = points[:, 2]*(1-.16*neck)+.023*neck
            # Continue the actual neck through the collar, including when the
            # head tilts. Tuck the clavicle portion underneath the shirt.
            below = np.clip((-.108-points[:,1])/.031,0,1)
            ellipse = np.hypot(points[:,0]/.048,points[:,2]/.042)
            factor = 1-below*(1-1/np.maximum(1,ellipse))
            points[:,[0,2]] *= factor[:,None]
            corner = np.exp(-((np.abs(points[:, 0])-.026)/.013)**2-((points[:, 1]+.064)/.014)**2)*np.clip((points[:, 2]-.05)/.03, 0, 1)
            points[:, 1] += .0025*corner
        x, y, z = points.T.copy()
        if name == "skin":
            # Broader cheekbones above a narrower jaw. Fade before the neck.
            jaw = np.exp(-((y+.078)/.031)**2)
            points[:, 0] *= 1+(.012 if sex == "male" else -.042)*jaw
            cheek = np.exp(-((np.abs(x)-.053)/.028)**2-((y+.035)/.026)**2)
            points[:, 2] += (.0027 if sex == "male" else .0036)*cheek
        if morph is not None:
            blink_points = likeness.deform(points+morph*[.111,.108,.111])
        points = likeness.deform(points)
        if morph is not None:
            morph = blink_points-points
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
        image.thumbnail((1024, 1024) if name == "skin" else (384, 384), Image.Resampling.LANCZOS)
        if name == "eyes":
            # Dark brown irises and a retained limbal ring match both portraits.
            eye = np.array(image.convert("RGBA"))
            rgb = eye[:,:,:3].astype(float)
            iris = (rgb[:,:,0] > 1.40*rgb[:,:,1]) & (rgb[:,:,1] < 104)
            rgb[iris] = rgb[iris]*[.40,.62,.70]+[3,3,3]
            eye[:,:,:3] = rgb.astype(np.uint8)
            original = Image.fromarray(eye)
            image = likeness.paint(original, uv, corners, points[vertex_ids]).convert("RGBA")
            image.putalpha(original.getchannel("A"))
        if name == "skin":
            image = likeness.paint(image, uv, corners, points[vertex_ids])
        stream = io.BytesIO()
        opaque = name == "skin"
        if opaque:
            image.convert("RGB").save(stream, format="JPEG", quality=90, optimize=True)
        else:
            image.convert("RGBA").quantize(colors=256).save(stream, format="PNG", optimize=True)
        slot = len(doc["meshes"])
        doc["images"].append(dict(bufferView=buffer(stream.getvalue()), mimeType="image/jpeg" if opaque else "image/png"))
        doc["textures"].append(dict(source=slot))
        material = dict(name=name, pbrMetallicRoughness=dict(baseColorTexture=dict(index=slot), metallicFactor=0, roughnessFactor=.45 if name == "eyes" else .86))
        if name == "eyes":
            material.update(alphaMode="MASK", alphaCutoff=.28, doubleSided=False)
        elif not opaque:
            # Fine photographed lash roots already sit on the eyelids.
            material["pbrMetallicRoughness"]["baseColorFactor"]=[1,1,1,.17]
            material.update(alphaMode="BLEND", doubleSided=True)
        doc["materials"].append(material)
        attrs = dict(POSITION=accessor(points[vertex_ids]), NORMAL=accessor(normals[vertex_ids]), TEXCOORD_0=accessor(uv))
        doc["meshes"].append(dict(primitives=[dict(attributes=attrs, indices=accessor(corners, True), material=slot)]))
        if morph is not None:
            doc["meshes"][-1]["primitives"][0]["targets"] = [dict(POSITION=accessor(morph[vertex_ids]))]
            doc["meshes"][-1].update(weights=[0], extras=dict(targetNames=["blink"]))
        doc["nodes"].append(dict(name=name, mesh=slot))
        doc["scenes"][0]["nodes"].append(slot)
    from visitor_hair import bake_hair
    points,normals,uv,indices,hair_image=bake_hair(sex,likeness)
    stream=io.BytesIO()
    hair_image.save(stream,format="PNG",optimize=True)
    slot=len(doc["images"])
    doc["images"].append(dict(bufferView=buffer(stream.getvalue()),mimeType="image/png"))
    doc["textures"].append(dict(source=slot))
    style="side-part" if sex=="male" else "low-ponytail"
    doc["materials"].append(dict(name=style,doubleSided=True,alphaMode="MASK",alphaCutoff=.48,
        pbrMetallicRoughness=dict(baseColorTexture=dict(index=slot),metallicFactor=0,roughnessFactor=.76)))
    attrs=dict(POSITION=accessor(points),NORMAL=accessor(normals),TEXCOORD_0=accessor(uv))
    doc["meshes"].append(dict(primitives=[dict(attributes=attrs,indices=accessor(indices,True),material=slot)]))
    doc["nodes"].append(dict(name=style,mesh=slot))
    doc["scenes"][0]["nodes"].append(slot)
    while len(data)%4:
        data.append(0)
    doc["buffers"].append(dict(byteLength=len(data)))
    header = json.dumps(doc, separators=(",", ":")).encode()
    header += b" "*(-len(header)%4)
    dest.write_bytes(struct.pack("<4sII", b"glTF", 2, 28+len(header)+len(data))+struct.pack("<I4s", len(header), b"JSON")+header+struct.pack("<I4s", len(data), b"BIN\0")+data)


def fabric_swatch(reference, destination):
    # Isolate the actual jacket weave from the broad shoulder shadow.
    swatch = reference.crop((74,403,138,467)).convert("L")
    fine = np.array(swatch,dtype=float)-np.array(swatch.filter(ImageFilter.GaussianBlur(5)),dtype=float)
    grain = np.uint8(np.clip(127+19*fine,0,255))
    # A mirrored tile meets at all four edges under repeating texture lookup.
    row=np.hstack([grain,grain[:,::-1]])
    Image.fromarray(np.vstack([row,row[::-1]])).save(destination,lossless=True)


if __name__ == "__main__":
    reference = Image.open(sys.argv[2])
    fabric_swatch(reference,Path(__file__).resolve().parents[1]/"characters"/"visitor-cloth.webp")
    for sex in ("male", "female"):
        build(Path(sys.argv[1]), sex, Path(__file__).resolve().parents[1]/"characters"/("visitor-"+sex+".glb"), reference)
