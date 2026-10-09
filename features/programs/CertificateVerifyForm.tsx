"use client";

/** 인증서 진위 확인 — 코드 입력 (창구 공용) */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck } from "lucide-react";

export function CertificateVerifyForm({ verifyBase, accentColor, brandName }: { verifyBase: string; accentColor: string; brandName: string }) {
    const router = useRouter();
    const [code, setCode] = useState("");
    return (
        <div className="min-h-[70vh] bg-black text-white">
            <section className="mx-auto max-w-3xl px-6 py-24">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest" style={{ color: accentColor }}>
                    <ShieldCheck className="h-4 w-4" /> CERTIFICATE VERIFY
                </div>
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">인증서 진위 확인</h1>
                <p className="mt-6 leading-relaxed text-neutral-400">{brandName}가 발급한 인증서의 진위를 확인합니다. 인증서 하단의 고유 코드를 입력해 주세요.</p>
                <form onSubmit={e => { e.preventDefault(); if (code.trim()) router.push(`${verifyBase}/${encodeURIComponent(code.trim().toUpperCase())}`); }} className="mt-10 flex gap-3">
                    <input value={code} onChange={e => setCode(e.target.value)} placeholder="예: ROOK26-AB3CD6" maxLength={20}
                        className="flex-1 border border-neutral-800 bg-black px-4 py-4 font-mono text-lg tracking-widest text-white focus:outline-none" />
                    <button type="submit" className="inline-flex items-center gap-2 px-6 py-4 font-bold text-white" style={{ background: accentColor }}>
                        <Search className="h-4 w-4" /> 확인
                    </button>
                </form>
            </section>
        </div>
    );
}
