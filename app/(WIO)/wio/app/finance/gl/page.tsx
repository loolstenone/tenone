'use client';

import { useState } from 'react';
import { BookOpen, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { useWIO } from '../../layout';

type JournalEntry = {
  id: string;
  date: string;
  description: string;
  debit: { account: string; amount: number }[];
  credit: { account: string; amount: number }[];
  status: 'posted' | 'draft';
};

type AccountNode = {
  code: string;
  name: string;
  balance: number;
  children?: AccountNode[];
};

const ACCOUNT_TREE: AccountNode[] = [
  {
    code: '1', name: '자산', balance: 528000000, children: [
      { code: '101', name: '현금및현금성자산', balance: 180000000 },
      { code: '102', name: '매출채권', balance: 95000000 },
      { code: '103', name: '재고자산', balance: 42000000 },
      { code: '110', name: '유형자산', balance: 156000000 },
      { code: '120', name: '무형자산', balance: 55000000 },
    ]
  },
  {
    code: '2', name: '부채', balance: 198000000, children: [
      { code: '201', name: '매입채무', balance: 68000000 },
      { code: '202', name: '미지급금', balance: 45000000 },
      { code: '210', name: '차입금', balance: 85000000 },
    ]
  },
  {
    code: '3', name: '자본', balance: 330000000, children: [
      { code: '301', name: '자본금', balance: 200000000 },
      { code: '302', name: '이익잉여금', balance: 130000000 },
    ]
  },
  {
    code: '4', name: '수익', balance: 420000000, children: [
      { code: '401', name: '매출액', balance: 380000000 },
      { code: '402', name: '이자수익', balance: 12000000 },
      { code: '403', name: '기타수익', balance: 28000000 },
    ]
  },
  {
    code: '5', name: '비용', balance: 352000000, children: [
      { code: '501', name: '급여', balance: 185000000 },
      { code: '502', name: '임차료', balance: 48000000 },
      { code: '503', name: '감가상각비', balance: 32000000 },
      { code: '504', name: '광고선전비', balance: 45000000 },
      { code: '505', name: '기타비용', balance: 42000000 },
    ]
  },
];

const MOCK_ENTRIES: JournalEntry[] = [
  { id: 'JE-001', date: '2026-03-28', description: '3월 급여 지급', debit: [{ account: '501 급여', amount: 18500000 }], credit: [{ account: '101 현금', amount: 18500000 }], status: 'posted' },
  { id: 'JE-002', date: '2026-03-27', description: '사무실 임차료 납부', debit: [{ account: '502 임차료', amount: 4000000 }], credit: [{ account: '101 현금', amount: 4000000 }], status: 'posted' },
  { id: 'JE-003', date: '2026-03-26', description: '프로젝트 매출 입금', debit: [{ account: '101 현금', amount: 25000000 }], credit: [{ account: '401 매출액', amount: 25000000 }], status: 'posted' },
  { id: 'JE-004', date: '2026-03-25', description: '광고비 집행', debit: [{ account: '504 광고선전비', amount: 3200000 }], credit: [{ account: '202 미지급금', amount: 3200000 }], status: 'posted' },
  { id: 'JE-005', date: '2026-03-24', description: 'SW 라이선스 구매', debit: [{ account: '120 무형자산', amount: 5500000 }], credit: [{ account: '101 현금', amount: 5500000 }], status: 'posted' },
  { id: 'JE-006', date: '2026-03-23', description: '매출채권 회수', debit: [{ account: '101 현금', amount: 15000000 }], credit: [{ account: '102 매출채권', amount: 15000000 }], status: 'posted' },
  { id: 'JE-007', date: '2026-03-22', description: '소모품 구매', debit: [{ account: '505 기타비용', amount: 850000 }], credit: [{ account: '101 현금', amount: 850000 }], status: 'posted' },
  { id: 'JE-008', date: '2026-03-21', description: '이자수익 입금', debit: [{ account: '101 현금', amount: 1200000 }], credit: [{ account: '402 이자수익', amount: 1200000 }], status: 'posted' },
  { id: 'JE-009', date: '2026-03-20', description: '컨설팅 용역 매출', debit: [{ account: '102 매출채권', amount: 12000000 }], credit: [{ account: '401 매출액', amount: 12000000 }], status: 'draft' },
  { id: 'JE-010', date: '2026-03-19', description: '차입금 이자 지급', debit: [{ account: '505 기타비용', amount: 2100000 }], credit: [{ account: '101 현금', amount: 2100000 }], status: 'posted' },
];

function AccountTreeNode({ node, level = 0 }: { node: AccountNode; level?: number }) {
  const [open, setOpen] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-white/5 ${level === 0 ? 'font-semibold text-sm' : 'text-xs text-slate-400'}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <span className="w-3" />}
        <span className="text-slate-500 font-mono">{node.code}</span>
        <span className="flex-1">{node.name}</span>
        <span className="font-mono text-right">{node.balance.toLocaleString()}</span>
      </div>
      {open && hasChildren && node.children!.map(c => <AccountTreeNode key={c.code} node={c} level={level + 1} />)}
    </div>
  );
}

export default function GLPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [tab, setTab] = useState<'entries' | 'chart' | 'trial'>('entries');
  const [showForm, setShowForm] = useState(false);

  const trialBalance = ACCOUNT_TREE.map(cat => ({
    name: cat.name,
    debit: ['1', '5'].includes(cat.code) ? cat.balance : 0,
    credit: ['2', '3', '4'].includes(cat.code) ? cat.balance : 0,
  }));
  const totalDebit = trialBalance.reduce((s, r) => s + r.debit, 0);
  const totalCredit = trialBalance.reduce((s, r) => s + r.credit, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">총계정원장</h1>
          <p className="text-xs text-slate-500 mt-0.5">FIN-GL &middot; General Ledger</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 전표 입력
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'entries' as const, label: '전표 목록' },
          { id: 'chart' as const, label: '계정과목' },
          { id: 'trial' as const, label: '시산표' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 전표 입력 폼 */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="date" defaultValue="2026-03-29" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input placeholder="적요" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs text-slate-500">차변</p>
              <input placeholder="계정과목" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              <input type="number" placeholder="금액" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">대변</p>
              <input placeholder="계정과목" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              <input type="number" placeholder="금액" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">등록</button>
          </div>
        </div>
      )}

      {/* 전표 목록 */}
      {tab === 'entries' && (
        <div className="space-y-2">
          {MOCK_ENTRIES.map(e => (
            <div key={e.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{e.id}</span>
                  <span className="text-sm font-medium">{e.description}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.status === 'posted' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                    {e.status === 'posted' ? '전기' : '임시'}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{e.date}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-600">차변:</span>
                  {e.debit.map((d, i) => (
                    <span key={i} className="ml-2 text-slate-400">{d.account} <span className="text-indigo-300 font-mono">{d.amount.toLocaleString()}</span></span>
                  ))}
                </div>
                <div>
                  <span className="text-slate-600">대변:</span>
                  {e.credit.map((c, i) => (
                    <span key={i} className="ml-2 text-slate-400">{c.account} <span className="text-emerald-300 font-mono">{c.amount.toLocaleString()}</span></span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 계정과목 트리 */}
      {tab === 'chart' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          {ACCOUNT_TREE.map(node => <AccountTreeNode key={node.code} node={node} />)}
        </div>
      )}

      {/* 시산표 */}
      {tab === 'trial' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-500">
                <th className="text-left px-4 py-3">구분</th>
                <th className="text-right px-4 py-3">차변</th>
                <th className="text-right px-4 py-3">대변</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.map(r => (
                <tr key={r.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5">{r.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-indigo-300">{r.debit ? r.debit.toLocaleString() : '-'}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-300">{r.credit ? r.credit.toLocaleString() : '-'}</td>
                </tr>
              ))}
              <tr className="font-bold bg-white/[0.02]">
                <td className="px-4 py-3">합계</td>
                <td className="px-4 py-3 text-right font-mono text-indigo-400">{totalDebit.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-emerald-400">{totalCredit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
