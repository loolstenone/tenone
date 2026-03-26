"use client";

import Link from "next/link";

const portfolioLinks = [
    { name: "인물 사진", href: "/category/portrait" },
    { name: "스튜디오", href: "/category/studio" },
    { name: "스포츠", href: "/category/sports" },
    { name: "항공 사진", href: "/category/aerial" },
    { name: "콘서트", href: "/category/concert" },
];

const universeLinks = [
    { name: "TenOne.biz", href: "https://tenone.biz" },
    { name: "Badak.biz", href: "https://badak.biz" },
    { name: "MADLeague.net", href: "https://madleague.net" },
    { name: "YouInOne.com", href: "https://youinone.com" },
];

export function JakkaFooter() {
    return (
        <footer className="bg-neutral-900 text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* 브랜드 */}
                    <div>
                        <div className="mb-4">
                            <span className="text-white text-sm font-semibold tracking-[0.3em] border border-white px-2.5 py-1">
                                JAKKA
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed mt-4">
                            Capturing moments, telling stories.<br />
                            순간을 포착하고, 이야기를 전합니다.
                        </p>
                    </div>

                    {/* 포트폴리오 */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Portfolio</h3>
                        <div className="space-y-2">
                            {portfolioLinks.map((item) => (
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

                    {/* Contact & Universe */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Contact</h3>
                        <p className="text-sm mb-6">tenone.biz/contact</p>
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
                    &copy; JAKKA. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
                    <a href="https://tenone.biz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        Ten:One&trade; Universe
                    </a>
                    .
                </div>
            </div>
        </footer>
    );
}
