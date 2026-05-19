"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, ImageIcon, ClipboardList, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

export default function MontzDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ creators: 0, verified: 0, works: 0, activeAuditions: 0, pendingContacts: 0, pendingApplications: 0 });
    const [recentCreators, setRecentCreators] = useState<{ id: string; display_name: string; handle: string; type: string; created_at: string }[]>([]);

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("montz_creators").select("*", { count: "exact", head: true }),
            sb.from("montz_creators").select("*", { count: "exact", head: true }).eq("is_verified", true),
            sb.from("montz_works").select("*", { count: "exact", head: true }),
            sb.from("montz_auditions").select("*", { count: "exact", head: true }).eq("is_active", true),
            sb.from("montz_creators").select("id, display_name, handle, type, created_at").order("created_at", { ascending: false }).limit(5),
            sb.from("montz_contact_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
            sb.from("montz_audition_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]).then(([creators, verified, works, auditions, recent, contacts, apps]) => {
            setStats({
                creators: creators.count ?? 0,
                verified: verified.count ?? 0,
                works: works.count ?? 0,
                activeAuditions: auditions.count ?? 0,
                pendingContacts: contacts.count ?? 0,
                pendingApplications: apps.count ?? 0,
            });
            setRecentCreators((recent.data ?? []) as { id: string; display_name: string; handle: string; type: string; created_at: string }[]);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <PageHeader title="MoNTZ 대시보드" description="포토그래피 · 크리에이터 플랫폼 운영 현황">
                <Link href="/montz" target="_blank"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </Link>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="전체 창작자" value={`${stats.creators}명`}
                            sub={`인증 ${stats.verified}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="포트폴리오 작업" value={`${stats.works}개`} icon={<ImageIcon className="h-4 w-4" />} />
                        <StatCard label="활성 오디션" value={`${stats.activeAuditions}건`} icon={<ClipboardList className="h-4 w-4" />} />
                        <StatCard label="인증 비율"
                            value={stats.creators > 0 ? `${Math.round(stats.verified / stats.creators * 100)}%` : "-"}
                            sub="verified 창작자" icon={<Users className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="최근 창작자" action="전체 보기" actionHref="/intra/ums/montz/members" />
                            {recentCreators.length === 0 ? (
                                <p className="text-sm text-neutral-400 py-4 text-center">등록된 창작자 없음</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentCreators.map(c => (
                                        <div key={c.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{c.display_name}</p>
                                                <p className="text-xs text-neutral-400">{c.handle} · {c.type}</p>
                                            </div>
                                            <span className="text-xs text-neutral-400">{new Date(c.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card>
                            <SectionTitle title="빠른 이동" />
                            <div className="space-y-2">
                                {[
                                    { label: `창작자 관리 ${stats.creators}명`, sub: "모델·배우 프로필 관리", href: "/intra/ums/montz/members" },
                                    { label: `오디션 관리 ${stats.activeAuditions}건`, sub: "오디션 공고 등록·수정·삭제", href: "/intra/ums/montz/auditions" },
                                    {
                                        label: `캐스팅 컨택${stats.pendingContacts > 0 ? ` · 대기 ${stats.pendingContacts}건` : ""}`,
                                        sub: "캐스팅 디렉터 → 모델·배우 제안 모니터링",
                                        href: "/intra/ums/montz/contacts",
                                    },
                                    {
                                        label: `오디션 응시${stats.pendingApplications > 0 ? ` · 대기 ${stats.pendingApplications}건` : ""}`,
                                        sub: "모델·배우 → 오디션 공고 응시 모니터링",
                                        href: "/intra/ums/montz/applications",
                                    },
                                ].map(({ label, sub, href }) => (
                                    <Link key={href} href={href}
                                        className="block px-4 py-3 border border-neutral-200 hover:border-neutral-900 transition rounded">
                                        <div className="text-sm font-medium text-neutral-900">{label}</div>
                                        <div className="text-xs text-neutral-500 mt-0.5">{sub}</div>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
