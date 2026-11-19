// A blunt wooden practice sword. Poses are authored for this game's figures,
// rather than a claim to reproduce a historical school's martial curriculum.
export function practiceSword(T){
 const root=new T.Group();root.name='practice:wooden-sword';root.position.set(0,-.335,.012);
 const wood=new T.MeshStandardMaterial({color:0xb49a70,roughness:.82}),grip=new T.MeshStandardMaterial({color:0x504638,roughness:1});
 function mesh(g,m,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;root.add(o);return o;}
 const p=[-.045,0,.08,0,.018,.08,.045,0,.08,0,-.018,.08,-.032,0,.65,0,.014,.65,.032,0,.65,0,-.014,.65,0,0,.75];
 const indices=[];for(let i=0;i<4;i++){const j=(i+1)%4;indices.push(i,j,i+4,j,j+4,i+4,i+4,j+4,8);}indices.push(0,2,1,0,3,2);
 let blade=new T.BufferGeometry();blade.setAttribute('position',new T.Float32BufferAttribute(p,3));blade.setIndex(indices);const flat=blade.toNonIndexed();blade.dispose();flat.computeVertexNormals();mesh(flat,wood);
 mesh(new T.BoxGeometry(.23,.045,.065),wood,0,0,.065);
 const handle=new T.CylinderGeometry(.027,.029,.2,10);handle.rotateX(Math.PI/2);mesh(handle,grip,0,0,-.065);
 mesh(new T.SphereGeometry(.033,8,6),wood,0,0,-.17);
 return root;
}

export function swordPose(f,phase,t){
 const u=Math.max(0,Math.min(1,t)),ease=v=>v*v*(3-2*v),q=ease(Math.min(1,u/.55));
 // Shoulder and elbow pitch raise the blade; the wrist keeps the thrust level.
 let shoulder,elbow,wrist,left,waist,lean;
 if(phase===0){shoulder=-.3-.5*q;elbow=-.2-.7*q;wrist=-.05*q;left=-.3-.65*q;waist=.08*q;lean=0;}
 else if(phase===1){shoulder=-.8-.65*q;elbow=-.9+.75*q;wrist=-.05+1.65*q;left=-.95+.4*q;waist=.08-.19*q;lean=.055*q;}
 else{shoulder=-1.45+1.15*q;elbow=-.15-.05*q;wrist=1.6*(1-q);left=-.55+.25*q;waist=-.11*(1-q);lean=.055*(1-q);}
 f.upper.rotation.set(lean,waist,0);f.armR.rotation.set(shoulder,0,-.1);f.elbR.rotation.set(elbow,0,0);
 f.armL.rotation.set(left,0,.3);f.elbL.rotation.set(-.8,0,0);f.head.rotation.y=waist*.45;
 if(f.practiceSword){f.practiceSword.visible=true;f.practiceSword.rotation.set(wrist,0,0);}
}

export function releaseSword(f){
 const sword=f?.practiceSword;if(!sword)return;
 const resources=new Set();sword.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material);});
 sword.removeFromParent();for(const r of resources)r.dispose();f.practiceSword=null;
}
