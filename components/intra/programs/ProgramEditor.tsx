"use client";

/**
 * 인트라 프로그램 회차 편집 (코어) — 정보 · 창구 · 참가 신청 폼 연결 · 팀 구성·배정 · 본선 진출 · 제출물 · 결과 · 클라이언트
 * 참가자 = members.id. 배정 후보 = 연결 폼의 로그인 응답자 + 브랜드 후보 (MADLeague = 현역·임원 매드리거)
 * 브랜드 화면(/intra/ums/{brand}/…)과 통합 관리(/intra/ums/programs/…)가 같은 편집기를 쓴다
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Plus, Trash2, X } from "lucide-react";
import { PROGRAM_KIND_LABEL, PROGRAM_STATUS_LABEL, programRoomPath, PROGRAM_ROOM_BASE } from "@/lib/programs/paths";
import { brandSiteUrl } from "@/lib/domain-registry";
import { createClient } from "@/lib/supabase/client";

interface Person { member_id: string; name: string; email: string | null; club: string | null }
interface Team {
    id: string; name: string; group_id: string | null; is_finalist: boolean;
    members: (Person & { role: string })[];
    result: { rank: number | null; award_name: string | null; feedback: string | null } | null;
    submissions: Submission[];
}
interface Submission { stage: "prelim" | "final"; title: string; status: string; file_name: string | null; presentation_url: string | null; submitted_at: string | null; updated_at: string }
interface Detail {
    round: Record<string, string | number | null> & { channels: string[] };
    groupLabel: string | null;
    groups: { id: string; name: string }[];
    forms: { id: string; title: string; status: string }[];
    sites: { slug: string; name: string }[];
    teams: Team[];
    applicants: (Person & { response_id: string; response_status: string })[];
    candidates: Person[];
    clients: Person[];
    unassigned: Person[];
    applications: (Person & { id: string; channel: string | null; motivation: string; portfolio_url: string | null; status: string; created_at: string })[];
}

const APP_STATUS: Record<string, string> = { pending: "심사 대기", accepted: "선발", declined: "미선발" };

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

export function ProgramEditor({ id, basePath }: { id: string; basePath: string }) {
    const [d, setD] = useState<Detail | null>(null);
    const [info, setInfo] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: "", group_id: "" });
    const [channels, setChannels] = useState<string[]>([]);
    const api = `/api/intra/programs/rounds/${id}`;
    const [clientEmail, setClientEmail] = useState("");

    const load = useCallback(async () => {
        const res = await fetch(api);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "불러오지 못했습니다."); return; }
        setD(data);
        const c = data.round;
        setInfo(Object.fromEntries(["title", "year", "kind", "mode", "client_name", "client_logo_url", "brief_title", "brief_content", "start_date", "end_date", "final_deadline", "presentation_date", "status", "form_id"].map(k => [k, c[k] == null ? "" : String(c[k])])));
        setChannels(c.channels ?? []);
    }, [api]);
    useEffect(() => { load(); }, [load]);

    const act = async (body: Record<string, unknown>) => {
        setBusy(true); setError("");
        const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) { setError(data.error ?? "처리하지 못했습니다."); return false; }
        await load();
        return true;
    };

    const saveInfo = async () => {
        setBusy(true); setError(""); setSaved(false);
        const res = await fetch(api, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...info, channels }) });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) { setError(data.error ?? "저장하지 못했습니다."); return; }
        setSaved(true);
        await load();
    };

    if (!d) return <p className="text-sm text-neutral-400">{error || "불러오는 중…"}</p>;

    const assigned = new Set(d.teams.flatMap(t => t.members.map(m => m.member_id)));
    const applicantIds = new Set(d.applicants.map(a => a.member_id));
    const candidates: Person[] = [...d.applicants, ...d.candidates.filter(m => !applicantIds.has(m.member_id))].filter(p => !assigned.has(p.member_id));
    const r = d.round;
    const brand = String(r.brand_id);
    const roomSite = PROGRAM_ROOM_BASE[brand] ? brand : (r.channels ?? []).find(c => PROGRAM_ROOM_BASE[c]);
    const hall = brand === "madleague" && r.kind === "competition";

    return (
        <div className="space-y-8">
            <div>
                <Link href={basePath} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"><ChevronLeft className="h-4 w-4" /> 회차 목록</Link>
                <h1 className="mt-2 text-2xl font-bold text-neutral-900">{String(r.title)}</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    운영 {d.sites.find(s => s.slug === brand)?.name ?? brand} · {PROGRAM_KIND_LABEL[String(r.kind)] ?? r.kind} · {PROGRAM_STATUS_LABEL[String(r.status)]} · 팀 {d.teams.length} · 배정 {assigned.size}명
                </p>
                {roomSite && (
                    <a href={brandSiteUrl(roomSite, programRoomPath({ id, brand_id: brand, channels: r.channels }))} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-red-600 hover:underline">회차 방 열기 — 공지·Q&A·제출물 ↗</a>
                )}
                <PublishBar published={r.results_published_at ? String(r.results_published_at) : null}
                    hall={hall} busy={busy} onToggle={on => {
                        const msg = on
                            ? (hall ? "결과를 발표할까요? 명예의 전당·포트폴리오에 바로 반영되고 참여 팀·클라이언트에게 알림이 갑니다." : "결과를 발표할까요? 참여자 활동 이력에 반영되고 알림이 갑니다.")
                            : "발표를 취소할까요? 공개 화면에서 결과가 내려갑니다.";
                        if (confirm(msg)) act({ action: "publish_results", on });
                    }} />
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
                            {Object.entries(PROGRAM_KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </label>
                    <label>
                        <div className="mb-1 text-xs text-neutral-500">상태</div>
                        <select value={info.status} onChange={e => setInfo({ ...info, status: e.target.value })} className={inputCls}>
                            {Object.entries(PROGRAM_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </label>
                    <label>
                        <div className="mb-1 text-xs text-neutral-500">참가 방식</div>
                        <select value={info.mode} onChange={e => setInfo({ ...info, mode: e.target.value })} className={inputCls}>
                            <option value="team">팀</option>
                            <option value="individual">개인</option>
                        </select>
                    </label>
                    <div className="sm:col-span-3">
                        <div className="mb-1 text-xs text-neutral-500">창구 — 이 회차가 보이는 사이트 (데이터 주인은 {d.sites.find(s => s.slug === brand)?.name ?? brand})</div>
                        <div className="flex flex-wrap gap-3">
                            {d.sites.filter(s => s.slug === brand || PROGRAM_ROOM_BASE[s.slug] || channels.includes(s.slug) || ["hero", "rook", "planners", "madleague"].includes(s.slug)).map(s => (
                                <label key={s.slug} className="inline-flex items-center gap-1.5 text-sm text-neutral-700">
                                    <input type="checkbox" checked={channels.includes(s.slug)} disabled={s.slug === brand}
                                        onChange={e => setChannels(e.target.checked ? [...channels, s.slug] : channels.filter(c => c !== s.slug))} />
                                    {s.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    <label className="sm:col-span-3">
                        <div className="mb-1 text-xs text-neutral-500">참가 신청 폼 (응답자를 팀 배정 후보로)</div>
                        <select value={info.form_id} onChange={e => setInfo({ ...info, form_id: e.target.value })} className={inputCls}>
                            <option value="">연결 안 함</option>
                            {d.forms.map(f => <option key={f.id} value={f.id}>{f.title}{f.status === "draft" ? " (준비 중)" : ""}</option>)}
                        </select>
                    </label>
                    <LogoField url={info.client_logo_url} busy={busy} compId={id} onUploaded={async u => {
                        setInfo(i => ({ ...i, client_logo_url: u }));
                        await fetch(api, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_logo_url: u }) });
                    }} />
                    <label className="sm:col-span-3">
                        <div className="mb-1 text-xs text-neutral-500">브리프 내용 (팀원에게 보이는 과제 설명)</div>
                        <textarea rows={4} value={info.brief_content ?? ""} onChange={e => setInfo({ ...info, brief_content: e.target.value })} className={inputCls} />
                    </label>
                </div>
            </section>

            {/* 참가 신청 (4단계) — 사이트·창구에서 신청 → 선발 → 참가자(팀 회차면 아래에서 팀 배정) */}
            <section className="rounded-lg border border-neutral-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-semibold text-neutral-800">참가 신청</h2>
                    <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                        <input type="checkbox" checked={!!r.applications_open} disabled={busy}
                            onChange={async e => {
                                await fetch(api, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applications_open: e.target.checked }) });
                                await load();
                            }} />
                        사이트에서 신청 받기 (모집 예정·진행 중일 때)
                    </label>
                    <span className="text-xs text-neutral-400">창구로 지정한 사이트 모두에 신청 버튼이 보입니다. 동의는 운영 브랜드 기준.</span>
                </div>
                {d.applications.length === 0 ? (
                    <p className="mt-3 text-xs text-neutral-400">신청이 없습니다.</p>
                ) : (
                    <ul className="mt-3 divide-y divide-neutral-100">
                        {d.applications.map(a => (
                            <li key={a.id} className="py-3 text-sm">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-neutral-900">{a.name}</span>
                                    {a.email && <span className="text-xs text-neutral-400">{a.email}</span>}
                                    {a.channel && a.channel !== brand && <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">창구 {d.sites.find(s => s.slug === a.channel)?.name ?? a.channel}</span>}
                                    <span className="text-xs text-neutral-400">{new Date(a.created_at).toLocaleDateString("ko-KR")}</span>
                                    <span className={`ml-auto rounded px-2 py-0.5 text-xs ${a.status === "accepted" ? "bg-emerald-50 text-emerald-700" : a.status === "declined" ? "bg-neutral-100 text-neutral-500" : "bg-amber-50 text-amber-700"}`}>{APP_STATUS[a.status] ?? a.status}</span>
                                    {a.status === "pending" && (
                                        <>
                                            <button disabled={busy} onClick={() => act({ action: "accept_application", application_id: a.id })} className="rounded bg-neutral-900 px-3 py-1 text-xs text-white">선발</button>
                                            <button disabled={busy} onClick={() => { if (confirm(`${a.name} 님을 미선발 처리할까요? 본인에게 안내 알림이 갑니다.`)) act({ action: "decline_application", application_id: a.id }); }} className="rounded border border-neutral-300 px-3 py-1 text-xs">미선발</button>
                                        </>
                                    )}
                                </div>
                                <p className="mt-1 whitespace-pre-line text-neutral-600">{a.motivation}</p>
                                {a.portfolio_url && <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-blue-600 underline">포트폴리오</a>}
                            </li>
                        ))}
                    </ul>
                )}
                {d.unassigned.length > 0 && r.mode === "team" && (
                    <p className="mt-3 text-xs text-amber-700">팀 미배정 참가자 {d.unassigned.length}명 — {d.unassigned.map(u => u.name).join(", ")} · 아래 팀 카드의 팀원 선택 목록 맨 앞에 있습니다.</p>
                )}
            </section>

            {/* 클라이언트 — 회차 방에서 공지·Q&A·제출물 확인, 답변·코멘트 (팀원 이름은 보이지 않음) */}
            <section className="rounded-lg border border-neutral-200 bg-white p-5">
                <h2 className="font-semibold text-neutral-800">클라이언트</h2>
                <p className="mt-1 text-xs text-neutral-500">담당자의 Ten:One ID 이메일로 연결합니다. 회차 방에서 공지·Q&A·최종 제출물을 보고 답변·코멘트할 수 있습니다. 팀 이름과 제출물만 보이고 참가자 이름은 보이지 않습니다.</p>
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
                    {d.groups.length > 0 && (
                        <select value={newTeam.group_id} onChange={e => setNewTeam({ ...newTeam, group_id: e.target.value })} className="w-48 rounded border border-neutral-300 px-3 py-2 text-sm">
                            <option value="">{d.groupLabel ?? "소속"} (선택)</option>
                            {d.groups.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <button disabled={busy || !newTeam.name.trim()} onClick={async () => { if (await act({ action: "add_team", ...newTeam })) setNewTeam({ name: "", group_id: "" }); }}
                        className="inline-flex items-center gap-1 rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-300">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} 추가
                    </button>
                </div>

                {d.teams.length === 0 && <p className="text-sm text-neutral-400">팀이 없습니다.</p>}
                {d.teams.map(t => <TeamCard key={t.id} team={t} clubs={d.groups} candidates={candidates} applicantIds={applicantIds} busy={busy} act={act} />)}
            </section>

            {r.form_id && d.applicants.length === 0 && (
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
    const club = clubs.find(c => c.id === team.group_id)?.name;

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
                    <option value="">팀원 선택 — 신청자 먼저, 그다음 브랜드 회원</option>
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
        const res = await fetch(`/api/programs/submission?team_id=${teamId}&stage=${stage}`);
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

/** 결과 발표 — 발표 전 결과는 직원만 본다 (명예의 전당·포트폴리오·워크스페이스 비노출) */
function PublishBar({ published, hall, busy, onToggle }: { published: string | null; hall: boolean; busy: boolean; onToggle: (on: boolean) => void }) {
    return (
        <div className={`mt-3 flex flex-wrap items-center gap-3 rounded border px-4 py-3 text-sm ${published ? "border-emerald-200 bg-emerald-50" : "border-neutral-200 bg-neutral-50"}`}>
            {published ? (
                <>
                    <span className="font-semibold text-emerald-700">결과 발표됨 · {new Date(published).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-xs text-emerald-700/70">{hall ? "명예의 전당·포트폴리오에 반영 중" : "활동 이력에 반영 중"}</span>
                    <button disabled={busy} onClick={() => onToggle(false)} className="ml-auto text-xs text-neutral-500 underline hover:text-red-600">발표 취소</button>
                </>
            ) : (
                <>
                    <span className="text-neutral-600">결과 미발표 — 순위·상은 직원만 봅니다.</span>
                    <button disabled={busy} onClick={() => onToggle(true)} className="ml-auto rounded bg-neutral-900 px-4 py-1.5 text-sm font-semibold text-white disabled:bg-neutral-300">결과 발표</button>
                </>
            )}
        </div>
    );
}

/** 클라이언트 로고 — 공개 화면(명예의 전당 등)에 표시 (공개 버킷) */
function LogoField({ url, busy, compId, onUploaded }: { url: string; busy: boolean; compId: string; onUploaded: (u: string) => Promise<void> }) {
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState("");
    const upload = async (f: File) => {
        setUploading(true); setErr("");
        try {
            const res = await fetch(`/api/intra/programs/rounds/${compId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logo_upload", name: f.name }) });
            const prep = await res.json();
            if (!res.ok) throw new Error(prep.error ?? "업로드 준비 실패");
            const { error } = await createClient().storage.from(prep.bucket).uploadToSignedUrl(prep.path, prep.token, f, { contentType: f.type });
            if (error) throw new Error("업로드 실패");
            await onUploaded(prep.publicUrl);
        } catch (e) { setErr(e instanceof Error ? e.message : "업로드 실패"); }
        finally { setUploading(false); }
    };
    return (
        <div className="sm:col-span-3">
            <div className="mb-1 text-xs text-neutral-500">클라이언트 로고 (공개 화면 표시, 없으면 클라이언트 이름)</div>
            <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {url && <img src={url} alt="" className="h-10 max-w-40 rounded border border-neutral-200 bg-neutral-900 object-contain p-1" />}
                <label className="cursor-pointer rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">
                    {uploading ? "올리는 중…" : url ? "로고 교체" : "로고 올리기"}
                    <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" className="hidden" disabled={busy || uploading} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
                </label>
                {err && <span className="text-xs text-red-600">{err}</span>}
            </div>
        </div>
    );
}
