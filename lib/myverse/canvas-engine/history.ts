// PP Canvas Engine — Undo/Redo 기록
//
// 멀티 엘리먼트 변경을 단일 트랜잭션으로 기록.
// 원리: 매 변경 직전 문서 스냅샷을 push, undo 시 pop → 이전 상태 복원.
// 메모리: 최대 50단계 보관 (오래된 것부터 폐기).

import type { CanvasDocument } from "./types";

const MAX_HISTORY = 50;

export class HistoryStack {
    private undoStack: CanvasDocument[] = [];
    private redoStack: CanvasDocument[] = [];

    /** 변경 직전 호출 — 현재 상태를 undo 스택에 보관 */
    push(snapshot: CanvasDocument): void {
        // 새 변경이 발생하면 redo 무효화 (브랜치 분기점)
        this.redoStack = [];
        this.undoStack.push(deepClone(snapshot));
        if (this.undoStack.length > MAX_HISTORY) {
            this.undoStack.shift();
        }
    }

    /** 이전 상태 반환. 동시에 현재 상태를 redo 스택에 보관해야 함 → undo() 호출자가 currentSnapshot 전달 */
    undo(currentSnapshot: CanvasDocument): CanvasDocument | null {
        const prev = this.undoStack.pop();
        if (!prev) return null;
        this.redoStack.push(deepClone(currentSnapshot));
        if (this.redoStack.length > MAX_HISTORY) {
            this.redoStack.shift();
        }
        return prev;
    }

    /** 다음 상태 반환 (undo 직후만 의미). 현재 상태를 다시 undo 스택으로 */
    redo(currentSnapshot: CanvasDocument): CanvasDocument | null {
        const next = this.redoStack.pop();
        if (!next) return null;
        this.undoStack.push(deepClone(currentSnapshot));
        if (this.undoStack.length > MAX_HISTORY) {
            this.undoStack.shift();
        }
        return next;
    }

    canUndo(): boolean { return this.undoStack.length > 0; }
    canRedo(): boolean { return this.redoStack.length > 0; }

    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

    /** 현재 메모리 사용량 추정 (디버그용) */
    debugSize(): { undo: number; redo: number } {
        return { undo: this.undoStack.length, redo: this.redoStack.length };
    }
}

// ─── 도우미 ─────────────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
    if (typeof structuredClone === "function") {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}
