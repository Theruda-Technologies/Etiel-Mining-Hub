import { setRequestLocale } from "next-intl/server";
import { EquipmentLineup } from "@/components/home/EquipmentLineup";
import { FieldTested } from "@/components/home/FieldTested";
import { Hero } from "@/components/home/Hero";
import { Partners } from "@/components/home/Partners";
import { StatsBar } from "@/components/home/StatsBar";
import { SupportGrid } from "@/components/home/SupportGrid";
import { fetchLineupMix } from "@/lib/catalog/fetch-lineup";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lineupItems = await fetchLineupMix();

  return (
    <>
      <Hero />
      <StatsBar />
      <FieldTested />
      <EquipmentLineup items={lineupItems} />
      <SupportGrid />
      <Partners />
    </>
  );
}
