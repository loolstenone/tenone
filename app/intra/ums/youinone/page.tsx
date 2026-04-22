"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, ClipboardList, FolderKanban, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

export default function YouInOneDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ members: 0, pending: 0, activeProjects: 0, pendingInquiries: 0 });

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["youinone"]),
            sb.from("member_capability_roles").select("*", { count: "exact", head: true }).eq("brand_id", "youinone").eq("capability_key", "membership").eq("role", "applicant").is("valid_until", null),
            sb.from("wio_projects").select("*", { count: "exact", head: true }).eq("tenant_id", "youinone").eq("status", "active"),
            sb.from("inquiries").select("*", { count: "exact", head: true }).eq("brand_id", "youinone").eq("status", "pending"),
        ]).then(([members, pending, projects, inquiries]) => {
            setStats({
                members: members.count ?? 0,
                pending: pending.count ?? 0,
                activeProjects: projects.count ?? 0,
                pendingInquiries: inquiries.count ?? 0,
            });
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <PageHeader title="YouInOne 대시보드" description="크루 네트워크 · 프로젝트 협업 플랫폼 운영 현황">
                <Link href="/youinone" target="_blank"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </Link>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="승인 크루" value={`${stats.members}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="심사 대기" value={`${stats.pending}건`}
                            sub="승인 필요" icon={<ClipboardList className="h-4 w-4" />} />
                        <StatCard label="활성 프로젝트" value={`${stats.activeProjects}개`} icon={<FolderKanban className="h-4 w-4" />} />
                        <StatCard label="미답변 문의" value={`${stats.pendingInquiries}건`} icon={<ClipboardList className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="빠른 이동" />
                            <div className="space-y-2">
                                {[
                                    { label: `심사 대기 ${stats.pending}건`, sub: "크루 신청 검토 · 승인", href: "/intra/ums/youinone/applications" },
                                    { label: `승인 크루 ${stats.members}명`, sub: "YouInOne 크루 관리", href: "/intra/ums/youinone/members" },
                                    { label: `미답변 문의 ${stats.pendingInquiries}건`, sub: "고객 문의 응대", href: "/intra/ums/youinone/cs" },
                                ].map(({ label, sub, href }) => (
                                    <Link key={href} href={href}
                                        className="block px-4 py-3 border border-neutral-200 hover:border-neutral-900 transition rounded">
                                        <div className="text-sm font-medium text-neutral-900">{label}</div>
                                        <div className="text-xs text-neutral-500 mt-0.5">{sub}</div>
                                    </Link>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <SectionTitle title="YouInOne 소개" />
                            <div className="space-y-3">
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">승인 멤버십 모델</p>
                                    <p>크루 신청 → 운영진 심사 → 승인 후 프로젝트 참여</p>
                                </div>
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">WIO 프로젝트 인프라</p>
                                    <p>시수 기록 · 정산 · 협업 도구 공유 인프라 사용</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
