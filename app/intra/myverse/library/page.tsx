"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, Star, X, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { libraryCategoryOptions, formatBadgeColor } from "@/types/library";
import type { LibraryCategory, LibraryItem, LibrarySource } from "@/types/library";
import { fetchLibraryItems, fetchLibraryBookmarks, createLibraryItem, toggleLibraryBookmark } from "@/lib/supabase/library";
import { initialLibraryItems, initialBookmarks } from "@/lib/library-data";
import { PageHeader, TabNavCount, PrimaryButton } from "@/components/intra/IntraUI";

type TabKey = "my" | "bookmarks";

export default function MyverseLibraryPage() {
    const { user } = useAuth();
    const userId = "user-ceo";
    const accountType = user?.accountType || 'member';

    const [allItems, setAllItems] = useState<LibraryItem[]>(initialLibraryItems);
    const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set(initialBookmarks.filter(b => b.userId === userId).map(b => b.itemId)));

    useEffect(() => {
        fetchLibraryItems().then(rows => { if (rows.length > 0) setAllItems(rows); }).catch(() => {});
        fetchLibraryBookmarks(userId).then(bms => { if (bms.length > 0) setBookmarkIds(new Set(bms.map(b => b.itemId))); }).catch(() => {});
    }, []);

    const myItems = useMemo(() => allItems.filter(i => i.source === 'myverse' && i.authorId === userId), [allItems]);
    const allBookmarkItems = useMemo(() => allItems.filter(i => bookmarkIds.has(i.id)), [allItems, bookmarkIds]);

    const isBookmarked = useCallback((uid: string, itemId: string) => bookmarkIds.has(itemId), [bookmarkIds]);

    const handleToggleBookmark = useCallback(async (uid: string, itemId: string, source: LibrarySource) => {
        setBookmarkIds(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
            return next;
        });
        toggleLibraryBookmark(uid, itemId, source).catch(() => {});
    }, []);

    const addItem = useCallback((item: LibraryItem) => {
        setAllItems(prev => [item, ...prev]);
        createLibraryItem(item).catch(() => {});
    }, []);

    const [activeTab, setActiveTab] = useState<TabKey>("my");
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState<"전체" | LibraryCategory>("전체");
    const [showAdd, setShowAdd] = useState(false);

    // Form state
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCat, setNewCat] = useState<LibraryCategory>("전략·기획");
    const [newTags, setNewTags] = useState("");

    const currentItems = activeTab === "my" ? myItems : allBookmarkItems;

    const filtered = useMemo(() => {
        return currentItems.filter(item => {
            if (catFilter !== "전체" && item.category !== catFilter) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
            }
            return true;
        });
    }, [currentItems, catFilter, search]);

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        const item: LibraryItem = {
            id: `my-${Date.now()}`, title: newTitle, description: newDesc, category: newCat,
            source: 'myverse', format: 'PDF', fileSize: '0 KB',
            tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
            author: 'Cheonil Jeon', authorId: userId,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            permission: 'admin', bookmarkCount: 0, viewCount: 0,
        };
        addItem(item);
        setShowAdd(false);
        setNewTitle(""); setNewDesc(""); setNewTags("");
    };

    return (
        <div>
            <PageHeader title="내 라이브러리" description="개인 학습자료, 보고서, 레퍼런스 관리">
                <PrimaryButton onClick={() => setShowAdd(true)}>
                    <Plus className="h-3.5 w-3.5" /> 자료 등록
                </PrimaryButton>
            </PageHeader>

            {/* Tabs */}
            <TabNavCount
                tabs={[
                    { id: "my", label: "내 자료", count: myItems.length },
                    { id: "bookmarks", label: "즐겨찾기", count: allBookmarkItems.length },
                ]}
                active={activeTab}
                onChange={(id) => setActiveTab(id as TabKey)}
            />

            {/* Search + Category Filter */}
            <div className="mb-4 space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..." className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => setCatFilter("전체")} className={`px-2 py-1 text-xs rounded ${catFilter === "전체" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>전체</button>
                    {libraryCategoryOptions.map(c => (
                        <button key={c} onClick={() => setCatFilter(c)} className={`px-2 py-1 text-xs rounded ${catFilter === c ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>{c}</button>
                    ))}
                </div>
            </div>

            <p className="text-xs text-neutral-400 mb-3">{filtered.length}개 항목</p>

            {/* Items */}
            <div className="space-y-2">
                {filtered.length === 0 ? (
                    <div className="border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400">
                        {activeTab === "bookmarks" ? "즐겨찾기한 자료가 없습니다." : "등록된 자료가 없습니다."}
                    </div>
                ) : (
                    filtered.map(item => (
                        <div key={item.id} className="border border-neutral-200 bg-white p-4 hover:bg-neutral-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-neutral-100 rounded flex items-center justify-center shrink-0">
                                    <FileText className="h-4 w-4 text-neutral-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-sm font-medium text-neutral-800">{item.title}</span>
                                        <span className={`px-1.5 py-0.5 text-[10px] rounded ${formatBadgeColor[item.format]}`}>{item.format}</span>
                                        <span className="px-1.5 py-0.5 text-[10px] bg-neutral-100 text-neutral-500 rounded">{item.category}</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-1.5 line-clamp-1">{item.description}</p>
                                    <div className="flex items-center gap-3 text-[10px] text-neutral-300">
                                        {item.tags.map(tag => <span key={tag} className="px-1.5 py-0.5 bg-neutral-50 text-neutral-400 rounded">{tag}</span>)}
                                        {item.fileSize && <span>{item.fileSize}</span>}
                                        <span>{item.updatedAt}</span>
                                        <span>조회 {item.viewCount}</span>
                                    </div>
                                </div>
                                {activeTab === "bookmarks" && (
                                    <button onClick={() => handleToggleBookmark(userId, item.id, item.source)} className="shrink-0 p-1.5 hover:bg-amber-50 rounded transition-colors">
                                        <Star className={`h-4 w-4 ${isBookmarked(userId, item.id) ? "text-amber-400 fill-amber-400" : "text-neutral-300"}`} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 자료 등록 모달 */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-neutral-200 rounded w-full max-w-md p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold">자료 등록</h2>
                            <button onClick={() => setShowAdd(false)}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">제목 *</label>
                                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">설명</label>
                                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">카테고리 *</label>
                                <select value={newCat} onChange={e => setNewCat(e.target.value as LibraryCategory)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                                    {libraryCategoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">태그 (쉼표 구분)</label>
                                <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="브랜딩, 스터디" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">파일</label>
                                <div className="border-2 border-dashed border-neutral-200 rounded p-4 text-center cursor-pointer hover:bg-neutral-50">
                                    <p className="text-xs text-neutral-400">클릭하여 파일 선택</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-neutral-500">취소</button>
                            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
