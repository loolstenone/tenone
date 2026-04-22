"use client";

/**
 * HeRo 매칭 관리 (Intra)
 * - hero_matches 목록 + 진행 상태 관리
 * - TIH 선택 → 후보 인재 자동 계산 (hero_match_candidates_for_tih RPC)
 * - 매칭 로직 v1은 1차 공간 축소 + 2차 블랙 플래그 교차만
 *   3차 AI 큐레이션은 Phase 4-6
 *
 * 상태 lifecycle:
 *   proposed → curated → contacted → interviewing → trial → hired
 *                                                           → declined
 *                                                           → withdrawn
 */

const STATUS_LABEL: Record<string, string> = {
    proposed: "제안",
    curated: "큐레이션",
    contacted: "연락",
    interviewing: "면접",
    trial: "트라이얼",
    hired: "입사",
    declined: "거절",
    withdrawn: "철회",
};

const STATUS_COLOR: Record<string, string> = {
    proposed: "bg-neutral-100 text-neutral-600",
    curated: "bg-blue-50 text-blue-700",
    contacted: "bg-indigo-50 text-indigo-700",
    interviewing: "bg-violet-50 text-violet-700",
    trial: "bg-amber-50 text-amber-700",
    hired: "bg-emerald-50 text-emerald-700",
    declined: "bg-rose-50 text-rose-700",
    withdrawn: "bg-neutral-50 text-neutral-400",
};

const NEXT_STATUS: Record<string, string[]> = {
    proposed: ["curated", "contacted", "withdrawn"],
    curated: ["contacted", "withdrawn"],
    contacted: ["interviewing", "declined", "withdrawn"],
    interviewing: ["trial", "hired", "declined", "withdrawn"],
    trial: ["hired", "declined"],
    hired: [],
    declined: [],
    withdrawn: [],
};

import { useEffect, useState } from "react";
import { Network, Users, Building2, Loader2, Search, AlertTriangle, Handshake, Sparkles, Eye } from "lucide-react";
import { PageHeader, StatCard } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface TIHRow {
    id: string;
    company: string;
    contact_name: string;
    status: string;
    derived_industry: string | null;
    derived_job_function: string | null;
    derived_guardian: number | null;
    derived_pioneer: number | null;
    derived_connector: number | null;
    derived_risk_flags: Record<string, unknown>[];
    created_at: string;
}

interface Candidate {
    member_id: string;
    jh_id: string;
    hit_a_result_id: string | null;
    hit_b_result_id: string | null;
    score_industry: number;
    score_job_function: number;
    score_axis_distance: number;
    score_total: number;
    risk_match: Record<string, unknown>;
}

interface MatchRow {
    id: string;
    profile_member_id: string;
    company_id: string;
    match_status: string;
    match_type: string;
    ai_match_report: string | null;
    created_at: string;
    hero_companies: { company_name: string } | null;
}

interface Curation {
    for_company?: string;
    for_talent?: string;
    signal_notes?: string[];
}

export default function HeroMatchingPage() {
    const [tihs, setTihs] = useState<TIHRow[]>([]);
    const [matches, setMatches] = useState<MatchRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTih, setSelectedTih] = useState<TIHRow | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [searchingCandidates, setSearchingCandidates] = useState(false);
    const [confirming, setConfirming] = useState<string | null>(null);
    const [transitioning, setTransitioning] = useState<string | null>(null);
    const [curating, setCurating] = useState<string | null>(null);
    const [curationView, setCurationView] = useState<{ id: string; data: Curation } | null>(null);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const sb = createClient();
        const [tihRes, matchesRes] = await Promise.all([
            sb.from("hero_tih_responses").select("*").order("created_at", { ascending: false }).limit(100),
            sb.from("hero_matches").select("id, profile_member_id, company_id, match_status, match_type, created_at, hero_companies(company_name)").order("created_at", { ascending: false }).limit(50),
        ]);
        setTihs((tihRes.data ?? []) as unknown as TIHRow[]);
        setMatches((matchesRes.data ?? []) as unknown as MatchRow[]);
        setLoading(false);
    }

    async function findCandidates(tih: TIHRow) {
        setSelectedTih(tih);
        setSearchingCandidates(true);
        setCandidates([]);
        const sb = createClient();
        const { data } = await sb.rpc("hero_match_candidates_for_tih", { _tih_id: tih.id });
        setCandidates((data ?? []) as Candidate[]);
        setSearchingCandidates(false);
    }

    async function proposeMatch(candidate: Candidate) {
        if (!selectedTih) return;
        setConfirming(candidate.jh_id);
        try {
            const res = await fetch("/api/hero/matching", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tihResponseId: selectedTih.id,
                    memberId: candidate.member_id,
                    jhResponseId: candidate.jh_id,
                    scoreBreakdown: {
                        industry: candidate.score_industry,
                        job_function: candidate.score_job_function,
                        axis_distance: candidate.score_axis_distance,
                        total: candidate.score_total,
                    },
                    riskNotes: candidate.risk_match ? [candidate.risk_match] : [],
                    matchType: "tetrad_v1",
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
            alert(data.message || `매칭 제안 완료 (status: ${data.status})`);
            await load();
        } catch (e) {
            alert(e instanceof Error ? e.message : "매칭 제안 실패");
        } finally {
            setConfirming(null);
        }
    }

    async function generateCuration(matchId: string) {
        setCurating(matchId);
        try {
            const res = await fetch(`/api/hero/matching/${matchId}/curate`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `오류 ${res.status}`);
            setCurationView({ id: matchId, data: data.curation });
            await load();
        } catch (e) {
            alert(e instanceof Error ? e.message : "큐레이션 생성 실패");
        } finally {
            setCurating(null);
        }
    }

    function viewCuration(match: MatchRow) {
        if (!match.ai_match_report) return;
        try {
            const parsed = JSON.parse(match.ai_match_report);
            setCurationView({ id: match.id, data: parsed });
        } catch {
            setCurationView({ id: match.id, data: { for_company: match.ai_match_report } });
        }
    }

    async function updateStatus(id: string, nextStatus: string) {
        setTransitioning(id);
        try {
            const res = await fetch(`/api/hero/matching/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || `오류 ${res.status}`); }
            await load();
        } catch (e) {
            alert(e instanceof Error ? e.message : "상태 변경 실패");
        } finally {
            setTransitioning(null);
        }
    }

    const stats = {
        tihs: tihs.length,
        tihsPending: tihs.filter(t => t.status === "pending").length,
        matches: matches.length,
        matchesActive: matches.filter(m => ["contacted", "interviewing", "trial"].includes(m.match_status)).length,
    };

    return (
        <div>
            <PageHeader title="매칭 관리" description="Tetrad Engine v1 · 1차 공간 축소 + 2차 블랙 플래그 교차" />

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="TIH 전체" value={stats.tihs + "건"} sub="풀 전체" icon={<Building2 className="h-4 w-4" />} />
                        <StatCard label="TIH 대기" value={stats.tihsPending + "건"} sub="매칭 진행 대상" icon={<Search className="h-4 w-4" />} />
                        <StatCard label="매칭 전체" value={stats.matches + "건"} sub="누적" icon={<Network className="h-4 w-4" />} />
                        <StatCard label="활성 매칭" value={stats.matchesActive + "건"} sub="진행 중 (contacted/interviewing/trial)" icon={<Users className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* TIH 목록 */}
                        <div className={selectedTih ? "lg:col-span-2" : "lg:col-span-5"}>
                            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-rose-500" /> TIH 풀 · 자리의 이유
                            </h2>
                            {tihs.length === 0 ? (
                                <div className="border border-dashed border-neutral-200 rounded-lg p-10 text-center">
                                    <p className="text-xs text-neutral-400">제출된 TIH가 없습니다</p>
                                </div>
                            ) : (
                                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                    <div className="max-h-[600px] overflow-y-auto">
                                        {tihs.map(t => {
                                            const axisSum = (t.derived_guardian ?? 0) + (t.derived_pioneer ?? 0) + (t.derived_connector ?? 0);
                                            const hasAxis = axisSum > 0;
                                            const selected = selectedTih?.id === t.id;
                                            return (
                                                <button key={t.id} onClick={() => findCandidates(t)}
                                                    className={`w-full text-left px-3 py-3 border-b border-neutral-100 last:border-0 transition-colors ${
                                                        selected ? "bg-rose-50" : "hover:bg-neutral-50"
                                                    }`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium truncate">{t.company}</p>
                                                            <p className="text-[10px] text-neutral-400">{t.contact_name}</p>
                                                        </div>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                                            t.status === "pending" ? "bg-amber-100 text-amber-700"
                                                                : t.status === "reviewing" ? "bg-blue-100 text-blue-700"
                                                                : "bg-neutral-100 text-neutral-500"
                                                        }`}>{t.status}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                                                        {t.derived_industry && <span className="bg-neutral-100 px-1.5 py-0.5 rounded">{t.derived_industry}</span>}
                                                        {t.derived_job_function && <span className="bg-neutral-100 px-1.5 py-0.5 rounded">{t.derived_job_function}</span>}
                                                        {hasAxis && (
                                                            <span className="text-neutral-400 font-mono">
                                                                G{t.derived_guardian} · P{t.derived_pioneer} · C{t.derived_connector}
                                                            </span>
                                                        )}
                                                        {(t.derived_risk_flags?.length ?? 0) > 0 && (
                                                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 매칭 후보 */}
                        {selectedTih && (
                            <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-lg p-5 h-fit lg:sticky lg:top-4">
                                <div className="flex items-start justify-between mb-4 pb-3 border-b border-neutral-100">
                                    <div>
                                        <h3 className="font-bold">{selectedTih.company}</h3>
                                        <p className="text-[11px] text-neutral-500 mt-0.5">매칭 후보 계산 (Tetrad Engine v1)</p>
                                    </div>
                                    <button onClick={() => setSelectedTih(null)} className="text-xs text-neutral-400 hover:text-neutral-600">닫기</button>
                                </div>

                                {searchingCandidates ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                                    </div>
                                ) : candidates.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-neutral-400">
                                        <Users className="h-8 w-8 mx-auto mb-2 text-neutral-200" />
                                        매칭 가능한 인재가 아직 없습니다<br />
                                        <span className="text-[10px]">JH 작성 완료자 · HIT 완료자 풀이 커지면 표시됩니다</span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-[11px] text-neutral-500 mb-3">
                                            후보 {candidates.length}명 · 점수 내림차순
                                        </p>
                                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                            {candidates.sort((a, b) => b.score_total - a.score_total).map((c, i) => {
                                                const conflict = (c.risk_match as { conflict?: string | null })?.conflict;
                                                const isConfirming = confirming === c.jh_id;
                                                return (
                                                    <div key={c.jh_id} className={`p-3 rounded-lg border ${
                                                        conflict ? "border-amber-200 bg-amber-50/50" : "border-neutral-200 bg-white"
                                                    }`}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-xs font-semibold text-neutral-700">
                                                                후보 #{i + 1}
                                                                <span className="ml-2 text-[10px] font-mono text-neutral-400">{c.member_id.slice(0, 8)}…</span>
                                                            </p>
                                                            <span className="text-sm font-bold text-rose-600">{c.score_total.toFixed(0)}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-1 text-[10px] text-neutral-500 mb-1.5">
                                                            <div>산업 {c.score_industry}</div>
                                                            <div>직무 {c.score_job_function}</div>
                                                            <div>3축 {c.score_axis_distance.toFixed(0)}</div>
                                                        </div>
                                                        {conflict && (
                                                            <div className="mb-1.5 text-[10px] text-amber-700 flex items-center gap-1">
                                                                <AlertTriangle className="h-3 w-3" /> {conflict}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-1 text-[10px]">
                                                                {c.hit_a_result_id && <span className="bg-rose-100 text-rose-700 px-1 rounded">HIT-A</span>}
                                                                {c.hit_b_result_id && <span className="bg-rose-100 text-rose-700 px-1 rounded">HIT-B</span>}
                                                                {!c.hit_a_result_id && !c.hit_b_result_id && <span className="text-neutral-400">HIT 미완료</span>}
                                                            </div>
                                                            <button onClick={() => proposeMatch(c)} disabled={isConfirming}
                                                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-700 disabled:opacity-40">
                                                                {isConfirming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Handshake className="h-3 w-3" />}
                                                                매칭 제안
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 p-2 bg-neutral-50 rounded text-[10px] text-neutral-500">
                                            ⚠️ v1 점수는 단순 가중치 · Phase 4-6 AI 큐레이션에서 고도화 예정
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 매칭 이력 */}
                    {matches.length > 0 && (
                        <div className="mt-10">
                            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Network className="h-4 w-4 text-rose-500" /> 확정 매칭 이력
                            </h2>
                            <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-neutral-50 border-b border-neutral-200">
                                        <tr>
                                            <th className="text-left px-3 py-2 font-semibold text-neutral-600">기업</th>
                                            <th className="text-left px-3 py-2 font-semibold text-neutral-600">member_id</th>
                                            <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                            <th className="text-left px-3 py-2 font-semibold text-neutral-600">type</th>
                                            <th className="text-right px-3 py-2 font-semibold text-neutral-600">생성</th>
                                            <th className="text-right px-3 py-2 font-semibold text-neutral-600">AI</th>
                                            <th className="text-right px-3 py-2 font-semibold text-neutral-600">전이</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matches.map(m => {
                                            const nextOptions = NEXT_STATUS[m.match_status] ?? [];
                                            const isTransitioning = transitioning === m.id;
                                            return (
                                                <tr key={m.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                                    <td className="px-3 py-2 font-medium">{m.hero_companies?.company_name || "-"}</td>
                                                    <td className="px-3 py-2 font-mono text-[10px]">{m.profile_member_id?.slice(0, 8)}…</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[m.match_status] ?? "bg-neutral-100"}`}>
                                                            {STATUS_LABEL[m.match_status] ?? m.match_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-neutral-500">{m.match_type}</td>
                                                    <td className="px-3 py-2 text-right text-[10px] text-neutral-400">
                                                        {new Date(m.created_at).toLocaleDateString("ko-KR")}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {m.ai_match_report ? (
                                                            <button onClick={() => viewCuration(m)} className="inline-flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-800 font-semibold">
                                                                <Eye className="h-3 w-3" /> 보기
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => generateCuration(m.id)} disabled={curating === m.id}
                                                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded font-semibold disabled:opacity-40">
                                                                {curating === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                                                생성
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {nextOptions.length > 0 ? (
                                                            <div className="flex items-center gap-1 justify-end">
                                                                {nextOptions.map(opt => (
                                                                    <button key={opt} onClick={() => updateStatus(m.id, opt)} disabled={isTransitioning}
                                                                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-opacity ${STATUS_COLOR[opt] ?? "bg-neutral-100"} disabled:opacity-40`}
                                                                        title={`${STATUS_LABEL[m.match_status]} → ${STATUS_LABEL[opt] ?? opt}`}>
                                                                        → {STATUS_LABEL[opt] ?? opt}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-neutral-300">종료</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 p-3 border border-neutral-200 bg-neutral-50 rounded text-[11px] text-neutral-600">
                        <strong className="block mb-1">🌐 Tetrad Engine v1</strong>
                        1차 공간 축소: TIH 산업·직무·3축 × JH preferred_state · 2차 하드 필터: risk_flags × avoid_traits 교차 감지
                        <span className="ml-1 text-neutral-400">· 3차 AI 큐레이션: tetrad_match_v1 프롬프트 사용</span>
                    </div>

                    {/* 큐레이션 뷰 모달 */}
                    {curationView && (
                        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setCurationView(null)}>
                            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200">
                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-rose-500" /> AI 큐레이션
                                    </h3>
                                    <button onClick={() => setCurationView(null)} className="text-xs text-neutral-400 hover:text-neutral-600">닫기</button>
                                </div>
                                <div className="p-5 space-y-5">
                                    {curationView.data.for_company && (
                                        <div>
                                            <p className="text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                                                <Building2 className="h-3.5 w-3.5 text-neutral-500" /> 기업에게 (for_company)
                                            </p>
                                            <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed bg-blue-50/30 p-3 rounded">
                                                {curationView.data.for_company}
                                            </p>
                                        </div>
                                    )}
                                    {curationView.data.for_talent && (
                                        <div>
                                            <p className="text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5 text-neutral-500" /> 인재에게 (for_talent)
                                            </p>
                                            <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed bg-rose-50/30 p-3 rounded">
                                                {curationView.data.for_talent}
                                            </p>
                                        </div>
                                    )}
                                    {curationView.data.signal_notes && curationView.data.signal_notes.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1">
                                                <AlertTriangle className="h-3.5 w-3.5" /> 주의 신호 (양쪽 비공개)
                                            </p>
                                            <ul className="list-disc ml-5 text-xs text-amber-900 space-y-0.5">
                                                {curationView.data.signal_notes.map((n, i) => <li key={i}>{n}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="px-5 py-2 border-t border-neutral-200 bg-neutral-50 text-[10px] text-neutral-500">
                                    ⚠️ 매칭 점수·벡터·순위는 양쪽에 노출 금지 (Tetrad 비공개 원칙)
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
