"use client";

import Link from "next/link";
import { BookOpen, Compass, GraduationCap, FileText, HelpCircle, ClipboardList, Clock, Users, Star } from "lucide-react";

const sections = [
    {
        label: "온보딩 · 교육",
        desc: "새로 합류한 멤버를 위한 안내와 교육 자료",
        items: [
            { name: "Culture", desc: "Ten:One™ 비전, 가치, Principle 10", href: "/intra/wiki/culture", icon: BookOpen, updated: "2026-03-20" },
            { name: "Onboarding", desc: "Day 1 → Week 1 → Month 1 체크리스트", href: "/intra/wiki/onboarding", icon: Compass, updated: "2026-03-20" },
            { name: "Evolution School", desc: "VRIEF 프레임워크, GPR 목표관리 교육", href: "/intra/wiki/education", icon: GraduationCap, updated: "2026-03-20" },
            { name: "Handbook", desc: "근무, 휴가, 경비, 보안 정책", href: "/intra/wiki/handbook", icon: FileText, updated: "2026-03-20" },
            { name: "FAQ", desc: "자주 묻는 질문 모음", href: "/intra/wiki/faq", icon: HelpCircle, updated: "2026-03-20" },
        ],
    },
    {
        label: "지식 공유",
        desc: "구성원이 함께 만들어가는 업무 지식 베이스",
        items: [
            { name: "Library", desc: "템플릿, 레퍼런스, 가이드, 보고서 등 통합 지식 관리", href: "/intra/wiki/library", icon: BookOpen, updated: "2026-03-20" },
        ],
    },
];

const recentUpdates = [
    { title: "Culture: Vision House 섹션 업데이트", author: "Cheonil Jeon", date: "03-20", page: "Culture" },
    { title: "VRIEF Step 2 가설검증 예시 추가", author: "백강사", date: "03-19", page: "Evolution School" },
    { title: "경비처리 절차 변경 반영", author: "강회계", date: "03-18", page: "Handbook" },
    { title: "콘텐츠 제작 프로세스 가이드 신규", author: "김콘텐", date: "03-17", page: "Library" },
    { title: "리제로스 경쟁PT 제안서 양식 추가", author: "마리그", date: "03-16", page: "Library" },
];

export default function WikiHomePage() {
    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <h1 className="text-xl font-bold">Wiki</h1>
                <p className="text-sm text-neutral-500 mt-1">교육 · 안내 · 지식 공유</p>
            </div>

            {/* 최근 업데이트 */}
            <div className="border border-neutral-200 bg-white p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">최근 업데이트</span>
                </div>
                <div className="space-y-0">
                    {recentUpdates.map((u, i) => (
                        <div key={i} className="flex items-center gap-3 py-1.5 border-b border-neutral-50 last:border-0">
                            <span className="text-[11px] text-neutral-300 w-10 shrink-0">{u.date}</span>
                            <span className="text-xs flex-1 truncate">{u.title}</span>
                            <span className="text-[10px] text-neutral-300 shrink-0">{u.author}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded shrink-0">{u.page}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 섹션별 카드 */}
            {sections.map(section => (
                <div key={section.label} className="mb-6">
                    <div className="mb-3">
                        <h2 className="text-sm font-bold">{section.label}</h2>
                        <p className="text-xs text-neutral-400">{section.desc}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {section.items.map(item => (
                            <Link key={item.href} href={item.href}
                                className="border border-neutral-200 bg-white p-4 hover:border-neutral-400 transition-colors group">
                                <item.icon className="h-5 w-5 text-neutral-300 group-hover:text-neutral-500 mb-2 transition-colors" />
                                <h3 className="text-xs font-medium mb-1">{item.name}</h3>
                                <p className="text-[11px] text-neutral-400 leading-relaxed">{item.desc}</p>
                                <p className="text-[10px] text-neutral-300 mt-2">업데이트: {item.updated}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
