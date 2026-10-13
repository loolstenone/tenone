import { Users, Lightbulb, Hammer, Send, Globe, Award, Megaphone } from 'lucide-react';
import { ProgramDetailPage, ProgramSection } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

export const revalidate = 300;

const program = getMadProgram('creazy');
export const metadata = { title: program.title, description: program.desc };

// 원본: madleague.net/creazy · /creazy_signup (2026-10-07 이전)
const STEPS = [
  { icon: Users,     title: '워밍업 — 팀 빌딩',     desc: '글로벌 어워드 소개, 팀 빌딩, 아이데이션. 팀별 핵심 주제를 정하고 일하는 방식을 맞춘다. (1~3주차)' },
  { icon: Lightbulb, title: '아이데이션 · 제작',    desc: '팀별 아이데이션 후 케이스 필름·인쇄 등 제작. 업계 선배가 멘토링한다. (4~9주차)' },
  { icon: Hammer,    title: '브리프 태클',          desc: '깐느 퓨처 라이온즈 또는 원쇼 브리프에 도전한다. (10~11주차)' },
  { icon: Send,      title: '런 웨이 — 출품',       desc: '광고제별 지원 계획을 세우고 선정 주제 제작물을 완성해 출품한다.' },
];

const GETS = [
  { icon: Globe,     title: '국제 광고제 출품작',   desc: '오픈 브리프 1개 + 브리프 태클 1개 + α, 총 2~3개 작품을 제대로 만든다.' },
  { icon: Megaphone, title: '업계 선배 멘토링',     desc: '강의가 아니다. 광고 전문가와 함께 하는 8개월짜리 프로젝트다.' },
  { icon: Award,     title: '수상 도전',           desc: '국제 광고제 수상으로 자신의 역량을 세계 무대에서 인정받는다.' },
];

const RUN = [
  { k: '운영', v: ['매년 11월 ~ 6월, 총 8개월', '성실한 참여와 책임감 있는 활동 필요', '크리에이지 프로그램 비용 무료 / 출품비·제작비 본인 부담', '2개 팀 운영, 팀당 4~5명'] },
  { k: '대상', v: ['매드리그 대상 대학생', '마케팅·광고에 관심이 많고 관련 업계로 취업을 희망하는 대학생'] },
  { k: '타깃 광고제', v: ['[오픈브리프] 클리오 어워드, 원쇼 영원스 ADC, 뉴욕페스티벌(유료) · 부산국제광고제, 스위스 몽트렉스 어워드(무료)', '[브리프 태클] 원쇼 영원스, D&AD, 깐느 퓨처라이온즈', '총 7개 광고제 — 무료 광고제 출품 권장, 모든 광고제 출품을 목표로 하지는 않습니다'] },
  { k: '목표', v: ['총 2개+α 작품을 제대로 만드는 것', '오픈 브리프 작품 1개 + 깐느 퓨처라이온즈 1개(브리프 태클형) +α, 총 2~3개'] },
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
    <ProgramDetailPage
      programKey="creazy"
      steps={STEPS}
      stepsTitle="8개월, 이렇게 진행된다"
      gets={GETS}
    >
      <ProgramSection
        eyebrow="PROGRAM"
        title="크리에이지 챌린지"
        intro="국내를 넘어 글로벌 크리에이티브의 트렌드와 각종 어워드 수상작들의 인사이트를 배우고, 직접 작품을 만들어 광고제에 출품, 수상까지 도전해보는 글로벌 어워드 도전 프로그램"
      >
        <div className="divide-y divide-neutral-900 border-y border-neutral-900">
          {RUN.map(r => (
            <div key={r.k} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 py-8">
              <div className="font-black text-[#EC1D25]">{r.k}</div>
              <ul className="space-y-2 text-neutral-300">{r.v.map(v => <li key={v}>{v}</li>)}</ul>
            </div>
          ))}
        </div>
      </ProgramSection>

      <ProgramSection
        eyebrow="SCHEDULE"
        title="주요 국제 광고제 스케줄"
        intro={<span className="text-sm text-neutral-500">* 대략의 일정을 정리한 것입니다. 정확한 일정은 공식 사이트에서 확인 바랍니다.</span>}
        tone="dark"
      >
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
      </ProgramSection>
    </ProgramDetailPage>
  );
}
