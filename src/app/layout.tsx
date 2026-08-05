import type { ReactNode } from "react";

/** Required root shell; html/body live in `[locale]/layout`. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
