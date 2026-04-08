"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Send, Eye, Edit2, Trash2, Users, Mail, Calendar, User, Globe, Search, X, Tag, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { NewsletterBlockEditor } from "@/components/intra/NewsletterBlockEditor";
import type { NewsletterBlock } from "@/lib/email/newsletter-blocks";

/* ── 타입 ── */
interface NewsletterIssue {
    id: string;
    title: string;
    content: string | null;
    blocks: NewsletterBlock[] | null;
    status: "draft" | "scheduled" | "sent";
    scheduled_at: string | null;
    sent_at: string | null;
    recipient_count: number;
    open_rate: number | null;
    click_rate: number | null;
    from_name: string | null;
    target_site_ids: string[] | null;
    target_tags: string[] | null;
    created_at: string;
}

type SubscriberType = "member" | "guest";

interface Subscriber {
    id: string;
    email: string;
    name?: string;
    type: SubscriberType;
    subscribedAt: string;
    status: "active" | "unsubscribed";
    source?: string;
    siteId?: string;
    tags: string[];
}

interface Site {
    id: string;
    name: string;
    slug: string;
}

const statusLabel: Record<string, string> = { draft: "작성중", scheduled: "예약", sent: "발송완료" };
const statusStyle: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    scheduled: "bg-neutral-200 text-neutral-700",
    sent: "bg-neutral-900 text-white",
};

type TypeFilter = "전체" | "member" | "guest";

export default function NewsletterCmsPage() {
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<"issues" | "subscribers">(
        searchParams.get("tab") === "subscribers" ? "subscribers" : "issues"
    );
    const [issues, setIssues] = useState<NewsletterIssue[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [subscriberTagsMap, setSubscriberTagsMap] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("전체");
    const [searchQuery, setSearchQuery] = useState("");

    /* 에디터 */
    const [editing, setEditing] = useState<NewsletterIssue | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editBlocks, setEditBlocks] = useState<NewsletterBlock[]>([]);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState<string | null>(null);

    /* 발송 설정 모달 */
    const [sendModal, setSendModal] = useState<NewsletterIssue | null>(null);
    const [sendFromName, setSendFromName] = useState("");
    const [sendSiteIds, setSendSiteIds] = useState<string[]>([]);
    const [sendTags, setSendTags] = useState<string[]>([]);

    /* 태그 입력 */
    const [tagInput, setTagInput] = useState<string | null>(null); // subscriber id
    const [tagValue, setTagValue] = useState("");

    const supabase = createClient();

    /* ── 데이터 로드 ── */
    const loadData = useCallback(async () => {
        setLoading(true);
        const [issueRes, subRes, siteRes, tagsRes] = await Promise.all([
            supabase.from("newsletter_issues").select("*").order("created_at", { ascending: false }),
            supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
            supabase.from("ums_sites").select("id, name, slug").eq("status", "active").order("name"),
            supabase.from("subscriber_tags").select("subscriber_id, tag"),
        ]);

        if (issueRes.data) setIssues(issueRes.data as NewsletterIssue[]);
        if (siteRes.data) setSites(siteRes.data as Site[]);

        // 태그 맵 구성
        const tMap: Record<string, string[]> = {};
        const tagSet = new Set<string>();
        if (tagsRes.data) {
            for (const r of tagsRes.data as { subscriber_id: string; tag: string }[]) {
                if (!tMap[r.subscriber_id]) tMap[r.subscriber_id] = [];
                tMap[r.subscriber_id].push(r.tag);
                tagSet.add(r.tag);
            }
        }
        setSubscriberTagsMap(tMap);
        setAllTags(Array.from(tagSet).sort());

        if (subRes.data && subRes.data.length > 0) {
            setSubscribers(
                (subRes.data as Record<string, unknown>[]).map((r) => ({
                    id: r.id as string,
                    email: r.email as string,
                    name: (r.name as string) || undefined,
                    type: "guest" as SubscriberType,
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

    /* ── 이슈 CRUD ── */
    const handleCreate = async () => {
        const { data } = await supabase
            .from("newsletter_issues")
            .insert({ title: "새 뉴스레터", status: "draft", recipient_count: 0 })
            .select()
            .single();
        if (data) {
            const issue = data as NewsletterIssue;
            setIssues((prev) => [issue, ...prev]);
            openEditor(issue);
        }
    };

    const openEditor = (issue: NewsletterIssue) => {
        setEditing(issue);
        setEditTitle(issue.title);
        setEditBlocks(issue.blocks || []);
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        await supabase
            .from("newsletter_issues")
            .update({ title: editTitle, blocks: editBlocks, updated_at: new Date().toISOString() })
            .eq("id", editing.id);
        setIssues((prev) =>
            prev.map((i) => (i.id === editing.id ? { ...i, title: editTitle, blocks: editBlocks } : i))
        );
        setSaving(false);
        setEditing(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("삭제하시겠습니까?")) return;
        await supabase.from("newsletter_issues").delete().eq("id", id);
        setIssues((prev) => prev.filter((i) => i.id !== id));
    };

    /* ── 발송 설정 모달 ── */
    const openSendModal = (issue: NewsletterIssue) => {
        setSendModal(issue);
        setSendFromName("");
        setSendSiteIds([]);
        setSendTags([]);
    };

    const toggleSiteId = (siteId: string) => {
        setSendSiteIds((prev) => prev.includes(siteId) ? prev.filter((s) => s !== siteId) : [...prev, siteId]);
    };

    const toggleSendTag = (tag: string) => {
        setSendTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    };

    // 예상 수신자 수 계산
    const estimatedRecipients = (() => {
        let filtered = subscribers.filter((s) => s.status === "active");
        if (sendSiteIds.length > 0) {
            filtered = filtered.filter((s) => s.siteId && sendSiteIds.includes(s.siteId));
        }
        if (sendTags.length > 0) {
            filtered = filtered.filter((s) => s.tags.some((t) => sendTags.includes(t)));
        }
        return filtered.length;
    })();

    const handleSendConfirm = async () => {
        if (!sendModal) return;
        if (estimatedRecipients === 0) {
            alert("대상 구독자가 없습니다.");
            return;
        }
        setSending(sendModal.id);
        try {
            const res = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issueId: sendModal.id,
                    fromName: sendFromName || undefined,
                    siteIds: sendSiteIds.length > 0 ? sendSiteIds : undefined,
                    tags: sendTags.length > 0 ? sendTags : undefined,
                }),
            });
            const data = await res.json() as { ok?: boolean; sent?: number; total?: number; errors?: string[]; error?: string };
            if (!res.ok) {
                alert(`발송 실패: ${data.error || '알 수 없는 오류'}`);
            } else {
                alert(`발송 완료: ${data.sent}/${data.total}명${data.errors?.length ? `\n오류 ${data.errors.length}건` : ''}`);
                setIssues(prev => prev.map(i => i.id === sendModal.id ? { ...i, status: 'sent' as const, recipient_count: data.sent ?? 0 } : i));
                setSendModal(null);
            }
        } catch (e) {
            alert(`발송 오류: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
        } finally {
            setSending(null);
        }
    };

    /* ── 태그 관리 ── */
    const handleAddTag = async (subscriberId: string) => {
        const tag = tagValue.trim();
        if (!tag) return;
        await supabase.from("subscriber_tags").insert({ subscriber_id: subscriberId, tag });
        setSubscriberTagsMap((prev) => ({
            ...prev,
            [subscriberId]: [...(prev[subscriberId] || []), tag],
        }));
        setSubscribers((prev) => prev.map((s) => s.id === subscriberId ? { ...s, tags: [...s.tags, tag] } : s));
        if (!allTags.includes(tag)) setAllTags((prev) => [...prev, tag].sort());
        setTagInput(null);
        setTagValue("");
    };

    const handleRemoveTag = async (subscriberId: string, tag: string) => {
        await supabase.from("subscriber_tags").delete().eq("subscriber_id", subscriberId).eq("tag", tag);
        setSubscriberTagsMap((prev) => ({
            ...prev,
            [subscriberId]: (prev[subscriberId] || []).filter((t) => t !== tag),
        }));
        setSubscribers((prev) => prev.map((s) => s.id === subscriberId ? { ...s, tags: s.tags.filter((t) => t !== tag) } : s));
    };

    const handleDeleteSubscriber = async (id: string) => {
        if (!confirm("구독자를 삭제하시겠습니까?")) return;
        await supabase.from("newsletter_subscribers").delete().eq("id", id);
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
    };

    /* ── 통계 ── */
    const activeSubscribers = subscribers.filter((s) => s.status === "active");
    const memberCount = activeSubscribers.filter((s) => s.type === "member").length;
    const guestCount = activeSubscribers.filter((s) => s.type === "guest").length;
    const sentIssues = issues.filter((n) => n.status === "sent");
    const avgOpenRate = sentIssues.length > 0
        ? sentIssues.reduce((sum, n) => sum + (n.open_rate || 0), 0) / sentIssues.length
        : 0;

    const filteredSubscribers = subscribers.filter((s) => {
        if (typeFilter !== "전체" && s.type !== typeFilter) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return s.email.toLowerCase().includes(q) || (s.name || "").toLowerCase().includes(q);
        }
        return true;
    });

    const siteNameMap = Object.fromEntries(sites.map((s) => [s.id, s.name]));

    if (loading) {
        return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;
    }

    return (
        <div>
            <PageHeader title="뉴스레터 관리" description="뉴스레터 작성 · 발송 · 구독자 관리">
                <button onClick={handleCreate} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">
                    <Plus className="h-4 w-4" /> 새 뉴스레터
                </button>
            </PageHeader>

            {/* 요약 카드 */}
            <div className="grid grid-cols-5 gap-3 mb-5">
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><Users className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-400">전체 구독자</span></div>
                    <p className="text-xl font-bold">{activeSubscribers.length}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><User className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-400">회원</span></div>
                    <p className="text-xl font-bold">{memberCount}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><Globe className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-400">비회원</span></div>
                    <p className="text-xl font-bold">{guestCount}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><Eye className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-400">평균 오픈율</span></div>
                    <p className="text-xl font-bold">{avgOpenRate.toFixed(1)}<span className="text-xs font-normal text-neutral-400 ml-1">%</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><Mail className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-400">발송 완료</span></div>
                    <p className="text-xl font-bold">{sentIssues.length}<span className="text-xs font-normal text-neutral-400 ml-1">건</span></p>
                </div>
            </div>

            {/* 탭 */}
            <div className="flex border-b border-neutral-200 mb-5">
                {([
                    { key: "issues" as const, label: "뉴스레터", count: issues.length },
                    { key: "subscribers" as const, label: "구독자", count: activeSubscribers.length },
                ]).map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={clsx("px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
                            tab === t.key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400")}>
                        {t.label} <span className="ml-1 text-[11px] text-neutral-400">({t.count})</span>
                    </button>
                ))}
            </div>

            {/* 뉴스레터 목록 */}
            {tab === "issues" && (
                <div className="space-y-2">
                    {issues.map((nl) => (
                        <div key={nl.id} className="border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusStyle[nl.status]}`}>{statusLabel[nl.status]}</span>
                                        <h3 className="text-xs font-medium truncate">{nl.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                                        {nl.from_name && <span>From: {nl.from_name}</span>}
                                        {nl.sent_at && <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> 발송: {nl.sent_at.split("T")[0]}</span>}
                                        {nl.scheduled_at && <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> 예약: {nl.scheduled_at.split("T")[0]}</span>}
                                        {nl.recipient_count > 0 && <span>{nl.recipient_count}명 수신</span>}
                                        {nl.open_rate != null && <span>오픈 {nl.open_rate}%</span>}
                                        {nl.click_rate != null && <span>클릭 {nl.click_rate}%</span>}
                                        {nl.target_tags && nl.target_tags.length > 0 && (
                                            <span className="flex items-center gap-1"><Tag className="h-2.5 w-2.5" /> {nl.target_tags.join(", ")}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => openEditor(nl)} className="p-1.5 hover:bg-neutral-100 rounded" aria-label="수정"><Edit2 className="h-3 w-3 text-neutral-400" /></button>
                                    {nl.status === "draft" && (
                                        <button
                                            onClick={() => openSendModal(nl)}
                                            disabled={sending === nl.id}
                                            className="p-1.5 hover:bg-neutral-100 rounded disabled:opacity-40"
                                            aria-label="발송"
                                            title="발송 설정"
                                        >
                                            {sending === nl.id
                                                ? <span className="h-3 w-3 border border-neutral-400 border-t-transparent rounded-full animate-spin inline-block"/>
                                                : <Send className="h-3 w-3 text-neutral-400 hover:text-neutral-700" />}
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(nl.id)} className="p-1.5 hover:bg-red-50 rounded" aria-label="삭제"><Trash2 className="h-3 w-3 text-neutral-300 hover:text-red-500" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {issues.length === 0 && <div className="text-center py-12 text-neutral-400 text-sm">뉴스레터가 없습니다.</div>}
                </div>
            )}

            {/* 구독자 목록 */}
            {tab === "subscribers" && (
                <div>
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
                                                        <input
                                                            value={tagValue}
                                                            onChange={(e) => setTagValue(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(sub.id); if (e.key === "Escape") { setTagInput(null); setTagValue(""); } }}
                                                            placeholder="태그"
                                                            className="w-16 px-1 py-0.5 text-[10px] border border-neutral-300 rounded focus:outline-none"
                                                            autoFocus
                                                            list="tag-suggestions"
                                                        />
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
            )}

            {/* 블록 에디터 모달 */}
            {editing && (
                <NewsletterBlockEditor
                    title={editTitle}
                    blocks={editBlocks}
                    onTitleChange={setEditTitle}
                    onBlocksChange={setEditBlocks}
                    onSave={handleSave}
                    onClose={() => setEditing(null)}
                    saving={saving}
                />
            )}

            {/* 발송 설정 모달 */}
            {sendModal && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setSendModal(null)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                            <div className="p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
                                <h2 className="text-sm font-semibold">발송 설정</h2>
                                <button onClick={() => setSendModal(null)} className="p-1 text-neutral-400 hover:text-neutral-900"><X className="h-5 w-5" /></button>
                            </div>
                            <div className="p-5 space-y-5">
                                {/* 뉴스레터 제목 */}
                                <div className="p-3 bg-neutral-50 rounded">
                                    <p className="text-xs text-neutral-400 mb-1">뉴스레터</p>
                                    <p className="text-sm font-medium">{sendModal.title}</p>
                                </div>

                                {/* 보내는 브랜드 */}
                                <div>
                                    <label className="text-xs text-neutral-500 mb-2 block font-medium">보내는 이름 (From)</label>
                                    <div className="relative">
                                        <select
                                            value={sendFromName}
                                            onChange={(e) => setSendFromName(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded appearance-none focus:outline-none focus:border-neutral-400 bg-white"
                                        >
                                            <option value="">Ten:One™ Universe (기본)</option>
                                            {sites.map((s) => (
                                                <option key={s.id} value={`${s.name} by Ten:One™`}>{s.name} by Ten:One™</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                                    </div>
                                    <p className="text-[11px] text-neutral-400 mt-1">발신 주소: noreply@tenone.biz (고정)</p>
                                </div>

                                {/* 타겟: 사이트 */}
                                {sites.length > 0 && (
                                    <div>
                                        <label className="text-xs text-neutral-500 mb-2 block font-medium">타겟: 구독 사이트</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSendSiteIds([])}
                                                className={clsx("px-2.5 py-1.5 text-xs rounded border transition-colors",
                                                    sendSiteIds.length === 0 ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400")}
                                            >전체</button>
                                            {sites.map((s) => (
                                                <button key={s.id}
                                                    onClick={() => toggleSiteId(s.id)}
                                                    className={clsx("px-2.5 py-1.5 text-xs rounded border transition-colors",
                                                        sendSiteIds.includes(s.id) ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400")}
                                                >{s.name}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 타겟: 태그 */}
                                {allTags.length > 0 && (
                                    <div>
                                        <label className="text-xs text-neutral-500 mb-2 block font-medium">타겟: 태그</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSendTags([])}
                                                className={clsx("px-2.5 py-1.5 text-xs rounded border transition-colors",
                                                    sendTags.length === 0 ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400")}
                                            >전체</button>
                                            {allTags.map((t) => (
                                                <button key={t}
                                                    onClick={() => toggleSendTag(t)}
                                                    className={clsx("px-2.5 py-1.5 text-xs rounded border transition-colors",
                                                        sendTags.includes(t) ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400")}
                                                >{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 예상 수신자 */}
                                <div className="p-3 bg-neutral-50 rounded flex items-center justify-between">
                                    <span className="text-xs text-neutral-500">예상 수신자</span>
                                    <span className="text-lg font-bold">{estimatedRecipients}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></span>
                                </div>
                            </div>

                            <div className="p-4 border-t border-neutral-100 flex justify-end gap-2">
                                <button onClick={() => setSendModal(null)} className="px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                                <button
                                    onClick={handleSendConfirm}
                                    disabled={sending === sendModal.id || estimatedRecipients === 0}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    {sending === sendModal.id ? "발송 중..." : "발송하기"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
