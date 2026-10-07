import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CertificateManager } from '@/features/programs/CertificateManager';
import { MadLoginButton } from '@/features/madleague/MadLoginButton';

export const metadata = {
  title: '인증서',
  description: 'MADLeague 참가 확인서 · 수상 확인서 · 활동 인증서',
};

/** 내 인증서 — 로그인 후 언제든 직접 발급·다운로드 (코어 program_certificates, MADLeague 주인 인증서) */
export default async function CertificatePage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-4xl font-black">로그인이 필요합니다</h1>
          <p className="mt-4 text-neutral-400">활동이 끝난 뒤에도 같은 Ten:One ID로 로그인하면 인증서를 다시 받을 수 있습니다.</p>
          <MadLoginButton className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">로그인</MadLoginButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <div className="mx-auto max-w-5xl px-6 pt-8">
        <Link href="/madleague/member" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" /> 매드리거
        </Link>
      </div>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-xs font-bold tracking-widest text-[#FFC000] mb-3">CERTIFICATES</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">인증서 발급</h1>
        <p className="mt-6 max-w-2xl text-neutral-400 leading-relaxed">
          참가한 경쟁 PT·프로젝트의 참가 확인서·수상 확인서와 동아리 활동 인증서를 직접 발급할 수 있습니다.
          인증서마다 고유 코드가 있어
          <Link href="/madleague/certificate/verify" className="text-[#FFC000] hover:underline"> 진위 확인 페이지</Link>에서 누구나 확인할 수 있습니다.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <CertificateManager brand="madleague" printBase="/madleague/certificate/print" verifyBase="/madleague/certificate/verify" />
      </section>
    </div>
  );
}
