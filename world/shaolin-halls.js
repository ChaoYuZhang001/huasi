// The image pedestal, incense table and meditation seats use the original
// liturgical axis. The surrounding timber frame has its own bay spacing.
export function buildBuddhaHall({M,at,B,C,col,roof,stairs,plaque,plight}){
 at(0,1.5,-7);
 const floor=.85;
 B(26.6,.68,15,0,0,0,M.ashlar);B(26.8,.17,15.2,0,.68,0,M.marble);
 stairs(0,7.6,10,0,floor);
 for(const end of [-1,1]){
  // Low stone balustrades leave a generous landing in front of the three doors.
  for(const x of [-12.8,-9.4,-6.2,6.2,9.4,12.8]){
   B(.31,.76,.31,x,floor,end*7.13,M.ashlar);
   C(.19,.21,.13,x,floor+.76,end*7.13,M.marble,false,8);
  }
  for(const x of [-9.5,9.5])B(6.7,.29,.18,x,floor+.32,end*7.13,M.marble);
 }
 const posts=[-11.5,-7.1,-2.5,2.5,7.1,11.5];
 for(const z of [-5.7,5.7]){
  for(const x of posts){
   C(.36,.43,.28,x,floor,z,M.marble);C(.24,.3,4.7,x,floor+.28,z,M.wood);
   // Stacked transverse bracket arms carry the projecting eaves.
   B(.72,.22,.68,x,5.5,z,M.woodDark,false);
   B(.45,.22,1.38,x,5.72,z,M.wood,false);
   B(1.54,.22,.46,x,5.94,z,M.woodDark,false);
  }
  B(24.6,.35,.43,0,6.16,z,M.woodDark);
 }
 for(const x of [-11.6,11.6]){
  B(.46,5.42,10.2,x,floor,-.65,M.red);
  B(.6,.53,10.3,x,floor,-.65,M.ashlar);
 }
 B(23.2,5.45,.42,0,floor,-5.6,M.red);
 for(let i=0;i<posts.length-1;i++){
  const w=posts[i+1]-posts[i],x=(posts[i+1]+posts[i])/2;
  B(w,1.26,.33,x,4.86,3.55,M.red);
  if(i===0||i===4){
   B(w,1.13,.36,x,floor,3.55,M.red);
   B(w,2.88,.16,x,1.98,3.55,M.lattice);
  }else{
   // Recessed, folded timber leaves preserve all three openings.
   for(const side of [-1,1]){
    const leafX=x+side*(w/2-.24);
    B(.2,3.95,1.42,leafX,floor,2.94,M.woodDark);
    B(.24,1.66,1.15,leafX,2.5,2.94,M.lattice,false);
   }
  }
 }
 roof(29,18.9,2.05,.63,0,6.52,0,[10.45,4.65]);
 for(const side of [-1,1]){
  B(21,2.12,.3,0,6.51,side*4.55,M.red);
  B(.32,2.12,8.8,side*10.4,6.51,0,M.red);
  for(const x of [-8.4,-5.6,5.6,8.4])
   B(2.3,.86,.16,x,7.19,side*4.75,M.lattice,false);
 }
 B(22.2,.38,10,0,8.63,0,M.woodDark);
 roof(25.6,13.8,4.1,.73,0,9.01,0);
 plaque('大雄宝殿',0,7.7,4.83,{h:1.24,bg:'#242723',fg:'#e9cb7b'});
 plaque('佛光普照',0,5.48,3.78,{h:.72,bg:'#4a231d'});
 for(const side of [-1,1])
  plaque(side<0?'松风入座':'钟声满山',side*2.5,3.22,6.04,{vertical:true,h:2.65,bg:'#252520',fg:'#e6c477'});
 // Stone altar and plain red rear wall keep the seated Buddha and its halo visible.
 B(10.5,.88,2.7,0,floor,-4.05,M.ashlar);
 B(10.66,.22,2.86,0,floor+.88,-4.05,M.marble);
 B(3.8,.15,1.12,0,floor+.85,-1.6,M.woodDark);
 for(const x of [-1.55,1.55])for(const z of [-1.98,-1.22])B(.18,.85,.18,x,floor,z,M.wood);
 col(3.8,1,1.12,0,floor,-1.6);
 C(.32,.24,.35,0,floor+1,-1.6,M.bronze,false,12);
 plight(0,4.8,-1.4,0xffc27b,64,20);
}

// A two-storey sutra storehouse stands on the upper terrace. A low cloister and
// shuttered upper windows distinguish it from the open worship hall across the court.
export function buildSutraLibrary({M,at,B,C,roof,stairs,plaque,plight}){
 at(0,3.5,-49);
 B(14,.45,10,0,0,0,M.ashlar);B(14.2,.15,10.2,0,.45,0,M.marble);
 stairs(0,5.1,3.8,0,.6);
 for(const side of [-1,1]){
  B(.32,3.65,7.4,side*5.95,.6,-.4,M.brick);
  B(4.55,1.04,.3,side*3.73,.6,3.2,M.brick);
  B(4.55,2.6,.18,side*3.73,1.64,3.2,M.lattice);
  for(const z of [-3.95,.1,4.05])C(.19,.22,3.82,side*6.35,.6,z,M.woodDark);
 }
 B(12.2,3.65,.32,0,.6,-4.04,M.brick);B(3,1.15,.32,0,3.1,3.2,M.brick);
 roof(15.8,11.8,1.48,.42,0,4.51,0);
 B(9.8,2.65,5.7,0,5.54,0,M.brick);
 for(const side of [-1,1])for(const x of [-3.4,-1.12,1.12,3.4])
  B(1.72,1.28,.18,x,6.48,side*2.91,M.lattice,false);
 B(10.4,.34,6.3,0,8.19,0,M.woodDark);
 roof(13,8.7,2.42,.55,0,8.53,0);
 B(3.3,.14,1.12,0,1.46,-3.06,M.woodDark);
 for(const x of [-1.4,1.4])for(const z of [-3.45,-2.67])B(.15,.86,.15,x,.6,z,M.woodDark);
 plaque('藏经阁',0,4,4.42,{h:.74,bg:'#282922',fg:'#dec18c'});
 plight(0,3.25,-1,0xffbf79,26,14);
}
