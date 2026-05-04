"use client";

// 임포트 허브 — 모든 외부 백업 임포트를 한 곳에서
//
// Phase 0~9에 걸쳐 만든 임포터 7종:
//   1. Instagram / Facebook (Meta GDPR ZIP) — Phase 3
//   2. Apple Health (export.xml) — Phase 7
//   3. Google Timeline (Semantic JSON ZIP) — Phase 9
//   4. Apple Photos (사진 앱 내보내기 ZIP) — Phase 9

import { useEffect, useRef, useState } from "react";
import { Loader2, Archive, Heart, MapPin, Camera, CheckCircle2 } from "lucide-react";

interface ImportTarget {
    key: string;
    label: string;
    description: string;
    accept: string;
    endpoint: string;
    icon: typeof Archive;
    instructions: string;
}

const TARGETS: ImportTarget[] = [
    {
        key: "meta",
        label: "Instagram / Facebook",
        description: "사진·영상 + 캡션을 9 영역으로 자동 분류",
        accept: ".zip",
        endpoint: "/api/myverse/moments/import-meta",
        icon: Archive,
        instructions: "Instagram: 설정 → 정보 다운로드 → JSON / Facebook: 설정 → 정보 다운로드 → JSON",
    },
    {
        key: "apple-health",
        label: "Apple Health",
        description: "운동·수면을 BODY 영역으로 동기화",
        accept: ".xml,.zip",
        endpoint: "/api/myverse/health/apple/import",
        icon: Heart,
        instructions: "iOS 건강앱 → 우상단 프로필 → 건강 데이터 내보내기 → ZIP 그대로 업로드",
    },
    {
        key: "google-timeline",
        label: "Google Timeline",
        description: "방문 장소 + 이동 동선을 시간 영역으로",
        accept: ".zip,.json",
        endpoint: "/api/myverse/import/google-timeline",
        icon: MapPin,
        instructions: "Google Takeout → 위치 기록 (Timeline) 선택 → ZIP 다운로드. Semantic Location History 폴더가 필요",
    },
    {
        key: "apple-photos",
        label: "Apple Photos",
        description: "사진·영상 + EXIF + GPS를 9 영역으로",
        accept: ".zip",
        endpoint: "/api/myverse/import/apple-photos",
        icon: Camera,
        instructions: "사진 앱 → 사진 선택 → 파일 → 내보내기 → '사용하지 않은 원본 내보내기'로 ZIP 압축 후 업로드",
    },
];

interface ImportResult {
    target: string;
    inserted: number;
    skipped: number;
    failed?: number;
    summary?: Record<string, unknown>;
    error?: string;
}

interface ImportLog {
    id: string;
    source: string;
    items_imported: number;
    items_skipped: number;
    items_failed: number;
    started_at: string;
    completed_at: string | null;
    summary: Record<string, unknown> | null;
}

export default function ImportsPage() {
    const [importing, setImporting] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, ImportResult | null>>({});
    const [logs, setLogs] = useState<ImportLog[]>([]);
    const [loading, setLoading] = useState(true);
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    async function loadLogs() {
        try {
            const res = await fetch("/api/myverse/imports");
            if (res.ok) {
                const j = await res.json();
                setLogs(j.imports ?? []);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadLogs(); }, []);

    async function importFile(target: ImportTarget, file: File) {
        setImporting(target.key);
        setResults(prev => ({ ...prev, [target.key]: null }));
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch(target.endpoint, { method: "POST", body: form });
            const json = await res.json();
            if (!res.ok) {
                setResults(prev => ({ ...prev, [target.key]: { target: target.key, inserted: 0, skipped: 0, error: json.error ?? `HTTP ${res.status}` } }));
            } else {
                setResults(prev => ({ ...prev, [target.key]: { target: target.key, inserted: json.inserted ?? json.total_inserted ?? 0, skipped: json.skipped ?? 0, summary: json } }));
                await loadLogs();
            }
        } catch (e) {
            setResults(prev => ({ ...prev, [target.key]: { target: target.key, inserted: 0, skipped: 0, error: (e as Error).message } }));
        } finally {
            setImporting(null);
        }
    }

    return (
        <div>
            <header className="px-6 pt-6 pb-3 border-b border-neutral-200 bg-white">
                <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest text-[#6366F1]">
                    <Archive className="h-3 w-3" /> Imports
                </div>
                <h1 className="text-2xl font-serif text-neutral-900">백업 가져오기</h1>
                <p className="text-xs text-neutral-500 mt-1">
                    내 디지털 흔적을 마이버스로 회수합니다 — Instagram·Facebook·Apple·Google
                </p>
            </header>

            {/* 임포트 타겟 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                {TARGETS.map(t => {
                    const Icon = t.icon;
                    const result = results[t.key];
                    const isImporting = importing === t.key;
                    return (
                        <div key={t.key} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-start gap-3 mb-3">
                                <Icon className="h-5 w-5 text-[#6366F1] shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-neutral-900">{t.label}</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">{t.instructions}</p>
                            <input
                                ref={(el) => { fileRefs.current[t.key] = el; }}
                                type="file"
                                accept={t.accept}
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) importFile(t, f);
                                    e.target.value = "";
                                }}
                            />
                            <button
                                onClick={() => fileRefs.current[t.key]?.click()}
                                disabled={isImporting}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {isImporting ? (
                                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> 가져오는 중…</>
                                ) : (
                                    <><Archive className="h-3.5 w-3.5" /> 파일 선택</>
                                )}
                            </button>

                            {result && !result.error && (
                                <div className="mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-700 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    가져옴 {result.inserted}건 · 건너뜀 {result.skipped}건
                                </div>
                            )}
                            {result?.error && (
                                <div className="mt-3 px-3 py-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-700">
                                    {result.error}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 임포트 이력 */}
            <div className="px-4 pb-6">
                <h2 className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2 px-2">최근 이력</h2>
                {loading ? (
                    <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-neutral-300" /></div>
                ) : logs.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic text-center py-6">아직 임포트 이력이 없습니다</p>
                ) : (
                    <div className="space-y-1.5">
                        {logs.slice(0, 10).map(l => (
                            <div key={l.id} className="bg-white border border-neutral-100 rounded px-3 py-2 flex items-center gap-2 text-xs">
                                <span className="font-mono text-neutral-400 tabular-nums shrink-0">
                                    {new Date(l.started_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                                </span>
                                <span className="font-medium text-neutral-700">{l.source}</span>
                                <span className="ml-auto text-neutral-500 tabular-nums">
                                    가져옴 <b>{l.items_imported}</b>
                                    {l.items_skipped > 0 && <span className="ml-2 text-neutral-400">건너뜀 {l.items_skipped}</span>}
                                    {l.items_failed > 0 && <span className="ml-2 text-rose-500">실패 {l.items_failed}</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
