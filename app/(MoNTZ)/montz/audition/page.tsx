"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Megaphone, ChevronDown, ChevronLeft, Loader2, Mail, Send } from "lucide-react";
import { getActiveAuditions, type MontzAudition, type MontzAuditionType } from "@/lib/supabase/montz";
import { createClient } from "@/lib/supabase/client";
import { AuditionApplyModal } from "@/features/montz/AuditionApplyModal";

const ALL_TYPES: MontzAuditionType[] = ["드라마", "영화", "뮤지컬", "모델", "광고", "CF", "기타"];
const TYPE_OPTIONS: MontzAuditionType[] = ALL_TYPES;

const TYPE_STYLE: Record<MontzAuditionType, { bg: string; text: string; dot: string }> = {
    드라마:  { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-400" },
    영화:    { bg: "bg-purple-50",   text: "text-purple-700",  dot: "bg-purple-400" },
    뮤지컬:  { bg: "bg-rose-50",     text: "text-rose-700",    dot: "bg-rose-400" },
    모델:    { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400" },
    광고:    { bg: "bg-orange-50",   text: "text-orange-700",  dot: "bg-orange-400" },
    CF:      { bg: "bg-sky-50",      text: "text-sky-700",     dot: "bg-sky-400" },
    기타:    { bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-400" },
};

function TypeBadge({ type }: { type: MontzAuditionType }) {
    const s = TYPE_STYLE[type] ?? TYPE_STYLE["기타"];
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 whitespace-nowrap ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
            {type}
        </span>
    );
}

// ── 목록 뷰 ─────────────────────────────────────────────────────────────────

function ListView({
    auditions,
    loading,
    onSelect,
    onWrite,
}: {
    auditions: MontzAudition[];
    loading: boolean;
    onSelect: (a: MontzAudition) => void;
    onWrite: () => void;
}) {
    const [activeType, setActiveType] = useState<MontzAuditionType | "전체">("전체");

    const pinned = auditions.filter((a) => a.is_pinned).slice(0, 2);
    const regular = auditions.filter((a) => !a.is_pinned);
    const availableTypes = ALL_TYPES.filter((t) => regular.some((a) => a.type === t));
    const filtered = activeType === "전체" ? regular : regular.filter((a) => a.type === activeType);

    return (
        <div>
            {/* 페이지 헤더 */}
            <div className="px-4 pt-6 pb-4 border-b border-neutral-900">
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase mb-1">Audition</p>
                <div className="flex items-end justify-between">
                    <h1 className="text-[22px] font-black text-neutral-900 leading-none">오디션 공고</h1>
                    <button onClick={onWrite}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-neutral-900 px-3 py-2 hover:opacity-80 transition-opacity">
                        <Megaphone className="h-3.5 w-3.5" />
                        공고 올리기
                    </button>
                </div>
            </div>

            {/* 유형 필터 */}
            <div className="px-4 py-2.5 border-b border-neutral-200 sticky top-[44px] md:top-0 z-10 bg-white">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                    {(["전체", ...availableTypes] as const).map((t) => {
                        const isActive = activeType === t;
                        const s = t !== "전체" ? TYPE_STYLE[t] : null;
                        return (
                            <button key={t} onClick={() => setActiveType(t as MontzAuditionType | "전체")}
                                className={`shrink-0 text-[11px] font-bold px-2.5 py-1 border transition-colors ${
                                    isActive
                                        ? s ? `border-transparent ${s.bg} ${s.text}` : "border-neutral-900 bg-neutral-900 text-white"
                                        : "border-neutral-200 text-neutral-500 hover:border-neutral-700"
                                }`}>
                                {t}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[64px_1fr_60px] px-4 py-2 border-b border-neutral-900 bg-neutral-50">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">유형</span>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">공고</span>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-right">마감</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
            ) : (
                <>
                    {pinned.map((a) => (
                        <button key={a.id} onClick={() => onSelect(a)}
                            className="w-full grid grid-cols-[64px_1fr_60px] items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-amber-50/40 hover:bg-amber-50 transition-colors text-left">
                            <TypeBadge type={a.type} />
                            <div className="min-w-0">
                                <p className="text-[13px] font-black text-neutral-900 truncate leading-snug">
                                    {a.company}
                                    <span className="ml-1.5 text-[9px] font-bold text-amber-600 bg-amber-100 px-1 py-0.5 align-middle">AD</span>
                                </p>
                                <p className="text-[11px] font-bold text-neutral-700 truncate">{a.role}</p>
                            </div>
                            <span className="text-[11px] font-bold text-neutral-900 text-right whitespace-nowrap">{a.deadline}</span>
                        </button>
                    ))}

                    {filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-[13px] text-neutral-500">등록된 공고가 없습니다.</p>
                        </div>
                    ) : filtered.map((a) => (
                        <button key={a.id} onClick={() => onSelect(a)}
                            className="w-full grid grid-cols-[64px_1fr_60px] items-center gap-2 px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors text-left">
                            <TypeBadge type={a.type} />
                            <div className="min-w-0">
                                <p className="text-[13px] font-black text-neutral-900 truncate leading-snug">{a.company}</p>
                                <p className="text-[11px] font-bold text-neutral-700 truncate">{a.role}</p>
                            </div>
                            <span className="text-[11px] font-bold text-neutral-900 text-right whitespace-nowrap">{a.deadline}</span>
                        </button>
                    ))}

                    <p className="text-[11px] text-neutral-400 text-center py-4">
                        총 {filtered.length + pinned.length}건
                    </p>
                </>
            )}
        </div>
    );
}

// ── 상세보기 뷰 ──────────────────────────────────────────────────────────────

function DetailView({ audition, onBack }: { audition: MontzAudition; onBack: () => void }) {
    const s = TYPE_STYLE[audition.type] ?? TYPE_STYLE["기타"];
    const [applyOpen, setApplyOpen] = useState(false);
    return (
        <div>
            {/* 상단 네비 */}
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <button onClick={onBack} className="inline-flex items-center gap-1 text-[12px] font-bold text-neutral-700 hover:text-neutral-900 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    목록
                </button>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Audition</span>
            </div>

            {/* 응시 모달 */}
            <AuditionApplyModal
                isOpen={applyOpen}
                onClose={() => setApplyOpen(false)}
                auditionId={audition.id}
                auditionTitle={`${audition.company} · ${audition.role}`}
            />

            {/* 제목 영역 */}
            <div className="px-4 py-5 border-b border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                    <TypeBadge type={audition.type} />
                    {audition.is_pinned && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5">AD</span>
                    )}
                </div>
                <h2 className="text-[20px] font-black text-neutral-900 leading-tight mb-1">{audition.company}</h2>
                <p className="text-[15px] font-bold text-neutral-900">{audition.role}</p>
            </div>

            {/* 공고 정보 테이블 */}
            <div className="border-b border-neutral-200">
                {[
                    { label: "마감일", value: audition.deadline },
                    ...(audition.pay ? [{ label: "출연료", value: audition.pay }] : []),
                    ...(audition.contact_email ? [{ label: "담당자", value: audition.contact_email }] : []),
                ].map(({ label, value }) => (
                    <div key={label} className="grid grid-cols-[80px_1fr] border-b border-neutral-100 last:border-0">
                        <span className="px-4 py-3 text-[11px] font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-100 flex items-center">{label}</span>
                        <span className="px-4 py-3 text-[13px] font-bold text-neutral-900">{value}</span>
                    </div>
                ))}
            </div>

            {/* 태그 */}
            {audition.tags.length > 0 && (
                <div className="px-4 py-4 border-b border-neutral-200 flex flex-wrap gap-1.5">
                    {audition.tags.map((t) => (
                        <span key={t} className="text-[12px] font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5">#{t}</span>
                    ))}
                </div>
            )}

            {/* 액션 버튼 */}
            <div className="px-4 py-5 space-y-2">
                {/* 응시하기 — 가장 강조 */}
                <button
                    onClick={() => setApplyOpen(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 text-[14px] font-black bg-[#c8a97e] text-neutral-900 hover:bg-[#d4b88c] transition-colors"
                >
                    <Send className="h-4 w-4" />
                    이 공고에 응시하기
                </button>
                {audition.href && (
                    <a href={audition.href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 text-[14px] font-black bg-neutral-900 text-white hover:opacity-80 transition-opacity">
                        <ExternalLink className="h-4 w-4" />
                        공고 원문 보기
                    </a>
                )}
                {audition.contact_email && (
                    <a href={`mailto:${audition.contact_email}`}
                        className="flex items-center justify-center gap-2 w-full py-3 text-[14px] font-black text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors">
                        <Mail className="h-4 w-4" />
                        {audition.contact_email}
                    </a>
                )}
                <button onClick={onBack}
                    className="w-full py-2.5 text-[12px] font-bold text-neutral-500 border border-neutral-200 hover:border-neutral-400 transition-colors">
                    목록으로
                </button>
            </div>
        </div>
    );
}

// ── 글쓰기 뷰 ────────────────────────────────────────────────────────────────

function WriteView({ onBack }: { onBack: () => void }) {
    const [form, setForm] = useState({
        type: "드라마" as MontzAuditionType,
        company: "",
        role: "",
        tags: "",
        deadline: "",
        pay: "",
        href: "",
        contact_email: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.company || !form.role || !form.contact_email) return;
        setSubmitting(true);
        const supabase = createClient();
        await supabase.from("montz_auditions").insert({
            type: form.type,
            company: form.company,
            role: form.role,
            tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
            deadline: form.deadline || "상시",
            pay: form.pay || null,
            href: form.href || null,
            contact_email: form.contact_email,
            is_active: false,
            is_pinned: false,
            sort_order: 99,
        });
        setSubmitting(false);
        setDone(true);
    }

    const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));
    const rowCls = "grid grid-cols-[80px_1fr] border-b border-neutral-100";
    const labelCls = "flex items-center px-4 py-3 bg-neutral-50 border-r border-neutral-100 text-[11px] font-bold text-neutral-700";
    const inputCls = "px-4 py-3 text-[13px] text-neutral-900 bg-white focus:outline-none focus:bg-neutral-50 placeholder:text-neutral-300 w-full";

    if (done) {
        return (
            <div className="px-4 py-16 text-center">
                <p className="text-[40px] mb-3">✓</p>
                <p className="text-[18px] font-black text-neutral-900 mb-1">신청 완료</p>
                <p className="text-[13px] text-neutral-700 mb-8">검토 후 1~2 영업일 내에 게시됩니다.</p>
                <button onClick={onBack}
                    className="text-[13px] font-bold border border-neutral-900 px-6 py-2.5 hover:bg-neutral-900 hover:text-white transition-colors">
                    목록으로
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* 상단 네비 */}
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <button onClick={onBack} className="inline-flex items-center gap-1 text-[12px] font-bold text-neutral-700 hover:text-neutral-900 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    목록
                </button>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">공고 올리기</span>
            </div>

            <div className="px-4 pt-5 pb-2">
                <h2 className="text-[18px] font-black text-neutral-900">공고 등록 신청</h2>
                <p className="text-[12px] text-neutral-500 mt-0.5">검토 후 1~2 영업일 내 게시됩니다.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="border border-neutral-200 mx-4 my-4">
                    <div className={rowCls}>
                        <span className={labelCls}>유형</span>
                        <div className="relative">
                            <select value={form.type} onChange={(e) => set("type", e.target.value)}
                                className={`${inputCls} appearance-none pr-8`}>
                                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className={rowCls}>
                        <span className={labelCls}>기업·제작사<span className="text-red-500 ml-0.5">*</span></span>
                        <input type="text" value={form.company} onChange={(e) => set("company", e.target.value)}
                            placeholder="KBS 드라마국" required className={inputCls} />
                    </div>
                    <div className={rowCls}>
                        <span className={labelCls}>공고 제목<span className="text-red-500 ml-0.5">*</span></span>
                        <input type="text" value={form.role} onChange={(e) => set("role", e.target.value)}
                            placeholder="주인공 상대역 (여, 20대)" required className={inputCls} />
                    </div>
                    <div className={rowCls}>
                        <span className={labelCls}>마감일</span>
                        <input type="text" value={form.deadline} onChange={(e) => set("deadline", e.target.value)}
                            placeholder="2025.08.31 또는 상시" className={inputCls} />
                    </div>
                    <div className={rowCls}>
                        <span className={labelCls}>출연료</span>
                        <input type="text" value={form.pay} onChange={(e) => set("pay", e.target.value)}
                            placeholder="협의, 500만원 이상" className={inputCls} />
                    </div>
                    <div className={rowCls}>
                        <span className={labelCls}>공고 링크</span>
                        <input type="url" value={form.href} onChange={(e) => set("href", e.target.value)}
                            placeholder="https://..." className={inputCls} />
                    </div>
                    <div className={rowCls}>
                        <span className={labelCls}>태그</span>
                        <input type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)}
                            placeholder="드라마, 주연, 정규방송" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-[80px_1fr]">
                        <span className={labelCls}>이메일<span className="text-red-500 ml-0.5">*</span></span>
                        <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)}
                            placeholder="casting@company.com" required className={inputCls} />
                    </div>
                </div>

                <div className="px-4 pb-8 space-y-2">
                    <button type="submit" disabled={submitting}
                        className="w-full py-3 text-[13px] font-black bg-neutral-900 text-white hover:opacity-80 transition-opacity disabled:opacity-50">
                        {submitting
                            ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />신청 중…</span>
                            : "신청하기"}
                    </button>
                    <button type="button" onClick={onBack}
                        className="w-full py-2.5 text-[12px] font-bold text-neutral-500 border border-neutral-200 hover:border-neutral-400 transition-colors">
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────────

type View = { type: "list" } | { type: "detail"; audition: MontzAudition } | { type: "write" };

export default function AuditionPage() {
    const [auditions, setAuditions] = useState<MontzAudition[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>({ type: "list" });

    useEffect(() => {
        getActiveAuditions().then((data) => { setAuditions(data); setLoading(false); });
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {view.type === "list" && (
                <ListView
                    auditions={auditions}
                    loading={loading}
                    onSelect={(a) => setView({ type: "detail", audition: a })}
                    onWrite={() => setView({ type: "write" })}
                />
            )}
            {view.type === "detail" && (
                <DetailView
                    audition={view.audition}
                    onBack={() => setView({ type: "list" })}
                />
            )}
            {view.type === "write" && (
                <WriteView onBack={() => setView({ type: "list" })} />
            )}
            <div className="h-16" />
        </div>
    );
}
