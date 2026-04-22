"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, ClipboardList, GraduationCap, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

export default function MadleapDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ members: 0, pending: 0, pendingInquiries: 0 });
    const [recentApps, setRecentApps] = useState<{ id: string; name: string; university: string | null; major: string | null; created_at: string; status: string }[]>([]);

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("mad_applications").select("*", { count: "exact", head: true }).eq("brand_id", "madleap").eq("status", "accepted"),
            sb.from("mad_applications").select("*", { count: "exact", head: true }).eq("brand_id", "madleap").eq("status", "pending"),
            sb.from("inquiries").select("*", { count: "exact", head: true }).eq("brand_id", "madleap").eq("status", "pending"),
            sb.from("mad_applications").select("id, name, university, major, created_at, status").eq("brand_id", "madleap").order("created_at", { ascending: false }).limit(5),
        ]).then(([members, pending, inquiries, recent]) => {
            setStats({
                members: members.count ?? 0,
                pending: pending.count ?? 0,
                pendingInquiries: inquiries.count ?? 0,
            });
            setRecentApps((recent.data ?? []) as { id: string; name: string; university: string | null; major: string | null; created_at: string; status: string }[]);
            setLoading(false);
        });
    }, []);

    const STATUS_C: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700",
        accepted: "bg-emerald-50 text-emerald-700",
        rejected: "bg-neutral-100 text-neutral-500",
    };
    const STATUS_L: Record<string, string> = { pending: "대기", accepted: "승인", rejected: "거절" };

    return (
        <div>
            <PageHeader title="MADLeap 대시보드" description="MADLeap 교육 프로그램 운영 현황">
                <Link href="/madleap" target="_blank"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </Link>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <StatCard label="승인 회원" value={`${stats.members}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="심사 대기" value={`${stats.pending}건`}
                            sub="승인 필요" icon={<ClipboardList className="h-4 w-4" />} />
                        <StatCard label="미답변 문의" value={`${stats.pendingInquiries}건`} icon={<GraduationCap className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="최근 신청" action="전체 보기" actionHref="/intra/ums/madleap/applications" />
                            {recentApps.length === 0 ? (
                                <p className="text-sm text-neutral-400 py-4 text-center">신청 내역 없음</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentApps.map(a => (
                                        <div key={a.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{a.name}</p>
                                                <p className="text-xs text-neutral-400">{[a.university, a.major].filter(Boolean).join(" · ")}</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_C[a.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                                                {STATUS_L[a.status] ?? a.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card>
                            <SectionTitle title="빠른 이동" />
                            <div className="space-y-2">
                                {[
                                    { label: `심사 대기 ${stats.pending}건`, sub: "가입 신청 검토 · 승인", href: "/intra/ums/madleap/applications" },
                                    { label: `승인 회원 ${stats.members}명`, sub: "MADLeap 멤버 관리", href: "/intra/ums/madleap/members" },
                                    { label: "교육 관리", sub: "교육 과정 · 스터디룸 관리", href: "/intra/ums/madleap/courses" },
                                    { label: `미답변 문의 ${stats.pendingInquiries}건`, sub: "고객 문의 응대", href: "/intra/ums/madleap/cs" },
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
