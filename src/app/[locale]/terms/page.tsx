import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalDocumentPage doc="terms" locale={locale} />;
}
