import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://etielmininghub.com";

type AppPath = Parameters<typeof getPathname>[0]["href"];

export function truncateMetaDescription(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (cleaned.length <= max) return cleaned;
  const sliced = cleaned.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const base = (lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trimEnd();
  return `${base}…`;
}

function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

function localizedHref(locale: AppLocale, path: string): string {
  return getPathname({ locale, href: path as AppPath });
}

export function buildPageMetadata(options: {
  locale: string;
  title: string;
  description: string;
  /** App path without locale prefix, e.g. `/` or `/products/slug`. */
  path: string;
  siteName: string;
  absoluteTitle?: boolean;
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const locale = (
    routing.locales.includes(options.locale as AppLocale)
      ? options.locale
      : routing.defaultLocale
  ) as AppLocale;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = absoluteUrl(localizedHref(loc, options.path));
  }
  languages["x-default"] = absoluteUrl(
    localizedHref(routing.defaultLocale, options.path),
  );

  const canonical = absoluteUrl(localizedHref(locale, options.path));
  const ogImage = options.image ? absoluteUrl(options.image) : undefined;

  return {
    title: options.absoluteTitle
      ? { absolute: options.title }
      : options.title,
    description: options.description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "am" ? "am_ET" : "en_US",
      url: canonical,
      siteName: options.siteName,
      title: options.title,
      description: options.description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: options.title,
      description: options.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(options.noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}
