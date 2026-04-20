"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Send, Edit2, Trash2, Calendar, Tag, X, ChevronDown, BarChart3 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/intra/IntraUI";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { NewsletterBlockEditor } from "@/components/intra/NewsletterBlockEditor";
import type { NewsletterBlock } from "@/lib/email/newsletter-blocks";

interface NewsletterIssue {
    id: string;
    title: string;
    content: string | null;
    blocks: NewsletterBlock[] | null;
    status: "draft" | "scheduled" | "sending" | "sent";
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

interface Site { id: string; name: string; slug: string; }
interface Subscriber { id: string; status: string; siteId?: string; tags: string[]; }

const statusLabel: Record<string, string> = { draft: "작성중", scheduled: "예약", sending: "발송중", sent: "발송완료" };
const statusStyle: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    scheduled: "bg-blue-100 text-blue-700",
    sending: "bg-amber-100 text-amber-700 animate-pulse",
    sent: "bg-neutral-900 text-white",
};

export default function IssuesPage() {
    const [issues, setIssues] = useState<NewsletterIssue[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState<NewsletterIssue | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editBlocks, setEditBlocks] = useState<NewsletterBlock[]>([]);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState<string | null>(null);

    const [sendModal, setSendModal] = useState<NewsletterIssue | null>(null);
    const [sendFromName, setSendFromName] = useState("");
    const [sendSiteIds, setSendSiteIds] = useState<string[]>([]);
    const [sendTags, setSendTags] = useState<string[]>([]);
    const [testEmails, setTestEmails] = useState("");
    const [scheduleAt, setScheduleAt] = useState("");

    const supabase = createClient();

    const loadData = useCallback(async () => {
        setLoading(true);
        const [issueRes, siteRes, subRes, tagsRes] = await Promise.all([
            supabase.from("newsletter_issues").select("*").order("created_at", { ascending: false }),
            supabase.from("ums_sites").select("id, name, slug").eq("status", "active").order("name"),
            supabase.from("newsletter_subscribers").select("id, is_active, site_id").eq("is_active", true),
            supabase.from("subscriber_tags").select("subscriber_id, tag"),
        ]);
        if (issueRes.data) setIssues(issueRes.data as NewsletterIssue[]);
        if (siteRes.data) setSites(siteRes.data as Site[]);

        const tagSet = new Set<string>();
        const tMap: Record<string, string[]> = {};
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
                    status: "active",
                    siteId: (r.site_id as string) || undefined,
                    tags: tMap[r.id as string] || [],
                }))
            );
        }
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleCreate = async () => {
        const { data } = await supabase
            .from("newsletter_issues")
            .insert({ title: "새 뉴스레터", status: "draft", recipient_count: 0 })
            .select().single();
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
        await supabase.from("newsletter_issues")
            .update({ title: editTitle, blocks: editBlocks, updated_at: new Date().toISOString() })
            .eq("id", editing.id);
        setIssues((prev) => prev.map((i) => i.id === editing.id ? { ...i, title: editTitle, blocks: editBlocks } : i));
        setSaving(false);
        setEditing(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("삭제하시겠습니까?")) return;
        await supabase.from("newsletter_issues").delete().eq("id", id);
        setIssues((prev) => prev.filter((i) => i.id !== id));
    };

    const openSendModal = (issue: NewsletterIssue) => {
        setSendModal(issue);
        setSendFromName("");
        setSendSiteIds([]);
        setSendTags([]);
        setTestEmails("");
        setScheduleAt("");
    };

    const handleTestSend = async () => {
        if (!sendModal) return;
        const emails = testEmails.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
        if (emails.length === 0) { alert("테스트할 이메일을 입력해주세요."); return; }
        setSending(sendModal.id);
        try {
            const res = await fetch("/api/newsletter/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    issueId: sendModal.id,
                    fromName: sendFromName || undefined,
                    testEmails: emails,
                }),
            });
            const data = await res.json() as { ok?: boolean; sent?: number; error?: string };
            if (!res.ok) alert(`테스트 발송 실패: ${data.error || "알 수 없는 오류"}`);
            else alert(`테스트 발송 완료: ${data.sent}명`);
        } catch (e) {
            alert(`테스트 발송 오류: ${e instanceof Error ? e.message : "알 수 없는 오류"}`);
        } finally {
            setSending(null);
        }
    };

    const toggleSiteId = (siteId: string) =>
        setSendSiteIds((prev) => prev.includes(siteId) ? prev.filter((s) => s !== siteId) : [...prev, siteId]);

    const toggleSendTag = (tag: string) =>
        setSendTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

    const estimatedRecipients = (() => {
        let filtered = subscribers;
        if (sendSiteIds.length > 0) filtered = filtered.filter((s) => s.siteId && sendSiteIds.includes(s.siteId));
        if (sendTags.length > 0) filtered = filtered.filter((s) => s.tags.some((t) => sendTags.includes(t)));
        return filtered.length;
    })();

    const handleSendConfirm = async () => {
        if (!sendModal) return;
        if (estimatedRecipients === 0) { alert("대상 구독자가 없습니다."); return; }
        const isScheduled = !!scheduleAt;
        if (!isScheduled) {
            if (!confirm(`${estimatedRecipients}명에게 지금 발송하시겠습니까?`)) return;
        }
        setSending(sendModal.id);
        try {
            const res = await fetch("/api/newsletter/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    issueId: sendModal.id,
                    fromName: sendFromName || undefined,
                    siteIds: sendSiteIds.length > 0 ? sendSiteIds : undefined,
                    tags: sendTags.length > 0 ? sendTags : undefined,
                    scheduledAt: isScheduled ? new Date(scheduleAt).toISOString() : undefined,
                }),
            });
            const data = await res.json() as { ok?: boolean; scheduled?: boolean; scheduledAt?: string; sent?: number; total?: number; errors?: string[]; error?: string };
            if (!res.ok) {
                alert(`발송 실패: ${data.error || "알 수 없는 오류"}`);
            } else if (data.scheduled) {
                alert(`예약 완료: ${new Date(data.scheduledAt!).toLocaleString("ko-KR")}`);
                setIssues((prev) => prev.map((i) => i.id === sendModal.id ? { ...i, status: "scheduled" as const, scheduled_at: data.scheduledAt ?? null } : i));
                setSendModal(null);
            } else {
                alert(`발송 완료: ${data.sent}/${data.total}명${data.errors?.length ? `\n오류 ${data.errors.length}건` : ""}`);
                setIssues((prev) => prev.map((i) => i.id === sendModal.id ? { ...i, status: "sent" as const, recipient_count: data.sent ?? 0 } : i));
                setSendModal(null);
            }
        } catch (e) {
            alert(`발송 오류: ${e instanceof Error ? e.message : "알 수 없는 오류"}`);
        } finally {
            setSending(null);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;

    return (
        <div>
            <PageHeader title="뉴스레터 관리" description="뉴스레터 작성 및 발송">
                <button onClick={handleCreate} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">
                    <Plus className="h-4 w-4" /> 새 뉴스레터
                </button>
            </PageHeader>

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
                                {nl.status === "sent" && (
                                    <Link href={`/intra/ums/newsletter/issues/${nl.id}/analytics`} className="p-1.5 hover:bg-neutral-100 rounded" aria-label="분석" title="발송 분석">
                                        <BarChart3 className="h-3 w-3 text-neutral-400 hover:text-neutral-700" />
                                    </Link>
                                )}
                                <button onClick={() => openEditor(nl)} className="p-1.5 hover:bg-neutral-100 rounded" aria-label="수정"><Edit2 className="h-3 w-3 text-neutral-400" /></button>
                                {nl.status === "draft" && (
                                    <button onClick={() => openSendModal(nl)} disabled={sending === nl.id}
                                        className="p-1.5 hover:bg-neutral-100 rounded disabled:opacity-40" aria-label="발송" title="발송 설정">
                                        {sending === nl.id
                                            ? <span className="h-3 w-3 border border-neutral-400 border-t-transparent rounded-full animate-spin inline-block" />
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
                                <div className="p-3 bg-neutral-50 rounded">
                                    <p className="text-xs text-neutral-400 mb-1">뉴스레터</p>
                                    <p className="text-sm font-medium">{sendModal.title}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-2 block font-medium">보내는 이름 (From)</label>
                                    <div className="relative">
                                        <select value={sendFromName} onChange={(e) => setSendFromName(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded appearance-none focus:outline-none focus:border-neutral-400 bg-white">
                                            <option value="">Ten:One™ Universe (기본)</option>
                                            {sites.map((s) => <option key={s.id} value={`${s.name} by Ten:One™`}>{s.name} by Ten:One™</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                                    </div>
                                    <p className="text-[11px] text-neutral-400 mt-1">발신 주소: noreply@tenone.biz (고정)</p>
                                </div>
                                {sites.length > 0 && (
                                    <div>
                                        <label className="text-xs text-neutral-500 mb-2 block font-medium">타겟: 구독 사이트</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => setSendSiteIds([])}
                                                className={clsx("px-2.5 py-1.5 text-xs rounded border transition-colors",
                                                    sendSiteIds.length === 0 ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400")}>전체</button>
                                            {sites.map((s) => (
                                                <button key={s.id} onClick={() => toggleSiteId(s.id)}
                                                    className={clsx("px-2.5 py-1.5 text-xs rounded border transition-colors",
                                                        sendSiteIds.includes(s.id) ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400")}>{s.name}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {allTags.length > 0 && (
                                    <div>
                                        <label className="text-xs text-neutral-500 mb-2 block font-medium">타겟: 태그</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => setSendTags([])}
                                                className={clsx("px-2.5 py-1.5 text-xs rounded border transition-colors",
                                                    sendTags.length === 0 ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400")}>전체</button>
                                            {allTags.map((t) => (
                                                <button key={t} onClick={() => toggleSendTag(t)}
                                                    className={clsx("px-2.5 py-1.5 text-xs rounded border transition-colors",
                                                        sendTags.includes(t) ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-400")}>{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="border-t border-neutral-100 pt-4">
                                    <label className="text-xs text-neutral-500 mb-2 block font-medium">테스트 발송 (쉼표로 여러 개)</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={testEmails} onChange={e => setTestEmails(e.target.value)}
                                            placeholder="test1@example.com, test2@example.com"
                                            className="flex-1 px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                        <button onClick={handleTestSend} disabled={sending === sendModal.id}
                                            className="px-3 py-2 text-xs border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-40 whitespace-nowrap">
                                            테스트 발송
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 mt-1">이슈 상태와 수신자 기록에 영향 없음</p>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-2 block font-medium">예약 발송 (선택)</label>
                                    <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                    <p className="text-[11px] text-neutral-400 mt-1">비워두면 즉시 발송 · 미래 시각 지정 시 큐 저장 (크론 10분 간격)</p>
                                </div>
                                <div className="p-3 bg-neutral-50 rounded flex items-center justify-between">
                                    <span className="text-xs text-neutral-500">예상 수신자</span>
                                    <span className="text-lg font-bold">{estimatedRecipients}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></span>
                                </div>
                            </div>
                            <div className="p-4 border-t border-neutral-100 flex justify-end gap-2">
                                <button onClick={() => setSendModal(null)} className="px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                                <button onClick={handleSendConfirm} disabled={sending === sendModal.id || estimatedRecipients === 0}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50">
                                    <Send className="h-3.5 w-3.5" />
                                    {sending === sendModal.id ? "처리 중..." : scheduleAt ? "예약 저장" : "지금 발송"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
