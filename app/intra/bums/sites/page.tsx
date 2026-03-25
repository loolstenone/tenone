"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfigs, type SiteIdentifier } from "@/lib/site-config";
function ImageUploader({ value, onChange, label, previewSize }: { value: string; onChange: (v: string) => void; label: string; previewSize?: string }) {
    return (
        <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">{label}</label>
            <input value={value} onChange={e => onChange(e.target.value)} placeholder="이미지 URL" className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none bg-white rounded" />
        </div>
    );
}
import {
    Globe, ExternalLink, Search, ChevronRight, Settings,
    LayoutGrid, FileText, Eye, Check,
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
}

export default function SitesListPage() {
    const boards: any[] = [];
    const boardPosts: any[] = [];
    const [search, setSearch] = useState("");
    const [selectedSite, setSelectedSite] = useState<SiteIdentifier | null>(null);
    const [saved, setSaved] = useState(false);

    // Editable fields for selected site
    const [editSeo, setEditSeo] = useState({ title: "", description: "", keywords: "" });
    const [editLogo, setEditLogo] = useState("");
    const [editFavicon, setEditFavicon] = useState("");
    const [editOgImage, setEditOgImage] = useState("");

    // siteConfigs → 목록 자동 생성
    const allSites: SiteEntry[] = Object.entries(siteConfigs).map(([id, c]) => ({
        id: id as SiteIdentifier,
        name: c.name,
        domain: c.domain,
        description: c.meta.description,
        homePath: c.homePath,
        colors: c.colors,
        meta: c.meta,
        faviconUrl: c.faviconUrl,
        tagline: c.tagline,
    }));

    const filtered = allSites.filter(s => {
        if (!search) return true;
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q);
    });

    const selectSite = (id: SiteIdentifier) => {
        setSelectedSite(id);
        const c = siteConfigs[id];
        setEditSeo({ title: c.meta.title, description: c.meta.description, keywords: c.meta.keywords?.join(", ") || "" });
        setEditLogo("");
        setEditFavicon("");
        setEditOgImage("");
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const sel = selectedSite ? siteConfigs[selectedSite] : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">사이트 관리</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    {allSites.length}개 사이트 자동 등록 — 도메인, SEO, 브랜딩 정보를 관리합니다.
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
                    <div className="rounded-xl bg-white border border-neutral-100 shadow-sm max-h-[600px] overflow-y-auto divide-y divide-neutral-100">
                        {filtered.map(site => {
                            const siteBoards = boards.filter(b => b.siteId === `site-${site.id}` || b.siteId === site.id);
                            const sitePosts = boardPosts.filter(p => p.siteId === `site-${site.id}` || p.siteId === site.id);
                            return (
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
                                        <div className="text-right shrink-0 ml-2">
                                            <p className="text-[10px] text-neutral-400">{siteBoards.length}게시판 · {sitePosts.length}글</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 우측: 사이트 상세 */}
                {sel && selectedSite ? (
                    <div className="space-y-5">
                        {/* 사이트 헤더 */}
                        <div className="rounded-xl bg-white border border-neutral-100 shadow-sm p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: sel.colors.primary }}>
                                    {sel.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight">{sel.name}</h2>
                                    <a href={`https://${sel.domain}`} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-neutral-400 hover:text-neutral-900 flex items-center gap-1 transition-colors">
                                        {sel.domain} <ExternalLink className="h-3 w-3" />
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
                        <div className="rounded-xl bg-white border border-neutral-100 shadow-sm p-6">
                            <h3 className="text-sm font-semibold mb-4">브랜딩</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <ImageUploader value={editLogo} onChange={setEditLogo} label="로고" previewSize="sm" />
                                <ImageUploader value={editFavicon} onChange={setEditFavicon} label="파비콘" previewSize="sm" />
                                <ImageUploader value={editOgImage} onChange={setEditOgImage} label="대표 이미지" previewSize="sm" />
                            </div>
                        </div>

                        {/* SEO / 메타 */}
                        <div className="rounded-xl bg-white border border-neutral-100 shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">SEO / 메타 설정</h3>
                                <span className="text-xs text-neutral-400">자동 입력, 수정 가능</span>
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
                        <div className="rounded-xl bg-white border border-neutral-100 shadow-sm p-6">
                            <h3 className="text-sm font-semibold mb-4">사이트 색상</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: "Primary", color: sel.colors.primary },
                                    { label: "Accent", color: sel.colors.accent },
                                    { label: "헤더", color: sel.colors.headerBg },
                                    { label: "푸터", color: sel.colors.footerBg },
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
                        <div className="flex items-center gap-3">
                            <button onClick={handleSave}
                                className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-all shadow-sm">
                                {saved ? <Check className="h-4 w-4" /> : null}
                                {saved ? "저장 완료" : "저장"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl bg-white border border-neutral-100 shadow-sm flex items-center justify-center py-20">
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
