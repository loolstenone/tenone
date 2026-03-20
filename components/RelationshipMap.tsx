"use client";

import { UniverseNode, UniverseLink } from "@/types/universe";
import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

interface Props {
    nodes: UniverseNode[];
    links: UniverseLink[];
}

export function RelationshipMap({ nodes, links }: Props) {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    return (
        <div className="w-full h-[600px] border border-neutral-200 rounded-xl bg-neutral-50 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(#a3a3a3 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            <svg className="w-full h-full">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#a3a3a3" />
                    </marker>
                </defs>

                {/* Links */}
                {links.map((link, i) => {
                    const source = nodes.find(n => n.id === link.source)!;
                    const target = nodes.find(n => n.id === link.target)!;

                    const midX = (source.x + target.x) / 2;
                    const midY = (source.y + target.y) / 2;

                    return (
                        <g key={i}>
                            <line
                                x1={source.x} y1={source.y}
                                x2={target.x} y2={target.y}
                                stroke="#d4d4d4"
                                strokeWidth="1.5"
                                markerEnd="url(#arrowhead)"
                                className="opacity-50"
                            />
                            <text x={midX} y={midY} textAnchor="middle" dy="-5" fontSize="10" fill="#a3a3a3">
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
                                    node.group === 'Core' ? "fill-neutral-900 stroke-neutral-900 stroke-4" :
                                        node.group === 'Branch' ? "fill-white stroke-neutral-400 stroke-2" :
                                            "fill-white stroke-neutral-300 stroke-1 dashed"
                                )}
                            />
                            <foreignObject x="-60" y="30" width="120" height="40">
                                <div className={clsx(
                                    "text-center text-xs font-medium transition-colors",
                                    isHovered ? "text-neutral-900 scale-110" : "text-neutral-500"
                                )}>
                                    {node.label}
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>

            <div className="absolute bottom-4 right-4 bg-white/80 px-4 py-2 rounded-lg border border-neutral-200 text-xs text-neutral-500">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-neutral-900"></span> Core
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full border border-neutral-400 bg-white"></span> Branch
                </div>
            </div>
        </div>
    );
}
