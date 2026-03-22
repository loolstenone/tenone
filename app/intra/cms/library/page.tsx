"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Star, X } from "lucide-react";
import { useLibrary } from "@/lib/library-context";
import { useAuth } from "@/lib/auth-context";
import { libraryCategoryOptions, formatBadgeColor, libraryPermissionLabels } from "@/types/library";
import type { LibraryCategory, LibraryPermission } from "@/types/library";

const permissionBadge: Record<LibraryPermission, string> = {
    all: "bg-neutral-100 text-neutral-500",
    staff: "bg-blue-50 text-blue-600",
    partner: "bg-amber-50 text-amber-600",
    admin: "bg-red-50 text-red-500",
};

export default function CmsLibraryPage() {
    const { getBySource, isBookmarked, toggleBookmark, addItem } = useLibrary();
    const { user } = useAuth();
    const userId = "user-ceo";
    const accountType = user?.accountType || 'member';

    const cmsItems = getBySource("cms", accountType);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState<"전체" | LibraryCategory>("전체");
    const [permFilter, setPermFilter] = useState<"전체" | LibraryPermission>("전체");
    const [showAdd, setShowAdd] = useState(false);

    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCat, setNewCat] = useState<LibraryCategory>("마케팅·콘텐츠");
    const [newPerm, setNewPerm] = useState<LibraryPermission>("staff");

    const filtered = useMemo(() => {
        return cmsItems.filter(item => {
            if (catFilter !== "전체" && item.category !== catFilter) return false;
            if (permFilter !== "전체" && item.permission !== permFilter) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
            }
            return true;
        });
    }, [cmsItems, catFilter, permFilter, search]);

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        addItem({
            id: `cms-${Date.now()}`, title: newTitle, description: newDesc, category: newCat,
            source: 'cms', format: 'PDF', fileSize: '0 KB', tags: [],
            author: 'Cheonil Jeon', authorId: userId,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            permission: newPerm, bookmarkCount: 0, viewCount: 0,
        });
        setShowAdd(false); setNewTitle(""); setNewDesc("");
    };

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-bold">라이브러리 관리</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">콘텐츠 관리 자료 · 템플릿 · 가이드</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">
                    <Plus className="h-3.5 w-3.5" /> 자료 등록
                </button>
            </div>

            {/* Filters */}
            <div className="mb-4 space-y-2">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..." className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                    </div>
                    <select value={permFilter} onChange={e => setPermFilter(e.target.value as "전체" | LibraryPermission)} className="px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                        <option value="전체">권한: 전체</option>
                        <option value="all">전체 공개</option>
                        <option value="staff">Staff Only</option>
                        <option value="partner">Partner 이상</option>
                        <option value="admin">Admin Only</option>
                    </select>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => setCatFilter("전체")} className={`px-2 py-1 text-xs rounded ${catFilter === "전체" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>전체</button>
                    {libraryCategoryOptions.map(c => (
                        <button key={c} onClick={() => setCatFilter(c)} className={`px-2 py-1 text-xs rounded ${catFilter === c ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>{c}</button>
                    ))}
                </div>
            </div>

            <p className="text-xs text-neutral-400 mb-3">{filtered.length}개 항목</p>

            {filtered.length === 0 ? (
                <div className="border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400">등록된 자료가 없습니다.</div>
            ) : (
                <div className="border border-neutral-200 bg-white overflow-hidden">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-neutral-100 text-neutral-400">
                                <th className="text-left p-3 font-medium w-8"></th>
                                <th className="text-left p-3 font-medium">제목</th>
                                <th className="text-left p-3 font-medium">카테고리</th>
                                <th className="text-center p-3 font-medium">형식</th>
                                <th className="text-center p-3 font-medium">권한</th>
                                <th className="text-left p-3 font-medium">작성자</th>
                                <th className="text-left p-3 font-medium">날짜</th>
                                <th className="text-center p-3 font-medium">조회</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(item => (
                                <tr key={item.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3">
                                        <button onClick={() => toggleBookmark(userId, item.id, 'cms')} className="p-0.5 hover:bg-amber-50 rounded">
                                            <Star className={`h-3.5 w-3.5 ${isBookmarked(userId, item.id) ? "text-amber-400 fill-amber-400" : "text-neutral-200"}`} />
                                        </button>
                                    </td>
                                    <td className="p-3">
                                        <p className="font-medium text-neutral-800 mb-0.5">{item.title}</p>
                                        <p className="text-[10px] text-neutral-400 line-clamp-1">{item.description}</p>
                                    </td>
                                    <td className="p-3"><span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{item.category}</span></td>
                                    <td className="p-3 text-center"><span className={`px-1.5 py-0.5 rounded ${formatBadgeColor[item.format]}`}>{item.format}</span></td>
                                    <td className="p-3 text-center"><span className={`px-1.5 py-0.5 rounded ${permissionBadge[item.permission]}`}>{libraryPermissionLabels[item.permission]}</span></td>
                                    <td className="p-3 text-neutral-500">{item.author}</td>
                                    <td className="p-3 text-neutral-400">{item.updatedAt}</td>
                                    <td className="p-3 text-center text-neutral-400">{item.viewCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 등록 모달 */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-neutral-200 rounded w-full max-w-md p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold">CMS 자료 등록</h2>
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
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">카테고리 *</label>
                                    <select value={newCat} onChange={e => setNewCat(e.target.value as LibraryCategory)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                                        {libraryCategoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">보기 권한 *</label>
                                    <select value={newPerm} onChange={e => setNewPerm(e.target.value as LibraryPermission)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                                        <option value="all">전체</option>
                                        <option value="staff">Staff Only</option>
                                        <option value="partner">Partner 이상</option>
                                        <option value="admin">Admin Only</option>
                                    </select>
                                </div>
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
                            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
