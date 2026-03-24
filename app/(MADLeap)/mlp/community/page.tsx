"use client";

import { MessageSquare, Bell, Users, Calendar } from "lucide-react";
import Link from "next/link";

const boards = [
    { icon: Bell, title: "공지사항", desc: "매드립 운영 공지 및 중요 안내", count: 12 },
    { icon: MessageSquare, title: "자유게시판", desc: "리퍼들의 자유로운 소통 공간", count: 48 },
    { icon: Users, title: "팀 모집", desc: "프로젝트 팀원 모집 및 매칭", count: 8 },
    { icon: Calendar, title: "행사/이벤트", desc: "오프라인 모임, 세미나, 네트워킹 일정", count: 6 },
];

const recentPosts = [
    { title: "[공지] 2026년 상반기 5기 모집 안내", board: "공지사항", date: "2026.03.15", author: "운영진" },
    { title: "이번 주 토요일 홍대 네트워킹 같이 가실 분!", board: "자유게시판", date: "2026.03.22", author: "김리퍼" },
    { title: "[팀 모집] AI 마케팅 프로젝트 팀원 2명 구합니다", board: "팀 모집", date: "2026.03.20", author: "이매드" },
    { title: "3월 정기 세미나 후기 공유합니다", board: "자유게시판", date: "2026.03.18", author: "박도약" },
    { title: "[공지] 4기 포트폴리오 제출 안내", board: "공지사항", date: "2026.03.10", author: "운영진" },
];

export default function MadLeapCommunityPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-black text-white py-20 md:py-24">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">커뮤니티</h1>
                    <p className="text-neutral-400">리퍼들의 소통 공간</p>
                </div>
            </section>

            {/* Boards */}
            <section className="py-16">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-xl font-bold mb-8">게시판</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {boards.map((b) => (
                            <div key={b.title} className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                                <b.icon className="h-6 w-6 text-[#00B8FF] mb-3" />
                                <h3 className="font-bold mb-1">{b.title}</h3>
                                <p className="text-neutral-500 text-sm mb-3">{b.desc}</p>
                                <span className="text-xs text-neutral-400">{b.count}개 글</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Posts */}
            <section className="bg-neutral-50 py-16">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-xl font-bold mb-8">최근 게시글</h2>
                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                        {recentPosts.map((post, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors cursor-pointer"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs px-2 py-0.5 bg-[#00B8FF]/10 text-[#00B8FF] rounded font-medium">
                                            {post.board}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium truncate">{post.title}</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-4 text-xs text-neutral-400 shrink-0 ml-4">
                                    <span>{post.author}</span>
                                    <span>{post.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <p className="text-neutral-500 mb-4">매드립 멤버만 게시글을 작성할 수 있습니다</p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-3 bg-[#00B8FF] text-white font-medium hover:bg-[#0090CC] transition-colors rounded"
                    >
                        로그인하기
                    </Link>
                </div>
            </section>
        </>
    );
}
