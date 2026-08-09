"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { StoreProduct } from "@/lib/catalog/types";

type ProductCatalogProps = {
  products: StoreProduct[];
  categories: string[];
};

function categoryLabel(t: ReturnType<typeof useTranslations<"catalog">>, key: string) {
  const known = [
    "all",
    "metal_detectors",
    "mining_supplies",
    "ground_scanners",
    "excavators",
    "drilling",
    "material_handling",
    "drones",
    "safety_gear",
  ];
  if (known.includes(key)) return t(`categories.${key}` as "categories.all");
  return key.replace(/_/g, " ");
}

export function ProductCatalog({
  products = [],
  categories = ["all"],
}: ProductCatalogProps) {
  const t = useTranslations("catalog");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    if (category === "all") return products;
    return products.filter((p) => p.category === category);
  }, [category, products]);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((key) => {
          const active = category === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`shrink-0 border-b-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors md:px-4 ${
                active
                  ? "border-amber text-amber"
                  : "border-transparent text-white/55 hover:text-white"
              }`}
            >
              {categoryLabel(t, key)}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-text-secondary">{t("empty")}</p>
      ) : null}
    </div>
  );
}
