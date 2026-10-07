"use client";

/**
 * 인트라 인증서 관리 — 구분 · 코드 · 발급일 · 비고 · 결과 (+ 발급 시점 정보)
 * 발급은 회원 본인이 사이트에서 한다. 여기서는 확인·비고·결과 수정·취소/복원·CSV.
 * 개인정보(생년월일·대학·전공)는 펼쳐야 보이고, CSV는 직원 업무용 — 외부 공유 금지
 */
import { useCallback, useEffect, useState } from "react";
import { Download, Search } from "lucide-react";

interface Snapshot {
    name?: string; birthdate?: string | null; university?: string | null; major?: string | null;
    group_name?: string | null; cohort?: string | null; team_name?: string | null; round_title?: string | null;
    title?: string; label?: string; brand_name?: string;
}
interface Row {
    id: string; brand_id: string; type: string; code: string; result: string | null; note: string | null;
    snapshot: Snapshot; issued_at: string; revoked_at: string | null; revoked_reason: string | null;
}

/** 한국 시간 날짜 (YYYY-MM-DD) */
const kstDay = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

export function CertificatesAdmin({ brands, brand: fixedBrand, title = "인증서" }: { brands?: { slug: string; name: string }[]; brand?: string; title?: string }) {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [brand, setBrand] = useState(fixedBrand ?? "");
    const [q, setQ] = useState("");
    const [open, setOpen] = useState<string | null>(null);
    const [error, setError] = useState("");

    const load = useCallback(async (query = "") => {
        const p = new URLSearchParams();
        if (brand) p.set("brand", brand);
        if (query) p.set("q", query);
        const res = await fetch(`/api/intra/programs/certificates?${p}`);
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError(d.error ?? "불러오지 못했습니다."); return; }
        setRows(d.certificates);
    }, [brand]);
    useEffect(() => { load(); }, [load]);

    const call = async (method: "PATCH" | "POST", body: Record<string, unknown>) => {
        setError("");
        const res = await fetch("/api/intra/programs/certificates", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError(d.error ?? "처리하지 못했습니다."); return; }
        await load(q);
    };

    const csv = () => {
        if (!rows?.length) return;
        const head = ["구분", "코드", "발급일", "이름", "생년월일", "출신 대학", "전공", "소속", "기수", "프로그램", "출전팀", "결과", "비고", "상태"];
        const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const lines = rows.map(r => [
            r.snapshot.label, r.code, kstDay(r.issued_at), r.snapshot.name, r.snapshot.birthdate, r.snapshot.university, r.snapshot.major,
            r.snapshot.group_name, r.snapshot.cohort, r.snapshot.round_title ?? r.snapshot.title, r.snapshot.team_name, r.result, r.note,
            r.revoked_at ? `취소(${r.revoked_reason ?? ""})` : "유효",
        ].map(esc).join(","));
        const blob = new Blob(["﻿" + [head.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `certificates-${brand || "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    const brandName = (slug: string) => brands?.find(b => b.slug === slug)?.name ?? slug;
    const cls = "rounded border border-neutral-300 px-3 py-2 text-sm";

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    회원이 사이트에서 로그인해 직접 발급합니다 (참가·수상 확인서 = 결과 발표 후, 활동 인증서 = 활동 연도 종료 후). 발급 시점 정보로 고정되며, 잘못 발급된 건은 취소 후 회원이 다시 발급합니다.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {!fixedBrand && (
                    <select value={brand} onChange={e => setBrand(e.target.value)} className={cls}>
                        <option value="">전 브랜드</option>
                        {(brands ?? []).map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                    </select>
                )}
                <form onSubmit={e => { e.preventDefault(); load(q); }} className="flex gap-2">
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="코드 · 이름" className={`${cls} w-48`} />
                    <button className="inline-flex items-center gap-1 rounded bg-neutral-900 px-3 py-2 text-sm text-white"><Search className="h-4 w-4" /> 찾기</button>
                </form>
                <button onClick={csv} disabled={!rows?.length} className="ml-auto inline-flex items-center gap-1 rounded border border-neutral-300 px-3 py-2 text-sm disabled:opacity-40">
                    <Download className="h-4 w-4" /> CSV (내부용)
                </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {!rows ? <p className="text-sm text-neutral-400">불러오는 중…</p> : rows.length === 0 ? <p className="text-sm text-neutral-400">발급된 인증서가 없습니다.</p> : (
                <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
                            <tr>
                                <th className="px-3 py-2">구분</th><th className="px-3 py-2">코드</th><th className="px-3 py-2">발급일</th>
                                <th className="px-3 py-2">이름</th><th className="px-3 py-2">프로그램 · 팀</th>
                                <th className="px-3 py-2">결과</th><th className="px-3 py-2">비고</th><th className="px-3 py-2">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {rows.map(r => (
                                <CertRow key={r.id} r={r} showBrand={!brand} brandName={brandName(r.brand_id)}
                                    open={open === r.id} onToggle={() => setOpen(o => (o === r.id ? null : r.id))} call={call} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function CertRow({ r, showBrand, brandName, open, onToggle, call }: {
    r: Row; showBrand: boolean; brandName: string; open: boolean; onToggle: () => void;
    call: (m: "PATCH" | "POST", b: Record<string, unknown>) => Promise<void>;
}) {
    const [result, setResult] = useState(r.result ?? "");
    const [note, setNote] = useState(r.note ?? "");
    const s = r.snapshot;
    const dirty = result !== (r.result ?? "") || note !== (r.note ?? "");
    const inp = "w-full rounded border border-neutral-200 px-2 py-1 text-sm";
    return (
        <>
            <tr className={r.revoked_at ? "bg-neutral-50 text-neutral-400" : ""}>
                <td className="px-3 py-2">
                    {showBrand && <span className="mr-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">{brandName}</span>}
                    {s.label ?? r.type}
                </td>
                <td className="px-3 py-2 font-mono text-xs"><button onClick={onToggle} className="underline-offset-2 hover:underline">{r.code}</button></td>
                <td className="px-3 py-2 text-xs">{kstDay(r.issued_at)}</td>
                <td className="px-3 py-2">{s.name ?? "(탈퇴)"}</td>
                <td className="px-3 py-2 text-xs">{s.round_title ?? s.title}{s.team_name ? ` · ${s.team_name}` : ""}</td>
                <td className="px-3 py-2"><input value={result} onChange={e => setResult(e.target.value)} className={inp} /></td>
                <td className="px-3 py-2">
                    <div className="flex gap-1">
                        <input value={note} onChange={e => setNote(e.target.value)} className={inp} />
                        {dirty && <button onClick={() => call("PATCH", { id: r.id, result, note })} className="rounded bg-neutral-900 px-2 text-xs text-white">저장</button>}
                    </div>
                </td>
                <td className="px-3 py-2 text-xs">
                    {r.revoked_at ? (
                        <button onClick={() => call("POST", { action: "restore", id: r.id })} className="text-neutral-500 underline" title={r.revoked_reason ?? ""}>취소됨 · 복원</button>
                    ) : (
                        <button onClick={() => { const reason = prompt("취소 사유"); if (reason) call("POST", { action: "revoke", id: r.id, reason }); }} className="text-red-600">유효 · 취소</button>
                    )}
                </td>
            </tr>
            {open && (
                <tr className="bg-neutral-50">
                    <td colSpan={8} className="px-3 py-3 text-xs text-neutral-600">
                        생년월일 {s.birthdate ?? "—"} · {s.university ?? "—"} {s.major ?? ""} · {[s.group_name, s.cohort].filter(Boolean).join(" ") || "소속 —"}
                        {r.revoked_reason && <span className="ml-3 text-red-500">취소 사유: {r.revoked_reason}</span>}
                    </td>
                </tr>
            )}
        </>
    );
}
