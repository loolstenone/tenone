"use client";

/**
 * 경쟁 PT 회차 일괄 발급 (인트라, 2026-10-10)
 *   ① 회차 정보 ② 참가자 명단(CSV 업로드 또는 엑셀에서 붙여넣기) ③ 팀별 결과 → 미리보기(코드 배정) → 일괄 발급
 *   규칙·코드 배정은 서버 lib/programs/ledger-batch.ts — 화면은 입력과 확인만
 */
import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Download, Upload } from "lucide-react";
import { parseCsvObjects, ROSTER_COLUMNS, ROSTER_REQUIRED } from "@/lib/programs/ledger-columns";

const RESULTS = ["", "1등", "2등", "3등", "본선"];
type Person = { name: string; birthdate: string; university: string; major: string; club: string; cohort: string; phone: string; team: string; result: string };
type Plan = {
    ok: boolean; created: number; participation: number; award: number; range: string | null;
    plan: { line: number; name: string; team: string | null; codes: string[]; result: string | null }[];
    skipped: { line: number; name: string; reason: string }[]; errors: { line: number; reason: string }[];
};

/** 열 이름 별칭 (시트·엑셀마다 조금씩 다르다) */
const ALIAS: Record<keyof Person, string[]> = {
    name: ["이름", "성명"], birthdate: ["생년월일"], university: ["출신 대학", "대학", "학교"], major: ["전공", "학과"],
    club: ["소속 동아리", "동아리", "소속"], cohort: ["기수"], phone: ["전화번호", "개인 전화 번호", "연락처", "휴대폰"],
    team: ["출전팀", "팀", "팀명"], result: ["결과", "수상"],
};

/** CSV 또는 엑셀 붙여넣기(탭 구분) → 참가자 */
function parseRoster(text: string): { people: Person[]; missing: string[] } {
    const firstLine = text.replace(/^﻿/, "").split(/\r?\n/)[0] ?? "";
    let head: string[]; let rows: Record<string, string>[];
    if (firstLine.includes("\t")) {
        const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim());
        head = (lines.shift() ?? "").split("\t").map(h => h.trim());
        rows = lines.map(l => { const c = l.split("\t"); return Object.fromEntries(head.map((h, i) => [h, c[i] ?? ""])); });
    } else ({ head, rows } = parseCsvObjects(text));
    const col = (k: keyof Person) => ALIAS[k].find(a => head.includes(a));
    const missing = ROSTER_REQUIRED.filter(r => !col(r === "이름" ? "name" : "birthdate"));
    const people = rows.map(r => Object.fromEntries((Object.keys(ALIAS) as (keyof Person)[]).map(k => [k, (col(k) ? r[col(k)!] : "")?.trim() ?? ""])) as Person);
    return { people, missing };
}

export function RoundBatchIssue({ onDone }: { onDone: () => void }) {
    const [open, setOpen] = useState(false);
    const [round, setRound] = useState({ title: "", client: "", issued_date: "" });
    const [people, setPeople] = useState<Person[]>([]);
    const [teamResult, setTeamResult] = useState<Record<string, string>>({});
    const [paste, setPaste] = useState("");
    const [plan, setPlan] = useState<Plan | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const teams = useMemo(() => [...new Set(people.map(p => p.team).filter(Boolean))], [people]);
    /** 팀 결과가 지정돼 있으면 팀원 전체에 적용, 팀이 없는 사람은 명단의 결과 */
    const finalPeople = useMemo(() => people.map(p => ({ ...p, result: p.team && p.team in teamResult ? teamResult[p.team] : p.result })), [people, teamResult]);
    const counts = useMemo(() => ({ total: finalPeople.length, award: finalPeople.filter(p => p.result).length }), [finalPeople]);

    const load = (text: string) => {
        setError(""); setPlan(null); setDone("");
        const { people: list, missing } = parseRoster(text);
        if (missing.length) { setError(`명단 첫 줄에 ${missing.join("·")} 열이 필요합니다. 양식을 내려받아 쓰세요.`); return; }
        if (!list.length) { setError("참가자가 없습니다."); return; }
        setPeople(list);
        // 팀별 결과 초기값 = 그 팀에서 처음 나온 결과
        const tr: Record<string, string> = {};
        list.forEach(p => { if (p.team && !(p.team in tr)) tr[p.team] = list.find(x => x.team === p.team && x.result)?.result ?? ""; });
        setTeamResult(tr);
    };

    const template = () => {
        const sample = ["홍길동", "2004.03.15", "한국대학교", "광고홍보학과", "ADlle", "6기", "010-0000-0000", "1팀", "1등"];
        const blob = new Blob(["﻿" + [ROSTER_COLUMNS.join(","), sample.join(",")].join("\n")], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "경쟁PT_참가자명단_양식.csv";
        a.click();
    };

    const send = async (preview: boolean) => {
        setBusy(true); setError(""); setDone("");
        const res = await fetch("/api/intra/programs/certificates", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "batch", brand: "madleague", round, people: finalPeople, preview }),
        }).catch(() => null);
        const d = res ? await res.json().catch(() => ({})) : {};
        setBusy(false);
        if (!res?.ok) { setError(d.error ?? "처리하지 못했습니다."); return; }
        setPlan(d as Plan);
        if (!preview && d.created) {
            setDone(`${d.created}장 발급 완료 (참가 ${d.participation} · 수상 ${d.award}, ${d.range})`);
            setPeople([]); setTeamResult({}); setPaste(""); setPlan(null);
            onDone();
        }
    };

    const invalidate = () => setPlan(null);
    const inp = "w-full rounded border border-neutral-300 px-3 py-2 text-sm";

    return (
        <div className="rounded-lg border border-neutral-200 bg-white">
            <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                <span>
                    <span className="font-semibold text-neutral-900">회차 일괄 발급</span>
                    <span className="ml-2 text-sm text-neutral-500">경쟁 PT가 끝나면 — 회차 정보 · 참가자 명단 · 팀별 결과 → 참가·수상 확인서 한 번에</span>
                </span>
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {done && <p className="px-4 pb-3 text-sm text-emerald-700">{done}</p>}
            {open && (
                <div className="space-y-6 border-t border-neutral-100 p-4">
                    {/* ① 회차 정보 */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-neutral-800">① 회차 정보</h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <label className="block text-xs text-neutral-500">대회명 (인증서 본문·제목에 그대로)
                                <input value={round.title} onChange={e => { setRound({ ...round, title: e.target.value }); invalidate(); }} placeholder="예: 춤추는고래 경쟁 PT" className={`${inp} mt-1`} />
                            </label>
                            <label className="block text-xs text-neutral-500">주최 (비우면 대회명에서 &quot;경쟁 PT&quot;를 뗀 이름)
                                <input value={round.client} onChange={e => { setRound({ ...round, client: e.target.value }); invalidate(); }} placeholder="예: 춤추는고래" className={`${inp} mt-1`} />
                            </label>
                            <label className="block text-xs text-neutral-500">발급일 (인증서에 찍히는 날짜)
                                <input type="date" value={round.issued_date} onChange={e => { setRound({ ...round, issued_date: e.target.value }); invalidate(); }} className={`${inp} mt-1`} />
                            </label>
                        </div>
                    </section>

                    {/* ② 참가자 명단 */}
                    <section>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-neutral-800">② 참가자 명단</h3>
                            <span className="text-xs text-neutral-500">열: {ROSTER_COLUMNS.join(" · ")} (이름·생년월일 필수, 결과는 수상자만)</span>
                            <button onClick={template} className="ml-auto inline-flex items-center gap-1 rounded border border-neutral-300 px-2.5 py-1.5 text-xs"><Download className="h-3.5 w-3.5" /> 양식</button>
                            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) load(await f.text()); }} />
                            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded bg-neutral-900 px-2.5 py-1.5 text-xs text-white"><Upload className="h-3.5 w-3.5" /> CSV 업로드</button>
                        </div>
                        <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={3} placeholder="또는 엑셀에서 첫 줄(열 이름)부터 복사해 붙여넣기"
                            className="w-full rounded border border-neutral-300 px-3 py-2 font-mono text-xs" />
                        {paste.trim() && <button onClick={() => load(paste)} className="mt-1 rounded border border-neutral-300 px-2.5 py-1 text-xs">붙여넣은 명단 읽기</button>}
                        <p className="mt-1 text-[11px] text-neutral-400">전화번호는 매드리거 등록 정보 매칭용 해시로만 남고 저장되지 않습니다.</p>
                    </section>

                    {people.length > 0 && (
                        <>
                            {/* ③ 팀별 결과 */}
                            {teams.length > 0 && (
                                <section>
                                    <h3 className="mb-2 text-sm font-semibold text-neutral-800">③ 팀별 결과 <span className="font-normal text-neutral-500">— 팀원 전체에 적용 (빈칸 = 참가 확인서만)</span></h3>
                                    <div className="flex flex-wrap gap-2">
                                        {teams.map(t => (
                                            <label key={t} className="flex items-center gap-2 rounded border border-neutral-200 px-2.5 py-1.5 text-sm">
                                                <span className="text-neutral-700">{t} <span className="text-xs text-neutral-400">{people.filter(p => p.team === t).length}명</span></span>
                                                <select value={teamResult[t] ?? ""} onChange={e => { setTeamResult({ ...teamResult, [t]: e.target.value }); invalidate(); }} className="rounded border border-neutral-300 px-1.5 py-0.5 text-sm">
                                                    {RESULTS.map(r => <option key={r} value={r}>{r || "—"}</option>)}
                                                </select>
                                            </label>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 명단 확인 */}
                            <section>
                                <h3 className="mb-2 text-sm font-semibold text-neutral-800">
                                    명단 {counts.total}명 → 참가 확인서 {counts.total}장 + 수상 확인서 {counts.award}장
                                </h3>
                                <div className="max-h-72 overflow-auto rounded border border-neutral-200">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-neutral-50 text-left text-neutral-500">
                                            <tr><th className="px-2 py-1.5">#</th><th className="px-2 py-1.5">이름</th><th className="px-2 py-1.5">생년월일</th><th className="px-2 py-1.5">대학 · 전공</th><th className="px-2 py-1.5">동아리</th><th className="px-2 py-1.5">팀</th><th className="px-2 py-1.5">결과</th><th className="px-2 py-1.5">배정 코드 (미리보기)</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {finalPeople.map((p, i) => {
                                                const line = i + 2;
                                                const pl = plan?.plan.find(x => x.line === line);
                                                const sk = plan?.skipped.find(x => x.line === line);
                                                const er = plan?.errors.find(x => x.line === line);
                                                return (
                                                    <tr key={line} className={er ? "bg-red-50" : sk ? "bg-neutral-50 text-neutral-400" : ""}>
                                                        <td className="px-2 py-1 text-neutral-400">{i + 1}</td>
                                                        <td className="px-2 py-1">{p.name}</td>
                                                        <td className="px-2 py-1">{p.birthdate}</td>
                                                        <td className="px-2 py-1">{[p.university, p.major].filter(Boolean).join(" · ")}</td>
                                                        <td className="px-2 py-1">{[p.club, p.cohort].filter(Boolean).join(" ")}</td>
                                                        <td className="px-2 py-1">{p.team}</td>
                                                        <td className="px-2 py-1 font-medium">{p.result}</td>
                                                        <td className="px-2 py-1 font-mono">{er ? <span className="text-red-600">{er.reason}</span> : sk ? sk.reason : pl?.codes.join(" · ")}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* 미리보기 → 발급 */}
                            <section className="flex flex-wrap items-center gap-3">
                                <button disabled={busy} onClick={() => send(true)} className="rounded border border-neutral-900 px-4 py-2 text-sm disabled:opacity-40">미리보기 (코드 배정)</button>
                                <button disabled={busy || !plan?.ok || !(plan.participation + plan.award)} onClick={() => { if (confirm(`${round.title} — 참가 ${plan!.participation}장 · 수상 ${plan!.award}장을 발급합니다.`)) send(false); }}
                                    className="rounded bg-[#EC1D25] px-4 py-2 text-sm font-semibold text-white disabled:opacity-30">
                                    {plan ? `${plan.participation + plan.award}장 발급` : "발급"}
                                </button>
                                {plan && (
                                    <span className="text-sm text-neutral-600">
                                        {plan.range ? `코드 ${plan.range}` : "새로 발급할 인증서 없음"}
                                        {plan.skipped.length > 0 && ` · 건너뜀 ${plan.skipped.length}명(이미 발급)`}
                                        {plan.errors.length > 0 && <span className="text-red-600"> · 오류 {plan.errors.length}건 — 고친 뒤 다시 미리보기</span>}
                                    </span>
                                )}
                            </section>
                            {plan?.errors.filter(e => e.line === 0).map(e => <p key={e.reason} className="text-sm text-red-600">{e.reason}</p>)}
                        </>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            )}
        </div>
    );
}
