"use client";

import { useState, useEffect, useCallback, useRef, type DragEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfigs, type SiteIdentifier } from "@/lib/site-config";
import { upsertSiteConfig, getAllSiteConfigs, toggleSiteOpen, type SiteConfigRow } from "@/lib/supabase/site-configs";
import {
    Globe, ExternalLink, Search, Settings,
    LayoutGrid, Check, Loader2, AlertCircle, Power, Image as ImageIcon, Link2, Crown,
    Upload, Sparkles, X,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import clsx from "clsx";

type DomainEntry = { domain: string; type: 'independent' | 'subdomain' | 'path' | 'vercel'; status: 'connected' | 'external' };

interface SiteEntry {
    id: SiteIdentifier;
    name: string;
    domain: string;
    description: string;
    homePath: string;
    colors: { primary: string; headerBg: string; footerBg: string; accent: string };
    meta: { title: string; description: string; keywords?: string[] };
    faviconUrl: string;
    logoUrl: string | null;
    ogImageUrl: string | null;
    tagline?: string;
    fromDB: boolean;
    isOpen: boolean;
    domains: DomainEntry[];
}

export default function SitesListPage() {
    const [search, setSearch] = useState("");
    const [selectedSite, setSelectedSite] = useState<SiteIdentifier | null>(null);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [dbConfigs, setDbConfigs] = useState<SiteConfigRow[]>([]);
    const [toggling, setToggling] = useState<string | null>(null);

    // Editable fields
    const [editSeo, setEditSeo] = useState({ title: "", description: "", keywords: "" });
    const [editLogo, setEditLogo] = useState("");
    const [editFavicon, setEditFavicon] = useState("");
    const [editOgImage, setEditOgImage] = useState("");
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [editAi, setEditAi] = useState({ llms: "", robotsTxt: "", structuredData: "" });

    useEffect(() => {
        (async () => {
            try {
                const rows = await getAllSiteConfigs();
                if (rows.length > 0) setDbConfigs(rows);
            } catch { /* fallback to static */ }
        })();
    }, []);

    const dbToEntry = useCallback((row: SiteConfigRow): SiteEntry => ({
        id: row.site_id as SiteIdentifier,
        name: row.name,
        domain: row.domain,
        description: row.meta_description,
        homePath: row.home_path,
        colors: row.colors,
        meta: { title: row.meta_title, description: row.meta_description, keywords: row.meta_keywords ?? undefined },
        faviconUrl: row.favicon_url,
        logoUrl: row.logo_image_url,
        ogImageUrl: row.meta_og_image,
        tagline: row.tagline ?? undefined,
        fromDB: true,
        isOpen: row.is_open,
        domains: row.domains || [],
    }), []);

    const staticToEntry = useCallback((id: string, c: (typeof siteConfigs)[SiteIdentifier]): SiteEntry => ({
        id: id as SiteIdentifier,
        name: c.name,
        domain: c.domain,
        description: c.meta.description,
        homePath: c.homePath,
        colors: c.colors,
        meta: c.meta,
        faviconUrl: c.faviconUrl,
        logoUrl: c.logoImageUrl || null,
        ogImageUrl: c.meta.ogImage || null,
        tagline: c.tagline,
        fromDB: false,
        isOpen: true,
        domains: [],
    }), []);

    const allSites: SiteEntry[] = dbConfigs.length > 0
        ? dbConfigs.map(dbToEntry)
        : Object.entries(siteConfigs).map(([id, c]) => staticToEntry(id, c));

    // TenOne 분리
    const tenone = allSites.find(s => s.id === 'tenone');
    const universeSites = allSites.filter(s => s.id !== 'tenone');

    const filtered = universeSites.filter(s => {
        if (!search) return true;
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q)
            || s.domain.toLowerCase().includes(q)
            || s.domains.some(d => d.domain.toLowerCase().includes(q));
    });

    const selectSite = (id: SiteIdentifier) => {
        setSelectedSite(id);
        setSaved(false);
        setSaveError(null);
        const dbRow = dbConfigs.find(r => r.site_id === id);
        if (dbRow) {
            setEditSeo({ title: dbRow.meta_title, description: dbRow.meta_description, keywords: dbRow.meta_keywords?.join(", ") || "" });
            setEditLogo(dbRow.logo_image_url || "");
            setEditFavicon(dbRow.favicon_url || "");
            setEditOgImage(dbRow.meta_og_image || "");
        } else {
            const c = siteConfigs[id];
            setEditSeo({ title: c.meta.title, description: c.meta.description, keywords: c.meta.keywords?.join(", ") || "" });
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
            const keywords = editSeo.keywords.split(",").map(k => k.trim()).filter(Boolean);
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
            const rows = await getAllSiteConfigs();
            if (rows.length > 0) setDbConfigs(rows);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : "저장 실패");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleOpen = async (siteId: SiteIdentifier, currentlyOpen: boolean) => {
        setToggling(siteId);
        try {
            await toggleSiteOpen(siteId, !currentlyOpen);
            const rows = await getAllSiteConfigs();
            if (rows.length > 0) setDbConfigs(rows);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : "상태 변경 실패");
        } finally {
            setToggling(null);
        }
    };

    // ── 이미지 업로드 핸들러 ──
    const handleImageUpload = async (file: File, type: 'logo' | 'favicon' | 'og') => {
        if (!selectedSite || !file.type.startsWith('image/')) return;
        setUploading(p => ({ ...p, [type]: true }));
        setSaveError(null);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('siteId', selectedSite);
            fd.append('type', type);
            const res = await fetch('/api/sites/upload', { method: 'POST', body: fd });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || '업로드 실패');
            }
            const { url } = await res.json();
            // 상태 업데이트
            if (type === 'logo') setEditLogo(url);
            else if (type === 'favicon') setEditFavicon(url);
            else setEditOgImage(url);
            // DB 자동 저장
            const dbKey = type === 'logo' ? 'logo_image_url' : type === 'favicon' ? 'favicon_url' : 'meta_og_image';
            await upsertSiteConfig(selectedSite, { [dbKey]: url });
            const rows = await getAllSiteConfigs();
            if (rows.length > 0) setDbConfigs(rows);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : '업로드 실패');
        } finally {
            setUploading(p => ({ ...p, [type]: false }));
        }
    };

    const selected = allSites.find(s => s.id === selectedSite);
    const selDomains = selected?.domains || [];

    return (
        <div className="space-y-6">
            <PageHeader title="사이트 관리" description={`${allSites.length}개 사이트 — 도메인, SEO, 브랜딩을 관리합니다.`} />

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                {/* ── 좌측: 사이트 목록 ── */}
                <div className="space-y-3">
                    {/* TenOne — 플랫폼 (분리) */}
                    {tenone && (
                        <button
                            onClick={() => selectSite('tenone')}
                            className={clsx(
                                "w-full text-left px-4 py-4 bg-white border transition-all",
                                selectedSite === 'tenone'
                                    ? "border-neutral-900 ring-1 ring-neutral-900"
                                    : "border-neutral-200 hover:border-neutral-400"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0">
                                    <Crown className="h-4 w-4 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold">Ten:One™</p>
                                        <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">PLATFORM</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-400">tenone.biz · www.tenone.biz</p>
                                </div>
                                <div className={clsx(
                                    "w-2 h-2 rounded-full shrink-0",
                                    tenone.isOpen ? "bg-emerald-500" : "bg-neutral-400"
                                )} />
                            </div>
                        </button>
                    )}

                    {/* Universe 사이트 목록 */}
                    <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Universe Sites</span>
                        <span className="text-[10px] text-neutral-300">{universeSites.length}</span>
                        <div className="flex-1 h-px bg-neutral-100" />
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="사이트명, 도메인 검색..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 focus:border-neutral-400 focus:outline-none bg-white" />
                    </div>

                    <div className="bg-white border border-neutral-100 max-h-[520px] overflow-y-auto divide-y divide-neutral-50">
                        {filtered.map(site => {
                            const domainCount = site.domains.filter(d => d.type !== 'path' && d.type !== 'vercel').length;
                            return (
                                <button
                                    key={site.id}
                                    onClick={() => selectSite(site.id)}
                                    className={clsx(
                                        "w-full text-left px-3.5 py-3 transition-all",
                                        selectedSite === site.id ? "bg-neutral-50 border-l-2 border-neutral-900" : "hover:bg-neutral-50/50"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="relative shrink-0">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                                                style={{ backgroundColor: site.isOpen ? site.colors.primary : '#a3a3a3' }}>
                                                {site.name.charAt(0)}
                                            </div>
                                            <div className={clsx(
                                                "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-[1.5px] border-white",
                                                site.isOpen ? "bg-emerald-500" : "bg-neutral-400"
                                            )} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={clsx("text-sm font-medium truncate", !site.isOpen && "text-neutral-400")}>{site.name}</p>
                                            <p className="text-[10px] text-neutral-400 truncate">{site.domain}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {domainCount > 1 && (
                                                <span className="text-[9px] text-neutral-400 bg-neutral-50 px-1 py-0.5 rounded">{domainCount}도메인</span>
                                            )}
                                            {!site.isOpen && (
                                                <span className="text-[9px] font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">닫힘</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── 우측: 사이트 상세 ── */}
                {selected ? (
                    <div className="space-y-5">
                        {/* 헤더 */}
                        <div className="bg-white border border-neutral-100 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: selected.colors.primary }}>
                                    {selected.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-semibold">{selected.name}</h2>
                                        {selected.id === 'tenone' && (
                                            <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">PLATFORM</span>
                                        )}
                                    </div>
                                    {selected.tagline && (
                                        <p className="text-[11px] text-neutral-400 mt-0.5">{selected.tagline}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const isOpen = selected.isOpen;
                                    const isToggling = toggling === selectedSite;
                                    return (
                                        <button
                                            onClick={() => handleToggleOpen(selected.id, isOpen)}
                                            disabled={isToggling || !selected.fromDB}
                                            title={!selected.fromDB ? "DB 미등록" : isOpen ? "사이트 닫기" : "사이트 열기"}
                                            className={clsx(
                                                "flex items-center gap-1.5 px-3 py-2 text-xs border transition-all disabled:opacity-40",
                                                isOpen
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                    : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                            )}
                                        >
                                            {isToggling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
                                            {isOpen ? "운영중" : "닫힘"}
                                        </button>
                                    );
                                })()}
                                <Link href={`/intra/bums/sites/${selectedSite}`}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:bg-neutral-50 transition-all">
                                    <LayoutGrid className="h-3 w-3" /> 게시판
                                </Link>
                                <Link href={`/intra/bums/sites/${selectedSite}/settings`}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:bg-neutral-50 transition-all">
                                    <Settings className="h-3 w-3" /> 설정
                                </Link>
                            </div>
                        </div>

                        {/* 도메인 */}
                        <div className="bg-white border border-neutral-100 p-5">
                            <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
                                <Link2 className="h-3.5 w-3.5 text-neutral-400" /> 도메인
                            </h3>
                            <div className="space-y-1.5">
                                {selDomains.map(d => (
                                    <div key={d.domain} className="flex items-center gap-2.5 py-1.5 px-2 rounded hover:bg-neutral-50 -mx-2">
                                        {/* 유형 배지 */}
                                        <span className={clsx(
                                            "text-[9px] font-bold tracking-wider uppercase w-12 text-center py-0.5 rounded shrink-0",
                                            d.type === 'independent' ? "bg-blue-50 text-blue-600" :
                                            d.type === 'subdomain' ? "bg-purple-50 text-purple-600" :
                                            d.type === 'vercel' ? "bg-neutral-100 text-neutral-400" :
                                            "bg-neutral-50 text-neutral-500"
                                        )}>
                                            {d.type === 'independent' ? '독립' : d.type === 'subdomain' ? '서브' : d.type === 'vercel' ? 'DEV' : '경로'}
                                        </span>
                                        {/* 도메인 */}
                                        <a href={`https://${d.domain}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-neutral-700 hover:text-neutral-900 flex items-center gap-1 transition-colors flex-1 min-w-0 truncate">
                                            {d.domain}
                                            <ExternalLink className="h-3 w-3 text-neutral-300 shrink-0" />
                                        </a>
                                        {/* 연결 상태 */}
                                        <span className={clsx(
                                            "text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0",
                                            d.status === 'connected'
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-amber-50 text-amber-600"
                                        )}>
                                            {d.status === 'connected' ? '연결됨' : '외부서버'}
                                        </span>
                                    </div>
                                ))}
                                {selDomains.length === 0 && (
                                    <p className="text-xs text-neutral-400 py-2">등록된 도메인이 없습니다</p>
                                )}
                            </div>
                        </div>

                        {/* 브랜딩: 로고, 파비콘, OG 이미지 — 드래그앤드롭 */}
                        <div className="bg-white border border-neutral-100 p-5">
                            <h3 className="text-xs font-semibold text-neutral-700 mb-4 flex items-center gap-1.5">
                                <ImageIcon className="h-3.5 w-3.5 text-neutral-400" /> 브랜딩 이미지
                                <span className="text-[10px] text-neutral-400 font-normal ml-auto">이미지를 드래그하거나 클릭하여 업로드 (자동 저장)</span>
                            </h3>
                            <div className="grid grid-cols-3 gap-5">
                                <DropZone label="로고" type="logo" currentUrl={editLogo} isUploading={!!uploading.logo}
                                    onFile={f => handleImageUpload(f, 'logo')}
                                    onClear={() => { setEditLogo(''); upsertSiteConfig(selectedSite!, { logo_image_url: '' }).then(() => getAllSiteConfigs().then(r => r.length > 0 && setDbConfigs(r))); }}
                                    aspect="aspect-[3/1]" imgSize={{ w: 200, h: 60 }} />
                                <DropZone label="파비콘" type="favicon" currentUrl={editFavicon} isUploading={!!uploading.favicon}
                                    onFile={f => handleImageUpload(f, 'favicon')}
                                    onClear={() => { setEditFavicon(''); upsertSiteConfig(selectedSite!, { favicon_url: '' }).then(() => getAllSiteConfigs().then(r => r.length > 0 && setDbConfigs(r))); }}
                                    aspect="aspect-square" imgSize={{ w: 32, h: 32 }} />
                                <DropZone label="대표 이미지 (OG)" type="og" currentUrl={editOgImage} isUploading={!!uploading.og}
                                    onFile={f => handleImageUpload(f, 'og')}
                                    onClear={() => { setEditOgImage(''); upsertSiteConfig(selectedSite!, { meta_og_image: '' }).then(() => getAllSiteConfigs().then(r => r.length > 0 && setDbConfigs(r))); }}
                                    aspect="aspect-[1200/630]" imgSize={{ w: 300, h: 157 }} />
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="bg-white border border-neutral-100 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-neutral-700">SEO / 메타</h3>
                                <span className="text-[10px] text-neutral-400">저장 시 사이트에 반영</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-neutral-500 uppercase block mb-1.5">메타 타이틀</label>
                                <input value={editSeo.title} onChange={e => setEditSeo(p => ({ ...p, title: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none bg-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-neutral-500 uppercase block mb-1.5">메타 설명</label>
                                <textarea value={editSeo.description} onChange={e => setEditSeo(p => ({ ...p, description: e.target.value }))}
                                    rows={2} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none bg-white resize-y" />
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-neutral-500 uppercase block mb-1.5">키워드</label>
                                <input value={editSeo.keywords} onChange={e => setEditSeo(p => ({ ...p, keywords: e.target.value }))}
                                    placeholder="쉼표로 구분"
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none bg-white" />
                            </div>
                        </div>

                        {/* 인공지능 최적화 */}
                        <div className="bg-white border border-neutral-100 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-neutral-400" /> 인공지능 최적화
                                </h3>
                                <span className="text-[10px] text-neutral-400">AI 검색엔진 노출 설정</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-neutral-500 uppercase block mb-1.5">llms.txt</label>
                                <textarea value={editAi.llms} onChange={e => setEditAi(p => ({ ...p, llms: e.target.value }))}
                                    rows={4} placeholder="# 사이트명&#10;> 사이트 설명&#10;&#10;## 주요 페이지&#10;- [페이지명](URL): 설명"
                                    className="w-full border border-neutral-200 px-3 py-2 text-xs font-mono focus:border-neutral-400 focus:outline-none bg-white resize-y" />
                                <p className="text-[10px] text-neutral-400 mt-1">AI가 사이트를 이해하는 데 사용하는 구조화된 설명 파일</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-neutral-500 uppercase block mb-1.5">robots.txt AI 설정</label>
                                <textarea value={editAi.robotsTxt} onChange={e => setEditAi(p => ({ ...p, robotsTxt: e.target.value }))}
                                    rows={3} placeholder="User-agent: GPTBot&#10;Allow: /&#10;&#10;User-agent: Claude-Web&#10;Allow: /"
                                    className="w-full border border-neutral-200 px-3 py-2 text-xs font-mono focus:border-neutral-400 focus:outline-none bg-white resize-y" />
                                <p className="text-[10px] text-neutral-400 mt-1">AI 크롤러 접근 허용/차단 규칙</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-neutral-500 uppercase block mb-1.5">구조화 데이터 (JSON-LD)</label>
                                <textarea value={editAi.structuredData} onChange={e => setEditAi(p => ({ ...p, structuredData: e.target.value }))}
                                    rows={4} placeholder='{"@context":"https://schema.org","@type":"Organization","name":"..."}'
                                    className="w-full border border-neutral-200 px-3 py-2 text-xs font-mono focus:border-neutral-400 focus:outline-none bg-white resize-y" />
                                <p className="text-[10px] text-neutral-400 mt-1">검색엔진과 AI가 사이트 정보를 정확히 파악하도록 돕는 메타데이터</p>
                            </div>
                        </div>

                        {/* 저장 */}
                        {saveError && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100">
                                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                <p className="text-xs text-red-600">{saveError}</p>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-50">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
                                {saving ? "저장 중..." : saved ? "저장 완료" : "저장"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-100 flex items-center justify-center py-24">
                        <div className="text-center text-neutral-400">
                            <Globe className="h-10 w-10 mx-auto mb-3 text-neutral-300" />
                            <p className="text-sm">좌측에서 사이트를 선택하세요</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── 드래그앤드롭 이미지 업로드 영역 ──
function DropZone({ label, type, currentUrl, isUploading, onFile, onClear, aspect, imgSize }: {
    label: string;
    type: string;
    currentUrl: string;
    isUploading: boolean;
    onFile: (f: File) => void;
    onClear: () => void;
    aspect: string;
    imgSize: { w: number; h: number };
}) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) onFile(file);
    };

    return (
        <div>
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider block mb-2">{label}</label>
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !isUploading && inputRef.current?.click()}
                className={clsx(
                    aspect, "relative bg-neutral-50 border-2 border-dashed rounded-lg flex items-center justify-center mb-2 overflow-hidden cursor-pointer transition-all",
                    dragOver ? "border-blue-400 bg-blue-50/50" : "border-neutral-200 hover:border-neutral-300",
                    isUploading && "pointer-events-none opacity-60"
                )}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center gap-1">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                        <span className="text-[10px] text-neutral-400">업로드 중...</span>
                    </div>
                ) : currentUrl ? (
                    <>
                        <Image src={currentUrl} alt={label} width={imgSize.w} height={imgSize.h}
                            className="object-contain max-h-full max-w-full" unoptimized />
                        <button onClick={e => { e.stopPropagation(); onClear(); }}
                            className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                        <Upload className="h-5 w-5" />
                        <span className="text-[10px]">드래그 또는 클릭</span>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
            </div>
        </div>
    );
}
