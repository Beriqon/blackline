// Standalone fictional planning data. No real inventory, booking or supplier records.
export const CALENDAR_DEMO_TODAY="2026-11-10";
export type CalendarProduct={id:string;name:string;service:string;supplier:string};
export type CalendarEvent={id:string;productId:string;title:string;guest:string;start:string;end:string;kind:"Confirmed"|"Pending"|"Blocked";note:string};
export const CALENDAR_PRODUCTS:CalendarProduct[]=[
 {id:"yacht-1",name:"Azimut 68",service:"Yachts",supplier:"Demo Ocean Charters"},
 {id:"yacht-2",name:"Sunset yacht",service:"Yachts",supplier:"Demo Ocean Charters"},
 {id:"car-1",name:"Lamborghini Huracán",service:"Exotic cars",supplier:"Demo Prestige Rentals"},
 {id:"car-2",name:"Rolls-Royce Ghost",service:"Exotic cars",supplier:"Demo Prestige Rentals"},
 {id:"villa-1",name:"Waterfront villa",service:"Villas & stays",supplier:"Demo Coastal Stays"},
 {id:"chef-1",name:"Private dining experience",service:"Private chefs",supplier:"Demo Private Chefs"},
 {id:"driver-1",name:"Airport chauffeur",service:"Chauffeur services",supplier:"Demo Executive Transport"},
];
export function calendarDate(date:string){return new Date(`${date}T12:00:00Z`);}
export function shiftCalendarDay(date:string,days:number){const value=calendarDate(date);value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10);}
export function calendarWeek(date:string){const offset=(calendarDate(date).getUTCDay()+6)%7;const monday=shiftCalendarDay(date,-offset);return Array.from({length:7},(_,i)=>shiftCalendarDay(monday,i));}
export function calendarMonth(date:string){const first=date.slice(0,7)+"-01";const monday=calendarWeek(first)[0];return Array.from({length:42},(_,i)=>shiftCalendarDay(monday,i));}
export function moveCalendarMonth(date:string,step:number){const value=calendarDate(date);const day=value.getUTCDate();value.setUTCDate(1);value.setUTCMonth(value.getUTCMonth()+step);const last=new Date(Date.UTC(value.getUTCFullYear(),value.getUTCMonth()+1,0)).getUTCDate();value.setUTCDate(Math.min(day,last));return value.toISOString().slice(0,10);}
export function eventsOnCalendarDay(events:CalendarEvent[],date:string){return events.filter(e=>e.start<`${shiftCalendarDay(date,1)}T00:00`&&e.end>`${date}T00:00`).sort((a,b)=>a.start.localeCompare(b.start));}
export function eventsInCalendarRange(events:CalendarEvent[],start:string,endExclusive:string){return events.filter(e=>e.start<`${endExclusive}T00:00`&&e.end>`${start}T00:00`);}
export function createCalendarDemo():CalendarEvent[]{
 const events:CalendarEvent[]=[];
 for(let offset=-40;offset<=65;offset++){
  const date=shiftCalendarDay(CALENDAR_DEMO_TODAY,offset),n=offset+40;
  const count=n%4===0?3:n%3===0?2:1;
  for(let i=0;i<count;i++){
   const p=CALENDAR_PRODUCTS[(n+i*2)%CALENDAR_PRODUCTS.length];
   const hour=p.service==="Private chefs"?18:9+(n+i*3)%6;
   const multiday=p.id==="villa-1"||p.id==="car-1";
   events.push({id:`DEMO-CAL-${n}-${i}`,productId:p.id,title:p.name,guest:`Demo guest ${String(n+i+1).padStart(2,"0")}`,start:`${date}T${String(hour).padStart(2,"0")}:00`,end:`${shiftCalendarDay(date,multiday?2:0)}T${String(multiday?hour:hour+4).padStart(2,"0")}:00`,kind:n%5===0?"Pending":"Confirmed",note:"Fictional booking for the calendar preview. Supplier confirmation and availability are not connected."});
  }
  if(n%9===0){const p=CALENDAR_PRODUCTS[(n+3)%CALENDAR_PRODUCTS.length];events.push({id:`DEMO-BLOCK-${n}`,productId:p.id,title:"Maintenance / unavailable",guest:"",start:`${date}T08:00`,end:`${date}T18:00`,kind:"Blocked",note:"Example supplier maintenance block. This does not block any real product."});}
 }
 return events;
}
