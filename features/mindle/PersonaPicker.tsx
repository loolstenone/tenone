// Mindle 페르소나 4종 진입 카드 — Phase 1-C
// /mindle Hero 아래 노출 + 클릭 시 ?persona=founder 등으로 이동

import Link from "next/link";
import { Briefcase, Lightbulb, Newspaper, Megaphone, User, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MindlePersona } from "@/lib/mindle/personas";

const ICON_MAP: Record<string, LucideIcon> = {
    Briefcase, Lightbulb, Newspaper, Megaphone, User,
};

interface PersonaPickerProps {
    personas: MindlePersona[];
    activePersona?: string | null;
}

export default function PersonaPicker({ personas, activePersona }: PersonaPickerProps) {
    if (personas.length === 0) return null;

    return (
        <section className="px-6 pb-10">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white">
                        {activePersona ? "다른 페르소나로 보기" : "어떤 시각으로 볼까요?"}
                    </h2>
                    {activePersona && (
                        <Link
                            href="/mindle"
                            className="text-[11px] text-indigo-400 hover:text-indigo-300"
                        >
                            전체로 돌아가기 →
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {personas.map(p => {
                        const Icon = ICON_MAP[p.icon_name] ?? User;
                        const isActive = activePersona === p.key;
                        const accent = p.accent_color ?? "#6366f1";
                        return (
                            <Link
                                key={p.key}
                                href={isActive ? "/mindle" : `/mindle?persona=${p.key}`}
                                className={`group relative rounded-xl border p-4 transition-all overflow-hidden ${
                                    isActive
                                        ? "border-white/30 bg-white/[0.06]"
                                        : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                                }`}
                                style={isActive ? { boxShadow: `inset 0 0 0 1px ${accent}40` } : undefined}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                    style={{ background: `${accent}15`, color: accent }}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-white font-bold text-sm mb-1 leading-snug">
                                    {p.name_ko}
                                </h3>
                                {p.tagline && (
                                    <p className="text-[11px] text-indigo-300/50 leading-relaxed line-clamp-2 mb-2">
                                        {p.tagline}
                                    </p>
                                )}
                                <div className="flex items-center gap-1 text-[10px] text-indigo-400/40">
                                    {isActive ? (
                                        <span className="font-semibold" style={{ color: accent }}>
                                            현재 보고 있음
                                        </span>
                                    ) : (
                                        <>
                                            <span>{p.description}</span>
                                            <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <p className="mt-3 text-[10px] text-indigo-400/30">
                    🔬 페르소나 선택 시 기본 카테고리 {personas[0]?.default_categories.length ?? 4}~5종에 가중치를 둬 노출 · Phase 2에서 뉴스레터·구독 페르소나별 분리 발송 도입 예정
                </p>
            </div>
        </section>
    );
}
