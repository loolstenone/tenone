'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from '@/components/CaptchaWidget';

// MADLeague 문의 → /api/contact (Turnstile 서버 검증·service_role 저장) → 인트라 MADLeague 고객 문의 인박스 (form_type madleague_inquiry)
// key = 다른 페이지 버튼에서 /madleague/contact?type={key}로 넘기면 문의 유형이 미리 선택된다
export const MAD_CONTACT_TOPICS = [
  { key: 'corporate', label: '기업 협업 · 과제 제안' },
  { key: 'club-apply', label: '공식 동아리 신청' },
  { key: 'club', label: '동아리 가입 · 운영' },
  { key: 'program', label: '대회 · 프로그램' },
  { key: 'etc', label: '기타' },
] as const;
export type MadContactTopicKey = (typeof MAD_CONTACT_TOPICS)[number]['key'];
const inputCls = 'w-full bg-black border border-neutral-800 px-[14px] py-[10px] text-white outline-none transition focus:border-[#EC1D25] [color-scheme:dark]';

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

export function MadContactForm({ initialTopic }: { initialTopic?: string }) {
  const preset = MAD_CONTACT_TOPICS.find(t => t.key === initialTopic)?.label ?? '';
  const captcha = useCaptcha();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!captcha.ready) { setError(CAPTCHA_PENDING_MESSAGE); return; }
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'madleague_inquiry',
          name: String(fd.get('name') ?? ''),
          email: String(fd.get('email') ?? ''),
          phone: String(fd.get('phone') ?? ''),
          company: String(fd.get('company') ?? ''),
          message: String(fd.get('message') ?? ''),
          extra: { topic: String(fd.get('topic') ?? '') },
          captchaToken: captcha.token ?? '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '제출에 실패했습니다. 다시 시도해주세요.');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '제출에 실패했습니다.');
      captcha.reset();
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-neutral-950 border border-[#EC1D25] p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#EC1D25] mx-auto" />
        <h2 className="mt-6 text-2xl font-black">문의가 접수되었습니다</h2>
        <p className="mt-3 text-sm text-neutral-400">입력하신 이메일로 회신드리겠습니다.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field label="문의 유형" required>
        <select name="topic" required defaultValue={preset} className={inputCls}>
          <option value="" disabled>선택해 주세요</option>
          {MAD_CONTACT_TOPICS.map(t => <option key={t.key} value={t.label}>{t.label}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="이름" required><input name="name" required maxLength={50} className={inputCls} /></Field>
        <Field label="이메일" required><input name="email" type="email" required maxLength={120} className={inputCls} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="연락처"><input name="phone" maxLength={30} inputMode="tel" placeholder="010-0000-0000" className={inputCls} /></Field>
        <Field label="소속 (회사 · 학교 · 동아리)"><input name="company" maxLength={80} className={inputCls} /></Field>
      </div>
      <Field label="문의 내용" required>
        <textarea name="message" required rows={6} maxLength={3000} className={`${inputCls} resize-none`} />
      </Field>

      {/* 개인정보 수집·이용 고지 + 필수 동의 (개인정보보호법 제15조) */}
      <label className="flex items-start gap-3 text-xs text-neutral-400 leading-relaxed">
        <input type="checkbox" name="privacyConsent" required className="mt-0.5 shrink-0 accent-[#EC1D25]" />
        <span>
          [필수] 개인정보 수집·이용에 동의합니다. 수집 항목: 이름·이메일·연락처·소속·문의 내용 ·
          목적: 문의 확인 및 회신 · 보관: 처리 완료 후 1년 뒤 파기.
          동의하지 않으면 문의할 수 없습니다.{' '}
          <Link href="/privacy" className="underline">개인정보처리방침</Link>
        </span>
      </label>

      <CaptchaWidget {...captcha.widgetProps} />

      {error && <div className="bg-red-950 border border-red-900 text-red-200 text-sm px-4 py-3">{error}</div>}

      <button type="submit" disabled={submitting}
        className="w-full bg-[#EC1D25] hover:bg-[#c8161d] disabled:bg-neutral-700 text-white font-bold py-4 transition">
        {submitting ? '보내는 중...' : '문의 보내기'}
      </button>
    </form>
  );
}
