// Approximate proportions for composition proxies, not individual measurements.
export function ageHeight(age){
 if(age===null||age===undefined||age==='')return 1.85;
 const stops=[[0,.52],[1,.75],[2,.88],[5,1.1],[10,1.4],[14,1.62],[18,1.85],[120,1.85]];
 const n=Math.max(0,Math.min(120,Number(age)));
 for(let i=1;i<stops.length;i++)if(n<=stops[i][0]){const [a,h]=stops[i-1],[b,k]=stops[i];return h+(k-h)*(n-a)/(b-a);}
 return 1.85;
}
export function ageYouth(age){return age===null||age===undefined||age===''?0:Math.max(0,1-Number(age)/18);}
