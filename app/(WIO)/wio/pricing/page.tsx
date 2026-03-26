'use client';

import Link from 'next/link';
import { ArrowLeft, Check, ArrowRight } from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

const PLANS = [
  { name: 'Starter', price: '월 49만원', desc: '소규모 팀, 기본 프로젝트 관리', members: '최대 20명', highlight: false,
    features: ['Project (기본)', 'Home (대시보드, 메신저)', 'Talk (공지, 게시판)', '5GB 스토리지', '이메일 지원'] },
  { name: 'Growth', price: '월 149만원', desc: '성장하는 조직, 인재+영업 관리', members: '최대 50명', highlight: true,
    features: ['Starter 전체', 'People (인재관리, HIT)', 'Sales (CRM, 파이프라인)', 'Finance (결재, 경비)', 'GPR 기본', '20GB 스토리지', '우선 지원'] },
  { name: 'Pro', price: '월 299만원', desc: '전문 에이전시/기업, 전체 모듈', members: '최대 200명', highlight: false,
    features: ['Growth 전체', 'AI 크롤링 (영업 기회)', 'AI 콘텐츠 생성', 'Learn (LMS)', 'Wiki (지식관리)', 'Insight (BI)', 'Vrief 템플릿', '100GB 스토리지', '전담 매니저'] },
  { name: 'Enterprise', price: '별도 협의', desc: '대규모 조직, 화이트라벨, 커스텀', members: '무제한', highlight: false,
    features: ['Pro 전체', '화이트라벨 (자사 브랜딩)', '커스텀 도메인', 'Shop (커머스)', 'Partner (외부 협력사)', '무제한 스토리지', 'SLA 보장', '온사이트 교육'] },
];

export default function PricingPage() {
  return (
    <>
      <WIOMarketingHeader />

      <div className="pt-20 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6"><ArrowLeft size={14} /> WIO</Link>
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">WIO System 가격</h1>
            <p className="text-slate-400">필요한 만큼만. 성장하면 확장.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan, i) => (
              <div key={i} className={`rounded-xl border p-6 flex flex-col ${plan.highlight ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                {plan.highlight && <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">인기</span>}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="text-2xl font-black text-white mt-2">{plan.price}</div>
                <p className="text-xs text-slate-500 mt-1 mb-1">{plan.members}</p>
                <p className="text-sm text-slate-400 mb-4">{plan.desc}</p>
                <div className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm text-slate-400">
                      <Check size={14} className="text-indigo-400 shrink-0 mt-0.5" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/wio/contact" className={`text-center rounded-lg py-2.5 text-sm font-semibold transition-colors ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-white/10 text-slate-300 hover:bg-white/5'}`}>
                  {plan.price === '별도 협의' ? '상담 신청' : '시작하기'}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 mb-4">WIO Method (워크샵/컨설팅)는 System과 별도 구매 가능</p>
            <Link href="/wio/framework" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:underline">
              WIO Method 상품 보기 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
