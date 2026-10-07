"use client";

/**
 * 회차 참가 신청 — 로그인(LoginModal) → (처음이면) 주인 브랜드 참가 동의 → 지원 동기·포트폴리오 → 신청
 * 상태: 신청 가능 / 심사 대기(취소 가능) / 선발(회차 방) / 미선발 / 참가 중(회차 방)
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { ConsentItems } from "@/features/programs/ProgramConsent";

interface Status { round: { title: string; brand_id: string; brand_name: string }; open: boolean; state: string; consent: boolean }

export function ApplyButton({ roundId, channel, roomHref, accentColor, dark = true }: {
    roundId: string; channel: string; roomHref: string; accentColor: string; dark?: boolean;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const [st, setSt] = useState<Status | null>(null);
    const [form, setForm] = useState(false);
    const [login, setLogin] = useState(false);
    const [motivation, setMotivation] = useState("");
    const [url, setUrl] = useState("");
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        const res = await fetch(`/api/programs/rounds/${roundId}/apply`);
        if (res.ok) setSt(await res.json());
    }, [roundId]);
    useEffect(() => { if (!isLoading) load(); }, [isLoading, isAuthenticated, load]);
    useEffect(() => { if (isAuthenticated && login) { setLogin(false); setForm(true); } }, [isAuthenticated, login]);

    const submit = async () => {
        setBusy(true); setError("");
        const res = await fetch(`/api/programs/rounds/${roundId}/apply`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ motivation, portfolio_url: url, consent: agree, channel }),
        });
        const d = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) { setError(d.error ?? "신청하지 못했습니다."); return; }
        setForm(false); await load();
    };
    const withdraw = async () => {
        if (!confirm("신청을 취소할까요?")) return;
        await fetch(`/api/programs/rounds/${roundId}/apply`, { method: "DELETE" });
        await load();
    };

    const btn = "inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40";
    const muted = dark ? "text-neutral-400" : "text-neutral-500";
    const field = dark ? "w-full border border-neutral-700 bg-black px-3 py-2 text-sm text-white" : "w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-black";
    if (!st) return null;

    if (st.state === "participant" || st.state === "accepted") {
        return <Link href={roomHref} className={btn} style={{ background: accentColor }}>{st.state === "accepted" ? "선발되었습니다 — 회차 방" : "회차 방"}</Link>;
    }
    if (st.state === "pending") {
        return (
            <div className={`flex flex-wrap items-center gap-3 text-sm ${muted}`}>
                <span className="font-bold" style={{ color: accentColor }}>심사 대기 중</span>
                <button onClick={withdraw} className="underline">신청 취소</button>
            </div>
        );
    }
    if (st.state === "declined") return <span className={`text-sm ${muted}`}>이번 회차는 함께하지 못하게 되었습니다.</span>;
    if (!st.open) return null;

    return (
        <div className="w-full">
            {!form ? (
                <button onClick={() => (isAuthenticated ? setForm(true) : setLogin(true))} className={btn} style={{ background: accentColor }}>참가 신청</button>
            ) : (
                <div className={`mt-2 space-y-3 border p-4 ${dark ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-neutral-50"}`}>
                    <p className={`text-xs ${muted}`}>운영: {st.round.brand_name} · 이름·연락처는 Ten:One ID 계정 정보를 씁니다.</p>
                    <label className={`block text-xs ${muted}`}>지원 동기 (10자 이상)
                        <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={4} maxLength={1000} className={`mt-1 ${field}`} />
                    </label>
                    <label className={`block text-xs ${muted}`}>포트폴리오 링크 (선택, https://)
                        <input value={url} onChange={e => setUrl(e.target.value)} className={`mt-1 ${field}`} />
                    </label>
                    {!st.consent && (
                        <>
                            <ConsentItems />
                            <label className="flex cursor-pointer items-start gap-2 text-xs">
                                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4" style={{ accentColor }} />
                                <span>[필수] {st.round.brand_name} 프로그램 참가를 위한 개인정보 수집·이용에 동의합니다.</span>
                            </label>
                        </>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex gap-2">
                        <button onClick={submit} disabled={busy || motivation.trim().length < 10 || (!st.consent && !agree)} className={`${btn} flex-1`} style={{ background: accentColor }}>
                            {busy ? "신청 중…" : "신청하기"}
                        </button>
                        <button onClick={() => setForm(false)} className={`border px-4 text-sm ${dark ? "border-neutral-700" : "border-neutral-300"}`}>취소</button>
                    </div>
                </div>
            )}
            <LoginModal isOpen={login && !isAuthenticated} onClose={() => setLogin(false)} accentColor={accentColor} />
        </div>
    );
}
