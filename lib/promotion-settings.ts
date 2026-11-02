export type PromotionSettings={enabled:boolean;title:string;message:string;image:string};
export const PROMOTION_STORAGE_KEY="blackline-promotion-v1";
export const PROMOTION_EVENT="blackline-promotion-updated";
export const DEFAULT_PROMOTION_IMAGE="/home/miami-dusk.webp";
export const DEFAULT_PROMOTION:PromotionSettings={enabled:false,title:"Christmas, the Blackline way.",message:"Celebrate the season with 10% off your Miami experience.\n\nMention CHRISTMAS10 when booking with your concierge. Valid for new bookings made by December 25, 2026. Subject to availability. Cannot be combined with other offers.",image:""};
export function readPromotion():PromotionSettings {
 try{const data=JSON.parse(localStorage.getItem(PROMOTION_STORAGE_KEY)??"null");if(!data)return {...DEFAULT_PROMOTION};if(data.title==="A little more extraordinary."&&data.message==="Discover our latest seasonal offers and make your next Miami experience unforgettable. Contact your concierge for the details.")return {...DEFAULT_PROMOTION,enabled:data.enabled===true};return {enabled:data.enabled===true,image:typeof data.image==="string"&&/^data:image\/(jpeg|png|webp);base64,/.test(data.image)?data.image:"",title:typeof data.title==="string"?data.title.slice(0,90):DEFAULT_PROMOTION.title,message:typeof data.message==="string"?data.message.slice(0,1200):DEFAULT_PROMOTION.message};}catch{return {...DEFAULT_PROMOTION};}
}
export function savePromotion(settings:PromotionSettings){localStorage.setItem(PROMOTION_STORAGE_KEY,JSON.stringify(settings));window.dispatchEvent(new Event(PROMOTION_EVENT));}
