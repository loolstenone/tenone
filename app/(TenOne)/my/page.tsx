"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    User, FileText, Bookmark, Heart, Settings, LogOut,
    ChevronRight, Eye, MessageCircle, Calendar, Award,
} from "lucide-react";

interface MyPost {
    id: string;
    site: string;
    board: string;
    title: string;
    status: string;
    view_count: number;
    comment_count: number;
    created_at: string;
}

export default function MyPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"posts" | "bookmarks" | "settings">("posts");
    const [myPosts, setMyPosts] = useState<MyPost[]>([]);
    const [bookmarks, setBookmarks] = useState<MyPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!user?.id) return;
        setLoading(true);

        // 내 게시글 (TODO: author_id 필터 API 추가 필요)
        fetch(`/api/board/posts?site=tenone&limit=20&status=published`)
            .then(r => r.json())
            .then(d => setMyPosts(d.posts || []))
            .catch(() => {});

        // 북마크 (TODO: bookmark API)
        setBookmarks([]);
        setLoading(false);
    }, [user?.id]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--tn-bg)" }}>
                <div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
            </div>
        );
    }

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
        : "?";

    const tabs = [
        { id: "posts" as const, label: "내 게시글", icon: FileText, count: myPosts.length },
        { id: "bookmarks" as const, label: "북마크", icon: Bookmark, count: bookmarks.length },
        { id: "settings" as const, label: "설정", icon: Settings },
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 px-6" style={{ backgroundColor: "var(--tn-bg)", color: "var(--tn-text)" }}>
            <div className="max-w-4xl mx-auto">

                {/* 프로필 헤더 */}
                <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                        style={{ backgroundColor: "var(--tn-bg-alt)", color: "var(--tn-text-sub)" }}>
                        {initials}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{user?.name || "회원"}</h1>
                        <p className="text-sm mt-1" style={{ color: "var(--tn-text-sub)" }}>{user?.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "var(--tn-text-muted)" }}>
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> 게시글 {myPosts.length}</span>
                            <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" /> 북마크 {bookmarks.length}</span>
                        </div>
                    </div>
                    <Link href="/profile" className="px-4 py-2 text-sm border rounded-lg transition-colors hover:opacity-80"
                        style={{ borderColor: "var(--tn-border)", color: "var(--tn-text-sub)" }}>
                        프로필 수정
                    </Link>
                </div>

                {/* 탭 */}
                <div className="flex items-center gap-1 mb-8 border-b" style={{ borderColor: "var(--tn-border)" }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2"
                            style={{
                                borderColor: activeTab === tab.id ? "var(--tn-text)" : "transparent",
                                color: activeTab === tab.id ? "var(--tn-text)" : "var(--tn-text-muted)",
                            }}>
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full"
                                    style={{ backgroundColor: "var(--tn-bg-alt)", color: "var(--tn-text-muted)" }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* 내 게시글 */}
                {activeTab === "posts" && (
                    <div className="space-y-0 divide-y" style={{ borderColor: "var(--tn-border)" }}>
                        {myPosts.length === 0 ? (
                            <div className="py-16 text-center" style={{ color: "var(--tn-text-muted)" }}>
                                <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">아직 작성한 게시글이 없습니다.</p>
                            </div>
                        ) : (
                            myPosts.map(post => (
                                <div key={post.id} className="py-4 flex items-center justify-between group cursor-pointer hover:opacity-80 transition-opacity">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{post.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--tn-text-muted)" }}>
                                            <span>{post.board}</span>
                                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.view_count}</span>
                                            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comment_count}</span>
                                            <span>{post.created_at?.substring(0, 10)}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--tn-text-muted)" }} />
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* 북마크 */}
                {activeTab === "bookmarks" && (
                    <div className="py-16 text-center" style={{ color: "var(--tn-text-muted)" }}>
                        <Bookmark className="h-8 w-8 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">북마크한 게시글이 없습니다.</p>
                    </div>
                )}

                {/* 설정 */}
                {activeTab === "settings" && (
                    <div className="space-y-4">
                        <Link href="/profile" className="flex items-center justify-between p-4 rounded-lg transition-colors hover:opacity-80"
                            style={{ backgroundColor: "var(--tn-bg-alt)" }}>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5" style={{ color: "var(--tn-text-muted)" }} />
                                <span className="text-sm">프로필 수정</span>
                            </div>
                            <ChevronRight className="h-4 w-4" style={{ color: "var(--tn-text-muted)" }} />
                        </Link>
                        <button onClick={() => { logout(); router.push("/"); }}
                            className="w-full flex items-center gap-3 p-4 rounded-lg text-red-500 transition-colors hover:opacity-80"
                            style={{ backgroundColor: "var(--tn-bg-alt)" }}>
                            <LogOut className="h-5 w-5" />
                            <span className="text-sm">로그아웃</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
