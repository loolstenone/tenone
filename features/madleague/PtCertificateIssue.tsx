"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from "@/components/CaptchaWidget";
import { renderPtCertificate, canvasToBlob, canvasToPdf, type PtCertificate } from "@/features/madleague/certificate-render";
import { PT_CERT_CONSENT } from "@/features/madleague/pt-certificate-consent";

const ACCENT = "#EC1D25";
type Cert = PtCertificate & { preview?: string };

function save(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function withPreviews(list: PtCertificate[]): Promise<Cert[]> {
    const previews = await Promise.all(list.map(c => renderPtCertificate(c).then(cv => cv.toDataURL("image/jpeg", 0.7)).catch(() => undefined)));
    return list.map((c, i) => ({ ...c, preview: previews[i] }));
}

/**
 * 경쟁 PT 인증서 받기 — 로그인 유도 (2026-10-09 사용자 결정: "인증서 발급은 로그인하게 하는 미끼")
 * 비로그인: 로그인·가입 유도 · 로그인: 본인 확인(이름·생년월일·대학) → 내 계정에 연결 → 다음부터는 로그인만 하면 바로 PNG·PDF
 */
export function PtCertificateIssue() {
    const { isAuthenticated, isLoading } = useAuth();
    const [login, setLogin] = useState<null | "login" | "signup">(null);
    const [certs, setCerts] = useState<Cert[] | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [working, setWorking] = useState<string | null>(null);

    const load = useCallback(async () => {
        const res = await fetch("/api/madleague/certificates/find").catch(() => null);
        const d = res?.ok ? await res.json() : { certificates: [] };
        const list = d.certificates as PtCertificate[];
        setRegistered(!!d.registered);
        setShowForm(list.length === 0);
        setCerts(await withPreviews(list));
    }, []);

    useEffect(() => {
        if (isAuthenticated) { setLogin(null); load(); }
    }, [isAuthenticated, load]);

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

    if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />;

    // ── 비로그인: 로그인·가입 유도 ──
    if (!isAuthenticated) {
        return (
            <div className="max-w-xl border border-neutral-800 bg-neutral-950 p-8">
                <Lock className="h-6 w-6" style={{ color: ACCENT }} />
                <h2 className="mt-4 text-2xl font-black">Ten:One ID로 로그인하고 받으세요</h2>
                <ul className="mt-6 space-y-2 text-sm text-neutral-400 leading-relaxed">
                    <li>· 한 번 본인 확인하면 인증서가 내 계정에 보관됩니다 — 다음부터는 로그인만 하면 바로</li>
                    <li>· PNG·PDF로 언제든 다시 받을 수 있고, 인증서 코드로 누구나 진위를 확인할 수 있습니다</li>
                    <li>· 같은 계정으로 MADLeague의 다른 프로그램에도 참여할 수 있습니다</li>
                </ul>
                <div className="mt-8 grid grid-cols-2 gap-3">
                    <button onClick={() => setLogin("signup")} className="py-4 font-bold text-white" style={{ backgroundColor: ACCENT }}>가입하고 받기</button>
                    <button onClick={() => setLogin("login")} className="py-4 font-bold text-white border border-neutral-700 hover:border-white">로그인</button>
                </div>
                <LoginModal isOpen={!!login} onClose={() => setLogin(null)} accentColor={ACCENT} defaultTab={login ?? "login"} />
            </div>
        );
    }

    if (!certs) return <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />;

    return (
        <div>
            {certs.length > 0 && (
                <>
                    <div className="flex items-end justify-between gap-4 mb-8">
                        <div>
                            <div className="text-xs font-bold tracking-widest text-neutral-500">내 인증서</div>
                            <p className="mt-2 text-neutral-300">{certs.length}건 — 내 계정에 보관되어 있습니다</p>
                        </div>
                        {!showForm && <button onClick={() => setShowForm(true)} className="text-sm text-neutral-400 underline">인증서 더 찾기</button>}
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
                </>
            )}
            {showForm && <ClaimForm registered={registered} onDone={list => { setShowForm(false); setError(null); withPreviews(list).then(setCerts); }} />}
        </div>
    );
}

function ConsentBox() {
    return (
        <div className="border border-neutral-800 p-4 text-xs text-neutral-400 leading-relaxed space-y-1">
            <p><b className="text-neutral-300">목적</b> {PT_CERT_CONSENT.purpose}</p>
            <p><b className="text-neutral-300">항목</b> {PT_CERT_CONSENT.items}</p>
            <p><b className="text-neutral-300">기간</b> {PT_CERT_CONSENT.retention}</p>
            <p><b className="text-neutral-300">거부</b> {PT_CERT_CONSENT.refusal}</p>
        </div>
    );
}

/** 찾기 — ① 매드리거 등록 정보로(우선권, 입력 없음) ② 직접 확인 */
function ClaimForm({ registered, onDone }: { registered: boolean; onDone: (list: PtCertificate[]) => void }) {
    const [manual, setManual] = useState(!registered);
    const [agreeReg, setAgreeReg] = useState(false);
    const [regBusy, setRegBusy] = useState(false);
    const [regMsg, setRegMsg] = useState<string | null>(null);

    async function byRegistration() {
        setRegBusy(true); setRegMsg(null);
        const res = await fetch("/api/madleague/certificates/find", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "registration", agree: true }),
        }).catch(() => null);
        const d = res ? await res.json().catch(() => ({})) : {};
        setRegBusy(false);
        if (!res?.ok) { setRegMsg(d.error ?? "찾지 못했습니다. 잠시 후 다시 시도해 주세요."); return; }
        if ((d.certificates ?? []).length === 0) { setRegMsg("등록 정보(이름·전화번호)와 맞는 인증서가 없습니다. 참가 신청 때 다른 번호를 썼다면 아래에서 직접 확인해 주세요."); setManual(true); return; }
        onDone(d.certificates as PtCertificate[]);
    }

    return (
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="max-w-md">
                <div className="text-xs font-bold tracking-widest text-neutral-500">매드리거 등록 정보로 찾기</div>
                {registered ? (
                    <div className="mt-4 space-y-4">
                        <p className="text-sm text-neutral-400">매드리거 등록 때 낸 이름·전화번호가 경쟁 PT 참가 기록과 맞으면 바로 연결됩니다. 등록 정보가 맞는 계정이 우선입니다.</p>
                        <ConsentBox />
                        <label className="flex items-start gap-3 text-sm text-neutral-300">
                            <input type="checkbox" checked={agreeReg} onChange={e => setAgreeReg(e.target.checked)} className="mt-1" />
                            <span>[필수] 위 내용을 확인했고, 등록 정보로 인증서를 찾아 내 계정에 연결하는 데 동의합니다.</span>
                        </label>
                        {regMsg && <p className="text-sm text-red-500">{regMsg}</p>}
                        <button onClick={byRegistration} disabled={!agreeReg || regBusy} className="w-full py-4 font-bold text-white disabled:opacity-40" style={{ backgroundColor: ACCENT }}>
                            {regBusy ? "찾는 중…" : "동의하고 내 인증서 찾기"}
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 border border-neutral-800 bg-neutral-950 p-6">
                        <p className="text-sm text-neutral-300">매드리거로 등록하면 등록 정보로 인증서를 바로 찾을 수 있고, 동아리·프로그램 활동도 함께 쌓입니다.</p>
                        <a href="/madleague/apply" className="mt-4 inline-block px-6 py-3 font-bold text-white" style={{ backgroundColor: ACCENT }}>매드리거 등록</a>
                    </div>
                )}
            </div>
            <div>
                {manual ? <ManualForm onDone={onDone} /> : (
                    <button onClick={() => setManual(true)} className="text-sm text-neutral-500 underline">등록 정보와 다르면 직접 확인하기</button>
                )}
            </div>
        </div>
    );
}

/** 직접 확인 — 이름·생년월일·대학 */
function ManualForm({ onDone }: { onDone: (list: PtCertificate[]) => void }) {
    const captcha = useCaptcha();
    const [form, setForm] = useState({ name: "", birthdate: "", university: "" });
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const input = "w-full bg-black border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500";

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!captcha.ready) { setError(CAPTCHA_PENDING_MESSAGE); return; }
        setBusy(true); setError(null);
        const res = await fetch("/api/madleague/certificates/find", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, agree, captchaToken: captcha.token }),
        }).catch(() => null);
        captcha.reset(); // 토큰은 1회용
        const d = res ? await res.json().catch(() => ({})) : {};
        setBusy(false);
        if (!res?.ok) { setError(d.error ?? "확인하지 못했습니다. 잠시 후 다시 시도해 주세요."); return; }
        onDone(d.certificates as PtCertificate[]);
    }

    return (
        <form onSubmit={submit} className="max-w-md space-y-4">
            <div>
                <div className="text-xs font-bold tracking-widest text-neutral-500">직접 확인</div>
                <p className="mt-2 text-sm text-neutral-400">경쟁 PT 참가 신청 때 제출한 정보와 같게 입력해 주세요. 한 번 확인하면 내 계정에 연결됩니다.</p>
            </div>
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
            <ConsentBox />
            <label className="flex items-start gap-3 text-sm text-neutral-300">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1" />
                <span>[필수] 위 내용을 확인했고, 인증서를 내 계정에 연결하는 데 동의합니다.</span>
            </label>
            <CaptchaWidget {...captcha.widgetProps} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button disabled={busy || !agree} className="w-full py-4 font-bold text-white disabled:opacity-40" style={{ backgroundColor: ACCENT }}>
                {busy ? "확인 중…" : "내 인증서 찾기"}
            </button>
            <p className="text-xs text-neutral-500">정보가 맞는데도 찾을 수 없으면 문의하기로 알려 주세요.</p>
        </form>
    );
}
