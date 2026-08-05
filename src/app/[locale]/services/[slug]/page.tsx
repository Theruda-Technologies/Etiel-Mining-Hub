import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CATALOG_SERVICES, getServiceBySlug } from "@/lib/catalog/services";
import { ServiceAddToCart } from "@/components/services/ServiceAddToCart";

export function generateStaticParams() {
  return CATALOG_SERVICES.flatMap((s) =>
    ["en", "am"].map((locale) => ({ locale, slug: s.slug })),
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const t = await getTranslations("services");
  const name = t(`items.${service.id}.name`);

  return (
    <div className="bg-basalt-deep pt-24 md:pt-28">
      <div className="mx-auto max-w-3xl px-5 pb-20 md:px-8 md:pb-28">
        <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-amber">
          {t(`categories.${service.category}`)}
        </p>
        <h1 className="font-display mt-3 text-3xl font-bold text-white md:text-4xl">
          {name}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-text-secondary">
          {t(`items.${service.id}.description`)}
        </p>

        <dl className="mt-8 space-y-3 border-y border-white/10 py-6">
          {service.detailKeys.map((key) => (
            <div
              key={key}
              className="flex justify-between gap-4 font-mono-tech text-xs uppercase tracking-[0.1em]"
            >
              <dt className="text-text-secondary">
                {t(`items.${service.id}.detailLabels.${key}`)}
              </dt>
              <dd className="text-white">
                {t(`items.${service.id}.detailValues.${key}`)}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <ServiceAddToCart service={service} name={name} />
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-sm border border-white/35 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white"
          >
            {t("backToServices")}
          </Link>
        </div>
      </div>
    </div>
  );
}
