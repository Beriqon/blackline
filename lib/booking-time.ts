/** Interpret a visitor's local selection consistently on the browser and server. */
export function bookingDateTime(date:string,time:string,timeZone?:string):Date|null {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return null;
 const target=Date.parse(`${date}T${time}:00Z`);
 if(!Number.isFinite(target)||new Date(target).toISOString().slice(0,16)!==`${date}T${time}`)return null;
 if(!timeZone){const local=new Date(`${date}T${time}:00`);return Number.isNaN(local.getTime())?null:local;}
 try{
  const formatter=new Intl.DateTimeFormat("en-GB",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
  const wallTime=(stamp:number)=>{const parts=Object.fromEntries(formatter.formatToParts(new Date(stamp)).map(p=>[p.type,p.value]));return Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute),Number(parts.second));};
  let guess=target;for(let i=0;i<4;i++){const delta=target-wallTime(guess);if(!delta)return new Date(guess);guess+=delta;}
  return wallTime(guess)===target?new Date(guess):null;
 }catch{return null;}
}
