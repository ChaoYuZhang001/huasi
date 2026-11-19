import {meetingTable} from './precinct-kit.js';

// The table surface is 0.94 m above the hall floor.
function offeringTable(b,x,y,z,turn,width){
 const {B,C,S,M,THREE:T}=b;
 meetingTable(b,x,z,y,width,turn);b.at(x,y+.94,z,turn);
 for(const side of [-1,1]){
  const u=side*(width/2-.32);
  C(.12,.17,.055,u,0,0,M.bronze,false,16);
  C(.046,.073,.20,u,.055,0,M.bronze,false,12);
  C(.14,.052,.07,u,.255,0,M.bronze,false,16);
  C(.047,.052,.26,u,.32,0,M.red,false,14);
  S(.033,u,.61,0,M.glow,.68,1.38,.68,10,8);
 }
 const bowl=new T.LatheGeometry([[.065,0],[.10,.014],[.094,.055],[.19,.095],[.215,.175],
  [.222,.20],[.197,.205],[.182,.15],[.12,.10]].map(([r,h])=>new T.Vector2(r,h)),28);
 b.G(bowl,M.bronze,0,0,0);C(.18,.175,.025,0,.139,0,M.ashlar,false,24);
 for(const side of [-1,1]){
  const handle=new T.TorusGeometry(.065,.016,7,16);
  b.G(handle,M.bronze,side*.219,.155,0);
 }
 return b.point(0,.164,0);
}

// Each of these precincts has its own incense table and region save.
export function incenseOffering(b,a,id,label,x,y,z,turn,width){
 const {M,THREE:T}=b;
 const ash=offeringTable(b,x,y,z,turn,width);
 const incense=new T.Group();incense.name=id;incense.position.copy(ash);
 const stick=new T.CylinderGeometry(.011,.014,.31,8),ember=new T.SphereGeometry(.016,8,6);
 for(const i of [-1,0,1]){
  const stem=new T.Mesh(stick,M.woodDark);stem.position.set(i*.053,.15,i*.013);incense.add(stem);
  const tip=new T.Mesh(ember,M.glow);tip.position.copy(stem.position);tip.position.y+=.157;incense.add(tip);
 }
 const burnTime=180000,now=Date.now(),savedEnd=a.savedState?.incenseUntil;
 let incenseUntil=Number.isFinite(savedEnd)&&savedEnd>now?Math.min(savedEnd,now+burnTime):0;
 function burn(){
  const remaining=Math.max(0,(incenseUntil-Date.now())/burnTime);
  incense.visible=remaining>0;incense.scale.y=remaining;
 }
 burn();a.root.add(incense);
 a.on(id,ash,2.25,()=>incense.visible?null:label,()=>{
  incenseUntil=Date.now()+burnTime;burn();a.checkpoint();a.sound('light');a.message('三炷香立稳了，炉中亮起一点火星。');
 });
 return {tick(){if(incense.visible)burn();},snapshot(){return incenseUntil>Date.now()?{incenseUntil}:{};}};
}
