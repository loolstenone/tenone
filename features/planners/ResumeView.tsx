"use client";

// 이력서 빌더 — /myverse/app/personal/resume
// 16개 섹션 선택형 + window.print() A4 문서 출력

import { useEffect, useRef, useState } from "react";
import { Camera, Check, ChevronDown, FileText, Loader2, Plus, Printer, Share2, Trash2, User, X } from "lucide-react";
import type { PlannerIdentity, ResumeData } from "@/lib/myverse/types";
import { IdentitySubNav } from "./IdentitySubNav";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

/* ── 섹션 정의 (16개) ──────────────────────────────────── */
const SECTION_DEFS = [
    { id: "personal",          label: "인적 사항",   required: true  },
    { id: "education",         label: "학력 사항",   required: false },
    { id: "military",          label: "병적 사항",   required: false },
    { id: "career",            label: "경력 사항",   required: false },
    { id: "awards",            label: "수상 경력",   required: false },
    { id: "certifications",    label: "자격증",      required: false },
    { id: "languages",         label: "어학",        required: false },
    { id: "lectures",          label: "강의 경력",   required: false },
    { id: "judging",           label: "심사 경력",   required: false },
    { id: "portfolio",         label: "포트폴리오",  required: false },
    { id: "side_projects",     label: "기타 활동",   required: false },
    { id: "self_introduction", label: "자기소개",    required: false },
    { id: "motivation",        label: "지원 동기",   required: false },
    { id: "competency",        label: "직무 역량",   required: false },
    { id: "aspiration",        label: "입사후 포부", required: false },
    { id: "summary",           label: "요점 정리",   required: false },
] as const;

type SectionId = typeof SECTION_DEFS[number]["id"];
const DEFAULT_ACTIVE: SectionId[] = ["personal", "education", "career", "awards"];

/* ── 사진 리사이즈 ─────────────────────────────────────── */
function resizeResumePhoto(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
            const MAX = 600;
            let w = img.width, h = img.height;
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
            const canvas = document.createElement("canvas");
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas not supported"));
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob(b => b ? resolve(b) : reject(new Error("Blob failed")), "image/webp", 0.85);
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = URL.createObjectURL(file);
    });
}

/* ── 메인 컴포넌트 ─────────────────────────────────────── */
export function ResumeView() {
    const { user } = useAuth();
    const [data, setData] = useState<Partial<PlannerIdentity>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shareToast, setShareToast] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await fetch(`/api/myverse/identity`);
            if (cancelled) return;
            if (res.ok) {
                const d = await res.json();
                setData(d.identity || {});
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, []);

    async function save(patch: Partial<PlannerIdentity>) {
        const next = { ...data, ...patch };
        setData(next);
        setSaving(true);
        try {
            await fetch(`/api/myverse/identity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 md:px-10 py-12">
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            </div>
        );
    }

    const resume: ResumeData = data.resume ?? {};
    const activeSections: SectionId[] = (resume.active_sections as SectionId[]) ?? DEFAULT_ACTIVE;

    function updateResume(patch: Partial<ResumeData>) {
        save({ resume: { ...resume, ...patch } });
    }

    function toggleSection(id: SectionId, required: boolean) {
        if (required) return;
        const next = activeSections.includes(id)
            ? activeSections.filter(s => s !== id)
            : [...activeSections, id];
        updateResume({ active_sections: next });
    }

    function isActive(id: SectionId) {
        return activeSections.includes(id);
    }

    async function handleShare() {
        const url = typeof window !== "undefined" ? window.location.href : "";
        const name = resume.personal?.name_ko || "이력서";
        try {
            if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
                await (navigator as Navigator).share({ title: `${name} 이력서`, text: `${name}님의 이력서`, url });
                return;
            }
        } catch { /* fall through */ }
        try {
            await navigator.clipboard.writeText(url);
            setShareToast("링크가 복사되었습니다");
            setTimeout(() => setShareToast(null), 2000);
        } catch {
            setShareToast("복사 실패");
            setTimeout(() => setShareToast(null), 2000);
        }
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    return (
        <div className="resume-root max-w-4xl mx-auto px-4 md:px-10 py-6 space-y-5">
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 18mm 16mm; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    body, html { background: #fff !important; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif !important; }
                    .resume-no-print { display: none !important; }
                    .resume-root {
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .resume-root > * + * { margin-top: 0 !important; }
                    .resume-section {
                        break-inside: avoid;
                        border: none !important;
                        border-top: 2px solid #111 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        padding: 8px 0 12px !important;
                        margin-bottom: 0 !important;
                        background: #fff !important;
                    }
                    .resume-section-header {
                        border-bottom: none !important;
                        padding-bottom: 5px !important;
                        margin-bottom: 6px !important;
                    }
                    .resume-section-header .badge { display: none; }
                    .resume-section-header h2 {
                        font-size: 10.5pt !important;
                        font-weight: 800 !important;
                        color: #000 !important;
                        letter-spacing: 0.04em !important;
                    }
                    input, textarea, select {
                        border: none !important;
                        background: transparent !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        color: #1a1a1a !important;
                        font-size: 9pt !important;
                        -webkit-appearance: none;
                        appearance: none;
                        resize: none !important;
                        outline: none !important;
                        box-shadow: none !important;
                        border-bottom: none !important;
                        line-height: 1.55 !important;
                    }
                    textarea { height: auto !important; overflow: visible !important; }
                    label {
                        font-size: 7pt !important;
                        color: #666 !important;
                        letter-spacing: 0.06em !important;
                        text-transform: uppercase !important;
                    }
                    .list-item-row {
                        border: none !important;
                        border-bottom: 1px solid #e8e8e8 !important;
                        background: transparent !important;
                        padding: 3px 0 !important;
                    }
                    .resume-auth {
                        break-inside: avoid;
                        margin-top: 30px !important;
                        border-top: 1px solid #999 !important;
                        padding-top: 16px !important;
                        text-align: center !important;
                    }
                    .resume-auth p { font-size: 9.5pt !important; color: #111 !important; line-height: 1.9 !important; }
                    .resume-auth .auth-date { font-size: 9pt !important; color: #444 !important; }
                    .resume-photo img { width: 108px !important; height: 135px !important; object-fit: cover; border: 1px solid #ccc !important; }
                    .add-btn, .remove-btn, .photo-overlay, .photo-actions { display: none !important; }
                    /* 인적 사항 — 웹과 동일한 가로 레이아웃 */
                    .resume-personal-outer {
                        display: flex !important;
                        flex-direction: row !important;
                        gap: 16px !important;
                        align-items: flex-start !important;
                    }
                    .resume-personal-fields {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 8px 16px !important;
                        flex: 1 !important;
                    }
                    .resume-col-full {
                        grid-column: span 2 !important;
                    }
                    /* 병적 사항 — 3열 유지 */
                    .resume-military-fields {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr 1fr !important;
                        gap: 8px 16px !important;
                    }
                    /* 인쇄 전용 제목 */
                    .resume-print-title {
                        display: block !important;
                        text-align: center !important;
                        padding-bottom: 14px !important;
                        margin-bottom: 4px !important;
                        border-bottom: 2px solid #111 !important;
                    }
                    .resume-print-title h1 {
                        font-size: 22pt !important;
                        font-weight: 900 !important;
                        letter-spacing: 0.55em !important;
                        color: #000 !important;
                        margin: 0 !important;
                    }
                    /* 섹션 헤더 — 레터스페이싱 */
                    .resume-section-header h2 {
                        letter-spacing: 0.15em !important;
                    }
                    /* 목록 아이템 내부 그리드 — 2열 복원 */
                    .resume-list-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 3px 12px !important;
                    }
                    /* 경력 사항 — 날짜(좁은 왼쪽) | 내용(오른쪽) */
                    .resume-career-section .resume-list-grid {
                        grid-template-columns: 72pt 1fr !important;
                        gap: 2px 12px !important;
                    }
                    .resume-career-section .resume-list-grid > *:nth-child(n+2) {
                        grid-column: 2 !important;
                        grid-row: auto !important;
                    }
                    .resume-career-section .resume-list-grid > *:first-child {
                        font-size: 8.5pt !important;
                        color: #444 !important;
                        padding-top: 1px !important;
                    }
                    /* 인증 문구 — 우측 정렬 */
                    .resume-auth {
                        text-align: right !important;
                    }
                    .resume-auth p, .resume-auth .auth-date {
                        text-align: right !important;
                    }
                }
            `}</style>

            {/* ── 상단 헤더 ─────────────────────────────── */}
            <div className="resume-no-print">
                <div className="flex items-center gap-3 flex-wrap">
                    <FileText className="h-5 w-5 text-[#6366F1]" />
                    <h1 className="font-serif text-2xl md:text-3xl text-neutral-900 myverse-dark:text-neutral-100">이력서</h1>
                    {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors myverse-dark:border-neutral-700 myverse-dark:text-neutral-300 myverse-dark:hover:bg-neutral-800"
                        >
                            <Printer className="h-3.5 w-3.5" /> PDF 저장
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
                        >
                            <Share2 className="h-3.5 w-3.5" /> 공유
                        </button>
                    </div>
                </div>
                <p className="text-xs text-neutral-500 mt-1.5">
                    구성할 섹션을 선택하고 내용을 작성하세요. PDF 저장으로 문서 이력서를 출력할 수 있습니다.
                </p>
                {shareToast && (
                    <div className="mt-2 inline-block text-xs px-3 py-1.5 bg-neutral-900 text-white rounded">
                        {shareToast}
                    </div>
                )}
            </div>

            <div className="resume-no-print">
                <IdentitySubNav active="resume" />
            </div>

            {/* ── 섹션 선택기 ──────────────────────────── */}
            <div className="resume-no-print">
                {/* 데스크탑: 가로 스크롤 스트립 */}
                <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {SECTION_DEFS.map(s => {
                        const active = isActive(s.id);
                        return (
                            <button
                                key={s.id}
                                onClick={() => toggleSection(s.id, s.required)}
                                disabled={s.required}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                                    active
                                        ? "bg-[#6366F1] text-white"
                                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 myverse-dark:bg-neutral-800 myverse-dark:text-neutral-400 myverse-dark:hover:bg-neutral-700"
                                } ${s.required ? "opacity-70 cursor-default" : "cursor-pointer"}`}
                            >
                                {s.label}
                                {s.required && <span className="ml-1 opacity-60 text-[10px]">필수</span>}
                            </button>
                        );
                    })}
                </div>

                {/* 모바일: 접힘 메뉴 */}
                <div className="md:hidden">
                    <button
                        onClick={() => setMobileOpen(o => !o)}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 myverse-dark:bg-neutral-800 myverse-dark:border-neutral-700 myverse-dark:text-neutral-300"
                    >
                        <span>
                            구성 섹션 선택 <span className="text-neutral-400 text-xs">({activeSections.length}개 선택됨)</span>
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
                    </button>
                    {mobileOpen && (
                        <div className="mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-lg myverse-dark:bg-neutral-800 myverse-dark:border-neutral-700">
                            <div className="flex flex-wrap gap-1.5">
                                {SECTION_DEFS.map(s => {
                                    const active = isActive(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => { toggleSection(s.id, s.required); }}
                                            disabled={s.required}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                                active
                                                    ? "bg-[#6366F1] text-white"
                                                    : "bg-white text-neutral-500 border border-neutral-200 myverse-dark:bg-neutral-700 myverse-dark:border-neutral-600 myverse-dark:text-neutral-300"
                                            } ${s.required ? "opacity-70 cursor-default" : ""}`}
                                        >
                                            {s.label}
                                            {s.required && <span className="ml-1 opacity-60 text-[10px]">필수</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 인쇄 전용 제목 (화면에서는 숨김) ─────── */}
            <div className="resume-print-title hidden">
                <h1>이 력 서</h1>
            </div>

            {/* ── 01 인적 사항 (필수) ──────────────────── */}
            <Section title="인적 사항" icon={<User className="h-3.5 w-3.5 text-[#6366F1]" />}>
                <PersonalBlock
                    value={resume.personal ?? {}}
                    onSave={(p) => updateResume({ personal: p })}
                    userId={user?.id}
                />
            </Section>

            {/* ── 02 학력 사항 ─────────────────────────── */}
            {isActive("education") && (
                <Section title="학력 사항">
                    <ListBlock
                        items={resume.education ?? []}
                        onChange={(arr) => updateResume({ education: arr })}
                        fields={["period", "school", "major", "status"]}
                        placeholders={{ period: "기간", school: "학교명", major: "전공", status: "졸업/재학/석사" }}
                        keyField="school"
                    />
                </Section>
            )}

            {/* ── 03 병적 사항 ─────────────────────────── */}
            {isActive("military") && (
                <Section title="병적 사항">
                    <MilitaryBlock
                        value={resume.military ?? {}}
                        onSave={(m) => updateResume({ military: m })}
                    />
                </Section>
            )}

            {/* ── 04 경력 사항 ─────────────────────────── */}
            {isActive("career") && (
                <Section title="경력 사항" className="resume-career-section">
                    <ListBlock
                        items={resume.career ?? []}
                        onChange={(arr) => updateResume({ career: arr })}
                        fields={["period", "company", "role", "description"]}
                        placeholders={{ period: "기간 (예: 2022.01–현재)", company: "회사명", role: "직책·팀", description: "주요 업무·클라이언트" }}
                        keyField="company"
                        multilineField="description"
                    />
                </Section>
            )}

            {/* ── 05 수상 경력 ─────────────────────────── */}
            {isActive("awards") && (
                <Section title="수상 경력">
                    <ListBlock
                        items={resume.awards ?? []}
                        onChange={(arr) => updateResume({ awards: arr })}
                        fields={["year", "title", "project", "client", "org"]}
                        placeholders={{ year: "년도", title: "수상명", project: "캠페인·작품", client: "클라이언트", org: "주관 기관" }}
                        keyField="title"
                    />
                </Section>
            )}

            {/* ── 06 자격증 ────────────────────────────── */}
            {isActive("certifications") && (
                <Section title="자격증">
                    <ListBlock
                        items={resume.certifications ?? []}
                        onChange={(arr) => updateResume({ certifications: arr })}
                        fields={["name", "issuer", "year"]}
                        placeholders={{ name: "자격증명", issuer: "발행 기관", year: "취득 년도" }}
                        keyField="name"
                    />
                </Section>
            )}

            {/* ── 07 어학 ──────────────────────────────── */}
            {isActive("languages") && (
                <Section title="어학">
                    <ListBlock
                        items={resume.languages ?? []}
                        onChange={(arr) => updateResume({ languages: arr })}
                        fields={["name", "level", "score"]}
                        placeholders={{ name: "언어 (영어, 일어 등)", level: "수준 (비즈니스/생활회화 등)", score: "점수 (TOEIC 900 등)" }}
                        keyField="name"
                    />
                </Section>
            )}

            {/* ── 08 강의 경력 ─────────────────────────── */}
            {isActive("lectures") && (
                <Section title="강의 경력">
                    <ListBlock
                        items={resume.lectures ?? []}
                        onChange={(arr) => updateResume({ lectures: arr })}
                        fields={["year", "org", "topic"]}
                        placeholders={{ year: "년도", org: "기관·학교", topic: "주제·과목" }}
                        keyField="org"
                    />
                </Section>
            )}

            {/* ── 09 심사 경력 ─────────────────────────── */}
            {isActive("judging") && (
                <Section title="심사 경력">
                    <ListBlock
                        items={resume.judging ?? []}
                        onChange={(arr) => updateResume({ judging: arr })}
                        fields={["period", "org", "role"]}
                        placeholders={{ period: "기간", org: "심사 기관", role: "역할·분야" }}
                        keyField="org"
                    />
                </Section>
            )}

            {/* ── 10 포트폴리오 ─────────────────────────── */}
            {isActive("portfolio") && (
                <Section title="포트폴리오">
                    <ListBlock
                        items={resume.portfolio ?? []}
                        onChange={(arr) => updateResume({ portfolio: arr })}
                        fields={["period", "project", "description"]}
                        placeholders={{ period: "기간", project: "프로젝트명", description: "주요 내용·역할·성과" }}
                        keyField="project"
                        multilineField="description"
                    />
                </Section>
            )}

            {/* ── 11 기타 활동 ─────────────────────────── */}
            {isActive("side_projects") && (
                <Section title="기타 활동">
                    <ListBlock
                        items={resume.side_projects ?? []}
                        onChange={(arr) => updateResume({ side_projects: arr })}
                        fields={["status", "period", "name", "description"]}
                        placeholders={{ status: "상태", period: "기간", name: "프로젝트·사이트명", description: "설명·URL" }}
                        keyField="name"
                        multilineField="description"
                        selectField={{ key: "status", options: ["active", "ended"] as const }}
                    />
                </Section>
            )}

            {/* ── 12 자기소개 ──────────────────────────── */}
            {isActive("self_introduction") && (
                <Section title="자기소개">
                    <TextareaSection
                        value={resume.self_introduction ?? ""}
                        onSave={(v) => updateResume({ self_introduction: v })}
                        placeholder="본인의 강점, 경험, 가치관을 중심으로 자유롭게 작성하세요."
                        rows={6}
                    />
                </Section>
            )}

            {/* ── 13 지원 동기 ─────────────────────────── */}
            {isActive("motivation") && (
                <Section title="지원 동기">
                    <TextareaSection
                        value={resume.motivation ?? ""}
                        onSave={(v) => updateResume({ motivation: v })}
                        placeholder="해당 기업·직무에 지원하는 이유를 구체적으로 작성하세요."
                        rows={5}
                    />
                </Section>
            )}

            {/* ── 14 직무 역량 ─────────────────────────── */}
            {isActive("competency") && (
                <Section title="직무 역량">
                    <TextareaSection
                        value={resume.competency ?? ""}
                        onSave={(v) => updateResume({ competency: v })}
                        placeholder="해당 직무에서 발휘할 수 있는 역량과 경험을 작성하세요."
                        rows={5}
                    />
                </Section>
            )}

            {/* ── 15 입사후 포부 ────────────────────────── */}
            {isActive("aspiration") && (
                <Section title="입사후 포부">
                    <TextareaSection
                        value={resume.aspiration ?? ""}
                        onSave={(v) => updateResume({ aspiration: v })}
                        placeholder="입사 후 단기·장기 목표와 기여 방향을 작성하세요."
                        rows={5}
                    />
                </Section>
            )}

            {/* ── 16 요점 정리 ─────────────────────────── */}
            {isActive("summary") && (
                <Section title="요점 정리">
                    <TextareaSection
                        value={resume.summary ?? ""}
                        onSave={(v) => updateResume({ summary: v })}
                        placeholder="이력서 전체를 압축한 핵심 요약을 작성하세요."
                        rows={4}
                    />
                </Section>
            )}

            {/* ── 인증 문구 ─────────────────────────────── */}
            <AuthDeclaration dateStr={todayStr} />
        </div>
    );
}

/* ── 섹션 카드 셸 ─────────────────────────────────────── */
function Section({ title, icon, children, className }: {
    title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
    return (
        <section className={`resume-section bg-white border border-neutral-200 rounded-xl p-5 myverse-dark:bg-neutral-900 myverse-dark:border-neutral-800${className ? ` ${className}` : ""}`}>
            <div className="resume-section-header flex items-center gap-2 mb-4">
                {icon}
                <h2 className="text-sm font-semibold text-neutral-800 myverse-dark:text-neutral-200">{title}</h2>
            </div>
            {children}
        </section>
    );
}

/* ── 텍스트 섹션 (자기소개 등 단순 textarea) ─────────── */
function TextareaSection({ value, onSave, placeholder, rows }: {
    value: string;
    onSave: (v: string) => void;
    placeholder?: string;
    rows?: number;
}) {
    const [v, setV] = useState(value);
    useEffect(() => setV(value), [value]);
    return (
        <textarea
            value={v}
            onChange={(e) => setV(e.target.value)}
            onBlur={() => onSave(v)}
            placeholder={placeholder}
            rows={rows ?? 5}
            className="w-full text-sm text-neutral-800 bg-transparent focus:outline-none resize-none placeholder:text-neutral-300 leading-relaxed myverse-dark:text-neutral-200"
        />
    );
}

/* ── 인증 문구 ────────────────────────────────────────── */
function AuthDeclaration({ dateStr }: { dateStr: string }) {
    return (
        <div className="resume-auth mt-6 pt-5 border-t border-neutral-200 myverse-dark:border-neutral-700 text-center">
            <p className="text-sm text-neutral-600 myverse-dark:text-neutral-400">
                상기 내용은 사실과 다름없음을 증명합니다.
            </p>
            <p className="auth-date text-sm text-neutral-500 myverse-dark:text-neutral-400 mt-2">
                {dateStr}
            </p>
        </div>
    );
}

/* ── 인적 사항 블록 ───────────────────────────────────── */
function PersonalBlock({ value, onSave, userId }: {
    value: NonNullable<ResumeData["personal"]>;
    onSave: (v: NonNullable<ResumeData["personal"]>) => void;
    userId?: string;
}) {
    const [v, setV] = useState(value);
    const [pending, setPending] = useState<{ file: File; previewUrl: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    useEffect(() => setV(value), [value]);
    const update = (k: keyof typeof v, val: string) => setV(prev => ({ ...prev, [k]: val }));
    const commit = () => onSave(v);

    function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPending({ file, previewUrl: URL.createObjectURL(file) });
        if (fileRef.current) fileRef.current.value = "";
    }

    async function confirmPhoto() {
        if (!pending || !userId) return;
        setUploading(true);
        try {
            const supabase = createClient();
            const blob = await resizeResumePhoto(pending.file);
            const path = `resume-photos/${userId}/${Date.now()}.webp`;
            const { error } = await supabase.storage.from("avatars").upload(path, blob, {
                upsert: true, contentType: "image/webp",
            });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
            const next = { ...v, photo_url: publicUrl };
            setV(next);
            onSave(next);
            URL.revokeObjectURL(pending.previewUrl);
            setPending(null);
        } catch (err) {
            console.error("Resume photo upload failed:", err);
        } finally {
            setUploading(false);
        }
    }

    function cancelPhoto() {
        if (pending) URL.revokeObjectURL(pending.previewUrl);
        setPending(null);
    }

    function removePhoto() {
        const next = { ...v, photo_url: undefined };
        setV(next);
        onSave(next);
    }

    const photoSrc = pending?.previewUrl || v.photo_url;

    const F = ({ label, k, placeholder, full }: {
        label: string; k: keyof typeof v; placeholder?: string; full?: boolean;
    }) => (
        <div className={full ? "md:col-span-2 resume-col-full" : ""}>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</label>
            <input
                type="text"
                value={(v[k] as string) ?? ""}
                onChange={(e) => update(k, e.target.value)}
                onBlur={commit}
                placeholder={placeholder}
                className="w-full bg-transparent focus:outline-none border-b border-neutral-200 pb-1.5 text-sm text-neutral-900 placeholder:text-neutral-300 myverse-dark:border-neutral-700 myverse-dark:text-neutral-100"
            />
        </div>
    );

    return (
        <div className="resume-personal-outer flex flex-col md:flex-row gap-6">
            {/* 사진 */}
            <div className="resume-photo shrink-0 flex md:block justify-center">
                <div className="relative w-28 h-36 md:w-32 md:h-40 bg-neutral-100 border border-neutral-200 rounded overflow-hidden group myverse-dark:bg-neutral-800 myverse-dark:border-neutral-700">
                    {photoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoSrc} alt="이력서 사진" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 gap-1">
                            <User className="h-8 w-8" />
                            <span className="text-[10px]">3×4 사진</span>
                        </div>
                    )}
                    {!pending && (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="photo-overlay resume-no-print absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                            aria-label="사진 업로드"
                        >
                            <Camera className="h-5 w-5 text-white" />
                        </button>
                    )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />
                {pending ? (
                    <div className="photo-actions resume-no-print flex gap-1 mt-2 justify-center md:justify-start">
                        <button
                            onClick={confirmPhoto}
                            disabled={uploading}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] bg-[#6366F1] text-white rounded hover:bg-[#4F46E5] disabled:opacity-50"
                        >
                            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            저장
                        </button>
                        <button
                            onClick={cancelPhoto}
                            disabled={uploading}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50"
                        >
                            <X className="h-3 w-3" /> 취소
                        </button>
                    </div>
                ) : v.photo_url ? (
                    <button
                        onClick={removePhoto}
                        className="photo-actions resume-no-print mt-2 text-[11px] text-neutral-400 hover:text-red-500 md:ml-0 ml-3"
                    >
                        사진 삭제
                    </button>
                ) : null}
            </div>

            {/* 필드 */}
            <div className="resume-personal-fields flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <F label="이름 (한글)" k="name_ko" placeholder="홍길동" />
                <F label="이름 (영문)" k="name_en" placeholder="Gildong Hong" />
                <F label="한자" k="name_hanja" placeholder="洪吉童" />
                <F label="생년월일" k="birth" placeholder="1990-01-01" />
                <F label="주소" k="address" placeholder="서울시 마포구…" full />
                <F label="휴대전화" k="phone" placeholder="010-0000-0000" />
                <F label="이메일" k="email" placeholder="you@example.com" />
                <F label="홈페이지" k="homepage" placeholder="https://…" full />
            </div>
        </div>
    );
}

/* ── 병적 사항 블록 ───────────────────────────────────── */
function MilitaryBlock({ value, onSave }: {
    value: NonNullable<ResumeData["military"]>;
    onSave: (v: NonNullable<ResumeData["military"]>) => void;
}) {
    const [v, setV] = useState(value);
    useEffect(() => setV(value), [value]);
    const update = (k: keyof typeof v, val: string) => setV(prev => ({ ...prev, [k]: val }));
    const commit = () => onSave(v);

    return (
        <div className="resume-military-fields grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["period", "status", "notes"] as const).map(k => (
                <Field key={k} label={k === "period" ? "기간" : k === "status" ? "구분" : "비고"}>
                    <input
                        type="text"
                        value={v[k] ?? ""}
                        onChange={(e) => update(k, e.target.value)}
                        onBlur={commit}
                        placeholder={k === "period" ? "1997.07 ~ 1999.08" : k === "status" ? "만기제대 / 면제 / 미필" : "병과·계급 등"}
                        className="w-full bg-transparent focus:outline-none border-b border-neutral-200 pb-1.5 text-sm text-neutral-900 placeholder:text-neutral-300 myverse-dark:border-neutral-700 myverse-dark:text-neutral-100"
                    />
                </Field>
            ))}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</label>
            {children}
        </div>
    );
}

/* ── 반복 항목 블록 ───────────────────────────────────── */
function ListBlock<T extends { id: string; status?: string }>({
    items, onChange, fields, placeholders, keyField, multilineField, selectField,
}: {
    items: T[];
    onChange: (arr: T[]) => void;
    fields: (keyof T)[];
    placeholders: Partial<Record<keyof T, string>>;
    keyField: keyof T;
    multilineField?: keyof T;
    selectField?: { key: keyof T; options: readonly string[] };
}) {
    const [list, setList] = useState<T[]>(items);
    useEffect(() => setList(items), [items]);

    function add() {
        const blank = { id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` } as T;
        const next = [...list, blank];
        setList(next);
        onChange(next);
    }
    function patch(id: string, p: Partial<T>) {
        setList(prev => prev.map(it => it.id === id ? { ...it, ...p } : it));
    }
    function commit() { onChange(list); }
    function remove(id: string) {
        const next = list.filter(it => it.id !== id);
        setList(next);
        onChange(next);
    }

    const inlineFields = fields.filter(f => f !== multilineField);
    const cols = inlineFields.length <= 2 ? "sm:grid-cols-2" : inlineFields.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4";

    return (
        <div>
            <div className="add-btn flex justify-end mb-2 resume-no-print">
                <button onClick={add} className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#6366F1] hover:bg-[#6366F1]/10 rounded transition-colors">
                    <Plus className="h-3 w-3" /> 추가
                </button>
            </div>
            {list.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3 text-center bg-neutral-50 rounded resume-no-print myverse-dark:bg-neutral-800">
                    아직 항목이 없습니다.
                </p>
            ) : (
                <div className="space-y-1.5">
                    {list.map(item => (
                        <div key={item.id} className="list-item-row group bg-neutral-50 rounded-lg px-3 py-2 space-y-1.5 myverse-dark:bg-neutral-800">
                            <div className="flex items-start gap-2">
                                <div className={`resume-list-grid flex-1 grid gap-2 grid-cols-1 ${cols}`}>
                                    {inlineFields.map(f => {
                                        if (selectField && f === selectField.key) {
                                            return (
                                                <select
                                                    key={String(f)}
                                                    value={(item[f] as string) ?? ""}
                                                    onChange={(e) => patch(item.id, { [f]: e.target.value || undefined } as Partial<T>)}
                                                    onBlur={commit}
                                                    className="text-xs bg-white border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none myverse-dark:bg-neutral-700 myverse-dark:border-neutral-600 myverse-dark:text-neutral-300"
                                                >
                                                    <option value="">상태</option>
                                                    {selectField.options.map(o => <option key={o} value={o}>{o === "active" ? "운영 중" : "종료"}</option>)}
                                                </select>
                                            );
                                        }
                                        const isKey = f === keyField;
                                        return (
                                            <input
                                                key={String(f)}
                                                type="text"
                                                value={(item[f] as string) ?? ""}
                                                onChange={(e) => patch(item.id, { [f]: e.target.value } as Partial<T>)}
                                                onBlur={commit}
                                                placeholder={placeholders[f]}
                                                className={`bg-transparent focus:outline-none border-b border-neutral-200 pb-1 text-xs placeholder:text-neutral-300 myverse-dark:border-neutral-600 ${
                                                    isKey ? "font-medium text-neutral-900 myverse-dark:text-neutral-100" : "text-neutral-700 myverse-dark:text-neutral-300"
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => remove(item.id)}
                                    className="remove-btn opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity shrink-0 mt-1 resume-no-print"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            {multilineField && (
                                <textarea
                                    value={(item[multilineField] as string) ?? ""}
                                    onChange={(e) => patch(item.id, { [multilineField]: e.target.value } as Partial<T>)}
                                    onBlur={commit}
                                    placeholder={placeholders[multilineField]}
                                    rows={2}
                                    className="w-full text-xs text-neutral-700 bg-transparent focus:outline-none resize-none border-t border-neutral-200/70 pt-1.5 placeholder:text-neutral-300 myverse-dark:border-neutral-700 myverse-dark:text-neutral-300"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
