import { Suspense } from "react";
import { GooglePhotosIntegration } from "@/features/myverse/app/GooglePhotosIntegration";
import { AppleHealthIntegration } from "@/features/myverse/app/AppleHealthIntegration";

export const dynamic = "force-dynamic";

export default function IntegrationsPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
            <div className="mb-6">
                <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">INTEGRATIONS</div>
                <h1 className="text-3xl font-semibold text-neutral-900">외부 연결</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    다른 서비스의 내 데이터를 Myverse 흔적으로 가져옵니다
                </p>
            </div>
            <div className="space-y-3">
                <Suspense fallback={<div className="h-32 bg-neutral-100 rounded-xl animate-pulse" />}>
                    <GooglePhotosIntegration />
                </Suspense>
                <AppleHealthIntegration />
                {/* 후속: Google Calendar, Samsung Health 등 */}
            </div>
            <p className="mt-6 text-[11px] text-neutral-400">
                ⚠ Google Photos 연결을 위해서는 GCP 콘솔에서 Photos Library API와 photoslibrary.readonly scope를 활성화해야 합니다
            </p>
        </div>
    );
}
