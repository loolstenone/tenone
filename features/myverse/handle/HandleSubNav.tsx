"use client";

// /myverse/[handle] 서브탭 — [공개 흔적] [프로필] [명함]
// pretty URL 호환을 위해 @{handle} 형태도 동작 (middleware가 /{handle}로 rewrite)

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
    { key: "moments", label: "공개 흔적", suffix: "" },
    { key: "profile", label: "프로필", suffix: "/profile" },
    { key: "card", label: "명함", suffix: "/card" },
] as const;

export function HandleSubNav({ handle }: { handle: string }) {
    const pathname = usePathname() ?? "";
    const base = `/myverse/${handle}`;

    function isActive(suffix: string): boolean {
        const target = base + suffix;
        if (suffix === "") {
            // moments는 base와 정확히 일치 OR base/m/...
            return pathname === target || pathname.startsWith(`${target}/m/`);
        }
        return pathname === target || pathname.startsWith(`${target}/`);
    }

    return (
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-200">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex items-center gap-1 h-12">
                    {TABS.map(t => {
                        const active = isActive(t.suffix);
                        return (
                            <Link
                                key={t.key}
                                href={`${base}${t.suffix}`}
                                className={`px-3 h-8 inline-flex items-center rounded-full text-sm transition-colors ${
                                    active
                                        ? "bg-[#6366F1] text-white font-semibold"
                                        : "text-neutral-600 hover:bg-neutral-100"
                                }`}
                            >
                                {t.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
