// A damped, fractional-delay plucked string. The same seed makes replay stable.
// This is a synthesized teaching sound, not a recording of a historical guqin.
export function pluckSamples(rate,frequency,duration=3){
 if(!Number.isFinite(rate)||rate<8000||rate>192000||!Number.isFinite(frequency)||frequency<80||frequency>1000||!Number.isFinite(duration)||duration<=0||duration>6)throw new RangeError('Invalid string voice');
 const delay=rate/frequency-.5,n=Math.ceil(delay)+2,ring=new Float32Array(n),out=new Float32Array(Math.ceil(rate*duration));
 let seed=71,mean=0;for(let i=0;i<n;i++){seed=Math.imul(seed,1664525)+1013904223|0;ring[i]=(seed>>>0)/4294967296*2-1;mean+=ring[i];}mean/=n;for(let i=0;i<n;i++)ring[i]-=mean;
 let at=0,last=0,dc=0;const damping=Math.pow(.9982,44100/rate);
 for(let i=0;i<out.length;i++){let pos=(at-delay+n)%n;const j=Math.floor(pos),u=pos-j,v=ring[j]*(1-u)+ring[(j+1)%n]*u;
  ring[at]=(v+last)*.5*damping;last=v;at=(at+1)%n;dc+=(v-dc)*.002;
  const envelope=Math.min(1,i/(rate*.004))*Math.min(1,(out.length-i)/(rate*.08));out[i]=(v-dc)*envelope*.34;
 }return out;
}
const buffers=new WeakMap();
export function playQin(context,output,frequency){
 if(!context||!output)return()=>{};
 let cache=buffers.get(context);if(!cache){cache=new Map();buffers.set(context,cache);}
 let buffer=cache.get(frequency);if(!buffer){const samples=pluckSamples(context.sampleRate,frequency);buffer=context.createBuffer(1,samples.length,context.sampleRate);buffer.copyToChannel(samples,0);if(cache.size>=7)cache.delete(cache.keys().next().value);cache.set(frequency,buffer);}
 const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;gain.gain.value=.65;source.connect(gain);gain.connect(output);
 let stopped=false;source.onended=()=>{source.disconnect();gain.disconnect();};source.start();
 return()=>{if(stopped)return;stopped=true;try{source.stop();}catch{};};
}
