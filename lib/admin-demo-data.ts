import { CATALOG_PRODUCTS } from "@/lib/admin-catalog-seed";
export const ADMIN_SERVICES=[
 ["yachts","Yachts"],["exotic-cars","Exotic cars"],["chauffeur-services","Chauffeur services"],["private-jets","Private jets"],["private-chefs","Private chefs"],["villas","Villas & stays"],["security-guards","Security"],["jetskis-jetcars","On the water"],["atv","ATV & UTV"],["vip-nightlife","VIP venues"],["photographer","Photo & video shoots"],
] as const;
export type AdminProduct={id:string;name:string;service:string;description:string;price:number;unit:string;status:"visible"|"hidden"|"archived";featured:boolean;images:string;specs:string;included:string;requirements:string;location:string;capacity:string;rates?:string};
export type AdminBookingItem={service:string;product:string;start:string;end:string;price:number};
export type AdminBooking={id:string;name:string;email:string;phone:string;source:"Website"|"WhatsApp"|"Instagram"|"Affiliate";affiliate:string;status:"Pending"|"Confirmed"|"Completed"|"Cancelled";notes:string;items:AdminBookingItem[]};
export const DEMO_PRODUCTS:AdminProduct[]=CATALOG_PRODUCTS;
export const DEMO_BOOKINGS:AdminBooking[]=[
 {id:"BL-DEMO-001",name:"Alex Morgan",email:"alex@example.com",phone:"",source:"Website",affiliate:"",status:"Confirmed",notes:"Example website booking with multiple services.",items:[{service:"yachts",product:"166 Trinity",start:"2026-11-02T10:00",end:"2026-11-02T14:00",price:30000},{service:"chauffeur-services",product:"Exclusive sprinter",start:"2026-11-02T09:00",end:"2026-11-02T15:00",price:1320}]},
 {id:"BL-DEMO-002",name:"Jamie Parker",email:"jamie@example.com",phone:"",source:"WhatsApp",affiliate:"",status:"Pending",notes:"Hotel pickup requested.",items:[{service:"exotic-cars",product:"Lamborghini Huracan Evo",start:"2026-11-03T10:00",end:"2026-11-05T10:00",price:2598}]},
 {id:"BL-DEMO-003",name:"Taylor Reed",email:"taylor@example.com",phone:"",source:"Affiliate",affiliate:"Example partner",status:"Confirmed",notes:"",items:[{service:"private-chefs",product:"Private dining experience",start:"2026-11-04T18:00",end:"2026-11-04T22:00",price:0}]},
 {id:"BL-DEMO-004",name:"Casey Ellis",email:"casey@example.com",phone:"",source:"Instagram",affiliate:"",status:"Pending",notes:"",items:[{service:"atv",product:"Night Glow Tour",start:"2026-11-06T19:00",end:"2026-11-06T21:00",price:0}]},
];
