"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Eye, EyeOff, Star, Loader2 } from "lucide-react";
import { Card, SectionTitle } from "@/components/intra/IntraUI";

interface Article {
    id: string; slug: string; title: string; category: string;
    is_published: boolean; is_featured: boolean;
    published_at: string; author_name: string | null;
    status?: string; created_at?: string;
}

type Mode = "published" | "review";

const CATEGORY_STYLE: Record<string, string> = {
    interview: "bg-violet-50 text-violet-700",
    case: "bg-blue-50 text-blue-700",
    report: "bg-amber-50 text-amber-700",
    cover: "bg-rose-50 text-rose-700",
};

export default function MADLeagueArticlesPage() {
    const [token, setToken] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>("review");
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        const { createClient } = require("@/lib/supabase/client");
        createClient().auth.getSession().then(({ data: { session } }: { data: { session: { access_token?: string } | null } }) => {
            if (session?.access_token) setToken(session.access_token);
        });
    }, []);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        const url = mode === "review" ? "/api/madleague/admin/articles?status=pending_review" : "/api/madleague/admin/articles";
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setArticles(data.articles ?? []);
        setLoading(false);
    }, [token, mode]);

    useEffect(() => { load(); }, [load]);

    async function toggleArticle(id: string, field: "is_published" | "is_featured", value: boolean) {
        if (!token) return;
        setProcessing(id);
        await fetch("/api/madleague/admin/articles", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, [field]: value }),
        });
        setArticles(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
        setProcessing(null);
    }

    async function reviewArticle(id: string, action: "publish" | "reject") {
        if (!token) return;
        let reason: string | null = null;
        if (action === "reject") {
            reason = prompt("반려 사유를 입력하세요 (작성자에게 노출됩니다)");
            if (reason === null) return;
        }
        setProcessing(id);
        await fetch("/api/madleague/admin/articles", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, action, reject_reason: reason }),
        });
        setArticles(prev => prev.filter(a => a.id !== id));
        setProcessing(null);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">콘텐츠 관리</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">MADzine 아티클 발행 · 투고 검토</p>
                </div>
            </div>

            <div className="flex items-center gap-1 mb-4">
                {(["review", "published"] as Mode[]).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${mode === m ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                        {m === "review" ? "투고 검토 대기" : "발행 아티클 관리"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : mode === "review" ? (
                <Card>
                    <SectionTitle title={`투고 검토 큐 (${articles.length}건)`} />
                    {articles.length === 0 ? (
                        <div className="text-center py-10 text-sm text-neutral-400">검토 대기 중인 글이 없습니다.</div>
                    ) : (
                        <div className="space-y-3">
                            {articles.map(a => (
                                <div key={a.id} className="border border-neutral-200 p-4 rounded">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${CATEGORY_STYLE[a.category] ?? "bg-neutral-100 text-neutral-700"}`}>
                                                    {a.category}
                                                </span>
                                                <span className="text-xs text-neutral-400">
                                                    {a.author_name ?? "익명"} · {a.created_at && new Date(a.created_at).toLocaleDateString("ko-KR")}
                                                </span>
                                            </div>
                                            <div className="font-semibold text-neutral-900">{a.title}</div>
                                            <Link href={`/madleague/madzine/${a.slug}`} target="_blank"
                                                className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                미리보기 <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button disabled={processing === a.id} onClick={() => reviewArticle(a.id, "publish")}
                                                className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded transition">
                                                <Eye className="h-3.5 w-3.5" /> 발행
                                            </button>
                                            <button disabled={processing === a.id} onClick={() => reviewArticle(a.id, "reject")}
                                                className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 border border-neutral-300 hover:border-red-500 hover:text-red-600 text-neutral-600 rounded transition">
                                                반려
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            ) : (
                <Card>
                    <SectionTitle title={`발행 아티클 (${articles.length}건)`} />
                    {articles.length === 0 ? (
                        <div className="text-center py-10 text-sm text-neutral-400">발행된 아티클이 없습니다.</div>
                    ) : (
                        <div className="space-y-1">
                            {articles.map(a => (
                                <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-neutral-50 last:border-0">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${CATEGORY_STYLE[a.category] ?? "bg-neutral-100 text-neutral-700"}`}>
                                        {a.category}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-neutral-800 truncate">{a.title}</div>
                                        <div className="text-xs text-neutral-400">{a.author_name ?? "편집부"} · {new Date(a.published_at).toLocaleDateString("ko-KR")}</div>
                                    </div>
                                    <button disabled={processing === a.id} onClick={() => toggleArticle(a.id, "is_featured", !a.is_featured)}
                                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded transition ${a.is_featured ? "border-amber-500 text-amber-600 bg-amber-50" : "border-neutral-200 text-neutral-400 hover:border-amber-500"}`}>
                                        <Star className="h-3 w-3" fill={a.is_featured ? "currentColor" : "none"} />
                                    </button>
                                    <button disabled={processing === a.id} onClick={() => toggleArticle(a.id, "is_published", !a.is_published)}
                                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded transition ${a.is_published ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-neutral-200 text-neutral-400 hover:border-neutral-900"}`}>
                                        {a.is_published ? <><Eye className="h-3 w-3" /> 발행</> : <><EyeOff className="h-3 w-3" /> 비공개</>}
                                    </button>
                                    <Link href={`/madleague/madzine/${a.slug}`} target="_blank" className="text-neutral-400 hover:text-neutral-700">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
