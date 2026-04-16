"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { PageHeader, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Need {
  id: string;
  display_text: string;
  count: number;
  interest_count: number;
  status: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  pending_review: { label: "검토 대기", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  gathering:      { label: "모이는 중", color: "bg-blue-50 text-blue-700 border border-blue-200" },
  group_created:  { label: "모임 성사", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  rejected:       { label: "거절됨", color: "bg-red-50 text-red-500 border border-red-200" },
  active:         { label: "활성", color: "bg-neutral-100 text-neutral-600 border border-neutral-200" },
};

type TabType = "pending" | "all";

export default function BadakNeedsPage() {
  const [tab, setTab] = useState<TabType>("pending");
  const [loading, setLoading] = useState(true);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { loadNeeds(); }, []);

  async function loadNeeds() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.from("badak_needs")
        .select("id, display_text, count, interest_count, status, created_at")
        .order("created_at", { ascending: false });
      setNeeds((data ?? []) as Need[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleStatusChange(needId: string, newStatus: string) {
    setProcessingId(needId);
    try {
      const supabase = createClient();
      await supabase.from("badak_needs").update({ status: newStatus }).eq("id", needId);
      setNeeds(prev => prev.map(n => n.id === needId ? { ...n, status: newStatus } : n));
    } finally { setProcessingId(null); }
  }

  async function handleDelete(needId: string) {
    if (!confirm("니즈를 삭제하시겠습니까?")) return;
    setProcessingId(needId);
    try {
      const supabase = createClient();
      await supabase.from("badak_needs").delete().eq("id", needId);
      setNeeds(prev => prev.filter(n => n.id !== needId));
    } finally { setProcessingId(null); }
  }

  const pending = needs.filter(n => n.status === "pending_review");
  const filtered = (tab === "pending" ? pending : needs).filter(n => {
    const q = search.toLowerCase();
    return !q || n.display_text?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader title="니즈 관리" description="니즈 클라우드 키워드 검토 · 승인 · 삭제">
        <button onClick={loadNeeds} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5" /> 새로고침
        </button>
      </PageHeader>

      {/* 요약 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "검토 대기", value: needs.filter(n => n.status === "pending_review").length, color: "text-amber-600" },
          { label: "모이는 중", value: needs.filter(n => n.status === "gathering").length, color: "text-blue-600" },
          { label: "모임 성사", value: needs.filter(n => n.status === "group_created").length, color: "text-emerald-600" },
          { label: "전체", value: needs.length, color: "text-neutral-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-neutral-200 rounded-lg p-3 text-center">
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-5 border-b border-neutral-200">
        {([["pending", `검토 대기 (${pending.length})`], ["all", "전체 목록"]] as [TabType, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
            {label}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="키워드 검색"
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400" />
          </div>
          <span className="text-xs text-neutral-400 ml-auto">{filtered.length}개</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-12">
            {tab === "pending" ? "검토 대기 중인 니즈가 없습니다" : "니즈가 없습니다"}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map(need => {
              const ss = STATUS_STYLE[need.status] ?? STATUS_STYLE.active;
              return (
                <div key={need.id} className="flex items-center gap-3 py-2.5 px-3 border border-neutral-100 rounded-lg hover:bg-neutral-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${ss.color}`}>{ss.label}</span>
                      <span className="text-sm text-neutral-800 truncate">{need.display_text}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      참여 {need.count}명 · 관심 {need.interest_count}명 ·{" "}
                      {new Date(need.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {need.status === "pending_review" && (
                      <>
                        <button disabled={processingId === need.id}
                          onClick={() => handleStatusChange(need.id, "gathering")}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                          <CheckCircle className="h-3 w-3" /> 승인
                        </button>
                        <button disabled={processingId === need.id}
                          onClick={() => handleStatusChange(need.id, "rejected")}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium border border-neutral-200 text-neutral-500 rounded-lg hover:bg-neutral-50 disabled:opacity-50">
                          <XCircle className="h-3 w-3" /> 거절
                        </button>
                      </>
                    )}
                    {need.status !== "pending_review" && (
                      <select value={need.status} disabled={processingId === need.id}
                        onChange={e => handleStatusChange(need.id, e.target.value)}
                        className="text-xs border border-neutral-200 rounded px-2 py-1 bg-white focus:outline-none cursor-pointer disabled:opacity-50">
                        <option value="gathering">모이는 중</option>
                        <option value="group_created">모임 성사</option>
                        <option value="active">활성</option>
                        <option value="rejected">거절됨</option>
                      </select>
                    )}
                    <button disabled={processingId === need.id}
                      onClick={() => handleDelete(need.id)}
                      className="p-1.5 text-neutral-300 hover:text-red-400 disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
