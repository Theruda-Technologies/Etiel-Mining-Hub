import { routing, type AppLocale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

/** Resolve locale from the current browser path (`as-needed` prefix). */
export function currentAuthLocale(): AppLocale {
  if (typeof window === "undefined") return routing.defaultLocale;
  const segment = window.location.pathname.split("/")[1];
  return segment === "am" ? "am" : routing.defaultLocale;
}

/** Absolute auth redirect URL with correct locale prefix. */
export function authRedirectUrl(path: string, locale?: AppLocale): string {
  const loc = locale ?? currentAuthLocale();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const prefix = loc === routing.defaultLocale ? "" : `/${loc}`;
  const origin =
    typeof window !== "undefined" ? window.location.origin : SITE_URL;
  return `${origin}${prefix}${normalized}`;
}
