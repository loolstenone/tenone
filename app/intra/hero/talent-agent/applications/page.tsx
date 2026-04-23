"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, ChevronDown } from "lucide-react";

type Application = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  field: string | null;
  stage: string | null;
  intro: string | null;
  goal: string | null;
  portfolio_url: string | null;
  status: "pending" | "reviewing" | "contacted" | "accepted" | "closed";
  created_at: string;
  reviewed_at: string | null;
  notes: string | null;
};

const STATUS_LABEL: Record<Application["status"], string> = {
  pending:   "대기",
  reviewing: "검토 중",
  contacted: "연락함",
  accepted:  "수락",
  closed:    "종료",
};

const STATUS_COLOR: Record<Application["status"], string> = {
  pending:   "bg-amber-500/20 text-amber-300",
  reviewing: "bg-blue-500/20 text-blue-300",
  contacted: "bg-purple-500/20 text-purple-300",
  accepted:  "bg-emerald-500/20 text-emerald-300",
  closed:    "bg-neutral-700 text-neutral-400",
};

const FIELD_LABEL: Record<string, string> = {
  marketing:  "마케팅",
  creator:    "크리에이터",
  startup:    "창업",
  dev:        "개발",
  design:     "디자인",
  sports:     "스포츠",
  other:      "기타",
};

const STAGE_LABEL: Record<string, string> = {
  student:    "학생",
  junior:     "신입",
  career:     "경력",
  leadership: "리더십",
  returnee:   "공백복귀",
  other:      "기타",
};

const ALL_STATUSES = ["pending", "reviewing", "contacted", "accepted", "closed"] as const;

export default function TalentAgentApplicationsPage() {
  const sb = createClient();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Application["status"] | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState<Application["status"]>("pending");

  async function load() {
    setLoading(true);
    const q = sb.from("hero_talent_applications").select("*").order("created_at", { ascending: false });
    const { data } = await q;
    setApps((data as Application[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openDetail(app: Application) {
    setSelected(app);
    setNotesDraft(app.notes ?? "");
    setStatusDraft(app.status);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    await sb.from("hero_talent_applications").update({
      status: statusDraft,
      notes: notesDraft || null,
      reviewed_at: new Date().toISOString(),
    }).eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    await load();
  }

  const filtered = apps.filter(a => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<Application["status"], number>);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">탤런트 에이전시 신청 관리</h1>
        <p className="text-neutral-400 text-sm mt-1">HeRo 탤런트 에이전시 신청서 심사</p>
      </div>

      {/* 상태별 카운트 */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            filter === "all" ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          }`}
        >
          전체 {apps.length}
        </button>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === s ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {STATUS_LABEL[s]} {counts[s]}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
        <input
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500"
          placeholder="이름 또는 이메일로 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="text-neutral-500 text-sm py-12 text-center">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-neutral-500 text-sm py-12 text-center">신청서가 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(app => (
            <button
              key={app.id}
              onClick={() => openDetail(app)}
              className="w-full text-left bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[app.status]}`}>
                    {STATUS_LABEL[app.status]}
                  </span>
                  <span className="font-medium text-white truncate">{app.name}</span>
                  <span className="text-neutral-400 text-sm truncate hidden sm:block">{app.email}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs text-neutral-500">
                  {app.field && <span className="bg-neutral-800 px-2 py-0.5 rounded">{FIELD_LABEL[app.field] ?? app.field}</span>}
                  {app.stage && <span className="bg-neutral-800 px-2 py-0.5 rounded">{STAGE_LABEL[app.stage] ?? app.stage}</span>}
                  <span>{new Date(app.created_at).toLocaleDateString("ko-KR")}</span>
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </div>
              </div>
              {app.intro && (
                <p className="text-neutral-400 text-sm mt-2 line-clamp-1">{app.intro}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                  <p className="text-neutral-400 text-sm">{selected.email}{selected.phone && ` · ${selected.phone}`}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-white text-xl">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                {selected.field && (
                  <div className="bg-neutral-800 rounded-lg p-3">
                    <div className="text-neutral-500 text-xs mb-1">희망 분야</div>
                    <div className="text-white">{FIELD_LABEL[selected.field] ?? selected.field}</div>
                  </div>
                )}
                {selected.stage && (
                  <div className="bg-neutral-800 rounded-lg p-3">
                    <div className="text-neutral-500 text-xs mb-1">현재 단계</div>
                    <div className="text-white">{STAGE_LABEL[selected.stage] ?? selected.stage}</div>
                  </div>
                )}
              </div>

              {selected.intro && (
                <div className="mb-4">
                  <div className="text-neutral-500 text-xs mb-1">자기 소개</div>
                  <p className="text-neutral-300 text-sm whitespace-pre-wrap bg-neutral-800 rounded-lg p-3">{selected.intro}</p>
                </div>
              )}
              {selected.goal && (
                <div className="mb-4">
                  <div className="text-neutral-500 text-xs mb-1">원하는 방향</div>
                  <p className="text-neutral-300 text-sm whitespace-pre-wrap bg-neutral-800 rounded-lg p-3">{selected.goal}</p>
                </div>
              )}
              {selected.portfolio_url && (
                <div className="mb-4">
                  <div className="text-neutral-500 text-xs mb-1">포트폴리오</div>
                  <a href={selected.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline text-sm break-all">{selected.portfolio_url}</a>
                </div>
              )}

              <hr className="border-neutral-700 my-4" />

              <div className="mb-4">
                <label className="text-neutral-500 text-xs mb-1 block">상태 변경</label>
                <select
                  value={statusDraft}
                  onChange={e => setStatusDraft(e.target.value as Application["status"])}
                  className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-neutral-500"
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="text-neutral-500 text-xs mb-1 block">내부 메모</label>
                <textarea
                  value={notesDraft}
                  onChange={e => setNotesDraft(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-500 resize-none"
                  placeholder="심사 메모 (내부용)"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg text-sm text-neutral-300 hover:text-white">취소</button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
