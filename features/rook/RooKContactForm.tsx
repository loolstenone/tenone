"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from "@/components/CaptchaWidget";
import { createClient } from "@/lib/supabase/client";
import {
    CONTACT_ATTACHMENT_ACCEPT, CONTACT_ATTACHMENT_BUCKET, CONTACT_ATTACHMENT_GUIDE, validateAttachments,
} from "@/lib/contact-attachments";
import { ROOK_OUTLINE_BUTTON } from "@/features/rook/RooKUI";

type Kind = "inquiry" | "rookie";

/** 원본 rook.co.kr 팝업 폼 그대로: Contact(상담 / 문의) · RooKie 지원 */
const COPY: Record<Kind, { title: string; formType: string; messageLabel: string; done: string; purpose: string; items: string }> = {
    inquiry: {
        title: "Contact", formType: "rook_inquiry", messageLabel: "Question / Request",
        done: "문의가 접수되었습니다. 확인 후 회신드리겠습니다.",
        purpose: "문의 확인 및 회신", items: "이름·연락처·이메일·회사",
    },
    rookie: {
        title: "RooKie 지원", formType: "rook_rookie", messageLabel: "Comment",
        done: "지원이 접수되었습니다. 내부 심사 후 연락드리겠습니다.",
        purpose: "RooKie 심사 및 결과 안내", items: "이름·연락처·이메일·이력서/포트폴리오·참고 URL",
    },
};

const inputCls = "w-full border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-black";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[13px] text-black">{label}{required && <span className="text-[#FF635D]"> *</span>}</span>
            {children}
        </label>
    );
}

function RooKContactForm({ kind, onDone }: { kind: Kind; onDone: () => void }) {
    const copy = COPY[kind];
    const captcha = useCaptcha();
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!captcha.ready) { alert(CAPTCHA_PENDING_MESSAGE); return; }
        const meta = files.map(f => ({ name: f.name, size: f.size, type: f.type }));
        const invalid = validateAttachments(meta);
        if (invalid) { alert(invalid); return; }
        setSubmitting(true);
        const body: Record<string, unknown> = { formType: copy.formType, captchaToken: captcha.token ?? "", attachments: meta };
        new FormData(e.currentTarget).forEach((v, k) => { if (typeof v === "string") body[k] = v; });
        try {
            const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            captcha.reset();
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { alert(data.error || "제출에 실패했습니다. 다시 시도해주세요."); return; }
            // 파일은 서명 업로드 URL로 브라우저가 직접 올림 (/api/contact 규약)
            const uploads: { path: string; token: string }[] = data.uploads ?? [];
            const storage = createClient().storage.from(CONTACT_ATTACHMENT_BUCKET);
            const results = await Promise.all(uploads.map((u, i) =>
                storage.uploadToSignedUrl(u.path, u.token, files[i], { contentType: files[i].type || "application/octet-stream" })));
            const failed = results.filter(r => r.error).length;
            if (failed) alert(`지원은 접수됐지만 첨부파일 ${failed}개를 올리지 못했습니다. Reference URL로 보내 주세요.`);
            setDone(true);
        } catch {
            alert("네트워크 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    }

    if (done) {
        return (
            <div className="py-10 text-center">
                <p className="text-[14px] text-black">{copy.done}</p>
                <button type="button" onClick={onDone} className={`${ROOK_OUTLINE_BUTTON} mt-6`}>닫기</button>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <Field label="Name" required><input name="name" required maxLength={50} className={inputCls} /></Field>
            <Field label="Phone"><input name="phone" maxLength={30} inputMode="tel" className={inputCls} /></Field>
            <Field label="e-mail" required><input name="email" type="email" required maxLength={120} className={inputCls} /></Field>
            {kind === "inquiry" && <Field label="Company"><input name="company" maxLength={80} className={inputCls} /></Field>}
            <Field label={copy.messageLabel} required>
                <textarea name="message" required rows={5} maxLength={3000} className={inputCls} />
            </Field>
            {kind === "rookie" && (
                <>
                    <Field label="Resume & Portfolio">
                        <input type="file" multiple accept={CONTACT_ATTACHMENT_ACCEPT}
                            onChange={e => setFiles(Array.from(e.target.files ?? []))}
                            className="block w-full text-[13px] file:mr-3 file:border file:border-black file:bg-white file:px-3 file:py-1 file:text-[12px]" />
                        <span className="mt-1 block text-[12px] text-black/50">{CONTACT_ATTACHMENT_GUIDE}</span>
                    </Field>
                    <Field label="Reference URL"><input name="portfolioUrl" maxLength={300} className={inputCls} /></Field>
                </>
            )}
            {/* 개인정보 수집·이용 고지 + 필수 동의 (개인정보보호법 제15조) */}
            <label className="flex items-start gap-2 pt-1 text-[12px] leading-relaxed text-black/70">
                <input type="checkbox" name="privacyConsent" required className="mt-0.5 shrink-0" />
                <span>
                    <strong className="text-black">I&apos;m OK!</strong> 개인정보 수집·이용에 동의합니다. 항목: {copy.items} ·
                    목적: {copy.purpose} · 보관: 처리 완료 후 1년 뒤 파기. <Link href="/privacy" className="underline">개인정보처리방침</Link>
                </span>
            </label>
            <CaptchaWidget {...captcha.widgetProps} />
            <div className="pt-2 text-center">
                <button type="submit" disabled={submitting}
                    className="w-full bg-black px-6 py-3 text-[14px] text-white transition-colors hover:bg-neutral-800 disabled:bg-neutral-400">
                    {submitting ? "Sending..." : "Send"}
                </button>
            </div>
        </form>
    );
}

/** 테두리 버튼 + 팝업 폼 (원본 "상담 / 문의" · "RooKie 지원하기") */
export function RooKContactModalButton({ kind, label }: { kind: Kind; label: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={ROOK_OUTLINE_BUTTON}>{label}</button>
            {open && (
                <div className="fixed inset-0 z-[9998] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10" onClick={() => setOpen(false)}>
                    <div role="dialog" aria-modal="true" aria-label={COPY[kind].title}
                        className="relative w-full max-w-[460px] bg-white p-6 md:p-8" onClick={e => e.stopPropagation()}>
                        <button type="button" aria-label="닫기" onClick={() => setOpen(false)} className="absolute right-4 top-4 text-black/60 hover:text-black">
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="mb-6 text-[24px] font-bold text-black">{COPY[kind].title}</h2>
                        <RooKContactForm kind={kind} onDone={() => setOpen(false)} />
                    </div>
                </div>
            )}
        </>
    );
}
