"use client";

/** 팀 초대 링크로 합류 — 가입·로그인(LoginModal) → 주인 브랜드 참가 동의 → 팀 합류 → 회차 방 */
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { ConsentItems } from "@/features/programs/ProgramConsent";
import { PROGRAM_KIND_LABEL } from "@/lib/programs/paths";

interface Preview {
    round: { title: string; kind: string; brand_id: string; brand_name: string };
    team: { name: string };
    open: boolean;
    state: "login" | "joined" | "other_team" | "ready";
    consent: boolean;
    room: string;
}

export function InviteJoin({ code, accentColor = "#EC1D25" }: { code: string; accentColor?: string }) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [p, setP] = useState<Preview | null>(null);
    const [error, setError] = useState("");
    const [loginOpen, setLoginOpen] = useState(false);
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        const res = await fetch(`/api/programs/invite?code=${encodeURIComponent(code)}`);
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError(d.error ?? "초대 정보를 불러오지 못했습니다."); return; }
        setP(d);
    }, [code]);
    useEffect(() => { if (!isLoading) load(); }, [isLoading, isAuthenticated, load]);
    useEffect(() => { if (isAuthenticated) setLoginOpen(false); }, [isAuthenticated]);

    const join = async () => {
        setBusy(true); setError("");
        const res = await fetch("/api/programs/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, consent: agree }) });
        const d = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) { setError(d.error ?? "합류하지 못했습니다."); return; }
        router.push(d.room);
    };

    if (error && !p) return <Box><h1 className="text-2xl font-black">초대 링크를 열 수 없습니다</h1><p className="mt-3 text-sm text-neutral-500">{error}</p></Box>;
    if (!p) return <Box><p className="text-sm text-neutral-500">불러오는 중…</p></Box>;

    return (
        <Box>
            <div className="text-xs font-bold tracking-widest" style={{ color: accentColor }}>팀 초대 · {PROGRAM_KIND_LABEL[p.round.kind] ?? p.round.kind}</div>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">{p.team.name}</h1>
            <p className="mt-1 text-sm text-neutral-400">{p.round.title}</p>
            <p className="mt-1 text-xs text-neutral-600">운영: {p.round.brand_name}</p>

            <div className="mt-8 space-y-4">
                {!p.open ? (
                    <p className="text-sm text-neutral-400">팀 모집이 끝난 회차입니다.</p>
                ) : p.state === "login" ? (
                    <>
                        <p className="text-sm text-neutral-400">Ten:One ID로 가입하거나 로그인하면 이 팀에 합류할 수 있습니다. 활동이 끝난 뒤에도 같은 계정으로 참여 이력과 인증서를 확인할 수 있습니다.</p>
                        <button onClick={() => setLoginOpen(true)} className="w-full py-3 text-sm font-bold text-white" style={{ background: accentColor }}>가입 / 로그인</button>
                    </>
                ) : p.state === "joined" ? (
                    <button onClick={() => router.push(p.room)} className="w-full py-3 text-sm font-bold text-white" style={{ background: accentColor }}>이미 이 팀 팀원입니다 — 회차 방으로</button>
                ) : p.state === "other_team" ? (
                    <p className="text-sm text-neutral-400">이 회차에 이미 다른 팀으로 참가 중입니다. 팀을 옮기려면 운영진에게 요청하세요.</p>
                ) : (
                    <>
                        {!p.consent && (
                            <>
                                <ConsentItems />
                                <label className="flex cursor-pointer items-start gap-2 text-sm">
                                    <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4" style={{ accentColor }} />
                                    <span>[필수] {p.round.brand_name} 프로그램 참가를 위한 개인정보 수집·이용에 동의합니다.</span>
                                </label>
                            </>
                        )}
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        <button onClick={join} disabled={busy || (!p.consent && !agree)} className="w-full py-3 text-sm font-bold text-white disabled:opacity-40" style={{ background: accentColor }}>
                            {busy ? "합류 중…" : `${p.team.name} 팀에 합류`}
                        </button>
                    </>
                )}
            </div>
            <LoginModal isOpen={loginOpen && !isAuthenticated} onClose={() => setLoginOpen(false)} accentColor={accentColor} />
        </Box>
    );
}

function Box({ children }: { children: React.ReactNode }) {
    return <div className="mx-auto max-w-md border border-neutral-800 bg-neutral-950 p-6 sm:p-8">{children}</div>;
}
