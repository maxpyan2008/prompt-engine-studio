import {ageHeight} from './age-proportions.js';
import * as THREE from './vendor/three.module.js';
// Describe geometry and explicit relationships only. Narrative remains the artist's input.
export function sceneSetup(state){
 const words=['No people','One person','Two people','Three people','Four people'];
 const lines=[],assigned=new Set();
 for(const p of state.props){
  const matrix=new THREE.Matrix4().compose(new THREE.Vector3(p.x,p.y,p.z),new THREE.Quaternion().setFromEuler(new THREE.Euler((p.rx||0)*Math.PI/180,(p.yaw||0)*Math.PI/180,(p.rz||0)*Math.PI/180)),new THREE.Vector3().setScalar(p.scale||1)).invert();
  const seated=state.actors.filter(a=>{if(a.pose!=='seated'||a.parentProp!==p.id)return false;const v=new THREE.Vector3(a.x,a.y,a.z).applyMatrix4(matrix);return Math.abs(v.x)<(p.type==='sofa'?1.2:p.type==='car'?.8:.4)&&Math.abs(v.z)<(p.type==='car'?1.2:.55)&&Math.abs(v.y-(p.type==='car'?.13:0))<.35;});
  if(seated.length){seated.forEach(a=>assigned.add(a.id));lines.push(`${words[seated.length]} seated ${p.type==='car'?'inside one car':p.type==='sofa'?'on one sofa':'on a chair'} (Character${seated.length>1?'s':''} ${seated.map(a=>a.id).join(' and ')}).`);}
 }
 for(const pose of ['standing','seated','walking','running']){const actors=state.actors.filter(a=>!assigned.has(a.id)&&a.pose===pose);if(actors.length)lines.push(`${words[actors.length]} ${pose} (Character${actors.length>1?'s':''} ${actors.map(a=>a.id).join(' and ')}).`);}
 const counts={};for(const p of state.props)counts[p.type]=(counts[p.type]||0)+1;
 if(state.props.length)lines.push('Objects present: '+Object.entries(counts).map(([type,count])=>count+' '+type+(count>1?'s':'')).join(', ')+'.');
 return lines.join(' ');
}
export function scaleDescription(object,isActor){const scale=object.scale||1;if(Math.abs(scale-1)<.005)return isActor?`Standing reference height: ${Math.round(ageHeight(object.age)*100)} cm.`:'';return `${isActor?'Character':'Object'} scale: ${Number(scale.toFixed(2))}× normal size${isActor?`; standing-equivalent height ${Number((ageHeight(object.age)*scale).toFixed(2))} m`:''}${isActor&&scale>=2?'; intentionally giant':''}. Preserve this intentional relative size in the scene; do not normalize it.`;}
