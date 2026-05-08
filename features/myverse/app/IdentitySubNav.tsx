"use client";

// 퍼스널 서브 네비 — "비전 하우스" / "이력서" 두 개의 별도 페이지로 분기.
// 디자인은 AppTopNav 메인 탭과 동일한 단일 패턴(밑줄 + active teal)을 채택해
// 페이지 위에서 일관되게 보이도록 한다.

import Link from "next/link";

const TABS = [
    { id: "vision", label: "비전 하우스",  href: "/myverse/app/personal" },
    { id: "resume", label: "이력서",       href: "/myverse/app/personal/resume" },
] as const;

export type IdentityTab = (typeof TABS)[number]["id"];

export function IdentitySubNav({ active }: { active: IdentityTab }) {
    return (
        <nav className="flex items-center gap-1 border-b border-neutral-200 -mt-2 mb-4">
            {TABS.map((t) => {
                const isActive = t.id === active;
                return (
                    <Link
                        key={t.id}
                        href={t.href}
                        className={`relative px-4 py-2.5 text-sm transition-colors ${
                            isActive
                                ? "text-[#6366F1] font-semibold"
                                : "text-neutral-500 hover:text-neutral-900"
                        }`}
                    >
                        {t.label}
                        {isActive && (
                            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#6366F1]" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
