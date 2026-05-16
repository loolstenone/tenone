'use client';

// V2.0 § 3-C AIRM 허브 — 발견된 플래그 + 진행 중 액션 + 검증 대기

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ListChecks, CheckCircle2, ArrowRight } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';
import {
  FLAG_TYPE_META,
  FLAG_STATUS_META,
  SEVERITY_META,
  ACTION_TYPE_META,
  type FlagType,
  type FlagStatus,
  type FlagSeverity,
} from '@/lib/smarcomm/airm';

interface FlagRow {
  id: string;
  platform: string;
  query: string;
  response_excerpt: string;
  flag_type: FlagType;
  severity: FlagSeverity;
  confidence: number;
  status: FlagStatus;
  notes: string | null;
  detected_at: string;
  action_count: number;
}

interface ActionRow {
  id: string;
  flag_id: string;
  action_type: string;
  title: string;
  role: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  expected_axis: string | null;
  expected_impact: number | null;
  created_at: string;
}

export default function AirmHubPage() {
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // tenant_id는 SSOT — localStorage 회사 정보 객체가 아니라 실제 tenant 식별자
        const tenantId = 'tenone';
        const [fRes, aRes] = await Promise.all([
          fetch(`/api/smarcomm/airm/flags?tenant_id=${tenantId}&limit=100`),
          fetch(`/api/smarcomm/airm/actions?tenant_id=${tenantId}&limit=100`),
        ]);
        const fData = await fRes.json();
        const aData = await aRes.json();
        setFlags(fData.flags ?? []);
        setActions(aData.actions ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 통계
  const openFlags = flags.filter(f => f.status === 'open' || f.status === 'in_review').length;
  const inActionFlags = flags.filter(f => f.status === 'in_action').length;
  const fixedFlags = flags.filter(f => f.status === 'verified_fixed').length;
  const todoActions = actions.filter(a => a.status === 'todo').length;
  const inProgressActions = actions.filter(a => a.status === 'in_progress').length;

  // Critical/High flag만 미리보기
  const urgentFlags = flags
    .filter(f => (f.severity === 'critical' || f.severity === 'high') && (f.status === 'open' || f.status === 'in_review'))
    .slice(0, 5);

  // 진행 중 액션 미리보기
  const activeActions = actions.filter(a => a.status === 'todo' || a.status === 'in_progress').slice(0, 5);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-text">⑥+⑦ AIRM — AI Reputation Management</h1>
          <GuideHelpButton />
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">Pro+</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          AI가 우리 브랜드에 거짓말·부정·혼동 답변을 할 때, 발견→분석→교정→검증으로 즉시 대응합니다.
        </p>
      </div>

      {/* 4단계 워크플로우 가이드 — 각 단계 클릭 시 해당 페이지 이동 */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
        <StageCard step="①" label="발견" count={openFlags} subLabel="신규 + 검토" color="#DC2626"
          href="/smarcomm/dashboard/airm/flags" />
        <StageCard step="②" label="분석" count={inActionFlags} subLabel="교정 중" color="#F59E0B"
          href="/smarcomm/dashboard/airm/flags?status=in_action" />
        <StageCard step="③" label="교정" count={todoActions + inProgressActions} subLabel="액션 큐" color="#3B82F6"
          href="/smarcomm/dashboard/airm/actions" />
        <StageCard step="④" label="검증" count={fixedFlags} subLabel="답변 변화" color="#10B981"
          href="/smarcomm/dashboard/events" />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">로딩 중…</div>
      ) : flags.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌: 긴급 플래그 */}
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="border-b border-border bg-surface/40 px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-text inline-flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-danger" /> 긴급 플래그
              </h2>
              <Link href="/smarcomm/dashboard/airm/flags" className="text-[11px] text-text-sub hover:text-text inline-flex items-center gap-0.5">
                모두 보기 <ArrowRight size={11} />
              </Link>
            </div>
            {urgentFlags.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">긴급 플래그가 없습니다. 안전합니다.</div>
            ) : (
              <div className="divide-y divide-border">
                {urgentFlags.map(f => <FlagPreview key={f.id} flag={f} />)}
              </div>
            )}
          </div>

          {/* 우: 진행 중 액션 */}
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="border-b border-border bg-surface/40 px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-text inline-flex items-center gap-1.5">
                <ListChecks size={14} className="text-accent" /> 진행 중 액션
              </h2>
              <Link href="/smarcomm/dashboard/airm/actions" className="text-[11px] text-text-sub hover:text-text inline-flex items-center gap-0.5">
                모두 보기 <ArrowRight size={11} />
              </Link>
            </div>
            {activeActions.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">진행 중인 액션이 없습니다.</div>
            ) : (
              <div className="divide-y divide-border">
                {activeActions.map(a => <ActionPreview key={a.id} action={a} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 가이드 */}
      <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/30 p-5">
        <h3 className="mb-2 text-sm font-bold text-text">AIRM은 SmarComm Pro/Enterprise 핵심 모듈입니다</h3>
        <p className="text-xs text-text-sub leading-relaxed mb-3">
          AI 검색 시대에 가장 큰 리스크는 "AI가 우리 브랜드에 대해 잘못된 답변을 하는 것"입니다. 한 번의 오답이 수많은 사용자에게 그대로 전달되기 때문입니다.
        </p>
        <ul className="space-y-1 text-xs text-text-sub">
          <li>① <strong>발견</strong> — 정기 재진단(주간)에서 부정 sentiment·잘못된 사실·경쟁사 혼동을 자동 감지</li>
          <li>② <strong>분석</strong> — 오정보의 추정 출처를 검색 → 교정 우선순위 결정</li>
          <li>③ <strong>교정</strong> — 권장 액션을 role별(마케터·개발·작가·디자이너)로 자동 할당</li>
          <li>④ <strong>검증</strong> — 교정 후 30일 후 자동 재진단 → 답변 변화 diff 추적</li>
        </ul>
      </div>
    </div>
  );
}

function StageCard({ step, label, count, subLabel, color, href }: { step: string; label: string; count: number; subLabel: string; color: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-border bg-white p-4 hover:bg-surface transition-colors block">
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-base font-bold" style={{ color }}>{step}</span>
        <span className="text-xs font-semibold text-text">{label}</span>
        <ArrowRight size={10} className="ml-auto text-text-muted" />
      </div>
      <div className="text-2xl font-bold text-text">{count}</div>
      <div className="text-[10px] text-text-muted">{subLabel}</div>
    </Link>
  );
}

function FlagPreview({ flag }: { flag: FlagRow }) {
  const meta = FLAG_TYPE_META[flag.flag_type];
  const sMeta = SEVERITY_META[flag.severity];
  return (
    <Link href={`/smarcomm/dashboard/airm/flags?id=${flag.id}`} className="block px-4 py-3 hover:bg-surface/40">
      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
        <span className="text-base">{meta.icon}</span>
        <span className="text-xs font-semibold text-text">{meta.label}</span>
        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: `${sMeta.color}15`, color: sMeta.color }}>{sMeta.label}</span>
        <span className="text-[10px] text-text-muted ml-auto">{flag.platform}</span>
      </div>
      <p className="text-[11px] text-text-sub italic line-clamp-1">"{flag.query}"</p>
      {flag.action_count > 0 && (
        <p className="mt-1 text-[10px] text-accent">권장 액션 {flag.action_count}건</p>
      )}
    </Link>
  );
}

function ActionPreview({ action }: { action: ActionRow }) {
  const aMeta = ACTION_TYPE_META[action.action_type as keyof typeof ACTION_TYPE_META] ?? ACTION_TYPE_META.other;
  return (
    <Link href={`/smarcomm/dashboard/airm/actions?id=${action.id}`} className="block px-4 py-3 hover:bg-surface/40">
      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
        <span className="text-base">{aMeta.icon}</span>
        <span className="text-xs font-semibold text-text line-clamp-1">{action.title}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <span className="rounded-full bg-surface px-1.5 py-0.5">{action.role}</span>
        {action.expected_impact && <span className="text-accent">+{action.expected_impact}점</span>}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-white p-12 text-center">
      <CheckCircle2 size={32} className="mx-auto mb-3 text-success" />
      <p className="text-sm font-medium text-text">AIRM 플래그가 없습니다</p>
      <p className="mt-1 text-xs text-text-muted">
        ① 진단을 실행해 AI Probe가 자동으로 부정·오답·혼동 답변을 탐지하도록 합니다.
      </p>
      <Link href="/smarcomm/dashboard/scan" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub">
        진단 실행 <ArrowRight size={12} />
      </Link>
    </div>
  );
}
