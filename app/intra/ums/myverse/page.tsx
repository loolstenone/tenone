"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Camera, MessageCircle, Sparkles, Globe, Flag, ShieldOff, Activity, Loader2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/intra/IntraUI";

interface Overview {
    members_count: number;
    moments_total: number;
    moments_public: number;
    dm_threads: number;
    weekly_reports: number;
    coach_insights: number;
    reports_open: number;
    reports_resolved: number;
    blocks_total: number;
    active_7d: number;
}

export default function MyverseDashboard() {
    const [data, setData] = useState<Overview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/intra/myverse/overview");
                if (!r.ok) {
                    setError(r.status === 403 ? "권한이 없습니다." : "조회 실패");
                    return;
                }
                setData(await r.json());
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div>
            <PageHeader title="My Universe 대시보드" description="회원 / 흔적 / 모더레이션 운영 현황" />

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
            ) : error ? (
                <p className="text-sm text-rose-500">{error}</p>
            ) : data ? (
                <>
                    {/* 회원 / 활동 */}
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">회원 · 활동</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <StatCard label="가입 회원" value={data.members_count.toLocaleString()} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="최근 7일 활성" value={data.active_7d.toLocaleString()} sub="흔적·일과·메시지 작성" icon={<Activity className="h-4 w-4" />} />
                        <StatCard label="DM 스레드" value={data.dm_threads.toLocaleString()} icon={<MessageCircle className="h-4 w-4" />} />
                        <StatCard label="AI 인사이트 발행" value={(data.weekly_reports + data.coach_insights).toLocaleString()} sub={`주간 ${data.weekly_reports} · 카드 ${data.coach_insights}`} icon={<Sparkles className="h-4 w-4" />} />
                    </div>

                    {/* 흔적 */}
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">흔적</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <StatCard label="총 흔적" value={data.moments_total.toLocaleString()} icon={<Camera className="h-4 w-4" />} />
                        <StatCard label="공개 흔적" value={data.moments_public.toLocaleString()} sub={`${data.moments_total > 0 ? Math.round((data.moments_public / data.moments_total) * 100) : 0}% 공개율`} icon={<Globe className="h-4 w-4" />} />
                    </div>

                    {/* 모더레이션 */}
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">모더레이션</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <StatCard
                            label="처리 대기 신고"
                            value={data.reports_open.toLocaleString()}
                            sub={data.reports_open > 0 ? "지금 검토 필요" : "처리 대기 없음"}
                            icon={<Flag className={`h-4 w-4 ${data.reports_open > 0 ? "text-rose-500" : ""}`} />}
                            href="/intra/ums/myverse/reports"
                        />
                        <StatCard label="처리 완료 신고" value={data.reports_resolved.toLocaleString()} icon={<Flag className="h-4 w-4" />} />
                        <StatCard label="차단 관계" value={data.blocks_total.toLocaleString()} icon={<ShieldOff className="h-4 w-4" />} />
                    </div>

                    <div className="mt-8 flex gap-2 flex-wrap">
                        <Link href="/intra/ums/myverse/reports"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-white border border-neutral-200 hover:border-neutral-300 rounded">
                            <Flag className="h-3.5 w-3.5" /> 신고 검토
                        </Link>
                        <Link href="/intra/ums/members/list?brand=myverse"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-white border border-neutral-200 hover:border-neutral-300 rounded">
                            <Users className="h-3.5 w-3.5" /> 회원 목록
                        </Link>
                    </div>
                </>
            ) : null}
        </div>
    );
}
