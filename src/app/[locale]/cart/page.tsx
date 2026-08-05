import { setRequestLocale } from "next-intl/server";
import { CartPageClient } from "@/components/store/CartPageClient";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CartPageClient />;
}
