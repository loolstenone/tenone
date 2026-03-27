'use client';

import { useState } from 'react';
import { Award, Plus, Download, Eye, Calendar, User, Search, Filter } from 'lucide-react';
import { useWIO } from '../layout';

type CertStatus = 'issued' | 'draft' | 'revoked';

interface Certificate {
  id: string;
  title: string;
  recipientName: string;
  issuedDate: string;
  type: string;
  status: CertStatus;
  courseOrEvent: string;
  certNumber: string;
}

const STATUS_CONFIG: Record<CertStatus, { label: string; color: string }> = {
  issued: { label: '발급됨', color: 'text-emerald-400 bg-emerald-500/10' },
  draft: { label: '초안', color: 'text-slate-400 bg-slate-500/10' },
  revoked: { label: '취소', color: 'text-red-400 bg-red-500/10' },
};

const MOCK_CERTIFICATES: Certificate[] = [
  { id: 'cert1', title: 'MADLeague Season 6 수료증', recipientName: '김마케팅', issuedDate: '2025-12-01', type: '수료증', status: 'issued', courseOrEvent: 'MADLeague S6', certNumber: 'ML-S6-001' },
  { id: 'cert2', title: 'Evolution School 마케팅 과정 수료', recipientName: '이기획', issuedDate: '2026-01-15', type: '수료증', status: 'issued', courseOrEvent: '마케팅 실전 과정', certNumber: 'ES-MKT-023' },
  { id: 'cert3', title: 'ChangeUp 창업 교육 수료', recipientName: '박창업', issuedDate: '2026-02-28', type: '수료증', status: 'issued', courseOrEvent: 'ChangeUp 3기', certNumber: 'CU-003-012' },
  { id: 'cert4', title: 'HeRo HIT 역량 진단 인증', recipientName: '최인재', issuedDate: '2026-03-10', type: '인증서', status: 'issued', courseOrEvent: 'HIT 통합검사', certNumber: 'HR-HIT-089' },
  { id: 'cert5', title: 'MADLeague Season 7 참가 확인서', recipientName: '정광고', issuedDate: '', type: '참가확인서', status: 'draft', courseOrEvent: 'MADLeague S7', certNumber: 'ML-S7-TBD' },
];

export default function CertificatePage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const types = ['all', ...new Set(MOCK_CERTIFICATES.map(c => c.type))];
  const filtered = MOCK_CERTIFICATES.filter(c => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (searchQuery && !c.title.includes(searchQuery) && !c.recipientName.includes(searchQuery) && !c.certNumber.includes(searchQuery)) return false;
    return true;
  });

  const stats = {
    total: MOCK_CERTIFICATES.length,
    issued: MOCK_CERTIFICATES.filter(c => c.status === 'issued').length,
    draft: MOCK_CERTIFICATES.filter(c => c.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Award className="w-5 h-5 text-amber-400" /> 수료증/인증서</h1>
          <p className="text-sm text-slate-500 mt-0.5">수료증, 인증서, 참가확인서 발급 관리{isDemo ? ' (데모)' : ''}</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors">
          <Plus size={14} /> 발급하기
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">전체</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">발급됨</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.issued}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">초안</div>
          <div className="text-2xl font-bold text-slate-400">{stats.draft}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="이름, 제목, 번호 검색..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="flex gap-1">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${typeFilter === t ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              {t === 'all' ? '전체' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Certificate List */}
      <div className="border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="text-left py-3 px-4 text-xs text-slate-500 font-semibold">제목</th>
              <th className="text-left py-3 px-4 text-xs text-slate-500 font-semibold">수여자</th>
              <th className="text-left py-3 px-4 text-xs text-slate-500 font-semibold">유형</th>
              <th className="text-left py-3 px-4 text-xs text-slate-500 font-semibold">발급일</th>
              <th className="text-left py-3 px-4 text-xs text-slate-500 font-semibold">상태</th>
              <th className="py-3 px-4 text-xs text-slate-500 font-semibold text-right">번호</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cert => {
              const st = STATUS_CONFIG[cert.status];
              return (
                <tr key={cert.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="py-3 px-4 text-sm font-medium text-white">{cert.title}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{cert.recipientName}</td>
                  <td className="py-3 px-4"><span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">{cert.type}</span></td>
                  <td className="py-3 px-4 text-sm text-slate-500">{cert.issuedDate || '—'}</td>
                  <td className="py-3 px-4"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${st.color}`}>{st.label}</span></td>
                  <td className="py-3 px-4 text-right text-xs text-slate-600 font-mono">{cert.certNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-600"><Award className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">결과 없음</p></div>
        )}
      </div>
    </div>
  );
}
