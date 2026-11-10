export const builtInPresets=[['standing','شخص واقف'],['seated','شخص جالس'],['standing-pair','شخصان واقفان متقابلان'],['seated-pair','شخصان جالسان متقابلان'],['desk-worker','شخص جالس خلف طاولة عمل'],['sofa','شخصان جالسان على الكنبة'],['car-side','سيارة فيها شخص واحد'],['car-close-four','سيارة فيها أربعة أشخاص']];
export function buildPreset(key,base,makeActor){
 const s=base();Object.assign(s,{building:false,props:[],presetKey:key,lens:35,shot:'ws',distance:6.3,sceneYaw:18,scenePitch:4,target:{x:0,y:1,z:0},activeTab:'scene'});
 const actor=(id,data={})=>Object.assign(makeActor(id),data),prop=(type,x=0,z=0,extra={})=>({id:type,type,x,y:0,z,yaw:0,rx:0,rz:0,scale:1,...extra});
 if(key==='standing'){s.actors=[actor(1)];s.sceneYaw=0;s.distance=4.8;}
 if(key==='seated'){s.environment='interior';s.props=[prop('chair')];s.actors=[actor(1,{pose:'seated',seat:'chair',parentProp:'chair'})];s.target.y=.75;s.distance=4.2;}
 if(key==='standing-pair'){s.actors=[actor(1,{x:-.8,yaw:90}),actor(2,{x:.8,yaw:270})];s.sceneYaw=12;s.distance=6;}
 if(key==='seated-pair'){s.environment='interior';s.props=[prop('chair',-.58,0,{id:'chair-1'}),prop('chair',.58,0,{id:'chair-2'})];s.actors=[actor(1,{pose:'seated',seat:'chair',parentProp:'chair-1',x:-.58,yaw:90}),actor(2,{pose:'seated',seat:'chair',parentProp:'chair-2',x:.58,yaw:270})];s.sceneYaw=10;s.distance=6.2;s.target.y=.8;}
 if(key==='desk-worker'){s.environment='interior';s.props=[prop('desk',0,.25,{id:'desk-1',description:'work desk / office table'}),prop('chair',0,-.55,{id:'chair-2',description:'office chair'})];s.actors=[actor(1,{pose:'seated',seat:'chair',parentProp:'chair-2',x:0,z:-.55,action:'working at a work table'})];s.setting='work desk / office table';s.target={x:0,y:1.05,z:.2};s.distance=5.2;s.sceneYaw=0;}
 if(key==='sofa'){s.environment='interior';s.actors=[actor(1,{pose:'seated',seat:'sofa',parentProp:'sofa',x:-.55,headYaw:30}),actor(2,{pose:'seated',seat:'sofa',parentProp:'sofa',x:.55,headYaw:-30})];s.props=[prop('sofa')];s.target.y=.85;s.distance=5.3;}
 if(key==='car-side'){s.actors=[actor(1,{x:-1.55,z:.55,yaw:25})];s.props=[prop('car',.6,0,{cabinOpen:false}),prop('tree',2.8,-1.8)];s.sceneYaw=28;s.distance=10.5;s.target.y=1.6;}
 if(key==='car-close-four'){s.props=[prop('car',0,.15)];s.actors=[actor(1,{pose:'seated',seat:'car',parentProp:'car',driving:true,x:.44,y:.13,z:.3,action:'driving the car'}),actor(2,{pose:'seated',seat:'car',parentProp:'car',x:-.44,y:.13,z:.3}),actor(3,{pose:'seated',seat:'car',parentProp:'car',x:.44,y:.13,z:-.72}),actor(4,{pose:'seated',seat:'car',parentProp:'car',x:-.44,y:.13,z:-.72})];s.shot='ms';s.lens=50;s.sceneYaw=48;s.scenePitch=14;s.distance=5.5;s.target={x:0,y:1.18,z:-.15};}
 s.selectedId=s.actors[0].id;s.selectedPropId=null;s.selectedPart='body';
 return s;
}
