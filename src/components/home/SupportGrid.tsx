import { getTranslations } from "next-intl/server";

const ICONS = {
  sales: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l2.4 4.86L20 8.3l-3.8 3.7.9 5.25L12 14.9 6.9 17.25l.9-5.25L4 8.3l5.6-.44L12 3z" />
    </svg>
  ),
  global: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  financing: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
    </svg>
  ),
  training: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
} as const;

const KEYS = ["sales", "global", "financing", "training"] as const;

export async function SupportGrid() {
  const t = await getTranslations("home.support");

  return (
    <section className="bg-basalt-elevated py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm text-text-secondary md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KEYS.map((key) => (
            <article
              key={key}
              className="rounded-sm border border-white/8 bg-basalt-muted/80 px-5 py-7"
            >
              <div className="text-amber">{ICONS[key]}</div>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {t(`items.${key}.body`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
