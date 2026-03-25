'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Plus, ArrowRight, ExternalLink, Users } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchOpportunities, createOpportunity, updateOpportunityStatus, fetchLeads, createLead } from '@/lib/supabase/wio';

type Tab = 'opportunities' | 'leads';

const OPP_STATUS: Record<string, { label: string; color: string }> = {
  new: { label: '신규', color: 'text-blue-400 bg-blue-500/10' },
  evaluating: { label: '평가중', color: 'text-amber-400 bg-amber-500/10' },
  qualified: { label: '적격', color: 'text-indigo-400 bg-indigo-500/10' },
  proposal: { label: '제안', color: 'text-violet-400 bg-violet-500/10' },
  won: { label: '수주', color: 'text-emerald-400 bg-emerald-500/10' },
  lost: { label: '실주', color: 'text-red-400 bg-red-500/10' },
  converted: { label: '전환', color: 'text-cyan-400 bg-cyan-500/10' },
};

export default function SalesPage() {
  const { tenant, member } = useWIO();
  const [tab, setTab] = useState<Tab>('opportunities');
  const [opps, setOpps] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // 기회 폼
  const [oppTitle, setOppTitle] = useState('');
  const [oppSource, setOppSource] = useState('');
  const [oppValue, setOppValue] = useState('');

  // 리드 폼
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadEmail, setLeadEmail] = useState('');

  useEffect(() => {
    if (!tenant) return;
    setLoading(true);
    if (tab === 'opportunities') {
      fetchOpportunities(tenant.id).then(o => { setOpps(o); setLoading(false); });
    } else {
      fetchLeads(tenant.id).then(l => { setLeads(l); setLoading(false); });
    }
  }, [tenant, tab]);

  const handleOpp = async () => {
    if (!tenant || !oppTitle.trim()) return;
    await createOpportunity({ tenantId: tenant.id, title: oppTitle.trim(), source: oppSource, estimatedValue: oppValue ? Number(oppValue) * 10000 : 0 });
    setOppTitle(''); setOppSource(''); setOppValue(''); setShowForm(false);
    fetchOpportunities(tenant.id).then(setOpps);
  };

  const handleLead = async () => {
    if (!tenant || !leadName.trim()) return;
    await createLead({ tenantId: tenant.id, name: leadName.trim(), company: leadCompany, email: leadEmail });
    setLeadName(''); setLeadCompany(''); setLeadEmail(''); setShowForm(false);
    fetchLeads(tenant.id).then(setLeads);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">영업</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> {tab === 'opportunities' ? '기회 등록' : '리드 등록'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => { setTab('opportunities'); setShowForm(false); }}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${tab === 'opportunities' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <TrendingUp size={14} /> 기회 파이프라인
        </button>
        <button onClick={() => { setTab('leads'); setShowForm(false); }}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${tab === 'leads' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <Users size={14} /> 리드
        </button>
      </div>

      {/* 기회 등록 폼 */}
      {showForm && tab === 'opportunities' && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input value={oppTitle} onChange={e => setOppTitle(e.target.value)} placeholder="기회명"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input value={oppSource} onChange={e => setOppSource(e.target.value)} placeholder="출처 (나라장터, 소개 등)"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="number" value={oppValue} onChange={e => setOppValue(e.target.value)} placeholder="예상 금액 (만원)"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button onClick={handleOpp} disabled={!oppTitle.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">등록</button>
          </div>
        </div>
      )}

      {/* 리드 등록 폼 */}
      {showForm && tab === 'leads' && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="이름 *"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input value={leadCompany} onChange={e => setLeadCompany(e.target.value)} placeholder="회사"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input value={leadEmail} onChange={e => setLeadEmail(e.target.value)} placeholder="이메일"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button onClick={handleLead} disabled={!leadName.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">등록</button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : tab === 'opportunities' ? (
        opps.length === 0 ? (
          <div className="text-center py-16 text-slate-500"><TrendingUp size={32} className="mx-auto mb-2 text-slate-600" /><p>등록된 기회가 없습니다</p></div>
        ) : (
          <div className="space-y-2">
            {opps.map((o: any) => {
              const st = OPP_STATUS[o.status] || OPP_STATUS.new;
              return (
                <div key={o.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{o.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{o.source || '직접'} · {new Date(o.createdAt).toLocaleDateString('ko-KR')}</div>
                  </div>
                  {o.estimatedValue > 0 && <span className="text-sm font-bold text-indigo-300">{(o.estimatedValue / 10000).toFixed(0)}만원</span>}
                </div>
              );
            })}
          </div>
        )
      ) : (
        leads.length === 0 ? (
          <div className="text-center py-16 text-slate-500"><Users size={32} className="mx-auto mb-2 text-slate-600" /><p>등록된 리드가 없습니다</p></div>
        ) : (
          <div className="space-y-2">
            {leads.map((l: any) => (
              <div key={l.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{l.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{l.company || '-'} · {l.email || '-'}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-blue-400 bg-blue-500/10`}>{l.status}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
