"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";

export function AuthCallbackClient() {
  const t = useTranslations("auth.callback");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function finish() {
      const nextRaw = searchParams.get("next");
      const next =
        nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
          ? nextRaw
          : "/login";

      const errorDescription =
        searchParams.get("error_description") || searchParams.get("error");
      if (errorDescription) {
        if (!cancelled) setError(decodeURIComponent(errorDescription));
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) setError(exchangeError.message);
          return;
        }
      }

      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (tokenHash && type) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "signup" | "invite" | "magiclink" | "recovery" | "email",
        });
        if (otpError) {
          if (!cancelled) setError(otpError.message);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (type === "recovery" || next === "/reset-password") {
        router.replace("/reset-password");
        return;
      }

      if (session) {
        router.replace("/login?confirmed=1");
        return;
      }

      router.replace(next === "/reset-password" ? "/reset-password" : "/login?confirmed=1");
    }

    void finish();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      {error ? (
        <p className="text-sm text-[#c45c4a]" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-sm text-white/70">{t("working")}</p>
      )}
    </AuthCard>
  );
}
