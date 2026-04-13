"use client";

import { useState, useEffect } from "react";
import { Mail, Users, TrendingUp, RefreshCw, Plus, Loader2, Search, X, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";

interface Subscriber {
    id: string;
    email: string;
    name: string | null;
    is_active: boolean;
    source: string | null;
    created_at: string;
}

interface NewsletterIssue {
    id: string;
    title: string;
    summary: string;
    category: string;
    status: string;
    relevance_score: number;
    published_at: string | null;
    created_at: string;
    agent_name: string | null;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-white border border-neutral-200 p-4">
            <p className="text-xs text-neutral-400 mb-1">{label}</p>
            <p className="text-lg font-bold">{value}</p>
            {sub && <p className="text-[11px] text-neutral-400 mt-0.5">{sub}</p>}
        </div>
    );
}

export default function MindleNewsletterPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [issues, setIssues] = useState<NewsletterIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"overview" | "subscribers" | "issues">("overview");
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);
    const [collecting, setCollecting] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [subRes, issueRes] = await Promise.all([
            supabase.from("newsletter_subscribers")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(200),
            supabase.from("mindle_trends")
                .select("id, title, summary, category, status, relevance_score, published_at, created_at, agent_name")
                .order("created_at", { ascending: false })
                .limit(30),
        ]);
        if (subRes.data) setSubscribers(subRes.data as Subscriber[]);
        if (issueRes.data) setIssues(issueRes.data as NewsletterIssue[]);
        setLoading(false);
    };

    const handleAddSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.trim()) return;
        setSaving(true);
        const { data, error } = await supabase.from("newsletter_subscribers").insert({
            email: newEmail.trim().toLowerCase(),
            name: newName.trim() || null,
            is_active: true,
            source: "intra_manual",
        }).select().single();
        if (!error && data) {
            setSubscribers(prev => [data as Subscriber, ...prev]);
            setNewEmail(""); setNewName(""); setShowAdd(false);
        }
        setSaving(false);
    };

    const handleUnsubscribe = async (id: string) => {
        await supabase.from("newsletter_subscribers").update({ is_active: false }).eq("id", id);
        setSubscribers(prev => prev.map(s => s.id === id ? { ...s, is_active: false } : s));
    };

    const handleDelete = async (id: string) => {
        if (!confirm("구독자를 삭제하시겠습니까?")) return;
        await supabase.from("newsletter_subscribers").delete().eq("id", id);
        setSubscribers(prev => prev.filter(s => s.id !== id));
    };

    const handleCollectNow = async () => {
        setCollecting(true);
        try {
            await fetch("/api/cron/newsletter-crawl", {
                method: "POST",
                headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_KEY || ""}` },
            });
            await loadData();
        } catch { /* ignore */ } finally {
            setCollecting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
    );

    const activeCount = subscribers.filter(s => s.is_active).length;
    const publishedIssues = issues.filter(i => i.status === "published").length;
    const filteredSubs = subscribers.filter(s =>
        !search || s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.name || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5">
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
                    <div className="bg-white w-full max-w-sm mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                            <h2 className="text-sm font-semibold">구독자 추가</h2>
                            <button onClick={() => setShowAdd(false)}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleAddSubscriber} className="p-5 space-y-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">이메일 *</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">이름</label>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowAdd(false)}
                                    className="px-4 py-2 text-xs border border-neutral-200 hover:bg-neutral-50">취소</button>
                                <button type="submit" disabled={saving}
                                    className="px-4 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-40 flex items-center gap-1.5">
                                    {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                                    추가
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <PageHeader title="Mindle 뉴스레터" description="구독자 관리 및 뉴스레터 이슈 현황">
                <div className="flex gap-2">
                    <button onClick={handleCollectNow} disabled={collecting}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-40">
                        <RefreshCw className={`h-3 w-3 ${collecting ? "animate-spin" : ""}`} />
                        지금 수집
                    </button>
                    <button onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                        <Plus className="h-3 w-3" /> 구독자 추가
                    </button>
                </div>
            </PageHeader>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                <StatCard label="전체 구독자" value={`${subscribers.length}명`} sub={`활성 ${activeCount}명`} />
                <StatCard label="이번 달 신규" value={`${subscribers.filter(s => s.created_at?.startsWith(new Date().toISOString().slice(0, 7))).length}명`} />
                <StatCard label="발행된 트렌드" value={`${publishedIssues}건`} sub="mindle_trends" />
                <StatCard label="전체 트렌드" value={`${issues.length}건`} sub="수집+발행" />
            </div>

            {/* 탭 */}
            <div className="border-b border-neutral-200 flex gap-0">
                {([["overview", "개요"], ["subscribers", `구독자 (${subscribers.length})`], ["issues", `트렌드 이슈 (${issues.length})`]] as [typeof tab, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${tab === key ? "border-neutral-800 text-neutral-800" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* 개요 탭 */}
            {tab === "overview" && (
                <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white border border-neutral-200 p-4">
                        <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-neutral-400" /> 최근 구독자
                        </h3>
                        <div className="space-y-2">
                            {subscribers.slice(0, 8).map(s => (
                                <div key={s.id} className="flex items-center justify-between text-xs">
                                    <div>
                                        <span className="font-medium">{s.email}</span>
                                        {s.name && <span className="text-neutral-400 ml-1.5">· {s.name}</span>}
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${s.is_active ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-400"}`}>
                                        {s.is_active ? "활성" : "해지"}
                                    </span>
                                </div>
                            ))}
                            {subscribers.length === 0 && <p className="text-xs text-neutral-400">구독자 없음</p>}
                        </div>
                    </div>
                    <div className="bg-white border border-neutral-200 p-4">
                        <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-neutral-400" /> 최근 트렌드 이슈
                        </h3>
                        <div className="space-y-2">
                            {issues.slice(0, 8).map(i => (
                                <div key={i.id} className="text-xs">
                                    <p className="font-medium text-neutral-800 truncate">{i.title}</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">
                                        {i.category} · 점수 {i.relevance_score} · {i.created_at?.slice(0, 10)}
                                    </p>
                                </div>
                            ))}
                            {issues.length === 0 && <p className="text-xs text-neutral-400">트렌드 이슈 없음</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* 구독자 탭 */}
            {tab === "subscribers" && (
                <div>
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="이메일 또는 이름 검색..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                    </div>
                    <div className="border border-neutral-200 bg-white">
                        {filteredSubs.length === 0 ? (
                            <div className="py-12 text-center text-sm text-neutral-400">구독자가 없습니다</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                        <th className="text-left p-3 font-medium">이메일</th>
                                        <th className="text-left p-3 font-medium">이름</th>
                                        <th className="text-left p-3 font-medium">소스</th>
                                        <th className="text-left p-3 font-medium">가입일</th>
                                        <th className="text-center p-3 font-medium">상태</th>
                                        <th className="p-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubs.map(s => (
                                        <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                                            <td className="p-3 font-medium">{s.email}</td>
                                            <td className="p-3 text-neutral-500">{s.name || "—"}</td>
                                            <td className="p-3"><span className="text-[11px] px-1.5 py-0.5 bg-neutral-100 rounded">{s.source || "—"}</span></td>
                                            <td className="p-3 text-neutral-400 text-xs">{s.created_at?.slice(0, 10)}</td>
                                            <td className="p-3 text-center">
                                                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${s.is_active ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-400"}`}>
                                                    {s.is_active ? "활성" : "해지"}
                                                </span>
                                            </td>
                                            <td className="p-3 flex items-center gap-1 justify-end">
                                                {s.is_active && (
                                                    <button onClick={() => handleUnsubscribe(s.id)}
                                                        className="text-[10px] text-neutral-400 hover:text-neutral-600 px-2 py-1 border border-neutral-200 hover:bg-neutral-50">
                                                        해지
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(s.id)}
                                                    className="p-1 text-neutral-300 hover:text-red-500">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* 트렌드 이슈 탭 */}
            {tab === "issues" && (
                <div className="border border-neutral-200 bg-white">
                    {issues.length === 0 ? (
                        <div className="py-12 text-center text-sm text-neutral-400">트렌드 이슈가 없습니다</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                    <th className="text-left p-3 font-medium">제목</th>
                                    <th className="text-left p-3 font-medium">카테고리</th>
                                    <th className="text-right p-3 font-medium">점수</th>
                                    <th className="text-left p-3 font-medium">수집일</th>
                                    <th className="text-center p-3 font-medium">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.map(i => (
                                    <tr key={i.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                                        <td className="p-3">
                                            <p className="font-medium text-neutral-800 truncate max-w-xs">{i.title}</p>
                                            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{i.summary}</p>
                                        </td>
                                        <td className="p-3"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 rounded">{i.category}</span></td>
                                        <td className="p-3 text-right text-xs font-medium">{i.relevance_score}</td>
                                        <td className="p-3 text-neutral-400 text-xs">{i.created_at?.slice(0, 10)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                                                i.status === "published" ? "bg-neutral-900 text-white" :
                                                i.status === "draft" ? "bg-neutral-100 text-neutral-500" :
                                                "bg-neutral-200 text-neutral-400"
                                            }`}>{i.status === "published" ? "발행" : i.status === "draft" ? "초안" : i.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
