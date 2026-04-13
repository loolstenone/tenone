'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ImagePlus, X, Calendar, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

interface NeedOption {
  id: string;
  displayText: string;
  count: number;
}

const STEPS = ['기본 정보', '일정/장소', '바닥장 소개'];

const QUICK_DATES = (() => {
  const dates: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const label = `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]})`;
    const value = d.toISOString().split('T')[0];
    if (d.getDay() === 0 || d.getDay() === 6) {
      dates.push({ label, value });
    }
  }
  // Also add next 3 weekday evenings
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
const QUICK_LOCATIONS = ['성수동', '강남역', '홍대', '합정', '을지로', '여의도', '온라인'];

export default function CreateGroupPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [needs, setNeeds] = useState<NeedOption[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [needId, setNeedId] = useState('');
  const [tags, setTags] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [fee, setFee] = useState(0);
  const [maxMembers, setMaxMembers] = useState(20);
  const [leaderReason, setLeaderReason] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/badak/cloud')
      .then((r) => r.json())
      .then((data) => {
        if (data.needs) {
          setNeeds(data.needs.map((n: { id: string; displayText: string; count: number }) => ({
            id: n.id, displayText: n.displayText, count: n.count,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tagList.includes(trimmed)) return;
    setTags(tagList.length > 0 ? `${tags},${trimmed}` : trimmed);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tagList.filter((t) => t !== tag).join(','));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지는 5MB 이하만 업로드할 수 있습니다');
      return;
    }
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
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return eventDate && location.trim().length > 0;
    if (step === 2) return leaderReason.trim().length > 0;
    return false;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { alert('로그인이 필요합니다'); return; }
    setSubmitting(true);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSubmitting(false); return; }

    const eventDateTime = eventDate && eventTime
      ? `${eventDate}T${eventTime}:00`
      : eventDate ? `${eventDate}T00:00:00` : null;

    // 이미지 업로드
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
        eventDate: eventDateTime,
        location,
        locationDetail,
        fee,
        maxMembers,
        leaderReason,
        coverImageUrl,
      }),
    });

    if (res.ok) {
      alert('모임이 생성되었습니다! 관리자 승인 후 공개됩니다.');
      router.push('/badak');
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || '모임 생성에 실패했습니다');
    }
    setSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mb-4 text-xl font-bold text-neutral-900">로그인이 필요합니다</div>
          <p className="mb-6 text-sm text-neutral-900/50">바닥장이 되어 모임을 열려면 먼저 로그인하세요</p>
          <Link href="/login?redirect=/groups/create" className="rounded-xl bg-[#ffd93d] px-6 py-3 text-sm font-bold text-[#1a1a2e]">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[860px] bg-white text-neutral-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="text-neutral-900/60 hover:text-neutral-900">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">모임 만들기</h1>
        <div className="flex-1" />
        <span className="text-xs text-neutral-900/30">{step + 1} / {STEPS.length}</span>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1 px-5 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className="h-1 rounded-full transition-all"
              style={{
                background: i <= step ? 'linear-gradient(90deg, #ffd93d, #ff6b6b)' : 'rgba(255,255,255,0.1)',
              }}
            />
            <div className={`mt-1.5 text-[10px] ${i <= step ? 'text-neutral-900/60' : 'text-neutral-900/20'}`}>
              {s}
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="px-5 pb-32">
        {/* ── Step 1: 기본 정보 ── */}
        {step === 0 && (
          <div className="space-y-5">
            {/* Cover image */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-900/50">커버 이미지 (선택)</label>
              {coverImage ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={coverImage} alt="커버" className="w-full h-40 object-cover" />
                  <button
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-neutral-900 hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/3 py-8 text-sm text-neutral-900/30 hover:border-white/25 hover:text-neutral-900/50"
                >
                  <ImagePlus className="h-5 w-5" />
                  이미지 추가
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-900/50">모임 제목 *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: AI 실무 프롬프트 스터디"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-900/25 focus:border-[#ffd93d]/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-900/50">모임 소개</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이 모임에서 무엇을 하나요? 어떤 사람에게 좋나요?&#10;&#10;예:&#10;- 실무에서 바로 쓰는 AI 프롬프트를 배웁니다&#10;- 마케터/기획자 대상&#10;- 매주 토요일 오후 2시간"
                rows={5}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-neutral-900 leading-relaxed outline-none placeholder:text-neutral-900/25 focus:border-[#ffd93d]/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-900/50">연결 니즈 (선택)</label>
              <select
                value={needId}
                onChange={(e) => setNeedId(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-neutral-900 outline-none"
              >
                <option value="">니즈 선택 안 함</option>
                {needs.map((n) => (
                  <option key={n.id} value={n.id}>{n.displayText} ({n.count}명)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-900/50">태그</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tagList.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-[#ffd93d]/10 px-3 py-1 text-xs font-medium text-[#ffd93d]"
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="ml-0.5 opacity-50 hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="태그 입력 후 Enter"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-900/25 focus:border-[#ffd93d]/40"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: 일정/장소 ── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Quick date picker */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-900/50">
                <Calendar className="h-3.5 w-3.5" /> 날짜 *
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_DATES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setEventDate(d.value)}
                    className="rounded-lg border px-3 py-2 text-xs font-medium transition-all"
                    style={{
                      borderColor: eventDate === d.value ? '#ffd93d' : 'rgba(255,255,255,0.1)',
                      background: eventDate === d.value ? 'rgba(255,217,61,0.1)' : 'rgba(255,255,255,0.03)',
                      color: eventDate === d.value ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-neutral-900 outline-none"
              />
            </div>

            {/* Quick time picker */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-900/50">
                <Clock className="h-3.5 w-3.5" /> 시간
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_TIMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setEventTime(t)}
                    className="rounded-lg border px-3 py-2 text-xs font-medium transition-all"
                    style={{
                      borderColor: eventTime === t ? '#ffd93d' : 'rgba(255,255,255,0.1)',
                      background: eventTime === t ? 'rgba(255,217,61,0.1)' : 'rgba(255,255,255,0.03)',
                      color: eventTime === t ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-neutral-900 outline-none"
              />
            </div>

            {/* Quick location */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-900/50">
                <MapPin className="h-3.5 w-3.5" /> 장소 *
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className="rounded-lg border px-3 py-2 text-xs font-medium transition-all"
                    style={{
                      borderColor: location === loc ? '#ffd93d' : 'rgba(255,255,255,0.1)',
                      background: location === loc ? 'rgba(255,217,61,0.1)' : 'rgba(255,255,255,0.03)',
                      color: location === loc ? '#ffd93d' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="직접 입력"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-900/25 focus:border-[#ffd93d]/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-900/50">상세 주소 (선택)</label>
              <input
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="카페명, 건물명, 층수 등"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-900/25 focus:border-[#ffd93d]/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-900/50">참여비</label>
                <div className="relative">
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 pr-8 text-sm text-neutral-900 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-900/30">원</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-900/50">최대 인원</label>
                <div className="relative">
                  <input
                    type="number"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    min={2}
                    max={100}
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 pr-8 text-sm text-neutral-900 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-900/30">명</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: 바닥장 소개 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-900/50">이 모임을 여는 이유 *</label>
              <textarea
                value={leaderReason}
                onChange={(e) => setLeaderReason(e.target.value)}
                placeholder="왜 이 모임을 열고 싶은지, 참여자에게 어떤 도움이 되는지 적어주세요"
                rows={5}
                className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-neutral-900 leading-relaxed outline-none placeholder:text-neutral-900/25 focus:border-[#ffd93d]/40"
              />
              <div className="mt-1 text-right text-[10px] text-neutral-900/20">
                {leaderReason.length}자
              </div>
            </div>

            {/* Preview card */}
            <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
              {coverImage && (
                <img src={coverImage} alt="커버" className="w-full h-32 object-cover" />
              )}
              <div className="p-5">
                <div className="mb-1 text-[10px] font-medium uppercase text-neutral-900/30">미리보기</div>
                <div className="mb-2 text-base font-bold">{title || '모임 제목'}</div>
                {description && (
                  <div className="mb-3 text-xs text-neutral-900/50 leading-relaxed whitespace-pre-line">
                    {description.slice(0, 100)}{description.length > 100 ? '...' : ''}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-neutral-900/40">
                  {eventDate && (
                    <span>📅 {new Date(eventDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })} {eventTime}</span>
                  )}
                  {location && <span>📍 {location}</span>}
                  <span>👥 1/{maxMembers}</span>
                  {fee > 0 && <span>💰 {fee.toLocaleString()}원</span>}
                  {fee === 0 && <span>무료</span>}
                </div>
                {tagList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tagList.map((t) => (
                      <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-neutral-900/40">#{t}</span>
                    ))}
                  </div>
                )}
                {leaderReason && (
                  <div className="mt-4 border-t border-neutral-100 pt-3">
                    <div className="text-[10px] text-neutral-900/25 mb-1">바닥장의 한마디</div>
                    <div className="text-xs text-neutral-900/50 italic">&ldquo;{leaderReason.slice(0, 80)}{leaderReason.length > 80 ? '...' : ''}&rdquo;</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[860px] -translate-x-1/2 border-t border-neutral-100 bg-white px-5 py-4">
        {step < 2 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-30"
            style={{
              background: canNext() ? 'linear-gradient(135deg, #ffd93d, #ff6b6b)' : 'rgba(255,255,255,0.08)',
              color: canNext() ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
            }}
          >
            다음 <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canNext() || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-30"
            style={{
              background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)',
              color: '#1a1a2e',
            }}
          >
            {submitting ? '생성 중...' : '모임 개설하기'} <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
