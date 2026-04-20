"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Home, Search, Bell, User, MoreHorizontal, ShoppingBag, LogOut, X, Briefcase, Image as ImageIcon, Settings, HelpCircle, Info } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import {
    getNotifications,
    getUnreadCount,
    markAllRead,
    type JakkaNotification,
} from "@/lib/supabase/jakka";

const sidebarItems = [
    { icon: Home, label: "홈", href: "/jakka" },
    { icon: Search, label: "작가 탐색", href: "/jakka/explore" },
    { icon: ImageIcon, label: "쇼케이스", href: "/jakka/showcase" },
    { icon: ShoppingBag, label: "마켓", href: "/jakka/market" },
    { icon: Briefcase, label: "WANTS", href: "/jakka/wants" },
    { icon: User, label: "내 포트폴리오", href: "/jakka/profile" },
];

const bottomNavItems = [
    { icon: Home, href: "/jakka" },
    { icon: Search, href: "/jakka/explore" },
    { icon: ImageIcon, href: "/jakka/showcase" },
    { icon: ShoppingBag, href: "/jakka/market" },
    { icon: Briefcase, href: "/jakka/wants" },
    { icon: User, href: "/jakka/profile" },
];

const footerBrandLinks = [
    { name: "Ten:One", href: "https://tenone.biz" },
    { name: "MADLeague", href: "/madleague" },
    { name: "Badak", href: "/badak" },
    { name: "RooK", href: "/rook" },
    { name: "Myverse", href: "/myverse" },
];

function AuthSection({ compact = false }: { compact?: boolean }) {
    const { isAuthenticated, user, logout } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginTab, setLoginTab] = useState<"login" | "signup">("login");

    if (isAuthenticated) {
        return (
            <>
                <div className={`flex items-center ${compact ? "gap-2 p-1" : "gap-3 p-3"}`}>
                    <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                        {user?.avatarUrl ? (
                            <Image src={user.avatarUrl} alt={user.name || ""} width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[12px] font-bold text-neutral-600">
                                {user?.name?.charAt(0) ?? "U"}
                            </div>
                        )}
                    </div>
                    {!compact && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-neutral-900 truncate">{user?.name}</p>
                            <p className="text-[11px] text-neutral-600 truncate">{user?.email}</p>
                        </div>
                    )}
                    <button onClick={() => logout()} className="p-1.5 text-neutral-500 hover:text-neutral-900 transition-colors">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
                <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} defaultTab={loginTab} />
            </>
        );
    }

    return (
        <>
            <div className={`flex ${compact ? "flex-col gap-1 px-2" : "flex-col gap-2 px-3"}`}>
                <button
                    onClick={() => { setLoginTab("login"); setLoginOpen(true); }}
                    className="w-full py-2 text-[12px] font-bold text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                >
                    로그인
                </button>
                {!compact && (
                    <button
                        onClick={() => { setLoginTab("signup"); setLoginOpen(true); }}
                        className="w-full py-2 text-[12px] font-bold text-neutral-900 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                    >
                        가입하기
                    </button>
                )}
            </div>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} defaultTab={loginTab} />
        </>
    );
}

function MobileAuthButton() {
    const { isAuthenticated, user, logout } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);

    if (isAuthenticated) {
        return (
            <button onClick={() => logout()} title="로그아웃" className="group">
                <div className="w-[28px] h-[28px] rounded-full bg-neutral-200 overflow-hidden border border-neutral-300 group-hover:border-neutral-500 transition-colors">
                    {user?.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="" width={28} height={28} className="object-cover w-full h-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-neutral-600">
                            {user?.name?.charAt(0) ?? "U"}
                        </div>
                    )}
                </div>
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setLoginOpen(true)}
                className="text-[12px] font-semibold border border-neutral-900 px-3 py-1 hover:bg-neutral-900 hover:text-white transition-colors"
            >
                로그인
            </button>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}

function NotificationSheet({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: string }) {
    const [notifs, setNotifs] = useState<JakkaNotification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        getNotifications(userId).then((data) => { setNotifs(data); setLoading(false); });
    }, [open, userId]);

    const handleMarkAll = useCallback(async () => {
        await markAllRead(userId);
        setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }, [userId]);

    const notifLabel = (n: JakkaNotification): string => {
        if (n.type === 'follow') return `${n.actor_name ?? '누군가'}님이 팔로우했습니다`;
        if (n.type === 'new_work') return `${n.actor_name ?? '팔로잉'}님이 새 작업을 올렸습니다${n.reference_title ? ` — ${n.reference_title}` : ''}`;
        if (n.type === 'dm') return `${n.actor_name ?? '누군가'}님의 메시지`;
        if (n.type === 'sale') return `작업이 판매되었습니다${n.reference_title ? ` — ${n.reference_title}` : ''}`;
        return '새 알림';
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[160] flex">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-[340px] bg-white h-full flex flex-col shadow-xl ml-auto">
                <div className="flex items-center justify-between px-4 h-[52px] border-b border-neutral-100 shrink-0">
                    <span className="text-[13px] font-bold text-neutral-900">알림</span>
                    <div className="flex items-center gap-3">
                        {notifs.some((n) => !n.is_read) && (
                            <button onClick={handleMarkAll} className="text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors">
                                모두 읽음
                            </button>
                        )}
                        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32 text-[13px] text-neutral-400">불러오는 중...</div>
                    ) : notifs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-2">
                            <Bell className="h-8 w-8 stroke-[1.5] text-neutral-200" />
                            <p className="text-[13px] text-neutral-400">새 알림이 없습니다</p>
                        </div>
                    ) : (
                        <ul>
                            {notifs.map((n) => (
                                <li key={n.id} className={`flex items-start gap-3 px-4 py-3.5 border-b border-neutral-50 ${n.is_read ? '' : 'bg-neutral-50'}`}>
                                    <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0 mt-0.5">
                                        {n.actor_avatar ? (
                                            <Image src={n.actor_avatar} alt="" width={32} height={32} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-neutral-500">
                                                {n.actor_name?.charAt(0) ?? '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] text-neutral-800 leading-snug">{notifLabel(n)}</p>
                                        {n.actor_handle && (
                                            <p className="text-[11px] text-neutral-400 mt-0.5">{n.actor_handle}</p>
                                        )}
                                        <p className="text-[11px] text-neutral-300 mt-0.5">
                                            {new Date(n.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0 mt-1.5" />}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[150] flex">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-[280px] bg-white h-full flex flex-col shadow-xl ml-auto">
                <div className="flex items-center justify-between px-4 h-[52px] border-b border-neutral-100">
                    <span className="text-[11px] font-semibold tracking-[0.3em]">MENU</span>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-5 border-b border-neutral-100">
                        <AuthSection />
                    </div>

                    <nav className="px-4 py-4 space-y-1 border-b border-neutral-100">
                        <Link href="/jakka/settings" onClick={onClose} className="flex items-center gap-3 py-2.5 text-[14px] text-neutral-700 hover:text-neutral-900">
                            <Settings className="h-4 w-4 stroke-[1.5] text-neutral-400" />
                            설정
                        </Link>
                        <Link href="/jakka/upload" onClick={onClose} className="flex items-center gap-3 py-2.5 text-[14px] text-neutral-700 hover:text-neutral-900">
                            <ImageIcon className="h-4 w-4 stroke-[1.5] text-neutral-400" />
                            작업 올리기
                        </Link>
                        <Link href="/jakka/wants/new" onClick={onClose} className="flex items-center gap-3 py-2.5 text-[14px] text-neutral-700 hover:text-neutral-900">
                            <Briefcase className="h-4 w-4 stroke-[1.5] text-neutral-400" />
                            공고 올리기
                        </Link>
                    </nav>

                    <nav className="px-4 py-4 space-y-1">
                        <Link href="/jakka/about" onClick={onClose} className="flex items-center gap-3 py-2.5 text-[14px] text-neutral-500 hover:text-neutral-700">
                            <Info className="h-4 w-4 stroke-[1.5] text-neutral-300" />
                            JAKKA 소개
                        </Link>
                        <Link href="/jakka/help" onClick={onClose} className="flex items-center gap-3 py-2.5 text-[14px] text-neutral-500 hover:text-neutral-700">
                            <HelpCircle className="h-4 w-4 stroke-[1.5] text-neutral-300" />
                            도움말
                        </Link>
                    </nav>
                </div>

                <div className="px-4 py-4 border-t border-neutral-100">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                        © JAKKA. Powered by{" "}
                        <a href="https://tenone.biz" className="hover:text-neutral-500 transition-colors">
                            Ten:One™ Universe
                        </a>.
                    </p>
                </div>

            </div>
        </div>
    );
}

export function JakkaInstaLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) { setUnreadCount(0); return; }
        getUnreadCount(user.id).then(setUnreadCount);
        const timer = setInterval(() => getUnreadCount(user.id!).then(setUnreadCount), 60_000);
        return () => clearInterval(timer);
    }, [isAuthenticated, user?.id]);

    const handleOpenNotif = useCallback(() => {
        setNotifOpen(true);
        setUnreadCount(0);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Top Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 md:hidden">
                <div className="flex items-center justify-between px-4 h-[44px]">
                    <Link href="/jakka" className="text-sm font-semibold tracking-[0.3em] text-neutral-900 border border-neutral-900 px-2.5 py-1">
                        JAKKA
                    </Link>
                    <div className="flex items-center gap-3">
                        <button onClick={handleOpenNotif} className="relative p-0.5">
                            <Bell className="h-[22px] w-[22px] stroke-[2] text-neutral-900" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-neutral-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <MobileAuthButton />
                        <button onClick={() => setMenuOpen(true)} className="p-0.5">
                            <MoreHorizontal className="h-[22px] w-[22px] stroke-[2] text-neutral-900" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

            {/* Notification Sheet */}
            {isAuthenticated && user?.id && (
                <NotificationSheet open={notifOpen} onClose={() => setNotifOpen(false)} userId={user.id} />
            )}

            {/* Desktop Left Sidebar */}
            <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-[72px] xl:w-[245px] border-r border-neutral-200 flex-col z-50 bg-white">
                <div className="px-3 xl:px-5 pt-7 pb-5">
                    <Link href="/jakka">
                        <span className="hidden xl:inline-block text-sm font-semibold tracking-[0.3em] text-neutral-900 border border-neutral-900 px-2.5 py-1">
                            JAKKA
                        </span>
                        <span className="xl:hidden inline-block text-[10px] font-semibold tracking-[0.2em] border border-neutral-900 px-1.5 py-0.5">JK</span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-neutral-100 ${isActive ? "font-bold" : ""}`}
                            >
                                <item.icon
                                    className={`h-[26px] w-[26px] shrink-0 transition-all ${isActive ? "stroke-[2.2] text-neutral-900" : "stroke-[1.5] text-neutral-600"}`}
                                />
                                <span className={`hidden xl:block text-[15px] ${isActive ? "font-semibold text-neutral-900" : "text-neutral-700"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Notification bell (desktop) */}
                <div className="px-3 pb-2">
                    <button
                        onClick={handleOpenNotif}
                        className="relative flex items-center gap-4 p-3 rounded-xl w-full hover:bg-neutral-100 transition-colors"
                    >
                        <div className="relative shrink-0">
                            <Bell className="h-[26px] w-[26px] stroke-[1.5] text-neutral-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-neutral-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <span className="hidden xl:block text-[15px] text-neutral-700">알림</span>
                    </button>
                </div>

                {/* Login / Profile */}
                <div className="px-0 xl:px-2 pb-3 border-t border-neutral-100 pt-3">
                    <div className="xl:block hidden">
                        <AuthSection />
                    </div>
                    <div className="xl:hidden flex justify-center">
                        <AuthSection compact />
                    </div>
                </div>

                {/* Copyright */}
                <div className="hidden xl:block px-5 pb-5">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                        © JAKKA. Powered by{" "}
                        <a href="https://tenone.biz" className="hover:text-neutral-500 transition-colors">
                            Ten:One™ Universe
                        </a>.
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pt-[44px] pb-[49px] md:pt-0 md:pb-0 md:ml-[72px] xl:ml-[245px]">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 md:hidden">
                <div className="flex items-center justify-around h-[49px]">
                    {bottomNavItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={i} href={item.href} className="relative flex flex-col items-center justify-center gap-1 p-2">
                                <item.icon
                                    className={`h-[24px] w-[24px] transition-all ${isActive ? "stroke-[2.2] text-neutral-900" : "stroke-[1.5] text-neutral-500"}`}
                                />
                                <span className={`h-[3px] w-[3px] rounded-full transition-colors ${isActive ? "bg-neutral-900" : "bg-transparent"}`} />
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
