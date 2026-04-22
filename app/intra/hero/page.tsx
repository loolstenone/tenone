"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, ClipboardCheck, FileText, Search, Loader2, Building2, Compass, Sparkles, Network } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface HeroStats {
    members: number;
    membersThisMonth: number;
    hitTotal: number;
    hitCompleted: number;
    hitInProgress: number;
    resumes: number;
    tihRequests: number;
    companies: number;
    companiesActiveMembers: number;
    jdTotal: number;
    jdPublished: number;
    jhTotal: number;
    jhActive: number;
    heroProfiles: number;
    matches: number;
}

interface RecentHit {
    id: string;
    test_type: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
}

interface RecentResume {
    id: string;
    title: string;
    created_at: string;
    members: { name: string } | null;
}

export default function HeroDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<HeroStats>({
        members: 0, membersThisMonth: 0,
        hitTotal: 0, hitCompleted: 0, hitInProgress: 0,
        resumes: 0, tihRequests: 0,
        companies: 0, companiesActiveMembers: 0,
        jdTotal: 0, jdPublished: 0,
        jhTotal: 0, jhActive: 0,
        heroProfiles: 0, matches: 0,
    });
    const [recentHits, setRecentHits] = useState<RecentHit[]>([]);
    const [recentResumes, setRecentResumes] = useState<RecentResume[]>([]);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const sb = createClient();
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [
            { count: members },
            { count: membersThisMonth },
            { count: hitTotal },
            { count: hitCompleted },
            { count: hitInProgress },
            { count: resumes },
            { count: tihRequests },
            { count: companies },
            { count: companiesActiveMembers },
            { count: jdTotal },
            { count: jdPublished },
            { count: jhTotal },
            { count: jhActive },
            { count: heroProfiles },
            { count: matches },
            { data: hits },
            { data: resumeData },
        ] = await Promise.all([
            sb.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["hero"]),
            sb.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["hero"]).gte("created_at", monthStart),
            sb.from("hit_sessions").select("*", { count: "exact", head: true }),
            sb.from("hit_sessions").select("*", { count: "exact", head: true }).eq("status", "completed"),
            sb.from("hit_sessions").select("*", { count: "exact", head: true }).in("status", ["in_progress", "active"]),
            sb.from("resumes").select("*", { count: "exact", head: true }),
            sb.from("hero_tih_responses").select("*", { count: "exact", head: true }),
            sb.from("hero_companies").select("*", { count: "exact", head: true }),
            sb.from("hero_company_members").select("*", { count: "exact", head: true }).eq("status", "active"),
            sb.from("hero_jd").select("*", { count: "exact", head: true }),
            sb.from("hero_jd").select("*", { count: "exact", head: true }).eq("status", "published"),
            sb.from("hero_jh_responses").select("*", { count: "exact", head: true }),
            sb.from("hero_jh_responses").select("*", { count: "exact", head: true }).eq("status", "active"),
            sb.from("hero_profiles").select("*", { count: "exact", head: true }),
            sb.from("hero_matches").select("*", { count: "exact", head: true }),
            sb.from("hit_sessions").select("id, test_type, status, started_at, completed_at").order("created_at", { ascending: false }).limit(5),
            sb.from("resumes").select("id, title, created_at, members!inner(name)").order("created_at", { ascending: false }).limit(5),
        ]);

        setStats({
            members: members ?? 0,
            membersThisMonth: membersThisMonth ?? 0,
            hitTotal: hitTotal ?? 0,
            hitCompleted: hitCompleted ?? 0,
            hitInProgress: hitInProgress ?? 0,
            resumes: resumes ?? 0,
            tihRequests: tihRequests ?? 0,
            companies: companies ?? 0,
            companiesActiveMembers: companiesActiveMembers ?? 0,
            jdTotal: jdTotal ?? 0,
            jdPublished: jdPublished ?? 0,
            jhTotal: jhTotal ?? 0,
            jhActive: jhActive ?? 0,
            heroProfiles: heroProfiles ?? 0,
            matches: matches ?? 0,
        });
        setRecentHits((hits ?? []) as RecentHit[]);
        setRecentResumes((resumeData ?? []) as RecentResume[]);
        setLoading(false);
    }

    const completionRate = stats.hitTotal > 0 ? Math.round((stats.hitCompleted / stats.hitTotal) * 100) : 0;

    return (
        <div>
            <PageHeader title="HeRo 대시보드" description="커리어 코칭 플랫폼 운영 현황">
                <Link href="/hero" target="_blank"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </Link>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : (
                <>
                    {/* 핵심 지표 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="총 회원" value={stats.members.toLocaleString() + "명"}
                            sub={stats.membersThisMonth > 0 ? `이번달 +${stats.membersThisMonth}명` : "신규 없음"}
                            icon={<Users className="h-4 w-4" />} />
                        <StatCard label="HIT 검사 완료" value={stats.hitCompleted.toLocaleString() + "건"}
                            sub={`완료율 ${completionRate}% · 진행 중 ${stats.hitInProgress}건`}
                            icon={<ClipboardCheck className="h-4 w-4" />} />
                        <StatCard label="이력서 등록" value={stats.resumes.toLocaleString() + "건"}
                            sub="이력서 워크스페이스 이용자"
                            icon={<FileText className="h-4 w-4" />} />
                        <StatCard label="씨치 라이트 요청" value={stats.tihRequests.toLocaleString() + "건"}
                            sub="TIH 제출 누계"
                            icon={<Search className="h-4 w-4" />} />
                    </div>

                    {/* Matching Tetrad 지표 */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <Network className="h-4 w-4 text-rose-500" />
                            <h2 className="text-sm font-bold">Matching Tetrad</h2>
                            <span className="text-[10px] text-neutral-400">TIH · HIT · JD · JH 4요소 유입 현황</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="기업 풀"
                                value={stats.companies.toLocaleString() + "개"}
                                sub={`활성 담당자 ${stats.companiesActiveMembers}명`}
                                icon={<Building2 className="h-4 w-4" />} />
                            <StatCard label="JD 발행"
                                value={stats.jdPublished.toLocaleString() + "건"}
                                sub={`전체 ${stats.jdTotal}건 (draft 포함)`}
                                icon={<FileText className="h-4 w-4" />} />
                            <StatCard label="JH 매칭 대기"
                                value={stats.jhActive.toLocaleString() + "명"}
                                sub={`전체 ${stats.jhTotal}건 (draft 포함)`}
                                icon={<Compass className="h-4 w-4" />} />
                            <StatCard label="매칭 성사"
                                value={stats.matches.toLocaleString() + "건"}
                                sub={`통합 프로필 ${stats.heroProfiles}명`}
                                icon={<Sparkles className="h-4 w-4" />} />
                        </div>
                        {/* Tetrad Funnel 가시화 */}
                        <div className="mt-4 p-3 border border-neutral-200 bg-gradient-to-r from-neutral-50 to-rose-50/30 rounded-lg">
                            <p className="text-[10px] text-neutral-500 font-semibold mb-2">Tetrad Funnel — 좌우 교차 매칭 후보 깊이</p>
                            <div className="grid grid-cols-2 gap-4 text-[11px]">
                                <div>
                                    <p className="font-semibold text-neutral-600 mb-1">기업 측</p>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono">{stats.companies}</span>
                                        <span className="text-neutral-400">기업 →</span>
                                        <span className="font-mono">{stats.tihRequests}</span>
                                        <span className="text-neutral-400">TIH →</span>
                                        <span className="font-mono text-rose-600">{stats.jdPublished}</span>
                                        <span className="text-neutral-400">JD 공개</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-neutral-600 mb-1">인재 측</p>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono">{stats.members}</span>
                                        <span className="text-neutral-400">회원 →</span>
                                        <span className="font-mono">{stats.hitCompleted}</span>
                                        <span className="text-neutral-400">HIT 완료 →</span>
                                        <span className="font-mono text-rose-600">{stats.jhActive}</span>
                                        <span className="text-neutral-400">JH 작성</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 최근 HIT 검사 */}
                        <Card>
                            <SectionTitle title="최근 HIT 검사 세션" action="전체 보기" actionHref="/intra/hero/hit" />
                            {recentHits.length === 0 ? (
                                <p className="text-xs text-neutral-400 py-4 text-center">HIT 세션 데이터가 없습니다</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentHits.map(h => (
                                        <div key={h.id} className="flex items-center justify-between py-2 px-3 border border-neutral-100 rounded">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-mono bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">{h.test_type}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                                    h.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                                    h.status === "in_progress" || h.status === "active" ? "bg-amber-100 text-amber-700" :
                                                    "bg-neutral-100 text-neutral-500"
                                                }`}>{h.status === "completed" ? "완료" : h.status === "in_progress" || h.status === "active" ? "진행중" : h.status}</span>
                                            </div>
                                            <span className="text-[10px] text-neutral-400">
                                                {h.started_at ? new Date(h.started_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : "-"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* 최근 이력서 등록 */}
                        <Card>
                            <SectionTitle title="최근 이력서 등록" action="전체 보기" actionHref="/intra/hero/resume" />
                            {recentResumes.length === 0 ? (
                                <p className="text-xs text-neutral-400 py-4 text-center">이력서 데이터가 없습니다</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {recentResumes.map(r => (
                                        <div key={r.id} className="flex items-center justify-between py-1.5">
                                            <div>
                                                <p className="text-sm font-medium text-neutral-800">{(r.members as { name: string } | null)?.name ?? "-"}</p>
                                                <p className="text-[11px] text-neutral-400">{r.title || "(제목 없음)"}</p>
                                            </div>
                                            <span className="text-[10px] text-neutral-400">
                                                {new Date(r.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* 빠른 이동 */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "HIT 이용자 현황", sub: "세션·완료·진행 중", href: "/intra/hero/hit" },
                            { label: "AI 상담 설정", sub: "챗봇·프롬프트 관리", href: "/intra/hero/ai-counseling" },
                            { label: "씨치 라이트", sub: "TIH 응답 · 기업 요청", href: "/intra/hero/search-light" },
                            { label: "이력서 컨설팅", sub: "컨설팅 신청 관리", href: "/intra/hero/resume/consulting" },
                        ].map(({ label, sub, href }) => (
                            <Link key={href} href={href}
                                className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-colors">
                                <p className="text-xs font-semibold text-neutral-900">{label}</p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">{sub}</p>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
