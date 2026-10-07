import { MAD_PROGRAM_IMAGES } from '@/lib/madleague-program-assets';
import { ProgramForms } from '@/features/madleague/ProgramForms';

export const revalidate = 300;

export const metadata = {
  title: '크리에이지',
  description: '매드리그 국제광고제 출품 프로젝트 — 대학생의 창의적인 아이디어를 발굴해 국제 광고제 출품까지 함께합니다.',
};

// 원본: madleague.net/creazy · /creazy_signup (2026-10-07 이전)
const OVERVIEW = [
  { title: '광고기획 및 제작', items: ['여러분의 창의적인 아이디어를 바탕으로 광고 기획 및 제작을 진행할 수 있습니다.', '광고 전문가의 멘토링을 통해 실무 역량을 키울 수 있습니다.'] },
  { title: '국제 광고제 출품', items: ['여러분의 작품을 세계 무대에 선보일 수 있는 기회를 얻을 수 있습니다.', '국제 광고제 수상을 통해 자신의 역량을 인정 받을 수 있습니다.'] },
];

const RUN = [
  { k: '운영', v: ['매년 11월 ~ 6월, 총 8개월', '성실한 참여와 책임감 있는 활동 필요', '크리에이지 프로그램 비용 무료 / 출품비·제작비 본인 부담', '2개 팀 운영, 팀당 4~5명'] },
  { k: '대상', v: ['매드리그 대상 대학생', '마케팅·광고에 관심이 많고 관련 업계로 취업을 희망하는 대학생'] },
  { k: '타깃 광고제', v: ['[오픈브리프] 클리오 어워드, 원쇼 영원스 ADC, 뉴욕페스티벌(유료) · 부산국제광고제, 스위스 몽트렉스 어워드(무료)', '[브리프 태클] 원쇼 영원스, D&AD, 깐느 퓨처라이온즈', '총 7개 광고제 — 무료 광고제 출품 권장, 모든 광고제 출품을 목표로 하지는 않습니다'] },
  { k: '목표', v: ['총 2개+α 작품을 제대로 만드는 것', '오픈 브리프 작품 1개 + 깐느 퓨처라이온즈 1개(브리프 태클형) +α, 총 2~3개'] },
];

const CURRICULUM = [
  { phase: '워밍업', desc: '팀별 핵심 주제 선정과 일하는 방식을 맞춰가는 과정', weeks: ['1주차: 글로벌 어워드 소개 및 팀 빌딩, 아이데이션', '2~3주차: 주제 선정 및 인사이트 도출 연습', '4~7주차: 팀별 아이데이션', '7~9주차: 제작 (케이스필름 필수 / 인쇄 등)', '10주차: 깐느 또는 원쇼 브리프 태클', '11주차: 아이데이션'] },
  { phase: '런 웨이', desc: '팀별 선정된 주제 제작물 완성', weeks: ['광고제 별 지원 계획 수립', '주제 변경 가능', '상기 일정 및 운영 변경 가능'] },
];

const AWARDS: [string, string, string, string, string][] = [
  ['4월', '칩샵 어워드 Chip Shop Awards', '', '', 'chipshopawards.com'],
  ['4월', "앤디 어워즈 Andy's Awards", '', '12월 지역대회 · 3월 1일 글로벌', 'andyawards.com'],
  ['4월', '골든몬트렉스', '', '3월 15일', 'goldenawardmontreux.com'],
  ['5월', '클리오 Clio', '', '1월 12일', 'clios.com/awards'],
  ['5월', '원쇼 One Show', '영원스', '3월 1일', 'oneshow.org'],
  ['5월', '디앤에이디 D&AD', '', '3월 13일', 'dandad.org'],
  ['5월', '서밋 어워드 Summit Awards', '', '', 'summitawards.com'],
  ['5월', '뉴욕페스티벌 New York Festivals', '', '5월', 'newyorkfestivals.com'],
  ['6월', '깐느 라이언즈 Cannes Lions', '퓨처 라이온즈', '4월 말', 'futurelions.com'],
  ['8월', '부산국제광고제 Young Stars MAD', '영스타즈', '', 'adstars.org'],
];

export default function CreazyPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Hero — 원본 키비주얼 */}
      <section className="border-b border-neutral-900 bg-[#d9d9d9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MAD_PROGRAM_IMAGES.creazyHero} alt="CREAZY — 아이디어를 가둬두지 말고 세상에 꺼내자" className="mx-auto block w-full max-w-6xl" />
      </section>

      <section className="mx-auto max-w-5xl px-6 py-28">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25]">CREATIVE &amp; CRAZY</div>
        <h1 className="mt-4 text-4xl sm:text-6xl font-black leading-tight">매드리그 국제광고제<br />출품 프로젝트</h1>
        <p className="mt-10 text-xl text-neutral-300 leading-relaxed">
          크리에이지는 대학생 여러분의 창의적인 아이디어를 발굴하고, 국제 광고제에 출품할 수 있도록 지원하는 프로젝트입니다.
          여러분의 과감한 도전과 열정으로 세상을 변화시킬 수 있는 기회를 놓치지 마세요!
          국제 광고제 출품을 경험해 보는 것만으로도 아주 좋은 경험이 될 것입니다.
        </p>
        <p className="mt-8 text-2xl font-black leading-snug">
          크리에이지는 강의가 아닙니다.<br />
          <span className="text-[#EC1D25]">업계 선배들과 함께 하는 프로젝트입니다.</span>
        </p>
        <p className="mt-4 text-lg text-neutral-400">선배들의 못다 이룬 꿈을 함께 고민하면서 성장하는 것이 꿈입니다. 많은 분들과 함께 성장하고 싶습니다.</p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 grid grid-cols-1 md:grid-cols-2 gap-8">
        {OVERVIEW.map(o => (
          <div key={o.title} className="bg-neutral-950 border border-neutral-900 p-10">
            <div className="text-2xl font-black">{o.title}</div>
            <ul className="mt-6 space-y-3 text-neutral-400 leading-relaxed">{o.items.map(i => <li key={i}>— {i}</li>)}</ul>
          </div>
        ))}
      </section>

      <section className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="text-xs font-bold tracking-widest text-neutral-500 mb-4">PROGRAM</div>
          <h2 className="text-4xl font-black mb-12">크리에이지 챌린지</h2>
          <p className="text-lg text-neutral-400 mb-12 max-w-3xl">국내를 넘어 글로벌 크리에이티브의 트렌드와 각종 어워드 수상작들의 인사이트를 배우고, 직접 작품을 만들어 광고제에 출품, 수상까지 도전해보는 글로벌 어워드 도전 프로그램</p>
          <div className="divide-y divide-neutral-900 border-y border-neutral-900">
            {RUN.map(r => (
              <div key={r.k} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 py-8">
                <div className="font-black text-[#EC1D25]">{r.k}</div>
                <ul className="space-y-2 text-neutral-300">{r.v.map(v => <li key={v}>{v}</li>)}</ul>
              </div>
            ))}
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
            {CURRICULUM.map(c => (
              <div key={c.phase} className="border border-neutral-900 p-10">
                <div className="text-xs font-bold tracking-widest text-[#EC1D25]">CURRICULUM</div>
                <div className="mt-3 text-2xl font-black">{c.phase}</div>
                <p className="mt-2 text-neutral-500">{c.desc}</p>
                <ul className="mt-6 space-y-2 text-neutral-300">{c.weeks.map(w => <li key={w}>— {w}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="text-xs font-bold tracking-widest text-neutral-500 mb-4">SCHEDULE</div>
          <h2 className="text-4xl font-black mb-4">주요 국제 광고제 스케줄</h2>
          <p className="text-sm text-neutral-500 mb-10">* 대략의 일정을 정리한 것입니다. 정확한 일정은 공식 사이트에서 확인 바랍니다.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-neutral-500 border-b border-neutral-800">
                <tr><th className="py-3 pr-4">본행사</th><th className="py-3 pr-4">행사명</th><th className="py-3 pr-4">대상 프로그램</th><th className="py-3 pr-4">제출 마감</th><th className="py-3">사이트</th></tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {AWARDS.map(a => (
                  <tr key={a[1]}>
                    <td className="py-3 pr-4 font-bold text-white">{a[0]}</td><td className="py-3 pr-4">{a[1]}</td><td className="py-3 pr-4">{a[2]}</td><td className="py-3 pr-4">{a[3]}</td>
                    <td className="py-3"><a href={`https://${a[4]}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#EC1D25]">{a[4]}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-sm font-bold tracking-widest text-white/70 mb-3">여러분의 도전을 응원합니다</div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-8">프로젝트 참가신청</div>
          <ProgramForms program="creazy" fallback={<p className="text-lg text-white/85">다음 모집 일정은 공지 예정입니다. 문의: 카카오 오픈톡 open.kakao.com/me/madleague · madleague.net@gmail.com</p>} />
        </div>
      </section>
    </div>
  );
}
