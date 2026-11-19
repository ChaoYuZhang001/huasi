import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

for(const [sex,style] of [['male','short01'],['female','ponytail01']]){
 test(sex+' portrait embeds its textures, fitted pieces and eyelid morphs',()=>{
  const buffer=readFileSync(new URL('../characters/visitor-'+sex+'.glb',import.meta.url));
  assert.equal(buffer.toString('ascii',0,4),'glTF');
  assert.equal(buffer.readUInt32LE(8),buffer.length);
  assert(buffer.length<1.25*1024*1024);
  const doc=JSON.parse(buffer.toString('utf8',20,20+buffer.readUInt32LE(12)));
  assert.deepEqual(doc.nodes.map(node=>node.name),['skin','eyes',style,'eyebrow009','eyelashes01']);
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
