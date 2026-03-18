"use client";

import { UniverseNode, UniverseLink } from "@/types/universe";
import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

interface Props {
    nodes: UniverseNode[];
    links: UniverseLink[];
}

export function RelationshipMap({ nodes, links }: Props) {
    // Simple SVG visualization
    // In a real app, we might use d3.js or react-flow, but for now we use the pre-calculated coordinates
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    return (
        <div className="w-full h-[600px] border border-zinc-800 rounded-xl bg-zinc-950/50 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            <svg className="w-full h-full">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
                    </marker>
                </defs>

                {/* Links */}
                {links.map((link, i) => {
                    const source = nodes.find(n => n.id === link.source)!;
                    const target = nodes.find(n => n.id === link.target)!;

                    // Calculate middle point for label
                    const midX = (source.x + target.x) / 2;
                    const midY = (source.y + target.y) / 2;

                    return (
                        <g key={i}>
                            <line
                                x1={source.x} y1={source.y}
                                x2={target.x} y2={target.y}
                                stroke="#52525b"
                                strokeWidth="1.5"
                                markerEnd="url(#arrowhead)"
                                className="opacity-50"
                            />
                            <text x={midX} y={midY} textAnchor="middle" dy="-5" fontSize="10" fill="#71717a" className="bg-black">
                                {link.label}
                            </text>
                        </g>
                    );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                    const isHovered = hoveredNode === node.id;

                    return (
                        <g
                            key={node.id}
                            transform={`translate(${node.x},${node.y})`}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            className="cursor-pointer transition-all duration-300"
                        >
                            <circle
                                r={isHovered ? 25 : 20}
                                className={clsx(
                                    "transition-all duration-300",
                                    node.group === 'Core' ? "fill-white stroke-indigo-500 stroke-4" :
                                        node.group === 'Branch' ? "fill-zinc-900 stroke-zinc-500 stroke-2" :
                                            "fill-zinc-900 stroke-zinc-700 stroke-1 dashed"
                                )}
                            />
                            <foreignObject x="-60" y="30" width="120" height="40">
                                <div className={clsx(
                                    "text-center text-xs font-medium transition-colors",
                                    isHovered ? "text-white scale-110" : "text-zinc-400"
                                )}>
                                    {node.label}
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>

            <div className="absolute bottom-4 right-4 bg-zinc-900/80 px-4 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full border-2 border-indigo-500 bg-white"></span> Core
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full border border-zinc-500 bg-zinc-900"></span> Branch
                </div>
            </div>
        </div>
    );
}
