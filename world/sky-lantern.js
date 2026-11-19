export const FLIGHT_SECONDS=42;
export const RELEASE_GAP_MS=2500;

export function readSkyRelease(message){
 const {p,seed}=message||{};
 if(!Array.isArray(p)||p.length!==3||!p.every(Number.isFinite)||
    Math.abs(p[0])>10||p[1]<3||p[1]>13||p[2]<-78||p[2]>-58||
    !Number.isInteger(seed)||seed<0||seed>65535)return null;
 return {p:[...p],seed};
}

export function nearRelease(pose,release){
 if(!pose||!release)return false;
 const [x,y,z]=pose,[ox,oy,oz]=release.p;
 return z<-60&&Math.hypot(x,y+1.4-4.4,z+67.6)<=10&&Math.hypot(x-ox,y+1.5-oy,z-oz)<2.5;
}

export function flightAt(release,seconds){
 const time=Math.max(0,Math.min(seconds,FLIGHT_SECONDS)),phase=release.seed/65536*Math.PI*2;
 const [x,y,z]=release.p,ramp=Math.min(4,time);
 return {x:x+.35*time+.8*(Math.sin(time*.31+phase)-Math.sin(phase)),
  y:y+.5*time+.0875*ramp*ramp+.7*Math.max(0,time-4),
  z:z-.5*time+.6*(Math.cos(time*.29+phase)-Math.cos(phase)),
  yaw:phase+.2*time,tilt:.06*Math.sin(time*.9+phase),scale:Math.min(1,(FLIGHT_SECONDS-time)/4)};
}
