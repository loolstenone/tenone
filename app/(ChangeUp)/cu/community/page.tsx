"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, ThumbsUp, Eye, Pin, Search, ChevronRight } from "lucide-react";

type TabKey = "notice" | "free" | "idea" | "mentor";

const tabs: { key: TabKey; label: string }[] = [
    { key: "notice", label: "공지사항" },
    { key: "free", label: "자유게시판" },
    { key: "idea", label: "아이디어 피드백" },
    { key: "mentor", label: "멘토 Q&A" },
];

const posts: Record<TabKey, { id: number; title: string; author: string; date: string; views: number; likes: number; comments: number; pinned?: boolean }[]> = {
    notice: [
        { id: 1, title: "2026 여름 고등학생 창업 캠프 모집 안내 (7.14~7.25)", author: "ChangeUp", date: "2026.03.20", views: 1243, likes: 45, comments: 12, pinned: true },
        { id: 2, title: "AI 비즈니스 워크숍 4기 참가자 모집 (4.19 토요일)", author: "ChangeUp", date: "2026.03.18", views: 892, likes: 32, comments: 8, pinned: true },
        { id: 3, title: "지역사회 커뮤니티 펀드 2차 모집 안내", author: "ChangeUp", date: "2026.03.10", views: 567, likes: 18, comments: 5 },
        { id: 4, title: "대학생 부트캠프 5기 데모데이 결과 발표", author: "ChangeUp", date: "2026.03.08", views: 1567, likes: 89, comments: 34 },
        { id: 5, title: "2026년 상반기 멘토 모집", author: "ChangeUp", date: "2026.02.28", views: 445, likes: 22, comments: 7 },
    ],
    free: [
        { id: 1, title: "고1인데 창업 관심 있습니다. 어디서 시작하면 좋을까요?", author: "미래CEO", date: "2026.03.22", views: 234, likes: 15, comments: 23 },
        { id: 2, title: "AI 워크숍 3기 후기 공유합니다!", author: "코딩하는감자", date: "2026.03.21", views: 456, likes: 34, comments: 11 },
        { id: 3, title: "부모님께 투자 설득하는 팁 공유", author: "스타트업꿈나무", date: "2026.03.20", views: 789, likes: 67, comments: 45 },
        { id: 4, title: "대학 입시에서 창업 경험이 도움이 될까요?", author: "고3입시생", date: "2026.03.19", views: 1234, likes: 78, comments: 56 },
    ],
    idea: [
        { id: 1, title: "[피드백 요청] 학교 급식 AI 추천 앱 아이디어", author: "급식왕", date: "2026.03.22", views: 123, likes: 8, comments: 15 },
        { id: 2, title: "[피드백 요청] 중고 교과서 거래 플랫폼", author: "절약러", date: "2026.03.21", views: 98, likes: 12, comments: 9 },
        { id: 3, title: "[피드백 완료] 동네 산책로 AI 추천 서비스", author: "산책러", date: "2026.03.18", views: 234, likes: 23, comments: 18 },
    ],
    mentor: [
        { id: 1, title: "MVP를 만들 때 꼭 필요한 기능만 넣으려면?", author: "초보창업자", date: "2026.03.22", views: 345, likes: 23, comments: 8 },
        { id: 2, title: "투자 피칭 덱 구성 질문입니다", author: "피칭준비중", date: "2026.03.20", views: 234, likes: 12, comments: 5 },
        { id: 3, title: "사업자등록 미성년자도 가능한가요?", author: "16살CEO", date: "2026.03.19", views: 567, likes: 34, comments: 12 },
    ],
};

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("notice");

    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#0F1F2E] to-[#1a3a52] text-white py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <h1 className="text-2xl md:text-4xl font-black">커뮤니티</h1>
                    <p className="mt-3 text-neutral-300">함께 배우고, 나누고, 성장하는 공간</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Search */}
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1AAD64] focus:border-transparent"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-neutral-200 mb-6 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? "border-[#1AAD64] text-[#1AAD64]"
                                        : "border-transparent text-neutral-500 hover:text-neutral-900"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    <div className="divide-y divide-neutral-100">
                        {posts[activeTab].map((post) => (
                            <div key={post.id} className="py-4 flex items-center gap-4 hover:bg-neutral-50 px-3 -mx-3 rounded-lg transition-colors cursor-pointer">
                                {post.pinned && (
                                    <Pin className="w-4 h-4 text-[#1AAD64] shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium truncate">
                                        {post.pinned && <span className="text-[#1AAD64] mr-1">[필독]</span>}
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                                        <span>{post.author}</span>
                                        <span>{post.date}</span>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-4 text-xs text-neutral-400 shrink-0">
                                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views}</span>
                                    <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" />{post.likes}</span>
                                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{post.comments}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Write button */}
                    <div className="mt-8 flex justify-end">
                        <button className="bg-[#1AAD64] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#148F52] transition-colors">
                            글쓰기
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
