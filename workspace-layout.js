// Move existing controls intact so their state and event wiring remain shared.
export function mountWorkspace(){
 const $=id=>document.getElementById(id),nav=document.querySelector('.tabs');
 nav.querySelector('[data-tab="camera"]').remove();
 nav.querySelector('[data-tab="lighting"]').remove();
 nav.prepend(nav.querySelector('[data-tab="scene"]'));
 const presetTab=document.createElement('button');presetTab.dataset.tab='presets';
 presetTab.innerHTML='<svg class="tab-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="10" height="10" rx="1"/><rect x="18" y="4" width="10" height="10" rx="1"/><rect x="4" y="18" width="10" height="10" rx="1"/><rect x="18" y="18" width="10" height="10" rx="1"/></svg><span>Preset</span>';
 nav.append(presetTab);
 const styleTab=document.createElement('button');styleTab.dataset.tab='imageStyle';styleTab.innerHTML='<svg class="tab-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="26" height="22"/><circle cx="11" cy="12" r="3"/><path d="M3 24l9-8 6 6 5-5 6 6"/></svg><span>Image Style</span>';nav.append(styleTab);const stylePanel=document.createElement('div');stylePanel.id='imageStyle';stylePanel.className='tab-panel';stylePanel.hidden=true;document.querySelector('.controls').append(stylePanel);
 const presets=document.createElement('div');presets.id='presets';presets.className='tab-panel';presets.hidden=true;
 presets.append($('savePreset'),$('builtInPresets'),$('presetList'));document.querySelector('.controls').append(presets);
 $('scenePresets').remove();$('openPresets').remove();$('showPrompt').remove();
 const camera=document.createElement('details');camera.className='viewport-shot-options advanced-options';
 const summary=document.createElement('summary');summary.textContent='حجم اللقطة وخيارات الكاميرا';camera.append(summary,...$('camera').childNodes);$('camera').remove();
 camera.hidden=true;document.querySelector('.workspace').append(camera);
 const lightButton=$('viewportLight');lightButton.innerHTML='<span>☀</span><span>Light</span>';document.querySelector('.viewport-toolbar').append(lightButton);$('stage').append($('ratios'));
 $('personYaw').max='360';$('personYaw').step='1';
 const brand=document.querySelector('.brand');brand.querySelector('strong').textContent='Prompt Engine STUDIO';document.querySelector('.viewport-toolbar').append(brand);
 $('promptSection').before($('sceneReminder'));$('promptDetails').replaceWith($('prompt'));
 const light=$('viewportLightControls'),pad=$('lightPad'),kelvin=$('warmth').closest('.vertical-control'),power=$('lightPower').closest('.vertical-control');
 const section=(label,icon)=>{const group=document.createElement('section');group.className='light-setting';const title=document.createElement('h2');title.innerHTML=lightIcon(icon)+'<span>'+label+'</span>';group.append(title);return group;};
 const rotation=section('اتجاه الإضاءة','bulb');rotation.classList.add('light-rotation');rotation.append(pad);
 const ranges=document.createElement('div');ranges.className='light-ranges';
 for(const [id,out,label,min,max]of [['warmth','warmthOut','Kelvin',2000,10000],['lightPower','powerOut','الشدة',0,5]]){const input=$(id),output=$(out),row=document.createElement('label');row.className='light-range';const title=document.createElement('span');title.textContent=label;input.min=min;input.max=max;row.append(title,output,input);ranges.append(row);}rotation.append(ranges);
 const scene=section('إعداد المشهد','image');scene.append($('environments'),$('times'));
 const properties=section('خصائص الضوء','bulb');properties.append($('sources'),$('softness'));
 const legacy=$('styles');legacy.hidden=true;document.querySelector('.workspace').append(legacy);
 light.replaceChildren(rotation,scene,properties);$('lighting').remove();
 const lens=document.createElement('select');lens.id='lenses';lens.setAttribute('aria-label','Lens');for(const n of [10,14,18,24,35,50,85,135])lens.add(new Option(n+' mm',n));$('lenses').replaceWith(lens);
 const aperture=document.createElement('div');aperture.className='aperture-group';aperture.dir='ltr';
 aperture.innerHTML='<span>Aperture</span><select id="aperture" aria-label="Aperture"></select><button id="apertureHelp" type="button" aria-label="شرح فتحة العدسة" aria-expanded="false" aria-controls="apertureTip">?</button><span id="apertureTip" role="note" dir="rtl" hidden>كلما قلّ هذا العدد، كان العزل أقوى.</span>';
 for(const n of [1.4,2,2.8,4,5.6,8,11,16])aperture.querySelector('select').add(new Option('f/'+n,n));
 const toolbar=document.querySelector('.viewport-toolbar'),bar=document.createElement('div');bar.className='camera-light-bar';bar.append(lightButton,document.querySelector('.lens-group'),aperture);toolbar.append(bar);
 const lightRow=document.createElement('div');lightRow.className='light-panel-row';lightRow.append(light);toolbar.append(lightRow);
 const exports=document.createElement('div');exports.className='prompt-inclusions';exports.id='promptInclusions';exports.innerHTML='<span>تضمين في البرومبت:</span><span class=technical-always>الإعدادات الفنية دائماً</span>'+[['appearance','المظهر والأسماء'],['actions','الأفعال والتعابير'],['setting','المكان المكتوب']].map(([key,label])=>'<label><input type=checkbox checked data-include="'+key+'"> '+label+'</label>').join('');$('promptSection').before(exports);
 document.querySelectorAll('#propControls [data-tool]').forEach(b=>b.remove());
 const reset=document.createElement('button');reset.id='resetPropScale';reset.type='button';reset.textContent='↻';reset.setAttribute('aria-label','إعادة حجم المجسّم');
 $('propScaleOut').after(reset);
 for(const b of document.querySelectorAll('[data-prop]')){const plus=document.createElement('span');plus.className='model-add-indicator';plus.textContent='+';plus.setAttribute('aria-hidden','true');b.append(plus);b.title=b.getAttribute('aria-label');}
}

export function lightIcon(kind){const shapes={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',bulb:'<path d="M8 17c0-4-3-4-3-9a7 7 0 0 1 14 0c0 5-3 5-3 9M8 17h8m-8 3h8m-6 3h4"/>',thermometer:'<path d="M9 14V4a3 3 0 0 1 6 0v10a5 5 0 1 1-6 0M12 7v10"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 5v8l5 3"/>',image:'<rect x="2" y="3" width="20" height="18"/><circle cx="8" cy="9" r="2"/><path d="M2 18l6-6 5 5 4-4 5 5"/>',bolt:'<path d="M14 1 4 14h7l-1 9L21 9h-8z"/>',contrast:'<circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/>',sliders:'<path d="M2 5h20M2 12h20M2 19h20"/><circle cx="7" cy="5" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="9" cy="19" r="2"/>',moon:'<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12z"/>',cloud:'<path d="M5 19a4 4 0 0 1-1-8 7 7 0 0 1 14-2 5 5 0 0 1 1 10z"/>',interior:'<path d="m12 2 10 5v12l-10 4-10-4V7zM2 7l10 5 10-5M12 12v11M12 2v10"/>',exterior:'<path d="m2 22 6-9 7 9m-5 0 8-11 5 11"/><circle cx="10" cy="7" r="3"/>',window:'<rect x="3" y="2" width="18" height="20"/><path d="M12 2v20M3 12h18"/>',sunset:'<path d="M2 16h20M4 20h16M6 16a6 6 0 0 1 12 0M12 2v3M3 7l2 2m14 0 2-2"/>'};return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(shapes[kind]||shapes.image)+'</svg>';}
export function decorateLightChoices(){for(const [id,icons]of [['environments',{interior:'interior',exterior:'exterior'}],['times',{day:'sun',night:'moon',golden:'sunset',blue:'sunset'}],['sources',{sky:'cloud',sun:'sun',practical:'bulb',window:'window'}],['styles',{cinematic:'image',natural:'image'}]])for(const button of document.querySelectorAll('#'+id+' button')){const label=button.cloneNode(true);label.querySelector('b')?.remove();const span=document.createElement('span');span.textContent=label.textContent;button.innerHTML=lightIcon(icons[button.dataset.value]);button.append(span);}}
