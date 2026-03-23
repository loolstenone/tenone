"use client";

import Link from "next/link";

const universeLinks = [
    { name: "TenOne.biz", href: "https://tenone.biz" },
    { name: "MAD League", href: "https://madleague.net" },
    { name: "Badak.biz", href: "https://badak.biz" },
    { name: "YouInOne.com", href: "https://youinone.com" },
];

export function ChangeUpFooter() {
    return (
        <footer className="bg-[#0F1F2E] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-black text-[#1AAD64]">Change</span>
                            <span className="text-lg font-black text-[#256EFF]">Up</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            미래를 만드는 일, 창업.<br />
                            AI 시대 청소년·대학생 창업 교육 플랫폼.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-white text-sm font-semibold">바로가기</h4>
                        <div className="space-y-2">
                            <Link href="/cu/programs" className="block text-sm hover:text-white transition-colors">프로그램</Link>
                            <Link href="/cu/invest" className="block text-sm hover:text-white transition-colors">투자</Link>
                            <Link href="/cu/startups" className="block text-sm hover:text-white transition-colors">스타트업</Link>
                            <Link href="/cu/community" className="block text-sm hover:text-white transition-colors">커뮤니티</Link>
                            <Link href="/cu/about" className="block text-sm hover:text-white transition-colors">About</Link>
                        </div>
                    </div>

                    {/* Universe */}
                    <div className="space-y-4">
                        <h4 className="text-white text-sm font-semibold">Universe</h4>
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

                <div className="mt-12 pt-6 border-t border-neutral-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                    <span>Copyright &copy; Ten:One&trade; Universe All rights reserved.</span>
                    <span className="text-neutral-500">hello@changeup.company</span>
                </div>
            </div>
        </footer>
    );
}
