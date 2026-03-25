'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/smarcomm/blog-data';
import {
  Search, BarChart3, Lightbulb, Palette,
  Megaphone, TrendingUp, ChevronRight,
  Bot, Globe, Layers, LineChart, MessageSquare,
  FileBarChart, Target, ArrowRight
} from 'lucide-react';
import Header from '@/components/smarcomm/Header';
import Footer from '@/components/smarcomm/Footer';

const HEADLINES = [
  { main: 'AI가 추천하는 브랜드,', accent: '당신인가요?' },
  { main: '보이지 않는 광고의 시대,', accent: '당신의 광고는 정말로 안 보이고 있다면?' },
  { main: '소비자의 선택 그 전에', accent: 'AI의 선택을 받아야 합니다' },
  { main: '당신의 제품은 어디에서', accent: '헤매고 있나요?' },
  { main: 'ChatGPT에게 물어봤는데', accent: '당신의 브랜드가 없다면?' },
  { main: '검색 1페이지에 있어도', accent: 'AI는 당신을 모릅니다' },
  { main: '광고비는 쓰고 있는데', accent: '성과가 보이지 않는 이유' },
  { main: '경쟁사는 AI에서 추천되는데', accent: '왜 우리는 안 될까요?' },
  { main: '네이버 1등이어도', accent: 'ChatGPT 답변엔 없을 수 있습니다' },
  { main: '고객이 AI에게 먼저 물어보는 시대,', accent: '준비되셨나요?' },
  { main: '마케팅의 새 기준,', accent: 'AI가 먼저 찾는 브랜드' },
  { main: '검색 최적화만으로는 부족합니다.', accent: 'AI 최적화가 필요한 시대' },
  { main: '블로그 열심히 써도', accent: 'AI가 읽지 못하면 소용없습니다' },
  { main: '좋은 제품인데 왜 안 팔릴까?', accent: 'AI가 추천하지 않기 때문입니다' },
  { main: '소비자의 70%가', accent: 'AI 검색으로 구매를 결정합니다' },
  { main: '지금 이 순간에도', accent: 'AI는 경쟁사를 추천하고 있습니다' },
  { main: '홈페이지가 있다고 끝이 아닙니다.', accent: 'AI에게 보여야 시작입니다' },
  { main: '마케팅 예산의 절반이', accent: '허공에 사라지고 있다면?' },
  { main: '당신의 사이트를 AI에게 보여주세요.', accent: '30초면 진실을 알 수 있습니다' },
  { main: '광고 없이도 고객이 찾아오게 하려면', accent: 'AI의 언어로 말해야 합니다' },
];

const PROCESS_STEPS = [
  { num: '01', label: '진단', title: 'GEO · SEO 통합 진단', desc: 'AI 검색 노출 + 전통 검색 최적화 상태를 한번에 점검합니다.', icon: <Search size={20} />, free: true },
  { num: '02', label: '기획', title: '전략 수립 · 컨설팅', desc: '진단 데이터 기반으로 AI가 마케팅 전략을 설계합니다.', icon: <Lightbulb size={20} /> },
  { num: '03', label: '제작', title: '소재 · 콘텐츠 제작', desc: '브랜드 가이드 기반 AI 소재 자동 생성.', icon: <Palette size={20} /> },
  { num: '04', label: '실행', title: '다채널 광고 집행', desc: '한국 주요 채널에 원클릭 집행 + AI 최적화.', icon: <Megaphone size={20} /> },
  { num: '05', label: '분석', title: '성과 분석 · 최적화', desc: '통합 대시보드 + AI 자동 제안.', icon: <TrendingUp size={20} /> },
];

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [headline, setHeadline] = useState(HEADLINES[0]);
  const router = useRouter();

  useEffect(() => {
    // UTM/검색 키워드 기반 카피 매칭
    const params = new URLSearchParams(window.location.search);
    const utm = params.get('utm_term') || params.get('keyword') || params.get('q') || '';
    const ref = document.referrer.toLowerCase();

    // 키워드 → 카피 매핑
    const keywordMap: Record<string, number[]> = {
      'seo': [11, 5],        // "검색 최적화만으로는 부족합니다"
      'geo': [9, 10],        // "고객이 AI에게 먼저 물어보는 시대"
      'chatgpt': [4, 5],     // "ChatGPT에게 물어봤는데"
      'ai': [0, 3, 9],       // "AI가 추천하는 브랜드"
      '광고': [1, 6, 17],    // "보이지 않는 광고의 시대"
      '마케팅': [10, 19],    // "마케팅의 새 기준"
      '검색': [5, 8, 11],    // "검색 1페이지에 있어도"
      '브랜드': [0, 13],     // "좋은 제품인데"
      '매출': [13, 17],      // "마케팅 예산의 절반이"
      '경쟁': [7, 15],       // "경쟁사는 AI에서"
      '소상공인': [14, 16],  // "홈페이지가 있다고"
      '네이버': [8],         // "네이버 1등이어도"
    };

    const lower = utm.toLowerCase();
    let matched = false;

    for (const [kw, indices] of Object.entries(keywordMap)) {
      if (lower.includes(kw)) {
        setHeadline(HEADLINES[indices[Math.floor(Math.random() * indices.length)]]);
        matched = true;
        break;
      }
    }

    // 리퍼러 기반
    if (!matched) {
      if (ref.includes('google') || ref.includes('naver')) {
        setHeadline(HEADLINES[5]); // "검색 1페이지에 있어도"
      } else if (ref.includes('instagram') || ref.includes('facebook')) {
        setHeadline(HEADLINES[1]); // "보이지 않는 광고의 시대"
      } else {
        // 랜덤
        setHeadline(HEADLINES[Math.floor(Math.random() * HEADLINES.length)]);
      }
    }
  }, []);

  const handleScan = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    // 최소한 도메인 형태인지 체크 (점이 하나라도 있어야)
    const normalized = trimmed.startsWith('http') ? trimmed : 'https://' + trimmed;
    try {
      const parsed = new URL(normalized);
      if (!parsed.hostname.includes('.')) {
        alert('올바른 URL을 입력해주세요.\n예: https://yoursite.com');
        return;
      }
    } catch {
      alert('올바른 URL을 입력해주세요.\n예: https://yoursite.com');
      return;
    }
    // full navigation으로 middleware rewrite 보장 (router.push는 client-side에서 middleware 미작동 가능)
    window.location.href = `/scan?url=${encodeURIComponent(normalized)}`;
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero — Black */}
        <section className="bg-[#0A0E1A] px-5 pb-20 pt-28 md:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 text-[13px] font-medium tracking-widest text-white/40 uppercase">
              Smart Marketing Communication
            </p>

            <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-white md:text-[44px] md:leading-[1.2]">
              {headline.main}<br />
              <span className="text-white/80">{headline.accent}</span>
            </h1>

            <p className="mx-auto mb-10 max-w-lg text-[15px] leading-relaxed text-white/50">
              GEO · SEO 진단부터 기획, 소재 제작, 채널 집행, 분석까지<br className="hidden md:block" />
              마케팅 전체를 AI가 자동화합니다
            </p>

            {/* URL Input */}
            <div className="mx-auto max-w-lg">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    placeholder="https://yoursite.com"
                    className="w-full rounded-full border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 transition-colors focus:border-white/40 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleScan}
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0A0E1A] transition-all hover:bg-white/90"
                >
                  무료 진단 시작
                </button>
              </div>
              <p className="mt-3 text-xs text-white/30">
                회원가입 없이 · 30초 소요 · 완전 무료
              </p>
            </div>
          </div>
        </section>

        {/* What We Check */}
        <section className="border-t border-border bg-surface px-5 py-16">
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-2xl font-bold text-text">
              GEO + SEO 통합 점검
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="mb-4 text-sm font-bold text-text">GEO 진단 <span className="ml-1 text-xs font-normal text-text-muted">AI 검색 시대의 핵심</span></h3>
                <div className="space-y-2.5 text-sm text-text-sub">
                  {['ChatGPT에서 브랜드 노출 여부', 'Perplexity 출처 인용 확인', 'Google AI Overview 포함 여부', '네이버 AI (Cue) 답변 포함', 'AI 최적화 준비도'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-text" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="mb-4 text-sm font-bold text-text">SEO 진단 <span className="ml-1 text-xs font-normal text-text-muted">검색 최적화 기본기</span></h3>
                <div className="space-y-2.5 text-sm text-text-sub">
                  {['페이지 속도 · 모바일 · HTTPS', '타이틀 · 메타 · H구조 · ALT', 'OG 태그 · 구조화 데이터', '키워드 커버리지 분석', '경쟁사 비교 분석'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-text" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="px-5 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-10 text-center text-2xl font-bold text-text">
              진단 → 기획 → 제작 → 실행 → 분석
            </p>

            <div className="space-y-4">
              {PROCESS_STEPS.map((step) => (
                <div key={step.num} className="flex items-start gap-5 rounded-2xl border border-border bg-white p-5 transition-colors hover:bg-surface">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-text">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-text-muted">{step.num}</span>
                      <h3 className="text-sm font-bold text-text">{step.title}</h3>
                      {step.free && <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-text-sub">무료</span>}
                    </div>
                    <p className="text-sm text-text-sub">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deep Report Preview */}
        <section className="border-t border-border bg-surface px-5 py-16">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-center text-2xl font-bold text-text">
              URL 하나로 이 모든 분석을
            </p>
            <p className="mb-10 text-center text-sm text-text-sub">
              무료 진단으로 시작하고, 회원가입하면 심층 리포트를 받아보세요
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <Bot size={18} />, title: 'GEO 심층 분석', desc: 'AI 4개 플랫폼별 노출 상세 + 경쟁사 비교' },
                { icon: <BarChart3 size={18} />, title: 'SEO 풀 리포트', desc: '15개 항목 상세 점수 + 개선 우선순위' },
                { icon: <Target size={18} />, title: '경쟁사 비교', desc: '동일 업종 경쟁사 SEO/GEO 점수 비교' },
                { icon: <Search size={18} />, title: '키워드 분석', desc: '핵심 키워드 추출 + 검색량 + 경쟁도' },
                { icon: <FileBarChart size={18} />, title: '콘텐츠 갭', desc: '누락 콘텐츠 발견 + 제작 우선순위' },
                { icon: <LineChart size={18} />, title: '월간 모니터링', desc: '매월 자동 리스캔 + 점수 변화 추이' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-border bg-white p-4">
                  <div className="mb-2 text-text">{item.icon}</div>
                  <h3 className="mb-1 text-sm font-semibold text-text">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-text-sub">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 최신 블로그 */}
        <section className="px-5 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text">마케팅 인사이트</h2>
                <p className="mt-1 text-sm text-text-muted">최신 마케팅 트렌드와 실전 사례를 만나보세요</p>
              </div>
              <Link href="/blog" className="text-xs font-semibold text-text-muted hover:text-text">전체 보기 →</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {getPublishedPosts().slice(0, 3).map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-lg hover:border-text-muted/40">
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-semibold text-text-sub">{post.category}</span>
                  <h3 className="mt-2 text-sm font-bold text-text leading-snug group-hover:text-point transition-colors">{post.title}</h3>
                  <p className="mt-1.5 text-xs text-text-muted line-clamp-2">{post.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-text-muted">
                    <span>{post.publishedAt}</span>
                    <span>{post.readTime}분 읽기</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-text">
              30초면 알 수 있습니다
            </h2>
            <p className="mb-8 text-sm text-text-sub">
              AI가 추천하지 않는 사이트는 이미 고객을 잃고 있을 수 있습니다
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 rounded-full bg-text px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent-sub"
            >
              무료 진단 시작
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
