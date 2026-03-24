'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Sparkles } from 'lucide-react';
import SmarCommHeader from '@/components/SmarCommHeader';
import SmarCommFooter from '@/components/SmarCommFooter';

const TIERS = [
  {
    name: 'Free', monthlyPrice: 0, yearlyPrice: 0,
    target: '시작하는 모든 분',
    cta: '무료로 시작', ctaLink: '/signup', accent: false, badge: '',
    features: [
      { label: 'GEO & SEO 진단 5회/월', included: true },
      { label: '경쟁사 비교 1개', included: true },
      { label: '기본 진단 리포트', included: true },
      { label: '팀 멤버 1명', included: true },
      { label: '데이터 보관 7일', included: true },
      { label: 'AI 소재 제작', included: false },
      { label: '캠페인 관리', included: false },
      { label: 'A/B 테스트', included: false },
      { label: 'Todo List', included: false },
      { label: 'CRM 메신저', included: false },
    ],
  },
  {
    name: 'Standard', monthlyPrice: 49000, yearlyPrice: 39000,
    target: '소상공인 · 1인 사업자',
    cta: '시작하기', ctaLink: '/signup', accent: false, badge: '',
    features: [
      { label: 'GEO & SEO 진단 30회/월', included: true },
      { label: '경쟁사 비교 3개', included: true },
      { label: '상세 진단 리포트', included: true },
      { label: '팀 멤버 2명', included: true },
      { label: '데이터 보관 90일', included: true },
      { label: 'AI 소재 제작 10건/월', included: true },
      { label: '캠페인 관리 3개', included: true },
      { label: 'A/B 테스트', included: false },
      { label: 'Todo List', included: false },
      { label: 'CRM 메신저', included: false },
    ],
  },
  {
    name: 'Pro', monthlyPrice: 149000, yearlyPrice: 119000,
    target: '스타트업 · D2C 브랜드',
    cta: '시작하기', ctaLink: '/signup', accent: true, badge: '추천',
    features: [
      { label: 'GEO & SEO 무제한 진단', included: true },
      { label: '경쟁사 비교 5개', included: true },
      { label: '상세 리포트 + PDF', included: true },
      { label: '팀 멤버 5명', included: true },
      { label: '데이터 보관 1년', included: true },
      { label: 'AI 소재 제작 50건/월', included: true },
      { label: '캠페인 관리 10개', included: true },
      { label: 'A/B 테스트 3개', included: true },
      { label: 'Breaking Funnel', included: true },
      { label: 'CRM 메신저', included: false },
    ],
  },
  {
    name: 'Premium', monthlyPrice: 349000, yearlyPrice: 279000,
    target: '중소기업 · 마케팅팀',
    cta: '시작하기', ctaLink: '/signup', accent: false, badge: '',
    features: [
      { label: 'GEO & SEO 무제한 진단', included: true },
      { label: '경쟁사 비교 10개', included: true },
      { label: '상세 리포트 + PDF', included: true },
      { label: '팀 멤버 10명', included: true },
      { label: '데이터 보관 2년', included: true },
      { label: 'AI 소재 제작 무제한', included: true },
      { label: '캠페인 관리 무제한', included: true },
      { label: 'A/B 테스트 무제한', included: true },
      { label: 'Todo List 무료', included: true },
      { label: 'CRM 메신저 (이메일/푸시/카카오)', included: true },
    ],
  },
  {
    name: 'Ultra', monthlyPrice: 990000, yearlyPrice: 790000,
    target: '기업 · 에이전시',
    cta: '문의하기', ctaLink: '/sc', accent: false, badge: 'Enterprise',
    features: [
      { label: 'GEO & SEO 무제한 진단', included: true },
      { label: '경쟁사 비교 무제한', included: true },
      { label: '전체 리포트 + 커스텀', included: true },
      { label: '팀 멤버 무제한', included: true },
      { label: '데이터 보관 무제한', included: true },
      { label: 'AI 소재 제작 무제한', included: true },
      { label: '모든 기능 무제한', included: true },
      { label: '자동화 워크플로우', included: true },
      { label: 'Todo List + CRM 메신저', included: true },
      { label: '전담 컨설턴트 배정', included: true },
    ],
  },
];

function formatPrice(n: number) {
  if (n === 0) return '0';
  return new Intl.NumberFormat('ko-KR').format(n);
}

export default function SCPricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <SmarCommHeader />
      <main className="min-h-screen px-5 pb-20 pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-xl md:text-3xl font-extrabold text-text">요금제</h1>
            <p className="mb-6 text-base text-text-sub">무료로 시작하고, 성장에 맞춰 업그레이드하세요</p>

            {/* 월간/연간 토글 */}
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-1 py-1">
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${!annual ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}
              >
                월간
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${annual ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}
              >
                연간 <span className="text-success text-xs">20% 절약</span>
              </button>
            </div>
          </div>

          {/* 미가입자 안내 */}
          <div className="mb-6 rounded-xl border border-border bg-surface/50 p-4 text-center">
            <p className="text-sm text-text-sub">
              <Sparkles size={14} className="inline text-accent mr-1" />
              회원가입 없이 <strong>GEO & SEO 진단 1회</strong> 무료 체험 가능
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {TIERS.map((tier) => {
              const price = annual ? tier.yearlyPrice : tier.monthlyPrice;
              return (
                <div key={tier.name} className={`flex flex-col rounded-2xl border p-5 ${tier.accent ? 'border-accent bg-accent/5 shadow-[0_0_30px_rgba(59,130,246,0.08)]' : 'border-border bg-card'}`}>
                  {tier.badge && (
                    <div className={`mb-2 text-xs font-bold tracking-wider ${tier.accent ? 'text-accent' : 'text-text-muted'}`}>
                      {tier.badge}
                    </div>
                  )}
                  <h3 className="text-lg font-extrabold text-text">{tier.name}</h3>
                  <p className="mb-2 text-[11px] text-text-muted">{tier.target}</p>
                  <div className="mb-4">
                    <span className="text-2xl font-extrabold text-text">₩{formatPrice(price)}</span>
                    {price > 0 && <span className="text-xs text-text-muted"> /월</span>}
                    {annual && price > 0 && (
                      <div className="text-[11px] text-text-muted line-through">₩{formatPrice(tier.monthlyPrice)}/월</div>
                    )}
                  </div>
                  <div className="mb-5 flex-1 space-y-2">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-[13px]">
                        {f.included ? <Check size={14} className="mt-0.5 shrink-0 text-success" /> : <X size={14} className="mt-0.5 shrink-0 text-text-muted/40" />}
                        <span className={f.included ? 'text-text-sub' : 'text-text-muted/50'}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={tier.ctaLink}
                    className={`block rounded-lg py-2.5 text-center text-sm font-bold transition-colors ${
                      tier.accent
                        ? 'bg-accent text-white hover:bg-accent/90'
                        : 'border border-border bg-surface text-text-sub hover:text-text'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* 비교 표 */}
          <div className="mt-16">
            <h2 className="mb-6 text-center text-xl font-bold text-text">요금제 상세 비교</h2>
            <div className="overflow-x-auto rounded-2xl border border-border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    <th className="px-4 py-3 text-left font-semibold text-text-sub">기능</th>
                    {TIERS.map(t => (
                      <th key={t.name} className={`px-3 py-3 text-center font-bold ${t.accent ? 'text-accent' : 'text-text'}`}>{t.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    { label: 'GEO & SEO 진단', vals: ['5회/월', '30회/월', '무제한', '무제한', '무제한'] },
                    { label: '경쟁사 비교', vals: ['1개', '3개', '5개', '10개', '무제한'] },
                    { label: 'AI 소재 제작', vals: ['—', '10건/월', '50건/월', '무제한', '무제한'] },
                    { label: '캠페인 관리', vals: ['—', '3개', '10개', '무제한', '무제한'] },
                    { label: 'A/B 테스트', vals: ['—', '—', '3개', '무제한', '무제한'] },
                    { label: 'Breaking Funnel', vals: ['—', '—', '✓', '✓', '✓'] },
                    { label: 'Todo List', vals: ['—', '—', '—', '✓', '✓'] },
                    { label: 'CRM 메신저', vals: ['—', '—', '—', '✓', '✓'] },
                    { label: '자동화 워크플로우', vals: ['—', '—', '—', '—', '✓'] },
                    { label: '전담 컨설턴트', vals: ['—', '—', '—', '—', '✓'] },
                    { label: '팀 멤버', vals: ['1명', '2명', '5명', '10명', '무제한'] },
                    { label: '데이터 보관', vals: ['7일', '90일', '1년', '2년', '무제한'] },
                  ].map((row, ri) => (
                    <tr key={ri} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5 font-medium text-text-sub">{row.label}</td>
                      {row.vals.map((v, vi) => (
                        <td key={vi} className={`px-3 py-2.5 text-center ${v === '✓' ? 'text-success font-bold' : v === '—' ? 'text-text-muted/40' : 'text-text'}`}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <SmarCommFooter />
    </>
  );
}
