// MADLeap 포트폴리오 — DB 연동 (CLAUDE.md 이월 작업 해소)
// Server Component: madleap_portfolios 테이블에서 조회 → PortfolioGrid client로 위임

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import PortfolioGrid, { type Portfolio } from "@/features/madleap/PortfolioGrid";

export const revalidate = 300;

async function fetchPortfolios(): Promise<Portfolio[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("madleap_portfolios")
        .select("id, title, team, gen, gen_num, category, client, description, tags, award, gradient, sort_order")
        .eq("is_published", true)
        .order("gen_num", { ascending: false })
        .order("sort_order", { ascending: false });

    if (error) {
        console.error("[madleap/portfolio] fetch failed:", error.message);
        return [];
    }
    return (data ?? []) as Portfolio[];
}

export default async function MadLeapPortfolioPage() {
    const portfolios = await fetchPortfolios();
    const awardCount = portfolios.filter(p => p.award).length;
    const genCount = new Set(portfolios.map(p => p.gen_num)).size;

    return (
        <>
            {/* Hero */}
            <section className="bg-[#1a1a2e] text-white py-20 md:py-24">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-3">Portfolio</p>
                    <h1 className="text-2xl md:text-4xl font-bold mb-4">매드립 리퍼들의 실전 프로젝트</h1>
                    <p className="text-neutral-400">실제 브랜드와 함께한 결과물</p>

                    <div className="flex items-center justify-center gap-8 mt-8">
                        <div className="text-center">
                            <div className="text-2xl font-black text-[#4361ee]">{portfolios.length}</div>
                            <div className="text-xs text-neutral-400">프로젝트</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-[#4361ee]">{awardCount}</div>
                            <div className="text-xs text-neutral-400">수상작</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-[#4361ee]">{genCount}</div>
                            <div className="text-xs text-neutral-400">기수</div>
                        </div>
                    </div>
                </div>
            </section>

            {portfolios.length > 0 ? (
                <PortfolioGrid items={portfolios} />
            ) : (
                <section className="py-24">
                    <div className="mx-auto max-w-3xl px-6 text-center">
                        <p className="text-neutral-500 text-sm">아직 등록된 포트폴리오가 없습니다.</p>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="bg-neutral-50 py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-xl font-bold mb-3">나의 프로젝트를 추가하고 싶다면?</h2>
                    <p className="text-neutral-500 text-sm mb-6">매드립 리퍼라면 누구나 포트폴리오를 등록할 수 있습니다</p>
                    <Link href="/madleap/my" className="px-6 py-3 bg-[#4361ee] text-white font-medium hover:bg-[#3451de] transition-colors rounded-lg inline-flex items-center gap-2">
                        포트폴리오 등록 <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </>
    );
}
