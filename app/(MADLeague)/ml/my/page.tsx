"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { User, FileText, Bookmark, Settings, LogOut, ChevronRight, Eye, Award } from "lucide-react";

interface MyPost {
    id: string; board: string; title: string; view_count: number; comment_count: number; created_at: string;
}

export default function MadLeagueMyPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const [myPosts, setMyPosts] = useState<MyPost[]>([]);
    const [activeTab, setActiveTab] = useState<"posts" | "bookmarks" | "settings">("posts");

    useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/login"); }, [isLoading, isAuthenticated, router]);
    useEffect(() => {
        if (!user?.id) return;
        fetch(`/api/board/posts?site=madleague&limit=20&status=published`).then(r => r.json()).then(d => setMyPosts(d.posts || [])).catch(() => {});
    }, [user?.id]);

    if (isLoading || !isAuthenticated) return <div className="min-h-screen flex items-center justify-center bg-[#212121]"><div className="h-6 w-6 border-2 border-neutral-600 border-t-[#D32F2F] rounded-full animate-spin" /></div>;

    const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "?";

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-[#212121] text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 rounded-full bg-[#D32F2F]/20 flex items-center justify-center text-2xl font-bold text-[#D32F2F]">{initials}</div>
                    <div>
                        <h1 className="text-2xl font-bold">{user?.name || "리거"}</h1>
                        <p className="text-sm text-neutral-400 mt-1">{user?.email}</p>
                        <p className="text-xs text-[#D32F2F] mt-1 flex items-center gap-1"><Award className="h-3 w-3" /> MAD Leaguer</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 mb-8 border-b border-neutral-700">
                    {[
                        { id: "posts" as const, label: "내 게시글", icon: FileText },
                        { id: "bookmarks" as const, label: "북마크", icon: Bookmark },
                        { id: "settings" as const, label: "설정", icon: Settings },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id ? "border-[#D32F2F] text-[#D32F2F]" : "border-transparent text-neutral-500"}`}>
                            <tab.icon className="h-4 w-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "posts" && (
                    <div className="divide-y divide-neutral-700">
                        {myPosts.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500"><FileText className="h-8 w-8 mx-auto mb-3 opacity-50" /><p className="text-sm">아직 작성한 게시글이 없습니다.</p></div>
                        ) : myPosts.map(post => (
                            <div key={post.id} className="py-4 flex items-center justify-between hover:opacity-80 cursor-pointer">
                                <div><p className="font-medium text-sm">{post.title}</p>
                                    <div className="flex gap-3 mt-1 text-xs text-neutral-500"><span>{post.board}</span><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.view_count}</span><span>{post.created_at?.substring(0, 10)}</span></div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-neutral-600" />
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === "bookmarks" && <div className="py-16 text-center text-neutral-500"><Bookmark className="h-8 w-8 mx-auto mb-3 opacity-50" /><p className="text-sm">북마크가 없습니다.</p></div>}
                {activeTab === "settings" && (
                    <button onClick={() => { logout(); router.push("/"); }} className="w-full flex items-center gap-3 p-4 rounded-lg bg-neutral-800 text-red-400 hover:opacity-80">
                        <LogOut className="h-5 w-5" /><span className="text-sm">로그아웃</span>
                    </button>
                )}
            </div>
        </div>
    );
}
