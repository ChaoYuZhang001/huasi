// This short listening exercise is authored for the game, not a historical score.
export const QIN_NOTES=[130.8128,146.8324,174.6141,195.9977,220,261.6256,293.6648];
export const QIN_PHRASE=[0,3,6,3];
export function createQinLesson(onComplete,saved){
 const heard=new Set(Array.isArray(saved?.heard)?saved.heard.filter(n=>Number.isInteger(n)&&n>=0&&n<7):[]);
 const explored=()=>[0,3,6].every(n=>heard.has(n));
 let progress=explored()&&Number.isInteger(saved?.progress)&&saved.progress>=0&&saved.progress<=4?saved.progress:0;
 let complete=explored()&&progress===4&&saved?.complete===true;
 if(!complete&&progress===4)progress=0;
 return{
  pluck(n){if(!Number.isInteger(n)||n<0||n>=7)return'invalid';const wasReady=explored();heard.add(n);
   if(complete)return'free';if(!wasReady)return explored()?'ready':'heard';
   if(n!==QIN_PHRASE[progress]){progress=n===QIN_PHRASE[0]?1:0;return'again';}
   if(++progress===4){complete=true;onComplete();return'complete';}return'follow';
  },
  get state(){return{heard:[...heard],progress,complete,stage:complete?'free':explored()?'follow':'explore'};}
 };
}
