"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Search, ArrowRight, Layers, Video, Palette, LayoutTemplate,
    MousePointer, Paintbrush, Sparkles, Bot, Smile, Package,
    Camera, Type, Scissors, Diamond, ShoppingBag, Box, Gem,
    BookOpen, Megaphone, ChevronLeft, ChevronRight, Loader2, X, Check
} from "lucide-react";
import { getCreators, type JakkaCreator } from "@/lib/supabase/jakka";

const categories = [
    { id: "전체",          label: "전체",          icon: Layers },
    { id: "영상/모션",     label: "영상/모션",     icon: Video },
    { id: "그래픽 디자인", label: "그래픽 디자인", icon: Palette },
    { id: "브랜딩/편집",   label: "브랜딩/편집",   icon: LayoutTemplate },
    { id: "UI/UX",        label: "UI/UX",         icon: MousePointer },
    { id: "일러스트",      label: "일러스트",       icon: Paintbrush },
    { id: "디지털 아트",   label: "디지털 아트",    icon: Sparkles },
    { id: "AI",           label: "AI",             icon: Bot },
    { id: "캐릭터 디자인", label: "캐릭터 디자인", icon: Smile },
    { id: "제품/패키지",   label: "제품/패키지",   icon: Package },
    { id: "포토그래피",    label: "포토그래피",    icon: Camera },
    { id: "타이포그래피",  label: "타이포그래피",  icon: Type },
    { id: "공예",          label: "공예",           icon: Scissors },
    { id: "파인아트",      label: "파인아트",       icon: Diamond },
    { id: "굿즈",          label: "굿즈",           icon: ShoppingBag },
    { id: "피규어",        label: "피규어",         icon: Box },
    { id: "소품/악세사리", label: "소품/악세사리", icon: Gem },
    { id: "글/소설",       label: "글/소설",        icon: BookOpen },
    { id: "카피/광고",     label: "카피/광고",      icon: Megaphone },
];

const jobAds = [
    {
        id: "job_1",
        company: "카카오",
        logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=80&h=80&fit=crop",
        title: "브랜드 디자이너 채용",
        tags: ["브랜드", "정규직", "서울"],
        url: "#",
    },
    {
        id: "job_2",
        company: "무신사",
        logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop",
        title: "그래픽 디자이너 (패션)",
        tags: ["패키지", "계약직", "성수"],
        url: "#",
    },
    {
        id: "job_3",
        company: "스튜디오 가나",
        logo: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=80&h=80&fit=crop",
        title: "편집 디자이너 모집",
        tags: ["편집디자인", "프리랜서"],
        url: "#",
    },
];

function JobCard({ ad }: { ad: typeof jobAds[0] }) {
    return (
        <a
            href={ad.url}
            className="flex items-center gap-3 px-4 py-4 border-b border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100 transition-colors group"
        >
            <div className="relative w-9 h-9 shrink-0 overflow-hidden bg-neutral-200 rounded-sm">
                <Image src={ad.logo} alt={ad.company} fill className="object-cover" sizes="36px" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-mono text-neutral-300 tracking-widest uppercase">스폰서</span>
                    <span className="text-[9px] text-neutral-300">·</span>
                    <span className="text-[11px] text-neutral-500">{ad.company}</span>
                </div>
                <p className="text-[14px] font-semibold tracking-tight truncate">{ad.title}</p>
                <div className="flex gap-1.5 mt-1">
                    {ad.tags.map((t) => (
                        <span key={t} className="text-[10px] text-neutral-400">#{t}</span>
                    ))}
                </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-600 transition-colors shrink-0" />
        </a>
    );
}

function CreatorRow({
    creator,
    onHover,
}: {
    creator: JakkaCreator;
    onHover: (preview: string | null) => void;
}) {
    const [isHoverDevice, setIsHoverDevice] = useState(true);
    const preview = creator.featured_work?.images?.[0] ?? null;
    const info = [creator.field, creator.year_level, creator.school].filter(Boolean).join(" · ");

    useEffect(() => {
        setIsHoverDevice(window.matchMedia("(hover: hover)").matches);
    }, []);

    return (
        <Link
            href={`/jakka/${creator.handle}`}
            className="group relative flex items-center gap-4 px-5 py-6 border-b border-neutral-100 hover:bg-neutral-50 transition-colors overflow-hidden"
            onMouseEnter={() => preview && onHover(preview)}
            onMouseLeave={() => onHover(null)}
        >
            {/* Mobile peek image */}
            {!isHoverDevice && preview && (
                <div className="md:hidden absolute right-0 top-0 h-full w-[100px] pointer-events-none opacity-40">
                    <Image src={preview} alt="" fill className="object-cover" sizes="100px" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent" />
                </div>
            )}

            <div className="relative z-10 flex-1 min-w-0 pr-24 md:pr-4">
                <div className="flex items-baseline gap-2.5 mb-1">
                    <span className="text-[18px] font-black tracking-tight text-neutral-900">{creator.display_name}</span>
                    <span className="text-[12px] text-neutral-400 font-mono">{creator.handle}</span>
                </div>
                {info && <p className="text-[13px] font-medium text-neutral-600 mb-2.5">{info}</p>}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[11px] font-bold text-neutral-700 border border-neutral-300 px-2 py-0.5">
                        {creator.status}
                    </span>
                    {creator.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[12px] font-semibold text-neutral-400">#{tag}</span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

function AdInquiryBanner() {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ category: "", company: "", name: "", email: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name || !form.email) return;
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formType: "jakka_ad", extra: form.category, ...form }),
            });
            if (!res.ok) throw new Error();
            setDone(true);
        } catch {
            setError("전송에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className="mx-4 my-6 border border-neutral-200 p-4 bg-neutral-50">
                <p className="text-[10px] font-mono text-neutral-400 tracking-[0.2em] uppercase mb-2">채용 공고 · 제휴 광고</p>
                <p className="text-[14px] font-semibold mb-1">자까에서 크리에이터를 채용하세요</p>
                <p className="text-[12px] text-neutral-500 mb-3 leading-relaxed">
                    디자이너, 작가, 아티스트를 찾는 기업과 스튜디오의 공고를 작가 피드에 노출합니다.
                </p>
                <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-900 border border-neutral-900 px-3 py-1.5 hover:bg-neutral-900 hover:text-white transition-colors"
                >
                    문의하기 <ArrowRight className="h-3 w-3" />
                </button>
            </div>

            {open && (
                <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                    <div className="relative w-full max-w-[480px] bg-white rounded-t-2xl md:rounded-2xl shadow-xl p-6 pb-8 md:pb-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase mb-0.5">채용 공고 · 제휴 광고</p>
                                <h3 className="text-[17px] font-bold">문의하기</h3>
                            </div>
                            <button onClick={() => setOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-900">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {done ? (
                            <div className="py-10 flex flex-col items-center gap-3 text-center">
                                <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center">
                                    <Check className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-[15px] font-semibold">문의가 접수됐습니다</p>
                                <p className="text-[13px] text-neutral-500">영업일 기준 1~2일 내로 연락드리겠습니다.</p>
                                <button onClick={() => { setOpen(false); setDone(false); setForm({ category: "", company: "", name: "", email: "", message: "" }); }}
                                    className="mt-2 text-[12px] text-neutral-400 underline">닫기</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-mono text-neutral-400 tracking-widest uppercase block mb-1.5">문의 유형 *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["광고", "제휴", "협업", "채용공고", "기타"].map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, category: opt }))}
                                                className={`px-3 py-1.5 text-[12px] font-medium border transition-colors ${
                                                    form.category === opt
                                                        ? "border-neutral-900 bg-neutral-900 text-white"
                                                        : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-mono text-neutral-400 tracking-widest uppercase block mb-1.5">회사/기관</label>
                                        <input
                                            value={form.company}
                                            onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                                            placeholder="카카오, 스튜디오 가나..."
                                            className="w-full border border-neutral-200 px-3 py-2 text-[14px] focus:outline-none focus:border-neutral-900 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-mono text-neutral-400 tracking-widest uppercase block mb-1.5">담당자 *</label>
                                        <input
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                            placeholder="홍길동"
                                            className="w-full border border-neutral-200 px-3 py-2 text-[14px] focus:outline-none focus:border-neutral-900 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-mono text-neutral-400 tracking-widest uppercase block mb-1.5">이메일 *</label>
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="contact@company.com"
                                        className="w-full border border-neutral-200 px-3 py-2 text-[14px] focus:outline-none focus:border-neutral-900 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-mono text-neutral-400 tracking-widest uppercase block mb-1.5">문의 내용</label>
                                    <textarea
                                        value={form.message}
                                        onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                                        placeholder="공고 종류, 예산, 기간 등 자유롭게 적어주세요"
                                        rows={3}
                                        className="w-full border border-neutral-200 px-3 py-2 text-[14px] focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                                    />
                                </div>
                                {error && <p className="text-[12px] text-red-500">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-neutral-900 text-white text-[13px] font-semibold hover:opacity-80 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    문의 보내기
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default function JakkaExplorePage() {
    const [creators, setCreators] = useState<JakkaCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("전체");
    const [hoveredPreview, setHoveredPreview] = useState<string | null>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getCreators(100).then((data) => {
            setCreators(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    function scrollCategories(dir: "left" | "right") {
        if (!categoryScrollRef.current) return;
        categoryScrollRef.current.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" });
    }

    const filtered = creators.filter((c) => {
        const q = query.toLowerCase();
        const matchQuery =
            !query ||
            c.display_name.toLowerCase().includes(q) ||
            c.handle.toLowerCase().includes(q) ||
            (c.field ?? "").toLowerCase().includes(q) ||
            (c.school ?? "").toLowerCase().includes(q) ||
            c.tags.some((t) => t.toLowerCase().includes(q));
        const matchCategory =
            activeCategory === "전체" || c.tags.includes(activeCategory);
        return matchQuery && matchCategory;
    });

    function buildFeedItems(list: JakkaCreator[]) {
        const items: Array<{ type: "creator"; data: JakkaCreator } | { type: "job"; data: typeof jobAds[0] }> = [];
        let adIndex = 0;
        list.forEach((c, i) => {
            items.push({ type: "creator", data: c });
            if ((i + 1) % 4 === 0 && adIndex < jobAds.length) {
                items.push({ type: "job", data: jobAds[adIndex++] });
            }
        });
        return items;
    }

    const feedItems = buildFeedItems(filtered);


    return (
        <div className="md:flex md:min-h-screen">
            {/* Left: list column */}
            <div className="flex-1 min-w-0">
                {/* Search Bar */}
                <div className="sticky top-[44px] md:top-0 z-10 bg-white px-4 py-3 border-b border-neutral-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 stroke-[1.5]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="이름, 학교, 분야 검색"
                            className="w-full bg-neutral-100 rounded-lg pl-9 pr-4 py-2 text-[14px] outline-none placeholder:text-neutral-500"
                        />
                    </div>
                </div>

                {/* Category filter */}
                <div className="relative border-b border-neutral-100">
                    <button
                        onClick={() => scrollCategories("left")}
                        className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 items-center px-1.5 bg-gradient-to-r from-white via-white/90 to-transparent"
                    >
                        <ChevronLeft className="h-4 w-4 text-neutral-400" />
                    </button>

                    <div
                        ref={categoryScrollRef}
                        className="flex gap-1 px-3 md:px-8 py-3 overflow-x-auto"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px] ${
                                        isActive
                                            ? "text-neutral-900"
                                            : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 transition-all ${isActive ? "stroke-[2]" : "stroke-[1.5]"}`} />
                                    <span className={`text-[10px] whitespace-nowrap leading-tight ${isActive ? "font-semibold text-neutral-900" : ""}`}>
                                        {cat.label}
                                    </span>
                                    {isActive && (
                                        <span className="block w-4 h-[2px] bg-neutral-900 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => scrollCategories("right")}
                        className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 items-center px-1.5 bg-gradient-to-l from-white via-white/90 to-transparent"
                    >
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    </div>
                ) : (
                    <>
                        {feedItems.length > 0 ? (
                            <section>
                                {feedItems.map((item, i) =>
                                    item.type === "creator" ? (
                                        <CreatorRow key={item.data.id} creator={item.data} onHover={setHoveredPreview} />
                                    ) : (
                                        <JobCard key={item.data.id + i} ad={item.data} />
                                    )
                                )}
                            </section>
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-[13px] text-neutral-400">검색 결과가 없습니다</p>
                            </div>
                        )}
                    </>
                )}

                <AdInquiryBanner />
                <div className="pb-16" />
            </div>

            {/* Right: recommendations panel — desktop only */}
            <div className="hidden md:flex w-[300px] xl:w-[340px] shrink-0 flex-col border-l border-neutral-100 sticky top-0 h-screen overflow-y-auto">
                {/* Hover preview strip */}
                {hoveredPreview && (
                    <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0">
                        <Image src={hoveredPreview} alt="" fill className="object-cover" sizes="340px" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <p className="absolute bottom-3 left-4 text-[11px] text-white/70 font-mono tracking-widest uppercase">
                            클릭해서 포트폴리오 보기
                        </p>
                    </div>
                )}

                {/* Recommendations */}
                <div className="px-5 pt-6 pb-4">
                    <p className="text-[11px] font-mono text-neutral-400 tracking-[0.2em] uppercase mb-4">
                        회원님을 위한 자까 추천
                    </p>
                    <div className="space-y-4">
                        {creators.slice(0, 8).map((c) => {
                            const preview = c.featured_work?.images?.[0] ?? null;
                            return (
                                <Link
                                    key={c.id}
                                    href={`/jakka/${c.handle}`}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                                        {preview ? (
                                            <Image src={preview} alt="" fill className="object-cover" sizes="40px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[14px] font-bold text-neutral-400">
                                                {c.display_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold truncate group-hover:underline">{c.display_name}</p>
                                        <p className="text-[11px] text-neutral-400 truncate">{c.field ?? c.handle}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
