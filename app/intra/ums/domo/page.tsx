"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, ClipboardList, MapPin, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

export default function DomoDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ members: 0, pendingApplications: 0, meetups: 0, pendingInquiries: 0 });

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["domo"]),
            sb.from("domo_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
            sb.from("meetups").select("*", { count: "exact", head: true }).eq("brand_id", "domo"),
            sb.from("inquiries").select("*", { count: "exact", head: true }).eq("brand_id", "domo").eq("status", "pending"),
        ]).then(([members, apps, meetups, inquiries]) => {
            setStats({
                members: members.count ?? 0,
                pendingApplications: apps.count ?? 0,
                meetups: meetups.count ?? 0,
                pendingInquiries: inquiries.count ?? 0,
            });
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <PageHeader title="Domo 대시보드" description="시니어 비즈니스 네트워킹 플랫폼 운영 현황">
                <Link href="/domo" target="_blank"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </Link>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="승인 회원" value={`${stats.members}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="심사 대기" value={`${stats.pendingApplications}건`}
                            sub="승인 필요" icon={<ClipboardList className="h-4 w-4" />} />
                        <StatCard label="모임" value={`${stats.meetups}개`} icon={<MapPin className="h-4 w-4" />} />
                        <StatCard label="미답변 문의" value={`${stats.pendingInquiries}건`} icon={<ClipboardList className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="빠른 이동" />
                            <div className="space-y-2">
                                {[
                                    { label: `심사 대기 ${stats.pendingApplications}건`, sub: "가입 신청 심사 · 승인", href: "/intra/ums/domo/applications" },
                                    { label: "승인 회원 관리", sub: "Domo 승인 멤버 관리", href: "/intra/ums/domo/members" },
                                    { label: `모임 관리 ${stats.meetups}개`, sub: "비즈니스 모임 · 네트워킹 이벤트", href: "/intra/ums/domo/meetups" },
                                    { label: `미답변 문의 ${stats.pendingInquiries}건`, sub: "고객 문의 응대", href: "/intra/ums/domo/cs" },
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
                            <SectionTitle title="Domo 소개" />
                            <div className="space-y-3">
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">승인 멤버십 모델</p>
                                    <p>가입 신청 → 운영진 심사 → 승인 후 이용 가능</p>
                                </div>
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">시니어 비즈니스맨 네트워크</p>
                                    <p>경험 있는 비즈니스 리더 간 고품격 네트워킹</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
