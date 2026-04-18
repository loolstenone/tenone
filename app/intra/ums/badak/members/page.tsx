"use client";

import { useState, useEffect } from "react";
import { Search, Crown, UserCheck, Clock, Loader2, RefreshCw, TrendingUp, Star } from "lucide-react";
import { PageHeader, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar_initials: string;
  created_at: string;
  affiliations: string[];
}

interface BadakMember {
  id: string;
  member_id: string | null;
  display_name: string;
  industry: string | null;
  job_function: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  phone: string | null;
  leader_level: string | null;
  completed_groups_count: number;
  specialist_invited: boolean;
}

interface Application {
  id: string;
  member_id: string | null;
  name: string;
  industry: string;
  motivation: string;
  created_at: string;
  status: string;
}

type TabType = "members" | "applications";

const ROLE_STYLE: Record<string, { label: string; color: string }> = {
  badakjang: { label: "바닥장", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  admin:     { label: "관리자", color: "bg-red-50 text-red-600 border border-red-200" },
  member:    { label: "멤버", color: "bg-neutral-100 text-neutral-500 border border-neutral-200" },
};

const LEVEL_META: Record<string, { label: string; rate: number; color: string; min: number }> = {
  S: { label: "Specialist", rate: 85, color: "bg-purple-50 text-purple-700 border border-purple-200", min: 10 },
  A: { label: "Veteran",    rate: 80, color: "bg-blue-50 text-blue-700 border border-blue-200",   min: 10 },
  B: { label: "Badakjang",  rate: 75, color: "bg-emerald-50 text-emerald-700 border border-emerald-200", min: 3 },
  C: { label: "Rookie",     rate: 70, color: "bg-neutral-100 text-neutral-500 border border-neutral-200", min: 0 },
};

function nextLevel(current: string | null): string | null {
  const map: Record<string, string> = { C: "B", B: "A", A: "S" };
  return current ? (map[current] ?? null) : null;
}

export default function BadakMembersPage() {
  const [tab, setTab] = useState<TabType>("members");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [badakMembers, setBadakMembers] = useState<BadakMember[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const supabase = createClient();
      const [{ data: mems }, { data: bMems }, { data: apps }] = await Promise.all([
        supabase.from("members").select("id, name, email, avatar_initials, created_at, affiliations")
          .contains("affiliations", ["badak"]).order("created_at", { ascending: false }),
        supabase.from("badak_members").select(
          "id, member_id, display_name, industry, job_function, role, is_active, created_at, phone, leader_level, completed_groups_count, specialist_invited"
        ).order("created_at", { ascending: false }),
        supabase.from("badak_leader_applications").select("id, member_id, name, industry, motivation, created_at, status")
          .order("created_at", { ascending: false }).limit(50),
      ]);
      setMembers((mems ?? []) as Member[]);
      setBadakMembers((bMems ?? []) as BadakMember[]);
      setApplications((apps ?? []) as Application[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(badakMemberId: string, newRole: string) {
    setProcessingId(badakMemberId);
    try {
      const supabase = createClient();
      await supabase.from("badak_members").update({ role: newRole }).eq("id", badakMemberId);
      setBadakMembers(prev => prev.map(m => m.id === badakMemberId ? { ...m, role: newRole } : m));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleLevelChange(badakMemberId: string, newLevel: string) {
    setProcessingId(badakMemberId + "_level");
    try {
      const supabase = createClient();
      await supabase.from("badak_members").update({ leader_level: newLevel, level_updated_at: new Date().toISOString() }).eq("id", badakMemberId);
      setBadakMembers(prev => prev.map(m => m.id === badakMemberId ? { ...m, leader_level: newLevel } : m));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleSpecialistInvite(badakMemberId: string, invited: boolean) {
    setProcessingId(badakMemberId + "_invite");
    try {
      const supabase = createClient();
      await supabase.from("badak_members").update({
        specialist_invited: invited,
        specialist_invited_at: invited ? new Date().toISOString() : null,
      }).eq("id", badakMemberId);
      setBadakMembers(prev => prev.map(m => m.id === badakMemberId ? { ...m, specialist_invited: invited } : m));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleApplicationStatus(appId: string, status: "approved" | "rejected") {
    setProcessingId(appId);
    try {
      const supabase = createClient();
      await supabase.from("badak_leader_applications").update({ status }).eq("id", appId);
      if (status === "approved") {
        const app = applications.find(a => a.id === appId);
        if (app?.member_id) {
          const bm = badakMembers.find(b => b.member_id === app.member_id);
          if (bm) {
            await supabase.from("badak_members").update({ role: "badakjang", leader_level: "C" }).eq("id", bm.id);
            setBadakMembers(prev => prev.map(m => m.id === bm.id ? { ...m, role: "badakjang", leader_level: "C" } : m));
          }
        }
      }
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } finally {
      setProcessingId(null);
    }
  }

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    if (q && !m.name?.toLowerCase().includes(q) && !m.email?.toLowerCase().includes(q)) return false;
    return true;
  });

  const pendingApps = applications.filter(a => a.status === "pending");
  const badakjangs = badakMembers.filter(m => m.role === "badakjang");

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;

  return (
    <div>
      <PageHeader title="멤버 관리" description="Badak 소속 멤버 및 바닥장 레벨 관리">
        <button onClick={loadData} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5" /> 새로고침
        </button>
      </PageHeader>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-neutral-200">
        {([
          ["members", `멤버 목록 (${members.length})`],
          ["applications", `바닥장 신청${pendingApps.length > 0 ? ` (대기 ${pendingApps.length})` : ""}`],
        ] as [TabType, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <div className="space-y-6">
          {/* 바닥장 레벨 현황 요약 */}
          {badakjangs.length > 0 && (
            <Card>
              <SectionTitle title="바닥장 레벨 현황" />
              <div className="grid grid-cols-4 gap-3 mb-4">
                {(["S","A","B","C"] as const).map(code => {
                  const meta = LEVEL_META[code];
                  const count = badakjangs.filter(m => m.leader_level === code).length;
                  return (
                    <div key={code} className="rounded-lg border border-neutral-100 p-3 text-center">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mb-1 ${meta.color}`}>{meta.label}</span>
                      <p className="text-xl font-bold text-neutral-800">{count}</p>
                      <p className="text-[10px] text-neutral-400">수령 {meta.rate}%</p>
                    </div>
                  );
                })}
              </div>

              {/* 바닥장 레벨 목록 */}
              <div className="space-y-2">
                {badakjangs.map(bm => {
                  const levelCode = bm.leader_level ?? "C";
                  const meta = LEVEL_META[levelCode] ?? LEVEL_META.C;
                  const next = nextLevel(levelCode);
                  const nextMeta = next ? LEVEL_META[next] : null;
                  const canAutoPromote = next && next !== "S" && nextMeta && bm.completed_groups_count >= nextMeta.min;
                  const canSpecialistPromote = levelCode === "A" && bm.completed_groups_count >= 10;
                  const isProcessing = processingId === bm.id + "_level" || processingId === bm.id + "_invite";

                  return (
                    <div key={bm.id} className="flex items-center gap-3 py-3 px-3 border border-neutral-100 rounded-lg hover:bg-neutral-50">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {bm.display_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-neutral-800">{bm.display_name}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${meta.color}`}>{meta.label}</span>
                          {bm.specialist_invited && levelCode === "A" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-200 flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5" /> 초대됨
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-neutral-400">완료 {bm.completed_groups_count}회</span>
                          {canAutoPromote && (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                              <TrendingUp className="h-3 w-3" /> {nextMeta!.label} 자동 승급 가능
                            </span>
                          )}
                          {canSpecialistPromote && !bm.specialist_invited && (
                            <span className="text-[10px] text-purple-500">Specialist 초대 대상</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* 레벨 직접 조정 */}
                        <select
                          value={levelCode}
                          disabled={isProcessing}
                          onChange={e => handleLevelChange(bm.id, e.target.value)}
                          className="text-xs border border-neutral-200 rounded px-2 py-1 bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="C">Rookie (70%)</option>
                          <option value="B">Badakjang (75%)</option>
                          <option value="A">Veteran (80%)</option>
                          <option value="S">Specialist (85%)</option>
                        </select>
                        {/* Specialist 초대 토글 (Veteran만) */}
                        {levelCode === "A" && (
                          <button
                            disabled={isProcessing}
                            onClick={() => handleSpecialistInvite(bm.id, !bm.specialist_invited)}
                            className={`text-[10px] font-semibold px-2 py-1 rounded border transition-colors disabled:opacity-50 ${
                              bm.specialist_invited
                                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                                : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                            }`}
                          >
                            {bm.specialist_invited ? "초대 취소" : "Specialist 초대"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 전체 멤버 목록 */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="이름 또는 이메일 검색"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400" />
              </div>
              <span className="text-xs text-neutral-400">{filteredMembers.length}명</span>
            </div>

            <div className="space-y-2">
              {filteredMembers.map(m => {
                const bm = badakMembers.find(b => b.member_id === m.id);
                const role = bm?.role ?? "member";
                const rs = ROLE_STYLE[role] ?? ROLE_STYLE.member;
                return (
                  <div key={m.id} className="flex items-center gap-3 py-2.5 px-3 border border-neutral-100 rounded-lg hover:bg-neutral-50">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {m.avatar_initials || m.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-800">{m.name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${rs.color}`}>{rs.label}</span>
                        {bm?.role === "badakjang" && bm.leader_level && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${LEVEL_META[bm.leader_level]?.color ?? ""}`}>
                            {LEVEL_META[bm.leader_level]?.label}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400">{m.email}
                        {bm?.job_function && <span className="ml-2">{bm.job_function}{bm.industry ? ` · ${bm.industry}` : ""}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-neutral-300">
                        {new Date(m.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      </span>
                      {bm && (
                        <select
                          value={bm.role}
                          disabled={processingId === bm.id}
                          onChange={e => handleRoleChange(bm.id, e.target.value)}
                          className="text-xs border border-neutral-200 rounded px-2 py-1 bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="member">멤버</option>
                          <option value="badakjang">바닥장</option>
                          <option value="admin">관리자</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredMembers.length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-8">검색 결과가 없습니다</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === "applications" && (
        <div className="space-y-4">
          {pendingApps.length > 0 && (
            <Card>
              <SectionTitle title="승인 대기" />
              <div className="space-y-3">
                {pendingApps.map(app => (
                  <div key={app.id} className="border border-amber-100 rounded-lg p-4 bg-amber-50/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm font-semibold text-neutral-800">{app.name}</span>
                          <span className="text-[10px] text-neutral-400">{app.industry}</span>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">{app.motivation}</p>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          {new Date(app.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          disabled={processingId === app.id}
                          onClick={() => handleApplicationStatus(app.id, "approved")}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                          <UserCheck className="h-3 w-3" /> 승인
                        </button>
                        <button
                          disabled={processingId === app.id}
                          onClick={() => handleApplicationStatus(app.id, "rejected")}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50">
                          거절
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <SectionTitle title="전체 신청 내역" />
            {applications.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">신청 내역이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {applications.map(app => {
                  const statusStyle = app.status === "approved" ? "bg-emerald-50 text-emerald-700"
                    : app.status === "rejected" ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-700";
                  const statusLabel = app.status === "approved" ? "승인" : app.status === "rejected" ? "거절" : "대기";
                  return (
                    <div key={app.id} className="flex items-center gap-3 py-2.5 px-3 border border-neutral-100 rounded-lg">
                      <Clock className="h-4 w-4 text-neutral-300 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-neutral-700">{app.name}</span>
                        <span className="ml-2 text-xs text-neutral-400">{app.industry}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusStyle}`}>{statusLabel}</span>
                      <span className="text-[10px] text-neutral-300">
                        {new Date(app.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
