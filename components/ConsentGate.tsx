"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { publishLoginToHub } from "@/lib/sso";
import {
    SignupConsent, EMPTY_CONSENT, CONSENT_REQUIRED_MESSAGE, isConsentValid, buildMemberConsent,
    type SignupConsentValue,
} from "@/components/SignupConsent";

/**
 * ① 소셜 첫 로그인(회원 정보 없음) → "Ten:One 회원가입" — 동의하면 회원 정보 생성, 가입하지 않으면 방금 생긴 계정 삭제 (2026-10-15)
 * ② 동의 기록이 없는 기존 회원 → 1회 동의를 받는다.
 * members.consent.terms_version이 있으면 렌더하지 않음. 약관·방침 페이지는 읽을 수 있도록 제외.
 */
const EXEMPT_PATHS = ["/terms", "/privacy", "/auth"];

export function ConsentGate() {
    const { user, isAuthenticated, isLoading, recordConsent, logout, pendingSignup, completeSignup, cancelSignup } = useAuth();
    const router = useRouter();
    const pathname = usePathname() ?? "";
    const [value, setValue] = useState<SignupConsentValue>(EMPTY_CONSENT);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    if (pendingSignup && !EXEMPT_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
        const join = async () => {
            if (!isConsentValid(value)) { setError(CONSENT_REQUIRED_MESSAGE); return; }
            setSaving(true);
            setError("");
            const result = await completeSignup(buildMemberConsent(value, "social"));
            setSaving(false);
            if (!result.success) { setError(result.error || "가입 처리에 실패했습니다."); return; }
            // 독립 도메인이면 허브에도 등록(다른 유니버스 사이트에서 다시 로그인 불필요) — 그 외엔 서버 판단 화면을 다시 그린다
            if (!publishLoginToHub()) router.refresh();
        };
        const leave = async () => {
            setSaving(true);
            await cancelSignup();
            setSaving(false);
            router.refresh();
        };
        return (
            <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
                    <h2 className="text-lg font-bold text-neutral-900">Ten:One 회원가입</h2>
                    <p className="text-sm text-neutral-500 mt-1 break-keep">
                        <span className="font-medium text-neutral-800">{pendingSignup.email || "이 소셜"}</span> 계정은 아직 가입하지 않았습니다.
                        가입하면 이 계정 하나로 Ten:One™ Universe의 서비스를 이용할 수 있습니다.
                    </p>
                    <div className="mt-4">
                        <SignupConsent value={value} onChange={setValue} />
                    </div>
                    {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
                    <button onClick={join} disabled={saving}
                        className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-neutral-900 disabled:opacity-50">
                        {saving ? "처리 중..." : "동의하고 가입하기"}
                    </button>
                    <button onClick={leave} disabled={saving}
                        className="w-full mt-2 text-center text-xs text-neutral-400 hover:text-neutral-600 disabled:opacity-50">
                        가입하지 않기 (받은 이메일·이름은 바로 삭제합니다)
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading || !isAuthenticated || !user) return null;
    if (user.consent?.terms_version) return null;
    if (EXEMPT_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))) return null;

    const handleSubmit = async () => {
        if (!isConsentValid(value)) { setError(CONSENT_REQUIRED_MESSAGE); return; }
        setSaving(true);
        setError("");
        const channel = user.createdAt && Date.now() - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000 ? "social" : "existing";
        const result = await recordConsent(buildMemberConsent(value, channel));
        if (!result.success) setError(result.error || "동의 저장에 실패했습니다.");
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-neutral-900">서비스 이용 동의</h2>
                <p className="text-sm text-neutral-500 mt-1 mb-4">계속 이용하려면 아래 항목에 동의해주세요.</p>
                <SignupConsent value={value} onChange={setValue} />
                {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
                <button onClick={handleSubmit} disabled={saving}
                    className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-neutral-900 disabled:opacity-50">
                    {saving ? "저장 중..." : "동의하고 계속하기"}
                </button>
                <button onClick={() => logout()}
                    className="w-full mt-2 text-center text-xs text-neutral-400 hover:text-neutral-600">
                    동의하지 않고 로그아웃
                </button>
            </div>
        </div>
    );
}
