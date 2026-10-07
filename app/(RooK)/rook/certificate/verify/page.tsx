import { CertificateVerifyForm } from '@/features/programs/CertificateVerifyForm';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const metadata = { title: '인증서 진위 확인' };

export default function Page() {
  return <CertificateVerifyForm verifyBase={PROGRAM_THEMES.rook.verifyBase} accentColor={PROGRAM_THEMES.rook.accent} brandName="RooK" />;
}
