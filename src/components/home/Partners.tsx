import { getTranslations } from "next-intl/server";

export async function Partners() {
  const t = await getTranslations("home.partners");
  const names = t.raw("names") as string[];

  return (
    <section className="bg-basalt-deep py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 text-center md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">
          {t("label")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:gap-x-14">
          {names.map((name) => (
            <span
              key={name}
              className="font-display text-lg font-bold uppercase tracking-[0.08em] text-white/25 md:text-2xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
