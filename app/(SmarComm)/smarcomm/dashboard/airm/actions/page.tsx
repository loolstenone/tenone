'use client';

// V2.0 § 3-C AIRM ③ 교정 액션 큐 — role별 할당

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import { ACTION_TYPE_META } from '@/lib/smarcomm/airm';

interface ActionRow {
  id: string;
  flag_id: string;
  action_type: string;
  title: string;
  description: string | null;
  role: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  expected_axis: string | null;
  expected_impact: number | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

const STATUS_META: Record<ActionRow['status'], { label: string; color: string }> = {
  todo:        { label: '대기',     color: '#6B7280' },
  in_progress: { label: '진행 중',   color: '#3B82F6' },
  blocked:     { label: '차단',     color: '#DC2626' },
  done:        { label: '완료',     color: '#10B981' },
  cancelled:   { label: '취소',     color: '#9CA3AF' },
};

const ROLE_META: Record<string, { label: string; icon: string }> = {
  marketer:     { label: '마케터',   icon: '🎯' },
  dev:          { label: '개발',     icon: '💻' },
  writer:       { label: '작가',     icon: '✍️' },
  designer:     { label: '디자이너', icon: '🎨' },
  partner_team: { label: '파트너',   icon: '🤝' },
};

const AXIS_META: Record<string, { label: string; color: string }> = {
  awareness: { label: '인지',   color: '#3B82F6' },
  depth:     { label: '이해',   color: '#10B981' },
  trust:     { label: '추천',   color: '#F59E0B' },
  sentiment: { label: '평판',   color: '#DC2626' },
};

export default function ActionsListPage() {
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ActionRow['status'] | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchActions = async () => {
    setLoading(true);
    const tenantId = localStorage.getItem('smarcomm_company') || 'tenone-demo';
    const params = new URLSearchParams({ tenant_id: tenantId, limit: '200' });
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (roleFilter !== 'all') params.set('role', roleFilter);
    const res = await fetch(`/api/smarcomm/airm/actions?${params.toString()}`);
    const data = await res.json();
    setActions(data.actions ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchActions(); /* eslint-disable-next-line */ }, [statusFilter, roleFilter]);

  const updateStatus = async (id: string, status: ActionRow['status']) => {
    await fetch('/api/smarcomm/airm/actions', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchActions();
  };

  // 칸반 4컬럼
  const byStatus = {
    todo: actions.filter(a => a.status === 'todo'),
    in_progress: actions.filter(a => a.status === 'in_progress'),
    blocked: actions.filter(a => a.status === 'blocked'),
    done: actions.filter(a => a.status === 'done'),
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/smarcomm/dashboard/airm" className="inline-flex items-center gap-1 text-xs text-text-sub hover:text-text"><ArrowLeft size={12} /> AIRM 허브</Link>
        <PageTopBar />
      </div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">교정 액션 큐</h1>
        <p className="mt-1 text-xs text-text-muted">발견된 플래그를 해소하기 위한 role별 권장 액션</p>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div>
          <div className="text-[10px] text-text-muted mb-1 px-1">담당 역할</div>
          <div className="flex gap-1 flex-wrap">
            <Chip selected={roleFilter === 'all'} onClick={() => setRoleFilter('all')} label="전체" />
            {Object.entries(ROLE_META).map(([k, m]) => (
              <Chip key={k} selected={roleFilter === k} onClick={() => setRoleFilter(k)} label={`${m.icon} ${m.label}`} />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-text-muted mb-1 px-1">상태</div>
          <div className="flex gap-1 flex-wrap">
            <Chip selected={statusFilter === 'all'} onClick={() => setStatusFilter('all')} label="전체" />
            {(Object.keys(STATUS_META) as ActionRow['status'][]).map(s => (
              <Chip key={s} selected={statusFilter === s} onClick={() => setStatusFilter(s)} label={STATUS_META[s].label} color={STATUS_META[s].color} />
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">로딩 중…</div>
      ) : actions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-xs text-text-muted">
          조건에 맞는 액션이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {(['todo', 'in_progress', 'blocked', 'done'] as const).map(s => (
            <div key={s} className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="border-b border-border bg-surface/40 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-bold text-text">{STATUS_META[s].label}</span>
                <span className="text-[10px] text-text-muted">{byStatus[s].length}</span>
              </div>
              <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                {byStatus[s].length === 0 ? (
                  <div className="py-4 text-center text-[10px] text-text-muted">비어있음</div>
                ) : (
                  byStatus[s].map(a => <ActionCard key={a.id} action={a} onUpdate={updateStatus} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ selected, onClick, label, color }: { selected: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${selected ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}
      style={selected && color ? { background: color } : {}}
    >
      {label}
    </button>
  );
}

function ActionCard({ action, onUpdate }: { action: ActionRow; onUpdate: (id: string, status: ActionRow['status']) => void }) {
  const aMeta = ACTION_TYPE_META[action.action_type as keyof typeof ACTION_TYPE_META] ?? ACTION_TYPE_META.other;
  const role = ROLE_META[action.role] ?? { label: action.role, icon: '🔗' };
  const axis = action.expected_axis ? AXIS_META[action.expected_axis] : null;

  const nextStatus: Record<ActionRow['status'], ActionRow['status'] | null> = {
    todo: 'in_progress',
    in_progress: 'done',
    blocked: 'in_progress',
    done: null,
    cancelled: null,
  };
  const next = nextStatus[action.status];

  return (
    <div className="rounded-lg border border-border bg-surface/20 p-3">
      <div className="mb-1.5 flex items-center gap-1 text-[10px]">
        <span className="text-sm">{aMeta.icon}</span>
        <span className="font-medium text-text-sub">{aMeta.label}</span>
      </div>
      <div className="mb-1.5 text-xs font-semibold text-text leading-snug">{action.title}</div>
      {action.description && (
        <p className="mb-2 text-[11px] text-text-sub line-clamp-2 leading-relaxed">{action.description}</p>
      )}
      <div className="mb-2 flex flex-wrap items-center gap-1 text-[10px]">
        <span className="rounded-full bg-surface px-1.5 py-0.5 text-text-muted">{role.icon} {role.label}</span>
        {axis && (
          <span className="rounded-full px-1.5 py-0.5 font-medium" style={{ background: `${axis.color}15`, color: axis.color }}>
            {axis.label} +{action.expected_impact}점
          </span>
        )}
      </div>
      {next && (
        <button
          onClick={() => onUpdate(action.id, next)}
          className="w-full rounded-md bg-text px-2 py-1.5 text-[10px] font-semibold text-white hover:bg-accent-sub"
        >
          → {STATUS_META[next].label}
        </button>
      )}
    </div>
  );
}
