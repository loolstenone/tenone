"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Radio, Eye, ThumbsUp, Pin, EyeOff, Trash2, Plus, RefreshCw,
    ChevronDown, Search, Filter, Globe, ArrowUpDown, Star, StarOff,
    ExternalLink, Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { getBrandMeta, getAllBrands } from "@/lib/brand-meta";

interface NewsroomItem {
    id: string;
    source_type: string;
    source_brand: string;
    title: string;
    summary: string | null;
    thumbnail_url: string | null;
    url: string | null;
    category: string | null;
    tags: string[];
    view_count: number;
    like_count: number;
    popularity_score: number;
    is_featured: boolean;
    is_hidden: boolean;
    display_priority: number;
    published_at: string;
}

type SortKey = "latest" | "popular" | "priority";

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function BrandBadge({ code }: { code: string }) {
    const meta = getBrandMeta(code);
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
            <Globe className="w-2.5 h-2.5" />
            {meta.name}
        </span>
    );
}

export default function NewsroomAdminPage() {
    const [items, setItems] = useState<NewsroomItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [brand, setBrand] = useState("all");
    const [sort, setSort] = useState<SortKey>("latest");
    const [search, setSearch] = useState("");
    const [total, setTotal] = useState(0);
    const [showAdd, setShowAdd] = useState(false);
    const [newItem, setNewItem] = useState({ source_brand: "tenone", title: "", summary: "", url: "", category: "" });

    const brands = getAllBrands();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/newsroom/admin?brand=${brand}&sort=${sort}&limit=100`);
            const data = await res.json();
            setItems(data.items || []);
            setTotal(data.total || 0);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [brand, sort]);

    useEffect(() => { load(); }, [load]);

    async function patch(id: string, updates: Partial<NewsroomItem>) {
        setSaving(id);
        try {
            await fetch("/api/newsroom/admin", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...updates }),
            });
            setItems(prev => prev.map(it => it.id === id ? { ...it, ...updates } : it));
        } finally {
            setSaving(null);
        }
    }

    async function remove(id: string) {
        if (!confirm("뉴스룸에서 삭제하시겠습니까?")) return;
        setSaving(id);
        try {
            await fetch("/api/newsroom/admin", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            setItems(prev => prev.filter(it => it.id !== id));
            setTotal(t => t - 1);
        } finally {
            setSaving(null);
        }
    }

    async function addItem() {
        if (!newItem.title.trim()) return;
        setSaving("new");
        try {
            const res = await fetch("/api/newsroom/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source_type: "manual", ...newItem }),
            });
            const data = await res.json();
            if (data.item) {
                setItems(prev => [data.item, ...prev]);
                setTotal(t => t + 1);
                setNewItem({ source_brand: "tenone", title: "", summary: "", url: "", category: "" });
                setShowAdd(false);
            }
        } finally {
            setSaving(null);
        }
    }

    async function adjustPriority(id: string, delta: number) {
        const item = items.find(it => it.id === id);
        if (!item) return;
        const next = Math.max(0, item.display_priority + delta);
        await patch(id, { display_priority: next });
    }

    const filtered = items.filter(it =>
        !search || it.title.toLowerCase().includes(search.toLowerCase()) || it.source_brand.includes(search.toLowerCase())
    );

    const stats = {
        total,
        featured: items.filter(it => it.is_featured).length,
        hidden: items.filter(it => it.is_hidden).length,
        manual: items.filter(it => it.source_type === "manual").length,
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <PageHeader title="뉴스룸 관리" description="Universe 전체 브랜드 콘텐츠 노출 순서와 핀/숨김을 관리합니다.">
                <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors rounded">
                    <RefreshCw className="w-3.5 h-3.5" /> 새로고침
                </button>
                <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-700 transition-colors rounded">
                    <Plus className="w-3.5 h-3.5" /> 수동 등록
                </button>
            </PageHeader>

            {/* 통계 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "전체 아이템", value: stats.total },
                    { label: "추천 핀", value: stats.featured, accent: true },
                    { label: "숨김 처리", value: stats.hidden },
                    { label: "수동 등록", value: stats.manual },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4 rounded">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.accent ? "text-amber-500" : "text-neutral-900"}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* 수동 등록 폼 */}
            {showAdd && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-5 mb-6">
                    <p className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-amber-500" /> 뉴스룸 수동 등록
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-xs text-neutral-500 mb-1 block">브랜드 *</label>
                            <select value={newItem.source_brand} onChange={e => setNewItem(p => ({ ...p, source_brand: e.target.value }))}
                                className="w-full text-sm border border-neutral-300 px-3 py-2 rounded bg-white">
                                {brands.map(b => <option key={b.code} value={b.code}>{b.meta.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 mb-1 block">카테고리</label>
                            <input value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
                                placeholder="공지, 이벤트, 업데이트..."
                                className="w-full text-sm border border-neutral-300 px-3 py-2 rounded" />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="text-xs text-neutral-500 mb-1 block">제목 *</label>
                        <input value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                            placeholder="뉴스룸에 표시될 제목"
                            className="w-full text-sm border border-neutral-300 px-3 py-2 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-xs text-neutral-500 mb-1 block">요약</label>
                            <input value={newItem.summary} onChange={e => setNewItem(p => ({ ...p, summary: e.target.value }))}
                                placeholder="간단한 설명"
                                className="w-full text-sm border border-neutral-300 px-3 py-2 rounded" />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 mb-1 block">링크 URL</label>
                            <input value={newItem.url} onChange={e => setNewItem(p => ({ ...p, url: e.target.value }))}
                                placeholder="/hero/hit 또는 https://..."
                                className="w-full text-sm border border-neutral-300 px-3 py-2 rounded" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={addItem} disabled={!newItem.title.trim() || saving === "new"}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                            {saving === "new" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            등록
                        </button>
                        <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-neutral-300 rounded hover:bg-neutral-50 transition-colors">
                            취소
                        </button>
                    </div>
                </div>
            )}

            {/* 필터 / 검색 */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
                {/* 브랜드 필터 */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Filter className="w-3.5 h-3.5 text-neutral-400" />
                    <button onClick={() => setBrand("all")}
                        className={`px-3 py-1 text-xs rounded border transition-colors ${brand === "all" ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-500 hover:border-neutral-400"}`}>
                        전체
                    </button>
                    {brands.map(b => (
                        <button key={b.code} onClick={() => setBrand(b.code)}
                            className={`px-3 py-1 text-xs rounded border transition-colors ${brand === b.code ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-500 hover:border-neutral-400"}`}>
                            {b.meta.name}
                        </button>
                    ))}
                </div>

                <div className="flex-1" />

                {/* 정렬 */}
                <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    {(["latest", "popular", "priority"] as SortKey[]).map(s => (
                        <button key={s} onClick={() => setSort(s)}
                            className={`px-3 py-1 text-xs rounded border transition-colors ${sort === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-500 hover:border-neutral-400"}`}>
                            {s === "latest" ? "최신순" : s === "popular" ? "인기순" : "우선순위"}
                        </button>
                    ))}
                </div>

                {/* 검색 */}
                <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="제목, 브랜드 검색"
                        className="pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded w-52 focus:outline-none focus:border-neutral-500" />
                </div>
            </div>

            {/* 아이템 테이블 */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-200 rounded-lg">
                    <Radio className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">등록된 뉴스룸 아이템이 없습니다</p>
                    <p className="text-xs text-neutral-300 mt-1">게시글이 발행되면 자동으로 등록됩니다</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 bg-neutral-50 border-b border-neutral-200 px-4 py-2.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                        <span>제목 / 브랜드</span>
                        <span className="px-4 text-center">통계</span>
                        <span className="px-4 text-center">우선순위</span>
                        <span className="px-4 text-center">추천</span>
                        <span className="px-4 text-center">노출</span>
                        <span className="px-3 text-center">삭제</span>
                    </div>

                    {filtered.map(item => (
                        <div key={item.id}
                            className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 border-b border-neutral-100 last:border-b-0 px-4 py-3 items-center hover:bg-neutral-50 transition-colors ${item.is_hidden ? "opacity-50" : ""}`}>

                            {/* 제목 */}
                            <div className="min-w-0 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <BrandBadge code={item.source_brand} />
                                    {item.category && <span className="text-[10px] text-neutral-400">{item.category}</span>}
                                    {item.source_type === "manual" && (
                                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded">수동</span>
                                    )}
                                    {item.is_featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                </div>
                                <p className="text-sm font-medium text-neutral-900 line-clamp-1">{item.title}</p>
                                {item.summary && <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{item.summary}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-neutral-400">{formatDate(item.published_at)}</span>
                                    {item.url && (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                                            className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
                                            <ExternalLink className="w-2.5 h-2.5" /> 링크
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* 통계 */}
                            <div className="px-4 text-center">
                                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{item.view_count}</span>
                                    <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" />{item.like_count}</span>
                                </div>
                            </div>

                            {/* 우선순위 */}
                            <div className="px-4 text-center">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => adjustPriority(item.id, -10)}
                                        className="w-5 h-5 flex items-center justify-center text-xs border border-neutral-200 hover:bg-neutral-100 rounded transition-colors text-neutral-500">
                                        −
                                    </button>
                                    <span className="w-8 text-center text-xs font-mono text-neutral-600">{item.display_priority}</span>
                                    <button onClick={() => adjustPriority(item.id, 10)}
                                        className="w-5 h-5 flex items-center justify-center text-xs border border-neutral-200 hover:bg-neutral-100 rounded transition-colors text-neutral-500">
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* 추천 핀 */}
                            <div className="px-4 text-center">
                                <button onClick={() => patch(item.id, { is_featured: !item.is_featured })}
                                    disabled={saving === item.id}
                                    className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${item.is_featured ? "bg-amber-50 text-amber-500 border border-amber-200" : "border border-neutral-200 text-neutral-300 hover:text-amber-400"}`}>
                                    {saving === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                                        item.is_featured ? <Star className="w-3.5 h-3.5 fill-amber-400" /> : <Star className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            {/* 숨김 토글 */}
                            <div className="px-4 text-center">
                                <button onClick={() => patch(item.id, { is_hidden: !item.is_hidden })}
                                    disabled={saving === item.id}
                                    className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${item.is_hidden ? "bg-red-50 text-red-400 border border-red-200" : "border border-neutral-200 text-neutral-400 hover:text-red-400"}`}>
                                    {item.is_hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            {/* 삭제 */}
                            <div className="px-3 text-center">
                                <button onClick={() => remove(item.id)}
                                    disabled={saving === item.id}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-neutral-200 text-neutral-300 hover:text-red-400 hover:border-red-200 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-3 text-xs text-neutral-400">
                총 {total}개 아이템 · 필터 결과 {filtered.length}개 표시 중
            </div>
        </div>
    );
}
