"use client";

import Link from "next/link";
import { Instagram, Youtube, Mail } from "lucide-react";


const quickLinks = [
    { name: "소개", href: "/madleague/about" },
    { name: "동아리", href: "/madleague/clubs" },
    { name: "프로그램", href: "/madleague/programs" },
    { name: "MADzine", href: "/madleague/madzine" },
    { name: "아카이브", href: "/madleague/archive" },
    { name: "지원하기", href: "/madleague/apply" },
];

export function MadLeagueFooter() {
    return (
        <footer className="bg-[#212121] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Logo & Description */}
                    <div>
                        <Link href="/madleague" className="flex items-center gap-2 mb-4">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#EC1D25]" />
                            <span className="text-white font-extrabold text-base tracking-tight">
                                MAD League
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
                            <li>전국 7개 권역 대학 네트워크</li>
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
                    &copy; MAD League. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
                </div>
            </div>
        </footer>
    );
}
