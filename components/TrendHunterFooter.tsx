"use client";

import Link from "next/link";
import { TrendHunterLogo } from "@/components/TrendHunterLogo";

const menuLinks = [
    { name: "Weekly", href: "/trendhunter/weekly" },
    { name: "Signals", href: "/trendhunter/signals" },
    { name: "References", href: "/trendhunter/references" },
    { name: "About", href: "/trendhunter/about" },
];

const universeLinks = [
    { name: "TenOne.biz", href: "https://tenone.biz" },
    { name: "Badak.biz", href: "https://badak.biz" },
    { name: "MADLeague.net", href: "https://madleague.net" },
    { name: "YouInOne.com", href: "https://youinone.com" },
];

export function TrendHunterFooter() {
    return (
        <footer className="bg-[#0A0A0A] text-neutral-400 border-t border-neutral-800/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* 브랜드 */}
                    <div>
                        <div className="mb-4">
                            <TrendHunterLogo size="sm" variant="dark" />
                        </div>
                        <p className="text-sm leading-relaxed">
                            AI가 데이터를 읽고, 우리가 트렌드를 만든다.<br />
                            트렌드 분석 · 콘텐츠 보고서 · 브랜드 컨설팅
                        </p>
                    </div>

                    {/* 메뉴 */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4 font-mono">Menu</h3>
                        <div className="space-y-2">
                            {menuLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block text-sm hover:text-[#00FF88] transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact + Universe */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4 font-mono">Contact</h3>
                        <p className="text-sm mb-1">lools@tenone.biz</p>
                        <p className="text-sm mb-4">+82 10 2795 1001</p>
                        <h3 className="text-white text-sm font-semibold mb-2 font-mono">Ten:One Universe</h3>
                        <div className="space-y-1">
                            {universeLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm hover:text-[#00FF88] transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-800/50 text-center text-xs">
                    &copy; TrendHunter. Powered by{" "}
                    <a href="/about?tab=universe" className="hover:text-white transition-colors underline">
                        Ten:One&trade; Universe
                    </a>.
                </div>
            </div>
        </footer>
    );
}
