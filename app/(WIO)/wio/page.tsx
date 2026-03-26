'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Layers, Target, Zap, Users, BarChart3, BookOpen, Shield } from 'lucide-react';

const HERO_COPIES = [
  { head: '인사, 재무, 경비\n왜 다 쪼개 놨어?', accent: 'WIO', tail: ' 하나로 일하세요' },
  { head: 'Slack, Notion, 엑셀\n언제까지 따로 쓸 거야?', accent: 'WIO', tail: ' 하나로 일하세요' },
  { head: '프로젝트 끝나면\n정산은 누가 해?', accent: 'WIO', tail: '가 자동으로 합니다' },
  { head: '5개 앱 열어서\n한 줄 보고하는 거\n이상하지 않아?', accent: 'WIO', tail: ' 하나로 일하세요' },
  { head: '도구는 늘었는데\n일은 왜 더 복잡해졌을까?', accent: 'WIO', tail: ' 하나면 됩니다' },
];

const MODULES = [
  { icon: Target, name: 'GPR', desc: 'Goal → Plan → Result. 조직부터 개인까지 목표를 연결한다.' },
  { icon: Layers, name: 'Vrief', desc: '조사분석 → 가설검증 → 전략수립. 기획의 프레임워크.' },
  { icon: Users, name: 'Project', desc: '프로젝트 중심 운영. 크루 배정, Job, 타임시트, 손익.' },
  { icon: BarChart3, name: 'Insight', desc: '경영 대시보드. 전사/사업/프로젝트 성과를 한 눈에.' },
  { icon: Zap, name: 'People', desc: '인재 DB, 역량 진단, 포인트, 매칭. 사람이 자산이다.' },
  { icon: BookOpen, name: 'Learn', desc: 'LMS, 교육, 퀴즈. 약점 기반 교육 추천.' },
];

const TARGETS = [
  { name: 'Agency', desc: '광고/마케팅 에이전시', modules: 'Project + People + Finance + Sales + Content' },
  { name: 'Campus', desc: '대학/교육기관', modules: 'Project + People + Learn + Content' },
  { name: 'Network', desc: '커뮤니티/네트워크', modules: 'Project + People + Shop + Content' },
  { name: 'Business', desc: '일반 기업', modules: 'Project + Finance + Sales + Insight' },
];

export default function WIOHome() {
  const hero = useMemo(() => HERO_COPIES[Math.floor(Math.random() * HERO_COPIES.length)], []);

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F23]/80 backdrop-blur-xl border-b border-white/5">
        <nav className="mx-auto max-w-6xl px-6 flex h-14 items-center justify-between">
          <Link href="/wio" className="text-xl font-black tracking-tight">
            <span className="text-indigo-400">W</span>IO
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/wio/solutions" className="text-sm text-slate-400 hover:text-white transition-colors">솔루션</Link>
            <Link href="/wio/framework" className="text-sm text-slate-400 hover:text-white transition-colors">프레임워크</Link>
            <Link href="/wio/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">가격</Link>
            <Link href="/wio/about" className="text-sm text-slate-400 hover:text-white transition-colors">소개</Link>
            <Link href="/login" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">시작하기</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-block mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs text-indigo-300 font-medium">
            Solution & Consulting
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-[1.2] mb-3 whitespace-pre-line">
            {hero.head.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
            <span className="text-indigo-400">{hero.accent}</span>{hero.tail}
          </h1>
          <p className="text-xl md:text-2xl font-light text-slate-300 tracking-wide mb-6">Work In One</p>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            프로젝트 중심으로 사람·일·돈·지식이<br className="hidden md:block" />
            하나의 시스템에서 돌아가는 통합 운영 플랫폼.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/wio/solutions" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
              솔루션 보기 <ArrowRight size={16} />
            </Link>
            <Link href="/wio/about" className="flex items-center gap-2 rounded-lg border border-white/10 px-8 py-3.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">
              WIO가 뭔가요?
            </Link>
          </div>
        </div>
      </section>

      {/* 5F Cycle */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">5F 프로젝트 사이클</h2>
            <p className="text-slate-400">발견에서 축적까지, 하나의 시스템이 전부 연결합니다</p>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              { step: 'Find', label: '발견', desc: 'AI가 기회를 수집하고 분석', color: 'from-blue-500/20' },
              { step: 'Form', label: '조직', desc: '프로젝트 생성, 크루 배정', color: 'from-violet-500/20' },
              { step: 'Fire', label: '실행', desc: 'Job, 타임시트, 결재', color: 'from-indigo-500/20' },
              { step: 'Fruit', label: '성과', desc: '자동 정산, 포인트, 아카이브', color: 'from-purple-500/20' },
              { step: 'Feed', label: '축적', desc: '등급, 포트폴리오, 교육 추천', color: 'from-fuchsia-500/20' },
            ].map((item, i) => (
              <div key={i} className={`rounded-xl border border-white/5 bg-gradient-to-b ${item.color} to-transparent p-4 text-center`}>
                <div className="text-xs text-slate-500 mb-1">0{i + 1}</div>
                <div className="text-lg font-bold text-indigo-300 mb-0.5">{item.step}</div>
                <div className="text-sm font-semibold text-white mb-1">{item.label}</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">모듈 구성</h2>
            <p className="text-slate-400">필요한 모듈만 골라서 구축합니다</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-5 hover:border-indigo-500/30 transition-colors">
                  <Icon size={20} className="text-indigo-400 mb-3" />
                  <h3 className="font-bold text-white mb-1">{mod.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Targets */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">타겟별 패키지</h2>
            <p className="text-slate-400">업종에 맞는 최적 조합을 제안합니다</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {TARGETS.map((t, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-white">{t.name}</h3>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{t.modules}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-indigo-900/10 to-transparent">
        <div className="mx-auto max-w-lg text-center">
          <Shield size={32} className="mx-auto mb-4 text-indigo-400" />
          <h2 className="text-2xl font-bold mb-3">구축 상담 받기</h2>
          <p className="text-sm text-slate-400 mb-6">귀사에 맞는 솔루션 구성과 도입 일정을 안내해드립니다.</p>
          <Link href="/wio/contact" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
            상담 신청 <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <div className="text-sm font-bold"><span className="text-indigo-400">W</span>IO <span className="text-slate-600">Work In One</span></div>
            <div className="text-xs text-slate-600 mt-1">Powered by <a href="https://tenone.biz" className="hover:text-slate-400">Ten:One™</a></div>
          </div>
          <div className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Ten:One™ Universe</div>
        </div>
      </footer>
    </>
  );
}
