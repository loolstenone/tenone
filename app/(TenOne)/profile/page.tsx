"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UniverseProfile } from "@/components/UniverseProfile";
import { ProfileVisibilityRail } from "@/components/profile/ProfileVisibilityRail";
import { ProfileComments } from "@/components/ProfileComments";
import { UCBalanceCard } from "@/components/UCBalanceCard";
import { UC_PUBLIC } from "@/lib/uc-visibility";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * 계정 관리 (Ten:One 계정 하나의 프로필·공개 설정·보안) — 계정 메뉴 이름과 같게 (2026-10-16). 사이트별 '마이 페이지'는 /{brand}/my·TenOne /my — 2026-10-16 개편
 * 왼쪽 = 프로필 내용(이름·사진·소개… 모든 서비스가 같은 값을 쓴다) · 오른쪽 = 공개 설정(다른 사람에게 어떻게 보일지)
 */
export default function ProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [editing, setEditing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/profile');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) return null;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
            <Link href="/" className="inline-flex items-center gap-1 text-sm tn-text-sub hover:tn-text transition-colors">
                <ArrowLeft className="h-4 w-4" /> 홈으로
            </Link>
            <header className="mt-6 mb-8">
                <h1 className="text-2xl font-bold tn-text">계정 관리</h1>
                <p className="mt-2 text-sm tn-text-sub leading-relaxed">
                    Ten:One 계정 하나의 프로필입니다. 여기서 고친 이름·사진·소개는 모든 서비스에 똑같이 쓰입니다.
                    <br className="hidden sm:block" />
                    다른 사람에게 보일지, 무엇을 보일지는 공개 설정에서 정합니다.
                </p>
            </header>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div className="space-y-5 min-w-0">
                    <UniverseProfile onEditingChange={setEditing}>
                        {user && (
                            <ProfileComments
                                targetMemberId={user.id}
                                targetHandle={user.handle}
                                isOwner={true}
                            />
                        )}
                    </UniverseProfile>
                    {UC_PUBLIC && <UCBalanceCard />}
                </div>
                {/* 넓은 화면: 오른쪽에 따라 내려오는 패널 · 모바일: 프로필 아래 */}
                {/* 좁은 화면에서 프로필을 고치는 동안은 숨긴다 — 수정 양식 아래에 설정이 이어지면 저장 전 헷갈린다 */}
                <div className={`lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto ${editing ? "hidden lg:block" : ""}`}>
                    <ProfileVisibilityRail />
                </div>
            </div>
        </div>
    );
}
