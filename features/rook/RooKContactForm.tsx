"use client";

import { useState } from "react";
import Link from "next/link";
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from "@/components/CaptchaWidget";

type Kind = "inquiry" | "rookie";

const COPY: Record<Kind, { formType: string; button: string; done: string; messageLabel: string }> = {
    inquiry: { formType: "rook_inquiry", button: "문의 보내기", done: "문의가 접수되었습니다. 확인 후 이메일로 회신드리겠습니다.", messageLabel: "문의 내용" },
    rookie: { formType: "rook_rookie", button: "RooKie 지원하기", done: "지원이 접수되었습니다. 내부 심사 후 이메일로 연락드리겠습니다.", messageLabel: "관심 분야와 하고 싶은 작업" },
};

const inputCls = "w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-black";

/** RooK 문의·RooKie 지원 — /api/contact (Turnstile, contact_submissions form_type rook_*) */
export function RooKContactForm({ kind }: { kind: Kind }) {
    const copy = COPY[kind];
    const captcha = useCaptcha();
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!captcha.ready) { alert(CAPTCHA_PENDING_MESSAGE); return; }
        setSubmitting(true);
        const body: Record<string, unknown> = { formType: copy.formType, captchaToken: captcha.token ?? "" };
        new FormData(e.currentTarget).forEach((v, k) => { if (typeof v === "string") body[k] = v; });
        try {
            const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            captcha.reset();
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { alert(data.error || "제출에 실패했습니다. 다시 시도해주세요."); return; }
            setDone(true);
        } catch {
            alert("네트워크 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    }

    if (done) return <p className="border border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-700">{copy.done}</p>;

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                    <span className="mb-1 block font-medium">이름 *</span>
                    <input name="name" required maxLength={50} className={inputCls} />
                </label>
                <label className="block text-sm">
                    <span className="mb-1 block font-medium">이메일 *</span>
                    <input name="email" type="email" required maxLength={120} className={inputCls} />
                </label>
                <label className="block text-sm">
                    <span className="mb-1 block font-medium">연락처</span>
                    <input name="phone" maxLength={30} className={inputCls} />
                </label>
                {kind === "inquiry" ? (
                    <label className="block text-sm">
                        <span className="mb-1 block font-medium">회사·브랜드</span>
                        <input name="company" maxLength={80} className={inputCls} />
                    </label>
                ) : (
                    <label className="block text-sm">
                        <span className="mb-1 block font-medium">AI 창작물 링크</span>
                        <input name="portfolioUrl" maxLength={300} placeholder="유튜브·인스타그램·드라이브 등" className={inputCls} />
                    </label>
                )}
            </div>
            <label className="block text-sm">
                <span className="mb-1 block font-medium">{copy.messageLabel} *</span>
                <textarea name="message" required rows={5} maxLength={3000} className={inputCls} />
            </label>
            {/* 개인정보 수집·이용 고지 + 필수 동의 (개인정보보호법 제15조) */}
            <label className="flex items-start gap-2 text-xs leading-relaxed text-neutral-600">
                <input type="checkbox" name="privacyConsent" required className="mt-0.5 shrink-0" />
                <span>
                    [필수] 개인정보 수집·이용에 동의합니다. 수집 항목: 이름·이메일·연락처{kind === "inquiry" ? "·회사" : "·창작물 링크"} ·
                    목적: {kind === "inquiry" ? "문의 확인 및 회신" : "RooKie 심사 및 결과 안내"} · 보관: 처리 완료 후 1년 뒤 파기.
                    동의하지 않으면 접수할 수 없습니다. <Link href="/privacy" className="underline">개인정보처리방침</Link>
                </span>
            </label>
            <CaptchaWidget {...captcha.widgetProps} />
            <button type="submit" disabled={submitting}
                className="w-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:bg-neutral-400 sm:w-auto">
                {submitting ? "보내는 중..." : copy.button}
            </button>
        </form>
    );
}
