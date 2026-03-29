'use client';

import { useState, useEffect } from 'react';
import {
  Heart, Send, Award, Gift, Star, ThumbsUp,
  Lightbulb, HandHelping, Trophy, Flame, Gem,
  ChevronDown, ChevronUp, Vote
} from 'lucide-react';
import { useWIO } from '../../layout';

type RecognitionType = 'praise' | 'thanks' | 'idea' | 'help';
type BadgeId = 'mvp' | 'value_champion' | 'innovator' | 'tenure';

const RCG_TYPE_LABEL: Record<RecognitionType, string> = { praise: '칭찬', thanks: '감사', idea: '아이디어', help: '도움' };
const RCG_TYPE_ICON: Record<RecognitionType, typeof ThumbsUp> = { praise: ThumbsUp, thanks: Heart, idea: Lightbulb, help: HandHelping };
const RCG_TYPE_COLOR: Record<RecognitionType, string> = {
  praise: 'text-blue-400 bg-blue-500/10', thanks: 'text-pink-400 bg-pink-500/10',
  idea: 'text-amber-400 bg-amber-500/10', help: 'text-emerald-400 bg-emerald-500/10',
};

const CORE_VALUES = ['혁신', '협업', '성장', '책임', '고객중심'];

interface Recognition {
  id: string; from: string; to: string; type: RecognitionType;
  message: string; value: string; points: number; date: string;
}

interface Badge {
  id: BadgeId; icon: string; name: string; description: string; earnedAt: string;
}

const MOCK_RECOGNITIONS: Recognition[] = [
  { id: 'r1', from: '최수진', to: '김서연', type: 'praise', message: 'Orbi 대시보드 UI가 정말 깔끔해졌어요! 덕분에 데모가 성공적이었습니다.', value: '혁신', points: 100, date: '2026-03-28' },
  { id: 'r2', from: '이준호', to: '정하늘', type: 'thanks', message: '급한 버그 테스트 도와줘서 감사합니다. 덕분에 핫픽스 빠르게 나갔어요.', value: '협업', points: 80, date: '2026-03-27' },
  { id: 'r3', from: '박지민', to: '한민수', type: 'idea', message: '데이터 파이프라인 자동화 제안 덕분에 작업 시간이 절반으로 줄었어요!', value: '혁신', points: 120, date: '2026-03-26' },
  { id: 'r4', from: '김서연', to: '이준호', type: 'help', message: 'API 구조 설계할 때 같이 고민해줘서 큰 도움 됐어요.', value: '협업', points: 80, date: '2026-03-25' },
  { id: 'r5', from: '한민수', to: '최수진', type: 'praise', message: '고객 미팅 진행이 프로페셔널했습니다. 고객 반응이 아주 좋았어요.', value: '고객중심', points: 100, date: '2026-03-24' },
  { id: 'r6', from: '정하늘', to: '박지민', type: 'thanks', message: '디자인 시스템 정리 덕분에 QA 기준이 명확해졌어요.', value: '성장', points: 80, date: '2026-03-23' },
  { id: 'r7', from: '최수진', to: '이준호', type: 'idea', message: 'CI/CD 개선안이 팀 생산성을 크게 높였습니다.', value: '혁신', points: 120, date: '2026-03-22' },
  { id: 'r8', from: '김서연', to: '최수진', type: 'help', message: '프로젝트 일정 조율해주셔서 스트레스 없이 작업할 수 있었어요.', value: '책임', points: 80, date: '2026-03-21' },
];

const MOCK_BADGES: Badge[] = [
  { id: 'mvp', icon: '🏆', name: 'MVP', description: '월간 MVP 수상', earnedAt: '2026-02' },
  { id: 'value_champion', icon: '⭐', name: '가치 챔피언', description: '핵심가치 태그 50회 이상 획득', earnedAt: '2026-01' },
  { id: 'innovator', icon: '🔥', name: '혁신상', description: '아이디어 제안 10건 달성', earnedAt: '2025-12' },
  { id: 'tenure', icon: '💪', name: '장기근속', description: '3년 근속 달성', earnedAt: '2025-11' },
];

const MOCK_POINT_HISTORY = [
  { date: '2026-03-28', desc: '칭찬 받음 (최수진)', amount: 100, type: 'earn' as const },
  { date: '2026-03-25', desc: '도움 받음 (이준호)', amount: 80, type: 'earn' as const },
  { date: '2026-03-20', desc: '카페 쿠폰 교환', amount: -500, type: 'use' as const },
  { date: '2026-03-18', desc: 'MVP 투표 보너스', amount: 200, type: 'earn' as const },
  { date: '2026-03-15', desc: '칭찬 받음 (한민수)', amount: 100, type: 'earn' as const },
];

const MVP_CANDIDATES = [
  { id: 'c1', name: '이준호', votes: 8, reason: 'API 인증 모듈 완성 + CI/CD 개선' },
  { id: 'c2', name: '김서연', votes: 6, reason: 'Orbi 대시보드 UX 혁신' },
  { id: 'c3', name: '최수진', votes: 5, reason: '고객사 온보딩 3건 성공' },
];

export default function RecognitionPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [pointHistory, setPointHistory] = useState<typeof MOCK_POINT_HISTORY>([]);
  const [candidates, setCandidates] = useState<typeof MVP_CANDIDATES>([]);
  const [showSendForm, setShowSendForm] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [voted, setVoted] = useState(false);

  const totalPoints = 2450;

  useEffect(() => {
    if (!tenant) return;
    if (isDemo) {
      setRecognitions(MOCK_RECOGNITIONS);
      setBadges(MOCK_BADGES);
      setPointHistory(MOCK_POINT_HISTORY);
      setCandidates(MVP_CANDIDATES);
    }
    setLoading(false);
  }, [tenant, isDemo]);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">인정/포상</h1>
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
          <h1 className="text-xl font-bold">인정/포상</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-RCG | 칭찬 & 뱃지 & MVP</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
            <Gem size={13} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400">{totalPoints.toLocaleString()}P</span>
          </div>
          <button onClick={() => setShowSendForm(!showSendForm)}
            className="flex items-center gap-1.5 rounded-lg bg-pink-600/20 text-pink-400 px-3 py-1.5 text-xs font-semibold hover:bg-pink-600/30 transition-colors">
            <Send size={13} /> 칭찬하기
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Send Recognition Form */}
        {showSendForm && (
          <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Send size={15} className="text-pink-400" /> 칭찬 보내기
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">대상</label>
                <select className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300">
                  <option value="">선택</option>
                  {['김서연', '이준호', '박지민', '최수진', '정하늘', '한민수'].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">유형</label>
                <div className="flex gap-1.5">
                  {(Object.keys(RCG_TYPE_LABEL) as RecognitionType[]).map(t => {
                    const Icon = RCG_TYPE_ICON[t];
                    return (
                      <button key={t} className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-[10px] border border-white/5 hover:bg-white/5 transition-colors`}>
                        <Icon size={11} /> {RCG_TYPE_LABEL[t]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">핵심가치 태그</label>
                <div className="flex gap-1.5 flex-wrap">
                  {CORE_VALUES.map(v => (
                    <button key={v} className="px-2 py-1 text-[10px] rounded border border-white/10 text-slate-400 hover:bg-white/5">{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">포인트</label>
                <select className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300">
                  <option value="50">50P</option>
                  <option value="80">80P</option>
                  <option value="100">100P</option>
                  <option value="120">120P</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block mb-1">메시지</label>
                <textarea rows={2} placeholder="칭찬 메시지를 작성하세요" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowSendForm(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-300">취소</button>
              <button className="px-4 py-1.5 text-xs bg-pink-600 text-white rounded-lg hover:bg-pink-500">보내기</button>
            </div>
          </div>
        )}

        {/* Recognition Wall */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Heart size={15} className="text-pink-400" /> 인정 월 (Recognition Wall)
          </h2>
          <div className="space-y-2">
            {recognitions.map(r => {
              const Icon = RCG_TYPE_ICON[r.type];
              return (
                <div key={r.id} className="rounded-lg bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{r.from}</span>
                      <span className="text-slate-500 text-xs">→</span>
                      <span className="text-sm font-medium text-indigo-400">{r.to}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${RCG_TYPE_COLOR[r.type]}`}>
                        <Icon size={10} /> {RCG_TYPE_LABEL[r.type]}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">+{r.points}P</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{r.message}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">#{r.value}</span>
                    <span className="text-[10px] text-slate-600">{r.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Award size={15} className="text-amber-400" /> 뱃지 시스템
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {badges.map(b => (
              <div key={b.id} className="rounded-lg bg-white/[0.02] p-3 text-center">
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="text-xs font-semibold">{b.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{b.description}</p>
                <p className="text-[10px] text-slate-600 mt-1">{b.earnedAt} 획득</p>
              </div>
            ))}
          </div>
        </div>

        {/* Points */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <button onClick={() => setShowPoints(!showPoints)} className="w-full flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Gem size={15} className="text-amber-400" /> 포인트 현황 — {totalPoints.toLocaleString()}P
            </h2>
            {showPoints ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </button>
          {showPoints && (
            <div className="mt-4 space-y-2">
              {pointHistory.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2">
                  <span className="text-[10px] text-slate-600 w-20 shrink-0">{p.date}</span>
                  <span className="text-xs flex-1">{p.desc}</span>
                  <span className={`text-xs font-bold ${p.type === 'earn' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.type === 'earn' ? '+' : ''}{p.amount}P
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly MVP */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-violet-400" /> Monthly MVP 투표 — 2026년 3월
          </h2>
          <div className="space-y-2">
            {candidates.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-[10px] text-slate-500 ml-2">{c.reason}</span>
                </div>
                <span className="text-xs text-slate-400">{c.votes}표</span>
                {!voted && (
                  <button onClick={() => setVoted(true)}
                    className="px-2 py-1 text-[10px] rounded bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors">
                    투표
                  </button>
                )}
              </div>
            ))}
          </div>
          {voted && (
            <p className="text-[10px] text-emerald-400 mt-3 text-center">투표 완료! 결과는 월말에 발표됩니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
