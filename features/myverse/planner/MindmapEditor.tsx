"use client";

// 마인드맵 에디터 — 캔버스 위에 SVG로 방사형 노드 렌더.
// 자동 레이아웃: root는 중앙, 1단계는 360° 균등, 깊은 단계는 부모 각도 영역 안에서 분기.
// 키보드:
//   Enter = 형제 추가 / Tab = 자식 추가 / Delete = 노드 삭제 / Space = 접기 토글
//   더블클릭/F2 = 편집 / Esc = 편집 종료
// 자동 저장: 1.5초 디바운스 (CanvasEditor와 동일 패턴)

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Sparkles, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

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
    className = "",
}: {
    initialDoc?: MindmapDoc;
    onSave?: (doc: MindmapDoc) => void;
    className?: string;
}) {
    const [doc, setDoc] = useState<MindmapDoc>(initialDoc ?? emptyDoc());
    const [selectedId, setSelectedId] = useState<string>(initialDoc?.root.id ?? doc.root.id);
    const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
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

    return (
        <div ref={containerRef} className={`relative w-full h-full overflow-hidden bg-neutral-50 ${className}`}>
            {/* 툴바 */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white border border-neutral-200 rounded-lg shadow-sm px-1.5 py-1 text-xs">
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
                <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-1 rounded hover:bg-neutral-100" title="확대"><ZoomIn className="h-3 w-3" /></button>
                <button type="button" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="p-1 rounded hover:bg-neutral-100" title="축소"><ZoomOut className="h-3 w-3" /></button>
                <button type="button" onClick={resetView} className="p-1 rounded hover:bg-neutral-100" title="중앙 정렬"><Maximize2 className="h-3 w-3" /></button>
            </div>

            {/* 색상 picker — 선택된 노드 있을 때 우상단 */}
            {selectedId && selectedId !== doc.root.id && (() => {
                const selNode = findNode(doc.root, selectedId);
                if (!selNode) return null;
                const selLayout = layout.get(selectedId);
                const isCustom = !!selNode.position;
                return (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg shadow-sm px-2 py-1.5 text-xs">
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
                    </div>
                );
            })()}

            {/* 도움말 */}
            <div className="absolute bottom-3 left-3 z-20 text-[10px] text-neutral-400 bg-white/80 backdrop-blur px-2 py-1 rounded">
                <Sparkles className="h-2.5 w-2.5 inline mr-1" />
                Tab=자식 · Enter=형제 · Space=접기 · F2=편집 · Delete=삭제 · 노드 드래그=위치 · 휠=확대 · 배경 드래그=이동
            </div>

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
