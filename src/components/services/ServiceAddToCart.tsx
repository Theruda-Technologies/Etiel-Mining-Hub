"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import type { CatalogService } from "@/lib/catalog/services";

export function ServiceAddToCart({
  service,
  name,
}: {
  service: CatalogService;
  name: string;
}) {
  const t = useTranslations("services");
  const { addItem } = useCart();

  return (
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
      className="inline-flex items-center justify-center rounded-sm bg-amber px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-basalt-deep transition-colors hover:bg-amber-bright"
    >
      {t("addToCart")}
    </button>
  );
}
