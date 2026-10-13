'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Paperclip, X } from 'lucide-react';
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from '@/components/CaptchaWidget';
import { createClient } from '@/lib/supabase/client';
import {
  CONTACT_ATTACHMENT_ACCEPT, CONTACT_ATTACHMENT_BUCKET, CONTACT_ATTACHMENT_GUIDE, CONTACT_ATTACHMENT_MAX_FILES, validateAttachments,
} from '@/lib/contact-attachments';

// MADLeague 문의 → /api/contact (Turnstile 서버 검증·service_role 저장) → 인트라 MADLeague 고객 문의 인박스 (form_type madleague_inquiry)
// key = 다른 페이지 버튼에서 /madleague/contact?type={key}로 넘기면 문의 유형이 미리 선택된다
// 2026-10-11 고도화: 유형마다 (1) 소속 라벨 (2) 문의 내용 질문 템플릿 — 유형을 고르면 채워짐 (3) 첨부 안내(과업 소개서·제안서·동아리 소개서 등) + 파일 최대 3개·참고 링크
export const MAD_CONTACT_TOPICS = [
  {
    key: 'corporate', label: '기업 협업 · 과제 제안',
    org: '회사 · 브랜드명', orgRequired: true,
    attach: '과업 소개서 · 제안서 · 회사 소개서',
    template: [
      '■ 회사 · 브랜드 간단 소개', '',
      '■ 과제(과업) 개요 — 목적 · 범위 · 기간', '',
      '■ 제안 · 요청 사항 — 원하는 협업 형태(경쟁 PT · PJT · 특강 등) · 예산 유무', '',
      '■ 희망 일정',
    ],
  },
  {
    key: 'club-apply', label: '공식 동아리 신청',
    org: '동아리명 (학교)', orgRequired: true,
    attach: '동아리 소개서 · 활동 자료',
    template: [
      '■ 동아리 소개 — 학교 · 창립 연도 · 인원', '',
      '■ 주요 활동 — 최근 1년 (프로젝트 · 공모전 · 스터디)', '',
      '■ 신청 이유 · MADLeague에서 기대하는 것', '',
      '■ 대표(회장) 이름 · 연락 가능한 시간',
    ],
  },
  {
    key: 'club', label: '동아리 가입 · 운영',
    org: '학교 · 소속 동아리', orgRequired: false,
    attach: '참고 자료 (선택)',
    template: ['■ 관심 있는 동아리 / 현재 소속', '', '■ 문의 내용'],
  },
  {
    key: 'program', label: '대회 · 프로그램',
    org: '학교 · 소속', orgRequired: false,
    attach: '참고 자료 (선택)',
    template: ['■ 프로그램명 (경쟁 PT · 크리에이지 · DAM 파티 …)', '', '■ 문의 내용'],
  },
  {
    key: 'etc', label: '기타',
    org: '소속 (회사 · 학교 · 동아리)', orgRequired: false,
    attach: '참고 자료 (선택)',
    template: [],
  },
] as const;
export type MadContactTopicKey = (typeof MAD_CONTACT_TOPICS)[number]['key'];
type Topic = (typeof MAD_CONTACT_TOPICS)[number];

const inputCls = 'w-full bg-black border border-neutral-800 px-[14px] py-[10px] text-white outline-none transition focus:border-[#EC1D25] [color-scheme:dark]';
const templateText = (t?: Topic) => (t ? t.template.join('\n') : '');

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-bold tracking-wider text-neutral-400 mb-2">
        {label}{required && <span className="text-[#EC1D25] ml-1">*</span>}
        {hint && <span className="ml-2 font-normal normal-case tracking-normal text-neutral-500">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function fmtSize(n: number) { return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.ceil(n / 1024)}KB`; }

export function MadContactForm({ initialTopic }: { initialTopic?: string }) {
  const initial = MAD_CONTACT_TOPICS.find(t => t.key === initialTopic);
  const captcha = useCaptcha();
  const [topicKey, setTopicKey] = useState<string>(initial?.key ?? '');
  const [message, setMessage] = useState(templateText(initial));
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const topic = MAD_CONTACT_TOPICS.find(t => t.key === topicKey);

  // 유형을 바꾸면 질문 템플릿을 채운다 — 사용자가 이미 쓴 내용은 덮어쓰지 않는다 (비어 있거나 이전 템플릿 그대로일 때만)
  function changeTopic(nextKey: string) {
    const prev = templateText(topic);
    const next = templateText(MAD_CONTACT_TOPICS.find(t => t.key === nextKey));
    if (message.trim() === '' || message === prev) setMessage(next);
    setTopicKey(nextKey);
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const merged = [...files, ...Array.from(list)].slice(0, CONTACT_ATTACHMENT_MAX_FILES);
    const invalid = validateAttachments(merged.map(f => ({ name: f.name, size: f.size, type: f.type })));
    if (invalid) { setError(invalid); return; }
    setError(null);
    setFiles(merged);
    if (fileInput.current) fileInput.current.value = '';
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!captcha.ready) { setError(CAPTCHA_PENDING_MESSAGE); return; }
    if (!topic) { setError('문의 유형을 선택해 주세요.'); return; }
    // 템플릿 제목만 남기고 아무것도 안 쓴 경우
    if (message.replace(/■[^\n]*/g, '').trim() === '') { setError('문의 내용을 입력해 주세요.'); return; }
    const meta = files.map(f => ({ name: f.name, size: f.size, type: f.type }));
    const invalid = validateAttachments(meta);
    if (invalid) { setError(invalid); return; }
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
          message,
          portfolioUrl: String(fd.get('portfolioUrl') ?? ''),
          attachments: meta,
          extra: { topic: topic.label, topic_key: topic.key },
          captchaToken: captcha.token ?? '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '제출에 실패했습니다. 다시 시도해주세요.');
      // 파일은 서명 업로드 URL로 브라우저가 Storage에 직접 올림 (/api/contact 규약 — Vercel 요청 한도 회피)
      const uploads: { path: string; token: string }[] = data.uploads ?? [];
      if (uploads.length) {
        const storage = createClient().storage.from(CONTACT_ATTACHMENT_BUCKET);
        const results = await Promise.all(uploads.map((u, i) =>
          storage.uploadToSignedUrl(u.path, u.token, files[i], { contentType: files[i].type || 'application/octet-stream' })));
        const failed = results.filter(r => r.error).length;
        if (failed) setError(`문의는 접수됐지만 첨부파일 ${failed}개를 올리지 못했습니다. 회신 메일에 답장으로 보내 주세요.`);
      }
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
        <h2 className="mt-6 text-2xl font-bold">문의가 접수되었습니다</h2>
        <p className="mt-3 text-sm text-neutral-400">입력하신 이메일로 회신드리겠습니다.</p>
        {error && <p className="mt-4 text-sm text-neutral-300">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field label="문의 유형" required>
        <select name="topic" required value={topicKey} onChange={e => changeTopic(e.target.value)} className={inputCls}>
          <option value="" disabled>선택해 주세요</option>
          {MAD_CONTACT_TOPICS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="이름" required><input name="name" required maxLength={50} className={inputCls} /></Field>
        <Field label="이메일" required><input name="email" type="email" required maxLength={120} className={inputCls} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="연락처"><input name="phone" maxLength={30} inputMode="tel" placeholder="010-0000-0000" className={inputCls} /></Field>
        <Field label={topic?.org ?? '소속 (회사 · 학교 · 동아리)'} required={topic?.orgRequired}>
          <input name="company" required={topic?.orgRequired} maxLength={80} className={inputCls} />
        </Field>
      </div>
      <Field label="문의 내용" required hint={topic && topic.template.length ? '항목에 맞춰 적어 주세요. 해당 없는 항목은 비워도 됩니다.' : undefined}>
        <textarea name="message" required rows={topic && topic.template.length ? 12 : 6} maxLength={3000}
          value={message} onChange={e => setMessage(e.target.value)}
          placeholder={topic ? undefined : '문의 유형을 고르면 질문 항목이 채워집니다.'}
          className={`${inputCls} resize-y leading-relaxed`} />
      </Field>

      {/* 첨부 — 유형별 안내 문구. 파일은 비공개 버킷, 인트라 담당자만 내려받는다 */}
      <Field label={`첨부파일 — ${topic?.attach ?? '참고 자료 (선택)'}`} hint={CONTACT_ATTACHMENT_GUIDE}>
        <div className="border border-neutral-800 bg-black">
          {files.length > 0 && (
            <ul className="divide-y divide-neutral-900">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-[14px] py-2 text-sm">
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="shrink-0 text-xs text-neutral-500">{fmtSize(f.size)}</span>
                  <button type="button" aria-label="첨부 삭제" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="shrink-0 p-1 text-neutral-500 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ul>
          )}
          {files.length < CONTACT_ATTACHMENT_MAX_FILES && (
            <label className="flex cursor-pointer items-center gap-2 px-[14px] py-[10px] text-sm text-neutral-400 hover:text-white">
              <Paperclip className="h-4 w-4" /> 파일 선택 ({files.length}/{CONTACT_ATTACHMENT_MAX_FILES})
              <input ref={fileInput} type="file" multiple accept={CONTACT_ATTACHMENT_ACCEPT} className="hidden" onChange={e => addFiles(e.target.files)} />
            </label>
          )}
        </div>
      </Field>
      <Field label="참고 링크" hint="회사 소개 · 제안서 · 동아리 SNS 등 (선택)">
        <input name="portfolioUrl" maxLength={300} placeholder="https://" className={inputCls} />
      </Field>

      {/* 개인정보 수집·이용 고지 + 필수 동의 (개인정보보호법 제15조) */}
      <label className="flex items-start gap-3 text-xs text-neutral-400 leading-relaxed">
        <input type="checkbox" name="privacyConsent" required className="mt-0.5 shrink-0 accent-[#EC1D25]" />
        <span>
          [필수] 개인정보 수집·이용에 동의합니다. 수집 항목: 이름·이메일·연락처·소속·문의 내용·첨부파일 ·
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
