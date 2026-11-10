// Coordinates remain in the existing body rig's local metre space.
export function arm48(gesture,s,drop){
 const both=(elbow,hand,direction=[0,-1,0],fist=false)=>({elbow:[s*elbow[0],elbow[1]-drop,elbow[2]],hand:[s*hand[0],hand[1]-drop,hand[2]],direction:[s*direction[0],direction[1],direction[2]],fist});
 switch(gesture){
 case 'openingDoor':if(s>0)return null;return both([.34,1.05,.22],[.34,1.05,.62],[0,0,1]);
 case 'approve':case 'reject':if(s>0)return null;return {...both([.34,1.08,.12],[.3,1.38,.3],[0,1,0],true),mode:gesture};
 case 'stop':case 'wave':if(s>0)return null;return both([.37,1.16,.12],[.38,1.48,.22],[0,1,0]);
 case 'index':case 'silence':if(s>0)return null;return {...both([.34,1.1,.12],gesture==='silence'?[.03,1.55,.2]:[.3,1.52,.25],[0,1,0]),point:true};
 case 'shrug':return both([.39,1.12,.06],[.48,1.42,.08],[0,1,0]);
 case 'pinch':if(s>0)return null;return {...both([.31,1.08,.1],[.25,1.42,.36],[0,1,0]),mode:'pinch'};
 case 'headAngry':return both([.47,1.54,0],[.11,1.88,0],[-1,0,0]);
 case 'deny':return both([.39,1.1,.08],[.39,1.43,.3],[0,1,0]);
 case 'thinkHand':if(s>0)return null;return both([.3,1.06,.12],[-.035,1.6,.18],[-1,.4,0]);
 case 'watch':return s<0?both([.35,1.08,.15],[.16,1.22,.38],[1,0,0]):both([.34,1.09,.13],[-.05,1.24,.41],[-1,0,0]);
 case 'weary':if(s>0)return null;return both([.3,1.1,.13],[.31,1.35,.4],[0,1,0]);
 case 'request':if(s>0)return null;return both([.35,1.1,.1],[.43,1.39,.22],[0,1,0]);
 case 'carry':return both([.37,1.04,.12],[.31,1.04,.47],[0,0,1]);
 case 'typing':return both([.30,1.36,.14],[.17,1.17,.43],[0,0,1]);
 case 'clasp':return both([.3,1.02,.1],[.035,.92,.24],[s<0?.3:-.3,0,.1]);
 case 'cross':return both([.3,1.12,.14],[-.21,1.27+(s>0?.05:0),.22],[-1,.1,0]);
 case 'behind':return both([.32,1.04,-.12],[.04,.91,-.23],[-1,0,0]);
 case 'hips':return both([.43,1.14,0],[.21,1.03,.015],[-1,-.2,0]);
 case 'pockets':case 'pocket':if(gesture==='pocket'&&s>0)return null;return both([.34,1.08,.02],[.15,.87,.1],[0,-1,0]);
 case 'heart':if(s>0)return null;return both([.34,1.12,.14],[-.05,1.32,.21],[-1,.3,0]);
 case 'explain':case 'explainBoth':if(gesture==='explain'&&s>0)return null;return both([.3,1.08,.08],[.4,1.18,.38],[0,0,1]);
 case 'overwhelmed':return both([.47,1.47,0],[.15,1.75,.025],[0,1,0]);
 case 'regret':if(s>0)return null;return both([.33,1.25,.17],[.035,1.63,.2],[0,1,0]);
 case 'victory':if(s>0)return null;return both([.39,1.6,0],[.35,1.95,.06],[0,1,0],true);
 case 'dua':return both([.29,1.03,.08],[.085,1.32,.33],[0,0,1]);
 case 'leanSupport':if(s>0)return null;return both([.43,1.05,0],[.37,1.3,.04],[0,1,0]);
 case 'reins':return both([.29,1.1,.14],[.15,1.18,.46],[0,0,1]);
 }
 return null;
}
