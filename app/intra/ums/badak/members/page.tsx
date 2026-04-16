"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Crown, UserCheck, Clock, Loader2, RefreshCw } from "lucide-react";
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

export default function BadakMembersPage() {
  const [tab, setTab] = useState<TabType>("members");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [badakMembers, setBadakMembers] = useState<BadakMember[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const supabase = createClient();
      const [{ data: mems }, { data: bMems }, { data: apps }] = await Promise.all([
        supabase.from("members").select("id, name, email, avatar_initials, created_at, affiliations")
          .contains("affiliations", ["badak"]).order("created_at", { ascending: false }),
        supabase.from("badak_members").select("id, member_id, display_name, industry, job_function, role, is_active, created_at, phone")
          .order("created_at", { ascending: false }),
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
            await supabase.from("badak_members").update({ role: "badakjang" }).eq("id", bm.id);
            setBadakMembers(prev => prev.map(m => m.id === bm.id ? { ...m, role: "badakjang" } : m));
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;

  return (
    <div>
      <PageHeader title="멤버 관리" description="Badak 소속 멤버 및 바닥장 신청 관리">
        <button onClick={loadData} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5" /> 새로고침
        </button>
      </PageHeader>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-neutral-200">
        {([["members", `멤버 목록 (${members.length})`], ["applications", `바닥장 신청 ${pendingApps.length > 0 ? `(대기 ${pendingApps.length})` : ""}`]] as [TabType, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <Card>
          {/* 필터 */}
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
                      <div className="relative">
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
                      </div>
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
