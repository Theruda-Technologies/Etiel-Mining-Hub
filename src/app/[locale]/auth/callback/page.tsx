import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCallbackClient } from "@/components/auth/AuthCallbackClient";
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
    title: t("authCallback.title"),
    description: t("authCallback.description"),
    path: "/auth/callback",
    siteName: t("siteName"),
    noIndex: true,
  });
}

export default async function AuthCallbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="min-h-screen bg-basalt-deep" />}>
      <AuthCallbackClient />
    </Suspense>
  );
}
