"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useCart } from "@/lib/cart/store";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { user, loading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isHome = pathname === "/";
  const isAuthed = !!user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: t("home"), match: (p: string) => p === "/" },
    {
      href: "/products",
      label: t("products"),
      match: (p: string) => p.startsWith("/products"),
    },
    {
      href: "/services",
      label: t("services"),
      match: (p: string) => p.startsWith("/services"),
    },
    {
      href: "/contact",
      label: t("contact"),
      match: (p: string) => p.startsWith("/contact"),
    },
  ] as const;

  const solid = !isHome || scrolled || open;

  async function handleLogout() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    setOpen(false);
    router.push("/");
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "border-b border-white/5 bg-basalt-deep/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 md:h-24 md:px-8">
        <SiteLogo height={72} priority />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 pb-0.5 text-[13px] font-medium tracking-wide transition-colors ${
                  active
                    ? "border-amber text-white"
                    : "border-transparent text-white/85 hover:text-amber"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {!loading && isAuthed ? (
            <Button href="/orders" variant="secondary" className="!px-4 !py-2 text-[13px]">
              {t("myOrders")}
            </Button>
          ) : null}
          <Button href="/cart" className="!px-4 !py-2 text-[13px]">
            {t("placeOrder")}
            {count > 0 ? (
              <span className="ml-1.5 rounded-full bg-basalt-deep/20 px-1.5 text-[11px]">
                {count}
              </span>
            ) : null}
          </Button>
          {!loading && isAuthed ? (
            <Button
              variant="ghost"
              className="!px-4 !py-2 text-[13px]"
              onClick={handleLogout}
            >
              {signingOut ? "…" : t("logout")}
            </Button>
          ) : !loading ? (
            <Button href="/login" variant="secondary" className="!px-4 !py-2 text-[13px]">
              {t("login")}
            </Button>
          ) : null}
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
            {links.map((link) => {
              const active = link.match(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base ${active ? "text-amber" : "text-white/90"}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <LanguageSwitcher />
              <div className="flex flex-wrap gap-2">
                {!loading && isAuthed ? (
                  <Button href="/orders" variant="secondary" className="!px-4 !py-2 text-[13px]">
                    {t("myOrders")}
                  </Button>
                ) : null}
                <Button href="/cart" className="!px-4 !py-2 text-[13px]">
                  {t("placeOrder")}
                  {count > 0 ? ` (${count})` : ""}
                </Button>
                {!loading && isAuthed ? (
                  <Button
                    variant="ghost"
                    className="!px-4 !py-2 text-[13px]"
                    onClick={handleLogout}
                  >
                    {signingOut ? "…" : t("logout")}
                  </Button>
                ) : !loading ? (
                  <Button href="/login" variant="secondary" className="!px-4 !py-2 text-[13px]">
                    {t("login")}
                  </Button>
                ) : null}
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
