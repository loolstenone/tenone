import { Search, Eye, Filter, Hammer, Presentation, Compass, Triangle, Flame, ArrowRight, Lightbulb, FolderOpen, Users } from 'lucide-react';
import { ProgramDetailPage, ProgramSection } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

const program = getMadProgram('im');
export const metadata = { title: program.title, description: program.desc };

// 옛 하위 페이지 /programs/im/essence 는 아래 #essence 섹션으로 흡수 (2026-10-08 사용자 결정) — next.config 리다이렉트

const STEPS = [
  { icon: Search,       title: '문제를 정의한다',   desc: '세상에는 사람 수만큼 문제가 있다. 문제가 무엇인지 모르는 것이 진짜 문제다 — 먼저 진짜 질문을 세운다.' },
  { icon: Eye,          title: '본질에 집중한다',   desc: '아이디어를 위한 아이디어가 아니라, 문제 해결에 적합한 아이디어. 표면 너머의 이유를 본다.' },
  { icon: Hammer,       title: '돌도끼라도 만든다', desc: '완벽한 아이디어를 기다리면 시작만 늦어진다. 일단 만들어 보고 다듬는다.' },
  { icon: Presentation, title: '쇼케이스에서 발표한다', desc: '연말, 전국 대학생이 모여 각자의 아이디어를 무대에 올린다.' },
];

const GETS = [
  { icon: Lightbulb,  title: '내 아이디어의 첫 실행', desc: '생각에서 실행으로. 아이디어에 생명을 불어넣는 경험이 남는다.' },
  { icon: FolderOpen, title: '포트폴리오',          desc: '문제 정의부터 발표까지 한 사이클이 그대로 포트폴리오가 된다.' },
  { icon: Users,      title: '전국 대학생 네트워크',  desc: '매드리거가 아니어도 참가할 수 있다. 같은 문제를 다르게 푼 사람들을 만난다.' },
];

const PRINCIPLES = [
  { icon: Search, title: '문제를 정의하라', desc: '세상에는 많은 사람들이 있고 그 숫자만큼 문제들이 있다. 문제가 무엇인지 모른다는 것이 진짜 문제다.' },
  { icon: Eye,    title: '본질에 집중하라', desc: '아이디어를 위한 아이디어가 아닌, 문제 해결을 위한 적합한 아이디어가 필요하다. 본질에 집중해야 한다.' },
  { icon: Filter, title: '과잉을 경계하라', desc: '아이디어 과잉은 방향을 잃게 만든다. 핵심을 꿰뚫는 하나의 아이디어가 백 개의 산만한 생각보다 낫다.' },
  { icon: Hammer, title: '돌도끼라도 만들어라', desc: '완벽한 아이디어를 기다리는 건 시작하는 시점만 늦출 뿐이다. 일단 만들어 보는 것이 중요하다.' },
];

const TERMS = [
  { term: 'Idea', pronunciation: '아이디어', meaning: '발상, 생각, 방안, 계획', desc: '문제를 해결하기 위한 창의적 발상. 단순한 생각이 아닌, 실행 가능한 방안을 의미한다.' },
  { term: 'Movement', pronunciation: '무브먼트', meaning: '움직임, 이동, 운동, 동향, 진전', desc: '아이디어에 생명을 불어넣는 행동. 생각에서 실행으로의 전환을 뜻한다.' },
];

const ESSENCE_STEPS = [
  { icon: Compass,    step: '01', title: '본질을 꿰뚫어 본다', desc: '표면 너머의 근본 이유를 탐구한다.' },
  { icon: Triangle,   step: '02', title: '문제를 정의한다',   desc: '핵심을 포착해 진짜 질문을 세운다.' },
  { icon: Flame,      step: '03', title: '아이디어를 실행한다', desc: '명확한 아이디어로 구체적 방안을 만든다.' },
  { icon: ArrowRight, step: '04', title: '세상을 바꾼다',     desc: '실행이 쌓여 현실을 변화시킨다.' },
];

export default function IdeaMovementPage() {
  return (
    <ProgramDetailPage
      programKey="im"
      heroExtra={
        <p className="mt-8 text-2xl sm:text-3xl font-black leading-snug">
          아이디어로 <span className="text-[#EC1D25]">세상을 바꾼다</span>
        </p>
      }
      steps={STEPS}
      stepsTitle="아이디어 무브먼트는 이렇게 진행된다"
      gets={GETS}
    >
      {/* IM의 생각 — 4원칙 */}
      <ProgramSection
        eyebrow="4 PRINCIPLES"
        title={<>하나의 문제에는<br /><span className="text-[#EC1D25]">다양한 해결책</span>이 존재한다</>}
        intro="아이디어 무브먼트가 아이디어를 보는 네 가지 기준. 참가하는 동안 이 네 문장을 계속 되묻게 된다."
        tone="dark"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRINCIPLES.map((item, i) => (
            <div key={item.title} className="bg-black border border-neutral-900 p-8 hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-[#EC1D25]">0{i + 1}</span>
                <item.icon className="h-5 w-5 text-white/40" />
              </div>
              <h3 className="text-xl font-black mb-3">{item.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl">
          <div className="bg-black border border-neutral-900 p-8 text-center">
            <div className="text-5xl font-black text-neutral-700 mb-3">X</div>
            <p className="text-xs text-neutral-500">아이디어를 위한 아이디어</p>
          </div>
          <div className="bg-black border border-neutral-800 p-8 text-center">
            <div className="text-5xl font-black text-[#FFC000]/40 mb-3">!</div>
            <p className="text-xs text-neutral-400">본질에 집중</p>
          </div>
          <div className="bg-black border border-[#EC1D25]/30 p-8 text-center">
            <div className="text-5xl font-black text-[#EC1D25] mb-3">O</div>
            <p className="text-xs text-white font-bold">문제 해결을 위한 적합한 아이디어</p>
          </div>
        </div>
      </ProgramSection>

      {/* 에센스 — 옛 /im/essence 페이지 흡수 */}
      <ProgramSection
        id="essence"
        eyebrow="ESSENCE"
        title={<>본질 — 그것이 그것으로서 있기 위해<br />없어서는 안 되는 것</>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-5 text-neutral-400 text-lg leading-relaxed">
            <p>인간과 삼각형의 차이는 단순한 형체의 차이가 아니다. 더 근본적인 '무엇'이 존재한다. 본체이자 정의(定義)인 본질은, 현대의 실존과는 대립되는 개념이다.</p>
            <p>우리는 표면적인 것에 집착하기 쉽다. 하지만 진정한 변화는 본질을 꿰뚫어 볼 때 시작된다.</p>
            <p>석기 시대의 원시인을 떠올려 보자. 그는 생존을 위해 불이 필요했다. 추위를 이기고, 음식을 익히고, 맹수를 쫓기 위해. 하지만 여기서 멈추지 않는다. 실용적 필요성을 넘어 "왜 불이 생기는가"라는 근본적인 질문을 던진다.</p>
            <p className="text-neutral-300 font-bold">이것이 바로 본질을 향한 여정이다. 표면적인 "왜"를 넘어, 궁극의 이유를 탐구하는 것.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-950 border border-neutral-900 p-8 flex flex-col items-center justify-center aspect-square text-center">
              <Triangle className="h-14 w-14 text-[#EC1D25]/40 mb-6" />
              <p className="font-black text-white">본체 = 정의(定義)</p>
              <p className="text-xs text-neutral-500 mt-2">그것이 그것이게 하는 것</p>
            </div>
            <div className="bg-neutral-950 border border-neutral-900 p-8 flex flex-col items-center justify-center aspect-square text-center">
              <Flame className="h-14 w-14 text-[#EC1D25]/40 mb-6" />
              <p className="font-black text-white">왜 불이 생기는가?</p>
              <p className="text-xs text-neutral-500 mt-2">표면적 "왜"를 넘어<br />궁극의 이유를 탐구한다</p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="text-xs font-bold tracking-widest text-neutral-500 mb-3">본질 → 아이디어 → 변화</div>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-8">
            본질을 이해하면 문제의 핵심이 보이고, 핵심이 보이면 아이디어가 명확해진다. 그리고 명확한 아이디어만이 세상을 바꿀 수 있다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ESSENCE_STEPS.map((item) => (
              <div key={item.step} className="bg-neutral-950 border border-neutral-900 p-8">
                <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-6">{item.step}</div>
                <item.icon className="h-8 w-8 text-neutral-600 mb-4" />
                <h3 className="font-black text-white mb-2">{item.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ProgramSection>

      {/* 용어 */}
      <ProgramSection eyebrow="GLOSSARY" title="용어 정의" tone="dark">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TERMS.map((item) => (
            <div key={item.term} className="bg-black border border-neutral-900 p-8">
              <h3 className="text-3xl font-black mb-1">{item.term}</h3>
              <p className="text-[#EC1D25] text-sm font-bold mb-1">{item.pronunciation}</p>
              <p className="text-neutral-600 text-xs mb-4">{item.meaning}</p>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </ProgramSection>
    </ProgramDetailPage>
  );
}
