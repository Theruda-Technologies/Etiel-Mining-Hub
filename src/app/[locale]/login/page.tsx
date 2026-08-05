import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="min-h-screen bg-basalt-deep" />}>
      <LoginPageClient />
    </Suspense>
  );
}
