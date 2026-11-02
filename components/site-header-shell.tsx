"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import styles from "./site-header-shell.module.css";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function getScrolledSnapshot() {
  return window.scrollY > 24;
}

function getServerSnapshot() {
  return false;
}

export function SiteHeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasHero = ["/", "/about", "/contact", "/experiences", "/packages", "/services", "/affiliate-program"].includes(pathname)
    || /^\/services\/[^/]+\/?$/.test(pathname);
  const scrolled = useSyncExternalStore(subscribeToScroll, getScrolledSnapshot, getServerSnapshot);

  return (
    <header className={`${styles.header} ${hasHero ? styles.overlay : ""}`} data-scrolled={scrolled} data-hero-overlay={hasHero}>
      {children}
    </header>
  );
}
