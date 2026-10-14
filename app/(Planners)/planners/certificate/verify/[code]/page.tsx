import { CertificateVerify } from '@/features/programs/CertificateVerify';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const revalidate = 0;
export const metadata = { title: '인증서 진위 확인', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <div data-program-light><CertificateVerify code={code} theme={PROGRAM_THEMES.planners} /></div>;
}
