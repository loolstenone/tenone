'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { MadClub } from '@/lib/supabase/madleague';

interface Props {
  clubs: MadClub[];
  preselectedClub?: string;
}

export function ApplyForm({ clubs, preselectedClub }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      clubSlug: String(fd.get('clubSlug') ?? ''),
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      university: String(fd.get('university') ?? ''),
      major: String(fd.get('major') ?? ''),
      yearInSchool: Number(fd.get('yearInSchool') ?? 0) || undefined,
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
      setError(err instanceof Error ? err.message : '제출 실패');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-neutral-950 border border-[#EC1D25] p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#EC1D25] mx-auto" />
        <h2 className="mt-6 text-2xl font-black">지원서가 접수되었습니다</h2>
        <p className="mt-3 text-sm text-neutral-400">
          해당 동아리 운영진이 서류를 검토한 뒤 입력하신 이메일로 연락드립니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field label="지원 동아리" required>
        <select
          name="clubSlug"
          defaultValue={preselectedClub ?? ''}
          required
          className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:border-[#EC1D25] focus:outline-none"
        >
          <option value="" disabled>선택하세요</option>
          {clubs.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name} — {c.region}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="이름" required>
          <input name="name" required className="input" />
        </Field>
        <Field label="이메일" required>
          <input name="email" type="email" required className="input" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="연락처">
          <input name="phone" placeholder="010-0000-0000" className="input" />
        </Field>
        <Field label="학년">
          <select name="yearInSchool" defaultValue="" className="input">
            <option value="">선택</option>
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
            <option value="4">4학년</option>
            <option value="5">5학년 이상</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="학교" required>
          <input name="university" required className="input" />
        </Field>
        <Field label="전공">
          <input name="major" className="input" />
        </Field>
      </div>

      <Field label="지원 동기">
        <textarea name="motivation" rows={5} className="input resize-none" placeholder="왜 MADLeague에 지원하는지 자유롭게 적어주세요." />
      </Field>

      <Field label="포트폴리오 URL (선택)">
        <input name="portfolioUrl" type="url" placeholder="https://" className="input" />
      </Field>

      {error && (
        <div className="bg-red-950 border border-red-900 text-red-200 text-sm px-4 py-3">
          제출 실패: {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-700 text-white font-bold py-4 transition"
      >
        {submitting ? '제출 중...' : '지원서 제출'}
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
