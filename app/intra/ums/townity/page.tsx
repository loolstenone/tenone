"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, MapPin, MessageCircle, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

export default function TownityDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ members: 0, meetups: 0, pendingInquiries: 0 });

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["townity"]),
            sb.from("meetups").select("*", { count: "exact", head: true }).eq("brand_id", "townity"),
            sb.from("inquiries").select("*", { count: "exact", head: true }).eq("brand_id", "townity").eq("status", "pending"),
        ]).then(([members, meetups, inquiries]) => {
            setStats({
                members: members.count ?? 0,
                meetups: meetups.count ?? 0,
                pendingInquiries: inquiries.count ?? 0,
            });
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <PageHeader title="Townity 대시보드" description="로컬 커뮤니티 · 모임 운영 현황">
                <Link href="/townity" target="_blank"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </Link>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <StatCard label="전체 회원" value={`${stats.members}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="모임" value={`${stats.meetups}개`} icon={<MapPin className="h-4 w-4" />} />
                        <StatCard label="미답변 문의" value={`${stats.pendingInquiries}건`}
                            sub="응답 필요" icon={<MessageCircle className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="빠른 이동" />
                            <div className="space-y-2">
                                {[
                                    { label: "회원 관리", sub: "Townity 가입 회원 관리", href: "/intra/ums/townity/members" },
                                    { label: `모임 관리 ${stats.meetups}개`, sub: "로컬 모임 · 이벤트 관리", href: "/intra/ums/townity/meetups" },
                                    { label: "커뮤니티", sub: "게시글 · 커뮤니티 관리", href: "/intra/ums/townity/community" },
                                    { label: `미답변 문의 ${stats.pendingInquiries}건`, sub: "고객 문의 응대", href: "/intra/ums/townity/cs" },
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
                            <SectionTitle title="Townity 소개" />
                            <div className="space-y-3">
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">로컬 커뮤니티 플랫폼</p>
                                    <p>동네 · 지역 기반 모임 연결 서비스</p>
                                </div>
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">오픈 + 모임(meetup) 모델</p>
                                    <p>자유 가입 + 모임 개설자/참가자 구분 운영</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
