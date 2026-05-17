import type { Metadata } from "next";
import Link from "next/link";

import { getI18n } from "@/lib/i18n/server";
import { getServiceLinks } from "@/lib/i18n/nav";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("servicesPage.title") };
}

const linkClass =
  "block rounded-sm border border-gold/15 bg-charcoal/40 px-5 py-4 text-sm font-medium text-cream/90 transition-colors hover:border-gold/35 hover:text-gold-secondary";

export default async function ServicesPage() {
  const { t } = await getI18n();
  const serviceLinks = getServiceLinks(t);

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-center font-serif text-3xl tracking-tight text-cream sm:text-4xl">
        {t("servicesPage.title")}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-center text-sm text-cream/55">
        {t("servicesPage.body")}
      </p>
      <ul className="mt-12 grid gap-3 sm:grid-cols-2">
        {serviceLinks.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
