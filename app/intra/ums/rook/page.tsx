"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, MessageCircle, Loader2, LayoutGrid } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";
import { OPEN_INQUIRY_STATUSES } from "@/lib/contact-inquiry";
import { brandSiteUrl } from "@/lib/domain-registry";

interface BoardStat { slug: string; name: string; count: number }

export default function RookDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ members: 0, pendingInquiries: 0, posts: 0 });
    const [boards, setBoards] = useState<BoardStat[]>([]);

    useEffect(() => {
        const sb = createClient();
        (async () => {
            // 콘텐츠 = 통합 게시판(ums_boards·ums_posts)의 RooK 사이트 게시판 / 회원 = member_brand_joins (헌법 원칙 1)
            const { data: site } = await sb.from("ums_sites").select("id").eq("slug", "rook").single();
            const siteId = site?.id as string | undefined;
            const [members, inquiries, boardRes, postRes] = await Promise.all([
                sb.from("member_brand_joins").select("member_id", { count: "exact", head: true }).eq("brand_id", "rook").is("withdrawn_at", null),
                sb.from("contact_submissions").select("*", { count: "exact", head: true }).like("form_type", "rook\\_%").in("status", Array.from(OPEN_INQUIRY_STATUSES)),
                siteId ? sb.from("ums_boards").select("id, slug, name, sort_order").eq("site_id", siteId).order("sort_order") : Promise.resolve({ data: [] }),
                siteId ? sb.from("ums_posts").select("board_id").eq("site_id", siteId) : Promise.resolve({ data: [] }),
            ]);
            const posts = (postRes.data ?? []) as { board_id: string }[];
            const counts = new Map<string, number>();
            for (const p of posts) counts.set(p.board_id, (counts.get(p.board_id) ?? 0) + 1);
            setBoards(((boardRes.data ?? []) as { id: string; slug: string; name: string }[])
                .map(b => ({ slug: b.slug, name: b.name, count: counts.get(b.id) ?? 0 })));
            setStats({
                members: members.count ?? 0,
                pendingInquiries: inquiries.count ?? 0,
                posts: posts.length,
            });
            setLoading(false);
        })();
    }, []);

    return (
        <div>
            <PageHeader title="RooK 대시보드" description="AI 크리에이터 루크 — 작품·아티스트·자유게시판·문의 현황">
                <a href={brandSiteUrl("rook", "/rook")} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </a>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <StatCard label="가입 회원" value={`${stats.members}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="게시글" value={`${stats.posts}개`} icon={<LayoutGrid className="h-4 w-4" />} />
                        <StatCard label="미답변 문의" value={`${stats.pendingInquiries}건`}
                            sub="Contact · RooKie 지원" icon={<MessageCircle className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="빠른 이동" />
                            <div className="space-y-2">
                                {[
                                    { label: "회원 관리", sub: "RooK 가입 회원", href: "/intra/ums/rook/members" },
                                    { label: "게시글 관리", sub: "Works · Artist · Free board", href: "/intra/ums/rook/community" },
                                    { label: `미답변 문의 ${stats.pendingInquiries}건`, sub: "Contact · RooKie 지원 응대", href: "/intra/ums/rook/cs" },
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
                            <SectionTitle title="게시판별 글" />
                            <div className="space-y-2">
                                {boards.map(b => (
                                    <div key={b.slug} className="flex items-center justify-between px-4 py-2.5 border border-neutral-200 rounded text-sm">
                                        <span className="text-neutral-900">{b.name} <span className="text-xs text-neutral-400">/{b.slug}</span></span>
                                        <span className="text-neutral-500">{b.count}개</span>
                                    </div>
                                ))}
                                {boards.length === 0 && <p className="text-xs text-neutral-400">게시판 없음</p>}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
