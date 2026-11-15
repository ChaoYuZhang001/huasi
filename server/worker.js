// Huashan Temple - "nearby pilgrims" relay.
// Cloudflare Worker + Durable Object. Visitors within RADIUS_KM of each other
// share a hall: each sees the others' name and pose. No chat, no accounts.
//
// Privacy rules this file enforces:
//  - coordinates are used only here, to decide who is near whom;
//  - they are rounded to ~100 m, kept in memory for the life of the socket,
//    never written to storage and never sent to any other visitor;
//  - a peer only ever receives: an opaque id, a display name, a look seed, a pose.

const RADIUS_KM = 3;      // who can see whom
const CELL_DEG = 0.5;     // routing cell (~55 km); one Durable Object per cell
const MAX_ROOM = 400;     // sockets per cell
const MAX_RATE = 15;      // messages per second per socket
const MAX_NAME = 12;

const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
const okLat = v => v >= -90 && v <= 90;
const okLon = v => v >= -180 && v <= 180;

function km(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/health') return new Response('ok');
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('huashan nearby relay', { status: 426 });

    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowed.length && !allowed.includes(req.headers.get('Origin') || '')) return new Response('forbidden', { status: 403 });

    // City-level position from the connecting IP. Good enough to pick a routing
    // cell; NOT accurate to 3 km. Visitors who grant browser location send exact
    // coordinates later, inside the socket, never in the URL.
    const ipLat = parseFloat(req.cf && req.cf.latitude), ipLon = parseFloat(req.cf && req.cf.longitude);
    const hasIp = okLat(ipLat) && okLon(ipLon);

    // Optional coarse cell computed by the client from its own GPS fix, so two
    // neighbours land in the same cell even if their IPs geolocate elsewhere.
    let cell = '';
    const c = /^(-?\d{1,3})_(-?\d{1,3})$/.exec(url.searchParams.get('c') || '');
    if (c) cell = c[1] + '_' + c[2];
    else if (hasIp) cell = Math.floor(ipLat / CELL_DEG) + '_' + Math.floor(ipLon / CELL_DEG);
    else return new Response('location unavailable', { status: 400 });

    const h = new Headers(req.headers);
    h.set('x-lat', hasIp ? String(ipLat) : '');
    h.set('x-lon', hasIp ? String(ipLon) : '');
    return env.ROOMS.get(env.ROOMS.idFromName(cell)).fetch(new Request(req.url, { headers: h }));
  },
};

export class Room {
  constructor(state) {
    this.state = state;
    this.meta = new Map(); // ws -> attachment, rebuilt lazily after hibernation
  }

  m(ws) {
    let a = this.meta.get(ws);
    if (!a) { a = ws.deserializeAttachment() || {}; this.meta.set(ws, a); }
    return a;
  }

  near(ws, a) {
    const out = [];
    if (!a.ready) return out;
    for (const o of this.state.getWebSockets()) {
      if (o === ws) continue;
      const b = this.m(o);
      if (b.ready && km(a, b) <= RADIUS_KM) out.push([o, b]);
    }
    return out;
  }

  send(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch (_) {} }

  async fetch(req) {
    if (this.state.getWebSockets().length >= MAX_ROOM) return new Response('room full', { status: 503 });
    const pair = new WebSocketPair();
    const lat = parseFloat(req.headers.get('x-lat')), lon = parseFloat(req.headers.get('x-lon'));
    const a = { id: crypto.randomUUID().slice(0, 8), lat: okLat(lat) ? lat : NaN, lon: okLon(lon) ? lon : NaN, precise: false, ready: false, name: '', k: 0, w: 0, c: 0 };
    this.state.acceptWebSocket(pair[1]);
    pair[1].serializeAttachment(a);
    this.meta.set(pair[1], a);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  webSocketMessage(ws, raw) {
    if (typeof raw !== 'string' || raw.length > 400) return;
    const a = this.m(ws), now = Date.now();
    if (now - a.w > 1000) { a.w = now; a.c = 0; }
    if (++a.c > MAX_RATE) return;
    let d; try { d = JSON.parse(raw); } catch (_) { return; }
    if (!d || typeof d !== 'object') return;

    if (d.t === 'hi' && !a.ready) {
      const la = num(d.lat), lo = num(d.lon);
      if (okLat(la) && okLon(lo)) { a.lat = Math.round(la * 1000) / 1000; a.lon = Math.round(lo * 1000) / 1000; a.precise = true; }
      if (!okLat(a.lat) || !okLon(a.lon)) { ws.close(1008, 'no location'); return; }
      a.name = String(d.name || '').replace(/[\u0000-\u001f<>]/g, '').slice(0, MAX_NAME) || '香客';
      a.k = (d.k | 0) % 60; if (a.k < 0) a.k = 0;
      a.ready = true;
      ws.serializeAttachment(a);
      const nb = this.near(ws, a);
      this.send(ws, { t: 'hi', id: a.id, n: nb.length, precise: a.precise });
      for (const [o, b] of nb) {
        this.send(o, { t: 'in', id: a.id, name: a.name, k: a.k });
        this.send(o, { t: 'n', n: this.near(o, b).length });
        this.send(ws, { t: 'in', id: b.id, name: b.name, k: b.k });
      }
      return;
    }

    if (d.t === 's' && a.ready) {
      const p = d.p, s = d.a;
      if (!Array.isArray(p) || p.length !== 3 || !p.every(v => Number.isFinite(v) && Math.abs(v) < 600)) return;
      if (!Number.isFinite(d.r)) return;
      const act = Array.isArray(s) && s.length === 3 ? s.map(v => Math.max(0, Math.min(1, +v || 0))) : [0, 0, 0];
      const msg = JSON.stringify({ t: 's', id: a.id, p, r: d.r, a: act });
      for (const [o] of this.near(ws, a)) { try { o.send(msg); } catch (_) {} }
    }
  }

  leave(ws) {
    const a = this.m(ws);
    this.meta.delete(ws);
    if (!a.ready) return;
    for (const o of this.state.getWebSockets()) {
      if (o === ws) continue;
      const b = this.m(o);
      if (b.ready && km(a, b) <= RADIUS_KM) {
        this.send(o, { t: 'out', id: a.id });
        this.send(o, { t: 'n', n: Math.max(0, this.near(o, b).filter(([x]) => x !== ws).length) });
      }
    }
  }

  webSocketClose(ws) { this.leave(ws); }
  webSocketError(ws) { this.leave(ws); }
}
