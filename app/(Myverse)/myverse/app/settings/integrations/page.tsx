import { Suspense } from "react";
import { GoogleCalendarIntegration } from "@/features/myverse/app/GoogleCalendarIntegration";
import { GmailIntegration } from "@/features/myverse/app/GmailIntegration";
import { GooglePhotosIntegration } from "@/features/myverse/app/GooglePhotosIntegration";
import { AppleHealthIntegration } from "@/features/myverse/app/AppleHealthIntegration";

export const dynamic = "force-dynamic";

export default function IntegrationsPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
            <div className="mb-6">
                <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">INTEGRATIONS</div>
                <h1 className="text-3xl font-semibold text-neutral-900 myverse-dark:text-neutral-100">외부 연결</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    다른 서비스의 내 데이터를 Myverse 흔적·일정·메일로 가져오고, 양방향으로 동기화합니다
                </p>
            </div>
            <div className="space-y-3">
                {/* 캘린더 — 양방향 */}
                <Suspense fallback={<div className="h-32 bg-neutral-100 rounded-xl animate-pulse" />}>
                    <GoogleCalendarIntegration />
                </Suspense>

                {/* 메일 — 읽기 + Triage */}
                <Suspense fallback={<div className="h-32 bg-neutral-100 rounded-xl animate-pulse" />}>
                    <GmailIntegration />
                </Suspense>

                {/* 사진 */}
                <Suspense fallback={<div className="h-32 bg-neutral-100 rounded-xl animate-pulse" />}>
                    <GooglePhotosIntegration />
                </Suspense>

                {/* 헬스 */}
                <AppleHealthIntegration />
            </div>
            <p className="mt-6 text-[11px] text-neutral-400 leading-relaxed">
                ⚠ Google 연동을 위해서는 GCP 콘솔에서 Calendar API, Gmail API, Photos Library API를 활성화해야 합니다.
                <br />
                ⚠ Gmail은 메타·snippet만 가져옵니다. 메일 본문은 Gmail에서 직접 열람하세요.
            </p>
        </div>
    );
}
