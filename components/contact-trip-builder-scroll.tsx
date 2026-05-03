"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { CONTACT_TRIP_BUILDER_SECTION_ID } from "@/lib/contact-hrefs";

/** When `/contact` loads with `#whatsapp-trip-builder`, scroll to the trip builder section (App Router client navigations). */
export function ContactTripBuilderScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/contact") return;
    const raw = window.location.hash.replace(/^#/, "");
    if (raw !== CONTACT_TRIP_BUILDER_SECTION_ID) return;
    const el = document.getElementById(CONTACT_TRIP_BUILDER_SECTION_ID);
    if (!el) return;
    const id = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
