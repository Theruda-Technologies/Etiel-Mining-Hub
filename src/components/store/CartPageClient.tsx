"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/store";

export function CartPageClient() {
  const t = useTranslations("store");
  const { items, setQuantity, removeItem, count } = useCart();

  return (
    <div className="bg-basalt-deep pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
          {t("review.title")}
        </h1>

        <ol className="mt-6 flex flex-wrap gap-4 font-mono-tech text-[11px] uppercase tracking-[0.14em] md:gap-8">
          <li className="text-amber">01 {t("steps.selection")}</li>
          <li className="text-amber">02 {t("steps.details")}</li>
          <li className="text-white/35">03 {t("steps.review")}</li>
        </ol>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
          <section>
            <h2 className="font-display text-xl font-bold text-white">
              {t("review.manifest")}
            </h2>
            <div className="vein-line mt-3" />

            {items.length === 0 ? (
              <div className="mt-8 rounded-sm border border-white/10 bg-basalt-elevated p-8 text-center">
                <p className="text-text-secondary">{t("review.empty")}</p>
                <Link
                  href="/products"
                  className="mt-5 inline-flex rounded-sm border border-amber px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-amber"
                >
                  {t("review.addMore")}
                </Link>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 rounded-sm border border-white/10 bg-basalt-elevated p-4"
                  >
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm bg-basalt-muted">
                      <Image
                        src={item.image || "/images/equipment-drill.jpg"}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display font-semibold text-white">
                            {item.name}
                          </h3>
                          <p className="mt-1 font-mono-tech text-[11px] text-text-secondary">
                            {item.sku}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-white/40 transition-colors hover:text-[#c45c4a]"
                          aria-label={t("review.remove")}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center gap-3 font-mono-tech text-xs uppercase tracking-wide text-text-secondary">
                        <span>{t("review.qty")}:</span>
                        <button
                          type="button"
                          className="h-7 w-7 rounded-sm border border-white/20 text-white hover:border-amber"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="h-7 w-7 rounded-sm border border-white/20 text-white hover:border-amber"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/products"
              className="mt-6 flex w-full items-center justify-center rounded-sm border border-white/25 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-amber hover:text-amber"
            >
              + {t("review.addMore")}
            </Link>
          </section>

          <aside className="h-fit rounded-sm border border-white/15 bg-basalt-elevated p-6">
            <h2 className="font-display text-lg font-bold text-white">
              {t("review.summaryTitle")}
            </h2>
            <dl className="mt-5 space-y-3 border-t border-white/10 pt-5 font-mono-tech text-xs uppercase tracking-[0.1em]">
              <div className="flex justify-between gap-3">
                <dt className="text-text-secondary">{t("review.units")}</dt>
                <dd className="text-white">{count}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-secondary">{t("review.payment")}</dt>
                <dd className="text-amber">{t("review.pendingInvoice")}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-sm px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                items.length === 0
                  ? "pointer-events-none bg-white/10 text-white/40"
                  : "bg-amber text-basalt-deep hover:bg-amber-bright"
              }`}
            >
              {t("review.continue")}
              <span aria-hidden>→</span>
            </Link>
            <p className="mt-3 text-center text-[11px] text-text-secondary">
              {t("review.secure")}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12" />
    </svg>
  );
}
