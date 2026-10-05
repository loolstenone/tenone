"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, FolderKanban, Inbox, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";
import { normalizePost, type IntraPostRow } from "@/lib/intra-board";

export default function TenoneDashboard() {
    const [loading, setLoading] = useState(true);
    const [works, setWorks] = useState<IntraPostRow[]>([]);
    const [openInquiries, setOpenInquiries] = useState(0);

    useEffect(() => {
        Promise.all([
            fetch("/api/board/posts?site=tenone&board=works&status=all&limit=500")
                .then(r => (r.ok ? r.json() : { posts: [] }))
                .then(d => ((d.posts ?? []) as Record<string, unknown>[]).map(normalizePost).filter(p => p.status !== "deleted")),
            createClient().from("contact_submissions").select("*", { count: "exact", head: true })
                .like("form_type", "tenone\_%").in("status", ["new", "pending"]),
        ]).then(([w, inq]) => {
            setWorks(w);
            setOpenInquiries(inq.count ?? 0);
            setLoading(false);
        });
    }, []);

    const published = works.filter(w => w.status === "published").length;
    const recent = [...works].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

    return (
        <div>
            <PageHeader title="TenOne 대시보드" description="www.tenone.biz — 유니버스 대표 사이트 운영 현황">
                <Link href="/" target="_blank" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </Link>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <StatCard label="Works 발행" value={`${published}건`} sub={`전체 ${works.length}건`} icon={<FolderKanban className="h-4 w-4" />} />
                        <StatCard label="미답변 문의" value={`${openInquiries}건`} icon={<Inbox className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="최근 Works" action="전체 보기" actionHref="/intra/ums/tenone/works" />
                            {recent.length === 0 ? (
                                <p className="text-sm text-neutral-400 py-4 text-center">글 없음</p>
                            ) : (
                                <div className="space-y-2">
                                    {recent.map(w => (
                                        <Link key={w.id} href={`/intra/ums/tenone/works/edit?id=${w.id}`}
                                            className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0 hover:bg-neutral-50">
                                            <span className="text-sm font-medium truncate">{w.title}</span>
                                            <span className="text-xs text-neutral-400 shrink-0 ml-3">{w.created_at.substring(0, 10)}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card>
                            <SectionTitle title="빠른 이동" />
                            <div className="space-y-2">
                                {[
                                    { label: "Works 새 글 작성", sub: "포트폴리오 추가", href: "/intra/ums/tenone/works/edit" },
                                    { label: `미답변 문의 ${openInquiries}건`, sub: "파트너·크루·프로젝트 문의", href: "/intra/ums/tenone/cs" },
                                ].map(({ label, sub, href }) => (
                                    <Link key={href} href={href} className="block px-4 py-3 border border-neutral-200 hover:border-neutral-900 transition rounded">
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
