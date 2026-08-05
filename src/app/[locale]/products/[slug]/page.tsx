import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CATALOG_PRODUCTS, getProductBySlug } from "@/lib/catalog/products";
import { ProductHeroActions } from "@/components/catalog/ProductHeroActions";

export function generateStaticParams() {
  return CATALOG_PRODUCTS.flatMap((p) =>
    ["en", "am"].map((locale) => ({ locale, slug: p.slug })),
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations("catalog");
  const name = t(`products.${product.id}.name`);
  const titleLine1 = t(`products.${product.id}.titleLine1`);
  const titleLine2 = t(`products.${product.id}.titleLine2`);
  const tagline = t(`products.${product.id}.tagline`);
  const categoryLabel = t(`categories.${product.category}`);

  return (
    <div className="bg-basalt-deep">
      {/* Breadcrumb */}
      <div className="border-b border-white/10 pt-20 md:pt-24">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 py-4 font-mono-tech text-[11px] uppercase tracking-[0.12em] text-white/55 md:px-8"
        >
          <Link href="/products" className="transition-colors hover:text-white">
            {t("detail.breadcrumbRoot")}
          </Link>
          <span aria-hidden className="text-white/30">
            &gt;
          </span>
          <Link href="/products" className="transition-colors hover:text-white">
            {categoryLabel}
          </Link>
          <span aria-hidden className="text-white/30">
            &gt;
          </span>
          <span className="text-white">{name}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative min-h-[70vh] overflow-hidden md:min-h-[78vh]">
        <Image
          src={product.image}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-basalt-deep via-basalt-deep/50 to-basalt-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-basalt-deep/70 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end gap-8 px-5 pb-12 pt-24 md:min-h-[78vh] md:flex-row md:items-end md:justify-between md:px-8 md:pb-16">
          <div className="max-w-xl">
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">{titleLine1}</span>
              <span className="block">{titleLine2}</span>
            </h1>
            <p className="mt-4 text-base text-white/85 md:text-lg">{tagline}</p>
          </div>
          <ProductHeroActions product={product} name={name} />
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="border-t border-white/10 bg-basalt-deep py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-white md:text-3xl">
            <GearIcon />
            {t("detail.specsTitle")}
          </h2>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:gap-14">
            <dl className="grid grid-cols-1 border-t border-white/15 sm:grid-cols-2">
              {product.detailSpecKeys.map((key, index) => (
                <div
                  key={key}
                  className={`border-b border-white/15 px-0 py-6 sm:px-6 ${
                    index % 2 === 0 ? "sm:border-r" : ""
                  }`}
                >
                  <dt className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                    {t(`products.${product.id}.detailSpecLabels.${key}`)}
                  </dt>
                  <dd className="mt-2 font-display text-xl font-semibold text-white md:text-2xl">
                    {t(`products.${product.id}.detailSpecValues.${key}`)}
                  </dd>
                </div>
              ))}
            </dl>

            <div>
              <p className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                {t("detail.visualInspection")}
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {product.gallery.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative aspect-[21/7] overflow-hidden rounded-sm border border-white/10 bg-basalt-elevated"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 30vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="border-t border-white/10 bg-basalt-elevated py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="text-center font-display text-2xl font-bold text-white md:text-3xl">
            {t("detail.capabilitiesTitle")}
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {product.capabilityKeys.map((key) => (
              <article
                key={key}
                className="rounded-sm border border-white/12 bg-basalt-deep/40 px-6 py-8 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center text-amber">
                  <CapabilityIcon name={key} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-white">
                  {t(`products.${product.id}.capabilities.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {t(`products.${product.id}.capabilities.${key}.body`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-amber" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 13a7.7 7.7 0 0 0 .1-2l2-1.2-2-3.4-2.3.6a7.6 7.6 0 0 0-1.7-1L15 3h-6l-.5 2.9a7.6 7.6 0 0 0-1.7 1L4.5 6.4l-2 3.4 2 1.2a7.7 7.7 0 0 0 0 2l-2 1.2 2 3.4 2.3-.6a7.6 7.6 0 0 0 1.7 1L9 21h6l.5-2.9a7.6 7.6 0 0 0 1.7-1l2.3.6 2-3.4-2-1.2Z" />
    </svg>
  );
}

function CapabilityIcon({ name }: { name: string }) {
  if (name === "nav" || name === "lidar" || name === "alert") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <circle cx="12" cy="12" r="3" />
        <path d="M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" />
      </svg>
    );
  }
  if (name === "mapping" || name === "weather" || name === "audio" || name === "throughput") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="10" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
