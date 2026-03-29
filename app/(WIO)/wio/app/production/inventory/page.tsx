'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Warehouse, PackageSearch, ArrowDownToLine, ArrowUpFromLine,
  BarChart3, ClipboardCheck, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type StockStatus = 'normal' | 'low' | 'overstock' | 'out';
type IOType = 'in' | 'out';
type ABCClass = 'A' | 'B' | 'C';

const STOCK_STATUS_LABEL: Record<StockStatus, string> = { normal: '정상', low: '부족', overstock: '과잉', out: '품절' };
const STOCK_STATUS_COLOR: Record<StockStatus, string> = {
  normal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  low: 'text-red-400 bg-red-500/10 border-red-500/20',
  overstock: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  out: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const ABC_COLORS: Record<ABCClass, string> = {
  A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  B: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

interface InventoryItem {
  id: string; name: string; sku: string; current: number; safety: number;
  location: string; status: StockStatus; unit: string; abc: ABCClass; value: number;
}

interface IORecord {
  id: string; type: IOType; date: string; item: string; qty: number; ref: string; unit: string;
}

const MOCK_ITEMS: InventoryItem[] = [
  { id: 'i1', name: '27인치 모니터', sku: 'MON-27-001', current: 25, safety: 10, location: '창고A-1', status: 'normal', unit: '대', abc: 'A', value: 12000000 },
  { id: 'i2', name: '맥북 프로 16"', sku: 'LAP-MB-016', current: 3, safety: 5, location: '창고A-2', status: 'low', unit: '대', abc: 'A', value: 16800000 },
  { id: 'i3', name: '사무용 의자', sku: 'FUR-CH-001', current: 42, safety: 20, location: '창고B-1', status: 'overstock', unit: '개', abc: 'B', value: 8400000 },
  { id: 'i4', name: 'USB-C 허브', sku: 'ACC-HUB-01', current: 0, safety: 15, location: '창고A-3', status: 'out', unit: '개', abc: 'C', value: 0 },
  { id: 'i5', name: '무선 키보드', sku: 'ACC-KB-001', current: 18, safety: 10, location: '창고A-3', status: 'normal', unit: '개', abc: 'B', value: 1800000 },
  { id: 'i6', name: '무선 마우스', sku: 'ACC-MS-001', current: 22, safety: 10, location: '창고A-3', status: 'normal', unit: '개', abc: 'C', value: 1100000 },
  { id: 'i7', name: '네트워크 스위치', sku: 'NET-SW-001', current: 4, safety: 3, location: '서버실', status: 'normal', unit: '대', abc: 'A', value: 2400000 },
  { id: 'i8', name: 'A4 복사용지', sku: 'OFC-PP-001', current: 8, safety: 20, location: '창고C-1', status: 'low', unit: '박스', abc: 'C', value: 160000 },
  { id: 'i9', name: '모니터 암', sku: 'ACC-ARM-01', current: 15, safety: 5, location: '창고A-1', status: 'normal', unit: '개', abc: 'B', value: 1500000 },
  { id: 'i10', name: '화이트보드', sku: 'OFC-WB-001', current: 6, safety: 3, location: '창고B-2', status: 'normal', unit: '개', abc: 'C', value: 600000 },
  { id: 'i11', name: 'UPS 무정전전원', sku: 'NET-UPS-01', current: 2, safety: 2, location: '서버실', status: 'normal', unit: '대', abc: 'A', value: 1600000 },
  { id: 'i12', name: '웹캠 HD', sku: 'ACC-CAM-01', current: 7, safety: 10, location: '창고A-3', status: 'low', unit: '개', abc: 'C', value: 490000 },
];

const MOCK_IO: IORecord[] = [
  { id: 'io1', type: 'in', date: '2026-03-28', item: '27인치 모니터', qty: 10, ref: 'PO-2026-015', unit: '대' },
  { id: 'io2', type: 'out', date: '2026-03-27', item: '맥북 프로 16"', qty: 2, ref: 'REQ-2026-042', unit: '대' },
  { id: 'io3', type: 'in', date: '2026-03-26', item: '사무용 의자', qty: 15, ref: 'PO-2026-014', unit: '개' },
  { id: 'io4', type: 'out', date: '2026-03-25', item: '무선 키보드', qty: 5, ref: 'REQ-2026-040', unit: '개' },
  { id: 'io5', type: 'out', date: '2026-03-24', item: 'USB-C 허브', qty: 8, ref: 'REQ-2026-038', unit: '개' },
  { id: 'io6', type: 'in', date: '2026-03-23', item: '네트워크 스위치', qty: 2, ref: 'PO-2026-013', unit: '대' },
  { id: 'io7', type: 'out', date: '2026-03-22', item: '무선 마우스', qty: 3, ref: 'REQ-2026-035', unit: '개' },
  { id: 'io8', type: 'in', date: '2026-03-20', item: '모니터 암', qty: 10, ref: 'PO-2026-012', unit: '개' },
];

export default function InventoryPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [ioRecords, setIoRecords] = useState<IORecord[]>([]);
  const [ioTab, setIoTab] = useState<'all' | 'in' | 'out'>('all');
  const [showAudit, setShowAudit] = useState(false);

  // Supabase에서 재고 + 입출고 로드
  const loadInventory = useCallback(async () => {
    if (isDemo) {
      setItems(MOCK_ITEMS);
      setIoRecords(MOCK_IO);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sb = createClient();
      const [invRes, movRes] = await Promise.all([
        sb.from('wio_inventory').select('*').eq('tenant_id', tenant!.id),
        sb.from('wio_inventory_movements').select('*').eq('tenant_id', tenant!.id).order('created_at', { ascending: false }).limit(20),
      ]);
      if (invRes.data && invRes.data.length > 0) {
        setItems(invRes.data.map((row: any) => ({
          id: row.id, name: row.name || '', sku: row.sku || '',
          current: row.current_qty ?? 0, safety: row.safety_qty ?? 0,
          location: row.location || '', status: row.status || 'normal',
          unit: row.unit || '', abc: row.abc_class || 'C', value: row.value ?? 0,
        })));
      } else {
        setItems(MOCK_ITEMS);
      }
      if (movRes.data && movRes.data.length > 0) {
        setIoRecords(movRes.data.map((row: any) => ({
          id: row.id, type: row.type || 'in',
          date: row.created_at ? row.created_at.split('T')[0] : '',
          item: row.item_name || '', qty: row.qty ?? 0,
          ref: row.reference || '', unit: row.unit || '',
        })));
      } else {
        setIoRecords(MOCK_IO);
      }
    } catch {
      setItems(MOCK_ITEMS);
      setIoRecords(MOCK_IO);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => {
    if (!tenant) return;
    loadInventory();
  }, [tenant, loadInventory]);

  const lowStockItems = items.filter(i => i.status === 'low' || i.status === 'out');
  const abcGroups = {
    A: items.filter(i => i.abc === 'A'),
    B: items.filter(i => i.abc === 'B'),
    C: items.filter(i => i.abc === 'C'),
  };
  const totalValue = items.reduce((s, i) => s + i.value, 0);
  const abcValues = {
    A: abcGroups.A.reduce((s, i) => s + i.value, 0),
    B: abcGroups.B.reduce((s, i) => s + i.value, 0),
    C: abcGroups.C.reduce((s, i) => s + i.value, 0),
  };

  const filteredIO = ioTab === 'all' ? ioRecords : ioRecords.filter(r => r.type === ioTab);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">재고 관리</h1>
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
          <h1 className="text-xl font-bold">재고 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">PRD-INV | {items.length}개 품목 / 총 {totalValue.toLocaleString()}원</p>
        </div>
        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5">
            <AlertTriangle size={13} className="text-red-400" />
            <span className="text-xs font-semibold text-red-400">안전재고 미달 {lowStockItems.length}건</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" /> 안전재고 미달 알림
            </h2>
            <div className="space-y-2">
              {lowStockItems.map(i => (
                <div key={i.id} className="flex items-center gap-3 rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STOCK_STATUS_COLOR[i.status]}`}>
                    {STOCK_STATUS_LABEL[i.status]}
                  </span>
                  <span className="text-sm font-medium flex-1">{i.name}</span>
                  <span className="text-xs text-red-400 font-bold">{i.current}{i.unit}</span>
                  <span className="text-[10px] text-slate-500">/ 안전 {i.safety}{i.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Warehouse size={15} className="text-blue-400" /> 재고 현황
          </h2>
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 text-[10px] text-slate-600 border-b border-white/5 mb-1">
            <span className="w-32">품목</span>
            <span className="w-24">SKU</span>
            <span className="w-14 text-right">현재고</span>
            <span className="w-14 text-right">안전재고</span>
            <span className="w-16">위치</span>
            <span className="w-10 text-center">ABC</span>
            <span className="flex-1 text-right">상태</span>
          </div>
          <div className="space-y-1">
            {items.map(i => (
              <div key={i.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${(i.status === 'low' || i.status === 'out') ? 'bg-red-500/5' : 'bg-white/[0.02]'}`}>
                <span className="w-32 text-xs font-medium truncate">{i.name}</span>
                <span className="w-24 text-[10px] text-slate-500 font-mono">{i.sku}</span>
                <span className={`w-14 text-right text-xs font-bold ${i.current < i.safety ? 'text-red-400' : 'text-slate-300'}`}>{i.current}</span>
                <span className="w-14 text-right text-[10px] text-slate-500">{i.safety}</span>
                <span className="w-16 text-[10px] text-slate-500">{i.location}</span>
                <span className={`w-10 text-center text-[10px] font-bold px-1 py-0.5 rounded border ${ABC_COLORS[i.abc]}`}>{i.abc}</span>
                <span className={`flex-1 text-right text-[10px] px-1.5 py-0.5 rounded border inline-flex justify-end ${STOCK_STATUS_COLOR[i.status]}`}>
                  {STOCK_STATUS_LABEL[i.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* IO Records */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <PackageSearch size={15} className="text-emerald-400" /> 입출고 기록
            </h2>
            <div className="flex gap-1.5">
              {([
                { id: 'all' as const, label: '전체' },
                { id: 'in' as const, label: '입고' },
                { id: 'out' as const, label: '출고' },
              ]).map(tab => (
                <button key={tab.id} onClick={() => setIoTab(tab.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${ioTab === tab.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            {filteredIO.map(r => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2">
                {r.type === 'in'
                  ? <ArrowDownToLine size={13} className="text-emerald-400 shrink-0" />
                  : <ArrowUpFromLine size={13} className="text-orange-400 shrink-0" />
                }
                <span className="text-[10px] text-slate-600 w-20 shrink-0">{r.date}</span>
                <span className="text-xs flex-1">{r.item}</span>
                <span className={`text-xs font-bold ${r.type === 'in' ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {r.type === 'in' ? '+' : '-'}{r.qty}{r.unit}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{r.ref}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ABC Analysis */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={15} className="text-violet-400" /> ABC 분석
          </h2>
          <div className="flex h-6 rounded-lg overflow-hidden mb-3">
            {totalValue > 0 && (
              <>
                <div className="bg-emerald-500/60 flex items-center justify-center text-[10px] font-bold"
                  style={{ width: `${(abcValues.A / totalValue * 100).toFixed(0)}%` }}>
                  A {(abcValues.A / totalValue * 100).toFixed(0)}%
                </div>
                <div className="bg-blue-500/60 flex items-center justify-center text-[10px] font-bold"
                  style={{ width: `${(abcValues.B / totalValue * 100).toFixed(0)}%` }}>
                  B {(abcValues.B / totalValue * 100).toFixed(0)}%
                </div>
                <div className="bg-slate-500/60 flex items-center justify-center text-[10px] font-bold"
                  style={{ width: `${(abcValues.C / totalValue * 100).toFixed(0)}%` }}>
                  C {(abcValues.C / totalValue * 100).toFixed(0)}%
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([
              { cls: 'A' as ABCClass, label: 'A등급 (상위 20%)', desc: '고가치 핵심 품목', color: 'text-emerald-400' },
              { cls: 'B' as ABCClass, label: 'B등급 (중간 30%)', desc: '중요도 보통 품목', color: 'text-blue-400' },
              { cls: 'C' as ABCClass, label: 'C등급 (하위 50%)', desc: '소모성/저가 품목', color: 'text-slate-400' },
            ]).map(g => (
              <div key={g.cls} className="rounded-lg bg-white/[0.02] p-3 text-center">
                <p className={`text-lg font-bold ${g.color}`}>{abcGroups[g.cls].length}개</p>
                <p className="text-xs font-medium mt-1">{g.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{g.desc}</p>
                <p className="text-[10px] text-slate-600 mt-1">{abcValues[g.cls].toLocaleString()}원</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audit */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <button onClick={() => setShowAudit(!showAudit)} className="w-full flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <ClipboardCheck size={15} className="text-amber-400" /> 재고 실사
            </h2>
            {showAudit ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </button>
          {showAudit && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] text-slate-500">최근 실사일</p>
                  <p className="text-sm font-bold mt-1">2026-03-15</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] text-slate-500">실사 품목</p>
                  <p className="text-sm font-bold mt-1">12건</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] text-slate-500">차이 건수</p>
                  <p className="text-sm font-bold text-amber-400 mt-1">2건</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2">
                  <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                  <span className="text-xs flex-1">USB-C 허브 — 장부 8개, 실사 0개 (차이 -8)</span>
                  <span className="text-[10px] text-amber-400">조사중</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2">
                  <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                  <span className="text-xs flex-1">사무용 의자 — 장부 40개, 실사 42개 (차이 +2)</span>
                  <span className="text-[10px] text-emerald-400">확인완료</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
