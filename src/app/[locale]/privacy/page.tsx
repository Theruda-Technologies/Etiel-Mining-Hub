import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
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
    title: t("privacy.title"),
    description: t("privacy.description"),
    path: "/privacy",
    siteName: t("siteName"),
  });
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalDocumentPage doc="privacy" locale={locale} />;
}
