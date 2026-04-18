'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, ArrowRight, Check, ImagePlus, X,
  Calendar, Clock, MapPin, Users, ShieldCheck,
  Zap, Repeat, Target, Crown, Eye, ChevronLeft, ChevronRight,
  Link as LinkIcon, Move,
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

const STEPS = ['기본 정보', '일정/장소', '콘텐츠 구성', '바닥장 소개'];
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const QUICK_DATES = (() => {
  const dates: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const label = `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
    const value = d.toISOString().split('T')[0];
    if (d.getDay() === 0 || d.getDay() === 6) {
      dates.push({ label, value });
    }
  }
  for (let i = 1; i <= 7 && dates.length < 6; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split('T')[0];
    if (d.getDay() >= 1 && d.getDay() <= 5 && !dates.find((dd) => dd.value === value)) {
      dates.push({ label: `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`, value });
    }
  }
  return dates.sort((a, b) => a.value.localeCompare(b.value)).slice(0, 6);
})();

const QUICK_TIMES = [
  { label: '오전 10시', value: '10:00' },
  { label: '오후 2시', value: '14:00' },
  { label: '오후 3시', value: '15:00' },
  { label: '오후 7시', value: '19:00' },
  { label: '오후 7시반', value: '19:30' },
  { label: '오후 8시', value: '20:00' },
];

const QUICK_LOCATIONS = ['성수동', '강남역', '홍대', '합정', '을지로', '여의도', '온라인 (Zoom)'];

const FEE_PRESETS = [
  { label: '3만원', value: 30000 },
  { label: '4만원', value: 40000 },
  { label: '5만원', value: 50000 },
  { label: '6만원', value: 60000 },
  { label: '7만원', value: 70000 },
];

type MeetingType = 'onetime' | 'series';
type JoinType = 'approval' | 'firstcome';
type FeeType = 'free' | 'paid';
type FeeUnit = 'total' | 'per_session';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const qt = QUICK_TIMES.find((t) => t.value === timeStr);
  if (qt) return qt.label;
  const [h, m] = timeStr.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? '오후' : '오전';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour}시${m !== '00' ? ` ${m}분` : ''}`;
}

function MiniCalendar({ selectedDates, onToggle, maxSelections }: {
  selectedDates: string[];
  onToggle: (date: string) => void;
  maxSelections: number;
}) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const toStr = (d: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const cells: (number | null)[] = Array.from({ length: firstDow }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-xl border border-white/10 p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 text-white/40 hover:text-white">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-white/70">{viewYear}년 {viewMonth + 1}월</span>
        <button onClick={nextMonth} className="p-1 text-white/40 hover:text-white">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d, i) => (
          <div key={d} className={`text-center text-[10px] font-medium py-1 ${
            i === 0 ? 'text-red-400/60' : i === 6 ? 'text-blue-400/60' : 'text-white/30'
          }`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const str = toStr(d);
          const isPast = str < todayStr;
          const isSelected = selectedDates.includes(str);
          const isFull = selectedDates.length >= maxSelections && !isSelected;
          const isToday = str === todayStr;
          const dow = (firstDow + d - 1) % 7;
          return (
            <button key={i} type="button"
              onClick={() => !isPast && !isFull && onToggle(str)}
              disabled={isPast || isFull}
              className="flex items-center justify-center rounded-lg text-[12px] font-medium py-1.5 transition-all"
              style={{
                background: isSelected ? 'rgba(255,217,61,0.2)' : isToday ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: isPast ? 'rgba(255,255,255,0.15)' : isSelected ? '#ffd93d' : isFull ? 'rgba(255,255,255,0.2)' : dow === 0 ? 'rgba(255,150,150,0.8)' : dow === 6 ? 'rgba(150,180,255,0.8)' : 'rgba(255,255,255,0.7)',
                cursor: isPast || isFull ? 'not-allowed' : 'pointer',
                border: isSelected ? '1px solid rgba(255,217,61,0.4)' : 'none',
              }}>
              {d}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-center text-[10px] text-white/25">
        {selectedDates.length}/{maxSelections}회 선택됨
      </div>
    </div>
  );
}

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
  const devStep = process.env.NODE_ENV === 'development' ? Number(searchParams?.get('dev') ?? -1) : -1;
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [needs, setNeeds] = useState<NeedOption[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // 바닥장 여부
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
        if (member?.role === 'badakjang' || member?.role === 'admin') setIsBadakjang(true);
      } catch { /* ignore */ }
    })();
  }, [isAuthenticated]);

  // 바닥장 프로필 (step 3에서 로드)
  const [leaderProfile, setLeaderProfile] = useState<{
    displayName: string;
    avatarUrl: string | null;
    industry: string | null;
    jobFunction: string | null;
    bio: string | null;
    career: string | null;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const sb = createClient();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/badak/member', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const { member } = await res.json();
        if (member) {
          setLeaderProfile({
            displayName: member.display_name,
            avatarUrl: member.avatar_url ?? null,
            industry: member.industry ?? null,
            jobFunction: member.job_function ?? null,
            bio: member.bio ?? null,
            career: member.career ?? null,
          });
        }
      } catch { /* ignore */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [needId, setNeedId] = useState('');

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
  const [seriesCount, setSeriesCount] = useState(4);
  const [seriesDates, setSeriesDates] = useState<{ date: string; time: string; location: string }[]>([]);

  // 연속 회차 줄이기 (회차 수 감소 시 트림)
  useEffect(() => {
    if (meetingType === 'series') {
      setSeriesDates((prev) => prev.slice(0, seriesCount));
    }
  }, [seriesCount, meetingType]);

  // 장소
  const [location, setLocation] = useState('');
  const [locationDetail, setLocationDetail] = useState('');

  // 비용
  const [feeType, setFeeType] = useState<FeeType>('free');
  const [fee, setFee] = useState(0);
  const [feeUnit, setFeeUnit] = useState<FeeUnit>('total');
  const [rentalCost, setRentalCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);
  const [maxMembers, setMaxMembers] = useState(20);

  // 콘텐츠 구성
  const [introWho, setIntroWho] = useState('');
  const [sessions, setSessions] = useState<{ title: string; description: string }[]>([
    { title: '', description: '' },
  ]);
  const [guide, setGuide] = useState('');
  const [notice, setNotice] = useState('');

  // 콘텐츠 구성 회차 ↔ 모임유형 연동
  useEffect(() => {
    if (meetingType === 'onetime') {
      setSessions((prev) => (prev.length === 1 ? prev : [prev[0] || { title: '', description: '' }]));
    } else if (meetingType === 'series') {
      setSessions((prev) =>
        Array.from({ length: seriesCount }, (_, i) => prev[i] || { title: '', description: '' })
      );
    }
  }, [meetingType, seriesCount]);

  // 바닥장 소개
  const [leaderReason, setLeaderReason] = useState('');
  const [leaderCareer, setLeaderCareer] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(false);

  const importCareerFromProfile = () => {
    if (leaderProfile?.career) setLeaderCareer(leaderProfile.career);
  };
  const importBioFromProfile = () => {
    if (leaderProfile?.bio) setLeaderReason(leaderProfile.bio);
  };

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPosition, setCoverPosition] = useState({ x: 50, y: 50 });
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [showCoverDropdown, setShowCoverDropdown] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverDragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  // dev 모드
  useEffect(() => {
    if (devStep < 0) return;
    setTitle('AI 실무 프롬프트 스터디');
    setDescription('함께 AI 프롬프트를 연구하고 실무에 적용하는 스터디입니다.\n매주 실제 업무 사례를 가져와 함께 분석하고 개선합니다.');
    setGroupCategory('study');
    setMeetingType(devStep >= 1 ? 'series' : 'onetime');
    if (devStep >= 1) setSeriesCount(4);
    setJoinType('approval');
    setEventDate(QUICK_DATES[0]?.value ?? '');
    setEventTime('19:00');
    setLocation('성수동');
    setLocationDetail('카페 어딘가 (참여 확정 후 공유)');
    setMaxMembers(20);
    setFeeType('free');
    setFee(0);
    setIntroWho('AI 도구를 실무에 적용하고 싶은 직장인');
    setSessions([{ title: '프롬프트 기초', description: '효과적인 프롬프트 작성법 소개' }]);
    setGuide('노트북 지참 권장입니다.');
    setLeaderReason('AI 프롬프트 엔지니어링 2년 경력으로 실무 노하우를 나누고 싶습니다.');
    setIsBadakjang(true);
    setStep(Math.min(devStep, STEPS.length - 1));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devStep]);

  useEffect(() => {
    fetch('/api/badak/cloud')
      .then((r) => r.json())
      .then((data) => {
        if (data.needs) {
          setNeeds(
            data.needs
              .filter((n: { hasGroup: boolean }) => !n.hasGroup)
              .map((n: { id: string; text: string; count?: number; members?: number; hasGroup: boolean }, i: number) => ({
                id: n.id ?? `need-${i}`,
                text: n.text,
                members: n.count ?? n.members ?? 0,
                hasGroup: false,
              }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // step 1 진입 시 기본 시간 자동 입력
  useEffect(() => {
    if (step === 1 && !eventTime) setEventTime('19:00');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (needDropdownRef.current && !needDropdownRef.current.contains(e.target as Node)) {
        setNeedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getScoredNeeds = () => {
    const titleWords = title.toLowerCase().split(/\s+/).filter(Boolean);
    const searchQuery = needSearch.toLowerCase().trim();
    return needs
      .map((n) => {
        const text = n.text.toLowerCase();
        let score = 0;
        for (const w of titleWords) {
          if (w.length >= 2 && text.includes(w)) score += 2;
        }
        if (n.members >= 15) score += 5;
        score += n.members * 0.05;
        return { ...n, score };
      })
      .filter((n) => (!searchQuery ? true : n.text.toLowerCase().includes(searchQuery)))
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

  const canNext = () => {
    if (step === 0) return title.trim().length > 0 && tagList.length > 0;
    if (step === 1) {
      const hasLocation = location.trim().length > 0;
      if (meetingType === 'onetime') return eventDate.length > 0 && hasLocation;
      if (meetingType === 'series') return seriesDates[0]?.date?.length > 0 && hasLocation;
      return false;
    }
    if (step === 2) return true;
    if (step === 3) return leaderReason.trim().length >= 10 && leaderCareer.trim().length > 0;
    return false;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { setShowLogin(true); return; }
    setSubmitting(true);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSubmitting(false); return; }

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
        introWho: introWho || null,
        sessions: sessions.filter((s) => s.title.trim()).length > 0 ? sessions.filter((s) => s.title.trim()) : null,
        guide: guide || null,
        notice: notice || null,
        needId: needId || null,
        tags: tagList,
        groupType: groupCategory,
        meetingType,
        joinType,
        eventDate: eventDateTime,
        seriesCount: meetingType === 'series' ? seriesCount : null,
        seriesDates: meetingType === 'series' ? seriesDates.filter((d) => d.date) : null,
        location,
        locationDetail,
        fee,
        feeUnit: fee > 0 && meetingType === 'series' ? 'per_session' : null,
        maxMembers,
        leaderReason,
        leaderCareer: leaderCareer || null,
        coverImageUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const newGroupId: string | undefined = data.group?.id;

      if (saveToProfile && (leaderCareer || leaderReason)) {
        await fetch('/api/badak/member', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            ...(leaderCareer && { career: leaderCareer }),
            ...(leaderReason && { bio: leaderReason }),
          }),
        }).catch(() => {});
      }

      if (wantIdParam && newGroupId) {
        await fetch('/api/badak/wants', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ id: wantIdParam, groupId: newGroupId, status: 'activated' }),
        }).catch(() => {});
      }
      router.push(`/badak/groups/${newGroupId || ''}`);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || '모임 생성에 실패했습니다');
    }
    setSubmitting(false);
  };

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
    </div>
  );

  const authOverlay = !isAuthenticated && devStep < 0 && (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(15,15,35,0.75)', backdropFilter: 'blur(4px)' }} />
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 pointer-events-none">
        <div className="flex flex-col items-center rounded-2xl border border-white/10 px-10 py-10 pointer-events-auto"
          style={{ background: 'rgba(26,26,46,0.95)' }}>
          <ShieldCheck className="mb-4 h-10 w-10 text-white/30" />
          <p className="mb-1 text-base font-bold text-white">로그인이 필요합니다</p>
          <p className="mb-6 text-sm text-white/40 text-center">바닥장이 되어 모임을 열려면 먼저 로그인하세요</p>
          <button
            onClick={() => setShowLogin(true)}
            className="rounded-xl border-none px-6 py-2.5 text-sm font-semibold"
            style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
          >
            로그인
          </button>
        </div>
      </div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );

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

  // 미리보기 데이터
  const previewSchedule = (() => {
    if (meetingType === 'onetime' && eventDate) {
      return `${formatDate(eventDate)}${eventTime ? ' ' + formatTime(eventTime) : ''}`;
    }
    if (meetingType === 'series' && seriesDates[0]?.date) {
      return `${formatDate(seriesDates[0].date)} 시작 · ${seriesCount}회`;
    }
    return '';
  })();

  const previewFee = (() => {
    if (fee === 0) return '무료';
    if (meetingType === 'series') return `${fee.toLocaleString()}원/회 (총 ${(fee * seriesCount).toLocaleString()}원)`;
    return `${fee.toLocaleString()}원`;
  })();

  // PreviewModal
  const PreviewModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 py-6 overflow-y-auto" onClick={() => setShowPreview(false)}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: '#1e1e38' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowPreview(false)}
          className="absolute top-3 right-3 z-10 rounded-full p-1.5 text-white/40 hover:text-white"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* 커버 이미지 */}
        {coverImage && (
          <div className="relative h-48 overflow-hidden">
            <img src={coverImage} alt="커버" className="h-full w-full object-cover"
              style={{ objectPosition: `${coverPosition.x}% ${coverPosition.y}%` }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(30,30,56,0.9))' }} />
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* 배지 + 제목 */}
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-white/30">상세 미리보기</div>
            <div className="mb-2 flex items-center gap-1.5">
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}>
                {{ onetime: '1회 단발', series: `${seriesCount}회 연속` }[meetingType]}
              </span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: joinType === 'approval' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)',
                  color: joinType === 'approval' ? '#fbbf24' : '#4ade80',
                }}>
                {joinType === 'approval' ? '승인제' : '선착순'}
              </span>
            </div>
            <div className="mb-2 text-lg font-bold text-white">{title || '(모임 제목 미입력)'}</div>
            {description && (
              <div className="whitespace-pre-line text-xs leading-relaxed text-white/55">{description}</div>
            )}
          </div>

          {/* 일정/장소/비용 */}
          <div className="rounded-xl border border-white/8 p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {previewSchedule && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-400/60" />
                <span>{previewSchedule}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400/60" />
                <span>{location}{locationDetail ? ` · ${locationDetail}` : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Users className="h-3.5 w-3.5 shrink-0 text-amber-400/60" />
              <span>최대 {maxMembers}명</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: fee === 0 ? 'rgba(74,222,128,0.8)' : 'rgba(255,217,61,0.8)' }}>
              <span className="h-3.5 w-3.5 shrink-0 text-center text-[10px]">₩</span>
              <span>{previewFee}</span>
            </div>
          </div>

          {/* 이런 분께 추천 */}
          {introWho && (
            <div>
              <div className="mb-1.5 text-[10px] font-semibold text-white/35">이런 분께 추천</div>
              <div className="whitespace-pre-line text-xs text-white/55">{introWho}</div>
            </div>
          )}

          {/* 모임 구성 (세션) */}
          {sessions.some((s) => s.title.trim()) && (
            <div>
              <div className="mb-2 text-[10px] font-semibold text-white/35">모임 구성</div>
              <div className="space-y-2">
                {sessions.filter((s) => s.title.trim()).map((s, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-white/75">{s.title}</div>
                      {s.description && <div className="mt-0.5 text-[10px] text-white/40">{s.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 태그 + 니즈 */}
          {(tagList.length > 0 || selectedNeed) && (
            <div className="flex flex-wrap gap-1.5">
              {tagList.map((t) => (
                <span key={t} className="rounded-full px-2 py-0.5 text-[10px] text-white/40" style={{ background: 'rgba(255,255,255,0.05)' }}>#{t}</span>
              ))}
              {selectedNeed && (
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-amber-400/60" style={{ background: 'rgba(255,217,61,0.06)' }}>
                  <Target className="h-2.5 w-2.5" />{selectedNeed.text}
                </span>
              )}
            </div>
          )}

          {/* 바닥장 소개 */}
          {(leaderProfile || leaderReason || leaderCareer) && (
            <div className="border-t border-white/8 pt-4 space-y-2.5">
              <div className="text-[10px] font-semibold text-white/35">바닥장 소개</div>
              {leaderProfile && (
                <div className="flex items-center gap-2.5">
                  {leaderProfile.avatarUrl ? (
                    <Image src={leaderProfile.avatarUrl} alt={leaderProfile.displayName} width={36} height={36}
                      className="h-9 w-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                      {leaderProfile.displayName?.charAt(0) ?? '?'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white/80">{leaderProfile.displayName}</div>
                    {(leaderProfile.jobFunction || leaderProfile.industry) && (
                      <div className="text-[10px] text-white/35">
                        {[leaderProfile.jobFunction, leaderProfile.industry].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {leaderCareer && (
                <div className="text-[11px] leading-relaxed text-white/50">{leaderCareer}</div>
              )}
              {leaderReason && (
                <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,217,61,0.04)', border: '1px solid rgba(255,217,61,0.1)' }}>
                  <div className="mb-1 text-[9px] text-white/25">바닥장의 한마디</div>
                  <div className="text-xs italic text-white/50">
                    &ldquo;{leaderReason.slice(0, 100)}{leaderReason.length > 100 ? '...' : ''}&rdquo;
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
    {authOverlay}
    {showPreview && <PreviewModal />}

    <div className="mx-auto min-h-screen max-w-[860px] bg-[#1a1a2e] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-7 pb-5">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="text-white/60 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">모임 만들기</h1>
        <div className="flex-1" />
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <Eye className="h-3.5 w-3.5" /> 미리보기
        </button>
        <span className="text-sm text-white/40">{step + 1} / {STEPS.length}</span>
      </div>

      {/* Step indicator */}
      <div className="mb-10 flex gap-2 px-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ background: i <= step ? 'linear-gradient(90deg, #ffd93d, #ff6b6b)' : 'rgba(255,255,255,0.1)' }}
            />
            <div className={`mt-2.5 text-[13px] font-medium ${i <= step ? 'text-white/80' : 'text-white/35'}`}>{s}</div>
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
                바닥장이 되면 연속 모임도 자유롭게 개설할 수 있습니다.
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
      <div className="px-6 pb-6">
        {/* ── Step 1: 기본 정보 ── */}
        {step === 0 && (
          <div className="space-y-9">
            {/* 커버 이미지 */}
            <div>
              <label className="mb-3 block text-[15px] font-medium text-white/75">커버 이미지 (선택)</label>
              {coverImage ? (
                <div className="space-y-2">
                  {/* 이미지 프리뷰 + 드래그 위치 조절 */}
                  <div className="relative h-40 overflow-hidden rounded-xl cursor-move select-none"
                    onMouseDown={(e) => {
                      setIsDraggingCover(true);
                      coverDragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: coverPosition.x, startPosY: coverPosition.y };
                    }}
                    onMouseMove={(e) => {
                      if (!isDraggingCover || !coverDragRef.current) return;
                      const dx = ((e.clientX - coverDragRef.current.startX) / 300) * -100;
                      const dy = ((e.clientY - coverDragRef.current.startY) / 160) * -100;
                      setCoverPosition({
                        x: Math.max(0, Math.min(100, coverDragRef.current.startPosX + dx)),
                        y: Math.max(0, Math.min(100, coverDragRef.current.startPosY + dy)),
                      });
                    }}
                    onMouseUp={() => setIsDraggingCover(false)}
                    onMouseLeave={() => setIsDraggingCover(false)}>
                    <img src={coverImage} alt="커버" className="h-full w-full object-cover pointer-events-none"
                      style={{ objectPosition: `${coverPosition.x}% ${coverPosition.y}%` }} />
                    {/* 드래그 힌트 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.25)' }}>
                      <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white font-medium"
                        style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <Move className="h-3.5 w-3.5" /> 드래그해서 위치 조정
                      </div>
                    </div>
                    {/* 삭제 버튼 */}
                    <button onClick={(e) => { e.stopPropagation(); setCoverImage(null); setCoverFile(null); setCoverPosition({ x: 50, y: 50 }); }}
                      className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/25 text-center">이미지를 드래그해서 위치를 조정하세요</p>
                </div>
              ) : (
                <div className="relative">
                  <button onClick={() => setShowCoverDropdown(!showCoverDropdown)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-8 text-sm text-white/30 hover:border-white/25 hover:text-white/50"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <ImagePlus className="h-5 w-5" /> 이미지 추가
                  </button>
                  {showCoverDropdown && (
                    <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-white/15 shadow-2xl"
                      style={{ background: '#1e1e38' }}>
                      <button onClick={() => { fileInputRef.current?.click(); setShowCoverDropdown(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5">
                        <ImagePlus className="h-4 w-4 text-white/40" /> 파일 업로드
                      </button>
                      <button onClick={() => { setShowUrlInput(true); setShowCoverDropdown(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 border-t border-white/6">
                        <LinkIcon className="h-4 w-4 text-white/40" /> URL로 삽입
                      </button>
                    </div>
                  )}
                  {showUrlInput && (
                    <div className="mt-2 flex gap-2">
                      <input value={coverUrlInput} onChange={(e) => setCoverUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/30" />
                      <button onClick={() => {
                        if (coverUrlInput.trim()) {
                          setCoverImage(coverUrlInput.trim());
                          setCoverFile(null);
                          setCoverPosition({ x: 50, y: 50 });
                        }
                        setShowUrlInput(false);
                        setCoverUrlInput('');
                      }}
                        className="rounded-xl px-3 py-2.5 text-sm font-medium"
                        style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                        삽입
                      </button>
                      <button onClick={() => { setShowUrlInput(false); setCoverUrlInput(''); }}
                        className="rounded-xl px-2.5 text-white/30 hover:text-white/50">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>

            {/* 모임 제목 */}
            <div>
              <label className="mb-3 block text-[15px] font-medium text-white/75">모임 제목 *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="예: AI 실무 프롬프트 스터디"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/40" />
            </div>

            {/* 모임 소개 */}
            <div>
              <label className="mb-3 block text-[15px] font-medium text-white/75">모임 소개</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder={'이 모임에서 무엇을 하나요?\n어떤 사람에게 좋나요?'}
                rows={4}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 text-[15px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/40" />
            </div>

            {/* 운영방식 */}
            <div>
              <label className="mb-3 block text-[15px] font-medium text-white/75">운영방식</label>
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
              <label className="mb-3 block text-[15px] font-medium text-white/75">모임 유형</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'onetime' as const, icon: Zap, label: '1회 단발' },
                  { id: 'series' as const, icon: Repeat, label: '연속 모임' },
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
              </p>

              {!isBadakjang && (
                <Link
                  href="/badak/apply"
                  className="mt-3 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-amber-400/10"
                  style={{ background: 'rgba(255,217,61,0.05)', borderColor: 'rgba(255,217,61,0.2)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <Crown className="h-4 w-4 text-amber-400/80" />
                    <div>
                      <div className="text-sm font-semibold text-amber-400">연속 모임도 열고 싶다면</div>
                      <div className="mt-0.5 text-xs text-white/45">바닥장 권한 신청하고 모든 모임 유형을 잠금 해제하세요</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-400">신청 <ArrowRight className="h-3.5 w-3.5" /></div>
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
              <label className="mb-3 block text-[15px] font-medium text-white/75">
                연결 니즈 (선택)
                {title.trim().length >= 2 && (
                  <span className="ml-2 text-[10px] text-amber-400/60">제목 기반 추천순</span>
                )}
              </label>
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

              {needDropdownOpen && (
                <div className="absolute left-0 right-0 bottom-full z-50 mb-1 overflow-hidden rounded-xl border border-white/15 shadow-2xl"
                  style={{ background: '#1e1e38' }}>
                  <div className="border-b border-white/8 p-2">
                    <input value={needSearch} onChange={(e) => setNeedSearch(e.target.value)}
                      placeholder="니즈 검색..." autoFocus
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 focus:border-amber-400/30" />
                  </div>
                  <button type="button"
                    onClick={() => { setNeedId(''); setNeedDropdownOpen(false); setNeedSearch(''); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors hover:bg-white/5"
                    style={{ color: !needId ? '#ffd93d' : 'rgba(255,255,255,0.4)' }}>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>∞</span>
                    제한 없음, 모두에게
                    {!needId && <Check className="ml-auto h-3.5 w-3.5 text-amber-400" />}
                  </button>
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
                            <div className="flex h-7 w-7 shrink-0 flex-col items-center justify-center rounded-full"
                              style={{
                                background: n.members >= 15 ? 'rgba(255,217,61,0.12)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${n.members >= 15 ? 'rgba(255,217,61,0.25)' : 'rgba(255,255,255,0.1)'}`,
                              }}>
                              <span className="text-[10px] font-bold" style={{ color: n.members >= 15 ? '#ffd93d' : 'rgba(255,255,255,0.5)' }}>
                                {n.members}
                              </span>
                            </div>
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
              <label className="mb-3 block text-[15px] font-medium text-white/75">태그 * <span className="text-xs text-white/30 font-normal">(최대 5개)</span></label>
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
                  if (val.includes(',')) { val.split(',').forEach((t) => addTag(t)); setTagInput(''); }
                  else setTagInput(val);
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
                  {eventDate && <p className="mt-1.5 text-xs text-white/35">{formatDate(eventDate)}</p>}
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/40">
                    <Clock className="h-3.5 w-3.5" /> 시간
                  </label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {QUICK_TIMES.map((t) => (
                      <Chip key={t.value} selected={eventTime === t.value} onClick={() => setEventTime(t.value)}>{t.label}</Chip>
                    ))}
                  </div>
                  <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white outline-none" />
                </div>
              </>
            )}

            {/* ─ 연속 모임: 달력 + 회차 목록 ─ */}
            {meetingType === 'series' && (
              <div>
                <label className="mb-3 flex items-center gap-1.5 text-xs font-medium text-white/40">
                  <Repeat className="h-3.5 w-3.5" /> 회차별 일정 ({seriesCount}회) *
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* 달력 */}
                  <div className="sm:w-[220px] shrink-0">
                    <MiniCalendar
                      selectedDates={seriesDates.map((sd) => sd.date)}
                      onToggle={(dateStr) => {
                        const idx = seriesDates.findIndex((sd) => sd.date === dateStr);
                        if (idx >= 0) {
                          setSeriesDates(seriesDates.filter((_, i) => i !== idx));
                        } else if (seriesDates.length < seriesCount) {
                          const newArr = [...seriesDates, { date: dateStr, time: '', location: '' }]
                            .sort((a, b) => a.date.localeCompare(b.date));
                          setSeriesDates(newArr);
                        }
                      }}
                      maxSelections={seriesCount}
                    />
                  </div>

                  {/* 회차 목록 */}
                  <div className="flex-1 space-y-2">
                    {seriesDates.map((sd, i) => (
                      <div key={sd.date} className="rounded-xl border border-white/10 p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                            {i + 1}
                          </span>
                          <span className="flex-1 text-xs font-medium text-white/70">{formatDate(sd.date)}</span>
                          <button
                            type="button"
                            onClick={() => setSeriesDates(seriesDates.filter((x) => x.date !== sd.date))}
                            className="text-white/25 hover:text-white/60"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input type="time" value={sd.time}
                            onChange={(e) => {
                              const next = [...seriesDates];
                              next[i] = { ...next[i], time: e.target.value };
                              setSeriesDates(next);
                            }}
                            className="w-28 rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#ffd93d]/40" />
                          <input type="text" value={sd.location}
                            onChange={(e) => {
                              const next = [...seriesDates];
                              next[i] = { ...next[i], location: e.target.value };
                              setSeriesDates(next);
                            }}
                            placeholder="장소 (미입력시 기본 장소)"
                            className="flex-1 rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-[#ffd93d]/40" />
                        </div>
                        {sd.time && (
                          <div className="mt-1.5 ml-8 text-[10px] text-white/30">
                            {formatTime(sd.time)}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 빈 슬롯 */}
                    {Array.from({ length: seriesCount - seriesDates.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex items-center gap-2 rounded-xl border border-dashed border-white/8 px-3 py-3"
                        style={{ background: 'rgba(255,255,255,0.01)' }}>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white/20"
                          style={{ background: 'rgba(255,255,255,0.06)' }}>
                          {seriesDates.length + i + 1}
                        </span>
                        <span className="text-xs text-white/20">달력에서 날짜를 선택하세요</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-white/25">첫 회차 날짜는 필수입니다. 나머지는 나중에 수정할 수 있어요.</p>
              </div>
            )}

            {/* 장소 */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/40">
                <MapPin className="h-3.5 w-3.5" /> 기본 장소 *
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
              <label className="mb-3 block text-[15px] font-medium text-white/75">상세 주소 (선택)</label>
              <input value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="카페명, 건물명, 층수 등"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            </div>

            {/* 참여비 */}
            <div>
              <label className="mb-3 block text-[15px] font-medium text-white/75">참여비</label>
              <div className="space-y-3">
                <p className="text-xs" style={{ color: 'rgba(255,217,61,0.6)' }}>1회 모임 3~7만원 권장</p>
                {/* 별도비용 청구 금지 안내 */}
                <div className="rounded-lg px-3.5 py-3 text-[11px] leading-relaxed" style={{ background: 'rgba(255,100,100,0.07)', border: '1px solid rgba(255,100,100,0.18)', color: 'rgba(255,180,180,0.7)' }}>
                  <span className="font-semibold" style={{ color: 'rgba(255,130,130,0.9)' }}>별도 비용 청구 불가</span> — 교재·실습·재료비 등 모임에서 발생하는 모든 비용은 참가비에 포함되어야 합니다. 참가자에게 현장에서 추가 비용을 요구할 수 없습니다.
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip selected={fee === 0} onClick={() => setFee(0)}>무료</Chip>
                  {FEE_PRESETS.map((p) => (
                    <Chip key={p.value} selected={fee === p.value} onClick={() => setFee(p.value)}>{p.label}</Chip>
                  ))}
                </div>
                <div className="relative">
                  <input type="number" value={fee || ''} onChange={(e) => setFee(Number(e.target.value))}
                    placeholder="직접 입력 (0이면 무료)"
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 pr-8 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">원</span>
                </div>
                {fee > 0 && meetingType === 'series' && (
                  <div className="text-xs text-white/50">
                    1회당 {fee.toLocaleString()}원 × {seriesCount}회 = 총 {(fee * seriesCount).toLocaleString()}원
                  </div>
                )}
                {fee > 0 && meetingType === 'onetime' && (
                  <div className="text-xs text-white/50">참가비 {fee.toLocaleString()}원</div>
                )}
              </div>
            </div>

            {/* 최대 인원 */}
            <div>
              <label className="mb-3 block text-[15px] font-medium text-white/75">
                <Users className="mr-1 inline h-3 w-3" />최대 인원
              </label>
              <div className="relative">
                <input type="number" value={maxMembers} onChange={(e) => setMaxMembers(Number(e.target.value))} min={2} max={100}
                  className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 pr-8 text-sm text-white outline-none" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">명</span>
              </div>
            </div>

            {/* 비용 산정 가이드 */}
            {fee > 0 && maxMembers > 0 && (() => {
              const totalFeePerPerson = meetingType === 'series' ? fee * seriesCount : fee;
              const totalRevenue = totalFeePerPerson * maxMembers;
              const platformRate = 25;
              const platformCut = Math.round(totalRevenue * platformRate / 100);
              const leaderCut = totalRevenue - platformCut - rentalCost - otherCost;
              return (
                <div className="rounded-xl p-4 space-y-2.5" style={{ background: 'rgba(255,217,61,0.05)', border: '1px solid rgba(255,217,61,0.12)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,217,61,0.8)' }}>예상 수익 ({maxMembers}명 전원 참여 기준)</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>총 참가비 수입</span>
                      <span style={{ color: 'rgba(255,255,255,0.75)' }}>{totalRevenue.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>바닥 플랫폼 수수료 ({platformRate}%)</span>
                      <span style={{ color: 'rgba(255,100,100,0.7)' }}>−{platformCut.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span style={{ color: 'rgba(255,255,255,0.4)' }} className="shrink-0">공간 임대 예상 비용</span>
                      <div className="relative flex-1">
                        <input type="number" value={rentalCost || ''} onChange={(e) => setRentalCost(Number(e.target.value))}
                          placeholder="0"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 pr-6 text-xs text-white outline-none placeholder:text-white/20 focus:border-amber-400/30" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/25">원</span>
                      </div>
                      {rentalCost > 0 && <span style={{ color: 'rgba(255,100,100,0.7)' }}>−{rentalCost.toLocaleString()}원</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span style={{ color: 'rgba(255,255,255,0.4)' }} className="shrink-0">기타 비용 <span className="text-white/20">(교재·실습 등)</span></span>
                      <div className="relative flex-1">
                        <input type="number" value={otherCost || ''} onChange={(e) => setOtherCost(Number(e.target.value))}
                          placeholder="0"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 pr-6 text-xs text-white outline-none placeholder:text-white/20 focus:border-amber-400/30" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/25">원</span>
                      </div>
                      {otherCost > 0 && <span style={{ color: 'rgba(255,100,100,0.7)' }}>−{otherCost.toLocaleString()}원</span>}
                    </div>
                    <div className="my-1 border-t" style={{ borderColor: 'rgba(255,217,61,0.12)' }} />
                    <div className="flex justify-between text-xs font-semibold">
                      <span style={{ color: 'rgba(255,217,61,0.9)' }}>바닥장 예상 수익</span>
                      <span style={{ color: leaderCut >= 0 ? 'rgba(255,217,61,0.9)' : 'rgba(255,100,100,0.8)' }}>{leaderCut.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Step 3: 콘텐츠 구성 ── */}
        {step === 2 && (
          <div className="space-y-9">
            {/* 이런 분께 추천 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/75">이런 분께 추천 (선택)</label>
              <p className="mb-2 text-xs text-white/30">어떤 분들이 이 모임에 어울리는지 적어주세요</p>
              <textarea value={introWho} onChange={(e) => setIntroWho(e.target.value)}
                placeholder={'예: B2B SaaS 마케팅 실무자\n퍼포먼스 마케팅을 처음 배우는 분\n마케터와 네트워킹을 원하는 분'}
                rows={3}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            </div>

            {/* 모임 구성 (세션) — 모임유형과 연동 */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-white/75">
                  모임 구성
                  {meetingType === 'onetime' && <span className="ml-2 text-[10px] text-white/30">1회 단발</span>}
                  {meetingType === 'series' && <span className="ml-2 text-[10px] text-amber-400/50">{seriesCount}회 연속 — 회차별 입력</span>}
                </label>
                {meetingType !== 'series' && (
                  <button
                    type="button"
                    onClick={() => setSessions([...sessions, { title: '', description: '' }])}
                    disabled={sessions.length >= 8}
                    className="text-xs text-amber-400/70 hover:text-amber-400 disabled:opacity-30"
                  >
                    + 회차 추가
                  </button>
                )}
              </div>
              <p className="mb-3 text-xs text-white/30">각 회차의 주제와 내용을 입력하세요 (선택)</p>
              <div className="space-y-3">
                {sessions.map((session, i) => {
                  const sd = meetingType === 'series' ? seriesDates[i] : null;
                  const sessionDate = sd?.date
                    ? formatDate(sd.date) + (sd.time ? ' ' + formatTime(sd.time) : '')
                    : null;
                  const sessionLocation = sd?.location || null;

                  return (
                    <div key={i} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                          style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {(sessionDate || sessionLocation) && (
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/35">
                            {sessionDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {sessionDate}
                              </span>
                            )}
                            {sessionLocation && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {sessionLocation}
                              </span>
                            )}
                          </div>
                        )}
                        <input
                          value={session.title}
                          onChange={(e) => { const next = [...sessions]; next[i] = { ...next[i], title: e.target.value }; setSessions(next); }}
                          placeholder={`${i + 1}회차 제목`}
                          className="w-full rounded-lg border border-white/12 bg-white/6 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40"
                        />
                        <textarea
                          value={session.description}
                          onChange={(e) => { const next = [...sessions]; next[i] = { ...next[i], description: e.target.value }; setSessions(next); }}
                          placeholder="간단한 내용 설명"
                          rows={2}
                          className="w-full resize-none rounded-lg border border-white/12 bg-white/6 px-3 py-2 text-sm leading-relaxed text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40"
                        />
                      </div>
                      {meetingType !== 'series' && sessions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSessions(sessions.filter((_, j) => j !== i))}
                          className="mt-3 self-start text-white/25 hover:text-white/60"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 상세 안내 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/75">상세 안내 (선택)</label>
              <p className="mb-2 text-xs text-white/30">준비물, 진행 방식, 참고 사항 등을 자유롭게 적어주세요</p>
              <textarea value={guide} onChange={(e) => setGuide(e.target.value)}
                placeholder={'예: 노트북 지참 필수\n오픈채팅방 참여 후 참석 확정'}
                rows={4}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            </div>

            {/* 주요 공지 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/75">주요 공지 (선택)</label>
              <p className="mb-2 text-xs text-white/30">상세 페이지 상단에 눈에 띄게 표시될 공지사항입니다</p>
              <input value={notice} onChange={(e) => setNotice(e.target.value)}
                placeholder="예: 4/26 정원이 거의 찼습니다. 서둘러 신청하세요!"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            </div>
          </div>
        )}

        {/* ── Step 4: 바닥장 소개 ── */}
        {step === 3 && (
          <div className="space-y-6">
            {/* 바닥장 프로필 카드 */}
            {leaderProfile && (
              <div className="flex items-center gap-3 rounded-xl border border-white/8 p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                {leaderProfile.avatarUrl ? (
                  <Image src={leaderProfile.avatarUrl} alt={leaderProfile.displayName} width={48} height={48}
                    className="h-12 w-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold"
                    style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                    {leaderProfile.displayName?.charAt(0) ?? '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{leaderProfile.displayName}</div>
                  {(leaderProfile.jobFunction || leaderProfile.industry) && (
                    <div className="mt-0.5 text-xs text-white/45">
                      {[leaderProfile.jobFunction, leaderProfile.industry].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <div className="ml-auto text-[10px] text-white/25 shrink-0">내 프로필</div>
              </div>
            )}

            {/* 개인 이력 */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[15px] font-medium text-white/75">개인 이력 *</label>
                {leaderProfile?.career && (
                  <button
                    type="button"
                    onClick={importCareerFromProfile}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    프로필에서 가져오기
                  </button>
                )}
              </div>
              <textarea
                value={leaderCareer}
                onChange={(e) => setLeaderCareer(e.target.value)}
                placeholder="주요 경력, 전문 분야, 성과 등을 적어주세요"
                rows={3}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 text-[15px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/40"
              />
            </div>

            {/* 바닥장 소개 */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[15px] font-medium text-white/75">바닥장 소개 * <span className="text-xs text-white/30 font-normal">(10자 이상)</span></label>
                {leaderProfile?.bio && (
                  <button
                    type="button"
                    onClick={importBioFromProfile}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    프로필에서 가져오기
                  </button>
                )}
              </div>
              <textarea
                value={leaderReason}
                onChange={(e) => setLeaderReason(e.target.value)}
                placeholder="왜 이 모임을 열고 싶은지, 참여자에게 어떤 도움이 되는지 적어주세요"
                rows={5}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 text-[15px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-[#ffd93d]/40"
              />
              <div className="mt-1 text-right text-[10px] text-white/20">{leaderReason.length}자</div>
            </div>

            {/* 마이페이지에도 저장 */}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 px-4 py-3.5"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div
                onClick={() => setSaveToProfile(!saveToProfile)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all"
                style={{
                  borderColor: saveToProfile ? '#ffd93d' : 'rgba(255,255,255,0.2)',
                  background: saveToProfile ? 'rgba(255,217,61,0.15)' : 'transparent',
                }}
              >
                {saveToProfile && <Check className="h-3 w-3 text-amber-400" />}
              </div>
              <span className="text-xs text-white/50">이 내용을 마이페이지 이력·소개에도 저장하기</span>
            </label>

            <div className="rounded-xl border border-white/8 px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs text-white/35 leading-relaxed">
                바닥장 소개는 모임 상세 페이지에 공개됩니다. 참여자가 신뢰할 수 있도록 솔직하게 작성해주세요.
              </p>
              <button onClick={() => setShowPreview(true)}
                className="mt-3 flex items-center gap-1.5 text-xs text-amber-400/70 hover:text-amber-400">
                <Eye className="h-3.5 w-3.5" /> 미리보기로 확인하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10 pt-4">
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold shadow-lg transition-all disabled:opacity-30"
            style={{
              background: canNext() ? 'linear-gradient(135deg, #ffd93d, #ff6b6b)' : 'rgba(255,255,255,0.08)',
              color: canNext() ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
            }}>
            다음 <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!canNext() || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold shadow-lg transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)', color: '#1a1a2e' }}>
            {submitting ? '생성 중...' : '모임 개설하기'} <Check className="h-4 w-4" />
          </button>
        )}
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
    </>
  );
}
