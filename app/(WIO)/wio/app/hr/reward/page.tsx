'use client';

import { useState, useEffect } from 'react';
import {
  Gift, Trophy, Star, Zap, Medal, ArrowUp, ArrowDown,
  CheckCircle2, Circle, TrendingUp, Award
} from 'lucide-react';
import { useWIO } from '../../layout';

const GRADE_BONUS: { grade: string; multiplier: number; color: string }[] = [
  { grade: 'S', multiplier: 2.0, color: 'text-violet-400 bg-violet-500/10' },
  { grade: 'A', multiplier: 1.5, color: 'text-blue-400 bg-blue-500/10' },
  { grade: 'B', multiplier: 1.0, color: 'text-emerald-400 bg-emerald-500/10' },
  { grade: 'C', multiplier: 0.5, color: 'text-amber-400 bg-amber-500/10' },
  { grade: 'D', multiplier: 0, color: 'text-red-400 bg-red-500/10' },
];

const MOCK_REWARD = {
  baseSalary: 50400000,
  performanceBonus: 5040000,
  incentive: 2000000,
  grade: 'A',
};

const MOCK_POINTS = {
  total: 3250,
  history: [
    { id: '1', date: '2026-03-25', type: 'earn', amount: 500, desc: 'Monthly MVP 선정', balance: 3250 },
    { id: '2', date: '2026-03-15', type: 'earn', amount: 200, desc: '코드리뷰 우수자', balance: 2750 },
    { id: '3', date: '2026-03-10', type: 'use', amount: -1000, desc: '복지포인트 사용 (도서)', balance: 2550 },
    { id: '4', date: '2026-03-01', type: 'earn', amount: 300, desc: 'Value Champion (협업)', balance: 3550 },
    { id: '5', date: '2026-02-25', type: 'earn', amount: 500, desc: 'Spot Award', balance: 3250 },
    { id: '6', date: '2026-02-15', type: 'use', amount: -500, desc: '복지포인트 사용 (카페)', balance: 2750 },
  ],
};

const MOCK_AWARDS = [
  { type: 'Spot Award', recipient: '박서준', date: '2026-03-20', reason: '긴급 장애 대응 및 복구', icon: Zap },
  { type: 'Monthly MVP', recipient: '김민수', date: '2026-03-01', reason: '3월 최고 성과자', icon: Trophy },
  { type: 'Value Champion', recipient: '이지은', date: '2026-02-28', reason: '핵심가치 "협업" 체현', icon: Star },
  { type: 'Spot Award', recipient: '최유나', date: '2026-02-15', reason: '고객사 온보딩 지원', icon: Zap },
];

const PROMOTION_CHECKLIST = [
  { id: '1', label: '현 직급 최소 체류기간 충족 (2년)', checked: true },
  { id: '2', label: '최근 2회 연속 B등급 이상', checked: true },
  { id: '3', label: '필수 교육 이수 완료', checked: true },
  { id: '4', label: '리더십 평가 통과', checked: false },
  { id: '5', label: '승진심사위원회 추천', checked: false },
];

function formatKRW(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n);
}

export default function RewardPage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<typeof MOCK_REWARD | null>(null);
  const [points, setPoints] = useState<typeof MOCK_POINTS | null>(null);
  const [awards, setAwards] = useState<typeof MOCK_AWARDS>([]);
  const [checklist, setChecklist] = useState<typeof PROMOTION_CHECKLIST>([]);

  useEffect(() => {
    if (!tenant) return;
    // TODO: Supabase 테이블 생성 후 연동 예정 (현재 Mock 폴백)
    setReward(MOCK_REWARD);
    setPoints(MOCK_POINTS);
    setAwards(MOCK_AWARDS);
    setChecklist(PROMOTION_CHECKLIST);
    setLoading(false);
  }, [tenant, isDemo]);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">보상관리</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalComp = reward ? reward.baseSalary + reward.performanceBonus + reward.incentive : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">보상관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-REW</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* My Compensation */}
        {reward && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Gift size={15} className="text-indigo-400" /> 내 보상 현황
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                <div className="text-[10px] text-slate-500 mb-1">기본급 (연)</div>
                <div className="text-lg font-bold">{formatKRW(reward.baseSalary)}원</div>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                <div className="text-[10px] text-slate-500 mb-1">성과보너스</div>
                <div className="text-lg font-bold text-emerald-400">{formatKRW(reward.performanceBonus)}원</div>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                <div className="text-[10px] text-slate-500 mb-1">인센티브</div>
                <div className="text-lg font-bold text-amber-400">{formatKRW(reward.incentive)}원</div>
              </div>
              <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-3">
                <div className="text-[10px] text-indigo-400 mb-1">총 보상</div>
                <div className="text-lg font-bold text-indigo-400">{formatKRW(totalComp)}원</div>
              </div>
            </div>
          </div>
        )}

        {/* Grade Bonus Table */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-amber-400" /> 등급별 보너스 배수
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {GRADE_BONUS.map(gb => (
              <div key={gb.grade} className={`rounded-lg border border-white/5 p-3 text-center ${reward?.grade === gb.grade ? 'ring-1 ring-indigo-500' : ''}`}>
                <div className={`text-lg font-bold px-2 py-0.5 rounded inline-block mb-1 ${gb.color}`}>{gb.grade}</div>
                <div className="text-sm font-semibold">{gb.multiplier}x</div>
              </div>
            ))}
          </div>
        </div>

        {/* Points */}
        {points && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Medal size={15} className="text-violet-400" /> 포인트
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">보유</span>
                <span className="text-lg font-bold text-violet-400">{formatKRW(points.total)} P</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {points.history.map(h => (
                <div key={h.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2">
                  {h.type === 'earn' ? (
                    <ArrowUp size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <ArrowDown size={14} className="text-red-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{h.desc}</div>
                    <div className="text-[10px] text-slate-600">{h.date}</div>
                  </div>
                  <span className={`text-sm font-bold ${h.type === 'earn' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {h.type === 'earn' ? '+' : ''}{formatKRW(h.amount)} P
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-amber-400" /> 시상 현황
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {awards.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-3 border border-white/5">
                  <Icon size={16} className="text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-amber-400">{a.type}</span>
                      <span className="text-xs text-slate-400">{a.recipient}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{a.reason}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0">{a.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promotion Checklist */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Award size={15} className="text-emerald-400" /> 승진 기준 체크리스트
          </h2>
          <div className="space-y-2">
            {checklist.map(c => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5">
                {c.checked ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <Circle size={16} className="text-slate-600 shrink-0" />
                )}
                <span className={`text-sm ${c.checked ? 'text-slate-300' : 'text-slate-500'}`}>{c.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-right">
            <span className="text-xs text-slate-500">{checklist.filter(c => c.checked).length}/{checklist.length} 충족</span>
          </div>
        </div>
      </div>
    </div>
  );
}
