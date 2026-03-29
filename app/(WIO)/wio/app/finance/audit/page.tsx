'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertCircle, CheckCircle2, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type AuditPlan = {
  id: string;
  target: string;
  period: string;
  auditor: string;
  status: 'planned' | 'in_progress' | 'completed';
  findings: AuditFinding[];
};

type AuditFinding = {
  id: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  followUp: string;
  followUpStatus: 'open' | 'in_progress' | 'resolved';
  dueDate: string;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  planned: { label: '예정', color: 'text-blue-400 bg-blue-500/10' },
  in_progress: { label: '진행중', color: 'text-amber-400 bg-amber-500/10' },
  completed: { label: '완료', color: 'text-emerald-400 bg-emerald-500/10' },
};

const SEVERITY_MAP: Record<string, { label: string; color: string }> = {
  high: { label: '중대', color: 'text-red-400 bg-red-500/10' },
  medium: { label: '보통', color: 'text-amber-400 bg-amber-500/10' },
  low: { label: '경미', color: 'text-blue-400 bg-blue-500/10' },
};

const FOLLOWUP_MAP: Record<string, { label: string; color: string }> = {
  open: { label: '미착수', color: 'text-red-400' },
  in_progress: { label: '진행중', color: 'text-amber-400' },
  resolved: { label: '해결', color: 'text-emerald-400' },
};

const MOCK_AUDITS: AuditPlan[] = [
  {
    id: 'AUD-001',
    target: '경비 처리 프로세스',
    period: '2026-02-01 ~ 2026-02-28',
    auditor: '김감사',
    status: 'completed',
    findings: [
      { id: 'F-001', severity: 'high', description: '영수증 미첨부 경비 신청 15건 발견', followUp: '경비 신청 시 영수증 첨부 필수화', followUpStatus: 'resolved', dueDate: '2026-03-15' },
      { id: 'F-002', severity: 'medium', description: '결재 없이 집행된 법인카드 사용 3건', followUp: '사전 결재 프로세스 강화', followUpStatus: 'in_progress', dueDate: '2026-03-31' },
    ],
  },
  {
    id: 'AUD-002',
    target: '인사·급여 관리',
    period: '2026-03-01 ~ 2026-03-31',
    auditor: '박감사',
    status: 'in_progress',
    findings: [
      { id: 'F-003', severity: 'low', description: '초과근무 승인 절차 미비 2건', followUp: '초과근무 사전승인 시스템 도입', followUpStatus: 'open', dueDate: '2026-04-15' },
    ],
  },
  {
    id: 'AUD-003',
    target: 'IT 보안 점검',
    period: '2026-04-01 ~ 2026-04-30',
    auditor: '이감사',
    status: 'planned',
    findings: [],
  },
];

export default function AuditPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [expandedId, setExpandedId] = useState<string | null>('AUD-001');
  const [audits, setAudits] = useState<AuditPlan[]>(isDemo ? MOCK_AUDITS : []);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 감사 로그 로드
  const loadAudits = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setAudits(data.map((row: any) => ({
          id: row.id,
          target: row.target || '',
          period: row.period || '',
          auditor: row.auditor || '',
          status: row.status || 'planned',
          findings: Array.isArray(row.findings) ? row.findings : [],
        })));
      } else {
        setAudits(MOCK_AUDITS);
      }
    } catch {
      setAudits(MOCK_AUDITS);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadAudits(); }, [loadAudits]);

  const totalFindings = audits.reduce((s, a) => s + a.findings.length, 0);
  const openFindings = audits.flatMap(a => a.findings).filter(f => f.followUpStatus !== 'resolved').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">내부감사</h1>
          <p className="text-xs text-slate-500 mt-0.5">AUD-INT &middot; Internal Audit</p>
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-12">
          <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">데이터 로딩 중...</p>
        </div>
      )}

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">감사 건수</div>
          <div className="text-lg font-bold">{audits.length}건</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">지적사항</div>
          <div className="text-lg font-bold text-amber-400">{totalFindings}건</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">미해결</div>
          <div className="text-lg font-bold text-red-400">{openFindings}건</div>
        </div>
      </div>

      {/* 감사 목록 */}
      {!loading && <div className="space-y-3">
        {audits.map(audit => {
          const st = STATUS_MAP[audit.status];
          const isExpanded = expandedId === audit.id;
          return (
            <div key={audit.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
              {/* 헤더 */}
              <button onClick={() => setExpandedId(isExpanded ? null : audit.id)} className="w-full p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                    <span className="text-xs font-mono text-slate-500">{audit.id}</span>
                    <span className="text-sm font-medium">{audit.target}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  {audit.findings.length > 0 && (
                    <span className="text-xs text-slate-500">지적 {audit.findings.length}건</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1 ml-6">
                  기간: {audit.period} &middot; 담당: {audit.auditor}
                </div>
              </button>

              {/* 지적사항 */}
              {isExpanded && audit.findings.length > 0 && (
                <div className="border-t border-white/5 p-4 space-y-3">
                  <div className="text-xs font-semibold text-slate-400 mb-2">지적사항 + 후속조치</div>
                  {audit.findings.map(f => {
                    const sev = SEVERITY_MAP[f.severity];
                    const fu = FOLLOWUP_MAP[f.followUpStatus];
                    return (
                      <div key={f.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sev.color}`}>{sev.label}</span>
                          <span className="text-sm">{f.description}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">후속조치:</span>
                            <span>{f.followUp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={fu.color}>{fu.label}</span>
                            <span>&middot; 기한 {f.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {isExpanded && audit.findings.length === 0 && (
                <div className="border-t border-white/5 p-4 text-center text-xs text-slate-600">
                  아직 지적사항이 없습니다
                </div>
              )}
            </div>
          );
        })}
      </div>}
    </div>
  );
}
