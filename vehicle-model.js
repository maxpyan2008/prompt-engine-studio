import * as THREE from './vendor/three.module.js';

// Composition dimensions in metres. Approximate profiles, not manufacturer CAD.
export function vehicleDimensions(index=0){
 const i=Number(index),suv=[2,8,10,17,19,22].includes(i),pickup=[3,7].includes(i),compact=[15,16,24].includes(i),coupe=[6,9].includes(i);
 if(i===23)return {length:5.35,width:1.98,height:1.48,wheelbase:2.94,wheelRadius:.34,kind:'classic'};
 if(compact)return {length:i===24?3.99:4.25,width:1.72,height:1.43,wheelbase:2.47,wheelRadius:.30,kind:'hatch'};
 if(pickup)return {length:5.35,width:1.92,height:1.80,wheelbase:3.10,wheelRadius:.38,kind:'pickup'};
 if(suv)return {length:i===10?5.55:4.85,width:1.96,height:1.88,wheelbase:i===10?3.25:2.85,wheelRadius:.39,kind:'suv'};
 if(coupe)return {length:4.75,width:1.88,height:1.37,wheelbase:2.72,wheelRadius:.34,kind:'coupe'};
 return {length:4.55,width:1.80,height:1.50,wheelbase:2.65,wheelRadius:.32,kind:i===20||i===21?'classic':'sedan'};
}

export function vehicleSeat(index,slot=0){
 const d=vehicleDimensions(index),wide=d.width/1.8,long=d.wheelbase/2.65;
 return {x:(slot%2===0?.44:-.44)*wide,y:.13+(d.kind==='suv'||d.kind==='pickup'?.19:0),z:(slot<2?.3:-.72)*long};
}

export function buildVehicle(index=0){
 const d=vehicleDimensions(index),g=new THREE.Group(),shell=new THREE.Group(),cabin=new THREE.Group();
 shell.name='cabin-shell';cabin.name='cabin-interior';g.add(cabin,shell);g.userData.cabinShell=shell;g.userData.dimensions=d;
 const mat=(color,roughness=.55,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const paint=mat('#8197a5',.32,.32),rubber=mat('#20262c',.9),alloy=mat('#aab5bf',.3,.75),trim=mat('#29343f'),seat=mat('#46515c',.85),lamps=mat('#f4eccb',.3),rear=mat('#c94c48',.35);
 const glass=new THREE.MeshStandardMaterial({color:'#91b7cd',transparent:true,opacity:.32,roughness:.12,metalness:.1,depthWrite:false,side:THREE.DoubleSide});
 const box=(w,h,l,m,x,y,z,parent=g)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),m);mesh.position.set(x,y,z);mesh.castShadow=m!==glass;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 // Lofted shell gives sloping hood/trunk shoulders instead of rectangular blocks.
 const loft=(stations,parent,m)=>{stations.sort((a,b)=>a[0]-b[0]);const vertices=[],indices=[];for(const [z,y,w]of stations)vertices.push(-w/2,y,z,w/2,y,z,-w/2,y-.07,z,w/2,y-.07,z);for(let i=0;i<stations.length-1;i++){const a=i*4,b=a+4;for(const [u,v]of [[0,1],[1,3],[3,2],[2,0]])indices.push(a+u,b+u,a+v,a+v,b+u,b+v);}indices.push(0,1,2,1,3,2);const a=(stations.length-1)*4;indices.push(a,a+2,a+1,a+1,a+2,a+3);const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geom.setIndex(indices);geom.computeVertexNormals();const mesh=new THREE.Mesh(geom,m);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const L=d.length,W=d.width,H=d.height,R=d.wheelRadius,raised=d.kind==='suv'||d.kind==='pickup'?.19:0,deck=.81+raised,front=L*.22,rearEdge=-L*.29;
 box(W*.94,.24,L*.86,paint,0,.48+raised,0);
 loft([[L/2,.70+raised,W*.83],[L*.39,.82+raised,W*.96],[front,deck,W*.94]],g,paint);
 loft([[rearEdge,deck,W*.94],[-L*.43,.77+raised,W*.97],[-L/2,.68+raised,W*.83]],g,paint);
 for(const sign of [-1,1])box(.10,.31,front-rearEdge,paint,sign*(W/2-.065),deck-.18,(front+rearEdge)/2);
 box(W*.83,.24,.08,paint,0,.59+raised,L/2-.03);box(W*.83,.24,.08,paint,0,.58+raised,-L/2+.03);
 box(W*.88,.10,.13,trim,0,.45+raised,L/2-.015);box(W*.88,.10,.13,trim,0,.45+raised,-L/2+.015);
 for(const x of [-W*.31,W*.31]){box(W*.18,.12,.055,lamps,x,.65+raised,L/2+.01);box(W*.15,.11,.055,rear,x,.63+raised,-L/2-.01);}
 box(W*.38,.12,.04,trim,0,.625+raised,L/2+.045);
 for(const x of [-W/2+.04,W/2-.04])for(const z of [-d.wheelbase/2,d.wheelbase/2]){
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(R,R,.22,32),rubber);tire.rotation.z=Math.PI/2;tire.position.set(x,R,z);tire.castShadow=true;g.add(tire);
  for(const side of [-1,1]){const rim=new THREE.Mesh(new THREE.CylinderGeometry(R*.62,R*.62,.013,24),alloy);rim.rotation.z=Math.PI/2;rim.position.set(x+side*.114,R,z);g.add(rim);}
 }
 // Pillars, roof, and all glazing live in one visibility group.
 const roofFront=front-.43,roofRear=rearEdge+.35,roofWidth=W*.80;
 loft([[roofRear,H-.01,roofWidth*.98],[roofFront,H,roofWidth]],shell,paint);
 const panel=(corners,parent,m)=>{const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(corners.flat(),3));geom.setIndex([0,1,2,0,2,3]);geom.computeVertexNormals();const mesh=new THREE.Mesh(geom,m);parent.add(mesh);return mesh;};
 panel([[-W*.43,deck,front],[W*.43,deck,front],[roofWidth/2,H-.10,roofFront],[-roofWidth/2,H-.10,roofFront]],shell,glass);
 panel([[-W*.43,deck,rearEdge],[-roofWidth/2,H-.10,roofRear],[roofWidth/2,H-.10,roofRear],[W*.43,deck,rearEdge]],shell,glass);
 const beam=(a,b,r=.026)=>{const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),8),paint);mesh.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());mesh.castShadow=true;shell.add(mesh);};
 for(const sign of [-1,1]){
  const x=sign*W*.46,xTop=sign*roofWidth/2;
  beam([x,deck,front],[xTop,H-.05,roofFront]);beam([x,deck,rearEdge],[xTop,H-.05,roofRear]);beam([x,deck,-.10],[xTop,H-.05,-.1],.035);
  panel([[x,deck,front],[x,deck,rearEdge],[xTop,H-.10,roofRear],[xTop,H-.10,roofFront]],shell,glass);
  for(const z of [.2,-.72])box(.02,.026,.10,alloy,sign*(W/2+.006),deck-.12,z);
  box(.15,.07,.22,paint,sign*(W/2+.07),deck+.12,front-.18);box(.15,.03,.035,trim,sign*(W/2+.015),deck-.015,front-.18);box(.025,.15,.035,trim,sign*(W/2+.07),deck+.045,front-.18);
 }
 // Seat locations do not depend on cabin visibility.
 for(let slot=0;slot<4;slot++){const p=vehicleSeat(index,slot);box(.54,.10,.53,seat,p.x,.47+raised,p.z,cabin);const back=box(.53,.48,.10,seat,p.x,.76+raised,p.z-.24,cabin);back.rotation.x=-.12;box(.23,.15,.09,seat,p.x,1.06+raised,p.z-.29,cabin);}
 const dashboard=box(W*.90,.15,.27,trim,0,deck+.04,front-.12,cabin);dashboard.name='dashboard57';
 const driver=vehicleSeat(index,0),steering=new THREE.Mesh(new THREE.TorusGeometry(.18,.019,8,28),trim);steering.position.set(driver.x,.95+raised,driver.z+.49);steering.rotation.x=-.50;cabin.add(steering);
 box(.16,.18,.30,trim,0,.50+raised,-.02,cabin);
 return g;
}
