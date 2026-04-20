"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2, PenSquare, X, ChevronDown } from "lucide-react";
import { getActiveNotices, type JakkaNotice } from "@/lib/supabase/jakka";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/features/jakka/PageHeader";

type NoticeType = JakkaNotice["type"];

const ALL_TYPES: NoticeType[] = ["채용", "공모전", "파트너", "외주", "인턴", "프로젝트", "공고"];

const TYPE_STYLE: Record<NoticeType, { bg: string; text: string; dot: string }> = {
    채용:     { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400" },
    공모전:   { bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-400" },
    파트너:   { bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-400" },
    외주:     { bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-400" },
    인턴:     { bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-400" },
    프로젝트: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
    공고:     { bg: "bg-neutral-100",text: "text-neutral-600", dot: "bg-neutral-400" },
};

function TypeBadge({ type }: { type: NoticeType }) {
    const s = TYPE_STYLE[type] ?? TYPE_STYLE["공고"];
    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {type}
        </span>
    );
}

function NoticeRow({ notice, pinned }: { notice: JakkaNotice; pinned?: boolean }) {
    const row = (
        <div className={`flex items-start gap-3 px-5 py-4 ${pinned ? "bg-neutral-50" : "hover:bg-neutral-50"} transition-colors`}>
            <div className="pt-0.5 shrink-0">
                <TypeBadge type={notice.type} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[16px] font-black tracking-tight text-neutral-900 leading-tight truncate">
                    {notice.company}
                    {pinned && (
                        <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 align-middle">AD</span>
                    )}
                </p>
                <p className="text-[13px] text-neutral-800 font-bold mt-0.5 truncate">{notice.role}</p>
                {notice.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {notice.tags.map((t) => (
                            <span key={t} className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5">
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1.5 ml-2">
                <span className="text-[12px] font-semibold text-neutral-600">{notice.deadline}</span>
                {notice.href && <ExternalLink className="h-3.5 w-3.5 text-neutral-500" />}
            </div>
        </div>
    );

    if (notice.href) {
        return (
            <a href={notice.href} target="_blank" rel="noopener noreferrer" className="block">
                {row}
            </a>
        );
    }
    return row;
}

const TYPE_OPTIONS: NoticeType[] = ["채용", "공모전", "파트너", "외주", "인턴", "프로젝트", "공고"];

function SubmitModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({
        type: "채용" as NoticeType,
        company: "",
        role: "",
        tags: "",
        deadline: "",
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
        await supabase.from("jakka_notices").insert({
            type: form.type,
            company: form.company,
            role: form.role,
            tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
            deadline: form.deadline || "상시",
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

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-white sm:rounded-t-none rounded-t-2xl max-h-[90vh] overflow-y-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
                    <div>
                        <p className="text-[11px] font-mono text-neutral-600 tracking-widest uppercase">WANTS</p>
                        <p className="text-[15px] font-black text-neutral-900 leading-none mt-0.5">공고 신청</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-neutral-600 hover:text-neutral-900">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {done ? (
                    <div className="px-5 py-12 text-center">
                        <p className="text-[32px] mb-2">✓</p>
                        <p className="text-[16px] font-black text-neutral-900 mb-1">신청이 접수되었습니다</p>
                        <p className="text-[13px] text-neutral-600 mb-6">검토 후 1~2 영업일 내에 게시됩니다.</p>
                        <button
                            onClick={onClose}
                            className="text-[13px] font-bold border border-neutral-900 px-5 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
                        >
                            닫기
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
                        {/* 유형 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">공고 유형</label>
                            <div className="relative">
                                <select
                                    value={form.type}
                                    onChange={(e) => set("type", e.target.value)}
                                    className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] font-semibold appearance-none focus:outline-none focus:border-neutral-500 bg-white pr-8"
                                >
                                    {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
                            </div>
                        </div>

                        {/* 기업명 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">기업 / 기관명 *</label>
                            <input
                                type="text"
                                value={form.company}
                                onChange={(e) => set("company", e.target.value)}
                                placeholder="예: 텐원 스튜디오"
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-500"
                                required
                            />
                        </div>

                        {/* 역할/제목 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">공고 제목 *</label>
                            <input
                                type="text"
                                value={form.role}
                                onChange={(e) => set("role", e.target.value)}
                                placeholder="예: 브랜드 디자이너 채용"
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-500"
                                required
                            />
                        </div>

                        {/* 태그 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">태그 <span className="font-normal normal-case text-neutral-600">(쉼표로 구분)</span></label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) => set("tags", e.target.value)}
                                placeholder="예: 그래픽디자인, 브랜딩, 정규직"
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-500"
                            />
                        </div>

                        {/* 마감일 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">마감일</label>
                            <input
                                type="text"
                                value={form.deadline}
                                onChange={(e) => set("deadline", e.target.value)}
                                placeholder="예: 2025.08.31 또는 상시"
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-500"
                            />
                        </div>

                        {/* 링크 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">공고 링크</label>
                            <input
                                type="url"
                                value={form.href}
                                onChange={(e) => set("href", e.target.value)}
                                placeholder="https://..."
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-500"
                            />
                        </div>

                        {/* 연락처 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">담당자 이메일 *</label>
                            <input
                                type="email"
                                value={form.contact_email}
                                onChange={(e) => set("contact_email", e.target.value)}
                                placeholder="contact@company.com"
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-500"
                                required
                            />
                            <p className="text-[11px] text-neutral-600 mt-1">검토 결과를 이메일로 안내드립니다.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 text-[14px] font-black bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 mt-2"
                        >
                            {submitting ? "신청 중…" : "신청하기"}
                        </button>

                        <p className="text-[11px] text-neutral-600 text-center pb-1">
                            상단 고정 광고 문의: <a href="mailto:hello@tenone.biz" className="underline">hello@tenone.biz</a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function WantsPage() {
    const [notices, setNotices] = useState<JakkaNotice[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<NoticeType | "전체">("전체");
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        getActiveNotices().then((n) => { setNotices(n); setLoading(false); });
    }, []);

    const pinnedNotices = notices.filter((n) => n.is_pinned).slice(0, 2);
    const regularNotices = notices.filter((n) => !n.is_pinned);
    const availableTypes = ALL_TYPES.filter((t) => regularNotices.some((n) => n.type === t));
    const filteredRegular = activeType === "전체" ? regularNotices : regularNotices.filter((n) => n.type === activeType);

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                eyebrow="Wants"
                title="공고"
                subtitle="채용·공모전·파트너십·외주 — 창작자를 찾는 기회들"
                action={(
                    <button
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-neutral-900 border border-neutral-900 px-3 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                        <PenSquare className="h-3.5 w-3.5" />
                        글쓰기
                    </button>
                )}
            />

            {/* 고정 광고 (최대 2개) */}
            {pinnedNotices.length > 0 && (
                <div className="border-b border-neutral-200">
                    {pinnedNotices.map((n) => (
                        <div key={n.id} className="border-b border-neutral-100 last:border-0">
                            <NoticeRow notice={n} pinned />
                        </div>
                    ))}
                </div>
            )}

            {/* 타입 필터 */}
            <div className="sticky top-[44px] md:top-0 z-10 bg-white border-b border-neutral-200 px-5 py-2.5">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                    <button
                        onClick={() => setActiveType("전체")}
                        className={`shrink-0 text-[12px] font-bold px-3 py-1.5 border transition-colors ${
                            activeType === "전체"
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
                        }`}
                    >
                        전체
                    </button>
                    {availableTypes.map((type) => {
                        const s = TYPE_STYLE[type];
                        const isActive = activeType === type;
                        return (
                            <button
                                key={type}
                                onClick={() => setActiveType(type)}
                                className={`shrink-0 text-[12px] font-bold px-3 py-1.5 border transition-colors ${
                                    isActive
                                        ? `border-transparent ${s.bg} ${s.text}`
                                        : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
                                }`}
                            >
                                {type}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 목록 */}
            <div>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
                    </div>
                ) : filteredRegular.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-[14px] text-neutral-600">등록된 공고가 없습니다.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {filteredRegular.map((notice) => (
                            <NoticeRow key={notice.id} notice={notice} />
                        ))}
                    </div>
                )}
            </div>

            {/* 하단 여백 */}
            <div className="h-16" />

            {/* 글쓰기 모달 */}
            {modalOpen && <SubmitModal onClose={() => setModalOpen(false)} />}
        </div>
    );
}
