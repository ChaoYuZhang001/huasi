import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../three.module.min.js';
import {sewnJacket} from '../characters/tailoring.js';

for(const [sex,style] of [['male','side-part'],['female','low-ponytail']]){
 test(sex+' portrait embeds its textures, fitted pieces and eyelid morphs',()=>{
  const buffer=readFileSync(new URL('../characters/visitor-'+sex+'.glb',import.meta.url));
  assert.equal(buffer.toString('ascii',0,4),'glTF');
  assert.equal(buffer.readUInt32LE(8),buffer.length);
  assert(buffer.length<1.25*1024*1024);
  const doc=JSON.parse(buffer.toString('utf8',20,20+buffer.readUInt32LE(12)));
  assert.deepEqual(doc.nodes.map(node=>node.name),['skin','eyes','eyelashes01',style]);
  const hair=doc.meshes[doc.nodes.find(node=>node.name===style).mesh].primitives[0];
  const shape=doc.accessors[hair.attributes.POSITION];
  assert.equal(doc.accessors[hair.attributes.TEXCOORD_0].count,shape.count);
  assert(shape.min[1]<(sex==='female'?-.20:-.035));
  assert(shape.max[1]>.12);
  assert.equal(doc.materials[hair.material].alphaMode,'MASK');
  const texture=doc.materials[hair.material].pbrMetallicRoughness.baseColorTexture.index;
  const image=doc.images[doc.textures[texture].source],view=doc.bufferViews[image.bufferView];
  const start=28+buffer.readUInt32LE(12)+view.byteOffset;
  const png=buffer.subarray(start,start+view.byteLength);
  let transparent=false;
  for(let offset=8;offset+12<=png.length;){
   const size=png.readUInt32BE(offset);
   if(png.toString('ascii',offset+4,offset+8)==='tRNS'){
    transparent=png.subarray(offset+8,offset+8+size).includes(0);
    break;
   }
   offset+=12+size;
  }
  assert(transparent,'the indexed hair texture must preserve its cutouts');
  if(sex==='female'){
   const mesh=doc.meshes[doc.nodes.find(node=>node.name===style).mesh];
   assert.deepEqual(mesh.extras.targetNames,['tailSway']);
   const target=doc.accessors[hair.targets[0].POSITION];
   assert.equal(target.count,shape.count);
   const sparse=target.sparse,bin=28+buffer.readUInt32LE(12);
   const indexOffset=bin+doc.bufferViews[sparse.indices.bufferView].byteOffset;
   const deltaOffset=bin+doc.bufferViews[sparse.values.bufferView].byteOffset;
   const positions=bin+doc.bufferViews[shape.bufferView].byteOffset;
   let previous=-1,moving=0;
   for(let i=0;i<sparse.count;i++){
    const index=buffer.readUInt16LE(indexOffset+2*i);
    assert(index>previous&&index<shape.count);
    previous=index;
    const y=buffer.readFloatLE(positions+12*index+4);
    const dx=buffer.readFloatLE(deltaOffset+12*i);
    assert(Number.isFinite(dx)&&dx>=0&&dx<.036);
    if(dx>.001){assert(y<-.075);moving++;}
   }
   assert(moving>0&&moving<shape.count/3);
  }
  for(const image of doc.images)assert(doc.bufferViews[image.bufferView]?.byteLength>0&&!image.uri);
  for(const name of ['skin','eyelashes01']){
   const mesh=doc.meshes[doc.nodes.find(node=>node.name===name).mesh],primitive=mesh.primitives[0];
   assert.equal(mesh.extras.targetNames[0],'blink');
   const morph=doc.accessors[primitive.targets[0].POSITION];
   assert.equal(morph.count,doc.accessors[primitive.attributes.POSITION].count);
   assert(morph.min[1]<-.001);
  }
 });
}

test('the piped blouse collar meets the neckline around both shoulders and the nape',()=>{
 const [body,left,,,right]=sewnJacket(T,geo=>geo,true);
 const points=geo=>geo.attributes.position;
 const upper=points(body),neck=[];
 for(let i=0;i<=body.parameters.widthSegments;i++)neck.push(new T.Vector3().fromBufferAttribute(upper,i));
 for(const leaf of [left,right]){
  const p=points(leaf),width=leaf.parameters.widthSegments;
  for(let i=p.count-width-1;i<p.count;i++){
   const rim=new T.Vector3().fromBufferAttribute(p,i);
   const nearest=Math.min(...neck.map(point=>point.distanceTo(rim)));
   assert(nearest<.003,`separated collar edge: ${nearest} metres`);
  }
 }
});
