'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ChevronRight, ChevronLeft, User, Briefcase, Search, Gift } from 'lucide-react';
import { JOB_FUNCTIONS, INDUSTRIES, JOB_LEVELS, LOOKING_FOR_TAGS, CAN_OFFER_TAGS } from '@/lib/badak-constants';
import { upsertBadakProfile, fetchBadakProfile } from '@/lib/supabase/badak';
import TagPicker from '@/components/badak/TagPicker';

export default function JoinPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [jobFunction, setJobFunction] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [jobLevel, setJobLevel] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [canOffer, setCanOffer] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/badak/join');
    }
  }, [isLoading, isAuthenticated, router]);

  // 이미 프로필이 있으면 마이페이지로
  useEffect(() => {
    if (user?.id) {
      fetchBadakProfile(user.id).then(p => {
        if (p) router.replace('/badak/my');
      });
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user]);

  if (isLoading || !isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  const canNext = () => {
    if (step === 1) return !!jobFunction;
    if (step === 2) return !!industry && !!jobLevel;
    if (step === 3) return lookingFor.length > 0;
    if (step === 4) return displayName.trim().length > 0 && bio.trim().length > 0;
    return false;
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    const result = await upsertBadakProfile({
      id: user.id,
      displayName: displayName.trim(),
      jobFunction,
      industry,
      experienceYears,
      jobLevel,
      bio: bio.trim(),
      lookingFor,
      canOffer,
      company: company.trim() || null,
      companyVisible: true,
      interestTags: [],
      isActive: true,
      avatarUrl: null,
    });
    if (result) {
      router.push(`/badak/profile/${user.id}`);
    } else {
      setSubmitting(false);
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const STEPS = [
    { icon: Briefcase, label: '직무' },
    { icon: User, label: '경력' },
    { icon: Search, label: '찾는 것' },
    { icon: Gift, label: '소개' },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* 진행 바 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i + 1 < step;
              const active = i + 1 === step;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${done ? 'bg-blue-600 text-white' : active ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[10px] ${active ? 'text-blue-600 font-semibold' : 'text-neutral-400'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="h-1.5 rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* Step 1: 직무 */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">어떤 일을 하시나요?</h2>
            <p className="text-sm text-neutral-500 mb-6">가장 가까운 직무를 선택해주세요</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {JOB_FUNCTIONS.map(jf => (
                <button key={jf} type="button" onClick={() => setJobFunction(jf)}
                  className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${jobFunction === jf ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-neutral-200 text-neutral-600 hover:border-blue-300'}`}>
                  {jf}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 산업/경력/직급 */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">어디서 일하시나요?</h2>
            <p className="text-sm text-neutral-500 mb-6">산업, 경력, 직급을 알려주세요</p>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-900">산업</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-blue-600 focus:outline-none">
                  <option value="">선택</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-900">경력 (년)</label>
                <input type="number" min={0} max={40} value={experienceYears} onChange={e => setExperienceYears(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-900">직급</label>
                <div className="grid grid-cols-2 gap-2">
                  {JOB_LEVELS.map(lv => (
                    <button key={lv} type="button" onClick={() => setJobLevel(lv)}
                      className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${jobLevel === lv ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-neutral-200 text-neutral-600 hover:border-blue-300'}`}>
                      {lv}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 찾는 것 / 줄 수 있는 것 */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">바닥에서 뭘 찾고 계신가요?</h2>
            <p className="text-sm text-neutral-500 mb-6">프로필의 핵심입니다. 솔직하게 선택해주세요</p>
            <div className="space-y-6">
              <TagPicker label="찾고 있는 것" options={LOOKING_FOR_TAGS} selected={lookingFor} onChange={setLookingFor} max={5} color="blue" />
              <TagPicker label="줄 수 있는 것" options={CAN_OFFER_TAGS} selected={canOffer} onChange={setCanOffer} max={5} color="emerald" />
            </div>
          </div>
        )}

        {/* Step 4: 소개 */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">마지막으로, 자신을 소개해주세요</h2>
            <p className="text-sm text-neutral-500 mb-6">이 바닥에서 나는 어떤 사람인지</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-900">이름 또는 닉네임</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={20} placeholder="실명 권장"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-900">회사명 <span className="text-neutral-400 font-normal">(선택)</span></label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="비공개 가능"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-neutral-900">
                  한 줄 소개
                  <span className="text-xs text-neutral-400 font-normal">{bio.length}/300</span>
                </label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
                  placeholder="이 바닥에서 나는 이런 사람입니다..."
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm resize-none focus:border-blue-600 focus:outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* 네비게이션 */}
        <div className="mt-8 flex items-center gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
              <ChevronLeft size={16} /> 이전
            </button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <button type="button" onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              다음 <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!canNext() || submitting}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {submitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '프로필 완성'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
