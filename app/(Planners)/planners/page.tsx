import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";
import { ProductGrid } from "@/features/planners/pad/ProductCard";
import { listPlannersFiles, PAD_CATEGORIES, padPath, sortFiles } from "@/lib/planners/library";

// 첫 화면 = 몰 (2026-10-14 개편 — "블로그 같다" → 바닥상회 몰 수준). 문구 "우리는 모두 기획자다 / 자기 인생에서만큼은"은 사용자 확정
export const metadata: Metadata = {
    title: "우리는 모두 기획자다",
    description: "인공지능 시대, 더욱 기획자가 되어야 한다. 플래너스 AI(인공지능 플래너)와 플래너스 PAD(굿노트 등 손글씨 플래너·서식).",
};

const AI_FEATURES = ["오늘·주간·월간·연간 계획", "프로젝트·할 일·간트", "캔버스·마인드맵", "AI 브리핑"];

export default async function PlannersHome() {
    const files = await listPlannersFiles();
    const planners = files.filter((f) => f.category === "연간 플래너").sort((a, b) => b.sort_order - a.sort_order);
    const hero = planners.find((f) => f.legacy_badak_no === 182) ?? planners[0];
    const popular = sortFiles(files.filter((f) => f.kind === "template"), "popular").slice(0, 8);
    const tiles = PAD_CATEGORIES.map((c) => ({ c, list: files.filter((f) => f.category === c) })).filter((t) => t.list.length > 0);
    const t = { ...PROGRAM_THEMES.planners, accent: "#0F766E" };

    return (
        <>
            {/* 배너 */}
            <section className="bg-[#134E4A] text-white">
                <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16">
                    <div>
                        <h1 className="text-4xl font-black leading-tight md:text-5xl">우리는 모두 기획자다</h1>
                        <p className="mt-2 text-xl font-bold text-teal-200 md:text-2xl">자기 인생에서만큼은</p>
                        <p className="mt-6 max-w-md break-keep leading-relaxed text-teal-50">
                            인공지능 시대, 더욱 기획자가 되어야 한다. AI가 실행을 대신할수록 방향을 정하는 힘이 곧 경쟁력이다.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/planners/pad" className="inline-flex items-center gap-2 bg-[#14B8A6] px-6 py-3 font-bold text-[#042F2E] hover:bg-teal-300">
                                플래너스 PAD 받기 <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/planners/ai" className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 font-bold hover:bg-white/10">
                                플래너스 AI
                            </Link>
                        </div>
                    </div>
                    {hero?.thumbnail_url && (
                        <Link href={padPath(hero.id)} className="block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={hero.thumbnail_url} alt={hero.title} className="w-full bg-white/5 object-contain" />
                        </Link>
                    )}
                </div>
            </section>

            {/* 두 제품 */}
            <section className="mx-auto grid max-w-[1200px] gap-4 px-4 py-10 md:grid-cols-2 md:px-6">
                <Link href="/planners/ai" className="group flex flex-col justify-between border border-neutral-200 p-6 transition-colors hover:border-[#0F766E] md:p-8">
                    <div>
                        <p className="text-sm font-bold text-[#0F766E]">플래너스 AI</p>
                        <h2 className="mt-1 text-2xl font-bold">인공지능 플래너</h2>
                        <p className="mt-2 break-keep text-neutral-600">PAD 플래너와 같은 구조를 디지털로. AI가 하루를 정리해 줍니다.</p>
                    </div>
                    <ul className="mt-6 grid grid-cols-2 gap-2 text-sm text-neutral-700">
                        {AI_FEATURES.map((f) => <li key={f} className="bg-neutral-50 px-3 py-2">{f}</li>)}
                    </ul>
                    <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E]">AI 플래너 열기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
                <Link href="/planners/pad" className="group flex flex-col justify-between border border-neutral-200 p-6 transition-colors hover:border-[#0F766E] md:p-8">
                    <div>
                        <p className="text-sm font-bold text-[#0F766E]">플래너스 PAD</p>
                        <h2 className="mt-1 text-2xl font-bold">손글씨 플래너</h2>
                        <p className="mt-2 break-keep text-neutral-600">굿노트·삼성노트·XODO에서 쓰는 PDF 플래너와 서식 {files.length}종.</p>
                    </div>
                    <div className="mt-6 grid grid-cols-4 gap-2">
                        {popular.slice(0, 4).map((f) => f.thumbnail_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={f.id} src={f.thumbnail_url} alt="" className="aspect-square w-full border border-neutral-100 bg-neutral-50 object-contain p-1" />
                        ))}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E]">서식 둘러보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
            </section>

            {/* 2026 플래너 */}
            {planners.length > 0 && (
                <Shelf title="2026 플래너'스 플래너" href={`/planners/pad?c=${encodeURIComponent("연간 플래너")}`}>
                    <ProductGrid files={planners} priorityCount={4} />
                </Shelf>
            )}

            {/* 분류 */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
                    <h2 className="mb-6 text-xl font-bold">분류별로 찾기</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {tiles.map(({ c, list }) => (
                            <Link key={c} href={`/planners/pad?c=${encodeURIComponent(c)}`} className="group flex items-center gap-3 border border-neutral-200 bg-white p-3 hover:border-[#0F766E]">
                                {list[0].thumbnail_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={list[0].thumbnail_url} alt="" className="h-12 w-12 shrink-0 object-contain" />
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
                    <ProductGrid files={popular} />
                </Shelf>
            )}

            {/* 기획이란 */}
            <section className="border-y border-neutral-200">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
                    <div>
                        <p className="text-sm font-bold text-[#0F766E]">기획이란</p>
                        <p className="mt-1 break-keep text-lg font-bold">기획하다 = 주도적 + 목표 설정 + 전략 수립 + 계획</p>
                        <p className="mt-1 break-keep text-sm text-neutral-600">이상과 현실의 차이를 문제로 보고, 일이 되게 하는 방법을 찾는 사람.</p>
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

function Shelf({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
    return (
        <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <div className="mb-6 flex items-end justify-between">
                <h2 className="text-xl font-bold">{title}</h2>
                <Link href={href} className="text-sm text-neutral-500 hover:text-neutral-900">전체 보기 →</Link>
            </div>
            {children}
        </section>
    );
}
