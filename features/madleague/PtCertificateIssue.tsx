"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from "@/components/CaptchaWidget";
import { renderPtCertificate, canvasToBlob, canvasToPdf, type PtCertificate } from "@/features/madleague/certificate-render";

const ACCENT = "#EC1D25";

function save(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 경쟁 PT 인증서 발급 — 이름·생년월일·대학으로 본인 확인 후 PNG·PDF (계정 없이, 2026-10-09) */
export function PtCertificateIssue() {
    const captcha = useCaptcha();
    const [form, setForm] = useState({ name: "", birthdate: "", university: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [certs, setCerts] = useState<(PtCertificate & { preview?: string })[] | null>(null);
    const [working, setWorking] = useState<string | null>(null);

    async function find(e: React.FormEvent) {
        e.preventDefault();
        if (!captcha.ready) { setError(CAPTCHA_PENDING_MESSAGE); return; }
        setBusy(true); setError(null);
        const res = await fetch("/api/madleague/certificates/find", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, captchaToken: captcha.token }),
        }).catch(() => null);
        captcha.reset(); // 토큰은 1회용
        const d = res ? await res.json().catch(() => ({})) : {};
        setBusy(false);
        if (!res?.ok) { setError(d.error ?? "조회하지 못했습니다. 잠시 후 다시 시도해 주세요."); return; }
        const list = d.certificates as PtCertificate[];
        setCerts(list);
        // 미리보기
        const previews = await Promise.all(list.map(c => renderPtCertificate(c).then(cv => cv.toDataURL("image/jpeg", 0.7)).catch(() => undefined)));
        setCerts(list.map((c, i) => ({ ...c, preview: previews[i] })));
    }

    async function download(c: PtCertificate, kind: "png" | "pdf") {
        setWorking(`${c.code}:${kind}`);
        try {
            const canvas = await renderPtCertificate(c);
            const base = `MADLeague_${c.type === "award" ? "수상확인서" : "참가확인서"}_${c.code.replace(/\s+/g, "")}`;
            save(kind === "png" ? await canvasToBlob(canvas, "image/png") : await canvasToPdf(canvas), `${base}.${kind}`);
        } catch {
            setError("파일을 만들지 못했습니다. 다른 브라우저에서 다시 시도해 주세요.");
        } finally {
            setWorking(null);
        }
    }

    const input = "w-full bg-black border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500";

    if (certs) {
        return (
            <div>
                <div className="flex items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="text-xs font-bold tracking-widest text-neutral-500">내 인증서</div>
                        <p className="mt-2 text-neutral-300">{certs[0]?.name}님의 인증서 {certs.length}건</p>
                    </div>
                    <button onClick={() => { setCerts(null); setForm({ name: "", birthdate: "", university: "" }); }} className="text-sm text-neutral-500 underline">다른 사람 조회</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certs.map(c => (
                        <div key={c.code} className="border border-neutral-800 bg-neutral-950">
                            <div className="aspect-[720/1040] bg-neutral-900 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {c.preview ? <img src={c.preview} alt={`${c.title} ${c.type === "award" ? c.result : "참가"} 인증서`} className="w-full h-full object-contain" /> : <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />}
                            </div>
                            <div className="p-4">
                                <div className="font-bold">{c.title} · {c.type === "award" ? c.result : "참가"}</div>
                                <div className="mt-1 text-xs text-neutral-500 font-mono">{c.code}</div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    {(["png", "pdf"] as const).map(k => (
                                        <button key={k} disabled={!!working} onClick={() => download(c, k)}
                                            className="inline-flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                                            style={{ backgroundColor: k === "png" ? ACCENT : "#262626" }}>
                                            {working === `${c.code}:${k}` ? <Loader2 className="h-4 w-4 animate-spin" /> : k === "png" ? <Download className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                            {k.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {error && <p className="mt-6 text-sm text-red-500">{error}</p>}
            </div>
        );
    }

    return (
        <form onSubmit={find} className="max-w-md space-y-4">
            <label className="block">
                <span className="text-sm font-bold text-neutral-300">이름</span>
                <input className={`${input} mt-2`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="홍길동" autoComplete="name" required />
            </label>
            <label className="block">
                <span className="text-sm font-bold text-neutral-300">생년월일</span>
                <input type="date" className={`${input} mt-2 [color-scheme:dark]`} value={form.birthdate} onChange={e => setForm({ ...form, birthdate: e.target.value })} required />
            </label>
            <label className="block">
                <span className="text-sm font-bold text-neutral-300">대학</span>
                <input className={`${input} mt-2`} value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} placeholder="예: 조선대학교" required />
            </label>
            <CaptchaWidget {...captcha.widgetProps} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button disabled={busy} className="w-full py-4 font-bold text-white disabled:opacity-40" style={{ backgroundColor: ACCENT }}>
                {busy ? "확인 중…" : "내 인증서 찾기"}
            </button>
            <p className="text-xs text-neutral-500 leading-relaxed">
                참가 신청 때 제출한 이름·생년월일·대학과 같아야 합니다. 입력한 정보는 조회에만 쓰고 저장하지 않습니다.
                정보가 맞는데도 찾을 수 없으면 문의하기로 알려 주세요.
            </p>
        </form>
    );
}
