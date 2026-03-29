'use client';

import { useState } from 'react';
import {
  Blocks, Search, Check, X, ToggleLeft, ToggleRight, Zap, BarChart3,
  Building2, ShoppingCart, Users, FileText, Shield, Brain, Mail, Calendar,
  Briefcase, TrendingUp, Package, Wallet, Clock, MessageSquare, Database,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Types ── */
type ModuleCategory = 'core' | 'hr' | 'finance' | 'marketing' | 'sales' | 'dev' | 'ai' | 'comm';

type WModule = {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  icon: keyof typeof ICON_MAP;
};

type DeptModules = {
  id: string;
  name: string;
  headcount: number;
  activeModules: string[];
};

/* ── Icon map ── */
const ICON_MAP = {
  Users, FileText, Shield, Brain, Mail, Calendar, Briefcase, TrendingUp,
  Package, Wallet, Clock, MessageSquare, Database, ShoppingCart, Building2, Blocks, Zap, BarChart3,
} as const;

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  core: '핵심', hr: '인사', finance: '재무', marketing: '마케팅', sales: '영업', dev: '개발', ai: 'AI', comm: '커뮤니케이션',
};
const CATEGORY_COLORS: Record<ModuleCategory, string> = {
  core: 'bg-violet-500/20 text-violet-400', hr: 'bg-blue-500/20 text-blue-400', finance: 'bg-emerald-500/20 text-emerald-400',
  marketing: 'bg-pink-500/20 text-pink-400', sales: 'bg-amber-500/20 text-amber-400', dev: 'bg-cyan-500/20 text-cyan-400',
  ai: 'bg-purple-500/20 text-purple-400', comm: 'bg-orange-500/20 text-orange-400',
};

/* ── Mock Modules ── */
const MODULES: WModule[] = [
  { id: 'mod-people', name: 'People', description: '인원 관리/조직도', category: 'core', icon: 'Users' },
  { id: 'mod-project', name: 'Project', description: '프로젝트 관리', category: 'core', icon: 'Briefcase' },
  { id: 'mod-talk', name: 'Talk', description: '사내 메신저', category: 'comm', icon: 'MessageSquare' },
  { id: 'mod-wiki', name: 'Wiki', description: '지식 관리', category: 'core', icon: 'FileText' },
  { id: 'mod-timesheet', name: 'Timesheet', description: '근태/시수 관리', category: 'hr', icon: 'Clock' },
  { id: 'mod-payroll', name: 'Payroll', description: '급여 관리', category: 'hr', icon: 'Wallet' },
  { id: 'mod-recruit', name: 'Recruit', description: '채용 관리', category: 'hr', icon: 'Users' },
  { id: 'mod-gpr', name: 'GPR', description: '성과/평가', category: 'hr', icon: 'TrendingUp' },
  { id: 'mod-finance', name: 'Finance', description: '회계/결산', category: 'finance', icon: 'Wallet' },
  { id: 'mod-budget', name: 'Budget', description: '예산 관리', category: 'finance', icon: 'BarChart3' },
  { id: 'mod-billing', name: 'Billing', description: '청구/정산', category: 'finance', icon: 'ShoppingCart' },
  { id: 'mod-campaign', name: 'Campaign', description: '캠페인 관리', category: 'marketing', icon: 'Zap' },
  { id: 'mod-content', name: 'Content', description: '콘텐츠 파이프라인', category: 'marketing', icon: 'FileText' },
  { id: 'mod-analytics', name: 'Analytics', description: '분석/리포트', category: 'marketing', icon: 'BarChart3' },
  { id: 'mod-email', name: 'Email', description: '이메일 마케팅', category: 'marketing', icon: 'Mail' },
  { id: 'mod-crm', name: 'CRM', description: '고객관계관리', category: 'sales', icon: 'Users' },
  { id: 'mod-deal', name: 'Deal', description: '딜/파이프라인', category: 'sales', icon: 'TrendingUp' },
  { id: 'mod-sales-report', name: 'Sales Report', description: '영업 리포트', category: 'sales', icon: 'BarChart3' },
  { id: 'mod-ci-cd', name: 'CI/CD', description: '배포 파이프라인', category: 'dev', icon: 'Package' },
  { id: 'mod-monitor', name: 'Monitor', description: '서버 모니터링', category: 'dev', icon: 'Database' },
  { id: 'mod-agent', name: 'AI Agent', description: 'AI 에이전트 허브', category: 'ai', icon: 'Brain' },
  { id: 'mod-crawler', name: 'Crawler', description: '데이터 크롤링', category: 'ai', icon: 'Database' },
  { id: 'mod-schedule', name: 'Schedule', description: '일정/캘린더', category: 'comm', icon: 'Calendar' },
  { id: 'mod-approval', name: 'Approval', description: '전자결재', category: 'core', icon: 'Shield' },
];

/* ── Mock Departments ── */
const INIT_DEPTS: DeptModules[] = [
  { id: 'dept-mgmt', name: '경영전략', headcount: 12, activeModules: ['mod-people', 'mod-project', 'mod-talk', 'mod-wiki', 'mod-finance', 'mod-budget', 'mod-approval', 'mod-schedule', 'mod-gpr'] },
  { id: 'dept-dev', name: '개발', headcount: 18, activeModules: ['mod-people', 'mod-project', 'mod-talk', 'mod-wiki', 'mod-ci-cd', 'mod-monitor', 'mod-agent', 'mod-timesheet', 'mod-schedule', 'mod-approval'] },
  { id: 'dept-mkt', name: '마케팅', headcount: 14, activeModules: ['mod-people', 'mod-project', 'mod-talk', 'mod-campaign', 'mod-content', 'mod-analytics', 'mod-email', 'mod-schedule', 'mod-approval', 'mod-crawler'] },
  { id: 'dept-sales', name: '영업', headcount: 10, activeModules: ['mod-people', 'mod-talk', 'mod-crm', 'mod-deal', 'mod-sales-report', 'mod-schedule', 'mod-approval', 'mod-billing'] },
  { id: 'dept-cs', name: 'CS', headcount: 8, activeModules: ['mod-people', 'mod-talk', 'mod-crm', 'mod-wiki', 'mod-schedule', 'mod-timesheet', 'mod-approval'] },
];

const PRESETS: Record<string, { label: string; modules: string[] }> = {
  marketing: { label: '마케팅 추천', modules: ['mod-people', 'mod-project', 'mod-talk', 'mod-campaign', 'mod-content', 'mod-analytics', 'mod-email', 'mod-schedule', 'mod-approval', 'mod-crawler'] },
  sales: { label: '영업 추천', modules: ['mod-people', 'mod-talk', 'mod-crm', 'mod-deal', 'mod-sales-report', 'mod-schedule', 'mod-approval', 'mod-billing'] },
  dev: { label: '개발 추천', modules: ['mod-people', 'mod-project', 'mod-talk', 'mod-wiki', 'mod-ci-cd', 'mod-monitor', 'mod-agent', 'mod-timesheet', 'mod-schedule', 'mod-approval'] },
};

export default function ModuleMgmtPage() {
  const { tenant, isDemo } = useWIO();
  // isDemo일 때 mock 데이터 사용, 아닐 때 Supabase fetch (TODO: DB 연동)
  const [depts, setDepts] = useState(INIT_DEPTS);
  const [selectedDeptId, setSelectedDeptId] = useState(INIT_DEPTS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ModuleCategory>('all');

  if (!tenant) return null;

  const selectedDept = depts.find(d => d.id === selectedDeptId)!;

  const toggleModule = (moduleId: string) => {
    setDepts(prev => prev.map(d => {
      if (d.id !== selectedDeptId) return d;
      const has = d.activeModules.includes(moduleId);
      return { ...d, activeModules: has ? d.activeModules.filter(m => m !== moduleId) : [...d.activeModules, moduleId] };
    }));
  };

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setDepts(prev => prev.map(d => d.id === selectedDeptId ? { ...d, activeModules: [...preset.modules] } : d));
  };

  const filteredModules = MODULES
    .filter(m => categoryFilter === 'all' || m.category === categoryFilter)
    .filter(m => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.includes(searchQuery));

  const totalModules = MODULES.length;
  const totalActive = new Set(depts.flatMap(d => d.activeModules)).size;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Blocks size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold">모듈 관리</h1>
          <span className="text-xs text-slate-500">SYS-MOD</span>
        </div>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {/* License Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: '전체 모듈', value: totalModules, color: 'text-violet-400' },
          { label: '활성 모듈', value: totalActive, color: 'text-emerald-400' },
          { label: '사용률', value: `${Math.round((totalActive / totalModules) * 100)}%`, color: 'text-indigo-400' },
          { label: '부서 수', value: depts.length, color: 'text-blue-400' },
        ].map((c, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-[10px] text-slate-500 mb-1">{c.label}</div>
            <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Department List */}
        <div className="col-span-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              부서 목록
            </div>
            {depts.map(d => (
              <div
                key={d.id}
                onClick={() => setSelectedDeptId(d.id)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-white/5
                  ${d.id === selectedDeptId ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'hover:bg-white/[0.04]'}`}
              >
                <div>
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="text-[10px] text-slate-500">{d.headcount}명</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-400">{d.activeModules.length}</div>
                  <div className="text-[10px] text-slate-600">모듈</div>
                </div>
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 mt-4">
            <div className="text-xs font-semibold text-slate-500 mb-2">프리셋 적용</div>
            <div className="space-y-1.5">
              {Object.entries(PRESETS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => applyPreset(k)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                >
                  <Zap size={12} className="text-amber-400" />
                  {v.label}
                  <span className="text-[10px] text-slate-600 ml-auto">{v.modules.length}개</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Module Grid */}
        <div className="col-span-9">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="모듈 검색..."
                className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as any)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:outline-none">
              <option value="all" className="bg-[#0F0F23]">전체 카테고리</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>)}
            </select>
            <div className="text-xs text-slate-500">
              <span className="font-bold text-white">{selectedDept.name}</span> 부서 — {selectedDept.activeModules.length}/{totalModules} 활성
            </div>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-3 gap-3">
            {filteredModules.map(mod => {
              const isActive = selectedDept.activeModules.includes(mod.id);
              const IconComp = ICON_MAP[mod.icon] || Blocks;
              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all ${isActive
                    ? 'border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                        <IconComp size={14} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{mod.name}</div>
                        <div className="text-[10px] text-slate-500">{mod.description}</div>
                      </div>
                    </div>
                    {isActive ? (
                      <ToggleRight size={20} className="text-indigo-400 shrink-0" />
                    ) : (
                      <ToggleLeft size={20} className="text-slate-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${CATEGORY_COLORS[mod.category]}`}>
                      {CATEGORY_LABELS[mod.category]}
                    </span>
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
