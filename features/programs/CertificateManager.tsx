"use client";

/**
 * 내 인증서 — 발급 가능 목록에서 직접 발급 → 인쇄/PDF · 진위 확인 링크 (코어 프로그램 모듈 3단계)
 * 첫 발급 때만 생년월일·출신 대학·전공 입력 (이후 직전 값이 기본값). 발급 시점 값으로 고정된다.
 */
import { useCallback, useEffect, useState } from "react";
import { Award, CheckCircle2, Download, FileBadge, Loader2 } from "lucide-react";

interface Cert {
    key: string; type: string; label: string; title: string; result: string;
    year: number | null; round_id: string | null; team_name: string | null; issued_code: string | null;
}
interface Profile { birthdate: string; university: string; major: string }

export function CertificateManager({ brand, printBase, verifyBase, accentColor = "#EC1D25" }: {
    brand: string; printBase: string; verifyBase: string; accentColor?: string;
}) {
    const [certs, setCerts] = useState<Cert[] | null>(null);
    const [profile, setProfile] = useState<Profile>({ birthdate: "", university: "", major: "" });
    const [hasPrevious, setHasPrevious] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState<string | null>(null);
    const [consent, setConsent] = useState(false);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        const res = await fetch(`/api/programs/certificates?brand=${brand}`);
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError(d.error ?? "불러오지 못했습니다."); return; }
        setCerts(d.certificates);
        setHasPrevious(d.hasPrevious);
        setProfile(p => ({
            birthdate: p.birthdate || d.defaults.birthdate || "",
            university: p.university || d.defaults.university || "",
            major: p.major || d.defaults.major || "",
        }));
    }, [brand]);
    useEffect(() => { load(); }, [load]);

    const issue = async (key: string) => {
        setBusy(true); setError("");
        const res = await fetch("/api/programs/certificates", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brand, key, profile, consent }),
        });
        const d = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) { setError(d.error ?? "발급하지 못했습니다."); return; }
        setOpen(null); setConsent(false);
        await load();
        window.open(`${printBase}/${d.code}`, "_blank", "noopener");
    };

    if (!certs) {
        return error
            ? <p className="text-sm text-red-400">{error}</p>
            : <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-neutral-500" /></div>;
    }

    const pending = certs.filter(c => !c.issued_code);
    const issued = certs.filter(c => c.issued_code);
    const input = "w-full border border-neutral-700 bg-black px-3 py-2 text-sm text-white";
    const ready = consent && !!profile.birthdate && !!profile.university.trim() && !!profile.major.trim();

    return (
        <div className="space-y-12 text-white">
            {error && <p className="border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-300">{error}</p>}

            <section>
                <h2 className="mb-4 text-xl font-black">발급 가능 ({pending.length})</h2>
                {pending.length === 0 ? (
                    <div className="border border-neutral-900 bg-neutral-950 p-8 text-center text-sm text-neutral-500">
                        지금 발급할 인증서가 없습니다. 참가한 회차의 결과가 발표되거나 활동 연도가 끝나면 여기에 나타납니다.
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {pending.map(c => (
                            <div key={c.key} className="border border-neutral-900 bg-neutral-950 p-5">
                                <CertHead c={c} />
                                {open === c.key ? (
                                    <div className="mt-4 space-y-3 border-t border-neutral-900 pt-4">
                                        <p className="text-xs text-neutral-500">
                                            {hasPrevious ? "지난번 입력한 값입니다. 바뀌었으면 고쳐 주세요." : "처음 발급할 때만 입력합니다. 인증서에 그대로 표기됩니다."}
                                        </p>
                                        <label className="block text-xs text-neutral-400">생년월일
                                            <input type="date" value={profile.birthdate} onChange={e => setProfile({ ...profile, birthdate: e.target.value })} className={`mt-1 ${input}`} />
                                        </label>
                                        <label className="block text-xs text-neutral-400">출신 대학
                                            <input value={profile.university} onChange={e => setProfile({ ...profile, university: e.target.value })} maxLength={60} className={`mt-1 ${input}`} />
                                        </label>
                                        <label className="block text-xs text-neutral-400">전공
                                            <input value={profile.major} onChange={e => setProfile({ ...profile, major: e.target.value })} maxLength={60} className={`mt-1 ${input}`} />
                                        </label>
                                        <label className="flex cursor-pointer items-start gap-2 text-xs text-neutral-300">
                                            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4" style={{ accentColor }} />
                                            <span>[필수] 생년월일·출신 대학·전공을 인증서 표기와 발급 기록 확인 목적으로 수집·이용하는 데 동의합니다. 발급 기록은 진위 확인을 위해 보관되며, 탈퇴 시 이 정보는 지우고 익명 기록만 남깁니다.</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <button onClick={() => issue(c.key)} disabled={busy || !ready}
                                                className="flex-1 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ background: accentColor }}>
                                                {busy ? "발급 중…" : "발급하고 열기"}
                                            </button>
                                            <button onClick={() => setOpen(null)} className="border border-neutral-700 px-4 text-sm">취소</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => { setOpen(c.key); setConsent(false); }}
                                        className="mt-4 w-full py-2.5 text-sm font-bold text-white" style={{ background: accentColor }}>발급하기</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="mb-4 text-xl font-black">발급된 인증서 ({issued.length})</h2>
                {issued.length === 0 ? (
                    <div className="border border-neutral-900 bg-neutral-950 p-8 text-center text-sm text-neutral-500">아직 발급한 인증서가 없습니다.</div>
                ) : (
                    <div className="space-y-3">
                        {issued.map(c => (
                            <div key={c.key} className="flex flex-col gap-4 border border-neutral-900 bg-neutral-950 p-5 sm:flex-row sm:items-center">
                                <div className="min-w-0 flex-1">
                                    <CertHead c={c} />
                                    <div className="mt-2 font-mono text-xs text-neutral-500">코드 {c.issued_code}</div>
                                </div>
                                <div className="flex gap-2">
                                    <a href={`${verifyBase}/${c.issued_code}`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 border border-neutral-700 px-3 py-2 text-xs font-bold hover:border-white">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> 진위 확인
                                    </a>
                                    <a href={`${printBase}/${c.issued_code}`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 bg-white px-3 py-2 text-xs font-bold text-black hover:bg-neutral-200">
                                        <Download className="h-3.5 w-3.5" /> 인쇄 / PDF
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <p className="border-t border-neutral-900 pt-6 text-xs leading-relaxed text-neutral-500">
                &quot;인쇄 / PDF&quot;를 누르면 인증서가 열립니다. 브라우저 인쇄에서 &quot;PDF로 저장&quot;을 고르세요.
                인증서 내용은 발급한 시점의 정보로 고정됩니다. 잘못된 내용이 있으면 운영진에게 재발급을 요청하세요.
            </p>
        </div>
    );
}

function CertHead({ c }: { c: Cert }) {
    const Icon = c.type === "award" ? Award : FileBadge;
    return (
        <div className="flex items-start gap-3">
            <Icon className={`h-6 w-6 shrink-0 ${c.type === "award" ? "text-[#FFC000]" : "text-neutral-400"}`} />
            <div className="min-w-0">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold ${c.type === "award" ? "bg-[#FFC000] text-black" : "bg-neutral-800 text-neutral-300"}`}>{c.label}</span>
                <h3 className="mt-1.5 font-bold">{c.title}</h3>
                <p className="mt-0.5 text-xs text-neutral-500">{[c.team_name, c.result].filter(Boolean).join(" · ")}</p>
            </div>
        </div>
    );
}
