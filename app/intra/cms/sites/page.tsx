"use client";

import { useState } from "react";
import Link from "next/link";
import { useCms } from "@/lib/cms-context";
import { BoardTypeInfo } from "@/types/cms";
import type { CmsSite, CmsBoard, SiteType, SiteStatus, BoardType, SkinType, BoardVisibility } from "@/types/cms";
import {
    Globe, Plus, Search, ChevronDown, ChevronRight,
    ExternalLink, FileText, Eye, EyeOff, Lock,
    LayoutGrid, X,
} from "lucide-react";
import clsx from "clsx";

/* ─── Constants ─── */

const statusColor: Record<SiteStatus, string> = {
    active: "bg-emerald-50 text-emerald-600",
    maintenance: "bg-yellow-50 text-yellow-600",
    inactive: "bg-neutral-100 text-neutral-500",
};
const statusLabel: Record<SiteStatus, string> = {
    active: "운영중",
    maintenance: "점검중",
    inactive: "비활성",
};
const siteTypeLabel: Record<SiteType, string> = {
    internal: "내부",
    brand: "브랜드",
    external: "외부",
};
const siteTypeBadge: Record<SiteType, string> = {
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

const typeFilterOptions: ("전체" | SiteType)[] = ["전체", "internal", "brand", "external"];
const statusFilterOptions: ("전체" | SiteStatus)[] = ["전체", "active", "maintenance", "inactive"];

const typeFilterLabel: Record<string, string> = {
    "전체": "전체",
    internal: "내부",
    brand: "브랜드",
    external: "외부",
};
const statusFilterLabel: Record<string, string> = {
    "전체": "전체",
    active: "운영중",
    maintenance: "점검중",
    inactive: "비활성",
};

/* ─── Component ─── */

export default function SitesListPage() {
    const { sites, boards, boardPosts, addSite, addBoard } = useCms();

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"전체" | SiteType>("전체");
    const [statusFilter, setStatusFilter] = useState<"전체" | SiteStatus>("전체");
    const [expandedSite, setExpandedSite] = useState<string | null>(null);

    // Inline site creation
    const [showAddSite, setShowAddSite] = useState(false);
    const [siteForm, setSiteForm] = useState({
        name: "", domain: "", description: "", siteType: "brand" as SiteType, brandId: "",
    });

    // Inline board creation (per site)
    const [showAddBoard, setShowAddBoard] = useState<string | null>(null);
    const [boardForm, setBoardForm] = useState({
        name: "", boardType: "general" as BoardType, skinType: "list" as SkinType, visibility: "public" as BoardVisibility,
    });

    /* ── Filter ── */

    const filtered = sites.filter((s) => {
        if (typeFilter !== "전체" && s.siteType !== typeFilter) return false;
        if (statusFilter !== "전체" && s.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!s.name.toLowerCase().includes(q) && !s.domain.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    /* ── Summary metrics ── */

    const activeSites = sites.filter((s) => s.status === "active").length;
    const totalBoards = boards.length;
    const totalPosts = boardPosts.length;

    /* ── Handlers ── */

    const handleAddSite = () => {
        if (!siteForm.name.trim() || !siteForm.domain.trim()) return;
        const now = new Date().toISOString().split("T")[0];
        const newSite: CmsSite = {
            id: `site-${Date.now()}`,
            name: siteForm.name.trim(),
            slug: siteForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            domain: siteForm.domain.trim(),
            description: siteForm.description,
            siteType: siteForm.siteType,
            brandId: siteForm.brandId || undefined,
            status: "active",
            createdAt: now,
            updatedAt: now,
        };
        addSite(newSite);
        setShowAddSite(false);
        setSiteForm({ name: "", domain: "", description: "", siteType: "brand", brandId: "" });
    };

    const handleAddBoard = (siteId: string) => {
        if (!boardForm.name.trim()) return;
        const now = new Date().toISOString().split("T")[0];
        const newBoard: CmsBoard = {
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
        setShowAddBoard(null);
        setBoardForm({ name: "", boardType: "general", skinType: "list", visibility: "public" });
    };

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">사이트 관리</h1>
                    <p className="text-sm text-neutral-500 mt-1">사이트 · 게시판 통합 관리</p>
                </div>
                <button
                    onClick={() => setShowAddSite(!showAddSite)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                    <Plus className="h-4 w-4" /> 사이트 추가
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { label: "전체 사이트", value: `${sites.length}개`, icon: Globe },
                    { label: "활성", value: `${activeSites}개`, icon: Globe },
                    { label: "게시판 수", value: `${totalBoards}개`, icon: LayoutGrid },
                    { label: "총 게시글", value: `${totalPosts}건`, icon: FileText },
                ].map((s) => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-3.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Inline Site Creation Panel */}
            {showAddSite && (
                <div className="border border-neutral-300 bg-white p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold">새 사이트 추가</h3>
                        <button onClick={() => setShowAddSite(false)} className="p-1 text-neutral-400 hover:text-neutral-900">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">사이트 이름 *</label>
                            <input
                                value={siteForm.name}
                                onChange={(e) => setSiteForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="예: LUKI"
                                className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">도메인 *</label>
                            <input
                                value={siteForm.domain}
                                onChange={(e) => setSiteForm((p) => ({ ...p, domain: e.target.value }))}
                                placeholder="예: luki.ai"
                                className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">설명</label>
                            <input
                                value={siteForm.description}
                                onChange={(e) => setSiteForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder="사이트 설명"
                                className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-neutral-500 mb-1">사이트 유형</label>
                                <select
                                    value={siteForm.siteType}
                                    onChange={(e) => setSiteForm((p) => ({ ...p, siteType: e.target.value as SiteType }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-400"
                                >
                                    <option value="internal">내부</option>
                                    <option value="brand">브랜드</option>
                                    <option value="external">외부</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-neutral-500 mb-1">브랜드 ID</label>
                                <input
                                    value={siteForm.brandId}
                                    onChange={(e) => setSiteForm((p) => ({ ...p, brandId: e.target.value }))}
                                    placeholder="선택"
                                    className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowAddSite(false)}
                            className="px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleAddSite}
                            disabled={!siteForm.name.trim() || !siteForm.domain.trim()}
                            className="px-4 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-30"
                        >
                            만들기
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-neutral-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-neutral-400"
                        placeholder="사이트명, 도메인 검색..."
                    />
                </div>
                <div className="flex gap-1">
                    {typeFilterOptions.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={clsx(
                                "px-2.5 py-2 text-xs transition-all",
                                typeFilter === t ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                            )}
                        >
                            {typeFilterLabel[t]}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1">
                    {statusFilterOptions.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={clsx(
                                "px-2.5 py-2 text-xs transition-all",
                                statusFilter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                            )}
                        >
                            {statusFilterLabel[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Result count */}
            <div className="flex items-center mb-3">
                <span className="text-xs text-neutral-400">{filtered.length}개 표시 / 전체 {sites.length}개</span>
            </div>

            {/* Site Cards (Accordion) */}
            <div className="space-y-2">
                {filtered.length === 0 && (
                    <div className="border border-neutral-200 bg-white p-12 text-center">
                        <Globe className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                        <p className="text-xs text-neutral-400">조건에 맞는 사이트가 없습니다.</p>
                    </div>
                )}

                {filtered.map((site) => {
                    const siteBoards = boards.filter((b) => b.siteId === site.id);
                    const sitePosts = boardPosts.filter((p) => p.siteId === site.id);
                    const isOpen = expandedSite === site.id;

                    return (
                        <div key={site.id} className="border border-neutral-200 bg-white">
                            {/* Site Header (click to expand) */}
                            <button
                                onClick={() => setExpandedSite(isOpen ? null : site.id)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-neutral-50 transition-colors"
                            >
                                {isOpen
                                    ? <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                                    : <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
                                }
                                <div className="flex-1 min-w-0">
                                    {/* Row 1: badges */}
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className={clsx("text-xs px-1.5 py-0.5 font-medium", siteTypeBadge[site.siteType])}>
                                            {siteTypeLabel[site.siteType]}
                                        </span>
                                        <span className={clsx("text-xs px-1.5 py-0.5 font-medium", statusColor[site.status])}>
                                            {statusLabel[site.status]}
                                        </span>
                                    </div>
                                    {/* Row 2: name */}
                                    <h3 className="text-sm font-bold truncate">{site.name}</h3>
                                    {/* Row 3: meta */}
                                    <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                                        <span className="flex items-center gap-0.5">
                                            <ExternalLink className="h-3 w-3" /> {site.domain}
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <LayoutGrid className="h-3 w-3" /> 게시판 {siteBoards.length}개
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <FileText className="h-3 w-3" /> 게시글 {sitePosts.length}건
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-medium">{siteBoards.length} 게시판</p>
                                    <p className="text-xs text-neutral-400">{sitePosts.length}건 게시글</p>
                                </div>
                            </button>

                            {/* Expanded: Board list */}
                            {isOpen && (
                                <div className="border-t border-neutral-100">
                                    {/* Site summary bar */}
                                    <div className="px-4 py-3 bg-neutral-50/50 flex items-center justify-between">
                                        <div className="flex gap-4 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <LayoutGrid className="h-3 w-3" /> 게시판 {siteBoards.length}개
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" /> 게시글 {sitePosts.length}건
                                            </span>
                                            <Link
                                                href={`/intra/cms/sites/${site.id}`}
                                                className="text-neutral-500 hover:text-neutral-900 underline"
                                            >
                                                상세 페이지
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => setShowAddBoard(showAddBoard === site.id ? null : site.id)}
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-neutral-900 text-white hover:bg-neutral-800"
                                        >
                                            <Plus className="h-3 w-3" /> 게시판 추가
                                        </button>
                                    </div>

                                    {/* Board rows */}
                                    <div className="px-4 pb-3">
                                        {siteBoards.length > 0 && (
                                            <div className="grid grid-cols-12 gap-1 py-2 text-xs text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                                                <span className="col-span-3">게시판명</span>
                                                <span className="col-span-2">유형</span>
                                                <span className="col-span-2">스킨</span>
                                                <span className="col-span-2">게시글</span>
                                                <span className="col-span-2">공개범위</span>
                                                <span className="col-span-1">관리</span>
                                            </div>
                                        )}
                                        {siteBoards.map((board) => {
                                            const postCount = boardPosts.filter((p) => p.boardId === board.id).length;
                                            const VisIcon = visibilityIcon[board.visibility];
                                            return (
                                                <div
                                                    key={board.id}
                                                    className="grid grid-cols-12 gap-1 py-2 border-b border-neutral-50 last:border-0 items-center hover:bg-neutral-50 text-xs"
                                                >
                                                    <div className="col-span-3">
                                                        <Link
                                                            href={`/intra/cms/sites/${site.id}/boards/${board.id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {board.name}
                                                        </Link>
                                                        {board.description && (
                                                            <p className="text-xs text-neutral-400 truncate">{board.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className={clsx("text-xs px-1.5 py-0.5 font-medium", boardTypeBadge[board.boardType])}>
                                                            {BoardTypeInfo[board.boardType].label}
                                                        </span>
                                                    </div>
                                                    <span className="col-span-2 text-neutral-500">{skinLabel[board.skinType]}</span>
                                                    <span className="col-span-2 text-neutral-500">{postCount}건</span>
                                                    <span className="col-span-2 flex items-center gap-1 text-neutral-500">
                                                        <VisIcon className="h-3 w-3" /> {visibilityLabel[board.visibility]}
                                                    </span>
                                                    <div className="col-span-1">
                                                        <Link
                                                            href={`/intra/cms/sites/${site.id}/boards/${board.id}/settings`}
                                                            className="text-xs text-neutral-400 hover:text-neutral-900 underline"
                                                        >
                                                            설정
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {siteBoards.length === 0 && (
                                            <div className="py-6 text-center text-xs text-neutral-400">
                                                게시판이 없습니다. 게시판을 추가해주세요.
                                            </div>
                                        )}
                                    </div>

                                    {/* Inline board creation form */}
                                    {showAddBoard === site.id && (
                                        <div className="border-t border-neutral-200 px-4 py-3 bg-neutral-50/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold">게시판 추가</h4>
                                                <button onClick={() => setShowAddBoard(null)} className="p-0.5 text-neutral-400 hover:text-neutral-900">
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
                                                        className="w-full border border-neutral-200 px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-400 bg-white"
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
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setShowAddBoard(null)}
                                                    className="px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={() => handleAddBoard(site.id)}
                                                    disabled={!boardForm.name.trim()}
                                                    className="px-4 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-30"
                                                >
                                                    만들기
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
