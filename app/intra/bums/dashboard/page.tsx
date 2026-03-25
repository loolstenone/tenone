"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, LayoutGrid, FileText, Eye, Clock } from "lucide-react";

interface BoardConfig { id: string; site: string; slug: string; name: string; }
interface PostRow { id: string; site: string; board: string; title: string; view_count: number; created_at: string; }

export default function BumsDashboard() {
    const [configs, setConfigs] = useState<BoardConfig[]>([]);
    const [posts, setPosts] = useState<PostRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/board/configs').then(r => r.json()),
            fetch('/api/board/posts?limit=100&status=published').then(r => r.json()),
        ]).then(([c, p]) => {
            setConfigs(c.configs || []);
            setPosts(p.posts || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const sites = [...new Set(configs.map(c => c.site))];
    const totalViews = posts.reduce((s, p) => s + (p.view_count || 0), 0);
    const recentPosts = [...posts].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

    if (loading) {
        return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">BUMS Dashboard</h1>
                <p className="text-sm text-neutral-500 mt-1">사이트 & 게시판 통합 관리</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "전체 사이트", value: sites.length, icon: Globe },
                    { label: "게시판 수", value: configs.length, icon: LayoutGrid },
                    { label: "게시글 수", value: posts.length, icon: FileText },
                    { label: "총 조회수", value: totalViews.toLocaleString(), icon: Eye },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-neutral-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-neutral-500">{stat.label}</span>
                            <stat.icon className="h-4 w-4 text-neutral-300" />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* 관리 사이트 */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">관리 사이트</h2>
                    <Link href="/intra/bums/sites" className="text-xs text-neutral-500 hover:text-neutral-900">전체 보기</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sites.map(site => {
                        const siteConfigs = configs.filter(c => c.site === site);
                        const sitePosts = posts.filter(p => p.site === site);
                        return (
                            <div key={site} className="bg-white rounded-xl border border-neutral-100 p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold">{site}</h3>
                                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">운영중</span>
                                </div>
                                <p className="text-xs text-neutral-400 mb-3">게시판 {siteConfigs.length} · 게시글 {sitePosts.length}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 최근 게시글 */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">최근 게시글</h2>
                    <Link href="/intra/bums/boards" className="text-xs text-neutral-500 hover:text-neutral-900">전체 보기</Link>
                </div>
                <div className="bg-white rounded-xl border border-neutral-100 divide-y divide-neutral-100">
                    {recentPosts.map(post => (
                        <div key={post.id} className="px-5 py-3.5 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">{post.title}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{post.site} · {post.board}</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.view_count}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.created_at?.substring(0, 10)}</span>
                            </div>
                        </div>
                    ))}
                    {recentPosts.length === 0 && <div className="px-5 py-12 text-center text-neutral-400 text-sm">게시글이 없습니다.</div>}
                </div>
            </div>
        </div>
    );
}
