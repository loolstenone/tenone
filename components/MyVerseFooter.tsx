"use client";

import Link from "next/link";
import { Orbit } from "lucide-react";

const siteLinks = [
    { name: "철학", href: "/philosophy" },
    { name: "서비스", href: "/service" },
    { name: "기술 & 보안", href: "/technology" },
    { name: "로드맵", href: "/roadmap" },
    { name: "팀", href: "/team" },
    { name: "Contact", href: "/contact" },
];

const principles = [
    { name: "개인화 (Personalize)", href: "/philosophy" },
    { name: "사용자 주도권 (Initiative)", href: "/philosophy" },
    { name: "완벽한 보안 (Security)", href: "/technology" },
    { name: "데이터 주권 (Sovereignty)", href: "/technology" },
];

export function MyVerseFooter() {
    return (
        <footer className="bg-[#0B0D17] text-neutral-400 border-t border-white/5">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Orbit className="h-5 w-5 text-indigo-400" />
                            <span className="text-white font-semibold text-lg">
                                My <span className="text-indigo-400">Universe</span>
                            </span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-2">
                            디지털 속 나를 키운다.
                        </p>
                        <p className="text-xs text-neutral-500">
                            나의 능력, 관계, 기록이 만들어가는 개인화된 세계관.
                            <br />
                            나의 Personal Black Box.
                        </p>
                    </div>

                    {/* Site Links */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3">바로가기</h3>
                        <div className="flex flex-col gap-1.5">
                            {siteLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Principles */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3">핵심 원칙</h3>
                        <div className="flex flex-col gap-1.5">
                            {principles.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs">
                            Contact: tenone.biz/contact
                        </p>
                        <p className="text-xs">
                            &copy; MyVerse. Powered by <a href="/" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
