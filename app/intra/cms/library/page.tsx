"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Plus, Search, Star, X, Upload, File, Image, FileText, Film, Link2, Trash2, FolderOpen } from "lucide-react";
import { useLibrary } from "@/lib/library-context";
import { useAuth } from "@/lib/auth-context";
import { libraryCategoryOptions, formatBadgeColor, libraryPermissionLabels } from "@/types/library";
import type { LibraryCategory, LibraryPermission, LibraryFormat, LibrarySource } from "@/types/library";

const permissionBadge: Record<LibraryPermission, string> = {
    all: "bg-neutral-100 text-neutral-500",
    staff: "bg-blue-50 text-blue-600",
    partner: "bg-amber-50 text-amber-600",
    admin: "bg-red-50 text-red-500",
};

const sourceBadge: Record<LibrarySource, { label: string; color: string }> = {
    myverse: { label: 'Myverse', color: 'bg-violet-50 text-violet-600' },
    wiki: { label: 'Wiki', color: 'bg-emerald-50 text-emerald-600' },
    cms: { label: 'CMS', color: 'bg-sky-50 text-sky-600' },
};

function getFormatFromFile(fileName: string): LibraryFormat {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const map: Record<string, LibraryFormat> = {
        pdf: 'PDF', docx: 'DOCX', doc: 'DOCX', pptx: 'PPTX', ppt: 'PPTX',
        xlsx: 'XLSX', xls: 'XLSX', png: 'PNG', jpg: 'JPG', jpeg: 'JPG',
        mp4: 'MP4', mov: 'MP4',
    };
    return map[ext || ''] || 'OTHER';
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const formatIcon: Record<string, typeof File> = {
    PDF: FileText, DOCX: FileText, PPTX: FileText, XLSX: FileText,
    PNG: Image, JPG: Image, MP4: Film, URL: Link2, OTHER: File,
};

export default function CmsLibraryPage() {
    const { items, isBookmarked, toggleBookmark, addItem, deleteItem } = useLibrary();
    const { user } = useAuth();
    const userId = "user-ceo";
    const accountType = user?.accountType || 'member';

    // 전체 소스 통합 표시
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState<"전체" | LibraryCategory>("전체");
    const [permFilter, setPermFilter] = useState<"전체" | LibraryPermission>("전체");
    const [sourceFilter, setSourceFilter] = useState<"전체" | LibrarySource>("전체");
    const [showAdd, setShowAdd] = useState(false);

    // 등록 폼
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCat, setNewCat] = useState<LibraryCategory>("마케팅·콘텐츠");
    const [newPerm, setNewPerm] = useState<LibraryPermission>("staff");
    const [newSource, setNewSource] = useState<LibrarySource>("cms");
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; format: LibraryFormat }[]>([]);

    // 드래그앤드롭
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingPage, setIsDraggingPage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const filtered = useMemo(() => {
        return items.filter(item => {
            if (sourceFilter !== "전체" && item.source !== sourceFilter) return false;
            if (catFilter !== "전체" && item.category !== catFilter) return false;
            if (permFilter !== "전체" && item.permission !== permFilter) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
            }
            return true;
        });
    }, [items, sourceFilter, catFilter, permFilter, search]);

    // 소스별 통계
    const stats = useMemo(() => ({
        total: items.length,
        myverse: items.filter(i => i.source === 'myverse').length,
        wiki: items.filter(i => i.source === 'wiki').length,
        cms: items.filter(i => i.source === 'cms').length,
    }), [items]);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).map(f => ({
            name: f.name,
            size: f.size,
            format: getFormatFromFile(f.name),
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
        // 모달이 안 열려있으면 열기
        if (!showAdd) {
            setShowAdd(true);
            if (newFiles.length === 1) {
                setNewTitle(newFiles[0].name.replace(/\.[^.]+$/, ''));
            }
        }
    }, [showAdd]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setIsDraggingPage(false);
        dragCounter.current = 0;
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragEnterPage = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current++;
        setIsDraggingPage(true);
    }, []);

    const handleDragLeavePage = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDraggingPage(false);
        }
    }, []);

    const handleDragEnterZone = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeaveZone = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removeFile = (idx: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        const format = uploadedFiles.length > 0 ? uploadedFiles[0].format : 'OTHER';
        const size = uploadedFiles.length > 0 ? formatFileSize(uploadedFiles[0].size) : '0 KB';
        addItem({
            id: `lib-${Date.now()}`, title: newTitle, description: newDesc, category: newCat,
            source: newSource, format, fileSize: size, tags: [],
            author: user?.name || 'Unknown', authorId: userId,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            permission: newPerm, bookmarkCount: 0, viewCount: 0,
        });
        setShowAdd(false);
        setNewTitle(""); setNewDesc(""); setUploadedFiles([]);
    };

    const resetModal = () => {
        setShowAdd(false);
        setNewTitle(""); setNewDesc(""); setUploadedFiles([]);
    };

    return (
        <div
            className="max-w-6xl"
            onDragEnter={handleDragEnterPage}
            onDragLeave={handleDragLeavePage}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* 페이지 드래그 오버레이 */}
            {isDraggingPage && !showAdd && (
                <div className="fixed inset-0 bg-sky-500/10 border-4 border-dashed border-sky-400 z-40 flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-xl shadow-lg px-10 py-8 text-center">
                        <Upload className="h-12 w-12 text-sky-500 mx-auto mb-3" />
                        <p className="text-lg font-bold text-neutral-800">파일을 여기에 놓으세요</p>
                        <p className="text-sm text-neutral-400 mt-1">드래그앤드롭으로 빠르게 업로드</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-bold">라이브러리 관리</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">전체 사이트의 모든 파일을 통합 관리합니다</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">
                    <Plus className="h-3.5 w-3.5" /> 자료 등록
                </button>
            </div>

            {/* 소스별 통계 카드 */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                <button onClick={() => setSourceFilter("전체")} className={`p-3 rounded border text-left transition-colors ${sourceFilter === "전체" ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-white hover:bg-neutral-50"}`}>
                    <p className="text-[10px] text-neutral-400">전체</p>
                    <p className="text-lg font-bold">{stats.total}</p>
                </button>
                <button onClick={() => setSourceFilter("myverse")} className={`p-3 rounded border text-left transition-colors ${sourceFilter === "myverse" ? "border-violet-400 bg-violet-50" : "border-neutral-200 bg-white hover:bg-neutral-50"}`}>
                    <p className="text-[10px] text-neutral-400">Myverse (개인)</p>
                    <p className="text-lg font-bold text-violet-600">{stats.myverse}</p>
                </button>
                <button onClick={() => setSourceFilter("wiki")} className={`p-3 rounded border text-left transition-colors ${sourceFilter === "wiki" ? "border-emerald-400 bg-emerald-50" : "border-neutral-200 bg-white hover:bg-neutral-50"}`}>
                    <p className="text-[10px] text-neutral-400">Wiki (공유)</p>
                    <p className="text-lg font-bold text-emerald-600">{stats.wiki}</p>
                </button>
                <button onClick={() => setSourceFilter("cms")} className={`p-3 rounded border text-left transition-colors ${sourceFilter === "cms" ? "border-sky-400 bg-sky-50" : "border-neutral-200 bg-white hover:bg-neutral-50"}`}>
                    <p className="text-[10px] text-neutral-400">CMS (콘텐츠)</p>
                    <p className="text-lg font-bold text-sky-600">{stats.cms}</p>
                </button>
            </div>

            {/* Filters */}
            <div className="mb-4 space-y-2">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="파일명, 설명, 태그로 검색..." className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
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
                <div className="border-2 border-dashed border-neutral-200 bg-white p-12 text-center">
                    <FolderOpen className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">등록된 자료가 없습니다</p>
                    <p className="text-xs text-neutral-300 mt-1">파일을 드래그하여 업로드하거나, 자료 등록 버튼을 클릭하세요</p>
                </div>
            ) : (
                <div className="border border-neutral-200 bg-white overflow-hidden rounded">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-neutral-100 text-neutral-400">
                                <th className="text-left p-3 font-medium w-8"></th>
                                <th className="text-left p-3 font-medium">제목</th>
                                <th className="text-center p-3 font-medium">출처</th>
                                <th className="text-left p-3 font-medium">카테고리</th>
                                <th className="text-center p-3 font-medium">형식</th>
                                <th className="text-center p-3 font-medium">크기</th>
                                <th className="text-center p-3 font-medium">권한</th>
                                <th className="text-left p-3 font-medium">작성자</th>
                                <th className="text-left p-3 font-medium">날짜</th>
                                <th className="text-center p-3 font-medium">조회</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(item => {
                                const Icon = formatIcon[item.format] || File;
                                return (
                                    <tr key={item.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                        <td className="p-3">
                                            <button onClick={() => toggleBookmark(userId, item.id, item.source)} className="p-0.5 hover:bg-amber-50 rounded">
                                                <Star className={`h-3.5 w-3.5 ${isBookmarked(userId, item.id) ? "text-amber-400 fill-amber-400" : "text-neutral-200"}`} />
                                            </button>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-neutral-300 shrink-0" />
                                                <div>
                                                    <p className="font-medium text-neutral-800 mb-0.5">{item.title}</p>
                                                    <p className="text-[10px] text-neutral-400 line-clamp-1">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${sourceBadge[item.source].color}`}>
                                                {sourceBadge[item.source].label}
                                            </span>
                                        </td>
                                        <td className="p-3"><span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{item.category}</span></td>
                                        <td className="p-3 text-center"><span className={`px-1.5 py-0.5 rounded ${formatBadgeColor[item.format]}`}>{item.format}</span></td>
                                        <td className="p-3 text-center text-neutral-400">{item.fileSize}</td>
                                        <td className="p-3 text-center"><span className={`px-1.5 py-0.5 rounded ${permissionBadge[item.permission]}`}>{libraryPermissionLabels[item.permission]}</span></td>
                                        <td className="p-3 text-neutral-500">{item.author}</td>
                                        <td className="p-3 text-neutral-400">{item.updatedAt}</td>
                                        <td className="p-3 text-center text-neutral-400">{item.viewCount}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 등록 모달 */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-neutral-200 rounded-lg w-full max-w-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold">자료 등록</h2>
                            <button onClick={resetModal}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>

                        {/* 드래그앤드롭 영역 */}
                        <div
                            onDragEnter={handleDragEnterZone}
                            onDragLeave={handleDragLeaveZone}
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDragging(false);
                                handleFiles(e.dataTransfer.files);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4 ${isDragging ? "border-sky-400 bg-sky-50" : "border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"}`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFiles(e.target.files)}
                            />
                            <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? "text-sky-500" : "text-neutral-300"}`} />
                            <p className={`text-sm font-medium ${isDragging ? "text-sky-600" : "text-neutral-500"}`}>
                                {isDragging ? "여기에 놓으세요!" : "파일을 드래그하거나 클릭하여 선택"}
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-1">PDF, DOCX, PPTX, XLSX, PNG, JPG, MP4 등</p>
                        </div>

                        {/* 업로드된 파일 목록 */}
                        {uploadedFiles.length > 0 && (
                            <div className="mb-4 space-y-1.5">
                                {uploadedFiles.map((f, i) => {
                                    const Icon = formatIcon[f.format] || File;
                                    return (
                                        <div key={i} className="flex items-center gap-2 p-2 bg-neutral-50 rounded text-xs">
                                            <Icon className="h-4 w-4 text-neutral-400 shrink-0" />
                                            <span className="flex-1 truncate text-neutral-700">{f.name}</span>
                                            <span className="text-neutral-400">{formatFileSize(f.size)}</span>
                                            <span className={`px-1.5 py-0.5 rounded ${formatBadgeColor[f.format] || 'bg-neutral-100 text-neutral-500'}`}>{f.format}</span>
                                            <button onClick={() => removeFile(i)} className="p-0.5 hover:bg-red-50 rounded">
                                                <Trash2 className="h-3 w-3 text-neutral-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">제목 *</label>
                                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="파일 또는 자료 제목" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">설명</label>
                                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} placeholder="자료에 대한 간단한 설명" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">출처 *</label>
                                    <select value={newSource} onChange={e => setNewSource(e.target.value as LibrarySource)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                                        <option value="cms">CMS</option>
                                        <option value="wiki">Wiki</option>
                                        <option value="myverse">Myverse</option>
                                    </select>
                                </div>
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
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={resetModal} className="px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                            <button onClick={handleAdd} disabled={!newTitle.trim()} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
