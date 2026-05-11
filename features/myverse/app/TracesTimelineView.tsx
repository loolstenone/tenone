"use client";

// 흔적 통합 타임라인 — moments · places · routines를 월별 그리드로 통합 조망.

import { useEffect, useMemo, useRef, useState } from "react";
import {
    Camera, Calendar, Search, Sparkles, X, MapPin, Users, Activity,
    Clock, ImageOff, Image as ImageIcon, Video, Filter, Upload,
    Loader2, Globe, ExternalLink, FileText, Timer,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DOMAINS, DOMAIN_KEYS, type DomainKey } from "@/lib/myverse/domains";
import { OnThisDayCard } from "./OnThisDayCard";
import { SimilarMoments } from "./SimilarMoments";

interface UnifiedTrace {
    id: string;             // prefixed: m_xxx | p_xxx | r_xxx
    source: "moment" | "place" | "routine";
    date: string;
    happened_at: string | null;
    media_type: "image" | "video" | "text" | null;
    media_url: string | null;
    thumbnail_url: string | null;
    caption: string | null;
    body: string | null;
    location: string | null;
    with_whom: string | null;
    activity: string | null;
    category: string | null;
    duration_min: number | null;
    visibility: "private" | "public" | "friends" | null;
    domain: string | null;
}

function rawId(prefixedId: string) {
    return prefixedId.replace(/^[mpr]_/, "");
}

type MediaFilter = "all" | "image" | "video" | "text";
type Period = "week" | "month" | "quarter" | "year" | "all";

const PERIODS: { key: Period; label: string; days: number | null }[] = [
    { key: "week",    label: "이번 주",  days: 7 },
    { key: "month",   label: "한 달",    days: 31 },
    { key: "quarter", label: "3개월",    days: 92 },
    { key: "year",    label: "1년",      days: 365 },
    { key: "all",     label: "전체",     days: null },
];

function fmtDate(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

function fmtMonth(ym: string) {
    const [y, m] = ym.split("-");
    return `${y}년 ${parseInt(m, 10)}월`;
}

function todayKST(): string {
    const d = new Date();
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
}

export function TracesTimelineView() {
    const sp = useSearchParams();
    const initialDomain = (sp?.get("domain") ?? null) as DomainKey | null;
    const initialPerson = sp?.get("person") ?? null;
    const initialQuery = sp?.get("q") ?? "";
    const initialPeriod = sp?.get("period") as Period | null;

    const [period, setPeriod] = useState<Period>(
        initialPeriod && ["week", "month", "quarter", "year", "all"].includes(initialPeriod)
            ? initialPeriod
            : "month"
    );
    const [traces, setTraces] = useState<UnifiedTrace[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(initialQuery);
    const [selected, setSelected] = useState<UnifiedTrace | null>(null);
    const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
    const [domainFilter, setDomainFilter] = useState<DomainKey | null>(
        initialDomain && DOMAIN_KEYS.includes(initialDomain) ? initialDomain : null
    );
    const [personFilter, setPersonFilter] = useState<string | null>(initialPerson);
    const [placeFilter, setPlaceFilter] = useState<string | null>(null);
    const [view, setView] = useState<"gallery" | "list">(() => {
        if (typeof window === "undefined") return "gallery";
        const saved = localStorage.getItem("myverse-traces-view");
        return saved === "list" ? "list" : "gallery";
    });
    useEffect(() => {
        if (typeof window !== "undefined") localStorage.setItem("myverse-traces-view", view);
    }, [view]);
    const [uploading, setUploading] = useState<{ current: number; total: number } | null>(null);
    const [myHandle, setMyHandle] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/auth/me")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (!cancelled && d?.user?.handle) setMyHandle(d.user.handle); })
            .catch(() => { /* ignore */ });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const periodCfg = PERIODS.find(p => p.key === period)!;
                let url = "/api/myverse/traces";
                if (periodCfg.days) {
                    url += `?from=${daysAgo(periodCfg.days)}&to=${todayKST()}`;
                } else {
                    url += `?from=2000-01-01&to=${todayKST()}`;
                }
                const res = await fetch(url);
                if (!res.ok || cancelled) return;
                const data = await res.json();
                if (!cancelled) setTraces(data.traces ?? []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [period]);

    // 검색 + 패싯 필터
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return traces.filter(t => {
            // 미디어 타입 필터 — places/routines는 "all"에서만 노출
            if (mediaFilter !== "all") {
                if (t.source !== "moment") return false;
                if (t.media_type !== mediaFilter) return false;
            }
            if (domainFilter && t.domain !== domainFilter) return false;
            if (personFilter && t.with_whom !== personFilter) return false;
            // 장소 필터: moments.location 또는 places.location(=place_name)
            if (placeFilter && t.location !== placeFilter) return false;
            if (q) {
                const hit =
                    t.caption?.toLowerCase().includes(q) ||
                    t.body?.toLowerCase().includes(q) ||
                    t.with_whom?.toLowerCase().includes(q) ||
                    t.location?.toLowerCase().includes(q) ||
                    t.activity?.toLowerCase().includes(q) ||
                    t.category?.toLowerCase().includes(q);
                if (!hit) return false;
            }
            return true;
        });
    }, [traces, query, mediaFilter, domainFilter, personFilter, placeFilter]);

    // 패싯 — 도메인/사람/장소 빈도 집계
    const facets = useMemo(() => {
        const domainCnt = new Map<DomainKey, number>();
        const personCnt = new Map<string, number>();
        const placeCnt  = new Map<string, number>();
        for (const t of traces) {
            if (t.domain) domainCnt.set(t.domain as DomainKey, (domainCnt.get(t.domain as DomainKey) ?? 0) + 1);
            if (t.with_whom) personCnt.set(t.with_whom, (personCnt.get(t.with_whom) ?? 0) + 1);
            if (t.location) placeCnt.set(t.location, (placeCnt.get(t.location) ?? 0) + 1);
        }
        return {
            domains: Array.from(domainCnt.entries()).sort((a, b) => b[1] - a[1]),
            people:  Array.from(personCnt.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8),
            places:  Array.from(placeCnt.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8),
        };
    }, [traces]);

    const hasActiveFilters = mediaFilter !== "all" || domainFilter || personFilter || placeFilter || query.trim();
    function clearFilters() {
        setMediaFilter("all");
        setDomainFilter(null);
        setPersonFilter(null);
        setPlaceFilter(null);
        setQuery("");
    }

    async function uploadOne(file: File): Promise<void> {
        const fileDate = new Date(file.lastModified);
        let dateStr = fileDate.toISOString().slice(0, 10);

        const form = new FormData();
        form.append("file", file);
        form.append("date", dateStr);
        const upRes = await fetch("/api/myverse/moments/upload", { method: "POST", body: form });
        if (!upRes.ok) return;
        const upData = await upRes.json();

        const exif = upData.exif as null | { happened_at: string | null; location: string | null; width: number | null; height: number | null };
        const happenedAt = exif?.happened_at ?? fileDate.toISOString();
        dateStr = happenedAt.slice(0, 10);

        await fetch("/api/myverse/moments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: dateStr,
                media_type: upData.media_type,
                media_url: upData.url,
                file_size: upData.file_size,
                caption: null,
                happened_at: happenedAt,
                location: exif?.location ?? undefined,
                width: exif?.width ?? undefined,
                height: exif?.height ?? undefined,
            }),
        });
    }

    async function bulkUpload(files: File[]) {
        if (files.length === 0) return;
        setUploading({ current: 0, total: files.length });
        try {
            for (let i = 0; i < files.length; i++) {
                setUploading({ current: i + 1, total: files.length });
                await uploadOne(files[i]);
            }
            const periodCfg = PERIODS.find(p => p.key === period)!;
            const url = periodCfg.days
                ? `/api/myverse/traces?from=${daysAgo(periodCfg.days)}&to=${todayKST()}`
                : `/api/myverse/traces?from=2000-01-01&to=${todayKST()}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setTraces(data.traces ?? []);
            }
        } finally {
            setUploading(null);
        }
    }

    // 월별 그룹핑
    const byMonth = useMemo(() => {
        const map = new Map<string, UnifiedTrace[]>();
        for (const t of filtered) {
            const ym = t.date.slice(0, 7);
            if (!map.has(ym)) map.set(ym, []);
            map.get(ym)!.push(t);
        }
        return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
    }, [filtered]);

    const stats = useMemo(() => {
        const photos    = traces.filter(t => t.source === "moment" && t.media_type === "image").length;
        const videos    = traces.filter(t => t.source === "moment" && t.media_type === "video").length;
        const places    = traces.filter(t => t.source === "place").length;
        const routines  = traces.filter(t => t.source === "routine").length;
        const days      = new Set(traces.map(t => t.date)).size;
        return { photos, videos, places, routines, days };
    }, [traces]);

    return (
        <div className="max-w-6xl mx-auto px-5 py-8 sm:px-10" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* 헤더 */}
            <div className="mb-8 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-2" style={{ color: "#6366F1" }}>
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                            photo_library
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-widest">TRACES</span>
                    </div>
                    <h1
                        className="text-[28px] sm:text-[32px] font-medium tracking-tight text-neutral-900 leading-tight"
                        style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                    >
                        흔적
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1.5">
                        내가 살아낸 순간들 — 사진·영상·메모·장소·루틴으로 남는 발자국
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                    {myHandle && (
                        <Link
                            href={`/myverse/${myHandle}`}
                            target="_blank"
                            rel="noopener"
                            title="내 공개 핸들 페이지"
                            className="inline-flex items-center gap-1 px-2.5 py-2 bg-white border border-neutral-200 hover:border-[#6366F1] text-neutral-600 hover:text-[#6366F1] rounded-lg text-xs font-medium transition-colors"
                        >
                            <Globe className="h-3.5 w-3.5" />
                            내 페이지
                        </Link>
                    )}
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={!!uploading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                    >
                        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {uploading ? `${uploading.current}/${uploading.total}` : "일괄 추가"}
                    </button>
                </div>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length > 0) bulkUpload(files);
                        e.target.value = "";
                    }}
                    className="hidden"
                />
            </div>

            {uploading && (
                <div className="mb-4 px-3 py-2 bg-[#6366F1]/5 border border-[#6366F1]/20 rounded-lg text-xs text-[#6366F1] flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    <span className="flex-1">업로드 중 · {uploading.current} / {uploading.total} · 업로드 후 AI가 자동 분류합니다</span>
                    <div className="w-24 h-1 bg-[#6366F1]/15 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#6366F1] transition-all"
                            style={{ width: `${(uploading.current / uploading.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* On This Day */}
            <OnThisDayCard
                onMomentClick={(id) => {
                    const found = traces.find(t => rawId(t.id) === id);
                    if (found) setSelected(found);
                }}
            />

            {/* 통계 스트립 */}
            {!loading && traces.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
                    <StatCard label="사진" value={stats.photos} />
                    <StatCard label="영상" value={stats.videos} />
                    <StatCard label="장소" value={stats.places} />
                    <StatCard label="루틴" value={stats.routines} />
                    <StatCard label="기록한 날" value={stats.days} suffix="일" />
                </div>
            )}

            {/* 컨트롤 바 */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {PERIODS.map(p => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                period === p.key
                                    ? "bg-[#6366F1] text-white"
                                    : "text-neutral-600 hover:bg-neutral-100"
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="장소·사람·활동·메모 검색"
                        className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-[#6366F1]"
                    />
                </div>
                {/* View 토글 */}
                <div className="inline-flex bg-neutral-100 rounded-lg p-0.5 self-start">
                    <button
                        onClick={() => setView("gallery")}
                        title="갤러리"
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                            view === "gallery" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                        갤러리
                    </button>
                    <button
                        onClick={() => setView("list")}
                        title="리스트"
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                            view === "list" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">view_list</span>
                        리스트
                    </button>
                </div>
            </div>

            {/* 패싯 필터 */}
            {!loading && traces.length > 0 && (
                <div className="mb-5 space-y-2">
                    {/* 소스 / 미디어 토글 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <FacetChip
                            active={mediaFilter === "all"}
                            onClick={() => setMediaFilter("all")}
                            icon={<Filter className="h-3 w-3" />}
                        >
                            전체 ({traces.length})
                        </FacetChip>
                        <FacetChip
                            active={mediaFilter === "image"}
                            onClick={() => setMediaFilter(mediaFilter === "image" ? "all" : "image")}
                            icon={<ImageIcon className="h-3 w-3" />}
                        >
                            사진
                        </FacetChip>
                        <FacetChip
                            active={mediaFilter === "video"}
                            onClick={() => setMediaFilter(mediaFilter === "video" ? "all" : "video")}
                            icon={<Video className="h-3 w-3" />}
                        >
                            영상
                        </FacetChip>
                        <FacetChip
                            active={mediaFilter === "text"}
                            onClick={() => setMediaFilter(mediaFilter === "text" ? "all" : "text")}
                            icon={<FileText className="h-3 w-3" />}
                        >
                            텍스트
                        </FacetChip>
                    </div>

                    {/* 9영역 */}
                    {facets.domains.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] uppercase tracking-widest text-neutral-400 mr-1">9영역</span>
                            {facets.domains.map(([key, cnt]) => {
                                const domain = DOMAINS[key as DomainKey];
                                if (!domain) return null;
                                return (
                                    <FacetChip
                                        key={key}
                                        active={domainFilter === key}
                                        onClick={() => setDomainFilter(domainFilter === key ? null : key as DomainKey)}
                                        color={domain.color_hex}
                                    >
                                        {domain.label_ko} <span className="opacity-60">·{cnt}</span>
                                    </FacetChip>
                                );
                            })}
                            {domainFilter && DOMAINS[domainFilter] && (
                                <Link
                                    href={DOMAINS[domainFilter].app_href}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border border-dashed transition-colors hover:bg-neutral-50"
                                    style={{ color: DOMAINS[domainFilter].color_hex, borderColor: DOMAINS[domainFilter].color_hex }}
                                >
                                    {DOMAINS[domainFilter].label_ko} 영역 →
                                    <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                            )}
                        </div>
                    )}

                    {/* 사람 */}
                    {facets.people.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] uppercase tracking-widest text-neutral-400 mr-1 inline-flex items-center gap-1">
                                <Users className="h-2.5 w-2.5" />사람
                            </span>
                            {facets.people.map(([name, cnt]) => (
                                <div key={name} className="inline-flex items-stretch rounded-full overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors">
                                    <button
                                        onClick={() => setPersonFilter(personFilter === name ? null : name)}
                                        className={`px-2.5 py-1 text-[11px] font-medium ${
                                            personFilter === name
                                                ? "bg-[#6366F1] text-white"
                                                : "bg-white text-neutral-600 hover:text-neutral-900"
                                        }`}
                                    >
                                        {name} <span className="opacity-60">·{cnt}</span>
                                    </button>
                                    <Link
                                        href={`/myverse/app/with/${encodeURIComponent(name)}`}
                                        title={`${name}와의 모든 흔적 보기`}
                                        className="px-1.5 flex items-center text-neutral-400 hover:text-[#6366F1] border-l border-neutral-200 bg-white"
                                    >
                                        →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 장소 */}
                    {facets.places.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] uppercase tracking-widest text-neutral-400 mr-1 inline-flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5" />장소
                            </span>
                            {facets.places.map(([place, cnt]) => (
                                <FacetChip
                                    key={place}
                                    active={placeFilter === place}
                                    onClick={() => setPlaceFilter(placeFilter === place ? null : place)}
                                >
                                    {place} <span className="opacity-60">·{cnt}</span>
                                </FacetChip>
                            ))}
                        </div>
                    )}

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-[11px] text-[#6366F1] hover:underline inline-flex items-center gap-0.5"
                        >
                            <X className="h-3 w-3" />
                            필터 모두 지우기 ({filtered.length}/{traces.length})
                        </button>
                    )}
                </div>
            )}

            {/* 본문 */}
            {loading ? (
                <SkeletonGrid />
            ) : traces.length === 0 ? (
                <EmptyState />
            ) : filtered.length === 0 ? (
                <NoSearchResult query={query} onClear={() => setQuery("")} />
            ) : (
                <div className="relative pl-6 sm:pl-8">
                    {/* 타임라인 세로선 */}
                    <div
                        className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px bg-neutral-200 myverse-dark:bg-white/10"
                        aria-hidden
                    />
                    <div className="space-y-10">
                        {byMonth.map(([ym, items]) => (
                            <section key={ym} className="relative">
                                <span
                                    className="absolute -left-6 sm:-left-8 top-3 h-3.5 w-3.5 rounded-full bg-white myverse-dark:bg-[#08080E] border-2"
                                    style={{ borderColor: "#6366F1" }}
                                    aria-hidden
                                />
                                <div className="flex items-baseline gap-3 mb-3 sticky top-12 bg-neutral-50 myverse-dark:bg-[#08080E] py-2 z-10">
                                    <h2
                                        className="text-base font-semibold text-neutral-800 myverse-dark:text-white"
                                        style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                                    >
                                        {fmtMonth(ym)}
                                    </h2>
                                    <span className="text-xs text-neutral-400">
                                        {items.length}건
                                    </span>
                                </div>
                                {view === "gallery" ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2">
                                        {items.map(t => (
                                            <TraceTile
                                                key={t.id}
                                                t={t}
                                                onClick={() => setSelected(t)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {items.map(t => (
                                            <TraceRow
                                                key={t.id}
                                                t={t}
                                                onClick={() => setSelected(t)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                </div>
            )}

            {/* 상세 모달 */}
            {selected && (
                <TraceDetailModal
                    trace={selected}
                    onClose={() => setSelected(null)}
                    onUpdated={(updated) => {
                        setTraces(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
                        setSelected(prev => prev ? { ...prev, ...updated } : prev);
                    }}
                />
            )}
        </div>
    );
}

// ─── 타일 (갤러리 뷰) ─────────────────────────────────────────

function TraceTile({ t, onClick }: { t: UnifiedTrace; onClick: () => void }) {
    if (t.source === "moment" && (t.media_type === "image" || t.media_type === "video")) {
        return <MediaMomentTile t={t} onClick={onClick} />;
    }
    return <TextTraceTile t={t} onClick={onClick} />;
}

function MediaMomentTile({ t, onClick }: { t: UnifiedTrace; onClick: () => void }) {
    const domainMeta = t.domain ? DOMAINS[t.domain as DomainKey] : null;
    return (
        <button
            onClick={onClick}
            className="group relative aspect-square rounded-md overflow-hidden bg-neutral-100 hover:ring-2 hover:ring-[#6366F1] transition-all"
        >
            {t.media_type === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={t.thumbnail_url || t.media_url!}
                    alt={t.caption || ""}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <video
                    src={t.media_url!}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                />
            )}
            {t.media_type === "video" && (
                <span className="absolute top-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded">VIDEO</span>
            )}
            <span
                className={`absolute bottom-1 left-1 inline-flex items-center justify-center w-4 h-4 rounded-full shadow-sm text-[9px] ${
                    t.visibility === "public"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-black/55 text-white"
                }`}
                title={t.visibility === "public" ? "공개" : "비공개"}
            >
                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {t.visibility === "public" ? "public" : "lock"}
                </span>
            </span>
            {domainMeta && (
                <span
                    className="absolute top-1 right-1 text-[8px] font-medium text-white px-1.5 py-0.5 rounded shadow-sm"
                    style={{ backgroundColor: domainMeta.color_hex }}
                >
                    {domainMeta.label_ko}
                </span>
            )}
            {t.location && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-4 pb-1 text-[9px] text-white truncate flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapPin className="h-2.5 w-2.5" />
                    {t.location}
                </div>
            )}
        </button>
    );
}

// 텍스트 포스트 · 장소 · 루틴 공통 텍스트 타일
function TextTraceTile({ t, onClick }: { t: UnifiedTrace; onClick: () => void }) {
    const isPlace   = t.source === "place";
    const isRoutine = t.source === "routine";

    const bgClass = isPlace
        ? "bg-indigo-950 hover:ring-indigo-500"
        : isRoutine
            ? "bg-neutral-800 hover:ring-neutral-500"
            : "bg-neutral-900 hover:ring-[#6366F1]";

    const preview = t.body || t.caption || t.activity || t.location || "";

    return (
        <button
            onClick={onClick}
            className={`group relative aspect-square rounded-md overflow-hidden ${bgClass} hover:ring-2 transition-all text-left p-2.5 flex flex-col`}
        >
            {/* 소스 아이콘 */}
            <div className="shrink-0 mb-1.5">
                {isPlace ? (
                    <MapPin className="h-3.5 w-3.5 text-indigo-300" />
                ) : isRoutine ? (
                    <Timer className="h-3.5 w-3.5 text-neutral-300" />
                ) : (
                    <FileText className="h-3.5 w-3.5 text-neutral-400" />
                )}
            </div>

            {/* 메인 텍스트 */}
            <p className="text-[11px] leading-snug text-white/90 line-clamp-4 flex-1">
                {isPlace ? (t.location ?? "") : preview}
            </p>

            {/* 푸터 칩 */}
            <div className="shrink-0 mt-1.5 flex items-center gap-1 flex-wrap">
                {isPlace && t.category && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-800/60 text-indigo-200">
                        {t.category}
                    </span>
                )}
                {isRoutine && t.duration_min && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-700/60 text-neutral-300">
                        {t.duration_min}분
                    </span>
                )}
                {isRoutine && t.category && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-700/60 text-neutral-300">
                        {t.category}
                    </span>
                )}
                {!isPlace && !isRoutine && t.visibility === "public" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300">공개</span>
                )}
            </div>
        </button>
    );
}

// ─── 행 (리스트 뷰) ──────────────────────────────────────────

function TraceRow({ t, onClick }: { t: UnifiedTrace; onClick: () => void }) {
    const domainMeta = t.domain ? DOMAINS[t.domain as DomainKey] : null;
    const time = t.happened_at ? new Date(t.happened_at) : null;
    const dateStr = time ? `${String(time.getMonth() + 1).padStart(2, "0")}.${String(time.getDate()).padStart(2, "0")}` : "";
    const timeStr = time ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}` : "";

    const isMedia = t.source === "moment" && (t.media_type === "image" || t.media_type === "video");
    const isPlace = t.source === "place";
    const isRoutine = t.source === "routine";

    const label = isPlace
        ? (t.location ?? "장소")
        : isRoutine
            ? (t.activity ?? "루틴")
            : (t.body ?? t.caption ?? "기록");

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-100 myverse-dark:hover:bg-white/5 transition-colors text-left"
        >
            {/* 썸네일 / 아이콘 */}
            <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                {isMedia ? (
                    t.media_type === "image" ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={t.thumbnail_url || t.media_url!} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                        <span className="material-symbols-outlined text-base text-neutral-400">videocam</span>
                    )
                ) : isPlace ? (
                    <MapPin className="h-4 w-4 text-indigo-500" />
                ) : isRoutine ? (
                    <Timer className="h-4 w-4 text-neutral-500" />
                ) : (
                    <FileText className="h-4 w-4 text-neutral-400" />
                )}
            </div>

            {/* 본문 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-neutral-400 tabular-nums">{dateStr} {timeStr}</span>
                    {/* 소스 뱃지 */}
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                        isPlace ? "bg-indigo-100 text-indigo-700"
                        : isRoutine ? "bg-neutral-100 text-neutral-600"
                        : t.media_type === "text" ? "bg-neutral-100 text-neutral-600"
                        : ""
                    }`}>
                        {isPlace ? "장소" : isRoutine ? "루틴" : t.media_type === "text" ? "포스트" : ""}
                    </span>
                    {domainMeta && (
                        <span
                            className="text-[9px] font-medium text-white px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: domainMeta.color_hex }}
                        >
                            {domainMeta.label_ko}
                        </span>
                    )}
                    {isRoutine && t.duration_min && (
                        <span className="text-[9px] text-neutral-400">{t.duration_min}분</span>
                    )}
                    {/* 미디어 모먼트 visibility */}
                    {t.source === "moment" && (
                        <span
                            className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded ${
                                t.visibility === "public"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-neutral-100 text-neutral-500"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {t.visibility === "public" ? "public" : "lock"}
                            </span>
                            {t.visibility === "public" ? "공개" : "비공개"}
                        </span>
                    )}
                </div>
                <div className="text-sm text-neutral-800 myverse-dark:text-neutral-200 truncate mt-0.5">
                    {label}
                </div>
            </div>

            {/* 장소/위치 */}
            {t.location && !isPlace && (
                <div className="hidden sm:flex items-center gap-0.5 text-[11px] text-neutral-400 max-w-[160px] truncate">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{t.location}</span>
                </div>
            )}
            {isPlace && t.category && (
                <span className="hidden sm:block text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {t.category}
                </span>
            )}
        </button>
    );
}

// ─── 상세 모달 ───────────────────────────────────────────────

function TraceDetailModal({ trace, onClose, onUpdated }: {
    trace: UnifiedTrace;
    onClose: () => void;
    onUpdated: (updated: Partial<UnifiedTrace> & { id: string }) => void;
}) {
    const [classifying, setClassifying] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [visibility, setVisibility] = useState<"private" | "public">(trace.visibility === "public" ? "public" : "private");
    const [savingVis, setSavingVis] = useState(false);
    const domainMeta = trace.domain ? DOMAINS[trace.domain as DomainKey] : null;

    const isMedia = trace.source === "moment" && (trace.media_type === "image" || trace.media_type === "video");
    const isMoment = trace.source === "moment";
    const isPlace = trace.source === "place";
    const isRoutine = trace.source === "routine";

    async function toggleVisibility() {
        if (!isMoment) return;
        const next = visibility === "public" ? "private" : "public";
        if (next === "public") {
            const ok = confirm("이 흔적을 공개로 전환하면 내 핸들 페이지 · 피드에서 누구나 볼 수 있어요.\n진행할까요?");
            if (!ok) return;
        }
        setSavingVis(true);
        try {
            const res = await fetch(`/api/myverse/moments/${rawId(trace.id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visibility: next }),
            });
            if (res.ok) {
                setVisibility(next);
                onUpdated({ id: trace.id, visibility: next });
            }
        } finally {
            setSavingVis(false);
        }
    }

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    async function runClassify() {
        if (classifying || !isMoment) return;
        setClassifying(true);
        setAiSuggestion(null);
        try {
            const res = await fetch(`/api/myverse/moments/${rawId(trace.id)}/classify`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                alert(`AI 분류 실패: ${data.error || res.status}`);
                return;
            }
            onUpdated({ id: trace.id, domain: data.domain, classification_version: 1 });
            if (data.caption_suggestion) setAiSuggestion(data.caption_suggestion);
        } catch (e) {
            alert(`AI 분류 오류: ${(e as Error).message}`);
        } finally {
            setClassifying(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[9000] bg-black/85 flex items-center justify-center p-0 sm:p-6"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
            <div
                className={`relative w-full h-full ${isMedia ? "sm:max-w-5xl sm:max-h-[90vh] flex flex-col sm:flex-row gap-0 sm:gap-4" : "sm:max-w-md sm:h-auto sm:rounded-xl bg-white"}`}
                onClick={e => e.stopPropagation()}
            >
                {/* 미디어 패널 (image/video만) */}
                {isMedia && (
                    <div className="flex-1 flex items-center justify-center bg-black sm:rounded-lg overflow-hidden min-h-0">
                        {trace.media_type === "image" ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={trace.media_url!}
                                alt={trace.caption || ""}
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <video
                                src={trace.media_url!}
                                className="max-w-full max-h-full"
                                controls
                                autoPlay
                                playsInline
                            />
                        )}
                    </div>
                )}

                {/* 메타 사이드바 / 텍스트 카드 */}
                <div className={`${isMedia ? "w-full sm:w-72 shrink-0 bg-white sm:rounded-lg p-5 overflow-y-auto max-h-[40vh] sm:max-h-none" : "p-6 overflow-y-auto max-h-[90vh]"}`}>
                    {/* 소스 뱃지 */}
                    <div className="flex items-center gap-2 mb-3">
                        {isPlace && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                <MapPin className="h-3 w-3" />장소
                            </span>
                        )}
                        {isRoutine && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
                                <Timer className="h-3 w-3" />루틴
                            </span>
                        )}
                        {isMoment && trace.media_type === "text" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
                                <FileText className="h-3 w-3" />포스트
                            </span>
                        )}
                    </div>

                    {/* 장소명 / 활동명 (텍스트 카드용 큰 타이틀) */}
                    {!isMedia && (
                        <h3 className="text-base font-semibold text-neutral-900 mb-3">
                            {isPlace ? (trace.location ?? "장소")
                             : isRoutine ? (trace.activity ?? "루틴")
                             : ""}
                        </h3>
                    )}

                    {/* body 텍스트 */}
                    {trace.body && (
                        <p className="text-sm text-neutral-800 leading-relaxed mb-4">
                            {trace.body}
                        </p>
                    )}
                    {!trace.body && trace.caption && (
                        <p className="text-sm text-neutral-800 leading-relaxed mb-4">
                            {trace.caption}
                        </p>
                    )}

                    {/* AI 분류 (moment만) */}
                    {isMoment && (domainMeta || (trace.domain)) && (
                        <div className="mb-4 pb-4 border-b border-neutral-100">
                            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-neutral-400 mb-2">
                                <Sparkles className="h-2.5 w-2.5" />
                                AI 분류
                            </div>
                            {domainMeta && (
                                <span
                                    className="inline-block text-[11px] font-medium text-white px-2 py-0.5 rounded-full mb-2"
                                    style={{ backgroundColor: domainMeta.color_hex }}
                                >
                                    {domainMeta.label_ko}
                                </span>
                            )}
                            {aiSuggestion && (
                                <p className="text-[11px] text-[#6366F1] italic mt-2">
                                    💡 추천 캡션: &ldquo;{aiSuggestion}&rdquo;
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-3 text-xs">
                        <MetaRow icon={<Calendar className="h-3.5 w-3.5" />} label="날짜" value={fmtDate(trace.date)} />
                        {trace.happened_at && (
                            <MetaRow icon={<Clock className="h-3.5 w-3.5" />} label="시각" value={new Date(trace.happened_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} />
                        )}
                        {trace.duration_min && (
                            <MetaRow icon={<Timer className="h-3.5 w-3.5" />} label="시간" value={`${trace.duration_min}분`} />
                        )}
                        {trace.with_whom && <MetaRow icon={<Users className="h-3.5 w-3.5" />} label="누구와" value={trace.with_whom} />}
                        {trace.location && <MetaRow icon={<MapPin className="h-3.5 w-3.5" />} label="어디서" value={trace.location} />}
                        {trace.activity && !isRoutine && <MetaRow icon={<Activity className="h-3.5 w-3.5" />} label="무엇을" value={trace.activity} />}
                        {trace.category && <MetaRow icon={<Filter className="h-3.5 w-3.5" />} label="카테고리" value={trace.category} />}
                    </div>

                    {/* moment 전용 액션 */}
                    {isMoment && trace.media_type === "image" && (
                        <button
                            onClick={runClassify}
                            disabled={classifying}
                            className="w-full mt-4 px-3 py-2 text-xs font-medium text-[#6366F1] border border-[#6366F1]/30 hover:bg-[#6366F1]/10 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                        >
                            <Sparkles className="h-3 w-3" />
                            {classifying ? "분석 중…" : trace.domain ? "AI 다시 분석" : "AI로 자동 분류"}
                        </button>
                    )}
                    {isMoment && (
                        <button
                            onClick={toggleVisibility}
                            disabled={savingVis}
                            className={`w-full mt-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5 ${
                                visibility === "public"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                    : "text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                            }`}
                        >
                            {visibility === "public" ? "🌐 공개됨 — 클릭해 비공개로" : "🔒 비공개 — 피드에 공개하기"}
                        </button>
                    )}

                    <Link
                        href={`/myverse/app/daily?date=${trace.date}`}
                        className="block mt-2 px-3 py-2 text-center text-xs font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                        이날의 오늘 보기 →
                    </Link>

                    {/* 비슷한 순간 (media moment만) */}
                    {isMoment && isMedia && (
                        <div className="mt-5 pt-4 border-t border-neutral-100">
                            <SimilarMoments momentId={rawId(trace.id)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── 공용 서브컴포넌트 ────────────────────────────────────────

function FacetChip({ active, onClick, icon, color, children }: {
    active: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    color?: string;
    children: React.ReactNode;
}) {
    const style = active && color ? { backgroundColor: color, borderColor: color, color: "white" } : undefined;
    return (
        <button
            onClick={onClick}
            style={style}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                active
                    ? color ? "" : "bg-[#6366F1] border-[#6366F1] text-white"
                    : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
            }`}
        >
            {icon}
            {children}
        </button>
    );
}

function StatCard({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</div>
            <div className="text-xl font-semibold text-neutral-900 mt-0.5">
                {value.toLocaleString()}<span className="text-xs text-neutral-400 ml-0.5">{suffix}</span>
            </div>
        </div>
    );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div>
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">
                {icon}
                {label}
            </div>
            <div className="text-sm text-neutral-800">{value}</div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="space-y-8">
            <div>
                <div className="h-5 w-32 bg-neutral-200 rounded mb-3 animate-pulse" />
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-neutral-100 rounded-md animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="border border-dashed border-neutral-300 rounded-xl py-16 px-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#6366F1]/10 flex items-center justify-center mb-3">
                <Camera className="h-5 w-5 text-[#6366F1]" />
            </div>
            <h3 className="text-base font-medium text-neutral-800 mb-1">아직 남긴 흔적이 없어요</h3>
            <p className="text-sm text-neutral-500 mb-5 max-w-md mx-auto">
                오늘 페이지에서 사진을 추가하거나, 인스타그램·페이스북 백업을 가져와서<br className="hidden sm:inline" />
                지난 시간을 한 곳에 모아 보세요.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <Link
                    href="/myverse/app/daily"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-xs font-medium hover:bg-[#4F46E5] transition-colors"
                >
                    <Camera className="h-3.5 w-3.5" />
                    일간에서 추가
                </Link>
                <Link
                    href="/myverse/app/settings/imports"
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-colors"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    백업 가져오기
                </Link>
            </div>
        </div>
    );
}

function NoSearchResult({ query, onClear }: { query: string; onClear: () => void }) {
    return (
        <div className="border border-dashed border-neutral-300 rounded-xl py-12 px-6 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <ImageOff className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-600">
                <span className="font-medium">&ldquo;{query}&rdquo;</span> 와(과) 일치하는 흔적이 없습니다
            </p>
            <button
                onClick={onClear}
                className="mt-3 text-xs text-[#6366F1] hover:underline"
            >
                검색 지우기
            </button>
        </div>
    );
}
