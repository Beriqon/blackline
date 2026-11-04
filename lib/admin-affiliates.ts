import {cachedRows,saveRows} from "./workspace-store";
export type AdminAffiliate={id:string;company:string;contact:string;email:string;phone:string;website:string;instagram:string;location:string;services:string[];status:"Active"|"Inactive";discount:string;terms:string;notes:string};
export function readAffiliates():AdminAffiliate[]{return cachedRows<AdminAffiliate>("affiliates");}
export async function saveAffiliates(partners:AdminAffiliate[]){await saveRows("affiliates",partners);}
export const blankAffiliate=():AdminAffiliate=>({id:crypto.randomUUID(),company:"",contact:"",email:"",phone:"",website:"",instagram:"",location:"",services:[],status:"Active",discount:"",terms:"",notes:""});
