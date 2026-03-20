"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Bell, MessageSquare, Calendar, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

const recentNotices = [
    { id: 1, title: "2026년 1분기 GPR 자기 평가 마감 안내", date: "2026-03-15", badge: "HR" },
    { id: 2, title: "MADLeague 인사이트 투어링 참가자 모집", date: "2026-03-10", badge: "중요" },
    { id: 3, title: "Vrief 프레임워크 교육 일정 안내 (4월)", date: "2026-03-08", badge: "교육" },
];

const recentFree = [
    { id: 1, title: "LUKI 2nd Single 어떻게 생각하세요?", author: "Sarah Kim", date: "2026-03-18", comments: 2 },
    { id: 2, title: "금요일 점심 같이 드실 분", author: "김준호", date: "2026-03-19", comments: 0 },
];

const upcomingEvents = [
    { id: 1, title: "주간 팀 회의", time: "10:00", date: "오늘", type: "회의" },
    { id: 2, title: "MADLeap 5기 정기 모임", time: "14:00", date: "오늘", type: "행사" },
    { id: 3, title: "CJ ENM 콜라보 미팅", time: "11:00", date: "내일", type: "미팅" },
    { id: 4, title: "콘텐츠 파이프라인 리뷰", time: "15:00", date: "내일", type: "리뷰" },
];

const wikiLinks = [
    { name: "Culture", desc: "Core Value & Principle 10", href: "/intra/comm/wiki/culture" },
    { name: "Onboarding", desc: "신규 입사자 가이드", href: "/intra/comm/wiki/onboarding" },
    { name: "Education", desc: "교육 프로그램", href: "/intra/comm/wiki/education" },
    { name: "Handbook", desc: "업무 매뉴얼", href: "/intra/comm/wiki/handbook" },
    { name: "FAQ", desc: "자주 묻는 질문", href: "/intra/comm/wiki/faq" },
];

export default function CommPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">커뮤니케이션</h1>
                <p className="text-sm text-neutral-500 mt-1">사내 소통 · 공지 · 일정 · 지식경영</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* 공지사항 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">공지사항</h2>
                        </div>
                        <Link href="/intra/comm/notice" className="text-xs text-neutral-400 hover:text-neutral-900 flex items-center gap-1">
                            전체보기 <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {recentNotices.map(n => (
                            <li key={n.id} className="px-6 py-3 hover:bg-neutral-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{n.badge}</span>
                                    <span className="text-xs text-neutral-400">{n.date}</span>
                                </div>
                                <p className="text-sm">{n.title}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 사내 일정 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">사내 일정</h2>
                        </div>
                        <Link href="/intra/comm/calendar" className="text-xs text-neutral-400 hover:text-neutral-900 flex items-center gap-1">
                            캘린더 <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {upcomingEvents.map(ev => (
                            <li key={ev.id} className="px-6 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors">
                                <div className="text-right w-12">
                                    <p className="text-xs text-neutral-400">{ev.date}</p>
                                    <p className="text-sm font-mono">{ev.time}</p>
                                </div>
                                <div className="w-px h-8 bg-neutral-200" />
                                <div>
                                    <p className="text-sm">{ev.title}</p>
                                    <p className="text-[10px] text-neutral-400">{ev.type}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 자유게시판 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">자유게시판</h2>
                        </div>
                        <Link href="/intra/comm/free" className="text-xs text-neutral-400 hover:text-neutral-900 flex items-center gap-1">
                            전체보기 <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {recentFree.map(p => (
                            <li key={p.id} className="px-6 py-3 hover:bg-neutral-50 cursor-pointer transition-colors">
                                <p className="text-sm mb-1">{p.title}</p>
                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                    <span>{p.author}</span>
                                    <span>{p.date}</span>
                                    {p.comments > 0 && (
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" /> {p.comments}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 지식경영 (Wiki) */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-neutral-400" />
                        <h2 className="text-sm font-semibold">지식경영</h2>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {wikiLinks.map(w => (
                            <li key={w.name}>
                                <Link href={w.href} className="px-6 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium">{w.name}</p>
                                        <p className="text-xs text-neutral-400">{w.desc}</p>
                                    </div>
                                    <ArrowRight className="h-3.5 w-3.5 text-neutral-300" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
