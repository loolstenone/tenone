'use client';

import { useState } from 'react';
import {
  Plus, FileText, Send, Eye, Download, ChevronDown, X, Check, Clock, AlertCircle,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Types ── */
type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
type LineItem = { name: string; qty: number; unitPrice: number };
type Quote = {
  id: string;
  number: string;
  customer: string;
  items: LineItem[];
  taxRate: number;
  status: QuoteStatus;
  validUntil: string;
  sentDate: string | null;
  viewedDate: string | null;
  createdAt: string;
};

const STATUS_MAP: Record<QuoteStatus, { label: string; color: string; icon: typeof Check }> = {
  draft: { label: '작성중', color: 'text-slate-400 bg-slate-500/10', icon: FileText },
  sent: { label: '발송됨', color: 'text-blue-400 bg-blue-500/10', icon: Send },
  viewed: { label: '열람됨', color: 'text-violet-400 bg-violet-500/10', icon: Eye },
  accepted: { label: '승인됨', color: 'text-emerald-400 bg-emerald-500/10', icon: Check },
  rejected: { label: '거절됨', color: 'text-red-400 bg-red-500/10', icon: X },
  expired: { label: '만료됨', color: 'text-amber-400 bg-amber-500/10', icon: AlertCircle },
};

/* ── Mock data: 8 quotes ── */
const MOCK_QUOTES: Quote[] = [
  { id: 'q1', number: 'QT-2026-001', customer: '삼성SDS', items: [{ name: 'WIO Pro 연간 라이선스', qty: 1, unitPrice: 17880000 }, { name: '초기 세팅 및 커스터마이징', qty: 1, unitPrice: 5000000 }, { name: '교육 (2일)', qty: 1, unitPrice: 2000000 }], taxRate: 10, status: 'viewed', validUntil: '2026-04-30', sentDate: '2026-03-20', viewedDate: '2026-03-22', createdAt: '2026-03-18' },
  { id: 'q2', number: 'QT-2026-002', customer: 'LG CNS', items: [{ name: 'WIO Business 연간 라이선스', qty: 1, unitPrice: 47880000 }, { name: '마케팅 자동화 모듈', qty: 1, unitPrice: 12000000 }], taxRate: 10, status: 'sent', validUntil: '2026-04-15', sentDate: '2026-03-25', viewedDate: null, createdAt: '2026-03-24' },
  { id: 'q3', number: 'QT-2026-003', customer: '카카오엔터프라이즈', items: [{ name: 'WIO Starter 연간 라이선스', qty: 1, unitPrice: 5880000 }, { name: '온보딩 지원', qty: 1, unitPrice: 1000000 }], taxRate: 10, status: 'accepted', validUntil: '2026-03-31', sentDate: '2026-03-10', viewedDate: '2026-03-11', createdAt: '2026-03-08' },
  { id: 'q4', number: 'QT-2026-004', customer: '네이버클라우드', items: [{ name: 'WIO Pro 연간 라이선스', qty: 2, unitPrice: 17880000 }, { name: 'API 연동 개발', qty: 1, unitPrice: 8000000 }], taxRate: 10, status: 'draft', validUntil: '2026-05-15', sentDate: null, viewedDate: null, createdAt: '2026-03-27' },
  { id: 'q5', number: 'QT-2026-005', customer: '배달의민족', items: [{ name: 'WIO Business 연간 라이선스', qty: 1, unitPrice: 47880000 }], taxRate: 10, status: 'rejected', validUntil: '2026-03-15', sentDate: '2026-02-28', viewedDate: '2026-03-01', createdAt: '2026-02-25' },
  { id: 'q6', number: 'QT-2026-006', customer: '당근', items: [{ name: 'WIO Business 연간 라이선스', qty: 1, unitPrice: 47880000 }, { name: 'SCM 모듈 추가', qty: 1, unitPrice: 15000000 }, { name: '데이터 마이그레이션', qty: 1, unitPrice: 3000000 }], taxRate: 10, status: 'viewed', validUntil: '2026-04-20', sentDate: '2026-03-18', viewedDate: '2026-03-19', createdAt: '2026-03-15' },
  { id: 'q7', number: 'QT-2026-007', customer: '리디', items: [{ name: 'WIO Starter 연간 라이선스', qty: 1, unitPrice: 5880000 }], taxRate: 10, status: 'accepted', validUntil: '2026-03-31', sentDate: '2026-03-15', viewedDate: '2026-03-15', createdAt: '2026-03-14' },
  { id: 'q8', number: 'QT-2026-008', customer: '야놀자', items: [{ name: 'WIO Pro 연간 라이선스', qty: 1, unitPrice: 17880000 }, { name: '초기 세팅', qty: 1, unitPrice: 3000000 }], taxRate: 10, status: 'expired', validUntil: '2026-03-01', sentDate: '2026-02-15', viewedDate: '2026-02-16', createdAt: '2026-02-10' },
];

const fmtKRW = (n: number) => n.toLocaleString('ko-KR') + '원';

function calcQuote(q: Quote) {
  const subtotal = q.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = Math.round(subtotal * q.taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export default function QuotePage() {
  const { isDemo } = useWIO();
  const [quotes] = useState<Quote[]>(MOCK_QUOTES);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [selected, setSelected] = useState<Quote | null>(null);
  const [editMode, setEditMode] = useState(false);

  const filtered = statusFilter === 'all' ? quotes : quotes.filter(q => q.status === statusFilter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">견적 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">SAL-QOT · 총 {quotes.length}건</p>
        </div>
        <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 견적 작성
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg ${statusFilter === s ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {s === 'all' ? '전체' : STATUS_MAP[s].label} {s !== 'all' && `(${quotes.filter(q => q.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Quote list */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.02] text-xs text-slate-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">번호</th>
              <th className="text-left px-4 py-3">고객</th>
              <th className="text-right px-4 py-3">금액 (VAT포함)</th>
              <th className="text-center px-4 py-3">상태</th>
              <th className="text-center px-4 py-3">유효기간</th>
              <th className="text-center px-4 py-3">발송</th>
              <th className="text-center px-4 py-3">열람</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => {
              const { total } = calcQuote(q);
              const st = STATUS_MAP[q.status];
              return (
                <tr key={q.id} onClick={() => setSelected(q)} className="border-t border-white/5 hover:bg-white/[0.02] cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs">{q.number}</td>
                  <td className="px-4 py-3 font-medium">{q.customer}</td>
                  <td className="px-4 py-3 text-right font-bold text-indigo-300">{fmtKRW(total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-400">{q.validUntil}</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500">{q.sentDate || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {q.viewedDate ? <Eye size={14} className="mx-auto text-violet-400" /> : <span className="text-xs text-slate-600">-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail / Edit modal */}
      {(selected || editMode) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setSelected(null); setEditMode(false); }} />
          <div className="relative w-full max-w-2xl bg-[#0f1117] border border-white/5 rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editMode && !selected ? '견적서 작성' : `견적서 ${selected?.number}`}</h2>
              <button onClick={() => { setSelected(null); setEditMode(false); }} className="p-1 rounded hover:bg-white/5"><X size={18} /></button>
            </div>

            {selected && !editMode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">고객: <span className="text-white font-medium">{selected.customer}</span></div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_MAP[selected.status].color}`}>{STATUS_MAP[selected.status].label}</span>
                </div>

                {/* Line items table */}
                <div className="rounded-lg border border-white/5 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.03] text-xs text-slate-500">
                        <th className="text-left px-3 py-2">품목</th>
                        <th className="text-center px-3 py-2">수량</th>
                        <th className="text-right px-3 py-2">단가</th>
                        <th className="text-right px-3 py-2">금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((item, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2 text-center">{item.qty}</td>
                          <td className="px-3 py-2 text-right text-slate-400">{fmtKRW(item.unitPrice)}</td>
                          <td className="px-3 py-2 text-right font-medium">{fmtKRW(item.qty * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                {(() => {
                  const { subtotal, tax, total } = calcQuote(selected);
                  return (
                    <div className="space-y-1 text-sm text-right">
                      <div className="text-slate-400">소계: {fmtKRW(subtotal)}</div>
                      <div className="text-slate-400">부가세 ({selected.taxRate}%): {fmtKRW(tax)}</div>
                      <div className="text-lg font-bold text-indigo-300 pt-1 border-t border-white/5">합계: {fmtKRW(total)}</div>
                    </div>
                  );
                })()}

                {/* Tracking */}
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2"><Clock size={12} />작성일: {selected.createdAt}</div>
                  <div className="flex items-center gap-2"><Send size={12} />발송일: {selected.sentDate || '미발송'}</div>
                  <div className="flex items-center gap-2"><Eye size={12} />열람일: {selected.viewedDate || '미열람'}</div>
                  <div className="flex items-center gap-2"><AlertCircle size={12} />유효기간: {selected.validUntil}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"><Download size={14} />PDF 다운로드</button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><Send size={14} />발송하기</button>
                </div>
              </div>
            ) : (
              /* Create mode placeholder */
              <div className="text-center py-12">
                <FileText size={36} className="mx-auto mb-3 text-slate-700" />
                <p className="text-sm text-slate-400">견적서 작성 기능</p>
                <p className="text-xs text-slate-600 mt-1">라인아이템 추가, 소계/세금/합계 자동 계산</p>
                {isDemo && <p className="text-xs text-amber-500/80 mt-3">데모 모드에서는 미리보기만 가능합니다</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
