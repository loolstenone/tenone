"use client";

// 공개 Verse 페이지 — 누구나 접근. visibility=public 흔적만 표시.
// 사용자 큐레이션 + OG 공유용. 본인 페이지에는 "수정"·"공개 설정" 진입 동선 포함.

import Link from "next/link";
import { Camera, MapPin, Share2, Sparkles } from "lucide-react";
import { DOMAINS, type DomainKey } from "@/lib/myverse/domains";
import { useState } from "react";
import { FollowButton } from "./FollowButton";

interface PublicMoment {
    id: string;
    date: string;
    domain: DomainKey | null;
    sub_tags: string[] | null;
    media_type: "image" | "video";
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    happened_at: string | null;
    location: string | null;
    with_whom: string | null;
    activity: string | null;
}

interface VerseData {
    member: {
        name: string;
        handle: string;
        avatar_url: string | null;
        bio: string | null;
    };
    stats: {
        moments_count: number;
        recorded_days: number;
        places_count: number;
        domain_distribution: Record<string, number>;
    };
    moments: PublicMoment[];
}

export function VersePublicView({ data }: { data: VerseData }) {
    const { member, stats, moments } = data;
    const [shareToast, setShareToast] = useState(false);

    async function share() {
        const url = typeof window !== "undefined" ? window.location.href : "";
        const title = `${member.name} (@${member.handle}) · Myverse`;
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                return;
            } catch { /* canceled */ }
        }
        try {
            await navigator.clipboard.writeText(url);
            setShareToast(true);
            setTimeout(() => setShareToast(false), 2000);
        } catch { /* ignore */ }
    }

    // 월별 그룹핑
    const byMonth = new Map<string, PublicMoment[]>();
    for (const m of moments) {
        const ym = m.date.slice(0, 7);
        if (!byMonth.has(ym)) byMonth.set(ym, []);
        byMonth.get(ym)!.push(m);
    }
    const monthGroups = Array.from(byMonth.entries()).sort(([a], [b]) => b.localeCompare(a));

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
            {/* 프로필 헤더 */}
            <header className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#4F46E5] shrink-0 flex items-center justify-center">
                    {member.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-white text-3xl font-semibold">{member.name?.[0] ?? "?"}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#6366F1] mb-1">
                        <Sparkles className="h-3 w-3" />
                        VERSE
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900">
                        {member.name}
                    </h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        @{member.handle} · myverse.kr/@{member.handle}
                    </p>
                    {member.bio && (
                        <p className="text-sm text-neutral-700 mt-2 leading-relaxed max-w-md">
                            {member.bio}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <FollowButton handle={member.handle} />
                    <button
                        onClick={share}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:border-[#6366F1] text-neutral-700 hover:text-[#6366F1] rounded-lg text-xs font-medium transition-colors"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        공유
                    </button>
                </div>
            </header>

            {/* 통계 + 9영역 분포 */}
            <div className="grid grid-cols-3 gap-2 mb-8">
                <Stat label="공개 흔적" value={stats.moments_count} />
                <Stat label="기록한 날" value={stats.recorded_days} suffix="일" />
                <Stat label="다녀온 장소" value={stats.places_count} />
            </div>

            {Object.keys(stats.domain_distribution).length > 0 && (
                <div className="mb-8 flex flex-wrap gap-1.5">
                    {Object.entries(stats.domain_distribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([key, cnt]) => {
                            const meta = DOMAINS[key as DomainKey];
                            if (!meta) return null;
                            return (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white rounded-full"
                                    style={{ backgroundColor: meta.color_hex }}
                                >
                                    {meta.label_ko}
                                    <span className="opacity-70">·{cnt}</span>
                                </span>
                            );
                        })}
                </div>
            )}

            {/* 흔적 그리드 */}
            {moments.length === 0 ? (
                <div className="border border-dashed border-neutral-300 rounded-xl py-16 px-6 text-center">
                    <Camera className="h-6 w-6 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-600 mb-1">아직 공개된 흔적이 없어요</p>
                    <p className="text-xs text-neutral-400">@{member.handle}님이 곧 흔적을 공개할 거예요</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {monthGroups.map(([ym, items]) => {
                        const [y, m] = ym.split("-");
                        return (
                            <section key={ym}>
                                <h2 className="text-base font-semibold text-neutral-800 mb-3">
                                    {y}년 {parseInt(m, 10)}월
                                    <span className="ml-2 text-xs text-neutral-400 font-normal">{items.length}건</span>
                                </h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2">
                                    {items.map(m => <PublicTile key={m.id} m={m} />)}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}

            {/* 푸터 */}
            <footer className="mt-12 pt-6 border-t border-neutral-100 text-center">
                <Link
                    href="/myverse"
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#6366F1] transition-colors"
                >
                    <Sparkles className="h-3 w-3" />
                    Powered by Myverse — 디지털 속 나를 키운다
                </Link>
            </footer>

            {shareToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-4 py-2 rounded-full z-50">
                    링크가 복사됐어요
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-center">
            <div className="text-[9px] uppercase tracking-widest text-neutral-400">{label}</div>
            <div className="text-lg sm:text-xl font-semibold text-neutral-900 mt-0.5">
                {value.toLocaleString()}<span className="text-xs text-neutral-400 ml-0.5">{suffix}</span>
            </div>
        </div>
    );
}

function PublicTile({ m }: { m: PublicMoment }) {
    const meta = m.domain ? DOMAINS[m.domain] : null;
    return (
        <div className="group relative aspect-square rounded-md overflow-hidden bg-neutral-100">
            {m.media_type === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={m.thumbnail_url || m.media_url} alt={m.caption || ""} className="w-full h-full object-cover" loading="lazy" />
            ) : (
                <video src={m.media_url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
            )}
            {meta && (
                <span
                    className="absolute top-1 right-1 text-[8px] font-medium text-white px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: meta.color_hex }}
                >
                    {meta.label_ko}
                </span>
            )}
            {(m.caption || m.location) && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-1.5 pt-4 pb-1 text-[9px] text-white space-y-0.5">
                    {m.caption && <div className="line-clamp-1">{m.caption}</div>}
                    {m.location && (
                        <div className="flex items-center gap-0.5 truncate opacity-90">
                            <MapPin className="h-2 w-2" />
                            <span className="truncate">{m.location}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
