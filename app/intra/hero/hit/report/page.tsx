"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2, Circle, Search,
  ChevronDown, ChevronUp, Eye,
  X, Smartphone, Monitor, ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

// ─── 타입 ────────────────────────────────────────────────────────
interface MemberHitRow {
  member_id: string;
  name: string;
  email: string;
  joined_at: string;
  hit_a_id: string | null;
  type_code: string | null;
  disc_primary: string | null;
  mbti_type: string | null;
  hit_a_at: string | null;
  hit_b_id: string | null;
  hit_c_id: string | null;
  hit_d_id: string | null;
  hit_e_id: string | null;
  hit_f_id: string | null;
}

const LAYERS: { key: keyof MemberHitRow; label: string; path: string }[] = [
  { key: "hit_a_id", label: "A", path: "a" },
  { key: "hit_b_id", label: "B", path: "b" },
  { key: "hit_c_id", label: "C", path: "c" },
  { key: "hit_d_id", label: "D", path: "d" },
  { key: "hit_e_id", label: "E", path: "e" },
  { key: "hit_f_id", label: "F", path: "f" },
];

function completedCount(row: MemberHitRow) {
  return LAYERS.filter(l => row[l.key] !== null).length;
}

// ─── 소비자 뷰 팝업 ───────────────────────────────────────────────
function ConsumerPreviewModal({
  url, memberName, onClose,
}: {
  url: string;
  memberName: string;
  onClose: () => void;
}) {
  const [mobile, setMobile] = useState(true); // 기본: 모바일 뷰

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`relative bg-neutral-100 flex flex-col shadow-2xl transition-all duration-200 ${
        mobile ? "w-[400px] h-[820px]" : "w-[900px] h-[90vh]"
      }`}>

        {/* 팝업 헤더 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Eye className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-xs font-medium">
              소비자 화면 미리보기 — <span className="text-neutral-400">{memberName}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* 모바일/데스크탑 토글 */}
            <button
              onClick={() => setMobile(true)}
              className={`p-1.5 rounded transition-colors ${mobile ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"}`}
              title="모바일 뷰"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMobile(false)}
              className={`p-1.5 rounded transition-colors ${!mobile ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"}`}
              title="데스크탑 뷰"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            {/* 새탭으로 열기 */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title="새 탭으로 열기"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {/* 닫기 */}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* iframe */}
        <div className={`flex-1 overflow-hidden ${mobile ? "flex justify-center bg-neutral-200 p-4" : ""}`}>
          <div className={mobile ? "w-full h-full overflow-hidden rounded shadow-lg" : "w-full h-full"}>
            <iframe
              src={url}
              className="w-full h-full border-0 bg-white"
              title="소비자 리포트 미리보기"
            />
          </div>
        </div>

        {/* 모바일 뷰 홈 바 */}
        {mobile && (
          <div className="flex-shrink-0 bg-white h-6 flex items-center justify-center">
            <div className="w-24 h-1 bg-neutral-300 rounded-full" />
          </div>
        )}
      </div>

      {/* 외부 클릭으로 닫기 */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

// ─── 레이어 배지 ─────────────────────────────────────────────────
function LayerBadge({
  done, id, path, label, onPreview,
}: {
  done: boolean; id: string | null; path: string; label: string;
  onPreview: (url: string) => void;
}) {
  if (!done) {
    return (
      <span className="flex items-center gap-0.5 text-neutral-300">
        <Circle className="h-3 w-3" />
        <span className="text-[10px] font-mono">{label}</span>
      </span>
    );
  }
  return (
    <button
      onClick={() => onPreview(`/hero/hit/${path}/result/${id}`)}
      className="flex items-center gap-0.5 text-green-600 hover:text-green-700 transition-colors group"
      title={`HIT-${label} 소비자 화면 미리보기`}
    >
      <CheckCircle2 className="h-3 w-3" />
      <span className="text-[10px] font-mono font-bold group-hover:underline">{label}</span>
    </button>
  );
}

// ─── 메인 ────────────────────────────────────────────────────────
export default function HitMemberListPage() {
  const [rows, setRows] = useState<MemberHitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "joined_at" | "hit_a_at" | "count">("hit_a_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  function openPreview(url: string, name = "미리보기") {
    setPreviewUrl(url);
    setPreviewName(name);
  }

  useEffect(() => {
    const sb = createClient();
    sb
      .from("members")
      .select(`
        id,
        name,
        email,
        created_at,
        hit_a_results(id, type_code, disc_primary, mbti_type, created_at),
        hit_b_results(id),
        hit_c_results(id),
        hit_d_results(id),
        hit_e_results(id),
        hit_f_results(id)
      `)
      .order("created_at", { ascending: false })
      .limit(200)
      .then((res: { data: unknown[] | null; error: unknown }) => {
        const { data, error } = res;
        if (error || !data) { setLoading(false); return; }
        const mapped: MemberHitRow[] = (data as Record<string, unknown>[]).map(m => {
          const aArr = (m.hit_a_results as Record<string, unknown>[] | null) || [];
          const a = aArr[0] || null;
          return {
            member_id: m.id as string,
            name: m.name as string,
            email: m.email as string,
            joined_at: m.created_at as string,
            hit_a_id: a ? (a.id as string) : null,
            type_code: a ? (a.type_code as string | null) : null,
            disc_primary: a ? (a.disc_primary as string | null) : null,
            mbti_type: a ? (a.mbti_type as string | null) : null,
            hit_a_at: a ? (a.created_at as string | null) : null,
            hit_b_id: ((m.hit_b_results as Record<string, unknown>[] | null)?.[0]?.id as string) ?? null,
            hit_c_id: ((m.hit_c_results as Record<string, unknown>[] | null)?.[0]?.id as string) ?? null,
            hit_d_id: ((m.hit_d_results as Record<string, unknown>[] | null)?.[0]?.id as string) ?? null,
            hit_e_id: ((m.hit_e_results as Record<string, unknown>[] | null)?.[0]?.id as string) ?? null,
            hit_f_id: ((m.hit_f_results as Record<string, unknown>[] | null)?.[0]?.id as string) ?? null,
          };
        });
        setRows(mapped);
        setLoading(false);
      });
  }, []);

  // 검색 + 정렬
  const filtered = rows.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    (r.type_code ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let va: string | number = "";
    let vb: string | number = "";
    if (sortKey === "count") { va = completedCount(a); vb = completedCount(b); }
    else if (sortKey === "name") { va = a.name || ""; vb = b.name || ""; }
    else if (sortKey === "joined_at") { va = a.joined_at || ""; vb = b.joined_at || ""; }
    else { va = a.hit_a_at || ""; vb = b.hit_a_at || ""; }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  }
  function SortIcon({ k }: { k: typeof sortKey }) {
    if (sortKey !== k) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  const doneCount = rows.filter(r => r.hit_a_id).length;

  return (
    <>
      {/* ── 소비자 뷰 팝업 ── */}
      {previewUrl && (
        <ConsumerPreviewModal
          url={previewUrl}
          memberName={previewName}
          onClose={() => setPreviewUrl(null)}
        />
      )}

      <div>
        <PageHeader title="HIT 이용자" description="HIT 검사 완료 현황 및 소비자 리포트 미리보기">
          <button
            onClick={() => openPreview("/hero/hit/a/result/preview", "Mock 데이터")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            Mock 소비자 뷰
          </button>
        </PageHeader>

        {/* 요약 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "전체 멤버", value: rows.length },
            { label: "HIT-A 완료", value: doneCount },
            { label: "전체 레이어 완료", value: rows.filter(r => completedCount(r) === 6).length },
            { label: "미완료", value: rows.length - doneCount },
          ].map(s => (
            <div key={s.label} className="border border-neutral-200 bg-white p-4">
              <p className="text-xs text-neutral-400">{s.label}</p>
              <p className="text-2xl font-black mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* 검색 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="이름 · 이메일 · 유형 코드 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 bg-white outline-none focus:border-neutral-400 transition-colors"
          />
        </div>

        {/* 테이블 */}
        <div className="border border-neutral-200 bg-white overflow-hidden">
          {/* 헤더 */}
          <div className="grid grid-cols-[1fr_200px_120px_120px_160px_80px] text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-200 bg-neutral-50">
            <button onClick={() => toggleSort("name")} className="flex items-center gap-1 px-4 py-3 text-left hover:text-neutral-600">
              이름 / 이메일 <SortIcon k="name" />
            </button>
            <button onClick={() => toggleSort("hit_a_at")} className="flex items-center gap-1 px-4 py-3 text-left hover:text-neutral-600">
              HIT-A 결과 <SortIcon k="hit_a_at" />
            </button>
            <button onClick={() => toggleSort("count")} className="flex items-center gap-1 px-4 py-3 text-left hover:text-neutral-600">
              완료 현황 <SortIcon k="count" />
            </button>
            <div className="px-4 py-3">레이어</div>
            <button onClick={() => toggleSort("joined_at")} className="flex items-center gap-1 px-4 py-3 text-left hover:text-neutral-600">
              가입일 <SortIcon k="joined_at" />
            </button>
            <div className="px-4 py-3">리포트</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-400">검색 결과 없음</div>
          ) : (
            sorted.map((row, i) => {
              const cnt = completedCount(row);
              return (
                <div
                  key={row.member_id}
                  className={`grid grid-cols-[1fr_200px_120px_120px_160px_80px] items-center border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${i % 2 === 1 ? "bg-neutral-50/50" : ""}`}
                >
                  {/* 이름/이메일 */}
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-neutral-800">{row.name || "—"}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{row.email}</p>
                  </div>

                  {/* HIT-A 결과 */}
                  <div className="px-4 py-3">
                    {row.type_code ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">{row.type_code}</span>
                          {row.disc_primary && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-900 text-white font-bold">{row.disc_primary}</span>
                          )}
                          {row.mbti_type && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{row.mbti_type}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {row.hit_a_at ? new Date(row.hit_a_at).toLocaleDateString("ko-KR") : ""}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-300">미완료</span>
                    )}
                  </div>

                  {/* 완료 현황 */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cnt === 6 ? "bg-green-500" : cnt >= 3 ? "bg-neutral-700" : cnt >= 1 ? "bg-neutral-400" : "bg-neutral-200"}`}
                          style={{ width: `${(cnt / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-500 w-6">{cnt}/6</span>
                    </div>
                  </div>

                  {/* 레이어 뱃지 */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {LAYERS.map(l => (
                        <LayerBadge
                          key={l.key}
                          done={!!row[l.key]}
                          id={row[l.key] as string | null}
                          path={l.path}
                          label={l.label}
                          onPreview={(url) => openPreview(url, row.name)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 가입일 */}
                  <div className="px-4 py-3 text-xs text-neutral-400">
                    {row.joined_at ? new Date(row.joined_at).toLocaleDateString("ko-KR") : "—"}
                  </div>

                  {/* 리포트 버튼 */}
                  <div className="px-4 py-3">
                    {row.hit_a_id ? (
                      <button
                        onClick={() => openPreview(`/hero/hit/a/result/${row.hit_a_id}`, row.name)}
                        className="text-xs text-[#E53935] hover:underline font-medium flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> 보기
                      </button>
                    ) : (
                      <span className="text-xs text-neutral-300">—</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="mt-4 text-xs text-neutral-400">
          레이어 뱃지(A~F) 또는 "보기" 클릭 → 소비자 리포트 팝업 · 팝업 내 모바일/데스크탑 전환 가능
        </p>
      </div>
    </>
  );
}
