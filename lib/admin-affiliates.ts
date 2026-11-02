export type AdminAffiliate={id:string;company:string;contact:string;email:string;phone:string;website:string;instagram:string;location:string;services:string[];status:"Active"|"Inactive";discount:string;terms:string;notes:string};
const KEY="blackline-affiliates-v1";
export function readAffiliates():AdminAffiliate[]{const data=JSON.parse(localStorage.getItem(KEY)??"[]");if(!Array.isArray(data))throw new Error("Invalid partner data");return data.filter((p:AdminAffiliate)=>p&&typeof p.id==="string"&&typeof p.company==="string"&&Array.isArray(p.services));}
export function saveAffiliates(partners:AdminAffiliate[]){localStorage.setItem(KEY,JSON.stringify(partners));}
export const blankAffiliate=():AdminAffiliate=>({id:crypto.randomUUID(),company:"",contact:"",email:"",phone:"",website:"",instagram:"",location:"",services:[],status:"Active",discount:"",terms:"",notes:""});
