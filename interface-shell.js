import {mountPromptEditor} from './prompt-panel.js';
import {imageStyles} from './image-style-panel.js';
import {profileChoices} from './character-panel.js';
import {lightIcon} from './workspace-layout.js';
const $=id=>document.getElementById(id);
const drawings={camera:'<rect x="2" y="6" width="20" height="15" rx="3"/><path d="m7 6 2-3h6l2 3"/><circle cx="12" cy="13" r="4"/>',people:'<circle cx="9" cy="7" r="4"/><path d="M2 22v-4a7 7 0 0 1 14 0v4M18 4a4 4 0 0 1 0 8m1 4a6 6 0 0 1 4 6"/>',presets:'<rect x="2" y="2" width="8" height="8" rx="2"/><rect x="14" y="2" width="8" height="8" rx="2"/><rect x="2" y="14" width="8" height="8" rx="2"/><rect x="14" y="14" width="8" height="8" rx="2"/>',rain:'<path d="M5 14a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 2 10M6 18l-2 4m8-4-2 4m8-4-2 4"/>',snow:'<path d="M12 2v20M3 7l18 10M3 17 21 7M9 4l3 3 3-3M9 20l3-3 3 3M3 10l4-1-1-4m15 9-4 1 1 4M3 14l4 1-1 4m15-9-4-1 1-4"/>',fog:'<path d="M3 6h14m-9 4h13M2 14h15m-9 4h14M3 22h11"/>',partly:'<circle cx="7" cy="7" r="4"/><path d="M7 1V0M1 7H0m2-5L1 1m11 1 2-2M6 21a4 4 0 0 1-1-8 6 6 0 0 1 11-3 5 5 0 0 1 2 11z"/>'};
function icon(k){return drawings[k]?`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${drawings[k]}</svg>`:lightIcon(k);}
export function mountRefinement(api){
 const label=(node,ar,en)=>{node.dataset.ui40='';node.dataset.ar40=ar;node.dataset.en40=en;};
 const text=(tag,ar,en)=>{const n=document.createElement(tag);label(n,ar,en);return n;};
 const nav=document.querySelector('.tabs'),controls=document.querySelector('.controls');document.querySelector('.workspace-nav').remove();controls.prepend(nav);nav.replaceChildren();
 for(const [id,ar,en,k]of [['scene','المشهد','Scene','exterior'],['people','الشخصيات','Characters','people'],['presets','البريستات','Presets','presets'],['imageStyle','أسلوب الصورة','Image Style','image'],['camera','الكاميرا','Camera','camera'],['lighting','الإضاءة','Lighting','sun']]){const b=document.createElement('button');b.dataset.tab=id;b.innerHTML=icon(k);b.append(text('span',ar,en));b.onclick=()=>api.showTab(id);nav.append(b);}
 $('scene').append(...$('objects').childNodes);$('objects').remove();$('scene').querySelector('h2')?.remove();$('scene').querySelector('h2')?.remove();for(const h of $('scene').querySelectorAll('h2'))if(h.textContent.includes('Objects'))h.remove();
 $('notes')?.closest('details')?.remove();
 document.querySelector('[data-include=notes]')?.closest('label').remove();
 // One state-backed character description in both editors.
 const brief=a=>[...new Set([a.name,a.description,a.action].filter(Boolean))].join('\n');
 const putBrief=(a,v)=>{Object.assign(a,{name:'',description:'',action:v});api.clearManual();api.update();api.persistNow();};
 const head=document.createElement('div');head.className='people-heading';head.append(text('h2','الشخصيات','Characters'));const add=$('addPerson');add.textContent='+';add.setAttribute('aria-label','إضافة شخصية');head.append(add);$('people').prepend(head);$('people').querySelector('h2:not(.people-heading h2)')?.remove();
 $('promptSection').querySelector('h2').replaceWith(text('h2','البرومبت','Prompt'));$('sceneReminder').hidden=true;
 const promptEditor=mountPromptEditor(api,{label,text});const full=$('copyText'),tech=$('copyTechnical');
 // The inspector owns all tools; viewport buttons are shortcuts to shared tabs.
 const workspace=document.querySelector('.workspace'),bar=document.querySelector('.camera-light-bar');
 for(const id of ['camera']){const panel=$(id);panel.className='tab-panel inspector-tool';controls.append(panel);const title=document.createElement('h2');title.className='inspector-title';title.innerHTML=icon(id==='lighting'?'sun':'camera');title.append(text('span',id==='lighting'?'الإضاءة':'الكاميرا',id==='lighting'?'Lighting':'Camera'));panel.prepend(title);if(id==='lighting')panel.querySelector('h2:not(.inspector-title)')?.remove();}
 $('cameraButton').innerHTML=icon('camera');$('viewportLight').innerHTML=icon('sun');$('viewportLight').removeAttribute('data-tool');
 $('cameraButton').onclick=()=>api.showTab('camera');$('viewportLight').onclick=()=>api.showTab('lighting');bar.replaceChildren($('cameraButton'),$('viewportLight'));workspace.querySelector('.viewport-toolbar').prepend(bar);
 const header=document.querySelector('header');header.append(document.querySelector('.brand'));const utility=document.createElement('div');utility.className='inspector-utility';utility.append(document.querySelector('.interface-language'),$('reset'));nav.before(utility);
 const actions=$('promptSection').querySelector('.prompt-actions');$('promptSection').querySelector('.prompt-head').replaceChildren(text('h2','البرومبت','Prompt'),actions);tech.remove();label(full,'نسخ البرومبت','Copy Prompt');
 const inclusions=$('promptInclusions');inclusions.replaceChildren();const story=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.id='copyStory';check.checked=api.getState().copyStory!==false;story.append(check,text('span','نسخ القصة','Copy Story'));inclusions.append(story);$('promptSection').querySelector('.prompt-head').after(inclusions);check.onchange=()=>{api.getState().copyStory=check.checked;api.persistNow();};
 $('peopleAvatarTabs').after($('addPerson'));$('addPerson').classList.add('inline-add');
 const models=text('h2','Models','Models');$('scene').querySelector('.model-adders').before(models);
 const readings=document.createElement('div');readings.id='viewportReadings';$('stage').append(readings);
 // Open groups with plain headings.
 for(const d of $('camera').querySelectorAll('details')){d.open=true;const summary=d.querySelector('summary');if(summary)summary.replaceWith(text('h3',summary.textContent==='Camera · Lens & Aperture'?'العدسة وفتحة العدسة':'خيارات الكاميرا',summary.textContent==='Camera · Lens & Aperture'?'Lens & Aperture':'Camera Options'));}
 function prepare(){const s=api.getState();if(s.action?.trim()){s.setting=[...new Set([s.setting,s.action].filter(v=>v?.trim()))].join('\n');s.action='';if($('action'))$('action').value='';if($('setting')&&document.activeElement!==$('setting'))$('setting').value=s.setting;}s.promptIncludes??={appearance:true,actions:true,setting:true,notes:true};if(!['scene','people','presets','imageStyle','camera','lighting'].includes(s.activeTab)){s.activeTab='scene';api.showTab('scene');}}

 function syncLabels(){const en=api.getUILanguage()==='en';document.querySelectorAll('[data-ui40]').forEach(n=>n.textContent=en?n.dataset.en40:n.dataset.ar40);document.querySelectorAll('[data-tooltip-ar]').forEach(n=>{const label=en?n.dataset.tooltipEn:n.dataset.tooltipAr;n.setAttribute('title',label);n.setAttribute('aria-label',label);n.dataset.tooltip=label;});document.documentElement.dir=en?'ltr':'rtl';}
 function sync(){const s=api.getState();syncLabels();
 $('viewportReadings').textContent=`${s.lens} mm   ·   f/${s.aperture}`;
 $('copyStory').checked=s.copyStory!==false;
 for(const [id,ar,en] of [['cameraButton','الكاميرا','Camera'],['viewportLight','الإضاءة','Lighting'],['addPerson','إضافة شخصية','Add Character'],['addPersonQuick','إضافة شخصية','Add Character']]){const button=$(id);button.title=api.getUILanguage()==='ar'?ar:en;button.setAttribute('aria-label',button.title);}
 for(const b of document.querySelectorAll('[data-prop]')){const names={car:['سيارة','Car'],tree:['شجرة','Tree'],chair:['كرسي','Chair'],sofa:['كنبة','Sofa'],desk:['مكتب','Desk']}[b.dataset.prop];if(names){b.title=names[api.getUILanguage()==='en'?1:0];b.setAttribute('aria-label',b.title);b.dataset.tooltip=b.title;}}
 const en=api.getUILanguage()==='en';for(const b of document.querySelectorAll('[data-choice]')){if(b.closest('.profile53'))continue;const ar=profileChoices[b.dataset.choice]?.find(([id])=>id===b.dataset.value)?.[1];if(ar){b.removeAttribute('title');b.removeAttribute('data-tooltip');b.setAttribute('aria-label',en?(profileChoices[b.dataset.choice].find(([id])=>id===b.dataset.value)?.[2]||api.tr(ar)):api.tr(ar));const tip=b.querySelector('.state-tip48');if(tip)tip.textContent=en?(profileChoices[b.dataset.choice].find(([id])=>id===b.dataset.value)?.[2]||ar):ar;}}
 for(const card of $('peopleList').children){const del=card.querySelector('[data-delete]');del.textContent='×';del.className='actor-remove card-remove';card.querySelector('details').open=true;const summary=card.querySelector('summary');summary.hidden=true;label(summary,'تفاصيل الشخصية','Character Details');const input=card.querySelector('[data-brief]');const briefLabel=input.closest('label');if(!briefLabel.querySelector('[data-brief-title]')){const n=text('span','وصف الشخصية','Character Description');n.dataset.briefTitle='';briefLabel.firstChild.replaceWith(n);}const sizeLabel=card.querySelector('[for^=actor-size]');if(sizeLabel)label(sizeLabel,'حجم الشخصية','Character Size');for(const row of card.querySelectorAll('.sidebar-profile .character-option-row')){const k=row.querySelector('[data-choice]')?.dataset.choice;if(k)label(row.querySelector('b'),{bodyState:'حالة الجسد',actionType:'الفعل',expression:'التعبير'}[k],{bodyState:'Posture',actionType:'Action',expression:'Expression'}[k]);}input.placeholder=api.getUILanguage()==='ar'?'ماذا تفعل الشخصية وماذا ترتدي؟ صف الفعل والمظهر والدور…':'What is the character doing and wearing? Describe action, appearance and role…';}
 syncLabels();

 }
 prepare();api.showTab(api.getState().activeTab);sync();return{prepare,sync,setTechnical:promptEditor.setTechnical};
}
