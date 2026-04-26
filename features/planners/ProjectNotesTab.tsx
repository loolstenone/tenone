"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Loader2, ChevronUp, ChevronDown, LayoutTemplate, X, Maximize2, Pencil, Eye, Search, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveTemplateContent, isSpecialTemplate, tplDataKey } from "@/lib/planners/templates";
import { renderFramework, type FrameworkData } from "./TemplatesView";
import { Track } from "@/lib/analytics";
import { HandNote, isHandwritingContent, parseHandwriting, serializeHandwriting, type HandNoteData } from "./HandNote";

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

export function ProjectNotesTab({ projectId }: { projectId: string }) {
    const [notes, setNotes] = useState<ProjectNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [picker, setPicker] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [tplLoading, setTplLoading] = useState(false);
    const [tplQuery, setTplQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<"all" | "favs" | "framework" | "schedule" | "note">("all");
    const [tplFavs, setTplFavs] = useState<Set<string>>(() => {
        if (typeof window === "undefined") return new Set();
        try { return new Set(JSON.parse(localStorage.getItem("planners_fav_templates") || "[]")); }
        catch { return new Set(); }
    });
    const [expandedNote, setExpandedNote] = useState<ProjectNote | null>(null);

    async function load() {
        setLoading(true);
        const res = await fetch(`/api/planners/projects/${projectId}/notes`);
        if (res.ok) {
            const d = await res.json();
            setNotes(d.notes || []);
        }
        setLoading(false);
    }

    useEffect(() => { load(); }, [projectId]);

    async function addBlankNote() {
        setSaving(true);
        try {
            const res = await fetch(`/api/planners/projects/${projectId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "새 노트", content: "" }),
            });
            if (res.ok) {
                const d = await res.json();
                setNotes([...notes, d.note]);
            }
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
                setNotes([...notes, d.note]);
                setPicker(false);
                Track.templateInsert({ template_key: tpl.key, template_label: tpl.label, surface: "project" });
            }
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
        if (!confirm("이 노트를 삭제할까요?")) return;
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
        if (categoryFilter !== "all" && categoryFilter !== "favs" && t.category !== categoryFilter) return false;
        if (tplQuery) {
            const q = tplQuery.toLowerCase();
            return t.label.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
        }
        return true;
    });

    if (loading) {
        return <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>;
    }

    return (
        <div className="space-y-4">
            {/* Action bar */}
            <div className="flex items-center gap-2">
                <button
                    onClick={addBlankNote}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                    <Plus className="h-3.5 w-3.5" /> 빈 노트
                </button>
                <button
                    onClick={openPicker}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors disabled:opacity-50"
                >
                    <LayoutTemplate className="h-3.5 w-3.5" /> 템플릿에서 삽입
                </button>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
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
                <div className="space-y-3">
                    {notes.map((note, i) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            isFirst={i === 0}
                            isLast={i === notes.length - 1}
                            onUpdate={(p) => updateNote(note.id, p)}
                            onDelete={() => deleteNote(note.id)}
                            onMoveUp={() => reorder(note.id, "up")}
                            onMoveDown={() => reorder(note.id, "down")}
                            onExpand={() => setExpandedNote(note)}
                        />
                    ))}
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

            {/* Template picker */}
            {picker && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
                    onClick={() => setPicker(false)}
                >
                    <div
                        className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[80vh] shadow-2xl"
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
                            <div className="flex gap-1 overflow-x-auto">
                                {(["all", "favs", "framework", "schedule", "note"] as const).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCategoryFilter(c)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                            categoryFilter === c
                                                ? c === "favs" ? "bg-amber-500 text-white"
                                                : c === "framework" ? "bg-violet-600 text-white"
                                                : c === "schedule" ? "bg-teal-600 text-white"
                                                : c === "note" ? "bg-amber-500 text-white"
                                                : "bg-neutral-900 text-white"
                                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {c === "all" ? "전체" : c === "favs" ? "⭐ 즐겨찾기" : c === "framework" ? "FrameWorkBook" : c === "schedule" ? "Schedule" : "Note"}
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
    isFirst,
    isLast,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
    onExpand,
}: {
    note: ProjectNote;
    isFirst: boolean;
    isLast: boolean;
    onUpdate: (p: Partial<ProjectNote>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onExpand: () => void;
}) {
    const [title, setTitle] = useState(note.title || "");
    const [content, setContent] = useState(note.content || "");
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        setTitle(note.title || "");
        setContent(note.content || "");
    }, [note.id, note.title, note.content]);

    // Template detection
    const tplInfo = parseTemplateMarker(content);
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

    // Handwriting detection (템플릿이 아닐 때만)
    const isHand = !isTpl && isHandwritingContent(content);
    const handData = isHand ? parseHandwriting(content) : null;
    function saveHandwriting(next: HandNoteData) {
        const text = serializeHandwriting(next);
        setContent(text);
        onUpdate({ content: text });
    }
    function toggleHandwriting() {
        if (isHand) {
            if (!confirm("손글씨를 텍스트 모드로 바꾸면 그림이 사라집니다. 계속할까요?")) return;
            setContent(""); onUpdate({ content: "" });
            setEditing(true);
        } else {
            if (content.trim() && !confirm("기존 텍스트 내용을 손글씨 캔버스로 바꿀까요? (기존 텍스트는 사라집니다)")) return;
            const empty: HandNoteData = { strokes: [], width: 600, height: 240 };
            const text = serializeHandwriting(empty);
            setContent(text); onUpdate({ content: text });
        }
    }

    return (
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={onMoveUp}
                        disabled={isFirst}
                        className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={onMoveDown}
                        disabled={isLast}
                        className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                </div>
                {isTpl && <LayoutTemplate className="h-3.5 w-3.5 text-[#0F766E] shrink-0" />}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => onUpdate({ title })}
                    placeholder={isTpl ? (tplInfo?.label || "제목을 입력하세요") : "노트 제목"}
                    className="flex-1 text-sm font-semibold text-neutral-900 bg-transparent focus:outline-none placeholder:text-neutral-400 placeholder:font-normal placeholder:italic"
                />
                {!isTpl && !isHand && (
                    <button
                        onClick={() => setEditing(e => !e)}
                        className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-700"
                        title={editing ? "미리보기" : "마크다운 편집"}
                    >
                        {editing ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    </button>
                )}
                {!isTpl && (
                    <button
                        onClick={toggleHandwriting}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isHand ? "bg-[#0F766E]/10 text-[#0F766E]" : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700"}`}
                        title={isHand ? "텍스트 모드로 전환" : "손글씨 모드로 전환 (Apple Pencil · S Pen)"}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                )}
                <button
                    onClick={onExpand}
                    className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-700"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={onDelete}
                    className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
            {grid ? (
                <div className="p-4">{grid}</div>
            ) : isHand ? (
                <div className="p-4">
                    <HandNote value={handData} onChange={saveHandwriting} height={260} />
                </div>
            ) : editing ? (
                <div className="p-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={() => onUpdate({ content })}
                        placeholder="노트 내용 (마크다운 지원)"
                        rows={12}
                        className="w-full text-sm text-neutral-900 focus:outline-none bg-transparent resize-none font-mono leading-relaxed"
                    />
                </div>
            ) : (
                <div
                    onClick={() => !isTpl && setEditing(true)}
                    className="p-4 text-sm text-neutral-900 leading-relaxed min-h-[8rem] cursor-text
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
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{(tplInfo ? tplInfo.body : content) || "*내용 없음*"}</ReactMarkdown>
                </div>
            )}
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

    const tplInfo = parseTemplateMarker(content);
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

    // Handwriting
    const isHand = !isTpl && isHandwritingContent(content);
    const handData = isHand ? parseHandwriting(content) : null;
    function saveHand(next: HandNoteData) {
        const text = serializeHandwriting(next);
        setContent(text);
    }
    function toggleHandwriting() {
        if (isHand) {
            if (!confirm("손글씨를 텍스트 모드로 바꾸면 그림이 사라집니다. 계속할까요?")) return;
            setContent("");
            setEditing(true);
        } else {
            if (content.trim() && !confirm("기존 텍스트 내용을 손글씨 캔버스로 바꿀까요? (기존 텍스트는 사라집니다)")) return;
            const empty: HandNoteData = { strokes: [], width: 800, height: 480 };
            setContent(serializeHandwriting(empty));
        }
    }

    function handleClose() {
        onSave({ title, content });
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-[5vh_5vw]">
            <div className="bg-white rounded-xl w-full h-full flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center gap-3">
                    {isTpl && <LayoutTemplate className="h-4 w-4 text-[#0F766E] shrink-0" />}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={isTpl ? (tplInfo?.label || "노트 제목") : "노트 제목"}
                        className="flex-1 text-base font-semibold text-neutral-900 bg-transparent focus:outline-none placeholder:text-neutral-400 placeholder:italic placeholder:font-normal"
                    />
                    {!isTpl && !isHand && (
                        <button
                            onClick={() => setEditing(e => !e)}
                            className="flex items-center gap-1 px-2.5 py-1.5 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                            {editing ? <><Eye className="h-3.5 w-3.5 mr-1" />미리보기</> : <><Pencil className="h-3.5 w-3.5 mr-1" />편집</>}
                        </button>
                    )}
                    {!isTpl && (
                        <button
                            onClick={toggleHandwriting}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm border transition-colors ${isHand ? "bg-[#0F766E]/10 border-[#0F766E]/30 text-[#0F766E]" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}
                            title={isHand ? "텍스트 모드로 전환" : "손글씨 모드"}
                        >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            {isHand ? "손글씨" : "✏️"}
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                    >
                        저장 후 닫기
                    </button>
                    <button onClick={handleClose} className="p-1.5 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {/* Body */}
                {grid ? (
                    <div className="flex-1 p-6 overflow-auto">{grid}</div>
                ) : isHand ? (
                    <div className="flex-1 p-6 overflow-auto">
                        <HandNote value={handData} onChange={saveHand} height={Math.max(480, (handData?.height ?? 480))} />
                    </div>
                ) : editing ? (
                    <div className="flex-1 p-6 overflow-auto">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
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
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{(tplInfo ? tplInfo.body : content) || "*내용 없음*"}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
