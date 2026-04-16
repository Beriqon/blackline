"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";

function parseDateOnly(input: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return undefined;
  const next = new Date(`${input}T00:00:00`);
  return Number.isNaN(next.getTime()) ? undefined : next;
}

function formatDateLabel(input: string): string {
  const date = parseDateOnly(input);
  if (!date) return "Select a date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type Props = {
  id: string;
  label: string;
  value: string;
  minDate: string;
  onChange: (next: string) => void;
  isBlocked: (date: string) => boolean;
};

export function AvailabilityDatePicker({
  id,
  label,
  value,
  minDate,
  onChange,
  isBlocked,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseDateOnly(value), [value]);
  const min = useMemo(() => parseDateOnly(minDate), [minDate]);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-1.5 flex w-full items-center justify-between border border-gold/15 bg-[#0b0b0b] px-3 py-2 text-left text-sm text-cream"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span>{formatDateLabel(value)}</span>
        <span className="text-[0.7rem] text-cream/45">Open calendar</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-[18.5rem] rounded-sm border border-gold/15 bg-[#121212] p-3 shadow-[0_12px_34px_rgba(0,0,0,0.35)]">
          <DayPicker
            mode="single"
            selected={selected}
            month={selected ?? min ?? new Date()}
            fixedWeeks
            onSelect={(date) => {
              if (!date) return;
              const key = toDateKey(date);
              if (isBlocked(key)) return;
              onChange(key);
              setOpen(false);
            }}
            disabled={(date) => {
              const key = toDateKey(date);
              return (min ? date < min : false) || isBlocked(key);
            }}
            modifiers={{
              blocked: (date) => isBlocked(toDateKey(date)),
            }}
            classNames={{
              root: "text-cream",
              months: "flex justify-center",
              month: "space-y-3",
              month_caption: "flex items-center justify-between gap-2 px-1",
              caption_label: "font-serif text-sm text-cream",
              nav: "flex items-center gap-2",
              button_previous:
                "inline-flex h-8 w-8 items-center justify-center border border-gold/15 text-cream/75 hover:border-gold/30 hover:text-gold-secondary",
              button_next:
                "inline-flex h-8 w-8 items-center justify-center border border-gold/15 text-cream/75 hover:border-gold/30 hover:text-gold-secondary",
              month_grid: "w-full border-separate border-spacing-1",
              weekdays: "",
              weekday:
                "h-8 w-10 text-center align-middle text-[0.62rem] font-medium uppercase tracking-[0.08em] text-cream/45",
              weeks: "",
              week: "",
              day: "h-10 w-10 p-0 text-center align-middle",
              day_button:
                "flex h-9 w-9 items-center justify-center text-sm transition-colors hover:bg-gold/10",
              today: "text-gold-secondary",
              selected:
                "bg-gold text-[#0b0b0b] hover:bg-gold-secondary",
              disabled: "cursor-not-allowed text-cream/25",
            }}
            modifiersClassNames={{
              blocked: "bg-red-500/20 text-red-200",
            }}
            components={{
              Chevron: ({ orientation, className }) =>
                orientation === "left" ? (
                  <ChevronLeft className={className} />
                ) : (
                  <ChevronRight className={className} />
                ),
            }}
          />
          <p className="mt-2 text-[0.68rem] text-cream/45">
            Red dates are already booked and cannot be selected.
          </p>
        </div>
      ) : null}
    </div>
  );
}

