import { Suspense } from "react";
import { GoogleCalendarIntegration } from "@/features/myverse/app/GoogleCalendarIntegration";
import { GmailIntegration } from "@/features/myverse/app/GmailIntegration";
import { ConnectedAi } from "@/features/planners/app/ConnectedAi";

// Planner's 연동 — 내 AI 연결(MCP) + 캘린더·메일. 사진·건강(MyVerse 개인 OS, 건강은 민감정보)은 뺐다 (2026-10-14)

export const dynamic = "force-dynamic";

export default function IntegrationsPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold text-neutral-900 myverse-dark:text-neutral-100">연동</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    내가 쓰는 AI에 플래너를 연결하고, 다른 서비스의 일정·메일을 가져옵니다
                </p>
            </div>
            <div className="space-y-3">
                {/* 내 AI에 연결 (MCP) */}
                <ConnectedAi />

                {/* 캘린더 — 양방향 */}
                <Suspense fallback={<div className="h-32 bg-neutral-100 rounded-xl animate-pulse" />}>
                    <GoogleCalendarIntegration />
                </Suspense>

                {/* 메일 — 읽기 + Triage */}
                <Suspense fallback={<div className="h-32 bg-neutral-100 rounded-xl animate-pulse" />}>
                    <GmailIntegration />
                </Suspense>

            </div>
            <p className="mt-6 text-[11px] text-neutral-400 leading-relaxed">
                ⚠ Google 연동을 위해서는 GCP 콘솔에서 Calendar API, Gmail API를 활성화해야 합니다.
                <br />
                ⚠ Gmail은 메타·snippet만 가져옵니다. 메일 본문은 Gmail에서 직접 열람하세요.
            </p>
        </div>
    );
}
