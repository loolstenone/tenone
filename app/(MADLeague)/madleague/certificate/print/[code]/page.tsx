import { CertificatePrint } from '@/features/programs/CertificatePrint';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const revalidate = 0;
export const metadata = { title: '인증서', robots: { index: false, follow: false } };

export default async function PrintCertPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <CertificatePrint code={code} theme={PROGRAM_THEMES.madleague} />;
}
