"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Menu } from "lucide-react";

export default function BrandGravityLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/brandgravity" className="text-sm font-bold tracking-tight text-white">
                        Brand <span className="text-amber-500">Gravity</span>
                    </Link>

                    {/* 데스크탑 메뉴 */}
                    <div className="hidden sm:flex items-center gap-6">
                        <Link href="/brandgravity/services" className="text-sm text-neutral-400 hover:text-white transition">
                            Brand Gravity
                        </Link>
                        <Link href="/brandgravity/lifemark" className="text-sm text-neutral-400 hover:text-white transition">
                            Life Mark
                        </Link>
                        <Link href="/brandgravity/apply" className="text-sm px-4 py-1.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition">
                            신청하기
                        </Link>
                    </div>

                    {/* 모바일 햄버거 */}
                    <button className="sm:hidden p-2 text-neutral-400 hover:text-white transition" onClick={() => setOpen(v => !v)} aria-label="메뉴">
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* 모바일 드롭다운 */}
                {open && (
                    <div className="sm:hidden bg-[#0A0A0A] border-t border-neutral-800 px-6 py-4 flex flex-col gap-4">
                        <Link href="/brandgravity/services" className="text-sm text-neutral-300 hover:text-white transition py-1" onClick={() => setOpen(false)}>
                            Brand Gravity
                        </Link>
                        <Link href="/brandgravity/lifemark" className="text-sm text-neutral-300 hover:text-white transition py-1" onClick={() => setOpen(false)}>
                            Life Mark
                        </Link>
                        <Link href="/brandgravity/apply" className="text-sm px-4 py-2.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition text-center" onClick={() => setOpen(false)}>
                            신청하기
                        </Link>
                    </div>
                )}
            </nav>
            {children}
        </>
    );
}
