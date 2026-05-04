"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Loader2, ChevronLeft, ChevronRight, LayoutTemplate, X, Maximize2, Pencil, PenLine, Search, Star, Image as ImageIcon, GripVertical, Type } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveTemplateContent, isSpecialTemplate, tplDataKey } from "@/lib/planners/templates";
import { renderFramework, type FrameworkData } from "./TemplatesView";
import { Track } from "@/lib/analytics";
import { HandNote, isHandwritingContent, parseHandwriting, serializeHandwriting, extractTextPart, setTextPart, setHandPart, type HandNoteData } from "./HandNote";
import { CornellRowsInline, type CornellRow } from "./DailyView";
import { getRecommendedTemplateKeys, TOP_RECOMMENDED } from "@/lib/planners/template-recommendations";
import { ConfirmSheet } from "./ConfirmSheet";
import { CanvasStudio } from "./CanvasStudio";

// Embedded marker so we can persist template metadata in the existing
// project_notes.content column without a DB migration. Format:
//   <!-- planners:tpl=<key>|label=<label> -->\n<body>
const TPL_MARKER_RE = /^<!--\s*planners:tpl=([a-z0-9_-]+)(?:\|label=([^>]*?))?\s*-->\n?/;
function parseTemplateMarker(content: string | null): { key: string; label: string; body: string } | null {
    if (!content) return null;
    const m = content.match(TPL_MARKER_RE);
    if (!m) return null;
    return { key: m[1], label: (m[2] ?? '').trim(), body: content.slice(m[0].length) };
}
function buildTemplateContent(key: string, label: string, body: string): string {
    return `<!-- planners:tpl=${key}|label=${label.replace(/[\r\n>]/g, ' ').trim()} -->\n${body}`;
}

// 캔버스 노트 마커 — 캔버스 id를 노트 content에 임베드 (DB 마이그레이션 없이)
const CANVAS_MARKER_RE = /^<!--\s*planners:canvas=([a-zA-Z0-9_-]+)\s*-->/;
function parseCanvasMarker(content: string | null): { canvasId: string } | null {
    if (!content) return null;
    const m = content.match(CANVAS_MARKER_RE);
    if (!m) return null;
    return { canvasId: m[1] };
}
function buildCanvasContent(canvasId: string): string {
    return `<!-- planners:canvas=${canvasId} -->`;
}

interface ProjectNote {
    id: string;
    project_id: string;
    title: string | null;
    content: string | null;
    order_index: number;
    created_at: string;
    updated_at: string;
}

interface Template {
    id: string;
    key: string;
    category: string;
    subcategory: string | null;
    label: string;
    description: string | null;
    body_md: string;
}

export function ProjectNotesTab({ projectId, projectCategory }: { projectId: string; projectCategory?: string | null }) {
    const [notes, setNotes] = useState<ProjectNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [picker, setPicker] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [tplLoading, setTplLoading] = useState(false);
    const [tplQuery, setTplQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<"all" | "favs" | "recommended" | "framework" | "schedule" | "note">("all");
    const [tplFavs, setTplFavs] = useState<Set<string>>(() => {
        if (typeof window === "undefined") return new Set();
        try { return new Set(JSON.parse(localStorage.getItem("planners_fav_templates") || "[]")); }
        catch { return new Set(); }
    });
    const [expandedNote, setExpandedNote] = useState<ProjectNote | null>(null);
    const [flashNoteId, setFlashNoteId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const noteDragRef = useRef<{ dragIdx: number; overIdx: number } | null>(null);
    // canvasId → thumbnail_url 맵
    const [canvasMap, setCanvasMap] = useState<Record<string, string | null>>({});

    async function load() {
        setLoading(true);
        const res = await fetch(`/api/planners/projects/${projectId}/notes`);
        if (res.ok) {
            const d = await res.json();
            const list: ProjectNote[] = d.notes || [];
            setNotes(list);

            // 캔버스 노트가 있으면 썸네일 일괄 로드
            const canvasIds = list
                .map(n => parseCanvasMarker(n.content)?.canvasId)
                .filter((id): id is string => !!id);
            if (canvasIds.length > 0) {
                try {
                    const cRes = await fetch("/api/planners/canvases");
                    if (cRes.ok) {
                        const cData = await cRes.json();
                        const map: Record<string, string | null> = {};
                        for (const c of cData.canvases ?? []) {
                            if (canvasIds.includes(c.id)) map[c.id] = c.thumbnail_url ?? null;
                        }
                        setCanvasMap(map);
                    }
                } catch { /* 썸네일 실패해도 노트 목록은 그대로 */ }
            }

            // 첫 진입 시 노트 0개면 기본 코넬 노트 1개 자동 생성 (Daily와 동일)
            if (list.length === 0) {
                try {
                    const cornellContent = JSON.stringify({
                        _cornell: true,
                        rows: [{ id: "r1", cue: "", note: "" }],
                        summary: "",
                    });
                    const r2 = await fetch(`/api/planners/projects/${projectId}/notes`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: "기본 노트 1", content: cornellContent }),
                    });
                    if (r2.ok) {
                        const dd = await r2.json();
                        if (dd?.note) setNotes([dd.note]);
                    }
                } catch { /* ignore — empty 상태 그대로 */ }
            }
        }
        setLoading(false);
    }

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [projectId]);

    // 카테고리 추천 템플릿 칩 노출용 — 템플릿 목록 사전 로드
    useEffect(() => {
        if (!projectCategory || templates.length > 0) return;
        (async () => {
            try {
                const res = await fetch(`/api/planners/templates`);
                if (res.ok) {
                    const d = await res.json();
                    setTemplates(d.templates || []);
                }
            } catch {}
        })();
    }, [projectCategory, templates.length]);

    async function addBlankNote() {
        setSaving(true);
        try {
            const idx = notes.filter(n => !(n.content ?? "").includes("planners:handwriting") && !(n.content ?? "").includes("planners-template")).length + 1;
            // 코넬 포맷으로 생성 — Daily와 동일한 SSOT 형식
            const cornellContent = JSON.stringify({
                _cornell: true,
                rows: [{ id: "r1", cue: "", note: "" }],
                summary: "",
            });
            const res = await fetch(`/api/planners/projects/${projectId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: `기본 노트 ${idx}`, content: cornellContent }),
            });
            if (res.ok) {
                const d = await res.json();
                setNotes([...notes, d.note]);
            } else {
                const err = await res.json().catch(() => ({}));
                console.error("note add failed", err);
                alert(`노트 추가 실패: ${err.error || res.status}`);
            }
        } catch (e) {
            alert(`네트워크 오류: ${(e as Error).message}`);
        } finally { setSaving(false); }
    }

    async function openPicker() {
        setPicker(true);
        setTplQuery("");
        setCategoryFilter("all");
        if (templates.length === 0) {
            setTplLoading(true);
            try {
                const res = await fetch(`/api/planners/templates`);
                if (res.ok) {
                    const d = await res.json();
                    setTemplates(d.templates || []);
                }
            } finally {
                setTplLoading(false);
            }
        }
    }

    function toggleFav(id: string) {
        setTplFavs(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            try { localStorage.setItem("planners_fav_templates", JSON.stringify([...next])); } catch { /* ignore */ }
            return next;
        });
    }

    async function insertFromTemplate(tpl: Template) {
        setSaving(true);
        try {
            const body = resolveTemplateContent(tpl);
            const content = buildTemplateContent(tpl.key, tpl.label, body);
            // 사용자가 자기 제목을 쓰도록 title은 빈 값 (placeholder가 템플릿 이름 안내)
            const res = await fetch(`/api/planners/projects/${projectId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "", content }),
            });
            if (res.ok) {
                const d = await res.json();
                const newNote = d.note as ProjectNote;
                setNotes([...notes, newNote]);
                setPicker(false);
                Track.templateInsert({ template_key: tpl.key, template_label: tpl.label, surface: "project" });
                // 시각 피드백 — 새 노트로 스크롤 + 1.5s 깜빡임
                setFlashNoteId(newNote.id);
                setTimeout(() => {
                    document.getElementById(`note-${newNote.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 50);
                setTimeout(() => setFlashNoteId(null), 1800);
            } else {
                const err = await res.json().catch(() => ({}));
                console.error("template insert failed", err);
                alert(`템플릿 삽입 실패: ${err.error || res.status}`);
            }
        } catch (e) {
            alert(`네트워크 오류: ${(e as Error).message}`);
        } finally { setSaving(false); }
    }

    async function updateNote(id: string, patch: Partial<ProjectNote>) {
        setSaving(true);
        try {
            await fetch(`/api/planners/projects/${projectId}/notes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            setNotes(notes.map(n => n.id === id ? { ...n, ...patch } : n));
        } finally { setSaving(false); }
    }

    async function deleteNote(id: string) {
        setSaving(true);
        try {
            await fetch(`/api/planners/projects/${projectId}/notes/${id}`, { method: "DELETE" });
            setNotes(notes.filter(n => n.id !== id));
        } finally { setSaving(false); }
    }

    async function reorder(id: string, direction: "up" | "down") {
        const idx = notes.findIndex(n => n.id === id);
        const other = direction === "up" ? idx - 1 : idx + 1;
        if (other < 0 || other >= notes.length) return;

        const a = notes[idx];
        const b = notes[other];
        setNotes(notes.map(n => {
            if (n.id === a.id) return { ...n, order_index: b.order_index };
            if (n.id === b.id) return { ...n, order_index: a.order_index };
            return n;
        }).sort((x, y) => x.order_index - y.order_index));

        await Promise.all([
            fetch(`/api/planners/projects/${projectId}/notes/${a.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_index: b.order_index }),
            }),
            fetch(`/api/planners/projects/${projectId}/notes/${b.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_index: a.order_index }),
            }),
        ]);
    }

    const filteredTpl = templates.filter(t => {
        if (categoryFilter === "favs" && !tplFavs.has(t.id)) return false;
        if (categoryFilter === "recommended" && !TOP_RECOMMENDED.includes(t.key)) return false;
        if (categoryFilter !== "all" && categoryFilter !== "favs" && categoryFilter !== "recommended" && t.category !== categoryFilter) return false;
        if (tplQuery) {
            const q = tplQuery.toLowerCase();
            return t.label.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
        }
        return true;
    });

    if (loading) {
        return <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>;
    }

    const recommendedTpls = (() => {
        const keys = getRecommendedTemplateKeys(projectCategory);
        if (keys.length === 0) return [] as Template[];
        return keys
            .map(k => templates.find(t => t.key === k))
            .filter((t): t is Template => !!t)
            .slice(0, 6);
    })();

    return (
        <div className="space-y-4">
            {/* Action bar — 4종 노트 옵션 */}
            <div className="grid grid-cols-4 gap-2">
                <button
                    onClick={addBlankNote}
                    disabled={saving}
                    className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors disabled:opacity-50"
                >
                    <Plus className="h-3.5 w-3.5" /> 기본 노트
                </button>
                <button
                    onClick={async () => {
                        const res = await fetch(`/api/planners/projects/${projectId}/notes`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                title: `손글씨 ${notes.filter(n => (n.content ?? "").includes("planners:handwriting")).length + 1}`,
                                content: "<!-- planners:handwriting -->\n" + JSON.stringify({ strokes: [], width: 600, height: 320 })
                            }),
                        });
                        if (res.ok) {
                            const d = await res.json();
                            setNotes([...notes, d.note]);
                        } else {
                            const err = await res.json().catch(() => ({}));
                            alert(`손글씨 추가 실패: ${err.error || res.status}`);
                        }
                    }}
                    disabled={saving}
                    title="Apple Pencil · S Pen · 마우스로 직접 쓰기"
                    className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors disabled:opacity-50"
                >
                    <Pencil className="h-3.5 w-3.5" /> 손글씨
                </button>
                <button
                    onClick={openPicker}
                    disabled={saving}
                    className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-violet-400 hover:text-violet-600 transition-colors disabled:opacity-50"
                >
                    <LayoutTemplate className="h-3.5 w-3.5" /> 템플릿
                </button>
                <button
                    onClick={async () => {
                        setSaving(true);
                        try {
                            const idx = notes.filter(n => parseCanvasMarker(n.content)).length + 1;
                            const cTitle = `캔버스 ${idx}`;
                            const cRes = await fetch("/api/planners/canvases", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ title: cTitle }),
                            });
                            if (!cRes.ok) {
                                const err = await cRes.json().catch(() => ({}));
                                alert(`캔버스 생성 실패: ${err.error || cRes.status}`);
                                return;
                            }
                            const cData = await cRes.json();
                            const canvasId = cData.canvas.id as string;
                            const nRes = await fetch(`/api/planners/projects/${projectId}/notes`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ title: cTitle, content: buildCanvasContent(canvasId) }),
                            });
                            if (nRes.ok) {
                                const d = await nRes.json();
                                setNotes([...notes, d.note]);
                            } else {
                                const err = await nRes.json().catch(() => ({}));
                                alert(`노트 추가 실패: ${err.error || nRes.status}`);
                            }
                        } catch (e) {
                            alert(`네트워크 오류: ${(e as Error).message}`);
                        } finally { setSaving(false); }
                    }}
                    disabled={saving}
                    title="자유 캔버스 — 그림·도형·텍스트"
                    className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-sky-400 hover:text-sky-600 transition-colors disabled:opacity-50"
                >
                    <ImageIcon className="h-3.5 w-3.5" /> 캔버스
                </button>
            </div>

            {/* Notes */}
            {notes.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
                    <p className="text-neutral-500">이 프로젝트에 아직 노트가 없습니다.</p>
                    <p className="text-xs text-neutral-400 mt-2">
                        빈 노트를 추가하거나 템플릿(SWOT·OKR·만다라트 등)을 삽입해 보세요.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {notes.map((note, i) => {
                        const canvasId = parseCanvasMarker(note.content)?.canvasId ?? null;
                        return (
                        <div
                            key={note.id}
                            draggable
                            onDragStart={() => { noteDragRef.current = { dragIdx: i, overIdx: i }; }}
                            onDragOver={(e) => { e.preventDefault(); if (noteDragRef.current) noteDragRef.current.overIdx = i; }}
                            onDrop={() => {
                                if (!noteDragRef.current) return;
                                const { dragIdx, overIdx } = noteDragRef.current;
                                if (dragIdx === overIdx) { noteDragRef.current = null; return; }
                                const next = [...notes];
                                const [moved] = next.splice(dragIdx, 1);
                                next.splice(overIdx, 0, moved);
                                const reindexed = next.map((n, idx) => ({ ...n, order_index: idx }));
                                setNotes(reindexed);
                                reindexed.forEach(n => {
                                    fetch(`/api/planners/projects/${projectId}/notes/${n.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ order_index: n.order_index }),
                                    });
                                });
                                noteDragRef.current = null;
                            }}
                            onDragEnd={() => { noteDragRef.current = null; }}
                            id={`note-${note.id}`}
                            className={`transition-shadow rounded-xl ${flashNoteId === note.id ? "ring-2 ring-violet-300 ring-offset-2 shadow-lg" : ""}`}
                        >
                            <NoteCard
                                note={note}
                                canvasThumbnail={canvasId ? (canvasMap[canvasId] ?? null) : null}
                                onUpdate={(p) => updateNote(note.id, p)}
                                onDelete={() => setConfirmDeleteId(note.id)}
                                onExpand={() => setExpandedNote(note)}
                            />
                        </div>
                        );
                    })}
                </div>
            )}

            {/* Note expand modal */}
            {expandedNote && (
                <NoteExpandModal
                    note={expandedNote}
                    onClose={() => setExpandedNote(null)}
                    onSave={(patch) => {
                        updateNote(expandedNote.id, patch);
                        setExpandedNote({ ...expandedNote, ...patch });
                    }}
                />
            )}

            <ConfirmSheet
                open={!!confirmDeleteId}
                message={`"${notes.find(n => n.id === confirmDeleteId)?.title || '이 노트'}"를 삭제할까요?`}
                onConfirm={() => { const id = confirmDeleteId!; setConfirmDeleteId(null); deleteNote(id); }}
                onCancel={() => setConfirmDeleteId(null)}
            />

            {/* Template picker */}
            {picker && (
                <div
                    className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 px-0 sm:px-4"
                    onClick={() => setPicker(false)}
                >
                    <div
                        className="pp-view bg-white w-full sm:max-w-xl rounded-b-2xl sm:rounded-2xl flex flex-col h-[85vh] sm:h-[640px] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 shrink-0">
                            <div className="flex items-center gap-2">
                                <LayoutTemplate className="h-4 w-4 text-[#0F766E]" />
                                <span className="font-semibold text-sm text-neutral-900">템플릿에서 삽입</span>
                            </div>
                            <button onClick={() => setPicker(false)} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">닫기</button>
                        </div>

                        {/* Search + Filter */}
                        <div className="px-5 pt-3 pb-2 shrink-0 space-y-2">
                            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
                                <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                <input
                                    value={tplQuery}
                                    onChange={(e) => setTplQuery(e.target.value)}
                                    placeholder="템플릿 검색…"
                                    autoFocus
                                    className="flex-1 text-sm bg-transparent focus:outline-none text-neutral-900 placeholder:text-neutral-400"
                                />
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {(["all", "favs", "recommended", "framework", "schedule", "note"] as const).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCategoryFilter(c)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                            categoryFilter === c
                                                ? c === "favs" ? "bg-amber-500 text-white"
                                                : c === "recommended" ? "bg-rose-500 text-white"
                                                : c === "framework" ? "bg-violet-600 text-white"
                                                : c === "schedule" ? "bg-teal-600 text-white"
                                                : c === "note" ? "bg-amber-500 text-white"
                                                : "bg-neutral-900 text-white"
                                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {c === "all" ? "전체" : c === "favs" ? "⭐ 즐겨찾기" : c === "recommended" ? "📈 추천" : c === "framework" ? "프레임워크" : c === "schedule" ? "스케줄" : "노트"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 px-5 pb-5">
                            {tplLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                                </div>
                            ) : filteredTpl.length === 0 ? (
                                <p className="text-sm text-neutral-400 text-center py-8">
                                    {categoryFilter === "favs" ? "즐겨찾기한 템플릿이 없습니다" : "템플릿이 없습니다"}
                                </p>
                            ) : (
                                <div className="space-y-1.5 mt-1">
                                    {filteredTpl.map(tpl => {
                                        const barColor = tpl.category === "framework" ? "bg-violet-500" : tpl.category === "schedule" ? "bg-teal-500" : "bg-amber-400";
                                        const isFav = tplFavs.has(tpl.id);
                                        return (
                                            <div key={tpl.id} className="flex items-stretch gap-0">
                                                <button
                                                    onClick={() => insertFromTemplate(tpl)}
                                                    className="flex-1 text-left flex items-start gap-3 p-3 rounded-l-xl border border-r-0 border-neutral-200 hover:border-[#0F766E] hover:bg-[#0F766E]/5 transition-colors group"
                                                >
                                                    <div className={`w-1 self-stretch rounded-full shrink-0 ${barColor}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-neutral-900 group-hover:text-[#0F766E] transition-colors">
                                                            {tpl.label}
                                                        </p>
                                                        {tpl.description && (
                                                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{tpl.description}</p>
                                                        )}
                                                        {tpl.subcategory && (
                                                            <span className="inline-block mt-1 text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                                                {tpl.subcategory}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Plus className="h-4 w-4 text-neutral-300 group-hover:text-[#0F766E] shrink-0 mt-0.5 transition-colors" />
                                                </button>
                                                <button
                                                    onClick={() => toggleFav(tpl.id)}
                                                    className={`px-3 border border-neutral-200 rounded-r-xl transition-colors ${
                                                        isFav ? "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100" : "text-neutral-300 hover:text-amber-400 hover:bg-amber-50"
                                                    }`}
                                                    title={isFav ? "즐겨찾기 해제" : "즐겨찾기"}
                                                >
                                                    <Star className={`h-3.5 w-3.5 ${isFav ? "fill-amber-400" : ""}`} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NoteCard({
    note,
    canvasThumbnail,
    onUpdate,
    onDelete,
    onExpand,
}: {
    note: ProjectNote;
    canvasThumbnail: string | null;
    onUpdate: (p: Partial<ProjectNote>) => void;
    onDelete: () => void;
    onExpand: () => void;
}) {
    const [title, setTitle] = useState(note.title || "");
    const [editingTitle, setEditingTitle] = useState(false);
    const content = note.content || "";

    useEffect(() => {
        setTitle(note.title || "");
    }, [note.id, note.title]);

    // Canvas detection (캔버스 ID 임베드 마커)
    const canvasInfo = parseCanvasMarker(content);
    const isCanvas = !!canvasInfo;

    // Template detection
    const tplInfo = !isCanvas ? parseTemplateMarker(content) : null;
    const isTpl = !!tplInfo;
    const dataKey = isTpl ? tplDataKey(note.id) : '';
    const [fwData, setFwData] = useState<FrameworkData>(() => {
        if (!isTpl || typeof window === 'undefined') return {};
        try { return JSON.parse(localStorage.getItem(tplDataKey(note.id)) || '{}'); }
        catch { return {}; }
    });
    const handleFwChange = useCallback((k: string, v: string) => {
        if (!isTpl) return;
        setFwData(prev => {
            const next = { ...prev, [k]: v };
            try { localStorage.setItem(dataKey, JSON.stringify(next)); } catch { /* ignore */ }
            return next;
        });
    }, [dataKey, isTpl]);
    const tplMeta = tplInfo ? { id: note.id, key: tplInfo.key, label: tplInfo.label || title || '템플릿', body_md: tplInfo.body } : null;
    const hasGrid = !!(tplMeta && isSpecialTemplate(tplMeta));
    const grid = hasGrid && tplMeta ? renderFramework(tplMeta.key, tplMeta.label, fwData, handleFwChange) : null;

    // Handwriting detection (템플릿/캔버스가 아닐 때만)
    const [handMode, setHandMode] = useState<boolean>(!isTpl && !isCanvas && isHandwritingContent(content));
    useEffect(() => {
        if (isTpl || isCanvas) return;
        // 외부에서 content가 새로 들어왔을 때 — 손글씨 콘텐츠면 hand 우선, 아니면 text 우선
        setHandMode(isHandwritingContent(content));
        // 의도적으로 content만 의존
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [note.id]);
    const isHand = !isTpl && !isCanvas && handMode;
    const handData = isHand ? (parseHandwriting(content) ?? { strokes: [], width: 600, height: 240 }) : null;

    // Cornell 포맷 감지 — Daily와 동일한 SSOT JSON 구조
    const cornellData = useMemo(() => {
        if (isTpl || isHand || isCanvas || !content) return null;
        try {
            const parsed = JSON.parse(content);
            if (parsed?._cornell && Array.isArray(parsed.rows)) {
                return { rows: parsed.rows as CornellRow[], summary: typeof parsed.summary === "string" ? parsed.summary : "" };
            }
        } catch { /* not cornell */ }
        return null;
    }, [content, isTpl, isHand, isCanvas]);
    const isCornell = cornellData !== null;

    // 카드는 미리보기 전용. 편집은 NoteExpandModal에서만.

    // 노트 타입 라벨 + 아이콘
    const typeLabel = isCanvas ? "캔버스" : isHand ? "손글씨" : isTpl ? (tplInfo?.label || "템플릿") : "노트";
    const TypeIcon = isCanvas ? ImageIcon : isHand ? PenLine : isTpl ? LayoutTemplate : Type;
    const typeColor = isCanvas ? "text-sky-500" : isHand ? "text-amber-500" : isTpl ? "text-violet-500" : "text-neutral-400";
    const displayTitle = title && !/^(기본 노트|노트|손글씨|캔버스|템플릿) \d+$/.test(title) && title !== tplInfo?.label
        ? title : typeLabel;

    return (
        <section
            className="group/card bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-[#0F766E] hover:shadow-sm transition-all cursor-pointer"
            onClick={onExpand}
        >
            {/* ── 프리뷰 영역 (4:3 비율) ── */}
            <div className="aspect-[4/3] relative bg-neutral-50 border-b border-neutral-100 overflow-hidden">
                {isCanvas ? (
                    canvasThumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={canvasThumbnail} alt={title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                            <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
                                <defs><pattern id={`ng-${note.id}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0F766E" strokeWidth="0.5" /></pattern></defs>
                                <rect width="100%" height="100%" fill={`url(#ng-${note.id})`} />
                            </svg>
                            <ImageIcon className="h-6 w-6 text-neutral-200 relative z-10" />
                            <span className="text-[10px] text-neutral-300 relative z-10">미리보기 없음</span>
                        </div>
                    )
                ) : isHand ? (
                    <div className="pointer-events-none p-2 scale-[0.6] origin-top-left w-[167%] h-[167%]">
                        <HandNote value={handData} onChange={() => {}} height={180} />
                    </div>
                ) : isCornell && cornellData ? (
                    <div className="p-3 text-[10px] leading-relaxed overflow-hidden h-full relative">
                        {cornellData.rows.some(r => r.cue || r.note) ? (
                            <div className="space-y-1">
                                {cornellData.rows.slice(0, 6).map((r) => (
                                    <div key={r.id} className="flex gap-1.5">
                                        {r.cue && <span className="text-[#0F766E] font-medium shrink-0 w-14 truncate">{r.cue}</span>}
                                        <span className="text-neutral-600 line-clamp-1">{r.note}</span>
                                    </div>
                                ))}
                                {cornellData.summary && <p className="text-neutral-400 italic line-clamp-2 pt-1 border-t border-neutral-100 mt-1">{cornellData.summary}</p>}
                            </div>
                        ) : (
                            <p className="text-neutral-300 italic text-center pt-6">빈 노트</p>
                        )}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-neutral-50 to-transparent" />
                    </div>
                ) : isTpl ? (
                    <div className="p-3 text-[10px] overflow-hidden h-full relative">
                        <div className="flex items-center gap-1.5 mb-2">
                            <LayoutTemplate className="h-3 w-3 text-violet-400 shrink-0" />
                            <span className="text-violet-600 font-medium truncate">{tplInfo?.label || "템플릿"}</span>
                        </div>
                        <p className="text-neutral-500 line-clamp-6 whitespace-pre-wrap">{(tplInfo?.body || "").replace(/<!--.*?-->/gs, "").replace(/[#*`]/g, "").trim() || "빈 템플릿"}</p>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-neutral-50 to-transparent" />
                    </div>
                ) : (
                    <div className="p-3 text-[10px] overflow-hidden h-full relative">
                        {(extractTextPart(content) || "").trim() ? (
                            <p className="text-neutral-600 whitespace-pre-wrap line-clamp-[8]">{extractTextPart(content)}</p>
                        ) : (
                            <p className="text-neutral-300 italic text-center pt-6">빈 노트</p>
                        )}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-neutral-50 to-transparent" />
                    </div>
                )}
                {/* hover 오버레이 */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Maximize2 className="h-5 w-5 text-white drop-shadow" />
                </div>
            </div>

            {/* ── 푸터 ── */}
            <div className="px-3 py-2 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                <div className="min-w-0 flex-1" onClick={onExpand}>
                    {editingTitle ? (
                        <input
                            autoFocus
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => { setEditingTitle(false); onUpdate({ title }); }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { setEditingTitle(false); onUpdate({ title }); }
                                if (e.key === "Escape") { setEditingTitle(false); setTitle(note.title || ""); }
                            }}
                            className="w-full text-xs font-medium bg-transparent focus:outline-none text-neutral-900"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <p
                            className="text-xs font-medium text-neutral-800 truncate leading-snug"
                            onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(true); }}
                        >{displayTitle}</p>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                        <TypeIcon className={`h-2.5 w-2.5 shrink-0 ${typeColor}`} />
                        <span className="text-[9px] text-neutral-300">{new Date(note.updated_at).toLocaleDateString("ko-KR")}</span>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-neutral-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="삭제"
                ><Trash2 className="h-3 w-3" /></button>
            </div>
        </section>
    );
}

function NoteExpandModal({
    note,
    onClose,
    onSave,
}: {
    note: ProjectNote;
    onClose: () => void;
    onSave: (p: Partial<ProjectNote>) => void;
}) {
    const [title, setTitle] = useState(note.title || "");
    const [content, setContent] = useState(note.content || "");
    const [editing, setEditing] = useState(false);
    // null = content으로 자동 감지, false = HW 스트로크 보존하면서 텍스트 모드 강제
    const [handModeOverride, setHandModeOverride] = useState<boolean | null>(null);
    const [pageIdx, setPageIdx] = useState(0);
    const [allCornellPages, setAllCornellPages] = useState<{ rows: CornellRow[]; summary: string }[]>(() => {
        const c = note.content || '';
        if (parseTemplateMarker(c) || parseCanvasMarker(c) || isHandwritingContent(c)) return [];
        try {
            const parsed = JSON.parse(c);
            if (parsed?._cornell) {
                if (Array.isArray(parsed._pages) && parsed._pages.length > 0) return parsed._pages;
                return [{ rows: Array.isArray(parsed.rows) ? parsed.rows : [], summary: parsed.summary || '' }];
            }
        } catch { /* */ }
        return [];
    });
    const [allHandPages, setAllHandPages] = useState<HandNoteData[]>(() => {
        const c = note.content || '';
        if (!isHandwritingContent(c)) return [];
        const hw = parseHandwriting(c) as (HandNoteData & { _pages?: HandNoteData[] }) | null;
        if (!hw) return [{ strokes: [], width: 800, height: 480 }];
        return hw._pages ?? [{ strokes: hw.strokes, width: hw.width, height: hw.height }];
    });

    const canvasInfo = parseCanvasMarker(content);
    const isCanvas = !!canvasInfo;
    const tplInfo = !isCanvas ? parseTemplateMarker(content) : null;
    const isTpl = !!tplInfo;
    const dataKey = isTpl ? tplDataKey(note.id) : '';
    const [fwData, setFwData] = useState<FrameworkData>(() => {
        if (!isTpl || typeof window === 'undefined') return {};
        try { return JSON.parse(localStorage.getItem(tplDataKey(note.id)) || '{}'); }
        catch { return {}; }
    });
    const handleFwChange = useCallback((k: string, v: string) => {
        if (!isTpl) return;
        setFwData(prev => {
            const next = { ...prev, [k]: v };
            try { localStorage.setItem(dataKey, JSON.stringify(next)); } catch { /* ignore */ }
            return next;
        });
    }, [dataKey, isTpl]);
    const tplMeta = tplInfo ? { id: note.id, key: tplInfo.key, label: tplInfo.label || title || '템플릿', body_md: tplInfo.body } : null;
    const hasGrid = !!(tplMeta && isSpecialTemplate(tplMeta));
    const grid = hasGrid && tplMeta ? renderFramework(tplMeta.key, tplMeta.label, fwData, handleFwChange) : null;

    // Handwriting — handModeOverride=false: 스트로크 보존하면서 텍스트 모드
    const isHand = !isTpl && !isCanvas && (
        handModeOverride !== null ? handModeOverride : isHandwritingContent(content)
    );
    const handData = isHand ? parseHandwriting(content) : null;
    // 텍스트 편집 시 HW 스트로크를 보존하기 위한 파생 값
    const textDisplayValue = isHandwritingContent(content) ? extractTextPart(content) : content;
    function handleTextChange(v: string) {
        setContent(isHandwritingContent(content) ? setTextPart(content, v) : v);
    }

    // Cornell — 손글씨 ↔ 코넬 전환 후에도 rows 보존
    // content가 HW 형식일 때: Cornell JSON이 .text에 내장돼 있음 → extractTextPart로 꺼내서 파싱
    const cornellData = useMemo(() => {
        if (isTpl || isHand || isCanvas || !content) return null;
        try {
            const raw = isHandwritingContent(content) ? extractTextPart(content) : content;
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed?._cornell && Array.isArray(parsed.rows)) {
                return { rows: parsed.rows as CornellRow[], summary: typeof parsed.summary === "string" ? parsed.summary : "" };
            }
        } catch { /* not cornell */ }
        return null;
    }, [content, isTpl, isHand, isCanvas]);
    const isCornell = cornellData !== null;
    function saveCornellModal(rows: CornellRow[], summary: string) {
        const cornellJson = JSON.stringify({ _cornell: true, rows, summary });
        // HW 형식이면 .text만 업데이트 → strokes 보존; 일반 텍스트면 그대로 저장
        setContent(isHandwritingContent(content) ? setTextPart(content, cornellJson) : cornellJson);
    }
    function saveHand(next: HandNoteData) {
        setContent(setHandPart(content, next));
    }
    function toggleHandwriting() {
        if (isHand) {
            // 손글씨 → 텍스트: 스트로크를 content에 그대로 보존, 표시만 텍스트로
            setHandModeOverride(false);
            setEditing(true);
        } else {
            // 텍스트 → 손글씨: 기존 텍스트를 .text 필드에 보존한 채 HW 형식으로 전환
            if (!isHandwritingContent(content)) {
                setContent(setHandPart(content, { strokes: [], width: 800, height: 480 }));
            }
            setHandModeOverride(null);
        }
    }

    function switchCornellPage(newIdx: number) {
        if (newIdx < 0 || newIdx >= allCornellPages.length) return;
        const updatedPages = [...allCornellPages];
        if (cornellData) updatedPages[pageIdx] = { rows: cornellData.rows, summary: cornellData.summary };
        setAllCornellPages(updatedPages);
        const target = updatedPages[newIdx];
        const newJson = JSON.stringify({ _cornell: true, rows: target.rows, summary: target.summary });
        setContent(isHandwritingContent(content) ? setTextPart(content, newJson) : newJson);
        setPageIdx(newIdx);
    }
    function addCornellPage() {
        const newPage = { rows: [{ id: `r_${Date.now()}`, cue: '', note: '' } as CornellRow], summary: '' };
        const updatedPages = [...allCornellPages];
        if (cornellData) updatedPages[pageIdx] = { rows: cornellData.rows, summary: cornellData.summary };
        updatedPages.push(newPage);
        setAllCornellPages(updatedPages);
        const newJson = JSON.stringify({ _cornell: true, rows: newPage.rows, summary: '' });
        setContent(isHandwritingContent(content) ? setTextPart(content, newJson) : newJson);
        setPageIdx(updatedPages.length - 1);
    }
    function switchHandPage(newIdx: number) {
        if (newIdx < 0 || newIdx >= allHandPages.length) return;
        const updatedPages = [...allHandPages];
        const currentHw = parseHandwriting(content);
        if (currentHw) updatedPages[pageIdx] = { strokes: currentHw.strokes, width: currentHw.width, height: currentHw.height };
        setAllHandPages(updatedPages);
        const target = updatedPages[newIdx];
        setContent(`<!-- planners:handwriting -->\n${JSON.stringify(target)}`);
        setPageIdx(newIdx);
    }
    function addHandPage() {
        const newPage: HandNoteData = { strokes: [], width: 800, height: 480 };
        const updatedPages = [...allHandPages];
        const currentHw = parseHandwriting(content);
        if (currentHw) updatedPages[pageIdx] = { strokes: currentHw.strokes, width: currentHw.width, height: currentHw.height };
        updatedPages.push(newPage);
        setAllHandPages(updatedPages);
        setContent(`<!-- planners:handwriting -->\n${JSON.stringify(newPage)}`);
        setPageIdx(updatedPages.length - 1);
    }
    function handleClose() {
        let finalContent = content;
        // Cornell 멀티페이지: _pages embed
        if (isCornell && allCornellPages.length > 1) {
            const updatedPages = [...allCornellPages];
            if (cornellData) updatedPages[pageIdx] = { rows: cornellData.rows, summary: cornellData.summary };
            const newJson = JSON.stringify({ _cornell: true, rows: updatedPages[0].rows, summary: updatedPages[0].summary, _pages: updatedPages });
            finalContent = isHandwritingContent(content) ? setTextPart(content, newJson) : newJson;
        }
        // Hand 멀티페이지: _pages embed
        if (isHand && allHandPages.length > 1) {
            const updatedPages = [...allHandPages];
            const currentHw = parseHandwriting(content);
            if (currentHw) updatedPages[pageIdx] = { strokes: currentHw.strokes, width: currentHw.width, height: currentHw.height };
            const newHw = { ...(updatedPages[0] ?? { strokes: [], width: 800, height: 480 }), _pages: updatedPages };
            finalContent = `<!-- planners:handwriting -->\n${JSON.stringify(newHw)}`;
        }
        onSave({ title, content: finalContent });
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-[5vh_5vw]">
            {/* pp-view: fixed 모달은 planners-app-shell 밖 → pp-view로 다크모드 토큰 적용 */}
            <div className="pp-view bg-white rounded-xl w-full h-full flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center gap-3">
                    {isTpl && <LayoutTemplate className="h-4 w-4 text-[#0F766E] shrink-0" />}
                    {isCanvas && <ImageIcon className="h-4 w-4 text-sky-500 shrink-0" />}
                    {(() => {
                        const isAutoTitle = !title || /^(기본 노트|노트|손글씨|캔버스|템플릿) \d+$/.test(title) || title === tplInfo?.label;
                        return (
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={
                                        isTpl ? (tplInfo?.label || "이 템플릿으로 기록할 주제 한 줄")
                                        : isCanvas ? "예: 동선 스케치"
                                        : isHand ? "예: 회의 메모 · 손글씨 정리"
                                        : "예: 인터뷰 메모 / 자료 정리"
                                    }
                                    className={`w-full text-base bg-transparent focus:outline-none placeholder:text-neutral-300 transition-all ${
                                        isAutoTitle
                                            ? "italic font-light text-neutral-400"
                                            : isTpl ? "font-semibold text-[#0F766E]" : isCanvas ? "font-semibold text-sky-700" : "font-semibold text-neutral-900"
                                    }`}
                                />
                            </div>
                        );
                    })()}
                    {!isTpl && !isCanvas && (
                        <button
                            onClick={toggleHandwriting}
                            title={isHand ? "텍스트 모드로 전환" : "손글씨 모드로 전환"}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors shrink-0"
                        >
                            {isHand ? <><Type className="h-3.5 w-3.5" /> 텍스트</> : <><PenLine className="h-3.5 w-3.5" /> 손글씨</>}
                        </button>
                    )}
                    {!isTpl && !isHand && !isCornell && !isCanvas && (
                        <button
                            onClick={() => setEditing(e => !e)}
                            className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                            {editing ? "미리보기" : "편집"}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg text-sm hover:bg-neutral-100 transition-colors"
                    >
                        그냥 닫기
                    </button>
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                    >
                        저장 후 닫기
                    </button>
                </div>
                {/* Body */}
                {isCanvas && canvasInfo ? (
                    <div className="flex-1 min-h-0 relative overflow-hidden">
                        <CanvasStudio canvasId={canvasInfo.canvasId} embed />
                    </div>
                ) : grid ? (
                    <div className="flex-1 p-6 overflow-auto">{grid}</div>
                ) : isHand ? (
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <HandNote value={handData} onChange={saveHand} fillHeight />
                        {allHandPages.length > 1 && (
                            <div className="shrink-0 border-t border-neutral-100 bg-neutral-50/60 px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => switchHandPage(pageIdx - 1)} disabled={pageIdx <= 0}
                                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-500 transition-colors">
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="text-xs text-neutral-400 tabular-nums">{pageIdx + 1} / {allHandPages.length}</span>
                                    <button onClick={() => switchHandPage(pageIdx + 1)} disabled={pageIdx >= allHandPages.length - 1}
                                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-500 transition-colors">
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <button onClick={addHandPage} className="flex items-center gap-1 text-xs text-[#0F766E] hover:text-[#0d5e56] transition-colors">
                                    <Plus className="h-3 w-3" /> 새 페이지
                                </button>
                            </div>
                        )}
                    </div>
                ) : isCornell && cornellData ? (
                    <div className="flex-1 overflow-auto flex flex-col">
                        <CornellRowsInline
                            rows={cornellData.rows}
                            summary={cornellData.summary}
                            onChange={saveCornellModal}
                            onCommit={() => { /* 모달 닫을 때 일괄 저장 */ }}
                        />
                        {/* 페이지 네비게이션 */}
                        <div className="shrink-0 border-t border-dashed border-neutral-200 px-4 py-2 flex items-center justify-between bg-neutral-50/40">
                            <div className="flex items-center gap-2">
                                <button onClick={() => switchCornellPage(pageIdx - 1)} disabled={pageIdx <= 0}
                                    className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-400 transition-colors">
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-xs text-neutral-400 tabular-nums">{pageIdx + 1} / {allCornellPages.length || 1}</span>
                                <button onClick={() => switchCornellPage(pageIdx + 1)} disabled={pageIdx >= (allCornellPages.length || 1) - 1}
                                    className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-400 transition-colors">
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <button onClick={addCornellPage} className="flex items-center gap-1 text-xs text-[#0F766E] hover:text-[#0d5e56] transition-colors">
                                <Plus className="h-3 w-3" /> 새 페이지
                            </button>
                        </div>
                    </div>
                ) : editing ? (
                    <div className="flex-1 p-6 overflow-auto">
                        <textarea
                            value={textDisplayValue}
                            onChange={(e) => handleTextChange(e.target.value)}
                            placeholder="노트 내용 (마크다운 지원)"
                            className="w-full h-full text-sm text-neutral-900 focus:outline-none bg-transparent resize-none font-mono leading-relaxed"
                        />
                    </div>
                ) : (
                    <div
                        onClick={() => !isTpl && !isHand && setEditing(true)}
                        className="flex-1 p-6 overflow-auto text-sm text-neutral-900 leading-relaxed cursor-text
                            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3
                            [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
                            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2
                            [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5
                            [&_strong]:font-semibold
                            [&_table]:w-full [&_table]:border-collapse [&_table]:mb-3 [&_table]:text-xs
                            [&_th]:border [&_th]:border-neutral-200 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-neutral-50 [&_th]:font-semibold
                            [&_td]:border [&_td]:border-neutral-200 [&_td]:px-2 [&_td]:py-1
                            [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                            [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-600"
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{(tplInfo ? tplInfo.body : textDisplayValue) || "*내용 없음*"}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
