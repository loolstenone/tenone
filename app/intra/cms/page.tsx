"use client";

import { useState } from "react";
import { useCms } from "@/lib/cms-context";
import { CmsPost, CmsChannel, CmsCategory, CmsStatus } from "@/types/cms";
import { brands } from "@/lib/data";
import { Plus, Edit2, Trash2, ExternalLink, Search } from "lucide-react";

const channelLabels: Record<CmsChannel, string> = { works: 'Works', newsroom: 'Newsroom', history: 'History' };
const allCategories: CmsCategory[] = ['Brand', 'Project', 'Event', 'Media'];
const allChannels: CmsChannel[] = ['works', 'newsroom', 'history'];
const allStatuses: CmsStatus[] = ['Draft', 'Published', 'Archived'];

function PostEditor({ post, onSave, onCancel }: { post?: CmsPost | null; onSave: (p: CmsPost) => void; onCancel: () => void }) {
    const isEdit = !!post;
    const [form, setForm] = useState<CmsPost>(post || {
        id: `cms-${Date.now()}`, title: '', summary: '', body: '',
        category: 'Brand', channels: ['newsroom'], status: 'Draft',
        date: new Date().toISOString().split('T')[0], tags: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
    });
    const [tagInput, setTagInput] = useState(post?.tags.join(', ') || '');

    const toggleChannel = (ch: CmsChannel) => {
        setForm(prev => ({
            ...prev,
            channels: prev.channels.includes(ch)
                ? prev.channels.filter(c => c !== ch)
                : [...prev.channels, ch]
        }));
    };

    const handleSave = () => {
        onSave({ ...form, tags: tagInput.split(',').map(t => t.trim()).filter(Boolean) });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">
                <div className="p-6 border-b border-neutral-100">
                    <h2 className="text-xl font-bold">{isEdit ? '글 수정' : '새 글 작성'}</h2>
                </div>
                <div className="p-6 space-y-5">
                    {/* 제목 */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1">제목</label>
                        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none" placeholder="글 제목" />
                    </div>

                    {/* 요약 */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1">요약</label>
                        <textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                            className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none" rows={3} placeholder="짧은 요약" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* 카테고리 */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 block mb-1">카테고리</label>
                            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as CmsCategory }))}
                                className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none">
                                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* 상태 */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 block mb-1">상태</label>
                            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as CmsStatus }))}
                                className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none">
                                {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 노출 채널 */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-2">노출 채널</label>
                        <div className="flex gap-3">
                            {allChannels.map(ch => (
                                <button key={ch} onClick={() => toggleChannel(ch)}
                                    className={`px-4 py-2 text-sm border transition-colors ${
                                        form.channels.includes(ch)
                                            ? 'bg-neutral-900 text-white border-neutral-900'
                                            : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                                    }`}>
                                    {channelLabels[ch]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* 날짜 */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 block mb-1">날짜</label>
                            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none" />
                        </div>

                        {/* 브랜드 */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 block mb-1">관련 브랜드</label>
                            <select value={form.brandId || ''} onChange={e => setForm(p => ({ ...p, brandId: e.target.value || undefined }))}
                                className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none">
                                <option value="">없음</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 외부 링크 */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1">외부 링크</label>
                        <input value={form.externalLink || ''} onChange={e => setForm(p => ({ ...p, externalLink: e.target.value || undefined }))}
                            className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none" placeholder="https://..." />
                    </div>

                    {/* 이미지 안내 */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1">썸네일 이미지 설명</label>
                        <input value={form.image || ''} onChange={e => setForm(p => ({ ...p, image: e.target.value || undefined }))}
                            className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none" placeholder="이미지 설명 (추후 업로드 기능 추가)" />
                    </div>

                    {/* 태그 */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1">태그 (쉼표 구분)</label>
                        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                            className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none" placeholder="AI, 브랜드, 마케팅" />
                    </div>
                </div>
                <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-6 py-2.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">취소</button>
                    <button onClick={handleSave} className="px-6 py-2.5 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                        {isEdit ? '저장' : '작성'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CmsPage() {
    const { posts, addPost, updatePost, deletePost } = useCms();
    const [editing, setEditing] = useState<CmsPost | null | 'new'>(null);
    const [search, setSearch] = useState('');
    const [filterChannel, setFilterChannel] = useState<CmsChannel | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<CmsStatus | 'all'>('all');

    const filtered = posts
        .filter(p => filterChannel === 'all' || p.channels.includes(filterChannel as CmsChannel))
        .filter(p => filterStatus === 'all' || p.status === filterStatus)
        .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date));

    const handleSave = (post: CmsPost) => {
        if (editing === 'new') {
            addPost(post);
        } else {
            updatePost(post.id, post);
        }
        setEditing(null);
    };

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'Published').length,
        draft: posts.filter(p => p.status === 'Draft').length,
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">CMS</h1>
                    <p className="text-sm text-neutral-500 mt-1">사이트 콘텐츠를 관리합니다.</p>
                </div>
                <button onClick={() => setEditing('new')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" /> 새 글 작성
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="border border-neutral-200 p-4">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-neutral-500 mt-1">전체</p>
                </div>
                <div className="border border-neutral-200 p-4">
                    <p className="text-2xl font-bold text-neutral-900">{stats.published}</p>
                    <p className="text-xs text-neutral-500 mt-1">Published</p>
                </div>
                <div className="border border-neutral-200 p-4">
                    <p className="text-2xl font-bold text-neutral-400">{stats.draft}</p>
                    <p className="text-xs text-neutral-500 mt-1">Draft</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full border border-neutral-200 pl-10 pr-4 py-2 text-sm focus:border-neutral-900 focus:outline-none" placeholder="검색..." />
                </div>
                <select value={filterChannel} onChange={e => setFilterChannel(e.target.value as CmsChannel | 'all')}
                    className="border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none">
                    <option value="all">전체 채널</option>
                    {allChannels.map(ch => <option key={ch} value={ch}>{channelLabels[ch]}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as CmsStatus | 'all')}
                    className="border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none">
                    <option value="all">전체 상태</option>
                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="border border-neutral-200">
                <div className="grid grid-cols-[1fr_100px_120px_120px_80px] bg-neutral-50 border-b border-neutral-200 px-4 py-3 text-xs font-medium text-neutral-500">
                    <span>제목</span>
                    <span>카테고리</span>
                    <span>노출 채널</span>
                    <span>날짜</span>
                    <span className="text-center">상태</span>
                </div>
                {filtered.map(post => (
                    <div key={post.id} className="grid grid-cols-[1fr_100px_120px_120px_80px] px-4 py-3 border-b border-neutral-100 items-center hover:bg-neutral-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-neutral-900 truncate">{post.title}</span>
                            <div className="hidden group-hover:flex gap-1">
                                <button onClick={() => setEditing(post)} className="p-1 text-neutral-400 hover:text-neutral-900">
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => { if (confirm('삭제하시겠습니까?')) deletePost(post.id); }}
                                    className="p-1 text-neutral-400 hover:text-red-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                {post.externalLink && (
                                    <a href={post.externalLink} target="_blank" rel="noopener noreferrer" className="p-1 text-neutral-400 hover:text-neutral-900">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                        <span className="text-xs text-neutral-500">{post.category}</span>
                        <div className="flex gap-1">
                            {post.channels.map(ch => (
                                <span key={ch} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{channelLabels[ch]}</span>
                            ))}
                        </div>
                        <span className="text-xs text-neutral-400">{post.date}</span>
                        <span className={`text-xs text-center px-2 py-0.5 ${
                            post.status === 'Published' ? 'bg-neutral-900 text-white' :
                            post.status === 'Draft' ? 'bg-neutral-200 text-neutral-600' :
                            'bg-neutral-100 text-neutral-400'
                        }`}>{post.status}</span>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="px-4 py-12 text-center text-sm text-neutral-400">콘텐츠가 없습니다.</div>
                )}
            </div>

            {/* Editor Modal */}
            {editing && (
                <PostEditor
                    post={editing === 'new' ? null : editing}
                    onSave={handleSave}
                    onCancel={() => setEditing(null)}
                />
            )}
        </div>
    );
}
