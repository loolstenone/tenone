// 공개 프로젝트 페이지 (인증 불필요)
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ChevronLeft, Calendar, CheckCircle2 } from "lucide-react";
import { getCategoryMeta } from "@/lib/planners/project-categories";

export const dynamic = "force-dynamic";

interface PublicProject {
    id: string; title: string; color: string | null; category: string | null;
    status: string; start_date: string | null; end_date: string | null;
    completed_at: string | null;
    retrospective: { fact: string; feeling: string; finding: string; future: string; feedback: string; completed_at: string } | null;
    tags: string[] | null;
}

interface PublicNote { id: string; title: string | null; content: string | null; order_index: number }
interface PublicMilestone { id: string; title: string; description: string | null; due_date: string | null; done_at: string | null }
interface PublicOwner { name: string | null; avatar_url: string | null }

async function loadByToken(token: string) {
    const admin = createAdminClient();
    const { data: project } = await admin
        .from("planners_projects")
        .select("id, member_id, title, color, category, status, start_date, end_date, completed_at, retrospective, tags")
        .eq("public_token", token)
        .eq("visibility", "public_link")
        .maybeSingle();
    if (!project) return null;

    const [{ data: notes }, { data: milestones }, { data: owner }] = await Promise.all([
        admin.from("planners_project_notes").select("id, title, content, order_index").eq("project_id", project.id).order("order_index"),
        admin.from("planners_project_milestones").select("id, title, description, due_date, done_at, order_index").eq("project_id", project.id).order("order_index"),
        admin.from("members").select("name, avatar_url").eq("id", project.member_id).maybeSingle(),
    ]);

    return {
        project: project as unknown as PublicProject,
        notes: (notes ?? []) as PublicNote[],
        milestones: (milestones ?? []) as PublicMilestone[],
        owner: (owner ?? null) as PublicOwner | null,
    };
}

export default async function PublicProjectPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const data = await loadByToken(token);
    if (!data) notFound();
    const { project, notes, milestones, owner } = data;
    const meta = getCategoryMeta(project.category);

    const totalMilestones = milestones.length;
    const doneMilestones = milestones.filter(m => m.done_at).length;
    const progress = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link
                    href="/planners"
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#0F766E] mb-6"
                >
                    <ChevronLeft className="h-3 w-3" /> Planner&apos;s Planner
                </Link>

                {/* Header */}
                <header className="mb-8 pb-6 border-b border-neutral-200">
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="inline-block px-2 py-0.5 rounded text-[11px] text-white font-medium"
                            style={{ backgroundColor: meta.color }}
                        >
                            {meta.label}
                        </span>
                        {project.status === "completed" && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#0F766E]">
                                <CheckCircle2 className="h-3 w-3" /> 완료
                            </span>
                        )}
                    </div>
                    <h1 className="font-serif text-4xl text-neutral-900 leading-tight mb-2">
                        {project.title}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                        {owner?.name && <span>by {owner.name}</span>}
                        {(project.start_date || project.end_date) && (
                            <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {project.start_date ?? "?"} → {project.end_date ?? "진행중"}
                            </span>
                        )}
                    </div>
                </header>

                {/* 회고 (있을 때) */}
                {project.retrospective && (
                    <section className="mb-8">
                        <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4">회고 · 5F</h2>
                        <div className="space-y-4 bg-white border border-neutral-200 rounded-xl p-6">
                            {([
                                { k: "fact", l: "Fact" },
                                { k: "feeling", l: "Feeling" },
                                { k: "finding", l: "Finding" },
                                { k: "future", l: "Future" },
                                { k: "feedback", l: "Feedback" },
                            ] as const).map(({ k, l }) => {
                                const v = project.retrospective![k];
                                if (!v?.trim()) return null;
                                return (
                                    <div key={k}>
                                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{l}</p>
                                        <p className="text-sm text-neutral-800 whitespace-pre-line leading-relaxed">{v}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 마일스톤 */}
                {milestones.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4 flex items-center justify-between">
                            <span>마일스톤</span>
                            <span className="text-neutral-500">{progress}%</span>
                        </h2>
                        <div className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full rounded-full"
                                    style={{ width: `${progress}%`, backgroundColor: project.color || "#0F766E" }}
                                />
                            </div>
                            <ul className="space-y-1.5">
                                {milestones.map((m) => (
                                    <li key={m.id} className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded border-2 flex items-center justify-center shrink-0 ${
                                            m.done_at ? "bg-[#0F766E] border-[#0F766E]" : "border-neutral-300"
                                        }`}>
                                            {m.done_at && <CheckCircle2 className="h-2 w-2 text-white" />}
                                        </span>
                                        <span className={`text-sm ${m.done_at ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                                            {m.title}
                                        </span>
                                        {m.due_date && <span className="text-[10px] text-neutral-400 ml-auto font-mono">{m.due_date}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}

                {/* 노트 */}
                {notes.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4">노트</h2>
                        <div className="space-y-3">
                            {notes.filter(n => (n.content ?? "").trim()).slice(0, 10).map((n) => (
                                <article key={n.id} className="bg-white border border-neutral-200 rounded-xl p-5">
                                    {n.title && <h3 className="text-xs uppercase tracking-widest text-neutral-400 mb-2">{n.title}</h3>}
                                    <pre className="text-sm text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed">{n.content}</pre>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                <footer className="mt-16 pt-6 border-t border-neutral-200 text-center">
                    <p className="text-[11px] text-neutral-400">
                        Planner&apos;s Planner AI 로 만들어진 공개 프로젝트
                    </p>
                </footer>
            </div>
        </div>
    );
}
