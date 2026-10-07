"use client";

/**
 * 동아리 운영진 편집 — 사이트 동아리 관리(회장단, 어두운 화면)와 인트라(직원, 밝은 화면)가 같이 쓴다
 * 저장 = 새 임기 명단 확정 → 이전 운영진 자동 종료 (/api/madleague/clubs/{slug}/officers)
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

interface Person { member_id: string; name: string; email: string | null }
interface Officer extends Person { position: string; term: string | null }
interface Data {
    club: { id: string; name: string; term_unit: "year" | "semester" };
    canManage: boolean;
    isStaff: boolean;
    terms: { current: string; next: string };
    officers: Officer[];
    history: (Officer & { valid_until: string | null })[];
    candidates: Person[];
}

const POSITIONS = ["회장", "부회장", "총무"];
const MAX = 5;

export function ClubOfficersEditor({ slug, tone = "dark" }: { slug: string; tone?: "dark" | "light" }) {
    const dark = tone === "dark";
    const c = {
        box: dark ? "bg-neutral-950 border border-neutral-900" : "rounded-lg border border-neutral-200 bg-white",
        input: dark ? "bg-black border border-neutral-800 text-white focus:border-[#EC1D25] [color-scheme:dark]" : "rounded border border-neutral-300 text-neutral-900",
        muted: dark ? "text-neutral-500" : "text-neutral-400",
        text: dark ? "text-white" : "text-neutral-900",
        btn: dark ? "bg-[#EC1D25] text-white" : "rounded bg-neutral-900 text-white",
        chip: dark ? "border border-neutral-800" : "rounded border border-neutral-200",
    };

    const [d, setD] = useState<Data | null>(null);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState("");
    const [busy, setBusy] = useState(false);
    const [rows, setRows] = useState<{ member_id: string; position: string }[]>([]);
    const [term, setTerm] = useState("");
    const [unit, setUnit] = useState<"year" | "semester">("year");
    const [q, setQ] = useState("");

    const load = useCallback(async (query = "") => {
        const res = await fetch(`/api/madleague/clubs/${slug}/officers${query ? `?q=${encodeURIComponent(query)}` : ""}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "불러오지 못했습니다."); return; }
        setD(prev => {
            // 검색은 후보만 갱신 — 편집 중인 명단 유지
            if (prev && query) return { ...prev, candidates: data.candidates };
            return data;
        });
        if (!query) {
            setRows(data.officers.map((o: Officer) => ({ member_id: o.member_id, position: o.position })));
            setUnit(data.club.term_unit);
            setTerm(data.officers[0]?.term === data.terms.current ? data.terms.next : data.terms.current);
        }
    }, [slug]);
    useEffect(() => { load(); }, [load]);

    if (!d) return <p className={`text-sm ${c.muted}`}>{error || "불러오는 중…"}</p>;

    const people = new Map<string, Person>([...d.candidates, ...d.officers].map(p => [p.member_id, p]));
    const nameOf = (id: string) => people.get(id)?.name ?? "(이름 없음)";
    const available = d.candidates.filter(p => !rows.some(r => r.member_id === p.member_id));

    const save = async () => {
        setBusy(true); setError(""); setSaved("");
        const res = await fetch(`/api/madleague/clubs/${slug}/officers`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ term, term_unit: unit, officers: rows }),
        });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) { setError(data.error ?? "저장하지 못했습니다."); return; }
        setSaved(`${term} 운영진을 저장했습니다. 이전 운영진은 종료됐습니다.`);
        await load();
    };

    return (
        <div className="space-y-6">
            {/* 현재 운영진 */}
            <div className={`${c.box} p-6`}>
                <div className={`mb-4 font-bold ${c.text}`}>현재 운영진 {d.officers[0]?.term ? `· ${d.officers[0].term}` : ""}</div>
                {d.officers.length === 0 ? (
                    <p className={`text-sm ${c.muted}`}>지정된 운영진이 없습니다.{d.isStaff ? " 처음 지정은 MADLeague 운영진이 합니다." : ""}</p>
                ) : (
                    <ul className="flex flex-wrap gap-2">
                        {d.officers.map(o => (
                            <li key={o.member_id} className={`${c.chip} px-3 py-1.5 text-sm ${c.text}`}>
                                <span className="mr-1.5 font-bold text-[#EC1D25]">{o.position}</span>{o.name}
                                {o.email && <span className={`ml-1.5 text-xs ${c.muted}`}>{o.email}</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 새 명단 */}
            {d.canManage && (
                <div className={`${c.box} p-6 space-y-4`}>
                    <div>
                        <div className={`font-bold ${c.text}`}>운영진 지정</div>
                        <p className={`mt-1 text-xs ${c.muted}`}>
                            회장 1명 포함 최대 {MAX}명. 저장하면 이 명단이 새 임기 운영진이 되고 이전 운영진 권한은 끝납니다.
                            운영진은 지원서 승인, 회장·부회장은 다음 운영진 지정을 할 수 있습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                        <label className="text-xs">
                            <div className={`mb-1 ${c.muted}`}>임기 단위</div>
                            <select value={unit} onChange={e => { const u = e.target.value as "year" | "semester"; setUnit(u); setTerm(u === "year" ? term.slice(0, 4) : `${term.slice(0, 4)}-1`); }} className={`${c.input} px-3 py-2 text-sm`}>
                                <option value="year">연간</option>
                                <option value="semester">학기</option>
                            </select>
                        </label>
                        <label className="text-xs">
                            <div className={`mb-1 ${c.muted}`}>임기 ({unit === "year" ? "예: 2026" : "예: 2026-1"})</div>
                            <input value={term} onChange={e => setTerm(e.target.value.replace(/[^\d-]/g, "").slice(0, 6))} className={`${c.input} w-28 px-3 py-2 text-sm`} />
                        </label>
                    </div>

                    <ul className="space-y-2">
                        {rows.map((r, i) => (
                            <li key={r.member_id} className="flex flex-wrap items-center gap-2">
                                <input list="officer-positions" value={r.position} onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, position: e.target.value.slice(0, 20) } : x))}
                                    placeholder="직책" className={`${c.input} w-32 px-3 py-1.5 text-sm`} />
                                <span className={`text-sm ${c.text}`}>{nameOf(r.member_id)}</span>
                                <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className={`${c.muted} hover:text-red-500`} title="빼기"><X className="h-4 w-4" /></button>
                            </li>
                        ))}
                        <datalist id="officer-positions">{POSITIONS.map(p => <option key={p} value={p} />)}</datalist>
                    </ul>

                    {rows.length < MAX && (
                        <div className="flex flex-wrap items-center gap-2">
                            {d.isStaff && (
                                <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") load(q); }}
                                    placeholder="회원 이름·이메일 검색 후 Enter" className={`${c.input} w-64 px-3 py-1.5 text-sm`} />
                            )}
                            <select value="" onChange={e => { if (e.target.value) setRows([...rows, { member_id: e.target.value, position: rows.some(r => r.position === "회장") ? "" : "회장" }]); }}
                                className={`${c.input} min-w-56 px-3 py-1.5 text-sm`}>
                                <option value="">{available.length ? "운영진 추가" : d.isStaff ? "검색 결과 없음 — 이름·이메일로 검색" : "추가할 현역이 없습니다"}</option>
                                {available.map(p => <option key={p.member_id} value={p.member_id}>{p.name}{p.email ? ` · ${p.email}` : ""}</option>)}
                            </select>
                            <Plus className={`h-4 w-4 ${c.muted}`} />
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {saved && <p className="text-sm text-emerald-500">{saved}</p>}
                    <button onClick={save} disabled={busy || rows.length === 0} className={`${c.btn} inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold disabled:opacity-40`}>
                        {busy && <Loader2 className="h-4 w-4 animate-spin" />} {term || "새 임기"} 운영진으로 저장
                    </button>
                </div>
            )}

            {/* 이력 */}
            {d.history.length > 0 && (
                <div className={`${c.box} p-6`}>
                    <div className={`mb-3 text-sm font-bold ${c.text}`}>지난 운영진</div>
                    <ul className={`space-y-1 text-sm ${c.muted}`}>
                        {d.history.map((h, i) => (
                            <li key={`${h.member_id}-${i}`}>{h.term ?? "—"} · {h.position} · {h.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
