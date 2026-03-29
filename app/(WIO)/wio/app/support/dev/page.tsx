'use client';

import { useState } from 'react';
import { Code, Plus, Bug, Zap, CheckCircle2 } from 'lucide-react';
import { useWIO } from '../../layout';

type Column = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

const COLUMNS: { key: Column; label: string; color: string }[] = [
  { key: 'backlog', label: '백로그', color: 'border-slate-600' },
  { key: 'todo', label: '할 일', color: 'border-blue-600' },
  { key: 'in_progress', label: '진행중', color: 'border-indigo-600' },
  { key: 'review', label: '리뷰', color: 'border-amber-600' },
  { key: 'done', label: '완료', color: 'border-emerald-600' },
];

const TYPE_MAP: Record<string, { label: string; color: string; icon: any }> = {
  bug: { label: '버그', color: 'text-red-400 bg-red-500/10', icon: Bug },
  feature: { label: '기능', color: 'text-blue-400 bg-blue-500/10', icon: Zap },
  improvement: { label: '개선', color: 'text-violet-400 bg-violet-500/10', icon: CheckCircle2 },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  critical: { label: 'P0', color: 'text-red-400' },
  high: { label: 'P1', color: 'text-orange-400' },
  medium: { label: 'P2', color: 'text-amber-400' },
  low: { label: 'P3', color: 'text-slate-400' },
};

const MOCK_ISSUES = [
  { id: 'DEV-101', title: '결제 API 타임아웃 에러', type: 'bug', priority: 'critical', status: 'in_progress' as Column, assignee: '김지은', sprint: 'Sprint 24', storyPoints: 5 },
  { id: 'DEV-102', title: '대시보드 실시간 알림 기능', type: 'feature', priority: 'high', status: 'in_progress' as Column, assignee: '박상현', sprint: 'Sprint 24', storyPoints: 8 },
  { id: 'DEV-103', title: '검색 성능 최적화 (인덱싱)', type: 'improvement', priority: 'high', status: 'review' as Column, assignee: '이하은', sprint: 'Sprint 24', storyPoints: 5 },
  { id: 'DEV-104', title: '모바일 푸시 알림 미수신', type: 'bug', priority: 'critical', status: 'todo' as Column, assignee: '정현우', sprint: 'Sprint 24', storyPoints: 3 },
  { id: 'DEV-105', title: 'OAuth 소셜 로그인 (카카오)', type: 'feature', priority: 'medium', status: 'backlog' as Column, assignee: null, sprint: null, storyPoints: 8 },
  { id: 'DEV-106', title: '리포트 PDF 내보내기', type: 'feature', priority: 'medium', status: 'backlog' as Column, assignee: null, sprint: null, storyPoints: 5 },
  { id: 'DEV-107', title: 'CSV 임포트 인코딩 깨짐', type: 'bug', priority: 'medium', status: 'done' as Column, assignee: '김지은', sprint: 'Sprint 23', storyPoints: 3 },
  { id: 'DEV-108', title: 'API 응답 캐싱 레이어', type: 'improvement', priority: 'low', status: 'done' as Column, assignee: '박상현', sprint: 'Sprint 23', storyPoints: 5 },
];

const SPRINT = { name: 'Sprint 24', startDate: '2026-03-18', endDate: '2026-03-31', totalPoints: 21, completedPoints: 5 };

export default function DevPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">개발관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">DEV-TSK &middot; 이슈 트래커 &amp; 스프린트</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 이슈 생성
        </button>
      </div>

      {/* 스프린트 현황 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">{SPRINT.name}</h2>
          <span className="text-xs text-slate-500">{SPRINT.startDate} ~ {SPRINT.endDate}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/5">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(SPRINT.completedPoints / SPRINT.totalPoints) * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-indigo-300">{SPRINT.completedPoints}/{SPRINT.totalPoints} SP</span>
        </div>
      </div>

      {/* 칸반 보드 */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colIssues = MOCK_ISSUES.filter(i => i.status === col.key);
          return (
            <div key={col.key} className="min-w-[220px] flex-1">
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${col.color}`}>
                <span className="text-xs font-semibold">{col.label}</span>
                <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{colIssues.length}</span>
              </div>
              <div className="space-y-2">
                {colIssues.map(issue => {
                  const tp = TYPE_MAP[issue.type];
                  const pr = PRIORITY_MAP[issue.priority];
                  const Icon = tp.icon;
                  return (
                    <div key={issue.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon size={11} className={tp.color.split(' ')[0]} />
                        <span className="text-[10px] font-mono text-slate-600">{issue.id}</span>
                        <span className={`text-[10px] font-bold ${pr.color}`}>{pr.label}</span>
                      </div>
                      <p className="text-xs font-medium mb-2 leading-relaxed">{issue.title}</p>
                      <div className="flex items-center justify-between">
                        {issue.assignee ? (
                          <div className="flex items-center gap-1">
                            <div className="h-4 w-4 rounded-full bg-indigo-600/30 text-[8px] flex items-center justify-center font-bold">{issue.assignee.charAt(0)}</div>
                            <span className="text-[10px] text-slate-500">{issue.assignee}</span>
                          </div>
                        ) : <span className="text-[10px] text-slate-600">미배정</span>}
                        <span className="text-[10px] text-slate-500">{issue.storyPoints} SP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
