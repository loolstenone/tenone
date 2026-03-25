'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Handshake, Building2, Star } from 'lucide-react';
import { fetchStars, fetchBadakStats } from '@/lib/supabase/badak';
import type { BadakStar } from '@/types/badak';

export default function BadakHome() {
  const [stars, setStars] = useState<BadakStar[]>([]);
  const [stats, setStats] = useState({ profileCount: 0, connectionCount: 0, industryCount: 0 });

  useEffect(() => {
    fetchStars({ limit: 3 }).then(({ stars }) => setStars(stars));
    fetchBadakStats().then(setStats);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1a1a2e] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
          <p className="text-sm tracking-widest text-blue-300 uppercase mb-4">Trust-Based Professional Network</p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            이바닥에<br />주름은 내가 잡는다
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-8">
            같은 바닥에서 고민을 풀고, 성장하고, 같이 일한다.<br className="hidden md:block" />
            업계 사람들의 신뢰 기반 인맥 네트워크.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/bk/join" className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
              바닥 프로필 만들기 <ArrowRight size={16} />
            </Link>
            <Link href="/bk/explore" className="flex items-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              바닥 탐색하기
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Point */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-4">왜 Badak인가?</h2>
          <p className="text-center text-neutral-500 mb-10 max-w-xl mx-auto">
            회사 안에서 해결 안 되는 고민을 회사 밖에서 풀어야 하는 시대.<br />
            누구나 멘토가 될 수 있다 — 한 발 먼저 경험한 사람이 곧 멘토.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { emoji: '🤝', title: '신뢰 기반 연결', desc: '익명이 아닌 실명. 블라인드가 아닌 바닥. 업계 사람끼리의 진짜 연결.' },
              { emoji: '🎯', title: '찾는 것 × 줄 수 있는 것', desc: '이력서가 아닌 지금의 니즈와 역량이 중심. 서로에게 필요한 사람을 찾는다.' },
              { emoji: '🚀', title: '만남에서 성장으로', desc: '"만나고 싶다" 한 마디로 시작. 도움이 됐다면 피드백. 신뢰가 쌓인다.' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-6 hover:border-blue-200 transition-colors">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
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
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">{item.step}</div>
                <h3 className="font-bold text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 소셜 프루프 */}
      {(stats.profileCount > 0 || stats.connectionCount > 0) && (
        <section className="bg-[#1a1a2e] text-white py-12">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-black"><Users size={24} className="text-blue-400" />{stats.profileCount}</div>
                <p className="text-sm text-neutral-400 mt-1">바닥 프로필</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-black"><Handshake size={24} className="text-emerald-400" />{stats.connectionCount}</div>
                <p className="text-sm text-neutral-400 mt-1">연결</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-black"><Building2 size={24} className="text-amber-400" />{stats.industryCount}</div>
                <p className="text-sm text-neutral-400 mt-1">산업 분야</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 이바닥 스타 */}
      {stars.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <h2 className="text-xl font-bold text-neutral-900">이바닥 스타</h2>
              </div>
              <Link href="/bk/stars" className="text-sm text-blue-600 hover:underline">전체 보기</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {stars.map(star => (
                <Link key={star.id} href={`/bk/stars/${star.slug}`}
                  className="group block rounded-xl border border-neutral-200 overflow-hidden hover:border-blue-300 transition-colors">
                  {star.coverImageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img src={star.coverImageUrl} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-2">{star.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">바닥을 깔 준비 됐나요?</h2>
          <p className="text-sm text-neutral-500 mb-6">2분이면 프로필 완성. 같은 바닥의 사람을 만나세요.</p>
          <Link href="/bk/join" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
            지금 시작하기 <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
