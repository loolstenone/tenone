"use client";

/**
 * 인트라 경쟁 PT·프로젝트 회차 편집 — 정보 · 참가 신청 폼 연결 · 팀 구성·배정 · 본선 진출 · 제출물 · 결과
 * 팀원 = members.id. 배정 후보 = 연결 폼의 로그인 응답자 + 현역·임원 매드리거
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Plus, Trash2, X } from "lucide-react";
import { COMP_STATUS_LABEL, COMP_KIND_LABEL } from "./CompetitionsAdmin";
import { brandSiteUrl } from "@/lib/domain-registry";

interface Person { member_id: string; name: string; email: string | null; club: string | null }
interface Team {
    id: string; name: string; club_id: string | null; is_finalist: boolean;
    members: (Person & { role: string })[];
    result: { rank: number | null; award_name: string | null; feedback: string | null } | null;
    submissions: Submission[];
}
interface Submission { stage: "prelim" | "final"; title: string; status: string; file_name: string | null; presentation_url: string | null; submitted_at: string | null; updated_at: string }
interface Detail {
    competition: Record<string, string | number | null>;
    clubs: { id: string; name: string }[];
    forms: { id: string; title: string; status: string }[];
    teams: Team[];
    applicants: (Person & { response_id: string; response_status: string })[];
    madleaguers: Person[];
    clients: Person[];
}

const INFO_FIELDS: { key: string; label: string; type?: string; wide?: boolean }[] = [
    { key: "title", label: "제목", wide: true },
    { key: "year", label: "연도" },
    { key: "client_name", label: "클라이언트" },
    { key: "brief_title", label: "브리프 요약", wide: true },
    { key: "start_date", label: "시작일", type: "date" },
    { key: "end_date", label: "예선 제출 마감", type: "date" },
    { key: "final_deadline", label: "본선 제출 마감", type: "date" },
    { key: "presentation_date", label: "발표일", type: "date" },
];
const inputCls = "w-full rounded border border-neutral-300 px-3 py-2 text-sm";

export function CompetitionEditor({ id, basePath }: { id: string; basePath: string }) {
    const [d, setD] = useState<Detail | null>(null);
    const [info, setInfo] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: "", club_id: "" });
    const [clientEmail, setClientEmail] = useState("");

    const load = useCallback(async () => {
        const res = await fetch(`/api/intra/madleague/competitions/${id}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "불러오지 못했습니다."); return; }
        setD(data);
        const c = data.competition;
        setInfo(Object.fromEntries(["title", "year", "kind", "client_name", "brief_title", "brief_content", "start_date", "end_date", "final_deadline", "presentation_date", "status", "form_id"].map(k => [k, c[k] == null ? "" : String(c[k])])));
    }, [id]);
    useEffect(() => { load(); }, [load]);

    const act = async (body: Record<string, unknown>) => {
        setBusy(true); setError("");
        const res = await fetch(`/api/intra/madleague/competitions/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) { setError(data.error ?? "처리하지 못했습니다."); return false; }
        await load();
        return true;
    };

    const saveInfo = async () => {
        setBusy(true); setError(""); setSaved(false);
        const res = await fetch(`/api/intra/madleague/competitions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(info) });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) { setError(data.error ?? "저장하지 못했습니다."); return; }
        setSaved(true);
        await load();
    };

    if (!d) return <p className="text-sm text-neutral-400">{error || "불러오는 중…"}</p>;

    const assigned = new Set(d.teams.flatMap(t => t.members.map(m => m.member_id)));
    const applicantIds = new Set(d.applicants.map(a => a.member_id));
    const candidates: Person[] = [...d.applicants, ...d.madleaguers.filter(m => !applicantIds.has(m.member_id))].filter(p => !assigned.has(p.member_id));

    return (
        <div className="space-y-8">
            <div>
                <Link href={basePath} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"><ChevronLeft className="h-4 w-4" /> 회차 목록</Link>
                <h1 className="mt-2 text-2xl font-bold text-neutral-900">{String(d.competition.title)}</h1>
                <p className="mt-1 text-sm text-neutral-500">{COMP_STATUS_LABEL[String(d.competition.status)]} · 팀 {d.teams.length} · 배정 {assigned.size}명</p>
                <a href={brandSiteUrl("madleague", `/madleague/pt/${id}`)} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-semibold text-red-600 hover:underline">회차 방 열기 — 공지·Q&A·제출물 ↗</a>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* 회차 정보 */}
            <section className="rounded-lg border border-neutral-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-neutral-800">회차 정보</h2>
                    <div className="flex items-center gap-3">
                        {saved && <span className="text-xs text-emerald-600">저장했습니다.</span>}
                        <button onClick={saveInfo} disabled={busy} className="rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-300">저장</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {INFO_FIELDS.map(f => (
                        <label key={f.key} className={f.wide ? "sm:col-span-3" : ""}>
                            <div className="mb-1 text-xs text-neutral-500">{f.label}</div>
                            <input type={f.type ?? "text"} value={info[f.key] ?? ""} onChange={e => setInfo({ ...info, [f.key]: e.target.value })} className={inputCls} />
                        </label>
                    ))}
                    <label>
                        <div className="mb-1 text-xs text-neutral-500">유형</div>
                        <select value={info.kind} onChange={e => setInfo({ ...info, kind: e.target.value })} className={inputCls}>
                            {Object.entries(COMP_KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </label>
                    <label>
                        <div className="mb-1 text-xs text-neutral-500">상태</div>
                        <select value={info.status} onChange={e => setInfo({ ...info, status: e.target.value })} className={inputCls}>
                            {Object.entries(COMP_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </label>
                    <label className="sm:col-span-3">
                        <div className="mb-1 text-xs text-neutral-500">참가 신청 폼 (응답자를 팀 배정 후보로)</div>
                        <select value={info.form_id} onChange={e => setInfo({ ...info, form_id: e.target.value })} className={inputCls}>
                            <option value="">연결 안 함</option>
                            {d.forms.map(f => <option key={f.id} value={f.id}>{f.title}{f.status === "draft" ? " (준비 중)" : ""}</option>)}
                        </select>
                    </label>
                    <label className="sm:col-span-3">
                        <div className="mb-1 text-xs text-neutral-500">브리프 내용 (팀원에게 보이는 과제 설명)</div>
                        <textarea rows={4} value={info.brief_content ?? ""} onChange={e => setInfo({ ...info, brief_content: e.target.value })} className={inputCls} />
                    </label>
                </div>
            </section>

            {/* 클라이언트 — 회차 방에서 공지·Q&A·제출물 확인, 답변·코멘트 (팀원 이름은 보이지 않음) */}
            <section className="rounded-lg border border-neutral-200 bg-white p-5">
                <h2 className="font-semibold text-neutral-800">클라이언트</h2>
                <p className="mt-1 text-xs text-neutral-500">담당자의 Ten:One ID 이메일로 연결합니다. 회차 방(/madleague/pt/…)에서 공지·Q&A·최종 제출물을 보고 답변·코멘트할 수 있습니다. 팀 이름과 제출물만 보이고 팀원 이름은 보이지 않습니다.</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                    {d.clients.length === 0 && <li className="text-xs text-neutral-400">연결된 클라이언트가 없습니다.</li>}
                    {d.clients.map(c => (
                        <li key={c.member_id} className="inline-flex items-center gap-1.5 rounded border border-neutral-200 px-2 py-1 text-sm">
                            {c.name}{c.email && <span className="text-xs text-neutral-400">{c.email}</span>}
                            <button disabled={busy} onClick={() => { if (confirm(`${c.name} 님의 클라이언트 연결을 끝낼까요?`)) act({ action: "remove_client", member_id: c.member_id }); }} className="text-neutral-400 hover:text-red-600" title="연결 해제"><X className="h-3.5 w-3.5" /></button>
                        </li>
                    ))}
                </ul>
                <div className="mt-3 flex gap-2">
                    <input value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="담당자 이메일" className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm" />
                    <button disabled={busy || !clientEmail.trim()} onClick={async () => { if (await act({ action: "add_client", email: clientEmail })) setClientEmail(""); }}
                        className="rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-300">연결</button>
                </div>
            </section>

            {/* 팀 */}
            <section className="space-y-4">
                <div className="flex flex-wrap items-end gap-2 rounded-lg border border-neutral-200 bg-white p-5">
                    <div className="w-full text-sm font-semibold text-neutral-800">팀 추가</div>
                    <input value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} placeholder="팀 이름" className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm" />
                    <select value={newTeam.club_id} onChange={e => setNewTeam({ ...newTeam, club_id: e.target.value })} className="w-48 rounded border border-neutral-300 px-3 py-2 text-sm">
                        <option value="">동아리 (선택)</option>
                        {d.clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button disabled={busy || !newTeam.name.trim()} onClick={async () => { if (await act({ action: "add_team", ...newTeam })) setNewTeam({ name: "", club_id: "" }); }}
                        className="inline-flex items-center gap-1 rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-300">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} 추가
                    </button>
                </div>

                {d.teams.length === 0 && <p className="text-sm text-neutral-400">팀이 없습니다.</p>}
                {d.teams.map(t => <TeamCard key={t.id} team={t} clubs={d.clubs} candidates={candidates} applicantIds={applicantIds} busy={busy} act={act} />)}
            </section>

            {d.competition.form_id && d.applicants.length === 0 && (
                <p className="text-xs text-neutral-400">연결한 신청 폼에 로그인 응답자가 없습니다. 비회원 응답은 팀에 배정할 수 없습니다 (Ten:One ID 가입 후 배정).</p>
            )}
        </div>
    );
}

function TeamCard({ team, clubs, candidates, applicantIds, busy, act }: {
    team: Team; clubs: { id: string; name: string }[]; candidates: Person[]; applicantIds: Set<string>; busy: boolean;
    act: (b: Record<string, unknown>) => Promise<boolean>;
}) {
    const [pick, setPick] = useState("");
    const [result, setResult] = useState({ rank: team.result?.rank?.toString() ?? "", award_name: team.result?.award_name ?? "", feedback: team.result?.feedback ?? "" });
    const club = clubs.find(c => c.id === team.club_id)?.name;

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-900">{team.name}</h3>
                {club && <span className="text-xs text-neutral-400">{club}</span>}
                <label className="ml-3 inline-flex items-center gap-1 text-xs text-neutral-600">
                    <input type="checkbox" checked={team.is_finalist} disabled={busy}
                        onChange={e => act({ action: "set_finalist", team_id: team.id, is_finalist: e.target.checked })} />
                    본선 진출
                </label>
                <button disabled={busy} onClick={() => { if (confirm(`'${team.name}' 팀을 삭제할까요? 팀원 배정·결과도 함께 지워집니다.`)) act({ action: "delete_team", team_id: team.id }); }}
                    className="ml-auto text-neutral-400 hover:text-red-600" title="팀 삭제"><Trash2 className="h-4 w-4" /></button>
            </div>

            <ul className="mt-3 flex flex-wrap gap-2">
                {team.members.length === 0 && <li className="text-xs text-neutral-400">팀원이 없습니다.</li>}
                {team.members.map(m => (
                    <li key={m.member_id} className="inline-flex items-center gap-1.5 rounded border border-neutral-200 px-2 py-1 text-sm">
                        {m.role === "leader" && <span className="rounded bg-neutral-900 px-1 text-[10px] text-white">팀장</span>}
                        {m.name}{m.club && <span className="text-xs text-neutral-400">{m.club}</span>}
                        <button disabled={busy} onClick={() => act({ action: "remove_member", team_id: team.id, member_id: m.member_id })} className="text-neutral-400 hover:text-red-600" title="배정 해제"><X className="h-3.5 w-3.5" /></button>
                    </li>
                ))}
            </ul>

            <div className="mt-3 flex flex-wrap gap-2">
                <select value={pick} onChange={e => setPick(e.target.value)} className="min-w-64 flex-1 rounded border border-neutral-300 px-3 py-1.5 text-sm">
                    <option value="">팀원 선택 — 신청자 먼저, 그다음 현역·임원</option>
                    {candidates.map(p => (
                        <option key={p.member_id} value={p.member_id}>{applicantIds.has(p.member_id) ? "[신청] " : ""}{p.name}{p.club ? ` · ${p.club}` : ""}{p.email ? ` · ${p.email}` : ""}</option>
                    ))}
                </select>
                <button disabled={busy || !pick} onClick={async () => { if (await act({ action: "add_member", team_id: team.id, member_id: pick, role: "member" })) setPick(""); }} className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:text-neutral-300">팀원으로</button>
                <button disabled={busy || !pick} onClick={async () => { if (await act({ action: "add_member", team_id: team.id, member_id: pick, role: "leader" })) setPick(""); }} className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:text-neutral-300">팀장으로</button>
            </div>

            <SubmissionLine teamId={team.id} stage="prelim" s={team.submissions.find(x => x.stage === "prelim")} />
            {team.is_finalist && <SubmissionLine teamId={team.id} stage="final" s={team.submissions.find(x => x.stage === "final")} />}

            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-neutral-100 pt-4 sm:grid-cols-[6rem_1fr_2fr_auto]">
                <input value={result.rank} onChange={e => setResult({ ...result, rank: e.target.value.replace(/\D/g, "").slice(0, 2) })} placeholder="순위" className="rounded border border-neutral-300 px-3 py-1.5 text-sm" />
                <input value={result.award_name} onChange={e => setResult({ ...result, award_name: e.target.value })} placeholder="상 이름 (선택)" className="rounded border border-neutral-300 px-3 py-1.5 text-sm" />
                <input value={result.feedback} onChange={e => setResult({ ...result, feedback: e.target.value })} placeholder="심사 코멘트 (선택)" className="rounded border border-neutral-300 px-3 py-1.5 text-sm" />
                <button disabled={busy} onClick={() => act({ action: "set_result", team_id: team.id, ...result })} className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white disabled:bg-neutral-300">결과 저장</button>
            </div>
        </div>
    );
}

/** 팀 제출물 — 최종 제출 여부·파일 내려받기(서명 URL 5분)·발표자료 링크 */
function SubmissionLine({ teamId, stage, s }: { teamId: string; stage: "prelim" | "final"; s?: Submission }) {
    const [loading, setLoading] = useState(false);
    const download = async () => {
        setLoading(true);
        const res = await fetch(`/api/madleague/pt/submission?team_id=${teamId}&stage=${stage}`);
        const data = await res.json();
        setLoading(false);
        if (data.download_url) window.location.href = data.download_url;
        else alert(data.error ?? "파일이 없습니다.");
    };
    return (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4 text-sm">
            <span className="text-xs text-neutral-500">{stage === "final" ? "본선 제출" : "예선 제출"}</span>
            {!s ? <span className="text-neutral-400">없음</span> : (
                <>
                    <span className={`rounded px-2 py-0.5 text-xs ${s.status === "submitted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {s.status === "submitted" ? `최종 제출 ${s.submitted_at ? new Date(s.submitted_at).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}` : "임시 저장"}
                    </span>
                    <span className="text-neutral-800">{s.title}</span>
                    {s.file_name && (
                        <button onClick={download} disabled={loading} className="text-xs text-neutral-500 underline hover:text-neutral-900">
                            {loading ? "준비 중…" : `파일 ${s.file_name}`}
                        </button>
                    )}
                    {s.presentation_url && <a href={s.presentation_url} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-500 underline hover:text-neutral-900">발표자료 링크</a>}
                </>
            )}
        </div>
    );
}
