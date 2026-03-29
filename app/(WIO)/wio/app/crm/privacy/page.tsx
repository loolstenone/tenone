'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Eye, Trash2, Download } from 'lucide-react';
import { useWIO } from '../../layout';

const CONSENT_STATS = {
  total: 1858,
  marketing: { agreed: 1420, rate: 76 },
  thirdParty: { agreed: 890, rate: 48 },
  analytics: { agreed: 1650, rate: 89 },
  profiling: { agreed: 720, rate: 39 },
};

const MOCK_REQUESTS = [
  { id: 'PR-001', type: 'access', customer: '김태현', email: 'taehyun@example.com', status: 'completed', requestDate: '2026-03-25', completedDate: '2026-03-26', deadline: '2026-04-24' },
  { id: 'PR-002', type: 'delete', customer: '한동훈', email: 'donghun@tech.co', status: 'in_progress', requestDate: '2026-03-27', completedDate: null, deadline: '2026-04-26' },
  { id: 'PR-003', type: 'access', customer: '송하늘', email: 'haneul@edu.kr', status: 'pending', requestDate: '2026-03-28', completedDate: null, deadline: '2026-04-27' },
  { id: 'PR-004', type: 'rectify', customer: '강민수', email: 'minsu@global.com', status: 'completed', requestDate: '2026-03-20', completedDate: '2026-03-22', deadline: '2026-04-19' },
  { id: 'PR-005', type: 'portability', customer: '윤미래', email: 'mirae@design.kr', status: 'in_progress', requestDate: '2026-03-26', completedDate: null, deadline: '2026-04-25' },
  { id: 'PR-006', type: 'delete', customer: '박지민', email: 'jimin@startup.io', status: 'pending', requestDate: '2026-03-28', completedDate: null, deadline: '2026-04-27' },
];

const REQUEST_TYPE: Record<string, { label: string; icon: any; color: string }> = {
  access: { label: '열람 청구', icon: Eye, color: 'text-blue-400 bg-blue-500/10' },
  delete: { label: '삭제 청구', icon: Trash2, color: 'text-red-400 bg-red-500/10' },
  rectify: { label: '정정 청구', icon: FileText, color: 'text-amber-400 bg-amber-500/10' },
  portability: { label: '이동 청구', icon: Download, color: 'text-violet-400 bg-violet-500/10' },
};

const REQUEST_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: '대기', color: 'text-amber-400 bg-amber-500/10' },
  in_progress: { label: '처리중', color: 'text-indigo-400 bg-indigo-500/10' },
  completed: { label: '완료', color: 'text-emerald-400 bg-emerald-500/10' },
};

const COMPLIANCE_CHECKLIST = [
  { id: 1, category: '수집', item: '개인정보 수집 시 동의 획득 절차', status: 'pass' },
  { id: 2, category: '수집', item: '필수/선택 동의 분리', status: 'pass' },
  { id: 3, category: '이용', item: '목적 외 이용 제한 정책', status: 'pass' },
  { id: 4, category: '보관', item: '보유 기간 경과 시 파기 절차', status: 'warning' },
  { id: 5, category: '제공', item: '제3자 제공 시 동의 절차', status: 'pass' },
  { id: 6, category: '파기', item: '파기 대상 정기 점검 (월 1회)', status: 'warning' },
  { id: 7, category: '기술', item: '개인정보 암호화 (AES-256)', status: 'pass' },
  { id: 8, category: '기술', item: '접근 권한 관리 (RBAC)', status: 'pass' },
  { id: 9, category: '기술', item: '접속 기록 보관 (최소 1년)', status: 'pass' },
  { id: 10, category: '관리', item: '개인정보 처리방침 공개', status: 'pass' },
  { id: 11, category: '관리', item: '개인정보 보호 교육 실시 (연 1회)', status: 'fail' },
  { id: 12, category: '관리', item: '개인정보 영향평가 수행', status: 'pass' },
];

const STATUS_ICON: Record<string, { color: string; label: string }> = {
  pass: { color: 'text-emerald-400', label: '충족' },
  warning: { color: 'text-amber-400', label: '주의' },
  fail: { color: 'text-red-400', label: '미충족' },
};

export default function PrivacyPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<'consent' | 'requests' | 'compliance'>('consent');

  const complianceScore = Math.round(COMPLIANCE_CHECKLIST.filter(c => c.status === 'pass').length / COMPLIANCE_CHECKLIST.length * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">개인정보관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">CRM-PVY &middot; 동의, 청구, 컴플라이언스</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={16} className={complianceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'} />
          <span className="text-sm font-bold">{complianceScore}%</span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'consent' as const, label: '동의 현황' },
          { key: 'requests' as const, label: '청구 관리' },
          { key: 'compliance' as const, label: '컴플라이언스' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-2 rounded-lg ${tab === t.key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'consent' && (
        <>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-4">
            <p className="text-xs text-slate-500 mb-1">전체 고객</p>
            <p className="text-2xl font-bold">{CONSENT_STATS.total.toLocaleString()}명</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: '마케팅 수신', ...CONSENT_STATS.marketing },
              { label: '제3자 제공', ...CONSENT_STATS.thirdParty },
              { label: '분석/통계', ...CONSENT_STATS.analytics },
              { label: '프로파일링', ...CONSENT_STATS.profiling },
            ].map(c => (
              <div key={c.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-slate-500 mb-2">{c.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold">{c.agreed.toLocaleString()}</span>
                  <span className={`text-sm font-bold ${c.rate >= 70 ? 'text-emerald-400' : c.rate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{c.rate}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${c.rate >= 70 ? 'bg-emerald-500' : c.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'requests' && (
        <div className="space-y-2">
          {MOCK_REQUESTS.map(r => {
            const rt = REQUEST_TYPE[r.type];
            const rs = REQUEST_STATUS[r.status];
            const Icon = rt.icon;
            return (
              <div key={r.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <Icon size={16} className={rt.color.split(' ')[0]} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600">{r.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rt.color}`}>{rt.label}</span>
                    <span className="text-sm font-medium">{r.customer}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {r.email} &middot; 요청일 {r.requestDate} &middot; 기한 {r.deadline}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rs.color}`}>{rs.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'compliance' && (
        <div className="space-y-2">
          {COMPLIANCE_CHECKLIST.map(c => {
            const si = STATUS_ICON[c.status];
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                {c.status === 'pass' ? <CheckCircle size={14} className={si.color} /> :
                  c.status === 'warning' ? <AlertTriangle size={14} className={si.color} /> :
                    <AlertTriangle size={14} className={si.color} />}
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">{c.category}</span>
                <span className="text-sm flex-1">{c.item}</span>
                <span className={`text-[10px] font-semibold ${si.color}`}>{si.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
