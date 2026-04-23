"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import HitProfileBadge from "@/features/hit/HitProfileBadge";
import MatchingInbox from "@/features/hero/MatchingInbox";
import { MyProfileCard } from "@/components/MyProfileCard";
import { CapabilitySection } from "@/components/CapabilitySection";
import { useRouter } from "next/navigation";
import { FileText, Bookmark, Settings, LogOut, ChevronRight, Eye, Compass, Building2 } from "lucide-react";

interface MyPost {
    id: string; board: string; title: string; view_count: number; comment_count: number; created_at: string;
}

export default function HeRoMyPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const [myPosts, setMyPosts] = useState<MyPost[]>([]);
    const [activeTab, setActiveTab] = useState<"posts" | "bookmarks" | "settings">("posts");
    const [jhStatus, setJhStatus] = useState<"none" | "draft" | "active" | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        fetch(`/api/board/posts?site=hero&limit=20&status=published&author_id=${user.id}`).then(r => r.json()).then(d => setMyPosts(d.posts || [])).catch(() => {});
        fetch(`/api/hero/jh?memberId=${user.id}`).then(r => r.json()).then(d => {
            if (!d.jh) setJhStatus("none");
            else setJhStatus(d.jh.status === "active" ? "active" : "draft");
        }).catch(() => setJhStatus("none"));
    }, [user?.id]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-neutral-900"><div className="h-6 w-6 border-2 border-neutral-600 border-t-[#E53935] rounded-full animate-spin" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-900"><LoginModal isOpen={true} onClose={() => {}} accentColor="#E53935" /></div>;

    const tabs = [
        { id: "posts" as const, label: "내 게시글", icon: FileText, count: myPosts.length },
        { id: "bookmarks" as const, label: "북마크", icon: Bookmark, count: 0 },
        { id: "settings" as const, label: "설정", icon: Settings },
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-neutral-900 text-neutral-100">
            <div className="max-w-4xl mx-auto">
                {/* HIT 프로필 */}
                <div className="mb-6">
                    <HitProfileBadge memberId={user?.id} />
                </div>

                {/* JH 카드 — 매칭 Tetrad 인재 측 입력 */}
                {jhStatus && (
                    <Link href={jhStatus === "none" ? "/hero/jh/write" : "/hero/jh"}
                        className="mb-6 flex items-center gap-3 px-4 py-3 border border-dashed border-neutral-700 rounded-xl hover:border-[#E53935] hover:bg-red-500/5 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                            <Compass className="h-5 w-5 text-neutral-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-100">
                                {jhStatus === "active" ? "희망 직무 · 매칭 진행 중" : jhStatus === "draft" ? "희망 직무 · 작성 중 (이어서 쓰기)" : "희망 직무 작성하기"}
                            </p>
                            <p className="text-xs text-neutral-400">
                                {jhStatus === "active"
                                    ? "HeRo가 어울리는 자리를 찾고 있습니다"
                                    : jhStatus === "draft"
                                    ? "남은 문항을 마저 답해 주세요"
                                    : "12문항으로 원하는 자리의 방향을 정리합니다 · 4~7분"}
                            </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-500" />
                    </Link>
                )}

                <MyProfileCard accentColor="#E53935" />

                {user?.id && <CapabilitySection memberId={user.id} brandId="hero" accentColor="#E53935" className="mb-6" />}

                {/* 매칭 인박스 — 큐레이션 수신 */}
                {user?.id && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span>매칭 현황</span>
                            <span className="h-px flex-1 bg-neutral-800" />
                        </h2>
                        <MatchingInbox side="talent" memberId={user.id} accentColor="#E53935" theme="dark" />
                    </div>
                )}

                {/* 기업 회원 허브 안내 */}
                <Link href="/hero/company"
                    className="mb-8 flex items-center gap-3 px-4 py-3 border border-neutral-700 hover:border-neutral-500 rounded-xl transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-100">기업으로 인재를 찾으시나요?</p>
                        <p className="text-xs text-neutral-400 mt-0.5">회사를 등록하고 필요한 자리를 적어 주시면 HeRo가 인재를 이어드립니다</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-500" />
                </Link>

                <div className="flex items-center gap-1 mb-8 border-b border-neutral-700">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id ? "border-[#E53935] text-[#E53935]" : "border-transparent text-neutral-500"}`}>
                            <tab.icon className="h-4 w-4" /> {tab.label}
                            {tab.count !== undefined && <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-500">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {activeTab === "posts" && (
                    <div className="divide-y divide-neutral-800">
                        {myPosts.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500"><FileText className="h-8 w-8 mx-auto mb-3 opacity-50" /><p className="text-sm">아직 작성한 게시글이 없습니다.</p></div>
                        ) : myPosts.map(post => (
                            <Link key={post.id} href={`/hero/community/post/${post.id}`} className="py-4 flex items-center justify-between hover:opacity-80 transition-opacity">
                                <div><p className="font-medium text-sm">{post.title}</p>
                                    <div className="flex gap-3 mt-1 text-xs text-neutral-500">
                                        <span>{post.board}</span><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.view_count}</span><span>{post.created_at?.substring(0, 10)}</span>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-neutral-600" />
                            </Link>
                        ))}
                    </div>
                )}
                {activeTab === "bookmarks" && <div className="py-16 text-center text-neutral-500"><Bookmark className="h-8 w-8 mx-auto mb-3 opacity-50" /><p className="text-sm">북마크가 없습니다.</p></div>}
                {activeTab === "settings" && (
                    <div className="space-y-4">
                        <button onClick={() => { logout(); router.push("/"); }} className="w-full flex items-center gap-3 p-4 rounded-lg bg-neutral-800 text-red-400 hover:opacity-80">
                            <LogOut className="h-5 w-5" /><span className="text-sm">로그아웃</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
