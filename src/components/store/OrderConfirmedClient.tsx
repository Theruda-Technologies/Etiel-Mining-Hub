"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getLastPlacedOrder, type PlacedOrder } from "@/lib/orders/local";

export function OrderConfirmedClient() {
  const t = useTranslations("store");
  const params = useSearchParams();
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    const last = getLastPlacedOrder();
    const q = params.get("order");
    if (last && (!q || last.orderNumber === q)) {
      setOrder(last);
    } else if (q) {
      setOrder({
        id: "",
        orderNumber: q,
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        shippingAddress: "",
        notes: "",
        createdAt: new Date().toISOString(),
        items: [],
      });
    }
  }, [params]);

  return (
    <div className="bg-basalt-deep pt-24 md:pt-28">
      <div className="mx-auto max-w-2xl px-5 pb-20 text-center md:px-8 md:pb-28">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3d6b3a] text-2xl text-white">
          ✓
        </div>
        <h1 className="font-display mt-6 text-4xl font-bold text-white md:text-5xl">
          {t("confirmed.title")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-text-secondary md:text-base">
          {t("confirmed.subtitle")}
        </p>

        <div className="mx-auto mt-8 inline-block rounded-sm border border-white/15 bg-basalt-elevated px-8 py-4">
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-text-secondary">
            {t("confirmed.orderNumber")}
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-amber">
            #{order?.orderNumber ?? "—"}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <div className="relative flex items-start justify-between">
            <div className="absolute left-[16%] right-[16%] top-2 h-px bg-white/20" />
            <div className="absolute left-[16%] right-[50%] top-2 h-px bg-amber" />
            {[
              t("confirmed.steps.placed"),
              t("confirmed.steps.reviewing"),
              t("confirmed.steps.confirmed"),
            ].map((label, i) => (
              <div key={label} className="relative z-10 flex w-24 flex-col items-center">
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    i === 0 ? "border-amber bg-amber" : "border-white/50 bg-basalt-deep"
                  }`}
                />
                <span className="mt-3 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-text-secondary">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {order && order.items.length > 0 ? (
          <div className="mt-12 rounded-sm border border-white/15 bg-basalt-elevated p-6 text-left">
            <h2 className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-text-secondary">
              {t("confirmed.manifest")}
            </h2>
            <ul className="mt-4 divide-y divide-white/10">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="font-mono-tech text-[11px] text-text-secondary">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <p className="font-mono-tech text-xs uppercase text-amber">
                    {t("confirmed.qty")}: {item.quantity}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex rounded-sm bg-amber px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-basalt-deep hover:bg-amber-bright"
          >
            {t("confirmed.continueShopping")}
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-sm border border-white/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:border-white"
          >
            {t("confirmed.print")}
          </button>
        </div>

        <p className="mt-6">
          <Link
            href="/orders"
            className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-text-secondary hover:text-amber"
          >
            {t("confirmed.trackOrders")} →
          </Link>
        </p>
      </div>
    </div>
  );
}
