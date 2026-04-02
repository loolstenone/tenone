"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { siteConfigs, type SiteIdentifier } from "@/lib/site-config";
import { upsertSiteConfig, getAllSiteConfigs, type SiteConfigRow } from "@/lib/supabase/site-configs";

function ImageUploader({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
    return (
        <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">{label}</label>
            <input value={value} onChange={e => onChange(e.target.value)} placeholder="이미지 URL" className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none bg-white rounded" />
        </div>
    );
}
import {
    Globe, ExternalLink, Search, Settings,
    LayoutGrid, Check, Loader2, AlertCircle, Database,
} from "lucide-react";
import clsx from "clsx";

interface SiteEntry {
    id: SiteIdentifier;
    name: string;
    domain: string;
    description: string;
    homePath: string;
    colors: { primary: string; headerBg: string; footerBg: string; accent: string };
    meta: { title: string; description: string; keywords?: string[] };
    faviconUrl: string;
    tagline?: string;
    fromDB: boolean; // DB에서 로드됐는지 표시
}

export default function SitesListPage() {
    const [search, setSearch] = useState("");
    const [selectedSite, setSelectedSite] = useState<SiteIdentifier | null>(null);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [dbConfigs, setDbConfigs] = useState<SiteConfigRow[]>([]);
    const [dbLoaded, setDbLoaded] = useState(false);

    // Editable fields for selected site
    const [editSeo, setEditSeo] = useState({ title: "", description: "", keywords: "" });
    const [editLogo, setEditLogo] = useState("");
    const [editFavicon, setEditFavicon] = useState("");
    const [editOgImage, setEditOgImage] = useState("");

    // DB에서 site_configs 로드 시도
    useEffect(() => {
        (async () => {
            try {
                const rows = await getAllSiteConfigs();
                if (rows.length > 0) {
                    setDbConfigs(rows);
                }
            } catch {
                // DB 실패 → fallback to siteConfigs
            } finally {
                setDbLoaded(true);
            }
        })();
    }, []);

    // DB row → SiteEntry 변환
    const dbToEntry = useCallback((row: SiteConfigRow): SiteEntry => ({
        id: row.site_id as SiteIdentifier,
        name: row.name,
        domain: row.domain,
        description: row.meta_description,
        homePath: row.home_path,
        colors: row.colors,
        meta: { title: row.meta_title, description: row.meta_description, keywords: row.meta_keywords ?? undefined },
        faviconUrl: row.favicon_url,
        tagline: row.tagline ?? undefined,
        fromDB: true,
    }), []);

    // siteConfigs → SiteEntry (fallback)
    const staticToEntry = useCallback((id: string, c: (typeof siteConfigs)[SiteIdentifier]): SiteEntry => ({
        id: id as SiteIdentifier,
        name: c.name,
        domain: c.domain,
        description: c.meta.description,
        homePath: c.homePath,
        colors: c.colors,
        meta: c.meta,
        faviconUrl: c.faviconUrl,
        tagline: c.tagline,
        fromDB: false,
    }), []);

    // DB가 있으면 DB 데이터 우선, 없으면 static fallback
    const allSites: SiteEntry[] = dbConfigs.length > 0
        ? dbConfigs.map(dbToEntry)
        : Object.entries(siteConfigs).map(([id, c]) => staticToEntry(id, c));

    const filtered = allSites.filter(s => {
        if (!search) return true;
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q);
    });

    const selectSite = (id: SiteIdentifier) => {
        setSelectedSite(id);
        setSaved(false);
        setSaveError(null);

        // DB row가 있으면 DB 데이터로, 없으면 static으로 필드 채우기
        const dbRow = dbConfigs.find(r => r.site_id === id);
        if (dbRow) {
            setEditSeo({
                title: dbRow.meta_title,
                description: dbRow.meta_description,
                keywords: dbRow.meta_keywords?.join(", ") || "",
            });
            setEditLogo(dbRow.logo_image_url || "");
            setEditFavicon(dbRow.favicon_url || "");
            setEditOgImage(dbRow.meta_og_image || "");
        } else {
            const c = siteConfigs[id];
            setEditSeo({
                title: c.meta.title,
                description: c.meta.description,
                keywords: c.meta.keywords?.join(", ") || "",
            });
            setEditLogo(c.logoImageUrl || "");
            setEditFavicon(c.faviconUrl || "");
            setEditOgImage(c.meta.ogImage || "");
        }
    };

    const handleSave = async () => {
        if (!selectedSite) return;
        setSaving(true);
        setSaveError(null);

        try {
            const keywords = editSeo.keywords
                .split(",")
                .map(k => k.trim())
                .filter(Boolean);

            await upsertSiteConfig(selectedSite, {
                meta_title: editSeo.title,
                meta_description: editSeo.description,
                meta_keywords: keywords.length > 0 ? keywords : null,
                ...(editLogo && { logo_image_url: editLogo }),
                ...(editFavicon && { favicon_url: editFavicon }),
                ...(editOgImage && { meta_og_image: editOgImage }),
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);

            // DB 데이터 새로고침
            const rows = await getAllSiteConfigs();
            if (rows.length > 0) setDbConfigs(rows);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "저장에 실패했습니다.";
            setSaveError(msg);
        } finally {
            setSaving(false);
        }
    };

    // 선택된 사이트 색상 (DB 또는 static)
    const getSelectedColors = () => {
        if (!selectedSite) return null;
        const dbRow = dbConfigs.find(r => r.site_id === selectedSite);
        if (dbRow) return dbRow.colors;
        return siteConfigs[selectedSite].colors;
    };

    const getSelectedName = () => {
        if (!selectedSite) return "";
        const dbRow = dbConfigs.find(r => r.site_id === selectedSite);
        return dbRow ? dbRow.name : siteConfigs[selectedSite].name;
    };

    const getSelectedDomain = () => {
        if (!selectedSite) return "";
        const dbRow = dbConfigs.find(r => r.site_id === selectedSite);
        return dbRow ? dbRow.domain : siteConfigs[selectedSite].domain;
    };

    const selColors = getSelectedColors();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-neutral-100 pb-5 mb-6">
                <h1 className="text-lg font-semibold tracking-tight text-neutral-900">사이트 관리</h1>
                <p className="text-sm text-neutral-400 mt-0.5">
                    {allSites.length}개 사이트 — 도메인, SEO, 브랜딩 정보를 관리합니다.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                {/* 좌측: 사이트 목록 */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="사이트명, 도메인 검색..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white transition-all" />
                    </div>
                    <div className="bg-white border border-neutral-100 max-h-[600px] overflow-y-auto divide-y divide-neutral-100">
                        {filtered.map(site => (
                            <button
                                key={site.id}
                                onClick={() => selectSite(site.id)}
                                className={clsx(
                                    "w-full text-left px-4 py-3.5 transition-all",
                                    selectedSite === site.id ? "bg-neutral-50 border-l-2 border-neutral-900" : "hover:bg-neutral-50/50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                            style={{ backgroundColor: site.colors.primary }}>
                                            {site.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{site.name}</p>
                                            <p className="text-[10px] text-neutral-400 truncate">{site.domain}</p>
                                        </div>
                                    </div>
                                    {site.fromDB && (
                                        <Database className="h-3 w-3 text-emerald-400 shrink-0 ml-2" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 우측: 사이트 상세 */}
                {selColors && selectedSite ? (
                    <div className="space-y-5">
                        {/* 사이트 헤더 */}
                        <div className="bg-white border border-neutral-100 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: selColors.primary }}>
                                    {getSelectedName().charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-sm font-medium text-neutral-700">{getSelectedName()}</h2>
                                    <a href={`https://${getSelectedDomain()}`} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-neutral-400 hover:text-neutral-900 flex items-center gap-1 transition-colors">
                                        {getSelectedDomain()} <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/intra/bums/sites/${selectedSite}`}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-all">
                                    <LayoutGrid className="h-3 w-3" /> 게시판
                                </Link>
                                <Link href={`/intra/bums/sites/${selectedSite}/settings`}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-all">
                                    <Settings className="h-3 w-3" /> 설정
                                </Link>
                            </div>
                        </div>

                        {/* 브랜딩: 로고, 파비콘, 대표이미지 */}
                        <div className="bg-white border border-neutral-100 p-6">
                            <h3 className="text-sm font-semibold mb-4">브랜딩</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <ImageUploader value={editLogo} onChange={setEditLogo} label="로고" />
                                <ImageUploader value={editFavicon} onChange={setEditFavicon} label="파비콘" />
                                <ImageUploader value={editOgImage} onChange={setEditOgImage} label="대표 이미지" />
                            </div>
                        </div>

                        {/* SEO / 메타 */}
                        <div className="bg-white border border-neutral-100 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">SEO / 메타 설정</h3>
                                <span className="text-xs text-neutral-400">수정 후 저장하면 브랜드 사이트에 반영됩니다</span>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-500 uppercase block mb-1.5">메타 타이틀</label>
                                <input value={editSeo.title} onChange={e => setEditSeo(p => ({ ...p, title: e.target.value }))}
                                    className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-500 uppercase block mb-1.5">메타 설명</label>
                                <textarea value={editSeo.description} onChange={e => setEditSeo(p => ({ ...p, description: e.target.value }))}
                                    rows={2} className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white resize-y transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-500 uppercase block mb-1.5">키워드</label>
                                <input value={editSeo.keywords} onChange={e => setEditSeo(p => ({ ...p, keywords: e.target.value }))}
                                    placeholder="쉼표로 구분"
                                    className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-neutral-500 uppercase block mb-1.5">SEO 점수</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "72%" }} />
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600">72</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-500 uppercase block mb-1.5">GEO 점수</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: "58%" }} />
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">58</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 색상 */}
                        <div className="bg-white border border-neutral-100 p-6">
                            <h3 className="text-sm font-semibold mb-4">사이트 색상</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: "Primary", color: selColors.primary },
                                    { label: "Accent", color: selColors.accent },
                                    { label: "헤더", color: selColors.headerBg },
                                    { label: "푸터", color: selColors.footerBg },
                                ].map(c => (
                                    <div key={c.label} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg border border-neutral-200" style={{ backgroundColor: c.color }} />
                                        <div>
                                            <p className="text-[10px] text-neutral-400">{c.label}</p>
                                            <p className="text-xs font-mono">{c.color}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 저장 */}
                        {saveError && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                <p className="text-xs text-red-600">{saveError}</p>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
                                {saving ? "저장 중..." : saved ? "저장 완료" : "저장"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-100 flex items-center justify-center py-20">
                        <div className="text-center text-neutral-400">
                            <Globe className="h-10 w-10 mx-auto mb-3" />
                            <p className="text-sm">좌측에서 사이트를 선택하세요</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
