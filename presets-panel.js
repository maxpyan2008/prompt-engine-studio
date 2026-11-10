import {builtInPresets,buildPreset} from './presets.js';
const PRESET_KEY='shot.presets.v1';
const $=id=>document.getElementById(id);
export function mountPresets(api){
 const {restoreState,hydrate,update,persistNow,toast,sessionData}=api;
let presets=[];try{const data=JSON.parse(localStorage.getItem(PRESET_KEY)||'[]');if(Array.isArray(data))presets=data.filter(p=>p&&typeof p.name==='string'&&typeof p.id==='string'&&p.data); }catch{}
function writePresets(next){try{localStorage.setItem(PRESET_KEY,JSON.stringify(next));presets=next;renderPresets();return true;}catch{toast('تعذّر حفظ البريست؛ جرّب إفراغ مساحة المتصفح');return false;}}
function renderPresets(){const list=$('presetList');list.replaceChildren();for(const preset of presets){const row=document.createElement('div');row.className='custom-preset';const button=document.createElement('button');button.className='preset-card';button.dataset.savedPreset=preset.id;button.setAttribute('aria-label',preset.name);const img=document.createElement('img');img.alt='';img.width=320;img.height=180;if(preset.thumbnail)img.src=preset.thumbnail;button.append(img);button.onclick=()=>{try{const previousStyle=api.state.imageStyle,previousLive=api.state.livePrompt;api.state=restoreState(preset.data.state);const presetStyle=api.state.imageStyle;api.state.imageStyle=previousStyle;api.state.livePrompt=previousLive;api.state.activeTab='scene';api.state.selectionActive=false;api.customPrompt=presetStyle===previousStyle&&typeof preset.data.prompt==='string'?preset.data.prompt:null;api.promptBaseline='';hydrate();update();persistNow();toast('تم تحميل البريست');}catch{toast('تعذّر تحميل البريست');}};const remove=document.createElement('button');remove.className='preset-remove';remove.textContent='−';remove.dataset.deletePreset=preset.id;remove.setAttribute('aria-label','حذف البريست');remove.onclick=()=>writePresets(presets.filter(p=>p.id!==preset.id));row.append(button,remove);list.append(row);}}

$('savePreset').onclick=()=>{try{if(!api.studio||api.studio.contextLost)throw new Error();persistNow();const thumbnail=api.studio.capturePreset(api.state);if(!thumbnail)throw new Error();if(writePresets([...presets,{id:crypto.randomUUID(),name:'بريست '+(presets.length+1),thumbnail,data:structuredClone(sessionData())}]))toast('تم حفظ البريست');}catch{toast('تعذّر حفظ صورة البريست');}};
async function migratePresetPictures(){if(!api.studio)return;let changed=false;for(const p of presets){if(p.thumbnail)continue;await new Promise(r=>requestAnimationFrame(r));try{p.thumbnail=api.studio.capturePreset(restoreState(p.data.state));changed=Boolean(p.thumbnail)||changed;}catch{}}if(changed)writePresets(presets);}

 return {renderPresets,migratePresetPictures};
}
