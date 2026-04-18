"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Crown, CheckCircle, XCircle, Clock, Loader2,
  RefreshCw, ChevronDown, User, Phone, Briefcase, MessageSquare,
} from "lucide-react";
import { PageHeader, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Application {
  id: string;
  user_id: string;
  member_id: string | null;
  name: string;
  industry: string | null;
  experience: string;
  interests: string[];
  custom_interests: string[];
  reason: string;
  plan: string | null;
  contact: string;
  need_id: string | null;
  need_text: string | null;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_META = {
  pending:  { label: "심사 중",  color: "text-amber-600 bg-amber-50 border-amber-200",   icon: Clock },
  approved: { label: "승인됨",   color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle },
  rejected: { label: "거절됨",   color: "text-red-500 bg-red-50 border-red-200",         icon: XCircle },
};

export default function BadakApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { setLoading(false); return; }

      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      // 직접 Supabase 쿼리 (관리자 권한 필요 없이 service role 우회, API 없어서 직접 조회)
      // API route 는 POST/GET(본인것만) 이라 여기선 supabase client로 조회
      // supabase client는 anon key라 RLS 적용됨 — admin은 별도 RLS 확인 필요
      // 일단 /api/badak/apply-admin 엔드포인트가 없으므로 Supabase service role 우회 API 사용
      const res = await fetch(`/api/badak/apply/admin${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setProcessingId(id);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const note = noteInputs[id] || undefined;
      const res = await fetch("/api/badak/apply", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status, note }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => a.id === id ? { ...a, status, note: note ?? a.note } : a)
        );
        setNoteInputs((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setExpandedId(null);
      }
    } finally { setProcessingId(null); }
  }

  const filtered = statusFilter === "all" ? applications : applications.filter((a) => a.status === statusFilter);
  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div>
      <PageHeader
        title="바닥장 심사"
        description="바닥장 신청 목록 확인 및 승인/거절 처리"
      >
        <button onClick={loadData} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5" /> 새로고침
        </button>
      </PageHeader>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-4">
        {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => {
          const isActive = statusFilter === s;
          const label = s === "all"
            ? `전체${pendingCount > 0 ? ` (미처리 ${pendingCount})` : ""}`
            : STATUS_META[s].label;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isActive ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"}`}>
              {label}
            </button>
          );
        })}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Crown className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
            <p className="text-xs text-neutral-400">
              {statusFilter === "all" ? "접수된 신청이 없습니다" : "해당 상태의 신청이 없습니다"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((app) => {
              const sm = STATUS_META[app.status];
              const StatusIcon = sm.icon;
              const isExpanded = expandedId === app.id;
              const isProcessing = processingId === app.id;

              return (
                <div key={app.id} className="border border-neutral-100 rounded-lg overflow-hidden">
                  {/* 헤더 행 */}
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
                      <Crown className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-neutral-800">{app.name}</span>
                        {app.need_text && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                            {app.need_text}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex items-center gap-0.5 ${sm.color}`}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {sm.label}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">{app.reason}</p>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                        {app.industry && <span>{app.industry}</span>}
                        <span>{new Date(app.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-neutral-300 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {/* 상세 */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <InfoCell icon={User} label="이름" value={app.name} />
                        <InfoCell icon={Phone} label="연락처" value={app.contact} />
                        {app.industry && <InfoCell icon={Briefcase} label="산업" value={app.industry} />}
                        {app.need_text && <InfoCell icon={MessageSquare} label="관련 니즈" value={app.need_text} />}
                      </div>

                      {app.interests?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-neutral-400 mb-1">관심 분야</p>
                          <div className="flex flex-wrap gap-1">
                            {app.interests.map((i) => (
                              <span key={i} className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">{i}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] text-neutral-400 mb-1">경험</p>
                        <p className="text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed">{app.experience}</p>
                      </div>

                      <div>
                        <p className="text-[10px] text-neutral-400 mb-1">지원 동기</p>
                        <p className="text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed">{app.reason}</p>
                      </div>

                      {app.plan && (
                        <div>
                          <p className="text-[10px] text-neutral-400 mb-1">운영 계획</p>
                          <p className="text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed">{app.plan}</p>
                        </div>
                      )}

                      {app.note && (
                        <div className="bg-amber-50 border border-amber-100 rounded-md p-2.5">
                          <p className="text-xs text-amber-700"><span className="font-medium">심사 메모:</span> {app.note}</p>
                        </div>
                      )}

                      {app.status === "pending" && (
                        <div className="space-y-2 pt-1">
                          <input
                            type="text"
                            placeholder="심사 메모 (선택 — 거절 시 사유 등)"
                            value={noteInputs[app.id] || ""}
                            onChange={(e) => setNoteInputs((prev) => ({ ...prev, [app.id]: e.target.value }))}
                            className="w-full text-xs border border-neutral-200 rounded-md px-2.5 py-1.5 outline-none focus:border-neutral-400"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(app.id, "approved")}
                              disabled={isProcessing}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                              승인
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, "rejected")}
                              disabled={isProcessing}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                            >
                              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                              거절
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function InfoCell({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5 min-w-0">
      <Icon className="h-3 w-3 text-neutral-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-neutral-400">{label}</p>
        <p className="text-xs text-neutral-700 truncate">{value}</p>
      </div>
    </div>
  );
}
