"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { SiteLogo } from "@/components/layout/SiteLogo";

export function LoginPageClient() {
  const t = useTranslations("auth");
  const { signIn, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => {
    const value = searchParams.get("next");
    return value && value.startsWith("/") ? value : "/";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(t("errors.loginFailed"));
      return;
    }
    router.replace(next);
  }

  async function onForgot() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError(t("errors.emailRequired"));
      return;
    }
    const { error: err } = await resetPassword(email.trim());
    if (err) {
      setError(t("errors.resetFailed"));
      return;
    }
    setInfo(t("resetSent"));
  }

  return (
    <div className="flex min-h-screen flex-col bg-basalt-deep px-5 py-10 md:py-14">
      <div className="mx-auto">
        <SiteLogo height={96} priority />
      </div>

      <div className="mx-auto mt-12 w-full max-w-[420px] flex-1 md:mt-16">
        <div className="relative border border-white/20 bg-basalt-elevated px-7 py-9 md:px-9 md:py-10">
          <Corner accent="tl" />
          <Corner accent="tr" />
          <Corner accent="bl" />
          <Corner accent="br" />

          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            {t("login.title")}
          </h1>
          <p className="mt-2 font-mono-tech text-[10px] uppercase tracking-[0.18em] text-white/70">
            {t("login.subtitle")}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            <label className="block">
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-white/70">
                {t("email")}
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="mt-2 w-full rounded-sm border border-white/20 bg-basalt-deep px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber"
              />
            </label>

            <label className="block">
              <span className="flex items-center justify-between gap-3">
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-white/70">
                  {t("password")}
                </span>
                <button
                  type="button"
                  onClick={onForgot}
                  className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-amber transition-colors hover:text-amber-bright"
                >
                  {t("forgot")}
                </button>
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-sm border border-white/20 bg-basalt-deep px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber"
              />
            </label>

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
              className="w-full rounded-sm bg-amber py-3 text-sm font-bold text-basalt-deep transition-colors hover:bg-amber-bright disabled:opacity-60"
            >
              {submitting ? t("login.submitting") : t("login.submit")}
            </button>
          </form>

          <div className="mt-8 border-t border-white/15 pt-6 text-center">
            <p className="font-mono-tech text-[11px] text-white/60">
              {t("login.newOperator")}{" "}
              <Link
                href={`/signup?next=${encodeURIComponent(next)}`}
                className="text-amber underline underline-offset-2 transition-colors hover:text-amber-bright"
              >
                {t("login.createAccount")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Corner({ accent }: { accent: "tl" | "tr" | "bl" | "br" }) {
  const base = "pointer-events-none absolute h-4 w-4 border-amber";
  const map = {
    tl: `${base} left-0 top-0 -translate-x-[1px] -translate-y-[1px] border-l-2 border-t-2`,
    tr: `${base} right-0 top-0 translate-x-[1px] -translate-y-[1px] border-r-2 border-t-2`,
    bl: `${base} bottom-0 left-0 -translate-x-[1px] translate-y-[1px] border-b-2 border-l-2`,
    br: `${base} bottom-0 right-0 translate-x-[1px] translate-y-[1px] border-b-2 border-r-2`,
  };
  return <span aria-hidden className={map[accent]} />;
}
