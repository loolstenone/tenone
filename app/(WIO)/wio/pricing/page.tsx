'use client';

import Link from 'next/link';
import { ArrowLeft, Check, ArrowRight, Sparkles, Building2, Zap, Crown, Settings, Gift, Server, Mail, HardDrive } from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── SaaS 과금 플랜 (v2.0) ── */
const PLANS = [
  {
    name: 'Starter',
    price: '15,000',
    unit: '/user/월',
    desc: '소규모 팀의 첫 걸음',
    members: '50명 이하',
    highlight: false,
    icon: Zap,
    color: '#378ADD',
    tracks: 'T6 + T7 + T1 기본',
    features: [
      'T6 협업소통 (메신저, 문서, 캘린더)',
      'T7 데이터분석 (기본 대시보드)',
      'T1 운영관리 기본 (조직/근태)',
      'AI 월 500건',
      '10GB 스토리지',
      '이메일 지원',
    ],
  },
  {
    name: 'Business',
    price: '25,000',
    unit: '/user/월',
    desc: '성장하는 조직, 핵심 트랙 확장',
    members: '200명 이하',
    highlight: true,
    icon: Building2,
    color: '#534AB7',
    tracks: 'Starter + T2 or T3',
    features: [
      'Starter 전체 포함',
      '+ T2 영업마케팅 또는 T3 생산물류 선택',
      'T1 운영관리 풀 (HR/급여/평가)',
      'AI 월 3,000건',
      '50GB 스토리지',
      '우선 지원 + 온보딩',
    ],
  },
  {
    name: 'Enterprise',
    price: '40,000',
    unit: '/user/월',
    desc: '전체 트랙 + AI 자동화 풀 세트',
    members: '무제한',
    highlight: false,
    icon: Crown,
    color: '#BA7517',
    tracks: '전 트랙 (T1~T7)',
    features: [
      'Business 전체 포함',
      '+ 모든 트랙 활성화',
      'AI 무제한 + AI Assistant',
      '무제한 스토리지',
      '전담 CS 매니저',
      'SLA 99.9% 보장',
      'SSO / SAML 인증',
    ],
  },
  {
    name: 'Custom',
    price: '별도 협의',
    unit: '',
    desc: '온프레미스 / 하이브리드',
    members: '무제한',
    highlight: false,
    icon: Settings,
    color: '#E24B4A',
    tracks: '맞춤 구성',
    features: [
      'Enterprise 전체 포함',
      '온프레미스 배포 옵션',
      '하이브리드 클라우드',
      '화이트라벨 (자사 브랜딩)',
      '커스텀 모듈 개발',
      'API 전체 접근',
      '온사이트 교육 + 컨설팅',
    ],
  },
];

/* ── 볼륨 과금 ── */
const VOLUME_PRICING = [
  { item: 'API 호출', icon: Server, free: '10,000건/월', extra: '1,000건당 ₩500', desc: '외부 연동 API 호출량' },
  { item: '뉴스레터 발송', icon: Mail, free: '5,000건/월', extra: '1,000건당 ₩300', desc: '이메일 캠페인 발송량' },
  { item: '저장 용량', icon: HardDrive, free: '플랜별 기본 제공', extra: '10GB당 ₩5,000/월', desc: '파일, 이미지, 문서 저장' },
];

export default function PricingPage() {
  return (
    <>
      <WIOMarketingHeader />

      <div className="pt-20 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6"><ArrowLeft size={14} /> WIO</Link>

          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/20 px-4 py-1.5 text-xs text-[#9B8FE8] font-medium">
              <Sparkles size={12} /> SaaS Pricing v2.0
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">WIO System 가격</h1>
            <p className="text-lg text-slate-400">필요한 트랙만 선택. 성장하면 확장.</p>
          </div>

          {/* Free Trial Banner */}
          <section className="mb-10">
            <div className="rounded-2xl border border-[#1D9E75]/20 bg-[#1D9E75]/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1D9E75]/15 flex items-center justify-center">
                  <Gift size={20} className="text-[#1D9E75]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">30일 무료 체험</div>
                  <div className="text-xs text-slate-400">Starter 전 기능 무료. 신용카드 불필요.</div>
                </div>
              </div>
              <Link href="/wio/contact" className="px-6 py-2.5 rounded-lg bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#19895f] transition-colors">
                무료로 시작하기
              </Link>
            </div>
          </section>

          {/* Plans Grid */}
          <section className="mb-16">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div key={plan.name} className={`rounded-xl border p-6 flex flex-col ${plan.highlight ? 'border-[#534AB7]/50 bg-[#534AB7]/5' : 'border-white/5 bg-white/[0.02]'}`}>
                    {plan.highlight && <span className="text-[10px] font-bold text-[#9B8FE8] uppercase tracking-wider mb-2">인기</span>}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${plan.color}15` }}>
                        <Icon size={16} style={{ color: plan.color }} />
                      </div>
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white">
                        {plan.price === '별도 협의' ? plan.price : `₩${plan.price}`}
                      </span>
                      {plan.unit && <span className="text-xs text-slate-500">{plan.unit}</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{plan.members}</p>
                    <p className="text-sm text-slate-400 mt-1 mb-2">{plan.desc}</p>
                    <div className="rounded-lg bg-white/[0.03] px-3 py-1.5 mb-4">
                      <span className="text-[10px] font-bold text-slate-500">트랙: </span>
                      <span className="text-[10px] font-medium" style={{ color: plan.color }}>{plan.tracks}</span>
                    </div>
                    <div className="flex-1 space-y-2 mb-6">
                      {plan.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-2 text-sm text-slate-400">
                          <Check size={14} className="shrink-0 mt-0.5" style={{ color: plan.color }} /> {f}
                        </div>
                      ))}
                    </div>
                    <Link href="/wio/contact" className={`text-center rounded-lg py-2.5 text-sm font-semibold transition-colors ${plan.highlight ? 'bg-[#534AB7] text-white hover:bg-[#4a42a5]' : 'border border-white/10 text-slate-300 hover:bg-white/5'}`}>
                      {plan.price === '별도 협의' ? '상담 신청' : '시작하기'}
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Volume Pricing */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#BA7517]" />
              <h2 className="text-2xl font-bold">볼륨 과금</h2>
            </div>
            <p className="text-sm text-slate-400 mb-6">기본 제공량 초과 시 종량 과금이 적용됩니다.</p>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
              {/* Desktop */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-600 border-b border-white/5">
                      <th className="text-left px-6 py-3 font-medium">항목</th>
                      <th className="text-left py-3 font-medium">기본 제공</th>
                      <th className="text-left py-3 font-medium">초과 단가</th>
                      <th className="text-left py-3 font-medium">설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VOLUME_PRICING.map(v => {
                      const Icon = v.icon;
                      return (
                        <tr key={v.item} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-6 py-3 font-medium text-white flex items-center gap-2">
                            <Icon size={14} className="text-[#BA7517]" /> {v.item}
                          </td>
                          <td className="py-3 text-slate-400">{v.free}</td>
                          <td className="py-3 text-[#BA7517] font-medium">{v.extra}</td>
                          <td className="py-3 text-slate-500 text-xs">{v.desc}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-white/5">
                {VOLUME_PRICING.map(v => {
                  const Icon = v.icon;
                  return (
                    <div key={v.item} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className="text-[#BA7517]" />
                        <span className="text-sm font-medium text-white">{v.item}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-600">기본:</span> <span className="text-slate-400">{v.free}</span></div>
                        <div><span className="text-slate-600">초과:</span> <span className="text-[#BA7517]">{v.extra}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/wio/presets" className="inline-flex items-center gap-1 text-sm text-[#9B8FE8] hover:underline">
              업종별 프리셋 보기 <ArrowRight size={14} />
            </Link>
            <Link href="/wio/migration" className="inline-flex items-center gap-1 text-sm text-[#9B8FE8] hover:underline">
              마이그레이션 전략 <ArrowRight size={14} />
            </Link>
            <Link href="/wio/framework" className="inline-flex items-center gap-1 text-sm text-[#9B8FE8] hover:underline">
              WIO Method 상품 보기 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
