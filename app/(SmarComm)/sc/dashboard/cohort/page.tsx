'use client';

import { useState } from 'react';
import { Plus, Users, Download, Search, ChevronRight } from 'lucide-react';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';

interface Cohort {
  id: string;
  name: string;
  condition: string;
  count: number;
  type: 'DYNAMIC' | 'CUSTOM';
  updatedAt: string;
  createdAt: string;
}

const MOCK_COHORTS: Cohort[] = [
  { id: '1', name: '무료 진단만 완료', condition: 'scan_complete AND NOT signup', count: 3472, type: 'DYNAMIC', updatedAt: '2026.03.21', createdAt: '2026.03.01' },
  { id: '2', name: '가입 후 7일 이내 비활성', condition: 'signup_date >= 7d AND login < 2', count: 412, type: 'DYNAMIC', updatedAt: '2026.03.21', createdAt: '2026.03.05' },
  { id: '3', name: '리포트 3회 이상 열람', condition: 'report_view >= 3', count: 680, type: 'DYNAMIC', updatedAt: '2026.03.21', createdAt: '2026.03.08' },
  { id: '4', name: '유료 전환 고객', condition: 'plan != free', count: 149, type: 'DYNAMIC', updatedAt: '2026.03.21', createdAt: '2026.03.10' },
  { id: '5', name: '소상공인 업종', condition: 'industry IN (food, beauty, education)', count: 890, type: 'CUSTOM', updatedAt: '2026.03.21', createdAt: '2026.03.12' },
  { id: '6', name: '이탈 위험군', condition: 'last_login >= 14d AND plan != free', count: 23, type: 'DYNAMIC', updatedAt: '2026.03.21', createdAt: '2026.03.15' },
  { id: '7', name: '3월 가입 고객', condition: 'signup_month = 2026-03', count: 340, type: 'DYNAMIC', updatedAt: '2026.03.21', createdAt: '2026.03.01' },
  { id: '8', name: '경쟁사 비교 사용자', condition: 'compare_scan >= 1', count: 156, type: 'CUSTOM', updatedAt: '2026.03.21', createdAt: '2026.03.18' },
];

const RETENTION_DATA = [
  { week: 'W1 (3/1~3/7)', d0: 100, d1: 72, d3: 58, d7: 45, d14: 38, d30: 32 },
  { week: 'W2 (3/8~3/14)', d0: 100, d1: 68, d3: 55, d7: 42, d14: 35, d30: 28 },
  { week: 'W3 (3/15~3/21)', d0: 100, d1: 75, d3: 62, d7: 50, d14: 42, d30: null },
  { week: 'W4 (3/22~)', d0: 100, d1: 70, d3: 56, d7: null, d14: null, d30: null },
];

function heatColor(val: number | null): string {
  if (val === null) return '#F8F9FB';
  const c = getChartColors(7);
  if (val >= 60) return c[0];
  if (val >= 40) return c[1];
  if (val >= 30) return c[2];
  if (val >= 20) return c[3];
  return c[4];
}

export default function CohortPage() {
  const [filter, setFilter] = useState<'all' | 'DYNAMIC' | 'CUSTOM'>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = MOCK_COHORTS.filter(c => {
    const matchType = filter === 'all' || c.type === filter;
    const matchSearch = !search || c.name.includes(search) || c.condition.includes(search);
    return matchType && matchSearch;
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">코호트</h1>
          <p className="mt-1 text-xs text-text-muted">원하는 사용자 그룹을 설정하고, 데이터 분석과 메시지에 활용하세요</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> 코호트 생성하기
        </button>
      </div>

      {/* 생성 패널 */}
      {showCreate && (
        <div className="mb-6 rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 text-sm font-bold text-text">코호트 생성하기</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4 cursor-pointer hover:bg-surface">
              <div className="text-sm font-semibold text-text">직접 만들기</div>
              <p className="mt-1 text-xs text-text-muted">이벤트, 속성 조건을 조합하여 코호트를 만들 수 있습니다.</p>
            </div>
            <div className="rounded-xl border border-border p-4 cursor-pointer hover:bg-surface">
              <div className="text-sm font-semibold text-text">CSV 파일 업로드하기</div>
              <p className="mt-1 text-xs text-text-muted">사용자 목록 파일을 업로드하여 코호트를 만들 수 있습니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 리텐션 히트맵 */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">리텐션 히트맵</h2>
          <span className="text-xs text-text-muted">가입 후 재방문율 (%)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-text-muted">
              <th className="px-2 py-2 text-left font-medium w-36">코호트</th>
              <th className="px-2 py-2 text-center font-medium">D0</th>
              <th className="px-2 py-2 text-center font-medium">D1</th>
              <th className="px-2 py-2 text-center font-medium">D3</th>
              <th className="px-2 py-2 text-center font-medium">D7</th>
              <th className="px-2 py-2 text-center font-medium">D14</th>
              <th className="px-2 py-2 text-center font-medium">D30</th>
            </tr></thead>
            <tbody>
              {RETENTION_DATA.map((row, i) => (
                <tr key={i}>
                  <td className="px-2 py-1.5 text-xs font-medium text-text">{row.week}</td>
                  {[row.d0, row.d1, row.d3, row.d7, row.d14, row.d30].map((val, j) => (
                    <td key={j} className="px-1 py-1.5">
                      <div className="mx-auto flex h-8 w-14 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ background: heatColor(val), opacity: val === null ? 0.3 : 1 }}>
                        {val !== null ? `${val}%` : '-'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 필터 + 검색 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="코호트 검색"
            className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
        </div>
        <div className="flex gap-1">
          {(['all', 'DYNAMIC', 'CUSTOM'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filter === f ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
              {f === 'all' ? '전체' : f === 'DYNAMIC' ? 'Dynamic' : 'Custom'}
            </button>
          ))}
        </div>
        <span className="text-xs text-text-muted">총 {filtered.length}개</span>
      </div>

      {/* 코호트 목록 */}
      <div className="rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-xs text-text-muted">
            <th className="px-5 py-3 text-left font-medium">코호트 키</th>
            <th className="px-5 py-3 text-left font-medium">유형</th>
            <th className="px-5 py-3 text-left font-medium">이름</th>
            <th className="px-5 py-3 text-right font-medium">사용자 수</th>
            <th className="px-5 py-3 text-right font-medium">최근 업데이트</th>
            <th className="px-5 py-3 text-right font-medium">생성일</th>
          </tr></thead>
          <tbody>
            {filtered.map((cohort, i) => (
              <tr key={cohort.id} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer">
                <td className="px-5 py-3 text-text-muted">{parseInt(cohort.id) + 25}</td>
                <td className="px-5 py-3"><span className="rounded bg-surface px-2 py-0.5 text-[10px] font-bold text-text-sub">{cohort.type}</span></td>
                <td className="px-5 py-3 font-medium text-point">{cohort.name}</td>
                <td className="px-5 py-3 text-right font-medium text-text">{cohort.count.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-text-muted">{cohort.updatedAt}</td>
                <td className="px-5 py-3 text-right text-text-muted">{cohort.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NextStepCTA stage="진단 → 실행" title="이 세그먼트에 타겟 메시지 발송" description="코호트 그룹을 대상으로 푸시, 이메일, 카카오 메시지를 발송하세요" actionLabel="메시지 발송" href="/sc/dashboard/crm/push" />
    </div>
  );
}
