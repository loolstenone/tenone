import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/features/planners/pad/ProductCard";
import { listPlannersFiles, PAD_CATEGORIES, PAD_CATEGORY_DESC, sortFiles, type PadSort } from "@/lib/planners/library";
import { reviewCountsByFile } from "@/lib/planners/reviews";
import { PlannersPageHero, PLANNERS_CONTAINER, PLANNERS_SECTION } from "@/features/planners/PageHero";

// 플래너'스 PAD — 굿노트·삼성노트·XODO 손글씨 플래너 몰 (바닥상회에서 옮겨 옴, 원천 planners_files)
export const metadata: Metadata = {
    title: "PAD",
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
    const reviewCounts = await reviewCountsByFile();
    const category = c && (PAD_CATEGORIES as readonly string[]).includes(c) ? c : null;
    const sort: PadSort = sortParam === "new" || sortParam === "name" ? sortParam : "popular";
    const files = sortFiles(category ? all.filter((f) => f.category === category) : all, sort);
    const counts = new Map<string, number>();
    for (const f of all) counts.set(f.category, (counts.get(f.category) ?? 0) + 1);

    const href = (next: { c?: string | null; sort?: PadSort }) => {
        const p = new URLSearchParams();
        const cc = next.c === undefined ? category : next.c;
        const ss = next.sort ?? sort;
        if (cc) p.set("c", cc);
        if (ss !== "popular") p.set("sort", ss);
        const qs = p.toString();
        return `/planners/pad${qs ? `?${qs}` : ""}`;
    };

    return (
        <>
            <PlannersPageHero
                eyebrow="PAD"
                title="손으로 쓰는 기획자의 플래너"
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

            <section className={PLANNERS_SECTION}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold">{category ?? "전체"} <span className="text-base font-normal text-neutral-400">{files.length}</span></h2>
                        {category && PAD_CATEGORY_DESC[category] && <p className="mt-1 break-keep text-sm text-neutral-500">{PAD_CATEGORY_DESC[category]}</p>}
                    </div>
                    <div className="flex gap-3 text-sm">
                        {SORTS.map((s) => (
                            <Link key={s.key} href={href({ sort: s.key })} className={sort === s.key ? "font-bold text-neutral-900" : "text-neutral-400 hover:text-neutral-700"}>
                                {s.label}
                            </Link>
                        ))}
                    </div>
                </div>
                {files.length === 0 ? <p className="py-20 text-center text-neutral-400">자료가 없습니다.</p> : <ProductGrid reviewCounts={reviewCounts} files={files} priorityCount={8} />}
            </section>
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
