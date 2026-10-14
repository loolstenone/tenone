import type { Metadata } from "next";
import Link from "next/link";
import { PLANNERS_SECTION, PlannersSectionTitle } from "@/features/planners/PageHero";
import { ArrowRight } from "lucide-react";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";
import { ProductGrid } from "@/features/planners/pad/ProductCard";
import { listPlannersFiles, PAD_CATEGORIES, padPath, sortFiles } from "@/lib/planners/library";
import { reviewCountsByFile } from "@/lib/planners/reviews";
import { listActiveBanners, listActiveShowcases } from "@/lib/planners/home";
import { HeroCarousel, type HeroSlide } from "@/features/planners/home/HeroCarousel";

// 첫 화면 = 몰 (2026-10-14 개편 — "블로그 같다" → 바닥상회 몰 수준). 문구 "우리는 모두 기획자다 / 자기 인생에서만큼은"은 사용자 확정
export const metadata: Metadata = {
    title: "우리는 모두 기획자다",
    description: "인공지능 시대, 더욱 기획자가 되어야 한다. 플래너'스 AI(인공지능 플래너)와 플래너'스 PAD(굿노트 등 손글씨 플래너·서식).",
};

const AI_FEATURES = ["오늘·주간·월간·연간 계획", "프로젝트·할 일·간트", "캔버스·마인드맵", "AI 브리핑"];

export default async function PlannersHome() {
    const files = await listPlannersFiles();
    const reviewCounts = await reviewCountsByFile();
    const planners = files.filter((f) => f.category === "연간 플래너").sort((a, b) => b.sort_order - a.sort_order);
    const hero = planners.find((f) => f.legacy_badak_no === 182) ?? planners[0];
    const popular = sortFiles(files.filter((f) => f.kind === "template"), "popular").slice(0, 8);
    const tiles = PAD_CATEGORIES.map((c) => ({ c, list: files.filter((f) => f.category === c) })).filter((t) => t.list.length > 0);
    const t = { ...PROGRAM_THEMES.planners, accent: "#0F766E" };
    const [banners, showcases] = await Promise.all([listActiveBanners(), listActiveShowcases(files)]);

    // 첫 장 = 확정 문구(바꾸지 않음) · 그다음 = 인트라 › Planner's › 배너
    const slides: HeroSlide[] = [
        {
            key: "brand",
            title: "우리는 모두 기획자다",
            subtitle: "자기 인생에서만큼은",
            body: "인공지능 시대, 더욱 기획자가 되어야 한다.\nAI가 실행을 대신할수록 방향을 정하는 힘이 곧 경쟁력이다.\n우리가 기획자가 되어야 하는 이유다.",
            imageUrl: hero?.thumbnail_url ?? null,
            imageHref: hero ? padPath(hero.id) : null,
            primary: { label: "PAD 받기", href: "/planners/pad" },
            secondary: { label: "AI 알아보기", href: "/planners/ai" },
            note: "종이? 패드? AI? 중요한 것은 기획하는 나",
        },
        ...banners.map((b) => ({
            key: b.id,
            title: b.title,
            body: b.subtitle,
            imageUrl: b.image_url,
            imageHref: b.link_url,
            primary: b.link_url ? { label: b.button_label || "자세히 보기", href: b.link_url } : null,
        })),
    ];

    return (
        <>
            <HeroCarousel slides={slides} />

            {/* 두 제품 */}
            <section className={`${PLANNERS_SECTION} grid gap-6 md:grid-cols-2 md:gap-12`}>
                <Link href="/planners/ai" className="group flex flex-col justify-between bg-neutral-50 p-10 transition-colors hover:bg-teal-50/60 md:p-20">
                    <div>
                        <p className="text-sm font-bold text-[#0F766E]">AI</p>
                        <h2 className="mt-2 text-3xl font-bold md:text-4xl">인공지능 플래너</h2>
                        <p className="mt-2 break-keep text-neutral-600">플래너'스 PAD와 같은 구조를 디지털로. AI가 하루를 정리해 줍니다.</p>
                    </div>
                    <ul className="mt-10 grid grid-cols-2 gap-2 text-sm text-neutral-700">
                        {AI_FEATURES.map((f) => <li key={f} className="bg-white px-4 py-3">{f}</li>)}
                    </ul>
                    <span className="mt-10 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E]">AI 알아보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
                <Link href="/planners/pad" className="group flex flex-col justify-between bg-neutral-50 p-10 transition-colors hover:bg-teal-50/60 md:p-20">
                    <div>
                        <p className="text-sm font-bold text-[#0F766E]">PAD</p>
                        <h2 className="mt-2 text-3xl font-bold md:text-4xl">손글씨 플래너</h2>
                        <p className="mt-2 break-keep text-neutral-600">굿노트·삼성노트·XODO에서 쓰는 PDF 플래너와 서식 {files.length}종.</p>
                    </div>
                    <div className="mt-10 grid grid-cols-4 gap-2">
                        {popular.slice(0, 4).map((f) => f.thumbnail_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={f.id} src={f.thumbnail_url} alt="" className="aspect-square w-full bg-white object-contain p-2" />
                        ))}
                    </div>
                    <span className="mt-10 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E]">서식 둘러보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
            </section>

            {/* 진열대 — 인트라 › Planner's › 진열대 (아임웹 쇼핑 기획전 자리) */}
            {showcases.map((sc, k) => (
                <Shelf key={sc.id} title={sc.title} description={sc.description} href="/planners/pad">
                    <ProductGrid reviewCounts={reviewCounts} files={sc.files} priorityCount={k === 0 ? 4 : 0} />
                </Shelf>
            ))}

            {/* 분류 */}
            <section className="bg-neutral-50">
                <div className={PLANNERS_SECTION}>
                    <PlannersSectionTitle title="분류별로 찾기" description="연간 플래너부터 노트·프레임워크·플레이 서식까지" href="/planners/pad" />
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6 lg:grid-cols-5">
                        {tiles.map(({ c, list }) => (
                            <Link key={c} href={`/planners/pad?c=${encodeURIComponent(c)}`} className="group flex items-center gap-5 bg-white p-6 md:p-7 transition-shadow hover:shadow-md">
                                {list[0].thumbnail_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={list[0].thumbnail_url} alt="" className="h-16 w-16 shrink-0 object-contain" />
                                )}
                                <span>
                                    <span className="block text-sm font-bold group-hover:text-[#0F766E]">{c}</span>
                                    <span className="text-xs text-neutral-400">{list.length}종</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 인기 서식 */}
            {popular.length > 0 && (
                <Shelf title="많이 쓰는 서식" href="/planners/pad">
                    <ProductGrid reviewCounts={reviewCounts} files={popular} />
                </Shelf>
            )}

            {/* 기획이란 */}
            <section className="bg-neutral-50">
                <div className={`${PLANNERS_SECTION} flex flex-col gap-6 md:flex-row md:items-center md:justify-between`}>
                    <div>
                        <p className="text-sm font-bold text-[#0F766E]">기획이란</p>
                        <p className="mt-3 break-keep text-2xl font-bold md:text-3xl">기획하다 = 주도적 + 목표 설정 + 전략 수립 + 계획</p>
                        <p className="mt-3 break-keep text-neutral-600 md:text-lg">이상과 현실의 차이를 문제로 보고, 일이 되게 하는 방법을 찾는 사람.</p>
                    </div>
                    <Link href="/planners/about" className="inline-flex shrink-0 items-center gap-1 font-bold text-[#0F766E] hover:underline">기획이란 읽기 <ArrowRight className="h-4 w-4" /></Link>
                </div>
            </section>

            {/* 프로젝트 */}
            <Shelf title="지금 모집 중인 프로젝트" href="/planners/projects">
                <ProgramBoard theme={t} brands={["planners"]} dark={false} emptyText="지금 모집 중인 프로젝트가 없습니다. 새 프로젝트가 열리면 이곳에 안내합니다." />
            </Shelf>
        </>
    );
}

function Shelf({ title, description, href, children }: { title: string; description?: string | null; href: string; children: React.ReactNode }) {
    return (
        <section className={PLANNERS_SECTION}>
            <PlannersSectionTitle title={title} description={description} href={href} />
            {children}
        </section>
    );
}
