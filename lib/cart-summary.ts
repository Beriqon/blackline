import type {CartLine,CartAddonsState} from "./cart-types";
export function cartNeedsQuote(items:readonly CartLine[],addons:CartAddonsState){
 return addons.femaleHosts||addons.photoshoot||items.some(item=>!((item.category==="exotic-car"||item.category==="yacht")&&item.bookingSelection&&item.bookingQuote?.payableOnline));
}
export function internationalCartPhone(countryCode:string,input:string){
 const trimmed=input.trim();
 if(!trimmed||!/^\+?[\d\s().-]+$/.test(trimmed))return "";
 const national=["+31","+44","+32","+33","+49"].includes(countryCode)?trimmed.replace(/^0+/,""):trimmed;
 const combined=/^(\+|00)/.test(trimmed)?trimmed:`${countryCode}${national}`;
 const digits=combined.replace(/\D/g,"").replace(/^00/,"");
 return digits?`+${digits}`:"";
}
