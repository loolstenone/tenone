'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F23]/80 backdrop-blur-xl border-b border-white/5">
        <nav className="mx-auto max-w-6xl px-6 flex h-14 items-center justify-between">
          <Link href="/wio" className="text-xl font-black tracking-tight"><span className="text-indigo-400">W</span>IO</Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/wio/solutions" className="text-sm text-slate-400 hover:text-white transition-colors">솔루션</Link>
            <Link href="/wio/framework" className="text-sm text-slate-400 hover:text-white transition-colors">프레임워크</Link>
            <Link href="/wio/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">가격</Link>
            <Link href="/wio/about" className="text-sm text-white font-semibold">소개</Link>
          </div>
        </nav>
      </header>

      <div className="pt-20 pb-16 px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6"><ArrowLeft size={14} /> WIO</Link>

          <h1 className="text-4xl font-black mb-6 leading-tight">
            Work In One.<br />
            <span className="text-indigo-400">하나에서 일하세요.</span>
          </h1>

          <div className="space-y-8 text-slate-400 leading-relaxed">
            <p className="text-lg">
              WIO는 프로젝트 중심으로 사람·일·돈·지식이 하나의 시스템에서 돌아가는 통합 운영 플랫폼입니다.
            </p>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h2 className="text-xl font-bold text-white mb-3">왜 WIO인가?</h2>
              <p>여러 도구를 쓰면 데이터가 흩어집니다. Slack으로 소통하고, Notion으로 문서 쓰고, 엑셀로 정산하고, 구글 시트로 프로젝트 관리하면 — 어떤 도구에도 전체 그림이 없습니다.</p>
              <p className="mt-3">WIO는 하나의 시스템 안에서 프로젝트를 만들고, 크루를 배정하고, 업무를 실행하고, 정산하고, 성과를 측정합니다. 프로젝트가 끝나면 정산·포인트·아카이브가 동시에 자동 업데이트됩니다.</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h2 className="text-xl font-bold text-white mb-3">시스템 + 방법론</h2>
              <p>WIO는 소프트웨어만 파는 게 아닙니다. 20년 현장에서 검증된 방법론을 함께 제공합니다.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { name: 'Vision House', desc: '조직의 방향 설계' },
                  { name: 'Principle 10', desc: '행동 원칙 내재화' },
                  { name: 'Vrief', desc: '기획의 프레임워크' },
                  { name: 'GPR', desc: '성과관리 OS' },
                  { name: 'Ten:One Wheel', desc: '성장 플라이휠' },
                  { name: 'WIO Protocol', desc: '통합 운영 규칙' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-500/10 text-xs font-bold text-indigo-400">{m.name.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-semibold text-white">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h2 className="text-xl font-bold text-white mb-3">누가 쓰나요?</h2>
              <div className="space-y-3">
                {[
                  { target: '에이전시', desc: '프로젝트 기반으로 일하는 광고/마케팅/디자인 에이전시' },
                  { target: '대학/교육기관', desc: '동아리, 학과, 프로그램을 프로젝트 단위로 운영하는 조직' },
                  { target: '커뮤니티/네트워크', desc: '멤버 기반 조직이 프로젝트로 가치를 만드는 곳' },
                  { target: '스타트업/중소기업', desc: '성장하면서 체계가 필요해진 10~200명 규모 조직' },
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <div><span className="text-white font-semibold">{t.target}</span> — {t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
              <h2 className="text-xl font-bold text-white mb-3">Ten:One™에서 만들었습니다</h2>
              <p>WIO는 Ten:One™ Universe가 실제로 사용하는 운영 시스템을 제품화한 것입니다. 11개 브랜드, 수백 개 프로젝트를 운영하며 검증한 시스템과 방법론입니다.</p>
              <Link href="https://tenone.biz" className="inline-flex items-center gap-1 mt-3 text-sm text-indigo-400 hover:underline">
                Ten:One™ Universe 알아보기 <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
              구축 상담 받기 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
