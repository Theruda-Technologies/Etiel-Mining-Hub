"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AuthCard } from "@/components/auth/AuthCard";

export function ForgotPasswordPageClient() {
  const t = useTranslations("auth");
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError(t("errors.emailRequired"));
      setSubmitting(false);
      return;
    }

    const { error: err } = await resetPassword(email.trim());
    setSubmitting(false);

    if (err) {
      setError(t("errors.resetFailed"));
      return;
    }

    setInfo(t("resetSent"));
  }

  return (
    <AuthCard
      title={t("forgotPassword.title")}
      subtitle={t("forgotPassword.subtitle")}
      footer={
        <p className="font-mono-tech text-[11px] text-white/60">
          <Link
            href="/login"
            className="text-amber underline underline-offset-2 transition-colors hover:text-amber-bright"
          >
            {t("forgotPassword.backToLogin")}
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
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
          {submitting ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
        </button>
      </form>
    </AuthCard>
  );
}
