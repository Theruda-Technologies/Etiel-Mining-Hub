import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ServiceDeployCard } from "@/components/services/ServiceDeployCard";
import {
  fetchServiceBySlug,
  primaryImage,
} from "@/lib/catalog/fetch-services";
import { buildPageMetadata, truncateMetaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const service = await fetchServiceBySlug(slug);

  if (!service) {
    return {
      title: t("services.title"),
      description: t("services.description"),
    };
  }

  const description =
    truncateMetaDescription(service.description) ||
    t("serviceDetail.descriptionFallback", { name: service.name });

  return buildPageMetadata({
    locale,
    title: service.name,
    description,
    path: `/services/${service.slug}`,
    siteName: t("siteName"),
    image: primaryImage(service),
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = await fetchServiceBySlug(slug);
  if (!service) notFound();

  const t = await getTranslations("services");
  const knownCategories = new Set([
    "consulting",
    "on_site_assembly",
    "installation",
    "field_support",
    "maintenance",
    "training",
    "financing",
  ]);
  const categoryLabel = knownCategories.has(service.category)
    ? t(`categories.${service.category}` as "categories.consulting")
    : service.category.replace(/_/g, " ");
  const heroImage = primaryImage(service);
  const specs = service.specs;

  return (
    <div className="bg-basalt-deep pt-20 md:pt-24">
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.12em] text-white/50"
        >
          <Link href="/" className="transition-colors hover:text-white">
            {t("detail.breadcrumbHome")}
          </Link>
          <span aria-hidden>&gt;</span>
          <Link href="/services" className="transition-colors hover:text-white">
            {t("detail.breadcrumbServices")}
          </Link>
          <span aria-hidden>&gt;</span>
          <span className="text-amber">{service.name}</span>
        </nav>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.9fr] lg:gap-10 md:mt-10">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-amber">
              {categoryLabel}
            </p>
            <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
              {service.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-secondary md:text-lg">
              {service.description}
            </p>

            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-sm bg-basalt-muted">
              <Image
                src={heroImage}
                alt={service.name}
                fill
                className="object-contain object-center p-6"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>

            {specs.length > 0 ? (
              <section className="mt-10">
                <h2 className="font-display text-2xl font-bold text-white">
                  {t("detail.overviewTitle")}
                </h2>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  {specs.map((spec) => (
                    <div
                      key={`${spec.label}-${spec.value}`}
                      className="rounded-sm border border-white/10 bg-basalt-elevated/40 px-5 py-4"
                    >
                      <dt className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                        {spec.label}
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-white">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>

          <ServiceDeployCard service={service} />
        </div>
      </div>
    </div>
  );
}
