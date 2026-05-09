"use client";

// 흔적 통합 타임라인 — 전 기간 사진/동영상/메타를 월별 그리드로 조망.
// Phase 1: 기간 선택 + 월별 그룹 + 그리드 + 상세 모달.
// 후속 Phase에서 필터/검색/AI 분류/임포트 강화 추가.

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Calendar, Search, Sparkles, X, MapPin, Users, Activity, Clock, ImageOff, Image as ImageIcon, Video, Filter, Upload, Loader2, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DOMAINS, DOMAIN_KEYS, type DomainKey } from "@/lib/myverse/domains";
import { OnThisDayCard } from "./OnThisDayCard";
import { SimilarMoments } from "./SimilarMoments";

interface Moment {
    id: string;
    date: string;
    domain: DomainKey | null;
    sub_tags: string[] | null;
    classification_version: number | null;
    media_type: "image" | "video";
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    happened_at: string | null;
    with_whom: string | null;
    location: string | null;
    activity: string | null;
    visibility: "private" | "friends" | "public" | null;
    width: number | null;
    height: number | null;
    duration_sec: number | null;
    created_at: string;
}

type MediaFilter = "all" | "image" | "video";

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
    const [moments, setMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(initialQuery);
    const [selected, setSelected] = useState<Moment | null>(null);
    const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
    const [domainFilter, setDomainFilter] = useState<DomainKey | null>(
        initialDomain && DOMAIN_KEYS.includes(initialDomain) ? initialDomain : null
    );
    const [personFilter, setPersonFilter] = useState<string | null>(initialPerson);
    const [placeFilter, setPlaceFilter] = useState<string | null>(null);
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
                let url = "/api/myverse/moments";
                if (periodCfg.days) {
                    url += `?from=${daysAgo(periodCfg.days)}&to=${todayKST()}`;
                } else {
                    url += `?from=2000-01-01&to=${todayKST()}`;
                }
                const res = await fetch(url);
                if (!res.ok || cancelled) return;
                const data = await res.json();
                if (!cancelled) setMoments(data.moments ?? []);
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
        return moments.filter(m => {
            if (mediaFilter !== "all" && m.media_type !== mediaFilter) return false;
            if (domainFilter && m.domain !== domainFilter) return false;
            if (personFilter && m.with_whom !== personFilter) return false;
            if (placeFilter && m.location !== placeFilter) return false;
            if (q) {
                const hit =
                    m.caption?.toLowerCase().includes(q) ||
                    m.with_whom?.toLowerCase().includes(q) ||
                    m.location?.toLowerCase().includes(q) ||
                    m.activity?.toLowerCase().includes(q);
                if (!hit) return false;
            }
            return true;
        });
    }, [moments, query, mediaFilter, domainFilter, personFilter, placeFilter]);

    // 패싯 — 도메인/사람/장소 빈도 집계 (전체 moments 기준)
    const facets = useMemo(() => {
        const domainCnt = new Map<DomainKey, number>();
        const personCnt = new Map<string, number>();
        const placeCnt  = new Map<string, number>();
        for (const m of moments) {
            if (m.domain) domainCnt.set(m.domain, (domainCnt.get(m.domain) ?? 0) + 1);
            if (m.with_whom) personCnt.set(m.with_whom, (personCnt.get(m.with_whom) ?? 0) + 1);
            if (m.location) placeCnt.set(m.location, (placeCnt.get(m.location) ?? 0) + 1);
        }
        return {
            domains: Array.from(domainCnt.entries()).sort((a, b) => b[1] - a[1]),
            people:  Array.from(personCnt.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8),
            places:  Array.from(placeCnt.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8),
        };
    }, [moments]);

    const hasActiveFilters = mediaFilter !== "all" || domainFilter || personFilter || placeFilter || query.trim();
    function clearFilters() {
        setMediaFilter("all");
        setDomainFilter(null);
        setPersonFilter(null);
        setPlaceFilter(null);
        setQuery("");
    }

    async function uploadOne(file: File): Promise<void> {
        // 1차: 파일 lastModified — EXIF 우선
        const fileDate = new Date(file.lastModified);
        let dateStr = fileDate.toISOString().slice(0, 10);

        const form = new FormData();
        form.append("file", file);
        form.append("date", dateStr);
        const upRes = await fetch("/api/myverse/moments/upload", { method: "POST", body: form });
        if (!upRes.ok) return;
        const upData = await upRes.json();

        // EXIF에서 촬영 일자 회수 — date 필드도 EXIF 우선
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
            // 업로드 후 목록 재조회
            const periodCfg = PERIODS.find(p => p.key === period)!;
            const url = periodCfg.days
                ? `/api/myverse/moments?from=${daysAgo(periodCfg.days)}&to=${todayKST()}`
                : `/api/myverse/moments?from=2000-01-01&to=${todayKST()}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setMoments(data.moments ?? []);
            }
        } finally {
            setUploading(null);
        }
    }

    // 월별 그룹핑
    const byMonth = useMemo(() => {
        const map = new Map<string, Moment[]>();
        for (const m of filtered) {
            const ym = m.date.slice(0, 7);
            if (!map.has(ym)) map.set(ym, []);
            map.get(ym)!.push(m);
        }
        return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
    }, [filtered]);

    const stats = useMemo(() => {
        const photos = moments.filter(m => m.media_type === "image").length;
        const videos = moments.filter(m => m.media_type === "video").length;
        const days = new Set(moments.map(m => m.date)).size;
        const places = new Set(moments.map(m => m.location).filter(Boolean) as string[]).size;
        return { photos, videos, days, places };
    }, [moments]);

    return (
        <div className="max-w-6xl mx-auto px-5 py-8 sm:px-10" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* 헤더 — Stitch 디자인 정렬 (세션 122) */}
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
                        내가 살아낸 순간들 — 사진·영상·메모로 남는 발자국
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                    {myHandle && (
                        <Link
                            href={`/myverse/v/${myHandle}`}
                            target="_blank"
                            rel="noopener"
                            title="내 공개 Verse 페이지"
                            className="inline-flex items-center gap-1 px-2.5 py-2 bg-white border border-neutral-200 hover:border-[#6366F1] text-neutral-600 hover:text-[#6366F1] rounded-lg text-xs font-medium transition-colors"
                        >
                            <Globe className="h-3.5 w-3.5" />
                            내 Verse
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

            {/* On This Day — 작년·재작년 오늘의 흔적 */}
            <OnThisDayCard
                onMomentClick={(id) => {
                    const found = moments.find(m => m.id === id);
                    if (found) setSelected(found);
                }}
            />

            {/* 통계 스트립 */}
            {!loading && moments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
                    <StatCard label="사진" value={stats.photos} />
                    <StatCard label="영상" value={stats.videos} />
                    <StatCard label="기록한 날" value={stats.days} suffix="일" />
                    <StatCard label="다녀온 장소" value={stats.places} />
                </div>
            )}

            {/* 컨트롤 바 — 기간 + 검색 */}
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
            </div>

            {/* 패싯 필터 — 미디어·도메인·사람·장소 */}
            {!loading && moments.length > 0 && (
                <div className="mb-5 space-y-2">
                    {/* 미디어 토글 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <FacetChip
                            active={mediaFilter === "all"}
                            onClick={() => setMediaFilter("all")}
                            icon={<Filter className="h-3 w-3" />}
                        >
                            전체 ({moments.length})
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
                    </div>

                    {/* 9영역 */}
                    {facets.domains.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] uppercase tracking-widest text-neutral-400 mr-1">9영역</span>
                            {facets.domains.map(([key, cnt]) => {
                                const domain = DOMAINS[key];
                                if (!domain) return null;
                                return (
                                    <FacetChip
                                        key={key}
                                        active={domainFilter === key}
                                        onClick={() => setDomainFilter(domainFilter === key ? null : key)}
                                        color={domain.color_hex}
                                    >
                                        {domain.label_ko} <span className="opacity-60">·{cnt}</span>
                                    </FacetChip>
                                );
                            })}
                            {/* 활성 도메인 깊이 보기 */}
                            {domainFilter && DOMAINS[domainFilter] && (
                                <Link
                                    href={DOMAINS[domainFilter].app_href}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border border-dashed transition-colors hover:bg-neutral-50"
                                    style={{ color: DOMAINS[domainFilter].color_hex, borderColor: DOMAINS[domainFilter].color_hex }}
                                    title={`${DOMAINS[domainFilter].label_ko} 영역 깊이 보기 — 통계·전용 도구`}
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
                            필터 모두 지우기 ({filtered.length}/{moments.length})
                        </button>
                    )}
                </div>
            )}

            {/* 본문 */}
            {loading ? (
                <SkeletonGrid />
            ) : moments.length === 0 ? (
                <EmptyState />
            ) : filtered.length === 0 ? (
                <NoSearchResult query={query} onClear={() => setQuery("")} />
            ) : (
                <div className="space-y-8">
                    {byMonth.map(([ym, items]) => (
                        <section key={ym}>
                            <div className="flex items-baseline gap-3 mb-3 sticky top-12 bg-neutral-50 myverse-dark:bg-[#08080E] py-2 z-10">
                                <h2 className="text-base font-semibold text-neutral-800">
                                    {fmtMonth(ym)}
                                </h2>
                                <span className="text-xs text-neutral-400">
                                    {items.length}건
                                </span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2">
                                {items.map(m => (
                                    <MomentTile
                                        key={m.id}
                                        m={m}
                                        onClick={() => setSelected(m)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {/* 상세 모달 */}
            {selected && (
                <MomentDetailModal
                    moment={selected}
                    onClose={() => setSelected(null)}
                    onClassified={(updated) => {
                        setMoments(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
                        setSelected(prev => prev ? { ...prev, ...updated } : prev);
                    }}
                />
            )}
        </div>
    );
}

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

function MomentTile({ m, onClick }: { m: Moment; onClick: () => void }) {
    const domainMeta = m.domain ? DOMAINS[m.domain] : null;
    return (
        <button
            onClick={onClick}
            className="group relative aspect-square rounded-md overflow-hidden bg-neutral-100 hover:ring-2 hover:ring-[#6366F1] transition-all"
        >
            {m.media_type === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={m.thumbnail_url || m.media_url}
                    alt={m.caption || ""}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <video
                    src={m.media_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                />
            )}
            {m.media_type === "video" && (
                <span className="absolute top-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded">VIDEO</span>
            )}
            {domainMeta && (
                <span
                    className="absolute top-1 right-1 text-[8px] font-medium text-white px-1.5 py-0.5 rounded shadow-sm"
                    style={{ backgroundColor: domainMeta.color_hex }}
                    title={`AI 분류: ${domainMeta.label_ko}`}
                >
                    {domainMeta.label_ko}
                </span>
            )}
            {m.location && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-4 pb-1 text-[9px] text-white truncate flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapPin className="h-2.5 w-2.5" />
                    {m.location}
                </div>
            )}
        </button>
    );
}

function MomentDetailModal({ moment, onClose, onClassified }: {
    moment: Moment;
    onClose: () => void;
    onClassified: (updated: Partial<Moment> & { id: string }) => void;
}) {
    const [classifying, setClassifying] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [visibility, setVisibility] = useState<"private" | "public">(moment.visibility === "public" ? "public" : "private");
    const [savingVis, setSavingVis] = useState(false);
    const domainMeta = moment.domain ? DOMAINS[moment.domain] : null;

    async function toggleVisibility() {
        const next = visibility === "public" ? "private" : "public";
        // 공개 전환 시 명시적 동의 — 비공개 전환은 즉시
        if (next === "public") {
            const ok = confirm(
                "이 흔적을 공개로 전환하면 내 Verse 페이지(myverse.kr/@핸들)에서 누구나 볼 수 있어요.\n진행할까요?"
            );
            if (!ok) return;
        }
        setSavingVis(true);
        try {
            const res = await fetch(`/api/myverse/moments/${moment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visibility: next }),
            });
            if (res.ok) {
                setVisibility(next);
                onClassified({ id: moment.id, visibility: next });
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
        if (classifying) return;
        setClassifying(true);
        setAiSuggestion(null);
        try {
            const res = await fetch(`/api/myverse/moments/${moment.id}/classify`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                alert(`AI 분류 실패: ${data.error || res.status}`);
                return;
            }
            onClassified({
                id: moment.id,
                domain: data.domain,
                sub_tags: data.tags,
                classification_version: 1,
            });
            if (data.caption_suggestion) setAiSuggestion(data.caption_suggestion);
        } catch (e) {
            alert(`AI 분류 오류: ${(e as Error).message}`);
        } finally {
            setClassifying(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[9000] bg-black/85 myverse-dark:bg-black/95 flex items-center justify-center p-0 sm:p-6"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
            <div
                className="relative w-full h-full sm:max-w-5xl sm:max-h-[90vh] flex flex-col sm:flex-row gap-0 sm:gap-4"
                onClick={e => e.stopPropagation()}
            >
                {/* 미디어 */}
                <div className="flex-1 flex items-center justify-center bg-black sm:rounded-lg overflow-hidden min-h-0">
                    {moment.media_type === "image" ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={moment.media_url}
                            alt={moment.caption || ""}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <video
                            src={moment.media_url}
                            className="max-w-full max-h-full"
                            controls
                            autoPlay
                            playsInline
                        />
                    )}
                </div>
                {/* 메타 사이드바 */}
                <div className="w-full sm:w-72 shrink-0 bg-white sm:rounded-lg p-5 overflow-y-auto max-h-[40vh] sm:max-h-none">
                    {moment.caption && (
                        <p className="text-sm text-neutral-800 leading-relaxed mb-4">
                            {moment.caption}
                        </p>
                    )}

                    {/* AI 분류 결과 */}
                    {(domainMeta || (moment.sub_tags && moment.sub_tags.length > 0)) && (
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
                            {moment.sub_tags && moment.sub_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {moment.sub_tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {aiSuggestion && (
                                <p className="text-[11px] text-[#6366F1] italic mt-2">
                                    💡 추천 캡션: &ldquo;{aiSuggestion}&rdquo;
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-3 text-xs">
                        <MetaRow icon={<Calendar className="h-3.5 w-3.5" />} label="날짜" value={fmtDate(moment.date)} />
                        {moment.happened_at && (
                            <MetaRow icon={<Clock className="h-3.5 w-3.5" />} label="시각" value={new Date(moment.happened_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} />
                        )}
                        {moment.with_whom && <MetaRow icon={<Users className="h-3.5 w-3.5" />} label="누구와" value={moment.with_whom} />}
                        {moment.location && <MetaRow icon={<MapPin className="h-3.5 w-3.5" />} label="어디서" value={moment.location} />}
                        {moment.activity && <MetaRow icon={<Activity className="h-3.5 w-3.5" />} label="무엇을" value={moment.activity} />}
                    </div>

                    {moment.media_type === "image" && (
                        <button
                            onClick={runClassify}
                            disabled={classifying}
                            className="w-full mt-4 px-3 py-2 text-xs font-medium text-[#6366F1] border border-[#6366F1]/30 hover:bg-[#6366F1]/10 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                        >
                            <Sparkles className="h-3 w-3" />
                            {classifying ? "분석 중…" : moment.classification_version ? "AI 다시 분석" : "AI로 자동 분류"}
                        </button>
                    )}

                    {/* 공개 설정 */}
                    <button
                        onClick={toggleVisibility}
                        disabled={savingVis}
                        className={`w-full mt-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5 ${
                            visibility === "public"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                        }`}
                    >
                        {visibility === "public" ? "🌐 공개됨 — 클릭해 비공개로" : "🔒 비공개 — 내 Verse에 공개하기"}
                    </button>

                    <Link
                        href={`/myverse/app/daily?date=${moment.date}`}
                        className="block mt-2 px-3 py-2 text-center text-xs font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                        이날의 오늘 보기 →
                    </Link>

                    {/* 비슷한 순간 — 의미 검색 기반 클러스터 */}
                    <div className="mt-5 pt-4 border-t border-neutral-100">
                        <SimilarMoments momentId={moment.id} />
                    </div>
                </div>
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
                    href="/myverse/app/today"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-xs font-medium hover:bg-[#4F46E5] transition-colors"
                >
                    <Camera className="h-3.5 w-3.5" />
                    오늘에서 추가
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
