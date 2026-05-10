"use client";

// WIO 직원 디지털 명함 — 공통 DigitalCard 컴포넌트 사용
// 회사·직급·이메일·전화번호 + 마이버스 공개 링크 QR + vCard
// MY_TABS 네비 일관성 유지 (다른 my/* 페이지와 동일)

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthGate } from "@/components/AuthGate";
import { DigitalCard } from "@/components/DigitalCard";

const ACCENT = "#2563EB"; // WIO 블루

const MY_TABS = [
    { label: "대시보드", href: "/wio/app/my" },
    { label: "인사기록", href: "/wio/app/my/hr" },
    { label: "내 평가", href: "/wio/app/my/evaluation" },
    { label: "내 업무", href: "/wio/app/my/work" },
    { label: "기안/결재", href: "/wio/app/my/approval" },
    { label: "명함", href: "/wio/app/my/card" },
];

export default function WIOCardPage() {
    return (
        <AuthGate accentColor={ACCENT} bgClassName="bg-neutral-50">
            <CardInner />
        </AuthGate>
    );
}

function CardInner() {
    const { user } = useAuth();

    // QR이 가리키는 곳 = 받는 사람 시점 명함 페이지 (/v/{handle}/card)
    const publicUrl = useMemo(() => {
        if (!user?.handle) return "";
        if (typeof window !== "undefined") {
            return `${window.location.protocol}//${window.location.host}/myverse/${user.handle}/card`;
        }
        return `https://myverse.kr/${user.handle}/card`;
    }, [user?.handle]);

    if (!user) return null;

    return (
        <div>
            {/* MY 탭 네비 — 다른 my/* 페이지와 동일 패턴 */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
                {MY_TABS.map(tab => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                            tab.href === "/wio/app/my/card"
                                ? "bg-indigo-600/10 text-indigo-400 font-semibold"
                                : "text-slate-400 hover:bg-white/5"
                        }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            <DigitalCard
                name={user.name}
                handle={user.handle}
                email={user.email}
                phone={user.phone}
                company={user.company}
                avatarUrl={user.avatarUrl}
                publicUrl={publicUrl}
                accent={ACCENT}
                eyebrow="BUSINESS CARD"
                title="직원 명함"
                description="QR을 스캔하거나 링크를 공유해 회사 명함을 전달하세요"
                noHandleNotice="마이버스 프로필에서 @handle을 등록하면 공개 페이지 링크와 QR 코드가 생성됩니다."
            />
        </div>
    );
}
