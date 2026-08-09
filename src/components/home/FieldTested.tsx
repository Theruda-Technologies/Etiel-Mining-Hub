import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";

const AD_IMAGE =
  "/images/etiel-site-images/Nokta-9000-Magnetar%20MG37-DRC%201.png";

export async function FieldTested() {
  const t = await getTranslations("home.fieldTested");

  return (
    <section className="bg-basalt-deep">
      <div className="mx-auto grid max-w-7xl md:grid-cols-2">
        <div className="relative min-h-[320px] bg-basalt-muted md:min-h-[520px]">
          <Image
            src={AD_IMAGE}
            alt={t("imageAlt")}
            fill
            className="object-contain object-center p-6 md:p-10"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex flex-col justify-center bg-basalt-elevated px-6 py-14 md:px-12 lg:px-16">
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.18em] text-amber">
            {t("eyebrow")}
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-text-secondary">
            {t("body")}
          </p>
          <ul className="mt-6 space-y-2.5 font-mono-tech text-[11px] uppercase tracking-[0.12em] text-white/80">
            <li className="flex gap-2">
              <span className="text-amber" aria-hidden>
                ▸
              </span>
              {t("point1")}
            </li>
            <li className="flex gap-2">
              <span className="text-amber" aria-hidden>
                ▸
              </span>
              {t("point2")}
            </li>
            <li className="flex gap-2">
              <span className="text-amber" aria-hidden>
                ▸
              </span>
              {t("point3")}
            </li>
          </ul>
          <div className="mt-8">
            <Button href="/cart" className="uppercase tracking-[0.08em]">
              {t("cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
