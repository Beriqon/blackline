export type StripeMode='test'|'live';
export function stripeMode():StripeMode{return process.env.STRIPE_MODE==='live'?'live':'test';}
export function stripeIntegration(balance=false){return `blackline-${balance?'balance-':''}${stripeMode()}-v1`;}
export function validStripeSessionId(id:string){return new RegExp(`^cs_${stripeMode()}_[A-Za-z0-9]+$`).test(id);}
export function stripePublishableKeyValid(){return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim().startsWith(`pk_${stripeMode()}_`)??false;}
export function liveStripeEnabled(){
 if(stripeMode()!=='live')return process.env.STRIPE_MODE===undefined||process.env.STRIPE_MODE==='test';
 if(process.env.STRIPE_LIVE_ENABLED!=='true'||!stripePublishableKeyValid())return false;
 if(process.env.VERCEL_ENV&&process.env.VERCEL_ENV!=='production')return false;
 try{const url=new URL(process.env.NEXT_PUBLIC_APP_URL??'');return url.protocol==='https:'&&!url.username&&!url.password&&url.pathname==='/'&&!url.search&&!url.hash&&!url.port&&!/localhost|\.local$|:|^[\d.]+$/.test(url.hostname);}catch{return false;}
}
