import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CertificateManager } from './CertificateManager';

export const metadata = {
  title: '인증서',
  description: 'MADLeague 활동인증서 · 수상확인서 · MAD Crown',
};

export default async function CertificatePage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-4xl font-black">로그인이 필요합니다</h1>
          <Link href="/login?redirect=/madleague/member/certificate" className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">로그인</Link>
        </div>
      </div>
    );
  }

  const { data: member } = await sb
    .from('mad_members')
    .select('id, name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-4xl font-black">매드리거 연동이 필요합니다</h1>
          <p className="mt-4 text-neutral-400">인증서 발급은 승인된 매드리거만 가능합니다.</p>
          <Link href="/madleague/member" className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">매드리거 페이지로</Link>
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
          활동인증서·수상확인서·MAD Crown 인증서를 발급할 수 있습니다.
          각 인증서에는 고유한 검증 코드가 포함되며,
          <Link href="/madleague/certificate/verify" className="text-[#FFC000] hover:underline"> 검증 페이지</Link>에서 누구나 진위를 확인할 수 있습니다.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <CertificateManager memberName={member.name} />
      </section>
    </div>
  );
}
