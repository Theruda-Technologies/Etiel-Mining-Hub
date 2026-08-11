"use client";

import { usePathname } from "@/i18n/navigation";

const AUTH_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
]);

export function AppChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const bare = AUTH_PATHS.has(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-basalt-deep text-white">
      {bare ? null : header}
      <main className="flex-1">{children}</main>
      {bare ? null : footer}
    </div>
  );
}
