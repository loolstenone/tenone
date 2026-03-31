"use client";

import Link from "next/link";

const universeProjects = [
    { name: "도모", href: "https://domo.tenone.biz" },
    { name: "플래너스", href: "https://planners.tenone.biz" },
    { name: "히어로", href: "https://hero.tenone.biz" },
    { name: "문래지앙", href: "https://mullaesian.tenone.biz" },
    { name: "몬츠", href: "https://montz.tenone.biz" },
    { name: "스크리블", href: "https://scribble.tenone.biz" },
    { name: "트렌드 헌터", href: "https://trendhunter.tenone.biz" },
    { name: "스마컴", href: "https://smarcomm.tenone.biz" },
    { name: "마이버스", href: "https://myverse.tenone.biz" },
    { name: "서울 360°", href: "https://seoul360.tenone.biz" },
    { name: "자연함", href: "https://naturebox.tenone.biz" },
    { name: "타우니티", href: "https://townity.tenone.biz" },
];

const footerNav = [
    { name: "타우니티란", href: "/#about" },
    { name: "우리 동네", href: "/#town" },
    { name: "함께 해요", href: "/#together" },
    { name: "이야기", href: "/#stories" },
];

export function TownityFooter() {
    return (
        <footer className="bg-[#1a2e1a] text-neutral-400">
            <div className="border-b border-neutral-700/50">
                <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12">
                    <h3 className="text-white text-lg font-bold mb-2">
                        Ten:One&trade; Universe
                    </h3>
                    <p className="text-sm mb-6">
                        <a href="https://www.tenone.biz" target="_blank" rel="noopener noreferrer" className="text-[#10B981] hover:text-[#34D399] transition-colors">
                            www.tenone.biz
                        </a>
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {universeProjects.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-3 py-1.5 rounded-full border border-neutral-700 hover:border-[#10B981] hover:text-[#34D399] transition-colors"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <div className="mb-4">
                            <span className="text-white text-xl font-bold">
                                타우<span className="text-[#10B981]">니티</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            지역이 살아야 우리가 산다.<br />
                            AI 시대의 지역 커뮤니티.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Menu</h3>
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

                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Contact</h3>
                        <div className="space-y-2 text-sm">
                            <p>전천일 (Cheonil Jeon)</p>
                            <p>
                                <a href="mailto:tenone.biz/contact" className="hover:text-white transition-colors">
                                    tenone.biz/contact
                                </a>
                            </p>
                            <p>+82 10 2795 1001</p>
                            <p>
                                <a
                                    href="https://open.kakao.com/me/tenone"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    카카오톡 오픈채팅
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-700 text-center text-xs">
                    &copy; Townity. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
                </div>
            </div>
        </footer>
    );
}
