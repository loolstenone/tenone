'use client';

import { useState } from 'react';
import {
  Database, Shield, Eye, Clock, Lock, AlertTriangle, Search, FileText,
  Activity, CheckCircle2, BarChart3, Table2, User, Filter,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Types ── */
type SensitivityLevel = 'public' | 'internal' | 'confidential' | 'restricted';
type DataAction = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'EXPORT';
type MaskingStatus = 'masked' | 'partial' | 'none';

type DataTable = {
  id: string;
  name: string;
  description: string;
  ownerDept: string;
  sensitivity: SensitivityLevel;
  recordCount: number;
  lastUpdated: string;
  hasPII: boolean;
  maskingStatus: MaskingStatus;
};

type AccessLog = {
  id: string;
  timestamp: string;
  user: string;
  table: string;
  action: DataAction;
  rowCount: number;
  ip: string;
};

type RetentionPolicy = {
  id: string;
  dataType: string;
  retentionPeriod: string;
  autoDelete: boolean;
  lastReview: string;
};

type QualityScore = {
  category: string;
  score: number;
  color: string;
  description: string;
};

/* ── Mock Data ── */
const SENSITIVITY_LABELS: Record<SensitivityLevel, string> = { public: '공개', internal: '내부', confidential: '기밀', restricted: '제한' };
const SENSITIVITY_COLORS: Record<SensitivityLevel, string> = {
  public: 'text-emerald-400 bg-emerald-500/10', internal: 'text-blue-400 bg-blue-500/10',
  confidential: 'text-amber-400 bg-amber-500/10', restricted: 'text-rose-400 bg-rose-500/10',
};
const ACTION_COLORS: Record<DataAction, string> = {
  SELECT: 'text-blue-400 bg-blue-500/10', INSERT: 'text-emerald-400 bg-emerald-500/10',
  UPDATE: 'text-amber-400 bg-amber-500/10', DELETE: 'text-rose-400 bg-rose-500/10',
  EXPORT: 'text-violet-400 bg-violet-500/10',
};
const MASKING_LABELS: Record<MaskingStatus, string> = { masked: '완전 마스킹', partial: '부분 마스킹', none: '미적용' };
const MASKING_COLORS: Record<MaskingStatus, string> = { masked: 'text-emerald-400', partial: 'text-amber-400', none: 'text-rose-400' };

const MOCK_TABLES: DataTable[] = [
  { id: 'dt1', name: 'wio_users', description: '사용자 계정 정보', ownerDept: '개발', sensitivity: 'confidential', recordCount: 1250, lastUpdated: '2026-03-29', hasPII: true, maskingStatus: 'masked' },
  { id: 'dt2', name: 'wio_tenants', description: '테넌트(조직) 정보', ownerDept: '개발', sensitivity: 'internal', recordCount: 45, lastUpdated: '2026-03-28', hasPII: false, maskingStatus: 'none' },
  { id: 'dt3', name: 'wio_members', description: '멤버십 연결 테이블', ownerDept: '개발', sensitivity: 'internal', recordCount: 3200, lastUpdated: '2026-03-29', hasPII: false, maskingStatus: 'none' },
  { id: 'dt4', name: 'hr_employees', description: '직원 인사 정보', ownerDept: '인사', sensitivity: 'restricted', recordCount: 890, lastUpdated: '2026-03-29', hasPII: true, maskingStatus: 'masked' },
  { id: 'dt5', name: 'hr_payroll', description: '급여 정보', ownerDept: '인사', sensitivity: 'restricted', recordCount: 10680, lastUpdated: '2026-03-25', hasPII: true, maskingStatus: 'masked' },
  { id: 'dt6', name: 'fin_transactions', description: '재무 거래 내역', ownerDept: '재무', sensitivity: 'confidential', recordCount: 45230, lastUpdated: '2026-03-29', hasPII: false, maskingStatus: 'none' },
  { id: 'dt7', name: 'fin_invoices', description: '청구서/인보이스', ownerDept: '재무', sensitivity: 'confidential', recordCount: 8900, lastUpdated: '2026-03-28', hasPII: true, maskingStatus: 'partial' },
  { id: 'dt8', name: 'mkt_campaigns', description: '마케팅 캠페인', ownerDept: '마케팅', sensitivity: 'internal', recordCount: 320, lastUpdated: '2026-03-27', hasPII: false, maskingStatus: 'none' },
  { id: 'dt9', name: 'mkt_leads', description: '리드 정보', ownerDept: '마케팅', sensitivity: 'confidential', recordCount: 15600, lastUpdated: '2026-03-29', hasPII: true, maskingStatus: 'partial' },
  { id: 'dt10', name: 'sales_deals', description: '영업 딜 정보', ownerDept: '영업', sensitivity: 'confidential', recordCount: 2340, lastUpdated: '2026-03-29', hasPII: false, maskingStatus: 'none' },
  { id: 'dt11', name: 'sales_contacts', description: '거래처 연락처', ownerDept: '영업', sensitivity: 'confidential', recordCount: 5670, lastUpdated: '2026-03-28', hasPII: true, maskingStatus: 'partial' },
  { id: 'dt12', name: 'proj_projects', description: '프로젝트 관리', ownerDept: '개발', sensitivity: 'internal', recordCount: 180, lastUpdated: '2026-03-29', hasPII: false, maskingStatus: 'none' },
  { id: 'dt13', name: 'proj_tasks', description: '작업/태스크', ownerDept: '개발', sensitivity: 'internal', recordCount: 12400, lastUpdated: '2026-03-29', hasPII: false, maskingStatus: 'none' },
  { id: 'dt14', name: 'audit_logs', description: '감사 로그', ownerDept: '보안', sensitivity: 'restricted', recordCount: 890000, lastUpdated: '2026-03-29', hasPII: true, maskingStatus: 'masked' },
  { id: 'dt15', name: 'agent_messages', description: 'AI 에이전트 메시지', ownerDept: '개발', sensitivity: 'internal', recordCount: 34500, lastUpdated: '2026-03-29', hasPII: false, maskingStatus: 'none' },
];

const MOCK_QUALITY: QualityScore[] = [
  { category: '완전성', score: 94, color: 'text-emerald-400', description: '필수 필드 채움 비율' },
  { category: '정확성', score: 91, color: 'text-blue-400', description: '데이터 유효성 검증 통과율' },
  { category: '일관성', score: 88, color: 'text-amber-400', description: '테이블 간 참조 무결성' },
  { category: '적시성', score: 96, color: 'text-violet-400', description: 'SLA 내 데이터 갱신 비율' },
];

const MOCK_ACCESS_LOGS: AccessLog[] = [
  { id: 'al1', timestamp: '2026-03-29 14:32:05', user: '박개발', table: 'wio_users', action: 'SELECT', rowCount: 50, ip: '10.0.1.15' },
  { id: 'al2', timestamp: '2026-03-29 14:28:12', user: '이마케팅', table: 'mkt_leads', action: 'EXPORT', rowCount: 1500, ip: '10.0.2.8' },
  { id: 'al3', timestamp: '2026-03-29 14:15:33', user: '시스템', table: 'audit_logs', action: 'INSERT', rowCount: 1, ip: '10.0.0.1' },
  { id: 'al4', timestamp: '2026-03-29 14:10:44', user: '최인사', table: 'hr_employees', action: 'UPDATE', rowCount: 3, ip: '10.0.1.22' },
  { id: 'al5', timestamp: '2026-03-29 13:55:18', user: '한재무', table: 'fin_transactions', action: 'SELECT', rowCount: 200, ip: '10.0.3.5' },
  { id: 'al6', timestamp: '2026-03-29 13:42:09', user: '장영업', table: 'sales_contacts', action: 'EXPORT', rowCount: 800, ip: '10.0.2.15' },
  { id: 'al7', timestamp: '2026-03-29 13:30:55', user: '정백엔드', table: 'proj_tasks', action: 'INSERT', rowCount: 5, ip: '10.0.1.18' },
  { id: 'al8', timestamp: '2026-03-29 13:15:22', user: '김대표', table: 'hr_payroll', action: 'SELECT', rowCount: 890, ip: '10.0.0.10' },
  { id: 'al9', timestamp: '2026-03-29 12:58:41', user: '이프론트', table: 'agent_messages', action: 'SELECT', rowCount: 100, ip: '10.0.1.20' },
  { id: 'al10', timestamp: '2026-03-29 12:45:30', user: '시스템', table: 'wio_members', action: 'UPDATE', rowCount: 12, ip: '10.0.0.1' },
  { id: 'al11', timestamp: '2026-03-29 12:30:18', user: '나콘텐츠', table: 'mkt_campaigns', action: 'UPDATE', rowCount: 2, ip: '10.0.2.10' },
  { id: 'al12', timestamp: '2026-03-29 12:15:05', user: '고퍼포먼', table: 'mkt_leads', action: 'SELECT', rowCount: 500, ip: '10.0.2.12' },
  { id: 'al13', timestamp: '2026-03-29 12:00:33', user: '박개발', table: 'wio_tenants', action: 'UPDATE', rowCount: 1, ip: '10.0.1.15' },
  { id: 'al14', timestamp: '2026-03-29 11:45:19', user: '최인사', table: 'hr_employees', action: 'DELETE', rowCount: 1, ip: '10.0.1.22' },
  { id: 'al15', timestamp: '2026-03-29 11:30:44', user: '한재무', table: 'fin_invoices', action: 'INSERT', rowCount: 15, ip: '10.0.3.5' },
  { id: 'al16', timestamp: '2026-03-29 11:15:08', user: '장영업', table: 'sales_deals', action: 'UPDATE', rowCount: 4, ip: '10.0.2.15' },
  { id: 'al17', timestamp: '2026-03-29 11:00:55', user: '시스템', table: 'audit_logs', action: 'INSERT', rowCount: 1, ip: '10.0.0.1' },
  { id: 'al18', timestamp: '2026-03-29 10:45:22', user: '이마케팅', table: 'mkt_campaigns', action: 'INSERT', rowCount: 1, ip: '10.0.2.8' },
  { id: 'al19', timestamp: '2026-03-29 10:30:11', user: '정디자인', table: 'proj_projects', action: 'SELECT', rowCount: 20, ip: '10.0.1.25' },
  { id: 'al20', timestamp: '2026-03-29 10:15:05', user: '김대표', table: 'fin_transactions', action: 'SELECT', rowCount: 1000, ip: '10.0.0.10' },
];

const MOCK_RETENTION: RetentionPolicy[] = [
  { id: 'rp1', dataType: '사용자 로그', retentionPeriod: '2년', autoDelete: true, lastReview: '2026-03-01' },
  { id: 'rp2', dataType: '감사 로그', retentionPeriod: '5년', autoDelete: false, lastReview: '2026-03-01' },
  { id: 'rp3', dataType: '재무 데이터', retentionPeriod: '10년', autoDelete: false, lastReview: '2026-01-15' },
  { id: 'rp4', dataType: '마케팅 리드', retentionPeriod: '3년', autoDelete: true, lastReview: '2026-02-20' },
  { id: 'rp5', dataType: '인사 기록', retentionPeriod: '퇴직 후 5년', autoDelete: false, lastReview: '2026-03-15' },
  { id: 'rp6', dataType: 'AI 에이전트 로그', retentionPeriod: '1년', autoDelete: true, lastReview: '2026-03-10' },
  { id: 'rp7', dataType: '세션 데이터', retentionPeriod: '90일', autoDelete: true, lastReview: '2026-03-20' },
];

export default function DataGovernancePage() {
  const { tenant } = useWIO();
  const [searchQuery, setSearchQuery] = useState('');
  const [sensitivityFilter, setSensitivityFilter] = useState<'all' | SensitivityLevel>('all');
  const [showPIIOnly, setShowPIIOnly] = useState(false);

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const filteredTables = MOCK_TABLES
    .filter(t => sensitivityFilter === 'all' || t.sensitivity === sensitivityFilter)
    .filter(t => !showPIIOnly || t.hasPII)
    .filter(t => !searchQuery || t.name.includes(searchQuery) || t.description.includes(searchQuery));

  const overallScore = Math.round(MOCK_QUALITY.reduce((s, q) => s + q.score, 0) / MOCK_QUALITY.length);
  const piiTables = MOCK_TABLES.filter(t => t.hasPII);
  const maskedCount = piiTables.filter(t => t.maskingStatus === 'masked').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold">데이터 거버넌스</h1>
          <span className="text-xs text-slate-500">DAT-GOV</span>
        </div>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {/* Quality Dashboard */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col items-center justify-center">
          <div className="text-[10px] text-slate-500 mb-1">종합 품질 점수</div>
          <div className="text-3xl font-bold text-emerald-400">{overallScore}%</div>
          <div className="text-[10px] text-slate-600 mt-1">전체 평균</div>
        </div>
        {MOCK_QUALITY.map((q, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-[10px] text-slate-500 mb-2">{q.category}</div>
            <div className={`text-2xl font-bold ${q.color}`}>{q.score}%</div>
            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${q.score >= 90 ? 'bg-emerald-500' : q.score >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${q.score}%` }} />
            </div>
            <div className="text-[10px] text-slate-600 mt-1.5">{q.description}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left (2/3): Data Catalog + Access Logs */}
        <div className="col-span-2 space-y-4">
          {/* Data Catalog */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Table2 size={14} className="text-slate-500" />
                <span className="text-sm font-semibold">데이터 카탈로그</span>
                <span className="text-[10px] text-slate-500">{filteredTables.length}개 테이블</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowPIIOnly(!showPIIOnly)}
                  className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${showPIIOnly ? 'bg-rose-500/10 text-rose-400' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Lock size={10} className="inline mr-1" />PII만
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="테이블명 또는 설명 검색..."
                  className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none" />
              </div>
              <select value={sensitivityFilter} onChange={e => setSensitivityFilter(e.target.value as any)}
                className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-xs focus:outline-none">
                <option value="all" className="bg-[#0F0F23]">전체 등급</option>
                {Object.entries(SENSITIVITY_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>)}
              </select>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
              <div className="col-span-2">테이블명</div>
              <div className="col-span-3">설명</div>
              <div className="col-span-1">소유부서</div>
              <div className="col-span-1">민감도</div>
              <div className="col-span-2">레코드 수</div>
              <div className="col-span-1">PII</div>
              <div className="col-span-2">마스킹</div>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {filteredTables.map(t => (
                <div key={t.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className="col-span-2 text-xs font-mono flex items-center">{t.name}</div>
                  <div className="col-span-3 text-xs text-slate-400 flex items-center">{t.description}</div>
                  <div className="col-span-1 text-xs text-slate-500 flex items-center">{t.ownerDept}</div>
                  <div className="col-span-1 flex items-center">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SENSITIVITY_COLORS[t.sensitivity]}`}>
                      {SENSITIVITY_LABELS[t.sensitivity]}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs text-slate-400 flex items-center">{t.recordCount.toLocaleString()}</div>
                  <div className="col-span-1 flex items-center">
                    {t.hasPII ? <Lock size={12} className="text-rose-400" /> : <span className="text-[10px] text-slate-600">-</span>}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className={`text-[10px] ${MASKING_COLORS[t.maskingStatus]}`}>{MASKING_LABELS[t.maskingStatus]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Access Audit Logs */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <Eye size={14} className="text-slate-500" />
              <span className="text-sm font-semibold">접근 감사 로그</span>
              <span className="text-[10px] text-slate-500">최근 20건</span>
            </div>
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
              <div className="col-span-3">시간</div>
              <div className="col-span-2">사용자</div>
              <div className="col-span-2">테이블</div>
              <div className="col-span-1">액션</div>
              <div className="col-span-2">행 수</div>
              <div className="col-span-2">IP</div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {MOCK_ACCESS_LOGS.map(log => (
                <div key={log.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className="col-span-3 text-xs text-slate-500 flex items-center font-mono">{log.timestamp}</div>
                  <div className="col-span-2 text-xs flex items-center">
                    <User size={10} className="text-slate-600 mr-1" />{log.user}
                  </div>
                  <div className="col-span-2 text-xs text-slate-400 font-mono flex items-center">{log.table}</div>
                  <div className="col-span-1 flex items-center">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${ACTION_COLORS[log.action]}`}>{log.action}</span>
                  </div>
                  <div className="col-span-2 text-xs text-slate-500 flex items-center">{log.rowCount.toLocaleString()}</div>
                  <div className="col-span-2 text-xs text-slate-600 font-mono flex items-center">{log.ip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (1/3): Retention + PII */}
        <div className="space-y-4">
          {/* PII Summary */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={14} className="text-rose-400" />
              <span className="text-sm font-semibold">PII 관리 현황</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-lg bg-white/[0.03] p-2.5 text-center">
                <div className="text-lg font-bold text-rose-400">{piiTables.length}</div>
                <div className="text-[10px] text-slate-500">PII 포함 테이블</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-2.5 text-center">
                <div className="text-lg font-bold text-emerald-400">{maskedCount}/{piiTables.length}</div>
                <div className="text-[10px] text-slate-500">완전 마스킹</div>
              </div>
            </div>
            <div className="space-y-2">
              {piiTables.map(t => (
                <div key={t.id} className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div>
                    <div className="text-xs font-mono">{t.name}</div>
                    <div className="text-[10px] text-slate-600">{t.description}</div>
                  </div>
                  <span className={`text-[10px] font-semibold ${MASKING_COLORS[t.maskingStatus]}`}>
                    {MASKING_LABELS[t.maskingStatus]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Retention Policies */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-amber-400" />
              <span className="text-sm font-semibold">보관 정책</span>
            </div>
            <div className="space-y-2">
              {MOCK_RETENTION.map(r => (
                <div key={r.id} className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div>
                    <div className="text-xs">{r.dataType}</div>
                    <div className="text-[10px] text-slate-600">검토일: {r.lastReview}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-indigo-400">{r.retentionPeriod}</div>
                    <div className={`text-[10px] ${r.autoDelete ? 'text-amber-400' : 'text-slate-600'}`}>
                      {r.autoDelete ? '자동삭제' : '수동관리'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
