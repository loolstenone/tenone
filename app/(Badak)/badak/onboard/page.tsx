'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { LoginModal } from '@/components/LoginModal';

const TOTAL_STEPS = 5;

const EXPECTATIONS = [
  '취업 준비', '이직 준비', '구인 (채용)', '구직 활동',
  '업무 스킬 향상', '커리어 전환', '창업/사업 준비',
  '사이드 프로젝트', '네트워킹', '업계 정보 교류',
  '파트너/제휴 구하기', '스터디/스킬 교환',
  '사업 투자/펀딩', '멘토링', '프리랜서 전환', '해외 진출',
];

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

  // Form state
  const [expectations, setExpectations] = useState<string[]>([]);
  const [industry, setIndustry] = useState('');
  const [industryType, setIndustryType] = useState<'current' | 'desired'>('current');
  const [jobFunction, setJobFunction] = useState('');
  const [jobFunctionType, setJobFunctionType] = useState<'current' | 'desired'>('current');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Auto-fill from user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
      setEmail(user.email || '');
      // Supabase auth 유저는 이미 이메일 인증됨
      if (user.email) setEmailVerified(true);
    }
  }, [user]);

  const toggleExpectation = (exp: string) => {
    setExpectations((prev) =>
      prev.includes(exp) ? prev.filter((e) => e !== exp) : [...prev, exp]
    );
  };

  const canNext = () => {
    if (step === 0) return true; // 슬로건 — 항상 통과
    if (step === 1) return expectations.length > 0;
    if (step === 2) return industry.length > 0;
    if (step === 3) return jobFunction.length > 0;
    if (step === 4) return phone.trim().length >= 10 && emailVerified;
    return false;
  };

  const handleSendVerification = async () => {
    if (!email.includes('@')) return;
    setVerificationSent(true);
    // 유니버스 가입 시 이미 인증된 경우 스킵
    if (user?.email === email) {
      setEmailVerified(true);
      return;
    }
    // 새 이메일이면 인증 메일 발송 (실제 구현 시 API 호출)
    setEmailVerified(true); // Mock: 바로 인증 처리
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
        expectations,
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
          <div className="mb-6 text-xl font-bold">로그인이 필요합니다</div>
          <button
            onClick={() => setShowLogin(true)}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white"
          >
            로그인하기
          </button>
          <div className="mt-4 text-sm text-neutral-400">
            계정이 없으신가요?{' '}
            <button onClick={() => setShowLogin(true)} className="font-semibold text-blue-600">
              가입하기
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-white px-6 pt-12 pb-32">
      {/* Progress */}
      {step > 0 && (
        <div className="mb-8 flex gap-1">
          {Array.from({ length: TOTAL_STEPS - 1 }, (_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{ background: i < step ? '#2563eb' : '#e5e7eb' }}
            />
          ))}
        </div>
      )}

      {/* ── Step 0: 슬로건 + 태그라인 ── */}
      {step === 0 && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div
            className="mb-3 text-3xl font-black tracking-tight text-neutral-900"
            style={{ letterSpacing: '-0.04em' }}
          >
            Badak
          </div>
          <h1
            className="mb-4 text-xl font-bold leading-relaxed text-neutral-800"
            style={{ letterSpacing: '-0.03em' }}
          >
            지식도 취미도 다 좋은데<br />
            난 좀 더 <span className="text-blue-600">성장</span>하고 싶어
          </h1>
          <p className="mb-2 text-sm text-neutral-500" style={{ letterSpacing: '-0.02em' }}>
            회사 밖에서도 통하는 사람이 되고 싶어.
          </p>
          <p className="text-xs text-neutral-400">
            마케팅·광고 업계 네트워킹 커뮤니티
          </p>
        </div>
      )}

      {/* ── Step 1: 기대하는 것 ── */}
      {step === 1 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">
            바닥에서 뭘 하고 싶으세요?
          </h1>
          <p className="mb-6 text-sm text-neutral-500">복수 선택 가능해요</p>

          <div className="flex flex-wrap gap-2">
            {EXPECTATIONS.map((exp) => {
              const selected = expectations.includes(exp);
              return (
                <button
                  key={exp}
                  onClick={() => toggleExpectation(exp)}
                  className="rounded-lg border px-3.5 py-2.5 text-sm transition-all"
                  style={{
                    borderColor: selected ? '#2563eb' : '#e5e7eb',
                    background: selected ? '#eff6ff' : 'white',
                    color: selected ? '#2563eb' : '#374151',
                    fontWeight: selected ? 600 : 400,
                  }}
                >
                  {exp}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 2: 산업군 ── */}
      {step === 2 && (
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

      {/* ── Step 3: 직무 ── */}
      {step === 3 && (
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

      {/* ── Step 4: 연락처 + 이메일 인증 ── */}
      {step === 4 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">거의 다 됐어요!</h1>
          <p className="mb-8 text-sm text-neutral-500">
            모임 안내와 매칭 알림을 보내드려요. 프로필에 공개되지 않습니다.
          </p>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">닉네임</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="바닥에서 사용할 이름"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">이메일 *</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailVerified(false); setVerificationSent(false); }}
                  placeholder="name@company.com"
                  className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                  readOnly={!!user?.email}
                />
                {emailVerified ? (
                  <div className="flex items-center rounded-xl bg-green-50 px-4 text-xs font-semibold text-green-600">
                    인증됨
                  </div>
                ) : (
                  <button
                    onClick={handleSendVerification}
                    disabled={!email.includes('@') || verificationSent}
                    className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-600 disabled:opacity-40"
                  >
                    {verificationSent ? '전송됨' : '인증하기'}
                  </button>
                )}
              </div>
              {user?.email && (
                <p className="mt-1 text-[11px] text-green-500">유니버스 가입 시 인증된 이메일입니다</p>
              )}
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
                <div className="font-bold text-neutral-900">{displayName || '닉네임 없음'}</div>
                <div className="text-xs text-neutral-500">
                  {industry} · {jobFunction}
                  <span className="ml-1 text-neutral-300">
                    ({industryType === 'current' ? '재직' : '희망'})
                  </span>
                </div>
                {expectations.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {expectations.slice(0, 3).map((e) => (
                      <span key={e} className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-500">{e}</span>
                    ))}
                    {expectations.length > 3 && (
                      <span className="text-[10px] text-neutral-400">+{expectations.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom CTA ── */}
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
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-30"
              style={{ background: canNext() ? '#2563eb' : '#d1d5db' }}
            >
              {step === 0 ? '시작하기' : '다음'}
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
