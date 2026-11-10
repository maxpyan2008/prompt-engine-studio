import {mountCameraInspector} from './camera-panel.js';
import {mountSceneInspector,vehicles} from './scene-panel.js';
import {syncCharacterInspector} from './character-panel.js';
import * as THREE from './vendor/three.module.js';
const $=id=>document.getElementById(id);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function mountRevision(api){
 document.body.classList.add('revision39');document.querySelector('header').prepend(document.querySelector('.brand'));
 const main=document.querySelector('main'),controls=document.querySelector('.controls'),workspace=document.querySelector('.workspace'),nav=document.querySelector('.tabs');
 const top=document.createElement('div');top.className='workspace-nav';document.querySelector('header').after(top);top.append(nav);nav.replaceChildren();
 for(const [id,label]of [['scene','المشهد'],['people','الشخصيات'],['objects','العناصر'],['camera','الكاميرا'],['lighting','الإضاءة'],['imageStyle','أسلوب الصورة'],['presets','البريستات']]){const b=document.createElement('button');b.dataset.tab=id;b.textContent=label;b.onclick=()=>{api.showTab(id);sync();};nav.append(b);}
 mountCameraInspector(api);
 mountSceneInspector(api);
 const prompt=$('promptSection');prompt.classList.add('prompt-dock');main.prepend(prompt);prompt.prepend($('promptInclusions'));prompt.append(document.querySelector('.prompt-actions'));prompt.prepend($('sceneReminder'));const title=document.createElement('h2');title.textContent='البرومبت · Prompt';prompt.prepend(title);
 const pro=document.createElement('button');pro.id='proPrompt';pro.textContent='Pro Prompt';pro.className='primary';prompt.querySelector('.prompt-actions').append(pro);
 const modal=document.createElement('dialog');modal.id='proPromptDialog';modal.innerHTML='<div class="pro-head"><h2>Pro Prompt</h2><button data-close aria-label="إغلاق">×</button></div><div id="proFields"></div>';document.body.append(modal);modal.querySelector('[data-close]').onclick=()=>modal.close();modal.onclick=e=>{if(e.target===modal)modal.close();};
 function field(holder,label,value,change){const row=document.createElement('label');row.className='field';const title=document.createElement('span');title.textContent=label;const input=document.createElement('textarea');input.value=value;input.rows=3;input.oninput=e=>change(e.target.value);row.append(title,input);holder.append(row);return input;}
 function sync(){const s=api.getState();
 const p=s.props.find(p=>p.id===s.selectedPropId);$('vehiclePicker').hidden=p?.type!=='car';$('vehicleSelected').textContent=p&&vehicles[p.vehicle]?vehicles[p.vehicle].join(' · '):'اختر المركبة والطراز';
 syncCharacterInspector(api);
 $('viewportLightControls').hidden=true;
 }
 api.showTab(safeTab(api.getState().activeTab));sync();return {sync,prepare:()=>{}};
}
function safeTab(id){return ['scene','people','objects','camera','lighting','imageStyle','presets'].includes(id)?id:'scene';}
