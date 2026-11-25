export const SOCIAL_ACCOUNTS = {
 instagram: {label:"Instagram", username:"blackline_concierge", url:"https://www.instagram.com/blackline_concierge/"},
 tiktok: {label:"TikTok", username:"blacklineconcierge", url:"https://www.tiktok.com/@blacklineconcierge"},
} as const;

export type SocialProvider = keyof typeof SOCIAL_ACCOUNTS;
export const SOCIAL_PROVIDERS = ["instagram","tiktok"] as const;
export function socialProvider(value:unknown):value is SocialProvider {
 return value === "instagram" || value === "tiktok";
}

export type SocialPost = {
 id:string; title:string; url:string|null; publishedAt:string|null; kind:string;
 views:number|null; likes:number|null; comments:number|null; shares:number|null; reach:number|null; averageWatchSeconds:number|null;
};
export type SocialReport = {
 username:string; followers:number|null; postsCount:number|null; posts:SocialPost[]; updatedAt:string; partial:boolean;
};
export type SocialStatus = {
 state:"setup"|"disconnected"|"connected"|"reauthorize"|"unavailable";
 report?:SocialReport;
 message?:string;
};
