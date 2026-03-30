"use client";

import Link from "next/link";
import { Orbit, Mail, MessageCircle } from "lucide-react";

export function MyVerseFooter() {
    return (
        <footer className="bg-neutral-900 text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Orbit className="h-5 w-5 text-indigo-400" />
                            <span className="text-white font-bold text-lg">Myverse</span>
                        </div>
                        <p className="text-sm text-neutral-300 mb-1">
                            디지털 속 나의 기록
                        </p>
                        <p className="text-xs text-neutral-500">
                            Personal Blackbox
                        </p>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3">Contact</h3>
                        <div className="flex flex-col gap-2 text-sm">
                            <a href="https://tenone.biz/contact" className="hover:text-white transition-colors flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" /> tenone.biz/contact
                            </a>
                            <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                                <MessageCircle className="h-3.5 w-3.5" /> Kakao Open Chat
                            </a>
                        </div>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3">Community</h3>
                        <p className="text-sm text-neutral-500 mb-3">
                            Myverse에 바라는 점, 아이디어를 나눠주세요.
                        </p>
                        <Link href="/myverse/contact"
                            className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                            의견 남기기 &rarr;
                        </Link>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-neutral-600">
                            WIO by <a href="/" className="hover:text-neutral-400 transition-colors">Ten:One&trade; Universe</a>
                        </p>
                        <p className="text-xs text-neutral-600">
                            &copy; {new Date().getFullYear()} Myverse. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
