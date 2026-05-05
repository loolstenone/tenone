"use client";

// 스마트 설치 버튼.
// - canInstall (Android·Chrome·Edge 등에서 prompt 캡처 완료) → 클릭 즉시 OS 네이티브 설치 다이얼로그
// - isInstalled (이미 standalone) → 자동 숨김 (hideWhenInstalled 옵션, 기본 true)
// - 그 외 (iOS Safari 등) → /myverse/install 안내 페이지로 fallback
// 즉, 사용자가 가능한 한 "버튼 한 번 = 설치" 경험을 받게 한다.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { usePwaInstall } from "@/lib/myverse/use-pwa-install";
import { Track } from "@/lib/analytics";

interface Props {
    children?: ReactNode;
    className?: string;
    href?: string;          // 기본: /myverse/install
    hideWhenInstalled?: boolean;  // 기본 true
    title?: string;
    onInstalled?: () => void;
}

export function InstallButton({
    children,
    className = "",
    href = "/myverse/install",
    hideWhenInstalled = true,
    title,
    onInstalled,
}: Props) {
    const { canInstall, isInstalled, install } = usePwaInstall();
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    if (isInstalled && hideWhenInstalled) return null;

    async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
        if (!canInstall) return; // 기본 Link 동작 → /myverse/install
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
            const outcome = await install();
            Track.pwaInstallPrompt({ outcome });
            if (outcome === "accepted") {
                onInstalled?.();
            } else if (outcome === "unavailable") {
                router.push(href);
            }
            // dismissed → 가만히 있음 (사용자가 거절했으니 강제로 페이지 이동 X)
        } finally {
            setBusy(false);
        }
    }

    const computedTitle = title
        ?? (canInstall ? "PP AI 를 홈 화면에 설치합니다" : "설치 안내 보기 (iOS 등)");

    return (
        <Link
            href={href}
            onClick={handleClick}
            aria-busy={busy}
            title={computedTitle}
            className={className}
        >
            {children}
        </Link>
    );
}
