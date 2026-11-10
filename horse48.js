import * as T from './vendor/three.module.js';
export function buildHorse(p={}){
 const root=new T.Group(),g=new T.Group();root.add(g);const v=Number(p.variant)||0;
 const coat=new T.MeshStandardMaterial({color:'#865b41',roughness:.78}),dark=new T.MeshStandardMaterial({color:'#312821',roughness:.92}),muzzle=new T.MeshStandardMaterial({color:'#67574c',roughness:.9}),leather=new T.MeshStandardMaterial({color:'#46372c',roughness:.7}),eye=new T.MeshStandardMaterial({color:'#151311',roughness:.25}),white=new T.MeshStandardMaterial({color:'#e6d7bd'});
 const ell=(x,y,z,a,b,c,m=coat)=>{const o=new T.Mesh(new T.SphereGeometry(1,24,16),m);o.position.set(x,y,z);o.scale.set(a,b,c);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 const bone=(a,b,r1,r2=r1,m=coat)=>{const from=new T.Vector3(...a),to=new T.Vector3(...b),d=to.clone().sub(from);const o=new T.Mesh(new T.CylinderGeometry(r2,r1,d.length(),14),m);o.position.copy(from.add(to).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 const curve=(points,r,m)=>{const o=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),18,r,8,false),m);o.castShadow=true;g.add(o);return o;};
 ell(0,1.25,-.05,.32,.39,.77);ell(0,1.28,-.54,.35,.38,.33);ell(0,1.33,.49,.31,.43,.34);ell(0,1.13,.18,.29,.32,.48);
 // Tapered sloping neck, withers and a long equine head rather than a round muzzle.
 bone([0,1.38,.44],[0,1.99,.83],.27,.17);ell(0,1.75,.68,.21,.37,.28);ell(0,2.06,.94,.18,.25,.24);const face=ell(0,1.97,1.16,.145,.16,.32);face.rotation.x=.25;ell(0,1.9,1.38,.15,.12,.17,muzzle);
 for(const s of [-1,1]){const ear=ell(s*.105,2.34,.88,.055,.17,.075);ear.rotation.z=-s*.13;ell(s*.108,2.35,.917,.026,.10,.024,muzzle);ell(s*.169,2.11,1.017,.025,.029,.018,eye);ell(s*.176,2.12,1.02,.006,.008,.006,white);ell(s*.117,1.94,1.43,.026,.018,.013,dark);}
 curve([[-.11,1.84,1.44],[0,1.825,1.51],[.11,1.84,1.44]],.008,dark);
 for(let i=0;i<12;i++){const t=i/11;ell(0,1.53+t*.62,.43+t*.35,.07,.095,.09,dark);}curve([[0,1.48,-.76],[.04,1.18,-1.02],[v===1?.18:.03,v===1?.95:.62,-1.18],[v===1?.32:.04,v===1?.83:.38,-1.21]],.065,dark);
 for(const s of [-1,1])for(const front of [false,true]){
  const z=front?.47:-.55,x=s*.23,top=[x,1.22,z];let knee,ankle,foot;
  if(v===1){const phase=s*(front?1:-1);knee=[x,.72,z+phase*.40];ankle=[x,.30+(phase<0?.25:0),z+phase*.77];foot=[x,.12+(phase<0?.24:0),z+phase*.92];}
  else if(v===2&&front){knee=[x,.94,.78];ankle=[x,1.13,1.08];foot=[x,1.12,1.22];}
  else{knee=[x,front?.67:.74,z+(front?.025:.20)];ankle=[x,.22,z+(front?.02:-.02)];foot=[x,.08,z+.04];}
  ell(...top,front?.13:.16,.25,.16);bone(top,knee,front?.095:.12,.065);ell(...knee,.073,.085,.075);bone(knee,ankle,.055,.042);ell(...ankle,.055,.06,.055);bone(ankle,foot,.045,.047);const hoof=ell(foot[0],foot[1]-.025,foot[2]+.025,.075,.065,.115,dark);hoof.rotation.x=front&&v===2?.55:0;
 }
 const pad=ell(0,1.60,-.10,.34,.045,.33,white);ell(0,1.65,-.10,.27,.06,.28,leather);for(const s of [-1,1]){curve([[s*.28,1.59,.1],[s*.35,1.16,0],[s*.34,.93,-.02]],.018,leather);const stirrup=new T.Mesh(new T.TorusGeometry(.07,.012,8,16),dark);stirrup.position.set(s*.34,.94,-.02);stirrup.rotation.y=Math.PI/2;g.add(stirrup);curve([[s*.14,1.92,1.39],[s*.18,1.78,1.04],[s*.16,1.63,.3]],.009,leather);}
 if(v===2){const a=-.73;g.rotation.x=a;g.position.set(0,-.62*Math.sin(a),-.62+.62*Math.cos(a));}
 g.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(g);g.position.y-=bounds.min.y;g.updateMatrixWorld(true);root.userData.horseVariant=v;root.userData.horsePose=['standing','galloping','rearing'][v];return root;
}
