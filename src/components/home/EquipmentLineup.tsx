"use client";

import Image from "next/image";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const ITEMS = [
  {
    key: "magnetar" as const,
    image: "/images/equipment-drill.jpg",
    href: "/products",
    featured: true,
  },
  {
    key: "titan" as const,
    image: "/images/equipment-conveyor.jpg",
    href: "/products",
    featured: false,
  },
  {
    key: "aeroscout" as const,
    image: "/images/equipment-drone.jpg",
    href: "/products",
    featured: false,
  },
];

export function EquipmentLineup() {
  const t = useTranslations("home.equipment");
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 360), behavior: "smooth" });
  }

  return (
    <section className="bg-basalt-deep py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-text-secondary md:text-base">
              {t("subtitle")}
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-amber hover:text-amber"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-amber hover:text-amber"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="equipment-scroll flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {ITEMS.map((item) => (
            <article
              key={item.key}
              className="relative w-[min(85vw,320px)] shrink-0 snap-start overflow-hidden rounded-sm border border-white/8 bg-basalt-elevated"
            >
              <div className="relative aspect-[4/3] bg-basalt-muted">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="320px"
                />
                {item.featured ? (
                  <span className="absolute left-3 top-3 rounded-sm bg-amber px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-basalt-deep">
                    {t("featured")}
                  </span>
                ) : null}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-white">
                  {t(`items.${item.key}.name`)}
                </h3>
                <p className="mt-1 text-sm font-medium text-amber">
                  {t(`items.${item.key}.series`)}
                </p>
                <p className="mt-3 font-mono-tech text-xs leading-relaxed text-text-secondary">
                  {t(`items.${item.key}.specs`)}
                </p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-amber"
                >
                  {t("viewDetails")}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
