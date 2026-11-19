// Region-owned surfaces. No temple material or source texture is mutated.
const canvases=new Map();
export function townSurfaces(THREE,M) {
  function texture(kind){
    let c=canvases.get(kind);
    if(!c){c=document.createElement('canvas');c.width=c.height=256;
    const g=c.getContext('2d'),im=g.createImageData(256,256);
    let seed=4917;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      const n=random()-.5,p=(y*256+x)*4;
      const patch=Math.sin(x*Math.PI/64+Math.sin(y*Math.PI/128))*Math.cos(y*Math.PI/128);
      const grain=Math.sin(x*.65+Math.sin(y*.04)*1.4)+Math.sin(x*1.7+y*.01);
      const v=kind==='wood'?grain*2.5+n*9:patch*8+n*21;
      const base=kind==='wood'?[102,80,57]:[79,83,55];
      im.data[p]=base[0]+v;im.data[p+1]=base[1]+v;im.data[p+2]=base[2]+v*.65;im.data[p+3]=255;
    }
    g.putImageData(im,0,0);canvases.set(kind,c);}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;
  }
  const wood=new THREE.MeshStandardMaterial({map:texture('wood'),roughness:.94});wood.userData.s=1.8;
  const soil=new THREE.MeshStandardMaterial({map:texture('soil'),roughness:1});soil.userData.s=5;
  const stone=M.paving.clone();stone.color.setHex(0xb3b1a5);stone.roughness=1;
  const cloth=M.sack.clone();cloth.side=THREE.DoubleSide;
  return{wood,soil,stone,cloth,
    // Real stone scans load asynchronously after the first frame. Travelling
    // early must receive the same final maps as travelling after they load.
    sync(){let changed=false;for(const key of ['map','normalMap','roughnessMap'])if(stone[key]!==M.paving[key]){stone[key]=M.paving[key];changed=true;}
      if(changed){stone.normalScale.copy(M.paving.normalScale);stone.needsUpdate=true;}}
  };
}
