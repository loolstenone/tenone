"use client";

import { useEffect, useRef } from "react";

/**
 * 터치 스와이프로 이전/다음 이동
 * - 수평 이동이 최소 거리(threshold) 이상이고
 * - 수평 이동이 수직 이동의 1.8배 이상일 때만 동작 (스크롤과 구분)
 * - input/button/select/textarea/a 에서 시작한 터치는 무시
 * - ref 패턴으로 콜백 최신화 → 매번 listener 재등록 없음
 */
export function useSwipeNav(
    onSwipeLeft: () => void,   // 왼쪽으로 스와이프 → 다음
    onSwipeRight: () => void,  // 오른쪽으로 스와이프 → 이전
    threshold = 70,
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftRef  = useRef(onSwipeLeft);
    const rightRef = useRef(onSwipeRight);

    // 항상 최신 콜백을 ref에 동기화 (mount 이후 매 렌더)
    leftRef.current  = onSwipeLeft;
    rightRef.current = onSwipeRight;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let startX = 0;
        let startY = 0;
        let ignored = false;  // 인터랙티브 요소에서 시작한 터치는 무시

        function onTouchStart(e: TouchEvent) {
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase() ?? "";
            if (["input", "button", "select", "textarea", "a"].includes(tag)) {
                // startX를 갱신하지 않으면 이전 값(0 포함)이 남아
                // onTouchEnd에서 오탐(false positive)이 발생하므로 ignored 플래그로 막음
                ignored = true;
                return;
            }
            ignored = false;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }

        function onTouchEnd(e: TouchEvent) {
            if (ignored) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            if (Math.abs(dx) < threshold) return;
            if (Math.abs(dx) < Math.abs(dy) * 1.8) return; // 수직 스크롤 제외
            if (dx < 0) leftRef.current();   // 왼쪽 → 다음
            else        rightRef.current();  // 오른쪽 → 이전
        }

        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchend",   onTouchEnd,   { passive: true });
        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchend",   onTouchEnd);
        };
    // containerRef는 마운트 후 변경 안 됨 → 한 번만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return containerRef;
}
