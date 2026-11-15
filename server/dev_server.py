#!/usr/bin/env python3
"""Local stand-in for worker.js, for testing the page without Cloudflare.

Speaks the same JSON protocol over WebSocket. Everyone who connects is treated
as being in the same place, and a few scripted pilgrims walk around the gate
court so there is something to look at with a single browser tab.

    python3 dev_server.py            # ws://127.0.0.1:8849
    open http://localhost:8848/index.html?mp=ws://127.0.0.1:8849

Standard library only. Not for production: no TLS, no origin check.
"""
import asyncio, base64, hashlib, json, math, struct, sys, uuid

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8849
BOTS = [("云游客", 3, 0.0), ("听泉人", 7, 2.1), ("晚归人", 13, 4.2)]
clients = {}  # id -> (writer, name, k)


def frame(text):
    b = text.encode()
    n = len(b)
    if n < 126:
        head = struct.pack("!BB", 0x81, n)
    elif n < 65536:
        head = struct.pack("!BBH", 0x81, 126, n)
    else:
        head = struct.pack("!BBQ", 0x81, 127, n)
    return head + b


async def read_frame(r):
    h = await r.readexactly(2)
    op, n = h[0] & 0x0F, h[1] & 0x7F
    if n == 126:
        n = struct.unpack("!H", await r.readexactly(2))[0]
    elif n == 127:
        n = struct.unpack("!Q", await r.readexactly(8))[0]
    mask = await r.readexactly(4) if h[1] & 0x80 else b"\0\0\0\0"
    data = bytes(c ^ mask[i % 4] for i, c in enumerate(await r.readexactly(n)))
    return op, data


def send(w, obj):
    try:
        w.write(frame(json.dumps(obj, ensure_ascii=False)))
    except Exception:
        pass


def others(me):
    return [(i, c) for i, c in clients.items() if i != me]


async def handle(r, w):
    req = await r.readuntil(b"\r\n\r\n")
    key = None
    for line in req.decode(errors="replace").split("\r\n"):
        if line.lower().startswith("sec-websocket-key:"):
            key = line.split(":", 1)[1].strip()
    if not key:
        w.write(b"HTTP/1.1 426 Upgrade Required\r\nContent-Length: 0\r\n\r\n")
        await w.drain(); w.close(); return
    acc = base64.b64encode(hashlib.sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).digest()).decode()
    w.write(("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: %s\r\n\r\n" % acc).encode())
    me = uuid.uuid4().hex[:8]
    try:
        while True:
            op, data = await read_frame(r)
            if op == 8:
                break
            if op != 1:
                continue
            try:
                d = json.loads(data.decode())
            except Exception:
                continue
            if d.get("t") == "hi" and me not in clients:
                name = str(d.get("name") or "香客")[:12]
                k = int(d.get("k") or 0) % 60
                clients[me] = (w, name, k)
                send(w, {"t": "hi", "id": me, "n": len(clients) - 1 + len(BOTS), "precise": "lat" in d})
                for i, (ow, on, ok) in others(me):
                    send(ow, {"t": "in", "id": me, "name": name, "k": k})
                    send(w, {"t": "in", "id": i, "name": on, "k": ok})
                for j, (bn, bk, _) in enumerate(BOTS):
                    send(w, {"t": "in", "id": "bot%d" % j, "name": bn, "k": bk})
            elif d.get("t") == "s" and me in clients:
                p = d.get("p")
                if isinstance(p, list) and len(p) == 3:
                    for i, (ow, _, _) in others(me):
                        send(ow, {"t": "s", "id": me, "p": p, "r": d.get("r", 0), "a": d.get("a", [0, 0, 0])})
    except (asyncio.IncompleteReadError, ConnectionError):
        pass
    finally:
        if clients.pop(me, None):
            for i, (ow, _, _) in clients.items():
                send(ow, {"t": "out", "id": me})
        w.close()


async def bots():
    t = 0.0
    while True:
        await asyncio.sleep(0.2)
        t += 0.2
        for j, (_, _, ph) in enumerate(BOTS):
            if j == 2:  # stands still in front of the gate, bowing now and then
                x, z, yaw = 2.2, 47.5, math.pi
                bow = max(0.0, math.sin(t * 1.4)) ** 2 if int(t / 6) % 2 else 0.0
                msg = {"t": "s", "id": "bot2", "p": [x, 0, z], "r": yaw, "a": [0, round(bow, 2), 1 if bow > 0.02 else 0]}
            else:
                a = t * 0.35 * (1 if j == 0 else -1) + ph
                rad = 3.0 + j * 1.6
                x, z = math.cos(a) * rad, 47.0 + math.sin(a) * rad
                yaw = math.atan2(-math.sin(a), math.cos(a)) * (1 if j == 0 else -1) + (0 if j == 0 else math.pi)
                msg = {"t": "s", "id": "bot%d" % j, "p": [round(x, 2), 0, round(z, 2)], "r": round(yaw, 2), "a": [0, 0, 0]}
            for w, _, _ in list(clients.values()):
                send(w, msg)


async def main():
    srv = await asyncio.start_server(handle, "127.0.0.1", PORT)
    print("dev relay on ws://127.0.0.1:%d" % PORT, flush=True)
    await asyncio.gather(srv.serve_forever(), bots())


asyncio.run(main())
