"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, CheckCircle, Clock, Loader2, RefreshCw,
  ChevronDown, AlertCircle, X, Send,
} from "lucide-react";
import { PageHeader, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Inquiry {
  id: string;
  form_type: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  extra: { category?: string; note?: string } | null;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
}

type TabType = "inquiries" | "guide";
type StatusFilter = "all" | "pending" | "in_progress" | "resolved";

const STATUS_META = {
  pending:     { label: "미처리",   color: "text-amber-600 bg-amber-50 border-amber-200" },
  in_progress: { label: "처리 중",  color: "text-blue-600 bg-blue-50 border-blue-200" },
  resolved:    { label: "처리 완료", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
};

const NEXT_STATUS: Record<string, "in_progress" | "resolved"> = {
  pending:     "in_progress",
  in_progress: "resolved",
};

export default function BadakCSPage() {
  const [tab, setTab] = useState<TabType>("inquiries");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { setLoading(false); return; }

      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/badak/inquiries${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  async function updateStatus(inquiry: Inquiry, nextStatus: "in_progress" | "resolved") {
    setUpdatingId(inquiry.id);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const note = noteInputs[inquiry.id] || undefined;
      await fetch("/api/badak/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: inquiry.id, status: nextStatus, note }),
      });
      setInquiries((prev) => prev.map((i) => i.id === inquiry.id ? { ...i, status: nextStatus, extra: { ...i.extra, note } } : i));
      setNoteInputs((prev) => { const next = { ...prev }; delete next[inquiry.id]; return next; });
    } finally { setUpdatingId(null); }
  }

  const filtered = statusFilter === "all" ? inquiries : inquiries.filter((i) => i.status === statusFilter);
  const pendingCount = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div>
      <PageHeader
        title="고객 문의 관리"
        description="Badak 서비스 이용자 문의 접수 및 처리"
      >
        <button onClick={loadData} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5" /> 새로고침
        </button>
      </PageHeader>

      {/* 탭 */}
      <div className="flex gap-1 mb-5 border-b border-neutral-200">
        {([
          ["inquiries", `문의 목록${pendingCount > 0 ? ` (미처리 ${pendingCount})` : ""}`],
          ["guide", "CS 대응 가이드"],
        ] as [TabType, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "inquiries" && (
        <>
          {/* 상태 필터 */}
          <div className="flex gap-2 mb-4">
            {(["all", "pending", "in_progress", "resolved"] as StatusFilter[]).map((s) => {
              const isActive = statusFilter === s;
              const label = s === "all" ? "전체" : STATUS_META[s].label;
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
                <MessageSquare className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                <p className="text-xs text-neutral-400">
                  {statusFilter === "all" ? "접수된 문의가 없습니다" : "해당 상태의 문의가 없습니다"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((inquiry) => {
                  const sm = STATUS_META[inquiry.status];
                  const isExpanded = expandedId === inquiry.id;
                  const nextStatus = NEXT_STATUS[inquiry.status];
                  const isUpdating = updatingId === inquiry.id;

                  return (
                    <div key={inquiry.id} className="border border-neutral-100 rounded-lg overflow-hidden">
                      {/* 헤더 행 */}
                      <button
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-50 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-neutral-800">{inquiry.name}</span>
                            {inquiry.extra?.category && (
                              <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                                {inquiry.extra.category}
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${sm.color}`}>
                              {sm.label}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5 truncate">{inquiry.message}</p>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                            {inquiry.email && <span>{inquiry.email}</span>}
                            {inquiry.phone && <span>{inquiry.phone}</span>}
                            <span>{new Date(inquiry.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-neutral-300 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {/* 상세 */}
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-neutral-100 bg-neutral-50/50">
                          <p className="text-sm text-neutral-700 mt-3 mb-3 whitespace-pre-wrap leading-relaxed">{inquiry.message}</p>

                          {inquiry.extra?.note && (
                            <div className="bg-amber-50 border border-amber-100 rounded-md p-2.5 mb-3">
                              <p className="text-xs text-amber-700"><span className="font-medium">처리 메모:</span> {inquiry.extra.note}</p>
                            </div>
                          )}

                          {nextStatus && (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                placeholder="처리 메모 (선택)"
                                value={noteInputs[inquiry.id] || ""}
                                onChange={(e) => setNoteInputs((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                                className="flex-1 text-xs border border-neutral-200 rounded-md px-2.5 py-1.5 outline-none focus:border-neutral-400"
                              />
                              <button
                                onClick={() => updateStatus(inquiry, nextStatus)}
                                disabled={isUpdating}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                              >
                                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                {STATUS_META[nextStatus].label}으로 변경
                              </button>
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
        </>
      )}

      {tab === "guide" && (
        <div className="space-y-4">
          {[
            {
              title: "모임 관련 문의",
              items: [
                "모임 참여 취소 요청 → 모임 관리 페이지에서 해당 모임 멤버 직접 삭제",
                "모임 개설자 변경 요청 → DB에서 badak_groups.leader_id 직접 수정",
                "정원 초과 참여 요청 → max_members 수치 조정 (모임 관리 → 수정)",
              ],
            },
            {
              title: "계정 관련 문의",
              items: [
                "닉네임 변경 → 멤버 관리 페이지에서 직접 수정",
                "탈퇴 요청 → members.affiliations에서 'badak' 제거 + badak_members.is_active = false",
                "바닥장 권한 부여 → 멤버 관리 > 역할 드롭다운에서 '바닥장'으로 변경",
              ],
            },
            {
              title: "게시글/니즈 관련",
              items: [
                "부적절한 게시글 신고 → 커뮤니티 관리 > 해당 글 숨김 또는 삭제",
                "니즈 키워드 부적절 → 니즈 관리 > 해당 항목 거절 처리",
                "중복 니즈 정리 → 니즈 관리 > count 낮은 항목 삭제 후 상위 항목 count 합산",
              ],
            },
            {
              title: "문의 접수 경로",
              items: [
                "사용자는 badak.biz 하단 '문의하기' 버튼 → 이름/연락처/내용 입력 후 접수",
                "접수된 문의는 이 페이지 '문의 목록' 탭에서 확인",
                "미처리 → 처리 중 → 처리 완료 순으로 상태 변경하며 관리",
              ],
            },
          ].map((section) => (
            <Card key={section.title}>
              <SectionTitle title={section.title} />
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
