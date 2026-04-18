"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Loader2, RefreshCw, Trash2, Network, Tag, X, ChevronDown } from "lucide-react";
import { PageHeader, Card } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Need {
  id: string;
  display_text: string;
  count: number;
  interest_count: number;
  status: string;
  need_type: string | null;
  tags: string[] | null;
  created_at: string;
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  pending_review: { label: "검토 대기", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  gathering:      { label: "모이는 중", color: "bg-blue-50 text-blue-700 border border-blue-200" },
  group_created:  { label: "모임 성사", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  rejected:       { label: "거절됨", color: "bg-red-50 text-red-500 border border-red-200" },
  active:         { label: "활성", color: "bg-neutral-100 text-neutral-600 border border-neutral-200" },
};

const NEED_TYPES = [
  { value: "general",    label: "일반" },
  { value: "networking", label: "네트워킹" },
  { value: "mentoring",  label: "멘토링" },
  { value: "study",      label: "스터디" },
  { value: "seminar",    label: "세미나" },
  { value: "career",     label: "커리어" },
  { value: "project",    label: "프로젝트" },
];

// 자주 쓰는 추천 태그
const SUGGEST_TAGS = [
  "IT", "디자인", "마케팅", "재무", "HR", "영업", "기획",
  "스타트업", "대기업", "중소기업", "프리랜서",
  "주니어", "시니어", "리더십",
  "개발", "PM", "UX", "브랜딩",
];

type TabType = "pending" | "all" | "explore";

export default function BadakNeedsPage() {
  const [tab, setTab] = useState<TabType>("pending");
  const [loading, setLoading] = useState(true);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => { loadNeeds(); }, []);

  async function loadNeeds() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.from("badak_needs")
        .select("id, display_text, count, interest_count, status, need_type, tags, created_at")
        .order("created_at", { ascending: false });
      setNeeds((data ?? []) as Need[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleStatusChange(needId: string, newStatus: string) {
    setProcessingId(needId);
    try {
      const res = await fetch("/api/badak/needs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: needId, status: newStatus }),
      });
      if (res.ok) setNeeds(prev => prev.map(n => n.id === needId ? { ...n, status: newStatus } : n));
    } finally { setProcessingId(null); }
  }

  async function handleTypeChange(needId: string, need_type: string) {
    setProcessingId(needId);
    try {
      const supabase = createClient();
      await supabase.from("badak_needs").update({ need_type }).eq("id", needId);
      setNeeds(prev => prev.map(n => n.id === needId ? { ...n, need_type } : n));
    } finally { setProcessingId(null); }
  }

  async function saveTagsForNeed(needId: string, newTags: string[]) {
    const supabase = createClient();
    await supabase.from("badak_needs").update({ tags: newTags }).eq("id", needId);
    setNeeds(prev => prev.map(n => n.id === needId ? { ...n, tags: newTags } : n));
  }

  async function handleAddTag(needId: string, currentTags: string[] | null, tag: string) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const next = [...new Set([...(currentTags ?? []), trimmed])];
    await saveTagsForNeed(needId, next);
  }

  async function handleRemoveTag(needId: string, currentTags: string[] | null, tag: string) {
    const next = (currentTags ?? []).filter(t => t !== tag);
    await saveTagsForNeed(needId, next);
  }

  async function handleDelete(needId: string) {
    if (!confirm("니즈를 삭제하시겠습니까?")) return;
    setProcessingId(needId);
    try {
      const res = await fetch(`/api/badak/needs?id=${needId}`, { method: "DELETE" });
      if (res.ok) setNeeds(prev => prev.filter(n => n.id !== needId));
    } finally { setProcessingId(null); }
  }

  const pending = needs.filter(n => n.status === "pending_review");

  const filtered = (tab === "pending" ? pending : needs).filter(n => {
    const q = search.toLowerCase();
    const matchText = !q || n.display_text?.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || n.need_type === typeFilter;
    const matchTag = !tagFilter || (n.tags ?? []).some(t => t.toLowerCase().includes(tagFilter.toLowerCase()));
    return matchText && matchType && matchTag;
  });

  // 태그 집계 (전체 목록 기준)
  const allTags = needs.flatMap(n => n.tags ?? []);
  const tagCounts: Record<string, number> = {};
  for (const t of allTags) tagCounts[t] = (tagCounts[t] ?? 0) + 1;
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);

  // 유형 집계
  const typeCounts: Record<string, number> = {};
  for (const n of needs) typeCounts[n.need_type ?? "general"] = (typeCounts[n.need_type ?? "general"] ?? 0) + 1;

  return (
    <div>
      <PageHeader title="니즈 관리" description="니즈 클라우드 키워드 검토 · 승인 · 분류 · 삭제">
        <button onClick={loadNeeds} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5" /> 새로고침
        </button>
      </PageHeader>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-3 mb-5">
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
        {([
          ["pending", `검토 대기 (${pending.length})`],
          ["all", "전체 목록"],
          ["explore", "탐색 관리"],
        ] as [TabType, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "explore" ? (
        <ExploreManagementStub />
      ) : (
        <div className="grid grid-cols-[1fr_240px] gap-5">
          {/* 메인 목록 */}
          <Card>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="키워드 검색"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400" />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none cursor-pointer">
                <option value="all">전체 유형</option>
                {NEED_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label} {typeCounts[t.value] ? `(${typeCounts[t.value]})` : ""}
                  </option>
                ))}
              </select>
              {tagFilter && (
                <button onClick={() => setTagFilter("")}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-neutral-100 rounded-lg text-neutral-600 hover:bg-neutral-200">
                  #{tagFilter} <X className="h-3 w-3" />
                </button>
              )}
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
                  const typeMeta = NEED_TYPES.find(t => t.value === (need.need_type ?? "general"));
                  const isEditingTags = editingTagsId === need.id;
                  return (
                    <div key={need.id} className="border border-neutral-100 rounded-lg hover:bg-neutral-50 overflow-hidden">
                      {/* 메인 행 */}
                      <div className="flex items-start gap-3 py-2.5 px-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${ss.color}`}>{ss.label}</span>
                            <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{typeMeta?.label ?? "일반"}</span>
                            <span className="text-sm text-neutral-800 truncate">{need.display_text}</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>참여 {need.count}명</span>
                            <span>관심 {need.interest_count ?? 0}명</span>
                            <span>{new Date(need.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>
                            {(need.tags ?? []).map(tag => (
                              <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">#{tag}</span>
                            ))}
                            <button onClick={() => {
                              setEditingTagsId(isEditingTags ? null : need.id);
                              setTagInput("");
                            }} className="flex items-center gap-0.5 text-neutral-300 hover:text-neutral-500 text-[10px]">
                              <Tag className="h-2.5 w-2.5" /> 태그
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* 유형 선택 */}
                          <select value={need.need_type ?? "general"} disabled={processingId === need.id}
                            onChange={e => handleTypeChange(need.id, e.target.value)}
                            className="text-[10px] border border-neutral-200 rounded px-1.5 py-1 bg-white focus:outline-none cursor-pointer disabled:opacity-50">
                            {NEED_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
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

                      {/* 태그 편집 패널 */}
                      {isEditingTags && (
                        <div className="px-3 pb-2.5 border-t border-neutral-100 pt-2 bg-neutral-50">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(need.tags ?? []).map(tag => (
                              <span key={tag} className="flex items-center gap-1 text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                #{tag}
                                <button onClick={() => handleRemoveTag(need.id, need.tags, tag)}
                                  className="text-blue-400 hover:text-blue-700">×</button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { handleAddTag(need.id, need.tags, tagInput); setTagInput(""); } }}
                              placeholder="태그 입력 후 Enter"
                              className="text-xs border border-neutral-200 rounded px-2 py-1 flex-1 focus:outline-none focus:border-neutral-400" />
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {SUGGEST_TAGS.filter(t => !(need.tags ?? []).includes(t)).slice(0, 10).map(t => (
                              <button key={t} onClick={() => handleAddTag(need.id, need.tags, t)}
                                className="text-[10px] bg-white border border-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded hover:bg-neutral-100">
                                +{t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* 우측 분석 패널 */}
          <div className="space-y-4">
            {/* 유형 분포 */}
            <Card>
              <h3 className="text-xs font-semibold text-neutral-700 mb-3">유형 분포</h3>
              <div className="space-y-2">
                {NEED_TYPES.map(t => {
                  const cnt = typeCounts[t.value] ?? 0;
                  const pct = needs.length ? Math.round((cnt / needs.length) * 100) : 0;
                  return (
                    <button key={t.value} onClick={() => setTypeFilter(typeFilter === t.value ? "all" : t.value)}
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 transition-colors ${typeFilter === t.value ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"}`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={typeFilter === t.value ? "text-white" : "text-neutral-600"}>{t.label}</span>
                        <span className={typeFilter === t.value ? "text-white/70" : "text-neutral-400"}>{cnt}</span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-neutral-100 overflow-hidden">
                        <div className={`h-full rounded-full ${typeFilter === t.value ? "bg-white/60" : "bg-neutral-300"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 태그 클라우드 */}
            {topTags.length > 0 && (
              <Card>
                <h3 className="text-xs font-semibold text-neutral-700 mb-3">태그 현황</h3>
                <div className="flex flex-wrap gap-1.5">
                  {topTags.map(([tag, cnt]) => (
                    <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? "" : tag)}
                      className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border transition-colors ${tagFilter === tag ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}>
                      #{tag}
                      <span className={`text-[10px] ${tagFilter === tag ? "text-white/70" : "text-neutral-400"}`}>{cnt}</span>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExploreManagementStub() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
          <Network className="h-6 w-6 text-neutral-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-700">니즈 탐색 관리</p>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-sm leading-relaxed">
            멤버의 관심 이력·북마크·경력·니즈·원츠 데이터를 종합해<br />
            서로를 발견하는 추천 피드를 관리합니다.
          </p>
          <p className="text-[11px] text-neutral-300 mt-4">데이터 누적 후 단계적으로 활성화됩니다</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-2 w-full max-w-md">
          {[
            { label: "추천 알고리즘 설정", desc: "관심 기반 매칭 가중치" },
            { label: "탐색 피드 관리", desc: "노출 순서 · 필터 규칙" },
            { label: "Stars 집계 설정", desc: "주목 멤버 랭킹 기준" },
          ].map(({ label, desc }) => (
            <div key={label} className="border border-neutral-100 rounded-lg p-3 text-center opacity-40">
              <p className="text-xs font-medium text-neutral-600">{label}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
