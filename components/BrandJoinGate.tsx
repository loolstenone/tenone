"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { createClient } from "@/lib/supabase/client";
import { LEGAL_DOCUMENTS } from "@/lib/company-info";
import { OneIdHelp } from "@/components/OneIdHelp";

/**
 * 브랜드 첫 진입 동의 — 헌법 원칙 1 ("계정은 하나, 서비스는 독립") · 데이터 계약 4조
 *
 * One ID로 로그인한 회원이 이 브랜드를 처음 이용하면 1회 동의를 받는다 (SSO로 넘어온 경우 포함).
 * 판단·기록은 서버(/api/brand-join, lib/brand-join.ts). 계정 동의(ConsentGate)가 먼저, 그다음 이 게이트.
 * 동의하지 않으면 이 사이트에서만 로그아웃 — 다른 유니버스 사이트의 로그인은 그대로.
 */
const EXEMPT_PATHS = ["/terms", "/privacy", "/auth", "/intra", "/login", "/signup", "/reset-password", "/profile"];

export function BrandJoinGate() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { site, siteId } = useSite();
    const pathname = usePathname() ?? "";
    const [required, setRequired] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const exempt = EXEMPT_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
    const ready = !isLoading && isAuthenticated && !!user?.consent?.terms_version && !exempt;

    useEffect(() => {
        if (!ready) { setRequired(false); return; }
        let cancelled = false;
        fetch(`/api/brand-join?site=${encodeURIComponent(siteId)}`, { cache: "no-store" })
            .then(r => (r.ok ? r.json() : { required: false }))
            .then((d: { required?: boolean }) => { if (!cancelled) setRequired(!!d.required); })
            .catch(() => { /* 판단 실패 시 막지 않음 — 서버 API가 2차 검증 */ });
        return () => { cancelled = true; };
    }, [ready, siteId, user?.id]);

    if (!ready || !required) return null;

    const brandName = site.name;

    const handleAgree = async () => {
        if (!agreed) { setError("필수 항목에 동의해주세요."); return; }
        setSaving(true);
        setError("");
        const res = await fetch("/api/brand-join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ site: siteId, agreed: true }),
        }).catch(() => null);
        setSaving(false);
        if (res?.ok) setRequired(false);
        else setError("동의 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    };

    const handleDecline = async () => {
        // 이 도메인 세션만 종료 (scope local) — 다른 사이트 로그인은 유지
        await createClient().auth.signOut({ scope: "local" }).catch(() => {});
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-[99997] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
                <p className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-neutral-400">Ten:One™ Universe One ID <OneIdHelp size={12} /></p>
                <h2 className="mt-1 text-lg font-bold text-neutral-900">{brandName}을(를) 처음 이용하시네요</h2>
                <p className="mt-1 text-sm text-neutral-500">
                    가지고 계신 One ID로 {brandName}을(를) 바로 이용할 수 있어요. 시작하기 전에 아래 항목을 확인해주세요.
                </p>

                <ul className="mt-4 space-y-1.5 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
                    <li>· 이름·프로필 사진 등 공통 프로필이 {brandName}에서 사용됩니다.</li>
                    <li>· 다른 서비스에서의 활동 내역은 {brandName}에 공유되지 않습니다.</li>
                </ul>

                <label className="mt-4 flex items-start gap-2 text-sm text-neutral-800 cursor-pointer">
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5" />
                    <span>
                        [필수] {brandName} 서비스 이용에 동의합니다{" "}
                        <a href={LEGAL_DOCUMENTS.terms.path} target="_blank" rel="noreferrer" className="underline text-neutral-500">이용약관</a>
                        {" · "}
                        <a href={LEGAL_DOCUMENTS.privacy.path} target="_blank" rel="noreferrer" className="underline text-neutral-500">개인정보처리방침</a>
                    </span>
                </label>

                {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
                <button onClick={handleAgree} disabled={saving}
                    className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-neutral-900 disabled:opacity-50">
                    {saving ? "저장 중..." : `동의하고 ${brandName} 시작하기`}
                </button>
                <button onClick={handleDecline}
                    className="w-full mt-2 text-center text-xs text-neutral-400 hover:text-neutral-600">
                    동의하지 않고 로그인 없이 둘러보기
                </button>
            </div>
        </div>
    );
}
