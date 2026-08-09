"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { StoreService } from "@/lib/catalog/types";

type ServiceCatalogProps = {
  services: StoreService[];
  categories: string[];
};

function categoryLabel(t: ReturnType<typeof useTranslations<"services">>, key: string) {
  const known = [
    "all",
    "consulting",
    "on_site_assembly",
    "installation",
    "field_support",
    "maintenance",
    "training",
    "financing",
  ];
  if (known.includes(key)) return t(`categories.${key}` as "categories.all");
  return key.replace(/_/g, " ");
}

export function ServiceCatalog({
  services = [],
  categories = ["all"],
}: ServiceCatalogProps) {
  const t = useTranslations("services");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    if (category === "all") return services;
    return services.filter((s) => s.category === category);
  }, [category, services]);

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
        {filtered.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-text-secondary">{t("empty")}</p>
      ) : null}
    </div>
  );
}
