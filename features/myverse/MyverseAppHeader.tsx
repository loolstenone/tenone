"use client";

// Myverse 앱 헤더 — 인디고 브랜드 + 우측 유틸리티 바
// 로고 클릭 시 Verse 통합 타임라인으로 이동.
// + 버튼은 Quick Capture 시트 토글.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Plus, Search } from "lucide-react";
import { QuickCaptureSheet } from "./QuickCaptureSheet";

interface Props {
    name: string | null;
    handle: string | null;
    avatarUrl: string | null;
}

export function MyverseAppHeader({ name, handle, avatarUrl }: Props) {
    const [captureOpen, setCaptureOpen] = useState(false);
    return (
        <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
            <div className="flex items-center justify-between px-4 h-12">
                <Link href="/myverse/app/verse" className="flex items-center gap-2 group">
                    <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white text-xs font-bold">
                        M
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-sm font-semibold text-neutral-900 leading-none">Myverse</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">My Universe</div>
                    </div>
                </Link>

                <div className="flex items-center gap-1">
                    <button
                        title="검색"
                        className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setCaptureOpen(true)}
                        title="Quick Capture (사진·메모·음성·위치)"
                        className="p-1.5 rounded-md text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/5 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    <button
                        title="알림"
                        className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    >
                        <Bell className="h-4 w-4" />
                    </button>
                    <Link
                        href={handle ? `/myverse/${handle}` : "/myverse/app/settings/handle"}
                        title={handle ? `@${handle} 공개 페이지` : "핸들 등록"}
                        className="ml-1 flex items-center gap-1.5"
                    >
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={name ?? ""}
                                width={28}
                                height={28}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-500 font-medium">
                                {(name ?? "?").charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Link>
                </div>
            </div>
            <QuickCaptureSheet open={captureOpen} onClose={() => setCaptureOpen(false)} />
        </header>
    );
}
