import { setRequestLocale } from "next-intl/server";

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-5 py-32 md:px-8">
      <p className="font-mono-tech text-sm text-amber">Coming next</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-white">Contact</h1>
    </div>
  );
}
