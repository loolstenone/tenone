"use client";

import { useRef } from "react";
import clsx from "clsx";

/**
 * 배경 유튜브 (음소거·반복·컨트롤 없음·자막 없음) — 장식용이라 포인터 이벤트 차단
 * 음소거 자동재생이면 유튜브가 자막을 켜는 경우가 있어, URL(cc_load_policy=0)로 끄고
 * 플레이어 준비 후 captions 모듈을 내린다 (IFrame API postMessage, enablejsapi=1 필요)
 */
export function RooKBackgroundVideo({ videoId, className }: { videoId: string; className?: string }) {
    const frameRef = useRef<HTMLIFrameElement>(null);
    const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&playsinline=1&rel=0&cc_load_policy=0&iv_load_policy=3&enablejsapi=1`;

    const hideCaptions = () => {
        const send = () => frameRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "unloadModule", args: ["captions"] }), "*",
        );
        // 플레이어 준비 시점이 일정하지 않아 몇 번 나눠 보낸다
        [0, 1000, 3000, 6000].forEach(ms => setTimeout(send, ms));
    };

    return (
        <div className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
            <iframe
                ref={frameRef}
                src={src}
                title="background video"
                allow="autoplay; encrypted-media"
                onLoad={hideCaptions}
                className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            />
        </div>
    );
}
