"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  getStoredOrders,
  lookupStoredOrder,
  type PlacedOrder,
} from "@/lib/orders/local";

export function OrdersPageClient() {
  const t = useTranslations("store");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState({ order: "", contact: "" });
  const [result, setResult] = useState<PlacedOrder | null | undefined>(undefined);
  const localOrders = useMemo(() => getStoredOrders(), [result]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/orders");
    }
  }, [loading, user, router]);

  function onLookup(e: FormEvent) {
    e.preventDefault();
    const found = lookupStoredOrder(query.order, query.contact);
    setResult(found);
  }

  if (loading || !user) {
    return <div className="min-h-[50vh] bg-basalt-deep pt-24" />;
  }

  const rows = result ? [result] : localOrders;

  return (
    <div className="bg-basalt-deep pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
          {t("orders.title")}
        </h1>
        <div className="vein-line mt-4 max-w-xs" />

        <form
          onSubmit={onLookup}
          className="mt-8 grid gap-3 rounded-sm border border-white/15 bg-basalt-elevated p-5 sm:grid-cols-[1fr_1fr_auto]"
        >
          <label className="block">
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
              {t("orders.orderNumber")}
            </span>
            <input
              value={query.order}
              onChange={(e) => setQuery((q) => ({ ...q, order: e.target.value }))}
              placeholder="ORD-YYYYMMDD-####"
              className="mt-2 w-full rounded-sm border border-white/15 bg-white px-3 py-2.5 text-sm text-basalt-deep"
              required
            />
          </label>
          <label className="block">
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
              {t("orders.contact")}
            </span>
            <input
              value={query.contact}
              onChange={(e) => setQuery((q) => ({ ...q, contact: e.target.value }))}
              placeholder={t("orders.contactPlaceholder")}
              className="mt-2 w-full rounded-sm border border-white/15 bg-white px-3 py-2.5 text-sm text-basalt-deep"
              required
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-sm bg-amber px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-basalt-deep sm:w-auto"
            >
              {t("orders.lookup")}
            </button>
          </div>
        </form>

        {result === null ? (
          <p className="mt-6 text-sm text-[#c45c4a]">{t("orders.notFound")}</p>
        ) : null}

        <div className="mt-8 overflow-x-auto rounded-sm border border-white/15">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-white/15 bg-basalt-elevated">
                <th className="px-4 py-3 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                  {t("orders.colOrder")}
                </th>
                <th className="px-4 py-3 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                  {t("orders.colDate")}
                </th>
                <th className="px-4 py-3 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                  {t("orders.colManifest")}
                </th>
                <th className="px-4 py-3 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                  {t("orders.colItems")}
                </th>
                <th className="px-4 py-3 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                  {t("orders.colStatus")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-text-secondary">
                    {t("orders.empty")}{" "}
                    <Link href="/products" className="text-amber hover:underline">
                      {t("orders.shop")}
                    </Link>
                  </td>
                </tr>
              ) : (
                rows.map((order) => {
                  const units = order.items.reduce((s, i) => s + i.quantity, 0);
                  const summary = order.items.map((i) => i.name).join(", ");
                  return (
                    <tr key={order.orderNumber} className="border-b border-white/10 last:border-b-0">
                      <td className="px-4 py-4 font-mono-tech text-sm text-white">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-4 font-mono-tech text-xs text-text-secondary">
                        {new Date(order.createdAt).toUTCString()}
                      </td>
                      <td className="max-w-xs truncate px-4 py-4 text-sm text-white/85">
                        {summary || "—"}
                      </td>
                      <td className="px-4 py-4 font-mono-tech text-xs text-text-secondary">
                        {units} {t("checkout.units")}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-sm bg-[#3d6b3a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          {t("orders.statusPending")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
