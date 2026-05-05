// PP Canvas Engine — Palm Rejection
//
// 스타일러스(pen)가 화면에 닿아 있는 동안에는 손바닥(touch) 입력을 무시.
// 사용 패턴:
//   const palm = new PalmRejection();
//   onPointerDown: palm.onPointerDown(e); if (palm.shouldReject(e)) return;
//   onPointerUp:   palm.onPointerUp(e);
//
// 부수효과로 isRealPressure도 추적 — 실제 필압 입력이 들어오면 perfect-freehand의
// simulatePressure를 끄는 데 사용.

interface PointerLike {
    pointerId: number;
    pointerType: string;
    pressure?: number;
}

export class PalmRejection {
    private activePenIds = new Set<number>();
    private realPressure = false;

    onPointerDown(e: PointerLike): void {
        if (e.pointerType === "pen") {
            this.activePenIds.add(e.pointerId);
            // 0 < pressure < 1 → 진짜 스타일러스 필압
            if (e.pressure !== undefined && e.pressure > 0 && e.pressure < 1) {
                this.realPressure = true;
            }
        }
    }

    onPointerUp(e: PointerLike): void {
        if (e.pointerType === "pen") {
            this.activePenIds.delete(e.pointerId);
            if (this.activePenIds.size === 0) this.realPressure = false;
        }
    }

    /** pen이 활성화된 동안 들어온 touch 입력은 무시해야 함 */
    shouldReject(e: PointerLike): boolean {
        return e.pointerType === "touch" && this.activePenIds.size > 0;
    }

    /** 진짜 필압 감지 여부 — perfect-freehand의 simulatePressure 토글에 사용 */
    isRealPressure(): boolean {
        return this.realPressure;
    }

    reset(): void {
        this.activePenIds.clear();
        this.realPressure = false;
    }
}
