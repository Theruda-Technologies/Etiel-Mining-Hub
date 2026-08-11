import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotPasswordPageClient } from "@/components/auth/ForgotPasswordPageClient";
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
    title: t("forgotPassword.title"),
    description: t("forgotPassword.description"),
    path: "/forgot-password",
    siteName: t("siteName"),
    noIndex: true,
  });
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ForgotPasswordPageClient />;
}
