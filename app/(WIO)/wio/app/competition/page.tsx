'use client';

import { useState } from 'react';
import { Trophy, Plus, Users, Calendar, Clock, ChevronRight, Star, Target, Medal, Filter } from 'lucide-react';
import { useWIO } from '../layout';

type CompStatus = 'upcoming' | 'open' | 'judging' | 'completed';
type Tab = 'all' | 'upcoming' | 'open' | 'judging' | 'completed';

interface Competition {
  id: string;
  title: string;
  description: string;
  status: CompStatus;
  teamSize: string;
  deadline: string;
  judgeDate: string;
  teamsRegistered: number;
  maxTeams: number;
  prizes: string[];
  categories: string[];
}

const STATUS_CONFIG: Record<CompStatus, { label: string; color: string }> = {
  upcoming: { label: '예정', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  open: { label: '모집중', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  judging: { label: '심사중', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  completed: { label: '완료', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

const MOCK_COMPETITIONS: Competition[] = [
  {
    id: 'c1', title: 'MADLeague Season 7 — 통합 마케팅 PT', description: '실제 기업 브랜드의 마케팅 과제를 해결하는 팀 대항 PT 경연',
    status: 'open', teamSize: '4~6명', deadline: '2026-04-15', judgeDate: '2026-05-10',
    teamsRegistered: 12, maxTeams: 20, prizes: ['대상 200만원', '최우수상 100만원', '우수상 50만원'],
    categories: ['마케팅', '광고', '브랜딩'],
  },
  {
    id: 'c2', title: 'Creazy Challenge — 글로벌 광고제 도전', description: '칸 라이언즈, 원쇼 등 글로벌 광고제 출품을 목표로 한 크리에이티브 경연',
    status: 'upcoming', teamSize: '2~4명', deadline: '2026-05-01', judgeDate: '2026-06-15',
    teamsRegistered: 0, maxTeams: 15, prizes: ['글로벌 출품 지원', '멘토링'],
    categories: ['크리에이티브', '광고', '영상'],
  },
  {
    id: 'c3', title: 'ChangeUp Startup Demo Day', description: '대학생 창업팀 비즈니스 모델 발표 및 투자 유치 경연',
    status: 'judging', teamSize: '2~5명', deadline: '2026-03-01', judgeDate: '2026-03-28',
    teamsRegistered: 8, maxTeams: 10, prizes: ['최우수 300만원', '우수 100만원', '액셀러레이팅 연계'],
    categories: ['창업', '비즈니스', '기획'],
  },
  {
    id: 'c4', title: 'MADLeague Season 6 Finals', description: '시즌 6 결승전 — 3개 대학 연합 동아리 대항전',
    status: 'completed', teamSize: '4~6명', deadline: '2025-11-01', judgeDate: '2025-11-20',
    teamsRegistered: 16, maxTeams: 16, prizes: ['대상 200만원', '최우수상 100만원'],
    categories: ['마케팅', '광고'],
  },
];

export default function CompetitionPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<Tab>('all');
  const [showCreate, setShowCreate] = useState(false);

  const competitions = MOCK_COMPETITIONS;
  const filtered = tab === 'all' ? competitions : competitions.filter(c => c.status === tab);

  const stats = {
    total: competitions.length,
    open: competitions.filter(c => c.status === 'open').length,
    teams: competitions.reduce((s, c) => s + c.teamsRegistered, 0),
    completed: competitions.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> 경연</h1>
          <p className="text-sm text-slate-500 mt-0.5">팀 대항 PT, 크리에이티브 챌린지, 데모데이{isDemo ? ' (데모)' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors">
          <Plus size={14} /> 경연 만들기
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">전체 경연</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">모집중</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.open}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">참가 팀</div>
          <div className="text-2xl font-bold text-indigo-400">{stats.teams}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">완료</div>
          <div className="text-2xl font-bold text-white">{stats.completed}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([['all', '전체'], ['open', '모집중'], ['upcoming', '예정'], ['judging', '심사중'], ['completed', '완료']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${tab === id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Competition List */}
      <div className="space-y-3">
        {filtered.map(comp => {
          const st = STATUS_CONFIG[comp.status];
          const progress = comp.maxTeams > 0 ? Math.round((comp.teamsRegistered / comp.maxTeams) * 100) : 0;
          return (
            <div key={comp.id} className="border border-white/5 rounded-xl bg-white/[0.02] p-5 hover:border-indigo-500/20 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${st.color}`}>{st.label}</span>
                    {comp.categories.map(cat => (
                      <span key={cat} className="text-[10px] text-slate-600 px-1.5 py-0.5 rounded bg-white/5">{cat}</span>
                    ))}
                  </div>
                  <h3 className="text-base font-bold text-white">{comp.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{comp.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-1" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {comp.teamSize}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 마감 {comp.deadline}</span>
                <span className="flex items-center gap-1"><Target className="w-3 h-3" /> 심사 {comp.judgeDate}</span>
              </div>

              {/* Team Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-slate-400 shrink-0">{comp.teamsRegistered}/{comp.maxTeams}팀</span>
              </div>

              {/* Prizes */}
              {comp.prizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {comp.prizes.map((prize, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] text-amber-400/70 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                      <Medal className="w-2.5 h-2.5" /> {prize}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">해당 상태의 경연이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
