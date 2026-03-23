"use client";

import { useBums } from "@/lib/bums-context";
import Link from "next/link";
import {
    Globe, LayoutGrid, FileText, Eye, ExternalLink, Clock,
} from "lucide-react";
import clsx from "clsx";

const statusColor: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    maintenance: "bg-yellow-100 text-yellow-700",
    inactive: "bg-neutral-100 text-neutral-500",
};

const statusLabel: Record<string, string> = {
    active: "운영중",
    maintenance: "점검중",
    inactive: "비활성",
};

export default function CmsDashboard() {
    const { sites, boards, boardPosts } = useBums();

    const totalBoards = boards.length;
    const totalPosts = boardPosts.length;
    const todayViews = boardPosts.reduce((sum, p) => sum + p.viewCount, 0);

    const recentPosts = [...boardPosts]
        .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))
        .slice(0, 10);

    const stats = [
        { name: "전체 사이트", value: sites.length, icon: Globe, href: "/intra/bums/sites" },
        { name: "게시판 수", value: totalBoards, icon: LayoutGrid, href: "/intra/bums/sites" },
        { name: "게시글 수", value: totalPosts, icon: FileText, href: "/intra/bums/sites" },
        { name: "오늘 조회수", value: todayViews.toLocaleString(), icon: Eye, href: "/intra/bums/sites" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">CMS Dashboard</h2>
                <p className="mt-1 text-sm text-neutral-500">사이트 & 게시판 통합 관리</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(item => (
                    <Link key={item.name} href={item.href}
                        className="group border border-neutral-200 bg-white p-6 hover:border-neutral-900 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500">{item.name}</p>
                                <p className="mt-2 text-3xl font-bold">{item.value}</p>
                            </div>
                            <div className="p-3 bg-neutral-100 text-neutral-400">
                                <item.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Managed Sites */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">관리 사이트</h3>
                    <Link href="/intra/bums/sites" className="text-xs text-neutral-400 hover:text-neutral-900">
                        전체 보기
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sites.map(site => {
                        const siteBoards = boards.filter(b => b.siteId === site.id);
                        const sitePosts = boardPosts.filter(p => p.siteId === site.id);
                        return (
                            <Link key={site.id} href={`/intra/bums/sites/${site.id}`}
                                className="border border-neutral-200 bg-white p-5 hover:border-neutral-900 transition-all group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-sm">{site.name}</h4>
                                        <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                                            <ExternalLink className="h-3 w-3" />
                                            {site.domain}
                                        </p>
                                    </div>
                                    <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium", statusColor[site.status])}>
                                        {statusLabel[site.status]}
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-500 mt-2 line-clamp-1">{site.description}</p>
                                <div className="flex gap-4 mt-3 text-xs text-neutral-400">
                                    <span>게시판 {siteBoards.length}</span>
                                    <span>게시글 {sitePosts.length}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Posts */}
            <div className="border border-neutral-200 bg-white">
                <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                    <h3 className="text-sm font-semibold">최근 게시글</h3>
                </div>
                <ul className="divide-y divide-neutral-100">
                    {recentPosts.map(post => {
                        const board = boards.find(b => b.id === post.boardId);
                        const site = sites.find(s => s.id === post.siteId);
                        return (
                            <li key={post.id} className="px-6 py-3 hover:bg-neutral-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{post.title}</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                {site?.name} &middot; {board?.name} &middot; {post.authorName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-neutral-400 shrink-0 ml-4">
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />{post.viewCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />{post.publishedAt ?? post.createdAt}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                    {recentPosts.length === 0 && (
                        <li className="px-6 py-8 text-center text-sm text-neutral-400">게시글이 없습니다</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
