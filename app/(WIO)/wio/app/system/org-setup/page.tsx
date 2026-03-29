'use client';

import { useState } from 'react';
import {
  Building2, Plus, ChevronRight, ChevronDown, Users, Edit2, X, Search,
  UserCheck, History, BarChart3, FolderTree,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Types ── */
type OrgLevel = 'track' | 'division' | 'team' | 'part';
type OrgStatus = 'active' | 'inactive' | 'preparing';

type OrgNode = {
  id: string;
  name: string;
  code: string;
  level: OrgLevel;
  leader: string;
  headcount: number;
  capacity: number;
  status: OrgStatus;
  parentId: string | null;
  children: OrgNode[];
};

type PersonnelOrder = {
  id: string;
  date: string;
  type: string;
  target: string;
  from: string;
  to: string;
  note: string;
};

/* ── Mock Data ── */
const buildOrg = (): OrgNode[] => [
  {
    id: 'T1', name: '경영전략트랙', code: 'MGT', level: 'track', leader: '김대표', headcount: 12, capacity: 15, status: 'active', parentId: null,
    children: [
      { id: 'D1', name: '전략기획본부', code: 'MGT-SP', level: 'division', leader: '윤기획', headcount: 5, capacity: 6, status: 'active', parentId: 'T1', children: [
        { id: 'TM1', name: '사업기획팀', code: 'MGT-SP-BP', level: 'team', leader: '한기획', headcount: 3, capacity: 4, status: 'active', parentId: 'D1', children: [] },
      ]},
      { id: 'D2', name: '경영지원본부', code: 'MGT-MS', level: 'division', leader: '최인사', headcount: 7, capacity: 9, status: 'active', parentId: 'T1', children: [
        { id: 'TM2', name: '인사팀', code: 'MGT-MS-HR', level: 'team', leader: '최인사', headcount: 3, capacity: 4, status: 'active', parentId: 'D2', children: [] },
        { id: 'TM3', name: '재무팀', code: 'MGT-MS-FN', level: 'team', leader: '한재무', headcount: 4, capacity: 5, status: 'active', parentId: 'D2', children: [] },
      ]},
    ],
  },
  {
    id: 'T2', name: '개발트랙', code: 'DEV', level: 'track', leader: '박개발', headcount: 18, capacity: 22, status: 'active', parentId: null,
    children: [
      { id: 'D3', name: '프로덕트본부', code: 'DEV-PD', level: 'division', leader: '박개발', headcount: 10, capacity: 12, status: 'active', parentId: 'T2', children: [
        { id: 'TM4', name: '프론트엔드팀', code: 'DEV-PD-FE', level: 'team', leader: '이프론트', headcount: 4, capacity: 5, status: 'active', parentId: 'D3', children: [] },
        { id: 'TM5', name: '백엔드팀', code: 'DEV-PD-BE', level: 'team', leader: '정백엔드', headcount: 4, capacity: 5, status: 'active', parentId: 'D3', children: [] },
        { id: 'TM6', name: 'AI/ML팀', code: 'DEV-PD-AI', level: 'team', leader: '강AI', headcount: 2, capacity: 2, status: 'active', parentId: 'D3', children: [] },
      ]},
      { id: 'D4', name: '인프라본부', code: 'DEV-IF', level: 'division', leader: '송인프라', headcount: 8, capacity: 10, status: 'active', parentId: 'T2', children: [
        { id: 'TM7', name: 'DevOps팀', code: 'DEV-IF-DO', level: 'team', leader: '송인프라', headcount: 3, capacity: 4, status: 'active', parentId: 'D4', children: [] },
        { id: 'TM8', name: 'QA팀', code: 'DEV-IF-QA', level: 'team', leader: '임QA', headcount: 5, capacity: 6, status: 'active', parentId: 'D4', children: [] },
      ]},
    ],
  },
  {
    id: 'T3', name: '마케팅트랙', code: 'MKT', level: 'track', leader: '이마케팅', headcount: 14, capacity: 16, status: 'active', parentId: null,
    children: [
      { id: 'D5', name: '브랜드본부', code: 'MKT-BR', level: 'division', leader: '이마케팅', headcount: 8, capacity: 9, status: 'active', parentId: 'T3', children: [
        { id: 'TM9', name: '콘텐츠팀', code: 'MKT-BR-CT', level: 'team', leader: '나콘텐츠', headcount: 4, capacity: 5, status: 'active', parentId: 'D5', children: [] },
        { id: 'TM10', name: '디자인팀', code: 'MKT-BR-DS', level: 'team', leader: '정디자인', headcount: 4, capacity: 4, status: 'active', parentId: 'D5', children: [] },
      ]},
      { id: 'D6', name: '퍼포먼스본부', code: 'MKT-PF', level: 'division', leader: '고퍼포먼', headcount: 6, capacity: 7, status: 'active', parentId: 'T3', children: [
        { id: 'TM11', name: 'Growth팀', code: 'MKT-PF-GR', level: 'team', leader: '고퍼포먼', headcount: 6, capacity: 7, status: 'active', parentId: 'D6', children: [] },
      ]},
    ],
  },
  {
    id: 'T4', name: '영업트랙', code: 'SAL', level: 'track', leader: '장영업', headcount: 10, capacity: 12, status: 'active', parentId: null,
    children: [
      { id: 'D7', name: '국내영업본부', code: 'SAL-KR', level: 'division', leader: '장영업', headcount: 6, capacity: 7, status: 'active', parentId: 'T4', children: [
        { id: 'TM12', name: '엔터프라이즈팀', code: 'SAL-KR-EP', level: 'team', leader: '조엔터', headcount: 3, capacity: 4, status: 'active', parentId: 'D7', children: [] },
        { id: 'TM13', name: 'SMB팀', code: 'SAL-KR-SM', level: 'team', leader: '유SMB', headcount: 3, capacity: 3, status: 'active', parentId: 'D7', children: [] },
      ]},
      { id: 'D8', name: '해외영업본부', code: 'SAL-GL', level: 'division', leader: '오글로벌', headcount: 4, capacity: 5, status: 'active', parentId: 'T4', children: [] },
    ],
  },
  {
    id: 'T5', name: 'CS트랙', code: 'CST', level: 'track', leader: '문CS', headcount: 8, capacity: 10, status: 'active', parentId: null,
    children: [
      { id: 'D9', name: 'CS본부', code: 'CST-CS', level: 'division', leader: '문CS', headcount: 8, capacity: 10, status: 'active', parentId: 'T5', children: [
        { id: 'TM14', name: '기술지원팀', code: 'CST-CS-TS', level: 'team', leader: '배기술', headcount: 4, capacity: 5, status: 'active', parentId: 'D9', children: [] },
        { id: 'TM15', name: '고객성공팀', code: 'CST-CS-CX', level: 'team', leader: '서고객', headcount: 4, capacity: 5, status: 'active', parentId: 'D9', children: [] },
      ]},
    ],
  },
  {
    id: 'T6', name: '크리에이티브트랙', code: 'CRT', level: 'track', leader: '강크리', headcount: 6, capacity: 8, status: 'active', parentId: null,
    children: [
      { id: 'D10', name: '크리에이티브본부', code: 'CRT-CR', level: 'division', leader: '강크리', headcount: 6, capacity: 8, status: 'active', parentId: 'T6', children: [
        { id: 'TM16', name: 'UX/UI팀', code: 'CRT-CR-UX', level: 'team', leader: '민UX', headcount: 3, capacity: 4, status: 'active', parentId: 'D10', children: [] },
        { id: 'TM17', name: '영상팀', code: 'CRT-CR-VD', level: 'team', leader: '안영상', headcount: 3, capacity: 4, status: 'active', parentId: 'D10', children: [] },
      ]},
    ],
  },
  {
    id: 'T7', name: '신사업트랙', code: 'NEW', level: 'track', leader: '임신사업', headcount: 4, capacity: 6, status: 'preparing', parentId: null,
    children: [
      { id: 'D11', name: 'AI사업본부', code: 'NEW-AI', level: 'division', leader: '임신사업', headcount: 4, capacity: 6, status: 'preparing', parentId: 'T7', children: [] },
    ],
  },
];

const MOCK_ORDERS: PersonnelOrder[] = [
  { id: 'PO1', date: '2026-03-28', type: '승진', target: '이프론트', from: '시니어', to: '팀장', note: '프론트엔드팀장 발령' },
  { id: 'PO2', date: '2026-03-25', type: '전보', target: '나콘텐츠', from: 'Growth팀', to: '콘텐츠팀', note: '콘텐츠팀 리드 역할' },
  { id: 'PO3', date: '2026-03-20', type: '입사', target: '신입A', from: '-', to: 'QA팀', note: '신규 입사' },
  { id: 'PO4', date: '2026-03-18', type: '전보', target: '김개발B', from: '백엔드팀', to: 'AI/ML팀', note: 'AI 프로젝트 투입' },
  { id: 'PO5', date: '2026-03-15', type: '승진', target: '정백엔드', from: '시니어', to: '리드', note: '백엔드팀 리드 승진' },
  { id: 'PO6', date: '2026-03-10', type: '퇴사', target: '구직원', from: '기술지원팀', to: '-', note: '자진 퇴사' },
  { id: 'PO7', date: '2026-03-08', type: '입사', target: '신입B', from: '-', to: 'Growth팀', note: '경력직 입사' },
  { id: 'PO8', date: '2026-03-05', type: '전보', target: '오글로벌', from: 'SMB팀', to: '해외영업본부', note: '해외 사업 확장' },
  { id: 'PO9', date: '2026-03-01', type: '승진', target: '고퍼포먼', from: '매니저', to: '본부장', note: '퍼포먼스본부장 발령' },
  { id: 'PO10', date: '2026-02-28', type: '입사', target: '신입C', from: '-', to: '디자인팀', note: '디자이너 채용' },
];

const LEVEL_LABELS: Record<OrgLevel, string> = { track: '트랙', division: '본부', team: '팀', part: '파트' };
const LEVEL_COLORS: Record<OrgLevel, string> = { track: 'bg-violet-500/20 text-violet-400', division: 'bg-indigo-500/20 text-indigo-400', team: 'bg-blue-500/20 text-blue-400', part: 'bg-slate-500/20 text-slate-400' };
const STATUS_LABELS: Record<OrgStatus, string> = { active: '운영중', inactive: '비활성', preparing: '준비중' };
const STATUS_COLORS: Record<OrgStatus, string> = { active: 'text-emerald-400', inactive: 'text-slate-500', preparing: 'text-amber-400' };
const ORDER_COLORS: Record<string, string> = { '승진': 'text-violet-400 bg-violet-500/10', '전보': 'text-blue-400 bg-blue-500/10', '입사': 'text-emerald-400 bg-emerald-500/10', '퇴사': 'text-rose-400 bg-rose-500/10' };

/* ── Component ── */
export default function OrgSetupPage() {
  const { tenant } = useWIO();
  const [orgTree] = useState(buildOrg);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['T1', 'T2', 'T3']));
  const [selected, setSelected] = useState<OrgNode | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* flatten for capacity bar */
  const flatTracks = orgTree;
  const totalHeadcount = flatTracks.reduce((s, t) => s + t.headcount, 0);
  const totalCapacity = flatTracks.reduce((s, t) => s + t.capacity, 0);

  /* search filter */
  const matchesSearch = (node: OrgNode): boolean => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (node.name.toLowerCase().includes(q) || node.code.toLowerCase().includes(q)) return true;
    return node.children.some(c => matchesSearch(c));
  };

  /* render tree node */
  const renderNode = (node: OrgNode, depth: number) => {
    if (!matchesSearch(node)) return null;
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isSelected = selected?.id === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500/10 border border-indigo-500/30' : 'hover:bg-white/[0.04]'}`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => setSelected(node)}
        >
          {hasChildren ? (
            <button onClick={e => { e.stopPropagation(); toggle(node.id); }} className="p-0.5 text-slate-500 hover:text-white">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : <span className="w-5" />}

          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${LEVEL_COLORS[node.level]}`}>
            {LEVEL_LABELS[node.level]}
          </span>
          <span className="text-sm font-medium flex-1 truncate">{node.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">{node.code}</span>
          <span className={`text-[10px] ${STATUS_COLORS[node.status]}`}>{STATUS_LABELS[node.status]}</span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Users size={10} /> {node.headcount}/{node.capacity}
          </span>
        </div>
        {hasChildren && isExpanded && node.children.map(c => renderNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold">조직 설정</h1>
          <span className="text-xs text-slate-500">SYS-ORG</span>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 조직 추가
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다. 변경사항은 저장되지 않습니다.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: '전체 트랙', value: flatTracks.length, color: 'text-violet-400' },
          { label: '총 인원', value: totalHeadcount, color: 'text-indigo-400' },
          { label: '총 정원', value: totalCapacity, color: 'text-blue-400' },
          { label: '충원율', value: `${Math.round((totalHeadcount / totalCapacity) * 100)}%`, color: 'text-emerald-400' },
        ].map((c, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-[10px] text-slate-500 mb-1">{c.label}</div>
            <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left: Org Tree */}
        <div className="col-span-2 space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="조직명 또는 코드 검색..."
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>

          {/* Tree */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-0.5 max-h-[500px] overflow-y-auto">
            <div className="flex items-center gap-2 px-3 py-1 mb-2">
              <FolderTree size={14} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">조직 트리</span>
            </div>
            {orgTree.map(t => renderNode(t, 0))}
          </div>

          {/* Personnel Orders */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <History size={14} className="text-slate-500" />
              <span className="text-sm font-semibold">인사발령 이력</span>
              <span className="text-[10px] text-slate-500">최근 10건</span>
            </div>
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
              <div className="col-span-2">날짜</div>
              <div className="col-span-1">유형</div>
              <div className="col-span-2">대상자</div>
              <div className="col-span-2">이전</div>
              <div className="col-span-2">이후</div>
              <div className="col-span-3">비고</div>
            </div>
            {MOCK_ORDERS.map(o => (
              <div key={o.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="col-span-2 text-xs text-slate-400">{o.date}</div>
                <div className="col-span-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ORDER_COLORS[o.type] || 'text-slate-400 bg-slate-500/10'}`}>{o.type}</span>
                </div>
                <div className="col-span-2 text-sm">{o.target}</div>
                <div className="col-span-2 text-xs text-slate-500">{o.from}</div>
                <div className="col-span-2 text-xs text-slate-400">{o.to}</div>
                <div className="col-span-3 text-xs text-slate-600">{o.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detail + Capacity */}
        <div className="space-y-4">
          {/* Selected Detail */}
          {selected ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${LEVEL_COLORS[selected.level]}`}>{LEVEL_LABELS[selected.level]}</span>
                <button className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/5">
                  <Edit2 size={13} />
                </button>
              </div>
              <div className="text-lg font-bold">{selected.name}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">코드</span><span className="font-mono text-xs">{selected.code}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">조직장</span><span>{selected.leader}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">인원</span><span>{selected.headcount}명 / {selected.capacity}명</span></div>
                <div className="flex justify-between"><span className="text-slate-500">상태</span><span className={STATUS_COLORS[selected.status]}>{STATUS_LABELS[selected.status]}</span></div>
              </div>
              <div className="mt-2">
                <div className="text-[10px] text-slate-500 mb-1">충원율</div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.round((selected.headcount / selected.capacity) * 100)}%` }} />
                </div>
                <div className="text-right text-[10px] text-slate-500 mt-1">{Math.round((selected.headcount / selected.capacity) * 100)}%</div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center text-sm text-slate-500">
              좌측 트리에서 조직을 선택하세요
            </div>
          )}

          {/* Capacity Overview */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-slate-500" />
              <span className="text-sm font-semibold">정원 현황</span>
            </div>
            <div className="space-y-2.5">
              {flatTracks.map(t => {
                const pct = Math.round((t.headcount / t.capacity) * 100);
                return (
                  <div key={t.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">{t.name}</span>
                      <span className="text-slate-500">{t.headcount}/{t.capacity}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F0F23] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">조직 추가</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">조직명</label>
                <input placeholder="조직명 입력" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">코드</label>
                  <input placeholder="예: DEV-PD" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">레벨</label>
                  <select className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
                    {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">상위 조직</label>
                <select className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
                  <option value="" className="bg-[#0F0F23]">없음 (최상위)</option>
                  {orgTree.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#0F0F23]">{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">조직장</label>
                <input placeholder="조직장 이름" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">취소</button>
              <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
