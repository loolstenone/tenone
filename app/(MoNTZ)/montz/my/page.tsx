"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { MyProfileCard } from "@/components/MyProfileCard";
import HitProfileBadge from "@/features/hit/HitProfileBadge";
import { CapabilitySection } from "@/components/CapabilitySection";
import { useRouter } from "next/navigation";
import { FileText, Bookmark, Settings, LogOut, ChevronRight, Eye, Camera, Inbox, Briefcase, Upload, Trash2 } from "lucide-react";
import {
    getMyWorks, deleteMyWork,
    getMyReceivedContacts, updateContactStatus,
    getMyApplications,
    type MontzWork, type MontzContactRequest, type MontzApplication,
} from "@/lib/supabase/montz";

interface MyPost {
    id: string; board: string; title: string; view_count: number; comment_count: number; created_at: string;
}

type TabId = "works" | "offers" | "applied" | "posts" | "bookmarks" | "settings";

const STATUS_LABEL: Record<MontzContactRequest["status"], string> = {
    pending: "새 제안", seen: "확인함", accepted: "수락", declined: "거절",
};
const STATUS_STYLE: Record<MontzContactRequest["status"], string> = {
    pending: "bg-[#c8a97e] text-neutral-900",
    seen: "bg-neutral-700 text-neutral-300",
    accepted: "bg-emerald-600 text-white",
    declined: "bg-neutral-800 text-neutral-500",
};
const APP_STATUS_LABEL: Record<MontzApplication["status"], string> = {
    pending: "대기", seen: "열람됨", shortlisted: "후보 선정", rejected: "탈락", cast: "캐스팅",
};
const APP_STATUS_STYLE: Record<MontzApplication["status"], string> = {
    pending: "bg-neutral-700 text-neutral-200",
    seen: "bg-neutral-600 text-neutral-100",
    shortlisted: "bg-amber-600 text-white",
    rejected: "bg-neutral-800 text-neutral-500",
    cast: "bg-emerald-600 text-white",
};

export default function MoNTZMyPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const [myPosts, setMyPosts] = useState<MyPost[]>([]);
    const [activeTab, setActiveTab] = useState<TabId>("works");
    const [works, setWorks] = useState<MontzWork[]>([]);
    const [offers, setOffers] = useState<MontzContactRequest[]>([]);
    const [applications, setApplications] = useState<MontzApplication[]>([]);
    const [loading, setLoading] = useState<Record<TabId, boolean>>({
        works: false, offers: false, applied: false, posts: false, bookmarks: false, settings: false,
    });

    // posts는 기존 로직 그대로
    useEffect(() => {
        if (!user?.id) return;
        fetch(`/api/board/posts?site=montz&limit=20&status=published`).then(r => r.json()).then(d => setMyPosts(d.posts || [])).catch(() => {});
    }, [user?.id]);

    // 활성 탭 변경 시 lazy fetch
    useEffect(() => {
        if (!user?.id) return;
        if (activeTab === "works" && works.length === 0) {
            setLoading(l => ({ ...l, works: true }));
            getMyWorks(user.id).then(setWorks).finally(() => setLoading(l => ({ ...l, works: false })));
        }
        if (activeTab === "offers" && offers.length === 0) {
            setLoading(l => ({ ...l, offers: true }));
            getMyReceivedContacts(user.id).then(setOffers).finally(() => setLoading(l => ({ ...l, offers: false })));
        }
        if (activeTab === "applied" && applications.length === 0) {
            setLoading(l => ({ ...l, applied: true }));
            getMyApplications(user.id).then(setApplications).finally(() => setLoading(l => ({ ...l, applied: false })));
        }
    }, [activeTab, user?.id, works.length, offers.length, applications.length]);

    const handleDeleteWork = async (workId: string) => {
        if (!user?.id) return;
        if (!confirm("이 작품을 삭제할까요?")) return;
        try {
            await deleteMyWork(user.id, workId);
            setWorks(prev => prev.filter(w => w.id !== workId));
        } catch (e) {
            alert(e instanceof Error ? e.message : "삭제 실패");
        }
    };

    const handleOfferStatus = async (offerId: string, status: "seen" | "accepted" | "declined") => {
        if (!user?.id) return;
        try {
            await updateContactStatus(user.id, offerId, status);
            setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status } : o));
        } catch (e) {
            alert(e instanceof Error ? e.message : "상태 변경 실패");
        }
    };

    const offerPendingCount = offers.filter(o => o.status === "pending").length;

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950">
            <div className="h-6 w-6 border-2 border-[#c8a97e]/20 border-t-[#c8a97e] rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated) return (
        <div className="min-h-screen bg-neutral-950">
            <LoginModal isOpen={true} onClose={() => {}} accentColor="#c8a97e" />
        </div>
    );

    const tabs: Array<{ id: TabId; label: string; icon: typeof FileText; count?: number; badge?: boolean }> = [
        { id: "works", label: "내 작품", icon: Camera, count: works.length },
        { id: "offers", label: "받은 제안", icon: Inbox, count: offers.length, badge: offerPendingCount > 0 },
        { id: "applied", label: "신청 오디션", icon: Briefcase, count: applications.length },
        { id: "posts", label: "게시글", icon: FileText, count: myPosts.length },
        { id: "bookmarks", label: "북마크", icon: Bookmark, count: 0 },
        { id: "settings", label: "설정", icon: Settings },
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-neutral-950 text-neutral-100">
            <div className="max-w-4xl mx-auto">
                {user?.id && (
                    <div className="mb-4">
                        <HitProfileBadge memberId={user.id} respectOptIn />
                    </div>
                )}
                <MyProfileCard accentColor="#c8a97e" siteBadge="MoNTZ" />

                {user?.id && <CapabilitySection memberId={user.id} brandId="montz" accentColor="#c8a97e" className="mb-6" />}

                <div className="flex items-center gap-1 mb-8 border-b border-neutral-800 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id ? "border-[#c8a97e] text-[#c8a97e]" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}>
                            <tab.icon className="h-4 w-4" /> {tab.label}
                            {tab.count !== undefined && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab.badge ? "bg-[#c8a97e] text-neutral-900 font-bold" : "bg-neutral-800 text-neutral-400"}`}>{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* 내 작품 */}
                {activeTab === "works" && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[13px] text-neutral-400">총 {works.length}개 작품</p>
                            <Link href="/montz/upload"
                                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-neutral-900 bg-[#c8a97e] px-3 py-2 hover:bg-[#d4b88c] transition-colors">
                                <Upload className="h-3.5 w-3.5" /> 새 작품 업로드
                            </Link>
                        </div>
                        {loading.works ? (
                            <div className="py-16 text-center"><div className="inline-block h-5 w-5 border-2 border-[#c8a97e]/30 border-t-[#c8a97e] rounded-full animate-spin" /></div>
                        ) : works.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500">
                                <Camera className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm mb-4">아직 등록된 작품이 없습니다.</p>
                                <Link href="/montz/upload"
                                    className="inline-block bg-[#c8a97e] text-neutral-900 text-[13px] font-bold px-5 py-2.5 hover:bg-[#d4b88c] transition-colors">
                                    첫 작품 올리기
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {works.map(w => (
                                    <div key={w.id} className="relative group bg-neutral-900 aspect-[3/4] overflow-hidden">
                                        {w.images[0] && (
                                            <Image src={w.images[0]} alt={w.title} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                            <p className="text-[11px] font-bold text-white line-clamp-2 mb-1.5">{w.title}</p>
                                            <button onClick={() => handleDeleteWork(w.id)}
                                                className="self-start text-[10px] text-red-300 hover:text-red-200 flex items-center gap-1">
                                                <Trash2 className="h-3 w-3" /> 삭제
                                            </button>
                                        </div>
                                        <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5">{w.category || "기타"}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 받은 캐스팅 제안 */}
                {activeTab === "offers" && (
                    <div className="space-y-3">
                        {loading.offers ? (
                            <div className="py-16 text-center"><div className="inline-block h-5 w-5 border-2 border-[#c8a97e]/30 border-t-[#c8a97e] rounded-full animate-spin" /></div>
                        ) : offers.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500">
                                <Inbox className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">아직 받은 캐스팅 제안이 없습니다.</p>
                            </div>
                        ) : offers.map(o => (
                            <div key={o.id} className="bg-neutral-900 border border-neutral-800 p-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                                            {o.sender_company && <p className="text-[11px] text-neutral-500 truncate">{o.sender_company}</p>}
                                        </div>
                                        <p className="text-[15px] font-bold text-white">{o.sender_name}</p>
                                        <p className="text-[12px] text-neutral-500 mb-1">{o.sender_email}</p>
                                        {o.role_title && <p className="text-[12px] text-[#c8a97e] mb-2">{o.role_title}</p>}
                                    </div>
                                    <p className="text-[10px] text-neutral-600 shrink-0">{new Date(o.created_at).toLocaleDateString("ko-KR")}</p>
                                </div>
                                <p className="text-[13px] text-neutral-300 leading-relaxed whitespace-pre-wrap mb-3">{o.message}</p>
                                {o.status === "pending" && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOfferStatus(o.id, "accepted")}
                                            className="flex-1 text-[12px] font-bold bg-emerald-600 text-white py-2 hover:bg-emerald-700 transition-colors">수락</button>
                                        <button onClick={() => handleOfferStatus(o.id, "declined")}
                                            className="flex-1 text-[12px] font-bold border border-neutral-700 text-neutral-300 py-2 hover:bg-neutral-800 transition-colors">거절</button>
                                        <button onClick={() => handleOfferStatus(o.id, "seen")}
                                            className="text-[12px] text-neutral-500 px-3 hover:text-neutral-300">확인만</button>
                                    </div>
                                )}
                                {o.status !== "pending" && (
                                    <a href={`mailto:${o.sender_email}`}
                                        className="inline-flex items-center gap-1 text-[12px] text-[#c8a97e] hover:text-[#d4b88c]">
                                        직접 답장 보내기 →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 신청한 오디션 */}
                {activeTab === "applied" && (
                    <div className="space-y-3">
                        {loading.applied ? (
                            <div className="py-16 text-center"><div className="inline-block h-5 w-5 border-2 border-[#c8a97e]/30 border-t-[#c8a97e] rounded-full animate-spin" /></div>
                        ) : applications.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500">
                                <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm mb-4">아직 신청한 오디션이 없습니다.</p>
                                <Link href="/montz/audition"
                                    className="inline-block bg-[#c8a97e] text-neutral-900 text-[13px] font-bold px-5 py-2.5 hover:bg-[#d4b88c] transition-colors">
                                    오디션 둘러보기
                                </Link>
                            </div>
                        ) : applications.map(a => (
                            <div key={a.id} className="bg-neutral-900 border border-neutral-800 p-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 ${APP_STATUS_STYLE[a.status]}`}>{APP_STATUS_LABEL[a.status]}</span>
                                            {a.audition?.type && <p className="text-[11px] text-[#c8a97e]">{a.audition.type}</p>}
                                        </div>
                                        <p className="text-[15px] font-bold text-white">{a.audition?.company ?? "-"}</p>
                                        <p className="text-[12px] text-neutral-400 mb-1">{a.audition?.role ?? "-"}</p>
                                    </div>
                                    <p className="text-[10px] text-neutral-600 shrink-0">{new Date(a.created_at).toLocaleDateString("ko-KR")}</p>
                                </div>
                                {a.message && (
                                    <p className="text-[12px] text-neutral-500 leading-relaxed line-clamp-2 mt-2">{a.message}</p>
                                )}
                                {a.audition?.deadline && (
                                    <p className="text-[11px] text-neutral-600 mt-2">마감 {a.audition.deadline}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "posts" && (
                    <div className="divide-y divide-neutral-800">
                        {myPosts.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500">
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
                    <div className="py-16 text-center text-neutral-500">
                        <Bookmark className="h-8 w-8 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">북마크가 없습니다.</p>
                    </div>
                )}
                {activeTab === "settings" && (
                    <div className="space-y-4">
                        <button onClick={() => { logout(); router.push("/"); }}
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-neutral-800 text-red-400 hover:opacity-80 transition-opacity">
                            <LogOut className="h-5 w-5" /><span className="text-sm">로그아웃</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
