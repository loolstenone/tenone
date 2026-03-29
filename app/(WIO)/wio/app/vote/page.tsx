'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Vote, Plus, Search, Clock, CheckCircle2, BarChart3, ThumbsUp, ThumbsDown,
  ArrowLeft, Send, Users, Calendar, ToggleLeft, ToggleRight, Trash2, X,
  GripVertical, ChevronUp, ChevronDown, Eye, EyeOff, PieChart, Hash
} from 'lucide-react';
import { useWIO } from '../layout';

/* ───── Types ───── */
type VoteStatus = 'active' | 'closed';
type VoteType = 'yesno' | 'single' | 'multiple' | 'ranking';
type ResultVisibility = 'after_vote' | 'after_close';

interface VoteChoice {
  id: string;
  label: string;
  votes: number;
  voters?: string[];
}

interface VotePoll {
  id: string;
  title: string;
  description: string;
  status: VoteStatus;
  type: VoteType;
  anonymous: boolean;
  resultVisibility: ResultVisibility;
  deadline: string;
  createdBy: string;
  createdAt: string;
  choices: VoteChoice[];
  totalParticipants: number;
  targetCount: number;
  myVote: string | string[] | number[] | null; // null = not voted
}

const TYPE_LABELS: Record<VoteType, string> = {
  yesno: '찬반',
  single: '단일 선택',
  multiple: '복수 선택',
  ranking: '순위',
};

const STATUS_STYLES: Record<VoteStatus, { label: string; color: string }> = {
  active: { label: '진행중', color: 'text-emerald-400 bg-emerald-500/10' },
  closed: { label: '마감', color: 'text-slate-400 bg-slate-500/10' },
};

/* ───── Mock Data ───── */
const MOCK_VOTES: VotePoll[] = [
  {
    id: 'v1',
    title: '연말 워크숍 장소',
    description: '2026년 연말 워크숍 장소를 투표해주세요. 2박 3일 일정입니다.',
    status: 'active',
    type: 'single',
    anonymous: false,
    resultVisibility: 'after_vote',
    deadline: '2026-04-10',
    createdBy: '경영지원팀 박현우',
    createdAt: '2026-03-25',
    choices: [
      { id: 'c1', label: '제주도 리조트', votes: 18, voters: ['김민수', '이지은', '박서준'] },
      { id: 'c2', label: '강원도 펜션', votes: 14, voters: ['최유나', '정해인'] },
      { id: 'c3', label: '경주 호텔', votes: 10, voters: ['한소영'] },
    ],
    totalParticipants: 42,
    targetCount: 60,
    myVote: null,
  },
  {
    id: 'v2',
    title: '금요일 캐주얼 데이 도입',
    description: '매주 금요일을 캐주얼 데이로 지정하는 것에 대한 찬반 투표입니다.',
    status: 'closed',
    type: 'yesno',
    anonymous: true,
    resultVisibility: 'after_vote',
    deadline: '2026-03-20',
    createdBy: '인사팀 김수진',
    createdAt: '2026-03-10',
    choices: [
      { id: 'yes', label: '찬성', votes: 47 },
      { id: 'no', label: '반대', votes: 13 },
    ],
    totalParticipants: 60,
    targetCount: 60,
    myVote: 'yes',
  },
  {
    id: 'v3',
    title: '2분기 팀 프로젝트 선택',
    description: '2분기에 진행할 팀 프로젝트를 복수 선택해주세요 (최대 2개).',
    status: 'active',
    type: 'multiple',
    anonymous: false,
    resultVisibility: 'after_vote',
    deadline: '2026-04-05',
    createdBy: 'CTO 이영수',
    createdAt: '2026-03-22',
    choices: [
      { id: 'c1', label: 'AI 챗봇 고도화', votes: 28, voters: [] },
      { id: 'c2', label: '모바일 앱 리뉴얼', votes: 22, voters: [] },
      { id: 'c3', label: '내부 위키 시스템', votes: 15, voters: [] },
      { id: 'c4', label: '고객 대시보드 개선', votes: 19, voters: [] },
    ],
    totalParticipants: 38,
    targetCount: 60,
    myVote: null,
  },
  {
    id: 'v4',
    title: '최우수 프로젝트 투표',
    description: '상반기 최우수 프로젝트를 순위로 매겨주세요.',
    status: 'closed',
    type: 'ranking',
    anonymous: true,
    resultVisibility: 'after_close',
    deadline: '2026-03-15',
    createdBy: '대표 천민호',
    createdAt: '2026-03-01',
    choices: [
      { id: 'c1', label: 'Project Alpha', votes: 245 },
      { id: 'c2', label: 'Project Beta', votes: 198 },
      { id: 'c3', label: 'Project Gamma', votes: 167 },
      { id: 'c4', label: 'Project Delta', votes: 142 },
    ],
    totalParticipants: 55,
    targetCount: 60,
    myVote: [1, 3, 2, 4],
  },
  {
    id: 'v5',
    title: '점심 메뉴 투표',
    description: '오늘 점심 메뉴를 골라주세요!',
    status: 'active',
    type: 'single',
    anonymous: true,
    resultVisibility: 'after_vote',
    deadline: '2026-03-29',
    createdBy: '총무팀 한소영',
    createdAt: '2026-03-29',
    choices: [
      { id: 'c1', label: '한식 (김치찌개)', votes: 12 },
      { id: 'c2', label: '중식 (짜장면)', votes: 8 },
      { id: 'c3', label: '일식 (초밥)', votes: 15 },
      { id: 'c4', label: '양식 (파스타)', votes: 7 },
    ],
    totalParticipants: 42,
    targetCount: 60,
    myVote: null,
  },
];

/* ───── Component ───── */
export default function VotePage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<VotePoll[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | VoteStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // View: list | create | detail
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedVote, setSelectedVote] = useState<VotePoll | null>(null);

  // Create form
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState<VoteType>('single');
  const [editAnonymous, setEditAnonymous] = useState(true);
  const [editVisibility, setEditVisibility] = useState<ResultVisibility>('after_vote');
  const [editDeadline, setEditDeadline] = useState('');
  const [editChoices, setEditChoices] = useState<string[]>(['', '']);

  // Vote interaction
  const [mySelection, setMySelection] = useState<string | string[] | number[] | null>(null);
  const [animateResults, setAnimateResults] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    if (isDemo) setVotes(MOCK_VOTES);
    setLoading(false);
  }, [tenant, isDemo]);

  const filteredVotes = useMemo(() => {
    let list = votes;
    if (filterStatus !== 'all') list = list.filter(v => v.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v => v.title.toLowerCase().includes(q));
    }
    return list;
  }, [votes, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = votes.length;
    const active = votes.filter(v => v.status === 'active').length;
    const closed = votes.filter(v => v.status === 'closed').length;
    return { total, active, closed };
  }, [votes]);

  /* ─── Create handlers ─── */
  const handleCreateNew = () => {
    setEditTitle('');
    setEditDesc('');
    setEditType('single');
    setEditAnonymous(true);
    setEditVisibility('after_vote');
    setEditDeadline('');
    setEditChoices(['', '']);
    setViewMode('create');
  };

  const handlePublish = () => {
    const choices: VoteChoice[] = editType === 'yesno'
      ? [{ id: 'yes', label: '찬성', votes: 0 }, { id: 'no', label: '반대', votes: 0 }]
      : editChoices.filter(c => c.trim()).map((c, i) => ({ id: `c${i}`, label: c.trim(), votes: 0 }));

    const newVote: VotePoll = {
      id: `v-${Date.now()}`,
      title: editTitle || '제목 없는 투표',
      description: editDesc,
      status: 'active',
      type: editType,
      anonymous: editAnonymous,
      resultVisibility: editVisibility,
      deadline: editDeadline,
      createdBy: '나',
      createdAt: new Date().toISOString().split('T')[0],
      choices,
      totalParticipants: 0,
      targetCount: 60,
      myVote: null,
    };
    setVotes(prev => [newVote, ...prev]);
    setViewMode('list');
  };

  const openDetail = (vote: VotePoll) => {
    setSelectedVote(vote);
    setMySelection(vote.myVote);
    setAnimateResults(false);
    setViewMode('detail');
    setTimeout(() => setAnimateResults(true), 50);
  };

  const handleCastVote = () => {
    if (!selectedVote || mySelection === null) return;
    setVotes(prev => prev.map(v => {
      if (v.id !== selectedVote.id) return v;
      const updated = { ...v, myVote: mySelection, totalParticipants: v.totalParticipants + 1 };
      // Update choice counts
      if (v.type === 'yesno' || v.type === 'single') {
        updated.choices = v.choices.map(c => c.id === mySelection ? { ...c, votes: c.votes + 1 } : c);
      } else if (v.type === 'multiple' && Array.isArray(mySelection)) {
        updated.choices = v.choices.map(c => (mySelection as string[]).includes(c.id) ? { ...c, votes: c.votes + 1 } : c);
      }
      return updated;
    }));
    setSelectedVote(prev => {
      if (!prev) return prev;
      const updated = { ...prev, myVote: mySelection, totalParticipants: prev.totalParticipants + 1 };
      if (prev.type === 'yesno' || prev.type === 'single') {
        updated.choices = prev.choices.map(c => c.id === mySelection ? { ...c, votes: c.votes + 1 } : c);
      } else if (prev.type === 'multiple' && Array.isArray(mySelection)) {
        updated.choices = prev.choices.map(c => (mySelection as string[]).includes(c.id) ? { ...c, votes: c.votes + 1 } : c);
      }
      return updated;
    });
    setAnimateResults(false);
    setTimeout(() => setAnimateResults(true), 50);
  };

  const canSeeResults = (v: VotePoll) => {
    if (v.status === 'closed') return true;
    if (v.resultVisibility === 'after_vote' && v.myVote !== null) return true;
    return false;
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">투표</h1>
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

  /* ═══════════ CREATE VIEW ═══════════ */
  if (viewMode === 'create') {
    return (
      <div>
        <button onClick={() => setViewMode('list')} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={15} /> 목록으로
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">새 투표 만들기</h1>
          <button onClick={handlePublish}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 transition-colors">
            <Send size={15} /> 발행
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
            <input type="text" placeholder="투표 제목" value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="w-full text-lg font-bold bg-transparent border-b border-white/10 pb-2 focus:border-indigo-500 focus:outline-none placeholder-slate-600" />
            <textarea placeholder="투표 설명 (선택)" value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
              className="w-full text-sm bg-transparent border-b border-white/10 pb-2 resize-none focus:border-indigo-500 focus:outline-none placeholder-slate-600" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">투표 유형</label>
                <select value={editType} onChange={e => setEditType(e.target.value as VoteType)}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none w-full">
                  {(Object.entries(TYPE_LABELS)).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">응답 방식</label>
                <button onClick={() => setEditAnonymous(!editAnonymous)}
                  className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                  {editAnonymous ? <ToggleRight size={20} className="text-indigo-400" /> : <ToggleLeft size={20} className="text-slate-500" />}
                  {editAnonymous ? '익명' : '실명'}
                </button>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">결과 공개</label>
                <select value={editVisibility} onChange={e => setEditVisibility(e.target.value as ResultVisibility)}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none w-full">
                  <option value="after_vote">투표 후</option>
                  <option value="after_close">마감 후</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">마감일</label>
                <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none w-full" />
              </div>
            </div>
          </div>

          {/* Choices (not for yesno) */}
          {editType !== 'yesno' ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold mb-3">선택지</h3>
              <div className="space-y-2">
                {editChoices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-5">{i + 1}.</span>
                    <input type="text" value={c} onChange={e => {
                      const arr = [...editChoices];
                      arr[i] = e.target.value;
                      setEditChoices(arr);
                    }}
                      placeholder={`선택지 ${i + 1}`}
                      className="flex-1 bg-transparent border-b border-white/5 pb-1 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600" />
                    {editChoices.length > 2 && (
                      <button onClick={() => setEditChoices(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-slate-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setEditChoices(prev => [...prev, ''])}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1">+ 선택지 추가</button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold mb-3">찬반 투표</h3>
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <ThumbsUp size={24} className="mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-400">찬성</p>
                </div>
                <div className="flex-1 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
                  <ThumbsDown size={24} className="mx-auto mb-2 text-red-400" />
                  <p className="text-sm font-semibold text-red-400">반대</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════ DETAIL VIEW ═══════════ */
  if (viewMode === 'detail' && selectedVote) {
    const sv = selectedVote;
    const showResults = canSeeResults(sv);
    const totalVotes = sv.choices.reduce((a, c) => a + c.votes, 0);
    const maxVotes = Math.max(...sv.choices.map(c => c.votes), 1);
    const rate = sv.targetCount > 0 ? Math.round((sv.totalParticipants / sv.targetCount) * 100) : 0;
    const hasVoted = sv.myVote !== null;
    const sortedByVotes = [...sv.choices].sort((a, b) => b.votes - a.votes);

    return (
      <div>
        <button onClick={() => { setViewMode('list'); setSelectedVote(null); }} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={15} /> 목록으로
        </button>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{sv.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{sv.createdBy} | {sv.createdAt} | {TYPE_LABELS[sv.type]}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded shrink-0 ${STATUS_STYLES[sv.status].color}`}>
            {STATUS_STYLES[sv.status].label}
          </span>
        </div>

        {sv.description && <p className="text-sm text-slate-400 mb-4">{sv.description}</p>}

        {/* Participation rate */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 flex items-center gap-1.5"><Users size={13} /> 참여율</span>
            <span className="text-xs font-semibold">{sv.totalParticipants}/{sv.targetCount} ({rate}%)</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 ease-out" style={{ width: `${rate}%` }} />
          </div>
        </div>

        {/* ──── YES/NO VOTE ──── */}
        {sv.type === 'yesno' && (
          <div className="space-y-4">
            {!hasVoted && sv.status === 'active' ? (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setMySelection('yes'); }}
                  className={`rounded-xl border-2 p-8 flex flex-col items-center gap-3 transition-all ${mySelection === 'yes' ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' : 'border-white/10 hover:border-emerald-500/50 bg-white/[0.02]'}`}>
                  <ThumbsUp size={40} className={mySelection === 'yes' ? 'text-emerald-400' : 'text-slate-500'} />
                  <span className={`text-lg font-bold ${mySelection === 'yes' ? 'text-emerald-400' : 'text-slate-400'}`}>찬성</span>
                </button>
                <button onClick={() => { setMySelection('no'); }}
                  className={`rounded-xl border-2 p-8 flex flex-col items-center gap-3 transition-all ${mySelection === 'no' ? 'border-red-500 bg-red-500/10 scale-[1.02]' : 'border-white/10 hover:border-red-500/50 bg-white/[0.02]'}`}>
                  <ThumbsDown size={40} className={mySelection === 'no' ? 'text-red-400' : 'text-slate-500'} />
                  <span className={`text-lg font-bold ${mySelection === 'no' ? 'text-red-400' : 'text-slate-400'}`}>반대</span>
                </button>
              </div>
            ) : null}

            {showResults && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                {/* Donut-style visual */}
                <div className="flex items-center justify-center gap-8 mb-6">
                  {sv.choices.map(c => {
                    const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                    const isYes = c.id === 'yes';
                    const color = isYes ? 'text-emerald-400' : 'text-red-400';
                    const bg = isYes ? 'border-emerald-500/30' : 'border-red-500/30';
                    return (
                      <div key={c.id} className={`flex flex-col items-center border-2 ${bg} rounded-2xl p-6 min-w-[120px]`}>
                        <span className={`text-3xl font-black ${color} transition-all duration-700 ${animateResults ? 'opacity-100' : 'opacity-0'}`}>{pct}%</span>
                        <span className="text-sm text-slate-400 mt-1">{c.label}</span>
                        <span className="text-xs text-slate-600 mt-0.5">{c.votes}표</span>
                      </div>
                    );
                  })}
                </div>
                {/* Combined bar */}
                <div className="h-4 rounded-full overflow-hidden flex">
                  {sv.choices.map(c => {
                    const pct = totalVotes > 0 ? (c.votes / totalVotes) * 100 : 50;
                    const isYes = c.id === 'yes';
                    return (
                      <div key={c.id}
                        className={`h-full transition-all duration-1000 ease-out ${isYes ? 'bg-emerald-500/50' : 'bg-red-500/50'}`}
                        style={{ width: animateResults ? `${pct}%` : '50%' }} />
                    );
                  })}
                </div>
              </div>
            )}

            {!hasVoted && sv.status === 'active' && (
              <button onClick={handleCastVote} disabled={mySelection === null}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-30 transition-colors">
                투표하기
              </button>
            )}
            {hasVoted && (
              <div className="text-center py-2">
                <p className="text-sm text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={15} /> 투표 완료
                </p>
              </div>
            )}
          </div>
        )}

        {/* ──── SINGLE SELECT ──── */}
        {sv.type === 'single' && (
          <div className="space-y-4">
            {!hasVoted && sv.status === 'active' ? (
              <div className="space-y-2">
                {sv.choices.map(c => (
                  <button key={c.id} onClick={() => setMySelection(c.id)}
                    className={`w-full rounded-xl border-2 p-4 text-left flex items-center gap-3 transition-all ${mySelection === c.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${mySelection === c.id ? 'border-indigo-500 bg-indigo-500' : 'border-white/20'}`}>
                      {mySelection === c.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium">{c.label}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {showResults && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">결과</h3>
                {sortedByVotes.map((c, i) => {
                  const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                  const isWinner = i === 0;
                  return (
                    <div key={c.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm ${isWinner ? 'font-semibold text-indigo-300' : 'text-slate-400'}`}>
                          {isWinner && sv.status === 'closed' && '🏆 '}{c.label}
                        </span>
                        <span className="text-xs text-slate-500">{c.votes}표 ({pct}%)</span>
                      </div>
                      <div className="h-6 rounded bg-white/5 overflow-hidden">
                        <div className={`h-full rounded transition-all duration-1000 ease-out flex items-center px-2 ${isWinner ? 'bg-indigo-500/40' : 'bg-white/10'}`}
                          style={{ width: animateResults ? `${(c.votes / maxVotes) * 100}%` : '0%', minWidth: c.votes > 0 ? '24px' : '0' }}>
                          {c.votes > 0 && <span className="text-[10px] font-semibold text-white/70">{pct}%</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!hasVoted && sv.status === 'active' && (
              <button onClick={handleCastVote} disabled={mySelection === null}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-30 transition-colors">
                투표하기
              </button>
            )}
            {hasVoted && (
              <div className="text-center py-2">
                <p className="text-sm text-emerald-400 flex items-center justify-center gap-1.5"><CheckCircle2 size={15} /> 투표 완료</p>
              </div>
            )}
          </div>
        )}

        {/* ──── MULTIPLE SELECT ──── */}
        {sv.type === 'multiple' && (
          <div className="space-y-4">
            {!hasVoted && sv.status === 'active' ? (
              <div className="space-y-2">
                {sv.choices.map(c => {
                  const sel = Array.isArray(mySelection) ? (mySelection as string[]).includes(c.id) : false;
                  return (
                    <button key={c.id} onClick={() => {
                      const cur = Array.isArray(mySelection) ? (mySelection as string[]) : [];
                      setMySelection(sel ? cur.filter(x => x !== c.id) : [...cur, c.id]);
                    }}
                      className={`w-full rounded-xl border-2 p-4 text-left flex items-center gap-3 transition-all ${sel ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15'}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${sel ? 'border-indigo-500 bg-indigo-500' : 'border-white/20'}`}>
                        {sel && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {showResults && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">결과</h3>
                {sortedByVotes.map((c, i) => {
                  const pct = sv.totalParticipants > 0 ? Math.round((c.votes / sv.totalParticipants) * 100) : 0;
                  const isTop = i === 0;
                  return (
                    <div key={c.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm ${isTop ? 'font-semibold text-indigo-300' : 'text-slate-400'}`}>{c.label}</span>
                        <span className="text-xs text-slate-500">{c.votes}표 ({pct}%)</span>
                      </div>
                      <div className="h-6 rounded bg-white/5 overflow-hidden">
                        <div className={`h-full rounded transition-all duration-1000 ease-out flex items-center px-2 ${isTop ? 'bg-indigo-500/40' : 'bg-white/10'}`}
                          style={{ width: animateResults ? `${(c.votes / maxVotes) * 100}%` : '0%', minWidth: c.votes > 0 ? '24px' : '0' }}>
                          {c.votes > 0 && <span className="text-[10px] font-semibold text-white/70">{pct}%</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!hasVoted && sv.status === 'active' && (
              <button onClick={handleCastVote} disabled={!Array.isArray(mySelection) || (mySelection as string[]).length === 0}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-30 transition-colors">
                투표하기
              </button>
            )}
            {hasVoted && (
              <div className="text-center py-2">
                <p className="text-sm text-emerald-400 flex items-center justify-center gap-1.5"><CheckCircle2 size={15} /> 투표 완료</p>
              </div>
            )}
          </div>
        )}

        {/* ──── RANKING ──── */}
        {sv.type === 'ranking' && (
          <div className="space-y-4">
            {!hasVoted && sv.status === 'active' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">각 항목에 순위를 입력해주세요 (1이 가장 높음)</p>
                <div className="space-y-2">
                  {sv.choices.map((c, ci) => {
                    const rankArr = Array.isArray(mySelection) ? (mySelection as number[]) : [];
                    const rank = rankArr[ci] ?? '';
                    return (
                      <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <input type="number" min={1} max={sv.choices.length} value={rank}
                          onChange={e => {
                            const arr = Array.isArray(mySelection) ? [...(mySelection as number[])] : new Array(sv.choices.length).fill(0);
                            arr[ci] = parseInt(e.target.value) || 0;
                            setMySelection(arr);
                          }}
                          className="w-12 h-10 rounded-lg border border-white/10 bg-white/[0.03] text-center text-sm font-bold text-indigo-400 focus:border-indigo-500 focus:outline-none" />
                        <span className="text-sm font-medium">{c.label}</span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleCastVote}
                  className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-30 transition-colors">
                  투표하기
                </button>
              </div>
            ) : null}

            {showResults && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">순위 결과 (가중 점수)</h3>
                <div className="space-y-3">
                  {sortedByVotes.map((c, i) => {
                    const pct = maxVotes > 0 ? (c.votes / maxVotes) * 100 : 0;
                    const medals = ['text-amber-400', 'text-slate-300', 'text-amber-700'];
                    return (
                      <div key={c.id} className="flex items-center gap-3">
                        <span className={`text-lg font-black w-8 text-center ${i < 3 ? medals[i] : 'text-slate-600'}`}>{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm ${i === 0 ? 'font-semibold text-indigo-300' : 'text-slate-400'}`}>{c.label}</span>
                            <span className="text-xs text-slate-500">{c.votes}점</span>
                          </div>
                          <div className="h-5 rounded bg-white/5 overflow-hidden">
                            <div className={`h-full rounded transition-all duration-1000 ease-out ${i === 0 ? 'bg-amber-500/30' : i === 1 ? 'bg-slate-400/20' : 'bg-white/10'}`}
                              style={{ width: animateResults ? `${pct}%` : '0%', minWidth: c.votes > 0 ? '8px' : '0' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {hasVoted && (
              <div className="text-center py-2">
                <p className="text-sm text-emerald-400 flex items-center justify-center gap-1.5"><CheckCircle2 size={15} /> 투표 완료</p>
              </div>
            )}
          </div>
        )}

        {/* Not visible notice */}
        {!showResults && !hasVoted && sv.status === 'active' && sv.resultVisibility === 'after_close' && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3 mt-4">
            <EyeOff size={16} className="text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">결과는 투표 마감 후 공개됩니다.</p>
          </div>
        )}

        {/* Deadline info */}
        {sv.deadline && (
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-600">
            <Calendar size={13} />
            <span>마감: {sv.deadline}</span>
            {sv.anonymous && <span className="ml-2 px-1.5 py-0.5 rounded bg-white/5 text-slate-500">익명 투표</span>}
          </div>
        )}
      </div>
    );
  }

  /* ═══════════ LIST VIEW ═══════════ */
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">투표</h1>
          <p className="text-xs text-slate-500 mt-0.5">COMM-VOTE</p>
        </div>
        <button onClick={handleCreateNew}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 새 투표 만들기
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: '전체 투표', value: stats.total, icon: Vote, color: 'text-indigo-400' },
          { label: '진행중', value: stats.active, icon: Clock, color: 'text-emerald-400' },
          { label: '완료', value: stats.closed, icon: CheckCircle2, color: 'text-slate-400' },
        ].map((st, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <st.icon size={15} className={st.color} />
              <span className="text-xs text-slate-500">{st.label}</span>
            </div>
            <p className="text-xl font-bold">{st.value}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          {(['all', 'active', 'closed'] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${filterStatus === f ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              {f === 'all' ? '전체' : STATUS_STYLES[f].label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="투표 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="rounded-lg border border-white/5 bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none w-48" />
        </div>
      </div>

      {/* Vote Cards */}
      {filteredVotes.length === 0 ? (
        <div className="text-center py-16">
          <Vote size={40} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm text-slate-400">투표가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredVotes.map(v => {
            const rate = v.targetCount > 0 ? Math.round((v.totalParticipants / v.targetCount) * 100) : 0;
            const totalVt = v.choices.reduce((a, c) => a + c.votes, 0);
            const topChoice = [...v.choices].sort((a, b) => b.votes - a.votes)[0];
            const topPct = totalVt > 0 ? Math.round((topChoice.votes / totalVt) * 100) : 0;
            const hasVoted = v.myVote !== null;

            return (
              <div key={v.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-colors cursor-pointer group"
                onClick={() => openDetail(v)}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold group-hover:text-indigo-300 transition-colors">{v.title}</h3>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${STATUS_STYLES[v.status].color}`}>
                      {STATUS_STYLES[v.status].label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{TYPE_LABELS[v.type]}</span>
                  </div>
                </div>

                {/* Mini result preview */}
                {(v.status === 'closed' || hasVoted) && v.type === 'yesno' && (
                  <div className="flex gap-2 mb-3">
                    {v.choices.map(c => {
                      const pct = totalVt > 0 ? Math.round((c.votes / totalVt) * 100) : 50;
                      const isYes = c.id === 'yes';
                      return (
                        <div key={c.id} className={`flex-1 rounded-lg p-2 text-center ${isYes ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                          <span className={`text-lg font-bold ${isYes ? 'text-emerald-400' : 'text-red-400'}`}>{pct}%</span>
                          <p className="text-[10px] text-slate-500">{c.label}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
                {(v.status === 'closed' || hasVoted) && v.type !== 'yesno' && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500">1위</span>
                      <span className="text-xs font-semibold text-indigo-300">{topChoice.label}</span>
                      <span className="text-[10px] text-slate-500 ml-auto">{topPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500/50" style={{ width: `${topPct}%` }} />
                    </div>
                  </div>
                )}

                {/* Participation */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1"><Users size={11} /> {v.totalParticipants}/{v.targetCount} 참여</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{rate}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-indigo-500/40" style={{ width: `${rate}%` }} />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>{v.createdBy}</span>
                  {v.deadline && <span>마감 {v.deadline}</span>}
                </div>

                {!hasVoted && v.status === 'active' && (
                  <div className="mt-3 w-full rounded-lg border border-indigo-500/30 bg-indigo-500/5 py-2 text-center text-xs text-indigo-400 font-semibold">
                    투표 참여하기
                  </div>
                )}
                {hasVoted && (
                  <div className="mt-3 w-full rounded-lg border border-emerald-500/20 bg-emerald-500/5 py-2 text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} /> 투표 완료
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
