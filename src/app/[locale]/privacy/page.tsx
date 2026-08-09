import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalDocumentPage doc="privacy" locale={locale} />;
}
