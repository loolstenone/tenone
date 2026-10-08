"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { brandName, getServiceLink } from "@/lib/service-links";

type LinkRow = { scope: string; consent_version: string; granted_at: string };

/**
 * 유니버스 프로필 — 서비스 연계 목록 + 철회 (본인만, 2026-10-09)
 * 동의는 각 서비스 화면(ServiceLinkConsent)에서, 철회는 여기서도 한 번에 볼 수 있게 한다 (개인정보보호법 제37조 — 동의 철회를 동의만큼 쉽게)
 */
export function ServiceLinksPanel() {
    const [links, setLinks] = useState<LinkRow[] | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/universe/service-links").then(r => r.ok ? r.json() : { links: [] })
            .then(d => setLinks(d.links ?? [])).catch(() => setLinks([]));
    }, []);

    async function revoke(scope: string) {
        setBusy(scope);
        const res = await fetch("/api/universe/service-links", {
            method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope }),
        });
        setBusy(null);
        if (res.ok) setLinks(ls => (ls ?? []).filter(l => l.scope !== scope));
    }

    if (!links || links.length === 0) return null;

    return (
        <div className="px-8 py-5 border-t tn-border">
            <h2 className="text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5 tn-text-sub" /> 서비스 연계
            </h2>
            <p className="text-[11px] tn-text-sub mb-4">동의한 서비스 사이에서만 기록이 이어집니다. 끊으면 받는 서비스에서 바로 보이지 않습니다.</p>
            <div className="space-y-2">
                {links.map(l => {
                    const def = getServiceLink(l.scope);
                    return (
                        <div key={l.scope} className="flex items-center justify-between gap-3 rounded-xl border tn-border px-4 py-3">
                            <div className="min-w-0">
                                <div className="text-sm font-semibold tn-text truncate">{def?.label ?? l.scope}</div>
                                <div className="text-[11px] tn-text-sub mt-0.5">
                                    {def ? `${brandName(def.source)} → ${brandName(def.target)} · ` : ""}{new Date(l.granted_at).toLocaleDateString("ko-KR")} 동의
                                </div>
                            </div>
                            <button disabled={busy === l.scope} onClick={() => revoke(l.scope)}
                                className="shrink-0 text-xs font-medium tn-text-sub underline hover:opacity-70 disabled:opacity-40">
                                {busy === l.scope ? "처리 중…" : "연결 끊기"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
