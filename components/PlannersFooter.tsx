"use client";

import Link from "next/link";

const universeLinks = [
    { name: "TenOne.biz", href: "https://tenone.biz" },
    { name: "Badak.biz", href: "https://badak.biz" },
    { name: "MADLeague.net", href: "https://madleague.net" },
    { name: "YouInOne.com", href: "https://youinone.com" },
];

export function PlannersFooter() {
    return (
        <footer className="bg-teal-950 text-teal-300/70">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* 브랜드 소개 */}
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-bold">Planner&apos;s</h3>
                        <p className="text-sm leading-relaxed">
                            우리는 모두 기획자다.<br />
                            적어도 자기 인생에서 만큼은.
                        </p>
                    </div>

                    {/* 메뉴 링크 */}
                    <div className="space-y-4">
                        <h4 className="text-white text-sm font-semibold">Menu</h4>
                        <div className="space-y-2">
                            <Link href="/pln" className="block text-sm hover:text-white transition-colors">Planner&apos;s</Link>
                            <Link href="/pln?tab=planning" className="block text-sm hover:text-white transition-colors">Planning</Link>
                            <Link href="/pln?tab=planner-tool" className="block text-sm hover:text-white transition-colors">Planner&apos;s Planner</Link>
                        </div>
                    </div>

                    {/* 연락처 */}
                    <div className="space-y-4">
                        <h4 className="text-white text-sm font-semibold">Contact</h4>
                        <div className="space-y-2 text-sm">
                            <p>전천일 Cheonil Jeon</p>
                            <p>Email: tenone.biz/contact</p>
                            <p>Tel: +82 10 2795 1001</p>
                            <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">
                                KakaoTalk: @tenone
                            </a>
                        </div>
                    </div>
                </div>

                {/* Universe Links */}
                <div className="mt-10 pt-6 border-t border-teal-800/50">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="text-teal-500 font-medium">Universe:</span>
                        {universeLinks.map((link, i) => (
                            <span key={link.href} className="flex items-center gap-2">
                                <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    {link.name}
                                </a>
                                {i < universeLinks.length - 1 && (
                                    <span className="text-teal-800">·</span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-6 text-xs text-teal-700">
                    &copy; 2020. Ten:One™ all rights reserved. Powered by Ten:One™ Universe.
                </div>
            </div>
        </footer>
    );
}
