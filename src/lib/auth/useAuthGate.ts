"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

/** Redirects to login when unauthenticated. Returns true if the caller may proceed. */
export function useAuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = useCallback(() => {
    if (loading) return false;
    if (user) return true;
    const next = encodeURIComponent(pathname || "/");
    router.push(`/login?next=${next}`);
    return false;
  }, [loading, user, router, pathname]);

  return { user, loading, requireAuth, isAuthenticated: !!user };
}
