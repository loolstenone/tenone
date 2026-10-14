"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import type { PublicReview, ReviewSummary } from "@/lib/planners/reviews";

// 플래너'스 PAD 상품 후기 — 아임웹 '구매평' 자리. 바닥상회에서 옮긴 후기는 이름을 가려 표시 (app/(Planners)/CLAUDE.md)
export function Reviews({ fileId, reviews, summary }: { fileId: string; reviews: PublicReview[]; summary: ReviewSummary }) {
    const mine = reviews.find((r) => r.mine);
    const [showAll, setShowAll] = useState(false);
    const shown = showAll ? reviews : reviews.slice(0, 5);

    return (
        <section id="reviews" className="border-t border-neutral-200">
            <div className="mx-auto max-w-[860px] px-4 py-10 md:px-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <h2 className="text-lg font-bold">후기 <span className="text-neutral-400">{summary.count}</span></h2>
                    {summary.count > 0 && (
                        <p className="flex items-center gap-1.5 text-sm text-neutral-600">
                            <Stars value={summary.average} /> <b className="text-neutral-900">{summary.average.toFixed(1)}</b> / 5
                        </p>
                    )}
                </div>

                <ReviewForm fileId={fileId} mine={mine} />

                {reviews.length === 0 ? (
                    <p className="mt-6 text-sm text-neutral-400">아직 후기가 없습니다. 써 본 느낌을 처음으로 남겨 주세요.</p>
                ) : (
                    <ul className="mt-6 divide-y divide-neutral-100 border-y border-neutral-200">
                        {shown.map((r) => (
                            <li key={r.id} className="py-5">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <Stars value={r.rating} />
                                    <span className="font-medium">{r.name}</span>
                                    {r.mine && <span className="bg-[#0F766E]/10 px-1.5 text-xs text-[#0F766E]">내 후기</span>}
                                    <span className="text-xs text-neutral-400">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                                    {r.edition && <span className="text-xs text-neutral-400">· {r.edition}</span>}
                                </div>
                                <p className="mt-2 whitespace-pre-line break-keep text-[15px] leading-relaxed text-neutral-800">{r.body}</p>
                                {r.adminReply && (
                                    <div className="mt-3 border-l-2 border-[#0F766E] bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                                        <b className="mr-1.5 text-[#0F766E]">Planner&apos;s</b>{r.adminReply}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {reviews.length > 5 && !showAll && (
                    <button onClick={() => setShowAll(true)} className="mt-4 w-full border border-neutral-200 py-2.5 text-sm text-neutral-600 hover:border-neutral-400">
                        후기 {reviews.length - 5}개 더 보기
                    </button>
                )}
                {reviews.some((r) => r.source === "badak") && (
                    <p className="mt-4 text-xs text-neutral-400">바닥상회에서 받으신 분들이 남긴 후기를 옮겨 왔습니다. 이름은 가려서 보여 드립니다.</p>
                )}
            </div>
        </section>
    );
}

function Stars({ value }: { value: number }) {
    return (
        <span className="flex" aria-label={`별점 ${value.toFixed(1)}점`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`} />
            ))}
        </span>
    );
}

function ReviewForm({ fileId, mine }: { fileId: string; mine?: PublicReview }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [rating, setRating] = useState(mine?.rating ?? 5);
    const [body, setBody] = useState(mine?.body ?? "");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true); setError(null);
        try {
            const res = await fetch(`/api/planners-library/${fileId}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, body }) });
            const d = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(d.error ?? "저장하지 못했습니다.");
            setOpen(false);
            router.refresh();
        } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
    }

    async function remove() {
        if (!confirm("내 후기를 지울까요?")) return;
        setBusy(true);
        await fetch(`/api/planners-library/${fileId}/reviews`, { method: "DELETE" });
        setBusy(false);
        router.refresh();
    }

    if (!open) {
        return (
            <div className="mt-4 flex gap-2">
                <button
                    onClick={() => (isAuthenticated ? setOpen(true) : setLoginOpen(true))}
                    className="border border-[#0F766E] px-4 py-2 text-sm font-bold text-[#0F766E] hover:bg-[#0F766E]/5"
                >
                    {mine ? "내 후기 고치기" : "후기 쓰기"}
                </button>
                {mine && <button onClick={remove} disabled={busy} className="px-3 py-2 text-sm text-neutral-400 hover:text-red-600">내 후기 지우기</button>}
                <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#0F766E" />
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="mt-4 border border-neutral-200 p-4">
            <div className="flex items-center gap-1" role="radiogroup" aria-label="별점">
                {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i}점`} aria-checked={rating === i} role="radio">
                        <Star className={`h-6 w-6 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`} />
                    </button>
                ))}
            </div>
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="써 보니 어땠나요? 어떻게 쓰고 있는지 나눠 주세요."
                className="mt-3 w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-400">후기는 이름을 가려(예: 박**) 누구나 볼 수 있게 보입니다.</p>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-neutral-500">취소</button>
                <button disabled={busy} className="bg-[#0F766E] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{mine ? "고치기" : "올리기"}</button>
            </div>
        </form>
    );
}
