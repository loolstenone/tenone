"use client";

import Link from "next/link";
import { Instagram, Youtube, Mail } from "lucide-react";

const quickLinks = [
    { name: "경쟁 PT", href: "/ml/pt" },
    { name: "프로그램", href: "/ml/program" },
    { name: "매드 진", href: "/ml/madzine" },
    { name: "히어로", href: "/ml/hero" },
    { name: "About", href: "/ml/about" },
];

export function MadLeagueFooter() {
    return (
        <footer className="bg-[#212121] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Logo & Description */}
                    <div>
                        <Link href="/m" className="flex items-center gap-1 mb-4">
                            <span className="bg-[#D32F2F] text-white font-extrabold text-base px-2 py-0.5 tracking-tight">
                                MAD
                            </span>
                            <span className="text-white font-bold text-base tracking-tight">
                                LEAGUE
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed">
                            Match, Act, Develop.<br />
                            경쟁을 통한 성장 플랫폼
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
                                <a href="mailto:info@madleague.net" className="hover:text-white transition-colors">
                                    info@madleague.net
                                </a>
                            </li>
                            <li>전국 5개 권역 대학 네트워크</li>
                        </ul>
                        <div className="flex items-center gap-4 mt-4">
                            <a href="#" className="hover:text-white transition-colors" title="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-white transition-colors" title="YouTube">
                                <Youtube className="h-5 w-5" />
                            </a>
                            <a href="mailto:info@madleague.net" className="hover:text-white transition-colors" title="Email">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-700 text-center text-xs">
                    &copy; {new Date().getFullYear()} MAD League. All rights reserved. Powered by Ten:One&trade;
                </div>
            </div>
        </footer>
    );
}
