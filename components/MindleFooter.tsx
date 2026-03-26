"use client";

import Link from "next/link";

export function MindleFooter() {
    return (
        <footer className="bg-[#0A0A0A] text-neutral-400 border-t border-neutral-800/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="md:col-span-1">
                        <div className="mb-3 text-xl font-bold"><span className="text-[#F5C518]">Mindle</span> <span className="text-white text-sm font-normal">Whole See</span></div>
                        <p className="text-sm leading-relaxed text-neutral-500">
                            Bloom insights from signals.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-white text-xs font-semibold mb-3 tracking-wider">CONTENTS</h3>
                        <div className="space-y-2">
                            <Link href="/mindle/trends" className="block text-sm hover:text-[#F5C518] transition-colors">Trends</Link>
                            <Link href="/mindle/reports" className="block text-sm hover:text-[#F5C518] transition-colors">Reports</Link>
                            <Link href="/mindle/data" className="block text-sm hover:text-[#F5C518] transition-colors">Data</Link>
                            <Link href="/mindle/references" className="block text-sm hover:text-[#F5C518] transition-colors">References</Link>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white text-xs font-semibold mb-3 tracking-wider">ABOUT</h3>
                        <div className="space-y-2">
                            <Link href="/mindle/about" className="block text-sm hover:text-[#F5C518] transition-colors">About Mindle</Link>
                            <Link href="/mindle/newsletter" className="block text-sm hover:text-[#F5C518] transition-colors">Newsletter</Link>
                            <a href="https://tenone.biz/contact" className="block text-sm hover:text-[#F5C518] transition-colors">Contact</a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white text-xs font-semibold mb-3 tracking-wider">UNIVERSE</h3>
                        <div className="space-y-2">
                            <a href="https://tenone.biz" className="block text-sm hover:text-[#F5C518] transition-colors">TenOne.biz</a>
                            <a href="https://badak.biz" className="block text-sm hover:text-[#F5C518] transition-colors">Badak.biz</a>
                            <a href="https://smarcomm.biz" className="block text-sm hover:text-[#F5C518] transition-colors">SmarComm.biz</a>
                        </div>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-neutral-800/50 text-center text-xs text-neutral-600">
                    &copy; Mindle. Powered by <a href="/about?tab=universe" className="hover:text-neutral-400 transition-colors underline">Ten:One&trade; Universe</a>.
                </div>
            </div>
        </footer>
    );
}
