'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Users, Handshake, Building2, Star, Calendar,
  MapPin, Clock, ChevronRight, MessageCircle, Sparkles, Quote,
} from 'lucide-react';
import { fetchStars, fetchBadakStats } from '@/lib/supabase/badak';
import type { BadakStar } from '@/types/badak';

/* ── Mock: 다음 모임 ── */
const UPCOMING_MEETUPS = [
  {
    id: 'm1',
    title: 'DAM Party Season 4',
    category: '네트워킹',
    date: '2026.04.12 (토)',
    time: '14:00 - 18:00',
    location: '서울 성수 어반소스',
    price: '25,000원',
    capacity: 80,
    remaining: 12,
    badge: '모집중',
  },
  {
    id: 'm2',
    title: '마케팅 디렉터 멘토링',
    category: '멘토링',
    date: '2026.04.19 (토)',
    time: '10:00 - 12:00',
    location: '서울 강남 위워크',
    price: '15,000원',
    capacity: 20,
    remaining: 3,
    badge: '마감임박',
  },
  {
    id: 'm3',
    title: '업계 밋업: 퍼포먼스 마케팅',
    category: '밋업',
    date: '2026.04.26 (토)',
    time: '19:00 - 21:00',
    location: '서울 홍대 카페골목',
    price: '10,000원',
    capacity: 40,
    remaining: 28,
    badge: '모집중',
  },
];

/* ── Mock: 추천 프로필 ── */
const RECOMMENDED_PROFILES = [
  { id: 'r1', name: '김지수', role: '브랜드 마케터', company: '네이버', years: 7, tag: '브랜딩 전략', category: '마케팅' },
  { id: 'r2', name: '이현우', role: '퍼포먼스 마케터', company: '카카오', years: 5, tag: 'GA4 분석', category: '디지털' },
  { id: 'r3', name: '박소연', role: '크리에이티브 디렉터', company: '제일기획', years: 12, tag: '캠페인 기획', category: '광고' },
  { id: 'r4', name: '정민호', role: '그로스 매니저', company: '토스', years: 4, tag: 'CRM 자동화', category: '스타트업' },
  { id: 'r5', name: '한서윤', role: 'AE', company: '이노션', years: 6, tag: '미디어 플래닝', category: '광고' },
  { id: 'r6', name: '최다은', role: '콘텐츠 마케터', company: '무신사', years: 3, tag: 'SNS 콘텐츠', category: '브랜딩' },
];

/* ── Mock: 후기 ── */
const REVIEWS = [
  { name: '김태현', company: '스타트업 CMO', review: 'DAM Party에서 만난 분과 실제 프로젝트 협업까지 이어졌어요. 진짜 연결이 만들어지는 곳.' },
  { name: '이수빈', company: '대행사 AE 5년차', review: '블라인드에서는 불만만 나누는데, 바닥에서는 진짜 도움이 되는 대화를 합니다.' },
  { name: '박준혁', company: '인하우스 마케터', review: '업계 밋업에서 멘토를 만났고, 이직까지 성공했습니다. 약한 연결의 힘을 체감했어요.' },
];

/* ── Mock: 파트너 ── */
const PARTNERS = [
  { name: 'MADLeague', desc: '대학 마케팅 동아리 연합' },
  { name: 'MADLeap', desc: '대학모레 프로젝트' },
  { name: 'Ten:One', desc: '유니버스 모기업' },
  { name: 'HeRo', desc: '인재 매칭 플랫폼' },
];

export default function BadakHome() {
  const [stars, setStars] = useState<BadakStar[]>([]);
  const [stats, setStats] = useState({ profileCount: 0, connectionCount: 0, industryCount: 0 });

  useEffect(() => {
    fetchStars({ limit: 3 }).then(({ stars }) => setStars(stars));
    fetchBadakStats().then(setStats);
  }, []);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-[#1a1a2e] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-blue-900/20" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative mx-auto max-w-4xl px-6 py-24 md:py-36 text-center">
          <p className="text-sm tracking-widest text-amber-400/80 uppercase mb-6 font-medium">Trust-Based Professional Network</p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[1.15] mb-5">
            바닥은 좁다.<br />
            <span className="text-amber-400">약한 연결</span>이<br className="md:hidden" /> 강력한 기회를 만든다.
          </h1>
          <p className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            같은 바닥에서 고민을 풀고, 성장하고, 같이 일한다.<br className="hidden md:block" />
            마케팅 / 광고 / 브랜딩 현업인들의 신뢰 기반 네트워크.
          </p>

          {/* 다음 DAM Party CTA */}
          <div className="mb-10 inline-flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 text-sm">
            <Calendar size={16} className="text-amber-400" />
            <span className="text-neutral-300">다음 DAM Party</span>
            <span className="font-bold text-white">4월 12일 (토) 성수</span>
            <Link href="/badak/meetups" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
              신청 <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/badak/join" className="flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-3.5 text-sm font-bold text-[#1a1a2e] hover:bg-amber-400 transition-colors">
              바닥 프로필 만들기 <ArrowRight size={16} />
            </Link>
            <Link href="/badak/explore" className="flex items-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              바닥 탐색하기
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-[#12122a] text-white py-8 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-black text-amber-400">9,000+</div>
              <p className="text-xs text-neutral-400 mt-1">등록 회원</p>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-amber-400">14개</div>
              <p className="text-xs text-neutral-400 mt-1">오픈채팅방</p>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-amber-400">8회</div>
              <p className="text-xs text-neutral-400 mt-1">DAM Party</p>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-amber-400">100+</div>
              <p className="text-xs text-neutral-400 mt-1">매칭 성사</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 다음 모임 (넷플연가 스타일) ===== */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">다음 모임</h2>
              <p className="text-sm text-neutral-500 mt-1">바닥 사람들과 직접 만나는 자리</p>
            </div>
            <Link href="/badak/meetups" className="hidden sm:flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-semibold">
              전체 보기 <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {UPCOMING_MEETUPS.map(m => (
              <Link key={m.id} href="/badak/meetups"
                className="group block rounded-xl border border-neutral-200 bg-white p-5 hover:border-amber-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{m.category}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.badge === '마감임박' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {m.badge}
                  </span>
                </div>
                <h3 className="font-bold text-neutral-900 group-hover:text-amber-600 transition-colors mb-3">{m.title}</h3>
                <div className="space-y-1.5 text-sm text-neutral-500">
                  <div className="flex items-center gap-2"><Calendar size={13} className="text-neutral-400" />{m.date} {m.time}</div>
                  <div className="flex items-center gap-2"><MapPin size={13} className="text-neutral-400" />{m.location}</div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">{m.price}</span>
                  <span className="text-xs text-neutral-400">잔여 {m.remaining}/{m.capacity}석</span>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/badak/meetups" className="sm:hidden flex items-center justify-center gap-1 mt-6 text-sm text-amber-600 font-semibold">
            전체 모임 보기 <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* ===== 이런 분을 찾고 있어요 (트레바리 AI 추천 스타일) ===== */}
      <section className="bg-neutral-50 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-amber-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">이런 분을 찾고 있어요</h2>
          </div>
          <p className="text-sm text-neutral-500 mb-8">카테고리별 현업인 미리보기 &mdash; 프로필을 만들면 AI가 맞춤 추천해드려요</p>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['전체', '마케팅', '광고', '브랜딩', '디지털', '스타트업'].map(cat => (
              <span key={cat}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${cat === '전체' ? 'bg-[#1a1a2e] text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-amber-300'}`}>
                {cat}
              </span>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RECOMMENDED_PROFILES.map(p => (
              <div key={p.id} className="group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:border-amber-300 transition-colors">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-white shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 text-sm">{p.name}</span>
                    <span className="text-[11px] text-neutral-400">{p.years}년차</span>
                  </div>
                  <div className="text-xs text-neutral-500 truncate">{p.role} @ {p.company}</div>
                  <span className="mt-1 inline-block text-[11px] rounded bg-amber-50 text-amber-700 px-1.5 py-0.5">{p.tag}</span>
                </div>
                <Link href="/badak/explore" className="shrink-0 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors">
                  커넥트
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/badak/explore" className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-semibold">
              더 많은 바닥 사람 보기 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Pain Point / Why Badak ===== */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-4">왜 Badak인가?</h2>
          <p className="text-center text-neutral-500 mb-10 max-w-xl mx-auto">
            회사 안에서 해결 안 되는 고민을 회사 밖에서 풀어야 하는 시대.<br />
            누구나 멘토가 될 수 있다 &mdash; 한 발 먼저 경험한 사람이 곧 멘토.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: <Handshake size={24} className="text-amber-500" />, title: '신뢰 기반 연결', desc: '익명이 아닌 실명. 블라인드가 아닌 바닥. 업계 사람끼리의 진짜 연결.' },
              { icon: <Users size={24} className="text-amber-500" />, title: '찾는 것 x 줄 수 있는 것', desc: '이력서가 아닌 지금의 니즈와 역량이 중심. 서로에게 필요한 사람을 찾는다.' },
              { icon: <MessageCircle size={24} className="text-amber-500" />, title: '만남에서 성장으로', desc: '"만나고 싶다" 한 마디로 시작. 도움이 됐다면 피드백. 신뢰가 쌓인다.' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-6 hover:border-amber-200 transition-colors">
                <div className="mb-3">{item.icon}</div>
                <h3 className="font-bold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 후기 ===== */}
      <section className="bg-[#1a1a2e] text-white py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-2 mb-8">
            <Quote size={18} className="text-amber-400" />
            <h2 className="text-2xl font-bold">바닥 후기</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5">
                <p className="text-sm text-neutral-200 leading-relaxed mb-4">&ldquo;{r.review}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{r.name}</div>
                    <div className="text-xs text-neutral-400">{r.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">3단계로 시작</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: '01', title: '프로필 만들기', desc: '직무, 경력, 찾는 것, 줄 수 있는 것을 입력하세요' },
              { step: '02', title: '바닥 탐색', desc: '필터로 원하는 사람을 찾고, 프로필을 확인하세요' },
              { step: '03', title: '만나고 싶다', desc: '간단한 메시지와 함께 연결 요청. 수락하면 대화 시작' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-lg font-bold text-[#1a1a2e]">{item.step}</div>
                <h3 className="font-bold text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 이바닥 스타 ===== */}
      {stars.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <h2 className="text-xl font-bold text-neutral-900">이바닥 스타</h2>
              </div>
              <Link href="/badak/stars" className="text-sm text-amber-600 hover:underline">전체 보기</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {stars.map(star => (
                <Link key={star.id} href={`/badak/stars/${star.slug}`}
                  className="group block rounded-xl border border-neutral-200 overflow-hidden hover:border-amber-300 transition-colors">
                  {star.coverImageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img src={star.coverImageUrl} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-2">{star.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 파트너 ===== */}
      <section className="bg-neutral-50 py-12 border-t border-neutral-100">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs text-neutral-400 text-center uppercase tracking-widest mb-6">Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {PARTNERS.map(p => (
              <div key={p.name} className="text-center">
                <div className="text-sm font-bold text-neutral-700">{p.name}</div>
                <div className="text-[11px] text-neutral-400">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="bg-[#1a1a2e] py-16">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">바닥을 깔 준비 됐나요?</h2>
          <p className="text-sm text-neutral-400 mb-6">2분이면 프로필 완성. 같은 바닥의 사람을 만나세요.</p>
          <Link href="/badak/join" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-3.5 text-sm font-bold text-[#1a1a2e] hover:bg-amber-400 transition-colors">
            지금 시작하기 <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
