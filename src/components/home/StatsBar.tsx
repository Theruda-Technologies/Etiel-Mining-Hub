import { getTranslations } from "next-intl/server";

export async function StatsBar() {
  const t = await getTranslations("home.stats");

  const items = [
    { value: t("unitsValue"), label: t("unitsLabel") },
    { value: t("recoveryValue"), label: t("recoveryLabel") },
    { value: t("supportValue"), label: t("supportLabel") },
    { value: t("failuresValue"), label: t("failuresLabel") },
  ];

  return (
    <section className="border-y border-white/10 bg-basalt-elevated">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-8 text-center md:py-10 ${
              index < items.length - 1 ? "md:border-r md:border-white/10" : ""
            } ${index % 2 === 0 ? "max-md:border-r max-md:border-white/10" : ""} ${
              index < 2 ? "max-md:border-b max-md:border-white/10" : ""
            }`}
          >
            <p className="font-display text-3xl font-bold tracking-tight text-amber md:text-4xl">
              {item.value}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/75">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
