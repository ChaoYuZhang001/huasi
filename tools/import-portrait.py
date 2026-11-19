import base64
import pathlib
import struct
import sys

points, triangles, lookup, packed = [], [], {}, []
group = None
for line in pathlib.Path(sys.argv[1]).read_text().splitlines():
    fields = line.split()
    if not fields:
        continue
    if fields[0] == 'v':
        points.append(tuple(map(float, fields[1:4])))
    elif fields[0] == 'g':
        group = fields[1]
    elif fields[0] == 'f' and group == 'body':
        face = [int(token.split('/')[0]) - 1 for token in fields[1:]]
        if min(points[index][1] for index in face) < 5.94:
            continue
        for index in face:
            if index not in lookup:
                lookup[index] = len(packed) // 3
                x, y, z = points[index]
                packed.extend(round(value * 10000) for value in (x*.122, (y-7.30)*.116, (z-.60)*.116))
        for offset in range(1, len(face)-1):
            triangles.extend(lookup[index] for index in (face[0], face[offset], face[offset+1]))

def encode(values, fmt):
    return base64.b64encode(struct.pack('<'+str(len(values))+fmt, *values)).decode()

dest = pathlib.Path(__file__).resolve().parents[1] / 'characters' / 'portrait-data.js'
dest.write_text(f"export const points='{encode(packed, 'h')}';\nexport const faces='{encode(triangles, 'H')}';\n")
