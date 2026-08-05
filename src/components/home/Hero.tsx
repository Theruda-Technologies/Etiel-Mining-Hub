import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";

export async function Hero() {
  const t = await getTranslations("home.hero");

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <Image
        src="/images/hero-mine.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-basalt-deep/90 via-basalt-deep/55 to-basalt-deep/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-basalt-deep via-transparent to-basalt-deep/40" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24 md:pt-32">
        <div className="max-w-2xl">
          <h1 className="font-display animate-fade-up text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            <span className="block">{t("titleLine1")}</span>
            <span className="block">{t("titleLine2")}</span>
          </h1>
          <p className="animate-fade-up-delay mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
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
    </section>
  );
}
