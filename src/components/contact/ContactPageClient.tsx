"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

const MAP_EMBED_SRC =
  "https://www.google.com/maps?q=2PJW%2B895%2C+Gobena+Aba+Tigu+St%2C+Addis+Ababa&hl=en&z=17&output=embed";

const PHONES = ["+251922056074", "+251968360000", "+251910575554"] as const;

export function ContactPageClient() {
  const t = useTranslations("contactPage");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const fullName = String(data.get("fullName") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("specs") ?? "").trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email, message }),
      });
      const payload = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        setError(
          payload?.error === "rate_limited"
            ? t("errors.rateLimited")
            : t("errors.generic"),
        );
        setSubmitting(false);
        return;
      }

      form.reset();
      setSent(true);
      setSubmitting(false);
    } catch {
      setError(t("errors.generic"));
      setSubmitting(false);
    }
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
                  onClick={() => {
                    setSent(false);
                    setError(null);
                  }}
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
                    autoComplete="name"
                  />
                  <UnderlineField
                    name="phone"
                    label={t("phone")}
                    type="tel"
                    placeholder={t("phonePlaceholder")}
                    required
                    autoComplete="tel"
                  />
                </div>

                <UnderlineField
                  name="email"
                  label={t("email")}
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                />

                <label className="block">
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                    {t("specs")}
                    <span className="ml-1 text-amber" aria-hidden>
                      *
                    </span>
                  </span>
                  <textarea
                    name="specs"
                    rows={6}
                    required
                    placeholder={t("specsPlaceholder")}
                    className="mt-3 w-full resize-y rounded-sm border border-white/20 bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-amber"
                  />
                </label>

                {error ? (
                  <p className="text-sm text-[#c45c4a]" role="alert">
                    {error}
                  </p>
                ) : null}

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

          <aside className="flex flex-col gap-6">
            <div className="rounded-sm border border-white/15 p-6 md:p-7">
              <h2 className="font-display text-xl font-bold text-white md:text-2xl">
                {t("hqTitle")}
              </h2>

              <ul className="mt-7 space-y-6">
                <InfoRow
                  icon={<PinIcon />}
                  label={t("hqLabel")}
                  value={
                    <span className="whitespace-pre-line">{t("hqAddress")}</span>
                  }
                />
                <InfoRow
                  icon={<PhoneIcon />}
                  label={t("phoneLabel")}
                  value={
                    <span className="flex flex-col gap-1.5">
                      {PHONES.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone}`}
                          className="transition-colors hover:text-amber"
                        >
                          {phone}
                        </a>
                      ))}
                    </span>
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

            <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-sm border border-white/15 md:min-h-[320px]">
              <iframe
                title={t("mapCaption")}
                src={MAP_EMBED_SRC}
                className="absolute inset-0 h-full w-full border-0 grayscale-[20%] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
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
  autoComplete,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-text-secondary">
        {label}
        {required ? (
          <span className="ml-1 text-amber" aria-hidden>
            *
          </span>
        ) : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
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
        <div className="mt-1.5 text-sm leading-relaxed text-white/80">{value}</div>
      </div>
    </li>
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
