"use client";

import { useState, useEffect } from "react";
import { useBumsFilter } from "../layout";
import { MessageCircle, Mail, Building, Search, Clock, CheckCircle, AlertCircle, Eye, ChevronDown, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Submission {
  id: string;
  form_type: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  category: string | null;
  portfolio_url: string | null;
  status: string;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: '대기', color: 'text-amber-600 bg-amber-50', icon: Clock },
  reviewing: { label: '확인중', color: 'text-blue-600 bg-blue-50', icon: Eye },
  responded: { label: '응답완료', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
};

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  partner: { label: '파트너 신청', color: 'text-violet-600 bg-violet-50' },
  business: { label: '프로젝트 의뢰', color: 'text-indigo-600 bg-indigo-50' },
};

// Mock 데이터
const MOCK_SUBMISSIONS: Submission[] = [
  { id: 's1', form_type: 'partner', name: '김마케팅', email: 'mkt@agency.com', company: '크리에이티브랩', phone: '010-1234-5678', message: '마케팅 에이전시입니다. 파트너 제휴 문의드립니다.', category: null, portfolio_url: 'https://creative.co.kr', status: 'pending', created_at: '2026-03-29T14:30:00Z' },
  { id: 's2', form_type: 'business', name: '박기획', email: 'plan@startup.io', company: '넥스트스텝', phone: '010-2345-6789', message: '신규 브랜딩 프로젝트 의뢰 관련 미팅 요청드립니다. 4월 중 론칭 예정인 서비스입니다.', category: '브랜딩', portfolio_url: null, status: 'reviewing', created_at: '2026-03-28T10:15:00Z' },
  { id: 's3', form_type: 'business', name: '이개발', email: 'dev@tech.kr', company: '테크솔루션', phone: null, message: 'WIO 도입 검토 중입니다. 데모 미팅 가능할까요?', category: 'IT/개발', portfolio_url: null, status: 'responded', created_at: '2026-03-27T09:00:00Z' },
  { id: 's4', form_type: 'partner', name: '정디자인', email: 'design@studio.com', company: '디자인스튜디오', phone: '010-3456-7890', message: 'UI/UX 디자인 파트너 등록 희망합니다. 포트폴리오 첨부합니다.', category: null, portfolio_url: 'https://design-studio.co.kr/portfolio', status: 'pending', created_at: '2026-03-26T16:45:00Z' },
  { id: 's5', form_type: 'business', name: '최교수', email: 'prof@univ.ac.kr', company: '서울대학교', phone: '010-4567-8901', message: 'MADLeague 산학협력 프로그램 관련 문의입니다.', category: '교육', portfolio_url: null, status: 'pending', created_at: '2026-03-25T11:20:00Z' },
];

export default function InquiryPage() {
  const { selectedSiteId } = useBumsFilter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'partner' | 'business'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewing' | 'responded'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sb = createClient();
        const { data } = await sb
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setSubmissions(data.map((r: any) => ({
            id: r.id, form_type: r.form_type || 'business', name: r.name, email: r.email,
            company: r.company, phone: r.phone, message: r.message, category: r.category,
            portfolio_url: r.portfolio_url, status: r.status || 'pending', created_at: r.created_at,
          })));
        } else {
          setSubmissions(MOCK_SUBMISSIONS);
        }
      } catch {
        setSubmissions(MOCK_SUBMISSIONS);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = submissions
    .filter(s => filter === 'all' || s.form_type === filter)
    .filter(s => statusFilter === 'all' || s.status === statusFilter)
    .filter(s => !search || s.name.includes(search) || s.email.includes(search) || (s.company || '').includes(search));

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    responded: submissions.filter(s => s.status === 'responded').length,
    partner: submissions.filter(s => s.form_type === 'partner').length,
    business: submissions.filter(s => s.form_type === 'business').length,
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    try {
      const sb = createClient();
      await sb.from('contact_submissions').update({ status: newStatus }).eq('id', id);
    } catch { /* Mock fallback */ }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">고객문의 관리</h1>
        <p className="text-sm text-neutral-500 mt-1">Contact 폼을 통해 접수된 문의를 관리합니다.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '전체', value: stats.total, color: 'text-neutral-800' },
          { label: '대기', value: stats.pending, color: 'text-amber-600' },
          { label: '응답완료', value: stats.responded, color: 'text-emerald-600' },
          { label: '파트너', value: stats.partner, color: 'text-violet-600' },
          { label: '의뢰', value: stats.business, color: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-100 rounded-lg p-4">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 필터 + 검색 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-neutral-50 rounded-lg p-0.5">
          {[{ key: 'all', label: '전체' }, { key: 'partner', label: '파트너' }, { key: 'business', label: '의뢰' }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filter === f.key ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
          className="text-xs border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none">
          <option value="all">전체 상태</option>
          <option value="pending">대기</option>
          <option value="reviewing">확인중</option>
          <option value="responded">응답완료</option>
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일, 회사 검색..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400" />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-neutral-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-xs text-neutral-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">날짜</th>
              <th className="px-4 py-3 text-left">유형</th>
              <th className="px-4 py-3 text-left">이름</th>
              <th className="px-4 py-3 text-left">회사</th>
              <th className="px-4 py-3 text-left">메시지</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-left">액션</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-neutral-400">로딩 중...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-neutral-400">문의가 없습니다</td></tr>
            ) : filtered.map(s => {
              const type = TYPE_MAP[s.form_type] || TYPE_MAP.business;
              const status = STATUS_MAP[s.status] || STATUS_MAP.pending;
              return (
                <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition cursor-pointer" onClick={() => setSelected(s)}>
                  <td className="px-4 py-3 text-xs text-neutral-500">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${type.color}`}>{type.label}</span></td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{s.company || '-'}</td>
                  <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">{s.message}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span></td>
                  <td className="px-4 py-3">
                    <select value={s.status} onChange={e => { e.stopPropagation(); handleStatusChange(s.id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      className="text-[10px] border border-neutral-200 rounded px-1.5 py-0.5 focus:outline-none">
                      <option value="pending">대기</option>
                      <option value="reviewing">확인중</option>
                      <option value="responded">응답완료</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 상세 패널 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">문의 상세</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-neutral-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${(TYPE_MAP[selected.form_type] || TYPE_MAP.business).color}`}>
                  {(TYPE_MAP[selected.form_type] || TYPE_MAP.business).label}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${(STATUS_MAP[selected.status] || STATUS_MAP.pending).color}`}>
                  {(STATUS_MAP[selected.status] || STATUS_MAP.pending).label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-neutral-400">이름</p><p className="font-medium">{selected.name}</p></div>
                <div><p className="text-xs text-neutral-400">이메일</p><p className="font-medium">{selected.email}</p></div>
                {selected.company && <div><p className="text-xs text-neutral-400">회사</p><p className="font-medium">{selected.company}</p></div>}
                {selected.phone && <div><p className="text-xs text-neutral-400">전화</p><p className="font-medium">{selected.phone}</p></div>}
                {selected.category && <div><p className="text-xs text-neutral-400">카테고리</p><p className="font-medium">{selected.category}</p></div>}
                <div><p className="text-xs text-neutral-400">접수일</p><p className="font-medium">{formatDate(selected.created_at)}</p></div>
              </div>
              {selected.portfolio_url && (
                <div><p className="text-xs text-neutral-400 mb-1">포트폴리오</p><a href={selected.portfolio_url} target="_blank" rel="noopener" className="text-sm text-indigo-600 hover:underline">{selected.portfolio_url}</a></div>
              )}
              <div>
                <p className="text-xs text-neutral-400 mb-1">메시지</p>
                <div className="bg-neutral-50 rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.message}</div>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-2">상태 변경</p>
                <div className="flex gap-2">
                  {['pending', 'reviewing', 'responded'].map(st => (
                    <button key={st} onClick={() => handleStatusChange(selected.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selected.status === st ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                      {(STATUS_MAP[st] || STATUS_MAP.pending).label}
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
