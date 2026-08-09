"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

const SLIDES = [
  {
    src: "/images/etiel-site-images/Nokta-9000.png",
    alt: "Nokta deep-seeking metal detector",
  },
  {
    src: "/images/etiel-site-images/Nokta-9000-1.png",
    alt: "Nokta metal detection gear in the field",
  },
  {
    src: "/images/etiel-site-images/Gold-washer-green.jpeg",
    alt: "Green alluvial gold washing equipment",
  },
  {
    src: "/images/etiel-site-images/Gold-washer-yellow.jpeg",
    alt: "Yellow gold washer for prospecting operations",
  },
] as const;

const AUTO_MS = 6000;

export function Hero() {
  const t = useTranslations("home.hero");
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    setActive(index);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {SLIDES.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          className={`object-cover object-center transition-opacity duration-700 ease-in-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          sizes="100vw"
        />
      ))}

      {/* Light overlays: readable copy on the left, photos stay visible on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-basalt-deep/75 via-basalt-deep/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-basalt-deep/50 via-transparent to-basalt-deep/25" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24 md:pt-32">
        <div className="max-w-2xl">
          <h1 className="font-display animate-fade-up text-4xl font-bold leading-[1.05] tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            <span className="block">{t("titleLine1")}</span>
            <span className="block">{t("titleLine2")}</span>
          </h1>
          <p className="animate-fade-up-delay mt-5 max-w-xl text-base leading-relaxed text-white/95 [text-shadow:0_1px_14px_rgba(0,0,0,0.55)] md:text-lg">
            {t("subtitle")}
          </p>
          <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <Button href="/products" className="uppercase tracking-[0.08em]">
              {t("browseProducts")}
            </Button>
            <Button href="/cart" variant="secondary">
              {t("orderNow")}
            </Button>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-6 right-28 flex items-center gap-1.5 md:bottom-10 md:right-40"
        role="tablist"
        aria-label={t("slideIndicators")}
      >
        {SLIDES.map((slide, index) => {
          const isActive = index === active;
          return (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={t("goToSlide", { n: index + 1 })}
              onClick={() => goTo(index)}
              className={`rounded-full transition-all duration-500 ease-out ${
                isActive
                  ? "h-1.5 w-1.5 bg-white animate-hero-dot"
                  : "h-1.5 w-1.5 border border-white/90 bg-transparent hover:bg-white/30"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
