import {focusDescription61} from './focus61.js';
import {emphasis54} from './emphasis54.js';
import {appearanceText54} from './appearance54.js';
import {stateText,effectiveGestureText} from './states48.js';
import {analyzeFrame} from './frame-analysis44.js';
import {propName} from './models44.js';
import {vehicles} from './scene-panel.js';
import {headDirectionText,profileFromActor} from './character-panel.js';
import {imageStyles} from './image-style-panel.js';
export function compose44(api){
 const s=api.promptState(),real=api.state||s,st=api.studio,en=v=>emphasis54(api.englishText(v)),analysis=st?analyzeFrame(st,real):null,flags=s.promptIncludes;
 const actors=s.actors.filter(a=>!analysis||analysis.actors.find(x=>x.id===a.id)?.visible),props=s.props.filter(p=>!analysis||analysis.props.find(x=>x.id===p.id)?.visible),f=n=>Number(n).toFixed(2),c=st?.camera;
 const color=a=>({1:'Red',2:'Blue',3:'Green',4:'Yellow'})[a.id],name=a=>`Character${a.id}(${color(a)})`,pose=s.copyWithoutStates58!==true;
 const opticalPitch=c?Math.asin(c.getWorldDirection(c.position.clone().set(0,0,0)).y)*180/Math.PI:s.scenePitch;
 const selectedFrame=analysis?.actors.find(r=>r.id===s.selectedId&&r.visible)||analysis?.actors.find(r=>r.visible),coverage=selectedFrame?.bounds;
 const whole=coverage&&coverage.top>=0&&coverage.bottom<=100&&coverage.left>=0&&coverage.right<=100;
 const framing=actors.length>1?'Group composition':whole?(selectedFrame.height<35?'Extreme wide full-body composition':'Full-body composition, entire silhouette visible'):'Match the visible crop in the attached reference';
 const view=opticalPitch>3?'camera looking upward':opticalPitch< -3?'camera looking downward':'approximately level optical axis';
 const lensEffect=s.lens<=24?'Wide-angle rectilinear projection: preserve the reference edge stretching, near/far scale differences and converging lines without fisheye curvature.':s.lens>=85?'Narrow angle of view: preserve the reference near/far scale relationships and compressed framing.':'Preserve the reference perspective and near/far scale relationships.';
 const lock=`Use the attached image as the primary composition reference. Preserve ${actors.length===1?'the character’s':'every character’s'} exact position and size within the frame, ${pose?'pose, ':''}body orientation, head direction and visible body coverage. Preserve all visible objects, their relative scale, spacing, overlap and depth order. Keep the same camera viewpoint, perspective and framing. Do not recenter, enlarge, reposition or crop subjects differently. Reference colors identify characters only, not clothing colors.`;
 const camera=`Create a photorealistic image. Aspect ratio ${s.ratio}. ${framing}; ${view}. Focal length ${s.lens} mm, aperture f/${s.aperture}, rectilinear lens, 36 mm full-frame sensor reference. ${lensEffect}\n${lock}\n${(s.dofEnabled61??s.focus==='shallow')?'Depth of field enabled, with optical blur determined by the stated aperture and focus plane.':'Depth of field effect disabled; retain a broadly sharp reference scene.'} ${focusDescription61(s)}`+(c?` Camera height ${f(c.position.y)} m, optical pitch ${f(opticalPitch)} degrees. Horizontal field of view ${f(2*Math.atan(Math.tan(c.fov*Math.PI/360)*c.aspect)*180/Math.PI)} degrees, vertical field of view ${f(c.fov)} degrees. Focus plane ${f(st.actualFocusDistance??s.focusDistance??s.distance)} m along camera axis; ${s.autoFocus===false?'manual focus':'autofocus'}, offset ${f(s.focusOffset??.12)} m.`:'');
 const style=imageStyles.find(x=>x.id===s.imageStyle),styleText=(style?.prompt||'No extra color grading.')+(s.lighting?.mode==='natural'?` Natural procedural sky. Solar disc ${s.showSunDisk===false?'hidden':'visible when in frame'}; disc visibility does not disable light.`:'');
 const objLine=(p,story)=>{const vehicle=p.type==='car'?' '+(vehicles[p.vehicle||0]||[]).join(' '):'';return propName(p)+vehicle+(story&&p.description?': '+en(p.description):'')+'.';};
 const count=`${props.length} visible scene object${props.length===1?'':'s'}.`;
 const geometry=a=>{const r=analysis?.actors.find(x=>x.id===a.id),relative=((a.yaw-s.sceneYaw)%360+360)%360;return `${name(a)}: `+(pose?`${stateText('bodyState',profileFromActor(a).bodyState)}; ${effectiveGestureText(a)}; ${stateText('expression',a.expression||'neutral')}; `:'')+`torso yaw ${f(relative)}° relative to camera, body pitch ${f(a.rx||0)}° and roll ${f(a.rz||0)}°; ${headDirectionText(a,true,st?.screenDirection(a,'head'))||'neutral head direction'}. `+(r?`Frame centre approximately ${r.x}% from left and ${r.y}% from top; silhouette spans ${r.height}% of image height and ${r.width}% of image width. Visible crop: ${r.text}. `:'');};
 const technical=[['Camera',camera],['Lighting',api.lightingDescription(s)],['Weather',api.weatherDescription(s)],['Objects',[count,...props.map(p=>objLine(p,false))].join('\n')],['Image Style',styleText],['Composition',`${actors.length} visible character${actors.length===1?'':'s'}. Include only visible subjects and objects, preserving partial framing and occlusion.\n`+actors.map(geometry).join('\n')]];
 const format=sections=>sections.filter(([,body])=>body).map(([title,body])=>title+'\n'+body).join('\n\n');
 api.setTechnical(format(technical)+'\n\n'+actors.map(a=>name(a)+':').join('\n'));
 const parts=technical.slice(0,5).map(x=>[...x]);parts[3][1]=[count,...props.map(p=>objLine(p,true))].join('\n');
 const scene=[s.setting?'Setting and scene direction: '+en(s.setting):'',s.notes?'Additional requirements: '+en(s.notes):'',s.action?'Scene action: '+en(s.action):''].filter(Boolean).join('\n');if(scene)parts.splice(3,0,['Scene',scene]);
 parts.push(['Characters',`${actors.length} visible character${actors.length===1?'':'s'}. Reference colours identify subjects only, not their final clothes.\n`+actors.map(geometry).join('\n\n')]);
 for(const a of actors){const profile=profileFromActor(a),authored=[flags.appearance?[(profile.gender||a.age!=null)?`Identity: ${profile.gender||''}${a.age!=null?', age '+a.age:''}.`:'',appearanceText54(a)].filter(Boolean).join(' '):'',a.name?'Name / role: '+en(a.name):'',a.description?'Appearance: '+en(a.description):'',a.action?'Authored direction: '+en(a.action):''].filter(Boolean).join('\n');parts.push([name(a)+':',authored||' ']);}
 const generated=format(parts).trimEnd();api.setBaseline(generated);document.getElementById('prompt').value=api.customPrompt!==null?api.customPrompt:generated;const final=document.getElementById('proFinal');if(final&&document.activeElement!==final)final.value=document.getElementById('prompt').value;
}
