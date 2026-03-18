"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
    Palette, BarChart3, Megaphone, BookOpen,
    Bell, Calendar, MessageSquare, ArrowRight,
    Users, TrendingUp, FileText, Target,
} from "lucide-react";

const quickLinks = [
    { name: "Studio", description: "콘텐츠 제작 포털", href: "/intra/studio", icon: Palette, color: "text-purple-400 bg-purple-500/10" },
    { name: "ERP", description: "사내 관리 포털", href: "/intra/erp", icon: BarChart3, color: "text-blue-400 bg-blue-500/10" },
    { name: "Marketing", description: "마케팅 포털", href: "/intra/marketing", icon: Megaphone, color: "text-amber-400 bg-amber-500/10" },
    { name: "Wiki", description: "교육/온보딩", href: "/intra/wiki", icon: BookOpen, color: "text-emerald-400 bg-emerald-500/10" },
];

const notices = [
    { id: 1, title: "MADLeague 인사이트 투어링 참가자 모집", date: "2025-09-15", badge: "중요", badgeColor: "bg-red-500/10 text-red-400" },
    { id: 2, title: "Vrief 프레임워크 교육 일정 안내 (10월)", date: "2025-09-14", badge: "교육", badgeColor: "bg-blue-500/10 text-blue-400" },
    { id: 3, title: "LUKI 2nd Single 관련 콘텐츠 가이드라인", date: "2025-09-12", badge: "공지", badgeColor: "bg-zinc-800 text-zinc-400" },
    { id: 4, title: "Badak 밋업 10월 일정 확정", date: "2025-09-10", badge: "일정", badgeColor: "bg-emerald-500/10 text-emerald-400" },
    { id: 5, title: "GPR 3분기 자기 평가 마감 안내", date: "2025-09-08", badge: "HR", badgeColor: "bg-purple-500/10 text-purple-400" },
];

const schedule = [
    { id: 1, title: "주간 팀 회의", time: "10:00", date: "오늘", type: "회의" },
    { id: 2, title: "MADLeap 5기 정기 모임", time: "14:00", date: "오늘", type: "행사" },
    { id: 3, title: "CJ ENM 콜라보 미팅", time: "11:00", date: "내일", type: "미팅" },
    { id: 4, title: "콘텐츠 파이프라인 리뷰", time: "15:00", date: "내일", type: "리뷰" },
    { id: 5, title: "Badak 월간 밋업", time: "19:00", date: "9/25", type: "행사" },
];

const stats = [
    { label: "Active Staff", value: "3", icon: Users, color: "text-indigo-400" },
    { label: "Active Campaigns", value: "3", icon: Megaphone, color: "text-amber-400" },
    { label: "Active Leads", value: "4", icon: TrendingUp, color: "text-emerald-400" },
    { label: "GPR Goals", value: "9", icon: Target, color: "text-purple-400" },
];

export default function IntraPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    안녕하세요, {user?.name ?? 'User'}님
                </h1>
                <p className="mt-2 text-zinc-400">Ten:One™ Intra — 오늘도 본질에 집중합시다.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center gap-3">
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                        <div>
                            <p className="text-xl font-bold text-white">{s.value}</p>
                            <p className="text-xs text-zinc-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-4 gap-4">
                {quickLinks.map(link => {
                    const cardClass = "group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-indigo-500/50 transition-all block";
                    const content = (
                        <>
                            <div className="flex items-start justify-between">
                                <div className={`rounded-lg p-2.5 ${link.color.split(' ')[1]}`}>
                                    <link.icon className={`h-5 w-5 ${link.color.split(' ')[0]}`} />
                                </div>
                                <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold text-white">{link.name}</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">{link.description}</p>
                        </>
                    );
                    return false ? (
                        <a key={link.name} href={link.href} className={cardClass}>{content}</a>
                    ) : (
                        <Link key={link.name} href={link.href} className={cardClass}>{content}</Link>
                    );
                })}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Notices */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                    <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-amber-400" />
                            <h2 className="text-sm font-semibold text-white">공지사항</h2>
                        </div>
                        <span className="text-xs text-zinc-600">전체보기</span>
                    </div>
                    <ul className="divide-y divide-zinc-800/50">
                        {notices.map(notice => (
                            <li key={notice.id} className="px-6 py-3 hover:bg-zinc-900/50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${notice.badgeColor}`}>{notice.badge}</span>
                                    <span className="text-xs text-zinc-600">{notice.date}</span>
                                </div>
                                <p className="text-sm text-white">{notice.title}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Schedule */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                    <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <h2 className="text-sm font-semibold text-white">일정</h2>
                        </div>
                        <span className="text-xs text-zinc-600">캘린더</span>
                    </div>
                    <ul className="divide-y divide-zinc-800/50">
                        {schedule.map(event => (
                            <li key={event.id} className="px-6 py-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="text-right w-12">
                                        <p className="text-xs text-zinc-500">{event.date}</p>
                                        <p className="text-sm font-mono text-white">{event.time}</p>
                                    </div>
                                    <div className="w-px h-8 bg-zinc-800" />
                                    <div>
                                        <p className="text-sm text-white">{event.title}</p>
                                        <p className="text-[10px] text-zinc-600">{event.type}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
