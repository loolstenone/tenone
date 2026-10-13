'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { LoginModal } from '@/components/LoginModal';
import { ChevronLeft } from 'lucide-react';

const ACCENT = '#ffd93d';

const INDUSTRIES = [
  'IT/테크', '광고/에이전시', '마케팅', '디자인', '미디어/콘텐츠',
  '금융/핀테크', '유통/이커머스', '제조', '교육', '컨설팅',
  '스타트업', '엔터테인먼트', '패션/뷰티', '식음료/외식', '부동산/건설',
  '의료/헬스케어', '공공/비영리', '기타',
];

const JOB_FUNCTIONS = [
  '마케팅', '브랜딩', '퍼포먼스 마케팅', 'CRM/그로스', 'PR/홍보',
  'AE/광고기획', '미디어플래닝', '콘텐츠 기획', 'UX/UI 디자인', '그래픽 디자인',
  'PM/기획', '개발', '데이터 분석', '영업/BD', '경영/전략',
  '크리에이티브 디렉션', '영상 제작', 'SNS 운영', 'CS/운영', '기타',
];

function formatPhoneInput(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function OnboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [handleError, setHandleError] = useState('');
  const [industry, setIndustry] = useState('');
  const [industryType, setIndustryType] = useState<'current' | 'desired'>('current');
  const [jobFunction, setJobFunction] = useState('');
  const [jobFunctionType, setJobFunctionType] = useState<'current' | 'desired'>('current');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
      setHandle(user.handle || '');
    }
  }, [user]);

  const validateHandle = (v: string) => {
    if (!v) return '';
    if (v.length < 3) return '3자 이상 입력해주세요';
    if (!/^[a-z0-9_]+$/.test(v)) return '영문 소문자, 숫자, _만 사용 가능해요';
    return '';
  };

  const handleHandleChange = (v: string) => {
    const cleaned = v.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setHandle(cleaned);
    setHandleError(validateHandle(cleaned));
  };

  const canSubmit = () => {
    if (!displayName.trim() || displayName.trim().length < 2) return false;
    if (!industry) return false;
    if (!jobFunction) return false;
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) return false;
    if (handle && handleError) return false;
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSubmitting(false); return; }

    const res = await fetch('/api/badak/member/onboard', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        displayName: displayName.trim(),
        handle: handle.trim() || undefined,
        industry,
        industryType,
        jobFunction,
        jobFunctionType,
        phone: phone.replace(/\D/g, ''),
      }),
    });

    if (res.ok) {
      router.push('/badak');
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.error || '저장에 실패했습니다. 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-6">
        <div className="text-center">
          <div className="mb-2 text-3xl font-black" style={{ color: ACCENT }}>바닥</div>
          <p className="mb-6 text-sm text-neutral-400">로그인이 필요합니다</p>
          <button
            onClick={() => setShowLogin(true)}
            className="rounded-xl px-6 py-3 text-sm font-bold text-black"
            style={{ backgroundColor: ACCENT }}
          >
            로그인 / 가입하기
          </button>
        </div>
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </div>
    );
  }

  /* ── Step 0: Welcome ── */
  if (step === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-between bg-[#0d0d0d] px-6 py-16">
        <div />

        <div className="w-full max-w-[400px] text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-black"
            style={{ backgroundColor: ACCENT + '20', color: ACCENT }}>
            바
          </div>
          <h1 className="mb-3 text-3xl font-black leading-tight text-white" style={{ letterSpacing: '-0.04em' }}>
            회사 밖에서 통하는<br />
            <span style={{ color: ACCENT }}>내 업계 사람들</span>
          </h1>
          <p className="mb-2 text-base text-neutral-400" style={{ letterSpacing: '-0.02em' }}>
            취업·이직·네트워킹까지
          </p>
          <p className="text-sm text-neutral-600">
            같은 업계 사람들과 오프라인에서 직접 만나요
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { icon: '🤝', label: '업계 네트워킹' },
              { icon: '💼', label: '취업·이직 정보' },
              { icon: '🚀', label: '사이드 프로젝트' },
            ].map(({ icon, label }) => (
              <div key={label} className="rounded-xl bg-neutral-900 py-3 px-2 text-center">
                <div className="mb-1 text-xl">{icon}</div>
                <div className="text-[11px] text-neutral-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          <button
            onClick={() => setStep(1)}
            className="w-full rounded-2xl py-4 text-base font-bold text-black transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            프로필 만들기 →
          </button>
          <p className="mt-3 text-center text-xs text-neutral-600">
            1분이면 충분해요
          </p>
        </div>
      </div>
    );
  }

  /* ── Step 1: 프로필 입력 ── */
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800/60 bg-[#0d0d0d]/90 px-4 py-3 backdrop-blur">
        <button onClick={() => setStep(0)} className="p-1 text-neutral-500 hover:text-neutral-300">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-xs font-medium text-neutral-500">프로필 설정</span>
        <div className="w-7" />
      </div>

      <div ref={formRef} className="mx-auto max-w-[480px] px-5 pb-32 pt-6">
        <h1 className="mb-1 text-2xl font-black text-white" style={{ letterSpacing: '-0.04em' }}>
          나를 소개해요
        </h1>
        <p className="mb-8 text-sm text-neutral-500">
          같은 업계 멤버들이 나를 찾을 수 있어요
        </p>

        <div className="space-y-6">
          {/* 닉네임 */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              닉네임 *
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="바닥에서 불릴 이름"
              maxLength={20}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-neutral-600"
            />
          </div>

          {/* 핸들 */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              핸들 (선택)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">@</span>
              <input
                value={handle}
                onChange={(e) => handleHandleChange(e.target.value)}
                placeholder="my_handle"
                maxLength={20}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 pl-8 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-neutral-600"
                style={handle && !handleError ? { borderColor: ACCENT + '60' } : {}}
              />
            </div>
            {handleError ? (
              <p className="mt-1.5 text-[11px] text-red-400">{handleError}</p>
            ) : handle ? (
              <p className="mt-1.5 text-[11px] text-neutral-500">tenone.biz/profile/@{handle} 로 공개돼요</p>
            ) : (
              <p className="mt-1.5 text-[11px] text-neutral-600">프로필 URL에 사용돼요. 나중에도 설정 가능해요</p>
            )}
          </div>

          {/* 산업군 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                업계 *
              </label>
              <div className="flex gap-1">
                {(['current', 'desired'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setIndustryType(t)}
                    className="rounded-full px-3 py-1 text-[11px] font-medium transition-colors"
                    style={industryType === t
                      ? { backgroundColor: ACCENT + '20', color: ACCENT }
                      : { backgroundColor: 'transparent', color: '#6b7280' }}
                  >
                    {t === 'current' ? '현직' : '희망'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRIES.map((ind) => {
                const sel = industry === ind;
                return (
                  <button
                    key={ind}
                    onClick={() => setIndustry(sel ? '' : ind)}
                    className="rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    style={sel
                      ? { backgroundColor: ACCENT, color: '#000', fontWeight: 700 }
                      : { backgroundColor: '#1a1a1a', color: '#9ca3af', border: '1px solid #2a2a2a' }}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 직무 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                직무 *
              </label>
              <div className="flex gap-1">
                {(['current', 'desired'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setJobFunctionType(t)}
                    className="rounded-full px-3 py-1 text-[11px] font-medium transition-colors"
                    style={jobFunctionType === t
                      ? { backgroundColor: ACCENT + '20', color: ACCENT }
                      : { backgroundColor: 'transparent', color: '#6b7280' }}
                  >
                    {t === 'current' ? '현직' : '희망'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {JOB_FUNCTIONS.map((jf) => {
                const sel = jobFunction === jf;
                return (
                  <button
                    key={jf}
                    onClick={() => setJobFunction(sel ? '' : jf)}
                    className="rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    style={sel
                      ? { backgroundColor: ACCENT, color: '#000', fontWeight: 700 }
                      : { backgroundColor: '#1a1a1a', color: '#9ca3af', border: '1px solid #2a2a2a' }}
                  >
                    {jf}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              전화번호 *
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={formatPhoneInput(phone)}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="010-1234-5678"
              maxLength={13}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-neutral-600"
            />
            <p className="mt-1.5 text-[11px] text-neutral-600">모임 확정 시 안내 문자만 발송돼요. 공개되지 않아요.</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-800/60 bg-[#0d0d0d]/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto max-w-[480px]">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || submitting}
            className="w-full rounded-2xl py-4 text-base font-bold text-black transition-opacity disabled:opacity-30"
            style={{ backgroundColor: ACCENT }}
          >
            {submitting ? '저장 중...' : '바닥 입장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
