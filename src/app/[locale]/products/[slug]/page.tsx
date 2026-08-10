import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ProductHeroActions } from "@/components/catalog/ProductHeroActions";
import {
  fetchProductBySlug,
  primaryImage,
} from "@/lib/catalog/fetch-products";
import { buildPageMetadata, truncateMetaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: t("products.title"),
      description: t("products.description"),
    };
  }

  const description =
    truncateMetaDescription(product.description) ||
    t("productDetail.descriptionFallback", { name: product.name });

  return buildPageMetadata({
    locale,
    title: product.name,
    description,
    path: `/products/${product.slug}`,
    siteName: t("siteName"),
    image: primaryImage(product),
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations("catalog");
  const knownCategories = new Set([
    "metal_detectors",
    "mining_supplies",
    "ground_scanners",
    "excavators",
    "drilling",
    "material_handling",
    "drones",
    "safety_gear",
  ]);
  const categoryLabel = knownCategories.has(product.category)
    ? t(`categories.${product.category}` as "categories.metal_detectors")
    : product.category.replace(/_/g, " ");
  const heroImage = primaryImage(product);
  const gallery =
    product.image_paths.length > 0 ? product.image_paths : [heroImage];
  const nameParts = product.name.split(/\s+/);
  const titleLine1 = nameParts.slice(0, Math.min(2, nameParts.length)).join(" ");
  const titleLine2 = nameParts.slice(Math.min(2, nameParts.length)).join(" ");

  return (
    <div className="bg-basalt-deep">
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
          <span className="text-white">{product.name}</span>
        </nav>
      </div>

      <section className="relative min-h-[70vh] overflow-hidden md:min-h-[78vh]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          className="object-contain object-center bg-basalt-muted p-8 md:p-16"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-basalt-deep via-basalt-deep/55 to-basalt-deep/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-basalt-deep/75 via-basalt-deep/20 to-transparent" />

        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end gap-8 px-5 pb-12 pt-24 md:min-h-[78vh] md:flex-row md:items-end md:justify-between md:px-8 md:pb-16">
          <div className="max-w-xl">
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">{titleLine1}</span>
              {titleLine2 ? <span className="block">{titleLine2}</span> : null}
            </h1>
            <p className="mt-4 text-base text-white/85 md:text-lg">
              {product.description}
            </p>
          </div>
          <ProductHeroActions product={product} />
        </div>
      </section>

      <section className="border-t border-white/10 bg-basalt-deep py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-white md:text-3xl">
            <GearIcon />
            {t("detail.specsTitle")}
          </h2>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:gap-14">
            <dl className="grid grid-cols-1 border-t border-white/15 sm:grid-cols-2">
              {product.specs.map((spec, index) => (
                <div
                  key={`${spec.label}-${spec.value}`}
                  className={`border-b border-white/15 px-0 py-6 sm:px-6 ${
                    index % 2 === 0 ? "sm:border-r" : ""
                  }`}
                >
                  <dt className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                    {spec.label}
                  </dt>
                  <dd className="mt-2 font-display text-xl font-semibold text-white md:text-2xl">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div>
              <p className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                {t("detail.visualInspection")}
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {gallery.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative aspect-[21/7] overflow-hidden rounded-sm border border-white/10 bg-basalt-elevated"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-contain object-center p-2"
                      sizes="(max-width: 1024px) 100vw, 30vw"
                    />
                  </div>
                ))}
              </div>
            </div>
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
