import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";

export async function FieldTested() {
  const t = await getTranslations("home.fieldTested");

  return (
    <section className="bg-basalt-deep">
      <div className="mx-auto grid max-w-7xl md:grid-cols-2">
        <div className="relative min-h-[320px] md:min-h-[480px]">
          <Image
            src="/images/field-tunnel.jpg"
            alt=""
            fill
            className="object-cover grayscale"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-basalt-deep/25" />
        </div>
        <div className="flex flex-col justify-center bg-basalt-elevated px-6 py-14 md:px-12 lg:px-16">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white uppercase md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-text-secondary">
            {t("body")}
          </p>
          <div className="mt-8">
            <Button href="/checkout" className="uppercase tracking-[0.08em]">
              {t("cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
