'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const INTEREST_OPTIONS = ['마케팅', '광고 기획', '크리에이티브', '브랜딩', '디지털·퍼포먼스', '데이터·그로스', 'PR·커뮤니케이션', '기타'];
const inputCls = 'w-full bg-black border border-neutral-800 px-4 py-3 text-white outline-none transition focus:border-[#FFC000]';

export function HeroForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  function toggleInterest(value: string) {
    setInterests((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      interests,
      resumeUrl: String(fd.get('resumeUrl') ?? ''),
      portfolioUrl: String(fd.get('portfolioUrl') ?? ''),
      message: String(fd.get('message') ?? ''),
    };
    try {
      const res = await fetch('/api/madleague/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'UNKNOWN');
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
      <div className="bg-neutral-950 border border-[#FFC000] p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#FFC000] mx-auto" />
        <h2 className="mt-6 text-2xl font-black">신청이 접수되었습니다</h2>
        <p className="mt-3 text-sm text-neutral-400">
          입력하신 이메일로 커리어 코치가 연락드립니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="이름" required>
          <input name="name" required className={inputCls} />
        </Field>
        <Field label="이메일" required>
          <input name="email" type="email" required className={inputCls} />
        </Field>
      </div>
      <Field label="연락처">
        <input name="phone" placeholder="010-0000-0000" className={inputCls} />
      </Field>

      <Field label="관심 분야 (복수 선택)">
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleInterest(opt)}
              className={`text-xs font-bold px-3 py-2 border transition ${
                interests.includes(opt)
                  ? 'bg-[#FFC000] border-[#FFC000] text-black'
                  : 'bg-black border-neutral-800 text-neutral-400 hover:border-[#FFC000]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>

      <Field label="이력서 URL">
        <input name="resumeUrl" type="url" placeholder="https://" className={inputCls} />
      </Field>
      <Field label="포트폴리오 URL">
        <input name="portfolioUrl" type="url" placeholder="https://" className={inputCls} />
      </Field>
      <Field label="하고 싶은 말">
        <textarea name="message" rows={4} className={`${inputCls} resize-none`} placeholder="커리어 고민, 희망 업계, 특이사항 등." />
      </Field>

      {error && (
        <div className="bg-red-950 border border-red-900 text-red-200 text-sm px-4 py-3">
          제출 실패: {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#FFC000] hover:bg-[#e5ad00] disabled:bg-neutral-700 text-black font-bold py-4 transition"
      >
        {submitting ? '제출 중...' : 'HeRo 신청하기'}
      </button>

    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-bold tracking-wider text-neutral-400 mb-2">
        {label}{required && <span className="text-[#FFC000] ml-1">*</span>}
      </div>
      {children}
    </label>
  );
}
