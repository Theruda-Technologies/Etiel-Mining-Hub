"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: AppLocale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className="flex items-center gap-1 rounded-sm border border-white/15 p-0.5 text-xs font-medium tracking-wide"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={`rounded-sm px-2.5 py-1 transition-colors ${
          locale === "en"
            ? "bg-amber text-basalt-deep"
            : "text-white/70 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchTo("am")}
        className={`rounded-sm px-2.5 py-1 transition-colors ${
          locale === "am"
            ? "bg-amber text-basalt-deep"
            : "text-white/70 hover:text-white"
        }`}
      >
        አማ
      </button>
    </div>
  );
}
