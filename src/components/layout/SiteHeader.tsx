"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tMeta = useTranslations("meta");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/services", label: t("services") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-basalt-deep/95 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:h-[4.5rem] md:px-8">
        <Link
          href="/"
          className="font-display text-base font-bold tracking-tight text-white md:text-lg"
        >
          {tMeta("siteName")}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium tracking-wide text-white/85 transition-colors hover:text-amber"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Button href="/checkout" className="!px-4 !py-2 text-[13px]">
            {t("placeOrder")}
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/20 text-white md:hidden"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-1.5">
            <span
              className={`block h-px w-5 bg-current transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span className={`block h-px w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
            <span
              className={`block h-px w-5 bg-current transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-basalt-deep px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-white/90"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-3 pt-2">
              <LanguageSwitcher />
              <Button href="/checkout" className="!px-4 !py-2 text-[13px]">
                {t("placeOrder")}
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
