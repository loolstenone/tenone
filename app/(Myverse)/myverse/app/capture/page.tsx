// /myverse/app/capture — 캡쳐 진입점
// 5 채집 행동(텍스트·사진·영상·체크인·운동·식사)을 한 화면에서 시작 → 9 영역 자동 분류 → AI 액션 제안

import { CaptureView } from "@/features/myverse/capture/CaptureView";

export const dynamic = "force-dynamic";

export default function CapturePage() {
    return <CaptureView />;
}
