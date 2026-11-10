// Fictional design-preview data only. Never derived from real bookings or Stripe.
export const FINANCE_DEMO_AS_OF="2026-11-10";
export const FINANCE_PERIODS=[{days:30,label:"Last 30 days"},{days:90,label:"Last 90 days"},{days:183,label:"Last 6 months"},{days:365,label:"Last year"}] as const;
export const EXPENSE_CATEGORIES=["Supplier rentals","Payment fees","Marketing","Operations","Other"] as const;
export type DemoExpense={id:string;description:string;category:typeof EXPENSE_CATEGORIES[number];amount:number;date:string;manual:boolean};
export type DemoPayment={id:string;guest:string;product:string;service:string;amount:number;status:"Paid"|"Pending";bookedAt:string;paidAt:string|null;hour:number;supplierCost:number};
const DAY=86400000;
export const DEMO_END=Date.parse(`${FINANCE_DEMO_AS_OF}T23:59:59.999Z`);
const catalog=[{product:"Azimut 68",service:"Yachts",price:4200,ratio:.58},{product:"Lamborghini Huracán",service:"Exotic cars",price:1450,ratio:.51},{product:"Waterfront villa",service:"Villas",price:2800,ratio:.62},{product:"Private chef experience",service:"Private chefs",price:1200,ratio:.43},{product:"Sunset yacht charter",service:"Yachts",price:2400,ratio:.48},{product:"Airport chauffeur",service:"Chauffeur",price:380,ratio:.39}];
const round=(n:number)=>Math.round(n*100)/100;
export function createFinanceDemo(){
 const payments:DemoPayment[]=[],expenses:DemoExpense[]=[];
 for(let day=0;day<365;day++){
  const date=new Date(DEMO_END-day*DAY).toISOString().slice(0,10);
  const count=day%7===0?4:day%3===0?3:day%2===0?2:1;
  for(let i=0;i<count;i++){
   const index=day*4+i,product=catalog[(day+i*3+Math.floor(day/7))%catalog.length];
   const amount=round(product.price*(1+(index%5)*.1)),paid=index%9!==0;
   const hour=[10,12,14,15,16,17,18,18,19,19,19,20,21,22][index%14];
   const id=`DEMO-${String(1800+index)}`,bookedAt=new Date(Date.parse(`${date}T12:00:00Z`)-((index%3)+1)*DAY).toISOString();
   const supplierCost=round(amount*product.ratio);
   payments.push({id,guest:`Demo guest ${String((index%80)+1).padStart(2,"0")}`,product:product.product,service:product.service,amount,status:paid?"Paid":"Pending",bookedAt,paidAt:paid?`${date}T16:00:00Z`:null,hour,supplierCost});
   if(paid){
    expenses.push({id:`${id}-supplier`,description:`${product.product} · ${id}`,category:"Supplier rentals",amount:supplierCost,date,manual:false});
    expenses.push({id:`${id}-fee`,description:`Payment processing · ${id}`,category:"Payment fees",amount:round(amount*.029+.3),date,manual:false});
   }
  }
  if(day%14===0)expenses.push({id:`demo-marketing-${day}`,description:"Campaign & content production",category:"Marketing",amount:450+(day%4)*75,date,manual:true});
  if(day%30===0)expenses.push({id:`demo-operations-${day}`,description:"Software, office & operations",category:"Operations",amount:690,date,manual:true});
 }
 return {payments,expenses};
}
export function financeSummary(payments:DemoPayment[],expenses:DemoExpense[],days:number,taxRate:number){
 const start=DEMO_END-days*DAY+1;
 const within=(date:string)=>{const time=Date.parse(date);return time>=start&&time<=DEMO_END;};
 const paid=payments.filter(p=>p.status==="Paid"&&p.paidAt&&within(p.paidAt));
 const costs=expenses.filter(e=>within(`${e.date}T12:00:00Z`));
 const revenue=round(paid.reduce((sum,p)=>sum+p.amount,0));
 const totalCosts=round(costs.reduce((sum,e)=>sum+e.amount,0));
 const profit=round(revenue-totalCosts),tax=round(Math.max(0,profit)*taxRate/100);
 const pending=payments.filter(p=>p.status==="Pending"&&within(p.bookedAt));
 const bookingActivity=payments.filter(p=>within(p.bookedAt));
 const hours=Array.from({length:24},(_,hour)=>({hour,count:bookingActivity.filter(p=>p.hour===hour).length}));
 const weekdays=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((label,index)=>({label,count:bookingActivity.filter(p=>(new Date(p.bookedAt).getUTCDay()+6)%7===index).length}));
 const groups=days<=30?6:days<=90?6:days<=183?6:12;
 const trend=Array.from({length:groups},(_,i)=>{
  const from=start+days*DAY*i/groups,to=start+days*DAY*(i+1)/groups;
  const revenue=paid.filter(p=>Date.parse(p.paidAt!)>=from&&Date.parse(p.paidAt!)<to).reduce((s,p)=>s+p.amount,0);
  const cost=costs.filter(e=>Date.parse(`${e.date}T12:00:00Z`)>=from&&Date.parse(`${e.date}T12:00:00Z`)<to).reduce((s,e)=>s+e.amount,0);
  return {date:new Date(from).toISOString().slice(0,10),revenue:round(revenue),cost:round(cost),profit:round(revenue-cost)};
 });
 const categories=EXPENSE_CATEGORIES.map(category=>({category,amount:round(costs.filter(e=>e.category===category).reduce((s,e)=>s+e.amount,0))}));
 const products=[...new Set(paid.map(p=>p.product))].map(product=>{
  const rows=paid.filter(p=>p.product===product),revenue=round(rows.reduce((s,p)=>s+p.amount,0)),supplierCost=round(rows.reduce((s,p)=>s+p.supplierCost,0));
  return {product,service:rows[0].service,count:rows.length,revenue,contribution:round(revenue-supplierCost)};
 }).sort((a,b)=>b.revenue-a.revenue);
 return {start:new Date(start).toISOString().slice(0,10),paid,costs,revenue,totalCosts,profit,tax,net:round(profit-tax),pending,hours,weekdays,trend,categories,products,bookingActivity};
}
