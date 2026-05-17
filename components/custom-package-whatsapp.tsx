"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { useLocale, useTranslations } from "@/components/locale-provider";
import { localizeCatalogText } from "@/lib/i18n/localize-catalog-text";

import {
  CHAUFFEUR_FLEET_SORTED,
  chauffeurPackageQuoteLine,
  chauffeurQuoteRateLine,
} from "@/lib/chauffeur-fleet-data";
import {
  EXOTIC_CARS_DAILY,
  EXOTIC_CARS_HOURLY_GROUPS,
  type ExoticCar,
} from "@/lib/exotic-cars-data";
import {
  ATV_TOURS,
  UTV_PRODUCTS,
  type AtvTourProduct,
  type UtvDurationOption,
  type UtvProduct,
} from "@/lib/atv-booking-data";
import {
  CHAUFFEUR_DEFAULT_DURATION_HOURS,
  CHAUFFEUR_DURATION_HOURS,
  formatUsd,
} from "@/lib/bookings";
import { CUSTOM_PACKAGE_MISC_ADDONS } from "@/lib/custom-package-addons";
import { JETSKIS_OFFERINGS } from "@/lib/jetskis-jetcars-data";
import {
  PRIVATE_CHEF_SERVICE_CARDS,
  PRIVATE_CHEFS_ROSTER,
} from "@/lib/private-chefs-data";
import { PRIVATE_JETS } from "@/lib/private-jets-data";
import {
  vipFeaturedVenues,
  vipSouthBeachClubs,
  vipTransport,
} from "@/lib/vip-nightlife-data";
import { VILLAS } from "@/lib/villas-data";
import {
  HOSTESS_HEADCOUNT_OPTIONS,
  YACHT_HOSTESS_ADDON,
} from "@/lib/yacht-hostess-addon";
import { YACHTS } from "@/lib/yachts-data";
import { whatsAppUrlWithText } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const btnPrimary =
  "inline-flex min-h-12 w-full items-center justify-center gap-2.5 border border-gold/40 bg-gold px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-45";

const inputClass =
  "w-full rounded-sm border border-gold/15 bg-[#0a0a0a] px-4 py-3 text-sm text-cream placeholder:text-cream/35 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/25";

const checkboxClass =
  "mt-0.5 size-4 shrink-0 rounded border-gold/30 bg-[#141414] text-gold focus:ring-gold/40";

/** “Interest only — pick later” toggles; counted in WhatsApp without naming a catalog item. */
const OPEN_TBD = {
  chauffeur: "open:chauffeur",
  exoticCar: "open:exoticCar",
  villa: "open:villa",
  yacht: "open:yacht",
  privateJet: "open:privateJet",
  atvUtv: "open:atvUtv",
  privateChef: "open:privateChef",
} as const;

function atvTourQuoteLine(
  tour: AtvTourProduct,
  l: (text: string) => string,
) {
  const price = `${formatUsd(tour.price)} ${l(tour.unit)}`;
  const duration = l(tour.duration);
  return tour.note
    ? `${duration} ATV — ${price} (${l(tour.note)})`
    : `${duration} ATV — ${price}`;
}

function utvOptionQuoteLine(
  utv: UtvProduct,
  option: UtvDurationOption,
  l: (text: string) => string,
) {
  return `${l(utv.title)} — ${l(option.duration)} — ${formatUsd(option.price)}`;
}

function PickRow({
  selected,
  onToggle,
  children,
  density = "normal",
}: {
  selected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  density?: "compact" | "normal";
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-sm border transition-colors",
        density === "compact" ? "px-3 py-2.5" : "px-4 py-3.5",
        selected
          ? "border-gold/35 bg-gold/[0.06]"
          : "border-gold/12 bg-[#0a0a0a]/80 hover:border-gold/22",
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className={checkboxClass}
      />
      <span className="text-[0.875rem] font-normal leading-snug text-cream/88 sm:text-[0.9375rem]">
        {children}
      </span>
    </label>
  );
}

function CatalogSection({
  title,
  subtitle,
  defaultOpen,
  badge,
  selectBadge,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  badge?: string;
  selectBadge: string;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="border border-gold/12 bg-[#070707]/90 [&_summary::-webkit-details-marker]:hidden open:[&>summary_svg]:rotate-180"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-gold/[0.04] sm:px-5">
        <div>
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/75">
            {badge ?? selectBadge}
          </p>
          <p className="mt-1 font-serif text-base tracking-tight text-cream sm:text-lg">
            {title}
          </p>
          {subtitle && (
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-cream/48">
              {subtitle}
            </p>
          )}
        </div>
        <ChevronDown className="size-5 shrink-0 text-gold/45 transition-transform duration-200" />
      </summary>
      <div className="border-t border-gold/10 px-3 pb-4 pt-3 sm:px-4 sm:pb-5">
        {children}
      </div>
    </details>
  );
}

function carLine(car: ExoticCar, l: (text: string) => string) {
  return (
    <>
      <span className="text-cream/92">{car.name}</span>
      <span className="text-cream/45"> · </span>
      <span className="tabular-nums text-gold-secondary/95">{l(car.priceLine)}</span>
    </>
  );
}

export type CustomPackageWhatsAppProps = {
  /** First line of the outgoing WhatsApp message */
  whatsAppIntroLine?: string;
  /** Short label above the inventory pickers */
  buildHeading?: string;
  /** Supporting text under the build heading */
  buildDescription?: string;
  /** Appended to form field ids when multiple instances exist on one page */
  idSuffix?: string;
};

export function CustomPackageWhatsApp({
  whatsAppIntroLine,
  buildHeading,
  buildDescription,
  idSuffix = "",
}: CustomPackageWhatsAppProps = {}) {
  const { locale } = useLocale();
  const t = useTranslations();
  const l = useCallback(
    (text: string) => localizeCatalogText(text, locale),
    [locale],
  );
  const pb = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      t(`packageBuilder.${key}`, params),
    [t],
  );

  const resolvedIntro =
    whatsAppIntroLine ?? pb("defaultIntro");
  const resolvedBuildHeading = buildHeading ?? pb("defaultBuildHeading");
  const resolvedBuildDescription =
    buildDescription ?? pb("defaultBuildDescription");
  const selectBadge = pb("select");

  const openTbdLine = useCallback(
    (key: string) => {
      const map: Record<string, string> = {
        [OPEN_TBD.chauffeur]: pb("openTbdChauffeur"),
        [OPEN_TBD.exoticCar]: pb("openTbdExoticCar"),
        [OPEN_TBD.villa]: pb("openTbdVilla"),
        [OPEN_TBD.yacht]: pb("openTbdYacht"),
        [OPEN_TBD.privateJet]: pb("openTbdPrivateJet"),
        [OPEN_TBD.atvUtv]: pb("openTbdAtvUtv"),
        [OPEN_TBD.privateChef]: pb("openTbdPrivateChef"),
      };
      return map[key] ?? key;
    },
    [pb],
  );

  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [chauffeurHours, setChauffeurHours] = useState<Record<string, number>>(
    {},
  );
  const [dates, setDates] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [notes, setNotes] = useState("");
  const [hostessCount, setHostessCount] = useState<string>(
    HOSTESS_HEADCOUNT_OPTIONS[0],
  );
  const [securityMode, setSecurityMode] = useState<
    null | "armed" | "unarmed"
  >(null);
  const sid = idSuffix ? `-${idSuffix}` : "";
  const [creatingQuoteRequest, setCreatingQuoteRequest] = useState(false);
  const [quoteRequestError, setQuoteRequestError] = useState<string | null>(
    null,
  );

  const toggle = useCallback((key: string) => {
    setSel((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleChauffeur = useCallback((carId: string) => {
    const key = `chauffeur:${carId}`;
    setSel((prev) => {
      const enabling = !prev[key];
      if (enabling) {
        setChauffeurHours((hours) => ({
          ...hours,
          [carId]: hours[carId] ?? CHAUFFEUR_DEFAULT_DURATION_HOURS,
        }));
      }
      return { ...prev, [key]: enabling };
    });
  }, []);

  const setChauffeurDuration = useCallback((carId: string, hours: number) => {
    setChauffeurHours((prev) => ({ ...prev, [carId]: hours }));
  }, []);

  const anyYachtSelected = useMemo(
    () =>
      YACHTS.some((y) => sel[`yacht:${y.id}`]) || !!sel[OPEN_TBD.yacht],
    [sel],
  );

  const hasSelection = useMemo(
    () =>
      Object.values(sel).some(Boolean) ||
      securityMode === "armed" ||
      securityMode === "unarmed",
    [sel, securityMode],
  );

  const message = useMemo(() => {
    const lines: string[] = [resolvedIntro, ""];
    if (groupSize.trim()) {
      lines.push(pb("msgGroupSize", { value: groupSize.trim() }));
    }
    if (dates.trim()) {
      lines.push(pb("msgDates", { value: dates.trim() }));
    }
    if (groupSize.trim() || dates.trim()) lines.push("");

    const cars: ExoticCar[] = [];
    for (const g of EXOTIC_CARS_HOURLY_GROUPS) {
      for (const c of g.cars) {
        if (sel[`car:${c.id}`]) cars.push(c);
      }
    }
    for (const c of EXOTIC_CARS_DAILY) {
      if (sel[`car:${c.id}`]) cars.push(c);
    }

    const chauffeurPicks = CHAUFFEUR_FLEET_SORTED.filter(
      (c) => sel[`chauffeur:${c.id}`],
    );
    const chauffeurPrefs = vipTransport.options.filter(
      (_, i) => sel[`chauffOpt:${i}`],
    );

    const villas = VILLAS.filter((v) => sel[`villa:${v.id}`]);
    const yachts = YACHTS.filter((y) => sel[`yacht:${y.id}`]);
    const jetskiPicks = JETSKIS_OFFERINGS.filter((_, i) => sel[`jetski:${i}`]);
    const miscAddonPicks = CUSTOM_PACKAGE_MISC_ADDONS.filter(
      (a) => !!sel[`addon:${a.id}`],
    );

    const vipFeat = vipFeaturedVenues.filter((v) => sel[`vip:${v.name}`]);
    const vipSb = vipSouthBeachClubs.filter((_, i) => sel[`vipsb:${i}`]);

    const selectedPrivateJets = PRIVATE_JETS.filter((j) => sel[`pj:${j.id}`]);

    const atvPicks = ATV_TOURS.filter((t) => sel[`atv:${t.id}`]);
    const utvPicks: { utv: UtvProduct; option: UtvDurationOption }[] = [];
    for (const utv of UTV_PRODUCTS) {
      for (const option of utv.options) {
        if (sel[`utv:${utv.id}:${option.id}`]) {
          utvPicks.push({ utv, option });
        }
      }
    }

    const chefServicePicks = PRIVATE_CHEF_SERVICE_CARDS.filter(
      (s) => sel[`chefService:${s.id}`],
    );
    const chefRosterPicks = PRIVATE_CHEFS_ROSTER.filter(
      (c) => sel[`chef:${c.id}`],
    );

    const sections: { title: string; items: string[] }[] = [];

    if (
      chauffeurPicks.length > 0 ||
      chauffeurPrefs.length > 0 ||
      sel[OPEN_TBD.chauffeur]
    ) {
      const items: string[] = [];
      if (sel[OPEN_TBD.chauffeur]) {
        items.push(openTbdLine(OPEN_TBD.chauffeur));
      }
      if (chauffeurPicks.length > 0) {
        items.push(
          ...chauffeurPicks.map((c) =>
            l(
              chauffeurPackageQuoteLine(
                c,
                chauffeurHours[c.id] ?? CHAUFFEUR_DEFAULT_DURATION_HOURS,
              ),
            ),
          ),
        );
      }
      if (chauffeurPrefs.length > 0) {
        items.push(
          pb("msgVehiclePrefs", {
            value: chauffeurPrefs.map((p) => l(p)).join(", "),
          }),
        );
      }
      sections.push({
        title: pb("msgSectionChauffeur"),
        items,
      });
    }

    if (cars.length > 0 || sel[OPEN_TBD.exoticCar]) {
      const items: string[] = [];
      if (sel[OPEN_TBD.exoticCar]) {
        items.push(openTbdLine(OPEN_TBD.exoticCar));
      }
      if (cars.length > 0) {
        items.push(
          ...cars.map(
            (c) =>
              `${c.name} — ${l(c.priceLine)} (${c.section === "daily" ? pb("msgDailyRental") : pb("msgHourlyRental")})`,
          ),
        );
      }
      sections.push({
        title: pb("msgSectionExoticCars"),
        items,
      });
    }

    if (villas.length > 0 || sel[OPEN_TBD.villa]) {
      const items: string[] = [];
      if (sel[OPEN_TBD.villa]) {
        items.push(openTbdLine(OPEN_TBD.villa));
      }
      if (villas.length > 0) {
        items.push(
          ...villas.map((v) => `${v.name} — ${l(v.cardTagline)}`),
        );
      }
      sections.push({
        title: pb("msgSectionVillas"),
        items,
      });
    }

    if (yachts.length > 0 || sel[OPEN_TBD.yacht]) {
      const items: string[] = [];
      if (sel[OPEN_TBD.yacht]) {
        items.push(openTbdLine(OPEN_TBD.yacht));
      }
      if (yachts.length > 0) {
        items.push(
          ...yachts.map(
            (y) =>
              `${y.name} (${l(y.subtitle)}) — ${l(y.cardPriceLine)}`,
          ),
        );
      }
      sections.push({
        title: pb("msgSectionYachts"),
        items,
      });
    }

    if (sel.hostessAddon) {
      sections.push({
        title: pb("msgSectionHostess"),
        items: [
          pb("msgHostessRequested", {
            count: hostessCount,
            price: YACHT_HOSTESS_ADDON.startingPrice,
          }),
          pb("msgHostessRoster"),
        ],
      });
    }

    if (jetskiPicks.length > 0) {
      sections.push({
        title: pb("msgSectionJetskis"),
        items: jetskiPicks.map((j) => l(j.title)),
      });
    }

    if (atvPicks.length > 0 || utvPicks.length > 0 || sel[OPEN_TBD.atvUtv]) {
      const items: string[] = [];
      if (sel[OPEN_TBD.atvUtv]) {
        items.push(openTbdLine(OPEN_TBD.atvUtv));
      }
      if (atvPicks.length > 0) {
        items.push(...atvPicks.map((tour) => atvTourQuoteLine(tour, l)));
      }
      if (utvPicks.length > 0) {
        items.push(
          ...utvPicks.map(({ utv, option }) => utvOptionQuoteLine(utv, option, l)),
        );
      }
      sections.push({
        title: pb("msgSectionAtv"),
        items,
      });
    }

    if (
      chefServicePicks.length > 0 ||
      chefRosterPicks.length > 0 ||
      sel[OPEN_TBD.privateChef]
    ) {
      const items: string[] = [];
      if (sel[OPEN_TBD.privateChef]) {
        items.push(openTbdLine(OPEN_TBD.privateChef));
      }
      if (chefServicePicks.length > 0) {
        items.push(
          ...chefServicePicks.map(
            (s) => `${l(s.title)} — ${l(s.eyebrow)}`,
          ),
        );
      }
      if (chefRosterPicks.length > 0) {
        items.push(
          ...chefRosterPicks.map((c) => `${c.name} — ${l(c.role)}`),
        );
      }
      sections.push({
        title: pb("msgSectionChefs"),
        items,
      });
    }

    if (miscAddonPicks.length > 0) {
      sections.push({
        title: pb("msgSectionAddons"),
        items: miscAddonPicks.map((a) =>
          a.hint ? `${l(a.title)} — ${l(a.hint)}` : l(a.title),
        ),
      });
    }

    if (securityMode === "unarmed") {
      sections.push({
        title: pb("msgSectionSecurity"),
        items: [pb("msgSectionUnarmed")],
      });
    } else if (securityMode === "armed") {
      sections.push({
        title: pb("msgSectionSecurity"),
        items: [pb("msgSectionArmed")],
      });
    }

    if (selectedPrivateJets.length > 0 || sel[OPEN_TBD.privateJet]) {
      const items: string[] = [];
      if (sel[OPEN_TBD.privateJet]) {
        items.push(openTbdLine(OPEN_TBD.privateJet));
      }
      if (selectedPrivateJets.length > 0) {
        items.push(
          ...selectedPrivateJets.map((j) =>
            pb("msgJetCharter", {
              name: j.name,
              category: l(j.categoryLabel),
            }),
          ),
        );
      }
      sections.push({
        title: pb("msgSectionJets"),
        items,
      });
    }

    if (vipFeat.length > 0 || vipSb.length > 0) {
      const items = [
        ...vipFeat.map((v) =>
          v.subtitle ? `${v.name} (${v.subtitle})` : v.name,
        ),
        ...vipSb,
      ];
      sections.push({
        title: pb("msgSectionVip"),
        items,
      });
    }

    if (sel.photoShoot) {
      sections.push({
        title: pb("msgSectionPhoto"),
        items: [pb("msgPhotoItem")],
      });
    }
    if (sel.videoShoot) {
      sections.push({
        title: pb("msgSectionVideo"),
        items: [pb("msgVideoItem")],
      });
    }

    if (sections.length === 0) {
      lines.push(pb("msgNothingSelected"));
    } else {
      for (const block of sections) {
        lines.push(block.title.toUpperCase());
        for (const item of block.items) {
          lines.push(`• ${item}`);
        }
        lines.push("");
      }
      lines.pop();
    }

    if (notes.trim()) {
      lines.push("");
      lines.push(pb("msgNotes", { value: notes.trim() }));
    }
    lines.push("");
    lines.push(pb("msgClosing"));
    return lines.join("\n");
  }, [
    chauffeurHours,
    dates,
    groupSize,
    hostessCount,
    notes,
    l,
    openTbdLine,
    pb,
    resolvedIntro,
    sel,
    securityMode,
  ]);

  const href = whatsAppUrlWithText(message);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`custom-dates${sid}`}
            className="block text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/75"
          >
            {pb("travelDates")}
          </label>
          <input
            id={`custom-dates${sid}`}
            type="text"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            placeholder={pb("travelDatesPlaceholder")}
            className={cn(inputClass, "mt-2")}
            autoComplete="off"
          />
        </div>
        <div>
          <label
            htmlFor={`custom-group${sid}`}
            className="block text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/75"
          >
            {pb("groupSize")}
          </label>
          <input
            id={`custom-group${sid}`}
            type="text"
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
            placeholder={pb("groupSizePlaceholder")}
            className={cn(inputClass, "mt-2")}
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/75">
          {resolvedBuildHeading}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-cream/52">
          {resolvedBuildDescription}
        </p>

        <div className="mt-5 space-y-3">
          <CatalogSection
            title={pb("secChauffeurTitle")}
            subtitle={pb("secChauffeurSubtitle")}
            defaultOpen
            badge={pb("secChauffeurBadge")}
            selectBadge={selectBadge}
          >
            <div className="max-h-[min(70vh,520px)] space-y-6 overflow-y-auto pr-1">
              <PickRow
                selected={!!sel[OPEN_TBD.chauffeur]}
                onToggle={() => toggle(OPEN_TBD.chauffeur)}
              >
                <>
                  <span className="text-cream/92">
                    {pb("secChauffeurInterested")}
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    {pb("secChauffeurInterestedHint")}
                  </span>
                </>
              </PickRow>
              <ul className="grid gap-2" role="list">
                {CHAUFFEUR_FLEET_SORTED.map((car) => {
                  const chauffeurSelected = !!sel[`chauffeur:${car.id}`];
                  const duration =
                    chauffeurHours[car.id] ?? CHAUFFEUR_DEFAULT_DURATION_HOURS;
                  return (
                    <li key={car.id} className="space-y-2">
                      <PickRow
                        selected={chauffeurSelected}
                        onToggle={() => toggleChauffeur(car.id)}
                        density="compact"
                      >
                        <>
                          <span className="text-cream/92">{car.name}</span>
                          <span className="text-cream/45"> · </span>
                          <span className="tabular-nums text-gold-secondary/95">
                            {l(chauffeurQuoteRateLine(car))}
                          </span>
                          <span className="block text-[0.75rem] text-cream/42">
                            {l(car.group)} · {pb("chauffeurLabel")}
                          </span>
                        </>
                      </PickRow>
                      {chauffeurSelected ? (
                        <div className="pl-7">
                          <label
                            htmlFor={`chauffeur-hours-${car.id}${sid}`}
                            className="block text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
                          >
                            {pb("duration")}
                          </label>
                          <select
                            id={`chauffeur-hours-${car.id}${sid}`}
                            value={duration}
                            onChange={(e) =>
                              setChauffeurDuration(
                                car.id,
                                Number.parseInt(e.target.value, 10),
                              )
                            }
                            className={cn(
                              inputClass,
                              "mt-1.5 appearance-none bg-[#0a0a0a]",
                            )}
                          >
                            {CHAUFFEUR_DURATION_HOURS.map((hours) => (
                              <option key={hours} value={hours}>
                                {pb("hours", { count: hours })}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <div>
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/38">
                  {pb("vehiclePrefs")}
                </p>
                <ul className="grid gap-2 sm:grid-cols-2" role="list">
                  {vipTransport.options.map((opt, i) => (
                    <li key={opt}>
                      <PickRow
                        selected={!!sel[`chauffOpt:${i}`]}
                        onToggle={() => toggle(`chauffOpt:${i}`)}
                        density="compact"
                      >
                        {l(opt)}
                      </PickRow>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CatalogSection>

          <CatalogSection
            title={pb("secExoticTitle")}
            subtitle={pb("secExoticSubtitle")}
            badge={pb("secExoticBadge")}
            selectBadge={selectBadge}
          >
            <div className="max-h-[min(70vh,520px)] space-y-6 overflow-y-auto pr-1">
              <PickRow
                selected={!!sel[OPEN_TBD.exoticCar]}
                onToggle={() => toggle(OPEN_TBD.exoticCar)}
              >
                <>
                  <span className="text-cream/92">
                    {pb("secExoticInterested")}
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    {pb("secExoticInterestedHint")}
                  </span>
                </>
              </PickRow>
              {EXOTIC_CARS_HOURLY_GROUPS.length === 0 &&
              EXOTIC_CARS_DAILY.length === 0 ? (
                <p className="text-sm leading-relaxed text-cream/48">
                  {pb("fleetUpdating")}
                </p>
              ) : (
                <>
                  {EXOTIC_CARS_HOURLY_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
                        {l(group.title)}
                      </p>
                      <ul className="grid gap-2" role="list">
                        {group.cars.map((car) => (
                          <li key={car.id}>
                            <PickRow
                              selected={!!sel[`car:${car.id}`]}
                              onToggle={() => toggle(`car:${car.id}`)}
                              density="compact"
                            >
                              {carLine(car, l)}
                            </PickRow>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div>
                    <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
                      {pb("dailySelfDrive")}
                    </p>
                    <ul className="grid gap-2" role="list">
                      {EXOTIC_CARS_DAILY.map((car) => (
                        <li key={car.id}>
                          <PickRow
                            selected={!!sel[`car:${car.id}`]}
                            onToggle={() => toggle(`car:${car.id}`)}
                            density="compact"
                          >
                            {carLine(car, l)}
                          </PickRow>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </CatalogSection>

          <CatalogSection
            title={pb("secVillaTitle")}
            subtitle={pb("secVillaSubtitle")}
            badge={pb("secVillaBadge")}
            selectBadge={selectBadge}
          >
            <div className="max-h-[min(70vh,520px)] space-y-6 overflow-y-auto pr-1">
              <PickRow
                selected={!!sel[OPEN_TBD.villa]}
                onToggle={() => toggle(OPEN_TBD.villa)}
              >
                <>
                  <span className="text-cream/92">
                    {pb("secVillaInterested")}
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    {pb("secVillaInterestedHint")}
                  </span>
                </>
              </PickRow>
              {VILLAS.length === 0 ? (
                <p className="text-sm leading-relaxed text-cream/48">
                  {pb("villaInventoryUpdating")}
                </p>
              ) : (
                <ul className="grid gap-2" role="list">
                  {VILLAS.map((v) => (
                    <li key={v.id}>
                      <PickRow
                        selected={!!sel[`villa:${v.id}`]}
                        onToggle={() => toggle(`villa:${v.id}`)}
                        density="compact"
                      >
                        <>
                          <span className="text-cream/92">{v.name}</span>
                          <span className="block text-[0.75rem] text-cream/42">
                            {l(v.cardTagline)} · {l(v.subtitle)}
                          </span>
                        </>
                      </PickRow>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CatalogSection>

          <CatalogSection
            title={pb("secYachtTitle")}
            subtitle={pb("secYachtSubtitle")}
            badge={pb("secYachtBadge")}
            selectBadge={selectBadge}
          >
            <div className="space-y-4">
              <PickRow
                selected={!!sel[OPEN_TBD.yacht]}
                onToggle={() => toggle(OPEN_TBD.yacht)}
              >
                <>
                  <span className="text-cream/92">
                    {pb("secYachtInterested")}
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    {pb("secYachtInterestedHint")}
                  </span>
                </>
              </PickRow>
              <div className="max-h-[min(65vh,560px)] overflow-y-auto pr-1">
              <ul className="grid gap-2" role="list">
                {YACHTS.map((y) => (
                  <li key={y.id}>
                    <PickRow
                      selected={!!sel[`yacht:${y.id}`]}
                      onToggle={() => toggle(`yacht:${y.id}`)}
                    >
                      <>
                        <span className="text-cream/92">{y.name}</span>
                        <span className="block text-[0.8125rem] text-cream/50">
                          {l(y.subtitle)} — {l(y.cardPriceLine)}
                        </span>
                      </>
                    </PickRow>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </CatalogSection>

          <div
            className={cn(
              anyYachtSelected &&
                "rounded-sm p-0.5 ring-1 ring-gold/22",
            )}
          >
            <CatalogSection
              title={pb("secHostessTitle")}
              subtitle={pb("secHostessSubtitle", {
                price: YACHT_HOSTESS_ADDON.startingPrice,
                max: YACHT_HOSTESS_ADDON.maxCapacityLabel,
              })}
              badge={pb("secHostessBadge")}
              selectBadge={selectBadge}
            >
              <PickRow
                selected={!!sel.hostessAddon}
                onToggle={() => toggle("hostessAddon")}
              >
                <span className="text-cream/92">
                  {pb("secHostessInclude")}
                </span>
                <span className="block text-[0.8125rem] text-cream/50">
                  {pb("secHostessStarting", {
                    price: YACHT_HOSTESS_ADDON.startingPrice,
                  })}
                </span>
              </PickRow>
              {sel.hostessAddon ? (
                <div className="mt-4">
                  <label
                    htmlFor={`hostess-count${sid}`}
                    className="block text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/75"
                  >
                    {pb("howManyWomen")}
                  </label>
                  <select
                    id={`hostess-count${sid}`}
                    value={hostessCount}
                    onChange={(e) => setHostessCount(e.target.value)}
                    className={cn(inputClass, "mt-2 appearance-none bg-[#0a0a0a]")}
                  >
                    {HOSTESS_HEADCOUNT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </CatalogSection>
          </div>

          <CatalogSection
            title={pb("secJetskiTitle")}
            subtitle={pb("secJetskiSubtitle")}
            badge={pb("secJetskiBadge")}
            selectBadge={selectBadge}
          >
            <ul className="grid gap-2 sm:grid-cols-2" role="list">
              {JETSKIS_OFFERINGS.map((j, i) => (
                <li key={j.title}>
                  <PickRow
                    selected={!!sel[`jetski:${i}`]}
                    onToggle={() => toggle(`jetski:${i}`)}
                  >
                    <span className="text-cream/92">{l(j.title)}</span>
                  </PickRow>
                </li>
              ))}
            </ul>
          </CatalogSection>

          <CatalogSection
            title={pb("secAtvTitle")}
            subtitle={pb("secAtvSubtitle")}
            badge={pb("secAtvBadge")}
            selectBadge={selectBadge}
          >
            <div className="space-y-5">
              <PickRow
                selected={!!sel[OPEN_TBD.atvUtv]}
                onToggle={() => toggle(OPEN_TBD.atvUtv)}
              >
                <>
                  <span className="text-cream/92">
                    {pb("secAtvInterested")}
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    {pb("secAtvInterestedHint")}
                  </span>
                </>
              </PickRow>

              <div>
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
                  {pb("atvRiders")}
                </p>
                <ul className="grid gap-2" role="list">
                  {ATV_TOURS.map((tour) => (
                    <li key={tour.id}>
                      <PickRow
                        selected={!!sel[`atv:${tour.id}`]}
                        onToggle={() => toggle(`atv:${tour.id}`)}
                        density="compact"
                      >
                        <>
                          <span className="text-cream/92">
                            {l(tour.duration)} ATV
                          </span>
                          <span className="text-cream/45"> · </span>
                          <span className="tabular-nums text-gold-secondary/95">
                            {formatUsd(tour.price)} {l(tour.unit)}
                          </span>
                          {tour.note ? (
                            <span className="block text-[0.75rem] text-cream/42">
                              {l(tour.note)}
                            </span>
                          ) : null}
                        </>
                      </PickRow>
                    </li>
                  ))}
                </ul>
              </div>

              {UTV_PRODUCTS.map((utv) => (
                <div key={utv.id}>
                  <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
                    {l(utv.title)}
                    <span className="font-normal normal-case tracking-normal text-cream/38">
                      {" "}
                      · {l(utv.tagline)}
                    </span>
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2" role="list">
                    {utv.options.map((option) => (
                      <li key={option.id}>
                        <PickRow
                          selected={!!sel[`utv:${utv.id}:${option.id}`]}
                          onToggle={() =>
                            toggle(`utv:${utv.id}:${option.id}`)
                          }
                          density="compact"
                        >
                          <>
                            <span className="text-cream/92">
                              {l(option.duration)}
                            </span>
                            <span className="text-cream/45"> · </span>
                            <span className="tabular-nums text-gold-secondary/95">
                              {formatUsd(option.price)}
                            </span>
                          </>
                        </PickRow>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CatalogSection>

          <CatalogSection
            title={pb("secChefTitle")}
            subtitle={pb("secChefSubtitle")}
            badge={pb("secChefBadge")}
            selectBadge={selectBadge}
          >
            <div className="space-y-5">
              <PickRow
                selected={!!sel[OPEN_TBD.privateChef]}
                onToggle={() => toggle(OPEN_TBD.privateChef)}
              >
                <>
                  <span className="text-cream/92">
                    {pb("secChefInterested")}
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    {pb("secChefInterestedHint")}
                  </span>
                </>
              </PickRow>

              <div>
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
                  {pb("serviceType")}
                </p>
                <ul className="grid gap-2 sm:grid-cols-2" role="list">
                  {PRIVATE_CHEF_SERVICE_CARDS.map((card) => (
                    <li key={card.id}>
                      <PickRow
                        selected={!!sel[`chefService:${card.id}`]}
                        onToggle={() => toggle(`chefService:${card.id}`)}
                        density="compact"
                      >
                        <>
                          <span className="text-cream/92">{l(card.title)}</span>
                          <span className="block text-[0.75rem] text-cream/42">
                            {l(card.eyebrow)}
                          </span>
                        </>
                      </PickRow>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
                  {pb("chefsRoster")}
                </p>
                <ul className="grid gap-2" role="list">
                  {PRIVATE_CHEFS_ROSTER.map((chef) => (
                    <li key={chef.id}>
                      <PickRow
                        selected={!!sel[`chef:${chef.id}`]}
                        onToggle={() => toggle(`chef:${chef.id}`)}
                      >
                        <>
                          <span className="text-cream/92">{chef.name}</span>
                          <span className="block text-[0.8125rem] text-cream/50">
                            {l(chef.role)}
                            {!chef.available ? ` ${pb("comingSoon")}` : ""}
                          </span>
                        </>
                      </PickRow>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CatalogSection>

          <CatalogSection
            title={pb("secMiscTitle")}
            subtitle={pb("secMiscSubtitle")}
            badge={pb("secMiscBadge")}
            selectBadge={selectBadge}
          >
            <ul className="grid gap-2 sm:grid-cols-1 lg:grid-cols-2" role="list">
              {CUSTOM_PACKAGE_MISC_ADDONS.map((a) => (
                <li key={a.id}>
                  <PickRow
                    selected={!!sel[`addon:${a.id}`]}
                    onToggle={() => toggle(`addon:${a.id}`)}
                  >
                    <>
                      <span className="text-cream/92">{l(a.title)}</span>
                      <span className="block text-[0.8125rem] text-cream/50">
                        {l(a.hint)}
                      </span>
                    </>
                  </PickRow>
                </li>
              ))}
            </ul>
          </CatalogSection>

          <CatalogSection
            title={pb("secSecurityTitle")}
            subtitle={pb("secSecuritySubtitle")}
            badge={pb("secSecurityBadge")}
            selectBadge={selectBadge}
          >
            <fieldset>
              <legend className="sr-only">{pb("securityLegend")}</legend>
              <div className="space-y-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3.5 transition-colors",
                    securityMode === null
                      ? "border-gold/35 bg-gold/[0.06]"
                      : "border-gold/12 bg-[#0a0a0a]/80 hover:border-gold/22",
                  )}
                >
                  <input
                    type="radio"
                    name={`security-mode${sid}`}
                    checked={securityMode === null}
                    onChange={() => setSecurityMode(null)}
                    className={checkboxClass}
                  />
                  <span className="text-[0.875rem] leading-snug text-cream/88">
                    {pb("notRequestingSecurity")}
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3.5 transition-colors",
                    securityMode === "unarmed"
                      ? "border-gold/35 bg-gold/[0.06]"
                      : "border-gold/12 bg-[#0a0a0a]/80 hover:border-gold/22",
                  )}
                >
                  <input
                    type="radio"
                    name={`security-mode${sid}`}
                    checked={securityMode === "unarmed"}
                    onChange={() => setSecurityMode("unarmed")}
                    className={checkboxClass}
                  />
                  <span className="text-[0.875rem] leading-snug text-cream/88">
                    {pb("unarmedGuards")}
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3.5 transition-colors",
                    securityMode === "armed"
                      ? "border-gold/35 bg-gold/[0.06]"
                      : "border-gold/12 bg-[#0a0a0a]/80 hover:border-gold/22",
                  )}
                >
                  <input
                    type="radio"
                    name={`security-mode${sid}`}
                    checked={securityMode === "armed"}
                    onChange={() => setSecurityMode("armed")}
                    className={checkboxClass}
                  />
                  <span className="text-[0.875rem] leading-snug text-cream/88">
                    {pb("armedGuards")}
                  </span>
                </label>
              </div>
            </fieldset>
          </CatalogSection>

          <CatalogSection
            title={pb("secJetTitle")}
            subtitle={pb("secJetSubtitle")}
            badge={pb("secJetBadge")}
            selectBadge={selectBadge}
          >
            <div className="space-y-4">
              <PickRow
                selected={!!sel[OPEN_TBD.privateJet]}
                onToggle={() => toggle(OPEN_TBD.privateJet)}
              >
                <>
                  <span className="text-cream/92">
                    {pb("secJetInterested")}
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    {pb("secJetInterestedHint")}
                  </span>
                </>
              </PickRow>
              <div className="max-h-[min(60vh,480px)] overflow-y-auto pr-1">
              <ul className="grid gap-2" role="list">
                {PRIVATE_JETS.map((j) => (
                  <li key={j.id}>
                    <PickRow
                      selected={!!sel[`pj:${j.id}`]}
                      onToggle={() => toggle(`pj:${j.id}`)}
                      density="compact"
                    >
                      <>
                        <span className="text-cream/92">{j.name}</span>
                        <span className="block text-[0.8125rem] text-cream/50">
                          {l(j.categoryLabel)} · {l(j.passengers)}
                        </span>
                      </>
                    </PickRow>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </CatalogSection>

          <CatalogSection
            title={pb("secVipTitle")}
            subtitle={pb("secVipSubtitle")}
            badge={pb("secVipBadge")}
            selectBadge={selectBadge}
          >
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/38">
              {pb("featuredVenues")}
            </p>
            <ul className="mb-6 grid gap-2 sm:grid-cols-2" role="list">
              {vipFeaturedVenues.map((v) => (
                <li key={v.name}>
                  <PickRow
                    selected={!!sel[`vip:${v.name}`]}
                    onToggle={() => toggle(`vip:${v.name}`)}
                    density="compact"
                  >
                    {v.subtitle ? `${v.name} · ${v.subtitle}` : v.name}
                  </PickRow>
                </li>
              ))}
            </ul>
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/38">
              {pb("southBeach")}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2" role="list">
              {vipSouthBeachClubs.map((name, i) => (
                <li key={name}>
                  <PickRow
                    selected={!!sel[`vipsb:${i}`]}
                    onToggle={() => toggle(`vipsb:${i}`)}
                    density="compact"
                  >
                    {name}
                  </PickRow>
                </li>
              ))}
            </ul>
          </CatalogSection>

          <CatalogSection
            title={pb("secMediaTitle")}
            subtitle={pb("secMediaSubtitle")}
            badge={pb("secMediaBadge")}
            selectBadge={selectBadge}
          >
            <ul className="grid gap-2" role="list">
              <li>
                <PickRow
                  selected={!!sel.photoShoot}
                  onToggle={() => toggle("photoShoot")}
                >
                  <span className="text-cream/92">{pb("secPhotoShoot")}</span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    {pb("secPhotoHint")}
                  </span>
                </PickRow>
              </li>
              <li>
                <PickRow
                  selected={!!sel.videoShoot}
                  onToggle={() => toggle("videoShoot")}
                >
                  <span className="text-cream/92">{pb("secVideoShoot")}</span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    {pb("secVideoHint")}
                  </span>
                </PickRow>
              </li>
            </ul>
          </CatalogSection>
        </div>
      </div>

      <div>
        <label
          htmlFor={`custom-notes${sid}`}
          className="block text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/75"
        >
          {pb("extraDetail")}
        </label>
        <textarea
          id={`custom-notes${sid}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={pb("notesPlaceholder")}
          rows={4}
          className={cn(inputClass, "mt-2 resize-y")}
        />
      </div>

      <div className="border-t border-gold/10 pt-8">
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/65">
          {pb("previewLabel")}
        </p>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-sm border border-gold/12 bg-[#070707] p-4 text-[0.8125rem] leading-relaxed text-cream/65">
          {message}
        </pre>
        {quoteRequestError ? (
          <p className="mt-3 text-center text-[0.75rem] text-red-300/90">
            {quoteRequestError}
          </p>
        ) : null}
        {hasSelection ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(btnPrimary, "mt-6")}
            onClick={async (e) => {
              e.preventDefault();
              if (!hasSelection || creatingQuoteRequest) return;

              setQuoteRequestError(null);
              setCreatingQuoteRequest(true);
              try {
                await fetch("/api/quote-requests/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    message,
                    summary: resolvedIntro,
                    source: "whatsapp",
                  }),
                });
              } catch (err) {
                setQuoteRequestError(
                  err instanceof Error
                    ? err.message
                    : pb("quoteError"),
                );
              } finally {
                setCreatingQuoteRequest(false);
                window.open(href, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <WhatsAppIcon className="size-5 shrink-0 text-[#0b0b0b]" />
            {creatingQuoteRequest ? pb("requestingQuote") : pb("openWhatsapp")}
          </a>
        ) : (
          <p className="mt-6">
            <span
              className={cn(btnPrimary, "cursor-not-allowed opacity-45")}
              aria-disabled
            >
              <WhatsAppIcon className="size-5 shrink-0 text-[#0b0b0b]" />
              {pb("openWhatsapp")}
            </span>
          </p>
        )}
        {!hasSelection && (
          <p className="mt-3 text-center text-[0.75rem] text-cream/45">
            {pb("enableHint")}
          </p>
        )}
      </div>
    </div>
  );
}
