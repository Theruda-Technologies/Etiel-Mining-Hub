import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductCatalog } from "@/components/catalog/ProductCatalog";
import {
  fetchActiveProducts,
  productCategories,
} from "@/lib/catalog/fetch-products";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("catalog");
  const products = await fetchActiveProducts(locale);
  const categories = productCategories(products);

  return (
    <div className="bg-basalt-deep pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <header className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
            {t("title")}
          </h1>
          <div className="vein-line mt-5" />
          <p className="mt-5 text-base leading-relaxed text-text-secondary md:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <div className="mt-10 md:mt-12">
          <ProductCatalog products={products} categories={categories} />
        </div>
      </div>
    </div>
  );
}
