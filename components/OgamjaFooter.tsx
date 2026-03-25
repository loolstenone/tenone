"use client";

import Link from "next/link";

const footerNav = [
    { name: "About Ogamja", href: "/about" },
    { name: "필찐감자", href: "/writers" },
    { name: "프로그램", href: "/programs" },
];

const universeLinks = [
    { name: "TenOne.biz", href: "https://tenone.biz" },
    { name: "YouInOne.com", href: "https://youinone.com" },
    { name: "Badak.biz", href: "https://badak.biz" },
    { name: "MADLeague.net", href: "https://madleague.net" },
    { name: "RooK.co.kr", href: "https://rook.co.kr" },
];

export function OgamjaFooter() {
    return (
        <footer className="bg-[#2D2D2D] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* 브랜드 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl md:text-4xl">🥔</span>
                            <span className="text-white text-xl font-bold">공감자</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            하찮고 귀여운 감자들의 공감 이야기.<br />
                            감자처럼 소소하지만 따뜻한 일상을 나눕니다.
                        </p>
                    </div>

                    {/* 메인 메뉴 */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Main Menu</h3>
                        <div className="space-y-2">
                            {footerNav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block text-sm hover:text-white transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Universe */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Universe</h3>
                        <div className="space-y-2">
                            {universeLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm hover:text-white transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-700 text-center text-xs">
                    &copy; 0gamja. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors underline">Ten:One&trade; Universe</a>.
                    <a
                        href="https://tenone.biz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                    >
                        Ten:One&trade; Universe
                    </a>
                    .
                </div>
            </div>
        </footer>
    );
}
