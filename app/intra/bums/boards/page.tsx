"use client";

import { useState } from "react";
import Link from "next/link";
import { useBums } from "@/lib/bums-context";
import { useBumsFilter } from "../layout";
import { BoardTypeInfo } from "@/types/bums";
import { BoardSettingsModal } from "@/components/bums/BoardSettingsModal";
import {
    Settings, FileText, Users, Search, Eye, EyeOff, Lock,
    ChevronRight, Pencil, Trash2,
} from "lucide-react";
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
    published: "bg-emerald-100 text-emerald-700",
    scheduled: "bg-blue-100 text-blue-700",
    private: "bg-purple-100 text-purple-700",
};
const statusLabel: Record<string, string> = {
    draft: "임시", published: "발행", scheduled: "예약", private: "비공개",
};

const visibilityLabel: Record<string, string> = { public: "공개", intra: "인트라", staff: "스태프" };

export default function BoardsManagementPage() {
    const { sites, boards, boardPosts } = useBums();
    const { selectedSiteId } = useBumsFilter();
    const [activeTab, setActiveTab] = useState<TabId>("settings");
    const [search, setSearch] = useState("");
    const [boardFilter, setBoardFilter] = useState("전체");
    const [settingsBoardId, setSettingsBoardId] = useState<string | null>(null);

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
                <h1 className="text-2xl font-bold">게시판 관리</h1>
                <p className="text-sm text-neutral-500 mt-1">전체 사이트의 게시판, 게시글, 작성자를 통합 관리합니다.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-neutral-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                            activeTab === tab.id
                                ? "border-neutral-900 text-neutral-900"
                                : "border-transparent text-neutral-400 hover:text-neutral-600"
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={activeTab === "posts" ? "제목, 작성자 검색..." : "검색..."}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white" />
                </div>
                <select value={boardFilter} onChange={e => setBoardFilter(e.target.value)}
                    className="border border-neutral-200 px-3 py-2 text-sm bg-white focus:outline-none">
                    <option value="전체">전체 게시판</option>
                    {siteBoards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>

            {/* Tab Content */}
            {activeTab === "settings" && (
                <div className="border border-neutral-200 bg-white overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left">
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">게시판명</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">사이트</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">유형</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">공개</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase text-right">게시글</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredBoards.map(board => {
                                const postCount = boardPosts.filter(p => p.boardId === board.id).length;
                                return (
                                    <tr key={board.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 font-medium">{board.name}</td>
                                        <td className="px-4 py-3 text-neutral-500 text-xs">{getSiteName(board.siteId)}</td>
                                        <td className="px-4 py-3">
                                            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium", boardTypeBadge[board.boardType])}>
                                                {BoardTypeInfo[board.boardType]?.label || board.boardType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{visibilityLabel[board.visibility]}</td>
                                        <td className="px-4 py-3 text-right text-neutral-500">{postCount}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => setSettingsBoardId(board.id)}
                                                className="text-xs text-neutral-400 hover:text-neutral-900">
                                                설정
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredBoards.length === 0 && (
                        <div className="px-6 py-12 text-center text-neutral-400 text-sm">게시판이 없습니다.</div>
                    )}
                </div>
            )}

            {activeTab === "posts" && (
                <div className="border border-neutral-200 bg-white overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left">
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">제목</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">사이트</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">게시판</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">작성자</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">상태</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">날짜</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase text-right">조회</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredPosts.slice(0, 50).map(post => {
                                const board = boards.find(b => b.id === post.boardId);
                                return (
                                    <tr key={post.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 font-medium truncate max-w-[300px]">{post.title}</td>
                                        <td className="px-4 py-3 text-neutral-500 text-xs">{getSiteName(post.siteId)}</td>
                                        <td className="px-4 py-3 text-neutral-500 text-xs">{board?.name}</td>
                                        <td className="px-4 py-3 text-neutral-500 text-xs">{post.authorName}</td>
                                        <td className="px-4 py-3">
                                            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium", statusBadge[post.status])}>
                                                {statusLabel[post.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-400 text-xs">{post.publishedAt ?? post.createdAt}</td>
                                        <td className="px-4 py-3 text-neutral-400 text-right">{post.viewCount}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredPosts.length === 0 && (
                        <div className="px-6 py-12 text-center text-neutral-400 text-sm">게시글이 없습니다.</div>
                    )}
                    {filteredPosts.length > 50 && (
                        <div className="px-4 py-3 text-xs text-neutral-400 border-t border-neutral-100">
                            {filteredPosts.length}건 중 50건 표시
                        </div>
                    )}
                </div>
            )}

            {activeTab === "authors" && (
                <div className="border border-neutral-200 bg-white overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left">
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">작성자</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">게시글 수</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">활동 사이트</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {authors.map(([id, info]) => (
                                <tr key={id} className="hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium">{info.name}</td>
                                    <td className="px-4 py-3 text-neutral-500">{info.postCount}건</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {Array.from(info.sites).map(sId => (
                                                <span key={sId} className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
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
                        <div className="px-6 py-12 text-center text-neutral-400 text-sm">작성자가 없습니다.</div>
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
