'use client';

import { useState } from 'react';
import { Instagram, Youtube, Twitter, Linkedin, Calendar, Heart, MessageCircle, Share, Send, Plus } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_ACCOUNTS = [
  { id: 1, platform: 'Instagram', handle: '@tenone_official', icon: Instagram, color: 'text-pink-400', followers: 12400, posts: 234, engagementRate: 4.8, weeklyGrowth: '+2.3%' },
  { id: 2, platform: 'YouTube', handle: '@TenOneUniverse', icon: Youtube, color: 'text-red-400', followers: 5200, posts: 86, engagementRate: 6.2, weeklyGrowth: '+5.1%' },
  { id: 3, platform: 'X', handle: '@tenone_biz', icon: Twitter, color: 'text-sky-400', followers: 3100, posts: 512, engagementRate: 2.1, weeklyGrowth: '+0.8%' },
  { id: 4, platform: 'LinkedIn', handle: 'TenOne Inc.', icon: Linkedin, color: 'text-blue-400', followers: 1800, posts: 98, engagementRate: 3.5, weeklyGrowth: '+3.2%' },
];

const MOCK_CALENDAR = [
  { id: 1, date: '2026-03-29', platform: 'Instagram', content: '봄 캠페인 티저 이미지', status: 'scheduled', time: '10:00' },
  { id: 2, date: '2026-03-29', platform: 'YouTube', content: '브랜드 스토리 #12 업로드', status: 'draft', time: '14:00' },
  { id: 3, date: '2026-03-30', platform: 'X', content: '업계 트렌드 스레드', status: 'scheduled', time: '09:00' },
  { id: 4, date: '2026-03-30', platform: 'LinkedIn', content: '채용 소식 공유', status: 'scheduled', time: '11:00' },
  { id: 5, date: '2026-03-31', platform: 'Instagram', content: '릴스 - 제품 언박싱', status: 'draft', time: '18:00' },
  { id: 6, date: '2026-04-01', platform: 'YouTube', content: 'WIO 기능 소개 숏츠', status: 'idea', time: '' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  scheduled: { label: '예약됨', color: 'text-emerald-400 bg-emerald-500/10' },
  draft: { label: '초안', color: 'text-amber-400 bg-amber-500/10' },
  idea: { label: '아이디어', color: 'text-slate-400 bg-slate-500/10' },
  published: { label: '발행됨', color: 'text-blue-400 bg-blue-500/10' },
};

export default function SocialPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [view, setView] = useState<'accounts' | 'calendar'>('accounts');

  const accounts = isDemo ? MOCK_ACCOUNTS : MOCK_ACCOUNTS;
  const calendar = isDemo ? MOCK_CALENDAR : MOCK_CALENDAR;

  const totalFollowers = accounts.reduce((s, a) => s + a.followers, 0);
  const avgEngagement = (accounts.reduce((s, a) => s + a.engagementRate, 0) / accounts.length).toFixed(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">소셜미디어 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-SOC &middot; SNS 계정 통합 관리 및 콘텐츠 캘린더</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 콘텐츠 작성
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">전체 팔로워</div>
          <div className="text-lg font-bold">{totalFollowers.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">평균 참여율</div>
          <div className="text-lg font-bold">{avgEngagement}%</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">예약 콘텐츠</div>
          <div className="text-lg font-bold">{calendar.filter(c => c.status === 'scheduled').length}건</div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setView('accounts')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${view === 'accounts' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          계정 현황
        </button>
        <button onClick={() => setView('calendar')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${view === 'calendar' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <Calendar size={14} /> 콘텐츠 캘린더
        </button>
      </div>

      {view === 'accounts' ? (
        <div className="space-y-3">
          {accounts.map(a => (
            <div key={a.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-4">
                <a.icon size={24} className={a.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{a.platform}</span>
                    <span className="text-xs text-slate-500">{a.handle}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{a.posts}개 게시물</div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm font-bold">{a.followers.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">팔로워</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{a.engagementRate}%</div>
                    <div className="text-[10px] text-slate-500">참여율</div>
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${a.weeklyGrowth.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{a.weeklyGrowth}</div>
                    <div className="text-[10px] text-slate-500">주간성장</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {calendar.map(c => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.idea;
            return (
              <div key={c.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="text-xs text-slate-500 w-20">{c.date.slice(5)}{c.time ? ` ${c.time}` : ''}</div>
                <div className="text-[10px] font-medium w-16">{c.platform}</div>
                <div className="flex-1 text-sm">{c.content}</div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
