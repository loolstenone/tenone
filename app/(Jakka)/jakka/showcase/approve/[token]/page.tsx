"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
    getApprovalByToken, respondToShowcaseApproval,
    type JakkaShowcaseApproval, type JakkaShowcase,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

export default function ShowcaseApprovalPage() {
    const params = useParams();
    const token = params.token as string;
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const [data, setData] = useState<(JakkaShowcaseApproval & { showcase: JakkaShowcase }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [comment, setComment] = useState("");
    const [done, setDone] = useState<null | 'approved' | 'rejected'>(null);

    useEffect(() => {
        getApprovalByToken(token).then((d) => { setData(d); setLoading(false); });
    }, [token]);

    async function handleRespond(decision: 'approved' | 'rejected') {
        if (!user) { router.push("/jakka"); return; }
        if (!data) return;
        if (data.status !== 'pending') { alert("이미 응답된 요청입니다."); return; }
        setSubmitting(true);
        const uid = user.authId ?? user.id;
        const ok = await respondToShowcaseApproval(token, uid, decision, comment || undefined);
        setSubmitting(false);
        if (ok) setDone(decision);
        else alert("응답 실패. 다시 시도해주세요.");
    }

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-[15px] text-neutral-500">유효하지 않은 승인 링크입니다.</p>
                <Link href="/jakka" className="text-[13px] text-neutral-600 underline">홈으로</Link>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-[15px] text-neutral-500">로그인 후 승인할 수 있습니다.</p>
                <p className="text-[12px] text-neutral-600">이 링크는 {data.approver_email} 에게 전달되었습니다.</p>
            </div>
        );
    }

    if (done) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
                {done === 'approved' ? (
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                ) : (
                    <XCircle className="h-12 w-12 text-red-500" />
                )}
                <p className="text-[16px] font-bold">
                    {done === 'approved' ? '승인 완료' : '거부되었습니다'}
                </p>
                <p className="text-[13px] text-neutral-500">{data.showcase.title}</p>
                <Link href="/jakka/showcase" className="text-[12px] text-neutral-600 underline">쇼케이스 목록으로</Link>
            </div>
        );
    }

    if (data.status !== 'pending') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-[15px] text-neutral-500">이미 응답된 요청입니다.</p>
                <p className="text-[12px] text-neutral-600">상태: {data.status}</p>
            </div>
        );
    }

    const sc = data.showcase;

    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-xl mx-auto px-5 py-10">
                <p className="text-[10px] font-mono text-neutral-600 tracking-[0.2em] uppercase mb-2">Showcase Approval</p>
                <h1 className="text-[22px] font-black tracking-tight leading-tight mb-6">
                    아래 쇼케이스를 승인하시겠습니까?
                </h1>

                <div className="border border-neutral-300 p-5 mb-6">
                    {sc.category && (
                        <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider mb-1">{sc.category}</p>
                    )}
                    <p className="text-[18px] font-bold tracking-tight leading-snug mb-2">{sc.title}</p>
                    {sc.subtitle && (
                        <p className="text-[13px] text-neutral-500 mb-3">{sc.subtitle}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-[11px] text-neutral-500 mb-4">
                        <span>{sc.start_date} ~ {sc.end_date}</span>
                        {sc.location && <span>· {sc.location}</span>}
                    </div>
                    <p className="text-[13px] leading-relaxed text-neutral-700 whitespace-pre-wrap line-clamp-6">
                        {sc.description}
                    </p>
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="코멘트 (선택)"
                    rows={3}
                    className="w-full px-3 py-2 text-[13px] border border-neutral-300 focus:border-neutral-900 outline-none resize-none mb-4"
                />

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleRespond('rejected')}
                        disabled={submitting}
                        className="py-3 text-[13px] font-bold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                        거부
                    </button>
                    <button
                        onClick={() => handleRespond('approved')}
                        disabled={submitting}
                        className="py-3 text-[13px] font-bold bg-neutral-900 text-white hover:opacity-80 disabled:opacity-50"
                    >
                        {submitting ? "처리 중..." : "승인"}
                    </button>
                </div>
            </main>
        </div>
    );
}
