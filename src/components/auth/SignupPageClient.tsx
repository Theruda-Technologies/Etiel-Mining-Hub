"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { PasswordInput } from "@/components/auth/PasswordInput";

export function SignupPageClient() {
  const t = useTranslations("auth");
  const tFooter = useTranslations("footer");
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => {
    const value = searchParams.get("next");
    return value && value.startsWith("/") ? value : "/";
  }, [searchParams]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    const { error: err, needsConfirmation } = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      phone: phone.trim() || undefined,
    });

    setSubmitting(false);

    if (err) {
      setError(t("errors.signupFailed"));
      return;
    }

    if (needsConfirmation) {
      setInfo(t("signup.confirmEmail"));
      return;
    }

    router.replace(next);
  }

  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen flex-col bg-basalt-deep">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col px-5 py-10 md:py-14">
        <div className="mx-auto">
          <SiteLogo height={96} priority />
        </div>

        <div className="mx-auto mt-10 w-full max-w-[440px] flex-1 md:mt-14">
          <div className="overflow-hidden rounded-sm border border-white/20 bg-basalt-elevated">
            <div className="h-1 bg-amber" aria-hidden />
            <div className="px-7 py-9 md:px-9 md:py-10">
              <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
                {t("signup.title")}
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                {t("signup.subtitle")}
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <IconField
                  label={t("fullName")}
                  placeholder={t("fullNamePlaceholder")}
                  value={fullName}
                  onChange={setFullName}
                  autoComplete="name"
                  required
                  icon={<UserIcon />}
                />
                <IconField
                  label={t("email")}
                  type="email"
                  placeholder={t("signupEmailPlaceholder")}
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  required
                  icon={<MailIcon />}
                />
                <label className="block">
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                    {t("password")}
                  </span>
                  <PasswordInput
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    trailingSlot={<LockIcon />}
                  />
                </label>
                <IconField
                  label={t("phoneOptional")}
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  value={phone}
                  onChange={setPhone}
                  autoComplete="tel"
                  icon={<PhoneIcon />}
                />

                {error ? (
                  <p className="text-sm text-[#c45c4a]" role="alert">
                    {error}
                  </p>
                ) : null}
                {info ? (
                  <p className="text-sm text-amber" role="status">
                    {info}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm bg-amber py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-basalt-deep transition-colors hover:bg-amber-bright disabled:opacity-60"
                >
                  {submitting ? t("signup.submitting") : t("signup.submit")}
                  <span aria-hidden>→</span>
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-text-secondary">
                {t("signup.hasAccount")}{" "}
                <Link
                  href={`/login?next=${encodeURIComponent(next)}`}
                  className="text-amber underline underline-offset-2 transition-colors hover:text-amber-bright"
                >
                  {t("signup.signIn")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/10 bg-basalt-elevated px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-8">
            <SiteLogo height={64} />
            <p className="font-mono-tech text-[11px] text-text-secondary">
              {t("signup.footerCopy", { year })}
            </p>
          </div>
          <nav className="flex flex-col gap-2 font-mono-tech text-[11px] text-text-secondary md:items-end">
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              <Link href="/terms" className="hover:text-white">
                {tFooter("terms")}
              </Link>
              <Link href="/privacy" className="hover:text-white">
                {tFooter("privacy")}
              </Link>
            </div>
            <Link href="/contact" className="hover:text-white">
              {t("signup.support")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function IconField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
  minLength,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  icon: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-text-secondary">
        {label}
      </span>
      <span className="relative mt-2 block">
        <input
          type={type}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-sm border border-white/20 bg-basalt-deep py-2.5 pl-3 pr-10 text-sm text-white placeholder:text-white/35 outline-none focus:border-amber"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
          {icon}
        </span>
      </span>
    </label>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.8-3 4.2-4.5 7-4.5S17.2 16 19 19" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
