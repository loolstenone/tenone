'use client';

import { useState } from 'react';
import { User, Plus, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useWIO } from '../../layout';

type Freelancer = {
  id: string;
  name: string;
  specialty: string;
  rate: number;
  rateUnit: '시간' | '일' | '건';
  availability: 'available' | 'busy' | 'unavailable';
  rating: number;
  projects: number;
  skills: string[];
};

type MatchRequest = {
  id: string;
  projectName: string;
  requiredSkills: string;
  matchedFreelancer?: string;
  status: 'open' | 'matched' | 'contracted' | 'settled';
  amount?: number;
  date: string;
};

const AVAIL_MAP: Record<string, { label: string; color: string; icon: any }> = {
  available: { label: '가용', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  busy: { label: '진행중', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
  unavailable: { label: '불가', color: 'text-red-400 bg-red-500/10', icon: XCircle },
};

const MATCH_STATUS: Record<string, { label: string; color: string }> = {
  open: { label: '매칭대기', color: 'text-blue-400 bg-blue-500/10' },
  matched: { label: '매칭완료', color: 'text-purple-400 bg-purple-500/10' },
  contracted: { label: '계약체결', color: 'text-emerald-400 bg-emerald-500/10' },
  settled: { label: '정산완료', color: 'text-slate-400 bg-white/5' },
};

const MOCK_FREELANCERS: Freelancer[] = [
  { id: 'FL-001', name: '김프론트', specialty: '프론트엔드 개발', rate: 500000, rateUnit: '일', availability: 'available', rating: 4.8, projects: 12, skills: ['React', 'Next.js', 'TypeScript'] },
  { id: 'FL-002', name: '이백엔드', specialty: '백엔드 개발', rate: 550000, rateUnit: '일', availability: 'busy', rating: 4.9, projects: 18, skills: ['Node.js', 'Python', 'PostgreSQL'] },
  { id: 'FL-003', name: '박디자인', specialty: 'UI/UX 디자인', rate: 400000, rateUnit: '일', availability: 'available', rating: 4.7, projects: 8, skills: ['Figma', 'Prototyping', 'Design System'] },
  { id: 'FL-004', name: '최마케팅', specialty: '디지털 마케팅', rate: 150000, rateUnit: '시간', availability: 'available', rating: 4.5, projects: 22, skills: ['SEO', 'SEM', 'SNS 광고'] },
  { id: 'FL-005', name: '정영상', specialty: '영상 편집', rate: 2000000, rateUnit: '건', availability: 'unavailable', rating: 4.6, projects: 15, skills: ['Premiere', 'After Effects', '모션그래픽'] },
  { id: 'FL-006', name: '한데이터', specialty: '데이터 분석', rate: 600000, rateUnit: '일', availability: 'available', rating: 4.8, projects: 9, skills: ['Python', 'SQL', 'Tableau'] },
];

const MOCK_MATCHES: MatchRequest[] = [
  { id: 'MR-001', projectName: 'WIO 대시보드 개발', requiredSkills: 'React, TypeScript', matchedFreelancer: '김프론트', status: 'contracted', amount: 10000000, date: '2026-03-15' },
  { id: 'MR-002', projectName: '마케팅 캠페인 분석', requiredSkills: 'SEO, 데이터 분석', matchedFreelancer: '최마케팅', status: 'matched', date: '2026-03-25' },
  { id: 'MR-003', projectName: '홍보 영상 제작', requiredSkills: 'Premiere, 모션그래픽', status: 'open', date: '2026-03-28' },
  { id: 'MR-004', projectName: 'API 서버 구축', requiredSkills: 'Node.js, PostgreSQL', matchedFreelancer: '이백엔드', status: 'settled', amount: 16500000, date: '2026-02-10' },
];

export default function FreelancerPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [tab, setTab] = useState<'pool' | 'matches'>('pool');
  const [filterAvail, setFilterAvail] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_FREELANCERS.filter(f => {
    if (filterAvail !== 'all' && f.availability !== filterAvail) return false;
    if (search && !f.name.includes(search) && !f.specialty.includes(search) && !f.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">프리랜서관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">PTN-FRE &middot; Freelancer Management</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'pool' as const, label: '프리랜서 풀' },
          { id: 'matches' as const, label: '매칭/계약/정산' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 프리랜서 풀 */}
      {tab === 'pool' && (
        <>
          {/* 검색 + 필터 */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 전문분야, 스킬 검색..."
                className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            {Object.entries(AVAIL_MAP).map(([key, val]) => (
              <button key={key} onClick={() => setFilterAvail(filterAvail === key ? 'all' : key)}
                className={`rounded-lg px-3 py-2 text-xs transition-colors ${filterAvail === key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
                {val.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map(f => {
              const avail = AVAIL_MAP[f.availability];
              const AvailIcon = avail.icon;
              return (
                <div key={f.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <User size={18} className="text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{f.name}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${avail.color}`}>
                            <AvailIcon size={10} /> {avail.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">{f.specialty}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-indigo-300">{f.rate.toLocaleString()}원/{f.rateUnit}</div>
                      <div className="text-[10px] text-slate-500">평점 {f.rating} &middot; {f.projects}건</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.skills.map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{s}</span>
                    ))}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-sm text-slate-500">검색 결과가 없습니다</div>
            )}
          </div>
        </>
      )}

      {/* 매칭/계약/정산 */}
      {tab === 'matches' && (
        <div className="space-y-2">
          {MOCK_MATCHES.map(m => {
            const st = MATCH_STATUS[m.status];
            return (
              <div key={m.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{m.id}</span>
                    <span className="text-sm font-medium">{m.projectName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  {m.amount && (
                    <span className="text-sm font-bold text-indigo-300">{m.amount.toLocaleString()}원</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="text-slate-600">요구 스킬:</span> {m.requiredSkills}
                    {m.matchedFreelancer && (
                      <span className="ml-2 text-indigo-400">&middot; {m.matchedFreelancer}</span>
                    )}
                  </div>
                  <span>{m.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
