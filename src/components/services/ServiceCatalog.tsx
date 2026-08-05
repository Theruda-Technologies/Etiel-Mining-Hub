"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ServiceCard } from "@/components/services/ServiceCard";
import {
  CATALOG_SERVICES,
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from "@/lib/catalog/services";

export function ServiceCatalog() {
  const t = useTranslations("services");
  const [category, setCategory] = useState<ServiceCategory>("all");

  const services = useMemo(() => {
    if (category === "all") return CATALOG_SERVICES;
    return CATALOG_SERVICES.filter((s) => s.category === category);
  }, [category]);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SERVICE_CATEGORIES.map((key) => {
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
              {t(`categories.${key}`)}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {services.length === 0 ? (
        <p className="mt-12 text-center text-text-secondary">{t("empty")}</p>
      ) : null}
    </div>
  );
}
