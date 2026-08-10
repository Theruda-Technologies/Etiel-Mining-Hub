import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "am"],
  defaultLocale: "en",
  // Default locale (English) has no URL prefix: `/`, `/products`, etc.
  // Amharic keeps the `/am` prefix.
  localePrefix: "as-needed",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
