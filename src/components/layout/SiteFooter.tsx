import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteLogo } from "@/components/layout/SiteLogo";

const SOCIAL_LINKS = [
  {
    key: "tiktok" as const,
    href: "https://www.tiktok.com/@etiel_mining_hub",
  },
  {
    key: "whatsapp" as const,
    href: "https://wa.me/251922056074",
  },
  {
    key: "telegram" as const,
    href: "https://t.me/Etiel23",
  },
  {
    key: "telegramGroup" as const,
    href: "https://t.me/Etiel_MiningSupply",
  },
] as const;

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  const links = [
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("terms") },
  ];

  return (
    <footer className="border-t border-white/10 bg-basalt-deep">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <SiteLogo height={80} />
          <div className="flex flex-col gap-5 sm:items-end">
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
            <ul className="flex flex-wrap items-center gap-3" aria-label={t("socials")}>
              {SOCIAL_LINKS.map((social) => (
                <li key={social.key}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(`social.${social.key}`)}
                    title={t(`social.${social.key}`)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 text-text-secondary transition-colors hover:border-amber hover:text-amber"
                  >
                    <SocialIcon name={social.key} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="vein-line" />
        <p className="text-xs text-text-secondary">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}

function SocialIcon({
  name,
}: {
  name: (typeof SOCIAL_LINKS)[number]["key"];
}) {
  const className = "h-4 w-4";
  switch (name) {
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15.34 6.34 6.34 0 0 0 9.49 21.7a6.34 6.34 0 0 0 6.34-6.34V8.77a8.2 8.2 0 0 0 4.76 1.51V6.84a4.84 4.84 0 0 1-.99-.15z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
          <path d="M12.04 2C6.58 2 2.15 6.43 2.15 11.89c0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.89-4.43 9.89-9.89C21.94 6.43 17.5 2 12.04 2zm0 18.07h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.16 8.16 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.83c.01 4.54-3.69 8.24-8.22 8.24z" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M21.95 4.47a1.3 1.3 0 0 0-1.34-.2L2.9 11.5c-.84.34-.83 1.53.02 1.85l4.5 1.66 1.74 5.35c.25.77 1.25.98 1.78.38l2.5-2.83 4.72 3.48c.66.49 1.6.13 1.8-.69l3.1-14.1c.14-.67-.33-1.3-.99-1.47zM9.5 14.6l-.18 2.66-.96-2.95 8.55-5.34-7.4 5.63z" />
        </svg>
      );
    case "telegramGroup":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
  }
}
