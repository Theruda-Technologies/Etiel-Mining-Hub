import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tMeta = await getTranslations("meta");
  const year = new Date().getFullYear();

  const links = [
    { href: "/contact", label: t("privacy") },
    { href: "/contact", label: t("terms") },
    { href: "/contact", label: t("status") },
    { href: "/contact", label: t("locations") },
  ];

  return (
    <footer className="border-t border-white/10 bg-basalt-deep">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-base font-semibold text-white">
            {tMeta("siteName")}
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-text-secondary transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="vein-line" />
        <p className="text-xs text-text-secondary">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
