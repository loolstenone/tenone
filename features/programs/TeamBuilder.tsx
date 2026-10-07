"use client";

/**
 * 사이트 팀 구성 (코어 프로그램 모듈 2단계)
 *   운영(직원·동아리 운영진): 그 해 활동 회원을 끌어다 팀에 놓기 (모바일: 이름 누르고 → 팀의 "여기로")
 *   팀장: 팀 이름·소개 수정, 초대 링크 발급 / 팀원: 우리 팀 보기
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown, Link2, Loader2, Plus, Trash2, UserMinus, Users, X } from "lucide-react";
import { ProgramConsent } from "@/features/programs/ProgramConsent";

interface Member { member_id: string; name: string; role: string }
interface Team {
    id: string; name: string; description: string | null; is_finalist: boolean; group_id: string | null;
    canRun: boolean; canEdit: boolean; invite_path: string | null; members: Member[];
}
interface Board {
    round: { id: string; title: string; status: string; mode: string; year: number; brand_id: string };
    me: { isStaff: boolean; runner: boolean; myTeamId: string | null; myRole: string | null; open: boolean; consent: boolean };
    groupLabel: string;
    groups: { id: string; name: string }[];
    teams: Team[];
    unassigned: { member_id: string; group_id: string | null; name: string }[];
}

const POOL = "__pool__";

export function TeamBuilder({ roundId, brandName }: { roundId: string; brandName: string }) {
    const api = `/api/programs/rounds/${roundId}/teams`;
    const [b, setB] = useState<Board | null>(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [group, setGroup] = useState<string>("");
    const [picked, setPicked] = useState<string | null>(null);
    const [over, setOver] = useState<string | null>(null);
    const [newName, setNewName] = useState("");

    const load = useCallback(async () => {
        const res = await fetch(api);
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError(d.error ?? "불러오지 못했습니다."); return; }
        setB(d);
        setGroup(g => g || d.groups[0]?.id || "");
    }, [api]);
    useEffect(() => { load(); }, [load]);

    const act = async (body: Record<string, unknown>) => {
        setBusy(true); setError("");
        const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const d = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) { setError(d.error ?? "처리하지 못했습니다."); return null; }
        await load();
        return d;
    };

    const move = (memberId: string, target: string) => {
        setPicked(null); setOver(null);
        act({ action: "assign", member_id: memberId, team_id: target === POOL ? null : target });
    };

    const runnerTeams = useMemo(() => (b?.teams ?? []).filter(t => t.canRun && (!b?.groups.length || !group || t.group_id === group || (!t.group_id && b?.me.isStaff))), [b, group]);
    const pool = useMemo(() => (b?.unassigned ?? []).filter(u => !group || u.group_id === group), [b, group]);

    if (error && !b) return <p className="py-10 text-sm text-red-400">{error}</p>;
    if (!b) return <p className="py-10 text-sm text-neutral-500">불러오는 중…</p>;
    if (!b.me.consent) return <div className="py-8"><ProgramConsent brand={b.round.brand_id} brandName={brandName} onAgreed={load} /></div>;
    if (b.round.mode !== "team") return <p className="py-10 text-sm text-neutral-500">개인 참가 회차라 팀 구성이 없습니다.</p>;

    const myTeam = b.teams.find(t => t.id === b.me.myTeamId) ?? null;
    const dropProps = (target: string) => ({
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOver(target); },
        onDragLeave: () => setOver(o => (o === target ? null : o)),
        onDrop: (e: React.DragEvent) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, target); },
    });
    const chip = (m: { member_id: string; name: string }, draggable: boolean, extra?: React.ReactNode) => (
        <span key={m.member_id}
            draggable={draggable && !busy}
            onDragStart={e => e.dataTransfer.setData("text/plain", m.member_id)}
            onClick={() => draggable && setPicked(p => (p === m.member_id ? null : m.member_id))}
            className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-sm ${draggable ? "cursor-grab active:cursor-grabbing" : ""} ${picked === m.member_id ? "border-[#EC1D25] bg-[#EC1D25]/15" : "border-neutral-800 bg-neutral-900"}`}>
            {m.name}{extra}
        </span>
    );

    return (
        <div className="space-y-8 py-6 text-white">
            {error && <p className="border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-300">{error}</p>}
            {!b.me.open && <p className="text-sm text-neutral-500">모집 예정·진행 중인 회차에서만 팀을 바꿀 수 있습니다.</p>}

            {/* 내 팀 (팀원·팀장) */}
            {myTeam && !myTeam.canRun && (
                <section>
                    <div className="mb-3 text-xs font-bold tracking-widest text-[#EC1D25]">MY TEAM</div>
                    <TeamCard team={myTeam} busy={busy} act={act} chip={chip} />
                </section>
            )}

            {/* 운영 보드 */}
            {b.me.runner && (
                <section className="space-y-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <div className="text-xs font-bold tracking-widest text-[#EC1D25]">TEAM BUILDING</div>
                            <p className="mt-1 text-sm text-neutral-500">
                                {b.round.year}년 활동 회원을 팀으로 끌어다 놓으세요. 휴대폰에서는 이름을 누른 뒤 팀의 &quot;여기로&quot;를 누릅니다.
                                가입하지 않은 인원은 팀 초대 링크로 가입 후 합류합니다.
                            </p>
                        </div>
                        {b.groups.length > 1 && (
                            <select value={group} onChange={e => setGroup(e.target.value)} className="border border-neutral-700 bg-black px-3 py-2 text-sm">
                                {b.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        )}
                    </div>

                    <div {...dropProps(POOL)}
                        className={`border border-dashed p-4 ${over === POOL ? "border-[#EC1D25] bg-[#EC1D25]/5" : "border-neutral-800"}`}>
                        <div className="mb-3 flex items-center justify-between text-xs font-bold text-neutral-400">
                            <span>미배정 · {b.groups.find(g => g.id === group)?.name ?? ""} {pool.length}명</span>
                            {picked && b.teams.some(t => t.members.some(m => m.member_id === picked)) && (
                                <button onClick={() => move(picked, POOL)} className="text-[#EC1D25]">여기로 (배정 해제)</button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {pool.length ? pool.map(u => chip(u, b.me.open)) : <span className="text-sm text-neutral-600">배정할 회원이 없습니다.</span>}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {runnerTeams.map(t => (
                            <div key={t.id} {...dropProps(t.id)} className={over === t.id ? "outline outline-1 outline-[#EC1D25]" : ""}>
                                <TeamCard team={t} busy={busy} act={act} chip={chip}
                                    onHere={picked && !t.members.some(m => m.member_id === picked) ? () => move(picked, t.id) : undefined} />
                            </div>
                        ))}
                    </div>

                    {b.me.open && (b.me.isStaff || group) && (
                        <div className="flex gap-2">
                            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="새 팀 이름" maxLength={60}
                                className="flex-1 border border-neutral-700 bg-black px-3 py-2 text-sm" />
                            <button disabled={busy || !newName.trim()}
                                onClick={async () => { if (await act({ action: "create_team", name: newName, group_id: group })) setNewName(""); }}
                                className="inline-flex items-center gap-1 bg-[#EC1D25] px-4 py-2 text-sm font-bold disabled:opacity-40">
                                <Plus className="h-4 w-4" /> 팀 만들기
                            </button>
                        </div>
                    )}
                </section>
            )}

            {!myTeam && !b.me.runner && <p className="text-sm text-neutral-500">아직 소속 팀이 없습니다.</p>}
        </div>
    );
}

function TeamCard({ team, busy, act, chip, onHere }: {
    team: Team; busy: boolean;
    act: (b: Record<string, unknown>) => Promise<unknown>;
    chip: (m: { member_id: string; name: string }, draggable: boolean, extra?: React.ReactNode) => React.ReactNode;
    onHere?: () => void;
}) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(team.name);
    const [desc, setDesc] = useState(team.description ?? "");
    const [copied, setCopied] = useState(false);
    const inviteUrl = team.invite_path && typeof window !== "undefined" ? `${window.location.origin}${team.invite_path}` : null;

    return (
        <div className="space-y-4 border border-neutral-800 bg-neutral-950 p-5">
            <div className="flex items-start justify-between gap-3">
                {editing ? (
                    <div className="flex-1 space-y-2">
                        <input value={name} onChange={e => setName(e.target.value)} maxLength={60} className="w-full border border-neutral-700 bg-black px-3 py-2 text-sm font-bold" />
                        <textarea value={desc} onChange={e => setDesc(e.target.value)} maxLength={300} rows={2} placeholder="팀 소개 (선택)" className="w-full border border-neutral-700 bg-black px-3 py-2 text-sm" />
                        <div className="flex gap-2">
                            <button disabled={busy || !name.trim()} onClick={async () => { if (await act({ action: "rename", team_id: team.id, name, description: desc })) setEditing(false); }}
                                className="bg-[#EC1D25] px-3 py-1.5 text-xs font-bold disabled:opacity-40">저장</button>
                            <button onClick={() => { setEditing(false); setName(team.name); setDesc(team.description ?? ""); }} className="border border-neutral-700 px-3 py-1.5 text-xs">취소</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black">{team.name}</h3>
                            {team.is_finalist && <span className="bg-[#FFC000]/15 px-2 py-0.5 text-[10px] font-bold text-[#FFC000]">본선 진출</span>}
                        </div>
                        {team.description && <p className="mt-1 text-sm text-neutral-500">{team.description}</p>}
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-600"><Users className="h-3.5 w-3.5" /> {team.members.length}명</p>
                    </div>
                )}
                <div className="flex shrink-0 items-center gap-2">
                    {onHere && <button onClick={onHere} className="bg-[#EC1D25] px-3 py-1.5 text-xs font-bold">여기로</button>}
                    {team.canEdit && !editing && <button onClick={() => setEditing(true)} className="border border-neutral-700 px-3 py-1.5 text-xs">수정</button>}
                    {team.canRun && team.members.length === 0 && (
                        <button disabled={busy} onClick={() => { if (confirm(`${team.name} 팀을 지울까요?`)) act({ action: "delete_team", team_id: team.id }); }} aria-label="팀 삭제" className="text-neutral-600 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex min-h-10 flex-wrap gap-2">
                {team.members.length === 0 && <span className="text-sm text-neutral-600">{team.canRun ? "회원을 끌어다 놓으세요" : "팀원이 없습니다"}</span>}
                {team.members.map(m => chip(m, team.canRun, (
                    <>
                        {m.role === "leader" && <Crown className="h-3.5 w-3.5 text-[#FFC000]" aria-label="팀장" />}
                        {team.canRun && m.role !== "leader" && (
                            <button onClick={e => { e.stopPropagation(); act({ action: "set_leader", team_id: team.id, member_id: m.member_id }); }} disabled={busy}
                                title="팀장으로" className="text-neutral-600 hover:text-[#FFC000]"><Crown className="h-3.5 w-3.5" /></button>
                        )}
                        {team.canRun && (
                            <button onClick={e => { e.stopPropagation(); act({ action: "assign", member_id: m.member_id, team_id: null }); }} disabled={busy}
                                title="팀에서 빼기" className="text-neutral-600 hover:text-red-400"><UserMinus className="h-3.5 w-3.5" /></button>
                        )}
                    </>
                )))}
            </div>

            {team.canEdit && (
                <div className="border-t border-neutral-900 pt-3 text-xs">
                    {inviteUrl ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Link2 className="h-3.5 w-3.5 shrink-0 text-[#EC1D25]" />
                                <code className="min-w-0 flex-1 truncate text-neutral-400">{inviteUrl}</code>
                                <button onClick={async () => { await navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                                    className="border border-neutral-700 px-2.5 py-1">{copied ? "복사됨" : "복사"}</button>
                            </div>
                            <div className="flex gap-3 text-neutral-500">
                                <button disabled={busy} onClick={() => act({ action: "invite", team_id: team.id, on: true })} className="hover:text-white">새 링크로 바꾸기</button>
                                <button disabled={busy} onClick={() => act({ action: "invite", team_id: team.id, on: false })} className="inline-flex items-center gap-1 hover:text-white"><X className="h-3 w-3" /> 링크 끄기</button>
                            </div>
                            <p className="text-neutral-600">링크를 받은 사람은 Ten:One ID로 가입·로그인 후 참가 동의를 하면 이 팀에 들어옵니다.</p>
                        </div>
                    ) : (
                        <button disabled={busy} onClick={() => act({ action: "invite", team_id: team.id, on: true })}
                            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white">
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />} 팀 초대 링크 만들기
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
