"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";

export function ResetPasswordPageClient() {
  const t = useTranslations("auth");
  const { updatePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function establishSession() {
      const errorDescription =
        searchParams.get("error_description") || searchParams.get("error");
      if (errorDescription) {
        if (!cancelled) {
          setError(decodeURIComponent(errorDescription));
          setReady(false);
        }
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) {
            setError(exchangeError.message);
            setReady(false);
          }
          return;
        }
      }

      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (tokenHash && (type === "recovery" || type === "email")) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "recovery" | "email",
        });
        if (otpError) {
          if (!cancelled) {
            setError(otpError.message);
            setReady(false);
          }
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setError(t("errors.resetLinkInvalid"));
        setReady(false);
        return;
      }

      setReady(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
        setError(null);
      }
    });

    void establishSession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [searchParams, t]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      setError(t("errors.passwordTooShort"));
      return;
    }

    if (password !== confirm) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePassword(password);
    setSubmitting(false);

    if (err) {
      setError(t("errors.updatePasswordFailed"));
      return;
    }

    setInfo(t("resetPassword.success"));
    window.setTimeout(() => {
      router.replace("/login");
    }, 1200);
  }

  return (
    <AuthCard
      title={t("resetPassword.title")}
      subtitle={t("resetPassword.subtitle")}
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
      {!ready && !error ? (
        <p className="text-sm text-white/70">{t("resetPassword.preparing")}</p>
      ) : null}

      {error && !ready ? (
        <div className="space-y-4">
          <p className="text-sm text-[#c45c4a]" role="alert">
            {error}
          </p>
          <Link
            href="/forgot-password"
            className="inline-block font-mono-tech text-[11px] uppercase tracking-[0.12em] text-amber underline underline-offset-2"
          >
            {t("resetPassword.requestNewLink")}
          </Link>
        </div>
      ) : null}

      {ready ? (
        <form onSubmit={onSubmit} className="space-y-6">
          <label className="block">
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-white/70">
              {t("resetPassword.newPassword")}
            </span>
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
            />
          </label>

          <label className="block">
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-white/70">
              {t("resetPassword.confirmPassword")}
            </span>
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              value={confirm}
              onChange={setConfirm}
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
            {submitting
              ? t("resetPassword.submitting")
              : t("resetPassword.submit")}
          </button>
        </form>
      ) : null}
    </AuthCard>
  );
}
