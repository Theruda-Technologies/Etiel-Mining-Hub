import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderConfirmedClient } from "@/components/store/OrderConfirmedClient";
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
    title: t("orderConfirmed.title"),
    description: t("orderConfirmed.description"),
    path: "/order/confirmed",
    siteName: t("siteName"),
    noIndex: true,
  });
}

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="bg-basalt-deep pt-32 text-center text-white">…</div>}>
      <OrderConfirmedClient />
    </Suspense>
  );
}
