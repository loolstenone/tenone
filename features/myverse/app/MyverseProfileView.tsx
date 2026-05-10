"use client";

// 마이버스 프로필 뷰 — /myverse/my 와 /myverse/app/profile 공통 콘텐츠
// dark prop 으로 외부(마이버스 사이트, 다크) / 앱 셸(라이트) 두 컨텍스트 모두 지원.

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthGate } from "@/components/AuthGate";
import { MyProfileCard } from "@/components/MyProfileCard";
import HitProfileBadge from "@/features/hit/HitProfileBadge";
import { CapabilitySection } from "@/components/CapabilitySection";
import { useRouter } from "next/navigation";
import { FileText, Bookmark, Settings, LogOut, ChevronRight, Eye } from "lucide-react";

interface MyPost {
    id: string; board: string; title: string; view_count: number; comment_count: number; created_at: string;
}

export function MyverseProfileView({ dark = true, fullPage = true }: { dark?: boolean; fullPage?: boolean }) {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const [myPosts, setMyPosts] = useState<MyPost[]>([]);
    const [activeTab, setActiveTab] = useState<"posts" | "bookmarks" | "settings">("posts");

    useEffect(() => {
        if (!user?.id) return;
        fetch(`/api/board/posts?site=myverse&limit=20&status=published`).then(r => r.json()).then(d => setMyPosts(d.posts || [])).catch(() => {});
    }, [user?.id]);

    const tabs = [
        { id: "posts" as const, label: "내 게시글", icon: FileText, count: myPosts.length },
        { id: "bookmarks" as const, label: "북마크", icon: Bookmark, count: 0 },
        { id: "settings" as const, label: "설정", icon: Settings },
    ];

    const bg = dark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900";
    const tabBorder = dark ? "border-neutral-800" : "border-neutral-200";
    const tabInactive = dark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-500 hover:text-neutral-700";
    const countBg = dark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-100 text-neutral-500";
    const divider = dark ? "divide-neutral-800" : "divide-neutral-200";
    const empty = dark ? "text-neutral-500" : "text-neutral-400";
    const settingsBg = dark ? "bg-neutral-800" : "bg-white border border-neutral-200";

    const inner = (
        <div className={`${fullPage ? "min-h-screen pt-24" : "pt-6"} pb-20 px-5 md:px-10 ${bg}`}>
            <div className="max-w-4xl mx-auto">
                {user?.id && (
                    <div className="mb-4">
                        <HitProfileBadge memberId={user.id} respectOptIn />
                    </div>
                )}
                <MyProfileCard
                    accentColor="#6366F1"
                    siteBadge="마이버스"
                    theme={dark ? "dark" : "light"}
                    universeProfileHref={dark ? undefined : null}
                />

                {user?.id && <CapabilitySection memberId={user.id} brandId="myverse" accentColor="#6366F1" className="mb-6" />}

                <div className={`flex items-center gap-1 mb-8 border-b ${tabBorder}`}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id ? "border-[#6366F1] text-[#6366F1]" : `border-transparent ${tabInactive}`}`}>
                            <tab.icon className="h-4 w-4" /> {tab.label}
                            {tab.count !== undefined && <span className={`text-xs px-1.5 py-0.5 rounded-full ${countBg}`}>{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {activeTab === "posts" && (
                    <div className={`divide-y ${divider}`}>
                        {myPosts.length === 0 ? (
                            <div className={`py-16 text-center ${empty}`}>
                                <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">아직 작성한 게시글이 없습니다.</p>
                            </div>
                        ) : myPosts.map(post => (
                            <div key={post.id} className="py-4 flex items-center justify-between hover:opacity-80 cursor-pointer">
                                <div>
                                    <p className="font-medium text-sm">{post.title}</p>
                                    <div className="flex gap-3 mt-1 text-xs text-neutral-500">
                                        <span>{post.board}</span>
                                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.view_count}</span>
                                        <span>{post.created_at?.substring(0, 10)}</span>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-neutral-600" />
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === "bookmarks" && (
                    <div className={`py-16 text-center ${empty}`}>
                        <Bookmark className="h-8 w-8 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">북마크가 없습니다.</p>
                    </div>
                )}
                {activeTab === "settings" && (
                    <div className="space-y-4">
                        <button onClick={() => { logout(); router.push("/"); }}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg ${settingsBg} text-red-500 hover:opacity-80 transition-opacity`}>
                            <LogOut className="h-5 w-5" /><span className="text-sm">로그아웃</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AuthGate accentColor="#6366F1" bgClassName={dark ? "bg-neutral-950" : "bg-neutral-50"}>
            {inner}
        </AuthGate>
    );
}
