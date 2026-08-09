import { getTranslations, setRequestLocale } from "next-intl/server";

type LegalDoc = "privacy" | "terms";

type LegalPageProps = {
  doc: LegalDoc;
  locale: string;
};

export async function LegalDocumentPage({ doc, locale }: LegalPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations(`legal.${doc}`);
  const sections = t.raw("sections") as Array<{
    heading: string;
    body: string[];
  }>;

  return (
    <div className="bg-basalt-deep pt-24 md:pt-28">
      <article className="mx-auto max-w-3xl px-5 pb-20 md:px-8 md:pb-28">
        <header>
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-amber">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
            {t("title")}
          </h1>
          <div className="vein-line mt-5" />
          <p className="mt-5 text-sm text-text-secondary">{t("updated")}</p>
          <p className="mt-4 text-base leading-relaxed text-text-secondary md:text-lg">
            {t("intro")}
          </p>
        </header>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-bold text-white md:text-2xl">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary md:text-base">
                {section.body.map((paragraph, i) => (
                  <p key={`${section.heading}-${i}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-white/10 pt-8 text-sm text-text-secondary">
          {t("contactNote")}
        </p>
      </article>
    </div>
  );
}
