import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResetPasswordPageClient } from "@/components/auth/ResetPasswordPageClient";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return buildPageMetadata({
    locale,
    title: t("resetPassword.title"),
    description: t("resetPassword.description"),
    path: "/reset-password",
    siteName: t("siteName"),
    noIndex: true,
  });
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="min-h-screen bg-basalt-deep" />}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
