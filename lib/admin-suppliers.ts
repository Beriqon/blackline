import type {AdminProduct} from "./admin-demo-data";

export const SUPPLIER_RATE_UNITS=["per hour","per 4 hours","per day","per night","per person","per booking"] as const;
export type SupplierRate={id:string;productId:string;productName:string;service:string;cost:string;unit:string;tax:"excluded"|"included";notes:string};
export type AdminSupplier={id:string;company:string;contact:string;email:string;phone:string;website:string;location:string;address:string;status:"Active"|"Inactive";terms:string;notes:string;rates:SupplierRate[]};
export const blankSupplier=():AdminSupplier=>({id:crypto.randomUUID(),company:"",contact:"",email:"",phone:"",website:"",location:"",address:"",status:"Active",terms:"",notes:"",rates:[]});
export const blankSupplierRate=():SupplierRate=>({id:crypto.randomUUID(),productId:"",productName:"",service:"",cost:"",unit:"per booking",tax:"excluded",notes:""});

export function validateSupplier(supplier:AdminSupplier,products:AdminProduct[]):string|null{
 if(!supplier.company.trim())return "Enter a supplier company name.";
 if(supplier.status!=="Active"&&supplier.status!=="Inactive")return "Choose a valid supplier status.";
 const seen=new Set<string>();
 for(const rate of supplier.rates){
  if(!rate.productId||(!products.some(p=>p.id===rate.productId)&&!rate.productName.trim()))return "Choose a product for every rate.";
  if(!/^\d+(\.\d{1,2})?$/.test(rate.cost)||!Number.isFinite(Number(rate.cost))||Number(rate.cost)<0||Number(rate.cost)>999999999.99)return "Enter a valid cost for every product (up to two decimal places).";
  if(!(SUPPLIER_RATE_UNITS as readonly string[]).includes(rate.unit))return "Choose a valid rate basis.";
  if(rate.tax!=="included"&&rate.tax!=="excluded")return "Choose whether tax is included for every rate.";
  const key=`${rate.productId}:${rate.unit}`;
  if(seen.has(key))return "This product already has a rate with the same rate basis. Edit that rate instead.";
  seen.add(key);
 }
 return null;
}

export function normalizeSupplier(supplier:AdminSupplier,products:AdminProduct[]):AdminSupplier{
 return {...supplier,company:supplier.company.trim(),contact:supplier.contact.trim(),email:supplier.email.trim(),phone:supplier.phone.trim(),website:supplier.website.trim(),location:supplier.location.trim(),address:supplier.address.trim(),terms:supplier.terms.trim(),notes:supplier.notes.trim(),rates:supplier.rates.map(rate=>{
  const product=products.find(p=>p.id===rate.productId);
  return {...rate,productName:product?.name??rate.productName,service:product?.service??rate.service,cost:Number(rate.cost).toFixed(2),notes:rate.notes.trim()};
 })};
}

export function filterSuppliers(suppliers:AdminSupplier[],query:string,status:string,service:string){
 const search=query.trim().toLowerCase();
 return suppliers.filter(s=>(status==="all"||s.status===status)&&(service==="all"||s.rates.some(r=>r.service===service))&&[s.company,s.contact,s.email,s.phone,s.location,...s.rates.map(r=>r.productName)].join(" ").toLowerCase().includes(search)).sort((a,b)=>a.company.localeCompare(b.company));
}
