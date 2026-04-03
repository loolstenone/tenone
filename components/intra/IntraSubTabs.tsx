"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { findSubItems, getActiveSubHref } from "@/lib/intra-nav";

/**
 * 사이드바 메뉴 item에 children이 정의된 경우,
 * 해당 children을 본문 상단 탭으로 자동 렌더링.
 * 인트라 레이아웃에서 {children} 바로 위에 삽입.
 */
export function IntraSubTabs() {
    const pathname = usePathname();
    const subItems = findSubItems(pathname);

    if (!subItems || subItems.length === 0) return null;

    const activeHref = getActiveSubHref(pathname, subItems);

    return (
        <div className="flex items-center gap-0 border-b-2 border-neutral-200 mb-6 -mt-1">
            {subItems.map((item) => {
                const isActive = activeHref === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "px-4 py-2.5 text-sm border-b-2 -mb-[2px] transition-colors whitespace-nowrap",
                            isActive
                                ? "border-neutral-900 text-neutral-900 font-medium"
                                : "border-transparent text-neutral-400 hover:text-neutral-700 hover:border-neutral-300"
                        )}
                    >
                        {item.name}
                    </Link>
                );
            })}
        </div>
    );
}
