"use client";

/**
 * 외부 소스 관리 — 크롤링 / RSS / 뉴스레터 3탭
 * - 타입별 분리 리스트
 * - 새 대상 추가 모달
 * - 작동 검증 버튼 (헤더 fetch + 피드/이메일 형식 체크)
 */

import { useEffect, useState } from "react";
import { Radio, Rss, Mail, Globe, Loader2, Plus, CheckCircle2, XCircle, Zap, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface SourceRow {
    id: string;
    name: string;
    url: string;
    source_type: string;
    category: string | null;
    is_active: boolean;
    last_crawled_at: string | null;
    crawl_count: number;
    error_count: number;
    notes: string | null;
}

type TabType = "rss" | "web" | "newsletter";

interface VerifyResult {
    ok: boolean;
    status?: number;
    latencyMs?: number;
    contentType?: string;
    sample?: string;
    error?: string;
}

function rel(dateStr: string | null): string {
    if (!dateStr) return "-";
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 60) return `${d}분 전`;
    const h = Math.floor(d / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

const TAB_META: Record<TabType, { label: string; icon: typeof Rss; color: string; placeholder: string; urlHint: string }> = {
    rss: { label: "RSS", icon: Rss, color: "text-amber-600",
           placeholder: "https://example.com/feed.xml", urlHint: "RSS/Atom 피드 URL (XML)" },
    web: { label: "웹 크롤링", icon: Globe, color: "text-emerald-600",
           placeholder: "https://example.com/blog", urlHint: "크롤링 대상 웹 페이지 URL" },
    newsletter: { label: "뉴스레터 (Gmail)", icon: Mail, color: "text-cyan-600",
                  placeholder: "mailto:your@gmail.com", urlHint: "Gmail로 받는 뉴스레터 주소 (mailto:email)" },
};

export default function ExternalSourcesPage() {
    const [loading, setLoading] = useState(true);
    const [sources, setSources] = useState<SourceRow[]>([]);
    const [tab, setTab] = useState<TabType>("rss");
    const [showAdd, setShowAdd] = useState(false);
    const [verifyMap, setVerifyMap] = useState<Record<string, VerifyResult | "pending">>({});

    async function loadSources() {
        const sb = createClient();
        const { data } = await sb.from("mindle_sources").select("*").order("last_crawled_at", { ascending: false, nullsFirst: false });
        setSources(data ?? []);
    }

    useEffect(() => {
        loadSources().finally(() => setLoading(false));
    }, []);

    async function handleVerify(src: SourceRow) {
        setVerifyMap(m => ({ ...m, [src.id]: "pending" }));
        try {
            const res = await fetch("/api/external/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: src.source_type, url: src.url }),
            });
            const j = await res.json();
            setVerifyMap(m => ({ ...m, [src.id]: j }));
        } catch (e) {
            setVerifyMap(m => ({ ...m, [src.id]: { ok: false, error: String(e) } }));
        }
    }

    const filtered = sources.filter(s => s.source_type === tab);
    const TabIcon = TAB_META[tab].icon;

    return (
        <div className="space-y-6">
            <PageHeader title="외부 소스 관리" description="크롤링 · RSS · 뉴스레터 — 대상 등록 및 작동 검증" />

            {/* SSOT 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-900 leading-relaxed">
                <strong>소스 편집 허브입니다.</strong> 이 페이지에서 추가·수정·검증한 내용은
                <span className="mx-1">INTEL &gt; Whole See</span>(수집 현황 모니터링)에 자동 반영됩니다 —
                단일 테이블 <code className="font-mono bg-blue-100 px-1 rounded">mindle_sources</code> SSOT.
            </div>

            {/* Tab nav */}
            <div className="flex items-center gap-2 border-b border-neutral-200">
                {(Object.keys(TAB_META) as TabType[]).map(t => {
                    const meta = TAB_META[t];
                    const Icon = meta.icon;
                    const count = sources.filter(s => s.source_type === t).length;
                    return (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors ${
                                tab === t ? "border-neutral-900 text-neutral-900 font-semibold" : "border-transparent text-neutral-500 hover:text-neutral-800"
                            }`}>
                            <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                            {meta.label}
                            <span className="text-[10px] text-neutral-400">({count})</span>
                        </button>
                    );
                })}
                <div className="flex-1" />
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-700 rounded">
                    <Plus className="h-3 w-3" /> {TAB_META[tab].label} 추가
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
            ) : filtered.length === 0 ? (
                <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-8 text-center text-xs text-neutral-400">
                    <TabIcon className={`h-6 w-6 mx-auto mb-2 ${TAB_META[tab].color}`} />
                    <p>등록된 {TAB_META[tab].label} 소스가 없습니다.</p>
                    <button onClick={() => setShowAdd(true)} className="mt-2 text-neutral-700 underline font-semibold">지금 추가</button>
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">이름</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">URL</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">카테고리</th>
                                <th className="text-right px-3 py-2 font-semibold text-neutral-600">크롤</th>
                                <th className="text-right px-3 py-2 font-semibold text-neutral-600">오류</th>
                                <th className="text-right px-3 py-2 font-semibold text-neutral-600">최근</th>
                                <th className="text-center px-3 py-2 font-semibold text-neutral-600">상태</th>
                                <th className="text-center px-3 py-2 font-semibold text-neutral-600">검증</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => {
                                const v = verifyMap[s.id];
                                const pending = v === "pending";
                                const result = (v && v !== "pending") ? v as VerifyResult : null;
                                return (
                                    <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                        <td className="px-3 py-1.5 font-medium text-neutral-900">{s.name}</td>
                                        <td className="px-3 py-1.5 text-neutral-500 truncate max-w-[260px]">{s.url}</td>
                                        <td className="px-3 py-1.5 text-neutral-500">{s.category || "-"}</td>
                                        <td className="px-3 py-1.5 text-right text-neutral-700">{s.crawl_count}</td>
                                        <td className={`px-3 py-1.5 text-right ${s.error_count > 0 ? "text-rose-600 font-semibold" : "text-neutral-400"}`}>{s.error_count}</td>
                                        <td className="px-3 py-1.5 text-right text-neutral-500">{rel(s.last_crawled_at)}</td>
                                        <td className="px-3 py-1.5 text-center">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                                                {s.is_active ? "활성" : "정지"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-center">
                                            {pending ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin inline text-neutral-400" />
                                            ) : result ? (
                                                <span title={result.error || `${result.status} · ${result.latencyMs}ms`}
                                                    className={`inline-flex items-center gap-1 text-[10px] font-semibold cursor-help ${result.ok ? "text-emerald-700" : "text-rose-600"}`}
                                                    onClick={() => handleVerify(s)}>
                                                    {result.ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                    {result.ok ? `${result.status}·${result.latencyMs}ms` : "실패"}
                                                </span>
                                            ) : (
                                                <button onClick={() => handleVerify(s)}
                                                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-semibold">
                                                    <Zap className="h-3 w-3" /> 검증
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Batch verify */}
            {filtered.length > 0 && (
                <button onClick={() => filtered.forEach(handleVerify)}
                    className="flex items-center gap-1 text-xs text-neutral-700 hover:text-neutral-900">
                    <RefreshCw className="h-3 w-3" /> 현재 탭 전체 검증
                </button>
            )}

            {/* Add modal */}
            {showAdd && (
                <AddSourceModal
                    defaultType={tab}
                    onClose={() => setShowAdd(false)}
                    onAdded={async () => { setShowAdd(false); await loadSources(); }}
                />
            )}
        </div>
    );
}

function AddSourceModal({ defaultType, onClose, onAdded }: {
    defaultType: TabType;
    onClose: () => void;
    onAdded: () => void;
}) {
    const [type, setType] = useState<TabType>(defaultType);
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [category, setCategory] = useState("general");
    const [notes, setNotes] = useState("");
    const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function verify() {
        if (!url) return;
        setVerifying(true);
        setVerifyResult(null);
        try {
            const res = await fetch("/api/external/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, url }),
            });
            setVerifyResult(await res.json());
        } finally {
            setVerifying(false);
        }
    }

    async function save() {
        if (!name || !url) { setError("이름과 URL 필수"); return; }
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/external/sources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, url, name, category, notes }),
            });
            const j = await res.json();
            if (!j.ok) { setError(j.error || "저장 실패"); setSaving(false); return; }
            onAdded();
        } catch (e) {
            setError(String(e));
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-sm font-semibold text-neutral-900 mb-4">외부 소스 추가</h2>

                <div className="space-y-3">
                    <div>
                        <label className="text-[11px] font-semibold text-neutral-700 mb-1 block">타입</label>
                        <div className="flex gap-2">
                            {(Object.keys(TAB_META) as TabType[]).map(t => {
                                const Icon = TAB_META[t].icon;
                                return (
                                    <button key={t} onClick={() => setType(t)}
                                        className={`flex-1 px-3 py-1.5 text-xs rounded border flex items-center justify-center gap-1 ${
                                            type === t ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-200"
                                        }`}>
                                        <Icon className="h-3.5 w-3.5" /> {TAB_META[t].label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-semibold text-neutral-700 mb-1 block">이름 *</label>
                        <input value={name} onChange={e => setName(e.target.value)}
                            placeholder="예: Anthropic Newsroom"
                            className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded" />
                    </div>

                    <div>
                        <label className="text-[11px] font-semibold text-neutral-700 mb-1 block">URL *</label>
                        <input value={url} onChange={e => setUrl(e.target.value)}
                            placeholder={TAB_META[type].placeholder}
                            className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded font-mono" />
                        <p className="text-[10px] text-neutral-500 mt-1">{TAB_META[type].urlHint}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[11px] font-semibold text-neutral-700 mb-1 block">카테고리</label>
                            <input value={category} onChange={e => setCategory(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded" />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-neutral-700 mb-1 block">메모</label>
                            <input value={notes} onChange={e => setNotes(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded" />
                        </div>
                    </div>

                    {/* Verify */}
                    <div className="bg-neutral-50 rounded p-3 text-[11px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-neutral-900">작동 검증</span>
                            <button onClick={verify} disabled={!url || verifying}
                                className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded disabled:opacity-50">
                                {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                                {verifying ? "검증 중…" : "지금 검증"}
                            </button>
                        </div>
                        {!verifyResult ? (
                            <p className="text-neutral-500">저장 전에 URL이 작동하는지 확인하세요.</p>
                        ) : verifyResult.ok ? (
                            <div className="text-emerald-700">
                                <p className="font-semibold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {verifyResult.status} · {verifyResult.latencyMs}ms</p>
                                {verifyResult.contentType && <p className="text-neutral-500">type: {verifyResult.contentType}</p>}
                                {verifyResult.sample && <p className="text-neutral-500 font-mono text-[10px] mt-1 truncate">{verifyResult.sample}</p>}
                            </div>
                        ) : (
                            <p className="text-rose-700 font-semibold flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> {verifyResult.error || `HTTP ${verifyResult.status}`}
                            </p>
                        )}
                    </div>

                    {error && (
                        <p className="text-rose-600 text-[11px]">{error}</p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-5">
                    <button onClick={onClose} className="px-4 py-1.5 text-xs border border-neutral-200 rounded hover:bg-neutral-50">취소</button>
                    <button onClick={save} disabled={saving}
                        className="px-4 py-1.5 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-700 disabled:opacity-50">
                        {saving ? "저장 중…" : "저장"}
                    </button>
                </div>
            </div>
        </div>
    );
}
