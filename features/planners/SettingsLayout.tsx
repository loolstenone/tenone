"use client";

/**
 * SettingsLayout — 4그룹 IA를 가진 Settings 페이지 래퍼
 *
 * - PC/태블릿(lg+): 좌측 220px sticky nav + 본문 grid
 * - 모바일(< lg): 상단 sticky 가로 스크롤 pill row
 * - 모바일(<xl): 우측 하단 FAB → 바텀시트로 Live Preview 오픈
 * - xl+: 우측 sticky Live Preview 패널 (FAB/바텀시트 숨김)
 * - 각 그룹 클릭 → 해당 첫 섹션으로 anchor scroll (scroll-margin-top 으로 헤더 높이만큼 보정)
 */

import { useState, useEffect, useRef } from "react";
import { Eye, X } from "lucide-react";
import { SettingsLivePreview } from "./SettingsLivePreview";

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
    const [previewOpen, setPreviewOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // 바텀시트 열릴 때 body 스크롤 잠금
    useEffect(() => {
        if (previewOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [previewOpen]);

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
        <div className="pp-settings max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10" ref={containerRef}>
            {/* ── 모바일 sticky 탭 row ── */}
            <nav
                className="lg:hidden sticky top-12 z-30 -mx-4 md:-mx-6 px-4 md:px-6 backdrop-blur mb-5"
                style={{ backgroundColor: "color-mix(in srgb, var(--pp-bg) 92%, transparent)" }}
                aria-label="설정 그룹"
            >
                <div
                    className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-neutral-200"
                    style={{ scrollbarWidth: "none" }}
                >
                    {SETTINGS_GROUPS.map(g => {
                        const active = activeGroup === g.key;
                        return (
                            <button
                                key={g.key}
                                onClick={() => jumpTo(g)}
                                className={`relative shrink-0 flex items-baseline gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
                                    active ? "text-[#6366F1] font-semibold" : "text-neutral-500 hover:text-neutral-900"
                                }`}
                            >
                                <span className="font-mono text-[10px] tracking-widest opacity-60">{g.no}</span>
                                {g.label}
                                {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#6366F1]" />}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* ── 본문 grid ──
                  모바일(<lg): 1열 (preview 미표시)
                  lg(1024+): 2열 (사이드바 + main)
                  xl(1280+): 3열 (사이드바 + main + Live Preview)
                  items-start로 aside·preview가 콘텐츠 높이만 차지 (sticky 정상 작동) */}
            <div className="lg:grid lg:grid-cols-[200px_1fr] xl:grid-cols-[200px_1fr_380px] lg:gap-8 lg:items-start">
                {/* PC sticky 좌측 nav */}
                <aside className="hidden lg:block lg:sticky lg:top-16 lg:self-start lg:h-fit">
                    <nav className="space-y-0.5" aria-label="설정 그룹">
                        <p className="pp-eyebrow mb-3 px-2">Sections</p>
                        {SETTINGS_GROUPS.map(g => {
                            const active = activeGroup === g.key;
                            return (
                                <button
                                    key={g.key}
                                    onClick={() => jumpTo(g)}
                                    className={`w-full flex items-baseline gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                                        active ? "text-[#6366F1]" : "text-neutral-400 hover:text-neutral-800"
                                    }`}
                                >
                                    <span className="font-mono text-[10px] tracking-widest opacity-70">
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

                {/* main content */}
                <main className="min-w-0">
                    {children}
                </main>

                {/* xl+ 우측 Live Preview 패널 */}
                <div className="hidden xl:block xl:sticky xl:top-16 xl:self-start xl:h-fit">
                    <SettingsLivePreview />
                </div>
            </div>

            {/* ── 모바일 FAB (< xl 에서만 노출) ── */}
            <button
                onClick={() => setPreviewOpen(true)}
                className="xl:hidden fixed bottom-[72px] right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all active:scale-95"
                style={{
                    background: "var(--pp-ink)",
                    color: "var(--pp-ink-on)",
                }}
                aria-label="Live Preview 열기"
            >
                <Eye className="h-4 w-4" />
                <span className="text-xs font-medium tracking-wide">Preview</span>
            </button>

            {/* ── 바텀시트 오버레이 ── */}
            {previewOpen && (
                <>
                    {/* 백드롭 */}
                    <div
                        className="xl:hidden fixed inset-0 z-40 bg-black/60"
                        onClick={() => setPreviewOpen(false)}
                    />

                    {/* 시트 패널 */}
                    <div
                        className="xl:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
                        style={{
                            maxHeight: "88vh",
                            background: "var(--pp-bg)",
                            borderTop: "1px solid var(--pp-line)",
                            animation: "pp-sheet-up 260ms cubic-bezier(0.32,0.72,0,1)",
                        }}
                    >
                        {/* 드래그 핸들 */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                            <div
                                className="h-1 w-10 rounded-full"
                                style={{ background: "var(--pp-line-strong)" }}
                            />
                        </div>

                        {/* 시트 헤더 */}
                        <div
                            className="flex items-center justify-between px-5 py-3 shrink-0"
                            style={{ borderBottom: "1px solid var(--pp-line)" }}
                        >
                            <span
                                className="text-[10px] font-mono uppercase tracking-[0.2em]"
                                style={{ color: "var(--pp-ink-3)" }}
                            >
                                Live Preview
                            </span>
                            <button
                                onClick={() => setPreviewOpen(false)}
                                className="p-1.5 rounded-md transition-colors"
                                style={{ color: "var(--pp-ink-3)" }}
                                aria-label="닫기"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* 스크롤 가능 본문 */}
                        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                            <SettingsLivePreview />
                        </div>
                    </div>
                </>
            )}
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
            <p className="pp-eyebrow lg:opacity-0 lg:select-none lg:pointer-events-none">{label}</p>
        </div>
    );
}
