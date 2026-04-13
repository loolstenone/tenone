"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, X, Loader2, ExternalLink, Globe, Edit2, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { brands as staticBrands } from "@/lib/data";
import type { Brand, BrandCategory } from "@/types/brand";
import { PageHeader } from "@/components/intra/IntraUI";

// ── 브랜드별 인트라 관리 경로 ──────────────────────────
const INTRA_PATHS: Record<string, string> = {
    badak: "/intra/ums/badak",
    madleague: "/intra/ums/madleague",
    brandgravity: "/intra/gravity",
    hero: "/intra/hero/talent",
    wio: "/intra/ums/commerce/subscriptions",
    mindle: "/intra/ums/mindle/trends",
    smarcomm: "/intra/ums/smarcomm",
    planners: "/intra/evolution-school",
    luki: "/intra/ums/madleague",  // 동일 섹션
};

// ── row → Brand 변환 ───────────────────────────────────
function rowToBrand(r: Record<string, unknown>): Brand {
    return {
        id: r.id as string,
        name: r.name as string,
        category: (r.category as BrandCategory) || "Corporate",
        description: (r.description as string) || "",
        tagline: (r.tagline as string) || undefined,
        domain: (r.domain as string) || undefined,
        logoUrl: (r.logo_url as string) || undefined,
        websiteUrl: (r.website_url as string) || undefined,
        foundedDate: (r.founded_date as string) || undefined,
        status: ((r.display_status || r.status) as Brand["status"]) || "Active",
        tags: (r.tags as string[]) || [],
    };
}

const STATUS_STYLE: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    Development: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Hiatus: "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
};

const CATEGORIES: BrandCategory[] = [
    "AI Idol", "AI Creator", "Community", "Project Group", "Fashion",
    "Character", "Corporate", "Startup", "Content", "Marketing",
    "Consulting", "Education", "Platform", "Network", "Wellness",
];

// ── 등록 폼 초기값 ────────────────────────────────────
const EMPTY_FORM = {
    name: "", category: "Community" as BrandCategory,
    description: "", tagline: "", domain: "", websiteUrl: "",
    status: "Development" as Brand["status"], tags: "",
};

function AddBrandModal({ onClose, onAdded }: { onClose: () => void; onAdded: (b: Brand) => void }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("브랜드명은 필수입니다."); return; }
        setSaving(true);
        const supabase = createClient();
        const slug = form.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30) || String(Date.now());
        const { data, error: err } = await supabase.from("brands").insert({
            id: slug,
            name: form.name.trim(),
            category: form.category,
            description: form.description.trim() || null,
            tagline: form.tagline.trim() || null,
            domain: form.domain.trim() || null,
            website_url: form.websiteUrl.trim() || null,
            display_status: form.status,
            tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        }).select().single();
        if (err) { setError(err.message); setSaving(false); return; }
        onAdded(rowToBrand(data as Record<string, unknown>));
        onClose();
    };

    const field = (key: keyof typeof form) => ({
        value: form[key] as string,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm(p => ({ ...p, [key]: e.target.value })),
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white">
                    <h2 className="text-sm font-semibold">새 브랜드 등록</h2>
                    <button onClick={onClose}><X className="h-4 w-4 text-neutral-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">브랜드명 *</label>
                            <input {...field("name")} className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">카테고리</label>
                            <select {...field("category")} className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">설명</label>
                        <textarea {...field("description")} rows={2}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 resize-none" />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">태그라인</label>
                        <input {...field("tagline")} className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">도메인</label>
                            <input {...field("domain")} placeholder="brand.com" className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">웹사이트 URL</label>
                            <input {...field("websiteUrl")} placeholder="/brand 또는 https://..." className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">상태</label>
                            <select {...field("status")} className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400">
                                <option value="Active">Active</option>
                                <option value="Development">Development</option>
                                <option value="Hiatus">Hiatus</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">태그 (쉼표 구분)</label>
                            <input {...field("tags")} placeholder="AI, SaaS, Community" className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-xs border border-neutral-200 hover:bg-neutral-50">취소</button>
                        <button type="submit" disabled={saving}
                            className="px-4 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-40 flex items-center gap-1.5">
                            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                            등록
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function BrandCard({ brand }: { brand: Brand }) {
    const intraPath = INTRA_PATHS[brand.id];
    const initials = brand.name.replace(/[^A-Za-z가-힣]/g, "").slice(0, 2).toUpperCase() || "BR";

    return (
        <div className="group flex flex-col border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm transition-all">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 pb-3">
                <div className="h-12 w-12 shrink-0 bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-500">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                        <h3 className="text-sm font-semibold text-neutral-900 leading-tight truncate">{brand.name}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 font-medium shrink-0 ${STATUS_STYLE[brand.status] || STATUS_STYLE.Hiatus}`}>
                            {brand.status}
                        </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 mt-1 inline-block">{brand.category}</span>
                </div>
            </div>

            {/* Description */}
            <div className="px-4 pb-3 flex-1">
                {brand.tagline && <p className="text-xs text-neutral-700 font-medium mb-1 italic">"{brand.tagline}"</p>}
                <p className="text-xs text-neutral-500 line-clamp-2">{brand.description}</p>
                {brand.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {brand.tags.slice(0, 3).map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-400">{t}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center border-t border-neutral-100 divide-x divide-neutral-100">
                {intraPath ? (
                    <Link href={intraPath} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
                        <LayoutDashboard className="h-3 w-3" /> 관리
                    </Link>
                ) : (
                    <Link href={`/brands/${brand.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
                        <Edit2 className="h-3 w-3" /> 상세
                    </Link>
                )}
                {brand.domain && (
                    <a href={`https://${brand.domain}`} target="_blank" rel="noopener noreferrer"
                        className="px-4 py-2.5 text-xs text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 transition-colors flex items-center gap-1">
                        <Globe className="h-3 w-3" />{brand.domain}
                    </a>
                )}
                {brand.websiteUrl && (
                    <Link href={brand.websiteUrl}
                        className="px-3 py-2.5 text-xs text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 transition-colors">
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function StudioBrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from("brands")
            .select("id, name, category, description, tagline, domain, logo_url, website_url, founded_date, display_status, status, tags")
            .order("name")
            .then(({ data }: { data: Record<string, unknown>[] | null }) => {
                if (data && data.length > 0) {
                    setBrands(data.map((r: Record<string, unknown>) => rowToBrand(r)));
                } else {
                    setBrands(staticBrands);
                }
                setLoading(false);
            })
            .catch(() => { setBrands(staticBrands); setLoading(false); });
    }, []);

    const categories = useMemo(() => {
        const cats = [...new Set(brands.map(b => b.category))].sort();
        return cats;
    }, [brands]);

    const filtered = useMemo(() => brands.filter(b => {
        if (catFilter !== "all" && b.category !== catFilter) return false;
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.tags.some(t => t.toLowerCase().includes(q));
        }
        return true;
    }), [brands, catFilter, statusFilter, search]);

    const counts = useMemo(() => ({
        active: brands.filter(b => b.status === "Active").length,
        dev: brands.filter(b => b.status === "Development").length,
        hiatus: brands.filter(b => b.status === "Hiatus").length,
    }), [brands]);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
    );

    return (
        <div className="space-y-5">
            {showAdd && (
                <AddBrandModal
                    onClose={() => setShowAdd(false)}
                    onAdded={b => setBrands(prev => [b, ...prev])}
                />
            )}

            <PageHeader title="Brands & IPs" description={`Ten:One™ Universe · 전체 ${brands.length}개 브랜드`}>
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" /> 브랜드 등록
                </button>
            </PageHeader>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Active", value: counts.active, color: "text-emerald-600" },
                    { label: "Development", value: counts.dev, color: "text-amber-600" },
                    { label: "Hiatus", value: counts.hiatus, color: "text-neutral-400" },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-3 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">{s.label}</span>
                        <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="브랜드 검색..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white">
                    <option value="all">전체 상태</option>
                    <option value="Active">Active</option>
                    <option value="Development">Development</option>
                    <option value="Hiatus">Hiatus</option>
                </select>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white">
                    <option value="all">전체 카테고리</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="border border-neutral-200 py-16 text-center text-sm text-neutral-400">
                    검색 결과가 없습니다.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map(brand => <BrandCard key={brand.id} brand={brand} />)}
                </div>
            )}
        </div>
    );
}
