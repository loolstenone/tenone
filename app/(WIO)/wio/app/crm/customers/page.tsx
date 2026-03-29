'use client';

import { useState } from 'react';
import { Users, Search, CheckCircle, AlertCircle, Link2, Filter, Eye } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_CUSTOMERS = [
  { id: 'C001', name: '김태현', email: 'taehyun@example.com', phone: '010-1234-5678', company: '스마트솔루션', sources: ['웹사이트', 'CRM', '이메일'], identityScore: 98, status: 'resolved', lastActivity: '2026-03-28', totalOrders: 12, ltv: 4800000 },
  { id: 'C002', name: '이수진', email: 'sujin@corp.com', phone: '010-2345-6789', company: '디지털웍스', sources: ['CRM', '콜센터'], identityScore: 92, status: 'resolved', lastActivity: '2026-03-27', totalOrders: 8, ltv: 3200000 },
  { id: 'C003', name: '박지민', email: 'jimin@startup.io', phone: '010-3456-7890', company: '넥스트랩', sources: ['웹사이트', '마케팅'], identityScore: 85, status: 'partial', lastActivity: '2026-03-26', totalOrders: 5, ltv: 1500000 },
  { id: 'C004', name: '정현우', email: 'hyunwoo@biz.kr', phone: '010-4567-8901', company: '데이터브릿지', sources: ['CRM'], identityScore: 78, status: 'partial', lastActivity: '2026-03-25', totalOrders: 3, ltv: 980000 },
  { id: 'C005', name: '최서연', email: 'seoyeon@market.com', phone: '', company: '마켓플레이', sources: ['웹사이트', 'SNS', '이메일'], identityScore: 95, status: 'resolved', lastActivity: '2026-03-28', totalOrders: 15, ltv: 6200000 },
  { id: 'C006', name: '한동훈', email: 'donghun@tech.co', phone: '010-5678-9012', company: '테크코리아', sources: ['콜센터'], identityScore: 60, status: 'unresolved', lastActivity: '2026-03-20', totalOrders: 1, ltv: 250000 },
  { id: 'C007', name: '윤미래', email: 'mirae@design.kr', phone: '010-6789-0123', company: '크리에이티브랩', sources: ['CRM', '이메일'], identityScore: 88, status: 'resolved', lastActivity: '2026-03-27', totalOrders: 7, ltv: 2800000 },
  { id: 'C008', name: '강민수', email: 'minsu@global.com', phone: '010-7890-1234', company: '글로벌파트너스', sources: ['마케팅', 'SNS'], identityScore: 72, status: 'partial', lastActivity: '2026-03-24', totalOrders: 4, ltv: 1100000 },
  { id: 'C009', name: '송하늘', email: 'haneul@edu.kr', phone: '010-8901-2345', company: '에듀테크', sources: ['웹사이트'], identityScore: 55, status: 'unresolved', lastActivity: '2026-03-22', totalOrders: 2, ltv: 450000 },
  { id: 'C010', name: '오지훈', email: 'jihun@fin.com', phone: '010-9012-3456', company: '핀테크솔루션', sources: ['CRM', '콜센터', '이메일'], identityScore: 96, status: 'resolved', lastActivity: '2026-03-28', totalOrders: 20, ltv: 8500000 },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  resolved: { label: '통합완료', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle },
  partial: { label: '부분일치', color: 'text-amber-400 bg-amber-500/10', icon: AlertCircle },
  unresolved: { label: '미해결', color: 'text-red-400 bg-red-500/10', icon: AlertCircle },
};

export default function CustomersPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);

  const customers = MOCK_CUSTOMERS;
  const filtered = customers.filter(c => {
    const matchSearch = !search || c.name.includes(search) || c.email.includes(search) || c.company.includes(search);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: customers.length,
    resolved: customers.filter(c => c.status === 'resolved').length,
    partial: customers.filter(c => c.status === 'partial').length,
    unresolved: customers.filter(c => c.status === 'unresolved').length,
  };

  const detail = selected ? customers.find(c => c.id === selected) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">통합고객관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">CRM-UNI &middot; Golden Record</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: '전체 고객', value: stats.total, color: 'text-indigo-400' },
          { label: '통합완료', value: stats.resolved, color: 'text-emerald-400' },
          { label: '부분일치', value: stats.partial, color: 'text-amber-400' },
          { label: '미해결', value: stats.unresolved, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 검색 + 필터 */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일, 회사로 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none">
          <option value="all">전체 상태</option>
          <option value="resolved">통합완료</option>
          <option value="partial">부분일치</option>
          <option value="unresolved">미해결</option>
        </select>
      </div>

      <div className="flex gap-4">
        {/* 고객 목록 */}
        <div className={`${detail ? 'w-1/2 hidden sm:block' : 'w-full'} space-y-2`}>
          {filtered.map(c => {
            const st = STATUS_MAP[c.status];
            const Icon = st.icon;
            return (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className={`w-full text-left flex items-center gap-4 rounded-xl border p-4 transition-all ${selected === c.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/20 text-sm font-bold text-indigo-300 shrink-0">{c.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-xs text-slate-500">{c.company}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{c.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>
                    <Icon size={10} />{st.label}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">Score {c.identityScore}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 상세 패널 */}
        {detail && (
          <div className="w-full sm:w-1/2 rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{detail.name}</h2>
              <button onClick={() => setSelected(null)} className="text-xs text-slate-500 hover:text-white">닫기</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Golden Record</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">회사</span> <span className="ml-2">{detail.company}</span></div>
                  <div><span className="text-slate-500">이메일</span> <span className="ml-2">{detail.email}</span></div>
                  <div><span className="text-slate-500">전화</span> <span className="ml-2">{detail.phone || '-'}</span></div>
                  <div><span className="text-slate-500">LTV</span> <span className="ml-2 text-indigo-300">{(detail.ltv / 10000).toFixed(0)}만원</span></div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Identity Resolution</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${detail.identityScore}%` }} />
                  </div>
                  <span className="text-sm font-bold text-indigo-300">{detail.identityScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">데이터 소스</p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.sources.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/5 text-slate-300"><Link2 size={9} />{s}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-500">주문 건수</p>
                  <p className="text-lg font-bold mt-0.5">{detail.totalOrders}</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-500">마지막 활동</p>
                  <p className="text-sm font-medium mt-1">{detail.lastActivity}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
