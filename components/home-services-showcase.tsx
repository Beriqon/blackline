"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useTranslations } from "@/components/locale-provider";
import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import type { HomeServiceItem } from "@/lib/home-services-data";
import { getLocalizedHomeServices } from "@/lib/i18n/home-services";
import { cn } from "@/lib/utils";

function ServiceImage({
  service,
  sizes,
  className,
}: {
  service: HomeServiceItem;
  sizes: string;
  className?: string;
}) {
  return (
    <Image
      src={service.image}
      alt={service.imageAlt}
      fill
      sizes={sizes}
      className={cn(
        "object-cover brightness-[0.8] contrast-[1.06] saturate-[0.88]",
        "transition duration-[700ms] ease-out",
        "group-hover:scale-[1.04] group-hover:brightness-[0.92] group-hover:saturate-[0.94]",
        service.image.endsWith(".png") && "object-[center_42%]",
        className,
      )}
    />
  );
}

function ImageScrim() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/50 to-[#0b0b0b]/10"
        aria-hidden
      />
      <div
        className="service-card-glow pointer-events-none absolute inset-0 z-[1] opacity-50"
        aria-hidden
      />
    </>
  );
}

function TileArrow({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center border border-gold/25 bg-[#0b0b0b]/55 text-gold/90 backdrop-blur-sm",
        "transition duration-500 ease-out",
        "group-hover:border-gold/45 group-hover:bg-gold/10 group-hover:text-gold-secondary",
        className,
      )}
    >
      <ArrowUpRight className="size-4" aria-hidden />
    </span>
  );
}

function ServiceTileCard({
  service,
  index,
  imageSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  minHeight = "min-h-[min(52vw,280px)] sm:min-h-[300px] lg:min-h-[320px]",
}: {
  service: HomeServiceItem;
  index: number;
  imageSizes?: string;
  minHeight?: string;
}) {
  return (
    <ScrollRevealItem index={index} className="h-full">
      <Link
        href={service.href}
        className={cn(
          "service-card-tilt group relative flex h-full overflow-hidden border border-gold/12 bg-[#0b0b0b] outline-none",
          minHeight,
          "transition-[border-color,box-shadow] duration-500 ease-out",
          "hover:border-gold/28 hover:shadow-[0_0_0_1px_rgba(198,164,108,0.08),0_20px_52px_rgba(0,0,0,0.42)]",
          "focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal",
        )}
      >
        <div className="service-card-media absolute inset-0">
          <ServiceImage service={service} sizes={imageSizes} />
          <ImageScrim />
        </div>

        {service.badge ? (
          <span className="pointer-events-none absolute left-3 top-3 z-[3] border border-gold/40 bg-[#0b0b0b]/75 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-gold/95 backdrop-blur-sm sm:left-4 sm:top-4">
            {service.badge}
          </span>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <h3 className="font-serif text-lg leading-tight tracking-tight text-cream sm:text-xl">
              {service.title}
            </h3>
            <TileArrow className="size-8" />
          </div>
        </div>
      </Link>
    </ScrollRevealItem>
  );
}

function ServiceTileSection({
  label,
  services,
  startIndex,
  gridClassName,
  imageSizes,
  minHeight,
}: {
  label?: string;
  services: HomeServiceItem[];
  startIndex: number;
  gridClassName: string;
  imageSizes?: string;
  minHeight?: string;
}) {
  return (
    <div className="mt-4 sm:mt-5 first:mt-0 [&:not(:first-child)]:mt-10 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-gold/10 [&:not(:first-child)]:pt-10 sm:[&:not(:first-child)]:mt-12 sm:[&:not(:first-child)]:pt-12">
      {label ? (
        <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-cream/38 sm:mb-5">
          {label}
        </p>
      ) : null}
      <div className={gridClassName}>
        {services.map((service, i) => (
          <ServiceTileCard
            key={service.href}
            service={service}
            index={startIndex + i}
            imageSizes={imageSizes}
            minHeight={minHeight}
          />
        ))}
      </div>
    </div>
  );
}

export function HomeServicesShowcase() {
  const t = useTranslations();
  const services = getLocalizedHomeServices(t);
  const spotlight = services.slice(0, 2);
  const allServices = services.slice(2);

  return (
    <div className="relative mt-12 sm:mt-14 lg:mt-16">
      <div
        className="pointer-events-none absolute -left-12 top-0 -z-10 h-64 w-64 bg-[radial-gradient(circle,rgba(198,164,108,0.08)_0%,transparent_70%)]"
        aria-hidden
      />

      <ServiceTileSection
        services={spotlight}
        startIndex={0}
        gridClassName="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
        imageSizes="(max-width: 640px) 100vw, 50vw"
        minHeight="min-h-[min(56vw,300px)] sm:min-h-[340px] lg:min-h-[380px]"
      />

      <ServiceTileSection
        label={t("home.mostRequested")}
        services={allServices}
        startIndex={2}
        gridClassName="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
