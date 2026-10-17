import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/features/planners/pad/ProductCard";
import { ProgressiveProductGrid } from "@/features/planners/pad/ProgressiveProductGrid";
import { listPlannersFiles, PAD_CATEGORIES, PAD_CATEGORY_DESC, sortFiles, type PadSort } from "@/lib/planners/library";
import { reviewCountsByFile } from "@/lib/planners/reviews";
import { listActiveShowcases } from "@/lib/planners/home";
import { PlannersPageHero, PLANNERS_CONTAINER, PLANNERS_SECTION } from "@/features/planners/PageHero";

// 플래너'스 PAD (곁들임 제품, 2026-10-14 AI 중심 개편) — 굿노트·삼성노트·XODO 손글씨 플래너 몰 (바닥상회에서 옮겨 옴, 원천 planners_files)
export const metadata: Metadata = {
    title: "플래너'스 PAD",
    description: "아이패드·갤럭시 탭의 굿노트·삼성노트·XODO에서 쓰는 손글씨 플래너와 노트·프레임워크 서식. 로그인하면 누구나 받을 수 있습니다.",
};

const SORTS: { key: PadSort; label: string }[] = [
    { key: "popular", label: "인기순" },
    { key: "new", label: "최신순" },
    { key: "name", label: "이름순" },
];

export default async function PlannersPadPage({ searchParams }: { searchParams: Promise<{ c?: string; sort?: string }> }) {
    const { c, sort: sortParam } = await searchParams;
    const all = await listPlannersFiles();
    const [reviewCounts, showcases] = await Promise.all([reviewCountsByFile(), listActiveShowcases(all)]);
    const category = c && (PAD_CATEGORIES as readonly string[]).includes(c) ? c : null;
    const sort: PadSort = sortParam === "new" || sortParam === "name" ? sortParam : "popular";
    const files = sortFiles(category ? all.filter((f) => f.category === category) : all, sort);
    const counts = new Map<string, number>();
    for (const f of all) counts.set(f.category, (counts.get(f.category) ?? 0) + 1);
    const reviewCountsObj = Object.fromEntries(reviewCounts);

    const href = (next: { c?: string | null; sort?: PadSort }) => {
        const p = new URLSearchParams();
        const cc = next.c === undefined ? category : next.c;
        const ss = next.sort ?? sort;
        if (cc) p.set("c", cc);
        if (ss !== "popular") p.set("sort", ss);
        const qs = p.toString();
        return `/planners/pad${qs ? `?${qs}` : ""}`;
    };
    // 전체 = 진열대(인트라 › Planner's › 진열대) → 분류별 섹션(인기 4개 + 전체 보기)
    const sections: { key: string; title: string; desc?: string | null; items: typeof all; total: number; more: string | null }[] = category ? [] : [
        ...showcases.map((sc) => ({ key: sc.id, title: sc.title, desc: sc.description, items: sc.files, total: sc.files.length, more: null })),
        ...PAD_CATEGORIES.filter((cat) => counts.get(cat)).map((cat) => {
            const total = counts.get(cat) ?? 0;
            return { key: cat, title: cat, desc: PAD_CATEGORY_DESC[cat], items: sortFiles(all.filter((f) => f.category === cat), "popular").slice(0, 4), total, more: total > 4 ? href({ c: cat, sort: "popular" }) : null };
        }),
    ];

    return (
        <>
            <PlannersPageHero
                eyebrow="플래너'스 PAD"
                title="감성을 담아내는 손글씨 플래너"
                description={<>아이패드·갤럭시 탭의 굿노트, 삼성노트, XODO에서 쓰는 PDF 플래너와 서식 {all.length}종. Ten:One™ 계정으로 로그인하면 누구나 받을 수 있습니다.</>}
            />

            <div className="sticky top-[64px] z-30 border-b border-neutral-200 bg-white/95 backdrop-blur md:top-[84px]">
                <nav className={`${PLANNERS_CONTAINER} flex gap-1 overflow-x-auto`} aria-label="분류">
                    <Tab href={href({ c: null })} active={!category} label="전체" count={all.length} />
                    {PAD_CATEGORIES.filter((cat) => counts.get(cat)).map((cat) => (
                        <Tab key={cat} href={href({ c: cat })} active={category === cat} label={cat} count={counts.get(cat) ?? 0} />
                    ))}
                </nav>
            </div>

            {category ? (
                <section className={PLANNERS_SECTION}>
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold">{category} <span className="text-base font-normal text-neutral-400">{files.length}</span></h2>
                            {PAD_CATEGORY_DESC[category] && <p className="mt-1 break-keep text-sm text-neutral-500">{PAD_CATEGORY_DESC[category]}</p>}
                        </div>
                        <div className="flex gap-3 text-sm">
                            {SORTS.map((s) => (
                                <Link key={s.key} href={href({ sort: s.key })} scroll={false} className={sort === s.key ? "font-bold text-neutral-900" : "text-neutral-400 hover:text-neutral-700"}>
                                    {s.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    {files.length === 0
                        ? <p className="py-20 text-center text-neutral-400">자료가 없습니다.</p>
                        : <ProgressiveProductGrid files={files} reviewCounts={reviewCountsObj} />}
                </section>
            ) : (
                // 전체 = 진열대 + 분류별 섹션 (바닥상회 모음전 방식)
                <div className={PLANNERS_SECTION}>
                    {sections.map(({ key, title, desc, items, total, more }, i) => (
                        <section key={key} className={i > 0 ? "mt-20 border-t border-neutral-200 pt-12 md:mt-28 md:pt-16" : ""} aria-labelledby={`pad-${i}`}>
                            <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
                                <div className="min-w-0">
                                    <h2 id={`pad-${i}`} className="text-xl font-bold md:text-2xl">{title} <span className="text-base font-normal text-neutral-400">{total}</span></h2>
                                    {desc && <p className="mt-1 break-keep text-sm text-neutral-500">{desc}</p>}
                                </div>
                                {more && <Link href={more} className="shrink-0 text-sm text-neutral-500 hover:text-[#0F766E]">전체 보기 ›</Link>}
                            </div>
                            {/* 모바일은 옆으로 넘기고, 큰 화면은 한 줄 4개 */}
                            <div className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-5 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-x-10 md:overflow-visible md:px-0">
                                {items.map((f, j) => (
                                    <div key={f.id} className="w-[44%] shrink-0 snap-start md:w-auto">
                                        <ProductCard file={f} priority={i === 0 && j < 4} reviewCount={reviewCountsObj[f.id] ?? 0} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </>
    );
}

function Tab({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
    return (
        <Link
            href={href}
            scroll={false}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm whitespace-nowrap ${active ? "border-[#0F766E] font-bold text-[#0F766E]" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
        >
            {label} <span className="text-xs text-neutral-400">{count}</span>
        </Link>
    );
}
