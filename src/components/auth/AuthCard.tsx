import type { ReactNode } from "react";
import { SiteLogo } from "@/components/layout/SiteLogo";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-basalt-deep px-5 py-10 md:py-14">
      <div className="mx-auto">
        <SiteLogo height={96} priority />
      </div>

      <div className="mx-auto mt-12 w-full max-w-[420px] flex-1 md:mt-16">
        <div className="relative border border-white/20 bg-basalt-elevated px-7 py-9 md:px-9 md:py-10">
          <Corner accent="tl" />
          <Corner accent="tr" />
          <Corner accent="bl" />
          <Corner accent="br" />

          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 font-mono-tech text-[10px] uppercase tracking-[0.18em] text-white/70">
              {subtitle}
            </p>
          ) : null}

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-8 border-t border-white/15 pt-6 text-center">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Corner({ accent }: { accent: "tl" | "tr" | "bl" | "br" }) {
  const base = "pointer-events-none absolute h-4 w-4 border-amber";
  const map = {
    tl: `${base} left-0 top-0 -translate-x-[1px] -translate-y-[1px] border-l-2 border-t-2`,
    tr: `${base} right-0 top-0 translate-x-[1px] -translate-y-[1px] border-r-2 border-t-2`,
    bl: `${base} bottom-0 left-0 -translate-x-[1px] translate-y-[1px] border-b-2 border-l-2`,
    br: `${base} bottom-0 right-0 translate-x-[1px] translate-y-[1px] border-b-2 border-r-2`,
  };
  return <span aria-hidden className={map[accent]} />;
}
