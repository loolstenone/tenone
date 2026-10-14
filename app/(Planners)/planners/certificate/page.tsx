import { createClient } from '@/lib/supabase/server';
import { CertificateManager } from '@/features/programs/CertificateManager';
import { ProgramLoginButton } from '@/features/programs/ProgramLoginButton';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';
import { PlannersPageHero, PLANNERS_SECTION } from '@/features/planners/PageHero';

export const metadata = { title: '참여 확인서', robots: { index: false, follow: false } };

/** 내 참여 확인서 — 로그인 후 직접 발급 (코어 program_certificates) · 사이트 공통 틀(흰 배경) */
export default async function Page() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const t = { ...PROGRAM_THEMES.planners, accent: '#0F766E' }; // 흰 배경용 진한 틸
  return (
    <>
      <PlannersPageHero
        eyebrow="기획자 과정 · 참여 확인서"
        title="참여 확인서 발급"
        description="참가한 기획자 과정의 결과가 발표되면 직접 발급할 수 있습니다. 확인서마다 고유 코드로 진위를 확인할 수 있습니다."
      />
      <section className={PLANNERS_SECTION}>
        {user
          ? <CertificateManager brand="planners" printBase={t.printBase} verifyBase={t.verifyBase} accentColor={t.accent} light />
          : <ProgramLoginButton accentColor={t.accent} className="px-8 py-4 font-bold text-white">로그인</ProgramLoginButton>}
      </section>
    </>
  );
}
