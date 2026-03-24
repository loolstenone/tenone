"use client";

import { useState } from "react";
import Link from "next/link";
import { useBums } from "@/lib/bums-context";
import { useBumsFilter } from "../layout";
import { BoardTypeInfo } from "@/types/bums";
import { BoardSettingsModal } from "@/components/bums/BoardSettingsModal";
import {
    Settings, FileText, Users, Search, Eye, EyeOff, Lock,
    ChevronRight, Pencil, Trash2, Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const tabs = [
    { id: "settings", label: "게시판 설정", icon: Settings },
    { id: "posts", label: "게시글 목록", icon: FileText },
    { id: "authors", label: "작성자 관리", icon: Users },
] as const;

type TabId = typeof tabs[number]["id"];

const boardTypeBadge: Record<string, string> = {
    general: "bg-neutral-100 text-neutral-600",
    notice: "bg-red-50 text-red-600",
    gallery: "bg-indigo-50 text-indigo-600",
    video: "bg-pink-50 text-pink-600",
    faq: "bg-amber-50 text-amber-600",
    qna: "bg-cyan-50 text-cyan-600",
    commerce: "bg-emerald-50 text-emerald-600",
    recruit: "bg-blue-50 text-blue-600",
    event: "bg-purple-50 text-purple-600",
};

const statusBadge: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    published: "bg-emerald-50 text-emerald-700",
    scheduled: "bg-blue-50 text-blue-700",
    private: "bg-purple-50 text-purple-700",
};
const statusLabel: Record<string, string> = {
    draft: "임시", published: "발행", scheduled: "예약", private: "비공개",
};

const visibilityLabel: Record<string, string> = { public: "공개", intra: "인트라", staff: "스태프" };

export default function BoardsManagementPage() {
    const { sites, boards, boardPosts, deleteBoardPost } = useBums();
    const { selectedSiteId } = useBumsFilter();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabId>("settings");
    const [search, setSearch] = useState("");
    const [boardFilter, setBoardFilter] = useState("전체");
    const [settingsBoardId, setSettingsBoardId] = useState<string | null>(null);
    const [newPostSiteId, setNewPostSiteId] = useState("");
    const [newPostBoardId, setNewPostBoardId] = useState("");
    const [showNewPostModal, setShowNewPostModal] = useState(false);

    // 사이트 필터는 레이아웃 드롭다운에서 관리
    const siteBoards = boards.filter(b => selectedSiteId === "all" || b.siteId === selectedSiteId);

    const filteredBoards = siteBoards.filter(b => {
        if (search) {
            const q = search.toLowerCase();
            if (!b.name.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const filteredPosts = boardPosts.filter(p => {
        if (selectedSiteId !== "all" && p.siteId !== selectedSiteId) return false;
        if (boardFilter !== "전체" && p.boardId !== boardFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!p.title.toLowerCase().includes(q) && !p.authorName.toLowerCase().includes(q)) return false;
        }
        return true;
    }).sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));

    // 작성자 집계
    const authorMap = new Map<string, { name: string; postCount: number; sites: Set<string> }>();
    boardPosts.forEach(p => {
        if (selectedSiteId !== "all" && p.siteId !== selectedSiteId) return;
        if (boardFilter !== "전체" && p.boardId !== boardFilter) return;
        const existing = authorMap.get(p.authorId);
        if (existing) {
            existing.postCount++;
            existing.sites.add(p.siteId);
        } else {
            authorMap.set(p.authorId, { name: p.authorName, postCount: 1, sites: new Set([p.siteId]) });
        }
    });
    const authors = Array.from(authorMap.entries()).sort((a, b) => b[1].postCount - a[1].postCount);

    const getSiteName = (siteId: string) => sites.find(s => s.id === siteId)?.name || siteId;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">게시판 관리</h1>
                <p className="text-sm text-neutral-500 mt-1">전체 사이트의 게시판, 게시글, 작성자를 통합 관리합니다.</p>
            </div>

            {/* Tabs — pill style */}
            <div className="flex items-center gap-1.5 bg-neutral-100 rounded-xl p-1 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === tab.id
                                ? "bg-neutral-900 text-white shadow-sm"
                                : "text-neutral-400 hover:text-neutral-600"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={activeTab === "posts" ? "제목, 작성자 검색..." : "검색..."}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white transition-all" />
                </div>
                <select value={boardFilter} onChange={e => setBoardFilter(e.target.value)}
                    className="rounded-lg border border-neutral-200 shadow-sm px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all">
                    <option value="전체">전체 게시판</option>
                    {siteBoards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>

            {/* Tab Content */}
            {activeTab === "settings" && (
                <div className="rounded-xl bg-white shadow-sm border border-neutral-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left bg-neutral-50/60">
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">게시판명</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">사이트</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">유형</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">공개</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">게시글</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredBoards.map(board => {
                                const postCount = boardPosts.filter(p => p.boardId === board.id).length;
                                return (
                                    <tr key={board.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-5 py-3.5 font-medium">{board.name}</td>
                                        <td className="px-5 py-3.5 text-neutral-500 text-xs">{getSiteName(board.siteId)}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={clsx("text-[10px] px-2.5 py-1 rounded-full font-medium", boardTypeBadge[board.boardType])}>
                                                {BoardTypeInfo[board.boardType]?.label || board.boardType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-neutral-500">{visibilityLabel[board.visibility]}</td>
                                        <td className="px-5 py-3.5 text-right text-neutral-500">{postCount}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button onClick={() => setSettingsBoardId(board.id)}
                                                className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
                                                설정
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredBoards.length === 0 && (
                        <div className="px-6 py-16 text-center text-neutral-400 text-sm">게시판이 없습니다.</div>
                    )}
                </div>
            )}

            {activeTab === "posts" && (
                <>
                    {/* + 새 글 작성 버튼 */}
                    <div className="flex justify-end">
                        <button onClick={() => setShowNewPostModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-all shadow-sm">
                            <Plus className="h-4 w-4" />
                            새 글 작성
                        </button>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm border border-neutral-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 text-left bg-neutral-50/60">
                                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">제목</th>
                                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">사이트</th>
                                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">게시판</th>
                                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">작성자</th>
                                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">상태</th>
                                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">날짜</th>
                                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">조회</th>
                                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredPosts.slice(0, 50).map(post => {
                                    const board = boards.find(b => b.id === post.boardId);
                                    return (
                                        <tr key={post.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-5 py-3.5 font-medium truncate max-w-[300px]">{post.title}</td>
                                            <td className="px-5 py-3.5 text-neutral-500 text-xs">{getSiteName(post.siteId)}</td>
                                            <td className="px-5 py-3.5 text-neutral-500 text-xs">{board?.name}</td>
                                            <td className="px-5 py-3.5 text-neutral-500 text-xs">{post.authorName}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={clsx("text-[10px] px-2.5 py-1 rounded-full font-medium", statusBadge[post.status])}>
                                                    {statusLabel[post.status]}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-400 text-xs">{post.publishedAt ?? post.createdAt}</td>
                                            <td className="px-5 py-3.5 text-neutral-400 text-right">{post.viewCount}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => router.push(`/intra/bums/sites/${post.siteId}/boards/${post.boardId}/new?postId=${post.id}`)}
                                                        className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all" title="수정">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => { if (confirm('삭제하시겠습니까?')) deleteBoardPost(post.id); }}
                                                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="삭제">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredPosts.length === 0 && (
                            <div className="px-6 py-16 text-center text-neutral-400 text-sm">게시글이 없습니다.</div>
                        )}
                        {filteredPosts.length > 50 && (
                            <div className="px-5 py-3.5 text-xs text-neutral-400 border-t border-neutral-100 bg-neutral-50/40">
                                {filteredPosts.length}건 중 50건 표시
                            </div>
                        )}
                    </div>

                    {/* 새 글 작성 모달 — 배경 블러 + 고급 스타일 */}
                    {showNewPostModal && (
                        <>
                            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-all" onClick={() => setShowNewPostModal(false)} />
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-5">
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">새 글 작성</h3>
                                        <p className="text-sm text-neutral-500 mt-1">사이트와 게시판을 선택하세요.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-600 mb-1.5">사이트</label>
                                            <select value={newPostSiteId} onChange={e => { setNewPostSiteId(e.target.value); setNewPostBoardId(""); }}
                                                className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all">
                                                <option value="">선택하세요</option>
                                                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-600 mb-1.5">게시판</label>
                                            <select value={newPostBoardId} onChange={e => setNewPostBoardId(e.target.value)}
                                                disabled={!newPostSiteId}
                                                className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 disabled:opacity-50 transition-all">
                                                <option value="">선택하세요</option>
                                                {boards.filter(b => b.siteId === newPostSiteId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-3">
                                        <button onClick={() => setShowNewPostModal(false)}
                                            className="px-5 py-2.5 text-sm rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all">
                                            취소
                                        </button>
                                        <button disabled={!newPostSiteId || !newPostBoardId}
                                            onClick={() => {
                                                setShowNewPostModal(false);
                                                router.push(`/intra/bums/sites/${newPostSiteId}/boards/${newPostBoardId}/new`);
                                            }}
                                            className="px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-all disabled:opacity-30 shadow-sm">
                                            작성하기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {activeTab === "authors" && (
                <div className="rounded-xl bg-white shadow-sm border border-neutral-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left bg-neutral-50/60">
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">작성자</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">게시글 수</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">활동 사이트</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {authors.map(([id, info]) => (
                                <tr key={id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-5 py-3.5 font-medium">{info.name}</td>
                                    <td className="px-5 py-3.5 text-neutral-500">{info.postCount}건</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {Array.from(info.sites).map(sId => (
                                                <span key={sId} className="text-[10px] px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                                                    {getSiteName(sId)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {authors.length === 0 && (
                        <div className="px-6 py-16 text-center text-neutral-400 text-sm">작성자가 없습니다.</div>
                    )}
                </div>
            )}

            {/* 게시판 설정 모달 (80% 팝업) */}
            {settingsBoardId && (
                <BoardSettingsModal
                    boardId={settingsBoardId}
                    siteId={boards.find(b => b.id === settingsBoardId)?.siteId || ""}
                    isOpen={!!settingsBoardId}
                    onClose={() => setSettingsBoardId(null)}
                />
            )}
        </div>
    );
}
