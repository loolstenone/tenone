"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, Trophy, GraduationCap, Eye, Star, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Club { id: string; slug: string; name: string; region: string; color: string | null; }

export default function MADLeagueDashboard() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [stats, setStats] = useState({
        totalClubs: 0, pendingApps: 0, pendingHero: 0,
        publishedArticles: 0, totalCrowns: 0, pendingReview: 0,
    });

    useEffect(() => {
        const sb = createClient();
        sb.auth.getSession().then(res => {
            const session = res.data.session;
            if (session?.access_token) setToken(session.access_token);
            else setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!token) return;
        (async () => {
            setLoading(true);
            const sb = createClient();
            const [clubRes, crownRes, pubRes, appsRes, heroRes, reviewRes] = await Promise.all([
                sb.from("mad_clubs").select("id, slug, name, region, color").eq("status", "active").order("sort_order"),
                sb.from("mad_competition_results").select("*", { count: "exact", head: true }).eq("is_crown", true),
                sb.from("mad_articles").select("*", { count: "exact", head: true }).eq("is_published", true),
                fetch("/api/madleague/admin/applications?status=pending", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
                fetch("/api/madleague/admin/hero?status=pending", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
                fetch("/api/madleague/admin/articles?status=pending_review", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            ]);
            setClubs((clubRes.data ?? []) as Club[]);
            setStats({
                totalClubs: (clubRes.data ?? []).length,
                pendingApps: appsRes.applications?.length ?? 0,
                pendingHero: heroRes.applications?.length ?? 0,
                publishedArticles: pubRes.count ?? 0,
                totalCrowns: crownRes.count ?? 0,
                pendingReview: reviewRes.articles?.length ?? 0,
            });
            setLoading(false);
        })();
    }, [token]);

    return (
        <div>
            <PageHeader title="MAD League 대시보드" description="대학 동아리 연합 운영 현황">
                <Link href="/madleague" target="_blank"
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
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                        <StatCard label="공식 동아리" value={`${stats.totalClubs}개`} sub="전국 7개 권역" icon={<GraduationCap className="h-4 w-4" />} />
                        <StatCard label="지원서 대기" value={`${stats.pendingApps}건`} sub="승인 필요" icon={<Users className="h-4 w-4" />} />
                        <StatCard label="HeRo 신청" value={`${stats.pendingHero}건`} sub="대기 중" icon={<Star className="h-4 w-4" />} />
                        <StatCard label="투고 검토" value={`${stats.pendingReview}건`} sub="MADzine" icon={<Eye className="h-4 w-4" />} />
                        <StatCard label="발행 아티클" value={`${stats.publishedArticles}개`} sub="MADzine" icon={<Eye className="h-4 w-4" />} />
                        <StatCard label="MAD Crown" value={`${stats.totalCrowns}개`} sub="누적" icon={<Trophy className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="동아리 현황" />
                            <div className="space-y-2">
                                {clubs.map(c => (
                                    <div key={c.slug} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                                        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: c.color ?? "#EC1D25" }} />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-neutral-800">{c.name}</div>
                                            <div className="text-xs text-neutral-500">{c.region}</div>
                                        </div>
                                        <Link href={`/madleague/clubs/${c.slug}`} target="_blank" className="text-xs text-neutral-400 hover:text-neutral-700">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <SectionTitle title="처리 대기" />
                            <div className="space-y-2">
                                {[
                                    { label: `지원서 심사 대기 ${stats.pendingApps}건`, sub: "새 매드리거 지원서 승인·반려", href: "/intra/ums/madleague/applications" },
                                    { label: `HeRo 상담 신청 ${stats.pendingHero}건`, sub: "커리어 상담 신청자 관리", href: "/intra/ums/madleague/applications" },
                                    { label: `MADzine 투고 검토 ${stats.pendingReview}건`, sub: "발행 승인·반려", href: "/intra/ums/madleague/articles" },
                                ].map(({ label, sub, href }) => (
                                    <Link key={href + label} href={href}
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
