"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
    Palette, BarChart3, Megaphone, BookOpen, FileEdit,
    Bell, Calendar, ArrowRight,
    Users, TrendingUp, Target,
} from "lucide-react";

const quickLinks = [
    { name: "Studio", description: "콘텐츠 제작 포털", href: "/intra/studio", icon: Palette },
    { name: "ERP", description: "사내 관리 포털", href: "/intra/erp", icon: BarChart3 },
    { name: "Marketing", description: "마케팅 포털", href: "/intra/marketing", icon: Megaphone },
    { name: "Wiki", description: "교육/온보딩", href: "/intra/wiki", icon: BookOpen },
    { name: "CMS", description: "사이트 콘텐츠 관리", href: "/intra/cms", icon: FileEdit },
];

const notices = [
    { id: 1, title: "MADLeague 인사이트 투어링 참가자 모집", date: "2025-09-15", badge: "중요" },
    { id: 2, title: "Vrief 프레임워크 교육 일정 안내 (10월)", date: "2025-09-14", badge: "교육" },
    { id: 3, title: "LUKI 2nd Single 관련 콘텐츠 가이드라인", date: "2025-09-12", badge: "공지" },
    { id: 4, title: "Badak 밋업 10월 일정 확정", date: "2025-09-10", badge: "일정" },
    { id: 5, title: "GPR 3분기 자기 평가 마감 안내", date: "2025-09-08", badge: "HR" },
];

const schedule = [
    { id: 1, title: "주간 팀 회의", time: "10:00", date: "오늘", type: "회의" },
    { id: 2, title: "MADLeap 5기 정기 모임", time: "14:00", date: "오늘", type: "행사" },
    { id: 3, title: "CJ ENM 콜라보 미팅", time: "11:00", date: "내일", type: "미팅" },
    { id: 4, title: "콘텐츠 파이프라인 리뷰", time: "15:00", date: "내일", type: "리뷰" },
    { id: 5, title: "Badak 월간 밋업", time: "19:00", date: "9/25", type: "행사" },
];

const stats = [
    { label: "Active Staff", value: "3", icon: Users },
    { label: "Active Campaigns", value: "3", icon: Megaphone },
    { label: "Active Leads", value: "4", icon: TrendingUp },
    { label: "GPR Goals", value: "9", icon: Target },
];

export default function IntraPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">안녕하세요, {user?.name ?? 'User'}님</h1>
                <p className="mt-1 text-sm text-neutral-500">Ten:One™ Intra — 오늘도 본질에 집중합시다.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4 flex items-center gap-3">
                        <s.icon className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-xl font-bold">{s.value}</p>
                            <p className="text-xs text-neutral-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-5 gap-4">
                {quickLinks.map(link => (
                    <Link key={link.name} href={link.href}
                        className="group border border-neutral-200 bg-white p-5 hover:border-neutral-900 transition-all block">
                        <div className="flex items-start justify-between">
                            <link.icon className="h-5 w-5 text-neutral-400" />
                            <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-900 transition-colors" />
                        </div>
                        <h3 className="mt-3 text-sm font-semibold">{link.name}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">{link.description}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Notices */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">공지사항</h2>
                        </div>
                        <span className="text-xs text-neutral-400">전체보기</span>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {notices.map(notice => (
                            <li key={notice.id} className="px-6 py-3 hover:bg-neutral-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{notice.badge}</span>
                                    <span className="text-xs text-neutral-400">{notice.date}</span>
                                </div>
                                <p className="text-sm">{notice.title}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Schedule */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">일정</h2>
                        </div>
                        <span className="text-xs text-neutral-400">캘린더</span>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {schedule.map(event => (
                            <li key={event.id} className="px-6 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors">
                                <div className="text-right w-12">
                                    <p className="text-xs text-neutral-400">{event.date}</p>
                                    <p className="text-sm font-mono">{event.time}</p>
                                </div>
                                <div className="w-px h-8 bg-neutral-200" />
                                <div>
                                    <p className="text-sm">{event.title}</p>
                                    <p className="text-[10px] text-neutral-400">{event.type}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
