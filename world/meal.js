// A short embodied help-at-the-stove activity. Timers pause when its region sleeps.
const stages=['water','rice','stir','serve','done'];
export function createMeal(onComplete,saved){
 let stage=stages.includes(saved?.stage)?saved.stage:'water';
 let remaining=stage==='stir'&&Number.isFinite(saved?.remaining)?Math.max(0,Math.min(8,saved.remaining)):0;
 let stirring=stage==='stir'&&saved?.stirring===true&&remaining>0;
 if(stage==='stir'&&saved?.stirring===true&&remaining===0)stage='serve';
 return{
  act(action){
   if(action!==stage||stirring||stage==='done')return false;
   if(stage==='water')stage='rice';
   else if(stage==='rice')stage='stir';
   else if(stage==='stir'){stirring=true;remaining=8;}
   else {stage='done';onComplete();}
   return true;
  },
  tick(dt){if(!stirring||!Number.isFinite(dt)||dt<0)return;remaining=Math.max(0,remaining-Math.min(dt,.25));if(remaining===0){stirring=false;stage='serve';}},
  get state(){return{stage,remaining,stirring};}
 };
}
