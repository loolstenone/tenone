"use client";

/**
 * SettingsLayout — 4그룹 IA를 가진 Settings 페이지 래퍼
 *
 * - PC/태블릿(lg+): 좌측 220px sticky nav + 본문 grid
 * - 모바일(< lg): 상단 sticky 가로 스크롤 pill row
 * - 각 그룹 클릭 → 해당 첫 섹션으로 anchor scroll (scroll-margin-top 으로 헤더 높이만큼 보정)
 */

import { useState, useEffect, useRef } from "react";

export type SettingsGroup = {
    key: "start" | "style" | "behavior" | "tech";
    no: string; // "01" "02" ...
    label: string;
    /** 이 그룹의 첫 섹션 ID (anchor scroll 타겟) */
    firstSectionId: string;
};

export const SETTINGS_GROUPS: SettingsGroup[] = [
    { key: "start",    no: "01", label: "시작",    firstSectionId: "sec-mode" },
    { key: "style",    no: "02", label: "스타일",  firstSectionId: "sec-style-presets" },
    { key: "behavior", no: "03", label: "기능",    firstSectionId: "sec-ai" },
    { key: "tech",     no: "04", label: "기술",    firstSectionId: "sec-integrations" },
];

interface Props {
    children: React.ReactNode;
}

export function SettingsLayout({ children }: Props) {
    const [activeGroup, setActiveGroup] = useState<string>("start");
    const containerRef = useRef<HTMLDivElement | null>(null);

    // 스크롤에 따라 활성 그룹 갱신 (IntersectionObserver — 각 섹션의 data-group 감지)
    useEffect(() => {
        if (!containerRef.current) return;
        const groups = containerRef.current.querySelectorAll<HTMLElement>("[data-group-marker]");
        if (groups.length === 0) return;
        const obs = new IntersectionObserver(
            (entries) => {
                // 가장 위에서 가까운 group marker를 활성으로
                const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) {
                    const k = (visible[0].target as HTMLElement).dataset.groupMarker;
                    if (k) setActiveGroup(k);
                }
            },
            { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
        );
        groups.forEach(g => obs.observe(g));
        return () => obs.disconnect();
    }, []);

    function jumpTo(group: SettingsGroup) {
        const el = document.getElementById(group.firstSectionId);
        if (!el) return;
        // 헤더(상단 sticky 약 48px) + 모바일 pill row(약 40px) 보정은 scroll-margin-top 사용
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveGroup(group.key);
    }

    return (
        <div className="pp-settings max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10" ref={containerRef}>
            {/* ── 모바일 sticky pill row ── */}
            <nav
                className="lg:hidden sticky top-12 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-2 backdrop-blur mb-5"
                style={{
                    backgroundColor: "color-mix(in srgb, var(--pp-bg) 92%, transparent)",
                    borderBottom: "1px solid var(--pp-line-soft)",
                }}
                aria-label="설정 그룹"
            >
                <div
                    className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none" }}
                >
                    {SETTINGS_GROUPS.map(g => {
                        const active = activeGroup === g.key;
                        return (
                            <button
                                key={g.key}
                                onClick={() => jumpTo(g)}
                                className="shrink-0 flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
                                style={{
                                    backgroundColor: active ? "var(--pp-ink)" : "var(--pp-surface-alt)",
                                    color: active ? "var(--pp-ink-on)" : "var(--pp-ink-3)",
                                }}
                            >
                                <span className="font-mono text-[9px] opacity-60">{g.no}</span>
                                {g.label}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* ── 본문 grid (PC: 사이드바 + main, 모바일: 1열). items-start로 aside가 콘텐츠 높이만 차지 ── */}
            <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-10 lg:items-start">
                {/* PC sticky 좌측 nav — aside 자체가 sticky (top-16 = 64px, AppTopNav 48px + 16px 여백) */}
                <aside className="hidden lg:block lg:sticky lg:top-16 lg:self-start lg:h-fit">
                    <nav className="space-y-0.5" aria-label="설정 그룹">
                        <p className="pp-eyebrow mb-3 px-2">Sections</p>
                        {SETTINGS_GROUPS.map(g => {
                            const active = activeGroup === g.key;
                            return (
                                <button
                                    key={g.key}
                                    onClick={() => jumpTo(g)}
                                    className="group w-full flex items-baseline gap-2 px-2 py-1.5 rounded text-left transition-colors"
                                    style={{ color: active ? "var(--pp-ink)" : "var(--pp-ink-3)" }}
                                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--pp-ink)"; }}
                                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--pp-ink-3)"; }}
                                >
                                    <span
                                        className="font-mono text-[10px] tracking-widest"
                                        style={{ color: active ? "var(--pp-ink)" : "var(--pp-ink-4)" }}
                                    >
                                        {g.no}
                                    </span>
                                    <span className={`text-sm ${active ? "font-semibold" : "font-normal"}`}>
                                        {g.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* main content — 자식이 직접 섹션 그리고 그룹 마커는 자식에서 삽입 */}
                <main className="min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}

/**
 * GroupMarker — 각 그룹의 시작 지점 표시 + IntersectionObserver 타겟
 */
export function GroupMarker({ group, label, no }: { group: SettingsGroup["key"]; label: string; no: string }) {
    return (
        <div
            data-group-marker={group}
            className="pt-2 pb-1 mt-2 first:mt-0"
        >
            {/* IntersectionObserver는 wrapper 자체를 관찰. 시각 라벨은 모바일에서만 노출 (PC는 좌측 nav가 담당) */}
            <p className="pp-eyebrow lg:opacity-0 lg:select-none lg:pointer-events-none">{no} · {label}</p>
        </div>
    );
}
