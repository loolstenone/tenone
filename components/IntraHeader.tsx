"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PortalIcon } from "@/components/icons/PortalIcon";
import {
    Search, Bell, LogOut, ChevronDown, User, Users, Target, CalendarCheck,
    CreditCard, Wallet, Star, Plus, X, MessageSquareText, ListTodo, Stamp,
    FolderKanban, GripVertical, Home
} from "lucide-react";

const days = ["일", "월", "화", "수", "목", "금", "토"];

function formatToday() {
    const d = new Date();
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

// 즐겨찾기 기본값
const defaultFavorites = [
    { id: 'myverse', label: 'Myverse', href: '/intra/myverse', icon: 'User' },
    { id: 'org', label: '조직도', href: '/intra/erp/hr/people/org', icon: 'Users' },
];

// 즐겨찾기 추가 가능한 메뉴 (staffOnly: 직원만 표시)
const availableBookmarks = [
    { id: 'myverse', label: 'Myverse', href: '/intra/myverse', icon: 'User', staffOnly: false },
    { id: 'org', label: '조직도', href: '/intra/erp/hr/people/org', icon: 'Users', staffOnly: true },
    { id: 'messenger', label: '메신저', href: '/intra/myverse/messenger', icon: 'MessageSquareText', staffOnly: false },
    { id: 'todo', label: 'Todo', href: '/intra/myverse/todo', icon: 'ListTodo', staffOnly: false },
    { id: 'gpr', label: '내 GPR', href: '/intra/myverse/gpr', icon: 'Target', staffOnly: true },
    { id: 'approval', label: '내 결재', href: '/intra/myverse/approval', icon: 'Stamp', staffOnly: true },
    { id: 'project', label: '프로젝트', href: '/intra/project/management', icon: 'FolderKanban', staffOnly: true },
    { id: 'attendance', label: '내 근태', href: '/intra/myverse/attendance', icon: 'CalendarCheck', staffOnly: true },
    { id: 'payroll', label: '내 급여', href: '/intra/myverse/payroll', icon: 'Wallet', staffOnly: true },
    { id: 'expenses', label: '내 경비', href: '/intra/myverse/expenses', icon: 'CreditCard', staffOnly: true },
    { id: 'hero', label: 'HeRo', href: '/intra/hero/hit', icon: 'Target', staffOnly: false },
    { id: 'education', label: 'Evolution School', href: '/intra/evolution-school', icon: 'User', staffOnly: false },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    User, Users, MessageSquareText, ListTodo, Target, Stamp, FolderKanban, CalendarCheck, Wallet, CreditCard,
};

const FAVORITES_KEY = 'tenone_header_favorites';

export function IntraHeader() {
    const { user, isStaff, logout } = useAuth();
    const router = useRouter();
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [favoritesEditOpen, setFavoritesEditOpen] = useState(false);
    const [favorites, setFavorites] = useState(defaultFavorites);

    // localStorage에서 즐겨찾기 로드
    useEffect(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) setFavorites(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    const saveFavorites = (newFavs: typeof defaultFavorites) => {
        setFavorites(newFavs);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
    };

    const toggleFavorite = (item: typeof availableBookmarks[0]) => {
        const exists = favorites.some(f => f.id === item.id);
        if (exists) {
            saveFavorites(favorites.filter(f => f.id !== item.id));
        } else {
            saveFavorites([...favorites, item]);
        }
    };

    if (!user) return null;

    return (
        <header className="h-12 border-b border-neutral-100 bg-white flex items-center justify-between px-3 pl-14 lg:pl-6 lg:px-6 shrink-0">
            {/* Left: 즐겨찾기 바 */}
            <div className="hidden sm:flex items-center gap-1.5">
                {favorites.filter(fav => {
                    const bm = availableBookmarks.find(b => b.id === fav.id);
                    return !bm?.staffOnly || isStaff;
                }).map(fav => {
                    const IconComp = iconMap[fav.icon] || Star;
                    return (
                        <Link key={fav.id} href={fav.href}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] border border-neutral-200 rounded hover:border-neutral-400 text-neutral-600 hover:text-neutral-900 transition-colors">
                            <IconComp className="h-3 w-3" />
                            <span className="hidden sm:inline">{fav.label}</span>
                        </Link>
                    );
                })}

                {/* 즐겨찾기 편집 버튼 */}
                <div className="relative">
                    <button onClick={() => setFavoritesEditOpen(!favoritesEditOpen)}
                        className="flex items-center justify-center h-6 w-6 border border-dashed border-neutral-200 rounded hover:border-neutral-400 text-neutral-300 hover:text-neutral-600 transition-colors"
                        title="즐겨찾기 편집">
                        {favoritesEditOpen ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </button>

                    {favoritesEditOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setFavoritesEditOpen(false)} />
                            <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-neutral-200 shadow-lg rounded-lg w-56 py-1">
                                <p className="px-3 py-1.5 text-[9px] text-neutral-400 uppercase tracking-wider">즐겨찾기 편집</p>
                                {availableBookmarks.filter(item => !item.staffOnly || isStaff).map(item => {
                                    const isActive = favorites.some(f => f.id === item.id);
                                    const IconComp = iconMap[item.icon] || Star;
                                    return (
                                        <button key={item.id} onClick={() => toggleFavorite(item)}
                                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-neutral-50 transition-colors">
                                            <Star className={`h-3 w-3 ${isActive ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                                            <IconComp className="h-3 w-3 text-neutral-400" />
                                            <span className="text-[11px] text-neutral-600 flex-1">{item.label}</span>
                                            {isActive && <span className="text-[8px] text-amber-500">추가됨</span>}
                                        </button>
                                    );
                                })}
                                <div className="border-t border-neutral-100 mt-1 pt-1 px-3 py-1">
                                    <button onClick={() => { saveFavorites(defaultFavorites); setFavoritesEditOpen(false); }}
                                        className="text-[9px] text-neutral-400 hover:text-neutral-600">기본값 복원</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <span className="text-[10px] text-neutral-300 ml-2">{formatToday()}</span>
            </div>
            {/* Mobile: 날짜만 표시 */}
            <div className="sm:hidden flex items-center">
                <span className="text-[10px] text-neutral-400">{formatToday()}</span>
            </div>

            {/* Right: search, notifications, logout, avatar, portal */}
            <div className="flex items-center gap-1">
                {/* Search */}
                <div className="relative">
                    <button onClick={() => setSearchOpen(!searchOpen)}
                        className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded hover:bg-neutral-50">
                        <Search className="h-4 w-4" />
                    </button>
                    {searchOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-neutral-200 shadow-lg p-2 w-72">
                                <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="검색..." className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                                <p className="text-[10px] text-neutral-300 mt-1.5 px-1">프로젝트, 구성원, 문서를 검색합니다</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Notifications */}
                <button className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded hover:bg-neutral-50 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full" />
                </button>

                <div className="h-5 w-px bg-neutral-200 mx-2" />

                {/* Avatar dropdown */}
                <div className="relative">
                    <button onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-50 transition-colors">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{
                                background: "radial-gradient(circle at 35% 35%, #555 0%, #222 60%, #111 100%)",
                                color: "#fff",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.3), inset 0 -2px 3px rgba(0,0,0,0.2)",
                            }}>
                            {user.avatarInitials}
                        </div>
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
                                    <Link href="/intra/myverse" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                                        <User className="h-3.5 w-3.5" /> Myverse
                                    </Link>
                                    <Link href="/intra/myverse/messenger" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                                        <MessageSquareText className="h-3.5 w-3.5" /> 메신저
                                    </Link>
                                    <Link href="/intra/myverse/todo" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                                        <ListTodo className="h-3.5 w-3.5" /> Todo
                                    </Link>
                                    {isStaff && (<>
                                    <Link href="/intra/myverse/gpr" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                                        <Target className="h-3.5 w-3.5" /> GPR
                                    </Link>
                                    <Link href="/intra/myverse/approval" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                                        <Stamp className="h-3.5 w-3.5" /> 전자결재
                                    </Link>
                                    <Link href="/intra/myverse/attendance" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                                        <CalendarCheck className="h-3.5 w-3.5" /> 근태
                                    </Link>
                                    <Link href="/intra/myverse/payroll" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                                        <Wallet className="h-3.5 w-3.5" /> 급여
                                    </Link>
                                    <Link href="/intra/myverse/expenses" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                                        <CreditCard className="h-3.5 w-3.5" /> 경비
                                    </Link>
                                    </>)}
                                </div>
                                <div className="border-t border-neutral-100 py-1">
                                    <button onClick={() => { setProfileOpen(false); logout(); router.push('/'); }}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-400 hover:text-red-600 hover:bg-neutral-50 transition-colors w-full">
                                        <LogOut className="h-3.5 w-3.5" /> Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 로그아웃 */}
                <button onClick={() => { logout(); router.push('/'); }}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded hover:bg-neutral-50" title="로그아웃">
                    <LogOut className="h-4 w-4" />
                </button>

                {/* 퍼블릭 사이트로 나가기 */}
                <Link href="/" className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded hover:bg-neutral-50" title="퍼블릭 사이트로 나가기">
                    <PortalIcon direction="exit" size={36} />
                </Link>
            </div>
        </header>
    );
}
