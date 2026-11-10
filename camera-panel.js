
const $=id=>document.getElementById(id);
export function mountCamera(api){
 const {shots,tr,update,addActor,showTab,frameSelected,selected}=api;
$('shotGrid').innerHTML=shots.map((s,i)=>`<button class="shot-card" data-shot="${s[0]}" title="${s[1]} · ${s[2]}"><img class="shot-photo" alt="${s[2]}" width="320" height="180"><em>✓</em><span>${s[1]}</span></button>`).join('');
$('shotGrid').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;api.state.shot=b.dataset.shot;if(['two','ots'].includes(api.state.shot)&&api.state.actors.length===1){addActor();api.state.selectedId=api.state.actors[0].id;if(api.state.shot==='ots'){api.state.actors[1].x=-.45;api.state.actors[1].z=.9;api.state.actors[1].yaw=180;}showTab('camera');}if(api.state.shot==='rear')selected().yaw=180;frameSelected();update();});
$('lenses').onchange=e=>{api.state.lens=Number(e.target.value);update();};
$('aperture').onchange=e=>{api.state.aperture=Number(e.target.value);api.state.focus=(api.state.dofEnabled61??api.state.aperture<8)?'shallow':'deep';update();};
$('apertureHelp').onclick=()=>{$('apertureTip').hidden=!$('apertureTip').hidden;$('apertureHelp').setAttribute('aria-expanded',String(!$('apertureTip').hidden));};

 return {sync(){const en=api.getUILanguage()==='en';document.querySelector('.lens-label').textContent=en?'Lens':'العدسة';document.querySelector('.aperture-group>span').textContent=en?'Aperture':'فتحة العدسة';}};
}

export function mountCameraInspector(api){const controls=document.querySelector('.controls');
 const cameraPanel=document.createElement('div');cameraPanel.id='camera';cameraPanel.className='tab-panel';cameraPanel.hidden=true;controls.append(cameraPanel);
 const cameraOptions=document.querySelector('.viewport-shot-options');cameraPanel.append(...Array.from(cameraOptions.childNodes).filter(n=>n.nodeName!=='SUMMARY'));cameraOptions.remove();
 const cameraGroup=document.createElement('details');cameraGroup.className='advanced-options';cameraGroup.open=true;cameraGroup.innerHTML='<summary>Camera · Lens & Aperture</summary>';cameraGroup.append(document.querySelector('.lens-group'),document.querySelector('.aperture-group'));cameraPanel.prepend(cameraGroup);
 const cameraButton=document.createElement('button');cameraButton.textContent='Camera';cameraButton.id='cameraButton';cameraButton.onclick=()=>api.showTab('camera');document.querySelector('.camera-light-bar').append(cameraButton);

}
