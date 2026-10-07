import { createClient } from '@/lib/supabase/server';
import { CertificateManager } from '@/features/programs/CertificateManager';
import { ProgramLoginButton } from '@/features/programs/ProgramLoginButton';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';

export const metadata = { title: '인증서', robots: { index: false, follow: false } };

/** 내 인증서 — 로그인 후 직접 발급 (코어 program_certificates, 주인 브랜드 hero) */
export default async function Page() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const t = PROGRAM_THEMES.hero;
  return (
    <div className="min-h-[70vh] bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-3 text-xs font-bold tracking-widest" style={{ color: t.accent }}>CERTIFICATES</div>
        <h1 className="text-4xl font-black tracking-tight">인증서 발급</h1>
        <p className="mt-4 max-w-2xl text-neutral-400">참가한 HeRo 프로그램의 결과가 발표되면 직접 발급할 수 있습니다. 인증서마다 고유 코드로 진위를 확인할 수 있습니다.</p>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-20">
        {user
          ? <CertificateManager brand="hero" printBase={t.printBase} verifyBase={t.verifyBase} accentColor={t.accent} />
          : <ProgramLoginButton accentColor={t.accent} className="px-8 py-4 font-bold text-white">로그인</ProgramLoginButton>}
      </section>
    </div>
  );
}
