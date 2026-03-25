"use client";

import Link from "next/link";

const mainMenu = [
    { name: "New York", href: "/fw/category/newyork" },
    { name: "Paris", href: "/fw/category/paris" },
    { name: "London", href: "/fw/category/london" },
    { name: "Milan", href: "/fw/category/milan" },
    { name: "Seoul", href: "/fw/category/seoul" },
    { name: "About FWN", href: "/fw/about" },
];

const universeLinks = [
    { name: "TenOne.biz", href: "https://tenone.biz" },
    { name: "Badak.biz", href: "https://badak.biz" },
    { name: "MADLeague.net", href: "https://madleague.net" },
    { name: "YouInOne.com", href: "https://youinone.com" },
];

export function FWNFooter() {
    return (
        <footer className="bg-[#1a1a1a] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* 브랜드 */}
                    <div>
                        <div className="mb-4">
                            <span className="text-white text-2xl font-bold">FWN</span>
                            <p className="text-sm mt-1">Fashion Week Network</p>
                        </div>
                        <p className="text-sm leading-relaxed">
                            The World is on the Runway.<br />
                            전 세계 패션 위크를 네트워크로 연결합니다.
                        </p>
                    </div>

                    {/* 메인 메뉴 */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Main Menu</h3>
                        <div className="space-y-2">
                            {mainMenu.map((item) => (
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

                    {/* Contact */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Contact</h3>
                        <p className="text-sm mb-4">tenone.biz/contact</p>
                        <h3 className="text-white text-sm font-semibold mb-2">Ten:One Universe</h3>
                        <div className="space-y-1">
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

                <div className="mt-10 pt-6 border-t border-neutral-800 text-center text-xs">
                    &copy; FWN. Powered by{" "}
                    <a href="https://tenone.biz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        Ten:One&trade; Universe
                    </a>
                    .
                </div>
            </div>
        </footer>
    );
}
