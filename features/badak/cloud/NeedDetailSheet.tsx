'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, ChevronRight, Plus, ArrowLeft, Share2 } from 'lucide-react';
import type { CloudWord, CloudGroup } from '@/types/badak';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';
import { MemberProfileSheet } from '@/features/badak/MemberProfileSheet';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const LAUNCH_THRESHOLD = 15; // 공식 런칭 기준 관심 수

type PendingAction = 'interest' | 'join' | 'leader' | null;

interface NeedDetailSheetProps {
  word: CloudWord | null;
  onClose: () => void;
  allWords?: CloudWord[];
  onSelectWord?: (word: CloudWord) => void;
}

/** 관련 니즈: 현재 워드와 다른 단어 중 members 수 상위 4개 */
function getRelatedWords(word: CloudWord, allWords?: CloudWord[]): CloudWord[] {
  const pool = allWords?.length ? allWords : CLOUD_WORDS;
  return pool
    .filter((w) => w.text !== word.text)
    .sort((a, b) => (b.members ?? 0) - (a.members ?? 0))
    .slice(0, 4);
}

async function postInterest(needId: string, message: string, token: string) {
  const res = await fetch('/api/badak/needs/react', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ needId, reaction: 'interest', message }),
  });
  return res.json();
}

export function NeedDetailSheet({ word, onClose, allWords, onSelectWord }: NeedDetailSheetProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [joinDone, setJoinDone] = useState(false);
  const [interested, setInterested] = useState(false);
  // 카운트 초기값: word.members (실제 관심 인원) 우선, 없으면 interestCount
  const [count, setCount] = useState(0);
  const [reactLoading, setReactLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const pendingAction = useRef<PendingAction>(null);
  // 첫 마운트 여부 — 애니메이션 재실행 방지
  const [appeared, setAppeared] = useState(false);
  // 바닥장 신청 인라인 폼
  const [showLeaderForm, setShowLeaderForm] = useState(false);
  const [leaderDone, setLeaderDone] = useState(false);

  // word 바뀌면 초기화
  useEffect(() => {
    setJoinDone(false);
    setMessage('');
    setSelectedGroupIdx(0);
    setInterested(false);
    setShowLeaderForm(false);
    setLeaderDone(false);
    // members = 니즈 제출 인원수(=관심 총합), interestCount는 버튼 클릭 수
    // 둘 중 큰 값을 표시 (더 정확한 쪽)
    const base = Math.max(word?.members ?? 0, word?.interestCount ?? 0);
    setCount(base);
    // 다음 프레임에서 appeared 설정 → 슬라이드 애니메이션 1회만 실행
    const t = setTimeout(() => setAppeared(true), 50);
    return () => clearTimeout(t);
  }, [word?.needId, word?.text]); // eslint-disable-line react-hooks/exhaustive-deps

  // 로그인 상태면 내 관심 여부 조회
  useEffect(() => {
    if (!isAuthenticated || !word?.needId) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;
      fetch(`/api/badak/needs/react?needId=${word.needId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((d) => setInterested(!!d.interest))
        .catch(() => {});
    });
  }, [isAuthenticated, word?.needId]);

  // 로그인 성공 후 대기 동작 재실행
  useEffect(() => {
    if (isAuthenticated && pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      setShowLogin(false);
      if (action === 'leader') {
        setShowLeaderForm(true);
      } else if (action === 'join') {
        handleJoin();
      } else if (action === 'interest') {
        handleInterest();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!word) return null;

  const allGroups: CloudGroup[] = word.groups?.length
    ? word.groups
    : word.group ? [word.group] : [];
  const hasGroups = allGroups.length > 0;
  const related = getRelatedWords(word, allWords);
  const launched = count >= LAUNCH_THRESHOLD;

  const requireLogin = (action: PendingAction) => {
    pendingAction.current = action;
    setShowLogin(true);
  };

  async function handleInterest() {
    if (!isAuthenticated) { requireLogin('interest'); return; }

    // 낙관적 UI 업데이트 (needId 없어도 UI는 반응)
    const wasInterested = interested;
    setInterested(!wasInterested);
    setCount((c) => wasInterested ? Math.max(0, c - 1) : c + 1);

    const needId = word?.needId;
    if (!needId) return; // Mock 데이터 — UI만 반응

    try {
      setReactLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await postInterest(needId, message, session.access_token);
      // 서버 응답으로 보정 (낙관적 업데이트와 불일치 시 롤백)
      if (res.action === 'added') { setInterested(true); }
      else if (res.action === 'removed') { setInterested(false); setCount((c) => Math.max(0, c - (wasInterested ? 0 : 1))); }
    } catch {
      // silent
    } finally {
      setReactLoading(false);
    }
  }

  async function handleJoin() {
    if (!isAuthenticated) { requireLogin('join'); return; }
    const groupId = allGroups[selectedGroupIdx]?.id;
    if (!groupId) return;
    setJoinLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(`/api/badak/groups/${groupId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (res.ok || res.status === 409) setJoinDone(true);
      else console.error('join error', data.error);
    } catch {
      // silent
    } finally {
      setJoinLoading(false);
    }
  }

  const handleLeader = () => {
    if (!isAuthenticated) { requireLogin('leader'); return; }
    setShowLeaderForm(true);
  };

  const handleGoGroup = (groupId: string) => {
    onClose();
    router.push(`/badak/groups/${groupId}`);
  };

  const handleSelectRelated = (w: CloudWord) => {
    onSelectWord?.(w);
  };

  // ── 바텀 시트 내용 ──
  const renderBottomContent = () => {
    if (leaderDone) {
      return (
        <div className="py-6 text-center">
          <div className="mb-2 text-2xl">🙌</div>
          <div className="text-sm font-semibold text-white/80">바닥장 신청이 완료됐어요!</div>
          <div className="mt-1 text-xs text-white/35">검토 후 3일 이내 이메일로 연락드릴게요</div>
        </div>
      );
    }

    if (showLeaderForm) {
      return (
        <LeaderApplyForm
          word={word}
          onBack={() => setShowLeaderForm(false)}
          onSuccess={() => { setShowLeaderForm(false); setLeaderDone(true); }}
        />
      );
    }

    if (joinDone) {
      return (
        <div className="py-6 text-center">
          <div className="mb-2 text-2xl">🎉</div>
          <div className="text-sm font-semibold text-white/80">참여 신청이 전달됐어요!</div>
          <div className="mt-1 text-xs text-white/35">바닥장이 승인하면 알림으로 알려드려요</div>
        </div>
      );
    }

    // ── 모임 있음 ──
    if (hasGroups) {
      return (
        <>
          {allGroups.length > 1 && (
            <div className="mb-3 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
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
            onJoin={handleJoin}
            joinLoading={joinLoading}
            onGoGroup={handleGoGroup}
            message={message}
            onMessageChange={setMessage}
          />

          <button
            type="button"
            onClick={handleLeader}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/8 py-2.5 text-xs text-white/35 transition-all hover:border-white/15 hover:text-white/55"
          >
            <Plus className="h-3 w-3" />
            같은 니즈로 새 방 개설하기
          </button>
        </>
      );
    }

    // ── 모임 없음 ──
    return (
      <>
        {/* 관심 현황 */}
        <div className="mb-1.5 text-xs text-white/50">
          {launched ? `🎉 ${count}명이 관심 — 공식 런칭 달성!` : `${count}명이 관심`}
        </div>

        {/* 진행바 */}
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (count / LAUNCH_THRESHOLD) * 100)}%`,
              background: launched
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
            }}
          />
        </div>

        {/* 관심 등록 영역 */}
        {!interested ? (
          <div className="mb-4 rounded-xl border border-white/10 overflow-hidden">
            {/* 입력 영역 */}
            <div style={{ background: 'rgba(255,255,255,0.04)' }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="어떤 모임을 기대하나요? (선택)"
                className="w-full resize-none border-none bg-transparent px-3 pt-3 pb-3 text-xs text-white/80 outline-none placeholder:text-white/25"
                rows={2}
              />
            </div>
            {/* 안내 + 버튼 — 배경색으로 명확히 구분 */}
            <div
              className="flex items-center justify-between px-3 py-2.5"
              style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-[10px] text-white/25">관심 등록 시 바닥장에게 전달됩니다</span>
              <button
                onClick={handleInterest}
                disabled={reactLoading}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50"
                style={{ background: 'rgba(255,217,61,0.18)', color: '#ffd93d', border: '1px solid rgba(255,217,61,0.3)' }}
              >
                ✋ 관심있어요
              </button>
            </div>
          </div>
        ) : (
          <div
            className="mb-4 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold"
            style={{ background: 'rgba(255,217,61,0.1)', border: '1px solid rgba(255,217,61,0.2)', color: '#ffd93d' }}
          >
            ✋ 관심 등록됨 · {count}명
          </div>
        )}

        {/* 방 개설 — 항상 보임 */}
        <button
          type="button"
          onClick={handleLeader}
          className="w-full cursor-pointer rounded-xl py-3 text-sm font-bold tracking-tight transition-all"
          style={{
            background: launched
              ? 'linear-gradient(135deg, rgba(255,217,61,0.2), rgba(34,197,94,0.2))'
              : 'rgba(255,255,255,0.05)',
            border: launched
              ? '1px solid rgba(255,217,61,0.35)'
              : '1px solid rgba(255,255,255,0.1)',
            color: launched ? '#ffd93d' : 'rgba(255,255,255,0.5)',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <Crown className="h-4 w-4" />
            이 관심사로 먼저 방을 개설해 보세요
          </span>
          {launched && (
            <p className="mt-0.5 text-[10px] font-normal opacity-70">
              {count}명이 기다리고 있어요 · 바닥이 공식 지원합니다
            </p>
          )}
          {!launched && (
            <p className="mt-0.5 text-[10px] font-normal opacity-40">
              {LAUNCH_THRESHOLD - count}명 더 모이면 바닥 공식 런칭
            </p>
          )}
        </button>
      </>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] mx-auto flex max-w-[860px] flex-col justify-end overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      {/* 상단 영역 — 니즈 + 관련 니즈 */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
        <div
          className="mb-2 text-xs text-white/40 sm:mb-3 sm:text-sm"
          style={appeared ? undefined : { animation: 'badak-fadeUp 0.4s ease both' }}
        >
          {hasGroups ? `모임 ${allGroups.length}개 개설됨` : '선택한 니즈'}
        </div>
        <div
          className="mb-5 max-w-[90%] rounded-full px-5 py-2.5 text-center text-sm font-bold sm:mb-8 sm:px-8 sm:py-3 sm:text-xl"
          style={{
            background: hasGroups ? 'rgba(255,200,87,0.2)' : 'rgba(255,255,255,0.1)',
            border: hasGroups ? '1px solid rgba(255,200,87,0.4)' : '1px solid rgba(255,255,255,0.2)',
            color: hasGroups ? '#ffd93d' : '#fff',
            ...(appeared ? {} : { animation: 'badak-fadeUp 0.3s ease both' }),
          }}
        >
          {hasGroups && <span className="mr-1.5 text-xs opacity-80 sm:mr-2 sm:text-sm">●</span>}
          {word.text}
          {count > 0 && (
            <span className="ml-1.5 text-xs opacity-50 sm:ml-2 sm:text-sm">{count}명</span>
          )}
        </div>

        {/* 관련 니즈 — 클릭 가능한 버튼 */}
        {related.length > 0 && (
          <>
            <div className="mb-2 text-[10px] text-white/30 sm:text-xs">관련 니즈</div>
            <div className="flex max-w-full flex-wrap justify-center gap-1.5 px-2 sm:gap-2">
              {related.map((w, i) => (
                <button
                  key={w.text}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleSelectRelated(w); }}
                  className="rounded-full px-2.5 py-1 text-[10px] transition-opacity hover:opacity-80 active:opacity-60 sm:px-3 sm:py-1.5 sm:text-xs"
                  style={{
                    background: w.hasGroup ? 'rgba(255,200,87,0.1)' : 'rgba(255,255,255,0.06)',
                    border: w.hasGroup ? '1px solid rgba(255,200,87,0.2)' : '1px solid rgba(255,255,255,0.1)',
                    color: w.hasGroup ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                    ...(appeared ? {} : {
                      animation: 'badak-fadeUp 0.4s ease both',
                      animationDelay: `${0.1 + i * 0.08}s`,
                    }),
                  }}
                >
                  {w.text}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* 바텀 시트 — appeared 이후 애니메이션 없음 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full shrink-0 rounded-t-3xl"
        style={{
          background: '#1a1a2e',
          padding: '16px 16px calc(env(safe-area-inset-bottom, 12px) + 12px)',
          ...(appeared ? {} : { animation: 'badak-fadeUp 0.3s ease' }),
        }}
      >
        {/* 타이틀 */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
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
          <button
            type="button"
            onClick={async () => {
              const shareText = `"${word.text}" — 바닥 니즈`;
              const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/badak` : 'https://badak.biz';
              try {
                if (navigator.share) {
                  await navigator.share({ title: shareText, url: shareUrl });
                } else {
                  await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                }
              } catch { /* 취소 시 무시 */ }
            }}
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/30 transition-colors hover:border-white/25 hover:text-white/60"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {renderBottomContent()}
      </div>
    </div>
  );
}

// ── 바닥장 신청 폼 ──
function LeaderApplyForm({
  word,
  onBack,
  onSuccess,
}: {
  word: CloudWord | null;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [reason, setReason] = useState('');
  const [plan, setPlan] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.trim().length > 1 && experience.trim().length > 10 && reason.trim().length >= 20 && contact.trim().length > 3;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError('로그인이 필요합니다'); setSubmitting(false); return; }
      const res = await fetch('/api/badak/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          name: name.trim(),
          experience: experience.trim(),
          reason: reason.trim(),
          plan: plan.trim() || null,
          contact: contact.trim(),
          needId: word?.needId ?? null,
          needText: word?.text ?? null,
          interests: word?.text ? [word.text] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '신청 중 오류가 발생했어요'); setSubmitting(false); return; }
      onSuccess();
    } catch {
      setError('네트워크 오류가 발생했어요. 다시 시도해 주세요.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div>
          <div className="text-sm font-bold text-white">바닥장 신청</div>
          <div className="text-[10px] text-white/35">
            {word?.text && <span className="text-amber-400/60">&ldquo;{word.text}&rdquo; </span>}
            관련 모임 바닥장 신청
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 이름 */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/50">
            이름 <span className="text-amber-400/70">*필수</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="실명으로 입력해 주세요"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/30"
          />
        </div>

        {/* 경력·이력 소개 */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/50">
            경력·이력 소개 <span className="text-amber-400/70">*필수</span>
          </label>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="현재 직무, 연차, 전문 분야를 간단히 소개해 주세요"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/30"
          />
          <div className="mt-0.5 text-right text-[10px] text-white/20">{experience.length}/300</div>
        </div>

        {/* 신청 이유 */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/50">
            신청 이유 <span className="text-amber-400/70">*필수 (20자 이상)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="이 니즈로 어떤 모임을 만들고 싶은지, 참여자에게 어떤 가치를 줄 수 있는지 알려주세요"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/30"
          />
          <div className={`mt-0.5 text-right text-[10px] ${reason.length >= 20 ? 'text-green-400/50' : 'text-white/20'}`}>{reason.length}/500</div>
        </div>

        {/* 활동 계획 (선택) */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/50">활동 계획 <span className="text-white/25">(선택)</span></label>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            maxLength={300}
            rows={2}
            placeholder="모임 주제, 주기, 진행 방식 등 (선택)"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/30"
          />
        </div>

        {/* 연락처 */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/50">
            연락처 <span className="text-amber-400/70">*필수</span>
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={100}
            placeholder="이메일 또는 전화번호"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/30"
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="mt-4 w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-40"
        style={{
          background: canSubmit ? 'linear-gradient(135deg, #ffd93d, #ffb347)' : 'rgba(255,255,255,0.08)',
          color: canSubmit ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
        }}
      >
        {submitting ? '신청 중...' : '바닥장 신청하기'}
      </button>
      <p className="mt-2 text-center text-[10px] text-white/20">
        검토 후 3일 이내 이메일로 결과를 알려드려요
      </p>
    </div>
  );
}

// ── 모임 카드 ──
function GroupCard({
  group: g,
  onJoin,
  joinLoading,
  onGoGroup,
  message,
  onMessageChange,
}: {
  group: CloudGroup;
  onJoin: () => void;
  joinLoading?: boolean;
  onGoGroup: (id: string) => void;
  message: string;
  onMessageChange: (v: string) => void;
}) {
  const remaining = g.maxMembers - g.currentMembers;
  const isFull = remaining <= 0;
  const isConfirmed = g.status === 'confirmed';
  const [showLeaderProfile, setShowLeaderProfile] = useState(false);

  return (
    <>
      {/* 모임 정보 카드 */}
      <div className="mb-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
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
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">확정</span>
          )}
        </div>

        {/* 개설자 — 클릭 시 공개 프로필 */}
        <button
          type="button"
          onClick={() => setShowLeaderProfile(true)}
          className="mb-2 -mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.06]"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
            {g.leaderName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white/90">{g.leaderName}</span>
              <span
                className="rounded-full px-1.5 py-px text-[9px] font-bold"
                style={{ background: 'rgba(255,217,61,0.12)', color: '#ffd93d', border: '1px solid rgba(255,217,61,0.2)' }}
              >
                바닥장
              </span>
            </div>
            <div className="text-[10px] text-white/40">{g.leaderJob}</div>
          </div>
        </button>

        {/* 일정/장소 */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/50">
          <span>📅 {g.type === 'recurring' ? g.schedule : g.eventDate}</span>
          {g.location && <span>📍 {g.location}</span>}
        </div>
      </div>

      {/* 개설자 공개 프로필 시트 */}
      {showLeaderProfile && (
        <MemberProfileSheet
          memberId={g.leaderId ?? null}
          displayName={g.leaderName}
          job={g.leaderJob}
          isLeader
          onClose={() => setShowLeaderProfile(false)}
        />
      )}

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
              <span className="text-[10px] text-white/20">{g.leaderName}(바닥장)에게 전달됩니다</span>
              <button
                onClick={onJoin}
                disabled={joinLoading}
                className="cursor-pointer rounded-lg border-none px-4 py-1.5 text-xs font-bold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)', color: '#1a1a2e' }}
              >
                {joinLoading ? '신청 중…' : '참여 신청'}
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
