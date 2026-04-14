"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WIKI_CATEGORIES, type WikiGraphNode, type WikiGraphEdge } from "@/types/wiki";

export default function WikiGraphPage() {
    const svgRef = useRef<SVGSVGElement>(null);
    const [nodes, setNodes] = useState<WikiGraphNode[]>([]);
    const [edges, setEdges] = useState<WikiGraphEdge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<WikiGraphNode | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/wiki/search-index").then(r => r.json()),
            fetch("/api/wiki/graph-data").then(r => r.json()),
        ]).then(([searchData, graphData]) => {
            const categoryKeys = Object.keys(WIKI_CATEGORIES);
            const graphNodes: WikiGraphNode[] = (searchData.items || []).map((item: { slug: string; title: string; category: string }) => ({
                id: item.slug,
                label: item.title,
                category: item.category,
                group: categoryKeys.indexOf(item.category) >= 0 ? categoryKeys.indexOf(item.category) : 9,
            }));
            setNodes(graphNodes);
            setEdges(graphData.links || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!svgRef.current || nodes.length === 0) return;

        // 간단한 force layout 시뮬레이션 (D3 없이도 기본 동작)
        const svg = svgRef.current;
        const width = svg.clientWidth || 800;
        const height = svg.clientHeight || 600;

        // 노드 위치 배치 (원형 배치)
        const positioned = nodes.map((node, i) => {
            const angle = (2 * Math.PI * i) / nodes.length;
            const radius = Math.min(width, height) * 0.35;
            return {
                ...node,
                x: width / 2 + radius * Math.cos(angle),
                y: height / 2 + radius * Math.sin(angle),
            };
        });

        // SVG 클리어
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        // 엣지 그리기
        for (const edge of edges) {
            const source = positioned.find(n => n.id === edge.source);
            const target = positioned.find(n => n.id === edge.target);
            if (source && target) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", String(source.x));
                line.setAttribute("y1", String(source.y));
                line.setAttribute("x2", String(target.x));
                line.setAttribute("y2", String(target.y));
                line.setAttribute("stroke", "#e5e5e5");
                line.setAttribute("stroke-width", "1");
                svg.appendChild(line);
            }
        }

        // 노드 그리기
        const categoryColors = Object.values(WIKI_CATEGORIES).map(c => c.color);
        for (const node of positioned) {
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.style.cursor = "pointer";
            g.onclick = () => setSelectedNode(node);

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", String(node.x));
            circle.setAttribute("cy", String(node.y));
            circle.setAttribute("r", "6");
            circle.setAttribute("fill", categoryColors[node.group] || "#737373");

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", String(node.x));
            text.setAttribute("y", String(node.y + 16));
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-size", "9");
            text.setAttribute("fill", "#737373");
            text.textContent = node.label.length > 10 ? node.label.slice(0, 10) + "..." : node.label;

            g.appendChild(circle);
            g.appendChild(text);
            svg.appendChild(g);
        }
    }, [nodes, edges]);

    return (
        <div>
            <h1 className="text-lg font-bold mb-1">관계 그래프</h1>
            <p className="text-xs text-neutral-400 mb-4">
                페이지 간 연결을 시각화합니다. 노드를 클릭하면 해당 페이지로 이동합니다.
            </p>

            {/* 카테고리 범례 */}
            <div className="flex flex-wrap gap-3 mb-4">
                {Object.entries(WIKI_CATEGORIES).map(([, cat]) => (
                    <div key={cat.label} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[10px] text-neutral-500">{cat.label}</span>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="border border-neutral-200 bg-white p-16 text-center">
                    <p className="text-xs text-neutral-400">로딩 중...</p>
                </div>
            ) : nodes.length === 0 ? (
                <div className="border border-neutral-200 bg-white p-16 text-center">
                    <p className="text-xs text-neutral-400">아직 페이지가 없습니다</p>
                </div>
            ) : (
                <div className="border border-neutral-200 bg-white relative">
                    <svg ref={svgRef} className="w-full" style={{ height: 500 }} />
                    {selectedNode && (
                        <div className="absolute bottom-4 left-4 bg-white border border-neutral-300 shadow-sm p-3 rounded">
                            <p className="text-xs font-medium">{selectedNode.label}</p>
                            <p className="text-[10px] text-neutral-400">{selectedNode.category}</p>
                            <Link href={`/wiki/${selectedNode.id}`} className="text-[10px] text-neutral-600 underline mt-1 block">
                                페이지로 이동 →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
