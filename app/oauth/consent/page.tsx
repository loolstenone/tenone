"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";

// AI 연결 승인 화면 — Supabase OAuth 2.1 서버의 Authorization Path (대시보드 Authentication › OAuth Server 에 /oauth/consent)
// Claude·ChatGPT 등 사용자의 AI가 Planner's 플래너에 연결을 요청하면 여기로 온다 → 무엇을 주는지 보여 주고 허용/거부
// 허용 범위 = 읽기 + 할 일 추가 (연결 서버 app/api/planners-mcp/route.ts) · 연결 해제 = 플래너'스 AI › 설정 › 연동
// 개인정보: 승인한 AI 서비스로 사용자가 요청한 기록만 전달 — 그 이후 처리는 그 서비스의 정책 (개인정보처리방침에 명시 필요)

const SHARES = [
    "할 일·일정·오늘의 Top 3 읽기",
    "하루 결과와 저녁 회고 답 읽기",
    "주간 숫자(완료율 등)와 프로젝트 목록 읽기",
    "할 일 추가 (지우거나 고치지는 못해요)",
];

type Details = { authorization_id: string; client: { name: string; uri: string; logo_uri: string }; user: { email: string }; scope: string };

function Consent() {
    const params = useSearchParams();
    const authorizationId = params.get("authorization_id");
    const { isAuthenticated, isLoading } = useAuth();
    const [details, setDetails] = useState<Details | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!authorizationId || !isAuthenticated) return;
        createClient().auth.oauth.getAuthorizationDetails(authorizationId).then(({ data, error: e }: { data: unknown; error: unknown }) => {
            if (e || !data) { setError("연결 요청을 찾지 못했어요. AI 앱에서 다시 연결해 주세요."); return; }
            const d = data as { redirect_url?: string };
            if (d.redirect_url && !("authorization_id" in (data as object))) { window.location.href = d.redirect_url; return; } // 이미 승인한 앱
            setDetails(data as unknown as Details);
        });
    }, [authorizationId, isAuthenticated]);

    async function decide(approve: boolean) {
        if (!authorizationId) return;
        setBusy(true);
        const api = createClient().auth.oauth;
        const { data, error: e } = approve
            ? await api.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
            : await api.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
        if (e || !data?.redirect_url) { setBusy(false); setError("처리하지 못했어요. 다시 시도해 주세요."); return; }
        window.location.href = data.redirect_url;
    }

    if (!authorizationId) return <Shell><p className="text-sm text-neutral-500">잘못된 연결 요청이에요.</p></Shell>;
    if (isLoading) return <Shell><Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-300" /></Shell>;
    if (!isAuthenticated) return <div className="min-h-screen bg-white"><LoginRequired accentColor="#0F766E" message="AI를 연결하려면 Ten:One™ 계정으로 로그인해 주세요." /></div>;

    return (
        <Shell>
            {error ? <p className="text-sm text-red-600">{error}</p> : !details ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-300" /> : (
                <>
                    <div className="flex items-center gap-3">
                        {details.client.logo_uri
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={details.client.logo_uri} alt="" className="h-10 w-10 object-contain" />
                            : <ShieldCheck className="h-10 w-10 text-[#0F766E]" />}
                        <div className="min-w-0">
                            <p className="truncate text-lg font-bold">{details.client.name || "AI 앱"}</p>
                            {details.client.uri && <p className="truncate text-xs text-neutral-400">{details.client.uri}</p>}
                        </div>
                    </div>
                    <p className="mt-6 break-keep leading-relaxed text-neutral-700">
                        <b>{details.client.name || "이 AI 앱"}</b>이(가) <b>Planner&apos;s 플래너</b>에 연결하려고 해요. 허용하면 이 AI가 대화 중에 아래 일을 할 수 있어요.
                    </p>
                    <ul className="mt-4 space-y-2">
                        {SHARES.map((s) => <li key={s} className="flex items-start gap-2 text-sm text-neutral-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E]" />{s}</li>)}
                    </ul>
                    <p className="mt-5 break-keep bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-500">
                        AI가 요청한 기록은 그 AI 서비스로 전달되고, 그 뒤 처리는 해당 서비스의 정책을 따라요. 연결은 언제든 플래너&apos;s AI › 설정 › 연동에서 끊을 수 있어요.
                        계정: {details.user.email}
                    </p>
                    <div className="mt-6 flex gap-2">
                        <button onClick={() => decide(false)} disabled={busy} className="flex flex-1 items-center justify-center gap-1 border border-neutral-300 py-3 text-sm font-bold text-neutral-700 hover:border-neutral-900 disabled:opacity-40"><X className="h-4 w-4" /> 거부</button>
                        <button onClick={() => decide(true)} disabled={busy} className="flex flex-1 items-center justify-center gap-1 bg-[#0F766E] py-3 text-sm font-bold text-white hover:bg-[#134E4A] disabled:opacity-40">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} 허용
                        </button>
                    </div>
                </>
            )}
        </Shell>
    );
}

function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 py-16">
            <div className="w-full max-w-md border border-neutral-200 bg-white p-8">
                <p className="mb-6 text-sm font-bold text-[#0F766E]">Planner&apos;s · AI 연결</p>
                {children}
            </div>
        </div>
    );
}

export default function OAuthConsentPage() {
    return <Suspense fallback={<Shell><Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-300" /></Shell>}><Consent /></Suspense>;
}
