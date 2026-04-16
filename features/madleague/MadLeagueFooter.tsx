"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Mail } from "lucide-react";


const quickLinks = [
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
                        <Link href="/madleague" className="inline-block mb-4">
                            <Image
                                src="/logos/madleague/footer_Logo.png"
                                alt="MAD League"
                                width={90}
                                height={26}
                                className="object-contain h-6 w-auto"
                            />
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
                                <a href="mailto:lools@tenone.biz" className="hover:text-white transition-colors">
                                    lools@tenone.biz
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
                            <a href="mailto:lools@tenone.biz" className="hover:text-white transition-colors" title="Email">
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
