import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { fetchFeaturedAdItem } from "@/lib/catalog/fetch-featured";

export async function FieldTested() {
  const t = await getTranslations("home.fieldTested");
  const featured = await fetchFeaturedAdItem();

  if (!featured) return null;

  const image =
    featured.image_paths[0] ||
    "/images/etiel-site-images/Nokta-9000.png";
  const points = featured.specs.slice(0, 3);

  return (
    <section className="bg-basalt-deep">
      <div className="mx-auto grid max-w-7xl md:grid-cols-2">
        <div className="relative min-h-[320px] bg-basalt-muted md:min-h-[520px]">
          <Image
            src={image}
            alt={featured.name}
            fill
            className="object-contain object-center p-6 md:p-10"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex flex-col justify-center bg-basalt-elevated px-6 py-14 md:px-12 lg:px-16">
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.18em] text-amber">
            {featured.kind === "product" ? t("eyebrowProduct") : t("eyebrowService")}
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {featured.name}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-text-secondary">
            {featured.description}
          </p>
          {points.length > 0 ? (
            <ul className="mt-6 space-y-2.5 font-mono-tech text-[11px] uppercase tracking-[0.12em] text-white/80">
              {points.map((point) => (
                <li key={`${point.label}-${point.value}`} className="flex gap-2">
                  <span className="text-amber" aria-hidden>
                    ▸
                  </span>
                  <span>
                    {point.label}: {point.value}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/cart" className="uppercase tracking-[0.08em]">
              {t("cta")}
            </Button>
            <Button
              href={featured.href}
              variant="secondary"
              className="uppercase tracking-[0.08em]"
            >
              {t("viewDetails")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
