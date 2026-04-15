'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, ChevronRight, Plus, Users, Flame, Hand } from 'lucide-react';
import type { CloudWord, CloudGroup } from '@/types/badak';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type PendingAction = 'interest' | 'fire' | 'join' | 'leader' | null;

interface NeedDetailSheetProps {
  word: CloudWord | null;
  onClose: () => void;
  allWords?: CloudWord[];  // 관련 니즈 검색용 (실DB 데이터)
}

function getRelatedWords(word: CloudWord, allWords?: CloudWord[]): CloudWord[] {
  const pool = allWords?.length ? allWords : CLOUD_WORDS;
  return pool
    .filter((w) => w.text !== word.text)
    .sort(() => 0.5 - Math.sin(word.text.length * 7))
    .slice(0, 4);
}

async function reactToNeed(
  needId: string,
  reaction: 'interest' | 'fire',
  message: string,
  token: string,
) {
  const res = await fetch('/api/badak/needs/react', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ needId, reaction, message }),
  });
  return res.json();
}

export function NeedDetailSheet({ word, onClose, allWords }: NeedDetailSheetProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [joinDone, setJoinDone] = useState(false);
  const [reacted, setReacted] = useState<{ interest: boolean; fire: boolean }>({ interest: false, fire: false });
  const [interestCount, setInterestCount] = useState(word?.interestCount ?? 0);
  const [fireCount, setFireCount] = useState(word?.fireCount ?? 0);
  const [reactLoading, setReactLoading] = useState<'interest' | 'fire' | null>(null);
  const pendingAction = useRef<PendingAction>(null);

  // word 바뀌면 초기화
  useEffect(() => {
    setJoinDone(false);
    setMessage('');
    setSelectedGroupIdx(0);
    setReacted({ interest: false, fire: false });
    setInterestCount(word?.interestCount ?? 0);
    setFireCount(word?.fireCount ?? 0);
  }, [word?.needId, word?.text, word?.interestCount, word?.fireCount]);

  // 로그인 상태면 내 리액션 조회
  useEffect(() => {
    if (!isAuthenticated || !word?.needId) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;
      fetch(`/api/badak/needs/react?needId=${word.needId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((d) => setReacted({ interest: !!d.interest, fire: !!d.fire }))
        .catch(() => {});
    });
  }, [isAuthenticated, word?.needId]);

  // 로그인 성공 후 대기 중인 동작 자동 실행
  useEffect(() => {
    if (isAuthenticated && pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      setShowLogin(false);
      if (action === 'leader') {
        onClose();
        router.push('/badak/groups/create');
      }
    }
  }, [isAuthenticated, onClose, router]);

  if (!word) return null;

  const allGroups: CloudGroup[] = word.groups?.length
    ? word.groups
    : word.group
      ? [word.group]
      : [];
  const hasGroups = allGroups.length > 0;
  const related = getRelatedWords(word, allWords);

  const requireLogin = (action: PendingAction) => {
    pendingAction.current = action;
    setShowLogin(true);
    return false;
  };

  const handleReact = async (reaction: 'interest' | 'fire') => {
    if (!isAuthenticated) return requireLogin(reaction);
    if (!word.needId) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return requireLogin(reaction);
    setReactLoading(reaction);
    try {
      const res = await reactToNeed(word.needId, reaction, message, session.access_token);
      if (res.action === 'added') {
        setReacted((p) => ({ ...p, [reaction]: true }));
        if (reaction === 'interest') setInterestCount((c) => c + 1);
        else setFireCount((c) => c + 1);
      } else {
        setReacted((p) => ({ ...p, [reaction]: false }));
        if (reaction === 'interest') setInterestCount((c) => Math.max(0, c - 1));
        else setFireCount((c) => Math.max(0, c - 1));
      }
    } finally {
      setReactLoading(null);
    }
  };

  const handleLeader = () => {
    if (!isAuthenticated) return requireLogin('leader');
    onClose();
    router.push('/badak/groups/create');
  };

  const handleGoGroup = (groupId: string) => {
    onClose();
    router.push(`/badak/groups/${groupId}`);
  };

  // ── 바텀 시트 본문 ──
  const renderBottomContent = () => {
    if (joinDone) {
      return (
        <div className="py-5 text-center">
          <div className="mb-2 text-xl">🎉</div>
          <div className="text-sm text-white/70">
            참여 신청이 바닥장에게 전달되었습니다!
          </div>
        </div>
      );
    }

    // ── 모임방 있음 ──
    if (hasGroups) {
      return (
        <>
          {/* 여러 모임: 탭 선택 */}
          {allGroups.length > 1 && (
            <div className="mb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
              {allGroups.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroupIdx(i)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all"
                  style={{
                    background: selectedGroupIdx === i ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.06)',
                    color: selectedGroupIdx === i ? '#ffd93d' : 'rgba(255,255,255,0.45)',
                    border: `1px solid ${selectedGroupIdx === i ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  방 {i + 1} · {g.currentMembers}/{g.maxMembers}명
                </button>
              ))}
            </div>
          )}

          <GroupCard
            group={allGroups[selectedGroupIdx]}
            onJoin={() => {
              if (!isAuthenticated) { requireLogin('join'); return; }
              setJoinDone(true);
            }}
            onGoGroup={handleGoGroup}
            message={message}
            onMessageChange={setMessage}
          />

          {/* 같은 니즈로 다른 방 개설 안내 */}
          <button
            onClick={handleLeader}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/8 py-2.5 text-xs text-white/35 transition-all hover:border-white/15 hover:text-white/55"
          >
            <Plus className="h-3 w-3" />
            같은 니즈로 새 방 개설하기
          </button>
        </>
      );
    }

    // ── 모임방 없음 ──
    const totalCount = interestCount + fireCount;
    return (
      <>
        <div className="mb-2.5 text-xs text-white/50">
          {totalCount >= 15
            ? `${totalCount}명이 관심 — 바닥장을 찾고 있어요!`
            : `${totalCount}명이 관심 — 15명 모이면 모임을 열 수 있어요`}
        </div>

        {/* 진행바 */}
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (totalCount / 15) * 100)}%`,
              background: totalCount >= 15
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
            }}
          />
        </div>

        {/* 리액션 버튼 — 관심 + 불꽃 */}
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => handleReact('interest')}
            disabled={reactLoading === 'interest'}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
            style={{
              background: reacted.interest ? 'rgba(255,217,61,0.18)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${reacted.interest ? 'rgba(255,217,61,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: reacted.interest ? '#ffd93d' : 'rgba(255,255,255,0.5)',
              opacity: reactLoading === 'interest' ? 0.6 : 1,
            }}
          >
            <Hand className="h-4 w-4" />
            관심 {interestCount > 0 && <span className="text-xs opacity-70">{interestCount}</span>}
          </button>
          <button
            onClick={() => handleReact('fire')}
            disabled={reactLoading === 'fire'}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
            style={{
              background: reacted.fire ? 'rgba(255,107,107,0.18)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${reacted.fire ? 'rgba(255,107,107,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: reacted.fire ? '#ff6b6b' : 'rgba(255,255,255,0.5)',
              opacity: reactLoading === 'fire' ? 0.6 : 1,
            }}
          >
            <Flame className="h-4 w-4" />
            불꽃 {fireCount > 0 && <span className="text-xs opacity-70">{fireCount}</span>}
          </button>
        </div>

        {/* 한마디 입력 */}
        <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="어떤 모임을 기대하나요? (선택 — 관심 등록 시 전달됩니다)"
            className="w-full resize-none border-none bg-transparent px-3 pt-2.5 pb-2 text-xs text-white/80 outline-none placeholder:text-white/25"
            rows={2}
          />
        </div>

        {/* 모임 개설 유도 */}
        {totalCount >= 15 ? (
          <button
            onClick={handleLeader}
            className="w-full cursor-pointer rounded-xl py-3 text-sm font-bold tracking-tight transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(255,217,61,0.15), rgba(255,107,107,0.15))',
              border: '1px solid rgba(255,217,61,0.25)',
              color: '#ffd93d',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <Crown className="h-4 w-4" />
              바닥장으로 모임 개설하기
            </span>
            <p className="mt-0.5 text-[10px] font-normal opacity-60">
              {totalCount}명이 기다리고 있어요
            </p>
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 text-center text-[11px] text-white/30">
            <Users className="h-3 w-3" />
            {15 - totalCount}명 더 모이면 바닥장 지원이 열려요
          </div>
        )}
      </>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] mx-auto flex max-w-[860px] flex-col justify-end overflow-hidden backdrop-blur-lg"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      {/* Upper area */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
        <div
          className="mb-2 text-xs text-white/40 sm:mb-3 sm:text-sm"
          style={{ animation: 'badak-fadeUp 0.4s ease both' }}
        >
          {hasGroups
            ? `모임 ${allGroups.length}개 개설됨`
            : '선택한 니즈'}
        </div>
        <div
          className="mb-5 max-w-[90%] rounded-full px-5 py-2.5 text-center text-sm font-bold sm:mb-8 sm:px-8 sm:py-3 sm:text-xl"
          style={{
            background: hasGroups ? 'rgba(255, 200, 87, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: hasGroups ? '1px solid rgba(255, 200, 87, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
            color: hasGroups ? '#ffd93d' : '#fff',
            animation: 'badak-fadeUp 0.3s ease both',
          }}
        >
          {hasGroups && <span className="mr-1.5 text-xs opacity-80 sm:mr-2 sm:text-sm">●</span>}
          {word.text}
          {word.members > 0 && (
            <span className="ml-1.5 text-xs opacity-50 sm:ml-2 sm:text-sm">{word.members}명</span>
          )}
        </div>

        <div className="mb-2 text-[10px] text-white/30 sm:text-xs">관련 니즈</div>
        <div className="flex max-w-full flex-wrap justify-center gap-1.5 px-2 sm:gap-2">
          {related.map((w, i) => (
            <span
              key={w.text}
              className="rounded-full px-2.5 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs"
              style={{
                background: w.hasGroup ? 'rgba(255, 200, 87, 0.1)' : 'rgba(255, 255, 255, 0.06)',
                border: w.hasGroup ? '1px solid rgba(255, 200, 87, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: w.hasGroup ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                animation: 'badak-fadeUp 0.4s ease both',
                animationDelay: `${0.1 + i * 0.08}s`,
              }}
            >
              {w.text}
            </span>
          ))}
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* Bottom sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full shrink-0 rounded-t-3xl"
        style={{
          background: '#1a1a2e',
          padding: '16px 16px calc(env(safe-area-inset-bottom, 12px) + 12px)',
          animation: 'badak-fadeUp 0.3s ease',
        }}
      >
        {/* 타이틀 */}
        <div className="mb-3">
          <div className="text-base font-bold tracking-tight text-white sm:text-lg">
            {hasGroups
              ? allGroups.length > 1
                ? `"${word.text}" 모임 ${allGroups.length}개`
                : allGroups[0].title
              : word.text}
          </div>
          {hasGroups && allGroups.length === 1 && (
            <p className="mt-0.5 text-[11px] text-white/35">{word.text}</p>
          )}
        </div>

        {renderBottomContent()}
      </div>
    </div>
  );
}

// ── 모임 카드 ──
function GroupCard({
  group: g,
  onJoin,
  onGoGroup,
  message,
  onMessageChange,
}: {
  group: CloudGroup;
  onJoin: () => void;
  onGoGroup: (id: string) => void;
  message: string;
  onMessageChange: (v: string) => void;
}) {
  const remaining = g.maxMembers - g.currentMembers;
  const isFull = remaining <= 0;
  const isConfirmed = g.status === 'confirmed';

  return (
    <>
      {/* 모임 정보 카드 */}
      <div
        className="mb-3 rounded-xl p-3"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: g.type === 'recurring' ? 'rgba(99,102,241,0.2)' : 'rgba(59,130,246,0.2)',
              color: g.type === 'recurring' ? '#a5b4fc' : '#93c5fd',
            }}
          >
            {g.type === 'recurring' ? '정기 모임' : '1회 모임'}
          </span>
          {isConfirmed && (
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
              확정
            </span>
          )}
        </div>

        {/* 바닥장 */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
            {g.leaderName.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-semibold text-white/90">바닥장 {g.leaderName}</div>
            <div className="text-[10px] text-white/40">{g.leaderJob}</div>
          </div>
        </div>

        {/* 일정/장소 */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/50">
          <span>📅 {g.type === 'recurring' ? g.schedule : g.eventDate}</span>
          {g.location && <span>📍 {g.location}</span>}
        </div>
      </div>

      {/* 인원 현황 */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-white/50">참여 현황</span>
          <span className="font-semibold text-white/80">
            {g.currentMembers}<span className="text-white/40">/{g.maxMembers}명</span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (g.currentMembers / g.maxMembers) * 100)}%`,
              background: isFull
                ? '#ef4444'
                : remaining <= 3
                  ? 'linear-gradient(90deg, #ffd93d, #ff6b6b)'
                  : 'linear-gradient(90deg, #22c55e, #16a34a)',
            }}
          />
        </div>
        <div className="mt-1 text-right text-[10px] text-white/30">
          {isFull ? '모집 마감' : `잔여 ${remaining}석`}
          {!isFull && remaining <= 3 && ' · 마감 임박!'}
        </div>
      </div>

      {isFull ? (
        <div className="flex gap-2">
          <button
            disabled
            className="flex-1 rounded-xl py-3 text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }}
          >
            모집 마감
          </button>
          <button
            onClick={() => onGoGroup(g.id)}
            className="flex items-center gap-1 rounded-xl border border-white/10 px-4 py-3 text-xs text-white/50 transition-all hover:border-white/20 hover:text-white/70"
          >
            상세 보기 <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="바닥장에게 한마디 (선택)"
              className="w-full resize-none border-none bg-transparent px-3 pt-2.5 pb-1 text-xs text-white/80 outline-none placeholder:text-white/25"
              rows={2}
            />
            <div className="flex items-center justify-between border-t border-white/5 px-3 py-1.5">
              <span className="text-[10px] text-white/20">바닥장 {g.leaderName}에게 전달됩니다</span>
              <button
                onClick={onJoin}
                className="cursor-pointer rounded-lg border-none px-4 py-1.5 text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)', color: '#1a1a2e' }}
              >
                참여 신청
              </button>
            </div>
          </div>

          <button
            onClick={() => onGoGroup(g.id)}
            className="flex w-full items-center justify-center gap-1 rounded-xl border border-white/8 py-2 text-[11px] text-white/35 transition-all hover:text-white/55"
          >
            모임 상세 보기 <ChevronRight className="h-3 w-3" />
          </button>

          {g.type === 'recurring' && (
            <div className="mt-2 text-center text-[10px] text-white/25">
              정기 모임 · 참여 후 언제든 탈퇴 가능
            </div>
          )}
        </>
      )}
    </>
  );
}
