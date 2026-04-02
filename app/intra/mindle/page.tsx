"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, Star, X, Save, ExternalLink } from "lucide-react";
import { PageHeader, TabNav } from "@/components/intra/IntraUI";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

/* ── 타입 ── */
interface Trend {
    id: string;
    title: string;
    summary: string;
    full_content: string | null;
    category: string;
    tags: string[];
    source_urls: string[];
    source_names: string[];
    relevance_score: number;
    status: "draft" | "published" | "archived";
    is_featured: boolean;
    view_count: number;
    published_at: string | null;
    created_at: string;
}

interface Source {
    id: string;
    name: string;
    url: string;
    source_type: string;
    category: string;
    is_active: boolean;
    crawl_count: number;
    error_count: number;
    last_crawled_at: string | null;
}

const categoryLabel: Record<string, string> = {
    marketing: "마케팅", startup: "스타트업", tech: "테크", ad: "광고", design: "디자인", general: "일반",
    consumer: "소비자", culture: "문화", ai: "AI",
};

const statusLabel: Record<string, string> = { draft: "초안", published: "발행", archived: "보관" };
const statusStyle: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    published: "bg-neutral-900 text-white",
    archived: "bg-neutral-200 text-neutral-400",
};

const tabs = [
    { id: "trends", label: "트렌드 카드" },
    { id: "sources", label: "소스 관리" },
];

export default function MindleTrendsPage() {
    const [activeTab, setActiveTab] = useState("trends");
    const [trends, setTrends] = useState<Trend[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("전체");
    const [statusFilter, setStatusFilter] = useState("전체");

    /* 에디터 */
    const [editing, setEditing] = useState<Trend | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [form, setForm] = useState({ title: "", summary: "", full_content: "", category: "general", tags: "", relevance_score: 0.5, status: "draft" as string });
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    const loadData = useCallback(async () => {
        setLoading(true);
        const [trendRes, sourceRes] = await Promise.all([
            supabase.from("mindle_trends").select("*").order("created_at", { ascending: false }),
            supabase.from("mindle_sources").select("*").order("name"),
        ]);
        if (trendRes.data) setTrends(trendRes.data as Trend[]);
        if (sourceRes.data) setSources(sourceRes.data as Source[]);
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    /* ── 트렌드 CRUD ── */
    const handleCreate = () => {
        setEditing(null);
        setForm({ title: "", summary: "", full_content: "", category: "general", tags: "", relevance_score: 0.5, status: "draft" });
        setShowEditor(true);
    };

    const openEditor = (t: Trend) => {
        setEditing(t);
        setForm({
            title: t.title, summary: t.summary, full_content: t.full_content || "",
            category: t.category, tags: t.tags.join(", "), relevance_score: t.relevance_score, status: t.status,
        });
        setShowEditor(true);
    };

    const closeEditor = () => {
        setEditing(null);
        setShowEditor(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            title: form.title,
            summary: form.summary,
            full_content: form.full_content || null,
            category: form.category,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            relevance_score: form.relevance_score,
            status: form.status,
            published_at: form.status === "published" ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
        };

        if (editing) {
            await supabase.from("mindle_trends").update(payload).eq("id", editing.id);
            setTrends((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...payload, tags: payload.tags } as Trend : t)));
        } else {
            const { data } = await supabase.from("mindle_trends").insert(payload).select().single();
            if (data) setTrends((prev) => [data as Trend, ...prev]);
        }
        setSaving(false);
        closeEditor();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("삭제하시겠습니까?")) return;
        await supabase.from("mindle_trends").delete().eq("id", id);
        setTrends((prev) => prev.filter((t) => t.id !== id));
    };

    const toggleFeatured = async (t: Trend) => {
        const next = !t.is_featured;
        await supabase.from("mindle_trends").update({ is_featured: next }).eq("id", t.id);
        setTrends((prev) => prev.map((x) => (x.id === t.id ? { ...x, is_featured: next } : x)));
    };

    /* ── 필터 ── */
    const categories = ["전체", ...new Set(trends.map((t) => t.category))];
    const filteredTrends = trends.filter((t) => {
        if (catFilter !== "전체" && t.category !== catFilter) return false;
        if (statusFilter !== "전체" && t.status !== statusFilter) return false;
        if (search) return t.title.toLowerCase().includes(search.toLowerCase());
        return true;
    });

    /* showEditor is managed via state */

    if (loading) {
        return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Mindle 트렌드" description="트렌드 카드 등록 · 관리 · 소스 설정">
                {activeTab === "trends" && (
                    <button onClick={handleCreate} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">
                        <Plus className="h-4 w-4" /> 새 트렌드
                    </button>
                )}
            </PageHeader>

            <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

            {activeTab === "trends" && (
                <>
                    {/* 필터 */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="제목 검색..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:border-neutral-400 focus:outline-none bg-white" />
                        </div>
                        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                            className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm bg-white">
                            {categories.map((c) => <option key={c} value={c}>{c === "전체" ? "전체 카테고리" : categoryLabel[c] || c}</option>)}
                        </select>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm bg-white">
                            <option value="전체">전체 상태</option>
                            <option value="draft">초안</option>
                            <option value="published">발행</option>
                            <option value="archived">보관</option>
                        </select>
                    </div>

                    {/* 트렌드 목록 */}
                    <div className="rounded-xl bg-white shadow-sm border border-neutral-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-neutral-100 bg-neutral-50/60">
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase w-8"></th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">제목</th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">카테고리</th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">상태</th>
                                <th className="px-5 py-3.5 text-center text-xs font-medium text-neutral-500 uppercase">관련성</th>
                                <th className="px-5 py-3.5 text-right text-xs font-medium text-neutral-500 uppercase">조회</th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">날짜</th>
                                <th className="px-5 py-3.5 text-center text-xs font-medium text-neutral-500 uppercase w-20">관리</th>
                            </tr></thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredTrends.map((t) => (
                                    <tr key={t.id} className="hover:bg-neutral-50/50">
                                        <td className="px-5 py-3.5">
                                            <button onClick={() => toggleFeatured(t)} className={clsx("p-0.5", t.is_featured ? "text-amber-500" : "text-neutral-200 hover:text-neutral-400")}>
                                                <Star className="h-3.5 w-3.5" fill={t.is_featured ? "currentColor" : "none"} />
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-neutral-900 truncate max-w-[300px]">{t.title}</p>
                                            <p className="text-[11px] text-neutral-400 truncate max-w-[300px] mt-0.5">{t.summary}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-neutral-500">{categoryLabel[t.category] || t.category}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyle[t.status]}`}>{statusLabel[t.status]}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="text-xs font-mono font-bold text-neutral-700">{Math.round(t.relevance_score * 100)}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-neutral-400 text-xs">{t.view_count}</td>
                                        <td className="px-5 py-3.5 text-neutral-400 text-xs">{t.created_at?.split("T")[0]}</td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEditor(t)} className="p-1 hover:bg-neutral-100 rounded"><Edit2 className="h-3.5 w-3.5 text-neutral-400" /></button>
                                                <button onClick={() => handleDelete(t.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5 text-neutral-300" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTrends.length === 0 && <div className="px-6 py-16 text-center text-neutral-400 text-sm">트렌드 카드가 없습니다.</div>}
                    </div>
                </>
            )}

            {activeTab === "sources" && (
                <div className="rounded-xl bg-white shadow-sm border border-neutral-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-neutral-100 bg-neutral-50/60">
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">소스명</th>
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">유형</th>
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">카테고리</th>
                            <th className="px-5 py-3.5 text-center text-xs font-medium text-neutral-500 uppercase">상태</th>
                            <th className="px-5 py-3.5 text-right text-xs font-medium text-neutral-500 uppercase">수집</th>
                            <th className="px-5 py-3.5 text-right text-xs font-medium text-neutral-500 uppercase">오류</th>
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">마지막 수집</th>
                            <th className="px-5 py-3.5 text-center text-xs font-medium text-neutral-500 uppercase w-10">링크</th>
                        </tr></thead>
                        <tbody className="divide-y divide-neutral-100">
                            {sources.map((s) => (
                                <tr key={s.id} className="hover:bg-neutral-50/50">
                                    <td className="px-5 py-3.5 font-medium">{s.name}</td>
                                    <td className="px-5 py-3.5 text-xs text-neutral-500 uppercase">{s.source_type}</td>
                                    <td className="px-5 py-3.5 text-xs text-neutral-500">{categoryLabel[s.category] || s.category}</td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.is_active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                                            {s.is_active ? "활성" : "비활성"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right text-neutral-500 text-xs">{s.crawl_count}회</td>
                                    <td className="px-5 py-3.5 text-right text-xs">{s.error_count > 0 ? <span className="text-red-500">{s.error_count}</span> : <span className="text-neutral-300">0</span>}</td>
                                    <td className="px-5 py-3.5 text-neutral-400 text-xs">{s.last_crawled_at?.split("T")[0] || "—"}</td>
                                    <td className="px-5 py-3.5 text-center">
                                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-neutral-100 rounded inline-flex">
                                            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sources.length === 0 && <div className="px-6 py-16 text-center text-neutral-400 text-sm">등록된 소스가 없습니다.</div>}
                </div>
            )}

            {/* 트렌드 에디터 모달 */}
            {showEditor && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-50" onClick={closeEditor} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                            <div className="p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
                                <h2 className="text-sm font-semibold">{editing ? "트렌드 수정" : "새 트렌드"}</h2>
                                <button onClick={closeEditor} className="p-1 text-neutral-400 hover:text-neutral-900"><X className="h-5 w-5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">제목 *</label>
                                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">요약 (3줄) *</label>
                                    <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3}
                                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">전체 분석</label>
                                    <textarea value={form.full_content} onChange={(e) => setForm({ ...form, full_content: e.target.value })} rows={8}
                                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-neutral-500 mb-1 block">카테고리</label>
                                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 bg-white">
                                            {Object.entries(categoryLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-500 mb-1 block">관련성 (0~1)</label>
                                        <input type="number" step="0.05" min="0" max="1" value={form.relevance_score}
                                            onChange={(e) => setForm({ ...form, relevance_score: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-500 mb-1 block">상태</label>
                                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 bg-white">
                                            <option value="draft">초안</option>
                                            <option value="published">발행</option>
                                            <option value="archived">보관</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">태그 (쉼표 구분)</label>
                                    <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                        placeholder="AI, 에이전트, 마케팅"
                                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                </div>
                            </div>
                            <div className="p-4 border-t border-neutral-100 flex justify-end gap-2">
                                <button onClick={closeEditor} className="px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                                <button onClick={handleSave} disabled={saving || !form.title || !form.summary}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50">
                                    <Save className="h-3.5 w-3.5" /> {saving ? "저장 중..." : "저장"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
