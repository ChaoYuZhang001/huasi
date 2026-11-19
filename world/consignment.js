export const cargo = {
  cups: {name:'青花茶盏', material:'straw', wrapping:'草衬', destination:'boat', recipient:'东岸茶庄', vehicle:'乌篷船'},
  books: {name:'线装书册', material:'oilcloth', wrapping:'油布', destination:'cart', recipient:'西门书铺', vehicle:'西路车'}
};
const known = id => typeof id === 'string' && Object.hasOwn(cargo, id);

export function wrappingHint(id, packed) {
  if (!known(id)) return '';
  const item = cargo[id];
  return packed ? item.name+'已包好，送往'+item.vehicle+'。' : item.name+'要用'+item.wrapping+'包好。';
}

export function openWaybills(saved) {
  const delivered = new Set((Array.isArray(saved?.delivered) ? saved.delivered : []).filter(known));
  let active = known(saved?.active) && !delivered.has(saved.active) ? saved.active : null;
  let packed = !!active && saved?.packed === true;
  return {
    get active() {return active;}, get packed() {return packed;},
    done: id => delivered.has(id), hint: () => wrappingHint(active,packed),
    take(id) {
      if (!known(id) || active || delivered.has(id)) return false;
      active = id;
      return true;
    },
    wrap(material) {
      if (!active || packed || cargo[active].material !== material) return false;
      packed = true;
      return true;
    },
    dispatch(to) {
      if (!active || !packed || cargo[active].destination !== to) return false;
      delivered.add(active);
      active = null;
      packed = false;
      return true;
    },
    snapshot: () => ({active, packed, delivered:[...delivered]})
  };
}
