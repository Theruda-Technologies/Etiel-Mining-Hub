"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import { useAuthGate } from "@/lib/auth/useAuthGate";
import type { CatalogService } from "@/lib/catalog/services";

export function ServiceCard({ service }: { service: CatalogService }) {
  const t = useTranslations("services");
  const { addItem } = useCart();
  const { requireAuth } = useAuthGate();

  const name = t(`items.${service.id}.name`);
  const href = `/services/${service.slug}`;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    addItem({
      id: service.id,
      slug: service.slug,
      name,
      sku: service.sku,
      price: service.price,
      image: "/images/field-tunnel.jpg",
      itemType: "service",
    });
  }

  return (
    <article className="group relative flex h-full flex-col rounded-sm border border-white/10 bg-basalt-elevated p-5 transition-colors hover:border-amber/40 md:p-6">
      <Link href={href} className="absolute inset-0 z-0" aria-label={name} />

      <div className="relative z-10 flex flex-1 flex-col pointer-events-none">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-sm bg-white/8 px-2.5 py-1 font-mono-tech text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
            {t(`categories.${service.category}`)}
          </span>
          <span className="text-amber">
            <ServiceIcon name={service.icon} />
          </span>
        </div>

        <h3 className="font-display mt-5 text-xl font-bold tracking-tight text-white">
          {name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {t(`items.${service.id}.description`)}
        </p>

        <dl className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
          {service.detailKeys.map((key) => (
            <div
              key={key}
              className="flex items-baseline justify-between gap-3 font-mono-tech text-[11px] uppercase tracking-[0.08em]"
            >
              <dt className="text-text-secondary">
                {t(`items.${service.id}.detailLabels.${key}`)}
              </dt>
              <dd className="text-right text-white">
                {t(`items.${service.id}.detailValues.${key}`)}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex flex-wrap gap-3 pt-6 pointer-events-auto">
          <Link
            href={href}
            className="inline-flex min-w-[7.5rem] flex-1 items-center justify-center rounded-sm border border-white/35 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-white hover:bg-white/5"
          >
            {t("viewDetails")}
          </Link>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex min-w-[7.5rem] flex-1 items-center justify-center rounded-sm bg-amber px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-basalt-deep transition-colors hover:bg-amber-bright"
          >
            {t("addToCart")}
          </button>
        </div>
      </div>
    </article>
  );
}

function ServiceIcon({ name }: { name: CatalogService["icon"] }) {
  const className = "h-6 w-6";
  if (name === "wrench") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }
  if (name === "headset") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 14v3a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2ZM20 14v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z" />
      </svg>
    );
  }
  if (name === "cap") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  }
  if (name === "pulse") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 12h4l2-5 3 10 2-5h7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
    </svg>
  );
}
