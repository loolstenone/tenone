'use client';

import { useState } from 'react';
import { Headphones, Plus, Clock, CheckCircle, AlertTriangle, MessageSquare, Search, BookOpen } from 'lucide-react';
import { useWIO } from '../../layout';

type Tab = 'tickets' | 'faq';

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  urgent: { label: '긴급', color: 'text-red-400 bg-red-500/10' },
  high: { label: '높음', color: 'text-orange-400 bg-orange-500/10' },
  medium: { label: '보통', color: 'text-amber-400 bg-amber-500/10' },
  low: { label: '낮음', color: 'text-slate-400 bg-slate-500/10' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: '접수', color: 'text-blue-400 bg-blue-500/10' },
  in_progress: { label: '처리중', color: 'text-indigo-400 bg-indigo-500/10' },
  waiting: { label: '대기', color: 'text-amber-400 bg-amber-500/10' },
  resolved: { label: '해결', color: 'text-emerald-400 bg-emerald-500/10' },
  closed: { label: '종료', color: 'text-slate-400 bg-slate-500/10' },
};

const MOCK_TICKETS = [
  { id: 'TK-001', title: '로그인 오류 - 비밀번호 재설정 불가', customer: '김태현', priority: 'urgent', status: 'in_progress', assignee: '박상현', responseTime: 12, resolveTime: null, slaResponse: 30, slaResolve: 240, createdAt: '2026-03-28 14:30', channel: '이메일' },
  { id: 'TK-002', title: '결제 취소 요청', customer: '이수진', priority: 'high', status: 'open', assignee: '김지은', responseTime: null, resolveTime: null, slaResponse: 60, slaResolve: 480, createdAt: '2026-03-28 15:20', channel: '채팅' },
  { id: 'TK-003', title: '상품 교환 배송비 문의', customer: '최서연', priority: 'medium', status: 'resolved', assignee: '이하은', responseTime: 8, resolveTime: 95, slaResponse: 120, slaResolve: 480, createdAt: '2026-03-27 10:00', channel: '전화' },
  { id: 'TK-004', title: '멤버십 등급 오류', customer: '오지훈', priority: 'high', status: 'waiting', assignee: '박상현', responseTime: 25, resolveTime: null, slaResponse: 60, slaResolve: 240, createdAt: '2026-03-27 11:30', channel: '이메일' },
  { id: 'TK-005', title: '앱 크래시 리포트 (iOS 17)', customer: '한동훈', priority: 'urgent', status: 'in_progress', assignee: '김지은', responseTime: 5, resolveTime: null, slaResponse: 30, slaResolve: 120, createdAt: '2026-03-28 09:00', channel: '앱내' },
  { id: 'TK-006', title: '청구서 수정 요청', customer: '강민수', priority: 'medium', status: 'resolved', assignee: '이하은', responseTime: 15, resolveTime: 180, slaResponse: 120, slaResolve: 480, createdAt: '2026-03-26 16:00', channel: '이메일' },
  { id: 'TK-007', title: '대량 주문 할인 문의', customer: '박지민', priority: 'low', status: 'closed', assignee: '박상현', responseTime: 45, resolveTime: 320, slaResponse: 240, slaResolve: 1440, createdAt: '2026-03-25 14:00', channel: '전화' },
  { id: 'TK-008', title: 'API 연동 에러 (webhook 실패)', customer: '송하늘', priority: 'high', status: 'open', assignee: null, responseTime: null, resolveTime: null, slaResponse: 60, slaResolve: 240, createdAt: '2026-03-28 16:00', channel: '이메일' },
];

const MOCK_FAQ = [
  { id: 'F01', question: '비밀번호를 잊어버렸어요', answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하세요.', category: '계정', views: 1240 },
  { id: 'F02', question: '환불은 얼마나 걸리나요?', answer: '환불 신청 후 영업일 기준 3~5일 소요됩니다.', category: '결제', views: 980 },
  { id: 'F03', question: '배송 추적은 어떻게 하나요?', answer: '마이페이지 > 주문내역에서 확인 가능합니다.', category: '배송', views: 856 },
  { id: 'F04', question: '멤버십 등급 기준이 뭔가요?', answer: '최근 6개월 구매 금액 기준으로 자동 산정됩니다.', category: '멤버십', views: 645 },
  { id: 'F05', question: 'API 키는 어디서 발급하나요?', answer: '설정 > 개발자 메뉴에서 발급 가능합니다.', category: '기술', views: 432 },
];

export default function SupportPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<Tab>('tickets');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const tickets = MOCK_TICKETS;
  const faqs = MOCK_FAQ;

  const filteredTickets = tickets.filter(t =>
    !search || t.title.includes(search) || t.customer.includes(search) || t.id.includes(search)
  );

  const slaStats = {
    avgResponse: Math.round(tickets.filter(t => t.responseTime).reduce((a, t) => a + (t.responseTime || 0), 0) / tickets.filter(t => t.responseTime).length),
    slaCompliance: Math.round(tickets.filter(t => t.responseTime && t.responseTime <= t.slaResponse).length / tickets.filter(t => t.responseTime).length * 100),
    openTickets: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">고객지원</h1>
          <p className="text-xs text-slate-500 mt-0.5">CRM-SVC &middot; 티켓 &amp; FAQ</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 티켓 생성
        </button>
      </div>

      {/* SLA 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">평균 응답 시간</p>
          <p className="text-2xl font-bold mt-1 text-indigo-400">{slaStats.avgResponse}분</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">SLA 준수율</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{slaStats.slaCompliance}%</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">미해결 티켓</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">{slaStats.openTickets}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('tickets')} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${tab === 'tickets' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <Headphones size={14} /> 티켓 ({tickets.length})
        </button>
        <button onClick={() => setTab('faq')} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${tab === 'faq' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <BookOpen size={14} /> FAQ ({faqs.length})
        </button>
      </div>

      {/* 티켓 생성 폼 */}
      {showForm && tab === 'tickets' && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input placeholder="제목" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="고객명" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <select className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none">
              <option>우선순위</option><option value="urgent">긴급</option><option value="high">높음</option><option value="medium">보통</option><option value="low">낮음</option>
            </select>
            <select className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none">
              <option>채널</option><option>이메일</option><option>전화</option><option>채팅</option><option>앱내</option>
            </select>
          </div>
          <textarea rows={3} placeholder="내용" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">생성</button>
          </div>
        </div>
      )}

      {tab === 'tickets' && (
        <>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="티켓 검색..."
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="space-y-2">
            {filteredTickets.map(t => {
              const pr = PRIORITY_MAP[t.priority];
              const st = STATUS_MAP[t.status];
              const slaBreached = t.responseTime && t.responseTime > t.slaResponse;
              return (
                <div key={t.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-600 font-mono">{t.id}</span>
                      <span className="text-sm font-medium">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{t.customer}</span>
                      <span>{t.channel}</span>
                      <span>{t.createdAt}</span>
                      {t.assignee && <span className="text-indigo-400">{t.assignee}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {slaBreached && <AlertTriangle size={12} className="text-red-400" />}
                    {t.responseTime && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500"><Clock size={9} />{t.responseTime}분</span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pr.color}`}>{pr.label}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'faq' && (
        <div className="space-y-2">
          {faqs.map(f => (
            <details key={f.id} className="group rounded-xl border border-white/5 bg-white/[0.02]">
              <summary className="flex items-center gap-4 p-4 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{f.category}</span>
                    <span className="text-sm font-medium">{f.question}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-600">{f.views} views</span>
              </summary>
              <div className="px-4 pb-4 pt-0 text-sm text-slate-400 border-t border-white/5 mt-0 pt-3">{f.answer}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
