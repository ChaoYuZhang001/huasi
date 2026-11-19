// A spatial observation activity: take three different young shoots, then spread.
export const SHOOTS=['east','middle','west'];
export function createTeaGarden(onComplete,saved){
 const picked=new Set(Array.isArray(saved?.picked)?saved.picked.filter(id=>SHOOTS.includes(id)):[]);
 let spread=picked.size===3&&saved?.spread===true;
 return{
  pick(id){if(!SHOOTS.includes(id))return'old';if(spread||picked.has(id))return'picked';picked.add(id);return picked.size===3?'ready':'fresh';},
  spread(){if(picked.size<3)return'missing';if(spread)return'done';spread=true;onComplete();return'complete';},
  get state(){return{picked:[...picked],spread,count:picked.size,stage:spread?'done':picked.size===3?'spread':'pick'};}
 };
}
