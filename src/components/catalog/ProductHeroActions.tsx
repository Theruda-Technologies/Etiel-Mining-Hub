"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import type { CatalogProduct } from "@/lib/catalog/products";

export function ProductHeroActions({
  product,
  name,
}: {
  product: CatalogProduct;
  name: string;
}) {
  const t = useTranslations("catalog");
  const { addItem } = useCart();

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() =>
          addItem({
            id: product.id,
            slug: product.slug,
            name,
            sku: product.sku,
            price: product.price,
            image: product.image,
            itemType: "product",
          })
        }
        className="inline-flex items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-basalt-deep transition-colors hover:bg-amber-bright"
      >
        <CartIcon />
        {t("addToCart")}
      </button>
      <Link
        href="/contact"
        className="inline-flex items-center justify-center rounded-sm border border-amber px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-amber transition-colors hover:bg-amber/10"
      >
        {t("detail.contactSales")}
      </Link>
    </div>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H7" />
    </svg>
  );
}
