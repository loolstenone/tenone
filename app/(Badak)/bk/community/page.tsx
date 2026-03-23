"use client";

import Link from "next/link";

const threads = [
    { title: "오랜만이야! 바닥 춥다고 했잖아! ㅎㅎㅎ", author: "badak_master", replies: 12, date: "2026.03.23" },
    { title: "마케팅 업계 이직 고민 중인데 조언 부탁드려요", author: "mkt_junior", replies: 28, date: "2026.03.22" },
    { title: "GA4 세팅 관련 질문입니다", author: "data_lover", replies: 8, date: "2026.03.22" },
    { title: "요즘 퍼포먼스 마케터 연봉 밴드 어떤가요?", author: "curious_cat", replies: 45, date: "2026.03.21" },
    { title: "AI 마케팅 도구 추천해주세요", author: "ai_fan", replies: 19, date: "2026.03.21" },
    { title: "프리랜서 마케터로 전향하신 분 계실까요?", author: "free_bird", replies: 33, date: "2026.03.20" },
    { title: "콘텐츠 마케팅 포트폴리오 어떻게 구성하시나요?", author: "content_queen", replies: 15, date: "2026.03.20" },
    { title: "브랜딩 에이전시 vs 인하우스 뭐가 나을까요", author: "brand_new", replies: 22, date: "2026.03.19" },
    { title: "마케팅 관련 추천 도서 공유합니다!", author: "book_worm", replies: 41, date: "2026.03.19" },
    { title: "3월 오프라인 모임 참석 확인해주세요~", author: "badak_master", replies: 67, date: "2026.03.18" },
];

const categories = ["전체", "자유게시판", "질문/답변", "정보공유", "모임/행사", "취업/이직"];

export default function CommunityPage() {
    return (
        <div>
            <section className="py-12 px-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-6">커뮤니티</h1>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((cat, i) => (
                            <button
                                key={cat}
                                className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${i === 0
                                    ? "bg-neutral-900 text-white border-neutral-900"
                                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Thread List */}
                    <div className="border-t border-neutral-900">
                        {threads.map((thread, i) => (
                            <Link
                                key={i}
                                href="/bk/community"
                                className="flex items-center justify-between py-4 border-b border-neutral-100 group hover:bg-neutral-50 px-2 -mx-2 transition-colors"
                            >
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-neutral-900 group-hover:text-blue-600 transition-colors">
                                        {thread.title}
                                        <span className="text-blue-500 text-xs ml-2">[{thread.replies}]</span>
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                                        <span>{thread.author}</span>
                                        <span>{thread.date}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
