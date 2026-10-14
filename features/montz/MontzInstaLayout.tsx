"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, Megaphone, User, X, MoreHorizontal, Info, Mail, PlusSquare, Share2 } from "lucide-react";
import NewsletterModal from "@/components/newsletter/NewsletterModal";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell, LogoutButton } from "@/components/AccountControls";
import { LoginModal } from "@/components/LoginModal";
import { AccountMenu } from "@/components/AccountMenu";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { shareCurrentPage } from "@/lib/share-page";
import { getCreatorByUserId } from "@/lib/supabase/montz";

type NavItem = { icon: typeof Home; label: string; href: string };

const baseSidebarItems: NavItem[] = [
    { icon: Home, label: "홈", href: "/montz" },
    { icon: Search, label: "탐색", href: "/montz/explore" },
    { icon: Megaphone, label: "오디션", href: "/montz/audition" },
    { icon: User, label: "내 프로필", href: "/montz/profile" },
];

const UPLOAD_ITEM: NavItem = { icon: PlusSquare, label: "업로드", href: "/montz/upload" };

const GOLD = "#c8a97e";

function AuthSection({ compact = false, placement = "up-left" }: { compact?: boolean; placement?: "up-left" | "down-left" }) {
    const { isAuthenticated, user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginTab, setLoginTab] = useState<"login" | "signup">("login");

    if (isAuthenticated) {
        return (
            <>
                <div className={`flex items-center ${compact ? "gap-2 p-1" : "gap-3 p-3"}`}>
                    {/* 아바타 → 계정 메뉴 (유틸리티바 표준 §1.9.2 — 피드형은 사이드바에 같은 부품) */}
                    <span className="shrink-0 text-neutral-700">
                        <AccountMenu profilePath="/montz/profile" siteId="montz" placement={placement} />
                    </span>
                    {!compact && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-neutral-900 truncate">{user?.name}</p>
                            <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                        </div>
                    )}
                    {/* 알림 · 로그아웃 — 전 유니버스 공통 부품 */}
                    <span className="flex items-center gap-3 text-neutral-700">
                        <NotificationBell align="left" />
                        <LogoutButton />
                    </span>
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

function ShareRow() {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={async () => { if ((await shareCurrentPage()) === "copied") { setCopied(true); setTimeout(() => setCopied(false), 2000); } }}
            className="w-full flex items-center gap-3 py-2.5 text-[14px] text-neutral-500 hover:text-neutral-700"
        >
            <Share2 className="h-4 w-4 stroke-[1.5] text-neutral-300" />
            {copied ? "링크 복사됨" : "공유"}
        </button>
    );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [newsletterOpen, setNewsletterOpen] = useState(false);
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
                        <AuthSection placement="down-left" />
                    </div>

                    <nav className="px-4 py-4 space-y-1 border-b border-neutral-100">
                        <button
                            onClick={() => setNewsletterOpen(true)}
                            className="w-full flex items-center gap-3 py-2.5 text-[14px] text-neutral-700 hover:text-neutral-900"
                        >
                            <Mail className="h-4 w-4 stroke-[1.5] text-neutral-400" />
                            뉴스레터 구독
                        </button>
                    </nav>

                    <nav className="px-4 py-4 space-y-1">
                        <Link href="/montz/about" onClick={onClose} className="flex items-center gap-3 py-2.5 text-[14px] text-neutral-500 hover:text-neutral-700">
                            <Info className="h-4 w-4 stroke-[1.5] text-neutral-300" />
                            MoNTZ 소개
                        </Link>
                        <ShareRow />
                    </nav>
                </div>

                <div className="px-4 py-4 border-t border-neutral-100">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                        © MoNTZ. Powered by{" "}
                        <a href="https://tenone.biz" className="hover:text-neutral-500 transition-colors">
                            Ten:One™ Universe
                        </a>.
                    </p>
                </div>
            </div>
            <NewsletterModal
                isOpen={newsletterOpen}
                onClose={() => setNewsletterOpen(false)}
                source="montz"
                brandName="MoNTZ"
                accentColor="#c8a97e"
            />
        </div>
    );
}

export function MontzInstaLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isCreator, setIsCreator] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            setIsCreator(false);
            return;
        }
        let cancelled = false;
        getCreatorByUserId(user.id).then((c) => {
            if (!cancelled) setIsCreator(!!c);
        });
        return () => { cancelled = true; };
    }, [isAuthenticated, user?.id]);

    // 크리에이터일 때 "오디션"과 "내 프로필" 사이에 업로드 진입점 삽입
    const sidebarItems: NavItem[] = isCreator
        ? [...baseSidebarItems.slice(0, 3), UPLOAD_ITEM, ...baseSidebarItems.slice(3)]
        : baseSidebarItems;

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Top Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 md:hidden">
                <div className="flex items-center justify-between px-4 h-[44px]">
                    <Link href="/montz" className="text-[24px] font-black tracking-tight text-neutral-900">
                        M<span style={{ color: "#FFC000" }}>o</span>NTZ
                    </Link>
                    <div className="flex items-center gap-3">
                        {/* 유틸리티바 모바일 — 검색 · 알림 · 계정 메뉴 시트 | 로그인 (§1.9.2 피드형) */}
                        <UniverseUtilityBar breakpoint="md" hideAbout aboutPath="/montz/about" profilePath="/montz/profile" accentColor="#c8a97e" siteId="montz" siteName="MoNTZ" />
                        <button onClick={() => setMenuOpen(true)} className="p-0.5">
                            <MoreHorizontal className="h-[22px] w-[22px] stroke-[2] text-neutral-900" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

            {/* Desktop Left Sidebar */}
            <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-[72px] xl:w-[245px] border-r border-neutral-200 flex-col z-50 bg-white">
                <div className="px-3 xl:px-5 pt-7 pb-5">
                    <Link href="/montz">
                        <span className="hidden xl:inline-block text-[20px] font-black tracking-tight text-neutral-900">
                            M<span style={{ color: "#FFC000" }}>o</span>NTZ
                        </span>
                        <span className="xl:hidden text-[16px] font-black tracking-tight text-neutral-900">
                            M<span style={{ color: "#FFC000" }}>o</span>NTZ
                        </span>
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
                                    className={`h-[26px] w-[26px] shrink-0 transition-all ${isActive ? "stroke-[2.2] text-neutral-900" : "stroke-[1.5] text-neutral-500"}`}
                                />
                                <span className={`hidden xl:block text-[15px] ${isActive ? "font-semibold text-neutral-900" : "text-neutral-700"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* 사이트 도구 — 유틸리티바 About·공유·검색 (계정은 아래 AuthSection: 계정 메뉴·로그아웃) */}
                <div className="px-3 xl:px-5 pb-3 flex justify-center xl:justify-start text-neutral-600">
                    <span className="hidden xl:block"><UniverseUtilityBar hideAuth aboutPath="/montz/about" siteId="montz" siteName="MoNTZ" /></span>
                    <span className="xl:hidden"><UniverseUtilityBar hideAuth hideAbout aboutPath="/montz/about" siteId="montz" siteName="MoNTZ" /></span>
                </div>
                <div className="px-0 xl:px-2 pb-3 border-t border-neutral-100 pt-3">
                    <div className="xl:block hidden">
                        <AuthSection />
                    </div>
                    <div className="xl:hidden flex justify-center">
                        <AuthSection compact />
                    </div>
                </div>

                <div className="hidden xl:block px-5 pb-5">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                        © MoNTZ. Powered by{" "}
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
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isUpload = item.href === "/montz/upload";
                        return (
                            <Link key={item.href} href={item.href} aria-label={item.label} className="relative flex flex-col items-center justify-center gap-1 p-2">
                                <item.icon
                                    className={`h-[24px] w-[24px] transition-all ${
                                        isUpload
                                            ? `stroke-[2] ${isActive ? "text-neutral-900" : "text-[#c8a97e]"}`
                                            : isActive
                                                ? "stroke-[2.2] text-neutral-900"
                                                : "stroke-[1.5] text-neutral-500"
                                    }`}
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
