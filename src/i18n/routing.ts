import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["am", "en"],
  defaultLocale: "am",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
