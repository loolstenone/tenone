"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, ChevronUp, ChevronDown, LayoutTemplate, X } from "lucide-react";

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
    const [categoryFilter, setCategoryFilter] = useState<"all" | "framework" | "schedule" | "note">("all");

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
        if (templates.length === 0) {
            const res = await fetch(`/api/planners/templates`);
            if (res.ok) {
                const d = await res.json();
                setTemplates(d.templates || []);
            }
        }
    }

    async function insertFromTemplate(tpl: Template) {
        setSaving(true);
        try {
            const res = await fetch(`/api/planners/projects/${projectId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: tpl.label, content: tpl.body_md }),
            });
            if (res.ok) {
                const d = await res.json();
                setNotes([...notes, d.note]);
                setPicker(false);
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

    const filteredTpl = templates.filter(t => categoryFilter === "all" || t.category === categoryFilter);

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
                        />
                    ))}
                </div>
            )}

            {/* Template picker */}
            {picker && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                            <h3 className="font-serif text-xl text-neutral-900">템플릿에서 삽입</h3>
                            <button onClick={() => setPicker(false)}>
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <div className="px-6 py-3 border-b border-neutral-100 flex gap-1">
                            {(["all", "framework", "schedule", "note"] as const).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCategoryFilter(c)}
                                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                        categoryFilter === c
                                            ? "bg-[#0F766E] text-white"
                                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                                >
                                    {c === "all" ? "전체" : c === "framework" ? "FrameWorkBook" : c === "schedule" ? "Schedule" : "Note"}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-y-auto flex-1 p-6 grid md:grid-cols-2 gap-3">
                            {filteredTpl.length === 0 ? (
                                <p className="col-span-2 text-center text-neutral-400 text-sm py-8">
                                    템플릿 로딩 중…
                                </p>
                            ) : (
                                filteredTpl.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => insertFromTemplate(tpl)}
                                        className="text-left p-4 border border-neutral-200 rounded-lg hover:border-[#0F766E] hover:bg-[#0F766E]/5 transition-all"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded uppercase tracking-wider">
                                                {tpl.category}
                                            </span>
                                            {tpl.subcategory && (
                                                <span className="text-[9px] text-neutral-400">{tpl.subcategory}</span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-neutral-900 text-sm">{tpl.label}</h4>
                                        {tpl.description && (
                                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{tpl.description}</p>
                                        )}
                                    </button>
                                ))
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
}: {
    note: ProjectNote;
    isFirst: boolean;
    isLast: boolean;
    onUpdate: (p: Partial<ProjectNote>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    const [title, setTitle] = useState(note.title || "");
    const [content, setContent] = useState(note.content || "");

    useEffect(() => {
        setTitle(note.title || "");
        setContent(note.content || "");
    }, [note.id, note.title, note.content]);

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
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => onUpdate({ title })}
                    placeholder="노트 제목"
                    className="flex-1 text-sm font-semibold text-neutral-900 bg-transparent focus:outline-none placeholder:text-neutral-400"
                />
                <button
                    onClick={onDelete}
                    className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
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
        </section>
    );
}
