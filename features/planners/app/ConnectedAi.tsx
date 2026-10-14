"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, Loader2, Unplug } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// 내 AI에 연결 — 플래너'스 AI 연결(MCP) 안내 + 연결한 AI 목록·끊기 (2026-10-14)
// 연결 서버 /api/planners-mcp · 승인 화면 /oauth/consent · 목록·끊기 = Supabase OAuth grants (본인 것만)

const MCP_URL = "https://www.planners.ai.kr/api/planners-mcp";

type Grant = { client: { id: string; name: string; uri: string; logo_uri: string }; scopes: string[]; granted_at: string };

export function ConnectedAi() {
    const [copied, setCopied] = useState(false);
    const [grants, setGrants] = useState<Grant[] | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(async () => {
        const { data, error } = await createClient().auth.oauth.listGrants();
        setGrants(error ? [] : ((data ?? []) as unknown as Grant[]));
    }, []);
    useEffect(() => { void load(); }, [load]);

    async function revoke(clientId: string) {
        if (!confirm("이 AI와의 연결을 끊을까요? 다시 쓰려면 AI 앱에서 다시 연결해야 해요.")) return;
        setBusy(clientId);
        await createClient().auth.oauth.revokeGrant({ clientId });
        setBusy(null);
        void load();
    }

    return (
        <section className="border border-neutral-200 bg-white p-5 md:p-6 myverse-dark:border-white/10 myverse-dark:bg-white/5">
            <h2 className="text-base font-bold">내 AI에 연결</h2>
            <p className="mt-2 break-keep text-sm leading-relaxed text-neutral-600">
                쓰고 있는 Claude·ChatGPT 같은 AI에 Planner&apos;s를 연결하면, 대화하면서 플래너를 보고 할 일을 넣을 수 있어요.
                AI 사용료는 각자 쓰는 AI 서비스에서 내고, 연결은 무료예요. AI가 할 수 있는 일은 <b>읽기와 할 일 추가</b>뿐이에요.
            </p>

            <div className="mt-4 flex items-center gap-2 border border-neutral-200 bg-neutral-50 px-3 py-2 myverse-dark:border-white/10 myverse-dark:bg-white/5">
                <code className="min-w-0 flex-1 truncate text-xs">{MCP_URL}</code>
                <button onClick={() => { void navigator.clipboard.writeText(MCP_URL); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex items-center gap-1 text-xs font-bold text-[var(--pp-accent)]">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "복사했어요" : "주소 복사"}
                </button>
            </div>

            <ol className="mt-4 space-y-1.5 text-sm text-neutral-600">
                <li><b>Claude</b>, 설정 › 커넥터 › 사용자 지정 커넥터 추가 → 위 주소 붙여 넣기 → Ten:One™ 계정으로 로그인 후 허용</li>
                <li><b>ChatGPT</b>, 설정 › 앱과 커넥터 › 커넥터 만들기(개발자 모드) → 위 주소 → 로그인 후 허용</li>
                <li>연결한 뒤 예) &ldquo;오늘 할 일 정리해 줘&rdquo; · &ldquo;지난주 완료율 어땠어?&rdquo; · &ldquo;금요일에 보고서 마감 할 일 넣어 줘&rdquo;</li>
            </ol>

            <div className="mt-5 border-t border-neutral-100 pt-4 myverse-dark:border-white/10">
                <p className="text-sm font-bold">연결한 AI</p>
                {grants === null ? (
                    <Loader2 className="mt-3 h-4 w-4 animate-spin text-neutral-300" />
                ) : grants.length === 0 ? (
                    <p className="mt-2 text-sm text-neutral-400">아직 연결한 AI가 없어요.</p>
                ) : (
                    <ul className="mt-2 divide-y divide-neutral-100 myverse-dark:divide-white/10">
                        {grants.map((g) => (
                            <li key={g.client.id} className="flex items-center gap-3 py-2.5">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{g.client.name || "AI 앱"}</p>
                                    <p className="text-xs text-neutral-400">{new Date(g.granted_at).toLocaleDateString("ko-KR")} 연결</p>
                                </div>
                                <button onClick={() => revoke(g.client.id)} disabled={busy === g.client.id} className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600 disabled:opacity-40">
                                    {busy === g.client.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unplug className="h-3.5 w-3.5" />} 연결 끊기
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
