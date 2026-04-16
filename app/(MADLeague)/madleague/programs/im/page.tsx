import Link from 'next/link';
import { Lightbulb, AlertTriangle, Search, Filter, Hammer, ArrowRight, Target, Eye, Zap, Quote } from 'lucide-react';

export const metadata = {
  title: 'Idea Movement',
  description: '아이디어로 세상을 바꾼다 — MADLeague 대표 창의력 프로그램',
};

const principles = [
  {
    icon: Search,
    title: '문제를 정의하라',
    desc: '세상에는 많은 사람들이 있고 그 숫자만큼 문제들이 있다. 문제가 무엇인지 모른다는 것이 진짜 문제다.',
  },
  {
    icon: Eye,
    title: '본질에 집중하라',
    desc: '아이디어를 위한 아이디어가 아닌, 문제 해결을 위한 적합한 아이디어가 필요하다. 본질에 집중해야 한다.',
  },
  {
    icon: Filter,
    title: '과잉을 경계하라',
    desc: '아이디어 과잉은 방향을 잃게 만든다. 핵심을 꿰뚫는 하나의 아이디어가 백 개의 산만한 생각보다 낫다.',
  },
  {
    icon: Hammer,
    title: '돌도끼라도 만들어라',
    desc: '완벽한 아이디어를 기다리는 건 시작하는 시점만 늦출 뿐이다. 일단 만들어 보는 것이 중요하다.',
  },
];

const termDefinitions = [
  {
    term: 'Idea',
    pronunciation: '아이디어',
    meaning: '발상, 생각, 방안, 계획',
    desc: '문제를 해결하기 위한 창의적 발상. 단순한 생각이 아닌, 실행 가능한 방안을 의미한다.',
  },
  {
    term: 'Movement',
    pronunciation: '무브먼트',
    meaning: '움직임, 이동, 운동, 동향, 진전',
    desc: '아이디어에 생명을 불어넣는 행동. 생각에서 실행으로의 전환을 뜻한다.',
  },
];

export default function IdeaMovementPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">IDEA MOVEMENT</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">
            아이디어로<br />세상을 바꾼다
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-neutral-300 leading-relaxed">
            문제를 정의하고, 본질에 집중하고, 실행으로 옮기는 것.<br />
            그것이 Idea Movement의 전부다.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/madleague/programs/im/essence"
              className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] text-white font-bold px-8 py-4 transition"
            >
              Essence 보기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/madleague/apply"
              className="inline-flex items-center gap-2 border border-neutral-600 hover:border-white text-white font-bold px-8 py-4 transition"
            >
              MADLeague 합류하기
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex items-center gap-3 mb-10">
          <AlertTriangle className="h-5 w-5 text-[#EC1D25]" />
          <span className="text-xs font-bold tracking-widest text-[#EC1D25]">PROBLEM</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6">
              세상에는 많은 사람들이 있고<br />그 숫자만큼{' '}
              <span className="text-[#EC1D25]">문제</span>들이 있다
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed mb-6">
              우리는 매일 수많은 문제와 마주한다. 하지만 정작
              문제가 무엇인지 모른다는 것이 가장 큰 문제다.
            </p>
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <Quote className="h-5 w-5 text-neutral-600 mb-3" />
              <p className="text-neutral-300 italic text-lg">
                &ldquo;문제가 무엇인지 모른다는 것이 문제다&rdquo;
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-[160px] font-black leading-none text-[#EC1D25]/10 select-none">?</div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-neutral-950 border-y border-neutral-900">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="flex items-center gap-3 mb-10">
            <Target className="h-5 w-5 text-white/50" />
            <span className="text-xs font-bold tracking-widest text-white/50">4 PRINCIPLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-12">
            하나의 문제에는<br /><span className="text-[#EC1D25]">다양한 해결책</span>이 존재한다
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {principles.map((item, i) => (
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
        </div>
      </section>

      {/* Idea Overload */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex items-center gap-3 mb-10">
          <Zap className="h-5 w-5 text-[#FFC000]" />
          <span className="text-xs font-bold tracking-widest text-[#FFC000]">OVERLOAD</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black mb-6">아이디어 과잉의 함정</h2>
        <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-12">
          아이디어가 넘치는 시대. 하지만 아이디어를 위한 아이디어는 의미가 없다.<br />
          문제 해결을 위한 적합한 아이디어만이 가치가 있다.
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-2xl">
          <div className="bg-neutral-950 border border-neutral-900 p-8 text-center">
            <div className="text-5xl font-black text-neutral-700 mb-3">X</div>
            <p className="text-xs text-neutral-500">아이디어를 위한 아이디어</p>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 p-8 text-center">
            <div className="text-5xl font-black text-[#FFC000]/40 mb-3">!</div>
            <p className="text-xs text-neutral-400">본질에 집중</p>
          </div>
          <div className="bg-neutral-950 border border-[#EC1D25]/30 p-8 text-center">
            <div className="text-5xl font-black text-[#EC1D25] mb-3">O</div>
            <p className="text-xs text-white font-bold">문제 해결을 위한 적합한 아이디어</p>
          </div>
        </div>
      </section>

      {/* Execution */}
      <section className="bg-neutral-950 border-y border-neutral-900">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-6">EXECUTION</div>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6">
                아이디어로<br />세상을 <span className="text-[#EC1D25]">바꿉시다</span>
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-10">
                완벽한 아이디어를 기다리는 건 시작하는 시점만 늦출 뿐이다.<br />
                돌도끼라도 우선 만들어 봅니다.
              </p>
              <div className="space-y-3">
                {['문제를 정의한다', '본질에 집중한다', '돌도끼라도 만든다', '세상을 바꾼다'].map((step, i) => (
                  <div key={step} className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 flex items-center justify-center text-xs font-black border"
                      style={{
                        borderColor: i === 3 ? '#EC1D25' : 'rgba(255,255,255,0.15)',
                        color: i === 3 ? '#EC1D25' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {i + 1}
                    </div>
                    <span className={`font-medium ${i === 3 ? 'text-white' : 'text-neutral-400'}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center space-y-4">
                <Hammer className="h-24 w-24 text-neutral-800 mx-auto" />
                <p className="text-[#EC1D25] font-bold">돌도끼라도 우선 만들어 봅니다</p>
                <p className="text-sm text-neutral-600">실행이 아이디어에 생명을 불어넣는다</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Term Definitions */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-3xl font-black mb-12">용어 정의</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {termDefinitions.map((item) => (
            <div key={item.term} className="bg-neutral-950 border border-neutral-900 p-8">
              <h3 className="text-3xl font-black mb-1">{item.term}</h3>
              <p className="text-[#EC1D25] text-sm font-bold mb-1">{item.pronunciation}</p>
              <p className="text-neutral-600 text-xs mb-4">{item.meaning}</p>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-900">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <Lightbulb className="h-10 w-10 text-[#EC1D25] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            당신의 아이디어가<br />세상을 바꿀 수 있습니다
          </h2>
          <p className="text-neutral-500 text-lg mb-10">MADLeague와 함께 아이디어를 실행으로 옮기세요</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/madleague/programs/im/essence"
              className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] text-white font-bold px-8 py-4 transition"
            >
              Essence 알아보기
            </Link>
            <Link
              href="/madleague/apply"
              className="inline-flex items-center gap-2 border border-neutral-600 hover:border-white text-white font-bold px-8 py-4 transition"
            >
              MADLeague 합류하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
