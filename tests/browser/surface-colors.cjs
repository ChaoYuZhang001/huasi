const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');

async function verify(){
 const browser=await chromium.launch({channel:'chrome'});
 try{
  for(const mobile of [false,true]){
   const page=await browser.newPage({hasTouch:mobile,viewport:mobile?{width:390,height:844}:{width:960,height:640}});
   await page.goto(process.env.GAME_URL||'http://127.0.0.1:8000');
   await page.waitForFunction(()=>window.__TEX&&__TEX.done+__TEX.failed.length===__TEX.total,null,{timeout:90000});
   const result=await page.evaluate(async resolution=>{
    const requests=performance.getEntriesByType('resource');
    const colors=requests.filter(entry=>entry.name.includes('/tex/'+resolution+'/')&&/\/color(?:-temple\.webp|\.jpg)$/.test(entry.name));
    const bytes=colors.reduce((total,entry)=>total+entry.encodedBodySize,0);
    const checks=[];
    for(const [name,saturation,gain,tint] of [
     ['granite_tile',.35,1.75,[1,1.01,1.03]],['granite_wall',.25,1.25,[1,1.01,1.04]],
     ['cliff_side',.12,1.3,[1,1.01,1.05]],['grey_roof_tiles',.3,.62,[.92,1,1]],['mossy_paving',.8,1,[1,1,1]]
    ]){
     const pixels=async file=>{
      const image=new Image();image.src='./tex/'+resolution+'/'+name+'/'+file;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
      const context=canvas.getContext('2d');context.drawImage(image,0,0);
      return {width:image.width,height:image.height,data:context.getImageData(0,0,image.width,image.height).data};
     };
     const source=await pixels('color.jpg'),baked=await pixels('color-temple.webp');
     if(source.width!==baked.width||source.height!==baked.height)throw Error(name+' resized');
     let squared=0,outliers=0;
     for(let offset=0;offset<source.data.length;offset+=4){
      const luma=.3*source.data[offset]+.59*source.data[offset+1]+.11*source.data[offset+2];
      for(let channel=0;channel<3;channel++){
       const expected=Math.round(Math.max(0,Math.min(255,(luma+(source.data[offset+channel]-luma)*saturation)*gain*tint[channel])));
       const error=Math.abs(baked.data[offset+channel]-expected);squared+=error*error;if(error>6)outliers++;
      }
     }
     const count=source.width*source.height*3;
     checks.push({name,rms:Math.sqrt(squared/count),outliers:outliers/count});
    }
    return {checks,bytes,files:colors.map(entry=>entry.name),failed:__TEX.failed};
   },mobile?'512':'1k');
   assert.deepEqual(result.failed,[]);assert.equal(result.files.length,6);
   assert.equal(result.files.filter(url=>url.endsWith('color-temple.webp')).length,5);
   assert.ok(result.files.some(url=>url.endsWith('/knotted_pine_bark/color.jpg')));
   for(const check of result.checks)assert.ok(check.rms<=2.1&&check.outliers<=.011,JSON.stringify(check));
   console.log(mobile?'Touch':'Desktop',result.bytes,'color bytes; max RGB RMS',Math.max(...result.checks.map(check=>check.rms)).toFixed(2));
   await page.close();
  }
 }finally{await browser.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
