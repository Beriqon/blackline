"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import styles from "./about.module.css";

type Stop = { label: string; title: string; body: string; place: string; href: string };
const MiamiMap = dynamic(() => import("./miami-map"), { ssr: false });

export function MiamiJourney({ steps, label, exploreLabel, openMapLabel, mapErrorLabel }: { steps: Stop[]; label: string; exploreLabel: string; openMapLabel: string; mapErrorLabel: string }) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.journey}>
      <MiamiMap active={active} onSelect={setActive} label={label} openLabel={openMapLabel} errorLabel={mapErrorLabel} />
      <div className={styles.journeyDetail}>
        <div ref={tabsRef} role="tablist" aria-label={label} className={styles.journeyTabs} onKeyDown={(event) => {
          let next = active;
          if (event.key === "ArrowRight") next = (active + 1) % steps.length;
          else if (event.key === "ArrowLeft") next = (active + steps.length - 1) % steps.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = steps.length - 1;
          else return;
          event.preventDefault();
          setActive(next);
          tabsRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
        }}>
          {steps.map((step, index) => <button key={step.href} id={`miami-tab-${index}`} role="tab" type="button" aria-selected={index === active} aria-controls="miami-journey-panel" tabIndex={index === active ? 0 : -1} onClick={() => setActive(index)}><span>0{index + 1}</span>{step.label}</button>)}
        </div>
        <div id="miami-journey-panel" role="tabpanel" aria-labelledby={`miami-tab-${active}`} tabIndex={0} className={styles.journeyPanel}>
          <h3>{steps[active].title}</h3>
          <p>{steps[active].body}</p>
          <Link href={steps[active].href} className={styles.textLink}>{exploreLabel}<ArrowUpRight size={15} aria-hidden /></Link>
        </div>
      </div>
    </div>
  );
}
