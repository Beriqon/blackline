"use client";

import type { ReactNode } from "react";
import { CookiePreferences } from "@/components/cookie-preferences";
import { PromotionPopup } from "@/components/promotion-popup";
import { usePathname } from "next/navigation";

export function SiteFrame({children,header,footer,floating}:{children:ReactNode;header:ReactNode;footer:ReactNode;floating:ReactNode}) {
 const pathname=usePathname();
 if(pathname==="/admin"||pathname.startsWith("/admin/"))return <main className="flex-1">{children}</main>;
 return <>{header}<main className="flex-1">{children}</main>{footer}{floating}<PromotionPopup/><CookiePreferences/></>;
}
