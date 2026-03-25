"use client";

import Link from "next/link";
import { Instagram, Youtube } from "lucide-react";

export function MadLeapFooter() {
    return (
        <footer className="bg-[#333333] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                {/* Social Icons */}
                <div className="flex justify-center gap-4 mb-10">
                    <a href="https://instagram.com/madleap.official" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Instagram">
                        <Instagram className="h-5 w-5" />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="YouTube">
                        <Youtube className="h-5 w-5" />
                    </a>
                </div>

                {/* Brand */}
                <div className="border-t border-neutral-600 pt-8">
                    <p className="text-xs text-neutral-500 mb-1">실전 프로젝트 대학생 연합동아리</p>
                    <h3 className="text-white text-2xl font-bold mb-6">MADLeap</h3>

                    {/* Contact */}
                    <div className="border-t border-neutral-600 pt-6 mb-6">
                        <h4 className="text-white text-sm font-semibold mb-3">Contact</h4>
                        <ul className="space-y-1 text-sm">
                            <li>e-mail: <a href="mailto:official@madleap.co.kr" className="hover:text-white transition-colors">official@madleap.co.kr</a></li>
                            <li>인스타그램: <a href="https://instagram.com/madleap.official" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@madleap.official</a></li>
                            <li>블로그: <a href="https://blog.naver.com/madleap" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">blog.naver.com/madleap</a></li>
                        </ul>
                    </div>

                    {/* Universe */}
                    <div className="border-t border-neutral-600 pt-6">
                        <h4 className="text-white text-sm font-semibold mb-3">Universe</h4>
                        <ul className="space-y-1 text-sm">
                            <li>마케팅&광고 업계 커뮤니티 &quot;바닥&quot; <Link href="https://badak.biz" className="hover:text-white transition-colors">badak.biz</Link></li>
                            <li>대학생 역량 경연의 장 &quot;매드리그&quot; <Link href="https://madleague.net" className="hover:text-white transition-colors">MADleague.net</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-600 text-center text-xs">
                    &copy; MADLeap. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors underline">Ten:One&trade; Universe</a>.
                </div>
            </div>
        </footer>
    );
}
