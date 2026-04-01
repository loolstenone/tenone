"use client";

import Link from "next/link";

const universeLinks = [
    { name: "MAD League", href: "https://madleague.net" },
    { name: "MADLeap", href: "https://madleap.net" },
    { name: "YouInOne.com", href: "https://youinone.com" },
    { name: "FWN.co.kr", href: "https://fwn.co.kr" },
];

export function BadakFooter() {
    return (
        <footer className="bg-[#1a1a2e] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                <div className="space-y-6">
                    <p className="text-white text-sm leading-relaxed">
                        <strong>Badak</strong>은 마케팅 업계 네트워킹 커뮤니티입니다.
                    </p>
                    <p className="text-sm leading-relaxed">
                        R&D, 상품 기획, 서비스 기획, 광고, 홍보, 영업, 유통, CS, 매체, 팹, 디자인, 퍼포먼스, 소셜, 데이터, 개발, 영상 제작, 모델, 작가, 컨설턴트 다양한 업계 분들과 만나고 싶습니다.
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-white font-medium">Universe:</span>
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

                    <div>
                        <Link href="/about" className="text-sm hover:text-white transition-colors">
                            About _Badak & Contact
                        </Link>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-700 text-xs">
                    &copy; Badak. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
                </div>
            </div>
        </footer>
    );
}
