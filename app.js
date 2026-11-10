import {mount62} from './interface62.js';
import {mount61} from './interface61.js';
import {mount67} from './interface67.js';
import {mount65} from './interface65.js';
import {mountTheme60} from './theme60.js';
import {mount58} from './upgrade58.js';
import {mount57} from './upgrade57.js';
import {mount54} from './upgrade54.js';
import {mount53} from './upgrade53.js';
import {mount52} from './upgrade52.js';
import {mount48} from './upgrade48.js';
import {mountUpgrade44} from './upgrade44.js';
import {mountQuickPopovers} from './quick-popovers.js';
import {mountQuickCamera} from './quick-camera.js';
import {mountQuickLighting} from './quick-lighting.js';
import {mountQuickPresets} from './quick-presets.js';
import {mountQuickImageStyle} from './quick-image-style.js';
import {mountSettings} from './settings-panel.js';
import {panelIcon,word} from './panel-ui.js';
import {buildStructuredPrompt,mountPromptMode,createBasePrompt} from './prompt-panel.js';
import {mountCamera} from './camera-panel.js';
import {mountCharacters} from './character-panel.js';
import {mountScene} from './scene-panel.js';
import {mountPresets} from './presets-panel.js';
// Lighting loads independently: a malformed experimental replacement cannot stop other fields.
let lightingModule;
try{lightingModule=await import('./lighting-panel.js?revision='+Date.now());}catch(error){console.error('Lighting module could not load',error);}
const lightingUnavailable=!lightingModule;
const mountLighting=lightingModule?.mountLighting||((api)=>{const panel=document.createElement('div');panel.id='lighting';panel.className='tab-panel';panel.hidden=true;panel.innerHTML='<h2>Lighting</h2><p></p>';document.querySelector('.controls').append(panel);const ensure=()=>{api.getState().lighting??={hour:12};};return {prepare:ensure,sync(){ensure();panel.querySelector('p').textContent=api.getUILanguage()==='en'?'Lighting could not load. Restore the previous lighting-panel.js file and refresh.':'تعذّر تحميل الإضاءة. أعد ملف lighting-panel.js السابق وحدّث الصفحة.';}};});
const lightingDescription=lightingModule?.lightingDescription||(()=> 'Lighting module unavailable.');
const weatherDescription=lightingModule?.weatherDescription||(()=> 'Weather module unavailable.');
import {mountEdition} from './scene-panel.js';
import {vehicleDimensions} from './vehicle-model.js';
import {sceneSetup,scaleDescription} from './scene-description.js';
import {mountRefinement} from './interface-shell.js';
import {mountRevision} from './workspace-bootstrap.js';
import {imageStyles,validImageStyle,mountImageStyles} from './image-style-panel.js';
import {mountWorkspace,decorateLightChoices} from './workspace-layout.js';
import {profileIcon,profileFromActor,applyProfile,mountProfileEditor,headDirectionText,magneticRotationDegrees} from './character-panel.js';
import {humanStates,applyHumanState,humanStateActive,humanPoseText} from './human-states.js';
import * as THREE from './vendor/three.module.js';
import {builtInPresets,buildPreset} from './presets.js';
import {Studio} from './studio.js';
import {ageHeight} from './age-proportions.js';
import {tr,localize,setUILanguage,getUILanguage,originalText} from './i18n.js';
const $=id=>document.getElementById(id);
mountWorkspace();
const shots=[['ews','واسعة جدًا','EWS',7,1],['ws','واسعة','WS',2.7,1],['american','أمريكية','MLS',1.45,1.13],['ms','متوسطة','MS',1.04,1.38],['mcu','متوسطة قريبة','MCU',.68,1.52],['cu','قريبة','CU',.40,1.67],['ecu','قريبة جدًا','ECU',.15,1.71],['ots','فوق الكتف','OTS',1.08,1.38],['pov','وجهة نظر','POV',1.3,1.1],['two','ثنائية','2-SHOT',2.4,1.12],['rear','من الخلف','REAR',1.08,1.38],['insert','تفصيلية','INSERT',.38,1.02]];
const palette=[{color:'#de7067',ar:'الأحمر',en:'red'},{color:'#6ca9e5',ar:'الأزرق',en:'blue'},{color:'#7abf94',ar:'الأخضر',en:'green'},{color:'#d9b665',ar:'الأصفر',en:'yellow'}];
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));const normalizeYaw=v=>((v%360)+360)%360;const wrapDegrees=v=>((v+180)%360+360)%360-180;
function newActor(id){return {id,scale:1,color:palette[id-1].color,name:'',description:'',action:'',pose:'standing',x:0,y:0,z:0,rx:0,yaw:0,rz:0,headYaw:0,headPitch:0,headRoll:0};}
function freshState(){return {shot:'american',lens:35,distance:2.65,angle:'eye',sceneYaw:0,scenePitch:0,tool:'move',focus:'deep',aperture:8,time:'day',source:'sun',lightAngle:225,lightElevation:35,power:2.5,warmth:5500,soft:'hard',style:'cinematic',imageStyle:'neutral',livePrompt:true,promptIncludes:{appearance:true,actions:true,setting:true,notes:true},environment:'exterior',ratio:'16:9',action:'',setting:'',notes:'',props:[],presetKey:null,actors:[newActor(1)],selectedId:1,selectedPropId:null,selectedPart:'body',grid:true,building:true,floor:true,activeTab:'scene',target:{x:0,y:1.13,z:0}};}
const STORAGE_KEY='shot.studio.v1',PRESET_KEY='shot.presets.v1';
const lang='en';
let state=freshState(),studio=null,drag=null,lightDrag=false,restored=false,storageOK=true,customPrompt=null,promptBaseline='',generatedCamera='',generatedCharacters='',saveTimer,profilePreview=null;
const syncImageStyles=mountImageStyles($('imageStyle'),()=>state.imageStyle,id=>{state.imageStyle=id;update();},tr);
const arabicText=t=>/[\u0621-\u063a\u0641-\u064a\u066e-\u06d3\u06fa-\u06fc]/.test(t);
let translator=null,translatorTask=null,translationTimer,translating=false,translationError='';
const translations=new Map();try{const data=JSON.parse(localStorage.getItem('shot.translations.v1')||'[]');if(Array.isArray(data))for(const entry of data.slice(-150))if(Array.isArray(entry)&&entry.length===2&&typeof entry[0]==='string'&&typeof entry[1]==='string'&&!arabicText(entry[1]))translations.set(...entry);}catch{}
function promptState(){const copy=structuredClone(state),flags=state.promptIncludes;for(const a of copy.actors){if(!flags.appearance){a.name='';a.description='';}if(!flags.actions){a.action='';}}if(!flags.actions)copy.action='';if(!flags.setting)copy.setting='';if(!flags.notes)copy.notes='';if(!flags.appearance)for(const p of copy.props)p.description='';return copy;}
function authoredTexts(){const state=promptState();return [...state.actors.flatMap(a=>[a.name,a.description,a.action]),state.action,state.setting,state.notes,...state.props.map(p=>p.description||'')].filter(t=>t.trim());}
function englishText(text){return lang==='en'&&arabicText(text)?translations.get(text)??'[English translation pending]':text;}
function pendingTexts(){return [...new Set(authoredTexts().filter(t=>arabicText(t)&&!translations.has(t)))];}
function translationStatus(){const pending=pendingTexts();let message='';if(pending.length){message=translating||translatorTask?'جارٍ ترجمة الوصف إلى الإنجليزية…':translationError||('Translator' in window?'اضغط تفعيل الترجمة؛ يبقى النص العربي محفوظًا':'الترجمة غير متاحة هنا؛ استخدم Chrome على الكمبيوتر لترجمة الوصف العربي');}else if(authoredTexts().some(arabicText))message='الوصف مترجم إلى الإنجليزية';$('promptStatus').textContent=tr(message);$('enableTranslation').hidden=!pending.length||Boolean(translator&&!translationError)||translating||Boolean(translatorTask)||!('Translator' in window);$('prompt').setAttribute('aria-busy',String(Boolean(pending.length&&(translating||translatorTask))));}
function startTranslator(){if(translator||translatorTask||!('Translator' in window))return;translationError='';try{translatorTask=window.Translator.create({sourceLanguage:'ar',targetLanguage:'en',monitor(m){m.addEventListener('downloadprogress',()=>{if(lang==='en')$('promptStatus').textContent=tr('جارٍ تجهيز الترجمة على جهازك…');});}});translatorTask.then(value=>{translator=value;translatorTask=null;scheduleTranslation();translationStatus();},()=>{translatorTask=null;translationError='تعذّر تفعيل الترجمة؛ جرّب مجددًا';translationStatus();});}catch{translatorTask=null;translationError='تعذّر تفعيل الترجمة؛ جرّب مجددًا';}translationStatus();}
function scheduleTranslation(){clearTimeout(translationTimer);translationStatus();if(!pendingTexts().length)return;if(!translator){if(navigator.userActivation?.isActive)startTranslator();return;}translationTimer=setTimeout(translateFields,350);}
async function translateFields(){if(translating||!translator)return;const pending=pendingTexts();if(!pending.length)return;translating=true;translationError='';translationStatus();try{for(const text of pending){const result=await translator.translate(text);if(typeof result!=='string'||!result.trim()||arabicText(result))throw new Error('Incomplete translation');translations.set(text,result.trim());}while(translations.size>150)translations.delete(translations.keys().next().value);try{localStorage.setItem('shot.translations.v1',JSON.stringify([...translations]));}catch{}makePrompt();scheduleSave();}catch{translationError='تعذّرت ترجمة بعض النصوص؛ جرّب مجددًا';}finally{translating=false;translationStatus();if(!translationError&&pendingTexts().length)scheduleTranslation();}}
$('enableTranslation').onclick=()=>{if(translator){translationError='';translateFields();}else startTranslator();};
function readyToCopy(){if(pendingTexts().length||arabicText($('prompt').value)){if(!translator)startTranslator();else translateFields();toast('انتظر اكتمال الترجمة إلى الإنجليزية');return false;}return true;}
function actionKey(text){return text.toLowerCase().replace(/(?:الرجل|الشخصية|الشخص|المشهد|the man|the character|the person|scene)/g,'').replace(/[\s.,،؛!?]+/g,' ').trim();}
function sceneActionText(){const scene=englishText(state.action),key=actionKey(scene);return key&&state.actors.some(a=>{const other=actionKey(englishText(a.action));return other&&(other===key||(' '+other+' ').includes(' '+key+' '));})?'':scene;}
function restoreState(raw){
 if(!raw||typeof raw!=='object'||!Array.isArray(raw.actors)||raw.actors.length>4)throw new Error('Invalid scene');
 const next={...freshState(),...raw};next.promptIncludes=Object.fromEntries(['appearance','actions','setting','notes'].map(k=>[k,raw.promptIncludes?.[k]!==false]));next.props=Array.isArray(raw.props)?raw.props.slice(0,64).filter(p=>p&&['car','tree','sofa','chair','desk','road','horse','bed','door'].includes(p.type)&&['x','y','z','yaw'].every(k=>Number.isFinite(p[k]))).map(p=>({...p,id:String(p.id),rx:Number.isFinite(p.rx)?p.rx:0,rz:Number.isFinite(p.rz)?p.rz:0,description:String(p.description||''),x:clamp(p.x,-200,200),y:clamp(p.y,0,100),z:clamp(p.z,-200,200)})):[];if(next.presetKey==='desk-worker')for(const p of next.props)if(p.type==='chair'&&p.description==='work desk / office table')p.type='desk';const ids=new Set();
 next.actors=raw.actors.map(a=>{if(![1,2,3,4].includes(a.id)||ids.has(a.id))throw new Error('Invalid actor');ids.add(a.id);const n={...newActor(a.id),...a,color:palette[a.id-1].color};for(const k of ['x','y','z','rx','yaw','rz','headYaw','headPitch','headRoll'])if(!Number.isFinite(n[k]))throw new Error('Invalid transform');for(const k of ['name','description','action'])n[k]=String(n[k]??'');delete n.characterModel;delete n.rig65;n.scale=clamp(Number(n.scale)||1,.01,100);n.pose=['standing','seated','walking','running','lying','bent','crouching','leaning','kneeling','prostrating','riding','praying','pointing','carrying','openingDoor'].includes(n.pose)?n.pose:'standing';n.seat=['sofa','car','floor','unsupported'].includes(n.seat)?n.seat:'chair';delete n.phone;if(n.action==='Talking on a mobile phone held to the right ear.')n.action='';n.driving=Boolean(n.driving);n.headYaw=clamp(n.headYaw,-85,85);n.headPitch=clamp(n.headPitch,-45,60);n.headRoll=clamp(n.headRoll,-35,35);if(n.actionType||n.bodyState)applyProfile(n,{...profileFromActor(n),bodyState:profileFromActor(n).bodyState});return n;});
 for(const [k,values]of Object.entries({shot:shots.map(x=>x[0]),lens:[10,14,18,24,35,50,85,135],angle:['eye','low','high','top','dutch'],tool:['move','rotatePerson','light'],focus:['deep','shallow'],time:['day','golden','blue','night'],source:['sky','sun','window','practical'],soft:['soft','hard'],style:['cinematic','natural'],environment:['interior','exterior'],ratio:['16:9','9:16']}))if(!values.includes(next[k]))next[k]=freshState()[k];
 for(const [k,min,max]of [['distance',.1,500],['sceneYaw',-180,180],['scenePitch',-85,85],['lightAngle',0,360],['lightElevation',-10,90],['power',0,5],['warmth',2000,10000]]){if(!Number.isFinite(next[k]))throw new Error('Invalid value');next[k]=clamp(next[k],min,max);}
 if(!next.target||!['x','y','z'].every(k=>Number.isFinite(next.target[k])))throw new Error('Invalid camera');
 if(!next.props.some(p=>p.id===next.selectedPropId))next.selectedPropId=null;if(next.presetKey==='phone')next.presetKey=null;if(!ids.has(next.selectedId))next.selectedId=next.actors[0]?.id??null;next.selectedPart=['head','doorLeaf'].includes(next.selectedPart)?next.selectedPart:'body';next.grid=next.grid!==false;next.building=next.building!==false;next.floor=next.floor!==false;next.activeTab=['people','scene','presets','imageStyle','objects','camera','lighting'].includes(next.activeTab)?next.activeTab:'scene';next.imageStyle=validImageStyle(raw.imageStyle)?raw.imageStyle:'neutral';next.aperture=[1.4,2,2.8,4,5.6,8,11,16].includes(raw.aperture)?raw.aperture:(next.focus==='shallow'?2.8:8);next.dofEnabled61=typeof raw.dofEnabled61==='boolean'?raw.dofEnabled61:next.focus==='shallow';next.focus=next.dofEnabled61?'shallow':'deep';for(const k of ['action','setting','notes'])next[k]=String(next[k]??'');next.livePrompt=raw.livePrompt!==false;return next;
}
try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(saved){state=restoreState(saved.state);setUILanguage(saved.locale==='en'?'en':'ar');customPrompt=typeof saved.prompt==='string'?saved.prompt:null;restored=true;}}catch{storageOK=false;}
function sessionData(){const saved=profilePreview?structuredClone(state):state;if(profilePreview){saved.actors=saved.actors.map(a=>a.id===profilePreview.id?profilePreview.actor:a);saved.props=profilePreview.props;}return {version:1,state:saved,lang,locale:getUILanguage(),prompt:profilePreview?profilePreview.prompt:customPrompt};}
function persistNow(){clearTimeout(saveTimer);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sessionData()));storageOK=true;$('saveStatus').textContent='';}catch{storageOK=false;$('saveStatus').textContent=tr('تعذّر الحفظ على هذا الجهاز');}}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(persistNow,180);}
window.addEventListener('pagehide',persistNow);$('sceneCanvas').addEventListener('webglcontextlost',persistNow);document.addEventListener('visibilitychange',()=>{if(document.hidden)persistNow();});
$('prompt').addEventListener('input',()=>{customPrompt=$('prompt').value;scheduleTranslation();scheduleSave();});
document.querySelectorAll('[data-include]').forEach(input=>input.addEventListener('change',()=>{state.promptIncludes[input.dataset.include]=input.checked;customPrompt=null;update();}));
function hydrate(){for(const p of ['action','setting'])$(p).value=state[p];showTab(state.activeTab);$('thirds').hidden=!state.grid;$('grid').classList.toggle('active',state.grid);$('grid').setAttribute('aria-pressed',String(state.grid));document.querySelectorAll('[data-locale]').forEach(b=>{const on=b.dataset.locale===getUILanguage();b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});}

const selected=()=>state.actors.find(a=>a.id===state.selectedId)||newActor(1);const shot=()=>shots.find(s=>s[0]===state.shot);const ratio=()=>({'16:9':16/9,'2.39:1':2.39,'4:3':4/3,'9:16':9/16})[state.ratio];
const panelAPI={get state(){return state;},set state(v){state=v;},get studio(){return studio;},get customPrompt(){return customPrompt;},set customPrompt(v){customPrompt=v;},get promptBaseline(){return promptBaseline;},set promptBaseline(v){promptBaseline=v;},clearDrag:()=>{drag=null;},getUILanguage,tr,localize,clamp,ratio,shots,newActor,freshState,selected,sessionData,restoreState,hydrate,showTab,update:()=>update(),persistNow,toast,addActor,removeActor,selectActor,frameSelected};
const presetsPanel=mountPresets(panelAPI);
const renderPresets=presetsPanel.renderPresets;
const migratePresetPictures=presetsPanel.migratePresetPictures;
function name(container,value){return originalText($(container).querySelector(`button[data-value="${value}"]`)).trim()||String(value);}
function choice(container,items,property,change){$(container).innerHTML=items.map(([value,label,icon])=>`<button type="button" data-value="${value}">${icon?`<b>${icon}</b>`:''}${label}</button>`).join('');$(container).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state[property]=isNaN(Number(b.dataset.value))?b.dataset.value:Number(b.dataset.value);change?.();update();});}
function showTab(tab){if(!['scene','people','presets','imageStyle','objects','camera','lighting'].includes(tab))tab='scene';state.activeTab=tab;scheduleSave();document.querySelector('.controls').dataset.activeTab=tab;document.querySelectorAll('[data-tab]').forEach(n=>{const on=n.dataset.tab===tab;n.classList.toggle('active',on);n.setAttribute('aria-pressed',String(on));});document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==tab);}
function setShotDistance(){const vfov=2*Math.atan((36/Math.max(ratio(),1))/(2*state.lens));state.distance=clamp(shot()[3]/(2*Math.tan(vfov/2)),.1,500);}
function frameSelected(){if(state.cameraLocked)return;const a=selected();if(!a)return;const drop=a.pose==='seated'?(a.seat==='car'?.55:.34):0;state.target={x:a.x+(state.shot==='insert'?-.33:state.shot==='ecu'?-.052:0),y:a.y+((state.shot==='insert'?.8:shot()[4])-drop)*ageHeight(a.age)/1.85,z:a.z};setShotDistance();}
function selectActor(id,openPanel=true){state.selectedFixture54=null;state.selectionActive=true;if(!state.actors.some(a=>a.id===id))return;state.selectedPropId=null;state.selectedId=id;state.selectedPart='body';if(state.tool==='light')state.tool='move';drag=null;if(openPanel){showTab('people');const detail=$('peopleList').querySelector(`[data-character-details="${id}"]`);if(detail)detail.open=true;}update();}
function addActor(){if(state.actors.length>=4)return;const id=[1,2,3,4].find(n=>!state.actors.some(a=>a.id===n));const a=newActor(id);a.x=0;a.z=0;state.actors.push(a);state.selectedPropId=null;state.selectedId=id;state.selectedPart='body';showTab('people');update();}
function removeActor(id=state.selectedId){if(!state.actors.some(a=>a.id===id))return;state.actors=state.actors.filter(a=>a.id!==id);if(state.selectedId===id)state.selectedId=state.actors[0]?.id??null;state.selectedPart='body';update();}
function randomPositions(){
 const actors=state.actors,n=actors.length;if(n<2)return;
 const origin={x:clamp(actors.reduce((v,a)=>v+a.x,0)/n,-8,8),z:clamp(actors.reduce((v,a)=>v+a.z,0)/n,-8,8)};
 const hero=actors.find(a=>a.id===1)||actors[0],others=actors.filter(a=>a!==hero);
 state.posLayout=state.posLayout==='opposition'?'arc':'opposition';
 const phase=state.sceneYaw*Math.PI/180+(Math.random()-.5)*.9+(Math.random()<.5?0:Math.PI),axis={x:Math.cos(phase),z:-Math.sin(phase)},across={x:Math.sin(phase),z:Math.cos(phase)},gap=1.65+Math.random()*.45;
 const place=(a,along,side)=>{a.x=origin.x+axis.x*along+across.x*side;a.z=origin.z+axis.z*along+across.z*side;Object.assign(a,{y:0,rx:0,rz:0,headYaw:0,headPitch:0,headRoll:0});};
 place(hero,-gap*.6,(Math.random()-.5)*.2);
 const spread=1.05+Math.random()*.2;
 others.forEach((a,i)=>{const side=(i-(others.length-1)/2)*spread+(Math.random()-.5)*.12,curve=state.posLayout==='arc'?-.25*side*side:0;place(a,gap*.4+curve+(Math.random()-.5)*.12,side);});
 const aim={x:others.reduce((v,a)=>v+a.x,0)/others.length,z:others.reduce((v,a)=>v+a.z,0)/others.length};
 hero.yaw=normalizeYaw(Math.atan2(aim.x-hero.x,aim.z-hero.z)*180/Math.PI);
 for(const a of others)a.yaw=normalizeYaw(Math.atan2(hero.x-a.x,hero.z-a.z)*180/Math.PI);
 const center={x:actors.reduce((v,a)=>v+a.x,0)/n,z:actors.reduce((v,a)=>v+a.z,0)/n};
 state.target={x:center.x,y:.95,z:center.z};const radius=Math.max(...actors.map(a=>Math.hypot(a.x-center.x,a.z-center.z)))+.4,sphere=Math.hypot(radius,1.05),vfov=2*Math.atan((36/Math.max(ratio(),1))/(2*state.lens));state.distance=clamp(sphere/Math.sin(vfov/2)*1.08,.1,500);
 state.selectedPropId=null;state.selectedPart='body';state.tool='move';update();
}
$('positions').onclick=randomPositions;
const scenePanel=mountScene(panelAPI);
const selectProp=scenePanel.selectProp;
const moveProp=scenePanel.moveProp;
const syncSeats=scenePanel.syncSeats;
const refreshProps=scenePanel.refreshProps;
const deleteSelectedProp=scenePanel.deleteSelectedProp;
const applyBuiltIn=scenePanel.applyBuiltIn;
const addProp=scenePanel.addProp;
async function renderShotPictures(){
 if(!studio)return;
 for(const [key,,code,height,targetY] of shots){
  await new Promise(resolve=>requestAnimationFrame(resolve));if(studio.contextLost)return;
  const preview=freshState();Object.assign(preview,{shot:key,thumbnailBackground:'#363636',building:false,floor:true,ratio:'16:9',lens:50,lightAngle:325,lightElevation:40,sceneYaw:0,scenePitch:0});
  preview.target={x:key==='insert'?-.33:key==='ecu'?-.052:0,y:targetY,z:0};
  const vfov=2*Math.atan((36/(16/9))/(2*preview.lens));preview.distance=height/(2*Math.tan(vfov/2));
  if(key==='rear')preview.actors[0].yaw=180;
  if(key==='two'){preview.actors[0].x=-.45;const second=newActor(2);second.x=.45;second.color='#969696';preview.actors.push(second);}
  if(key==='ots'){const second=newActor(2);Object.assign(second,{x:-.48,z:.9,yaw:180,color:'#969696'});preview.actors.push(second);preview.target.x=.1;}
  try{const image=studio.capturePreset(preview);const card=$('shotGrid').querySelector(`[data-shot="${key}"] img`);if(image&&card)card.src=image;}catch(error){console.warn('Shot preview unavailable',code,error);}
 }
}
async function renderPresetPictures(){if(!studio)return;for(const [key]of builtInPresets){await new Promise(r=>setTimeout(r,30));if(studio.contextLost)return;try{const image=studio.capturePreset(buildPreset(key,freshState,newActor));if(image)$('builtInPresets').querySelector(`[data-preset="${key}"] img`).src=image;}catch{}}}
const charactersPanel=mountCharacters(panelAPI);
const refreshPeople=charactersPanel.refreshPeople;
const renderActorAvatars=charactersPanel.renderActorAvatars;
$('propScale').oninput=e=>{moveProp(state.selectedPropId,{scale:Number(e.target.value)/100});update();};
function selectPart(part){state.selectedPart=part;state.tool=part==='head'?'rotatePerson':'move';update();}

for(const [id,key]of [['headYaw','headYaw'],['headPitch','headPitch'],['headRoll','headRoll']])$(id).addEventListener('input',e=>{selected()[key]=Number(e.target.value);update();});
$('resetHead').onclick=()=>{Object.assign(selected(),{headYaw:0,headPitch:0,headRoll:0});update();};
const cameraPanel=mountCamera(panelAPI);
$('resetPropScale').onclick=()=>{moveProp(state.selectedPropId,{scale:1});update();};
choice('focuses',[['deep','خلفية واضحة'],['shallow','عزل الخلفية']],'focus',()=>{state.aperture=state.focus==='shallow'?2.8:8;});choice('times',[['day','نهار','☀'],['golden','غروب','◒'],['blue','أزرق','◐'],['night','ليل','☾']],'time',()=>{state.warmth={day:5500,golden:3200,blue:7000,night:4200}[state.time];});choice('sources',[['sun','شمس'],['sky','Skylight'],['window','نافذة'],['practical','مصباح']],'source');choice('softness',[['soft','ناعم'],['hard','حاد']],'soft');choice('styles',[['cinematic','سينمائي واقعي'],['natural','طبيعي محايد']],'style');choice('environments',[['interior','داخلي'],['exterior','خارجي']],'environment');choice('ratios',[['16:9',''],['9:16','']],'ratio');for(const b of $('ratios').children){b.setAttribute('aria-label',b.dataset.value);b.innerHTML='<span class="ratio-shape '+(b.dataset.value==='16:9'?'landscape':'portrait')+'" aria-hidden=true></span>';}
decorateLightChoices();
$('distance').max=500;
for(const [id,p]of [['distance','distance'],['lightPower','power'],['warmth','warmth']])$(id).addEventListener('input',e=>{state[p]=Number(e.target.value);update();});$('personYaw').addEventListener('input',e=>{selected().yaw=magneticRotationDegrees(Number(e.target.value));update();});
for(const p of ['action','setting'])$(p).addEventListener('input',e=>{state[p]=e.target.value;customPrompt=null;makePrompt();scheduleSave();});document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
$('toggleFloor').onclick=()=>{state.floor=!state.floor;update();};
$('toggleBuilding').onclick=()=>{state.building=!state.building;update();};
$('grid').onclick=()=>{state.grid=!state.grid;scheduleSave();$('thirds').hidden=!$('thirds').hidden;$('grid').classList.toggle('active',!$('thirds').hidden);$('grid').setAttribute('aria-pressed',String(!$('thirds').hidden));};$('center').onclick=()=>{if(state.selectedPropId)moveProp(state.selectedPropId,{x:state.target.x,y:0,z:state.target.z});else{selected().x=state.target.x;selected().y=0;selected().z=state.target.z;const chair=state.props.find(p=>p.autoActor===selected().id);if(chair)Object.assign(chair,{x:selected().x,y:0,z:selected().z});}update();};$('reset').onclick=()=>{const previousLive=state.livePrompt;state=freshState();state.livePrompt=previousLive;customPrompt=null;frameSelected();hydrate();for(const p of ['action','setting'])$(p).value='';update();toast('تمت إعادة ضبط الاستوديو');};$('resetPersonRotation').onclick=()=>{Object.assign(selected(),{rx:0,yaw:0,rz:0});update();};
$('copyText').onclick=async()=>{if(!readyToCopy())return;try{await navigator.clipboard.writeText($('prompt').value);toast('تم نسخ البرومبت');}catch{$('prompt').focus();$('prompt').select();toast('حددنا النص؛ استخدم أمر النسخ في جهازك');}};
function downloadBlob(blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='shot.png';a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('copyImage').onclick=()=>{try{if(!studio||!navigator.clipboard?.write||typeof ClipboardItem==='undefined')throw new Error();const image=studio.snapshot();return navigator.clipboard.write([new ClipboardItem({'image/png':image})]).then(()=>toast('تم نسخ الصورة؛ الصقها مباشرة'),async()=>{try{downloadBlob(await image);toast('تعذّر نسخ الصورة؛ تم تنزيلها');}catch{toast('تعذّر التقاط الصورة');}});}catch{toast('نسخ الصورة غير متاح؛ استخدم تنزيل الصورة');}};
$('downloadImage').onclick=async()=>{try{if(!studio)throw new Error();downloadBlob(await studio.snapshot());toast('تم تنزيل صورة اللقطة');}catch{toast('تعذّر التقاط الصورة');}};
let toastTimer;function toast(t){$('toast').textContent=tr(t);$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2400);}
function setTool(tool){state.tool=tool==='light'&&state.tool==='light'?(state.selectedPart==='head'?'rotatePerson':'move'):tool;drag=null;if(studio)studio.navigation=false;update();}document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
function updateTool(){const hints={move:'محاور XYZ للتحريك · الحلقات للدوران · اسحب المشهد لدوران الكاميرا · وسط: تحريك الكاميرا · يمين: الخصائص',rotatePerson:'حلقات الجسم والمجسّم بسناب 90°؛ الرأس بدوران حر يمينًا ويسارًا وأعلى وأسفل.',light:'اسحب على المشهد أو لوحة الضوء لتغيير اتجاه الإضاءة.'};document.querySelectorAll('[data-tool]').forEach(b=>{const on=b.dataset.tool===state.tool;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});$('sceneCanvas').dataset.tool=state.tool;$('sceneCanvas').setAttribute('aria-label',hints[state.tool]);$('rotationControls').hidden=true;$('headControls').hidden=state.selectionActive===false||state.selectedPropId!==null||state.selectedPart!=='head';$('headRoll').closest('label').hidden=true;document.querySelectorAll('[data-part]').forEach(b=>{const on=b.dataset.part===state.selectedPart;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});for(const key of ['headYaw','headPitch','headRoll']){$(key).value=selected()[key];$(key+'Out').textContent=Math.round(selected()[key])+'°';}$('personYaw').value=Math.round(normalizeYaw(selected().yaw));$('personYawOut').textContent=Math.round(normalizeYaw(selected().yaw))+'°';}
function orientation(actor){const a=wrapDegrees(actor.yaw-state.sceneYaw),abs=Math.abs(a),key=abs<22?'front':abs>158?'back':abs>68&&abs<112?'side':'threequarter';return {degrees:Math.round(a),en:({front:'facing the camera',back:'seen from behind',side:'in profile',threequarter:'three-quarter view'})[key],ar:({front:'أمامي',back:'خلفي',side:'جانبي',threequarter:'ثلاثة أرباع'})[key]};}
function update(){for(const input of document.querySelectorAll('[data-include]'))input.checked=state.promptIncludes[input.dataset.include];syncImageStyles();$('lenses').value=state.lens;$('aperture').value=state.aperture;syncSeats();refreshProps();$('carPassengers').hidden=state.presetKey!=='driving'||!state.props.some(p=>p.type==='car');document.querySelectorAll('[data-count]').forEach(b=>b.classList.toggle('active',Number(b.dataset.count)===state.actors.length));document.querySelectorAll('[data-prop]').forEach(b=>{const count=state.props.filter(p=>p.type===b.dataset.prop).length;b.disabled=count>=5;b.classList.remove('active');const badge=b.querySelector('[data-model-count]');if(badge)badge.textContent=count+'/5';});refreshPeople();updateTool();for(const [id,p]of [['lenses','lens'],['aperture','aperture'],['focuses','focus'],['times','time'],['sources','source'],['softness','soft'],['styles','style'],['environments','environment'],['ratios','ratio']])$(id).querySelectorAll('button').forEach(b=>{const on=b.dataset.value===String(state[p]);b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});$('shotGrid').querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.shot===state.shot);b.setAttribute('aria-pressed',String(b.dataset.shot===state.shot));});
 for(const [id,p]of [['distance','distance'],['lightPower','power'],['warmth','warmth']])$(id).value=state[p];$('distanceOut').textContent=state.distance.toFixed(2)+' m';$('powerOut').textContent=state.power.toFixed(1)+' / 5';$('warmthOut').textContent=state.warmth+' K';$('lightPad').setAttribute('aria-valuetext',`X ${Math.round(wrapDegrees(state.lightAngle))}°, Y ${Math.round(state.lightElevation)}°`);$('lightMarker').style.left=(wrapDegrees(state.lightAngle)+180)/360*76+12+'%';$('lightMarker').style.top=(90-state.lightElevation)/100*76+12+'%';
 $('shotCode').textContent=shot()[2];$('toggleFloor').classList.toggle('active',state.floor);$('toggleFloor').setAttribute('aria-pressed',String(state.floor));$('toggleBuilding').classList.toggle('active',state.building);$('toggleBuilding').setAttribute('aria-pressed',String(state.building));
 $('stage').style.aspectRatio=String(ratio());$('stage').style.maxHeight=state.ratio==='9:16'?'650px':'';$('stage').style.width=state.ratio==='9:16'?'min(100%,366px)':'100%';if(studio)studio.render();makePrompt();localize();scheduleSave();
}
function cameraAngle(){return state.scenePitch>=75?'top':state.scenePitch>12?'high':state.scenePitch< -12?'low':'eye';}
let makePrompt=createBasePrompt({get state(){return state;},set state(v){state=v;},get studio(){return studio;},get customPrompt(){return customPrompt;},set promptBaseline(v){promptBaseline=v;},set generatedCamera(v){generatedCamera=v;},set generatedCharacters(v){generatedCharacters=v;},promptState,lang,palette,selected,cameraAngle,wrapDegrees,orientation,englishText,sceneActionText,scheduleTranslation});

document.querySelectorAll('[data-locale]').forEach(b=>b.onclick=()=>{setUILanguage(b.dataset.locale);document.querySelectorAll('[data-locale]').forEach(n=>{const on=n===b;n.classList.toggle('active',on);n.setAttribute('aria-pressed',String(on));});renderPresets();update();});
const canvas=$('sceneCanvas');canvas.tabIndex=0;
function beginDrag(e,mode){if(state.cameraLocked&&['orbit','pan'].includes(mode))return;drag={pointerId:e.pointerId,px:e.clientX,py:e.clientY,actor:structuredClone(selected()),target:structuredClone(state.target),sceneYaw:state.sceneYaw,scenePitch:state.scenePitch,lightAngle:state.lightAngle,lightElevation:state.lightElevation,tool:mode,speed:clamp(Number(state.cameraSpeed)||1,.1,2)};if(studio&&['orbit','pan'].includes(mode)){studio.navigation=true;for(const control of studio.transformControls){control.enabled=false;control.axis=null;}}canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(state.tool==='light'){e.preventDefault();e.stopImmediatePropagation();setTool('light');return;}if(e.button===1||e.button===2){e.preventDefault();e.stopImmediatePropagation();if(e.button===1&&!studio?.isTransformDragging)beginDrag(e,'pan');}},{capture:true});
canvas.addEventListener('pointerdown',e=>{if(e.button!==0||studio?.isTransformDragging)return;const hit=studio?.pickPart(e);if(state.cameraLocked){if(hit?.kind==='actor')selectActor(hit.id,true);else if(hit?.kind==='prop')selectProp(hit.id,hit.part);return;}beginDrag(e,e.shiftKey?'pan':'orbit');drag.hit=hit;drag.moved=false;});
canvas.addEventListener('pointermove',e=>{if(drag&&!e.buttons){endDrag({...e,pointerId:drag.pointerId,type:'pointercancel'});return;}if(studio?.isTransformDragging||!drag||e.pointerId!==drag.pointerId)return;if(!drag.moved&&Math.hypot(e.clientX-drag.px,e.clientY-drag.py)<4)return;if(!drag.moved&&drag.tool==='orbit'&&studio){drag.orbitStart=studio.retargetOrbit(state);drag.target=structuredClone(state.target);drag.sceneYaw=state.sceneYaw;drag.scenePitch=state.scenePitch;}drag.moved=true;const dx=(e.clientX-drag.px)/canvas.clientWidth,dy=(e.clientY-drag.py)/canvas.clientHeight;if(drag.tool==='moveElement'){const start=drag.element,point=studio.panTarget(start,-dx,-dy),values={x:clamp(point.x,-200,200),y:clamp(point.y,0,100),z:clamp(point.z,-200,200)};if(drag.hit.kind==='prop')moveProp(drag.hit.id,values);else Object.assign(selected(),values);}else if(drag.tool==='rotateElement'){const yaw=normalizeYaw(magneticRotationDegrees(drag.element.yaw+dx*360));if(drag.hit.kind==='prop')moveProp(drag.hit.id,{yaw});else if(state.selectedPart==='head'){selected().headYaw=clamp(drag.element.headYaw+dx*180,-85,85);selected().headPitch=clamp(drag.element.headPitch+dy*90,-45,60);}else selected().yaw=yaw;}else if(drag.tool==='orbit'){if(studio&&drag.orbitStart)studio.orbitAround(state,drag.orbitStart,dx,dy);}else if(drag.tool==='pan'&&studio)state.target=studio.panTarget(drag.target,dx*drag.speed,dy*drag.speed);update();});
function endDrag(e){if(!drag||drag.pointerId!==e.pointerId)return;const deselect=e.type==='pointerup'&&!drag.moved&&!drag.hit&&drag.tool==='orbit';const hit=e.type==='pointerup'&&!drag.moved?drag.hit:null;drag=null;if(deselect){state.selectionActive=false;state.selectedPropId=null;}if(studio)studio.navigation=false;canvas.classList.remove('dragging');if(hit){if(hit.kind==='prop')selectProp(hit.id,hit.part);else{selectActor(hit.id,true);selectPart(hit.part);}}else update();}for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,endDrag);
function cancelNavigation46(){drag=null;studio?.cancelInteraction();canvas.classList.remove('dragging');}
$('reset').addEventListener('click',cancelNavigation46,{capture:true});window.addEventListener('blur',cancelNavigation46);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelNavigation46();});canvas.addEventListener('webglcontextlost',cancelNavigation46);
function recoverView46(){if(state.cameraLocked)return;cancelNavigation46();if(!studio)return;if(studio.contextLost){persistNow();location.reload();return;}studio.render();let box;if(state.selectedPropId){const model=studio.propModels.get(state.selectedPropId);if(model)box=new THREE.Box3().setFromObject(model);}else{const model=studio.models.get(state.selectedId);if(model)box=new THREE.Box3().setFromObject(model);}if(!box||box.isEmpty()){box=new THREE.Box3();for(const model of studio.models.values())box.expandByObject(model);for(const model of studio.propModels.values())box.expandByObject(model);}if(box.isEmpty())box=new THREE.Box3(new THREE.Vector3(-1,0,-1),new THREE.Vector3(1,2,1));const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight),vfov=2*Math.atan(18/(Math.max(aspect,1)*state.lens)),tan=Math.tan(vfov/2);state.target={x:center.x,y:center.y,z:center.z};state.distance=clamp((Math.max(size.y/2,size.x/(2*aspect))/tan+size.z/2)*1.2,1,500);state.angle='eye';state.sceneYaw=state.scenePitch=0;state.selectionActive=true;update();}
const recoverButton46=document.createElement('button');recoverButton46.id='recoverView46';recoverButton46.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5"/><circle cx="12" cy="12" r="4"/></svg>';recoverButton46.onclick=recoverView46;$('stage').append(recoverButton46);document.addEventListener('keydown',e=>{if(e.key==='Home'&&!e.target.closest('input,textarea,select,[contenteditable=true]')){e.preventDefault();recoverView46();}});
canvas.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();if(studio?.isTransformDragging||state.cameraLocked)return;if(e.shiftKey&&!e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)*.25&&!e.ctrlKey){const speed=clamp(Number(state.cameraSpeed)||1,.1,2);state.target=studio.panTarget(state.target,-(e.deltaX||e.deltaY)*speed/canvas.clientWidth,(e.shiftKey?0:-e.deltaY)*speed/canvas.clientHeight);update();return;}const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1);const previous=state.distance,next=clamp(previous*Math.exp(clamp(delta,-300,300)*.0015*clamp(Number(state.cameraSpeed)||1,.1,2)),.1,500);const anchor=studio?.cursorAnchor(e);if(anchor){const scale=1-next/previous;state.target={x:state.target.x+(anchor.x-state.target.x)*scale,y:state.target.y+(anchor.y-state.target.y)*scale,z:state.target.z+(anchor.z-state.target.z)*scale};}state.distance=next;update();},{passive:false});
canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d)return;e.preventDefault();if(state.selectionActive===false)return;if(state.selectedPropId&&state.tool!=='light'){const p=state.props.find(p=>p.id===state.selectedPropId);moveProp(p.id,state.tool==='move'?{x:p.x+d[0]*.05,z:p.z+d[1]*.05}:{yaw:normalizeYaw(magneticRotationDegrees(p.yaw+d[0]*5))});}else if(state.tool==='move'){selected().x=clamp(selected().x+d[0]*.05,-200,200);selected().z=clamp(selected().z+d[1]*.05,-200,200);}else if(state.tool==='rotatePerson'){if(state.selectedPart==='head'){selected().headYaw=clamp(selected().headYaw+d[0]*5,-85,85);selected().headPitch=clamp(selected().headPitch+d[1]*5,-45,60);}else selected().yaw=normalizeYaw(magneticRotationDegrees(selected().yaw+d[0]*5));}else{state.lightAngle=normalizeYaw(state.lightAngle+d[0]*5);state.lightElevation=clamp(state.lightElevation-d[1]*5,-10,90);}update();});
function lightPoint(e){const r=$('lightPad').getBoundingClientRect();state.lightAngle=normalizeYaw(clamp(((e.clientX-r.left)/r.width-.12)/.76,0,1)*360-180);state.lightElevation=90-clamp(((e.clientY-r.top)/r.height-.12)/.76,0,1)*100;update();}
$('lightPad').addEventListener('pointerdown',e=>{if(e.button!==0)return;lightDrag=e.pointerId;$('lightPad').setPointerCapture(e.pointerId);lightPoint(e);});$('lightPad').addEventListener('pointermove',e=>{if(lightDrag===e.pointerId)lightPoint(e);});for(const type of ['pointerup','pointercancel','lostpointercapture'])$('lightPad').addEventListener(type,()=>lightDrag=false);$('lightPad').addEventListener('keydown',e=>{const d={ArrowLeft:-2,ArrowRight:2,ArrowUp:2,ArrowDown:-2}[e.key];if(d===undefined)return;e.preventDefault();if(['ArrowLeft','ArrowRight'].includes(e.key))state.lightAngle=normalizeYaw(state.lightAngle+d);else state.lightElevation=clamp(state.lightElevation+d,-10,90);update();});
document.addEventListener('keydown',e=>{if(!['Delete','Backspace'].includes(e.key)||e.repeat||e.ctrlKey||e.metaKey||e.altKey||studio?.isTransformDragging)return;if(e.target.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]')||e.target.isContentEditable)return;e.preventDefault();if(state.selectedPropId)deleteSelectedProp();else removeActor();});
try{studio=new Studio(canvas,()=>state,(id,transform,kind)=>{if(kind==='fixture'){update();return;}if(kind==='prop'){moveProp(id,transform);update();return;}const actor=state.actors.find(a=>a.id===id);if(actor){Object.assign(actor,transform);const chair=state.props.find(p=>p.id===actor.parentProp&&p.autoActor===actor.id);if(chair&&transform.x!==undefined&&studio?.activeTransform?.control.mode==='translate')Object.assign(chair,{x:actor.x,y:actor.y,z:actor.z});update();}},id=>selectActor(id,true));}catch(e){console.error(e);$('webglError').hidden=false;studio=null;}
if(!restored)frameSelected();hydrate();renderPresets();update();persistNow();renderActorAvatars().then(renderShotPictures).then(renderPresetPictures).then(migratePresetPictures);window.kadar={getState:()=>structuredClone(state),selectActor,render:()=>studio?.render()};

// Lightweight first-stage UI additions: no new assets or heavy viewport content.
(()=>{
 const actions=document.querySelector('.prompt-actions'),lens=document.querySelector('.viewport-actions');if(actions&&lens){lens.insertAdjacentElement('afterend',actions);actions.classList.add('shot-export-actions');}const details=$('promptDetails');if(details){details.open=true;details.querySelector('summary')?.remove();}document.querySelector('.prompt-head>div:first-child')?.remove();
 const controls=$('viewportLightControls'),vpower=$('lightPower'),vwarm=$('warmth'),pad=$('lightPad');
 const lightButton=$('viewportLight');canvas.addEventListener('pointerdown',e=>{if(state.tool==='light'){e.preventDefault();e.stopImmediatePropagation();state.tool='move';update();}},true);
 const oldUpdate=update;update=function(){oldUpdate();if(vpower){vpower.value=state.power;vwarm.value=state.warmth;controls.hidden=state.tool!=='light';}};
 const menu=document.createElement('div');menu.id='characterPopup';menu.className='character-menu';menu.setAttribute('role','dialog');menu.setAttribute('aria-label',tr('خصائص الشخصية'));menu.hidden=true;document.body.append(menu);let menuId=null,menuSnapshot=null;
 const close=(accepted=true)=>{if(menu.hidden&&!menuSnapshot)return;if(menuSnapshot&&!accepted){const actor=state.actors.find(a=>a.id===menuId);if(actor){for(const key of Object.keys(actor))delete actor[key];Object.assign(actor,menuSnapshot.actor);}state.props=menuSnapshot.props;customPrompt=menuSnapshot.prompt;}menuSnapshot=null;profilePreview=null;menu.hidden=true;menuId=null;for(const card of $('peopleList').children)card.profileEditor?.reset();update();};
 const open=e=>{const hit=studio?.pickPart(e);if(hit?.kind!=='actor'){close();return;}close();selectActor(hit.id,true);state.selectedPart=hit.part==='head'?'head':'body';update();menuId=hit.id;menuSnapshot={actor:structuredClone(state.actors.find(a=>a.id===menuId)),props:structuredClone(state.props),prompt:customPrompt};profilePreview=null;menu.replaceChildren();const title=document.createElement('strong');title.className='character-popup-title';title.textContent=tr('خصائص الشخصية')+' '+hit.id;const closeButton=document.createElement('button');closeButton.className='context-close52';closeButton.textContent='×';closeButton.setAttribute('aria-label','إغلاق');closeButton.onclick=()=>close();const editor=document.createElement('div');editor.className='character-profile-editor';menu.append(title,closeButton,editor);mountProfileEditor(editor,()=>state.actors.find(a=>a.id===menuId),()=>{for(const card of $('peopleList').children)card.profileEditor?.reset();update();},()=>close(true),tr,{icons:true});menu.hidden=false;const rect=canvas.getBoundingClientRect(),gap=90,w=menu.offsetWidth,h=menu.offsetHeight;const right=e.clientX+gap,left=e.clientX-gap-w;const x=right+w<=innerWidth-8?right:left>=8?left:(e.clientX<rect.left+rect.width/2?innerWidth-w-8:8);menu.style.left=Math.max(8,Math.min(x,innerWidth-w-8))+'px';menu.style.top=Math.max(8,Math.min(e.clientY-h/2,innerHeight-h-8))+'px';};
 canvas.addEventListener('contextmenu',e=>{e.preventDefault();if(!studio?.isTransformDragging)open(e);});document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 const basePrompt=makePrompt;makePrompt=function(){basePrompt();const lines=promptState().actors.map(a=>{const g=!state.promptIncludes.appearance?'person':a.gender==='female'?'woman':a.gender==='male'?'man':'person';const exp={sad:'sad',happy:'happy',proud:'proud',thinking:'thoughtful',determined:'determined'}[a.expression]||'';const act={phone:'talking on a mobile phone held to the right ear',phoneUse:'using a mobile phone with one hand, looking at its screen',walk:'walking',run:'running',talk:'talking to another person',listen:'listening',gesture:'gesturing',read:'reading',write:'writing',drive:'driving',wait:'waiting'}[a.actionType]||'';return `Character ${a.id}: ${state.promptIncludes.appearance&&a.age!==null&&a.age!==undefined&&a.age!==''?`${a.age}-year-old `:''}${g}${a.pose==='lying'?', lying down':a.pose==='bent'?', bending forward':''}${exp?', '+exp+' expression':''}${act?', '+act:''}.`;});if(lines.length&&(state.promptIncludes.actions||state.promptIncludes.appearance))$('prompt').value+='\n\nCharacter profile:\n'+lines.join('\n');};makePrompt();
})();

const revision=mountRevision({getState:()=>state,update:()=>update(),showTab,removeActor,addProp,applyProfile,profileFromActor,mountProfileEditor,tr,setPrompt:text=>{customPrompt=text||null;update();},getStudio:()=>studio});

const lighting=mountLighting({getState:()=>state,getStudio:()=>studio,getUILanguage,update:()=>update(),persistNow,clearManual:()=>{customPrompt=null;}});
const revisionUpdate=update;update=function(){lighting.prepare();revision.prepare();revisionUpdate();revision.sync();lighting.sync();};
const refinement=mountRefinement({getState:()=>state,update:()=>update(),showTab,getUILanguage,tr,persistNow,readyToCopy,clearManual:()=>{customPrompt=null;},getStudio:()=>studio});
const revisionPrompt=makePrompt;makePrompt=function(){revisionPrompt();buildStructuredPrompt({state,studio,promptState,generatedCamera,generatedCharacters,englishText,customPrompt,lightingDescription,weatherDescription,setTechnical:refinement.setTechnical,setBaseline:v=>promptBaseline=v});};
const refinementUpdate=update;update=function(){refinement.prepare();refinementUpdate();refinement.sync();};
const edition=mountEdition({getState:()=>state,getUILanguage,update:()=>update(),persistNow,clearManual:()=>{customPrompt=null;}});
const editionUpdate=update;update=function(){edition.prepare();editionUpdate();edition.sync();};

document.querySelector('.workspace').append($('promptSection'));
const moduleAPI={getState:()=>state,getStudio:()=>studio,getUILanguage,update:()=>update(),persistNow,readyToCopy,toast,clearManual:()=>{customPrompt=null;}};
const quick=mountQuickPopovers(moduleAPI);
const quickButtons=[quick.add('lighting','viewportLight',mountQuickLighting),quick.add('camera','cameraButton',mountQuickCamera),quick.add('presets','viewportPresets',mountQuickPresets),quick.add('imageStyle','viewportImageStyle',mountQuickImageStyle)];
if(lightingUnavailable)quickButtons[0].disabled=true;
const quickbar=document.querySelector('.camera-light-bar');quickbar.replaceChildren(...quickButtons);
const actorToolbar=document.querySelector('.actor-toolbar');actorToolbar.prepend(quickbar);
const nav=document.querySelector('.tabs');document.querySelector('.controls').prepend(nav);const tabOrder=['lighting','camera','people','scene','imageStyle','presets'];for(const key of tabOrder){const b=nav.querySelector(`[data-tab="${key}"]`);b.replaceChildren();b.innerHTML=panelIcon(key);nav.append(b);}
const settings=mountSettings(moduleAPI);let technicalPrompt='';const technicalSetter=refinement.setTechnical;refinement.setTechnical=v=>{technicalPrompt=v;technicalSetter(v);};
const promptMode=mountPromptMode(moduleAPI);const generatedPrompt=makePrompt;makePrompt=function(){generatedPrompt();const signature=promptBaseline+'|'+(state.copyStory!==false);promptMode.refresh($('prompt').value,technicalPrompt,signature);};
const uiUpdate=update;update=function(){uiUpdate();cameraPanel.sync();quick.sync();settings.sync();for(const key of tabOrder){const b=nav.querySelector(`[data-tab="${key}"]`);b.dataset.tooltip=word(key,moduleAPI);b.setAttribute('aria-label',word(key,moduleAPI));b.setAttribute('aria-pressed',String(state.activeTab===key));}const top=$('actorTabs');top.append($('addPersonQuick'));document.querySelectorAll('[data-person]').forEach(b=>b.dataset.tooltip=b.getAttribute('aria-label'));};
update();persistNow();


window.kadar={...window.kadar,getStudio:()=>studio,update:()=>update(),moveProp,selectProp,applyBuiltIn,persistNow};

for(const key of ['imageStyle','presets'])nav.querySelector(`[data-tab="${key}"]`).hidden=true;if(['imageStyle','presets'].includes(state.activeTab))showTab('lighting');
const upgrade44=mountUpgrade44({getState:()=>state,setState:v=>{state=v;},getStudio:()=>studio,update:()=>update(),hydrate,showTab,getUILanguage,persistNow,clearManual:()=>{customPrompt=null;},getManual:()=>customPrompt,setManual:v=>{customPrompt=v;},selectProp,deleteSelectedProp,addProp,quick,lightingDescription,weatherDescription,englishText});
const prior44Update=update;update=function(){prior44Update();upgrade44.sync();};
update();persistNow();window.kadar={...window.kadar,version:53,recoverView:recoverView46,showTab,setState:next=>{state=restoreState(next);hydrate();update();},upgrade44};

const upgrade48=mount48({...moduleAPI,addProp});const prior48=update;update=function(){prior48();upgrade48.sync();};window.kadar.update=()=>update();window.kadar.version=53;update();

const upgrade52=mount52({...moduleAPI,getStudio:()=>studio,resetAll:()=>{state=freshState();customPrompt=null;setUILanguage('ar');frameSelected();hydrate();update();persistNow();},history:upgrade44});const prior52=update;update=function(){prior52();upgrade52.sync();};window.kadar.update=()=>update();window.kadar.upgrade52=upgrade52;window.kadar.version=53;update();

const upgrade53=mount53({...moduleAPI,getStudio:()=>studio});const prior53=update;update=function(){prior53();upgrade53.sync();};window.kadar.update=()=>update();window.kadar.upgrade53=upgrade53;window.kadar.version=53;update();

const upgrade54=mount54({...moduleAPI,showTab,selectProp,quick,sizes:upgrade52.sizes});const prior54=update;update=function(){prior54();upgrade54.sync();};window.kadar.update=()=>update();window.kadar.version=56;window.kadar.upgrade54=upgrade54;update();

const upgrade57=mount57({...moduleAPI});const prior57=update;update=function(){prior57();upgrade57.sync();};window.kadar.update=()=>update();window.kadar.version=57;update();

const upgrade58=mount58({...moduleAPI,addProp,sessionData,restoreState,setState:v=>{state=v;},hydrate,setUILanguage,showTab,getManual:()=>customPrompt,setManual:v=>{customPrompt=v;}});const prior58=update;update=function(){prior58();upgrade58.sync();};window.kadar.update=()=>update();window.kadar.version=58;update();

window.kadar.version=59;

const theme60=mountTheme60(moduleAPI);const prior60=update;update=function(){prior60();theme60.sync();};window.kadar.update=()=>update();window.kadar.version=60;update();

const interface61=mount61(moduleAPI);const prior61=update;update=function(){prior61();interface61.sync();};window.kadar.update=()=>update();window.kadar.version=61;update();persistNow();

const interface62=mount62(moduleAPI);const prior62=update;update=function(){prior62();interface62.sync();};window.kadar.update=()=>update();window.kadar.version=62;update();persistNow();

window.kadar.version=63;

const final65=mount65({...moduleAPI,showTab});const before65=update;update=function(){before65();final65.sync();};window.kadar.update=()=>update();const final67=mount67(moduleAPI);const prior67=update;update=function(){prior67();final67.sync();};window.kadar.update=()=>update();window.kadar.version=67;update();persistNow();

update();persistNow();
