import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { SignupPageClient } from "@/components/auth/SignupPageClient";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="min-h-screen bg-basalt-deep" />}>
      <SignupPageClient />
    </Suspense>
  );
}
