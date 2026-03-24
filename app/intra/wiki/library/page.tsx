"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Star, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLibrary } from "@/lib/library-context";
import { useAuth } from "@/lib/auth-context";
import * as wikiDb from "@/lib/supabase/wiki";
import { libraryCategoryOptions, formatBadgeColor, libraryPermissionLabels } from "@/types/library";
import type { LibraryCategory, LibraryPermission, LibraryItem } from "@/types/library";

const permissionBadge: Record<LibraryPermission, string> = {
    all: "bg-neutral-100 text-neutral-500",
    staff: "bg-blue-50 text-blue-600",
    partner: "bg-amber-50 text-amber-600",
    admin: "bg-red-50 text-red-500",
};

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export default function WikiLibraryPage() {
    const { getBySource, isBookmarked, toggleBookmark, addItem } = useLibrary();
    const { user } = useAuth();
    const userId = "user-ceo";
    const accountType = user?.accountType || 'member';

    const wikiItems = getBySource("wiki", accountType);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState<"전체" | LibraryCategory>("전체");
    const [permFilter, setPermFilter] = useState<"전체" | LibraryPermission>("전체");
    const [showAdd, setShowAdd] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Form
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCat, setNewCat] = useState<LibraryCategory>("전략·기획");
    const [newPerm, setNewPerm] = useState<LibraryPermission>("all");
    const [newTags, setNewTags] = useState("");
    const [newProject, setNewProject] = useState("");

    // Supabase에서 라이브러리 아이템 로드 (DB 데이터 있으면 사용, 없으면 Mock 유지)
    useEffect(() => {
        let cancelled = false;
        wikiDb.fetchLibraryItems({ source: "wiki" })
            .then(({ items: dbItems }) => {
                if (cancelled || dbItems.length === 0) return;
                // DB 데이터가 있으면 context items를 DB로 대체
                // TODO: context에 setItems 노출 시 직접 교체 가능
            })
            .catch(() => { /* DB 실패 시 Mock 유지 */ });
        return () => { cancelled = true; };
    }, []);

    const filtered = useMemo(() => {
        return wikiItems.filter(item => {
            if (catFilter !== "전체" && item.category !== catFilter) return false;
            if (permFilter !== "전체" && item.permission !== permFilter) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
            }
            return true;
        });
    }, [wikiItems, catFilter, permFilter, search]);

    // 페이지네이션
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const startIdx = (currentPage - 1) * pageSize + 1;
    const endIdx = Math.min(currentPage * pageSize, filtered.length);

    // 필터 변경 시 1페이지로
    const handleFilterChange = () => setPage(1);

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        const item: LibraryItem = {
            id: `wiki-${Date.now()}`, title: newTitle, description: newDesc, category: newCat,
            source: 'wiki', format: 'PDF', fileSize: '0 KB',
            tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
            author: 'Cheonil Jeon', authorId: userId,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            permission: newPerm,
            projectCode: newProject || undefined,
            bookmarkCount: 0, viewCount: 0,
        };
        addItem(item);
        wikiDb.createLibraryItem({
            title: item.title, description: item.description, category: item.category,
            source: item.source, format: item.format, file_size: item.fileSize,
            tags: item.tags, author_id: item.authorId,
            permission: item.permission, project_code: item.projectCode || null,
        }).catch(() => {});
        setShowAdd(false);
        setNewTitle(""); setNewDesc(""); setNewTags(""); setNewProject("");
    };

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-bold">Knowledge Library</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">지식 관리 · 템플릿 · 레퍼런스 · 내부 문서</p>
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
                        <input value={search} onChange={e => { setSearch(e.target.value); handleFilterChange(); }} placeholder="검색..." className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                    </div>
                    <select value={permFilter} onChange={e => { setPermFilter(e.target.value as "전체" | LibraryPermission); handleFilterChange(); }} className="px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                        <option value="전체">권한: 전체</option>
                        <option value="all">전체 공개</option>
                        <option value="staff">Staff Only</option>
                        <option value="partner">Partner 이상</option>
                        <option value="admin">Admin Only</option>
                    </select>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => { setCatFilter("전체"); handleFilterChange(); }} className={`px-2 py-1 text-xs rounded ${catFilter === "전체" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>전체</button>
                    {libraryCategoryOptions.map(c => (
                        <button key={c} onClick={() => { setCatFilter(c); handleFilterChange(); }} className={`px-2 py-1 text-xs rounded ${catFilter === c ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>{c}</button>
                    ))}
                </div>
            </div>

            {/* 건수 + 페이지 크기 */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-neutral-400">{filtered.length}개 항목 중 {startIdx}~{endIdx}</p>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-400">표시:</span>
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                        className="px-2 py-1 text-xs border border-neutral-200 rounded focus:outline-none">
                        {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}개</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            {paged.length === 0 ? (
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
                                <th className="text-left p-3 font-medium">프로젝트</th>
                                <th className="text-left p-3 font-medium">작성자</th>
                                <th className="text-left p-3 font-medium">날짜</th>
                                <th className="text-center p-3 font-medium">조회</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map(item => (
                                <tr key={item.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3">
                                        <button onClick={() => {
                                            const wasBookmarked = isBookmarked(userId, item.id);
                                            toggleBookmark(userId, item.id, 'wiki');
                                            if (wasBookmarked) {
                                                wikiDb.removeBookmark(userId, item.id).catch(() => {});
                                            } else {
                                                wikiDb.addBookmark(userId, item.id).catch(() => {});
                                            }
                                        }} className="p-0.5 hover:bg-amber-50 rounded">
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
                                    <td className="p-3 text-neutral-400">{item.projectCode || "—"}</td>
                                    <td className="p-3 text-neutral-500">{item.author}</td>
                                    <td className="p-3 text-neutral-400">{item.updatedAt}</td>
                                    <td className="p-3 text-center text-neutral-400">{item.viewCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-4">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 disabled:opacity-30">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                            className={`min-w-[28px] h-7 text-xs rounded ${p === currentPage ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                            {p}
                        </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 disabled:opacity-30">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* 등록 모달 */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-neutral-200 rounded w-full max-w-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold">Wiki 자료 등록</h2>
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
                            <div className="grid grid-cols-3 gap-3">
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
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">프로젝트 코드</label>
                                    <input value={newProject} onChange={e => setNewProject(e.target.value)} placeholder="PRJ-2026-0001" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">태그 (쉼표 구분)</label>
                                <input value={newTags} onChange={e => setNewTags(e.target.value)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
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
