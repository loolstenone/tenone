"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Search, X, User, Globe } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

interface Subscriber {
    id: string;
    email: string;
    name?: string;
    type: "member" | "guest";
    subscribedAt: string;
    status: "active" | "unsubscribed";
    source?: string;
    siteId?: string;
    tags: string[];
}

interface Site { id: string; name: string; slug: string; }
type TypeFilter = "전체" | "member" | "guest";

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [tagInput, setTagInput] = useState<string | null>(null);
    const [tagValue, setTagValue] = useState("");

    const supabase = createClient();

    const loadData = useCallback(async () => {
        setLoading(true);
        const [subRes, siteRes, tagsRes] = await Promise.all([
            supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
            supabase.from("ums_sites").select("id, name, slug").eq("status", "active").order("name"),
            supabase.from("subscriber_tags").select("subscriber_id, tag"),
        ]);

        if (siteRes.data) setSites(siteRes.data as Site[]);

        const tMap: Record<string, string[]> = {};
        const tagSet = new Set<string>();
        if (tagsRes.data) {
            for (const r of tagsRes.data as { subscriber_id: string; tag: string }[]) {
                if (!tMap[r.subscriber_id]) tMap[r.subscriber_id] = [];
                tMap[r.subscriber_id].push(r.tag);
                tagSet.add(r.tag);
            }
        }
        setAllTags(Array.from(tagSet).sort());

        if (subRes.data) {
            setSubscribers(
                (subRes.data as Record<string, unknown>[]).map((r) => ({
                    id: r.id as string,
                    email: r.email as string,
                    name: (r.name as string) || undefined,
                    type: "guest" as const,
                    subscribedAt: (r.created_at as string)?.split("T")[0] || "",
                    status: (r.is_active as boolean) !== false ? "active" : "unsubscribed",
                    source: (r.source as string) || undefined,
                    siteId: (r.site_id as string) || undefined,
                    tags: tMap[r.id as string] || [],
                }))
            );
        }
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAddTag = async (subscriberId: string) => {
        const tag = tagValue.trim();
        if (!tag) return;
        await supabase.from("subscriber_tags").insert({ subscriber_id: subscriberId, tag });
        setSubscribers((prev) => prev.map((s) => s.id === subscriberId ? { ...s, tags: [...s.tags, tag] } : s));
        if (!allTags.includes(tag)) setAllTags((prev) => [...prev, tag].sort());
        setTagInput(null);
        setTagValue("");
    };

    const handleRemoveTag = async (subscriberId: string, tag: string) => {
        await supabase.from("subscriber_tags").delete().eq("subscriber_id", subscriberId).eq("tag", tag);
        setSubscribers((prev) => prev.map((s) => s.id === subscriberId ? { ...s, tags: s.tags.filter((t) => t !== tag) } : s));
    };

    const handleDeleteSubscriber = async (id: string) => {
        if (!confirm("구독자를 삭제하시겠습니까?")) return;
        await supabase.from("newsletter_subscribers").delete().eq("id", id);
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
    };

    const siteNameMap = Object.fromEntries(sites.map((s) => [s.id, s.name]));

    const filteredSubscribers = subscribers.filter((s) => {
        if (typeFilter !== "전체" && s.type !== typeFilter) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return s.email.toLowerCase().includes(q) || (s.name || "").toLowerCase().includes(q);
        }
        return true;
    });

    if (loading) return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;

    return (
        <div>
            <PageHeader title="구독자" description={`전체 ${subscribers.length}명 · 활성 ${subscribers.filter((s) => s.status === "active").length}명`} />

            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="이메일 또는 이름 검색..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                </div>
                <div className="flex gap-1">
                    {([["전체", "전체"], ["member", "회원"], ["guest", "비회원"]] as [TypeFilter, string][]).map(([key, label]) => (
                        <button key={key} onClick={() => setTypeFilter(key)}
                            className={clsx("px-3 py-1.5 text-xs rounded transition-colors",
                                typeFilter === key ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}>
                            {label}
                            <span className="ml-1 text-[10px]">
                                ({key === "전체" ? subscribers.length : subscribers.filter((s) => s.type === key).length})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="border border-neutral-200 bg-white overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-neutral-100 text-neutral-400">
                            <th className="text-left p-3 font-medium">이메일</th>
                            <th className="text-left p-3 font-medium">이름</th>
                            <th className="text-left p-3 font-medium">사이트</th>
                            <th className="text-left p-3 font-medium">태그</th>
                            <th className="text-center p-3 font-medium">유형</th>
                            <th className="text-left p-3 font-medium">구독일</th>
                            <th className="text-center p-3 font-medium">상태</th>
                            <th className="text-center p-3 font-medium w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubscribers.map((sub) => (
                            <tr key={sub.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-mono text-neutral-700">{sub.email}</td>
                                <td className="p-3 text-neutral-600">{sub.name || <span className="text-neutral-300">—</span>}</td>
                                <td className="p-3 text-neutral-500 text-[11px]">
                                    {sub.siteId ? (siteNameMap[sub.siteId] || sub.siteId) : <span className="text-neutral-300">—</span>}
                                </td>
                                <td className="p-3">
                                    <div className="flex flex-wrap items-center gap-1">
                                        {sub.tags.map((t) => (
                                            <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-neutral-100 text-[10px] text-neutral-600 rounded group">
                                                {t}
                                                <button onClick={() => handleRemoveTag(sub.id, t)} className="text-neutral-300 hover:text-red-500 ml-0.5 hidden group-hover:inline">
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </span>
                                        ))}
                                        {tagInput === sub.id ? (
                                            <span className="inline-flex items-center gap-1">
                                                <input value={tagValue} onChange={(e) => setTagValue(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(sub.id); if (e.key === "Escape") { setTagInput(null); setTagValue(""); } }}
                                                    placeholder="태그" className="w-16 px-1 py-0.5 text-[10px] border border-neutral-300 rounded focus:outline-none"
                                                    autoFocus list="tag-suggestions" />
                                                <datalist id="tag-suggestions">
                                                    {allTags.filter((t) => !sub.tags.includes(t)).map((t) => <option key={t} value={t} />)}
                                                </datalist>
                                            </span>
                                        ) : (
                                            <button onClick={() => { setTagInput(sub.id); setTagValue(""); }} className="p-0.5 text-neutral-300 hover:text-neutral-600" title="태그 추가">
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600">
                                        {sub.type === "member" ? <><User className="h-2.5 w-2.5" /> 회원</> : <><Globe className="h-2.5 w-2.5" /> 비회원</>}
                                    </span>
                                </td>
                                <td className="p-3 text-neutral-400">{sub.subscribedAt}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${sub.status === "active" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                                        {sub.status === "active" ? "구독중" : "해지"}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    <button onClick={() => handleDeleteSubscriber(sub.id)} className="p-1 hover:bg-red-50 rounded" aria-label="구독자 삭제"><Trash2 className="h-3 w-3 text-neutral-300" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredSubscribers.length === 0 && (
                    <div className="p-6 text-center text-xs text-neutral-400">검색 결과가 없습니다.</div>
                )}
            </div>
        </div>
    );
}
