import type { AdminProduct } from "./admin-demo-data";
const lines = (s: string) => s.split("\n").map(v=>v.trim()).filter(Boolean);
const usd = (n:number) => "$"+n.toLocaleString("en-US");
const facts = (s:string) => lines(s).map(line=>{const colon=line.indexOf(":");return {label:colon<0?line:line.slice(0,colon).trim(),value:colon<0?"":line.slice(colon+1).trim()};});
export function catalogId(p:AdminProduct){return p.id.startsWith("catalog:")?p.id.split(":").slice(2).join(":"):p.id;}
export function applyProduct<T extends {id:string}>(service:string, original:T|undefined, p:AdminProduct):T {
 const photos=lines(p.images), specifications=facts(p.specs);
 if(p.capacity && (service==="exotic-cars"||service==="chauffeur-services"||service==="villas")){const label=service==="villas"?"Max guests":"Seats";const capacity=specifications.find(f=>f.label===label);if(capacity)capacity.value=p.capacity;else specifications.push({label,value:p.capacity});}
 const base={...original,id:catalogId(p),name:p.name,description:p.description,featured:p.featured};
 const rate=p.unit==="on request"?"Price on request":`${usd(p.price)} / ${p.unit.replace(/^per /,"")}`;
 const common={group:"Blackline collection",pricing:p.unit==="on request"?"quote":"daily",section:service==="chauffeur-services"?"hourly":"daily",...base,galleryImages:photos,coverImage:photos[0],highlights:lines(p.included),requirements:lines(p.requirements),specs:specifications,priceLine:rate,chauffeurPriceLine:lines(p.rates??"").find(line=>/^Chauffeur:/i.test(line))?.replace(/^Chauffeur:\s*/i,"")};
 if(service==="chauffeur-services")return {...common,section:"hourly",pricing:p.unit==="on request"?"hourly_range":"hourly"} as unknown as T;
 if(service==="villas") {
  const weekend=Number(p.rates?.match(/Weekend:\s*\$?([\d,]+)/i)?.[1]?.replaceAll(",",""))||p.price;
  return {...common,subtitle:p.location,neighborhood:p.location,cardTagline:p.location,lede:p.description.split("\n\n")[0],facts:specifications,inclusions:lines(p.included),policyNotes:lines(p.requirements),photosComingSoon:!photos.length,nightlyRates:p.unit==="on request"?undefined:{weekdayUsd:p.price,weekendUsd:weekend}} as unknown as T;
 }
 if(service==="yachts") {
  const tiers=lines(p.rates??"").map(line=>{const parts=line.split(":");return {durationLabel:parts[0].trim(),amount:parts.slice(1).join(":").trim()};}).filter(t=>/^\d+\s*(hours?|hrs?)/i.test(t.durationLabel)&&t.amount);
  const primary=tiers.find(t=>t.durationLabel.match(/\d+/)?.[0]===p.unit.match(/\d+/)?.[0]);if(primary)primary.amount=usd(p.price);
  const length=Number(specifications.find(f=>f.label.toLowerCase()==="length")?.value.match(/[\d.]+/)?.[0])||0;
  return {...base,subtitle:p.specs.split("\n")[0]||p.location,cardPriceLine:rate,listingPriceUsd:p.price,region:original&&"region" in original?original.region:"miami",lengthFt:length,ratesPending:p.unit==="on request",priceTiers:tiers.length?tiers:[{durationLabel:p.unit==="per hour"?"1 hour":"4 hours",amount:usd(p.price)}],highlights:specifications.map(f=>`${f.label}: ${f.value}`),inclusions:lines(p.included),policyNotes:lines(p.requirements),location:p.location,capacityGuests:Number(p.capacity)||undefined,galleryCount:photos.length,cardCoverSrc:photos[0],galleryPaths:photos,productPageHref:`/services/yachts/${catalogId(p)}`} as unknown as T;
 }
 if(service==="private-jets") {
  const spec=(label:string)=>specifications.find(f=>f.label.toLowerCase()===label.toLowerCase())?.value??"";
  return {...base,overview:p.description,passengers:p.capacity,category:original&&"category" in original?original.category:"mid-size",categoryLabel:spec("Category"),beds:Number(spec("Beds"))||0,range:spec("Range"),cruisingSpeed:spec("Cruising speed"),baggage:spec("Baggage"),interiorWidth:spec("Cabin width"),interiorHeight:spec("Cabin height"),amenities:lines(p.included),galleryPaths:photos} as unknown as T;
 }
 if(service==="private-chefs") return {...base,bio:p.description,image:photos[0]||"/home/miami-dusk.webp",imageAlt:p.name,role:specifications.find(f=>f.label==="Role")?.value||"Private chef",highlights:lines(p.included),available:true} as unknown as T;
 if(service==="vip-nightlife") return {...base,about:p.description,imageSrc:photos[0]||"/home/miami-dusk.webp",imageAlt:p.name,gallery:photos.map(src=>({src,alt:p.name})),subtitle:p.specs} as unknown as T;
 return common as unknown as T;
}
export function applyCatalog<T extends {id:string}>(service:string, originals:readonly T[], products:readonly AdminProduct[]):T[]{return products.filter(p=>p.service===service&&p.status==="visible").map(p=>applyProduct(service,originals.find(o=>o.id===catalogId(p)),p));}
