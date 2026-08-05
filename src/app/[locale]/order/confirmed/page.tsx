import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { OrderConfirmedClient } from "@/components/store/OrderConfirmedClient";

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
