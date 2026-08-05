import { setRequestLocale } from "next-intl/server";
import { ContactPageClient } from "@/components/contact/ContactPageClient";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactPageClient />;
}
