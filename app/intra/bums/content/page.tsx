"use client";

import { useState } from "react";
import Link from "next/link";
import { useBumsFilter } from "../layout";
import { siteConfigs } from "@/lib/site-config";
import {
    FileText, Image as ImageIcon, Video, Mic, Search,
    Plus, Filter, Eye, Pencil, Trash2, Calendar,
    ArrowUpDown, LayoutGrid, List,
} from "lucide-react";
import clsx from "clsx";

type ContentType = "전체" | "article" | "gallery" | "video" | "podcast";
type ViewMode = "list" | "card";

const contentTypeLabel: Record<string, string> = {
    "전체": "전체",
    article: "아티클",
    gallery: "갤러리",
    video: "영상",
    podcast: "팟캐스트",
};
const contentTypeIcon: Record<string, typeof FileText> = {
    article: FileText,
    gallery: ImageIcon,
    video: Video,
    podcast: Mic,
};
const contentTypeBadge: Record<string, string> = {
    article: "bg-blue-50 text-blue-600",
    gallery: "bg-indigo-50 text-indigo-600",
    video: "bg-pink-50 text-pink-600",
    podcast: "bg-purple-50 text-purple-600",
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

// Mock content data
const mockContent = [
    { id: "c1", title: "2026 브랜드 전략 리포트", type: "article", site: "TenOne", author: "텐원", status: "published", date: "2026-03-20", views: 1240, image: true },
    { id: "c2", title: "MAD League 시즌 8 하이라이트", type: "video", site: "MAD League", author: "매드", status: "published", date: "2026-03-18", views: 3420, image: true },
    { id: "c3", title: "공감자 에세이 모음", type: "article", site: "공감자", author: "감자마스터", status: "draft", date: "2026-03-15", views: 0, image: false },
    { id: "c4", title: "서울 패션위크 포토 갤러리", type: "gallery", site: "FWN", author: "FWN", status: "published", date: "2026-03-12", views: 890, image: true },
    { id: "c5", title: "Badak 네트워킹 후기", type: "article", site: "Badak", author: "운영팀", status: "published", date: "2026-03-10", views: 560, image: false },
    { id: "c6", title: "RooK AI 아트 쇼케이스", type: "gallery", site: "RooK", author: "루크", status: "scheduled", date: "2026-03-25", views: 0, image: true },
    { id: "c7", title: "트렌드 헌터 월간 리포트 #3", type: "article", site: "Trend Hunter", author: "텐원", status: "published", date: "2026-03-08", views: 2100, image: true },
    { id: "c8", title: "문래지앙 골목 투어 영상", type: "video", site: "문래지앙", author: "문래지앙", status: "published", date: "2026-03-05", views: 450, image: true },
];

export default function ContentManagementPage() {
    const { selectedSiteId } = useBumsFilter();
    const boards: any[] = [];
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<ContentType>("전체");
    const [boardFilter, setBoardFilter] = useState("전체");
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    // 선택된 사이트의 게시판 목록
    const siteBoards = boards.filter(b => selectedSiteId === "all" || b.siteId === selectedSiteId || b.siteId === `site-${selectedSiteId}`);

    const filtered = mockContent.filter(c => {
        if (selectedSiteId !== "all" && !c.site.toLowerCase().includes(selectedSiteId)) return false;
        if (typeFilter !== "전체" && c.type !== typeFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!c.title.toLowerCase().includes(q) && !c.author.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const stats = {
        total: mockContent.length,
        published: mockContent.filter(c => c.status === "published").length,
        draft: mockContent.filter(c => c.status === "draft").length,
        scheduled: mockContent.filter(c => c.status === "scheduled").length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">콘텐츠 관리</h1>
                    <p className="text-sm text-neutral-500 mt-1">아티클, 갤러리, 영상, 팟캐스트 등 콘텐츠를 통합 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-5 py-2.5 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-all">
                    <Plus className="h-4 w-4" /> 콘텐츠 작성
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "전체", value: stats.total, color: "text-neutral-900" },
                    { label: "발행", value: stats.published, color: "text-emerald-600" },
                    { label: "임시저장", value: stats.draft, color: "text-neutral-500" },
                    { label: "예약", value: stats.scheduled, color: "text-blue-600" },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-neutral-100 p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className={clsx("text-xl font-bold", s.color)}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="제목, 작성자 검색..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white transition-all" />
                </div>
                <select value={boardFilter} onChange={e => setBoardFilter(e.target.value)}
                    className="rounded-lg border border-neutral-200 shadow-sm px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all">
                    <option value="전체">전체 게시판</option>
                    {siteBoards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
                    {(Object.keys(contentTypeLabel) as ContentType[]).map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={clsx(
                                "px-3 py-2 text-xs rounded-md transition-all",
                                typeFilter === t ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                            )}>
                            {contentTypeLabel[t]}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1 ml-auto bg-neutral-100 rounded-lg p-0.5">
                    <button onClick={() => setViewMode("list")}
                        className={clsx("p-2 rounded-md transition-all", viewMode === "list" ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-400")}>
                        <List className="h-4 w-4" />
                    </button>
                    <button onClick={() => setViewMode("card")}
                        className={clsx("p-2 rounded-md transition-all", viewMode === "card" ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-400")}>
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content List */}
            {viewMode === "list" ? (
                <div className="bg-white border border-neutral-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left bg-neutral-50/60">
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">제목</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">유형</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">사이트</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">작성자</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">상태</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">날짜</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">조회</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filtered.map(c => {
                                const TypeIcon = contentTypeIcon[c.type] || FileText;
                                return (
                                    <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <TypeIcon className="h-4 w-4 text-neutral-400 shrink-0" />
                                                <span className="font-medium truncate max-w-[250px]">{c.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={clsx("text-[10px] px-2.5 py-1 rounded-full font-medium", contentTypeBadge[c.type])}>
                                                {contentTypeLabel[c.type]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-neutral-500 text-xs">{c.site}</td>
                                        <td className="px-5 py-3.5 text-neutral-500 text-xs">{c.author}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={clsx("text-[10px] px-2.5 py-1 rounded-full font-medium", statusBadge[c.status])}>
                                                {statusLabel[c.status]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-neutral-400 text-xs">{c.date}</td>
                                        <td className="px-5 py-3.5 text-neutral-400 text-right">{c.views.toLocaleString()}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="px-6 py-16 text-center text-neutral-400 text-sm">콘텐츠가 없습니다.</div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {filtered.map(c => {
                        const TypeIcon = contentTypeIcon[c.type] || FileText;
                        return (
                            <div key={c.id} className="bg-white border border-neutral-100 hover:shadow-md hover:border-neutral-200 transition-all group overflow-hidden">
                                <div className="aspect-video bg-neutral-50 flex items-center justify-center">
                                    <TypeIcon className="h-8 w-8 text-neutral-300" />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium", contentTypeBadge[c.type])}>
                                            {contentTypeLabel[c.type]}
                                        </span>
                                        <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium", statusBadge[c.status])}>
                                            {statusLabel[c.status]}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-medium line-clamp-2">{c.title}</h4>
                                    <div className="flex items-center justify-between mt-2.5 text-[10px] text-neutral-400">
                                        <span>{c.site}</span>
                                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{c.views}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
