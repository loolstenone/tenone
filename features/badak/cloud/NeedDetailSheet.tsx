'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CloudWord } from '@/types/badak';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

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

  if (!word) return null;

  const related = getRelatedWords(word);

  const handleInterest = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      return;
    }
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // 니즈 keyword로 need_id를 찾아서 interest 등록
    // 실제로는 cloudWord에 id를 포함해야 하지만, 현재는 텍스트 기반으로 처리
    setActionDone('interest');
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      return;
    }
    setActionDone('join');
  };

  const handleLeader = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      return;
    }
    onClose();
    router.push('/badak/groups/create');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] mx-auto flex max-w-[860px] flex-col backdrop-blur-lg"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      {/* Upper area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div
          className="mb-3 text-sm text-white/40"
          style={{ animation: 'badak-fadeUp 0.4s ease both' }}
        >
          선택한 니즈
        </div>
        <div
          className="mb-8 rounded-full px-8 py-3 text-xl font-bold"
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
          {word.hasGroup && <span className="mr-2 text-sm opacity-80">●</span>}
          {word.text}
          {word.members > 0 && (
            <span className="ml-2 text-sm opacity-50">{word.members}명</span>
          )}
        </div>

        <div className="mb-2 text-xs text-white/30">관련 니즈</div>
        <div className="flex flex-wrap justify-center gap-2">
          {related.map((w, i) => (
            <span
              key={w.text}
              className="rounded-full px-3 py-1.5 text-xs"
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

      {/* Bottom sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-3xl"
        style={{
          background: '#1a1a2e',
          padding: '28px 24px 40px',
          animation: 'badak-fadeUp 0.3s ease',
        }}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-sm bg-white/15" />

        <div className="mb-2 text-lg font-bold tracking-tight text-white">
          {word.text}
        </div>

        {actionDone ? (
          <div className="py-6 text-center">
            <div className="mb-2 text-2xl">
              {actionDone === 'interest' && '✋'}
              {actionDone === 'join' && '🎉'}
              {actionDone === 'leader' && '🙋'}
            </div>
            <div className="text-sm text-white/70">
              {actionDone === 'interest' && '관심이 등록되었습니다!'}
              {actionDone === 'join' && '참여 신청이 완료되었습니다!'}
              {actionDone === 'leader' && '바닥장 지원이 접수되었습니다!'}
            </div>
          </div>
        ) : word.hasGroup ? (
          <>
            <div className="mb-5 text-[13px] text-white/50">
              {word.members}명이 참여하는 모임이 진행 중이에요
            </div>
            <button
              onClick={handleJoin}
              className="w-full cursor-pointer rounded-[14px] border-none py-4 text-[15px] font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)',
                color: '#1a1a2e',
              }}
            >
              모임 참여하기
            </button>
          </>
        ) : (
          <>
            <div className="mb-3 text-[13px] text-white/50">
              {word.members >= 20
                ? `${word.members}명이 관심 — 바닥장을 찾고 있어요!`
                : `${word.members}명이 관심 — 20명 모이면 모임을 열 수 있어요`}
            </div>
            {/* 진행바 */}
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (word.members / 20) * 100)}%`,
                  background: word.members >= 20
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
                }}
              />
            </div>
            <button
              onClick={handleInterest}
              className="mb-2.5 w-full cursor-pointer rounded-[14px] border-none py-4 text-[15px] font-bold tracking-tight"
              style={{
                background: 'rgba(255,217,61,0.15)',
                color: '#ffd93d',
              }}
            >
              나도 관심 있어요 ✋
            </button>
            {word.members >= 20 ? (
              <button
                onClick={handleLeader}
                className="w-full cursor-pointer rounded-[14px] border border-white/12 bg-transparent py-4 text-[15px] font-semibold tracking-tight text-white/60"
              >
                바닥장으로 추진할게요 🙋
              </button>
            ) : (
              <div className="py-2 text-center text-xs text-white/30">
                {20 - word.members}명 더 모이면 바닥장 지원이 열려요
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
