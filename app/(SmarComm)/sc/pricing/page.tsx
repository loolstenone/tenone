'use client';

import Link from 'next/link';
import { Check, X } from 'lucide-react';
import Header from '@/components/smarcomm/Header';
import Footer from '@/components/smarcomm/Footer';

const TIERS = [
  {
    name: 'Free',
    price: '0원',
    period: '',
    target: '모든 잠재 고객',
    cta: '무료 점검 시작',
    ctaLink: '/',
    accent: false,
    features: [
      { label: 'SEO/GEO 점검 3회', included: true },
      { label: '기본 리포트', included: true },
      { label: '소재 체험 5건', included: true },
      { label: '상세 리포트', included: false },
      { label: '소재 제작', included: false },
      { label: '채널 집행', included: false },
      { label: '컨설팅', included: false },
    ],
  },
  {
    name: 'Lite',
    price: '29만 원~',
    period: '/월',
    target: '소상공인',
    cta: '시작하기',
    ctaLink: '/signup',
    accent: false,
    features: [
      { label: 'SEO/GEO 무제한 점검', included: true },
      { label: '상세 리포트 (월 1회)', included: true },
      { label: '소재 월 30건', included: true },
      { label: '채널 1개 집행', included: true },
      { label: 'AI 챗봇 컨설팅', included: true },
      { label: '전채널 집행', included: false },
      { label: '전담 매니저', included: false },
    ],
  },
  {
    name: 'Growth',
    price: '99만 원~',
    period: '/월',
    target: '스타트업 / D2C',
    cta: '시작하기',
    ctaLink: '/signup',
    accent: true,
    features: [
      { label: 'SEO/GEO 무제한 점검', included: true },
      { label: '상세 리포트 (주 1회)', included: true },
      { label: '소재 무제한', included: true },
      { label: '채널 3개 집행', included: true },
      { label: '월 1회 30분 컨설팅', included: true },
      { label: 'A/B 테스트', included: true },
      { label: '전담 매니저', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '299만 원~',
    period: '/월',
    target: '중소기업',
    cta: '문의하기',
    ctaLink: '/meeting',
    accent: false,
    features: [
      { label: 'SEO/GEO 무제한 점검', included: true },
      { label: '실시간 리포트', included: true },
      { label: '소재 무제한 + 영상', included: true },
      { label: '전채널 집행', included: true },
      { label: '전담 매니저', included: true },
      { label: 'CRM 연동', included: true },
      { label: 'LTV 분석', included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-20 pt-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-extrabold text-text">요금제</h1>
            <p className="text-base text-text-sub">무료로 시작하고, 성장에 맞춰 업그레이드하세요</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-6 ${
                  tier.accent
                    ? 'border-accent bg-accent/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                    : 'border-border bg-card'
                }`}
              >
                {tier.accent && (
                  <div className="mb-3 text-xs font-bold tracking-wider text-accent">추천</div>
                )}
                <h3 className="text-lg font-extrabold text-text">{tier.name}</h3>
                <p className="mb-1 text-xs text-text-muted">{tier.target}</p>
                <div className="mb-4 mt-2">
                  <span className="text-2xl font-extrabold text-text">{tier.price}</span>
                  <span className="text-sm text-text-muted">{tier.period}</span>
                </div>

                <div className="mb-6 flex-1 space-y-2">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <Check size={14} className="text-success" />
                      ) : (
                        <X size={14} className="text-text-muted" />
                      )}
                      <span className={f.included ? 'text-text-sub' : 'text-text-muted'}>{f.label}</span>
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
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted">
              Enterprise 요금제가 필요하신가요?{' '}
              <Link href="/meeting" className="font-medium text-accent">
                문의하기
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
