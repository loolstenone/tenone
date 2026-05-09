"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, X, Check } from "lucide-react";
import { SettingsLivePreview } from "./SettingsLivePreview";
import { LaneHeader } from "@/features/myverse/app/LaneHeader";

export const SETTINGS_TABS = [
    { key: "start",    label: "시작",          href: "/myverse/app/settings/start" },
    { key: "style",    label: "스타일",        href: "/myverse/app/settings/style" },
    { key: "behavior", label: "기능",          href: "/myverse/app/settings/behavior" },
    { key: "tech",     label: "기술",          href: "/myverse/app/settings/tech" },
    { key: "imports",  label: "백업 가져오기", href: "/myverse/app/settings/imports" },
    { key: "privacy",  label: "사생활",        href: "/myverse/app/settings/privacy" },
];

// 하위 호환 — 기존 SETTINGS_GROUPS 를 import 하는 곳이 있으면 빈 배열로 fallback
export type SettingsGroup = { key: string; no: string; label: string; firstSectionId: string };
export const SETTINGS_GROUPS: SettingsGroup[] = [];

interface Props {
    children: React.ReactNode;
    /** toast 메시지 — 각 서브페이지에서 useSettingsSave 결과를 넘김 */
    toast?: { text: string; ok: boolean } | null;
}

export function SettingsLayout({ children, toast }: Props) {
    const pathname = usePathname();
    const isStylePage = pathname.includes("/style");
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = previewOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [previewOpen]);

    return (
        <div className="pp-settings max-w-7xl mx-auto px-5 md:px-6 lg:px-10 py-8" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <LaneHeader
                icon="tune"
                label="SETTINGS"
                title="설정"
                subtitle="모드·스타일·기능·기술·백업·사생활을 한 곳에서 관리합니다"
            />

            {/* ── 탭 nav ── */}
            <nav
                className="sticky top-12 z-30 -mx-4 md:-mx-6 px-4 md:px-6 backdrop-blur mb-6"
                style={{ backgroundColor: "color-mix(in srgb, var(--pp-bg) 92%, transparent)" }}
                aria-label="설정 탭"
            >
                <div
                    className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-neutral-200"
                    style={{ scrollbarWidth: "none" }}
                >
                    {SETTINGS_TABS.map((t, i) => {
                        const active = pathname.startsWith(t.href);
                        const isDivider = i === 4; // 기술 다음에 구분선
                        return (
                            <div key={t.key} className="flex items-center">
                                {isDivider && (
                                    <span className="mx-1 self-center h-4 w-px bg-neutral-200 shrink-0" />
                                )}
                                <Link
                                    href={t.href}
                                    className={`relative shrink-0 px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
                                        active
                                            ? "text-[#6366F1] font-semibold"
                                            : "text-neutral-500 hover:text-neutral-900"
                                    }`}
                                >
                                    {t.label}
                                    {active && (
                                        <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#6366F1]" />
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* ── 본문 ── */}
            <div className={isStylePage ? "xl:grid xl:grid-cols-[1fr_380px] xl:gap-8 xl:items-start" : ""}>
                <main className="min-w-0">
                    {children}
                </main>

                {isStylePage && (
                    <div className="hidden xl:block xl:sticky xl:top-16 xl:self-start xl:h-fit">
                        <SettingsLivePreview />
                    </div>
                )}
            </div>

            {/* 스타일 페이지 모바일 Preview FAB */}
            {isStylePage && (
                <>
                    <button
                        onClick={() => setPreviewOpen(true)}
                        className="xl:hidden fixed bottom-[72px] right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all active:scale-95"
                        style={{ background: "var(--pp-ink)", color: "var(--pp-ink-on)" }}
                        aria-label="Live Preview 열기"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="text-xs font-medium tracking-wide">Preview</span>
                    </button>

                    {previewOpen && (
                        <>
                            <div className="xl:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setPreviewOpen(false)} />
                            <div
                                className="xl:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
                                style={{ maxHeight: "88vh", background: "var(--pp-bg)", borderTop: "1px solid var(--pp-line)" }}
                            >
                                <div className="flex justify-center pt-3 pb-1 shrink-0">
                                    <div className="h-1 w-10 rounded-full" style={{ background: "var(--pp-line-strong)" }} />
                                </div>
                                <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: "1px solid var(--pp-line)" }}>
                                    <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "var(--pp-ink-3)" }}>Live Preview</span>
                                    <button onClick={() => setPreviewOpen(false)} className="p-1.5 rounded-md" style={{ color: "var(--pp-ink-3)" }}>
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                                    <SettingsLivePreview />
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-20 md:bottom-6 right-6 z-[9000] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm ${
                    toast.ok ? "bg-[#6366F1] text-white" : "bg-red-600 text-white"
                }`}>
                    {toast.ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
                    {toast.text}
                </div>
            )}
        </div>
    );
}

/** 하위 호환 — 기존 GroupMarker import 를 쓰는 코드가 있으면 빈 div 반환 */
export function GroupMarker(_: { group: string; label: string; no: string }) {
    return null;
}
