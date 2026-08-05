"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

const SUBJECT_KEYS = [
  "equipment",
  "fleet",
  "engineering",
  "logistics",
  "other",
] as const;

export function ContactPageClient() {
  const t = useTranslations("contactPage");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // Demo: no backend endpoint yet — acknowledge the inquiry locally.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSent(true);
  }

  return (
    <div className="bg-basalt-deep pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <header className="max-w-3xl animate-fade-up">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
            {t("title")}
          </h1>
          <div className="mt-4 h-0.5 w-16 bg-amber" aria-hidden />
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
            {t("subtitle")}
          </p>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:gap-10 animate-fade-up-delay">
          {/* Form */}
          <section className="rounded-sm border border-white/15 p-6 md:p-8">
            {sent ? (
              <div className="flex min-h-[280px] flex-col justify-center">
                <p className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-amber">
                  {t("successTitle")}
                </p>
                <p className="mt-3 max-w-md text-base text-text-secondary">
                  {t("successBody")}
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-8 w-fit rounded-sm border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:border-amber hover:text-amber"
                >
                  {t("sendAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <UnderlineField
                    name="fullName"
                    label={t("fullName")}
                    placeholder={t("fullNamePlaceholder")}
                    required
                  />
                  <UnderlineField
                    name="email"
                    label={t("email")}
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    required
                  />
                </div>

                <label className="block">
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                    {t("subject")}
                  </span>
                  <div className="relative mt-3">
                    <select
                      name="subject"
                      required
                      defaultValue=""
                      className="w-full appearance-none border-0 border-b border-white/25 bg-transparent pb-2.5 pr-8 text-sm text-white outline-none transition-colors focus:border-amber [&>option]:bg-basalt-elevated [&>option]:text-white"
                    >
                      <option value="" disabled>
                        {t("subjectPlaceholder")}
                      </option>
                      {SUBJECT_KEYS.map((key) => (
                        <option key={key} value={key}>
                          {t(`subjects.${key}`)}
                        </option>
                      ))}
                    </select>
                    <span
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-text-secondary"
                      aria-hidden
                    >
                      ▾
                    </span>
                  </div>
                </label>

                <label className="block">
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                    {t("specs")}
                  </span>
                  <textarea
                    name="specs"
                    rows={6}
                    required
                    placeholder={t("specsPlaceholder")}
                    className="mt-3 w-full resize-y rounded-sm border border-white/20 bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-amber"
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-sm bg-amber px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-basalt-deep transition-colors hover:bg-amber-bright disabled:opacity-60"
                >
                  {submitting ? t("submitting") : t("submit")}
                  <span aria-hidden>→</span>
                </button>
              </form>
            )}
          </section>

          {/* HQ + map */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-sm border border-white/15 p-6 md:p-7">
              <h2 className="font-display text-xl font-bold text-white md:text-2xl">
                {t("hqTitle")}
              </h2>

              <ul className="mt-7 space-y-6">
                <InfoRow
                  icon={<PinIcon />}
                  label={t("hqLabel")}
                  value={t("hqAddress")}
                />
                <InfoRow
                  icon={<PhoneIcon />}
                  label={t("phoneLabel")}
                  value={
                    <a
                      href={`tel:${t("phone").replace(/\s/g, "")}`}
                      className="transition-colors hover:text-amber"
                    >
                      {t("phone")}
                    </a>
                  }
                />
                <InfoRow
                  icon={<MailIcon />}
                  label={t("emailLabel")}
                  value={
                    <a
                      href={`mailto:${t("emailValue")}`}
                      className="transition-colors hover:text-amber"
                    >
                      {t("emailValue")}
                    </a>
                  }
                />
              </ul>
            </div>

            <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-sm border border-white/15 md:min-h-[300px]">
              <MapPanel caption={t("mapCaption")} label={t("mapLabel")} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function UnderlineField({
  name,
  label,
  placeholder,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-text-secondary">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-3 w-full border-0 border-b border-white/25 bg-transparent pb-2.5 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-amber"
      />
    </label>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-amber">{icon}</span>
      <div>
        <p className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-amber">
          {label}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/80">{value}</p>
      </div>
    </li>
  );
}

function MapPanel({ caption, label }: { caption: string; label: string }) {
  return (
    <div className="absolute inset-0 bg-[#121410]">
      <p className="absolute left-3 top-2 z-10 font-mono-tech text-[9px] uppercase tracking-[0.14em] text-white/45">
        {caption}
      </p>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern
            id="map-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          </pattern>
          <radialGradient id="terrain" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#2a3220" />
            <stop offset="45%" stopColor="#1a1e14" />
            <stop offset="100%" stopColor="#0e100c" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#terrain)" />
        <rect width="400" height="300" fill="url(#map-grid)" />

        {/* Contour / ridge lines */}
        <path
          d="M0 80 Q80 60 140 90 T280 70 T400 100"
          fill="none"
          stroke="rgba(180,160,100,0.15)"
          strokeWidth="1"
        />
        <path
          d="M0 130 Q100 110 180 140 T340 120 T400 150"
          fill="none"
          stroke="rgba(180,160,100,0.12)"
          strokeWidth="1"
        />
        <path
          d="M0 190 Q90 170 160 200 T300 180 T400 210"
          fill="none"
          stroke="rgba(140,160,120,0.1)"
          strokeWidth="1"
        />
        <path
          d="M40 40 L90 90 L70 140 L120 180 L100 240"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />
        <path
          d="M200 20 L240 80 L220 140 L280 200 L260 280"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1.5"
        />
        <ellipse
          cx="210"
          cy="145"
          rx="70"
          ry="45"
          fill="none"
          stroke="rgba(224,165,38,0.12)"
          strokeWidth="1"
        />
        <ellipse
          cx="210"
          cy="145"
          rx="40"
          ry="25"
          fill="none"
          stroke="rgba(224,165,38,0.18)"
          strokeWidth="1"
        />

        {/* Terrain patches */}
        <path
          d="M250 200 Q300 180 360 220 L380 280 L240 270 Z"
          fill="rgba(60,70,45,0.35)"
        />
        <path
          d="M20 200 Q80 220 60 260 L30 280 Z"
          fill="rgba(50,55,40,0.4)"
        />
      </svg>

      {/* HQ pin */}
      <div className="absolute left-[48%] top-[42%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative flex flex-col items-center">
          <span className="absolute h-10 w-10 animate-ping rounded-full bg-amber/25" />
          <span className="relative h-3.5 w-3.5 rounded-full border-2 border-basalt-deep bg-amber shadow-[0_0_12px_rgba(224,165,38,0.7)]" />
          <span className="mt-2 whitespace-nowrap rounded-sm bg-basalt-deep/80 px-2 py-0.5 font-mono-tech text-[10px] font-semibold uppercase tracking-[0.14em] text-amber">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 7L2 7" />
    </svg>
  );
}
