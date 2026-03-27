"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3, List, ListOrdered,
    Quote, Code, Minus, Image as ImageIcon, Link as LinkIcon,
    Undo, Redo, X, Upload, Tag, Eye, Save, Send, Lock,
} from "lucide-react";
import type { CreatePostInput, UpdatePostInput, Post, BoardConfig } from "@/types/board";

interface PostEditorProps {
    config: BoardConfig;
    post?: Post | null;
    onSubmit: (data: CreatePostInput | UpdatePostInput) => Promise<void>;
    onCancel: () => void;
    isGuest?: boolean;
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

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            Image.configure({ inline: false, allowBase64: true }),
            LinkExt.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: "내용을 입력하세요..." }),
        ],
        content: post?.content || "",
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none",
            },
            handlePaste(view, event) {
                const items = event.clipboardData?.items;
                if (!items) return false;
                for (const item of Array.from(items)) {
                    if (item.type.startsWith("image/")) {
                        event.preventDefault();
                        const file = item.getAsFile();
                        if (!file) return false;
                        // Storage 업로드 (아임웹 스타일: 붙여넣기 → 자동 업로드 → URL 삽입)
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
                                // fallback: base64
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
                // Storage 업로드
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
                        // fallback: base64
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
    });

    const addTag = useCallback(() => {
        const t = tagInput.trim().replace(/^#/, "");
        if (t && !tags.includes(t)) {
            setTags([...tags, t]);
        }
        setTagInput("");
    }, [tagInput, tags]);

    const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

    const handleSubmit = async (asStatus: "published" | "draft") => {
        if (!title.trim()) { alert("제목을 입력하세요."); return; }
        setSubmitting(true);
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
        } finally {
            setSubmitting(false);
        }
    };

    const ToolBtn = ({ active, onClick, children, title: t }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }) => (
        <button
            type="button"
            onClick={onClick}
            title={t}
            className={`p-1.5 rounded transition-colors ${active ? "bg-black text-white" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"}`}
        >
            {children}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">{isEdit ? "글 수정" : "글 쓰기"}</h1>
                    <p className="text-sm text-neutral-500 mt-1">{config.name}</p>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* 비회원 정보 */}
            {isGuest && (
                <div className="flex gap-3 mb-4">
                    <input value={guestNickname} onChange={e => setGuestNickname(e.target.value)}
                        placeholder="닉네임 *" className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-400" />
                    <input type="password" value={guestPassword} onChange={e => setGuestPassword(e.target.value)}
                        placeholder="비밀번호 *" className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-400" />
                    <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                        placeholder="이메일 (선택)" className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-400" />
                </div>
            )}

            {/* 카테고리 선택 */}
            {config.categories.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                    {config.categories.map(c => (
                        <button key={c} type="button" onClick={() => setCategory(category === c ? "" : c)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${category === c ? "bg-black text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {/* 제목 */}
            <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full text-2xl font-bold border-none focus:outline-none placeholder-neutral-300 mb-4 bg-transparent" />

            {/* 에디터 툴바 */}
            <div className="flex items-center gap-0.5 py-2 px-1 border-y border-neutral-200 mb-0 flex-wrap">
                <ToolBtn active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} title="굵게"><Bold size={16} /></ToolBtn>
                <ToolBtn active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} title="기울임"><Italic size={16} /></ToolBtn>
                <ToolBtn active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="밑줄"><UnderlineIcon size={16} /></ToolBtn>
                <ToolBtn active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} title="취소선"><Strikethrough size={16} /></ToolBtn>
                <div className="w-px h-5 bg-neutral-200 mx-1" />
                <ToolBtn active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="제목 1"><Heading1 size={16} /></ToolBtn>
                <ToolBtn active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="제목 2"><Heading2 size={16} /></ToolBtn>
                <ToolBtn active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="제목 3"><Heading3 size={16} /></ToolBtn>
                <div className="w-px h-5 bg-neutral-200 mx-1" />
                <ToolBtn active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="목록"><List size={16} /></ToolBtn>
                <ToolBtn active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="번호 목록"><ListOrdered size={16} /></ToolBtn>
                <ToolBtn active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="인용"><Quote size={16} /></ToolBtn>
                <ToolBtn active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="코드"><Code size={16} /></ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="구분선"><Minus size={16} /></ToolBtn>
                <div className="w-px h-5 bg-neutral-200 mx-1" />
                <ToolBtn onClick={() => {
                    const url = window.prompt("이미지 URL");
                    if (url) editor?.chain().focus().setImage({ src: url }).run();
                }} title="이미지 URL"><ImageIcon size={16} /></ToolBtn>
                <ToolBtn onClick={() => {
                    const url = window.prompt("링크 URL");
                    if (url) editor?.chain().focus().setLink({ href: url }).run();
                }} title="링크"><LinkIcon size={16} /></ToolBtn>
                <div className="w-px h-5 bg-neutral-200 mx-1" />
                <ToolBtn onClick={() => editor?.chain().focus().undo().run()} title="실행 취소"><Undo size={16} /></ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().redo().run()} title="다시 실행"><Redo size={16} /></ToolBtn>
            </div>

            {/* 에디터 본문 */}
            <div className="border-b border-neutral-200 min-h-[300px]">
                <EditorContent editor={editor} />
            </div>

            {/* 태그 */}
            <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                    <Tag size={14} className="text-neutral-400" />
                    <span className="text-sm text-neutral-500">태그</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {tags.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 rounded-full text-sm">
                            #{t}
                            <button onClick={() => removeTag(t)} className="text-neutral-400 hover:text-neutral-600"><X size={12} /></button>
                        </span>
                    ))}
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="#태그 입력 후 Enter"
                        className="px-2 py-1 text-sm border-none focus:outline-none bg-transparent min-w-[140px]" />
                </div>
            </div>

            {/* 대표 이미지 */}
            <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                    <ImageIcon size={14} className="text-neutral-400" />
                    <span className="text-sm text-neutral-500">대표 이미지</span>
                </div>
                {representImage ? (
                    <div className="relative inline-block">
                        <img src={representImage} alt="대표 이미지" className="h-32 rounded-lg object-cover" />
                        <button onClick={() => setRepresentImage("")}
                            className="absolute -top-2 -right-2 bg-black text-white rounded-full p-0.5"><X size={14} /></button>
                    </div>
                ) : (
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-neutral-400 transition-colors text-sm text-neutral-500">
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
                                    // fallback to base64
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
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-neutral-500 cursor-pointer">
                        <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)}
                            className="rounded border-neutral-300" />
                        공지 고정
                    </label>
                    <label className="flex items-center gap-2 text-sm text-neutral-500 cursor-pointer">
                        <input type="checkbox" checked={isSecret} onChange={e => setIsSecret(e.target.checked)}
                            className="rounded border-neutral-300" />
                        <Lock size={14} />
                        비밀글
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onCancel} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
                        취소
                    </button>
                    <button onClick={() => handleSubmit("draft")} disabled={submitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50">
                        <Save size={14} />
                        임시저장
                    </button>
                    <button onClick={() => handleSubmit("published")} disabled={submitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">
                        <Send size={14} />
                        {isEdit ? "수정 완료" : "발행"}
                    </button>
                </div>
            </div>
        </div>
    );
}
