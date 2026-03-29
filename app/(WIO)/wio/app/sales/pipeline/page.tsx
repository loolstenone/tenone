'use client';

import { useState } from 'react';
import {
  Plus, X, Building2, User, Calendar, Percent, DollarSign,
  ChevronRight, GripVertical, Phone, Mail, StickyNote, Clock,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Types ── */
type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
type Deal = {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  amount: number;
  probability: number;
  stage: DealStage;
  dueDate: string;
  notes: string;
  history: { date: string; action: string }[];
};

const STAGES: { key: DealStage; label: string; color: string; bg: string }[] = [
  { key: 'lead', label: '리드', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  { key: 'qualified', label: '적격', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'proposal', label: '제안', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { key: 'negotiation', label: '협상', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { key: 'won', label: '수주', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'lost', label: '실패', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
];

/* ── Mock data: 15 deals ── */
const MOCK_DEALS: Deal[] = [
  { id: 'd1', company: '삼성SDS', contact: '김태호', phone: '010-1234-5678', email: 'th.kim@samsung.com', amount: 25000, probability: 80, stage: 'negotiation', dueDate: '2026-04-15', notes: 'ERP 도입 프로젝트. 4월 중 최종 결정 예정.', history: [{ date: '2026-03-01', action: '첫 미팅' }, { date: '2026-03-15', action: '제안서 발송' }, { date: '2026-03-22', action: '가격 협상 시작' }] },
  { id: 'd2', company: 'LG CNS', contact: '박지은', phone: '010-2345-6789', email: 'je.park@lgcns.com', amount: 18000, probability: 60, stage: 'proposal', dueDate: '2026-04-30', notes: '마케팅 자동화 솔루션 도입 검토 중.', history: [{ date: '2026-02-20', action: '인바운드 리드' }, { date: '2026-03-10', action: '데모 진행' }] },
  { id: 'd3', company: '현대오토에버', contact: '이수민', phone: '010-3456-7890', email: 'sm.lee@hyundai.com', amount: 32000, probability: 40, stage: 'qualified', dueDate: '2026-05-15', notes: '내부 시스템 통합 프로젝트.', history: [{ date: '2026-03-05', action: '소개 미팅' }] },
  { id: 'd4', company: '카카오엔터프라이즈', contact: '정민서', phone: '010-4567-8901', email: 'ms.jung@kakao.com', amount: 15000, probability: 90, stage: 'won', dueDate: '2026-03-31', notes: '계약 완료. 4월 킥오프 예정.', history: [{ date: '2026-01-15', action: '첫 미팅' }, { date: '2026-02-01', action: '제안' }, { date: '2026-03-01', action: '계약 체결' }] },
  { id: 'd5', company: '네이버클라우드', contact: '한서준', phone: '010-5678-9012', email: 'sj.han@naver.com', amount: 22000, probability: 70, stage: 'proposal', dueDate: '2026-04-20', notes: 'WIO Pro 플랜 도입 논의.', history: [{ date: '2026-03-10', action: '문의 접수' }, { date: '2026-03-20', action: '솔루션 데모' }] },
  { id: 'd6', company: '쿠팡', contact: '윤하늘', phone: '010-6789-0123', email: 'hn.yoon@coupang.com', amount: 8000, probability: 30, stage: 'lead', dueDate: '2026-05-30', notes: '초기 관심 단계.', history: [{ date: '2026-03-25', action: '웹사이트 문의' }] },
  { id: 'd7', company: '토스', contact: '강도윤', phone: '010-7890-1234', email: 'dy.kang@toss.im', amount: 12000, probability: 50, stage: 'qualified', dueDate: '2026-04-25', notes: '팀 협업 도구 교체 검토.', history: [{ date: '2026-03-08', action: '소개 미팅' }, { date: '2026-03-18', action: '요구사항 확인' }] },
  { id: 'd8', company: '배달의민족', contact: '신지아', phone: '010-8901-2345', email: 'ja.shin@woowa.com', amount: 9500, probability: 20, stage: 'lost', dueDate: '2026-03-20', notes: '경쟁사 선택. 추후 재접근 가능.', history: [{ date: '2026-02-01', action: '제안' }, { date: '2026-03-15', action: '실주 확정' }] },
  { id: 'd9', company: '두나무', contact: '조예린', phone: '010-9012-3456', email: 'yr.cho@dunamu.com', amount: 45000, probability: 35, stage: 'lead', dueDate: '2026-06-30', notes: '블록체인 연동 모듈 문의.', history: [{ date: '2026-03-28', action: '이메일 문의' }] },
  { id: 'd10', company: '크래프톤', contact: '임건우', phone: '010-0123-4567', email: 'gw.lim@krafton.com', amount: 16000, probability: 55, stage: 'proposal', dueDate: '2026-04-10', notes: '글로벌 프로젝트 관리 시스템.', history: [{ date: '2026-03-01', action: '첫 미팅' }, { date: '2026-03-12', action: '데모' }, { date: '2026-03-25', action: '제안서 전달' }] },
  { id: 'd11', company: '하이브', contact: '최유나', phone: '010-1111-2222', email: 'yn.choi@hybe.com', amount: 20000, probability: 45, stage: 'qualified', dueDate: '2026-05-10', notes: '콘텐츠 관리 파이프라인 구축.', history: [{ date: '2026-03-15', action: '소개 미팅' }] },
  { id: 'd12', company: '야놀자', contact: '오세훈', phone: '010-3333-4444', email: 'sh.oh@yanolja.com', amount: 7000, probability: 85, stage: 'negotiation', dueDate: '2026-04-05', notes: '최종 가격 조율 중.', history: [{ date: '2026-02-10', action: '첫 미팅' }, { date: '2026-03-01', action: '제안' }, { date: '2026-03-20', action: '협상 시작' }] },
  { id: 'd13', company: '무신사', contact: '백서연', phone: '010-5555-6666', email: 'sy.baek@musinsa.com', amount: 11000, probability: 25, stage: 'lead', dueDate: '2026-06-15', notes: 'SCM 모듈 관심.', history: [{ date: '2026-03-27', action: '전화 문의' }] },
  { id: 'd14', company: '리디', contact: '송민재', phone: '010-7777-8888', email: 'mj.song@ridi.com', amount: 5500, probability: 95, stage: 'won', dueDate: '2026-03-28', notes: 'Starter 플랜 계약 완료.', history: [{ date: '2026-03-01', action: '문의' }, { date: '2026-03-10', action: '데모' }, { date: '2026-03-25', action: '계약' }] },
  { id: 'd15', company: '당근', contact: '유하진', phone: '010-9999-0000', email: 'hj.yu@daangn.com', amount: 28000, probability: 65, stage: 'negotiation', dueDate: '2026-04-18', notes: 'Business 플랜 협상 중.', history: [{ date: '2026-02-15', action: '첫 미팅' }, { date: '2026-03-05', action: '제안서' }, { date: '2026-03-18', action: '가격 협상' }] },
];

const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}억` : `${n.toLocaleString()}만`;

export default function PipelinePage() {
  const { isDemo } = useWIO();
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newDeal, setNewDeal] = useState({ company: '', contact: '', amount: '', probability: '50', stage: 'lead' as DealStage, dueDate: '' });

  const activeStages: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'won'];
  const stageDeals = (s: DealStage) => deals.filter(d => d.stage === s);

  const handleAdd = () => {
    if (!newDeal.company.trim()) return;
    const d: Deal = {
      id: `d${Date.now()}`, company: newDeal.company, contact: newDeal.contact,
      phone: '', email: '', amount: Number(newDeal.amount) || 0, probability: Number(newDeal.probability),
      stage: newDeal.stage, dueDate: newDeal.dueDate || '2026-06-30', notes: '', history: [{ date: new Date().toISOString().slice(0, 10), action: '딜 생성' }],
    };
    setDeals(prev => [...prev, d]);
    setNewDeal({ company: '', contact: '', amount: '', probability: '50', stage: 'lead', dueDate: '' });
    setShowAdd(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">영업 파이프라인</h1>
          <p className="text-xs text-slate-500 mt-0.5">SAL-PIP · 딜 {deals.filter(d => d.stage !== 'lost').length}건 진행 중</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 딜 추가
        </button>
      </div>

      {/* Inline add form */}
      {showAdd && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={newDeal.company} onChange={e => setNewDeal(p => ({ ...p, company: e.target.value }))} placeholder="회사명 *"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input value={newDeal.contact} onChange={e => setNewDeal(p => ({ ...p, contact: e.target.value }))} placeholder="담당자"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" value={newDeal.amount} onChange={e => setNewDeal(p => ({ ...p, amount: e.target.value }))} placeholder="예상금액 (만원)"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="number" value={newDeal.probability} onChange={e => setNewDeal(p => ({ ...p, probability: e.target.value }))} placeholder="확률 %"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="date" value={newDeal.dueDate} onChange={e => setNewDeal(p => ({ ...p, dueDate: e.target.value }))}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button onClick={handleAdd} disabled={!newDeal.company.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">등록</button>
          </div>
        </div>
      )}

      {/* Stage totals */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {activeStages.map(sk => {
          const st = STAGES.find(s => s.key === sk)!;
          const sd = stageDeals(sk);
          const total = sd.reduce((s, d) => s + d.amount, 0);
          return (
            <div key={sk} className={`rounded-lg border p-3 ${st.bg}`}>
              <div className={`text-xs font-semibold ${st.color}`}>{st.label} ({sd.length})</div>
              <div className="text-lg font-bold mt-1">{fmt(total)}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 min-h-[400px]" style={{ minWidth: '1100px' }}>
          {activeStages.map(sk => {
            const st = STAGES.find(s => s.key === sk)!;
            const sd = stageDeals(sk);
            return (
              <div key={sk} className="flex-1 min-w-[200px]">
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${st.color}`}>{st.label}</div>
                <div className="space-y-2">
                  {sd.map(d => (
                    <div key={d.id} onClick={() => setSelected(d)} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 cursor-pointer hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-start gap-2">
                        <GripVertical size={14} className="text-slate-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{d.company}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{d.contact}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-indigo-300">{fmt(d.amount)}</span>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Percent size={10} />{d.probability}%
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-600">
                            <Calendar size={10} />{d.dueDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lost deals summary */}
      {stageDeals('lost').length > 0 && (
        <div className="mt-4 rounded-xl border border-red-500/10 bg-red-500/5 p-3">
          <div className="text-xs font-semibold text-red-400 mb-2">실패 ({stageDeals('lost').length})</div>
          <div className="flex gap-2 flex-wrap">
            {stageDeals('lost').map(d => (
              <span key={d.id} onClick={() => setSelected(d)} className="text-xs text-slate-400 bg-white/[0.03] rounded px-2 py-1 cursor-pointer hover:bg-white/[0.06]">{d.company} · {fmt(d.amount)}</span>
            ))}
          </div>
        </div>
      )}

      {/* Detail slideout */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-[#0f1117] border-l border-white/5 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{selected.company}</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-white/5"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STAGES.find(s => s.key === selected.stage)?.bg} ${STAGES.find(s => s.key === selected.stage)?.color}`}>
                  {STAGES.find(s => s.key === selected.stage)?.label}
                </span>
                <span className="text-sm font-bold text-indigo-300">{fmt(selected.amount)}</span>
                <span className="text-xs text-slate-500">· 확률 {selected.probability}%</span>
              </div>

              {/* Contact info */}
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm"><User size={14} className="text-slate-500" />{selected.contact}</div>
                <div className="flex items-center gap-2 text-sm text-slate-400"><Phone size={14} className="text-slate-500" />{selected.phone || '-'}</div>
                <div className="flex items-center gap-2 text-sm text-slate-400"><Mail size={14} className="text-slate-500" />{selected.email || '-'}</div>
                <div className="flex items-center gap-2 text-sm text-slate-400"><Calendar size={14} className="text-slate-500" />마감: {selected.dueDate}</div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5"><StickyNote size={12} />메모</div>
                  <p className="text-sm text-slate-300">{selected.notes}</p>
                </div>
              )}

              {/* History */}
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2"><Clock size={12} />히스토리</div>
                <div className="space-y-2">
                  {selected.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div>
                        <div className="text-xs text-slate-500">{h.date}</div>
                        <div className="text-sm">{h.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage change buttons */}
              <div className="pt-2 border-t border-white/5">
                <div className="text-xs text-slate-500 mb-2">단계 변경</div>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.filter(s => s.key !== selected.stage).map(s => (
                    <button key={s.key} onClick={() => {
                      setDeals(prev => prev.map(d => d.id === selected.id ? { ...d, stage: s.key, history: [...d.history, { date: new Date().toISOString().slice(0, 10), action: `→ ${s.label}` }] } : d));
                      setSelected(prev => prev ? { ...prev, stage: s.key } : null);
                    }} className={`text-xs px-2.5 py-1 rounded-full border ${s.bg} ${s.color} hover:opacity-80`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
