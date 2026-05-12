"use client";

// 마인드맵 에디터 — 캔버스 위에 SVG로 방사형 노드 렌더.
// 자동 레이아웃: root는 중앙, 1단계는 360° 균등, 깊은 단계는 부모 각도 영역 안에서 분기.
// 키보드:
//   Enter = 형제 추가 / Tab = 자식 추가 / Delete = 노드 삭제 / Space = 접기 토글
//   더블클릭/F2 = 편집 / Esc = 편집 종료
// 자동 저장: 1.5초 디바운스 (CanvasEditor와 동일 패턴)

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Sparkles, ZoomIn, ZoomOut, Maximize2, FileInput, X, Target, Check, Loader2, Image as ImageIcon, FileImage } from "lucide-react";
import { toPng, toSvg } from "html-to-image";

export interface MindmapNode {
    id: string;
    text: string;
    children: MindmapNode[];
    collapsed?: boolean;
    color?: string | null;
    /** 수동 좌표 오버라이드. 자동 레이아웃 위에 덮어쓴다. */
    position?: { x: number; y: number } | null;
}

export interface MindmapDoc {
    root: MindmapNode;
    layout?: "radial" | "horizontal";
}

const PALETTE = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444", "#84CC16"];

function genId(): string {
    return `mn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function emptyDoc(): MindmapDoc {
    return {
        root: { id: genId(), text: "중심 주제", children: [] },
        layout: "radial",
    };
}

// ── 텍스트 → MindmapNode 파서 ────────────────────────────────────────
// 자동 감지: 첫 비공백 줄이 `#`로 시작하면 마크다운, 아니면 들여쓰기 outline.
// 마크다운: `# 헤더` = depth 0(root), `## 헤더` = depth 1...
// 들여쓰기: 첫 줄 = root, 들여쓴 만큼 depth 추가 (탭=1, 스페이스=실제 개수 그대로)
export function parseTextToMindmap(text: string): MindmapNode | null {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return null;

    // 빈 줄을 제외한 첫 줄에서 모드 판정
    const firstTrim = lines[0].trim();
    const isMarkdown = /^#+\s+\S/.test(firstTrim);

    if (isMarkdown) {
        // 마크다운 모드
        const items: Array<{ depth: number; text: string }> = [];
        for (const raw of lines) {
            const m = raw.match(/^(#+)\s+(.+?)\s*#*$/);
            if (!m) continue;
            const depth = Math.min(m[1].length - 1, 5);
            items.push({ depth, text: m[2].trim() });
        }
        if (items.length === 0) return null;
        // 최상위 depth 정규화 (모두 ## 부터 시작했다면 depth 1을 0으로)
        const minDepth = Math.min(...items.map(i => i.depth));
        return buildTreeFromItems(items.map(i => ({ depth: i.depth - minDepth, text: i.text })));
    } else {
        // 들여쓰기 outline 모드 — 첫 비공백 위치를 기준 depth 0
        const items: Array<{ depth: number; text: string }> = lines.map(raw => {
            const indent = raw.match(/^[\s\t]*/)?.[0] ?? "";
            // 탭 1개 = depth 1, 스페이스 2개 = depth 1
            const tabCount = (indent.match(/\t/g) ?? []).length;
            const spaceCount = indent.length - tabCount;
            const depth = tabCount + Math.floor(spaceCount / 2);
            return { depth, text: raw.trim().replace(/^[-*•]\s+/, "") };
        });
        const minDepth = Math.min(...items.map(i => i.depth));
        return buildTreeFromItems(items.map(i => ({ depth: i.depth - minDepth, text: i.text })));
    }
}

function buildTreeFromItems(items: Array<{ depth: number; text: string }>): MindmapNode | null {
    if (items.length === 0) return null;

    // 첫 depth=0 항목이 root. 만약 첫 항목이 depth>0이면 가상 root 생성.
    let rootText = "중심 주제";
    let startIdx = 0;
    if (items[0].depth === 0) {
        rootText = items[0].text;
        startIdx = 1;
    }
    const root: MindmapNode = { id: genId(), text: rootText, children: [] };

    // 스택 기반 트리 구성: stack[i] = depth i+1의 현재 부모
    const stack: MindmapNode[] = [root];
    for (let i = startIdx; i < items.length; i++) {
        const { depth, text } = items[i];
        const node: MindmapNode = { id: genId(), text, children: [] };
        // 부모는 stack[depth-1] (depth=1이면 root, depth=2면 그 자식의 자식)
        // 만약 depth > stack.length라면 가장 최근 노드 안에 강제로 넣음
        const parentDepth = Math.min(depth, stack.length);
        const parent = stack[parentDepth - 1] ?? stack[stack.length - 1] ?? root;
        parent.children.push(node);
        stack.length = parentDepth; // 깊은 스택 자르기
        stack.push(node);
    }
    return root;
}

// ── 자동 레이아웃 ──────────────────────────────────────────────────────
interface Layout {
    id: string;
    x: number; y: number;
    depth: number;
    angle: number;       // 부모에서 본 각도 (radian)
    parentId: string | null;
    color: string;
}

function radialLayout(root: MindmapNode): Map<string, Layout> {
    const out = new Map<string, Layout>();
    // root: position 우선 → 없으면 (0,0)
    const rootPos = root.position ?? { x: 0, y: 0 };
    out.set(root.id, { id: root.id, x: rootPos.x, y: rootPos.y, depth: 0, angle: 0, parentId: null, color: root.color ?? "#0F172A" });

    function walk(node: MindmapNode, parentAngle: number, parentX: number, parentY: number, depth: number, sectorStart: number, sectorEnd: number, parentColor: string) {
        if (node.collapsed) return;
        const kids = node.children;
        if (kids.length === 0) return;
        const sectorSize = sectorEnd - sectorStart;
        const step = sectorSize / kids.length;
        const radius = depth === 0 ? 180 : 150;
        kids.forEach((c, i) => {
            const a = sectorStart + step * (i + 0.5);
            const autoX = parentX + Math.cos(a) * radius;
            const autoY = parentY + Math.sin(a) * radius;
            // 수동 좌표 오버라이드 우선
            const cx = c.position?.x ?? autoX;
            const cy = c.position?.y ?? autoY;
            const autoColor = depth === 0 ? PALETTE[i % PALETTE.length] : parentColor;
            const color = c.color ?? autoColor;
            out.set(c.id, { id: c.id, x: cx, y: cy, depth: depth + 1, angle: a, parentId: node.id, color });
            const span = Math.PI / 2.4; // ~75°
            walk(c, a, cx, cy, depth + 1, a - span / 2, a + span / 2, color);
        });
    }

    walk(root, 0, 0, 0, 0, 0, Math.PI * 2, "#0F172A");
    return out;
}

// ── 트리 조작 헬퍼 (immutable) ───────────────────────────────────────────
function findNode(node: MindmapNode, id: string): MindmapNode | null {
    if (node.id === id) return node;
    for (const c of node.children) {
        const r = findNode(c, id);
        if (r) return r;
    }
    return null;
}

function findParent(node: MindmapNode, id: string): MindmapNode | null {
    for (const c of node.children) {
        if (c.id === id) return node;
        const r = findParent(c, id);
        if (r) return r;
    }
    return null;
}

function mapTree(node: MindmapNode, fn: (n: MindmapNode) => MindmapNode): MindmapNode {
    const transformed = fn(node);
    return { ...transformed, children: transformed.children.map(c => mapTree(c, fn)) };
}

function addChild(root: MindmapNode, parentId: string, child: MindmapNode): MindmapNode {
    return mapTree(root, n => n.id === parentId ? { ...n, children: [...n.children, child], collapsed: false } : n);
}

function addSibling(root: MindmapNode, nodeId: string, sibling: MindmapNode): MindmapNode {
    const p = findParent(root, nodeId);
    if (!p) return root;
    const idx = p.children.findIndex(c => c.id === nodeId);
    return mapTree(root, n => {
        if (n.id !== p.id) return n;
        const next = [...n.children];
        next.splice(idx + 1, 0, sibling);
        return { ...n, children: next };
    });
}

function removeNode(root: MindmapNode, id: string): MindmapNode {
    return {
        ...root,
        children: root.children
            .filter(c => c.id !== id)
            .map(c => removeNode(c, id)),
    };
}

function updateNode(root: MindmapNode, id: string, patch: Partial<MindmapNode>): MindmapNode {
    return mapTree(root, n => n.id === id ? { ...n, ...patch } : n);
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────
export function MindmapEditor({
    initialDoc,
    onSave,
    onPromoteText,
    className = "",
}: {
    initialDoc?: MindmapDoc;
    onSave?: (doc: MindmapDoc) => void;
    onPromoteText?: (text: string) => void | Promise<void>;
    className?: string;
}) {
    const [doc, setDoc] = useState<MindmapDoc>(initialDoc ?? emptyDoc());
    const [selectedId, setSelectedId] = useState<string>(initialDoc?.root.id ?? doc.root.id);
    const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [importModal, setImportModal] = useState<{ open: boolean; text: string; mode: "replace" | "append"; error?: string } | null>(null);
    const [applyModal, setApplyModal] = useState<{ open: boolean; projectId: string; loading: boolean; result?: { count: number } } | null>(null);
    const [projects, setProjects] = useState<Array<{ id: string; title: string; color?: string }>>([]);

    // 프로젝트 목록 (apply 모달용) — 처음 모달 열 때 1회 fetch
    useEffect(() => {
        if (!applyModal?.open || projects.length > 0) return;
        (async () => {
            try {
                const r = await fetch("/api/myverse/projects");
                if (r.ok) {
                    const d = await r.json();
                    setProjects((d.projects ?? []).map((p: { id: string; title: string; color?: string }) => ({ id: p.id, title: p.title, color: p.color })));
                }
            } catch { /* noop */ }
        })();
    }, [applyModal?.open, projects.length]);
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 자동 저장 디바운스
    useEffect(() => {
        if (!onSave) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => onSave(doc), 1500);
        return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    }, [doc, onSave]);

    const layout = useMemo(() => radialLayout(doc.root), [doc.root]);

    // 가시 노드 (collapsed 무시한 평탄화)
    const visibleNodes = useMemo(() => {
        const out: MindmapNode[] = [];
        function walk(n: MindmapNode) {
            out.push(n);
            if (!n.collapsed) for (const c of n.children) walk(c);
        }
        walk(doc.root);
        return out;
    }, [doc.root]);

    // 가시 엣지
    const visibleEdges = useMemo(() => {
        const out: Array<{ from: string; to: string }> = [];
        function walk(n: MindmapNode) {
            if (n.collapsed) return;
            for (const c of n.children) {
                out.push({ from: n.id, to: c.id });
                walk(c);
            }
        }
        walk(doc.root);
        return out;
    }, [doc.root]);

    const handleAddChild = useCallback(() => {
        const child: MindmapNode = { id: genId(), text: "새 노드", children: [] };
        setDoc(prev => ({ ...prev, root: addChild(prev.root, selectedId, child) }));
        setSelectedId(child.id);
        setTimeout(() => setEditing({ id: child.id, value: "새 노드" }), 0);
    }, [selectedId]);

    const handleAddSibling = useCallback(() => {
        if (selectedId === doc.root.id) {
            // root에는 형제 추가 불가 — 자식으로 폴백
            handleAddChild();
            return;
        }
        const sibling: MindmapNode = { id: genId(), text: "새 노드", children: [] };
        setDoc(prev => ({ ...prev, root: addSibling(prev.root, selectedId, sibling) }));
        setSelectedId(sibling.id);
        setTimeout(() => setEditing({ id: sibling.id, value: "새 노드" }), 0);
    }, [selectedId, doc.root.id, handleAddChild]);

    const handleDelete = useCallback(() => {
        if (selectedId === doc.root.id) return;
        const parent = findParent(doc.root, selectedId);
        setDoc(prev => ({ ...prev, root: removeNode(prev.root, selectedId) }));
        if (parent) setSelectedId(parent.id);
        else setSelectedId(doc.root.id);
    }, [selectedId, doc.root]);

    const handleToggleCollapse = useCallback(() => {
        const n = findNode(doc.root, selectedId);
        if (!n || n.children.length === 0) return;
        setDoc(prev => ({ ...prev, root: updateNode(prev.root, selectedId, { collapsed: !n.collapsed }) }));
    }, [selectedId, doc.root]);

    const startEdit = useCallback(() => {
        const n = findNode(doc.root, selectedId);
        if (!n) return;
        setEditing({ id: selectedId, value: n.text });
    }, [selectedId, doc.root]);

    const commitEdit = useCallback(() => {
        if (!editing) return;
        const text = editing.value.trim() || "(빈 노드)";
        setDoc(prev => ({ ...prev, root: updateNode(prev.root, editing.id, { text }) }));
        setEditing(null);
    }, [editing]);

    // 키보드 단축키
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (editing) {
                if (e.key === "Escape") setEditing(null);
                return;
            }
            const target = e.target as HTMLElement | null;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
            if (e.key === "Tab") { e.preventDefault(); handleAddChild(); }
            else if (e.key === "Enter") { e.preventDefault(); handleAddSibling(); }
            else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); handleDelete(); }
            else if (e.key === " ") { e.preventDefault(); handleToggleCollapse(); }
            else if (e.key === "F2") { e.preventDefault(); startEdit(); }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [editing, handleAddChild, handleAddSibling, handleDelete, handleToggleCollapse, startEdit]);

    // 노드 위치 리셋 (수동 좌표 → 자동 레이아웃 복귀)
    const resetNodePosition = useCallback((nodeId: string) => {
        setDoc(prev => ({ ...prev, root: updateNode(prev.root, nodeId, { position: null }) }));
    }, []);

    // 노드 색상 변경
    const setNodeColor = useCallback((nodeId: string, color: string | null) => {
        setDoc(prev => ({ ...prev, root: updateNode(prev.root, nodeId, { color }) }));
    }, []);

    // 노드 드래그 (수동 좌표 오버라이드)
    const nodeDragRef = useRef<{ id: string; startMouseX: number; startMouseY: number; startNodeX: number; startNodeY: number } | null>(null);
    function startNodeDrag(e: React.MouseEvent, nodeId: string) {
        e.preventDefault();
        e.stopPropagation();
        if (nodeId === doc.root.id) return; // root는 드래그 금지 (자동 레이아웃 중심점)
        const L = layout.get(nodeId);
        if (!L) return;
        nodeDragRef.current = {
            id: nodeId,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startNodeX: L.x,
            startNodeY: L.y,
        };
        setSelectedId(nodeId);
    }

    // 배경 드래그 (pan)
    const dragRef = useRef<{ startX: number; startY: number; basePan: { x: number; y: number } } | null>(null);
    function onMouseDownBg(e: React.MouseEvent) {
        if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName !== "svg") return;
        dragRef.current = { startX: e.clientX, startY: e.clientY, basePan: { ...pan } };
    }
    useEffect(() => {
        function onMove(e: MouseEvent) {
            if (nodeDragRef.current) {
                const d = nodeDragRef.current;
                const dx = (e.clientX - d.startMouseX) / zoom;
                const dy = (e.clientY - d.startMouseY) / zoom;
                const nextX = d.startNodeX + dx;
                const nextY = d.startNodeY + dy;
                setDoc(prev => ({ ...prev, root: updateNode(prev.root, d.id, { position: { x: nextX, y: nextY } }) }));
                return;
            }
            if (!dragRef.current) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setPan({ x: dragRef.current.basePan.x + dx, y: dragRef.current.basePan.y + dy });
        }
        function onUp() {
            nodeDragRef.current = null;
            dragRef.current = null;
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [zoom]);

    function onWheel(e: React.WheelEvent) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        setZoom(prev => Math.max(0.3, Math.min(3, prev + delta)));
    }

    function resetView() {
        setPan({ x: 0, y: 0 });
        setZoom(1);
    }

    const [exporting, setExporting] = useState(false);
    async function exportMindmap(format: "png" | "svg") {
        if (!containerRef.current || exporting) return;
        setExporting(true);
        try {
            const opts = {
                backgroundColor: "#FAFAFA",
                pixelRatio: format === "png" ? 2 : 1,
                cacheBust: false,
                // 도움말·툴바 등 절대 위치 UI는 캡처에서 제외 (filter 옵션)
                filter: (node: HTMLElement) => {
                    if (!(node instanceof HTMLElement)) return true;
                    return !node.dataset?.mindmapUi;
                },
            };
            const dataUrl = format === "png"
                ? await toPng(containerRef.current, opts)
                : await toSvg(containerRef.current, opts);
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `mindmap-${doc.root.text.slice(0, 20).replace(/[^\w\sㄱ-힣]/g, "_")}-${new Date().toISOString().slice(0, 10)}.${format}`;
            a.click();
        } catch (e) {
            console.warn("mindmap export failed", e);
        } finally {
            setExporting(false);
        }
    }

    // root의 1단계 자식들을 마일스톤으로 변환, 손자는 description으로 평탄화
    async function applyToProject() {
        if (!applyModal || !applyModal.projectId) return;
        setApplyModal({ ...applyModal, loading: true });
        const milestones = doc.root.children;
        let count = 0;
        for (let i = 0; i < milestones.length; i++) {
            const m = milestones[i];
            // 손자 + 증손자(있다면)를 description으로 합치기
            const subItems: string[] = [];
            function collect(n: MindmapNode, indent: number) {
                if (indent > 0) subItems.push(`${"  ".repeat(indent - 1)}- ${n.text}`);
                if (!n.collapsed) for (const c of n.children) collect(c, indent + 1);
            }
            for (const c of m.children) collect(c, 1);
            const description = subItems.length > 0 ? subItems.join("\n") : null;
            try {
                const r = await fetch(`/api/myverse/projects/${applyModal.projectId}/milestones`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: m.text, description, order_index: i }),
                });
                if (r.ok) count++;
            } catch { /* noop */ }
        }
        setApplyModal({ ...applyModal, loading: false, result: { count } });
    }

    function doImport() {
        if (!importModal) return;
        const parsed = parseTextToMindmap(importModal.text);
        if (!parsed) {
            setImportModal({ ...importModal, error: "파싱할 텍스트가 없습니다. 마크다운 헤딩(#) 또는 들여쓰기 outline을 사용하세요." });
            return;
        }
        if (importModal.mode === "replace") {
            setDoc({ ...doc, root: parsed });
            setSelectedId(parsed.id);
        } else {
            // 현재 root 아래에 parsed의 모든 자식을 append. parsed 자체는 라벨로 사용 X
            const newChildren = parsed.children.length > 0 ? parsed.children : [parsed];
            setDoc(prev => ({
                ...prev,
                root: { ...prev.root, children: [...prev.root.children, ...newChildren], collapsed: false },
            }));
        }
        setImportModal(null);
    }

    return (
        <div ref={containerRef} className={`relative w-full h-full overflow-hidden bg-neutral-50 ${className}`}>
            {/* 툴바 */}
            <div data-mindmap-ui className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white border border-neutral-200 rounded-lg shadow-sm px-1.5 py-1 text-xs">
                <button
                    type="button"
                    onClick={handleAddChild}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 text-neutral-700"
                    title="자식 추가 (Tab)"
                >
                    <Plus className="h-3 w-3" /> 자식
                </button>
                <button
                    type="button"
                    onClick={handleAddSibling}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 text-neutral-700"
                    title="형제 추가 (Enter)"
                >
                    <Plus className="h-3 w-3" /> 형제
                </button>
                <div className="w-px h-4 bg-neutral-200 mx-1" />
                <button
                    type="button"
                    onClick={() => setImportModal({ open: true, text: "", mode: "append" })}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 text-neutral-700"
                    title="텍스트(마크다운/들여쓰기)에서 import"
                >
                    <FileInput className="h-3 w-3" /> Import
                </button>
                <button
                    type="button"
                    onClick={() => setApplyModal({ open: true, projectId: "", loading: false })}
                    disabled={doc.root.children.length === 0}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#6366F1]/10 text-[#6366F1] disabled:opacity-40"
                    title="1단계 자식 노드를 선택한 프로젝트의 마일스톤으로 일괄 변환"
                >
                    <Target className="h-3 w-3" /> 프로젝트로
                </button>
                <div className="w-px h-4 bg-neutral-200 mx-1" />
                <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-1 rounded hover:bg-neutral-100" title="확대"><ZoomIn className="h-3 w-3" /></button>
                <button type="button" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="p-1 rounded hover:bg-neutral-100" title="축소"><ZoomOut className="h-3 w-3" /></button>
                <button type="button" onClick={resetView} className="p-1 rounded hover:bg-neutral-100" title="중앙 정렬"><Maximize2 className="h-3 w-3" /></button>
                <div className="w-px h-4 bg-neutral-200 mx-1" />
                <button
                    type="button"
                    onClick={() => exportMindmap("png")}
                    disabled={exporting}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50"
                    title="현재 마인드맵을 PNG로 내보내기"
                >
                    {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
                    PNG
                </button>
                <button
                    type="button"
                    onClick={() => exportMindmap("svg")}
                    disabled={exporting}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50"
                    title="현재 마인드맵을 SVG로 내보내기"
                >
                    {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileImage className="h-3 w-3" />}
                    SVG
                </button>
            </div>

            {/* 색상 picker — 선택된 노드 있을 때 우상단 */}
            {selectedId && selectedId !== doc.root.id && (() => {
                const selNode = findNode(doc.root, selectedId);
                if (!selNode) return null;
                const selLayout = layout.get(selectedId);
                const isCustom = !!selNode.position;
                return (
                    <div data-mindmap-ui className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg shadow-sm px-2 py-1.5 text-xs">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 mr-1">색상</span>
                        {PALETTE.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setNodeColor(selectedId, c)}
                                className={`h-4 w-4 rounded-full border transition-transform hover:scale-125 ${selLayout?.color === c ? "border-neutral-900 ring-2 ring-offset-1" : "border-neutral-200"}`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={() => setNodeColor(selectedId, null)}
                            className="text-[10px] text-neutral-500 hover:text-neutral-900 ml-1 px-1.5 py-0.5 rounded border border-neutral-200"
                            title="자동 색상으로 복귀"
                        >
                            자동
                        </button>
                        {isCustom && (
                            <button
                                type="button"
                                onClick={() => resetNodePosition(selectedId)}
                                className="text-[10px] text-[#6366F1] hover:bg-[#6366F1]/10 ml-1 px-1.5 py-0.5 rounded border border-[#6366F1]/30"
                                title="자동 레이아웃으로 위치 복귀"
                            >
                                위치 리셋
                            </button>
                        )}
                        {onPromoteText && (
                            <button
                                type="button"
                                onClick={async () => {
                                    const n = findNode(doc.root, selectedId);
                                    if (n && n.text.trim()) {
                                        await onPromoteText(n.text.trim());
                                        // 시각적 피드백을 위해 잠시 색상 변경 등은 생략 — Daily에서 확인
                                    }
                                }}
                                className="text-[10px] text-emerald-700 hover:bg-emerald-50 ml-1 px-1.5 py-0.5 rounded border border-emerald-300"
                                title="이 노드를 Daily Task로 보냄"
                            >
                                ＋Task
                            </button>
                        )}
                    </div>
                );
            })()}

            {/* 도움말 */}
            <div data-mindmap-ui className="absolute bottom-3 left-3 z-20 text-[10px] text-neutral-400 bg-white/80 backdrop-blur px-2 py-1 rounded">
                <Sparkles className="h-2.5 w-2.5 inline mr-1" />
                Tab=자식 · Enter=형제 · Space=접기 · F2=편집 · Delete=삭제 · 노드 드래그=위치 · 휠=확대 · 배경 드래그=이동
            </div>

            {/* Apply 모달 — 프로젝트의 마일스톤으로 변환 */}
            {applyModal?.open && (() => {
                const milestones = doc.root.children;
                return (
                    <div data-mindmap-ui className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 px-4" onClick={() => !applyModal.loading && setApplyModal(null)}>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-[#6366F1]" />
                                    프로젝트로 적용
                                </h3>
                                <button type="button" onClick={() => setApplyModal(null)} className="text-neutral-400 hover:text-neutral-700">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                                {doc.root.text}의 1단계 자식 <strong>{milestones.length}개</strong>를 선택한 프로젝트의 마일스톤으로 변환합니다.
                                손자 노드는 마일스톤 description으로 들어갑니다.
                            </p>

                            {applyModal.result ? (
                                <div className="text-center py-3">
                                    <Check className="h-7 w-7 text-[#6366F1] mx-auto mb-1" />
                                    <p className="text-sm text-neutral-700">
                                        {applyModal.result.count > 0 ? `마일스톤 ${applyModal.result.count}개 추가됨` : "변환 실패"}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">대상 프로젝트</label>
                                        <select
                                            value={applyModal.projectId}
                                            onChange={(e) => setApplyModal({ ...applyModal, projectId: e.target.value })}
                                            disabled={applyModal.loading}
                                            className="w-full text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                                        >
                                            <option value="">— 프로젝트 선택 —</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="max-h-44 overflow-y-auto bg-neutral-50 rounded-md p-2 space-y-1">
                                        {milestones.length === 0 ? (
                                            <p className="text-[11px] text-neutral-400 italic">자식 노드가 없습니다.</p>
                                        ) : milestones.map((m, i) => (
                                            <div key={m.id} className="text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[#6366F1] shrink-0">◆</span>
                                                    <span className="font-medium text-neutral-700">{i + 1}. {m.text}</span>
                                                </div>
                                                {m.children.length > 0 && (
                                                    <ul className="pl-4 mt-0.5 text-[10px] text-neutral-500">
                                                        {m.children.slice(0, 3).map(c => (
                                                            <li key={c.id} className="truncate">- {c.text}</li>
                                                        ))}
                                                        {m.children.length > 3 && <li className="text-neutral-400 italic">... 외 {m.children.length - 3}개</li>}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setApplyModal(null)}
                                    disabled={applyModal.loading}
                                    className="text-xs px-3 py-1.5 border border-neutral-200 rounded-md text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                                >
                                    {applyModal.result ? "닫기" : "취소"}
                                </button>
                                {!applyModal.result && (
                                    <button
                                        type="button"
                                        onClick={applyToProject}
                                        disabled={applyModal.loading || !applyModal.projectId || milestones.length === 0}
                                        className="text-xs px-3 py-1.5 bg-[#6366F1] text-white rounded-md hover:bg-[#4F46E5] disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {applyModal.loading && <Loader2 className="h-3 w-3 animate-spin" />}
                                        적용
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Import 모달 */}
            {importModal?.open && (
                <div data-mindmap-ui className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 px-4" onClick={() => setImportModal(null)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                                <FileInput className="h-4 w-4 text-[#6366F1]" />
                                텍스트에서 마인드맵 import
                            </h3>
                            <button type="button" onClick={() => setImportModal(null)} className="text-neutral-400 hover:text-neutral-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                            마크다운 헤딩(<code className="font-mono bg-neutral-100 px-1 rounded">#·##·###</code>) 또는 들여쓰기 outline(탭/스페이스 2칸). 자동 감지.
                        </p>
                        <textarea
                            value={importModal.text}
                            onChange={(e) => setImportModal({ ...importModal, text: e.target.value, error: undefined })}
                            placeholder={`예: 마크다운\n# 마이버스 OS\n## 채집\n### 사진\n### GPS\n## 분류\n\n또는 들여쓰기\n마이버스 OS\n  채집\n    사진\n    GPS\n  분류`}
                            className="w-full h-44 text-xs font-mono border border-neutral-200 rounded-md px-2 py-2 focus:outline-none focus:border-[#6366F1] resize-none"
                        />
                        {importModal.error && (
                            <p className="text-[11px] text-rose-600">{importModal.error}</p>
                        )}
                        <div className="flex items-center justify-between gap-2 pt-1">
                            <label className="text-[11px] text-neutral-600 flex items-center gap-1.5">
                                <input
                                    type="radio"
                                    name="import-mode"
                                    checked={importModal.mode === "append"}
                                    onChange={() => setImportModal({ ...importModal, mode: "append" })}
                                    className="accent-[#6366F1]"
                                />
                                현재 root에 추가
                            </label>
                            <label className="text-[11px] text-neutral-600 flex items-center gap-1.5">
                                <input
                                    type="radio"
                                    name="import-mode"
                                    checked={importModal.mode === "replace"}
                                    onChange={() => setImportModal({ ...importModal, mode: "replace" })}
                                    className="accent-[#6366F1]"
                                />
                                전체 교체
                            </label>
                            <div className="flex-1" />
                            <button
                                type="button"
                                onClick={() => setImportModal(null)}
                                className="text-xs px-3 py-1.5 border border-neutral-200 rounded-md text-neutral-600 hover:bg-neutral-50"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={doImport}
                                disabled={!importModal.text.trim()}
                                className="text-xs px-3 py-1.5 bg-[#6366F1] text-white rounded-md hover:bg-[#4F46E5] disabled:opacity-50"
                            >
                                import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <svg
                ref={svgRef}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                onMouseDown={onMouseDownBg}
                onWheel={onWheel}
                onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedId(doc.root.id);
                }}
            >
                <g transform={`translate(${(containerRef.current?.clientWidth ?? 800) / 2 + pan.x}, ${(containerRef.current?.clientHeight ?? 600) / 2 + pan.y}) scale(${zoom})`}>
                    {/* 엣지 */}
                    {visibleEdges.map(({ from, to }) => {
                        const a = layout.get(from);
                        const b = layout.get(to);
                        if (!a || !b) return null;
                        const mx = (a.x + b.x) / 2;
                        const d = `M ${a.x} ${a.y} Q ${mx} ${a.y} ${(a.x + b.x) / 2} ${(a.y + b.y) / 2} T ${b.x} ${b.y}`;
                        return <path key={`${from}-${to}`} d={d} stroke={b.color} strokeWidth={1.5} fill="none" strokeOpacity={0.5} />;
                    })}

                    {/* 노드 */}
                    {visibleNodes.map(n => {
                        const L = layout.get(n.id);
                        if (!L) return null;
                        const isRoot = n.id === doc.root.id;
                        const isSelected = selectedId === n.id;
                        const isEditing = editing?.id === n.id;
                        const padX = isRoot ? 16 : 10;
                        const padY = isRoot ? 10 : 6;
                        // 텍스트 폭 추정 (한글 = 12px, 영문 = 7px)
                        const approxW = Math.max(48, n.text.length * (isRoot ? 14 : 11) + padX * 2);
                        const approxH = isRoot ? 36 : 28;
                        const hasKids = n.children.length > 0;
                        return (
                            <g
                                key={n.id}
                                transform={`translate(${L.x - approxW / 2}, ${L.y - approxH / 2})`}
                                onMouseDown={(e) => { if (e.button === 0 && !isRoot) startNodeDrag(e, n.id); }}
                                onClick={(e) => { e.stopPropagation(); setSelectedId(n.id); }}
                                onDoubleClick={(e) => { e.stopPropagation(); setEditing({ id: n.id, value: n.text }); }}
                                style={{ cursor: isRoot ? "pointer" : "grab" }}
                            >
                                <rect
                                    x={0} y={0}
                                    width={approxW} height={approxH}
                                    rx={isRoot ? 12 : 8}
                                    fill={isRoot ? "#0F172A" : "#FFFFFF"}
                                    stroke={isSelected ? "#6366F1" : (L.color)}
                                    strokeWidth={isSelected ? 2 : 1.2}
                                />
                                {isEditing ? (
                                    <foreignObject x={padX / 2} y={padY / 2} width={approxW - padX} height={approxH - padY}>
                                        <input
                                            autoFocus
                                            value={editing!.value}
                                            onChange={(e) => setEditing({ id: n.id, value: e.target.value })}
                                            onBlur={commitEdit}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
                                                else if (e.key === "Escape") setEditing(null);
                                            }}
                                            className="w-full h-full px-1 text-[12px] bg-transparent outline-none text-neutral-900"
                                            style={{ font: "inherit" }}
                                        />
                                    </foreignObject>
                                ) : (
                                    <text
                                        x={approxW / 2}
                                        y={approxH / 2}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="select-none"
                                        fontSize={isRoot ? 14 : 12}
                                        fontWeight={isRoot ? 600 : 500}
                                        fill={isRoot ? "#FFFFFF" : "#1F2937"}
                                    >
                                        {n.text}
                                    </text>
                                )}
                                {/* 접힘 인디케이터 */}
                                {hasKids && n.collapsed && (
                                    <circle cx={approxW - 4} cy={approxH / 2} r={3} fill={L.color} />
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
}
