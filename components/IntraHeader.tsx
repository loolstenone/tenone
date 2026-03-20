"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Search, Bell, LogOut, ChevronDown, User, Users, Target, CalendarCheck, CreditCard, Wallet } from "lucide-react";

const days = ["일", "월", "화", "수", "목", "금", "토"];

function formatToday() {
    const d = new Date();
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function IntraHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");

    if (!user) return null;

    return (
        <header className="h-12 border-b border-neutral-100 bg-white flex items-center justify-between px-6 shrink-0">
            {/* Left: quick links + date */}
            <div className="flex items-center gap-2">
                <Link href="/intra/profile"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-neutral-200 rounded hover:border-neutral-400 text-neutral-600 hover:text-neutral-900 transition-colors">
                    <User className="h-3 w-3" /> Myverse
                </Link>
                <Link href="/intra/erp/hr/people/org"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-neutral-200 rounded hover:border-neutral-400 text-neutral-600 hover:text-neutral-900 transition-colors">
                    <Users className="h-3 w-3" /> 조직도
                </Link>
                <span className="text-xs text-neutral-400 ml-2">{formatToday()}</span>
            </div>

            {/* Right: search, notifications, profile */}
            <div className="flex items-center gap-1">
                {/* Search */}
                <div className="relative">
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded hover:bg-neutral-50"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                    {searchOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-neutral-200 shadow-lg p-2 w-72">
                                <input
                                    autoFocus
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="검색..."
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400"
                                />
                                <p className="text-[10px] text-neutral-300 mt-1.5 px-1">프로젝트, 구성원, 문서를 검색합니다</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded hover:bg-neutral-50 relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full" />
                    </button>
                </div>

                {/* Divider */}
                <div className="h-5 w-px bg-neutral-200 mx-2" />

                {/* Profile dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-50 transition-colors"
                    >
                        <div className="h-7 w-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-medium">
                            {user.avatarInitials}
                        </div>
                        <span className="text-xs text-neutral-600 hidden lg:block">{user.name}</span>
                        <ChevronDown className="h-3 w-3 text-neutral-400 hidden lg:block" />
                    </button>

                    {profileOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-neutral-200 shadow-lg w-56">
                                <div className="px-4 py-3 border-b border-neutral-100">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">{user.email}</p>
                                    <p className="text-[10px] text-neutral-400">{user.role}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        href="/intra/profile"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
                                    >
                                        <User className="h-3.5 w-3.5" /> Myverse
                                    </Link>
                                    <Link
                                        href="/intra/erp/hr/gpr"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
                                    >
                                        <Target className="h-3.5 w-3.5" /> GPR
                                    </Link>
                                    <Link
                                        href="/intra/erp/hr/attendance"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
                                    >
                                        <CalendarCheck className="h-3.5 w-3.5" /> 근태/복리후생
                                    </Link>
                                    <Link
                                        href="/intra/erp/hr/payroll"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
                                    >
                                        <Wallet className="h-3.5 w-3.5" /> 급여 조회
                                    </Link>
                                    <Link
                                        href="/intra/erp/finance/expenses"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
                                    >
                                        <CreditCard className="h-3.5 w-3.5" /> 경비 청구
                                    </Link>
                                </div>
                                <div className="border-t border-neutral-100 py-1">
                                    <button
                                        onClick={() => { logout(); router.push('/'); }}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-400 hover:text-red-600 hover:bg-neutral-50 transition-colors w-full"
                                    >
                                        <LogOut className="h-3.5 w-3.5" /> 로그아웃
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
