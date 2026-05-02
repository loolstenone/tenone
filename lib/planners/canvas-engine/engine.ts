// PP Canvas Engine — 메인 엔진 클래스 (Phase 1 골격)
//
// 책임:
//  - 문서 상태 보관 (CanvasDocument)
//  - 엘리먼트 CRUD
//  - 도구 모드 관리
//  - 뷰포트 관리 (줌·팬)
//  - Undo/Redo (HistoryStack 위임)
//  - 이벤트 발행 (변경·선택·도구·뷰포트)
//
// 책임이 아닌 것:
//  - 렌더링 (render.ts가 전담)
//  - 포인터 입력 처리 (interaction/pointer.ts가 전담)
//  - DOM 마운트 (wrapper 컴포넌트가 전담)
//
// Phase 1 단계: API 골격 + 기본 동작. 도형·선택·텍스트는 Phase 2 이후.

import type {
    CanvasDocument, CanvasElement, ToolMode, Viewport, EngineEvents,
} from "./types";
import { createEmptyDocument } from "./types";
import { HistoryStack } from "./history";

type EventHandler<T extends keyof EngineEvents> = EngineEvents[T];

export class CanvasEngine {
    private doc: CanvasDocument;
    private tool: ToolMode = { mode: "selection" };
    private selectedIds: Set<string> = new Set();
    private history = new HistoryStack();
    private listeners: Map<keyof EngineEvents, Set<EventHandler<keyof EngineEvents>>> = new Map();

    constructor(initialDoc?: CanvasDocument) {
        this.doc = initialDoc ?? createEmptyDocument();
    }

    // ── 문서 직렬화 ─────────────────────────────────────────────────────
    serialize(): CanvasDocument {
        return this.doc;
    }

    load(doc: CanvasDocument): void {
        this.doc = doc;
        this.history.clear();
        this.selectedIds.clear();
        this.emit("change", this.doc);
        this.emit("select", []);
    }

    // ── 엘리먼트 CRUD ────────────────────────────────────────────────────
    addElement(el: CanvasElement): void {
        this.history.push(this.doc);
        this.doc = { ...this.doc, elements: [...this.doc.elements, el] };
        this.emit("change", this.doc);
    }

    addElements(els: CanvasElement[]): void {
        if (els.length === 0) return;
        this.history.push(this.doc);
        this.doc = { ...this.doc, elements: [...this.doc.elements, ...els] };
        this.emit("change", this.doc);
    }

    updateElement(id: string, patch: Partial<CanvasElement>): void {
        const idx = this.doc.elements.findIndex(e => e.id === id);
        if (idx < 0) return;
        this.history.push(this.doc);
        const updated = { ...this.doc.elements[idx], ...patch, updatedAt: Date.now() } as CanvasElement;
        const next = [...this.doc.elements];
        next[idx] = updated;
        this.doc = { ...this.doc, elements: next };
        this.emit("change", this.doc);
    }

    removeElement(id: string): void {
        if (!this.doc.elements.some(e => e.id === id)) return;
        this.history.push(this.doc);
        this.doc = { ...this.doc, elements: this.doc.elements.filter(e => e.id !== id) };
        this.selectedIds.delete(id);
        this.emit("change", this.doc);
        this.emit("select", Array.from(this.selectedIds));
    }

    removeElements(ids: string[]): void {
        const idSet = new Set(ids);
        const next = this.doc.elements.filter(e => !idSet.has(e.id));
        if (next.length === this.doc.elements.length) return;
        this.history.push(this.doc);
        this.doc = { ...this.doc, elements: next };
        ids.forEach(id => this.selectedIds.delete(id));
        this.emit("change", this.doc);
        this.emit("select", Array.from(this.selectedIds));
    }

    getElements(): readonly CanvasElement[] {
        return this.doc.elements;
    }

    getElement(id: string): CanvasElement | undefined {
        return this.doc.elements.find(e => e.id === id);
    }

    // ── 선택 ────────────────────────────────────────────────────────────
    selectElements(ids: string[]): void {
        this.selectedIds = new Set(ids);
        this.emit("select", ids);
    }

    clearSelection(): void {
        this.selectedIds.clear();
        this.emit("select", []);
    }

    getSelection(): string[] {
        return Array.from(this.selectedIds);
    }

    // ── 도구 모드 ────────────────────────────────────────────────────────
    setTool(tool: ToolMode): void {
        this.tool = tool;
        this.emit("tool-change", tool);
    }

    getTool(): ToolMode {
        return this.tool;
    }

    // ── 뷰포트 ──────────────────────────────────────────────────────────
    setViewport(viewport: Viewport): void {
        this.doc = { ...this.doc, viewport };
        this.emit("viewport-change", viewport);
    }

    getViewport(): Viewport {
        return this.doc.viewport ?? { x: 0, y: 0, zoom: 1 };
    }

    // ── 배경 템플릿 ──────────────────────────────────────────────────────
    setBackground(bg: CanvasDocument["background"]): void {
        if (this.doc.background === bg) return;
        this.history.push(this.doc);
        this.doc = { ...this.doc, background: bg };
        this.emit("change", this.doc);
    }

    // ── Undo/Redo ──────────────────────────────────────────────────────
    undo(): void {
        const prev = this.history.undo(this.doc);
        if (!prev) return;
        this.doc = prev;
        this.emit("change", this.doc);
    }

    redo(): void {
        const next = this.history.redo(this.doc);
        if (!next) return;
        this.doc = next;
        this.emit("change", this.doc);
    }

    canUndo(): boolean { return this.history.canUndo(); }
    canRedo(): boolean { return this.history.canRedo(); }

    // ── 이벤트 ──────────────────────────────────────────────────────────
    on<K extends keyof EngineEvents>(event: K, handler: EngineEvents[K]): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler as EventHandler<keyof EngineEvents>);
        return () => {
            this.listeners.get(event)?.delete(handler as EventHandler<keyof EngineEvents>);
        };
    }

    private emit<K extends keyof EngineEvents>(event: K, ...args: Parameters<EngineEvents[K]>): void {
        const set = this.listeners.get(event);
        if (!set) return;
        set.forEach(handler => {
            try {
                (handler as (...a: Parameters<EngineEvents[K]>) => void)(...args);
            } catch (e) {
                console.error(`[CanvasEngine] event handler error: ${event}`, e);
            }
        });
    }

    // ── 정리 ────────────────────────────────────────────────────────────
    destroy(): void {
        this.listeners.clear();
        this.history.clear();
        this.selectedIds.clear();
    }
}
