"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    Plus, X, Save, Loader2, ExternalLink, GripVertical,
    ImageIcon, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import {
    getAllNotices, upsertNotice, deleteNotice,
    type JakkaNotice,
} from "@/lib/supabase/jakka";
import { createClient } from "@/lib/supabase/client";

const TYPE_OPTIONS = ["채용", "공모전", "파트너", "외주", "인턴", "프로젝트", "공고"] as const;

const TYPE_COLOR: Record<string, string> = {
    채용:     "bg-blue-50 text-blue-700 border-blue-200",
    공모전:   "bg-purple-50 text-purple-700 border-purple-200",
    파트너:   "bg-rose-50 text-rose-700 border-rose-200",
    외주:     "bg-orange-50 text-orange-700 border-orange-200",
    인턴:     "bg-sky-50 text-sky-700 border-sky-200",
    프로젝트: "bg-emerald-50 text-emerald-700 border-emerald-200",
    공고:     "bg-neutral-100 text-neutral-600 border-neutral-300",
};

type DraftNotice = Omit<JakkaNotice, "id" | "created_at" | "updated_at"> & { id?: string };

const EMPTY_DRAFT: DraftNotice = {
    type: "채용",
    company: "",
    role: "",
    tags: [],
    deadline: "",
    href: null,
    image_url: null,
    is_active: true,
    is_pinned: false,
    sort_order: 0,
    contact_email: null,
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
                    <span
                        key={t}
                        className="flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5"
                    >
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
                placeholder="태그 입력 후 Enter"
                className="w-full border border-neutral-200 px-2.5 py-1.5 text-[12px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
            />
        </div>
    );
}

function NoticeEditor({
    draft,
    onChange,
    onSave,
    onCancel,
    saving,
}: {
    draft: DraftNotice;
    onChange: (d: DraftNotice) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    function set<K extends keyof DraftNotice>(key: K, val: DraftNotice[K]) {
        onChange({ ...draft, [key]: val });
    }

    async function handleImageUpload(file: File) {
        setUploading(true);
        const supabase = createClient();
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `notices/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("jakka-works").upload(path, file, { upsert: false });
        if (!error) {
            const { data } = supabase.storage.from("jakka-works").getPublicUrl(path);
            set("image_url", data.publicUrl);
        }
        setUploading(false);
    }

    const labelCls = "text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block";
    const inputCls = "w-full border border-neutral-200 px-2.5 py-1.5 text-[13px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-800 bg-white";

    return (
        <div className="border border-neutral-300 bg-white p-5 space-y-4">
            {/* 타입 + 활성 */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex gap-1.5">
                    {TYPE_OPTIONS.map((t) => (
                        <button
                            key={t}
                            onClick={() => set("type", t)}
                            className={`text-[11px] px-2.5 py-1 border transition-colors ${
                                draft.type === t
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => set("is_pinned", !draft.is_pinned)}
                        className={`flex items-center gap-1.5 text-[12px] transition-colors ${
                            draft.is_pinned ? "text-amber-600" : "text-neutral-400"
                        }`}
                    >
                        {draft.is_pinned
                            ? <ToggleRight className="w-5 h-5" />
                            : <ToggleLeft className="w-5 h-5" />}
                        고정(AD)
                    </button>
                    <button
                        onClick={() => set("is_active", !draft.is_active)}
                        className={`flex items-center gap-1.5 text-[12px] transition-colors ${
                            draft.is_active ? "text-emerald-600" : "text-neutral-400"
                        }`}
                    >
                        {draft.is_active
                            ? <ToggleRight className="w-5 h-5" />
                            : <ToggleLeft className="w-5 h-5" />}
                        {draft.is_active ? "활성" : "비활성"}
                    </button>
                </div>
            </div>

            {/* 이미지 + 기본 정보 */}
            <div className="flex gap-4">
                {/* 뱃지 이미지 */}
                <div>
                    <label className={labelCls}>이미지</label>
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="w-16 h-16 border border-dashed border-neutral-300 flex items-center justify-center relative overflow-hidden hover:border-neutral-500 transition-colors"
                    >
                        {draft.image_url ? (
                            <Image src={draft.image_url} alt="" fill className="object-cover" sizes="64px" />
                        ) : uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                        ) : (
                            <ImageIcon className="w-4 h-4 text-neutral-300" />
                        )}
                    </button>
                    {draft.image_url && (
                        <button
                            onClick={() => set("image_url", null)}
                            className="text-[10px] text-neutral-400 hover:text-red-500 mt-1 block"
                        >
                            제거
                        </button>
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleImageUpload(f);
                            e.target.value = "";
                        }}
                    />
                </div>

                {/* 회사 + 역할 */}
                <div className="flex-1 space-y-3">
                    <div>
                        <label className={labelCls}>기업/기관</label>
                        <input
                            type="text"
                            value={draft.company}
                            onChange={(e) => set("company", e.target.value)}
                            placeholder="카카오, 현대카드…"
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>포지션/공고명</label>
                        <input
                            type="text"
                            value={draft.role}
                            onChange={(e) => set("role", e.target.value)}
                            placeholder="UX 디자이너, 브랜드 공모전…"
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>

            {/* 마감 + URL */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelCls}>마감일</label>
                    <input
                        type="text"
                        value={draft.deadline}
                        onChange={(e) => set("deadline", e.target.value)}
                        placeholder="~5월 31일, 상시"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls}>랜딩페이지 URL</label>
                    <input
                        type="url"
                        value={draft.href ?? ""}
                        onChange={(e) => set("href", e.target.value || null)}
                        placeholder="https://…"
                        className={inputCls}
                    />
                </div>
            </div>

            {/* 태그 */}
            <div>
                <label className={labelCls}>태그</label>
                <TagEditor tags={draft.tags} onChange={(t) => set("tags", t)} />
            </div>

            {/* 노출 순서 */}
            <div>
                <label className={labelCls}>노출 순서</label>
                <input
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => set("sort_order", Number(e.target.value))}
                    className={`${inputCls} w-20`}
                    min={0}
                />
            </div>

            {/* 버튼 */}
            <div className="flex items-center gap-2 pt-1">
                <button
                    onClick={onSave}
                    disabled={saving || !draft.company || !draft.role || !draft.deadline}
                    className="flex items-center gap-1.5 text-[12px] bg-neutral-900 text-white px-4 py-2 hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    저장
                </button>
                <button
                    onClick={onCancel}
                    className="text-[12px] text-neutral-500 border border-neutral-200 px-4 py-2 hover:border-neutral-400 transition-colors"
                >
                    취소
                </button>
            </div>
        </div>
    );
}

function NoticeRow({
    notice,
    onEdit,
    onDelete,
    onToggle,
}: {
    notice: JakkaNotice;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 border-b border-neutral-100 group transition-colors ${
                notice.is_active ? "hover:bg-neutral-50" : "opacity-50 hover:bg-neutral-50"
            }`}
        >
            <GripVertical className="w-3.5 h-3.5 text-neutral-300 shrink-0" />

            {/* 뱃지 이미지 */}
            <div className="w-9 h-9 shrink-0 bg-neutral-100 overflow-hidden">
                {notice.image_url ? (
                    <Image src={notice.image_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-neutral-300" />
                    </div>
                )}
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] border px-1.5 py-0.5 ${TYPE_COLOR[notice.type]}`}>
                        {notice.type}
                    </span>
                    {notice.is_pinned && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5">AD</span>
                    )}
                    <span className="text-[11px] text-neutral-400">{notice.deadline}</span>
                </div>
                <p className="text-[13px] font-medium text-neutral-900 truncate">{notice.company}</p>
                <p className="text-[11px] text-neutral-500 truncate">{notice.role}</p>
                {notice.tags.length > 0 && (
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {notice.tags.map((t) => `#${t}`).join(" ")}
                    </p>
                )}
            </div>

            {/* 액션 */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {notice.href && (
                    <a href={notice.href} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-700" />
                    </a>
                )}
                <button onClick={onToggle} title={notice.is_active ? "비활성화" : "활성화"}>
                    {notice.is_active
                        ? <ToggleRight className="w-4 h-4 text-emerald-500 hover:text-emerald-700" />
                        : <ToggleLeft className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />}
                </button>
                <button
                    onClick={onEdit}
                    className="text-[11px] text-neutral-500 border border-neutral-200 px-2 py-0.5 hover:border-neutral-400"
                >
                    수정
                </button>
                <button onClick={onDelete}>
                    <Trash2 className="w-3.5 h-3.5 text-neutral-300 hover:text-red-500 transition-colors" />
                </button>
            </div>
        </div>
    );
}

export default function JakkaNoticesPage() {
    const [notices, setNotices] = useState<JakkaNotice[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<DraftNotice | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const data = await getAllNotices();
        setNotices(data);
        setLoading(false);
    }

    function startNew() {
        setEditing({ ...EMPTY_DRAFT, sort_order: notices.length + 1 });
    }

    function startEdit(n: JakkaNotice) {
        setEditing({ ...n });
    }

    async function handleSave() {
        if (!editing) return;
        setSaving(true);
        const result = await upsertNotice(editing);
        if (result) {
            await load();
            setEditing(null);
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("공고를 삭제하시겠습니까?")) return;
        await deleteNotice(id);
        setNotices((prev) => prev.filter((n) => n.id !== id));
    }

    async function handleToggle(notice: JakkaNotice) {
        const updated = await upsertNotice({ ...notice, is_active: !notice.is_active });
        if (updated) {
            setNotices((prev) => prev.map((n) => (n.id === notice.id ? updated : n)));
        }
    }

    const active = notices.filter((n) => n.is_active).length;

    return (
        <div className="p-6 max-w-2xl">
            <PageHeader title="광고 관리" description="자까 홈 피드에 삽입되는 채용·공모전·프로젝트 카드">
                <button
                    onClick={startNew}
                    className="flex items-center gap-1.5 text-[12px] bg-neutral-900 text-white px-3 py-1.5 hover:opacity-80 transition-opacity"
                >
                    <Plus className="w-3.5 h-3.5" />
                    새 공고
                </button>
            </PageHeader>

            {/* 요약 */}
            <div className="flex items-center gap-4 mb-5 text-[12px] text-neutral-500">
                <span>전체 <strong className="text-neutral-900">{notices.length}</strong>개</span>
                <span>활성 <strong className="text-emerald-600">{active}</strong>개</span>
                <span>비활성 <strong className="text-neutral-400">{notices.length - active}</strong>개</span>
            </div>

            {/* 새 공고 에디터 */}
            {editing && !editing.id && (
                <div className="mb-4">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2">새 공고</p>
                    <NoticeEditor
                        draft={editing}
                        onChange={setEditing}
                        onSave={handleSave}
                        onCancel={() => setEditing(null)}
                        saving={saving}
                    />
                </div>
            )}

            {/* 목록 */}
            <div className="border border-neutral-200 bg-white">
                <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-50 flex items-center gap-3">
                    <div className="w-3.5 shrink-0" />
                    <div className="w-9 shrink-0" />
                    <span className="flex-1 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                        공고
                    </span>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-[13px] text-neutral-400">불러오는 중…</div>
                ) : notices.length === 0 ? (
                    <div className="py-12 text-center text-[13px] text-neutral-400">공고가 없습니다</div>
                ) : (
                    notices.map((n) =>
                        editing?.id === n.id ? (
                            <div key={n.id} className="px-4 py-3 border-b border-neutral-100">
                                <NoticeEditor
                                    draft={editing}
                                    onChange={setEditing}
                                    onSave={handleSave}
                                    onCancel={() => setEditing(null)}
                                    saving={saving}
                                />
                            </div>
                        ) : (
                            <NoticeRow
                                key={n.id}
                                notice={n}
                                onEdit={() => startEdit(n)}
                                onDelete={() => handleDelete(n.id)}
                                onToggle={() => handleToggle(n)}
                            />
                        )
                    )
                )}
            </div>
        </div>
    );
}
