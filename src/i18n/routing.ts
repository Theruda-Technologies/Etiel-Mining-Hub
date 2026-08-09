import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["am", "en"],
  defaultLocale: "am",
  localePrefix: "always",
  // Always land on Amharic unless the user explicitly chooses English.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
