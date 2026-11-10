import {mountQuickLighting} from './quick-lighting.js';
export function mount48(api){
 const horse=document.createElement('button');horse.dataset.prop='horse';horse.setAttribute('aria-label','إضافة حصان');horse.innerHTML='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17L3 12m4 5h14l2-9 3-4 4 5-4 5-2 5-2 10m-4-10-1 10M9 18L7 29M21 8l-3 6H8l-3 6"/></svg><small data-model-count>0/5</small>';horse.onclick=()=>api.addProp('horse');document.querySelector('.model-adders').append(horse);
 const strip=document.createElement('div');strip.className='lighting-defaults48';document.querySelector('.sun-dial44')?.after(strip);if(!strip.isConnected)document.querySelector('#lighting').prepend(strip);const dial=document.querySelector('.sun-dial44'),row=document.createElement('div');row.className='sun-row48';dial.before(row);row.append(dial,strip);const defaults=mountQuickLighting(strip,api);defaults.sync();
 const original=defaults.sync;return {sync(){original();for(const row of strip.children)if(!row.querySelector('[data-quick-time]'))row.hidden=true;}};
}
