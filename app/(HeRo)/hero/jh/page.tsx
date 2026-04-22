"use client";

/**
 * JH 조회 페이지 — 본인의 JH 응답 요약 + 수정 진입
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Edit, Compass, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { JH_QUESTIONS } from "@/lib/hero/jh-questions";

const HERO_RED = "#E53935";

interface JHResponse {
    id: string;
    responses: Record<string, string | string[]>;
    practical_filters: Record<string, unknown>;
    status: string;
    submitted_at: string | null;
    updated_at: string;
}

export default function JHViewPage() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const [jh, setJh] = useState<JHResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            try {
                const res = await fetch(`/api/hero/jh?memberId=${user.id}`);
                const data = await res.json();
                setJh(data.jh);
            } catch { /* ignore */ }
            setLoading(false);
        })();
    }, [user?.id]);

    if (isLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginModal isOpen={true} onClose={() => {}} accentColor={HERO_RED} /></div>;

    // 미작성
    if (!jh) {
        return (
            <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <Compass className="h-12 w-12 mx-auto mb-5 text-neutral-300" />
                    <h1 className="text-2xl font-extrabold mb-3">Job Hope — 자리의 바람</h1>
                    <p className="text-sm text-neutral-500 mb-8">
                        당신이 풀고 싶은 문제, 닿고 싶은 자리를 12문항으로 좌표화합니다.<br />
                        HeRo 매칭 엔진이 TIH·HIT·JD와 함께 읽어 당신에게 맞닿는 기회를 조용히 제안합니다.
                    </p>
                    <Link href="/hero/jh/write"
                        className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg"
                        style={{ backgroundColor: HERO_RED }}>
                        JH 작성 시작 <ArrowRight className="h-4 w-4" />
                    </Link>
                    <p className="text-xs text-neutral-400 mt-3">4~7분 소요 · 자동 저장</p>
                </div>
            </div>
        );
    }

    const answered = JH_QUESTIONS.filter(q => {
        const v = jh.responses[q.key];
        if (v === undefined || v === null || v === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
    }).length;

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-2xl mx-auto px-6">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-xs font-bold rounded-full mb-3" style={{ color: HERO_RED }}>
                            <Compass className="h-3.5 w-3.5" /> Job Hope
                        </div>
                        <h1 className="text-2xl font-extrabold mb-1">내가 쓴 자리의 바람</h1>
                        <p className="text-sm text-neutral-500">
                            상태: <span className="font-semibold">{jh.status === "active" ? "매칭 대기" : jh.status === "draft" ? "작성 중" : jh.status}</span>
                            {" · "}
                            응답 {answered}/{JH_QUESTIONS.length}
                            {" · "}
                            마지막 수정 {new Date(jh.updated_at).toLocaleDateString("ko-KR")}
                        </p>
                    </div>
                    <Link href="/hero/jh/write"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg"
                        style={{ backgroundColor: HERO_RED }}>
                        <Edit className="h-3.5 w-3.5" /> 수정
                    </Link>
                </div>

                <div className="space-y-5">
                    {JH_QUESTIONS.map((q, i) => {
                        const val = jh.responses[q.key];
                        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) return null;
                        const selected = Array.isArray(val) ? val : [val];
                        const labels = selected.map(v => q.options?.find(o => o.value === v)?.label ?? String(v));

                        return (
                            <div key={q.key} className="bg-white border border-neutral-200 rounded-lg p-4">
                                <p className="text-xs text-neutral-400 mb-1 font-mono">JH{i + 1}</p>
                                <p className="text-sm text-neutral-700 mb-2">{q.label}</p>
                                {q.type === "text" ? (
                                    <p className="text-sm italic text-neutral-800 pl-3 border-l-2 border-rose-300">{String(val)}</p>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {labels.map((l, j) => (
                                            <span key={j} className="px-2 py-1 text-xs rounded-full bg-rose-50 text-rose-700 font-medium">{l}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 p-4 bg-neutral-100 border border-neutral-200 rounded-lg text-xs text-neutral-600">
                    💡 JH는 언제든 업데이트 가능합니다. 성장하면서 방향이 바뀔 수 있습니다.
                </div>
            </div>
        </div>
    );
}
