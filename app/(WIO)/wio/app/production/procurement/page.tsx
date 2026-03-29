'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Package, Building2, DollarSign, Plus,
  ChevronRight, CheckCircle2, Clock, FileText, ArrowRight
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type RequestStatus = 'requested' | 'quoted' | 'approved' | 'ordered' | 'received';
type SupplierGrade = 'A' | 'B' | 'C' | 'D';

const STATUS_FLOW: { id: RequestStatus; label: string }[] = [
  { id: 'requested', label: '요청' },
  { id: 'quoted', label: '견적비교' },
  { id: 'approved', label: '승인' },
  { id: 'ordered', label: '발주' },
  { id: 'received', label: '입고' },
];

const STATUS_COLOR: Record<RequestStatus, string> = {
  requested: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  quoted: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  ordered: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  received: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

const GRADE_COLORS: Record<SupplierGrade, string> = {
  A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  B: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  D: 'text-red-400 bg-red-500/10 border-red-500/20',
};

interface PurchaseRequest {
  id: string; item: string; qty: number; unit: string;
  budget: number; deadline: string; reason: string;
  status: RequestStatus; requester: string; date: string;
}

interface Supplier {
  id: string; name: string; category: string; grade: SupplierGrade; score: number; contact: string;
}

const MOCK_REQUESTS: PurchaseRequest[] = [
  { id: 'PR-001', item: '27인치 모니터', qty: 10, unit: '대', budget: 5000000, deadline: '2026-04-15', reason: '신규 인력 장비 지급', status: 'approved', requester: '최수진', date: '2026-03-20' },
  { id: 'PR-002', item: 'AWS 서버 확장', qty: 1, unit: '건', budget: 3600000, deadline: '2026-04-01', reason: '트래픽 증가 대응', status: 'ordered', requester: '이준호', date: '2026-03-18' },
  { id: 'PR-003', item: '사무용 의자', qty: 15, unit: '개', budget: 7500000, deadline: '2026-04-20', reason: '사무실 확장', status: 'quoted', requester: '최수진', date: '2026-03-22' },
  { id: 'PR-004', item: '개발용 맥북 프로', qty: 3, unit: '대', budget: 12000000, deadline: '2026-04-10', reason: '백엔드팀 장비 교체', status: 'requested', requester: '한민수', date: '2026-03-25' },
  { id: 'PR-005', item: '네트워크 스위치', qty: 2, unit: '대', budget: 1200000, deadline: '2026-04-30', reason: '네트워크 인프라 개선', status: 'received', requester: '이준호', date: '2026-03-10' },
];

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: '코리아IT솔루션', category: 'IT장비', grade: 'A', score: 92, contact: 'sales@koreaits.com' },
  { id: 's2', name: '오피스퍼니처', category: '사무가구', grade: 'B', score: 78, contact: 'biz@officefurniture.kr' },
  { id: 's3', name: '클라우드원', category: '클라우드/서버', grade: 'A', score: 95, contact: 'enterprise@cloudone.io' },
  { id: 's4', name: '네트웍스', category: '네트워크', grade: 'C', score: 65, contact: 'info@networks.kr' },
];

const MOCK_PRICE_COMPARE = [
  { item: '27인치 모니터', suppliers: [
    { name: '코리아IT솔루션', price: 480000, delivery: '3일' },
    { name: '클라우드원', price: 520000, delivery: '5일' },
  ]},
  { item: '사무용 의자', suppliers: [
    { name: '오피스퍼니처', price: 450000, delivery: '7일' },
    { name: '코리아IT솔루션', price: 520000, delivery: '5일' },
  ]},
];

export default function ProcurementPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [priceCompare, setPriceCompare] = useState<typeof MOCK_PRICE_COMPARE>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'pipeline'>('list');

  // Supabase에서 구매요청 + 공급업체 로드
  const loadProcurement = useCallback(async () => {
    if (isDemo) {
      setRequests(MOCK_REQUESTS);
      setSuppliers(MOCK_SUPPLIERS);
      setPriceCompare(MOCK_PRICE_COMPARE);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sb = createClient();
      const [poRes, supRes] = await Promise.all([
        sb.from('wio_purchase_orders').select('*').eq('tenant_id', tenant!.id).order('created_at', { ascending: false }),
        sb.from('wio_suppliers').select('*').eq('tenant_id', tenant!.id),
      ]);
      if (poRes.data && poRes.data.length > 0) {
        setRequests(poRes.data.map((row: any) => ({
          id: row.id, item: row.item || '', qty: row.qty ?? 0, unit: row.unit || '',
          budget: row.budget ?? 0, deadline: row.deadline ? row.deadline.split('T')[0] : '',
          reason: row.reason || '', status: row.status || 'requested',
          requester: row.requester || '', date: row.created_at ? row.created_at.split('T')[0] : '',
        })));
      } else {
        setRequests(MOCK_REQUESTS);
      }
      if (supRes.data && supRes.data.length > 0) {
        setSuppliers(supRes.data.map((row: any) => ({
          id: row.id, name: row.name || '', category: row.category || '',
          grade: row.grade || 'C', score: row.score ?? 0, contact: row.contact || '',
        })));
      } else {
        setSuppliers(MOCK_SUPPLIERS);
      }
      setPriceCompare(MOCK_PRICE_COMPARE); // 단가비교는 집계 데이터이므로 Mock 유지
    } catch {
      setRequests(MOCK_REQUESTS);
      setSuppliers(MOCK_SUPPLIERS);
      setPriceCompare(MOCK_PRICE_COMPARE);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => {
    if (!tenant) return;
    loadProcurement();
  }, [tenant, loadProcurement]);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">구매/조달</h1>
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
          <h1 className="text-xl font-bold">구매/조달</h1>
          <p className="text-xs text-slate-500 mt-0.5">PRD-PRC | 요청 → 발주 → 입고</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-600/30 transition-colors">
          <Plus size={13} /> 구매요청
        </button>
      </div>

      <div className="space-y-6">
        {/* Create Form */}
        {showForm && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileText size={15} className="text-indigo-400" /> 구매요청 작성
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">품목</label>
                <input type="text" placeholder="품목명" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">수량</label>
                  <input type="number" placeholder="0" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">단위</label>
                  <input type="text" placeholder="개" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">예산 (원)</label>
                <input type="number" placeholder="0" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">납기일</label>
                <input type="date" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block mb-1">사유</label>
                <textarea rows={2} placeholder="구매 사유" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-300">취소</button>
              <button className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">요청</button>
            </div>
          </div>
        )}

        {/* View Toggle + Pipeline */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <ShoppingCart size={15} className="text-blue-400" /> 구매요청 관리
            </h2>
            <div className="flex gap-1.5">
              {(['list', 'pipeline'] as const).map(v => (
                <button key={v} onClick={() => setActiveView(v)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${activeView === v ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
                  {v === 'list' ? '목록' : '파이프라인'}
                </button>
              ))}
            </div>
          </div>

          {activeView === 'list' ? (
            <div className="space-y-2">
              {requests.map(r => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
                  <span className="text-[10px] text-slate-600 w-16 shrink-0">{r.id}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{r.item}</span>
                    <span className="text-[10px] text-slate-500 ml-2">{r.qty}{r.unit}</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">{r.budget.toLocaleString()}원</span>
                  <span className="text-[10px] text-slate-500">{r.deadline}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLOR[r.status]}`}>
                    {STATUS_FLOW.find(s => s.id === r.status)?.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Pipeline header */}
              <div className="flex gap-1">
                {STATUS_FLOW.map((s, i) => (
                  <div key={s.id} className="flex-1 flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 text-center w-full">{s.label}</span>
                    {i < STATUS_FLOW.length - 1 && <ArrowRight size={10} className="text-slate-700 shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {STATUS_FLOW.map(s => (
                  <div key={s.id} className="flex-1 space-y-1">
                    {requests.filter(r => r.status === s.id).map(r => (
                      <div key={r.id} className={`rounded p-2 text-[10px] border ${STATUS_COLOR[r.status]}`}>
                        <p className="font-medium truncate">{r.item}</p>
                        <p className="text-slate-500">{r.budget.toLocaleString()}원</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suppliers */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Building2 size={15} className="text-emerald-400" /> 공급업체
          </h2>
          <div className="space-y-2">
            {suppliers.map(s => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded border ${GRADE_COLORS[s.grade]}`}>{s.grade}</span>
                <div className="flex-1">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="text-[10px] text-slate-500 ml-2">{s.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full ${s.score >= 80 ? 'bg-emerald-500' : s.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{s.score}점</span>
                </div>
                <span className="text-[10px] text-slate-600">{s.contact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Comparison */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={15} className="text-amber-400" /> 단가 비교
          </h2>
          <div className="space-y-4">
            {priceCompare.map((pc, i) => (
              <div key={i}>
                <p className="text-xs font-medium mb-2">{pc.item}</p>
                <div className="space-y-1">
                  {pc.suppliers.map((s, j) => {
                    const isLowest = s.price === Math.min(...pc.suppliers.map(x => x.price));
                    return (
                      <div key={j} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isLowest ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-white/[0.02]'}`}>
                        <span className="text-xs w-28 shrink-0">{s.name}</span>
                        <span className={`text-xs font-bold flex-1 ${isLowest ? 'text-emerald-400' : ''}`}>
                          {s.price.toLocaleString()}원/개
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {s.delivery}
                        </span>
                        {isLowest && <span className="text-[10px] text-emerald-400 font-bold">최저가</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
