'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { MadClub } from '@/lib/supabase/madleague';
import { INDUSTRIES as INDUSTRIES_FALLBACK, JOB_FUNCTIONS as JOB_FUNCTIONS_FALLBACK } from '@/lib/badak-constants';

interface Props {
  clubs: MadClub[];
  preselectedClub?: string;
  industries?: string[];
  jobFunctions?: string[];
}

/** 전화번호 자동 포맷: 010-1234-5678 */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function ApplyForm({ clubs, preselectedClub, industries = [...INDUSTRIES_FALLBACK], jobFunctions = [...JOB_FUNCTIONS_FALLBACK] }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [applicantRole, setApplicantRole] = useState<'member' | 'club_leader' | 'mentor' | 'corporate'>('member');

  // 동아리 알파벳순 정렬
  const sortedClubs = [...clubs].sort((a, b) => a.name.localeCompare(b.name, 'en'));

  // 활동 연도: 2021 ~ 현재
  const currentYear = new Date().getFullYear();
  const activityYears = Array.from({ length: currentYear - 2021 + 1 }, (_, i) => currentYear - i);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      applicantRole,
      activityRegion: String(fd.get('activityRegion') ?? ''),
      companyName: String(fd.get('companyName') ?? ''),
      clubSlug: String(fd.get('clubSlug') ?? ''),
      cohort: Number(fd.get('cohort') ?? 0) || undefined,
      activityYear: Number(fd.get('activityYear') ?? 0) || undefined,
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      university: String(fd.get('university') ?? ''),
      major: String(fd.get('major') ?? ''),
      minor: String(fd.get('minor') ?? ''),
      industry: String(fd.get('industry') ?? ''),
      jobFunction: String(fd.get('jobFunction') ?? ''),
      motivation: String(fd.get('motivation') ?? ''),
      portfolioUrl: String(fd.get('portfolioUrl') ?? ''),
    };

    try {
      const res = await fetch('/api/madleague/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'UNKNOWN');
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록 실패');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-neutral-950 border border-[#EC1D25] p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#EC1D25] mx-auto" />
        <h2 className="mt-6 text-2xl font-black">등록이 완료되었습니다</h2>
        <p className="mt-3 text-sm text-neutral-400">
          소속 동아리 운영진이 확인 후 입력하신 이메일로 연락드립니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 신청 유형 */}
      <div>
        <div className="text-xs font-bold tracking-wider text-neutral-400 mb-3">신청 유형 <span className="text-[#EC1D25] ml-1">*</span></div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'member', label: '일반 매드리거', desc: '동아리 구성원으로 참가' },
            { value: 'club_leader', label: '동아리 회장', desc: '동아리 대표로 신청' },
            { value: 'mentor', label: '멘토', desc: '매드리그 멘토로 참여' },
            { value: 'corporate', label: '기업 회원', desc: '경쟁PT 과제기업 / 채용 파트너' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setApplicantRole(opt.value as 'member' | 'club_leader' | 'mentor' | 'corporate')}
              className={`text-left p-4 border transition ${applicantRole === opt.value ? 'border-[#EC1D25] bg-[#EC1D25]/10' : 'border-neutral-800 bg-black hover:border-neutral-600'}`}
            >
              <div className="font-bold text-sm text-white">{opt.label}</div>
              <div className="text-xs text-neutral-500 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {applicantRole === 'mentor' && (
        <Field label="활동 지역" required>
          <select name="activityRegion" required className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:border-[#EC1D25] focus:outline-none" defaultValue="">
            <option value="" disabled>선택하세요</option>
            {['수도권', '강원권', '충청권', '대구/경북권', '부산/경남권', '광주/전라권', '제주권'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>
      )}

      {applicantRole === 'corporate' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="회사명" required>
              <input name="companyName" required className="input" placeholder="(주)텐원" />
            </Field>
            <Field label="담당자명" required>
              <input name="name" required className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="이메일" required>
              <input name="email" type="email" required className="input" />
            </Field>
            <Field label="연락처">
              <input name="phone" type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="010-0000-0000" className="input" />
            </Field>
          </div>
          <Field label="참여 목적">
            <select name="industry" className="input" defaultValue="">
              <option value="">선택</option>
              <option value="경쟁PT 과제기업">경쟁PT 과제기업</option>
              <option value="채용 파트너">채용 파트너</option>
              <option value="스폰서십">스폰서십</option>
              <option value="기타">기타</option>
            </select>
          </Field>
          {/* 기업은 동아리·기수 불필요 — hidden으로 기본값 전달 */}
          <input type="hidden" name="university" value="" />
          <input type="hidden" name="clubSlug" value={sortedClubs[0]?.slug ?? ''} />
        </>
      ) : (
        <>
          <Field label="소속 동아리" required>
            <select name="clubSlug" defaultValue={preselectedClub ?? ''} required className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:border-[#EC1D25] focus:outline-none">
              <option value="" disabled>선택하세요</option>
              {sortedClubs.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name} — {c.region}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="기수" required>
              <input name="cohort" type="number" min={1} max={99} required placeholder="예: 3" className="input" />
            </Field>
            <Field label="매드리그 활동 연도" required>
              <select name="activityYear" required className="input" defaultValue="">
                <option value="" disabled>선택</option>
                {activityYears.map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="이름" required>
              <input name="name" required className="input" />
            </Field>
            <Field label="이메일" required>
              <input name="email" type="email" required className="input" />
            </Field>
            <Field label="연락처">
              <input name="phone" type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="010-0000-0000" className="input" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="소속 대학" required>
              <input name="university" required className="input" />
            </Field>
            <Field label="전공">
              <input name="major" className="input" />
            </Field>
            <Field label="부전공">
              <input name="minor" className="input" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="관심 산업군">
              <select name="industry" className="input" defaultValue="">
                <option value="">선택</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </Field>
            <Field label="관심 직무군">
              <select name="jobFunction" className="input" defaultValue="">
                <option value="">선택</option>
                {jobFunctions.map(jf => (
                  <option key={jf} value={jf}>{jf}</option>
                ))}
              </select>
            </Field>
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-950 border border-red-900 text-red-200 text-sm px-4 py-3">
          등록 실패: {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-700 text-white font-bold py-4 transition"
      >
        {submitting ? '등록 중...' : '등록'}
      </button>

      <style>{`
        .input {
          width: 100%;
          background: #000;
          border: 1px solid #262626;
          padding: 12px 16px;
          color: #fff;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: #EC1D25; }
        select { color-scheme: dark; }
      `}</style>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-bold tracking-wider text-neutral-400 mb-2">
        {label}{required && <span className="text-[#EC1D25] ml-1">*</span>}
      </div>
      {children}
    </label>
  );
}
