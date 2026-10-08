"use client";

import { useEffect, useState } from "react";
import { Link2, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { brandName, getServiceLink, SERVICE_LINK_REFUSAL, SERVICE_LINK_RETENTION } from "@/lib/service-links";

/**
 * 서비스 간 연계 동의 카드 (유니버스 공통) — 개인정보보호법 제18조 고지(목적·항목·보유기간·거부권)를 보여주고 동의·철회한다.
 * 레지스트리 lib/service-links.ts · API /api/universe/service-links
 * 비로그인은 LoginModal (§1.2.1) · 준비 중(live=false) 연계는 버튼 없이 표시만
 */
export function ServiceLinkConsent({ scope, accentColor = "#EC1D25", dark = true }: { scope: string; accentColor?: string; dark?: boolean }) {
    const def = getServiceLink(scope);
    const { isAuthenticated, isLoading } = useAuth();
    const [linked, setLinked] = useState<boolean | null>(null);
    const [open, setOpen] = useState(false);
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [login, setLogin] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !def?.live) return;
        fetch("/api/universe/service-links").then(r => r.ok ? r.json() : { links: [] })
            .then(d => setLinked((d.links ?? []).some((l: { scope: string }) => l.scope === scope)))
            .catch(() => setLinked(false));
    }, [isAuthenticated, scope, def?.live]);

    if (!def) return null;

    const text = dark ? "text-neutral-200" : "text-neutral-800";
    const sub = dark ? "text-neutral-500" : "text-neutral-500";
    const box = dark ? "border-neutral-800 bg-black" : "border-neutral-200 bg-white";

    async function submit(method: "POST" | "DELETE") {
        setBusy(true); setError(null);
        const res = await fetch("/api/universe/service-links", {
            method, headers: { "Content-Type": "application/json" },
            body: JSON.stringify(method === "POST" ? { scope, agree: true } : { scope }),
        });
        const d = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) { setError(d.error ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요."); return; }
        setLinked(method === "POST"); setOpen(false); setAgree(false);
    }

    return (
        <div className={`border p-6 ${box}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Link2 className="h-5 w-5 mt-0.5 shrink-0" style={{ color: accentColor }} />
                    <div>
                        <div className={`font-bold ${text}`}>{def.label}</div>
                        <p className={`mt-1 text-sm ${sub}`}>{def.purpose}</p>
                    </div>
                </div>
                <div className="shrink-0">
                    {!def.live ? (
                        <span className={`text-xs font-bold ${sub}`}>준비 중</span>
                    ) : isLoading ? null : !isAuthenticated ? (
                        <button onClick={() => setLogin(true)} className="text-sm font-bold underline" style={{ color: accentColor }}>로그인 후 연결</button>
                    ) : linked ? (
                        <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: accentColor }}><Check className="h-4 w-4" /> 연결됨</span>
                    ) : (
                        <button onClick={() => setOpen(o => !o)} className="text-sm font-bold underline" style={{ color: accentColor }}>{open ? "닫기" : "연결하기"}</button>
                    )}
                </div>
            </div>

            {/* 동의 고지 — 연결하기를 눌렀을 때만 */}
            {open && !linked && (
                <div className={`mt-6 border-t pt-6 text-sm leading-relaxed ${dark ? "border-neutral-800" : "border-neutral-200"}`}>
                    <dl className={`space-y-3 ${text}`}>
                        <div><dt className={`font-bold ${sub}`}>받는 서비스</dt><dd>{brandName(def.source)}의 기록을 {brandName(def.target)}에서 봅니다 (운영사 Ten:One™)</dd></div>
                        <div><dt className={`font-bold ${sub}`}>목적</dt><dd>{def.purpose}</dd></div>
                        <div><dt className={`font-bold ${sub}`}>항목</dt><dd>{def.items.join(" · ")}</dd></div>
                        <div><dt className={`font-bold ${sub}`}>기간</dt><dd>{SERVICE_LINK_RETENTION}</dd></div>
                        <div><dt className={`font-bold ${sub}`}>거부할 권리</dt><dd>{SERVICE_LINK_REFUSAL}</dd></div>
                    </dl>
                    <label className={`mt-6 flex items-start gap-3 ${text}`}>
                        <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1" />
                        <span>[선택] 위 내용을 확인했고, {brandName(def.source)} 기록을 {brandName(def.target)}에서 이용하는 데 동의합니다.</span>
                    </label>
                    {error && <p className="mt-3 text-red-500">{error}</p>}
                    <button disabled={!agree || busy} onClick={() => submit("POST")}
                        className="mt-4 px-6 py-3 font-bold text-white disabled:opacity-40 transition" style={{ backgroundColor: accentColor }}>
                        {busy ? "처리 중…" : "동의하고 연결"}
                    </button>
                </div>
            )}

            {linked && (
                <div className={`mt-4 text-xs ${sub}`}>
                    언제든 끊을 수 있습니다. <button disabled={busy} onClick={() => submit("DELETE")} className="underline">연결 끊기</button>
                    {error && <span className="ml-2 text-red-500">{error}</span>}
                </div>
            )}

            <LoginModal isOpen={login} onClose={() => setLogin(false)} accentColor={accentColor} />
        </div>
    );
}
