"use client";

/**
 * 인트라 인증서 관리 — 구분 · 코드 · 발급일 · 비고 · 결과 (+ 발급 시점 정보)
 * 발급은 회원 본인이 사이트에서 한다. 여기서는 확인·비고·결과 수정·취소/복원·CSV.
 * 개인정보(생년월일·대학·전공)는 펼쳐야 보이고, CSV는 직원 업무용 — 외부 공유 금지
 * 수료증 관리 대장(cert_key ledger:*, MADLeague 경쟁 PT) = 인트라가 원본 (2026-10-10): 펼쳐서 기재 사항 수정·계정 연결 해제, 새 회차는 CSV 업로드
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { RoundBatchIssue } from "@/components/intra/programs/RoundBatchIssue";
import { Download, Search, Upload } from "lucide-react";
import { LEDGER_COLUMNS, parseLedgerCsv } from "@/lib/programs/ledger-columns";

interface Snapshot {
    name?: string; birthdate?: string | null; university?: string | null; major?: string | null;
    group_name?: string | null; cohort?: string | null; team_name?: string | null; round_title?: string | null;
    title?: string; label?: string; brand_name?: string;
}
interface Row {
    id: string; brand_id: string; cert_key: string; member_id: string | null; linked_by: string | null; type: string; code: string; result: string | null; note: string | null;
    snapshot: Snapshot; issued_at: string; revoked_at: string | null; revoked_reason: string | null;
}

/** 한국 시간 날짜 (YYYY-MM-DD) */
const kstDay = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

export function CertificatesAdmin({ brands, brand: fixedBrand, title = "인증서", ledgerImport = false }: { brands?: { slug: string; name: string }[]; brand?: string; title?: string; ledgerImport?: boolean }) {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [brand, setBrand] = useState(fixedBrand ?? "");
    const [q, setQ] = useState("");
    const [open, setOpen] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

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
        setError(""); setNotice("");
        const res = await fetch("/api/intra/programs/certificates", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError(d.error ?? "처리하지 못했습니다."); return; }
        if (d.hashCleared) setNotice("이름이 바뀌어 매드리거 등록 정보 매칭이 꺼졌습니다. 전화번호를 함께 넣어 저장하면 다시 켜집니다.");
        await load(q);
    };

    /** 새 회차 대장 CSV 업로드 — 시트와 같은 열 이름. 전화번호는 서버에서 해시만 남긴다 */
    const upload = async (file: File) => {
        setError(""); setNotice("");
        const { rows: parsed, missing } = parseLedgerCsv(await file.text());
        if (missing.length) { setError(`CSV 첫 줄에 없는 열: ${missing.join(", ")}`); return; }
        if (!parsed.length) { setError("행이 없습니다."); return; }
        if (!confirm(`${parsed.length}행을 대장 인증서로 등록합니다. 같은 코드가 이미 있으면 건너뜁니다.`)) return;
        const res = await fetch("/api/intra/programs/certificates", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "import", brand: fixedBrand ?? brand, rows: parsed }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError(d.error ?? "등록하지 못했습니다."); return; }
        const errs = (d.errors ?? []) as { line: number; reason: string }[];
        setNotice(`등록 ${d.inserted}건 · 이미 있음 ${d.skipped}건${errs.length ? ` · 오류 ${errs.length}건` : ""}`);
        if (errs.length) setError(errs.slice(0, 20).map(e => (e.line ? `${e.line}행: ${e.reason}` : e.reason)).join("\n"));
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
                {ledgerImport && (
                    <>
                        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) upload(f); }} />
                        <button onClick={() => fileRef.current?.click()} title={`열: ${LEDGER_COLUMNS.join(", ")}`} className="ml-auto inline-flex items-center gap-1 rounded bg-neutral-900 px-3 py-2 text-sm text-white">
                            <Upload className="h-4 w-4" /> 대장 CSV 등록
                        </button>
                    </>
                )}
                <button onClick={csv} disabled={!rows?.length} className={`${ledgerImport ? "" : "ml-auto "} inline-flex items-center gap-1 rounded border border-neutral-300 px-3 py-2 text-sm disabled:opacity-40`}>
                    <Download className="h-4 w-4" /> CSV (내부용)
                </button>
            </div>

            {ledgerImport && (
                <p className="text-xs text-neutral-500">
                    경쟁 PT 대장은 여기가 원본입니다 (구글 시트는 2026-10-10 동결). 새 회차는 아래 회차 일괄 발급(코드 자동 배정)이 기본, 코드가 이미 정해진 대장은 시트와 같은 열({LEDGER_COLUMNS.join(" · ")})의 CSV로 등록 — 코드 형식 2026-COA 000142 (뒤 6자리는 대장 전체 고유 일련번호 — 다시 시작하지 않음), 수상은 MCP + 결과(1등·2등·3등·본선). 전화번호는 매드리거 등록 매칭용 해시만 남기고 저장하지 않습니다. 고칠 땐 코드를 눌러 펼치세요.
                </p>
            )}
            {ledgerImport && fixedBrand === "madleague" && <RoundBatchIssue onDone={() => load(q)} />}
            {notice && <p className="text-sm text-emerald-700">{notice}</p>}
            {error && <p className="whitespace-pre-line text-sm text-red-600">{error}</p>}
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
                        {r.cert_key.startsWith("ledger:") ? <LedgerEdit r={r} call={call} /> : (
                            <>생년월일 {s.birthdate ?? "—"} · {s.university ?? "—"} {s.major ?? ""} · {[s.group_name, s.cohort].filter(Boolean).join(" ") || "소속 —"}</>
                        )}
                        {r.revoked_reason && <span className="ml-3 text-red-500">취소 사유: {r.revoked_reason}</span>}
                    </td>
                </tr>
            )}
        </>
    );
}

const LINKED_BY: Record<string, string> = { registration: "매드리거 등록 정보", manual: "본인 직접 확인", admin: "직원" };

/** 대장 인증서 기재 사항 수정 · 계정 연결 상태 */
function LedgerEdit({ r, call }: { r: Row; call: (m: "PATCH" | "POST", b: Record<string, unknown>) => Promise<void> }) {
    const s = r.snapshot;
    const init = { name: s.name ?? "", birthdate: s.birthdate ?? "", university: s.university ?? "", major: s.major ?? "", group_name: s.group_name ?? "", cohort: s.cohort ?? "", team_name: s.team_name ?? "", phone: "" };
    const [f, setF] = useState(init);
    const dirty = (Object.keys(init) as (keyof typeof init)[]).some(k => f[k] !== init[k]);
    const fields: [keyof typeof init, string, string?][] = [
        ["name", "이름"], ["birthdate", "생년월일", "date"], ["university", "출신 대학"], ["major", "전공"],
        ["group_name", "소속 동아리"], ["cohort", "기수"], ["team_name", "출전팀"], ["phone", "전화번호 (바꿀 때만 · 저장 안 함)"],
    ];
    return (
        <div className="mb-2 space-y-3">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {fields.map(([k, label, type]) => (
                    <label key={k} className="block">
                        <span className="text-[11px] text-neutral-500">{label}</span>
                        <input type={type ?? "text"} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} className="mt-0.5 w-full rounded border border-neutral-200 bg-white px-2 py-1 text-sm" />
                    </label>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <button disabled={!dirty} onClick={() => call("PATCH", { id: r.id, ledger: f })} className="rounded bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-30">기재 사항 저장</button>
                <span className="text-neutral-500">계정 연결: {r.member_id ? `연결됨 (${LINKED_BY[r.linked_by ?? ""] ?? "—"})` : "없음"}</span>
                {r.member_id && (
                    <button onClick={() => { if (confirm("이 인증서의 계정 연결을 해제합니다. 다른 사람이 잘못 연결한 경우에만 쓰세요.")) call("POST", { action: "unlink", id: r.id }); }} className="text-red-600 underline">연결 해제</button>
                )}
            </div>
        </div>
    );
}
