"use client";

import Link from "next/link";

const universeLinks = [
    { name: "TenOne.biz", href: "https://tenone.biz" },
    { name: "Badak.biz", href: "https://badak.biz" },
    { name: "YouInOne.com", href: "https://youinone.com" },
    { name: "MADLeague.net", href: "https://madleague.net" },
];

export function DomoFooter() {
    return (
        <footer className="bg-[#1E1220] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* 브랜드 소개 */}
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-bold">Domo</h3>
                        <p className="text-sm leading-relaxed">
                            인생 2회차, 함께 도모하다.<br />
                            정년·은퇴 후 새로운 도전을 시작하는<br />
                            시니어 비즈니스맨을 위한 플랫폼.
                        </p>
                    </div>

                    {/* 서비스 링크 */}
                    <div className="space-y-4">
                        <h4 className="text-white text-sm font-semibold">서비스</h4>
                        <div className="space-y-2">
                            <Link href="/dm/services" className="block text-sm hover:text-white transition-colors">준비서 서비스</Link>
                            <Link href="/dm/network" className="block text-sm hover:text-white transition-colors">네트워킹</Link>
                            <Link href="/dm/insights" className="block text-sm hover:text-white transition-colors">인사이트</Link>
                            <Link href="/dm/events" className="block text-sm hover:text-white transition-colors">이벤트</Link>
                        </div>
                    </div>

                    {/* 연락처 */}
                    <div className="space-y-4">
                        <h4 className="text-white text-sm font-semibold">Contact</h4>
                        <div className="space-y-2 text-sm">
                            <p>Email: lools@tenone.biz</p>
                            <p>Tel: +82 10 2795 1001</p>
                            <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">
                                KakaoTalk: @tenone
                            </a>
                        </div>
                    </div>
                </div>

                {/* Universe Links */}
                <div className="mt-10 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="text-white/60 font-medium">Universe:</span>
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
                                {i < universeLinks.length - 1 && <span className="text-neutral-600">&middot;</span>}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-6 text-xs">
                    Copyright &copy; Ten:One&trade; Universe All rights reserved.
                </div>
            </div>
        </footer>
    );
}
