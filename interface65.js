const $=id=>document.getElementById(id),wrap=x=>(x%360+360)%360;
export function mount65(api){
 const ranges=()=>{for(const input of document.querySelectorAll('input[type=range]')){const min=Number(input.min)||0,max=Number(input.max)||100;input.style.setProperty('--range-fill65',Math.max(0,Math.min(100,(Number(input.value)-min)/(max-min)*100))+'%');}};
 document.addEventListener('input',ranges);const observer=new MutationObserver(ranges);observer.observe(document.body,{childList:true,subtree:true});
 const separator=$('promptResize44');document.querySelector('.stage-wrap').after(separator);$('cameraStrip61').after($('promptSection'));
 const rotation=$('rigRotation54');let rotate=null;
 rotation.addEventListener('pointerdown',e=>{if(e.button!==0)return;const l=api.getState().lighting;if(!l[l.interiorSelected].on)return;e.preventDefault();e.stopImmediatePropagation();rotate={x:e.clientX,angle:l[l.interiorSelected].rotation,id:e.pointerId};rotation.setPointerCapture(e.pointerId);rotation.focus();},{capture:true});
 rotation.addEventListener('pointermove',e=>{if(!rotate||e.pointerId!==rotate.id)return;e.preventDefault();e.stopImmediatePropagation();const l=api.getState().lighting,keys=l.mode==='studio'&&l.studioAll?['key','fill','rim']:[l.interiorSelected],next=wrap(rotate.angle+(e.clientX-rotate.x)*1.2),delta=((next-l[l.interiorSelected].rotation+540)%360)-180;for(const key of keys)if(l[key].on)l[key].rotation=wrap(l[key].rotation+delta);rotation.value=next;api.clearManual();api.update();},{capture:true});
 const stopRotation=()=>{if(rotate){rotate=null;api.persistNow();}};rotation.addEventListener('pointerup',stopRotation);rotation.addEventListener('pointercancel',stopRotation);
 rotation.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();const l=api.getState().lighting;if(!l[l.interiorSelected].on)return;const delta=(e.key==='ArrowRight'||e.key==='ArrowUp'?1:-1)*(e.shiftKey?10:1);for(const k of l.mode==='studio'&&l.studioAll?['key','fill','rim']:[l.interiorSelected])if(l[k].on)l[k].rotation=wrap(l[k].rotation+delta);api.update();},{capture:true});
 const shadow=$('shadowDirection59');let shadowDrag=null;
 shadow.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopImmediatePropagation();shadowDrag={x:e.clientX,angle:Number(shadow.value),id:e.pointerId};shadow.setPointerCapture(e.pointerId);shadow.focus();},{capture:true});
 shadow.addEventListener('pointermove',e=>{if(!shadowDrag||e.pointerId!==shadowDrag.id)return;e.preventDefault();shadow.value=wrap(shadowDrag.angle+(e.clientX-shadowDrag.x)*1.2);shadow.dispatchEvent(new Event('input',{bubbles:true}));},{capture:true});
 const stopShadow=()=>{if(shadowDrag){shadowDrag=null;api.persistNow();}};shadow.addEventListener('pointerup',stopShadow);shadow.addEventListener('pointercancel',stopShadow);
 shadow.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();shadow.value=wrap(Number(shadow.value)+(e.key==='ArrowRight'||e.key==='ArrowUp'?1:-1)*(e.shiftKey?10:1));shadow.dispatchEvent(new Event('input',{bubbles:true}));},{capture:true});

 // Wheel changes only the hovered optical control, never the camera or page.
 for(const id of ['lenses','aperture','cameraSpeed61']){const input=$(id);let last=0;input.addEventListener('wheel',e=>{if(e.ctrlKey||!e.deltaY)return;e.preventDefault();e.stopImmediatePropagation();const now=performance.now();if(now-last<100)return;last=now;const next=Math.max(0,Math.min(input.options.length-1,input.selectedIndex+(e.deltaY>0?1:-1)));if(next===input.selectedIndex)return;input.selectedIndex=next;input.dispatchEvent(new Event('change',{bubbles:true}));},{passive:false});}
 return {sync:ranges};
}
