export const ADMIN_ACCOUNT_EMAIL="blackline235@gmail.com";
export const ACCOUNT_SITE_ORIGIN="https://www.blacklineconcierge.group";
export type AccountEmailIntent="activate"|"recover";
export function accountRequestOriginAllowed(origin:string|null,host:string|null,development:boolean){
 if(!origin||!host)return false;
 try{const parsed=new URL(origin);if(parsed.host!==host)return false;
 return origin===ACCOUNT_SITE_ORIGIN||(development&&parsed.protocol==="http:"&&["localhost","127.0.0.1"].includes(parsed.hostname));}catch{return false;}
}
export function accountEmailRequest(input:unknown):{email:string;intent:AccountEmailIntent}{
 if(!input||typeof input!=="object")throw new Error("Enter your account email address.");
 const body=input as Record<string,unknown>;
 if(typeof body.email!=="string"||body.email.trim().toLowerCase()!==ADMIN_ACCOUNT_EMAIL)throw new Error("This page is reserved for blackline235@gmail.com.");
 if(body.intent!=="activate"&&body.intent!=="recover")throw new Error("Invalid account request.");
 return {email:ADMIN_ACCOUNT_EMAIL,intent:body.intent};
}
type MailResult={error:{message:string;status?:number}|null};
type AccountMailer={resend:(input:{type:"signup";email:string;options:{emailRedirectTo:string}})=>Promise<MailResult>;resetPasswordForEmail:(email:string,options:{redirectTo:string})=>Promise<MailResult>};
export async function requestAccountEmail(input:unknown,mailer:AccountMailer){
 const {email,intent}=accountEmailRequest(input);
 // Fixed destination: neither the submitted email nor a supplied redirect can change it.
 const redirectTo=`${ACCOUNT_SITE_ORIGIN}/admin/set-password`;
 return intent==="activate"?mailer.resend({type:"signup",email,options:{emailRedirectTo:redirectTo}}):mailer.resetPasswordForEmail(email,{redirectTo});
}
