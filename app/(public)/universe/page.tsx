"use client";

import { useState } from "react";
import { brands } from "@/lib/data";
import { Globe, ArrowRight, Sparkles, Zap, Users, TrendingUp, Briefcase, Target, RefreshCw } from "lucide-react";

const flywheelSteps = [
    { label: "신뢰 기반\n네트워크", icon: Users, color: "text-indigo-400" },
    { label: "자발적 참여\n와 공유", icon: Sparkles, color: "text-purple-400" },
    { label: "프로젝트", icon: Target, color: "text-blue-400" },
    { label: "성공 경험", icon: TrendingUp, color: "text-emerald-400" },
    { label: "기회 발견", icon: Globe, color: "text-cyan-400" },
    { label: "비즈니스", icon: Briefcase, color: "text-amber-400" },
    { label: "지속 성장", icon: Zap, color: "text-orange-400" },
];

const universeNodes = [
    { id: 'tenone', x: 400, y: 250, label: 'Ten:One™', group: 'core' },
    { id: 'madleague', x: 200, y: 150, label: 'MAD League', group: 'platform' },
    { id: 'madleap', x: 120, y: 280, label: 'MADLeap', group: 'platform' },
    { id: 'badak', x: 600, y: 150, label: 'Badak', group: 'network' },
    { id: 'youinone', x: 620, y: 320, label: 'YouInOne', group: 'network' },
    { id: 'hero', x: 400, y: 420, label: 'HeRo', group: 'service' },
    { id: 'rook', x: 250, y: 400, label: 'RooK', group: 'content' },
    { id: 'luki', x: 180, y: 380, label: 'LUKI', group: 'content' },
    { id: 'fwn', x: 550, y: 420, label: 'FWN', group: 'content' },
    { id: '0gamja', x: 680, y: 250, label: '0gamja', group: 'content' },
];

const universeLinks = [
    { source: 'tenone', target: 'madleague' },
    { source: 'tenone', target: 'badak' },
    { source: 'tenone', target: 'youinone' },
    { source: 'tenone', target: 'hero' },
    { source: 'madleague', target: 'madleap' },
    { source: 'youinone', target: 'madleague' },
    { source: 'badak', target: 'youinone' },
    { source: 'hero', target: 'rook' },
    { source: 'hero', target: 'luki' },
    { source: 'tenone', target: 'fwn' },
    { source: 'tenone', target: '0gamja' },
];

const groupColors: Record<string, string> = {
    core: '#6366f1',
    platform: '#22c55e',
    network: '#eab308',
    service: '#f97316',
    content: '#a855f7',
};

export default function UniversePage() {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const getNode = (id: string) => universeNodes.find(n => n.id === id);

    return (
        <div className="space-y-24">
            {/* Hero */}
            <section className="pt-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 mb-6">
                    <Globe className="h-4 w-4 text-indigo-400" />
                    멀티 유니버스를 여행하는 히치하이커를 위한 안내서
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Universe</h1>
                <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
                    각 유니버스는 고유한 본질(Essence)을 가지고 있으며,
                    하나의 거대한 선순환 생태계로 연결되어 있습니다.
                </p>
            </section>

            {/* Interactive Brand Map */}
            <section>
                <h2 className="text-2xl font-bold text-white text-center mb-8">Brand Relationship Map</h2>
                <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
                    <svg viewBox="0 0 800 500" className="w-full h-auto">
                        <defs>
                            <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(99,102,241,0.05)" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                        </defs>
                        <rect width="800" height="500" fill="url(#bg-grad)" />

                        {universeLinks.map((link, i) => {
                            const s = getNode(link.source);
                            const t = getNode(link.target);
                            if (!s || !t) return null;
                            const isHighlighted = hoveredNode === link.source || hoveredNode === link.target;
                            return (
                                <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                                    stroke={isHighlighted ? '#6366f1' : '#27272a'}
                                    strokeWidth={isHighlighted ? 2 : 1}
                                    opacity={hoveredNode && !isHighlighted ? 0.2 : 1}
                                />
                            );
                        })}

                        {universeNodes.map((node) => {
                            const isHovered = hoveredNode === node.id;
                            const brand = brands.find(b => b.id === node.id);
                            return (
                                <g key={node.id}
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    className="cursor-pointer"
                                    opacity={hoveredNode && !isHovered ? 0.4 : 1}
                                >
                                    <circle cx={node.x} cy={node.y}
                                        r={node.group === 'core' ? 30 : isHovered ? 25 : 20}
                                        fill={isHovered ? groupColors[node.group] : '#18181b'}
                                        stroke={groupColors[node.group]}
                                        strokeWidth={isHovered ? 3 : 1.5}
                                        className="transition-all duration-200"
                                    />
                                    <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle"
                                        fill="white" fontSize={node.group === 'core' ? 11 : 9} fontWeight="bold">
                                        {node.label}
                                    </text>
                                    {isHovered && brand?.tagline && (
                                        <text x={node.x} y={node.y + (node.group === 'core' ? 45 : 35)} textAnchor="middle"
                                            fill="#a1a1aa" fontSize={10}>
                                            {brand.tagline.length > 25 ? brand.tagline.slice(0, 25) + '...' : brand.tagline}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    <div className="flex justify-center gap-6 p-4 border-t border-zinc-800">
                        {[{ label: 'Core', color: '#6366f1' }, { label: 'Platform', color: '#22c55e' }, { label: 'Network', color: '#eab308' }, { label: 'Service', color: '#f97316' }, { label: 'Content', color: '#a855f7' }].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                                <span className="text-xs text-zinc-500">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Flywheel */}
            <section>
                <h2 className="text-2xl font-bold text-white text-center mb-4">Ten:One™ Wheel</h2>
                <p className="text-center text-zinc-400 text-sm mb-12">실행은 연결을 가속하고, 연결은 더 많은 기회를 만든다.</p>

                <div className="max-w-3xl mx-auto flex items-center justify-center">
                    <div className="relative">
                        <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
                            {flywheelSteps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center min-w-[120px]">
                                        <step.icon className={`h-6 w-6 mx-auto mb-2 ${step.color}`} />
                                        <p className="text-xs text-zinc-300 whitespace-pre-line leading-tight">{step.label}</p>
                                    </div>
                                    {idx < flywheelSteps.length - 1 && (
                                        <ArrowRight className="h-4 w-4 text-zinc-600 shrink-0" />
                                    )}
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 text-indigo-500" />
                                <span className="text-xs text-indigo-400">순환</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision House */}
            <section>
                <h2 className="text-2xl font-bold text-white text-center mb-12">Vision House</h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6 text-center">
                        <p className="text-xs text-indigo-400 uppercase tracking-wider">Declaration</p>
                        <p className="text-sm text-zinc-300 mt-2">빠르게 변하는 세상 속에서 우물쭈물 하지 않고 도전을 선언한다.</p>
                    </div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 p-6 text-center">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Philosophy</p>
                        <p className="text-white font-medium mt-2">변하지 않을 가치에 집중하여 더 큰 가치를 창출한다</p>
                    </div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 p-6 text-center">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Mission</p>
                        <p className="text-white font-medium mt-2">기획하고, 연결하고, 확장한다. Plan. Connect. Expand.</p>
                    </div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 p-6 text-center">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Vision</p>
                        <p className="text-white font-medium mt-2">10,000명의 기획자를 발굴하고 연결한다</p>
                        <p className="text-sm text-zinc-400 mt-1">Who is the Next?</p>
                    </div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 p-6 text-center">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Strategy</p>
                        <p className="text-white font-medium mt-2">약한 연결 고리로 빠르게 조직하고 일이 되게 한다</p>
                        <p className="text-xs text-zinc-500 mt-1">Quickly Organize & Make it Work</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
