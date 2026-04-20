"use client";

import { useState, useEffect } from "react";
import {
    Plus, X, Save, Loader2, ExternalLink,
    Trash2, ToggleLeft, ToggleRight, ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import {
    getAllMontzAuditions, upsertMontzAudition, deleteMontzAudition,
    type MontzAudition, type MontzAuditionType,
} from "@/lib/supabase/montz";

const TYPE_OPTIONS: MontzAuditionType[] = ["드라마", "영화", "뮤지컬", "모델", "광고", "CF", "기타"];

const TYPE_COLOR: Record<MontzAuditionType, string> = {
    드라마:  "bg-blue-50 text-blue-700 border-blue-200",
    영화:    "bg-purple-50 text-purple-700 border-purple-200",
    뮤지컬:  "bg-rose-50 text-rose-700 border-rose-200",
    모델:    "bg-amber-50 text-amber-700 border-amber-200",
    광고:    "bg-orange-50 text-orange-700 border-orange-200",
    CF:      "bg-sky-50 text-sky-700 border-sky-200",
    기타:    "bg-neutral-100 text-neutral-600 border-neutral-200",
};

type DraftAudition = Omit<MontzAudition, "created_at" | "id"> & { id?: string };

const EMPTY: DraftAudition = {
    type: "드라마",
    company: "",
    role: "",
    tags: [],
    deadline: "",
    pay: null,
    href: null,
    contact_email: "",
    is_active: true,
    is_pinned: false,
    sort_order: 0,
};

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
    const [input, setInput] = useState("");
    function add() {
        const t = input.trim().replace(/^#/, "");
        if (t && !tags.includes(t)) onChange([...tags, t]);
        setInput("");
    }
    return (
        <div>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
                {tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5">
                        #{t}
                        <button onClick={() => onChange(tags.filter((x) => x !== t))}>
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
                placeholder="태그 입력 후 Enter 또는 쉼표"
                className="w-full border border-neutral-200 px-2.5 py-1.5 text-[12px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
            />
        </div>
    );
}

function AuditionEditor({ draft, onChange, onSave, onCancel, saving }: {
    draft: DraftAudition;
    onChange: (d: DraftAudition) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
}) {
    function set<K extends keyof DraftAudition>(k: K, v: DraftAudition[K]) {
        onChange({ ...draft, [k]: v });
    }

    const labelCls = "text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block";
    const inputCls = "w-full border border-neutral-200 px-2.5 py-1.5 text-[13px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-800 bg-white";

    return (
        <div className="border border-neutral-300 bg-white p-5 space-y-4">
            {/* 타입 + 토글 */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex gap-1.5 flex-wrap">
                    {TYPE_OPTIONS.map((t) => (
                        <button key={t} onClick={() => set("type", t)}
                            className={`text-[11px] px-2.5 py-1 border transition-colors ${
                                draft.type === t
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                            }`}>{t}</button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => set("is_pinned", !draft.is_pinned)}
                        className={`flex items-center gap-1.5 text-[12px] transition-colors ${draft.is_pinned ? "text-amber-600" : "text-neutral-400"}`}>
                        {draft.is_pinned ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        상단 고정(AD)
                    </button>
                    <button onClick={() => set("is_active", !draft.is_active)}
                        className={`flex items-center gap-1.5 text-[12px] transition-colors ${draft.is_active ? "text-emerald-600" : "text-neutral-400"}`}>
                        {draft.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        {draft.is_active ? "활성" : "비활성"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelCls}>기업 / 제작사 *</label>
                    <input type="text" value={draft.company} onChange={(e) => set("company", e.target.value)}
                        placeholder="KBS 드라마국" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>공고 제목 *</label>
                    <input type="text" value={draft.role} onChange={(e) => set("role", e.target.value)}
                        placeholder="주인공 상대역 (여, 20대)" className={inputCls} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelCls}>마감일 *</label>
                    <input type="text" value={draft.deadline} onChange={(e) => set("deadline", e.target.value)}
                        placeholder="2025.08.31 또는 상시" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>출연료 / 페이</label>
                    <input type="text" value={draft.pay ?? ""} onChange={(e) => set("pay", e.target.value || null)}
                        placeholder="협의, 500만원 이상" className={inputCls} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelCls}>공고 링크</label>
                    <input type="url" value={draft.href ?? ""} onChange={(e) => set("href", e.target.value || null)}
                        placeholder="https://..." className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>담당자 이메일</label>
                    <input type="email" value={draft.contact_email} onChange={(e) => set("contact_email", e.target.value)}
                        placeholder="casting@company.com" className={inputCls} />
                </div>
            </div>

            <div>
                <label className={labelCls}>태그</label>
                <TagEditor tags={draft.tags} onChange={(t) => set("tags", t)} />
            </div>

            <div className="flex items-center gap-3">
                <div>
                    <label className={labelCls}>노출 순서</label>
                    <input type="number" value={draft.sort_order}
                        onChange={(e) => set("sort_order", Number(e.target.value))}
                        className={`${inputCls} w-20`} min={0} />
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <button onClick={onSave}
                    disabled={saving || !draft.company || !draft.role || !draft.deadline}
                    className="flex items-center gap-1.5 text-[12px] bg-neutral-900 text-white px-4 py-2 hover:opacity-80 transition-opacity disabled:opacity-40">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    저장
                </button>
                <button onClick={onCancel}
                    className="text-[12px] text-neutral-500 border border-neutral-200 px-4 py-2 hover:border-neutral-400 transition-colors">
                    취소
                </button>
            </div>
        </div>
    );
}

function AuditionRow({ audition, onEdit, onDelete, onToggle }: {
    audition: MontzAudition;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 border-b border-neutral-100 group transition-colors ${
            audition.is_active ? "hover:bg-neutral-50" : "opacity-50 hover:bg-neutral-50"
        }`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] border px-1.5 py-0.5 ${TYPE_COLOR[audition.type]}`}>
                        {audition.type}
                    </span>
                    {audition.is_pinned && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5">AD</span>
                    )}
                    <span className="text-[11px] text-neutral-500">{audition.deadline}</span>
                    {audition.pay && <span className="text-[11px] text-neutral-400">· {audition.pay}</span>}
                </div>
                <p className="text-[13px] font-semibold text-neutral-900 truncate">{audition.company}</p>
                <p className="text-[11px] text-neutral-600 truncate">{audition.role}</p>
                {audition.tags.length > 0 && (
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {audition.tags.map((t) => `#${t}`).join(" ")}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {audition.href && (
                    <a href={audition.href} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-700" />
                    </a>
                )}
                <button onClick={onToggle} title={audition.is_active ? "비활성화" : "활성화"}>
                    {audition.is_active
                        ? <ToggleRight className="w-4 h-4 text-emerald-500 hover:text-emerald-700" />
                        : <ToggleLeft className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />}
                </button>
                <button onClick={onEdit}
                    className="text-[11px] text-neutral-500 border border-neutral-200 px-2 py-0.5 hover:border-neutral-400">
                    수정
                </button>
                <button onClick={onDelete}>
                    <Trash2 className="w-3.5 h-3.5 text-neutral-300 hover:text-red-500 transition-colors" />
                </button>
            </div>
        </div>
    );
}

export default function MontzAuditionsPage() {
    const [auditions, setAuditions] = useState<MontzAudition[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<DraftAudition | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const data = await getAllMontzAuditions();
        setAuditions(data);
        setLoading(false);
    }

    function startNew() {
        setEditing({ ...EMPTY, sort_order: auditions.length + 1 });
    }

    async function handleSave() {
        if (!editing) return;
        setSaving(true);
        const result = await upsertMontzAudition(editing as Parameters<typeof upsertMontzAudition>[0]);
        if (result) { await load(); setEditing(null); }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("공고를 삭제하시겠습니까?")) return;
        await deleteMontzAudition(id);
        setAuditions((prev) => prev.filter((a) => a.id !== id));
    }

    async function handleToggle(a: MontzAudition) {
        const updated = await upsertMontzAudition({ ...a, is_active: !a.is_active });
        if (updated) setAuditions((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
    }

    const active = auditions.filter((a) => a.is_active).length;

    return (
        <div className="p-6 max-w-2xl">
            <PageHeader title="오디션 공고 관리" description="MoNTZ 오디션 공고 게시 및 광고(AD) 관리">
                <button onClick={startNew}
                    className="flex items-center gap-1.5 text-[12px] bg-neutral-900 text-white px-3 py-1.5 hover:opacity-80 transition-opacity">
                    <Plus className="w-3.5 h-3.5" />
                    새 공고
                </button>
            </PageHeader>

            <div className="flex items-center gap-4 mb-5 text-[12px] text-neutral-500">
                <span>전체 <strong className="text-neutral-900">{auditions.length}</strong>개</span>
                <span>활성 <strong className="text-emerald-600">{active}</strong>개</span>
                <span>비활성 <strong className="text-neutral-400">{auditions.length - active}</strong>개</span>
                <span>AD 고정 <strong className="text-amber-600">{auditions.filter((a) => a.is_pinned).length}</strong>개</span>
            </div>

            {editing && !editing.id && (
                <div className="mb-4">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2">새 공고</p>
                    <AuditionEditor draft={editing} onChange={setEditing} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
                </div>
            )}

            <div className="border border-neutral-200 bg-white">
                <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-50">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">공고 목록</span>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-[13px] text-neutral-400">불러오는 중…</div>
                ) : auditions.length === 0 ? (
                    <div className="py-12 text-center text-[13px] text-neutral-400">공고가 없습니다</div>
                ) : (
                    auditions.map((a) =>
                        editing?.id === a.id ? (
                            <div key={a.id} className="px-4 py-3 border-b border-neutral-100">
                                <AuditionEditor draft={editing} onChange={setEditing} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
                            </div>
                        ) : (
                            <AuditionRow key={a.id} audition={a}
                                onEdit={() => setEditing({ ...a })}
                                onDelete={() => handleDelete(a.id)}
                                onToggle={() => handleToggle(a)}
                            />
                        )
                    )
                )}
            </div>
        </div>
    );
}
