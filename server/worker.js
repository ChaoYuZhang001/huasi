// Huashan Temple - "nearby pilgrims" relay.
// Cloudflare Worker + Durable Object. Visitors within RADIUS_KM of each other
// share a hall: each sees the others' name and pose. No chat, no accounts.
//
// Privacy rules this file enforces:
//  - coordinates are used only here, to decide who is near whom;
//  - they are rounded to ~100 m, kept in memory for the life of the socket,
//    never written to storage and never sent to any other visitor;
//  - peers receive an opaque id, display name, appearance, pose and in-game lantern flights, never wishes.
//  - the shared "whole mountain" room (?c=world) is joined by people with nobody
//    within RADIUS_KM; it takes no coordinates at all and everyone in it sees everyone.
//  - the daily incense counter keeps one number per day in storage; the per-IP
//    rate limit behind it lives in memory only and is never written anywhere.

import {readPractice, samplePractice, readBench} from '../world/presence.js';
import {readSkyRelease,nearRelease,RELEASE_GAP_MS} from '../world/sky-lantern.js';

const RADIUS_KM = 3;      // who can see whom
const CELL_DEG = 0.5;     // routing cell (~55 km); one Durable Object per cell
const MAX_ROOM = 400;     // sockets per cell
const MAX_RATE = 15;      // messages per second per socket
const MAX_NAME = 12;
const WORLD_MAX = 120;    // sockets in the shared "whole mountain" room
const XIANG_GAP = 15000;  // ms between counted offerings from one IP
const XIANG_DAY = 60;     // counted offerings per IP per day

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
    if (['/huashan-temple.html', '/huashan-temple', '/huashan-temple/'].includes(url.pathname)) {
      url.pathname = '/';
      return Response.redirect(url.href, 301);
    }
    if (url.pathname === '/health') return new Response('ok');
    if (url.pathname === '/api/xiang') return xiang(req, env, url);
    // Anything that is not a websocket upgrade on /ws is the website itself.
    if (url.pathname !== '/ws' || req.headers.get('Upgrade') !== 'websocket') {
      return env.ASSETS ? env.ASSETS.fetch(req) : new Response('huashan nearby relay', { status: 426 });
    }

    // Same-origin pages are always allowed; other origins must be on the list.
    const origin = req.headers.get('Origin') || '';
    let sameHost = false;
    try { sameHost = !!origin && new URL(origin).host === url.host; } catch (_) {}
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!sameHost && allowed.length && !allowed.includes(origin)) return new Response('forbidden', { status: 403 });

    // City-level position from the connecting IP. Good enough to pick a routing
    // cell; NOT accurate to 3 km. Visitors who grant browser location send exact
    // coordinates later, inside the socket, never in the URL.
    const ipLat = parseFloat(req.cf && req.cf.latitude), ipLon = parseFloat(req.cf && req.cf.longitude);
    const hasIp = okLat(ipLat) && okLon(ipLon);

    // Optional coarse cell computed by the client from its own GPS fix, so two
    // neighbours land in the same cell even if their IPs geolocate elsewhere.
    let cell = '';
    const cq = url.searchParams.get('c') || '';
    const c = /^(-?\d{1,3})_(-?\d{1,3})$/.exec(cq);
    if (cq === 'world') cell = 'world';
    else if (c) cell = c[1] + '_' + c[2];
    else if (hasIp) cell = Math.floor(ipLat / CELL_DEG) + '_' + Math.floor(ipLon / CELL_DEG);
    else return new Response('location unavailable', { status: 400 });

    // A place is a separate physical space even when the visitors are nearby.
    // Keep the old temple key so clients already online retain their room.
    const realm = url.searchParams.get('r') || 'temple';
    if (!['temple', 'town', 'wudang', 'ming', 'beggar', 'emei', 'huashan', 'kunlun', 'kongtong', 'escort', 'roads', 'persia', 'vajra', 'wushan', 'sanjiang', 'fist', 'fivephoenix', 'eagle', 'sand', 'whale', 'islands'].includes(realm)) return new Response('unknown place', { status: 400 });
    const roomKey = realm === 'temple' ? cell : realm + ':' + cell;
    const h = new Headers(req.headers);
    h.set('x-lat', hasIp ? String(ipLat) : '');
    h.set('x-lon', hasIp ? String(ipLon) : '');
    h.set('x-world', cell === 'world' ? '1' : '');
    return env.ROOMS.get(env.ROOMS.idFromName(roomKey)).fetch(new Request(req.url, { headers: h }));
  },
};

// GET: today's count. POST: one more stick of incense (rate-limited per IP).
async function xiang(req, env, url) {
  const origin = req.headers.get('Origin') || '';
  let same = false;
  try { same = !!origin && new URL(origin).host === url.host; } catch (_) {}
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ok = same || allowed.includes(origin);
  const cors = ok ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Max-Age': '86400' } });
  if (req.method !== 'GET' && req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  if (req.method === 'POST' && !ok) return new Response('forbidden', { status: 403 });
  const h = new Headers({ 'x-ip': req.headers.get('CF-Connecting-IP') || '' });
  const r = await env.ROOMS.get(env.ROOMS.idFromName('stats')).fetch(new Request(url.origin + '/api/xiang', { method: req.method, headers: h }));
  const out = new Response(r.body, r);
  for (const [k, v] of Object.entries(cors)) out.headers.set(k, v);
  out.headers.set('Cache-Control', 'no-store');
  return out;
}

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
      if (b.ready && (a.world || km(a, b) <= RADIUS_KM)) out.push([o, b]);
    }
    return out;
  }

  send(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch (_) {} }

  async fetch(req) {
    if (new URL(req.url).pathname === '/api/xiang') return this.xiang(req);
    const world = req.headers.get('x-world') === '1';
    if (this.state.getWebSockets().length >= (world ? WORLD_MAX : MAX_ROOM)) return new Response('room full', { status: 503 });
    const pair = new WebSocketPair();
    const lat = world ? NaN : parseFloat(req.headers.get('x-lat')), lon = world ? NaN : parseFloat(req.headers.get('x-lon'));
    const a = { id: crypto.randomUUID().slice(0, 8), lat: okLat(lat) ? lat : NaN, lon: okLon(lon) ? lon : NaN, precise: false, ready: false, world, name: '', k: 0, w: 0, c: 0 };
    a.realm = new URL(req.url).searchParams.get('r') || 'temple';
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
      if (!a.world && okLat(la) && okLon(lo)) { a.lat = Math.round(la * 1000) / 1000; a.lon = Math.round(lo * 1000) / 1000; a.precise = true; }
      if (!a.world && (!okLat(a.lat) || !okLon(a.lon))) { ws.close(1008, 'no location'); return; }
      a.name = String(d.name || '').replace(/[\u0000-\u001f<>]/g, '').slice(0, MAX_NAME) || '香客';
      a.k = (d.k | 0) % 60; if (a.k < 0) a.k = 0;
      a.g = d.g === 'f' || d.g === 'm' ? d.g : null;
      a.ready = true;
      ws.serializeAttachment(a);
      const nb = this.near(ws, a);
      this.send(ws, { t: 'hi', id: a.id, n: nb.length, precise: a.precise, w: a.world ? 1 : 0 });
      for (const [o, b] of nb) {
        this.send(o, { t: 'in', id: a.id, name: a.name, k: a.k, g: a.g });
        this.send(o, { t: 'n', n: this.near(o, b).length });
        this.send(ws, { t: 'in', id: b.id, name: b.name, k: b.k, g: b.g || null });
        // A new arrival sees stationary visitors immediately, without waiting
        // for their eight-second heartbeat. Attachments survive hibernation;
        // poses expire and are never written to Durable Object storage.
        if (b.pose && now - b.poseAt < 20000) {
          this.send(ws, {t: 's', id: b.id, ...b.pose, x: samplePractice(b.pose.x, (now - b.poseAt) / 1000)});
        }
      }
      return;
    }

    if (d.t === 'sky' && a.ready && a.realm === 'temple') {
      const release = readSkyRelease(d);
      if (!nearRelease(a.pose?.p, release) || now - a.poseAt > 10000 || now - (a.lastSky || 0) < RELEASE_GAP_MS) return;
      a.lastSky = now;
      ws.serializeAttachment(a);
      for (const [other] of this.near(ws, a)) this.send(other, {t:'sky',id:a.id,...release});
      return;
    }

    if (d.t === 's' && a.ready) {
      const p = d.p, s = d.a;
      if (!Array.isArray(p) || p.length !== 3 || !p.every((v,i) => Number.isFinite(v) && Math.abs(v) < (i===0 && a.realm==='roads'?815:600))) return;
      if (!Number.isFinite(d.r)) return;
      const act = Array.isArray(s) && s.length === 3 ? s.map(v => Math.max(0, Math.min(1, +v || 0))) : [0, 0, 0];
      a.pose = {p, r: d.r, a: act, x: readPractice(d.x), ...(act[0]>0&&readBench(d.b)?{b:1}:{})};
      a.poseAt = now;
      ws.serializeAttachment(a);
      const msg = JSON.stringify({ t: 's', id: a.id, ...a.pose });
      for (const [o] of this.near(ws, a)) { try { o.send(msg); } catch (_) {} }
    }
  }

  leave(ws) {
    const a = this.m(ws);
    this.meta.delete(ws);
    if (!a.ready) return;
    a.ready = false;
    ws.serializeAttachment(a); // close/error may both arrive; announce once
    for (const o of this.state.getWebSockets()) {
      if (o === ws) continue;
      const b = this.m(o);
      if (b.ready && (a.world || km(a, b) <= RADIUS_KM)) {
        this.send(o, { t: 'out', id: a.id });
        this.send(o, { t: 'n', n: Math.max(0, this.near(o, b).filter(([x]) => x !== ws).length) });
      }
    }
  }

  // Only the instance named 'stats' is asked this. One number per (China) day.
  async xiang(req) {
    const day = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10), key = 'x:' + day;
    let n = (await this.state.storage.get(key)) || 0;
    if (req.method === 'POST') {
      const ip = req.headers.get('x-ip') || '', now = Date.now();
      if (!this.ips || this.ips.size > 20000) this.ips = new Map();
      const r = this.ips.get(ip) || { t: 0, c: 0, d: day };
      if (r.d !== day) { r.d = day; r.c = 0; }
      if (now - r.t >= XIANG_GAP && r.c < XIANG_DAY) { r.t = now; r.c++; this.ips.set(ip, r); n++; await this.state.storage.put(key, n); }
    }
    return Response.json({ d: day, n });
  }

  webSocketClose(ws) {
    this.leave(ws);
    // Our 2025 compatibility date predates automatic close replies. Without
    // this, browsers remain CLOSING and their reconnect handler never runs.
    try { ws.close(1000, 'departed'); } catch (_) {}
  }
  webSocketError(ws) {
    this.leave(ws);
    try { ws.close(1011, 'connection error'); } catch (_) {}
  }
}
