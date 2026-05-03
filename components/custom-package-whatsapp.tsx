"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import {
  CHAUFFEUR_FLEET_SORTED,
  chauffeurQuoteRateLine,
} from "@/lib/chauffeur-fleet-data";
import {
  EXOTIC_CARS_DAILY,
  EXOTIC_CARS_HOURLY_GROUPS,
  type ExoticCar,
} from "@/lib/exotic-cars-data";
import { CUSTOM_PACKAGE_MISC_ADDONS } from "@/lib/custom-package-addons";
import { JETSKIS_OFFERINGS } from "@/lib/jetskis-jetcars-data";
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
  YACHT_HOSTESS_ADDON_SECTION_TITLE,
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
} as const;

const OPEN_TBD_MESSAGE_LINE: Record<string, string> = {
  [OPEN_TBD.chauffeur]:
    "Chauffeur — specific vehicle not chosen yet; open to recommendations from your fleet",
  [OPEN_TBD.exoticCar]:
    "Exotic car — specific model not chosen yet; open to options",
  [OPEN_TBD.villa]:
    "Villa / stay — property not chosen yet; open to recommendations for our dates & group",
  [OPEN_TBD.yacht]:
    "Yacht charter — vessel not chosen yet; open to recommendations",
  [OPEN_TBD.privateJet]:
    "Private jet charter — aircraft not chosen yet; open to recommendations (route & timing in notes)",
};

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
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  badge?: string;
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
            {badge ?? "Select"}
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

function carLine(car: ExoticCar) {
  return (
    <>
      <span className="text-cream/92">{car.name}</span>
      <span className="text-cream/45"> · </span>
      <span className="tabular-nums text-gold-secondary/95">{car.priceLine}</span>
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

const DEFAULT_INTRO =
  "Hi Blackline — I'd like a custom Miami concierge package.";

export function CustomPackageWhatsApp({
  whatsAppIntroLine = DEFAULT_INTRO,
  buildHeading = "Build your package",
  buildDescription = "Choose specific cars, villas, yachts, and venues — the same inventory as on the site. Open each section and tick what you want quoted together.",
  idSuffix = "",
}: CustomPackageWhatsAppProps = {}) {
  const [sel, setSel] = useState<Record<string, boolean>>({});
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
    const lines: string[] = [whatsAppIntroLine, ""];
    if (groupSize.trim()) lines.push(`Group size: ${groupSize.trim()}`);
    if (dates.trim()) lines.push(`Dates: ${dates.trim()}`);
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

    const sections: { title: string; items: string[] }[] = [];

    if (
      chauffeurPicks.length > 0 ||
      chauffeurPrefs.length > 0 ||
      sel[OPEN_TBD.chauffeur]
    ) {
      const items: string[] = [];
      if (sel[OPEN_TBD.chauffeur]) {
        items.push(OPEN_TBD_MESSAGE_LINE[OPEN_TBD.chauffeur]);
      }
      if (chauffeurPicks.length > 0) {
        items.push(
          ...chauffeurPicks.map(
            (c) =>
              `${c.name} — ${chauffeurQuoteRateLine(c)} (chauffeur)`,
          ),
        );
      }
      if (chauffeurPrefs.length > 0) {
        items.push(
          `Vehicle / ground preferences: ${chauffeurPrefs.join(", ")}`,
        );
      }
      sections.push({
        title: "Chauffeur services",
        items,
      });
    }

    if (cars.length > 0 || sel[OPEN_TBD.exoticCar]) {
      const items: string[] = [];
      if (sel[OPEN_TBD.exoticCar]) {
        items.push(OPEN_TBD_MESSAGE_LINE[OPEN_TBD.exoticCar]);
      }
      if (cars.length > 0) {
        items.push(
          ...cars.map(
            (c) =>
              `${c.name} — ${c.priceLine} (${c.section === "daily" ? "daily self-drive" : "hourly rental"})`,
          ),
        );
      }
      sections.push({
        title: "Exotic cars (self-drive / hourly catalog picks)",
        items,
      });
    }

    if (villas.length > 0 || sel[OPEN_TBD.villa]) {
      const items: string[] = [];
      if (sel[OPEN_TBD.villa]) {
        items.push(OPEN_TBD_MESSAGE_LINE[OPEN_TBD.villa]);
      }
      if (villas.length > 0) {
        items.push(...villas.map((v) => `${v.name} — ${v.cardTagline}`));
      }
      sections.push({
        title: "Villas & stays",
        items,
      });
    }

    if (yachts.length > 0 || sel[OPEN_TBD.yacht]) {
      const items: string[] = [];
      if (sel[OPEN_TBD.yacht]) {
        items.push(OPEN_TBD_MESSAGE_LINE[OPEN_TBD.yacht]);
      }
      if (yachts.length > 0) {
        items.push(
          ...yachts.map(
            (y) => `${y.name} (${y.subtitle}) — ${y.cardPriceLine}`,
          ),
        );
      }
      sections.push({
        title: "Yachts",
        items,
      });
    }

    if (sel.hostessAddon) {
      sections.push({
        title: YACHT_HOSTESS_ADDON_SECTION_TITLE,
        items: [
          `Female hosts requested: ${hostessCount} — from ${YACHT_HOSTESS_ADDON.startingPrice} (final quote from team)`,
          "Profiles / roster from partner agency coordinated on inquiry",
        ],
      });
    }

    if (jetskiPicks.length > 0) {
      sections.push({
        title: "Jet skis, jetcars & fishing",
        items: jetskiPicks.map((j) => j.title),
      });
    }

    if (miscAddonPicks.length > 0) {
      sections.push({
        title: "Add-ons & on-water extras",
        items: miscAddonPicks.map((a) =>
          a.hint ? `${a.title} — ${a.hint}` : a.title,
        ),
      });
    }

    if (securityMode === "unarmed") {
      sections.push({
        title: "Security guards",
        items: [
          "Unarmed professional guards — roster, coverage windows, and detail confirmed on inquiry",
        ],
      });
    } else if (securityMode === "armed") {
      sections.push({
        title: "Security guards",
        items: [
          "Armed professional guards — licensing, roster, and coverage confirmed on inquiry",
        ],
      });
    }

    if (selectedPrivateJets.length > 0 || sel[OPEN_TBD.privateJet]) {
      const items: string[] = [];
      if (sel[OPEN_TBD.privateJet]) {
        items.push(OPEN_TBD_MESSAGE_LINE[OPEN_TBD.privateJet]);
      }
      if (selectedPrivateJets.length > 0) {
        items.push(
          ...selectedPrivateJets.map(
            (j) =>
              `${j.name} (${j.categoryLabel}) — charter coordination; route & timing to confirm`,
          ),
        );
      }
      sections.push({
        title: "Private jets",
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
        title: "VIP nightlife & venues",
        items,
      });
    }

    if (sel.photoShoot) {
      sections.push({
        title: "Photo shoot",
        items: [
          "Professional photo shoot with our camera crew — edited stills on your timeline",
        ],
      });
    }
    if (sel.videoShoot) {
      sections.push({
        title: "Video shoot",
        items: [
          "Professional video shoot with our camera crew — edited motion on your timeline",
        ],
      });
    }

    if (sections.length === 0) {
      lines.push(
        "(Nothing selected yet — pick catalog items, use the “interested but no specific…” options, or add notes below.)",
      );
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
      lines.push(`Notes: ${notes.trim()}`);
    }
    lines.push("");
    lines.push("Please confirm availability and next steps. Thanks!");
    return lines.join("\n");
  }, [
    dates,
    groupSize,
    hostessCount,
    notes,
    sel,
    securityMode,
    whatsAppIntroLine,
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
            Travel dates (optional)
          </label>
          <input
            id={`custom-dates${sid}`}
            type="text"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            placeholder="e.g. Apr 18–21 or flexible"
            className={cn(inputClass, "mt-2")}
            autoComplete="off"
          />
        </div>
        <div>
          <label
            htmlFor={`custom-group${sid}`}
            className="block text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/75"
          >
            Group size (optional)
          </label>
          <input
            id={`custom-group${sid}`}
            type="text"
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
            placeholder="e.g. 4 guests"
            className={cn(inputClass, "mt-2")}
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/75">
          {buildHeading}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-cream/52">
          {buildDescription}
        </p>

        <div className="mt-5 space-y-3">
          <CatalogSection
            title="Chauffeur services"
            subtitle="Pick exact vehicles or tick below if you want chauffeur ground transport but haven&apos;t chosen a model yet. Optional class preferences at the bottom."
            defaultOpen
            badge="Chauffeur"
          >
            <div className="max-h-[min(70vh,520px)] space-y-6 overflow-y-auto pr-1">
              <PickRow
                selected={!!sel[OPEN_TBD.chauffeur]}
                onToggle={() => toggle(OPEN_TBD.chauffeur)}
              >
                <>
                  <span className="text-cream/92">
                    Interested in chauffeur — no specific vehicle yet
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    We&apos;ll propose options from the fleet for your dates and group.
                  </span>
                </>
              </PickRow>
              <ul className="grid gap-2" role="list">
                {CHAUFFEUR_FLEET_SORTED.map((car) => (
                  <li key={car.id}>
                    <PickRow
                      selected={!!sel[`chauffeur:${car.id}`]}
                      onToggle={() => toggle(`chauffeur:${car.id}`)}
                      density="compact"
                    >
                      <>
                        <span className="text-cream/92">{car.name}</span>
                        <span className="text-cream/45"> · </span>
                        <span className="tabular-nums text-gold-secondary/95">
                          {chauffeurQuoteRateLine(car)}
                        </span>
                        <span className="block text-[0.75rem] text-cream/42">
                          {car.group} · chauffeur
                        </span>
                      </>
                    </PickRow>
                  </li>
                ))}
              </ul>
              <div>
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/38">
                  Vehicle class preferences (optional)
                </p>
                <ul className="grid gap-2 sm:grid-cols-2" role="list">
                  {vipTransport.options.map((opt, i) => (
                    <li key={opt}>
                      <PickRow
                        selected={!!sel[`chauffOpt:${i}`]}
                        onToggle={() => toggle(`chauffOpt:${i}`)}
                        density="compact"
                      >
                        {opt}
                      </PickRow>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CatalogSection>

          <CatalogSection
            title="Exotic cars"
            subtitle="Hourly fleet, SUVs, supercars, and daily self-drive — or tick below if you want an exotic but haven&apos;t picked a model yet."
            badge="Fleet"
          >
            <div className="max-h-[min(70vh,520px)] space-y-6 overflow-y-auto pr-1">
              <PickRow
                selected={!!sel[OPEN_TBD.exoticCar]}
                onToggle={() => toggle(OPEN_TBD.exoticCar)}
              >
                <>
                  <span className="text-cream/92">
                    Interested in exotic rental — no specific car yet
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    Open to recommendations from your fleet for self-drive / hourly.
                  </span>
                </>
              </PickRow>
              {EXOTIC_CARS_HOURLY_GROUPS.length === 0 &&
              EXOTIC_CARS_DAILY.length === 0 ? (
                <p className="text-sm leading-relaxed text-cream/48">
                  Fleet checklist is being updated — describe the vehicles you
                  want in the notes field and we&apos;ll confirm availability.
                </p>
              ) : (
                <>
                  {EXOTIC_CARS_HOURLY_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
                        {group.title}
                      </p>
                      <ul className="grid gap-2" role="list">
                        {group.cars.map((car) => (
                          <li key={car.id}>
                            <PickRow
                              selected={!!sel[`car:${car.id}`]}
                              onToggle={() => toggle(`car:${car.id}`)}
                              density="compact"
                            >
                              {carLine(car)}
                            </PickRow>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div>
                    <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
                      Daily self-drive
                    </p>
                    <ul className="grid gap-2" role="list">
                      {EXOTIC_CARS_DAILY.map((car) => (
                        <li key={car.id}>
                          <PickRow
                            selected={!!sel[`car:${car.id}`]}
                            onToggle={() => toggle(`car:${car.id}`)}
                            density="compact"
                          >
                            {carLine(car)}
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
            title="Villas & stays"
            subtitle="Pick a property from the list — or tick below if you want a villa stay but haven&apos;t chosen one yet."
            badge="Stays"
          >
            <div className="space-y-4">
              <PickRow
                selected={!!sel[OPEN_TBD.villa]}
                onToggle={() => toggle(OPEN_TBD.villa)}
              >
                <>
                  <span className="text-cream/92">
                    Interested in a villa — no specific property yet
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    Open to recommendations based on dates, area, and group size.
                  </span>
                </>
              </PickRow>
              {VILLAS.length === 0 ? (
                <p className="text-[0.8125rem] leading-relaxed text-cream/48">
                  Named inventory is updating — use the option above or describe
                  your preferred area in the notes below.
                </p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-1" role="list">
                  {VILLAS.map((v) => (
                    <li key={v.id}>
                      <PickRow
                        selected={!!sel[`villa:${v.id}`]}
                        onToggle={() => toggle(`villa:${v.id}`)}
                      >
                        <>
                          <span className="text-cream/92">{v.name}</span>
                          <span className="block text-[0.8125rem] text-cream/50">
                            {v.cardTagline} · {v.subtitle}
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
            title="Yachts"
            subtitle="Full yacht lineup — or tick below if you want a charter but haven&apos;t picked a vessel yet."
            badge="Water"
          >
            <div className="space-y-4">
              <PickRow
                selected={!!sel[OPEN_TBD.yacht]}
                onToggle={() => toggle(OPEN_TBD.yacht)}
              >
                <>
                  <span className="text-cream/92">
                    Interested in a yacht — no specific vessel yet
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    Open to recommendations for day charter timing and group size.
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
                          {y.subtitle} — {y.cardPriceLine}
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
              title="Female hosts (partner agency)"
              subtitle={`Women supplied by our partner agency for yacht charters — from ${YACHT_HOSTESS_ADDON.startingPrice}, up to ${YACHT_HOSTESS_ADDON.maxCapacityLabel} when available. Choose a headcount below; profiles on inquiry. Usually booked with a yacht.`}
              badge="Yacht"
            >
              <PickRow
                selected={!!sel.hostessAddon}
                onToggle={() => toggle("hostessAddon")}
              >
                <span className="text-cream/92">
                  Include female hosts (entertainment)
                </span>
                <span className="block text-[0.8125rem] text-cream/50">
                  Partner agency — starting {YACHT_HOSTESS_ADDON.startingPrice}{" "}
                  (final quote from team)
                </span>
              </PickRow>
              {sel.hostessAddon ? (
                <div className="mt-4">
                  <label
                    htmlFor={`hostess-count${sid}`}
                    className="block text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/75"
                  >
                    How many women
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
            title="Jet skis, jetcars & fishing"
            subtitle="Bay sessions, amphibious runs, and fishing — routed with your stay."
            badge="On-water"
          >
            <ul className="grid gap-2 sm:grid-cols-2" role="list">
              {JETSKIS_OFFERINGS.map((j, i) => (
                <li key={j.title}>
                  <PickRow
                    selected={!!sel[`jetski:${i}`]}
                    onToggle={() => toggle(`jetski:${i}`)}
                  >
                    <span className="text-cream/92">{j.title}</span>
                  </PickRow>
                </li>
              ))}
            </ul>
          </CatalogSection>

          <CatalogSection
            title="Banana boats, paddleboard, kayak & more"
            subtitle="Extra on-water activities — quoted with your itinerary."
            badge="Add-ons"
          >
            <ul className="grid gap-2 sm:grid-cols-1 lg:grid-cols-2" role="list">
              {CUSTOM_PACKAGE_MISC_ADDONS.map((a) => (
                <li key={a.id}>
                  <PickRow
                    selected={!!sel[`addon:${a.id}`]}
                    onToggle={() => toggle(`addon:${a.id}`)}
                  >
                    <>
                      <span className="text-cream/92">{a.title}</span>
                      <span className="block text-[0.8125rem] text-cream/50">
                        {a.hint}
                      </span>
                    </>
                  </PickRow>
                </li>
              ))}
            </ul>
          </CatalogSection>

          <CatalogSection
            title="Security guards"
            subtitle="Close protection — choose unarmed or armed detail; roster and licensing confirmed on inquiry."
            badge="Security"
          >
            <fieldset>
              <legend className="sr-only">Security guards</legend>
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
                    Not requesting security
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
                    Unarmed guards
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
                    Armed guards
                  </span>
                </label>
              </div>
            </fieldset>
          </CatalogSection>

          <CatalogSection
            title="Private jets"
            subtitle="Select aircraft — or tick below if you want charter help but haven&apos;t chosen a jet yet. Add routes and timing in the notes when you can."
            badge="Aviation"
          >
            <div className="space-y-4">
              <PickRow
                selected={!!sel[OPEN_TBD.privateJet]}
                onToggle={() => toggle(OPEN_TBD.privateJet)}
              >
                <>
                  <span className="text-cream/92">
                    Interested in private jet charter — no specific aircraft yet
                  </span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    Open to aircraft recommendations for your route and dates.
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
                          {j.categoryLabel} · {j.passengers}
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
            title="VIP nightlife & venues"
            subtitle="Nightclubs and beach clubs — table and entry confirmed on inquiry."
            badge="Night"
          >
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/38">
              Featured venues
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
              South Beach &amp; strip
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
            title="Photo & video shoots"
            subtitle="Choose what you want quoted — photo stills, video, or both. Same crew can cover both on one itinerary."
            badge="Media"
          >
            <ul className="grid gap-2" role="list">
              <li>
                <PickRow
                  selected={!!sel.photoShoot}
                  onToggle={() => toggle("photoShoot")}
                >
                  <span className="text-cream/92">Photo shoot</span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    Edited stills with our camera crew
                  </span>
                </PickRow>
              </li>
              <li>
                <PickRow
                  selected={!!sel.videoShoot}
                  onToggle={() => toggle("videoShoot")}
                >
                  <span className="text-cream/92">Video shoot</span>
                  <span className="block text-[0.8125rem] text-cream/50">
                    Edited motion with our camera crew
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
          Extra detail (optional)
        </label>
        <textarea
          id={`custom-notes${sid}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Occasion, flight times, must-have times on the yacht, bottle preferences…"
          rows={4}
          className={cn(inputClass, "mt-2 resize-y")}
        />
      </div>

      <div className="border-t border-gold/10 pt-8">
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/65">
          Preview (sent in WhatsApp)
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
                    summary: whatsAppIntroLine,
                    source: "whatsapp",
                  }),
                });
              } catch (err) {
                setQuoteRequestError(
                  err instanceof Error
                    ? err.message
                    : "Could not create quote request - opening WhatsApp anyway.",
                );
              } finally {
                setCreatingQuoteRequest(false);
                window.open(href, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <WhatsAppIcon className="size-5 shrink-0 text-[#0b0b0b]" />
            {creatingQuoteRequest
              ? "Requesting quote..."
              : "Open WhatsApp with this message"}
          </a>
        ) : (
          <p className="mt-6">
            <span
              className={cn(btnPrimary, "cursor-not-allowed opacity-45")}
              aria-disabled
            >
              <WhatsAppIcon className="size-5 shrink-0 text-[#0b0b0b]" />
              Open WhatsApp with this message
            </span>
          </p>
        )}
        {!hasSelection && (
          <p className="mt-3 text-center text-[0.75rem] text-cream/45">
            Select catalog items, any “interested — no specific…” row,
            venues, photo or video shoot, hosts, add-ons, armed/unarmed
            security, or another option above to enable the link.
          </p>
        )}
      </div>
    </div>
  );
}
