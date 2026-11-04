import {loadSetting,saveRow,uploadPhoto} from "./workspace-store";
export type PromotionSettings={enabled:boolean;title:string;message:string;image:string};
export const PROMOTION_STORAGE_KEY="blackline-promotion-v1";
export const PROMOTION_EVENT="blackline-promotion-updated";
export const DEFAULT_PROMOTION_IMAGE="/home/miami-dusk.webp";
export const DEFAULT_PROMOTION:PromotionSettings={enabled:false,title:"Christmas, the Blackline way.",message:"Celebrate the season with 10% off your Miami experience.\n\nMention CHRISTMAS10 when booking with your concierge. Valid for new bookings made by December 25, 2026. Subject to availability. Cannot be combined with other offers.",image:""};
export async function readPromotion():Promise<PromotionSettings>{return loadSetting("promotion",DEFAULT_PROMOTION);}
export async function savePromotion(settings:PromotionSettings){const next={...settings,image:settings.image?await uploadPhoto(settings.image):""};await saveRow("site_settings","promotion",next);window.dispatchEvent(new Event(PROMOTION_EVENT));return next;}
