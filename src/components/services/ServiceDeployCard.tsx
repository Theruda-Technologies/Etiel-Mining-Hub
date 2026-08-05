"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import type { CatalogService } from "@/lib/catalog/services";

export function ServiceDeployCard({
  service,
  name,
}: {
  service: CatalogService;
  name: string;
}) {
  const t = useTranslations("services");
  const { addItem } = useCart();

  return (
    <aside className="rounded-sm border border-white/15 bg-basalt-elevated p-6 md:p-7">
      <h2 className="font-display text-xl font-bold text-white">
        {t("detail.deployTitle")}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        {t("detail.deployBody")}
      </p>

      <button
        type="button"
        onClick={() =>
          addItem({
            id: service.id,
            slug: service.slug,
            name,
            sku: service.sku,
            price: service.price,
            image: "/images/field-tunnel.jpg",
            itemType: "service",
          })
        }
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-basalt-deep transition-colors hover:bg-amber-bright"
      >
        {t("addToCart")}
        <span aria-hidden>→</span>
      </button>

      <ul className="mt-6 space-y-3 border-t border-white/10 pt-5">
        {service.sidebarBadges.map((badge) => (
          <li
            key={badge}
            className="flex items-center gap-3 font-mono-tech text-[11px] uppercase tracking-[0.12em] text-white/80"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber/50 text-amber">
              ✓
            </span>
            {t(`detail.badges.${badge}`)}
          </li>
        ))}
      </ul>
    </aside>
  );
}
