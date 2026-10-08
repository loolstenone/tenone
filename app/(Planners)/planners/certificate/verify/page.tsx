import { CertificateVerifyForm } from '@/features/programs/CertificateVerifyForm';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const metadata = { title: '인증서 진위 확인' };

export default function Page() {
  return <CertificateVerifyForm verifyBase={PROGRAM_THEMES.planners.verifyBase} accentColor={PROGRAM_THEMES.planners.accent} brandName="Planner's" />;
}
