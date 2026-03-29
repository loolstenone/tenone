'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Network, Users, ChevronRight, ChevronDown, Plus, Pencil,
  Building2, User, ArrowRight, Calendar
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

interface OrgUnit {
  id: string;
  name: string;
  type: 'track' | 'division' | 'team' | 'part';
  head: string;
  headCount: number;
  children?: OrgUnit[];
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  track: { label: '트랙', color: 'text-violet-400 bg-violet-500/10' },
  division: { label: '본부', color: 'text-blue-400 bg-blue-500/10' },
  team: { label: '팀', color: 'text-emerald-400 bg-emerald-500/10' },
  part: { label: '파트', color: 'text-amber-400 bg-amber-500/10' },
};

const MOCK_ORG: OrgUnit[] = [
  {
    id: '1', name: '사업 트랙', type: 'track', head: '김대표', headCount: 28,
    children: [
      {
        id: '1-1', name: '제품본부', type: 'division', head: '이본부장', headCount: 15,
        children: [
          { id: '1-1-1', name: '프론트엔드팀', type: 'team', head: '박팀장', headCount: 6 },
          { id: '1-1-2', name: '백엔드팀', type: 'team', head: '최팀장', headCount: 5 },
          { id: '1-1-3', name: 'QA팀', type: 'team', head: '정팀장', headCount: 4 },
        ],
      },
      {
        id: '1-2', name: '사업본부', type: 'division', head: '강본부장', headCount: 13,
        children: [
          { id: '1-2-1', name: '영업팀', type: 'team', head: '한팀장', headCount: 5 },
          { id: '1-2-2', name: '마케팅팀', type: 'team', head: '오팀장', headCount: 4,
            children: [
              { id: '1-2-2-1', name: '콘텐츠파트', type: 'part', head: '임파트장', headCount: 2 },
              { id: '1-2-2-2', name: '퍼포먼스파트', type: 'part', head: '송파트장', headCount: 2 },
            ],
          },
          { id: '1-2-3', name: 'CS팀', type: 'team', head: '윤팀장', headCount: 4 },
        ],
      },
    ],
  },
  {
    id: '2', name: '지원 트랙', type: 'track', head: '김대표', headCount: 12,
    children: [
      {
        id: '2-1', name: '경영지원본부', type: 'division', head: '조본부장', headCount: 12,
        children: [
          { id: '2-1-1', name: 'HR팀', type: 'team', head: '나팀장', headCount: 4 },
          { id: '2-1-2', name: '재무팀', type: 'team', head: '유팀장', headCount: 4 },
          { id: '2-1-3', name: 'IT인프라팀', type: 'team', head: '서팀장', headCount: 4 },
        ],
      },
    ],
  },
];

const MOCK_TRANSFERS = [
  { id: '1', date: '2026-03-25', name: '김민수', from: '백엔드팀', to: '프론트엔드팀', type: '전환배치' },
  { id: '2', date: '2026-03-20', name: '이지은', from: '마케팅팀', to: '마케팅팀 콘텐츠파트', type: '직급변경 (시니어)' },
  { id: '3', date: '2026-03-15', name: '박서준', from: '-', to: 'QA팀', type: '신규입사' },
  { id: '4', date: '2026-03-10', name: '최유나', from: 'CS팀', to: '영업팀', type: '전환배치' },
  { id: '5', date: '2026-03-01', name: '정해인', from: '프론트엔드팀', to: '제품본부', type: '승진 (팀장)' },
  { id: '6', date: '2026-02-25', name: '한소희', from: '영업팀', to: '-', type: '퇴사' },
  { id: '7', date: '2026-02-20', name: '오지호', from: '-', to: '백엔드팀', type: '신규입사' },
  { id: '8', date: '2026-02-15', name: '윤세아', from: 'HR팀', to: 'HR팀', type: '직급변경 (리드)' },
  { id: '9', date: '2026-02-10', name: '강다니엘', from: '재무팀', to: '경영지원본부', type: '승진 (본부장)' },
  { id: '10', date: '2026-02-01', name: '송혜교', from: '-', to: '마케팅팀', type: '신규입사' },
];

function OrgNode({ unit, depth = 0 }: { unit: OrgUnit; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = unit.children && unit.children.length > 0;
  const typeInfo = TYPE_LABELS[unit.type] || TYPE_LABELS.team;

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-white/5 pl-3' : ''}>
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${hasChildren ? 'hover:bg-white/[0.03]' : ''}`}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={13} className="text-slate-500 shrink-0" /> : <ChevronRight size={13} className="text-slate-500 shrink-0" />
        ) : (
          <div className="w-[13px]" />
        )}
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeInfo.color}`}>{typeInfo.label}</span>
        <span className="text-sm font-medium flex-1 truncate">{unit.name}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-500 flex items-center gap-1"><User size={10} />{unit.head}</span>
          <span className="text-[10px] text-slate-600">{unit.headCount}명</span>
        </div>
      </button>
      {expanded && hasChildren && (
        <div className="mt-0.5">
          {unit.children!.map(child => <OrgNode key={child.id} unit={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function OrgPage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<OrgUnit[]>([]);
  const [transfers, setTransfers] = useState<typeof MOCK_TRANSFERS>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'team', head: '' });
  const isAdmin = member?.role === 'admin' || member?.role === 'owner';

  // Supabase에서 조직 데이터 로드
  const loadOrg = useCallback(async () => {
    if (isDemo) {
      setOrg(MOCK_ORG);
      setTransfers(MOCK_TRANSFERS);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('org_units')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        // 플랫 목록을 트리로 변환 (parent_id 기반)
        const flat = data.map((row: any) => ({
          id: row.id,
          name: row.name || '',
          type: row.type || 'team',
          head: row.head_name || '',
          headCount: row.head_count || 0,
          parentId: row.parent_id || null,
        }));
        // 간단한 트리 빌드
        const byId = new Map(flat.map((n: any) => [n.id, { ...n, children: [] as OrgUnit[] }]));
        const roots: OrgUnit[] = [];
        flat.forEach((n: any) => {
          const node = byId.get(n.id)!;
          if (n.parentId && byId.has(n.parentId)) {
            byId.get(n.parentId)!.children!.push(node);
          } else {
            roots.push(node);
          }
        });
        setOrg(roots.length > 0 ? roots : MOCK_ORG);
        setTransfers(MOCK_TRANSFERS); // 인사발령 이력은 별도 테이블 필요
      } else {
        setOrg(MOCK_ORG);
        setTransfers(MOCK_TRANSFERS);
      }
    } catch {
      setOrg(MOCK_ORG);
      setTransfers(MOCK_TRANSFERS);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => {
    if (!tenant) return;
    loadOrg();
  }, [tenant, loadOrg]);

  const handleCreateOrg = () => {
    if (!form.name.trim()) return;
    // TODO: Supabase insert
    setShowForm(false);
    setForm({ name: '', type: 'team', head: '' });
  };

  const totalHeadCount = org.reduce((s, o) => s + o.headCount, 0);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">조직관리</h1>
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">조직관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-ORG | 총 {totalHeadCount}명</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            <Plus size={15} /> 조직 추가
          </button>
        )}
      </div>

      {/* Admin Form */}
      {showForm && isAdmin && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="조직명" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input value={form.head} onChange={e => setForm({ ...form, head: e.target.value })}
              placeholder="조직장" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button onClick={handleCreateOrg} disabled={!form.name.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-indigo-500 transition-colors">추가</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Org Tree */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Network size={15} className="text-indigo-400" /> 조직도
          </h2>
          {org.length === 0 ? (
            <div className="text-center py-8">
              <Building2 size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-400">조직이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-1">
              {org.map(unit => <OrgNode key={unit.id} unit={unit} />)}
            </div>
          )}
        </div>

        {/* Transfer History */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Calendar size={15} className="text-amber-400" /> 인사발령 이력
          </h2>
          <div className="space-y-1.5">
            {transfers.map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5">
                <span className="text-[10px] text-slate-600 w-20 shrink-0">{t.date}</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-400 shrink-0">
                  {t.name.charAt(0)}
                </div>
                <span className="text-sm font-medium w-16 shrink-0">{t.name}</span>
                <div className="flex-1 flex items-center gap-1.5 min-w-0 text-xs text-slate-400">
                  <span className="truncate">{t.from}</span>
                  <ArrowRight size={12} className="text-slate-600 shrink-0" />
                  <span className="truncate">{t.to}</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded shrink-0">{t.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
