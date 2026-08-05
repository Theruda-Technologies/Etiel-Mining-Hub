import { setRequestLocale } from "next-intl/server";
import { OrdersPageClient } from "@/components/store/OrdersPageClient";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OrdersPageClient />;
}
