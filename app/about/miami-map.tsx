"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./about.module.css";

// Example areas, not rental-property addresses or a navigable road itinerary.
const locations = [
  { point: [25.7954, -80.2901] as L.LatLngTuple, name: "Miami International Airport" },
  { point: [25.814, -80.128] as L.LatLngTuple, name: "Miami Beach" },
  { point: [25.782, -80.165] as L.LatLngTuple, name: "Biscayne Bay" },
  { point: [25.781, -80.133] as L.LatLngTuple, name: "South Beach" },
];

function markerIcon(index: number, selected: boolean) {
  return L.divIcon({
    className: styles.mapMarkerRoot,
    html: `<span class="${styles.mapMarker}" data-selected="${selected}">${String(index + 1).padStart(2, "0")}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export default function MiamiMap({ active, onSelect, label, openLabel, errorLabel }: { active: number; onSelect: (index: number) => void; label: string; openLabel: string; errorLabel: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const selectRef = useRef(onSelect);
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      minZoom: 9,
      maxZoom: 17,
    });
    mapRef.current = map;
    map.attributionControl.setPrefix(false);
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);
    let failures = 0;
    tiles.on("tileerror", () => { if (++failures >= 4) setFailed(true); });
    tiles.on("load", () => { if (containerRef.current?.querySelector(".leaflet-tile-loaded")) setFailed(false); });
    map.fitBounds(L.latLngBounds(locations.map((location) => location.point)), { padding: [50, 65], maxZoom: 12, animate: false });
    markersRef.current = locations.map((location, index) => L.marker(location.point, {
      icon: markerIcon(index, index === 0),
      title: `${index + 1}. ${location.name}`,
      alt: location.name,
      keyboard: true,
    }).addTo(map).bindTooltip(location.name, { direction: "top", offset: [0, -16] }).on("click", () => selectRef.current(index)));
    markersRef.current[0].openTooltip();
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(containerRef.current);
    return () => { observer.disconnect(); map.remove(); mapRef.current = null; markersRef.current = []; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker, index) => {
      marker.setIcon(markerIcon(index, index === active));
      if (index === active) marker.openTooltip();
      else marker.closeTooltip();
    });
    map.panInside(locations[active].point, { padding: [60, 65], animate: !reducedMotion });
  }, [active, reducedMotion]);

  return (
    <div className={styles.realMapWrap}>
      <div ref={containerRef} className={styles.realMap} role="region" aria-label={label} />
      {failed && <p role="status" className={styles.mapError}>{errorLabel}</p>}
      <a className={styles.openMap} href="https://www.openstreetmap.org/#map=12/25.795/-80.205" target="_blank" rel="noopener noreferrer">{openLabel} ↗</a>
    </div>
  );
}
