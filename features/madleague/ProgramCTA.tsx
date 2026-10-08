import Link from 'next/link';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { listProgramForms } from '@/lib/forms-server';
import { AVAILABILITY_LABEL } from '@/lib/forms';
import { MAD_ACCENT, type MadProgram } from '@/features/madleague/programs-list';

/**
 * 프로그램 상세 하단 "참여" CTA — 10개 프로그램이 똑같이 쓴다 (2026-10-08 통일).
 *
 *   주 버튼   인트라에서 만든 공개 신청서(forms.program = key)가 있으면 그 버튼들,
 *             없으면 "매드리거 등록" (/madleague/apply). primary로 덮어쓸 수 있다(페이지 안 폼 앵커 등)
 *   보조 버튼  "문의하기" → /madleague/contact?type=program
 *             기업도 참여하는 프로그램(corporate)은 "기업으로 참여 문의" → ?type=corporate 추가
 *   안내 문구  신청서 없을 때 "다음 모집은 매드리거에게 먼저 안내합니다"
 *
 * 공개 페이지에 개인 이메일·카카오 링크를 적지 않는다 — 문의는 전부 문의하기 페이지로 (브랜드 가이드).
 */
export async function ProgramCTA({ program, primary }: { program: MadProgram; primary?: { label: string; href: string } }) {
  const forms = primary ? [] : await listProgramForms('madleague', program.key);
  const accent = program.accent ?? MAD_ACCENT;
  const onLight = accent !== MAD_ACCENT; // 골드·그린·틸 배경은 검정 글자

  const text = onLight ? 'text-black' : 'text-white';
  const sub = onLight ? 'text-black/60' : 'text-white/70';
  const btnPrimary = 'inline-flex items-center gap-3 bg-black hover:bg-neutral-900 text-white font-bold px-8 py-4 text-lg transition';
  const btnGhost = `inline-flex items-center gap-2 border font-bold px-6 py-4 transition ${onLight ? 'border-black/30 text-black hover:bg-black/10' : 'border-white/40 text-white hover:bg-white/10'}`;

  return (
    <section id="join" style={{ backgroundColor: accent }}>
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className={`text-sm font-bold tracking-widest ${sub} mb-3`}>JOIN</div>
        <h2 className={`text-3xl sm:text-4xl font-black ${text}`}>
          {program.madleaguerOnly ? `${program.title}는 매드리거의 무대다` : `${program.title}에 참여하기`}
        </h2>
        <p className={`mt-3 text-lg ${sub}`}>
          {program.madleaguerOnly
            ? '매드리거로 등록하면 모집이 열릴 때 가장 먼저 안내받는다.'
            : forms.length > 0 || primary
              ? '아래에서 바로 신청할 수 있다.'
              : '다음 모집은 매드리거에게 먼저 안내한다. 궁금한 점은 문의하기로.'}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {primary ? (
            <Link href={primary.href} className={btnPrimary}>{primary.label} <ArrowRight className="h-5 w-5" /></Link>
          ) : forms.length > 0 ? (
            forms.map((f) => (
              <Link key={f.slug} href={`/madleague/forms/${f.slug}`}
                className={f.availability === 'open' ? btnPrimary : `${btnPrimary} opacity-50`}>
                {f.title}
                <span className="text-xs font-bold tracking-widest opacity-70">{AVAILABILITY_LABEL[f.availability]}</span>
              </Link>
            ))
          ) : (
            <Link href="/madleague/apply" className={btnPrimary}>매드리거 등록 <ArrowRight className="h-5 w-5" /></Link>
          )}

          <Link href="/madleague/contact?type=program" className={btnGhost}>
            <MessageSquare className="h-4 w-4" /> 문의하기
          </Link>
          {program.corporate && (
            <Link href="/madleague/contact?type=corporate" className={btnGhost}>기업으로 참여 문의</Link>
          )}
        </div>

        {forms.length > 0 && !program.madleaguerOnly && (
          <p className={`mt-6 text-sm ${sub}`}>
            아직 매드리거가 아니라면 <Link href="/madleague/apply" className="underline font-bold">매드리거 등록</Link>도 함께.
          </p>
        )}
      </div>
    </section>
  );
}
