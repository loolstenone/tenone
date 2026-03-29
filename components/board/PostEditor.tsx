"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading2, Heading3, List, ListOrdered,
    Quote, Code, Minus, Image as ImageIcon, Link as LinkIcon,
    Undo, Redo, X, Upload, Tag, Eye, Save, Send, Lock,
    Paperclip, FileText, Trash2,
} from "lucide-react";
import type { CreatePostInput, UpdatePostInput, Post, BoardConfig, Attachment } from "@/types/board";

interface PostEditorProps {
    config: BoardConfig;
    post?: Post | null;
    onSubmit: (data: CreatePostInput | UpdatePostInput) => Promise<void>;
    onCancel: () => void;
    isGuest?: boolean;
}

interface UploadedFile {
    id?: string;
    name: string;
    size: number;
    url?: string;
    uploading?: boolean;
    error?: boolean;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function PostEditor({ config, post, onSubmit, onCancel, isGuest = false }: PostEditorProps) {
    const isEdit = !!post;

    const [title, setTitle] = useState(post?.title || "");
    const [category, setCategory] = useState(post?.category || "");
    const [tags, setTags] = useState<string[]>(post?.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [representImage, setRepresentImage] = useState(post?.representImage || "");
    const [status, setStatus] = useState<"published" | "draft">(post?.status === "draft" ? "draft" : "published");
    const [isPinned, setIsPinned] = useState(post?.isPinned || false);
    const [isSecret, setIsSecret] = useState(post?.isSecret || false);

    // 비회원
    const [guestNickname, setGuestNickname] = useState("");
    const [guestPassword, setGuestPassword] = useState("");
    const [guestEmail, setGuestEmail] = useState("");

    const [submitting, setSubmitting] = useState(false);

    // Preview toggle
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

    // Autosave indicator
    const [saveStatus, setSaveStatus] = useState<"saved" | "editing" | "saving">("saved");
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Character count
    const [charCount, setCharCount] = useState(0);

    // File attachments
    const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>(
        (post?.attachments || []).map((a: Attachment) => ({
            id: a.id,
            name: a.filename,
            size: a.filesize,
            url: a.filepath,
        }))
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3] } }),
            Underline,
            Image.configure({ inline: false, allowBase64: true }),
            LinkExt.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: "내용을 입력하세요..." }),
        ],
        content: post?.content || "",
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none tn-text",
            },
            handlePaste(view, event) {
                const items = event.clipboardData?.items;
                if (!items) return false;
                for (const item of Array.from(items)) {
                    if (item.type.startsWith("image/")) {
                        event.preventDefault();
                        const file = item.getAsFile();
                        if (!file) return false;
                        const fd = new FormData();
                        fd.append('file', file);
                        fd.append('site', config.site);
                        fetch('/api/board/upload', { method: 'POST', body: fd })
                            .then(r => r.ok ? r.json() : Promise.reject())
                            .then(({ url }) => {
                                view.dispatch(view.state.tr.replaceSelectionWith(
                                    view.state.schema.nodes.image.create({ src: url })
                                ));
                            })
                            .catch(() => {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    view.dispatch(view.state.tr.replaceSelectionWith(
                                        view.state.schema.nodes.image.create({ src: e.target?.result as string })
                                    ));
                                };
                                reader.readAsDataURL(file);
                            });
                        return true;
                    }
                }
                return false;
            },
            handleDrop(view, event) {
                const files = event.dataTransfer?.files;
                if (!files?.length) return false;
                const file = files[0];
                if (!file.type.startsWith("image/")) return false;
                event.preventDefault();
                const fd = new FormData();
                fd.append('file', file);
                fd.append('site', config.site);
                const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos || 0;
                fetch('/api/board/upload', { method: 'POST', body: fd })
                    .then(r => r.ok ? r.json() : Promise.reject())
                    .then(({ url }) => {
                        const { tr } = view.state;
                        view.dispatch(tr.insert(pos, view.state.schema.nodes.image.create({ src: url })));
                    })
                    .catch(() => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const { tr } = view.state;
                            view.dispatch(tr.insert(pos, view.state.schema.nodes.image.create({ src: e.target?.result as string })));
                        };
                        reader.readAsDataURL(file);
                    });
                return true;
            },
        },
        onUpdate({ editor: ed }) {
            // Character count
            setCharCount(ed.getText().length);
            // Autosave indicator
            setSaveStatus("editing");
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                setSaveStatus("saved");
            }, 1500);
        },
    });

    // Initial char count
    useEffect(() => {
        if (editor) {
            setCharCount(editor.getText().length);
        }
    }, [editor]);

    const addTag = useCallback(() => {
        const t = tagInput.trim().replace(/^#/, "");
        if (t && !tags.includes(t)) {
            setTags([...tags, t]);
        }
        setTagInput("");
    }, [tagInput, tags]);

    const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

    // Image upload via button (toolbar)
    const handleImageUpload = useCallback(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file || !editor) return;
            const fd = new FormData();
            fd.append("file", file);
            fd.append("site", config.site);
            try {
                const res = await fetch("/api/board/upload", { method: "POST", body: fd });
                if (res.ok) {
                    const { url } = await res.json();
                    editor.chain().focus().setImage({ src: url }).run();
                }
            } catch {
                // fallback base64
                const reader = new FileReader();
                reader.onload = (e) => {
                    editor.chain().focus().setImage({ src: e.target?.result as string }).run();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }, [editor, config.site]);

    // File attachment upload
    const handleFileAttach = useCallback(async (files: FileList) => {
        for (const file of Array.from(files)) {
            const tempEntry: UploadedFile = { name: file.name, size: file.size, uploading: true };
            setAttachedFiles(prev => [...prev, tempEntry]);

            try {
                const fd = new FormData();
                fd.append("file", file);
                fd.append("site", config.site);
                const res = await fetch("/api/board/upload", { method: "POST", body: fd });
                if (res.ok) {
                    const { url } = await res.json();
                    setAttachedFiles(prev =>
                        prev.map(f => f === tempEntry ? { ...f, url, uploading: false } : f)
                    );
                } else {
                    setAttachedFiles(prev =>
                        prev.map(f => f === tempEntry ? { ...f, uploading: false, error: true } : f)
                    );
                }
            } catch {
                setAttachedFiles(prev =>
                    prev.map(f => f === tempEntry ? { ...f, uploading: false, error: true } : f)
                );
            }
        }
    }, [config.site]);

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (asStatus: "published" | "draft") => {
        if (!title.trim()) { alert("제목을 입력하세요."); return; }
        setSubmitting(true);
        setSaveStatus("saving");
        try {
            const content = editor?.getHTML() || "";
            const excerpt = editor?.getText().substring(0, 200) || "";

            if (isEdit) {
                const data: UpdatePostInput = {
                    title, content, excerpt, category,
                    tags, representImage, status: asStatus, isPinned, isSecret,
                };
                await onSubmit(data);
            } else {
                const data: CreatePostInput = {
                    site: config.site,
                    board: config.slug,
                    title, content, excerpt, category,
                    tags, representImage, status: asStatus, isPinned, isSecret,
                    ...(isGuest ? { guestNickname, guestPassword, guestEmail } : {}),
                };
                await onSubmit(data);
            }
            setSaveStatus("saved");
        } finally {
            setSubmitting(false);
        }
    };

    const ToolBtn = ({ active, onClick, children, title: t }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }) => (
        <button
            type="button"
            onClick={onClick}
            title={t}
            className={`p-1.5 rounded transition-colors ${
                active
                    ? "tn-text font-bold"
                    : "tn-text-muted hover:tn-text"
            }`}
            style={active ? { backgroundColor: "var(--tn-bg-alt)" } : {}}
        >
            {children}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold tn-text">{isEdit ? "글 수정" : "글 쓰기"}</h1>
                    <p className="text-sm tn-text-muted mt-1">{config.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Autosave + character count */}
                    <div className="flex items-center gap-2 text-xs tn-text-muted">
                        <span>{charCount.toLocaleString()}자</span>
                        <span className="w-px h-3" style={{ backgroundColor: "var(--tn-border)" }} />
                        <span className={saveStatus === "editing" ? "text-amber-500" : "tn-text-muted"}>
                            {saveStatus === "editing" ? "수정 중..." : saveStatus === "saving" ? "저장 중..." : "저장됨"}
                        </span>
                    </div>
                    <button onClick={onCancel} className="p-2 rounded-full transition-colors tn-text-muted hover:tn-text" style={{ backgroundColor: "transparent" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--tn-bg-alt)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* 비회원 정보 */}
            {isGuest && (
                <div className="flex gap-3 mb-4">
                    <input value={guestNickname} onChange={e => setGuestNickname(e.target.value)}
                        placeholder="닉네임 *" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none bg-transparent tn-text" style={{ borderColor: "var(--tn-border)" }} />
                    <input type="password" value={guestPassword} onChange={e => setGuestPassword(e.target.value)}
                        placeholder="비밀번호 *" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none bg-transparent tn-text" style={{ borderColor: "var(--tn-border)" }} />
                    <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                        placeholder="이메일 (선택)" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none bg-transparent tn-text" style={{ borderColor: "var(--tn-border)" }} />
                </div>
            )}

            {/* 카테고리 선택 */}
            {config.categories.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                    {config.categories.map(c => (
                        <button key={c} type="button" onClick={() => setCategory(category === c ? "" : c)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${category === c ? "text-white" : "tn-text-sub"}`}
                            style={category === c
                                ? { backgroundColor: "var(--tn-text)" }
                                : { backgroundColor: "var(--tn-bg-alt)" }
                            }>
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {/* 제목 */}
            <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full text-2xl font-bold border-none focus:outline-none mb-4 bg-transparent tn-text placeholder:tn-text-muted" />

            {/* Edit / Preview 탭 */}
            <div className="flex items-center gap-0 border-b mb-0" style={{ borderColor: "var(--tn-border)" }}>
                <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                        activeTab === "edit"
                            ? "font-semibold border-current tn-text"
                            : "border-transparent tn-text-muted"
                    }`}
                >
                    편집
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors ${
                        activeTab === "preview"
                            ? "font-semibold border-current tn-text"
                            : "border-transparent tn-text-muted"
                    }`}
                >
                    <Eye size={14} />
                    미리보기
                </button>
            </div>

            {/* 에디터 툴바 (edit mode only) */}
            {activeTab === "edit" && (
                <div className="flex items-center gap-0.5 py-2 px-1 border-b mb-0 flex-wrap" style={{ borderColor: "var(--tn-border)" }}>
                    <ToolBtn active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} title="굵게"><Bold size={16} /></ToolBtn>
                    <ToolBtn active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} title="기울임"><Italic size={16} /></ToolBtn>
                    <ToolBtn active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="밑줄"><UnderlineIcon size={16} /></ToolBtn>
                    <ToolBtn active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} title="취소선"><Strikethrough size={16} /></ToolBtn>
                    <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--tn-border)" }} />
                    <ToolBtn active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="제목 2"><Heading2 size={16} /></ToolBtn>
                    <ToolBtn active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="제목 3"><Heading3 size={16} /></ToolBtn>
                    <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--tn-border)" }} />
                    <ToolBtn active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="목록"><List size={16} /></ToolBtn>
                    <ToolBtn active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="번호 목록"><ListOrdered size={16} /></ToolBtn>
                    <ToolBtn active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="인용"><Quote size={16} /></ToolBtn>
                    <ToolBtn active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="코드"><Code size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="구분선"><Minus size={16} /></ToolBtn>
                    <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--tn-border)" }} />
                    <ToolBtn onClick={handleImageUpload} title="이미지 업로드"><ImageIcon size={16} /></ToolBtn>
                    <ToolBtn onClick={() => {
                        const url = window.prompt("링크 URL");
                        if (url) editor?.chain().focus().setLink({ href: url }).run();
                    }} title="링크"><LinkIcon size={16} /></ToolBtn>
                    <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--tn-border)" }} />
                    <ToolBtn onClick={() => editor?.chain().focus().undo().run()} title="실행 취소"><Undo size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor?.chain().focus().redo().run()} title="다시 실행"><Redo size={16} /></ToolBtn>
                </div>
            )}

            {/* 에디터 본문 / 미리보기 */}
            <div className="border-b min-h-[300px]" style={{ borderColor: "var(--tn-border)" }}>
                {activeTab === "edit" ? (
                    <EditorContent editor={editor} />
                ) : (
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px]
                            prose-img:w-full prose-img:rounded-lg prose-img:my-4
                            prose-p:leading-relaxed
                            prose-a:underline prose-a:underline-offset-2
                            prose-headings:font-bold prose-headings:tracking-tight
                            prose-blockquote:border-l-2 prose-blockquote:pl-4 prose-blockquote:italic
                            [&_img]:max-w-full [&_img]:h-auto"
                        style={{ color: "var(--tn-text-sub)" }}
                        dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "<p class='tn-text-muted'>내용이 없습니다</p>" }}
                    />
                )}
            </div>

            {/* 첨부파일 */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Paperclip size={14} className="tn-text-muted" />
                        <span className="text-sm tn-text-muted">첨부파일</span>
                        {attachedFiles.length > 0 && (
                            <span className="text-xs tn-text-muted">({attachedFiles.length})</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors tn-text-sub"
                        style={{ borderColor: "var(--tn-border)" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--tn-bg-alt)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                        <Upload size={12} />
                        파일 추가
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={e => {
                            if (e.target.files?.length) {
                                handleFileAttach(e.target.files);
                                e.target.value = "";
                            }
                        }}
                    />
                </div>
                {attachedFiles.length > 0 && (
                    <div className="space-y-1.5">
                        {attachedFiles.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-lg border transition-colors"
                                style={{ borderColor: "var(--tn-border)", backgroundColor: "var(--tn-bg-alt)" }}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText size={14} className={file.error ? "text-red-400" : "tn-text-muted"} />
                                    <span className="text-sm truncate tn-text">{file.name}</span>
                                    <span className="text-xs tn-text-muted shrink-0">({formatFileSize(file.size)})</span>
                                    {file.uploading && (
                                        <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin tn-text-muted" />
                                    )}
                                    {file.error && (
                                        <span className="text-xs text-red-400">업로드 실패</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(idx)}
                                    className="p-1 rounded transition-colors text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 태그 */}
            <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                    <Tag size={14} className="tn-text-muted" />
                    <span className="text-sm tn-text-muted">태그</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {tags.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm"
                            style={{ backgroundColor: "var(--tn-bg-alt)", color: "var(--tn-text-sub)" }}>
                            #{t}
                            <button onClick={() => removeTag(t)} className="tn-text-muted hover:tn-text transition-colors"><X size={12} /></button>
                        </span>
                    ))}
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="#태그 입력 후 Enter"
                        className="px-2 py-1 text-sm border-none focus:outline-none bg-transparent min-w-[140px] tn-text" />
                </div>
            </div>

            {/* 대표 이미지 */}
            <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                    <ImageIcon size={14} className="tn-text-muted" />
                    <span className="text-sm tn-text-muted">대표 이미지</span>
                </div>
                {representImage ? (
                    <div className="relative inline-block">
                        <img src={representImage} alt="대표 이미지" className="h-32 rounded-lg object-cover" />
                        <button onClick={() => setRepresentImage("")}
                            className="absolute -top-2 -right-2 bg-black text-white rounded-full p-0.5"><X size={14} /></button>
                    </div>
                ) : (
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors text-sm tn-text-muted"
                        style={{ borderColor: "var(--tn-border)" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--tn-text-muted)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--tn-border)"}>
                        <Upload size={14} />
                        이미지 업로드
                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                                const fd = new FormData();
                                fd.append('file', file);
                                fd.append('site', config.site);
                                const res = await fetch('/api/board/upload', { method: 'POST', body: fd });
                                if (res.ok) {
                                    const { url } = await res.json();
                                    setRepresentImage(url);
                                } else {
                                    const reader = new FileReader();
                                    reader.onload = ev => setRepresentImage(ev.target?.result as string);
                                    reader.readAsDataURL(file);
                                }
                            } catch {
                                const reader = new FileReader();
                                reader.onload = ev => setRepresentImage(ev.target?.result as string);
                                reader.readAsDataURL(file);
                            }
                        }} />
                    </label>
                )}
            </div>

            {/* 하단 액션 */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t" style={{ borderColor: "var(--tn-border)" }}>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm tn-text-muted cursor-pointer">
                        <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)}
                            className="rounded" style={{ borderColor: "var(--tn-border)" }} />
                        공지 고정
                    </label>
                    <label className="flex items-center gap-2 text-sm tn-text-muted cursor-pointer">
                        <input type="checkbox" checked={isSecret} onChange={e => setIsSecret(e.target.checked)}
                            className="rounded" style={{ borderColor: "var(--tn-border)" }} />
                        <Lock size={14} />
                        비밀글
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onCancel} className="px-4 py-2 text-sm tn-text-muted transition-colors hover:tn-text">
                        취소
                    </button>
                    <button onClick={() => handleSubmit("draft")} disabled={submitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border rounded-lg transition-colors disabled:opacity-50 tn-text-sub"
                        style={{ borderColor: "var(--tn-border)" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--tn-bg-alt)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <Save size={14} />
                        임시저장
                    </button>
                    <button onClick={() => handleSubmit("published")} disabled={submitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "var(--tn-text)" }}>
                        <Send size={14} />
                        {isEdit ? "수정 완료" : "발행"}
                    </button>
                </div>
            </div>
        </div>
    );
}
