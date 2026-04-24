import { WifiOff } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-6">
            <div className="text-center">
                <WifiOff className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
                <h1 className="font-serif text-2xl text-neutral-900 mb-2">오프라인</h1>
                <p className="text-sm text-neutral-500 leading-relaxed">
                    인터넷에 연결되어 있지 않습니다.<br />
                    능동 AI 브리핑은 온라인이 필요합니다.<br />
                    저장된 이력은 계속 볼 수 있습니다.
                </p>
            </div>
        </div>
    );
}
