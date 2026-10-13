"use client";

/**
 * Jobs Tab — 맞춤 채용 피드
 * JH + HIT 기반 필터링된 JD 리스트. 서술적 매칭 이유 (Tetrad 비공개 원칙).
 * 액션: "관심 있어요" · "지금은 아님" · "자세히 보기"
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Briefcase,
    Building2,
    Calendar,
    MapPin,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";

const RED = "#E53935";

interface JobItem {
    id: string;
    title: string | null;
    summary: string | null;
    companyName?: string | null;
    companyIndustry?: string | null;
    companySize?: string | null;
    employmentType?: string | null;
    experienceRange?: string | null;
    publishedAt?: string | null;
    reasons: string[];
}

interface FeedResponse {
    hasJH: boolean;
    total: number;
    items: JobItem[];
}

export function JobsTab({ memberId }: { memberId: string }) {
    const [feed, setFeed] = useState<FeedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const r = await fetch(`/api/hero/jobs/feed?memberId=${memberId}&limit=8`);
            if (r.ok) setFeed(await r.json());
            else setError(((await r.json()) as { error?: string }).error ?? "오류");
        } catch (e) {
            setError(e instanceof Error ? e.message : "네트워크 오류");
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => { load(); }, [load]);

    if (loading) {
        return (
            <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-neutral-100 rounded-xs" />
                ))}
            </div>
        );
    }

    if (error || !feed) {
        return (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xs p-6 text-center">
                <p className="text-sm text-neutral-600">{error ?? "데이터를 불러올 수 없습니다"}</p>
                <button onClick={load} className="mt-3 px-3 py-1.5 bg-[#E53935] text-white text-sm rounded-xs">다시 시도</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!feed.hasJH && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xs p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-neutral-700" />
                        <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">희망 직무 설문 필요</span>
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-1">나와 맞는 회사를 보려면 희망 직무 설문이 필요해요</h3>
                    <p className="text-sm text-neutral-600 mb-3">희망 직무 설문 12문항 · 약 5분. 작성하면 매칭 정확도가 올라갑니다.</p>
                    <Link
                        href="/hero/jh/write"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs text-white text-sm font-bold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: RED }}
                    >
                        희망 직무 설문 작성하기 <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-xs p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5" style={{ color: RED }} />
                            맞춤 채용 피드
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">
                            {feed.hasJH
                                ? `희망 직무 설문과 HIT 결과로 고른 ${feed.items.length}건`
                                : "지금은 최신순입니다. 희망 직무 설문을 작성하면 나와 맞는 순서로 보여 드립니다."}
                        </p>
                    </div>
                </div>

                {feed.items.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xs">
                        <Briefcase className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-sm text-neutral-500">아직 게시된 JD가 없어요.</p>
                        <p className="text-xs text-neutral-400 mt-1">기업이 JD를 발행하면 여기에 표시됩니다.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {feed.items.map((job) => (
                            <JobCard key={job.id} job={job} memberId={memberId} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function JobCard({ job, memberId }: { job: JobItem; memberId: string }) {
    const [interested, setInterested] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false); // "자세히" — JD 상세 페이지가 없어 카드 안에서 펼친다 (2026-10-12)
    const pendingRef = useRef(false);

    const daysAgo = job.publishedAt
        ? Math.floor((Date.now() - new Date(job.publishedAt).getTime()) / 86400000)
        : null;

    async function handleInterest() {
        if (interested || pendingRef.current) return;
        pendingRef.current = true;
        setLoading(true);
        setInterested(true); // optimistic
        try {
            const r = await fetch("/api/hero/jobs/interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId, jdId: job.id }),
            });
            if (!r.ok) setInterested(false);
        } catch {
            setInterested(false);
        } finally {
            setLoading(false);
            pendingRef.current = false;
        }
    }

    return (
        <div className="border border-neutral-200 rounded-xs p-5 hover:border-neutral-300 transition-all">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {job.companyName && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600">
                                <Building2 className="w-3 h-3" />
                                {job.companyName}
                            </span>
                        )}
                        {job.companyIndustry && (
                            <span className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-none">
                                {job.companyIndustry}
                            </span>
                        )}
                        {job.companySize && (
                            <span className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-none">
                                {job.companySize}
                            </span>
                        )}
                    </div>
                    <h4 className="font-bold text-neutral-900 text-base leading-tight">
                        {job.title ?? "제목 미기재"}
                    </h4>
                    {job.summary && (
                        <p className={`text-sm text-neutral-500 mt-1 whitespace-pre-line ${expanded ? "" : "line-clamp-2"}`}>{job.summary}</p>
                    )}
                </div>
                {daysAgo !== null && daysAgo < 7 && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-red-50 text-[#E53935] rounded-none">
                        {daysAgo === 0 ? "오늘" : `${daysAgo}일 전`}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mb-3">
                {job.employmentType && (
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.employmentType}
                    </span>
                )}
                {job.experienceRange && (
                    <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {job.experienceRange}
                    </span>
                )}
            </div>

            {job.reasons.length > 0 && (
                <div className="p-3 bg-rose-50/60 rounded-xs mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#E53935] mb-1.5">왜 맞는가</p>
                    <ul className="space-y-1">
                        {job.reasons.map((r, i) => (
                            <li key={i} className="text-xs text-neutral-700 flex items-start gap-1.5">
                                <span className="text-[#E53935] mt-0.5">·</span>
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                <button
                    onClick={handleInterest}
                    disabled={interested || loading}
                    className="flex-1 py-2 rounded-xs text-white text-sm font-bold transition-all"
                    style={{ backgroundColor: interested ? "#9E9E9E" : RED, opacity: loading ? 0.7 : 1 }}
                >
                    {interested ? "관심 등록됨 ✓" : "관심 있어요"}
                </button>
                <button
                    type="button"
                    onClick={() => setExpanded(v => !v)}
                    aria-expanded={expanded}
                    className="px-4 py-2 rounded-xs border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
                >
                    {expanded ? "접기" : "자세히"}
                </button>
            </div>
        </div>
    );
}
