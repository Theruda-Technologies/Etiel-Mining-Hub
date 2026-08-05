import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CATALOG_SERVICES, getServiceBySlug } from "@/lib/catalog/services";
import { ServiceDeployCard } from "@/components/services/ServiceDeployCard";

export function generateStaticParams() {
  return CATALOG_SERVICES.flatMap((s) =>
    ["en", "am"].map((locale) => ({ locale, slug: s.slug })),
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const t = await getTranslations("services");
  const name = t(`items.${service.id}.name`);
  const shortName = t(`items.${service.id}.shortName`);

  return (
    <div className="bg-basalt-deep pt-20 md:pt-24">
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.12em] text-white/50"
        >
          <Link href="/" className="transition-colors hover:text-white">
            {t("detail.breadcrumbHome")}
          </Link>
          <span aria-hidden>&gt;</span>
          <Link href="/services" className="transition-colors hover:text-white">
            {t("detail.breadcrumbServices")}
          </Link>
          <span aria-hidden>&gt;</span>
          <span className="text-amber">{shortName}</span>
        </nav>

        {/* Hero copy */}
        <header className="mt-8 max-w-4xl md:mt-10">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            {name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-secondary md:text-lg">
            {t(`items.${service.id}.tagline`)}
          </p>
        </header>

        {/* Metrics bar */}
        <dl className="mt-10 grid grid-cols-1 divide-y divide-white/15 overflow-hidden rounded-sm border border-white/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {service.metricKeys.map((key) => (
            <div key={key} className="px-5 py-5 md:px-6 md:py-6">
              <dt className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                {t(`items.${service.id}.metrics.${key}.label`)}
              </dt>
              <dd
                className={`mt-2 font-display text-xl font-semibold md:text-2xl ${
                  key === service.metricKeys[0] ? "text-amber" : "text-white"
                }`}
              >
                {t(`items.${service.id}.metrics.${key}.value`)}
              </dd>
            </div>
          ))}
        </dl>

        {/* Overview + deploy CTA */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:gap-10">
          <section>
            <h2 className="font-display text-2xl font-bold text-white">
              {t("detail.overviewTitle")}
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-text-secondary">
              <p>{t(`items.${service.id}.overview1`)}</p>
              <p>{t(`items.${service.id}.overview2`)}</p>
            </div>
          </section>
          <ServiceDeployCard service={service} name={name} />
        </div>

        {/* Core capabilities — equal cards */}
        <section className="mt-16 md:mt-20">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            {t("detail.capabilitiesTitle")}
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {service.capabilityKeys.map((key, index) => (
              <article
                key={key}
                className={`rounded-sm border border-white/12 p-6 ${
                  index === 0
                    ? "bg-gradient-to-br from-[#3a2a18] to-basalt-elevated"
                    : "bg-basalt-elevated/40"
                }`}
              >
                <div className="text-amber">
                  <CapabilityGlyph index={index} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-white">
                  {t(`items.${service.id}.capabilities.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {t(`items.${service.id}.capabilities.${key}.body`)}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Service tiers */}
        <section className="mt-16 md:mt-20">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            {t("detail.tiersTitle")}
          </h2>
          <div className="mt-8 overflow-x-auto rounded-sm border border-white/15">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="px-5 py-4 font-mono-tech text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary md:px-6">
                    {t("detail.feature")}
                  </th>
                  <th className="px-5 py-4 font-mono-tech text-[11px] font-medium uppercase tracking-[0.14em] text-white md:px-6">
                    {t("detail.standard")}
                  </th>
                  <th className="bg-[#2a2218] px-5 py-4 font-mono-tech text-[11px] font-medium uppercase tracking-[0.14em] text-amber md:px-6">
                    {t("detail.premium")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {service.tierKeys.map((key) => (
                  <tr key={key} className="border-b border-white/10 last:border-b-0">
                    <th
                      scope="row"
                      className="px-5 py-4 text-sm font-medium text-white md:px-6"
                    >
                      {t(`items.${service.id}.tiers.${key}.label`)}
                    </th>
                    <td className="px-5 py-4 text-sm text-text-secondary md:px-6">
                      <TierCell value={t(`items.${service.id}.tiers.${key}.standard`)} />
                    </td>
                    <td className="bg-[#2a2218]/60 px-5 py-4 text-sm text-white md:px-6">
                      <TierCell
                        value={t(`items.${service.id}.tiers.${key}.premium`)}
                        emphasize
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function TierCell({
  value,
  emphasize = false,
}: {
  value: string;
  emphasize?: boolean;
}) {
  if (value === "yes") {
    return <span className={emphasize ? "text-amber" : "text-white"}>✓</span>;
  }
  if (value === "no") {
    return <span className="text-white/35">✕</span>;
  }
  return (
    <span className={emphasize ? "font-medium text-amber" : undefined}>{value}</span>
  );
}

function CapabilityGlyph({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 12h4l2-5 3 10 2-5h7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}
