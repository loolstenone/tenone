'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, ImagePlus, X,
  Calendar, Clock, MapPin, Users, ShieldCheck,
  Zap, RefreshCw, Repeat, Target, Crown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';
import { createClient } from '@/lib/supabase/client';

interface NeedOption {
  id: string;
  text: string;
  members: number;
  hasGroup: boolean;
}

const STEPS = ['기본 정보', '일정/장소', '바닥장 소개'];

const QUICK_DATES = (() => {
  const dates: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const label = `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]})`;
    const value = d.toISOString().split('T')[0];
    if (d.getDay() === 0 || d.getDay() === 6) {
      dates.push({ label, value });
    }
  }
  for (let i = 1; i <= 7 && dates.length < 6; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const value = d.toISOString().split('T')[0];
    if (d.getDay() >= 1 && d.getDay() <= 5 && !dates.find((dd) => dd.value === value)) {
      dates.push({ label: `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]})`, value });
    }
  }
  return dates.sort((a, b) => a.value.localeCompare(b.value)).slice(0, 6);
})();

const QUICK_TIMES = ['10:00', '14:00', '15:00', '19:00', '19:30', '20:00'];
const QUICK_LOCATIONS = ['성수동', '강남역', '홍대', '합정', '을지로', '여의도', '온라인 (Zoom)'];

type MeetingType = 'onetime' | 'series' | 'regular' | 'irregular';
type JoinType = 'approval' | 'firstcome';

export default function CreateGroupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0e1a]" />}>
      <CreateGroupPageInner />
    </Suspense>
  );
}

function CreateGroupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wantIdParam = searchParams?.get('want_id') ?? null;
  const needIdParam = searchParams?.get('need') ?? null;
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [needs, setNeeds] = useState<NeedOption[]>([]);

  // 바닥장 여부 — badak_members.role 실제 DB 조회
  const [isBadakjang, setIsBadakjang] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const sb = createClient();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/badak/member', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const { member } = await res.json();
        if (member?.role === 'badakjang' || member?.role === 'admin') {
          setIsBadakjang(true);
        }
      } catch { /* ignore */ }
    })();
  }, [isAuthenticated]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [needId, setNeedId] = useState('');

  // URL param으로 넘어온 need_id로 프리필
  useEffect(() => {
    if (needIdParam) setNeedId(needIdParam);
  }, [needIdParam]);
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [needSearch, setNeedSearch] = useState('');
  const [needDropdownOpen, setNeedDropdownOpen] = useState(false);
  const needDropdownRef = useRef<HTMLDivElement>(null);
  const [groupCategory, setGroupCategory] = useState('networking');
  const [meetingType, setMeetingType] = useState<MeetingType>('onetime');
  const [joinType, setJoinType] = useState<JoinType>('approval');

  // 일정
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [seriesCount, setSeriesCount] = useState(4); // 2~8회
  const [seriesDates, setSeriesDates] = useState<{ date: string; time: string }[]>([]);
  const [recurringSchedule, setRecurringSchedule] = useState('');

  // 연속 모임 회차 동기화
  useEffect(() => {
    if (meetingType === 'series') {
      setSeriesDates((prev) => {
        const next = Array.from({ length: seriesCount }, (_, i) => prev[i] || { date: '', time: '' });
        return next;
      });
    }
  }, [seriesCount, meetingType]);
  const [location, setLocation] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [fee, setFee] = useState(0);
  const [maxMembers, setMaxMembers] = useState(20);

  // 바닥장 소개
  const [leaderReason, setLeaderReason] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/badak/cloud')
      .then((r) => r.json())
      .then((data) => {
        if (data.needs) {
          setNeeds(
            data.needs
              .filter((n: { hasGroup: boolean }) => !n.hasGroup)  // 이미 모임 있는 니즈 제외
              .map((n: { text: string; members: number; hasGroup: boolean }, i: number) => ({
                id: `need-${i}`,
                text: n.text,
                members: n.members,
                hasGroup: false,
              }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // 니즈 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (needDropdownRef.current && !needDropdownRef.current.contains(e.target as Node)) {
        setNeedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 제목 기반 유사도 + 검색어 필터 (15명+ 우선)
  const getScoredNeeds = () => {
    const titleWords = title.toLowerCase().split(/\s+/).filter(Boolean);
    const searchQuery = needSearch.toLowerCase().trim();

    return needs
      .map((n) => {
        const text = n.text.toLowerCase();
        // 제목 단어 매칭 점수
        let score = 0;
        for (const w of titleWords) {
          if (w.length >= 2 && text.includes(w)) score += 2;
        }
        // 15명 이상 달성 보너스 (바닥장 기다리는 니즈 우선)
        if (n.members >= 15) score += 5;
        // 관심 인원 보너스
        score += n.members * 0.05;
        return { ...n, score };
      })
      .filter((n) => {
        if (!searchQuery) return true;
        return n.text.toLowerCase().includes(searchQuery);
      })
      .sort((a, b) => b.score - a.score);
  };

  const scoredNeeds = getScoredNeeds();
  const selectedNeed = needs.find((n) => n.id === needId);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/^#/, '');
    if (!trimmed || tagList.includes(trimmed) || tagList.length >= 5) return;
    setTagList([...tagList, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTagList(tagList.filter((t) => t !== tag));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('이미지는 5MB 이하만 업로드할 수 있습니다'); return; }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (token: string): Promise<string | null> => {
    if (!coverFile) return null;
    const formData = new FormData();
    formData.append('file', coverFile);
    const res = await fetch('/api/badak/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url;
  };

  const needsFixedDate = meetingType === 'onetime' || meetingType === 'series';
  const needsScheduleText = meetingType === 'regular' || meetingType === 'irregular';

  const canNext = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) {
      const hasLocation = location.trim().length > 0;
      if (meetingType === 'onetime') return eventDate.length > 0 && hasLocation;
      if (meetingType === 'series') return seriesDates[0]?.date?.length > 0 && hasLocation;
      return recurringSchedule.trim().length > 0 && hasLocation;
    }
    if (step === 2) return leaderReason.trim().length >= 10;
    return false;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { setShowLogin(true); return; }
    setSubmitting(true);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSubmitting(false); return; }

    // 1회 단발: eventDate+eventTime / 연속: seriesDates 첫 회차
    const firstDate = meetingType === 'series' ? seriesDates[0]?.date : eventDate;
    const firstTime = meetingType === 'series' ? seriesDates[0]?.time : eventTime;
    const eventDateTime = firstDate && firstTime
      ? `${firstDate}T${firstTime}:00`
      : firstDate ? `${firstDate}T00:00:00` : null;

    const coverImageUrl = await uploadImage(session.access_token);

    const res = await fetch('/api/badak/groups', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        needId: needId || null,
        tags: tagList,
        groupType: groupCategory,
        meetingType,
        joinType,
        eventDate: eventDateTime,
        seriesCount: meetingType === 'series' ? seriesCount : null,
        seriesDates: meetingType === 'series' ? seriesDates.filter((d) => d.date) : null,
        recurringSchedule: needsScheduleText ? recurringSchedule : null,
        location,
        locationDetail,
        fee,
        maxMembers,
        leaderReason,
        coverImageUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const newGroupId: string | undefined = data.group?.id;

      // Want 프리필로 생성된 모임이면 badak_wants.group_id 업데이트
      if (wantIdParam && newGroupId) {
        await fetch('/api/badak/wants', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ id: wantIdParam, groupId: newGroupId, status: 'activated' }),
        }).catch(() => { /* 비결정적 연결 실패는 모임 생성 성공에 영향 안 줌 */ });
      }

      router.push(`/badak/groups/${newGroupId || ''}`);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || '모임 생성에 실패했습니다');
    }
    setSubmitting(false);
  };

  // ── 로그인 필요 화면 ──
  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a2e] px-6">
      <ShieldCheck className="mb-4 h-10 w-10 text-white/30" />
      <p className="mb-1 text-base font-bold text-white">로그인이 필요합니다</p>
      <p className="mb-6 text-sm text-white/40">바닥장이 되어 모임을 열려면 먼저 로그인하세요</p>
      <button
        onClick={() => setShowLogin(true)}
        className="rounded-xl border-none px-6 py-2.5 text-sm font-semibold"
        style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
      >
        로그인
      </button>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );

  // ── 선택 칩 ──
  const Chip = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="rounded-lg border px-3 py-2 text-xs font-medium transition-all"
      style={{
        borderColor: selected ? '#ffd93d' : 'rgba(255,255,255,0.1)',
        background: selected ? 'rgba(255,217,61,0.1)' : 'rgba(255,255,255,0.03)',
        color: selected ? '#ffd93d' : 'rgba(255,255,255,0.5)',
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="mx-auto min-h-screen max-w-[860px] bg-[#1a1a2e] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-7 pb-5">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="text-white/60 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">모임 만들기</h1>
        <div className="flex-1" />
        <span className="text-sm text-white/40">{step + 1} / {STEPS.length}</span>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex gap-1.5 px-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ background: i <= step ? 'linear-gradient(90deg, #ffd93d, #ff6b6b)' : 'rgba(255,255,255,0.1)' }}
            />
            <div className={`mt-2 text-xs ${i <= step ? 'text-white/65' : 'text-white/25'}`}>{s}</div>
          </div>
        ))}
      </div>

      {/* 바닥장 여부 안내 */}
      {!isBadakjang && (
        <div className="mx-6 mb-6 rounded-xl border p-5"
          style={{ background: 'rgba(255,217,61,0.04)', borderColor: 'rgba(255,217,61,0.15)' }}>
          <div className="flex items-start gap-3">
            <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/60" />
            <div>
              <p className="text-sm font-semibold text-white/70">
                지금은 <span className="text-amber-400">1회 단발 모임</span>만 개설할 수 있어요
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/45">
                바닥장이 되면 연속·정기·비정기 모임도 자유롭게 개설할 수 있습니다.
              </p>
              <Link href="/badak/apply"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400/80 hover:text-amber-400">
                바닥장 신청하기 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="px-6 pb-32">
        {/* ── Step 1: 기본 정보 ── */}
        {step === 0 && (
          <div className="space-y-7">
            {/* 커버 이미지 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/55">커버 이미지 (선택)</label>
              {coverImage ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img src={coverImage} alt="커버" className="h-40 w-full object-cover" />
                  <button onClick={() => { setCoverImage(null); setCoverFile(null); }}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-8 text-sm text-white/30 hover:border-white/25 hover:text-white/50"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <ImagePlus className="h-5 w-5" /> 이미지 추가
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>

            {/* 모임 제목 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/55">모임 제목 *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="예: AI 실무 프롬프트 스터디"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/40" />
            </div>

            {/* 모임 소개 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/55">모임 소개</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder={'이 모임에서 무엇을 하나요?\n어떤 사람에게 좋나요?'}
                rows={4}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 text-[15px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/40" />
            </div>

            {/* 운영방식 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-white/55">운영방식</label>
              <div className="flex flex-wrap gap-2">
                {([
                  { id: 'networking', label: '네트워킹' },
                  { id: 'study', label: '스터디' },
                  { id: 'sideproject', label: '사이드 프로젝트' },
                  { id: 'lecture', label: '강의' },
                  { id: 'discussion', label: '토론' },
                  { id: 'mentoring', label: '멘토링/코칭' },
                  { id: 'workshop', label: '워크숍/세미나' },
                ]).map(({ id, label }) => (
                  <button key={id} onClick={() => setGroupCategory(id)}
                    className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      background: groupCategory === id ? 'rgba(255,217,61,0.12)' : 'rgba(255,255,255,0.05)',
                      color: groupCategory === id ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${groupCategory === id ? 'rgba(255,217,61,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 모임 유형 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-white/55">모임 유형</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'onetime' as const, icon: Zap, label: '1회 단발' },
                  { id: 'series' as const, icon: Repeat, label: '연속 모임' },
                  { id: 'regular' as const, icon: RefreshCw, label: '정기 모임' },
                  { id: 'irregular' as const, icon: Calendar, label: '비정기 모임' },
                ] as const).map(({ id, icon: Icon, label }) => {
                  const disabled = !isBadakjang && id !== 'onetime';
                  return (
                    <button key={id}
                      onClick={() => !disabled && setMeetingType(id)}
                      disabled={disabled}
                      className="relative flex items-center justify-center gap-2.5 rounded-xl border px-4 py-4 text-sm font-semibold transition-all"
                      style={{
                        borderColor: meetingType === id ? '#ffd93d' : 'rgba(255,255,255,0.1)',
                        background: meetingType === id ? 'rgba(255,217,61,0.1)' : 'transparent',
                        color: disabled ? 'rgba(255,255,255,0.2)' : meetingType === id ? '#ffd93d' : 'rgba(255,255,255,0.55)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                      }}>
                      <Icon className="h-4 w-4" /> {label}
                      {disabled && (
                        <span className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: 'rgba(255,217,61,0.2)', color: '#ffd93d' }}>
                          바닥장
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-white/35">
                {meetingType === 'onetime' && '한 번만 모이는 단발 모임'}
                {meetingType === 'series' && `총 ${seriesCount}회 연속으로 진행하는 모임`}
                {meetingType === 'regular' && '매주/격주 등 고정 주기로 반복되는 모임'}
                {meetingType === 'irregular' && '필요할 때 바닥장이 일정을 잡는 모임'}
              </p>

              {/* 비-바닥장에게 바닥장 권한 신청 CTA — 잠긴 유형 옆에 바로 노출 */}
              {!isBadakjang && (
                <Link
                  href="/badak/apply"
                  className="mt-3 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-amber-400/10"
                  style={{
                    background: 'rgba(255,217,61,0.05)',
                    borderColor: 'rgba(255,217,61,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Crown className="h-4 w-4 text-amber-400/80" />
                    <div>
                      <div className="text-sm font-semibold text-amber-400">
                        연속·정기·비정기 모임도 열고 싶다면
                      </div>
                      <div className="mt-0.5 text-xs text-white/45">
                        바닥장 권한 신청하고 모든 모임 유형을 잠금 해제하세요
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-400">
                    신청 <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              )}
              {meetingType === 'series' && (
                <div className="mt-3">
                  <label className="mb-1.5 block text-[11px] text-white/40">총 회차 (2~8회)</label>
                  <div className="flex gap-1.5">
                    {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <button key={n} onClick={() => setSeriesCount(n)}
                        className="flex-1 rounded-lg border py-2 text-xs font-semibold transition-all"
                        style={{
                          borderColor: seriesCount === n ? '#ffd93d' : 'rgba(255,255,255,0.1)',
                          background: seriesCount === n ? 'rgba(255,217,61,0.1)' : 'transparent',
                          color: seriesCount === n ? '#ffd93d' : 'rgba(255,255,255,0.4)',
                        }}>
                        {n}회
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 참여 방식 */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white/40">참여 방식</label>
              <div className="flex gap-2">
                <button onClick={() => setJoinType('approval')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition-all"
                  style={{
                    borderColor: joinType === 'approval' ? '#ffd93d' : 'rgba(255,255,255,0.1)',
                    background: joinType === 'approval' ? 'rgba(255,217,61,0.1)' : 'transparent',
                    color: joinType === 'approval' ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                  }}>
                  <ShieldCheck className="h-3.5 w-3.5" /> 승인제
                </button>
                <button onClick={() => setJoinType('firstcome')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition-all"
                  style={{
                    borderColor: joinType === 'firstcome' ? '#ffd93d' : 'rgba(255,255,255,0.1)',
                    background: joinType === 'firstcome' ? 'rgba(255,217,61,0.1)' : 'transparent',
                    color: joinType === 'firstcome' ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                  }}>
                  <Zap className="h-3.5 w-3.5" /> 선착순
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-white/25">
                {joinType === 'approval' ? '바닥장이 신청자를 확인 후 승인합니다' : '인원 내 자동 참여됩니다'}
              </p>
            </div>

            {/* 연결 니즈 */}
            <div ref={needDropdownRef} className="relative">
              <label className="mb-2 block text-sm font-medium text-white/55">
                연결 니즈 (선택)
                {title.trim().length >= 2 && (
                  <span className="ml-2 text-[10px] text-amber-400/60">제목 기반 추천순</span>
                )}
              </label>

              {/* 선택된 니즈 또는 트리거 버튼 */}
              <button type="button"
                onClick={() => setNeedDropdownOpen(!needDropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all"
                style={{
                  borderColor: needDropdownOpen ? 'rgba(255,217,61,0.4)' : selectedNeed ? 'rgba(255,217,61,0.2)' : 'rgba(255,255,255,0.12)',
                  background: selectedNeed ? 'rgba(255,217,61,0.06)' : 'rgba(255,255,255,0.04)',
                }}>
                {selectedNeed ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{
                        background: selectedNeed.members >= 15 ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.1)',
                        color: selectedNeed.members >= 15 ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                      }}>
                      {selectedNeed.members}명
                    </span>
                    <span className="truncate text-white/80">{selectedNeed.text}</span>
                  </div>
                ) : (
                  <span className="text-white/30">제한 없음, 모두에게</span>
                )}
                <svg className={`ml-2 h-4 w-4 shrink-0 text-white/30 transition-transform ${needDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* 드롭다운 패널 */}
              {needDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/15 shadow-2xl"
                  style={{ background: '#1e1e38' }}>
                  {/* 검색 */}
                  <div className="border-b border-white/8 p-2">
                    <input
                      value={needSearch}
                      onChange={(e) => setNeedSearch(e.target.value)}
                      placeholder="니즈 검색..."
                      autoFocus
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 focus:border-amber-400/30"
                    />
                  </div>

                  {/* "제한 없음" 옵션 */}
                  <button type="button"
                    onClick={() => { setNeedId(''); setNeedDropdownOpen(false); setNeedSearch(''); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors hover:bg-white/5"
                    style={{ color: !needId ? '#ffd93d' : 'rgba(255,255,255,0.4)' }}>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>∞</span>
                    제한 없음, 모두에게
                    {!needId && <Check className="ml-auto h-3.5 w-3.5 text-amber-400" />}
                  </button>

                  {/* 니즈 목록 */}
                  <div className="max-h-[240px] overflow-y-auto border-t border-white/6">
                    {scoredNeeds.length === 0 ? (
                      <div className="py-6 text-center text-xs text-white/25">검색 결과 없음</div>
                    ) : (
                      scoredNeeds.map((n) => {
                        const isSelected = needId === n.id;
                        const isRecommended = n.score > 1 && title.trim().length >= 2;
                        return (
                          <button type="button" key={n.id}
                            onClick={() => { setNeedId(n.id); setNeedDropdownOpen(false); setNeedSearch(''); }}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                            style={{ background: isSelected ? 'rgba(255,217,61,0.08)' : undefined }}>
                            {/* 관심 인원 원형 */}
                            <div className="flex h-7 w-7 shrink-0 flex-col items-center justify-center rounded-full"
                              style={{
                                background: n.members >= 15 ? 'rgba(255,217,61,0.12)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${n.members >= 15 ? 'rgba(255,217,61,0.25)' : 'rgba(255,255,255,0.1)'}`,
                              }}>
                              <span className="text-[10px] font-bold" style={{ color: n.members >= 15 ? '#ffd93d' : 'rgba(255,255,255,0.5)' }}>
                                {n.members}
                              </span>
                            </div>

                            {/* 텍스트 */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                {isRecommended && (
                                  <span className="shrink-0 rounded px-1 py-0.5 text-[8px] font-bold"
                                    style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>추천</span>
                                )}
                                <span className="truncate text-xs text-white/70">{n.text}</span>
                              </div>
                              <div className="mt-0.5 text-[10px] text-white/25">
                                {n.members >= 15 ? '🔥 바닥장을 기다리고 있어요' : `${n.members}명 관심 · ${15 - n.members}명 더 필요`}
                              </div>
                            </div>

                            {isSelected && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-amber-400" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 태그 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/55">태그 (최대 5개)</label>
              {tagList.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {tagList.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                      style={{ background: 'rgba(255,217,61,0.1)', color: '#ffd93d' }}>
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-0.5 opacity-50 hover:opacity-100"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <input value={tagInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(',')) {
                    val.split(',').forEach((t) => addTag(t));
                    setTagInput('');
                  } else {
                    setTagInput(val);
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); addTag(tagInput); } }}
                placeholder=",로 구분 (최대 5개)"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            </div>
          </div>
        )}

        {/* ── Step 2: 일정/장소 ── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* ─ 1회 단발 ─ */}
            {meetingType === 'onetime' && (
              <>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/40">
                    <Calendar className="h-3.5 w-3.5" /> 날짜 *
                  </label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {QUICK_DATES.map((d) => <Chip key={d.value} selected={eventDate === d.value} onClick={() => setEventDate(d.value)}>{d.label}</Chip>)}
                  </div>
                  <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/40">
                    <Clock className="h-3.5 w-3.5" /> 시간
                  </label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {QUICK_TIMES.map((t) => <Chip key={t} selected={eventTime === t} onClick={() => setEventTime(t)}>{t}</Chip>)}
                  </div>
                  <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white outline-none" />
                </div>
              </>
            )}

            {/* ─ 2~8회 연속 모임: 회차별 스케줄링 ─ */}
            {meetingType === 'series' && (
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/40">
                  <Repeat className="h-3.5 w-3.5" /> 회차별 일정 ({seriesCount}회) *
                </label>
                <div className="space-y-2">
                  {seriesDates.map((sd, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-white/10 p-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ background: sd.date ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.08)', color: sd.date ? '#ffd93d' : 'rgba(255,255,255,0.3)' }}>
                        {i + 1}
                      </span>
                      <input type="date" value={sd.date}
                        onChange={(e) => { const next = [...seriesDates]; next[i] = { ...next[i], date: e.target.value }; setSeriesDates(next); }}
                        className="flex-1 rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#ffd93d]/40" />
                      <input type="time" value={sd.time}
                        onChange={(e) => { const next = [...seriesDates]; next[i] = { ...next[i], time: e.target.value }; setSeriesDates(next); }}
                        className="w-24 rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#ffd93d]/40" />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-white/25">첫 회차 날짜는 필수입니다. 나머지는 나중에 수정할 수 있어요.</p>
              </div>
            )}

            {/* ─ 정기 모임 ─ */}
            {meetingType === 'regular' && (
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/40">
                  <RefreshCw className="h-3.5 w-3.5" /> 정기 일정 *
                </label>
                <input value={recurringSchedule} onChange={(e) => setRecurringSchedule(e.target.value)}
                  placeholder="예: 매주 토요일 14:00 / 격주 수요일 19:30"
                  className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/40" />
                <p className="mt-1.5 text-[10px] text-white/25">반복 주기를 자유 형식으로 입력해주세요</p>
              </div>
            )}

            {/* ─ 비정기 모임 ─ */}
            {meetingType === 'irregular' && (
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/40">
                  <Calendar className="h-3.5 w-3.5" /> 일정 안내 *
                </label>
                <input value={recurringSchedule} onChange={(e) => setRecurringSchedule(e.target.value)}
                  placeholder="예: 월 1~2회, 바닥장이 일정 공지"
                  className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/40" />
                <p className="mt-1.5 text-[10px] text-white/25">대략적인 빈도를 알려주세요. 구체적 일정은 모임 내에서 공지합니다.</p>
              </div>
            )}

            {/* 장소 */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/40">
                <MapPin className="h-3.5 w-3.5" /> 장소 *
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                {QUICK_LOCATIONS.map((loc) => <Chip key={loc} selected={location === loc} onClick={() => setLocation(loc)}>{loc}</Chip>)}
              </div>
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="직접 입력"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            </div>

            {/* 상세 주소 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/55">상세 주소 (선택)</label>
              <input value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="카페명, 건물명, 층수 등"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            </div>

            {/* 참여비 / 인원 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/55">참여비</label>
                <div className="relative">
                  <input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 pr-8 text-sm text-white outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">원</span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/55">
                  <Users className="mr-1 inline h-3 w-3" />최대 인원
                </label>
                <div className="relative">
                  <input type="number" value={maxMembers} onChange={(e) => setMaxMembers(Number(e.target.value))} min={2} max={100}
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 pr-8 text-sm text-white outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">명</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: 바닥장 소개 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/55">이 모임을 여는 이유 * (10자 이상)</label>
              <textarea value={leaderReason} onChange={(e) => setLeaderReason(e.target.value)}
                placeholder="왜 이 모임을 열고 싶은지, 참여자에게 어떤 도움이 되는지 적어주세요"
                rows={5}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 text-[15px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/40" />
              <div className="mt-1 text-right text-[10px] text-white/20">{leaderReason.length}자</div>
            </div>

            {/* 미리보기 카드 */}
            <div className="overflow-hidden rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {coverImage && <img src={coverImage} alt="커버" className="h-32 w-full object-cover" />}
              <div className="p-5">
                <div className="mb-1 text-[10px] font-medium uppercase text-white/30">미리보기</div>

                {/* 뱃지 */}
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: (meetingType === 'regular' || meetingType === 'irregular') ? 'rgba(99,102,241,0.2)' : 'rgba(59,130,246,0.2)',
                      color: (meetingType === 'regular' || meetingType === 'irregular') ? '#a5b4fc' : '#93c5fd',
                    }}>
                    {{ onetime: '1회 단발', series: `${seriesCount}회 연속`, regular: '정기', irregular: '비정기' }[meetingType]}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: joinType === 'approval' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)',
                      color: joinType === 'approval' ? '#fbbf24' : '#4ade80',
                    }}>
                    {joinType === 'approval' ? '승인제' : '선착순'}
                  </span>
                </div>

                <div className="mb-2 text-base font-bold text-white">{title || '모임 제목'}</div>
                {description && (
                  <div className="mb-3 whitespace-pre-line text-xs leading-relaxed text-white/50">
                    {description.slice(0, 100)}{description.length > 100 ? '...' : ''}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-white/40">
                  {meetingType === 'onetime' && eventDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(eventDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })} {eventTime}
                    </span>
                  )}
                  {meetingType === 'series' && seriesDates[0]?.date && (
                    <span className="flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      {new Date(seriesDates[0].date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 시작 · {seriesCount}회
                    </span>
                  )}
                  {meetingType === 'regular' && recurringSchedule && (
                    <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> {recurringSchedule}</span>
                  )}
                  {meetingType === 'irregular' && recurringSchedule && (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {recurringSchedule}</span>
                  )}
                  {location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</span>}
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 1/{maxMembers}</span>
                  <span>{fee > 0 ? `${fee.toLocaleString()}원` : '무료'}</span>
                </div>

                {selectedNeed && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-400/60">
                    <Target className="h-3 w-3" />
                    <span>연결 니즈: {selectedNeed.text}</span>
                  </div>
                )}

                {tagList.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tagList.map((t) => (
                      <span key={t} className="rounded-full px-2 py-0.5 text-[10px] text-white/40" style={{ background: 'rgba(255,255,255,0.05)' }}>#{t}</span>
                    ))}
                  </div>
                )}

                {leaderReason && (
                  <div className="mt-4 border-t border-white/8 pt-3">
                    <div className="mb-1 text-[10px] text-white/25">바닥장의 한마디</div>
                    <div className="text-xs italic text-white/50">
                      &ldquo;{leaderReason.slice(0, 80)}{leaderReason.length > 80 ? '...' : ''}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-[860px] -translate-x-1/2 border-t border-white/8 px-5 py-4"
        style={{ background: '#1a1a2e' }}
      >
        {step < 2 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext()}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-30"
            style={{
              background: canNext() ? 'linear-gradient(135deg, #ffd93d, #ff6b6b)' : 'rgba(255,255,255,0.08)',
              color: canNext() ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
            }}>
            다음 <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!canNext() || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)', color: '#1a1a2e' }}>
            {submitting ? '생성 중...' : '모임 개설하기'} <Check className="h-4 w-4" />
          </button>
        )}
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
