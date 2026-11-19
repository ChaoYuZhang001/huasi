import {mountainField,MOUNTAIN_PROFILES} from './landscape-field.js';

// Sample each shared tile boundary once. The main thread keeps ownership of
// Three.js objects while this worker prepares the continuous elevation field.
for(const id of ['wudang','huashan','emei','kongtong','kunlun','ming','escort']){
 const field=mountainField(id),step=MOUNTAIN_PROFILES[id].grid||8,width=1280/step+1;
 const data=new Float32Array(width*width*4);
 for(let j=0;j<width;j++)for(let i=0;i<width;i++){
  const x=i*step-640,z=j*step-640,k=(j*width+i)*4;
  data[k]=field.height(x,z);data.set(field.normal(x,z),k+1);
 }
 self.postMessage({id,width,step,data,trees:field.trees()},[data.buffer]);
}
self.close();
