"use client";

import Link from "next/link";
import { Mail, Globe, Lightbulb } from "lucide-react";


const quickLinks = [
    { name: "About", href: "/about" },
    { name: "What We Do", href: "/whatwedo" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "People", href: "/people" },
    { name: "Alliance", href: "/alliance" },
];

export function YouInOneFooter() {
    return (
        <footer className="bg-[#171717] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Logo & Description */}
                    <div>
                        <Link href="/" className="flex items-baseline gap-0 mb-4">
                            <span className="text-white font-extrabold text-lg tracking-tight">
                                You
                            </span>
                            <span className="text-[#E53935] font-medium text-xs mx-0.5">
                                In
                            </span>
                            <span className="text-white font-extrabold text-lg tracking-tight">
                                One
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed">
                            We are Project Group<br />
                            to solve Problems.
                        </p>
                        <p className="text-xs text-neutral-500 mt-2">
                            Idea + Strategy
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
                                <a href="mailto:hello@youinone.com" className="hover:text-white transition-colors">
                                    hello@youinone.com
                                </a>
                            </li>
                            <li>서울특별시</li>
                        </ul>
                        <div className="flex items-center gap-4 mt-4">
                            <a href="https://youinone.com" className="hover:text-white transition-colors" title="Website">
                                <Globe className="h-5 w-5" />
                            </a>
                            <a href="mailto:hello@youinone.com" className="hover:text-white transition-colors" title="Email">
                                <Mail className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-white transition-colors" title="Ideas">
                                <Lightbulb className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-700 text-center text-xs">
                    &copy; YouInOne. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
                </div>
            </div>
        </footer>
    );
}
