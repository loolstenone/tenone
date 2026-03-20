"use client";

import { useState, useRef } from "react";
import { useCms } from "@/lib/cms-context";
import { CmsPost, CmsChannel, CmsCategory, CmsStatus } from "@/types/cms";
import { brands } from "@/lib/data";
import {
    Plus, Edit2, Trash2, ExternalLink, Search, ImagePlus, Upload, X as XIcon,
    ArrowLeft, Eye, Check, ChevronDown, MoreHorizontal, Copy, Link2
} from "lucide-react";
import clsx from "clsx";

const channelLabels: Record<CmsChannel, string> = { works: 'Works', newsroom: 'Newsroom' };
const allCategories: CmsCategory[] = ['브랜드', '프로젝트', '네트워크', '교육', '콘텐츠', '공지'];
const allChannels: CmsChannel[] = ['works', 'newsroom'];
const allStatuses: CmsStatus[] = ['Draft', 'Published', 'Archived'];
const inputClass = "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none bg-white";
const labelClass = "text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5";

// ===== Toolbar Button =====
function ToolbarBtn({ icon: Icon, label, onClick, active }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; active?: boolean }) {
    return (
        <button onClick={onClick} title={label}
            className={clsx("p-1.5 rounded hover:bg-neutral-200 transition-colors", active && "bg-neutral-200 text-neutral-900")}>
            <Icon className="h-4 w-4" />
        </button>
    );
}

// ===== Full-page Editor =====
function PostEditor({ post, onSave, onCancel }: { post?: CmsPost | null; onSave: (p: CmsPost) => void; onCancel: () => void }) {
    const isEdit = !!post;
    const [form, setForm] = useState<CmsPost>(post || {
        id: `cms-${Date.now()}`, title: '', summary: '', body: '',
        category: '브랜드', channels: ['newsroom'], status: 'Draft',
        date: new Date().toISOString().split('T')[0], tags: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
    });
    const [tagInput, setTagInput] = useState(post?.tags.join(', ') || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bodyImageRef = useRef<HTMLInputElement>(null);
    const bodyRef = useRef<HTMLTextAreaElement>(null);
    const [activePanel, setActivePanel] = useState<'settings' | 'seo'>('settings');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('이미지 파일만 업로드할 수 있습니다.'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('5MB 이하 파일만 업로드할 수 있습니다.'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => setForm(p => ({ ...p, image: ev.target?.result as string }));
        reader.readAsDataURL(file);
    };

    const handleBodyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('이미지 파일만 업로드할 수 있습니다.'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('5MB 이하 파일만 업로드할 수 있습니다.'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            insertAtCursor(`\n![이미지](${ev.target?.result as string})\n`);
        };
        reader.readAsDataURL(file);
    };

    const toggleChannel = (ch: CmsChannel) => {
        setForm(prev => ({
            ...prev,
            channels: prev.channels.includes(ch) ? prev.channels.filter(c => c !== ch) : [...prev.channels, ch]
        }));
    };

    // Extract first image from body as fallback thumbnail
    const getFirstBodyImage = (body: string): string | undefined => {
        const mdMatch = body.match(/!\[.*?\]\((data:[^)]+|https?:\/\/[^)]+)\)/);
        if (mdMatch) return mdMatch[1];
        const urlMatch = body.match(/(https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp))/i);
        return urlMatch?.[1];
    };

    const effectiveImage = form.image || getFirstBodyImage(form.body);

    const handleSave = (status?: CmsStatus) => {
        const finalForm = status ? { ...form, status } : form;
        // If no explicit image set, use first body image
        const autoImage = !finalForm.image ? getFirstBodyImage(finalForm.body) : undefined;
        onSave({
            ...finalForm,
            image: finalForm.image || autoImage,
            tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
            updatedAt: new Date().toISOString().split('T')[0],
        });
    };

    // Rich text helpers
    const insertAtCursor = (text: string) => {
        const ta = bodyRef.current;
        if (!ta) { setForm(p => ({ ...p, body: p.body + text })); return; }
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = form.body.substring(0, start);
        const after = form.body.substring(end);
        setForm(p => ({ ...p, body: before + text + after }));
        setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + text.length; }, 0);
    };

    const wrapSelection = (before: string, after: string) => {
        const ta = bodyRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = form.body.substring(start, end);
        const wrapped = before + (selected || '텍스트') + after;
        const bodyBefore = form.body.substring(0, start);
        const bodyAfter = form.body.substring(end);
        setForm(p => ({ ...p, body: bodyBefore + wrapped + bodyAfter }));
        setTimeout(() => {
            ta.focus();
            ta.selectionStart = start + before.length;
            ta.selectionEnd = start + before.length + (selected || '텍스트').length;
        }, 0);
    };

    const insertHeading = () => {
        const ta = bodyRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const lineStart = form.body.lastIndexOf('\n', start - 1) + 1;
        const lineText = form.body.substring(lineStart, start);
        if (lineText.startsWith('### ')) {
            const newBody = form.body.substring(0, lineStart) + form.body.substring(lineStart + 4);
            setForm(p => ({ ...p, body: newBody }));
        } else if (lineText.startsWith('## ')) {
            const newBody = form.body.substring(0, lineStart) + '### ' + form.body.substring(lineStart + 3);
            setForm(p => ({ ...p, body: newBody }));
        } else {
            const newBody = form.body.substring(0, lineStart) + '## ' + form.body.substring(lineStart);
            setForm(p => ({ ...p, body: newBody }));
        }
    };

    const insertList = (ordered: boolean) => {
        const ta = bodyRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const prefix = ordered ? '1. ' : '- ';
        insertAtCursor('\n' + prefix);
    };

    const insertLink = () => {
        const url = prompt('링크 URL을 입력하세요:', 'https://');
        if (!url) return;
        const ta = bodyRef.current;
        const selected = ta ? form.body.substring(ta.selectionStart, ta.selectionEnd) : '';
        const linkText = selected || '링크 텍스트';
        if (ta) {
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const bodyBefore = form.body.substring(0, start);
            const bodyAfter = form.body.substring(end);
            setForm(p => ({ ...p, body: bodyBefore + `[${linkText}](${url})` + bodyAfter }));
        } else {
            insertAtCursor(`[${linkText}](${url})`);
        }
    };

    const insertQuote = () => wrapSelection('\n> ', '\n');
    const insertDivider = () => insertAtCursor('\n\n---\n\n');

    // Auto-link: detect pasted URLs and wrap them
    const handleBodyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pasted = e.clipboardData.getData('text');
        const urlRegex = /^https?:\/\/\S+$/;
        if (urlRegex.test(pasted.trim())) {
            const ta = bodyRef.current;
            if (!ta) return;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const selected = form.body.substring(start, end);
            if (selected) {
                // If text is selected, wrap it as link text
                e.preventDefault();
                const bodyBefore = form.body.substring(0, start);
                const bodyAfter = form.body.substring(end);
                setForm(p => ({ ...p, body: bodyBefore + `[${selected}](${pasted.trim()})` + bodyAfter }));
            }
            // If no selection, let normal paste happen (raw URL is fine in markdown)
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Top bar */}
            <div className="h-12 border-b border-neutral-200 px-6 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> 목록
                    </button>
                    <div className="h-5 w-px bg-neutral-200" />
                    <span className="text-sm font-medium text-neutral-900">{isEdit ? '글 수정' : '새 글 작성'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleSave('Draft')}
                        className="px-4 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 transition-colors">
                        임시저장
                    </button>
                    <button onClick={() => handleSave('Published')}
                        className="px-5 py-1.5 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                        발행하기
                    </button>
                </div>
            </div>

            {/* Editor body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main content area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto py-6 px-8">
                        {/* Title */}
                        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className="w-full text-2xl font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none mb-2"
                            placeholder="제목을 입력하세요" />

                        {/* Summary + Thumbnail side by side */}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <input ref={bodyImageRef} type="file" accept="image/*" onChange={handleBodyImageUpload} className="hidden" />
                        <div className="flex gap-4 mb-5">
                            {/* Summary */}
                            <div className="flex-1">
                                <textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                                    className="w-full h-full text-sm text-neutral-500 placeholder:text-neutral-300 focus:outline-none resize-none border border-neutral-200 rounded p-3"
                                    placeholder="요약을 입력하세요&#10;(목록과 검색결과에 표시됩니다)" />
                            </div>
                            {/* Thumbnail */}
                            <div className="w-48 shrink-0">
                                {form.image && (form.image.startsWith('data:') || form.image.startsWith('http')) ? (
                                    <div className="relative group h-full">
                                        <div className="h-full bg-neutral-100 border border-neutral-200 overflow-hidden rounded">
                                            <img src={form.image} alt="썸네일" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                                className="px-1.5 py-0.5 bg-white/90 border border-neutral-200 text-neutral-500 hover:text-neutral-900 shadow-sm text-[9px]">
                                                변경
                                            </button>
                                            <button type="button" onClick={() => setForm(p => ({ ...p, image: undefined }))}
                                                className="p-0.5 bg-white/90 border border-neutral-200 text-neutral-500 hover:text-red-500 shadow-sm">
                                                <XIcon className="h-2.5 w-2.5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : effectiveImage ? (
                                    <div className="relative group h-full">
                                        <div className="h-full bg-neutral-100 border border-neutral-200 overflow-hidden rounded opacity-70">
                                            <img src={effectiveImage} alt="자동 썸네일" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded">
                                            <p className="text-[9px] text-white bg-black/50 px-2 py-0.5 rounded mb-1">본문 이미지 사용 중</p>
                                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                                className="text-[9px] text-white bg-black/50 px-2 py-0.5 rounded hover:bg-black/70">
                                                직접 설정
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-full min-h-[80px] bg-neutral-50 border border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1 hover:border-neutral-400 hover:bg-neutral-100 transition-colors cursor-pointer rounded">
                                        <ImagePlus className="h-5 w-5 text-neutral-300" />
                                        <p className="text-[10px] text-neutral-400">대표 이미지</p>
                                        <p className="text-[9px] text-neutral-300">또는 본문 첫 이미지 자동 사용</p>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Body editor with toolbar */}
                        <div className="mb-6 border border-neutral-200 rounded overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex items-center gap-0.5 px-2 py-1.5 bg-neutral-50 border-b border-neutral-200 flex-wrap">
                                <ToolbarBtn icon={({ className }) => <span className={clsx(className, "font-bold text-xs")}>B</span>}
                                    label="굵게 (Ctrl+B)" onClick={() => wrapSelection('**', '**')} />
                                <ToolbarBtn icon={({ className }) => <span className={clsx(className, "italic text-xs")}>I</span>}
                                    label="기울임 (Ctrl+I)" onClick={() => wrapSelection('*', '*')} />
                                <ToolbarBtn icon={({ className }) => <span className={clsx(className, "line-through text-xs")}>S</span>}
                                    label="취소선" onClick={() => wrapSelection('~~', '~~')} />
                                <div className="w-px h-5 bg-neutral-200 mx-1" />
                                <ToolbarBtn icon={({ className }) => <span className={clsx(className, "text-xs font-bold")}>H</span>}
                                    label="제목 (H2/H3)" onClick={insertHeading} />
                                <ToolbarBtn icon={({ className }) => <span className={clsx(className, "text-xs")}>•</span>}
                                    label="글머리 기호" onClick={() => insertList(false)} />
                                <ToolbarBtn icon={({ className }) => <span className={clsx(className, "text-xs")}>1.</span>}
                                    label="번호 목록" onClick={() => insertList(true)} />
                                <ToolbarBtn icon={({ className }) => <span className={clsx(className, "text-xs")}>&ldquo;</span>}
                                    label="인용" onClick={insertQuote} />
                                <div className="w-px h-5 bg-neutral-200 mx-1" />
                                <ToolbarBtn icon={Link2} label="링크 삽입" onClick={insertLink} />
                                <ToolbarBtn icon={ImagePlus} label="이미지 삽입" onClick={() => bodyImageRef.current?.click()} />
                                <div className="w-px h-5 bg-neutral-200 mx-1" />
                                <ToolbarBtn icon={({ className }) => <span className={clsx(className, "text-[10px]")}>―</span>}
                                    label="구분선" onClick={insertDivider} />
                                <span className="ml-auto text-[10px] text-neutral-300 px-2">Markdown</span>
                            </div>
                            {/* Textarea */}
                            <textarea ref={bodyRef} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                                onPaste={handleBodyPaste}
                                onKeyDown={e => {
                                    if (e.ctrlKey || e.metaKey) {
                                        if (e.key === 'b') { e.preventDefault(); wrapSelection('**', '**'); }
                                        if (e.key === 'i') { e.preventDefault(); wrapSelection('*', '*'); }
                                    }
                                }}
                                className="w-full min-h-[400px] text-sm text-neutral-700 leading-relaxed placeholder:text-neutral-300 focus:outline-none resize-none p-4 font-mono"
                                placeholder="본문 내용을 작성하세요...&#10;&#10;## 소제목&#10;- 목록 항목&#10;**굵은 글씨**&#10;*기울임*&#10;[링크텍스트](URL)&#10;![이미지 설명](이미지URL)" />
                        </div>
                    </div>
                </div>

                {/* Right sidebar panel */}
                <div className="w-[320px] border-l border-neutral-200 bg-neutral-50 flex flex-col shrink-0 overflow-y-auto">
                    {/* Panel tabs */}
                    <div className="flex border-b border-neutral-200 shrink-0">
                        <button onClick={() => setActivePanel('settings')}
                            className={clsx("flex-1 py-3 text-xs font-medium text-center transition-colors",
                                activePanel === 'settings' ? "text-neutral-900 border-b-2 border-neutral-900" : "text-neutral-400"
                            )}>설정</button>
                        <button onClick={() => setActivePanel('seo')}
                            className={clsx("flex-1 py-3 text-xs font-medium text-center transition-colors",
                                activePanel === 'seo' ? "text-neutral-900 border-b-2 border-neutral-900" : "text-neutral-400"
                            )}>SEO</button>
                    </div>

                    <div className="p-5 space-y-5">
                        {activePanel === 'settings' && (
                            <>
                                {/* Status */}
                                <div>
                                    <label className={labelClass}>상태</label>
                                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as CmsStatus }))} className={inputClass}>
                                        {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Channels */}
                                <div>
                                    <label className={labelClass}>노출 채널</label>
                                    <div className="flex gap-2">
                                        {allChannels.map(ch => (
                                            <button key={ch} onClick={() => toggleChannel(ch)}
                                                className={clsx("flex-1 py-2 text-xs border transition-colors text-center",
                                                    form.channels.includes(ch)
                                                        ? 'bg-neutral-900 text-white border-neutral-900'
                                                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                                                )}>{channelLabels[ch]}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className={labelClass}>카테고리</label>
                                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as CmsCategory }))} className={inputClass}>
                                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className={labelClass}>발행일</label>
                                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={inputClass} />
                                </div>

                                {/* Brand */}
                                <div>
                                    <label className={labelClass}>관련 브랜드</label>
                                    <select value={form.brandId || ''} onChange={e => setForm(p => ({ ...p, brandId: e.target.value || undefined }))} className={inputClass}>
                                        <option value="">없음</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>

                                {/* External link */}
                                <div>
                                    <label className={labelClass}>외부 링크</label>
                                    <input value={form.externalLink || ''} onChange={e => setForm(p => ({ ...p, externalLink: e.target.value || undefined }))}
                                        className={inputClass} placeholder="https://..." />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className={labelClass}>태그</label>
                                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                        className={inputClass} placeholder="쉼표로 구분 (AI, 브랜드)" />
                                    {tagInput && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {tagInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-neutral-200 text-neutral-600">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activePanel === 'seo' && (
                            <>
                                <div>
                                    <label className={labelClass}>URL 슬러그</label>
                                    <div className="flex items-center gap-1 text-xs text-neutral-400 mb-1">
                                        <Link2 className="h-3 w-3" /> /works/{form.id}
                                    </div>
                                    <p className="text-[10px] text-neutral-400">자동 생성됩니다.</p>
                                </div>
                                <div>
                                    <label className={labelClass}>검색 엔진 미리보기</label>
                                    <div className="border border-neutral-200 bg-white p-4 space-y-1">
                                        <p className="text-sm text-blue-700 font-medium truncate">{form.title || '제목 없음'}</p>
                                        <p className="text-xs text-green-700">tenone.biz/works/{form.id}</p>
                                        <p className="text-xs text-neutral-500 line-clamp-2">{form.summary || '요약이 여기에 표시됩니다.'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>메타 설명</label>
                                    <textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                                        className={inputClass + " resize-none"} rows={3} placeholder="검색 결과에 표시될 설명" />
                                    <p className="text-[10px] text-neutral-400 mt-1">{form.summary.length}/160자</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== CMS List Page =====
export default function CmsPage() {
    const { posts, addPost, updatePost, deletePost } = useCms();
    const [editing, setEditing] = useState<CmsPost | null | 'new'>(null);
    const [search, setSearch] = useState('');
    const [filterChannel, setFilterChannel] = useState<CmsChannel | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<CmsStatus | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<CmsCategory | 'all'>('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

    const filtered = posts
        .filter(p => filterChannel === 'all' || p.channels.includes(filterChannel as CmsChannel))
        .filter(p => filterStatus === 'all' || p.status === filterStatus)
        .filter(p => filterCategory === 'all' || p.category === filterCategory)
        .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date));

    const handleSave = (post: CmsPost) => {
        if (editing === 'new') addPost(post);
        else updatePost(post.id, post);
        setEditing(null);
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(p => p.id)));
    };

    const bulkDelete = () => {
        if (!confirm(`${selected.size}개의 글을 삭제하시겠습니까?`)) return;
        selected.forEach(id => deletePost(id));
        setSelected(new Set());
        setBulkMenuOpen(false);
    };

    const bulkStatusChange = (status: CmsStatus) => {
        selected.forEach(id => updatePost(id, { status }));
        setSelected(new Set());
        setBulkMenuOpen(false);
    };

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'Published').length,
        draft: posts.filter(p => p.status === 'Draft').length,
        archived: posts.filter(p => p.status === 'Archived').length,
    };

    // If editing, show full-page editor
    if (editing) {
        return (
            <PostEditor
                post={editing === 'new' ? null : editing}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">콘텐츠 관리</h1>
                    <p className="text-sm text-neutral-500 mt-1">Works, Newsroom에 노출되는 콘텐츠를 관리합니다.</p>
                </div>
                <button onClick={() => setEditing('new')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" /> 새 글 작성
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                    { label: '전체', value: stats.total, color: '' },
                    { label: 'Published', value: stats.published, color: 'text-neutral-900' },
                    { label: 'Draft', value: stats.draft, color: 'text-neutral-400' },
                    { label: 'Archived', value: stats.archived, color: 'text-neutral-300' },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className={clsx("text-2xl font-bold", s.color)}>{s.value}</p>
                        <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full border border-neutral-200 pl-10 pr-4 py-2 text-sm focus:border-neutral-900 focus:outline-none bg-white" placeholder="제목, 요약 검색..." />
                </div>
                {/* Channel filter */}
                <select value={filterChannel} onChange={e => setFilterChannel(e.target.value as CmsChannel | 'all')}
                    className="border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none bg-white">
                    <option value="all">전체 채널</option>
                    {allChannels.map(ch => <option key={ch} value={ch}>{channelLabels[ch]}</option>)}
                </select>
                {/* Status filter */}
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as CmsStatus | 'all')}
                    className="border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none bg-white">
                    <option value="all">전체 상태</option>
                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {/* Category filter */}
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as CmsCategory | 'all')}
                    className="border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none bg-white">
                    <option value="all">전체 카테고리</option>
                    {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Bulk actions bar */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-100 border border-neutral-200">
                    <span className="text-sm font-medium">{selected.size}개 선택</span>
                    <div className="relative">
                        <button onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-neutral-300 bg-white hover:bg-neutral-50">
                            일괄 작업 <ChevronDown className="h-3 w-3" />
                        </button>
                        {bulkMenuOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 shadow-lg py-1 min-w-[140px] z-10">
                                <button onClick={() => bulkStatusChange('Published')} className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50">발행하기</button>
                                <button onClick={() => bulkStatusChange('Draft')} className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50">임시저장</button>
                                <button onClick={() => bulkStatusChange('Archived')} className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50">보관하기</button>
                                <div className="h-px bg-neutral-100 my-1" />
                                <button onClick={bulkDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">삭제하기</button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => { setSelected(new Set()); setBulkMenuOpen(false); }} className="text-xs text-neutral-400 hover:text-neutral-900 ml-auto">
                        선택 해제
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="border border-neutral-200 bg-white">
                {/* Header row */}
                <div className="grid grid-cols-[40px_60px_1fr_90px_110px_90px_80px_40px] bg-neutral-50 border-b border-neutral-200 px-3 py-3 text-xs font-medium text-neutral-500 items-center">
                    <label className="flex items-center justify-center">
                        <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length}
                            onChange={toggleSelectAll} className="accent-neutral-900" />
                    </label>
                    <span></span>
                    <span>제목</span>
                    <span>카테고리</span>
                    <span>노출 채널</span>
                    <span>날짜</span>
                    <span className="text-center">상태</span>
                    <span></span>
                </div>

                {/* Rows */}
                {filtered.map(post => (
                    <div key={post.id}
                        className={clsx(
                            "grid grid-cols-[40px_60px_1fr_90px_110px_90px_80px_40px] px-3 py-2.5 border-b border-neutral-100 items-center hover:bg-neutral-50 transition-colors group",
                            selected.has(post.id) && "bg-blue-50/50"
                        )}>
                        {/* Checkbox */}
                        <label className="flex items-center justify-center">
                            <input type="checkbox" checked={selected.has(post.id)} onChange={() => toggleSelect(post.id)} className="accent-neutral-900" />
                        </label>

                        {/* Thumbnail */}
                        <div className="w-10 h-10 bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {post.image && (post.image.startsWith('data:') || post.image.startsWith('http')) ? (
                                <img src={post.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <ImagePlus className="h-3.5 w-3.5 text-neutral-300" />
                            )}
                        </div>

                        {/* Title + summary */}
                        <div className="min-w-0 px-2">
                            <button onClick={() => setEditing(post)} className="text-sm font-medium text-neutral-900 truncate block text-left hover:underline">
                                {post.title}
                            </button>
                            <p className="text-[11px] text-neutral-400 truncate">{post.summary}</p>
                        </div>

                        {/* Category */}
                        <span className="text-xs text-neutral-500">{post.category}</span>

                        {/* Channels */}
                        <div className="flex gap-1 flex-wrap">
                            {post.channels.map(ch => (
                                <span key={ch} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{channelLabels[ch]}</span>
                            ))}
                        </div>

                        {/* Date */}
                        <span className="text-xs text-neutral-400">{post.date}</span>

                        {/* Status */}
                        <span className={clsx("text-[10px] text-center px-2 py-0.5 font-medium",
                            post.status === 'Published' ? 'bg-neutral-900 text-white' :
                            post.status === 'Draft' ? 'bg-neutral-200 text-neutral-600' :
                            'bg-neutral-100 text-neutral-400'
                        )}>{post.status}</span>

                        {/* Actions */}
                        <div className="flex items-center justify-center">
                            <div className="hidden group-hover:flex gap-0.5">
                                <button onClick={() => setEditing(post)} className="p-1 text-neutral-400 hover:text-neutral-900" title="수정">
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                {post.status === 'Published' && post.channels.includes('works') && (
                                    <a href={`/works/${post.id}`} target="_blank" rel="noopener noreferrer" className="p-1 text-neutral-400 hover:text-neutral-900" title="미리보기">
                                        <Eye className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                <button onClick={() => { if (confirm('삭제하시겠습니까?')) deletePost(post.id); }}
                                    className="p-1 text-neutral-400 hover:text-red-500" title="삭제">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="px-4 py-16 text-center">
                        <p className="text-sm text-neutral-400 mb-4">조건에 맞는 콘텐츠가 없습니다.</p>
                        <button onClick={() => setEditing('new')} className="text-sm text-neutral-900 hover:underline">
                            + 새 글 작성하기
                        </button>
                    </div>
                )}
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between mt-4 text-xs text-neutral-400">
                <span>총 {filtered.length}개 / 전체 {posts.length}개</span>
                <span>마지막 업데이트: {posts.length > 0 ? posts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.updatedAt : '-'}</span>
            </div>
        </div>
    );
}
