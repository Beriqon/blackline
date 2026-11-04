import type {Metadata} from "next";
export const metadata:Metadata={manifest:"/admin/manifest.webmanifest",appleWebApp:{capable:true,title:"Blackline",statusBarStyle:"black-translucent"},icons:{apple:"/admin/icon-192.png"}};
export default function AdminLayout({children}:{children:React.ReactNode}){return children;}
