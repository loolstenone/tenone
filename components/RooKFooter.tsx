"use client";

import Link from "next/link";
import { Youtube, MessageCircle } from "lucide-react";
import { UniverseBadge } from "@/components/UniverseBadge";

const footerNav = [
    { name: "Home", href: "/rk" },
    { name: "Works", href: "/rk/works" },
    { name: "Artist", href: "/rk/artist" },
    { name: "Free board", href: "/rk/board" },
    { name: "RooKie", href: "/rk/rookie" },
    { name: "About", href: "/rk/about" },
];

const universeLinks = [
    { name: "Badak.biz", href: "https://badak.biz" },
    { name: "RooK.co.kr", href: "https://rook.co.kr" },
    { name: "YouInOne.com", href: "https://youinone.com" },
    { name: "TenOne.biz", href: "https://tenone.biz" },
];

export function RooKFooter() {
    return (
        <footer className="bg-[#1a1a1a] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                {/* Social + Nav */}
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4">
                        <a href="#" className="hover:text-white transition-colors" title="YouTube">
                            <Youtube className="h-5 w-5" />
                        </a>
                        <a href="#" className="hover:text-white transition-colors" title="카카오톡">
                            <MessageCircle className="h-5 w-5" />
                        </a>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                        {footerNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="hover:text-white transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Brand Info */}
                <div className="mt-10 pt-8 border-t border-neutral-800">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div>
                            <p className="text-white text-lg font-light">
                                <span className="text-sm text-neutral-500 mr-2">AI Creator</span>
                                <span className="font-bold text-xl">Roo<span className="inline-block" style={{ transform: 'scaleX(-1)' }}>K</span></span>
                            </p>
                            <p className="text-sm mt-2">lools@tenone.biz</p>
                            <p className="text-sm mt-1">powered by Ten:One&trade;</p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold text-sm mb-3">Universe:</h4>
                            <ul className="space-y-1 text-sm">
                                {universeLinks.map((link) => (
                                    <li key={link.href}>
                                        <span className="text-neutral-500 mr-1">-</span>
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-800 text-center text-xs">
                    &copy; Roo<span className="inline-block" style={{ transform: 'scaleX(-1)' }}>K</span>. All rights reserved. Powered by Ten:One&trade; Universe.
                </div>

                <UniverseBadge />
            </div>
        </footer>
    );
}
