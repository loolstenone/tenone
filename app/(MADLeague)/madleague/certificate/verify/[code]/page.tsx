import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, Ban, Trophy, Award, FileBadge } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  return { title: `인증서 검증 · ${code}`, description: 'MADLeague 인증서 진위 검증' };
}

const ICON_BY_TYPE: Record<string, typeof Award> = {
  activity: FileBadge, competition: Award, award: Award, crown: Trophy,
};

export default async function VerifyCodePage({ params }: PageProps) {
  const { code } = await params;
  const normalized = code.toUpperCase();

  const sb = await createClient();
  const { data } = await sb
    .from('mad_certificates')
    .select('id, type, title, details, verification_code, issued_at, revoked, revoked_at, revoked_reason')
    .eq('verification_code', normalized)
    .maybeSingle();

  if (!data) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[70vh]">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <Ban className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="mt-6 text-3xl font-black">인증서를 찾을 수 없습니다</h1>
          <p className="mt-4 text-neutral-400">
            코드 <span className="font-mono text-white">{normalized}</span>에 해당하는 인증서가 존재하지 않습니다.
          </p>
          <Link href="/madleague/certificate/verify" className="mt-8 inline-block border border-neutral-700 hover:border-white px-6 py-3 text-white font-bold">
            다시 입력
          </Link>
        </div>
      </div>
    );
  }

  const cert = data as {
    id: string; type: string; title: string;
    details: Record<string, unknown>;
    verification_code: string; issued_at: string;
    revoked: boolean; revoked_at: string | null; revoked_reason: string | null;
  };
  const Icon = ICON_BY_TYPE[cert.type] ?? Award;

  const memberName = String(cert.details.member_name ?? '—');
  const clubName = cert.details.club_name ? String(cert.details.club_name) : null;
  const year = cert.details.year ? String(cert.details.year) : null;
  const teamName = cert.details.team_name ? String(cert.details.team_name) : null;
  const client = cert.details.client ? String(cert.details.client) : null;
  const award = cert.details.award_name ? String(cert.details.award_name) : null;

  return (
    <div className="bg-[var(--mad-black,#000)] text-white min-h-screen">
      <section className="mx-auto max-w-2xl px-6 py-16">
        {/* Status */}
        {cert.revoked ? (
          <div className="bg-red-950 border border-red-800 p-6 mb-8 text-center">
            <Ban className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <div className="text-xl font-black text-red-300">취소된 인증서</div>
            {cert.revoked_reason && <div className="mt-2 text-sm text-red-400">{cert.revoked_reason}</div>}
            {cert.revoked_at && <div className="mt-2 text-xs text-red-500">{new Date(cert.revoked_at).toLocaleDateString('ko-KR')} 취소</div>}
          </div>
        ) : (
          <div className="bg-emerald-950 border border-emerald-800 p-6 mb-8 text-center">
            <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <div className="text-xl font-black text-emerald-300">유효한 인증서</div>
            <div className="mt-2 text-sm text-emerald-400">MADLeague가 발급한 정식 인증서입니다.</div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white text-neutral-900 p-10">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#EC1D25]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#EC1D25]" /> MAD LEAGUE
          </div>
          <div className="mt-2 text-xs text-neutral-500 uppercase tracking-widest">
            {cert.type === 'activity' && 'Activity Certificate'}
            {cert.type === 'competition' && 'Competition Participation'}
            {cert.type === 'award' && 'Award Certificate'}
            {cert.type === 'crown' && 'MAD Crown Certificate'}
          </div>

          <Icon className="h-10 w-10 text-[#FFC000] mt-8" />

          <h1 className="mt-6 text-3xl font-black tracking-tight">{cert.title}</h1>

          <div className="mt-8 space-y-3 text-sm">
            <Row label="이름" value={memberName} />
            {clubName && <Row label="소속 동아리" value={clubName} />}
            {year && <Row label="연도" value={year} />}
            {teamName && <Row label="팀명" value={teamName} />}
            {client && <Row label="과제 기업" value={client} />}
            {award && <Row label="수상" value={award} />}
            <Row label="발급일" value={new Date(cert.issued_at).toLocaleDateString('ko-KR')} />
          </div>

          <div className="mt-10 pt-6 border-t border-neutral-200 text-xs text-neutral-500">
            <div>검증 코드: <span className="font-mono text-neutral-800">{cert.verification_code}</span></div>
            <div className="mt-1">madleague.net/certificate/verify/{cert.verification_code}</div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm">
          <Link href="/madleague/certificate/verify" className="text-neutral-400 hover:text-white">다른 코드 검증</Link>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <div className="w-24 text-neutral-500 shrink-0">{label}</div>
      <div className="font-bold text-neutral-900">{value}</div>
    </div>
  );
}
