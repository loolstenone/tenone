// 포트폴리오 페이지 — 한 사용자의 모든 공개 프로젝트 갤러리 (인증 불필요)
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ChevronLeft, CheckCircle2, Calendar, FolderKanban } from "lucide-react";
import { getCategoryMeta } from "@/lib/planners/project-categories";

export const dynamic = "force-dynamic";

interface PortfolioProject {
    id: string;
    title: string;
    color: string | null;
    category: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
    completed_at: string | null;
    public_token: string;
    tags: string[] | null;
    milestone_total: number;
    milestone_done: number;
}

interface Owner { id: string; name: string | null; avatar_url: string | null }

async function loadPortfolio(memberId: string) {
    const admin = createAdminClient();

    const [{ data: owner }, { data: projects }] = await Promise.all([
        admin.from("members").select("id, name, avatar_url").eq("id", memberId).maybeSingle(),
        admin
            .from("planners_projects")
            .select("id, title, color, category, status, start_date, end_date, completed_at, public_token, tags")
            .eq("member_id", memberId)
            .eq("visibility", "public_link")
            .order("created_at", { ascending: false }),
    ]);

    if (!owner || !projects || projects.length === 0) return null;

    const milestoneStats = await Promise.all(
        projects.map(async (p) => {
            const { data: ms } = await admin
                .from("planners_project_milestones")
                .select("id, done_at")
                .eq("project_id", p.id);
            const total = ms?.length ?? 0;
            const done = ms?.filter((m) => m.done_at).length ?? 0;
            return { id: p.id, total, done };
        })
    );

    const statsMap = Object.fromEntries(milestoneStats.map(s => [s.id, s]));

    return {
        owner: owner as Owner,
        projects: projects.map(p => ({
            ...p,
            milestone_total: statsMap[p.id]?.total ?? 0,
            milestone_done: statsMap[p.id]?.done ?? 0,
        })) as PortfolioProject[],
    };
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        active:    { label: "진행중",  cls: "bg-teal-50 text-teal-700" },
        completed: { label: "완료",    cls: "bg-neutral-100 text-neutral-500" },
        archived:  { label: "보관",    cls: "bg-neutral-100 text-neutral-400" },
        paused:    { label: "일시정지", cls: "bg-yellow-50 text-yellow-600" },
    };
    const { label, cls } = map[status] ?? { label: status, cls: "bg-neutral-100 text-neutral-500" };
    return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>{label}</span>;
}

export default async function PortfolioPage({ params }: { params: Promise<{ memberId: string }> }) {
    const { memberId } = await params;
    const data = await loadPortfolio(memberId);
    if (!data) notFound();

    const { owner, projects } = data;

    const activeCount    = projects.filter(p => p.status === "active").length;
    const completedCount = projects.filter(p => p.status === "completed").length;

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* 브랜드 링크 */}
                <Link
                    href="/planners"
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#0F766E] mb-8"
                >
                    <ChevronLeft className="h-3 w-3" /> Planner&apos;s Planner AI
                </Link>

                {/* 오너 헤더 */}
                <header className="mb-10 pb-8 border-b border-neutral-200">
                    <div className="flex items-center gap-4 mb-5">
                        {owner.avatar_url ? (
                            <Image
                                src={owner.avatar_url}
                                alt={owner.name ?? ""}
                                width={56}
                                height={56}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-[#0F766E] flex items-center justify-center text-white font-semibold text-xl">
                                {(owner.name ?? "?")[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="font-serif text-3xl text-neutral-900">
                                {owner.name ?? "익명"}
                            </h1>
                            <p className="text-sm text-neutral-500 mt-1">공개 프로젝트 포트폴리오</p>
                        </div>
                    </div>
                    {/* 통계 */}
                    <div className="flex items-center gap-6 text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5">
                            <FolderKanban className="h-4 w-4" />
                            <strong className="text-neutral-700 font-semibold">{projects.length}</strong> 프로젝트
                        </span>
                        {activeCount > 0 && (
                            <span>
                                <strong className="text-teal-700 font-semibold">{activeCount}</strong> 진행중
                            </span>
                        )}
                        {completedCount > 0 && (
                            <span>
                                <strong className="text-neutral-700 font-semibold">{completedCount}</strong> 완료
                            </span>
                        )}
                    </div>
                </header>

                {/* 프로젝트 그리드 */}
                <div className="grid sm:grid-cols-2 gap-5">
                    {projects.map((p) => {
                        const meta = getCategoryMeta(p.category);
                        const progress = p.milestone_total > 0
                            ? Math.round((p.milestone_done / p.milestone_total) * 100)
                            : null;
                        const accentColor = p.color || "#0F766E";

                        return (
                            <Link
                                key={p.id}
                                href={`/planners/p/${p.public_token}`}
                                className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-[#0F766E] hover:shadow-sm transition-all group block"
                            >
                                {/* 카드 상단 컬러 바 */}
                                <div
                                    className="h-1.5 rounded-full mb-4"
                                    style={{ backgroundColor: accentColor }}
                                />

                                {/* 제목 + 상태 */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <h2 className="font-semibold text-neutral-900 group-hover:text-[#0F766E] transition-colors leading-snug">
                                        {p.title}
                                    </h2>
                                    <StatusBadge status={p.status} />
                                </div>

                                {/* 카테고리 배지 */}
                                <div className="flex items-center gap-2 flex-wrap mb-3">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-white font-medium"
                                        style={{ backgroundColor: meta.color }}
                                    >
                                        {meta.label}
                                    </span>
                                    {p.tags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 text-[11px]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* 날짜 */}
                                {(p.start_date || p.end_date) && (
                                    <div className="flex items-center gap-1 text-xs text-neutral-400 mb-3">
                                        <Calendar className="h-3 w-3" />
                                        {p.start_date ?? "?"} → {p.end_date ?? (p.status === "completed" ? "완료" : "진행중")}
                                    </div>
                                )}

                                {/* 마일스톤 진행률 */}
                                {progress !== null && (
                                    <div className="mt-auto pt-2">
                                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                마일스톤
                                            </span>
                                            <span>{p.milestone_done}/{p.milestone_total} · {progress}%</span>
                                        </div>
                                        <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${progress}%`, backgroundColor: accentColor }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <footer className="mt-16 pt-6 border-t border-neutral-200 text-center">
                    <p className="text-[11px] text-neutral-400">
                        <Link href="/planners" className="hover:text-[#0F766E] transition-colors">
                            Planner&apos;s Planner AI
                        </Link>
                        {" "}로 만들어진 공개 포트폴리오
                    </p>
                </footer>
            </div>
        </div>
    );
}
