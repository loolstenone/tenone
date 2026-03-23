"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBums } from "@/lib/bums-context";
import { BoardTypeInfo } from "@/types/bums";
import type { BumsBoard, BoardType, SkinType, BoardVisibility } from "@/types/bums";
import {
    ArrowLeft, Plus, ExternalLink, ChevronDown, ChevronRight,
    Eye, EyeOff, Lock, FileText, LayoutGrid, Settings,
    Clock, X,
} from "lucide-react";
import clsx from "clsx";
import { BoardSettingsModal } from "@/components/bums/BoardSettingsModal";

/* ─── Constants ─── */

const statusColor: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-600",
    maintenance: "bg-yellow-50 text-yellow-600",
    inactive: "bg-neutral-100 text-neutral-500",
};
const statusLabel: Record<string, string> = {
    active: "운영중",
    maintenance: "점검중",
    inactive: "비활성",
};

const siteTypeLabel: Record<string, string> = {
    internal: "내부",
    brand: "브랜드",
    external: "외부",
};
const siteTypeBadge: Record<string, string> = {
    internal: "bg-blue-50 text-blue-600",
    brand: "bg-violet-50 text-violet-600",
    external: "bg-neutral-100 text-neutral-500",
};

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

const skinLabel: Record<string, string> = {
    list: "리스트",
    card: "카드",
    gallery: "갤러리",
    video: "영상",
};

const visibilityIcon: Record<BoardVisibility, typeof Eye> = {
    public: Eye,
    intra: EyeOff,
    staff: Lock,
};
const visibilityLabel: Record<BoardVisibility, string> = {
    public: "공개",
    intra: "인트라",
    staff: "스태프",
};

const postStatusLabel: Record<string, string> = {
    draft: "임시저장",
    published: "게시됨",
    scheduled: "예약",
    private: "비공개",
};
const postStatusBadge: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    published: "bg-emerald-50 text-emerald-600",
    scheduled: "bg-blue-50 text-blue-600",
    private: "bg-yellow-50 text-yellow-600",
};

/* ─── Component ─── */

export default function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = use(params);
    const router = useRouter();
    const { getSiteById, getBoardsBySite, boardPosts, addBoard } = useBums();

    const site = getSiteById(siteId);
    const siteBoards = getBoardsBySite(siteId);
    const sitePosts = boardPosts.filter((p) => p.siteId === siteId);

    // Accordion state
    const [expandedBoard, setExpandedBoard] = useState<string | null>(null);
    const [settingsBoardId, setSettingsBoardId] = useState<string | null>(null);

    // Inline board creation
    const [showAddBoard, setShowAddBoard] = useState(false);
    const [boardForm, setBoardForm] = useState({
        name: "", boardType: "general" as BoardType, skinType: "list" as SkinType, visibility: "public" as BoardVisibility,
    });

    // Edit toggle
    const [isEditing, setIsEditing] = useState(false);

    if (!site) {
        return (
            <div className="flex items-center justify-center py-20 text-neutral-400">
                사이트를 찾을 수 없습니다
            </div>
        );
    }

    /* ── Summary metrics ── */

    const todayStr = new Date().toISOString().split("T")[0];
    const todayViews = sitePosts.reduce((s, p) => s + p.viewCount, 0); // mock: total views
    const recentPosts = [...sitePosts]
        .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))
        .slice(0, 5);

    /* ── Handlers ── */

    const handleAddBoard = () => {
        if (!boardForm.name.trim()) return;
        const now = new Date().toISOString().split("T")[0];
        const newBoard: BumsBoard = {
            id: `board-${Date.now()}`,
            siteId,
            name: boardForm.name.trim(),
            slug: boardForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            boardType: boardForm.boardType,
            skinType: boardForm.skinType,
            visibility: boardForm.visibility,
            readPermission: "all",
            writePermission: "member",
            commentPermission: "member",
            allowComments: true,
            allowAttachments: true,
            allowSecretPost: false,
            allowSecretComment: false,
            allowScheduledPost: false,
            useCategories: false,
            categories: [],
            postsPerPage: 20,
            sortOrder: "latest",
            listPermission: "all",
            options: {
                secretPostMode: 'optional', secretRequirePassword: false, secretHideTitle: false,
                secretRequirePasswordOnView: false, newBadgeDuration: 1, writeButtonDisplay: 'always',
                commentOrder: 'asc', allowFeaturedImage: true, allowTimeRestriction: false,
                authorDisplayType: 'nickname', titleTemplateLocked: false, bodyPlaceholder: '',
            },
            design: {
                showBoardName: true, showTotalCount: true, showProfileImage: true, showSearchBar: true, showLightbox: true,
                showAuthor: true, showDate: true, showNumber: true, showCategory: false, showViews: true,
                showCommentCount: true, showLikes: true, showShare: true, showPrint: true,
                rowsPerPage: 10, rowSpacing: 20, pinNoticeOnAllPages: false, titleFontSize: 14, metaFontSize: 12,
                layout: 'list-thumb',
            },
            createdAt: now,
            updatedAt: now,
        };
        addBoard(newBoard);
        setShowAddBoard(false);
        setBoardForm({ name: "", boardType: "general", skinType: "list", visibility: "public" });
    };

    return (
        <div>
            {/* Back */}
            <button
                onClick={() => router.push("/intra/bums/sites")}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 mb-4 transition-colors"
            >
                <ArrowLeft className="h-3.5 w-3.5" /> 사이트 목록
            </button>

            {/* Site Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold">{site.name}</h1>
                        <span className={clsx("text-xs px-1.5 py-0.5 font-medium", statusColor[site.status])}>
                            {statusLabel[site.status]}
                        </span>
                        <span className={clsx("text-xs px-1.5 py-0.5 font-medium", siteTypeBadge[site.siteType])}>
                            {siteTypeLabel[site.siteType]}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 flex items-center gap-1">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <a
                            href={`https://${site.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-neutral-900 transition-colors"
                        >
                            {site.domain}
                        </a>
                    </p>
                    {site.description && (
                        <p className="text-xs text-neutral-400 mt-1">{site.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/intra/bums/sites/${siteId}/widgets`)}
                        className="px-3 py-1.5 text-xs border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
                    >
                        위젯 관리
                    </button>
                    <button
                        onClick={() => router.push(`/intra/bums/sites/${siteId}/settings`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
                    >
                        <Settings className="h-3 w-3" /> 사이트 설정
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { label: "게시판 수", value: `${siteBoards.length}개`, icon: LayoutGrid },
                    { label: "게시글 수", value: `${sitePosts.length}건`, icon: FileText },
                    { label: "총 조회수", value: `${todayViews.toLocaleString()}`, icon: Eye },
                    { label: "최근 게시글", value: recentPosts.length > 0 ? recentPosts[0].title.slice(0, 8) + "..." : "-", icon: Clock },
                ].map((s) => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-3.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-lg font-bold truncate">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Board List Header */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold">게시판 ({siteBoards.length})</h2>
                <button
                    onClick={() => setShowAddBoard(!showAddBoard)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> 게시판 추가
                </button>
            </div>

            {/* Board Accordion List */}
            <div className="space-y-2 mb-6">
                {siteBoards.length === 0 && !showAddBoard && (
                    <div className="border border-neutral-200 bg-white p-12 text-center">
                        <LayoutGrid className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                        <p className="text-xs text-neutral-400">게시판이 없습니다. 게시판을 추가해주세요.</p>
                    </div>
                )}

                {siteBoards.map((board) => {
                    const postCount = boardPosts.filter((p) => p.boardId === board.id).length;
                    const boardPostList = boardPosts
                        .filter((p) => p.boardId === board.id)
                        .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))
                        .slice(0, 5);
                    const VisIcon = visibilityIcon[board.visibility];
                    const isOpen = expandedBoard === board.id;

                    return (
                        <div key={board.id} className="border border-neutral-200 bg-white">
                            {/* Board Header */}
                            <button
                                onClick={() => setExpandedBoard(isOpen ? null : board.id)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-neutral-50 transition-colors"
                            >
                                {isOpen
                                    ? <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                                    : <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
                                }
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className={clsx("text-xs px-1.5 py-0.5 font-medium", boardTypeBadge[board.boardType])}>
                                            {BoardTypeInfo[board.boardType].label}
                                        </span>
                                        <span className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-400">
                                            {skinLabel[board.skinType]}
                                        </span>
                                        <span className="flex items-center gap-0.5 text-xs text-neutral-400">
                                            <VisIcon className="h-3 w-3" /> {visibilityLabel[board.visibility]}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium">{board.name}</h3>
                                    {board.description && (
                                        <p className="text-xs text-neutral-400 truncate mt-0.5">{board.description}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-medium">{postCount}건</p>
                                    <p className="text-xs text-neutral-400">게시글</p>
                                </div>
                            </button>

                            {/* Board Expanded: Recent posts + quick settings */}
                            {isOpen && (
                                <div className="border-t border-neutral-100">
                                    {/* Quick actions bar */}
                                    <div className="px-4 py-2 bg-neutral-50/50 flex items-center justify-between">
                                        <div className="flex gap-3 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" /> {postCount}건
                                            </span>
                                            <span>스킨: {skinLabel[board.skinType]}</span>
                                            <span>정렬: {board.sortOrder === "latest" ? "최신순" : board.sortOrder === "popular" ? "인기순" : "고정우선"}</span>
                                            <span>페이지당: {board.postsPerPage}건</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/intra/bums/sites/${siteId}/boards/${board.id}`}
                                                className="text-xs text-neutral-500 hover:text-neutral-900 underline"
                                            >
                                                게시글 관리
                                            </Link>
                                            <button
                                                onClick={() => setSettingsBoardId(board.id)}
                                                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900"
                                            >
                                                <Settings className="h-3 w-3" /> 설정
                                            </button>
                                        </div>
                                    </div>

                                    {/* Recent 5 posts */}
                                    <div className="px-4 pb-3">
                                        {boardPostList.length > 0 && (
                                            <>
                                                <div className="grid grid-cols-12 gap-1 py-2 text-xs text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                                                    <span className="col-span-5">제목</span>
                                                    <span className="col-span-2">작성자</span>
                                                    <span className="col-span-2">날짜</span>
                                                    <span className="col-span-1">조회</span>
                                                    <span className="col-span-2">상태</span>
                                                </div>
                                                {boardPostList.map((post) => (
                                                    <div
                                                        key={post.id}
                                                        className="grid grid-cols-12 gap-1 py-2 border-b border-neutral-50 last:border-0 items-center hover:bg-neutral-50 text-xs"
                                                    >
                                                        <div className="col-span-5 flex items-center gap-1">
                                                            {post.isPinned && <span className="text-xs text-red-500 font-bold shrink-0">PIN</span>}
                                                            <span className="font-medium truncate">{post.title}</span>
                                                            {post.commentCount > 0 && (
                                                                <span className="text-neutral-400">[{post.commentCount}]</span>
                                                            )}
                                                        </div>
                                                        <span className="col-span-2 text-neutral-500 truncate">{post.authorName}</span>
                                                        <span className="col-span-2 text-neutral-400">{(post.publishedAt ?? post.createdAt).slice(5)}</span>
                                                        <span className="col-span-1 text-neutral-400">{post.viewCount}</span>
                                                        <span className={clsx("col-span-2 text-xs px-1.5 py-0.5 w-fit", postStatusBadge[post.status])}>
                                                            {postStatusLabel[post.status]}
                                                        </span>
                                                    </div>
                                                ))}
                                                {postCount > 5 && (
                                                    <div className="py-2 text-center">
                                                        <Link
                                                            href={`/intra/bums/sites/${siteId}/boards/${board.id}`}
                                                            className="text-xs text-neutral-400 hover:text-neutral-900 underline"
                                                        >
                                                            전체 {postCount}건 보기
                                                        </Link>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {boardPostList.length === 0 && (
                                            <div className="py-6 text-center text-xs text-neutral-400">
                                                게시글이 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Inline Board Creation Panel (at bottom of list) */}
                {showAddBoard && (
                    <div className="border border-neutral-300 bg-white p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold">게시판 추가</h3>
                            <button onClick={() => setShowAddBoard(false)} className="p-0.5 text-neutral-400 hover:text-neutral-900">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3 mb-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">게시판명 *</label>
                                <input
                                    value={boardForm.name}
                                    onChange={(e) => setBoardForm((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="예: 공지사항"
                                    className="w-full border border-neutral-200 px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">유형</label>
                                <select
                                    value={boardForm.boardType}
                                    onChange={(e) => setBoardForm((p) => ({ ...p, boardType: e.target.value as BoardType }))}
                                    className="w-full border border-neutral-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-400"
                                >
                                    {(Object.keys(BoardTypeInfo) as BoardType[]).map((bt) => (
                                        <option key={bt} value={bt}>{BoardTypeInfo[bt].label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">스킨</label>
                                <div className="flex gap-1">
                                    {(["list", "card", "gallery", "video"] as SkinType[]).map((sk) => (
                                        <button
                                            key={sk}
                                            onClick={() => setBoardForm((p) => ({ ...p, skinType: sk }))}
                                            className={clsx(
                                                "flex-1 px-1 py-1.5 text-xs border transition-all",
                                                boardForm.skinType === sk
                                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                                    : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
                                            )}
                                        >
                                            {skinLabel[sk]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">공개범위</label>
                                <select
                                    value={boardForm.visibility}
                                    onChange={(e) => setBoardForm((p) => ({ ...p, visibility: e.target.value as BoardVisibility }))}
                                    className="w-full border border-neutral-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-400"
                                >
                                    <option value="public">공개</option>
                                    <option value="intra">인트라</option>
                                    <option value="staff">스태프</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Link
                                href={`/intra/bums/sites/${siteId}/boards/new`}
                                className="text-xs text-neutral-400 hover:text-neutral-900 underline"
                            >
                                상세 설정으로 만들기
                            </Link>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddBoard(false)}
                                    className="px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleAddBoard}
                                    disabled={!boardForm.name.trim()}
                                    className="px-4 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-30"
                                >
                                    만들기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-sm font-bold mb-3">최근 활동</h2>
                <div className="border border-neutral-200 bg-white">
                    {recentPosts.length > 0 ? (
                        <div>
                            {recentPosts.map((post) => {
                                const board = siteBoards.find((b) => b.id === post.boardId);
                                return (
                                    <div
                                        key={post.id}
                                        className="px-4 py-2.5 border-b border-neutral-50 last:border-0 flex items-center gap-3 hover:bg-neutral-50 text-xs"
                                    >
                                        <span className={clsx("text-xs px-1.5 py-0.5 font-medium shrink-0", boardTypeBadge[board?.boardType ?? "general"])}>
                                            {board ? BoardTypeInfo[board.boardType].label : "-"}
                                        </span>
                                        <span className="font-medium truncate flex-1">{post.title}</span>
                                        <span className="text-neutral-400 shrink-0">{post.authorName}</span>
                                        <span className="text-neutral-400 shrink-0">{(post.publishedAt ?? post.createdAt).slice(5)}</span>
                                        <span className="text-neutral-400 shrink-0">조회 {post.viewCount}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-xs text-neutral-400">
                            최근 활동이 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {settingsBoardId && (
                <BoardSettingsModal
                    boardId={settingsBoardId}
                    siteId={siteId}
                    isOpen={!!settingsBoardId}
                    onClose={() => setSettingsBoardId(null)}
                />
            )}
        </div>
    );
}
