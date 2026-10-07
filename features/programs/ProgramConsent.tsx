"use client";

/** 프로그램 참가 동의 — 주인 브랜드 기준 (member_brand_joins). 회차 방·팀 관리 첫 진입 시 1회 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROGRAM_CONSENT_ITEMS } from "@/lib/programs/consent-text";

export function ConsentItems() {
    return (
        <dl className="space-y-2 border border-neutral-800 p-4 text-xs leading-relaxed">
            {PROGRAM_CONSENT_ITEMS.map(i => (
                <div key={i.label} className="flex gap-3">
                    <dt className="w-10 shrink-0 font-bold text-neutral-400">{i.label}</dt>
                    <dd className="text-neutral-300">{i.value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function ProgramConsent({ brand, brandName, onAgreed }: { brand: string; brandName: string; onAgreed?: () => void }) {
    const router = useRouter();
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        setBusy(true); setError("");
        const res = await fetch("/api/programs/consent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand, agree: true }) });
        const d = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) { setError(d.error ?? "저장하지 못했습니다."); return; }
        if (onAgreed) onAgreed(); else router.refresh();
    };

    return (
        <div className="mx-auto max-w-xl space-y-4 border border-neutral-800 bg-neutral-950 p-6 text-white">
            <div>
                <div className="text-xs font-bold tracking-widest text-[#EC1D25]">참가 동의</div>
                <h2 className="mt-1 text-xl font-black">{brandName} 프로그램 참가</h2>
                <p className="mt-1 text-sm text-neutral-500">처음 한 번만 받습니다. 운영: {brandName}</p>
            </div>
            <ConsentItems />
            <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#EC1D25]" />
                <span>[필수] 위 내용으로 개인정보 수집·이용에 동의합니다.</span>
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button onClick={submit} disabled={!agree || busy} className="w-full bg-[#EC1D25] py-3 text-sm font-bold text-white disabled:opacity-40">
                {busy ? "저장 중…" : "동의하고 계속"}
            </button>
        </div>
    );
}
