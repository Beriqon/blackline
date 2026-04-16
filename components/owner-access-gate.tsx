"use client";

import { useState } from "react";

export function OwnerAccessGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <section className="border-b border-gold/10 bg-[linear-gradient(180deg,#171717_0%,#212121_100%)] py-20">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold/90">
          Owner access
        </p>
        <h1 className="mt-5 font-serif text-3xl tracking-tight text-cream sm:text-4xl">
          Unlock manual bookings
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-cream/68">
          Enter the private owner code to open the admin dashboard and manage
          reservations.
        </p>
        <div className="mt-8 border border-gold/15 bg-[#262626] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <label
            htmlFor="owner-code"
            className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
          >
            Special code
          </label>
          <input
            id="owner-code"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1.5 w-full border border-gold/20 bg-[#303030] px-3 py-2 text-sm text-cream placeholder:text-cream/35"
          />
          {error ? <p className="mt-3 text-sm text-red-300/90">{error}</p> : null}
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const res = await fetch("/api/owner-access", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ code }),
                });
                const data = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(data.error || "Invalid access code.");
                window.location.reload();
              } catch (nextError) {
                setError(
                  nextError instanceof Error ? nextError.message : "Invalid access code.",
                );
              } finally {
                setLoading(false);
              }
            }}
            className="mt-4 inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b0b0b] shadow-[0_12px_30px_rgba(198,164,108,0.18)] disabled:opacity-40"
          >
            {loading ? "Unlocking..." : "Unlock"}
          </button>
        </div>
      </div>
    </section>
  );
}
