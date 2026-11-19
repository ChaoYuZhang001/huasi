// Five independent observations, then return to the table to record the visit.
// Local learning progress never implies changes to another visitor's workshop.
export const WORKSHOP_IDS=['metal','wood','water','fire','earth'];
export function createWorkshopVisit(onComplete,saved){
 const seen=new Set(Array.isArray(saved?.seen)?saved.seen.filter(id=>WORKSHOP_IDS.includes(id)):[]);
 let awarded=seen.size===WORKSHOP_IDS.length&&saved?.awarded===true;
 return{
  observe(id){if(!WORKSHOP_IDS.includes(id))return false;seen.add(id);return true;},
  record(){if(seen.size!==WORKSHOP_IDS.length)return'missing';if(awarded)return'recorded';awarded=true;onComplete();return'complete';},
  get state(){return{seen:[...seen],count:seen.size,total:WORKSHOP_IDS.length,awarded};}
 };
}
