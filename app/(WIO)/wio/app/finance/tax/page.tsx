'use client';

import { useState, useEffect } from 'react';
import { FileText, Calculator, Receipt } from 'lucide-react';
import { useWIO } from '../../layout';
// TODO: Supabase 테이블 생성 후 연동 예정

type VatReport = {
  month: string;
  salesVat: number;
  purchaseVat: number;
  payable: number;
  status: 'filed' | 'pending' | 'upcoming';
  filedDate?: string;
};

type TaxInvoice = {
  id: string;
  date: string;
  counterpart: string;
  type: 'sales' | 'purchase';
  supplyAmount: number;
  vat: number;
  total: number;
};

const MOCK_VAT: VatReport[] = [
  { month: '2026-03', salesVat: 12500000, purchaseVat: 8200000, payable: 4300000, status: 'upcoming' },
  { month: '2026-02', salesVat: 11800000, purchaseVat: 7500000, payable: 4300000, status: 'pending' },
  { month: '2026-01', salesVat: 13200000, purchaseVat: 9100000, payable: 4100000, status: 'filed', filedDate: '2026-02-25' },
  { month: '2025-12', salesVat: 15600000, purchaseVat: 10200000, payable: 5400000, status: 'filed', filedDate: '2026-01-25' },
  { month: '2025-11', salesVat: 10500000, purchaseVat: 6800000, payable: 3700000, status: 'filed', filedDate: '2025-12-25' },
  { month: '2025-10', salesVat: 11200000, purchaseVat: 7400000, payable: 3800000, status: 'filed', filedDate: '2025-11-25' },
];

const MOCK_INVOICES: TaxInvoice[] = [
  { id: 'TI-001', date: '2026-03-28', counterpart: '(주)스마트미디어', type: 'sales', supplyAmount: 35000000, vat: 3500000, total: 38500000 },
  { id: 'TI-002', date: '2026-03-25', counterpart: '한국IT솔루션', type: 'purchase', supplyAmount: 12000000, vat: 1200000, total: 13200000 },
  { id: 'TI-003', date: '2026-03-22', counterpart: '글로벌테크', type: 'sales', supplyAmount: 22000000, vat: 2200000, total: 24200000 },
  { id: 'TI-004', date: '2026-03-20', counterpart: '클라우드코리아', type: 'purchase', supplyAmount: 24000000, vat: 2400000, total: 26400000 },
  { id: 'TI-005', date: '2026-03-18', counterpart: '넥스트이노베이션', type: 'sales', supplyAmount: 45000000, vat: 4500000, total: 49500000 },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  filed: { label: '신고완료', color: 'text-emerald-400 bg-emerald-500/10' },
  pending: { label: '신고대기', color: 'text-amber-400 bg-amber-500/10' },
  upcoming: { label: '집계중', color: 'text-blue-400 bg-blue-500/10' },
};

export default function TaxPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<'vat' | 'invoices' | 'corporate'>('vat');
  // TODO: Supabase 세무 테이블 생성 후 연동 (현재 Mock 폴백)

  const estimatedCorporateTax = 68000000;
  const taxableIncome = 340000000;
  const taxRate = 20;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">세무관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">FIN-TAX &middot; Tax Management</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'vat' as const, label: '부가세 신고' },
          { id: 'invoices' as const, label: '세금계산서' },
          { id: 'corporate' as const, label: '법인세' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 부가세 신고 현황 */}
      {tab === 'vat' && (
        <div className="space-y-2">
          {MOCK_VAT.map(v => {
            const st = STATUS_MAP[v.status];
            return (
              <div key={v.month} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{v.month}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    {v.filedDate && <span className="text-[10px] text-slate-600">({v.filedDate} 신고)</span>}
                  </div>
                  <span className="text-sm font-bold text-red-300">납부 {v.payable.toLocaleString()}원</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-600">매출세액</span>
                    <div className="font-mono text-indigo-300 mt-0.5">{v.salesVat.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">매입세액</span>
                    <div className="font-mono text-emerald-300 mt-0.5">{v.purchaseVat.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">납부세액</span>
                    <div className="font-mono text-amber-300 mt-0.5">{v.payable.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 세금계산서 목록 */}
      {tab === 'invoices' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-500">
                <th className="text-left px-4 py-3">번호</th>
                <th className="text-left px-4 py-3">일자</th>
                <th className="text-left px-4 py-3">거래처</th>
                <th className="text-center px-4 py-3">구분</th>
                <th className="text-right px-4 py-3">공급가액</th>
                <th className="text-right px-4 py-3">세액</th>
                <th className="text-right px-4 py-3">합계</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map(inv => (
                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{inv.id}</td>
                  <td className="px-4 py-2.5 text-slate-400">{inv.date}</td>
                  <td className="px-4 py-2.5 font-medium">{inv.counterpart}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${inv.type === 'sales' ? 'text-blue-400 bg-blue-500/10' : 'text-orange-400 bg-orange-500/10'}`}>
                      {inv.type === 'sales' ? '매출' : '매입'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{inv.supplyAmount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-400">{inv.vat.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-indigo-300">{inv.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 법인세 예상 */}
      {tab === 'corporate' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator size={20} className="text-indigo-400" />
            <h3 className="text-lg font-semibold">2025 사업연도 법인세 예상</h3>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
              <div className="text-xs text-slate-500 mb-2">과세표준</div>
              <div className="text-xl font-bold">{taxableIncome.toLocaleString()}원</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
              <div className="text-xs text-slate-500 mb-2">적용세율</div>
              <div className="text-xl font-bold text-amber-400">{taxRate}%</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
              <div className="text-xs text-slate-500 mb-2">예상 법인세</div>
              <div className="text-xl font-bold text-red-400">{estimatedCorporateTax.toLocaleString()}원</div>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-4 text-center">* 세무 검토 전 예상치이며, 공제/감면 적용 전 금액입니다</p>
        </div>
      )}
    </div>
  );
}
