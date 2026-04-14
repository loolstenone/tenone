'use client';

import { useState, useRef } from 'react';
import {
  Search, Users, TrendingUp, Sparkles, Crown,
  Calendar, MapPin, ChevronRight, Flame, ArrowRight,
  BarChart3, UserPlus, Target,
} from 'lucide-react';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';
import type { CloudWord } from '@/types/badak';
import { NeedDetailSheet } from '@/features/badak/cloud/NeedDetailSheet';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';
import Link from 'next/link';

// ── 사용자 프로필 (Mock — 로그인 시 DB에서 조회) ──
const USER_PROFILE = {
  industry: '광고/에이전시',
  jobFunction: '퍼포먼스 마케팅',
  interests: ['네트워킹', '업무 스킬 향상', '이직 준비'],
};

// 니즈 카테고리 분류
type NeedCategory = 'all' | 'withGroup' | 'waiting' | 'hot';

export default function ExplorePage() {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedWord, setSelectedWord] = useState<CloudWord | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<NeedCategory>('all');

  // 통계
  const totalNeeds = CLOUD_WORDS.length;
  const withGroup = CLOUD_WORDS.filter((w) => w.hasGroup).length;
  const totalMembers = CLOUD_WORDS.reduce((sum, w) => sum + w.members, 0);
  const waiting = CLOUD_WORDS.filter((w) => !w.hasGroup && w.members >= 15).length;

  // 필터링
  const filtered = CLOUD_WORDS
    .filter((w) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        return w.text.toLowerCase().includes(q) || w.group?.title.toLowerCase().includes(q);
      }
      return true;
    })
    .filter((w) => {
      if (category === 'withGroup') return w.hasGroup;
      if (category === 'waiting') return !w.hasGroup;
      if (category === 'hot') return w.members >= 10;
      return true;
    })
    .sort((a, b) => b.members - a.members);

  // 추천: 사용자 관심사 매칭
  const recommended = CLOUD_WORDS.filter((w) => {
    const text = w.text.toLowerCase();
    const title = w.group?.title?.toLowerCase() || '';
    return (
      text.includes('마케팅') || text.includes('광고') || text.includes('퍼포먼스') ||
      text.includes('이직') || text.includes('네트워킹') ||
      title.includes('마케팅') || title.includes('광고')
    );
  }).sort((a, b) => b.members - a.members).slice(0, 8);

  // Hot 니즈: 관심 인원 높은 순
  const hotNeeds = [...CLOUD_WORDS].sort((a, b) => b.members - a.members).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      <div className="mx-auto max-w-2xl py-6">
        {/* 헤더 */}
        <div className="mb-5 px-4 sm:px-6">
          <div className="mb-1 flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">탐색</h1>
          </div>
          <p className="text-xs text-white/40">니즈와 원츠가 만나는 곳</p>
        </div>

        {/* 통계 카드 */}
        <div className="mb-6 flex gap-2 px-4 sm:px-6">
          {[
            { label: '전체 니즈', value: totalNeeds, icon: BarChart3, accent: '#ffd93d' },
            { label: '모임 개설', value: withGroup, icon: Users, accent: '#4ade80' },
            { label: '관심 대기', value: totalNeeds - withGroup, icon: UserPlus, accent: '#60a5fa' },
            { label: '총 관심', value: totalMembers, icon: TrendingUp, accent: '#f472b6' },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="flex flex-1 flex-col items-center rounded-xl border border-white/8 py-3"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Icon className="mb-1 h-4 w-4" style={{ color: accent }} />
              <div className="text-sm font-bold text-white">{value}</div>
              <div className="text-[9px] text-white/30">{label}</div>
            </div>
          ))}
        </div>

        {/* 검색 */}
        <div className="relative mb-5 px-4 sm:px-6">
          <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 sm:left-9" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="어떤 니즈를 찾고 있나요?"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/30"
          />
        </div>

        {/* 내 관심사 추천 (로그인 시) */}
        {isAuthenticated && recommended.length > 0 && !search && (
          <SlideSection
            title="내 관심사 추천"
            subtitle="산업군 · 직무 · 관심사 기반"
            icon={<Sparkles className="h-4 w-4 text-amber-400" />}
            words={recommended}
            onSelect={setSelectedWord}
          />
        )}

        {/* Hot 니즈 */}
        {!search && (
          <SlideSection
            title="Hot 니즈"
            subtitle="관심이 가장 많은 니즈"
            icon={<Flame className="h-4 w-4 text-orange-400" />}
            words={hotNeeds}
            onSelect={setSelectedWord}
          />
        )}

        {/* 전체 니즈 목록 */}
        <div className="px-4 sm:px-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              전체 니즈 <span className="ml-1 text-white/30">{filtered.length}</span>
            </h2>
          </div>

          {/* 카테고리 필터 */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {([
              { id: 'all' as const, label: '전체' },
              { id: 'withGroup' as const, label: '모임 개설됨' },
              { id: 'waiting' as const, label: '관심 대기' },
              { id: 'hot' as const, label: '10명+' },
            ]).map(({ id, label }) => (
              <button key={id} onClick={() => setCategory(id)}
                className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all"
                style={{
                  background: category === id ? 'rgba(255,217,61,0.12)' : 'rgba(255,255,255,0.05)',
                  color: category === id ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                  border: `1px solid ${category === id ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* 니즈 리스트 */}
          <div className="space-y-2">
            {filtered.map((w) => (
              <NeedCard key={w.text} word={w} onClick={() => setSelectedWord(w)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-white/15" />
              <p className="text-sm text-white/40">검색 결과가 없습니다</p>
            </div>
          )}
        </div>

        {/* 니즈 디테일 시트 */}
        <NeedDetailSheet word={selectedWord} onClose={() => setSelectedWord(null)} />
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </div>
    </div>
  );
}

// ── 슬라이드 섹션 ──
function SlideSection({ title, subtitle, icon, words, onSelect }: {
  title: string; subtitle: string; icon: React.ReactNode;
  words: CloudWord[]; onSelect: (w: CloudWord) => void;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-bold text-white">{title}</h2>
        </div>
        <p className="mt-0.5 text-[10px] text-white/25">{subtitle}</p>
      </div>
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-hide sm:px-6">
        {words.map((w) => (
          <NeedSlideCard key={w.text} word={w} onClick={() => onSelect(w)} />
        ))}
      </div>
    </div>
  );
}

// ── 슬라이드 카드 ──
function NeedSlideCard({ word: w, onClick }: { word: CloudWord; onClick: () => void }) {
  const progress = w.hasGroup
    ? Math.min(100, ((w.group?.currentMembers || 0) / (w.group?.maxMembers || 1)) * 100)
    : Math.min(100, (w.members / 15) * 100);

  return (
    <button onClick={onClick}
      className="w-[220px] shrink-0 rounded-xl border p-3.5 text-left transition-all hover:border-white/20 sm:w-[240px]"
      style={{
        background: w.hasGroup ? 'rgba(255,200,87,0.04)' : 'rgba(255,255,255,0.03)',
        borderColor: w.hasGroup ? 'rgba(255,200,87,0.15)' : 'rgba(255,255,255,0.08)',
      }}>
      {/* 상태 */}
      <div className="mb-2 flex items-center gap-1.5">
        {w.hasGroup ? (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
            모임 개설됨
          </span>
        ) : w.members >= 15 ? (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            바닥장 모집중
          </span>
        ) : (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
            관심 모집중
          </span>
        )}
        <span className="text-[10px] text-white/30">{w.members}명</span>
      </div>

      {/* 니즈 텍스트 */}
      <p className="mb-2.5 line-clamp-2 text-xs font-semibold leading-snug text-white/80">{w.text}</p>

      {/* 프로그레스 */}
      <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full" style={{
          width: `${progress}%`,
          background: w.hasGroup
            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
            : progress >= 100 ? 'linear-gradient(90deg, #ffd93d, #ff6b6b)' : 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
        }} />
      </div>

      {/* 하단 정보 */}
      {w.hasGroup && w.group ? (
        <div className="flex items-center gap-1 text-[10px] text-white/30">
          <Crown className="h-2.5 w-2.5 text-amber-400/50" />
          {w.group.leaderName} · {w.group.location}
        </div>
      ) : (
        <div className="text-[10px] text-white/25">
          {w.members >= 15 ? '15명 달성! 바닥장을 찾고 있어요' : `${15 - w.members}명 더 모이면 모임 개설 가능`}
        </div>
      )}
    </button>
  );
}

// ── 리스트 카드 ──
function NeedCard({ word: w, onClick }: { word: CloudWord; onClick: () => void }) {
  const g = w.group;

  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-white/15"
      style={{
        background: w.hasGroup ? 'rgba(255,200,87,0.03)' : 'rgba(255,255,255,0.02)',
        borderColor: w.hasGroup ? 'rgba(255,200,87,0.12)' : 'rgba(255,255,255,0.06)',
      }}>
      {/* 관심 인원 원형 */}
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full"
        style={{
          background: w.hasGroup ? 'rgba(255,217,61,0.1)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${w.hasGroup ? 'rgba(255,217,61,0.2)' : 'rgba(255,255,255,0.1)'}`,
        }}>
        <span className="text-sm font-bold" style={{ color: w.hasGroup ? '#ffd93d' : 'rgba(255,255,255,0.6)' }}>
          {w.members}
        </span>
        <span className="text-[7px] text-white/25">명</span>
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <p className="mb-0.5 truncate text-[13px] font-semibold text-white/80">{w.text}</p>
        <div className="flex items-center gap-2 text-[10px] text-white/30">
          {w.hasGroup && g ? (
            <>
              <span className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>모임</span>
              <span>{g.title}</span>
            </>
          ) : w.members >= 15 ? (
            <span style={{ color: '#fbbf24' }}>바닥장 모집중</span>
          ) : (
            <span>{15 - w.members}명 더 필요</span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-white/15" />
    </button>
  );
}
