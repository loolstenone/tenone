import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Calendar, GraduationCap, MapPin, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MemberLinkButton } from './MemberLinkButton';

export const metadata = {
  title: '매드리거',
  description: '매드리거 대시보드',
};

export default async function MemberPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MEMBER</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">매드리거만의 공간</h1>
          <p className="mt-6 text-neutral-400 leading-relaxed">
            매드리거 대시보드는 로그인 후 이용할 수 있습니다.<br />
            아직 매드리그 멤버가 아니라면 지원서를 제출해주세요.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/login?redirect=/madleague/member" className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] text-white font-bold px-8 py-4 transition">
              로그인 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/madleague/apply" className="inline-flex items-center gap-2 border border-neutral-600 hover:border-white text-white font-bold px-8 py-4 transition">
              지원하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 로그인됨 → mad_members 조회
  const { data: member } = await sb
    .from('mad_members')
    .select('*, mad_clubs(slug, name, region, color), mad_cohorts(year, status)')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) {
    // 계정은 있는데 매드리거 레코드 미연동 → 연결 시도
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MEMBER</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">아직 매드리거가 아닙니다</h1>
          <p className="mt-6 text-neutral-400 leading-relaxed">
            <strong className="text-white">{user.email}</strong> 계정으로 로그인되었지만,
            이 계정에 연결된 매드리거 기록을 찾을 수 없습니다.
          </p>
          <div className="mt-6 bg-neutral-950 border border-neutral-900 p-6">
            <div className="text-sm font-bold mb-2">가능한 이유</div>
            <ul className="text-sm text-neutral-400 space-y-1 list-disc list-inside">
              <li>지원서가 아직 승인되지 않았습니다.</li>
              <li>지원서 이메일과 가입 이메일이 다릅니다. (같게 맞춰주세요)</li>
              <li>아직 지원서를 제출하지 않았습니다.</li>
            </ul>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <MemberLinkButton />
            <Link href="/madleague/apply" className="inline-flex items-center gap-2 border border-neutral-600 hover:border-white text-white font-bold px-8 py-4 transition">
              지원서 작성
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const club = member.mad_clubs as { slug: string; name: string; region: string; color: string | null } | null;
  const cohort = member.mad_cohorts as { year: number; status: string } | null;

  // 포트폴리오·활동 미구현(M2-B~M2-F) 안내
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#EC1D25] mb-4">
            MEMBER · {member.role === 'club_leader' ? '동아리장' : member.role === 'staff' ? '운영진' : '매드리거'}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">{member.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
            {club && (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: club.color ?? '#EC1D25' }} />
                <strong className="text-white">{club.name}</strong>
                <span className="text-neutral-500"><MapPin className="h-3 w-3 inline" /> {club.region}</span>
              </span>
            )}
            {cohort && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {cohort.year} {cohort.status === 'active' ? '활동중' : '완료'}
              </span>
            )}
            {member.university && (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                {member.university}{member.major && ` · ${member.major}`}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Member Info */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* Quick actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/madleague/member/profile" className="inline-flex items-center gap-2 border border-neutral-700 hover:border-white text-white font-bold px-5 py-2.5 text-sm transition">
            프로필 편집
          </Link>
          <Link href="/madleague/member/certificate" className="inline-flex items-center gap-2 border border-[#FFC000] hover:bg-[#FFC000] hover:text-black text-[#FFC000] font-bold px-5 py-2.5 text-sm transition">
            인증서 발급
          </Link>
          <Link href="/madleague/community" className="inline-flex items-center gap-2 border border-neutral-700 hover:border-white text-white font-bold px-5 py-2.5 text-sm transition">
            커뮤니티
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <InfoCard label="활동연도" value={(member.activity_years ?? []).join(' · ') || '-'} />
          <InfoCard label="가입일" value={new Date(member.joined_at).toLocaleDateString('ko-KR')} />
          <InfoCard label="상태" value={
            member.status === 'active' ? '활동중' :
            member.status === 'graduated' ? '졸업' :
            member.status === 'dormant' ? '휴면' : '탈퇴'
          } />
        </div>

        {/* Phase 2 예정 섹션 */}
        <div className="bg-neutral-950 border border-neutral-900 p-8">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#FFC000] mb-3">
            <Sparkles className="h-4 w-4" /> COMING SOON · Phase 2
          </div>
          <h2 className="text-2xl font-black mb-6">곧 추가될 기능</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['프로젝트', '참여 중인 경쟁PT·PJT·마케톤 이력'],
              ['포트폴리오', '활동 기반 자동 생성 + 퍼블릭 공유'],
              ['인증서', '활동인증서·수상확인서·MAD Crown 자동 발급'],
              ['커뮤니티', '전체 피드 + 동아리별 게시판 + 핀보드'],
              ['경쟁PT 워크스페이스', '브리프·제출·결과'],
              ['성장 경로', 'HeRo·Badak·YouInOne 연계'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-black border border-neutral-900 p-4">
                <div className="font-bold">{title}</div>
                <div className="mt-1 text-xs text-neutral-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-950 border border-neutral-900 p-6">
      <div className="text-xs font-bold tracking-wider text-neutral-500">{label}</div>
      <div className="mt-2 text-xl font-black">{value}</div>
    </div>
  );
}
