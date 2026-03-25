"use client";

import Link from "next/link";
import { Instagram, Youtube, Mail } from "lucide-react";


const quickLinks = [
    { name: "HIT 프로그램", href: "/hit" },
    { name: "커리어", href: "/career" },
    { name: "멘토링", href: "/mentor" },
    { name: "브랜딩", href: "/branding" },
    { name: "이력서", href: "/resume" },
    { name: "About", href: "/about" },
];

export function HeRoFooter() {
    return (
        <footer className="bg-neutral-900 text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Logo & Description */}
                    <div>
                        <Link href="/" className="flex items-center mb-4">
                            <span className="text-2xl font-extrabold tracking-tight">
                                <span className="text-amber-500">He</span>
                                <span className="text-white">Ro</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed">
                            Hidden Intelligence &amp; Real Opportunity.<br />
                            숨겨진 인재를 발굴하고 성장시킵니다.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">바로가기</h4>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="mailto:info@hero.ne.kr" className="hover:text-white transition-colors">
                                    info@hero.ne.kr
                                </a>
                            </li>
                            <li>인재 발굴 · 성장 플랫폼</li>
                        </ul>
                        <div className="flex items-center gap-4 mt-4">
                            <a href="#" className="hover:text-white transition-colors" title="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-white transition-colors" title="YouTube">
                                <Youtube className="h-5 w-5" />
                            </a>
                            <a href="mailto:info@hero.ne.kr" className="hover:text-white transition-colors" title="Email">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-700 text-center text-xs">
                    &copy; HeRo. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors underline">Ten:One&trade; Universe</a>.
                </div>
            </div>
        </footer>
    );
}
