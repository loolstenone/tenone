'use client';

import { useState } from 'react';
import { Network, Plus, Search, MapPin, Briefcase, MessageSquare, UserPlus, Filter, Star } from 'lucide-react';
import { useWIO } from '../layout';

interface NetworkMember {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  expertise: string[];
  connected: boolean;
  mutualCount: number;
}

const MOCK_MEMBERS: NetworkMember[] = [
  { id: 'n1', name: '김마케팅', title: 'CMO', company: '브랜드컴퍼니', location: '서울 강남', expertise: ['브랜딩', '퍼포먼스', 'B2B'], connected: true, mutualCount: 5 },
  { id: 'n2', name: '이기획', title: 'PM', company: '스타트업허브', location: '서울 성수', expertise: ['기획', 'UX', '프로덕트'], connected: false, mutualCount: 3 },
  { id: 'n3', name: '박광고', title: 'CD', company: 'TBWA', location: '서울 용산', expertise: ['크리에이티브', '광고', '카피'], connected: true, mutualCount: 8 },
  { id: 'n4', name: '최디자인', title: 'Design Lead', company: '프리랜서', location: '부산', expertise: ['UI/UX', '브랜딩', '일러스트'], connected: false, mutualCount: 2 },
  { id: 'n5', name: '정개발', title: 'CTO', company: '테크스타트', location: '서울 판교', expertise: ['풀스택', 'AI', 'SaaS'], connected: false, mutualCount: 4 },
  { id: 'n6', name: '한콘텐츠', title: 'Editor', company: 'Mindle', location: '서울 마포', expertise: ['콘텐츠', '트렌드', 'SNS'], connected: true, mutualCount: 6 },
];

export default function NetworkingPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'all' | 'connected' | 'recommended'>('all');
  const [members] = useState(MOCK_MEMBERS);

  const filtered = members.filter(m => {
    if (viewTab === 'connected' && !m.connected) return false;
    if (viewTab === 'recommended' && m.connected) return false;
    if (searchQuery && !m.name.includes(searchQuery) && !m.expertise.some(e => e.includes(searchQuery)) && !m.company.includes(searchQuery)) return false;
    return true;
  });

  const stats = {
    total: members.length,
    connected: members.filter(m => m.connected).length,
    pending: 2,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Network className="w-5 h-5 text-emerald-400" /> 네트워킹</h1>
          <p className="text-sm text-slate-500 mt-0.5">업계 전문가 연결, 프로필 매칭{isDemo ? ' (데모)' : ''}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">전체 멤버</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">연결됨</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.connected}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">대기 요청</div>
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([['all', '전체'], ['connected', '내 연결'], ['recommended', '추천']] as ['all' | 'connected' | 'recommended', string][]).map(([id, label]) => (
          <button key={id} onClick={() => setViewTab(id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewTab === id ? 'bg-emerald-600/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="이름, 전문 분야, 회사로 검색..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
      </div>

      {/* Member Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(m => (
          <div key={m.id} className="border border-white/5 rounded-xl bg-white/[0.02] p-5 hover:border-emerald-500/20 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {m.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">{m.name}</h3>
                <p className="text-xs text-slate-500">{m.title} · {m.company}</p>
              </div>
              {m.connected && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
              <MapPin className="w-3 h-3" /> {m.location}
              {m.mutualCount > 0 && <span className="ml-2">· 공통 {m.mutualCount}명</span>}
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {m.expertise.map(e => (
                <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">{e}</span>
              ))}
            </div>
            {m.connected ? (
              <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 text-slate-400 rounded-lg text-xs hover:bg-white/10 transition-colors">
                <MessageSquare className="w-3 h-3" /> 메시지
              </button>
            ) : (
              <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-600/30 transition-colors border border-emerald-500/20">
                <UserPlus className="w-3 h-3" /> 연결 요청
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <Network className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
