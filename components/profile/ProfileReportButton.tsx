"use client";

/**
 * 공개 프로필 신고 — 로그인 회원만. 직원이 인트라 › 회원 › 프로필 신고에서 처리 (Action Hub)
 * 규칙(본인 이름으로만·공개 프로필만·대기 중 중복 1건)은 DB 정책이 강제 — sql/profile-p1-core.sql
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flag } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { loginHref } from "@/lib/login-href";

const REASONS = [
    { value: "impersonation", label: "다른 사람·단체를 사칭" },
    { value: "privacy", label: "내 개인정보가 노출됨" },
    { value: "abuse", label: "욕설·혐오·괴롭힘" },
    { value: "spam", label: "광고·스팸" },
    { value: "other", label: "기타" },
] as const;

export function ProfileReportButton({ targetMemberId }: { targetMemberId: string }) {
    const { user, isAuthenticated } = useAuth();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>("impersonation");
    const [detail, setDetail] = useState("");
    const [state, setState] = useState<"idle" | "sending" | "done" | "error" | "dup">("idle");

    if (user?.id === targetMemberId) return null;

    async function submit() {
        if (!user) return;
        setState("sending");
        const { error } = await createClient().from("profile_reports").insert({
            target_member_id: targetMemberId,
            reporter_member_id: user.id,
            reason,
            detail: detail.trim() || null,
        });
        if (!error) setState("done");
        else setState(error.code === "23505" ? "dup" : "error");
    }

    return (
        <div className="text-right">
            <button onClick={() => setOpen(o => !o)} className="inline-flex items-center gap-1 text-[11px] tn-text-sub hover:text-red-600 transition-colors">
                <Flag className="h-3 w-3" /> 신고
            </button>
            {open && (
                <div className="mt-2 text-left rounded-xl border tn-border tn-surface p-4 space-y-3">
                    {!isAuthenticated ? (
                        <p className="text-xs tn-text-sub">
                            신고는 로그인 후 할 수 있습니다. <Link href={loginHref(pathname)} className="underline">로그인</Link>
                        </p>
                    ) : state === "done" ? (
                        <p className="text-xs tn-text">신고를 받았습니다. 운영진이 확인합니다.</p>
                    ) : state === "dup" ? (
                        <p className="text-xs tn-text">이미 신고한 프로필입니다. 운영진이 확인 중입니다.</p>
                    ) : (
                        <>
                            <fieldset className="space-y-1.5">
                                <legend className="text-xs font-medium tn-text mb-1">신고 사유</legend>
                                {REASONS.map(r => (
                                    <label key={r.value} className="flex items-center gap-2 text-xs tn-text">
                                        <input type="radio" name="report-reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} />
                                        {r.label}
                                    </label>
                                ))}
                            </fieldset>
                            <textarea value={detail} onChange={e => setDetail(e.target.value.slice(0, 1000))} rows={3}
                                placeholder="자세한 내용 (선택)" className="w-full text-xs tn-text bg-transparent border tn-border rounded-lg px-3 py-2" />
                            {state === "error" && <p className="text-xs text-red-600">신고를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setOpen(false)} className="text-[11px] tn-text-sub px-3 py-1.5">취소</button>
                                <button onClick={submit} disabled={state === "sending"}
                                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-red-600 text-white disabled:opacity-50">신고하기</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
