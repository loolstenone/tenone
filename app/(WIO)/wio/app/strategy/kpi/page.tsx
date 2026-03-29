'use client';

import { useState } from 'react';
import {
  Target, ChevronRight, ChevronDown, TrendingUp, TrendingDown, Users, Star,
  DollarSign, BarChart3, UserMinus, FolderCheck,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Types ── */
type KPINode = {
  id: string;
  title: string;
  target: string;
  current: string;
  progress: number;
  owner: string;
  children?: KPINode[];
};

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

/* ── Mock: Cascade tree ── */
const KPI_TREE: KPINode[] = [
  {
    id: 'c1', title: '매출 100억 달성', target: '100억', current: '28.5억', progress: 29, owner: '대표이사',
    children: [
      { id: 'c1-1', title: 'WIO SaaS 매출 50억', target: '50억', current: '12억', progress: 24, owner: '사업본부장',
        children: [
          { id: 'c1-1-1', title: 'Enterprise 고객 10건', target: '10건', current: '2건', progress: 20, owner: '영업1팀' },
          { id: 'c1-1-2', title: 'Starter/Pro 고객 200건', target: '200건', current: '47건', progress: 24, owner: '영업2팀' },
          { id: 'c1-1-3', title: 'ARR 40억 확보', target: '40억', current: '9.5억', progress: 24, owner: '김태호' },
        ],
      },
      { id: 'c1-2', title: '프로젝트 수주 30억', target: '30억', current: '8.5억', progress: 28, owner: '프로젝트본부장',
        children: [
          { id: 'c1-2-1', title: '대기업 SI 프로젝트 5건', target: '5건', current: '1건', progress: 20, owner: '프로젝트팀' },
          { id: 'c1-2-2', title: '정부과제 수주 2건', target: '2건', current: '1건', progress: 50, owner: '박지은' },
        ],
      },
      { id: 'c1-3', title: '브랜드 사업 매출 20억', target: '20억', current: '8억', progress: 40, owner: 'MAD사업부장',
        children: [
          { id: 'c1-3-1', title: 'MADLeague 멤버십 수익', target: '5억', current: '2.3억', progress: 46, owner: 'MAD팀' },
          { id: 'c1-3-2', title: 'SmarComm 솔루션 매출', target: '10억', current: '3.5억', progress: 35, owner: '마케팅팀' },
          { id: 'c1-3-3', title: '콘텐츠 수익 (Mindle 등)', target: '5억', current: '2.2억', progress: 44, owner: '콘텐츠팀' },
        ],
      },
    ],
  },
  {
    id: 'c2', title: '고객 만족도 NPS 70+', target: 'NPS 70', current: 'NPS 62', progress: 89, owner: 'CX본부장',
    children: [
      { id: 'c2-1', title: '고객 응답시간 2시간 이내', target: '2시간', current: '3.2시간', progress: 63, owner: 'CS팀' },
      { id: 'c2-2', title: '기능 요청 반영률 60%', target: '60%', current: '45%', progress: 75, owner: '개발팀' },
    ],
  },
  {
    id: 'c3', title: '핵심인재 확보 & 이직률 10% 미만', target: '이직률 <10%', current: '8.5%', progress: 85, owner: 'HR본부장',
    children: [
      { id: 'c3-1', title: '개발자 15명 채용', target: '15명', current: '6명', progress: 40, owner: 'HR팀' },
      { id: 'c3-2', title: '직원 만족도 4.0/5.0', target: '4.0', current: '3.8', progress: 95, owner: '조직문화팀' },
      { id: 'c3-3', title: '핵심인재 리텐션 95%', target: '95%', current: '92%', progress: 97, owner: '이수민' },
    ],
  },
];

/* ── Dashboard KPIs ── */
const DASHBOARD_KPIS = [
  { label: '매출', value: '28.5억', target: '100억', progress: 29, icon: DollarSign, trend: 'up' as const, delta: '+12%' },
  { label: '영업이익', value: '4.2억', target: '15억', progress: 28, icon: TrendingUp, trend: 'up' as const, delta: '+8%' },
  { label: '유료 고객수', value: '49', target: '210', progress: 23, icon: Users, trend: 'up' as const, delta: '+15' },
  { label: 'NPS', value: '62', target: '70', progress: 89, icon: Star, trend: 'up' as const, delta: '+3' },
  { label: '이직률', value: '8.5%', target: '<10%', progress: 85, icon: UserMinus, trend: 'down' as const, delta: '-1.2%' },
  { label: '프로젝트 완료율', value: '78%', target: '90%', progress: 87, icon: FolderCheck, trend: 'up' as const, delta: '+5%' },
];

/* ── Quarter review status ── */
const QUARTER_STATUS: Record<Quarter, { status: string; color: string; summary: string }> = {
  Q1: { status: '완료', color: 'text-emerald-400 bg-emerald-500/10', summary: '매출 28.5억 달성 (목표 25억). 핵심 고객 2건 수주.' },
  Q2: { status: '진행중', color: 'text-blue-400 bg-blue-500/10', summary: 'WIO 정식 런칭 예정. Enterprise 영업 집중.' },
  Q3: { status: '예정', color: 'text-slate-400 bg-slate-500/10', summary: 'AI 에이전트 코어 출시. MADLeague 확장.' },
  Q4: { status: '예정', color: 'text-slate-400 bg-slate-500/10', summary: '연간 목표 달성 총력. 차년도 계획 수립.' },
};

/* ── Tree node component ── */
function TreeNode({ node, depth = 0 }: { node: KPINode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const barColor = node.progress >= 80 ? 'bg-emerald-500' : node.progress >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div>
      <div className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.02] cursor-pointer`}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
        onClick={() => hasChildren && setOpen(!open)}>
        {hasChildren ? (
          open ? <ChevronDown size={14} className="text-slate-500 shrink-0" /> : <ChevronRight size={14} className="text-slate-500 shrink-0" />
        ) : (
          <div className="w-3.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{node.title}</span>
            <span className="text-[10px] text-slate-500 shrink-0">{node.owner}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 max-w-[200px]">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(node.progress, 100)}%` }} />
            </div>
            <span className="text-xs text-slate-400 shrink-0">{node.current} / {node.target} ({node.progress}%)</span>
          </div>
        </div>
      </div>
      {open && hasChildren && (
        <div>
          {node.children!.map(child => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function KPIPage() {
  const { isDemo } = useWIO();
  const [quarter, setQuarter] = useState<Quarter>('Q1');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">전사 목표 관리</h1>
        <p className="text-xs text-slate-500 mt-0.5">STR-KPI · 2026년 목표 캐스케이드</p>
      </div>

      {/* Dashboard KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {DASHBOARD_KPIS.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-slate-500" />
                  <span className="text-xs text-slate-400">{kpi.label}</span>
                </div>
                <span className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.trend === 'up' ? <TrendingUp size={12} className="inline mr-0.5" /> : <TrendingDown size={12} className="inline mr-0.5" />}
                  {kpi.delta}
                </span>
              </div>
              <div className="text-xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${kpi.progress >= 80 ? 'bg-emerald-500' : kpi.progress >= 50 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(kpi.progress, 100)}%` }} />
                </div>
                <span className="text-[10px] text-slate-500">목표 {kpi.target}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quarter tabs */}
      <div>
        <div className="flex gap-2 mb-3">
          {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map(q => (
            <button key={q} onClick={() => setQuarter(q)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${quarter === q ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}>
              {q}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${QUARTER_STATUS[q].color}`}>{QUARTER_STATUS[q].status}</span>
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-sm text-slate-300">{QUARTER_STATUS[quarter].summary}</p>
        </div>
      </div>

      {/* Cascade tree */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Target size={16} className="text-indigo-400" />목표 캐스케이드 (전사 → 본부 → 팀 → 개인)</h2>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
          {KPI_TREE.map(node => <TreeNode key={node.id} node={node} />)}
        </div>
      </div>
    </div>
  );
}
