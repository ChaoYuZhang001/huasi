// One renderer and one set of builders, with independent world data per region.
// Imports are lazy; a failed destination load leaves the current place intact.
export function createRegions(host, { limit = 3 } = {}) {
  if (!Number.isInteger(limit) || limit < 2) throw new Error('Region cache needs at least two places');
  const regions = new Map(), visits = new Map();
  let current, pinned, busy = false;

  function register(region) {
    if (regions.has(region.id)) throw new Error(`Duplicate region: ${region.id}`);
    regions.set(region.id, region);
    return region;
  }

  function start(region, arrival) {
    current = register(region);
    pinned = region.id;
    current.data = host.capture();
    if (arrival) {
      current = register(arrival);
      host.restore(arrival.data);
      region.root.visible = false;
      arrival.root.visible = true;
    }
  }

  function trim() {
    // Map order is least recently visited first. The original temple stays loaded.
    for (const [id, region] of regions) {
      if (regions.size <= limit) break;
      if (id === pinned || region === current || host.keep?.(region)) continue;
      host.dispose?.(region);
      regions.delete(id);
    }
  }

  function prepare(id,builder) {
    const cached=regions.get(id);
    if(cached)return cached;
    const visit=visits.get(id),next=host.build(id,builder,visit?.state);
    if(visit)next.returnPose=visit.returnPose;
    return register(next);
  }

  // The neighbouring root already occupies its place in the same view. Only
  // the local physics/navigation frame changes when a walker crosses the seam.
  function cross(next) {
    if(busy||!next||next===current)return false;
    current.returnPose=host.pose();current.data=host.capture();
    const visit={returnPose:current.returnPose,state:current.snapshot?.()};
    visits.set(current.id,visit);host.remember?.(current,visit);
    host.restore(next.data);current=next;
    regions.delete(next.id);regions.set(next.id,next);
    return true;
  }

  async function go(id) {
    if (busy || current.id === id || !host.canTravel()) return false;
    busy = true;
    const previous = current;
    const previousPose = host.pose();
    previous.data = host.capture();
    let next, built = false;
    host.beginTravel();
    try {
      next = regions.get(id);
      if (!next) {
        const build = await host.load(id);
        const visit = visits.get(id);
        next = host.build(id, build, visit?.state);
        built = true;
        if (visit) next.returnPose = visit.returnPose;
        register(next);
      }
      previous.returnPose = host.pose();
      const visit = { returnPose: previous.returnPose, state: previous.snapshot?.() };
      visits.set(previous.id, visit);
      host.remember?.(previous, visit);
      host.restore(next.data);
      previous.root.visible = false;
      next.root.visible = true;
      current = next;
      host.enter(next, next.returnPose || next.spawn);
      regions.delete(id); regions.set(id, next);
    } catch (error) {
      host.restore(previous.data);
      if (next && next !== previous) next.root.visible = false;
      previous.root.visible = true;
      current = previous;
      host.rollback?.(previous, previousPose);
      if (built) { regions.delete(id); host.dispose?.(next); }
      host.failed(error);
      return false;
    } finally {
      busy = false;
      host.endTravel();
    }
    // Arrival is committed before eviction; cleanup can never roll travel back
    // into a scene whose resources have already been released.
    trim();
    return true;
  }

  return { start, go, prepare, cross, trim, get:id=>regions.get(id), get current() { return current; }, get busy() { return busy; },
    get ids() { return [...regions.keys()]; }, get limit() { return limit; } };
}
