"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UniverseProfile } from "@/components/UniverseProfile";
import { ProfileComments } from "@/components/ProfileComments";
import { UCBalanceCard } from "@/components/UCBalanceCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/profile');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) return null;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-1 text-sm tn-text-sub hover:tn-text transition-colors">
                <ArrowLeft className="h-4 w-4" /> 홈으로
            </Link>
            <UniverseProfile>
                {user && (
                    <ProfileComments
                        targetMemberId={user.id}
                        targetHandle={user.handle}
                        isOwner={true}
                    />
                )}
            </UniverseProfile>
            <UCBalanceCard />
        </div>
    );
}
