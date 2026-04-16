'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { MadClub } from '@/lib/supabase/madleague';
import { INDUSTRIES, JOB_FUNCTIONS } from '@/lib/badak-constants';

interface Props {
  clubs: MadClub[];
  preselectedClub?: string;
}

/** 전화번호 자동 포맷: 010-1234-5678 */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function ApplyForm({ clubs, preselectedClub }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');

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
      <Field label="소속 동아리" required>
        <select
          name="clubSlug"
          defaultValue={preselectedClub ?? ''}
          required
          className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:border-[#EC1D25] focus:outline-none"
        >
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
          <input
            name="phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            className="input"
          />
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
            {INDUSTRIES.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </Field>
        <Field label="관심 직무군">
          <select name="jobFunction" className="input" defaultValue="">
            <option value="">선택</option>
            {JOB_FUNCTIONS.map(jf => (
              <option key={jf} value={jf}>{jf}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="자기 소개">
        <textarea name="motivation" rows={5} className="input resize-none" placeholder="자유롭게 자신을 소개해주세요." />
      </Field>

      <Field label="포트폴리오/활동 URL (선택)">
        <input name="portfolioUrl" type="url" placeholder="https://" className="input" />
      </Field>

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
