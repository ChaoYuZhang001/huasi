import {timberBetween} from './joinery.js';

function turned(b,points,x,y,z,material){
 const {THREE:T}=b;
 b.G(new T.LatheGeometry(points.map(([r,h])=>new T.Vector2(r,h)),28),material,x,y,z);
}

export function teaService(b){
 const {THREE:T,M,B,C,G,S}=b;
 B(1.42,.055,.76,0,0,0,M.woodDark,false);
 for(const sign of [-1,1]){
  B(1.42,.045,.035,0,.055,sign*.36,M.wood,false);
  B(.035,.045,.71,sign*.69,.055,0,M.wood,false);
 }
 const potX=-.28,foot=.055;
 turned(b,[[.01,0],[.15,0],[.19,.035],[.24,.13],[.225,.25],[.13,.30],[.14,.32],[.11,.34],[.006,.34]],potX,foot,-.05,M.clay);
 S(.045,potX,foot+.363,-.05,M.clay,1,.72,1,16,8);
 const handle=new T.TorusGeometry(.125,.026,8,24);handle.scale(1,.94,1);
 G(handle,M.clay,potX-.215,foot+.19,-.05);
 const spout=new T.LatheGeometry([[.079,0],[.075,.055],[.048,.13],[.048,.22],[.036,.22],[.032,.18]].map(([r,h])=>new T.Vector2(r,h)),18);
 spout.rotateZ(-.84);G(spout,M.clay,potX+.18,foot+.13,-.05);
 for(const [x,z] of [[.22,.17],[.46,-.10]]){
  turned(b,[[.001,0],[.065,0],[.078,.024],[.119,.11],[.122,.14],[.108,.14],[.099,.105],[.055,.022],[.001,.022]],x,foot,z,M.jade);
  C(.10,.10,.004,x,foot+.104,z,M.bronze,false,18);
 }
}

export function writingDesk(b,title,columns,{map=false}={}){
 const {THREE:T,M,B,C,G}=b;
 // A mounted scroll lies flat between horizontal rollers. Characters follow the scroll.
 const canvas=document.createElement('canvas');canvas.width=896;canvas.height=448;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#d9c699';ctx.fillRect(0,0,896,448);
 ctx.strokeStyle='#8b714d';ctx.lineWidth=3;ctx.strokeRect(25,19,846,410);
 ctx.fillStyle='#46372d';ctx.textAlign='center';
 function vertical(str,x,y,size){ctx.font=size+'px serif';[...str].forEach((ch,i)=>ctx.fillText(ch,x,y+i*(size+3)));}
 vertical(title,801,73,38);
 if(map){
  ctx.lineWidth=3;ctx.strokeStyle='#76674d';
  for(let i=0;i<3;i++){ctx.beginPath();for(let j=0;j<=85;j++){const x=65+7*j,y=254-i*58+Math.sin(j*.16+i)*28+Math.cos(j*.33+i)*18;j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
  ctx.setLineDash([10,6]);ctx.strokeStyle='#9b493a';ctx.beginPath();ctx.moveTo(124,335);ctx.bezierCurveTo(270,335,312,109,420,180);ctx.quadraticCurveTo(508,213,611,88);ctx.stroke();ctx.setLineDash([]);
  ctx.font='23px serif';ctx.fillText('玉泉',117,371);ctx.fillText('崖台',636,76);
 }else columns.forEach((line,i)=>vertical(line,677-i*95,69,26));
 ctx.fillStyle='#99533d';ctx.fillRect(64,331,47,48);ctx.fillStyle='#e7ce9e';ctx.font='29px serif';ctx.fillText('記',88,366);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
 const face=new T.MeshStandardMaterial({map:texture,roughness:.97});
 const paper=new T.PlaneGeometry(1.64,.81);paper.rotateX(-Math.PI/2);G(paper,face,0,.021,.03);
 B(1.65,.018,.82,0,0,.03,M.sack,false);
 for(const side of [-1,1]){
  const roller=new T.CylinderGeometry(.045,.045,.97,16);roller.rotateX(Math.PI/2);G(roller,M.wood,side*.845,.043,.03);
 }
 B(.34,.055,.27,1.24,0,-.14,M.ink,false);C(.094,.088,.012,1.24,.055,-.14,M.dark,false,18);
 timberBetween(b,[.98,.021,.29],[1.48,.021,.21],.026,.026,M.bamboo);
 for(let i=0;i<3;i++){
  B(.61,.045,.38,-1.25,i*.06,-.09,M.drum,false);
  B(.62,.014,.39,-1.25,i*.06+.045,-.09,M.robe,false);
 }
}

// Fitted beds with end frames, linen and a travel chest beside the foot of the bed.
export function guestBerth(b,s){
 const {THREE:T,M,B,S,G}=b,cx=s*2.61,z=-1.57;
 for(const dx of [-1.17,1.17])for(const dz of [-.55,.55])B(.12,.51,.12,cx+dx,0,z+dz,M.woodDark);
 B(2.56,.13,1.27,cx,.38,z,M.woodDark);
 B(2.46,.09,1.21,cx,.51,z,M.sack,false);
 B(.10,.68,1.30,cx+s*1.23,0,z,M.woodDark);
 S(.34,cx+s*.9,.65,z,M.drum,.7,.36,1.47,16,10);
 // A rolled coverlet lies across the foot, held by two woven bands.
 const rollX=cx-s*.84;
 const roll=new T.CylinderGeometry(.18,.18,1.12,24);roll.scale(1,.98,.81);roll.rotateX(Math.PI/2);
 G(roll,M.robe,rollX,.75,z);
 for(const dz of [-.37,.37]){
  const band=new T.CylinderGeometry(.187,.187,.046,24);band.scale(1,1,.81);band.rotateX(Math.PI/2);
  G(band,M.sack,rollX,.75,z+dz);
 }
 const foot=cx-s*1.23;
 B(.11,.75,.10,foot,0,z-.59,M.woodDark);B(.11,.75,.10,foot,0,z+.59,M.woodDark);
 B(.11,.095,1.27,foot,.69,z,M.wood);
 const chestX=cx+s*.21,chestZ=z+1.22;
 B(.96,.46,.53,chestX,0,chestZ,M.wood);B(1,.09,.56,chestX,.46,chestZ,M.woodDark);
 for(const x of [-.32,.32])B(.05,.48,.02,chestX+x,.035,chestZ+.274,M.bronze,false);
 B(.10,.12,.025,chestX,.37,chestZ+.28,M.bronze,false);
}
