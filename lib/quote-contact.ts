export type QuoteContact={name:string;email:string;phone:string};
export function normalizeQuoteContact(contact:QuoteContact){
 const name=contact.name.trim(),email=contact.email.trim().toLowerCase(),phone=contact.phone.trim().replace(/[\s().-]/g,"").replace(/^00/,"+");
 return name&&name.length<=200&&email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&/^\+\d{7,15}$/.test(phone)?{name,email,phone}:null;
}
