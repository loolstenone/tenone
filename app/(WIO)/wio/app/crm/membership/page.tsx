'use client';

import { useState } from 'react';
import { Crown, Users, Gift, ArrowUpRight, Settings, Star } from 'lucide-react';
import { useWIO } from '../../layout';

const TIERS = [
  { tier: 'VIP', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', members: 28, spend: '500만+', benefits: ['무료배송', '전용 CS', '10% 할인', '얼리액세스'], icon: '💎' },
  { tier: 'Gold', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', members: 145, spend: '200~500만', benefits: ['무료배송', '7% 할인', '포인트 2배'], icon: '🥇' },
  { tier: 'Silver', color: 'text-slate-300 bg-slate-500/10 border-slate-500/20', members: 482, spend: '50~200만', benefits: ['5% 할인', '포인트 1.5배'], icon: '🥈' },
  { tier: 'Basic', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', members: 1203, spend: '50만 미만', benefits: ['기본 적립'], icon: '🥉' },
];

const POINT_SUMMARY = {
  totalIssued: 12450000,
  totalUsed: 8320000,
  totalExpired: 890000,
  balance: 3240000,
};

const MOCK_MEMBERS = [
  { id: 'M01', name: '최서연', tier: 'VIP', points: 84200, totalSpend: 6200000, joinDate: '2024-06-15', lastPurchase: '2026-03-28' },
  { id: 'M02', name: '오지훈', tier: 'VIP', points: 72100, totalSpend: 8500000, joinDate: '2024-01-10', lastPurchase: '2026-03-27' },
  { id: 'M03', name: '김태현', tier: 'Gold', points: 45600, totalSpend: 4800000, joinDate: '2024-09-20', lastPurchase: '2026-03-26' },
  { id: 'M04', name: '이수진', tier: 'Gold', points: 38200, totalSpend: 3200000, joinDate: '2025-01-05', lastPurchase: '2026-03-25' },
  { id: 'M05', name: '윤미래', tier: 'Silver', points: 12800, totalSpend: 2800000, joinDate: '2025-03-18', lastPurchase: '2026-03-24' },
  { id: 'M06', name: '박지민', tier: 'Silver', points: 9500, totalSpend: 1500000, joinDate: '2025-06-22', lastPurchase: '2026-03-20' },
  { id: 'M07', name: '강민수', tier: 'Basic', points: 4200, totalSpend: 1100000, joinDate: '2025-08-10', lastPurchase: '2026-03-22' },
  { id: 'M08', name: '한동훈', tier: 'Basic', points: 1800, totalSpend: 250000, joinDate: '2026-01-15', lastPurchase: '2026-03-18' },
];

const CROSS_BENEFITS = [
  { brand: 'MAD League', benefit: 'Gold 이상 → 대회 참가비 20% 할인', active: true },
  { brand: 'Evolution School', benefit: 'Silver 이상 → 강좌 1회 무료 수강', active: true },
  { brand: 'Planner\'s', benefit: 'VIP → 프리미엄 플래너 무료 제공', active: false },
  { brand: 'Badak', benefit: 'Gold 이상 → 네트워킹 이벤트 우선 초대', active: true },
];

export default function MembershipPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tierFilter, setTierFilter] = useState('all');

  const filteredMembers = MOCK_MEMBERS.filter(m => tierFilter === 'all' || m.tier === tierFilter);
  const totalMembers = TIERS.reduce((a, t) => a + t.members, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">멤버십</h1>
        <p className="text-xs text-slate-500 mt-0.5">CRM-MBR &middot; 등급, 포인트, 크로스 혜택</p>
      </div>

      {/* 등급별 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {TIERS.map(t => (
          <div key={t.tier} className={`rounded-xl border bg-white/[0.02] p-4 ${t.color.split(' ')[2]}`}>
            <div className="flex items-center justify-between">
              <span className="text-lg">{t.icon}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.color}`}>{t.tier}</span>
            </div>
            <p className="text-2xl font-bold mt-2">{t.members.toLocaleString()}</p>
            <p className="text-xs text-slate-500">누적 {t.spend}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {t.benefits.slice(0, 2).map(b => (
                <span key={b} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">{b}</span>
              ))}
              {t.benefits.length > 2 && <span className="text-[9px] text-slate-600">+{t.benefits.length - 2}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 포인트 현황 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">포인트 현황</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500">총 발행</p>
            <p className="text-lg font-bold text-indigo-400">{(POINT_SUMMARY.totalIssued / 10000).toFixed(0)}만 P</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">총 사용</p>
            <p className="text-lg font-bold text-emerald-400">{(POINT_SUMMARY.totalUsed / 10000).toFixed(0)}만 P</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">만료</p>
            <p className="text-lg font-bold text-red-400">{(POINT_SUMMARY.totalExpired / 10000).toFixed(0)}만 P</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">잔액</p>
            <p className="text-lg font-bold text-amber-400">{(POINT_SUMMARY.balance / 10000).toFixed(0)}만 P</p>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden flex">
          <div className="h-full bg-emerald-500" style={{ width: `${(POINT_SUMMARY.totalUsed / POINT_SUMMARY.totalIssued) * 100}%` }} />
          <div className="h-full bg-red-500" style={{ width: `${(POINT_SUMMARY.totalExpired / POINT_SUMMARY.totalIssued) * 100}%` }} />
          <div className="h-full bg-amber-500" style={{ width: `${(POINT_SUMMARY.balance / POINT_SUMMARY.totalIssued) * 100}%` }} />
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">회원 ({totalMembers.toLocaleString()})</h2>
        <div className="flex gap-1">
          {['all', 'VIP', 'Gold', 'Silver', 'Basic'].map(f => (
            <button key={f} onClick={() => setTierFilter(f)}
              className={`text-[10px] px-2.5 py-1 rounded-full ${tierFilter === f ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-white/5'}`}>
              {f === 'all' ? '전체' : f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 mb-6">
        {filteredMembers.map(m => {
          const tier = TIERS.find(t => t.tier === m.tier)!;
          return (
            <div key={m.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600/20 text-sm font-bold text-indigo-300 shrink-0">{m.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tier.color}`}>{m.tier}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">가입 {m.joinDate} &middot; 최근 구매 {m.lastPurchase}</div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-indigo-300">{m.points.toLocaleString()} P</p>
                <p className="text-xs text-slate-500">누적 {(m.totalSpend / 10000).toFixed(0)}만원</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 크로스 혜택 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">크로스 브랜드 혜택</h2>
          <button className="text-xs text-indigo-400 hover:underline flex items-center gap-1"><Settings size={11} />설정</button>
        </div>
        <div className="space-y-2">
          {CROSS_BENEFITS.map((cb, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
              <Gift size={14} className={cb.active ? 'text-indigo-400' : 'text-slate-600'} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{cb.brand}</span>
                <p className="text-xs text-slate-500">{cb.benefit}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cb.active ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
                {cb.active ? '활성' : '비활성'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
