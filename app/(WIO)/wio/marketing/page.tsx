'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, Megaphone, Globe, MessageSquare,
  ChevronRight, Monitor, Smartphone, Mail, Search as SearchIcon,
  Video, ShoppingBag, Newspaper, Radio, Users, FileText,
  BarChart3, ArrowRight, Database, Layers, Zap, Target
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── 매체 분류 ── */
const MEDIA_CATEGORIES = [
  {
    type: 'Paid',
    sub: '유료 매체',
    color: '#E24B4A',
    icon: Megaphone,
    channels: [
      { name: '검색 광고', icon: SearchIcon, desc: 'Google Ads, Naver SA' },
      { name: '디스플레이', icon: Monitor, desc: 'GDN, Kakao DA, Criteo' },
      { name: '소셜 광고', icon: Smartphone, desc: 'Meta, TikTok, Twitter' },
      { name: '동영상', icon: Video, desc: 'YouTube, Naver TV' },
      { name: '커머스', icon: ShoppingBag, desc: 'Coupang, Naver Shopping' },
      { name: '프로그래매틱', icon: Radio, desc: 'DSP, SSP, DMP 연동' },
    ],
  },
  {
    type: 'Owned',
    sub: '자사 매체',
    color: '#534AB7',
    icon: Globe,
    channels: [
      { name: '웹사이트', icon: Globe, desc: 'GA4 연동, 히트맵' },
      { name: '앱', icon: Smartphone, desc: 'MMP(Appsflyer) 연동' },
      { name: '이메일', icon: Mail, desc: '발송/오픈/클릭 추적' },
      { name: '블로그', icon: FileText, desc: 'SEO 순위, 유입 추적' },
      { name: 'CRM 채널', icon: Users, desc: '카카오톡, 문자, 앱푸시' },
      { name: '커뮤니티', icon: MessageSquare, desc: '자사 포럼, 카페' },
    ],
  },
  {
    type: 'Earned',
    sub: '획득 매체',
    color: '#1D9E75',
    icon: MessageSquare,
    channels: [
      { name: 'PR/언론', icon: Newspaper, desc: '기사 모니터링, 톤 분석' },
      { name: '소셜 버즈', icon: MessageSquare, desc: '멘션 추적, 감성 분석' },
      { name: '리뷰', icon: FileText, desc: '리뷰 플랫폼 수집/분석' },
      { name: '인플루언서', icon: Users, desc: '콘텐츠 성과, ROI 추적' },
    ],
  },
];

/* ── Paid Media 데이터 수집 ── */
const PAID_MEDIA_DATA = [
  { channel: 'Google Ads', method: 'API 자동 수집', metrics: '노출, 클릭, CPC, 전환, ROAS', frequency: '실시간' },
  { channel: 'Meta Ads', method: 'Marketing API', metrics: '도달, 빈도, CPM, 전환, LTV', frequency: '4시간' },
  { channel: 'Naver SA', method: 'API 자동 수집', metrics: '노출, 클릭, CPC, 전환', frequency: '일 1회' },
  { channel: 'Kakao Moment', method: 'API 자동 수집', metrics: '노출, 클릭, 전환, 도달', frequency: '일 1회' },
  { channel: 'TikTok Ads', method: 'Marketing API', metrics: '조회수, 참여율, CPA, 전환', frequency: '4시간' },
  { channel: 'YouTube Ads', method: 'Google Ads API', metrics: 'VTR, CPV, 전환, 브랜드 리프트', frequency: '실시간' },
];

/* ── 캠페인 라이프사이클 ── */
const CAMPAIGN_LIFECYCLE = [
  { step: '전략 수립', color: '#E24B4A' },
  { step: '타겟 설정', color: '#534AB7' },
  { step: '예산 배분', color: '#1D9E75' },
  { step: '크리에이티브 제작', color: '#378ADD' },
  { step: '매체 플랜', color: '#BA7517' },
  { step: '집행', color: '#D4537E' },
  { step: '실시간 모니터링', color: '#639922' },
  { step: '최적화', color: '#E24B4A' },
  { step: '성과 분석', color: '#534AB7' },
  { step: '인사이트 도출', color: '#1D9E75' },
];

/* ── 데이터 허브 아키텍처 ── */
const DATA_HUB_LAYERS = [
  {
    name: '데이터 수집 레이어',
    color: '#E24B4A',
    items: ['API Connector (Google, Meta, Naver, Kakao, ...)', 'Webhook Receiver', 'File Importer (CSV/Excel)', 'Pixel/SDK 데이터'],
  },
  {
    name: '정규화 레이어',
    color: '#534AB7',
    items: ['표준 메트릭 매핑', '통화/타임존 변환', '중복 제거/병합', 'UTM 파라미터 파싱'],
  },
  {
    name: '저장 레이어',
    color: '#1D9E75',
    items: ['원본 데이터 (Data Lake)', '정규화 데이터 (Data Warehouse)', '집계 테이블 (OLAP)', '실시간 스트림 (Event Store)'],
  },
  {
    name: '활용 레이어',
    color: '#378ADD',
    items: ['통합 대시보드', '자동 리포트 생성', '어트리뷰션 분석', 'AI 예측/추천'],
  },
];

export default function MarketingPage() {
  const [activeCategory, setActiveCategory] = useState<string>('Paid');

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
              <Sparkles size={12} /> Marketing & Media
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">마케팅 &middot; 매체 관리</h1>
            <p className="text-lg text-slate-400">모든 매체, 하나의 대시보드</p>
          </div>

          {/* ═══════ 매체 분류 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#534AB7]" />
              <h2 className="text-2xl font-bold">매체 분류</h2>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-6">
              {MEDIA_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.type}
                    onClick={() => setActiveCategory(cat.type)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeCategory === cat.type ? `${cat.color}15` : 'rgba(255,255,255,0.02)',
                      borderWidth: 1,
                      borderColor: activeCategory === cat.type ? `${cat.color}40` : 'rgba(255,255,255,0.05)',
                      color: activeCategory === cat.type ? 'white' : '#94a3b8',
                    }}
                  >
                    <Icon size={14} style={{ color: cat.color }} />
                    {cat.type} <span className="text-xs text-slate-500 hidden sm:inline">({cat.sub})</span>
                  </button>
                );
              })}
            </div>

            {/* Channel Grid */}
            {MEDIA_CATEGORIES.map((cat) => {
              if (activeCategory !== cat.type) return null;
              return (
                <div key={cat.type} className="grid gap-3 md:grid-cols-3">
                  {cat.channels.map((ch) => {
                    const ChIcon = ch.icon;
                    return (
                      <div key={ch.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}10` }}>
                            <ChIcon size={16} style={{ color: cat.color }} />
                          </div>
                          <h3 className="text-sm font-bold text-white">{ch.name}</h3>
                        </div>
                        <p className="text-xs text-slate-500">{ch.desc}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </section>

          {/* ═══════ Paid Media Detail ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#E24B4A]" />
              <h2 className="text-2xl font-bold">Paid Media 데이터 수집</h2>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-600 border-b border-white/5">
                      <th className="text-left px-6 py-2.5 font-medium">채널</th>
                      <th className="text-left py-2.5 font-medium">수집 방법</th>
                      <th className="text-left py-2.5 font-medium">핵심 메트릭</th>
                      <th className="text-left py-2.5 font-medium">갱신 주기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAID_MEDIA_DATA.map((row) => (
                      <tr key={row.channel} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-3 font-medium text-white">{row.channel}</td>
                        <td className="py-3 text-slate-400">{row.method}</td>
                        <td className="py-3 text-slate-500 text-xs">{row.metrics}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${row.frequency === '실시간' ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-white/5 text-slate-400'}`}>
                            {row.frequency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-white/5">
                {PAID_MEDIA_DATA.map((row) => (
                  <div key={row.channel} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{row.channel}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${row.frequency === '실시간' ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-white/5 text-slate-400'}`}>
                        {row.frequency}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{row.metrics}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ 캠페인 라이프사이클 ═══════ */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#1D9E75]" />
              <h2 className="text-2xl font-bold">캠페인 라이프사이클</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              전략 수립부터 인사이트 도출까지, 10단계 캠페인 관리 프로세스.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {CAMPAIGN_LIFECYCLE.map((item, i) => (
                <div key={item.step} className="flex items-center gap-2">
                  <div
                    className="rounded-lg px-4 py-2.5 text-xs font-medium border transition-all hover:scale-105"
                    style={{
                      borderColor: `${item.color}30`,
                      background: `${item.color}08`,
                      color: 'white',
                    }}
                  >
                    <span className="text-[10px] font-bold mr-1.5" style={{ color: item.color }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.step}
                  </div>
                  {i < CAMPAIGN_LIFECYCLE.length - 1 && (
                    <ChevronRight size={12} className="text-slate-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ═══════ 매체 데이터 허브 ═══════ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 rounded-full bg-[#378ADD]" />
              <h2 className="text-2xl font-bold">매체 데이터 허브</h2>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-2xl">
              모든 매체 데이터를 자동 수집하고, 정규화하고, 통합 분석합니다.
            </p>

            <div className="space-y-4">
              {DATA_HUB_LAYERS.map((layer, i) => (
                <div key={layer.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${layer.color}15` }}>
                      {i === 0 && <Database size={16} style={{ color: layer.color }} />}
                      {i === 1 && <Zap size={16} style={{ color: layer.color }} />}
                      {i === 2 && <Layers size={16} style={{ color: layer.color }} />}
                      {i === 3 && <BarChart3 size={16} style={{ color: layer.color }} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mr-2" style={{ background: `${layer.color}20`, color: layer.color }}>
                        L{i + 1}
                      </span>
                      <span className="text-sm font-bold text-white">{layer.name}</span>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {layer.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: layer.color }} />
                        {item}
                      </div>
                    ))}
                  </div>
                  {i < DATA_HUB_LAYERS.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <ArrowRight size={14} className="text-slate-600 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
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
