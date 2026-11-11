
export type BlockKind = "logo" | "cover" | "heading" | "text" | "button" | "image" | "gallery" | "footer";
export type EmailBlock = { id: string; kind: BlockKind; text: string; image: string; alt: string; url: string; secondImage: string; secondAlt: string; color: string; background: string };
export type EmailDraft = { id: string; kind: "campaign" | "template"; name: string; subject: string; preheader: string; blocks: EmailBlock[]; audienceIds: string[]; sampleAudience: boolean; updatedAt: string };

export const blockKinds: BlockKind[] = ["logo", "cover", "heading", "text", "button", "image", "gallery", "footer"];
export function makeBlock(kind: BlockKind): EmailBlock {
 const defaults = {logo:"BLACKLINE CONCIERGE",cover:"Your next Miami experience",heading:"Discover Blackline",text:"Write your message here.",button:"Explore experiences",image:"",gallery:"",footer:"Blackline Concierge · Miami"};
 return {id:crypto.randomUUID(),kind,text:defaults[kind],image:"",alt:"",url:"",secondImage:"",secondAlt:"",color:kind==="logo"||kind==="cover"||kind==="footer"?"#f4e4c4":"#29251e",background:kind==="logo"||kind==="cover"||kind==="footer"?"#131313":"#f6f3ed"};
}

type StarterBlock = Pick<EmailBlock, "kind"> & Partial<Omit<EmailBlock, "id" | "kind">>;
type StarterLayout = { label: string; subject: string; preheader: string; blocks: StarterBlock[] };
const site = "https://www.blacklineconcierge.group";

export const emailStarterLayouts: Record<string, StarterLayout> = {
 offer: {
  label: "Yacht charter spotlight",
  subject: "Your next day on the water",
  preheader: "Plan a private yacht charter in Miami with Blackline.",
  blocks: [
   {kind:"cover",text:"A day on the water",image:"/home/affiliate-yacht-lifestyle.png",alt:"Private yacht on the water",background:"#142522"},
   {kind:"text",text:"Start with the date, your group size and the kind of day you have in mind. We’ll help you find a yacht and plan a route, from an afternoon on Biscayne Bay to a sunset charter."},
   {kind:"button",text:"Explore yachts",url:site+"/services/yachts",color:"#244739"},
  ],
 },
 newsletter: {
  label: "The Miami edit",
  subject: "The Miami edit from Blackline",
  preheader: "Three ways to plan your next Miami weekend.",
  blocks: [
   {kind:"cover",text:"The Miami edit",image:"/home/miami-dusk.webp",alt:"Miami at dusk"},
   {kind:"heading",text:"A weekend, well planned",color:"#6a4833"},
   {kind:"text",text:"Arrive with a private chauffeur, spend an afternoon out on the water and finish the evening with dinner prepared by a private chef."},
   {kind:"gallery",image:"/home/chauffeur-exterior.webp",alt:"Private chauffeur vehicle",secondImage:"/home/private-chefs-cover.webp",secondAlt:"Private chef experience"},
   {kind:"button",text:"Explore Miami experiences",url:site,color:"#6a4833"},
  ],
 },
 invitation: {
  label: "Private dining invitation",
  subject: "An invitation to dine in",
  preheader: "A private chef experience for your next gathering.",
  blocks: [
   {kind:"heading",text:"An invitation to dine in",color:"#e9d8bc",background:"#28201c"},
   {kind:"image",image:"/home/private-chefs-cover.webp",alt:"Private chef dining experience",background:"#28201c"},
   {kind:"text",text:"For your next gathering, let us arrange a private chef at your home or villa. Share your date, guest count and dietary preferences, and we’ll help plan the menu and service.",background:"#f3e9dc"},
   {kind:"button",text:"Plan your dinner",url:site+"/services/private-chefs",color:"#58372d",background:"#f3e9dc"},
  ],
 },
 arrival: {
  label: "Chauffeur arrival",
  subject: "A smoother arrival in Miami",
  preheader: "Arrange a private chauffeur for your airport pickup or evening out.",
  blocks: [
   {kind:"cover",text:"Arrive on your terms",image:"/home/chauffeur-exterior.webp",alt:"Private chauffeur vehicle",background:"#1c2534"},
   {kind:"text",text:"Book a private chauffeur for an airport pickup, dinner reservation or a day of meetings. Tell us your pickup point, destination and timing so we can arrange the right vehicle."},
   {kind:"image",image:"/home/chauffeur-interior.webp",alt:"Interior of a private chauffeur vehicle",background:"#e8edf2"},
   {kind:"button",text:"Explore chauffeur services",url:site+"/services/chauffeur-services",color:"#273951"},
  ],
 },
};

export function makeDraft(kind:EmailDraft["kind"], layout = "offer"): EmailDraft {
 const starter = layout === "blank" ? undefined : emailStarterLayouts[layout] ?? emailStarterLayouts.offer;
 const blocks = starter
  ? ([{kind:"logo"}, ...starter.blocks, {kind:"footer"}] satisfies StarterBlock[]).map(block => ({...makeBlock(block.kind), ...block}))
  : [];
 return {id:crypto.randomUUID(),kind,name:starter?.label??"",subject:starter?.subject??"",preheader:starter?.preheader??"",blocks,audienceIds:[],sampleAudience:false,updatedAt:""};
}

export function copyDraft(source:EmailDraft,kind:EmailDraft["kind"]):EmailDraft {
 return {...source,id:crypto.randomUUID(),kind,name:source.name ? source.name+" copy" : "",blocks:source.blocks.map(block=>({...block,id:crypto.randomUUID()})),audienceIds:[],sampleAudience:false,updatedAt:""};
}

const key = "blackline-email-drafts-v1";
export function readEmailDrafts(): EmailDraft[] {
 const raw=localStorage.getItem(key);
 if (!raw) return [];
 const drafts: unknown = JSON.parse(raw);
 if (!Array.isArray(drafts)) throw new Error("Invalid local email library.");
 return drafts as EmailDraft[];
}

export function saveEmailDraft(draft:EmailDraft):EmailDraft[] {
 const saved={...draft,updatedAt:new Date().toISOString(),audienceIds:draft.kind==="campaign"?draft.audienceIds:[],sampleAudience:draft.kind==="campaign"&&draft.sampleAudience};
 const drafts=[saved,...readEmailDrafts().filter(item=>item.id!==saved.id)];
 localStorage.setItem(key,JSON.stringify(drafts));
 return drafts;
}

const escape=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
export function safeEmailImage(value:string,assetOrigin=""){
 const url=value.trim();
 if (/^\/(?![\/\\])[^\\]*$/.test(url)) return assetOrigin+url;
 if (/^https:\/\/[^\s]+$/i.test(url)||/^data:image\/(jpeg|png|webp|gif);base64,[a-z\d+/=]+$/i.test(url)) return url;
 return "";
}
const safeLink=(url:string)=>/^https:\/\/[^\s]+$/i.test(url.trim())?url.trim():"";
const color=(value:string,fallback:string)=>/^#[0-9a-f]{6}$/i.test(value)?value:fallback;
export function renderCampaignHtml(draft:EmailDraft,{assetOrigin="",preview=false}={}):string {
 const photo=(url:string,alt:string)=>{
  const src=safeEmailImage(url,assetOrigin);
  return src ? '<img src="'+escape(src)+'" alt="'+escape(alt)+'" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0">' : "";
 };
 const rows=draft.blocks.map(block=>{
  const text=escape(block.text).replace(/\r?\n/g,"<br>");
  const image=photo(block.image,block.alt);
  const href=safeLink(block.url);
  let content=text;
  const foreground=color(block.color,"#29251e"),background=color(block.background,"#f6f3ed");
  if (block.kind==="logo") content=image||'<strong style="font:20px Georgia,serif;letter-spacing:3px">'+text+'</strong>';
  if (block.kind==="cover"||block.kind==="heading") content=(block.kind==="cover"?image:"")+'<h1 style="margin:16px 0 4px;font:normal 34px Georgia,serif">'+text+'</h1>';
  if (block.kind==="image") content=image+(text?'<p>'+text+'</p>':"");
  if (block.kind==="gallery") content='<table role="presentation" width="100%" style="table-layout:fixed"><tr><td width="50%" style="padding-right:6px">'+image+'</td><td width="50%" style="padding-left:6px">'+photo(block.secondImage,block.secondAlt)+'</td></tr></table>'+text;
  if (block.kind==="button") {
   const style='style="display:inline-block;background:'+foreground+';color:'+background+';padding:12px 22px;text-decoration:none"';
   content=!preview&&href?'<a '+style+' href="'+escape(href)+'">'+text+'</a>':'<span '+style+'>'+text+'</span>';
  }
  return '<tr><td style="padding:22px 24px;background:'+background+';color:'+foreground+';font:15px/1.65 Arial,sans-serif;overflow-wrap:anywhere">'+content+'</td></tr>';
 }).join("");
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#e8e2d7"><span style="display:none">'+escape(draft.preheader)+'</span><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto">'+rows+'</table></body></html>';
}
