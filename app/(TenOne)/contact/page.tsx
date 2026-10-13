"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, MapPin, UserPlus, Briefcase, MessageCircle, Handshake, ArrowRight, CheckCircle, Paperclip, X } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from "@/components/CaptchaWidget";
import { createClient } from "@/lib/supabase/client";
import {
    CONTACT_ATTACHMENT_ACCEPT, CONTACT_ATTACHMENT_BUCKET, CONTACT_ATTACHMENT_GUIDE, CONTACT_ATTACHMENT_MAX_FILES, validateAttachments,
} from "@/lib/contact-attachments";

type TabType = 'partner' | 'business';

function OffOniceToggle() {
    const [isOn, setIsOn] = useState(true);

    return (
        <button
            onClick={() => setIsOn(!isOn)}
            className="relative inline-flex items-center h-8 rounded-full transition-all duration-500 cursor-pointer select-none overflow-hidden"
            style={{
                width: 160,
                background: isOn
                    ? "linear-gradient(135deg, #1a1a1a 0%, #333 100%)"
                    : "linear-gradient(135deg, #e0e0e0 0%, #ccc 100%)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)",
            }}
        >
            {/* 슬라이딩 원 */}
            <div
                className="absolute rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                    width: 24,
                    height: 24,
                    top: 4,
                    left: isOn ? 108 : 4,
                    background: isOn
                        ? "radial-gradient(circle at 35% 35%, #fff 0%, #ddd 60%, #bbb 100%)"
                        : "radial-gradient(circle at 35% 35%, #999 0%, #777 60%, #555 100%)",
                    boxShadow: isOn
                        ? "0 2px 6px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(0,0,0,0.1)"
                        : "0 2px 6px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(0,0,0,0.05)",
                }}
            />
            {/* Offline 텍스트 */}
            <span
                className="absolute text-xs font-bold tracking-wider transition-opacity duration-300"
                style={{
                    left: 12,
                    opacity: isOn ? 0.3 : 0.8,
                    color: isOn ? "#666" : "#444",
                }}
            >
                Offline
            </span>
            {/* Online 텍스트 */}
            <span
                className="absolute text-xs font-bold tracking-wider transition-opacity duration-300"
                style={{
                    left: 58,
                    opacity: isOn ? 1 : 0.3,
                    color: isOn ? "#fff" : "#999",
                }}
            >
                Online
            </span>
        </button>
    );
}

const inputClass = "w-full border tn-border px-4 py-3 text-sm tn-text focus:border-neutral-900 focus:outline-none placeholder:tn-text-sub tn-surface";
const labelClass = "text-sm font-medium text-neutral-700 block mb-1.5";

/** 개인정보 수집·이용 고지 + 필수 동의 (개인정보보호법 제15조) — 보관기간은 개인정보처리방침 기준 */
function PrivacyConsent({ items }: { items: string }) {
    return (
        <label className="flex items-start gap-2 text-xs tn-text-sub leading-relaxed">
            <input type="checkbox" name="privacyConsent" required className="mt-0.5 shrink-0" />
            <span>
                [필수] 개인정보 수집·이용에 동의합니다. 수집 항목: {items} · 목적: 문의 확인 및 회신 ·
                보관: 처리 완료 후 1년 뒤 파기. 동의하지 않으면 접수할 수 없습니다.{" "}
                <Link href="/privacy" className="underline">개인정보처리방침</Link>
            </span>
        </label>
    );
}

function formatSize(bytes: number) {
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/** 첨부파일 선택 — 선택 목록·삭제·용량 안내. 실제 업로드는 제출 시 */
function AttachmentField({ label, files, onChange }: { label: string; files: File[]; onChange: (files: File[]) => void }) {
    const [error, setError] = useState("");
    const add = (picked: FileList | null) => {
        if (!picked?.length) return;
        const next = [...files, ...Array.from(picked)];
        const msg = validateAttachments(next);
        setError(msg ?? "");
        if (!msg) onChange(next);
    };
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <label className={clsx(inputClass, "flex items-center gap-2 cursor-pointer", files.length >= CONTACT_ATTACHMENT_MAX_FILES && "opacity-50 pointer-events-none")}>
                <Paperclip className="h-4 w-4 tn-text-sub" />
                <span className="tn-text-sub">파일 선택</span>
                <input type="file" multiple accept={CONTACT_ATTACHMENT_ACCEPT} className="hidden"
                    onChange={e => { add(e.target.files); e.target.value = ""; }} />
            </label>
            <p className="text-xs tn-text-sub mt-1.5">{CONTACT_ATTACHMENT_GUIDE} · 더 큰 파일은 위 링크로 보내 주세요.</p>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
            {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                    {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 text-sm border tn-border px-3 py-2">
                            <span className="truncate">{f.name} <span className="tn-text-sub text-xs">· {formatSize(f.size)}</span></span>
                            <button type="button" onClick={() => { setError(""); onChange(files.filter((_, j) => j !== i)); }}
                                className="tn-text-sub hover:tn-text shrink-0" aria-label={`${f.name} 삭제`}>
                                <X className="h-4 w-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function ContactPage() {
    return (
        <Suspense fallback={<div className="min-h-screen tn-surface" />}>
            <ContactContent />
        </Suspense>
    );
}

function ContactContent() {
    const [activeTab, setActiveTab] = useState<TabType>('partner');
    const { isAuthenticated } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fromCrew, setFromCrew] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const captcha = useCaptcha();

    // URL ↔ 화면 동기화 — 상단 Contact 메뉴(/contact)로 재진입 시 기본 폼으로
    const fromParam = useSearchParams().get('from');
    useEffect(() => {
        setFromCrew(fromParam === 'crew');
        setSubmitted(false);
        setFiles([]);
    }, [fromParam]);

    const handleSubmit = async (formType: string, form: HTMLFormElement) => {
        if (!captcha.ready) { alert(CAPTCHA_PENDING_MESSAGE); return; }
        setSubmitting(true);
        const fd = new FormData(form);
        const body: Record<string, unknown> = {
            formType, captchaToken: captcha.token ?? '',
            attachments: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        };
        fd.forEach((v, k) => { if (typeof v === 'string') body[k] = v; });
        try {
            const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            captcha.reset();
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { alert(data.error || '제출에 실패했습니다. 다시 시도해주세요.'); setSubmitting(false); return; }

            // 접수 후 첨부 업로드 (서명 URL로 Storage 직접) — 실패해도 문의 자체는 접수됨
            const uploads: { path: string; token: string }[] = data.uploads ?? [];
            const storage = createClient().storage.from(CONTACT_ATTACHMENT_BUCKET);
            const results = await Promise.all(uploads.map((u, i) =>
                storage.uploadToSignedUrl(u.path, u.token, files[i], { contentType: files[i].type || 'application/octet-stream' })));
            const failed = results.filter(r => r.error).length;
            if (failed) alert(`문의는 접수됐지만 첨부파일 ${failed}개를 올리지 못했습니다. 링크로 보내 주시거나 lools@tenone.biz로 보내 주세요.`);
            setFiles([]);
            setSubmitted(true);
        } catch { alert('네트워크 오류가 발생했습니다.'); }
        setSubmitting(false);
    };

    return (
        <div className="tn-surface tn-text">
            {/* Hero */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Contact</p>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-light leading-tight">
                        함께 <span className="font-bold">시작하기</span>
                    </h1>
                    <div className="mt-6 text-lg tn-text-sub max-w-2xl space-y-1">
                        <p>Ten:One™ Universe는 언제나 열려있습니다.</p>
                        <p>새로운 동료가 되거나, 프로젝트를 의뢰해주세요.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 pb-32 grid lg:grid-cols-12 gap-8 md:gap-16">
                {/* Left — Contact Info */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="border tn-border p-6">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-medium mb-4" style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>C</div>
                        <h3 className="text-lg font-bold">전천일 <span className="tn-text-sub font-normal text-sm">Cheonil Jeon</span></h3>
                        <p className="text-sm tn-text-sub mt-1">Founder / Value Connector</p>
                        <p className="text-sm tn-text-sub mt-4">Planning, Business, Marketing, Advertising, Communication, HR</p>

                        <div className="mt-6 space-y-3">
                            <a href="mailto:lools@tenone.biz" className="flex items-center gap-3 text-sm tn-text-sub hover:tn-text transition-colors">
                                <Mail className="h-4 w-4 tn-text-sub" /> lools@tenone.biz
                            </a>
                            <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sm tn-text-sub hover:tn-text transition-colors">
                                <MessageCircle className="h-4 w-4 tn-text-sub" /> Kakao Open Chat
                            </a>
                        </div>
                    </div>

                    <div className="border tn-border p-6">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 tn-text-sub mt-0.5" />
                            <div>
                                <OffOniceToggle />
                                <p className="text-sm tn-text-sub mt-1">tenone.biz</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Forms */}
                <div className="lg:col-span-8">
                    {/* Tabs */}
                    <div className="flex border-b tn-border mb-8">
                        <button onClick={() => { setActiveTab('partner'); setFiles([]); }}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-colors border-b-2",
                                activeTab === 'partner' ? "border-neutral-900 tn-text font-medium" : "border-transparent tn-text-sub hover:text-neutral-700"
                            )}>
                            <Handshake className="h-4 w-4" /> 파트너 신청
                        </button>
                        <button onClick={() => { setActiveTab('business'); setFiles([]); }}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-colors border-b-2",
                                activeTab === 'business' ? "border-neutral-900 tn-text font-medium" : "border-transparent tn-text-sub hover:text-neutral-700"
                            )}>
                            <Briefcase className="h-4 w-4" /> 프로젝트 의뢰
                        </button>
                    </div>

                    {submitted && (
                        <div className="py-16 text-center">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--tn-accent)" }} />
                            <h3 className="text-xl font-bold mb-2">제출 완료!</h3>
                            <p className="tn-text-sub">빠른 시간 내에 연락드리겠습니다.</p>
                            <button onClick={() => setSubmitted(false)} className="mt-6 text-sm tn-text-sub hover:tn-text underline">다른 문의하기</button>
                        </div>
                    )}

                    {/* 파트너 신청 */}
                    {!submitted && activeTab === 'partner' && (
                        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSubmit(fromCrew ? 'tenone_crew' : 'tenone_partner', e.currentTarget); }}>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">{fromCrew ? 'Join the Crew' : 'Partner with Us'}</h3>
                                <p className="text-sm tn-text-sub mt-1">
                                    {fromCrew
                                        ? 'Ten:One™ Universe 크루로 합류하세요. 실전 프로젝트에 참여하고 함께 성장합니다.'
                                        : 'Ten:One™의 파트너가 되어 함께 문제를 해결해요.'}
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div><label className={labelClass}>이름</label><input name="name" type="text" required className={inputClass} placeholder="홍길동" /></div>
                                <div><label className={labelClass}>이메일</label><input name="email" type="email" required className={inputClass} placeholder="hello@example.com" /></div>
                            </div>
                            <div>
                                <label className={labelClass}>지원 분야</label>
                                <select name="company" className={inputClass}>
                                    <option>기획자 (Planner)</option>
                                    <option>디자이너 (Designer)</option>
                                    <option>개발자 (Developer)</option>
                                    <option>마케터 (Marketer)</option>
                                    <option>크리에이터 (Creator)</option>
                                    <option>기타 (Other)</option>
                                </select>
                            </div>
                            <div><label className={labelClass}>포트폴리오/이력서 링크</label><input name="portfolioUrl" type="text" inputMode="url" className={inputClass} placeholder="notion.so/... · 구글 드라이브 · 비핸스 등 (https:// 없이 입력 가능)" /></div>
                            <AttachmentField label="포트폴리오/이력서 파일" files={files} onChange={setFiles} />
                            <div><label className={labelClass}>자기소개 및 지원동기</label><textarea name="message" rows={5} className={inputClass + " resize-none"} placeholder="간단한 자기소개와 함께하고 싶은 이유를 자유롭게 적어주세요." /></div>
                            <PrivacyConsent items="이름, 이메일, 지원 분야, 포트폴리오 링크·첨부파일, 자기소개" />
                            <CaptchaWidget {...captcha.widgetProps} />
                            <button type="submit" disabled={submitting} className="w-full py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                <Handshake className="h-4 w-4" /> {submitting ? '제출 중...' : (fromCrew ? '크루 지원하기' : '파트너 신청하기')}
                            </button>
                        </form>
                    )}

                    {/* 프로젝트 의뢰 */}
                    {!submitted && activeTab === 'business' && (
                        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSubmit('tenone_business', e.currentTarget); }}>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Business Inquiry</h3>
                                <p className="text-sm tn-text-sub mt-1">프로젝트 의뢰 및 파트너십 제안을 보내주세요.</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div><label className={labelClass}>담당자명</label><input name="name" type="text" required className={inputClass} placeholder="홍길동 팀장" /></div>
                                <div><label className={labelClass}>회사/단체명</label><input name="company" type="text" className={inputClass} placeholder="회사명" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div><label className={labelClass}>이메일</label><input name="email" type="email" required className={inputClass} placeholder="work@company.com" /></div>
                                <div><label className={labelClass}>연락처</label><input name="phone" type="tel" className={inputClass} placeholder="010-0000-0000" /></div>
                            </div>
                            <div>
                                <label className={labelClass}>의뢰 분야</label>
                                <select name="extra" className={inputClass}>
                                    <option>브랜딩/디자인</option>
                                    <option>마케팅/광고</option>
                                    <option>콘텐츠 제작</option>
                                    <option>IT/개발</option>
                                    <option>기타 파트너십</option>
                                </select>
                            </div>
                            <div><label className={labelClass}>프로젝트 내용</label><textarea name="message" rows={5} className={inputClass + " resize-none"} placeholder="프로젝트의 목적, 예산, 일정 등 구체적인 내용을 적어주세요." /></div>
                            <AttachmentField label="제안요청서·참고자료 (선택)" files={files} onChange={setFiles} />
                            <PrivacyConsent items="담당자명, 회사명, 이메일, 연락처, 문의 내용, 첨부파일" />
                            <CaptchaWidget {...captcha.widgetProps} />
                            <button type="submit" disabled={submitting} className="w-full py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                <Briefcase className="h-4 w-4" /> {submitting ? '제출 중...' : '의뢰하기'}
                            </button>
                        </form>
                    )}

                </div>
            </section>
        </div>
    );
}
