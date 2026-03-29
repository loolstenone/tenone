'use client';

import { useState } from 'react';
import { Palette, Plus, ArrowRight, Clock, CheckCircle, Eye } from 'lucide-react';
import { useWIO } from '../../layout';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  requested: { label: '요청', color: 'text-blue-400 bg-blue-500/10' },
  in_progress: { label: '작업중', color: 'text-indigo-400 bg-indigo-500/10' },
  review: { label: '리뷰', color: 'text-amber-400 bg-amber-500/10' },
  revision: { label: '수정', color: 'text-orange-400 bg-orange-500/10' },
  approved: { label: '승인', color: 'text-emerald-400 bg-emerald-500/10' },
};

const MOCK_REQUESTS = [
  { id: 'DSG-001', title: 'MAD League 시즌3 포스터', type: '그래픽', requester: '마케팅팀', designer: '윤미래', status: 'in_progress', priority: 'high', requestDate: '2026-03-25', dueDate: '2026-04-01', revisions: 0 },
  { id: 'DSG-002', title: '텐원 기업 소개서 리뉴얼', type: '문서', requester: '영업팀', designer: '김디자인', status: 'review', priority: 'medium', requestDate: '2026-03-20', dueDate: '2026-03-28', revisions: 1 },
  { id: 'DSG-003', title: 'Orbi 대시보드 UI 개선', type: 'UI/UX', requester: '제품팀', designer: '윤미래', status: 'revision', priority: 'high', requestDate: '2026-03-22', dueDate: '2026-03-31', revisions: 2 },
  { id: 'DSG-004', title: '유튜브 썸네일 (3월 4주차)', type: '그래픽', requester: '콘텐츠팀', designer: '박디자인', status: 'approved', priority: 'low', requestDate: '2026-03-24', dueDate: '2026-03-27', revisions: 0 },
  { id: 'DSG-005', title: 'WIO 랜딩페이지 히어로', type: 'UI/UX', requester: '마케팅팀', designer: null, status: 'requested', priority: 'urgent', requestDate: '2026-03-28', dueDate: '2026-04-03', revisions: 0 },
];

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  urgent: { label: '긴급', color: 'text-red-400' },
  high: { label: '높음', color: 'text-orange-400' },
  medium: { label: '보통', color: 'text-amber-400' },
  low: { label: '낮음', color: 'text-slate-400' },
};

const PIPELINE_COLS = ['requested', 'in_progress', 'review', 'revision', 'approved'];

export default function DesignPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">디자인프로젝트</h1>
          <p className="text-xs text-slate-500 mt-0.5">DSG-PRJ &middot; 요청 &rarr; 리뷰 &rarr; 승인</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['pipeline', 'list'].map(v => (
              <button key={v} onClick={() => setView(v as any)}
                className={`text-[10px] px-2 py-1 rounded ${view === v ? 'bg-white/10 text-white' : 'text-slate-500'}`}>{v === 'pipeline' ? '파이프라인' : '목록'}</button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus size={15} /> 요청
          </button>
        </div>
      </div>

      {view === 'pipeline' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_COLS.map(col => {
            const st = STATUS_MAP[col];
            const items = MOCK_REQUESTS.filter(r => r.status === col);
            return (
              <div key={col} className="min-w-[200px] flex-1">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  <span className="text-[10px] text-slate-600">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(r => {
                    const pr = PRIORITY_MAP[r.priority];
                    return (
                      <div key={r.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-1 mb-1">
                          <span className={`text-[10px] font-bold ${pr.color}`}>{pr.label}</span>
                          <span className="text-[10px] text-slate-600 font-mono">{r.id}</span>
                        </div>
                        <p className="text-xs font-medium mb-1.5">{r.title}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{r.type}</span>
                          <span>{r.designer || '미배정'}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-600">
                          <span className="flex items-center gap-0.5"><Clock size={8} />{r.dueDate}</span>
                          {r.revisions > 0 && <span>수정 {r.revisions}회</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {MOCK_REQUESTS.map(r => {
            const st = STATUS_MAP[r.status];
            const pr = PRIORITY_MAP[r.priority];
            return (
              <div key={r.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600">{r.id}</span>
                    <span className="text-sm font-medium">{r.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{r.type} &middot; {r.requester} &middot; 담당: {r.designer || '미배정'} &middot; 마감 {r.dueDate}</div>
                </div>
                <span className={`text-[10px] font-bold ${pr.color}`}>{pr.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
