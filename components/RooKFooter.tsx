"use client";

import Link from "next/link";
import { Youtube, MessageCircle } from "lucide-react";
const footerNav = [
    { name: "Works", href: "/rk/works" },
    { name: "Artist", href: "/rk/artist" },
    { name: "Free board", href: "/rk/board" },
    { name: "RooKie", href: "/rk/rookie" },
    { name: "About", href: "/rk/about" },
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
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-800 text-center text-xs">
                    &copy; Roo<span className="inline-block" style={{ transform: 'scaleX(-1)' }}>K</span>. Powered by <a href="https://tenone.biz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
                </div>
            </div>
        </footer>
    );
}
