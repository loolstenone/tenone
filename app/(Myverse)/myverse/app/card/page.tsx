"use client";

// 마이버스 디지털 명함 — 공통 DigitalCard 컴포넌트 사용
// QR 데이터: 마이버스 공개 핸들 페이지 URL (/myverse/{handle}/card)
// 브랜드 자산: show_on_card=true 인 자산을 자동 노출

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthGate } from "@/components/AuthGate";
import { DigitalCard, type CardBrandAsset } from "@/components/DigitalCard";

const ACCENT = "#6366F1";

export default function CardPage() {
    return (
        <AuthGate accentColor={ACCENT} bgClassName="bg-neutral-50">
            <CardInner />
        </AuthGate>
    );
}

function CardInner() {
    const { user } = useAuth();
    const [brandAssets, setBrandAssets] = useState<CardBrandAsset[]>([]);

    const publicUrl = useMemo(() => {
        if (!user?.handle) return "";
        if (typeof window !== "undefined") {
            return `${window.location.protocol}//${window.location.host}/myverse/${user.handle}/card`;
        }
        return `https://myverse.kr/${user.handle}/card`;
    }, [user?.handle]);

    // show_on_card=true 자산 fetch
    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        fetch("/api/myverse/brand-assets?card_only=1")
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (cancelled || !d?.assets) return;
                setBrandAssets(d.assets as CardBrandAsset[]);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [user]);

    if (!user) return null;

    return (
        <div className="min-h-[80vh] py-8 px-5 md:px-10">
            <DigitalCard
                name={user.name}
                handle={user.handle}
                email={user.email}
                phone={user.phone}
                company={user.company}
                avatarUrl={user.avatarUrl}
                publicUrl={publicUrl}
                accent={ACCENT}
                eyebrow="CARD"
                title="디지털 명함"
                description="QR을 스캔하거나 링크를 공유해 마이버스 프로필을 전달하세요"
                noHandleNotice="프로필에서 @handle을 등록하면 공개 페이지 링크와 QR 코드가 생성됩니다."
                brandAssets={brandAssets}
            />
        </div>
    );
}
