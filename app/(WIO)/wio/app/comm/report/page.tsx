'use client';

import { useState } from 'react';
import { BarChart3, Plus, FileText, TrendingUp, Users, Calendar, Download, Eye } from 'lucide-react';
import { useWIO } from '../../layout';

type ReportType = 'weekly' | 'monthly' | 'quarterly';
type ReportTarget = 'dept' | 'project';
type Report = {
  id: string; title: string; type: ReportType; target: ReportTarget; targetName: string;
  createdAt: string; author: string; status: 'draft' | 'published';
  kpis: { label: string; value: string; change: string; up: boolean }[];
};

const MOCK_REPORTS: Report[] = [
  {
    id: 'rpt1', title: '3월 주간 리포트 (4주차)', type: 'weekly', target: 'dept', targetName: '개발팀',
    createdAt: '2026-03-28', author: '박개발', status: 'published',
    kpis: [
      { label: '완료 태스크', value: '24건', change: '+15%', up: true },
      { label: '배포 횟수', value: '3회', change: '+50%', up: true },
      { label: '버그 리포트', value: '5건', change: '-20%', up: true },
      { label: '코드 리뷰', value: '18건', change: '+10%', up: true },
    ],
  },
  {
    id: 'rpt2', title: '3월 월간 마케팅 리포트', type: 'monthly', target: 'dept', targetName: '마케팅팀',
    createdAt: '2026-03-27', author: '이마케팅', status: 'published',
    kpis: [
      { label: 'CTR', value: '12.3%', change: '+2.1%', up: true },
      { label: '전환율', value: '4.5%', change: '+0.8%', up: true },
      { label: '캠페인 수', value: '8개', change: '0', up: true },
      { label: '리드 확보', value: '340건', change: '+25%', up: true },
    ],
  },
  {
    id: 'rpt3', title: '1분기 WIO 프로젝트 리포트', type: 'quarterly', target: 'project', targetName: 'WIO v2',
    createdAt: '2026-03-25', author: '김대표', status: 'draft',
    kpis: [
      { label: '달성률', value: '87%', change: '+12%', up: true },
      { label: '예산 소화', value: '72%', change: '-5%', up: true },
      { label: '인력 투입', value: '8명', change: '+2명', up: false },
      { label: '고객 피드백', value: '4.2/5', change: '+0.3', up: true },
    ],
  },
  {
    id: 'rpt4', title: '1분기 전사 경영 리포트', type: 'quarterly', target: 'dept', targetName: '전사',
    createdAt: '2026-03-20', author: '한재무', status: 'published',
    kpis: [
      { label: '매출', value: '2.4억', change: '+18%', up: true },
      { label: '영업이익', value: '4,200만', change: '+22%', up: true },
      { label: '신규 고객', value: '12사', change: '+50%', up: true },
      { label: '직원 만족도', value: '4.1/5', change: '+0.2', up: true },
    ],
  },
];

const TYPE_LABELS: Record<ReportType, string> = { weekly: '주간', monthly: '월간', quarterly: '분기' };
const TYPE_COLORS: Record<ReportType, string> = { weekly: 'text-emerald-400 bg-emerald-500/10', monthly: 'text-blue-400 bg-blue-500/10', quarterly: 'text-violet-400 bg-violet-500/10' };

export default function ReportPage() {
  const { tenant } = useWIO();
  const [reports] = useState(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ReportType>('weekly');
  const [newTarget, setNewTarget] = useState<ReportTarget>('dept');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';
  const detail = reports.find(r => r.id === selectedReport);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">리포트센터</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 리포트 생성
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="리포트 제목"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="flex gap-3">
            <select value={newType} onChange={e => setNewType(e.target.value as ReportType)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
              <option value="weekly" className="bg-[#0F0F23]">주간</option>
              <option value="monthly" className="bg-[#0F0F23]">월간</option>
              <option value="quarterly" className="bg-[#0F0F23]">분기</option>
            </select>
            <select value={newTarget} onChange={e => setNewTarget(e.target.value as ReportTarget)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
              <option value="dept" className="bg-[#0F0F23]">부서</option>
              <option value="project" className="bg-[#0F0F23]">프로젝트</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button disabled={!newTitle} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">생성</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map(r => (
          <button key={r.id} onClick={() => setSelectedReport(r.id === selectedReport ? null : r.id)}
            className={`w-full text-left rounded-xl border p-5 transition-colors ${selectedReport === r.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[r.type]}`}>{TYPE_LABELS[r.type]}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.status === 'published' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                  {r.status === 'published' ? '발행' : '초안'}
                </span>
              </div>
              <span className="text-[10px] text-slate-600">{r.createdAt.slice(5)}</span>
            </div>
            <h3 className="text-sm font-semibold mb-1">{r.title}</h3>
            <div className="text-xs text-slate-500 mb-3">{r.targetName} &middot; {r.author}</div>
            <div className="grid grid-cols-2 gap-2">
              {r.kpis.map((kpi, i) => (
                <div key={i} className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <div className="text-[10px] text-slate-500">{kpi.label}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{kpi.value}</span>
                    <span className={`text-[10px] ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>{kpi.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
