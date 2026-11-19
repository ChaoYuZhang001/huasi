// Find resources by reference, including invisible objects and shader textures.
// A cloned material can still use a texture owned by the temple or another region.
export function resourcesOf(root, extra = []) {
  const found = new Set(), uniforms = new Set();
  function textureValue(value) {
    if (!value || typeof value !== 'object' || uniforms.has(value)) return;
    uniforms.add(value);
    if (value.isTexture) add(value);
    else if (Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype)
      for (const child of Object.values(value)) textureValue(child);
  }
  function add(resource) {
    if (Array.isArray(resource)) { resource.forEach(add); return; }
    if (!resource?.dispose || found.has(resource)) return;
    found.add(resource);
    if (resource.isMaterial) {
      for (const value of Object.values(resource)) if (value?.isTexture) add(value);
      textureValue(resource.uniforms);
    }
  }
  root?.traverse(o => {
    // InstancedMesh owns GPU instance attributes independently of its geometry.
    if (o.isInstancedMesh) add(o);
    add(o.geometry); add(o.material); add(o.skeleton); add(o.shadow);
    add(o.customDepthMaterial); add(o.customDistanceMaterial);
    add(o.background); add(o.environment);
  });
  for (const resource of extra) add(resource);
  return found;
}

export function releaseRegion(root, { retained, extra = [] }) {
  const owned = resourcesOf(root, extra);
  root.removeFromParent();
  // Re-scan AFTER detaching: this includes late-loaded maps and live visitors.
  const keep = retained(), released = { geometries: 0, materials: 0, textures: 0, other: 0 };
  for (const resource of owned) {
    if (keep.has(resource)) continue;
    resource.dispose();
    const kind = resource.isBufferGeometry ? 'geometries' : resource.isMaterial ? 'materials' : resource.isTexture ? 'textures' : 'other';
    released[kind]++;
  }
  root.clear();
  return released;
}
