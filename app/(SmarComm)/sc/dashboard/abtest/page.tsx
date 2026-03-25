'use client';

import { useState } from 'react';
import { Plus, CheckCircle2, BarChart3, Search, ChevronRight } from 'lucide-react';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

interface ABTest {
  id: string;
  key: number;
  name: string;
  type: 'creative' | 'landing' | 'cta' | 'email' | 'push';
  status: 'running' | 'completed' | 'draft';
  variantA: { name: string; conversions: number; visitors: number };
  variantB: { name: string; conversions: number; visitors: number };
  startDate: string;
  confidence: number;
  tag?: string;
}

const MOCK_TESTS: ABTest[] = [
  { id: '1', key: 8, name: '봄 프로모션 카피 테스트', type: 'creative', status: 'running', variantA: { name: '혜택 강조', conversions: 124, visitors: 1850 }, variantB: { name: '긴급성 강조', conversions: 156, visitors: 1820 }, startDate: '2026.03.10', confidence: 92 },
  { id: '2', key: 7, name: '랜딩 페이지 CTA 버튼', type: 'cta', status: 'completed', variantA: { name: '무료 진단 시작', conversions: 340, visitors: 2400 }, variantB: { name: '30초 무료 점검', conversions: 412, visitors: 2380 }, startDate: '2026.02.20', confidence: 98, tag: 'Product' },
  { id: '3', key: 6, name: '이메일 제목 테스트', type: 'email', status: 'draft', variantA: { name: '점수가 변했습니다', conversions: 0, visitors: 0 }, variantB: { name: '경쟁사가 앞서고 있습니다', conversions: 0, visitors: 0 }, startDate: '', confidence: 0 },
  { id: '4', key: 5, name: '푸시 메시지 A/B', type: 'push', status: 'running', variantA: { name: '재방문 유도', conversions: 89, visitors: 680 }, variantB: { name: '할인 쿠폰', conversions: 112, visitors: 690 }, startDate: '2026.03.15', confidence: 78 },
  { id: '5', key: 4, name: '리포트 잠금 구간 테스트', type: 'landing', status: 'completed', variantA: { name: '3개 공개', conversions: 280, visitors: 1900 }, variantB: { name: '5개 공개', conversions: 310, visitors: 1880 }, startDate: '2026.02.10', confidence: 95, tag: 'Product' },
];

const TYPE_LABEL: Record<string, string> = { creative: '소재', landing: '랜딩', cta: 'CTA', email: '이메일', push: '푸시' };
const _pc = getChartColors(7);
const STATUS_MAP: Record<string, { label: string; color: string }> = { running: { label: '진행 중', color: _pc[0] }, completed: { label: '완료', color: _pc[2] }, draft: { label: '준비', color: _pc[3] } };

export default function ABTestPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  const filtered = MOCK_TESTS.filter(t => {
    const matchSearch = !search || t.name.includes(search);
    const matchStatus = statusFilter === '전체' || STATUS_MAP[t.status]?.label === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">A/B 테스트</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">실험을 통해 데이터 기반의 의사결정을 해보세요</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> A/B 테스트 생성하기
        </button>
      </div>

      {/* 가이드 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { title: '실험 전 반드시 확인해야 할 가이드', desc: '정확한 실험 준비를 위한 원페이저 템플릿' },
          { title: '랜딩 페이지 A/B 테스트를?', desc: '노코드로 간단하게 시작하는 URL 테스트 가이드' },
          { title: '다음 A/B 테스트 뭐하지?', desc: '성공 지표 50% 개선한 사례 확인하기' },
        ].map((card, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-4 cursor-pointer hover:bg-surface">
            <div className="text-sm font-semibold text-text">{card.title}</div>
            <p className="mt-0.5 text-xs text-text-muted">{card.desc}</p>
            <span className="mt-2 inline-block text-xs font-medium text-point">자세히 보기</span>
          </div>
        ))}
      </div>

      {/* 필터 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="검색"
            className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
        </div>
        <div className="flex gap-1">
          {['전체', '진행 중', '완료', '준비'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusFilter === s ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>{s}</button>
          ))}
        </div>
        <span className="text-xs text-text-muted">총 {filtered.length}개</span>
      </div>

      {/* 테이블 */}
      <div className="rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-xs text-text-muted">
            <th className="px-5 py-3 text-left font-medium">실험 키</th>
            <th className="px-5 py-3 text-left font-medium">유형</th>
            <th className="px-5 py-3 text-left font-medium">이름</th>
            <th className="px-5 py-3 text-left font-medium">태그</th>
            <th className="px-5 py-3 text-center font-medium">상태</th>
            <th className="px-5 py-3 text-right font-medium">생성일</th>
          </tr></thead>
          <tbody>
            {filtered.map(test => {
              const status = STATUS_MAP[test.status];
              const rateA = test.variantA.visitors > 0 ? (test.variantA.conversions / test.variantA.visitors * 100).toFixed(1) : '-';
              const rateB = test.variantB.visitors > 0 ? (test.variantB.conversions / test.variantB.visitors * 100).toFixed(1) : '-';
              const winner = test.status === 'completed' ? (test.variantB.conversions > test.variantA.conversions ? 'B' : 'A') : null;
              return (
                <tr key={test.id} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer">
                  <td className="px-5 py-3 text-text-muted">{test.key}</td>
                  <td className="px-5 py-3"><span className="rounded bg-surface px-2 py-0.5 text-[10px] font-medium text-text-sub">{TYPE_LABEL[test.type]}</span></td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-point">{winner && '⭐ '}{test.name}</div>
                    {test.status !== 'draft' && (
                      <div className="mt-0.5 text-xs text-text-muted">A: {rateA}% vs B: {rateB}% {test.confidence > 0 && `· 신뢰도 ${test.confidence}%`}</div>
                    )}
                  </td>
                  <td className="px-5 py-3">{test.tag && <span className="rounded bg-surface px-2 py-0.5 text-[10px] text-text-sub">{test.tag}</span>}</td>
                  <td className="px-5 py-3 text-center"><span className="flex items-center justify-center gap-1 text-xs" style={{ color: status.color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />{status.label}
                  </span></td>
                  <td className="px-5 py-3 text-right text-text-muted">{test.startDate || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
