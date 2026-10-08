"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import { MyProfileCard } from "@/components/MyProfileCard";
import { CapabilitySection } from "@/components/CapabilitySection";

const ACCENT = "#0F766E";

export default function PlannersMyPage() {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="h-6 w-6 border-2 border-neutral-300 border-t-[#0F766E] rounded-full animate-spin" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-white"><LoginRequired accentColor={ACCENT} /></div>;

    return (
        <div className="min-h-screen px-6 pb-20 pt-12 bg-white text-neutral-900">
            <div className="max-w-4xl mx-auto">
                <MyProfileCard accentColor={ACCENT} siteBadge="Planner" />
                {user?.id && <CapabilitySection memberId={user.id} brandId="planners" accentColor={ACCENT} className="mb-6" />}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Link href="/planners/projects" className="border border-neutral-200 p-5 hover:border-[#0F766E]">
                        <p className="font-bold">훈련 프로젝트</p>
                        <p className="mt-1 text-sm text-neutral-500">모집 중인 프로젝트를 보고 신청합니다.</p>
                    </Link>
                    <Link href="/planners/certificate" className="border border-neutral-200 p-5 hover:border-[#0F766E]">
                        <p className="font-bold">내 참여 확인서</p>
                        <p className="mt-1 text-sm text-neutral-500">결과가 발표된 프로젝트의 확인서를 발급합니다.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
