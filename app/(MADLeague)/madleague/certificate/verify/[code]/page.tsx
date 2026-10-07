import { CertificateVerify } from '@/features/programs/CertificateVerify';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const revalidate = 0;

interface PageProps { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  return { title: `인증서 진위 확인 · ${code.toUpperCase()}`, robots: { index: false, follow: false } };
}

export default async function VerifyCodePage({ params }: PageProps) {
  const { code } = await params;
  return <CertificateVerify code={code} theme={PROGRAM_THEMES.madleague} />;
}
