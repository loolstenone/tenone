'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { CloudWord } from '@/types/badak';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';

type PendingAction = 'interest' | 'join' | 'leader' | null;

interface NeedDetailSheetProps {
  word: CloudWord | null;
  onClose: () => void;
}

function getRelatedWords(word: CloudWord): CloudWord[] {
  return CLOUD_WORDS.filter((w) => w.text !== word.text)
    .sort(() => 0.5 - Math.sin(word.text.length * 7))
    .slice(0, 4);
}

export function NeedDetailSheet({ word, onClose }: NeedDetailSheetProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const pendingAction = useRef<PendingAction>(null);

  // 로그인 성공 후 대기 중인 동작 자동 실행
  useEffect(() => {
    if (isAuthenticated && pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      setShowLogin(false);
      if (action === 'interest') {
        setActionDone('interest');
      } else if (action === 'join') {
        setActionDone('join');
      } else if (action === 'leader') {
        onClose();
        router.push('/badak/groups/create');
      }
    }
  }, [isAuthenticated, onClose, router]);

  if (!word) return null;

  const related = getRelatedWords(word);
  const g = word.group;

  const requireLogin = (action: PendingAction) => {
    pendingAction.current = action;
    setShowLogin(true);
    return false;
  };

  const handleInterest = () => {
    if (!isAuthenticated) return requireLogin('interest');
    setActionDone('interest');
  };

  const handleJoinRequest = () => {
    if (!isAuthenticated) return requireLogin('join');
    setActionDone('join');
  };

  const handleLeader = () => {
    if (!isAuthenticated) return requireLogin('leader');
    onClose();
    router.push('/badak/groups/create');
  };

  // ── 바텀 시트 내용 ──

  const renderBottomContent = () => {
    if (actionDone) {
      return (
        <div className="py-5 text-center">
          <div className="mb-2 text-xl">
            {actionDone === 'interest' ? '✋' : '🎉'}
          </div>
          <div className="text-sm text-white/70">
            {actionDone === 'interest'
              ? '관심이 등록되었습니다! 15명이 모이면 알려드릴게요.'
              : '참여 신청이 바닥장에게 전달되었습니다!'}
          </div>
        </div>
      );
    }

    // ── 방 개설됨: 참여하기 ──
    if (word.hasGroup && g) {
      const remaining = g.maxMembers - g.currentMembers;
      const isFull = remaining <= 0;
      const isConfirmed = g.status === 'confirmed';

      return (
        <>
          {/* 모임 정보 카드 */}
          <div className="mb-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {/* 모임 유형 뱃지 */}
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
              <span>📍 {g.location}</span>
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

          {/* 참여 버튼 (마감 시) */}
          {isFull ? (
            <button
              disabled
              className="w-full rounded-xl border-none py-3 text-sm font-bold tracking-tight sm:py-3.5"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }}
            >
              모집이 마감되었습니다
            </button>
          ) : (
            <>
              {/* 바닥장에게 메시지 + 참여 신청 */}
              <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="바닥장에게 한마디 (선택)"
                  className="w-full resize-none border-none bg-transparent px-3 pt-2.5 pb-1 text-xs text-white/80 outline-none placeholder:text-white/25"
                  rows={2}
                />
                <div className="flex items-center justify-between border-t border-white/5 px-3 py-1.5">
                  <span className="text-[10px] text-white/20">
                    바닥장 {g.leaderName}에게 전달됩니다
                  </span>
                  <button
                    onClick={handleJoinRequest}
                    className="cursor-pointer rounded-lg border-none px-4 py-1.5 text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)', color: '#1a1a2e' }}
                  >
                    참여 신청
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 다회성 모임 추가 안내 */}
          {g.type === 'recurring' && !isFull && (
            <div className="mt-2 text-center text-[10px] text-white/25">
              정기 모임 · 참여 후 언제든 탈퇴 가능
            </div>
          )}
        </>
      );
    }

    // ── 방 미개설: 관심 있어요 ──
    return (
      <>
        <div className="mb-2.5 text-xs text-white/50 sm:text-[13px]">
          {word.members >= 15
            ? `${word.members}명이 관심 — 바닥장을 찾고 있어요!`
            : `${word.members}명이 관심 — 15명 모이면 모임을 열 수 있어요`}
        </div>
        {/* 진행바 */}
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10 sm:mb-4">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (word.members / 15) * 100)}%`,
              background: word.members >= 15
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
            }}
          />
        </div>

        {/* 관심 메시지 + 등록 */}
        <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="어떤 모임을 기대하나요? (선택)"
            className="w-full resize-none border-none bg-transparent px-3 pt-2.5 pb-1 text-xs text-white/80 outline-none placeholder:text-white/25"
            rows={2}
          />
          <div className="flex items-center justify-between border-t border-white/5 px-3 py-1.5">
            <span className="text-[10px] text-white/20">
              관심 멤버들에게 공유됩니다
            </span>
            <button
              onClick={handleInterest}
              className="cursor-pointer rounded-lg border-none px-4 py-1.5 text-xs font-bold"
              style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
            >
              관심 등록
            </button>
          </div>
        </div>

        {word.members >= 15 ? (
          <button
            onClick={handleLeader}
            className="w-full cursor-pointer rounded-xl border border-white/12 bg-transparent py-3 text-sm font-semibold tracking-tight text-white/60 sm:py-3.5"
          >
            바닥장으로 추진할게요
          </button>
        ) : (
          <div className="py-1.5 text-center text-[10px] text-white/30 sm:py-2 sm:text-xs">
            {15 - word.members}명 더 모이면 바닥장 지원이 열려요
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
          {word.hasGroup ? '모임 개설됨' : '선택한 니즈'}
        </div>
        <div
          className="mb-5 max-w-[90%] rounded-full px-5 py-2.5 text-center text-sm font-bold sm:mb-8 sm:px-8 sm:py-3 sm:text-xl"
          style={{
            background: word.hasGroup
              ? 'rgba(255, 200, 87, 0.2)'
              : 'rgba(255, 255, 255, 0.1)',
            border: word.hasGroup
              ? '1px solid rgba(255, 200, 87, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            color: word.hasGroup ? '#ffd93d' : '#fff',
            animation: 'badak-fadeUp 0.3s ease both',
          }}
        >
          {word.hasGroup && <span className="mr-1.5 text-xs opacity-80 sm:mr-2 sm:text-sm">●</span>}
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
                background: w.hasGroup
                  ? 'rgba(255, 200, 87, 0.1)'
                  : 'rgba(255, 255, 255, 0.06)',
                border: w.hasGroup
                  ? '1px solid rgba(255, 200, 87, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
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

      {/* Login Modal */}
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
        <div className="mb-2 text-base font-bold tracking-tight text-white sm:text-lg">
          {g ? g.title : word.text}
        </div>

        {renderBottomContent()}
      </div>
    </div>
  );
}
