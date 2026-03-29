'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, Users, Layers, Database, Shield,
  ArrowRight, ChevronRight, Fingerprint, Building2, Globe,
  Star, Award, Crown, Gem, UserCheck, Lock, Eye, FileCheck
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── 3-Layer CRM ── */
const CRM_LAYERS = [
  {
    num: 1,
    title: 'Golden Record',
    sub: '지주사 레벨',
    icon: Database,
    color: '#E24B4A',
    desc: '고객의 단일 진실 소스. 모든 사업회사의 고객 데이터를 통합하여 하나의 마스터 프로필을 생성합니다.',
    items: ['통합 고객 ID (UUID)', '이름/연락처/주소 (마스터)', '통합 등급/포인트', '개인정보 동의 상태', 'Identity Resolution 결과'],
  },
  {
    num: 2,
    title: 'BU Profile',
    sub: '사업회사 레벨',
    icon: Building2,
    color: '#534AB7',
    desc: '각 사업회사(BU)가 관리하는 고객 프로필. Golden Record에 연결되면서도 BU별 특수 속성을 보유합니다.',
    items: ['BU별 고객번호', '구매이력/선호도', '등급 (BU 내)', '담당자 배정', '세그먼트 태그'],
  },
  {
    num: 3,
    title: 'Touchpoint',
    sub: '접점 레벨',
    icon: Globe,
    color: '#1D9E75',
    desc: '모든 고객 접점의 이벤트 로그. 웹, 앱, 매장, 콜센터, 이메일 등 모든 채널의 인터랙션을 기록합니다.',
    items: ['채널별 이벤트 로그', '클릭/조회/구매/문의', '캠페인 반응 이력', '고객지원 티켓', '실시간 행동 스트림'],
  },
];

/* ── Identity Resolution ── */
const ID_RESOLUTION_STEPS = [
  { step: '수집', desc: '모든 BU에서 고객 데이터 수집', color: '#E24B4A' },
  { step: '정규화', desc: '전화번호/이메일/주소 표준화', color: '#534AB7' },
  { step: '매칭', desc: '확률적 + 결정론적 매칭', color: '#1D9E75' },
  { step: '병합', desc: 'Golden Record 생성/갱신', color: '#378ADD' },
  { step: '배포', desc: '통합 프로필을 각 BU에 푸시', color: '#BA7517' },
];

/* ── 지주사 vs 사업회사 역할 ── */
const ROLE_DIVISION = [
  { area: '고객 ID 통합', holding: 'Golden Record 관리, ID Resolution', bu: 'BU별 고객번호 ↔ 통합ID 매핑' },
  { area: '등급/포인트', holding: '통합 등급 정책, 크로스 포인트', bu: 'BU 내 등급, 포인트 적립/사용' },
  { area: '데이터 거버넌스', holding: '개인정보 정책, 동의 관리', bu: 'BU별 마케팅 동의 수집' },
  { area: '분석/인사이트', holding: '크로스BU 분석, 통합 세그먼트', bu: 'BU별 캠페인 분석' },
  { area: '멤버십', holding: '통합 멤버십 정책, 크로스 혜택', bu: 'BU별 혜택 설계/운영' },
];

/* ── 멤버십 ── */
const MEMBERSHIP_TIERS = [
  { tier: 'Basic', icon: UserCheck, color: '#64748b', points: '가입 시', benefits: '기본 서비스 이용' },
  { tier: 'Silver', icon: Star, color: '#94a3b8', points: '1,000P', benefits: '5% 할인 + 무료배송' },
  { tier: 'Gold', icon: Award, color: '#BA7517', points: '5,000P', benefits: '10% 할인 + 전용 라운지' },
  { tier: 'Platinum', icon: Crown, color: '#534AB7', points: '20,000P', benefits: '15% 할인 + 전담 매니저' },
  { tier: 'VIP', icon: Gem, color: '#E24B4A', points: '50,000P', benefits: '20% 할인 + 프리미엄 혜택' },
];

/* ── 개인정보보호 ── */
const PRIVACY_FRAMEWORK = [
  { icon: Lock, title: '동의 관리', desc: '목적별/채널별 동의 수집, 철회 즉시 반영' },
  { icon: Eye, title: '접근 통제', desc: '역할 기반 고객 데이터 접근, 열람 로그 전수 기록' },
  { icon: FileCheck, title: '열람/삭제 청구', desc: '고객 요청 시 30일 내 처리, 자동 워크플로우' },
  { icon: Shield, title: '암호화/가명처리', desc: '저장 시 AES-256, 분석 시 가명/익명 처리' },
];

export default function CRMPage() {
  const [activeLayer, setActiveLayer] = useState<number>(1);

  return (
    <>
      <WIOMarketingHeader />

      <div className="pt-20 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6">
            <ArrowLeft size={14} /> WIO
          </Link>

          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/20 px-4 py-1.5 text-xs text-[#9B8FE8] font-medium">
              <Sparkles size={12} /> Unified CRM
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">통합 CRM</h1>
            <p className="text-lg text-slate-400">하나의 ID, 모든 서비스</p>
          </div>

          {/* ═══════ 3-Layer Visualization ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#534AB7]" />
              <h2 className="text-2xl font-bold">3-Layer 고객 데이터 구조</h2>
            </div>

            {/* Layer Selector */}
            <div className="flex gap-2 mb-6">
              {CRM_LAYERS.map((layer) => (
                <button
                  key={layer.num}
                  onClick={() => setActiveLayer(layer.num)}
                  className="flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all text-left"
                  style={{
                    background: activeLayer === layer.num ? `${layer.color}15` : 'rgba(255,255,255,0.02)',
                    borderWidth: 1,
                    borderColor: activeLayer === layer.num ? `${layer.color}40` : 'rgba(255,255,255,0.05)',
                    color: activeLayer === layer.num ? 'white' : '#94a3b8',
                  }}
                >
                  <span className="text-[10px] font-bold block mb-1" style={{ color: layer.color }}>
                    Layer {layer.num}
                  </span>
                  {layer.title}
                </button>
              ))}
            </div>

            {/* Layer Detail */}
            {CRM_LAYERS.map((layer) => {
              if (activeLayer !== layer.num) return null;
              const Icon = layer.icon;
              return (
                <div
                  key={layer.num}
                  className="rounded-xl border p-6 md:p-8"
                  style={{ borderColor: `${layer.color}30`, background: `${layer.color}05` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${layer.color}15` }}>
                      <Icon size={24} style={{ color: layer.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{layer.title}</h3>
                      <p className="text-xs text-slate-500">{layer.sub}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{layer.desc}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {layer.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: layer.color }} />
                        <span className="text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Layer Connection */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {CRM_LAYERS.map((layer, i) => (
                <div key={layer.num} className="flex items-center gap-2">
                  <div className="rounded-lg px-4 py-2 text-xs font-bold" style={{ background: `${layer.color}15`, color: layer.color }}>
                    L{layer.num} {layer.title}
                  </div>
                  {i < CRM_LAYERS.length - 1 && <ArrowRight size={14} className="text-slate-600" />}
                </div>
              ))}
            </div>
          </section>

          {/* ═══════ Identity Resolution ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#E24B4A]" />
              <h2 className="text-2xl font-bold">Identity Resolution</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              여러 채널과 사업회사에 흩어진 고객 데이터를 하나의 Golden Record로 통합하는 프로세스.
            </p>
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              {ID_RESOLUTION_STEPS.map((item, i) => (
                <div key={item.step} className="flex items-center flex-1">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 flex-1 text-center">
                    <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${item.color}15` }}>
                      <Fingerprint size={18} style={{ color: item.color }} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.step}</h3>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  {i < ID_RESOLUTION_STEPS.length - 1 && (
                    <ChevronRight size={14} className="text-slate-600 mx-1 shrink-0 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ═══════ 역할 분담 Table ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#1D9E75]" />
              <h2 className="text-2xl font-bold">지주사 vs 사업회사 역할</h2>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
              {/* Desktop */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-600 border-b border-white/5">
                      <th className="text-left px-6 py-2.5 font-medium w-40">영역</th>
                      <th className="text-left py-2.5 font-medium">지주사 (Holding)</th>
                      <th className="text-left py-2.5 font-medium">사업회사 (BU)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROLE_DIVISION.map((r) => (
                      <tr key={r.area} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-3 font-medium text-white">{r.area}</td>
                        <td className="py-3 text-slate-400">{r.holding}</td>
                        <td className="py-3 text-slate-400">{r.bu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-white/5">
                {ROLE_DIVISION.map((r) => (
                  <div key={r.area} className="px-5 py-4">
                    <div className="text-sm font-medium text-white mb-2">{r.area}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] text-[#E24B4A] font-medium mb-1">지주사</div>
                        <div className="text-xs text-slate-400">{r.holding}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#534AB7] font-medium mb-1">사업회사</div>
                        <div className="text-xs text-slate-400">{r.bu}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ 통합 멤버십 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#BA7517]" />
              <h2 className="text-2xl font-bold">통합 멤버십</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              모든 사업회사를 관통하는 통합 등급 체계. 어디서든 적립하고, 어디서든 사용합니다.
            </p>
            <div className="grid gap-3 md:grid-cols-5">
              {MEMBERSHIP_TIERS.map((tier, i) => {
                const Icon = tier.icon;
                return (
                  <div
                    key={tier.tier}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center transition-all hover:scale-[1.02]"
                    style={{ borderTopWidth: 3, borderTopColor: tier.color }}
                  >
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${tier.color}15` }}>
                      <Icon size={22} style={{ color: tier.color }} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">{tier.tier}</h3>
                    <div className="text-xs font-medium mb-2" style={{ color: tier.color }}>{tier.points}</div>
                    <p className="text-xs text-slate-500">{tier.benefits}</p>
                    {i < MEMBERSHIP_TIERS.length - 1 && (
                      <div className="mt-3 text-slate-600">
                        <ChevronRight size={12} className="mx-auto rotate-90 md:hidden" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════ Consumer Portal Mockup ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#378ADD]" />
              <h2 className="text-2xl font-bold">통합 포털</h2>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
              <p className="text-sm text-slate-400 mb-6">
                고객이 하나의 포털에서 모든 사업회사의 서비스를 이용합니다.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-[#0F0F23] border border-white/10 p-5">
                  <div className="text-xs text-slate-600 mb-3">마이페이지</div>
                  <div className="space-y-2">
                    <div className="rounded bg-white/5 px-3 py-2 text-xs text-slate-400">통합 프로필</div>
                    <div className="rounded bg-white/5 px-3 py-2 text-xs text-slate-400">포인트 잔액: 12,500P</div>
                    <div className="rounded bg-white/5 px-3 py-2 text-xs text-slate-400">등급: Gold</div>
                  </div>
                </div>
                <div className="rounded-lg bg-[#0F0F23] border border-white/10 p-5">
                  <div className="text-xs text-slate-600 mb-3">이용 내역</div>
                  <div className="space-y-2">
                    <div className="rounded bg-white/5 px-3 py-2 text-xs text-slate-400">BU-A: 최근 구매 3건</div>
                    <div className="rounded bg-white/5 px-3 py-2 text-xs text-slate-400">BU-B: 구독 활성</div>
                    <div className="rounded bg-white/5 px-3 py-2 text-xs text-slate-400">BU-C: 상담 이력 2건</div>
                  </div>
                </div>
                <div className="rounded-lg bg-[#0F0F23] border border-white/10 p-5">
                  <div className="text-xs text-slate-600 mb-3">개인정보</div>
                  <div className="space-y-2">
                    <div className="rounded bg-white/5 px-3 py-2 text-xs text-slate-400">동의 관리</div>
                    <div className="rounded bg-white/5 px-3 py-2 text-xs text-slate-400">데이터 열람 요청</div>
                    <div className="rounded bg-white/5 px-3 py-2 text-xs text-slate-400">삭제 요청</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ 개인정보보호 ═══════ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#D4537E]" />
              <h2 className="text-2xl font-bold">개인정보보호 프레임워크</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {PRIVACY_FRAMEWORK.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#D4537E]/10">
                        <Icon size={18} className="text-[#D4537E]" />
                      </div>
                      <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Back */}
          <div className="text-center">
            <Link href="/wio" className="inline-flex items-center gap-2 text-sm text-[#9B8FE8] hover:text-white transition-colors">
              <ArrowLeft size={14} /> WIO 홈으로
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
