export function buildShaolinGate({THREE,M,at,B,C,G,ix,col,roof,plaque,stairs}){
 at(0,0,40);
 B(14.4,.20,7.2,0,0,0,M.ashlar);B(14.6,.10,7.4,0,.20,0,M.marble);
 stairs(0,3.7,8.2,0,.30);
 const bay=(center,width,depth,opening,spring,crown)=>{
  const half=width/2,radius=opening/2,thick=.46;
  const face=new THREE.Shape();face.moveTo(-half,0);face.lineTo(-radius,0);face.lineTo(-radius,spring);
  face.absarc(0,spring,radius,Math.PI,0,true);face.lineTo(radius,0);face.lineTo(half,0);
  face.lineTo(half,crown);face.lineTo(-half,crown);face.closePath();
  for(const side of [-1,1]){
   const front=side>0?depth/2-thick:-depth/2;
   G(ix(new THREE.ExtrudeGeometry(face,{depth:thick,bevelEnabled:false,curveSegments:18})),M.red,center,.3,front);
   const trim=new THREE.RingGeometry(radius,radius+.14,36,1,0,Math.PI);
   if(side<0)trim.rotateY(Math.PI);
   G(trim,M.ashlar,center,.3+spring,side*(depth/2+.012));
   for(const hand of [-1,1]){
    B(.14,spring,.09,center+hand*(radius+.07),.3,side*depth/2,M.ashlar,false);
    col(half-radius,crown,thick,center+hand*(half+radius)/2,.3,front+thick/2);
   }
   col(opening,crown-spring-radius,thick,center,.3+spring+radius,front+thick/2);
  }
  for(const side of [-1,1]){
   B(.3,crown,depth-.92,center+side*(half-.15),.3,0,M.red);
   B(.10,spring+.12,opening*.42,center+side*(radius-.08),.30,depth/2-.6-opening*.21,M.woodDark);
  }
  B(width+.3,.22,depth+.22,center,.3+crown,0,M.woodDark,false);
 };
 bay(0,7.8,6.3,4.72,2.15,4.85);
 for(const side of [-1,1]){
  bay(side*5.5,3.2,4.25,1.7,1.78,3.16);
  roof(4.3,5.3,1.2,.42,side*5.6,3.67,0);
 }
 roof(10.4,8.4,2.8,.76,0,5.37,0);
 plaque('少林寺',0,4.65,3.22,{h:.9,bg:'#161813',fg:'#e8c979',side:0x423928});
 for(const side of [-1,1]){C(.21,.26,.24,side*3.22,.3,3.42,M.ashlar);C(.16,.19,4.6,side*3.22,.54,3.42,M.wood,true,12);}
}
