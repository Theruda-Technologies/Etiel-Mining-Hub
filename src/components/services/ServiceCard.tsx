"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import { useAuthGate } from "@/lib/auth/useAuthGate";
import { primaryImage, type StoreService } from "@/lib/catalog/types";

type ServiceCardProps = {
  service: StoreService;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const t = useTranslations("services");
  const { addItem } = useCart();
  const { requireAuth } = useAuthGate();

  const image = primaryImage(service);
  const knownCategories = new Set([
    "consulting",
    "on_site_assembly",
    "installation",
    "field_support",
    "maintenance",
    "training",
    "financing",
  ]);
  const categoryLabel = knownCategories.has(service.category)
    ? t(`categories.${service.category}` as "categories.consulting")
    : service.category.replace(/_/g, " ");
  const href = `/services/${service.slug}`;
  const cardSpecs = service.specs.slice(0, 2);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    addItem({
      id: service.id,
      slug: service.slug,
      name: service.name,
      sku: service.sku,
      price: 0,
      image,
      itemType: "service",
    });
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-white/10 bg-basalt-elevated transition-colors hover:border-amber/40">
      <Link href={href} className="absolute inset-0 z-0" aria-label={service.name} />

      <div className="relative aspect-[16/10] shrink-0 bg-basalt-muted">
        <Image
          src={image}
          alt=""
          fill
          className="object-contain object-center p-3 transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5 pointer-events-none md:p-6">
        <h3 className="font-display text-xl font-bold tracking-tight text-white">
          {service.name}
        </h3>
        <p className="mt-1.5 font-mono-tech text-[11px] uppercase tracking-wide text-text-secondary">
          {t("skuLabel", { sku: service.sku })} | {categoryLabel}
        </p>

        {cardSpecs.length > 0 ? (
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            {cardSpecs.map((spec) => (
              <div key={`${spec.label}-${spec.value}`}>
                <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
                  {spec.label}
                </dt>
                <dd className="mt-1 font-mono-tech text-sm text-white">{spec.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-5 line-clamp-3 border-t border-white/10 pt-4 text-sm leading-relaxed text-text-secondary">
            {service.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-3 pt-6 pointer-events-auto">
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex min-w-[8.5rem] flex-1 items-center justify-center rounded-sm bg-amber px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-basalt-deep transition-colors hover:bg-amber-bright"
          >
            {t("addToCart")}
          </button>
          <Link
            href={href}
            className="inline-flex min-w-[8.5rem] flex-1 items-center justify-center rounded-sm border border-white/35 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-white hover:bg-white/5"
          >
            {t("viewDetails")}
          </Link>
        </div>
      </div>
    </article>
  );
}
