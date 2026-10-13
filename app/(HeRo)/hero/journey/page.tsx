"use client";

/**
 * /hero/journey — 단일 URL, auth 분기 렌더
 *   비로그인 → JourneyLanding (6단계 마케팅)
 *   로그인   → JourneyWorkspace (나의 여정 지도 + Today + 탭)
 */

import { useAuth } from "@/lib/auth-context";
import { JourneyLanding } from "./_landing";
import { JourneyWorkspace } from "@/features/hero/JourneyWorkspace";

export default function JourneyPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="text-sm text-mute">불러오는 중</span>
      </div>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return <JourneyLanding />;
  }

  return <JourneyWorkspace memberId={user.id} />;
}
