'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

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

export default function OnboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [industry, setIndustry] = useState('');
  const [industryType, setIndustryType] = useState<'current' | 'desired'>('current');
  const [jobFunction, setJobFunction] = useState('');
  const [jobFunctionType, setJobFunctionType] = useState<'current' | 'desired'>('current');
  const [phone, setPhone] = useState('');

  const canNext = () => {
    if (step === 0) return industry.length > 0;
    if (step === 1) return jobFunction.length > 0;
    if (step === 2) return phone.trim().length >= 10;
    return false;
  };

  const handleSubmit = async () => {
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
        displayName: displayName || user?.name,
        industry,
        industryType,
        jobFunction,
        jobFunctionType,
        phone,
      }),
    });

    if (res.ok) {
      router.push('/badak');
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || '프로필 저장에 실패했습니다');
    }
    setSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mb-4 text-xl font-bold">로그인이 필요합니다</div>
          <Link href="/login?redirect=/onboard" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-white px-6 pt-12 pb-32">
      {/* Progress */}
      <div className="mb-8 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{ background: i <= step ? '#2563eb' : '#e5e7eb' }}
          />
        ))}
      </div>

      {/* Step 0: 산업군 */}
      {step === 0 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">어떤 업계에 계신가요?</h1>
          <p className="mb-6 text-sm text-neutral-500">현재 근무 중이거나 희망하는 산업을 선택해주세요</p>

          <div className="mb-4 flex gap-2">
            {(['current', 'desired'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setIndustryType(t)}
                className="rounded-full border px-4 py-1.5 text-xs font-medium transition-all"
                style={{
                  borderColor: industryType === t ? '#2563eb' : '#e5e7eb',
                  background: industryType === t ? '#eff6ff' : 'white',
                  color: industryType === t ? '#2563eb' : '#6b7280',
                }}
              >
                {t === 'current' ? '현재 근무 중' : '희망 업계'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className="rounded-lg border px-3 py-2 text-sm transition-all"
                style={{
                  borderColor: industry === ind ? '#2563eb' : '#e5e7eb',
                  background: industry === ind ? '#eff6ff' : 'white',
                  color: industry === ind ? '#2563eb' : '#374151',
                  fontWeight: industry === ind ? 600 : 400,
                }}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: 직무 */}
      {step === 1 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">어떤 일을 하세요?</h1>
          <p className="mb-6 text-sm text-neutral-500">현재 담당하거나 희망하는 직무를 선택해주세요</p>

          <div className="mb-4 flex gap-2">
            {(['current', 'desired'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setJobFunctionType(t)}
                className="rounded-full border px-4 py-1.5 text-xs font-medium transition-all"
                style={{
                  borderColor: jobFunctionType === t ? '#2563eb' : '#e5e7eb',
                  background: jobFunctionType === t ? '#eff6ff' : 'white',
                  color: jobFunctionType === t ? '#2563eb' : '#6b7280',
                }}
              >
                {t === 'current' ? '현재 직무' : '희망 직무'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {JOB_FUNCTIONS.map((jf) => (
              <button
                key={jf}
                onClick={() => setJobFunction(jf)}
                className="rounded-lg border px-3 py-2 text-sm transition-all"
                style={{
                  borderColor: jobFunction === jf ? '#2563eb' : '#e5e7eb',
                  background: jobFunction === jf ? '#eff6ff' : 'white',
                  color: jobFunction === jf ? '#2563eb' : '#374151',
                  fontWeight: jobFunction === jf ? 600 : 400,
                }}
              >
                {jf}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: 연락처 */}
      {step === 2 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">연락처를 알려주세요</h1>
          <p className="mb-8 text-sm text-neutral-500">
            모임 안내와 매칭 알림을 보내드려요.
            <br />
            프로필에 공개되지 않습니다.
          </p>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">이름 (닉네임)</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="바닥에서 사용할 이름"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">휴대전화 번호 *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="01012345678"
                maxLength={11}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <p className="mt-1 text-[11px] text-neutral-400">모임 확정 시 안내 문자를 보내드려요</p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 rounded-xl border border-neutral-100 bg-neutral-50 p-5">
            <div className="mb-1 text-[10px] font-medium uppercase text-neutral-400">내 프로필 미리보기</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {(displayName || '?').charAt(0)}
              </div>
              <div>
                <div className="font-bold text-neutral-900">{displayName || '이름 없음'}</div>
                <div className="text-xs text-neutral-500">
                  {industry} · {jobFunction}
                  <span className="ml-1 text-neutral-300">
                    ({industryType === 'current' ? '재직' : '희망'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-neutral-100 bg-white px-6 py-4">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-500 hover:bg-neutral-50"
            >
              이전
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-30"
              style={{ background: canNext() ? '#2563eb' : '#d1d5db' }}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || submitting}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-30"
              style={{ background: '#2563eb' }}
            >
              {submitting ? '저장 중...' : '프로필 완성하기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
