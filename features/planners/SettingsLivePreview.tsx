"use client";

/**
 * SettingsLivePreview — 우측 sticky 라이브 프리뷰 (xl+)
 *
 * 핸드오프 디자인의 우측 480px 패널. 사용자가 컬러·모서리·폰트·다크모드를 바꾸면
 * 즉시 시각적으로 반영된다. 전부 CSS 변수(--pp-*, --planners-accent, --planners-font,
 * --planners-user-font, html.planners-dark)를 통해 자동 갱신되므로 별도 props 불필요.
 *
 * 3개 탭: Daily · Project · AI
 */

import { useState } from "react";
import { Check } from "lucide-react";

export function SettingsLivePreview() {
    const [tab, setTab] = useState<"daily" | "project" | "ai">("daily");

    return (
        <div
            className="rounded-xl overflow-hidden flex flex-col transition-all"
            style={{
                background: "var(--pp-bg)",
                border: "1px solid var(--pp-line)",
                color: "var(--pp-ink)",
            }}
        >
            {/* Header — eyebrow */}
            <div
                className="px-5 pt-4 pb-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--pp-line)" }}
            >
                <span className="pp-eyebrow">Live preview</span>
                <span className="pp-eyebrow opacity-50">즉시 반영</span>
            </div>

            {/* Tabs */}
            <div className="flex" style={{ borderBottom: "1px solid var(--pp-line)" }}>
                {([
                    { key: "daily" as const,   label: "Daily" },
                    { key: "project" as const, label: "Project" },
                    { key: "ai" as const,      label: "AI Briefing" },
                ]).map((t) => {
                    const active = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className="flex-1 px-3 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] transition-colors relative"
                            style={{
                                color: active ? "var(--pp-ink)" : "var(--pp-ink-3)",
                            }}
                        >
                            {t.label}
                            {active && (
                                <span
                                    className="absolute left-0 right-0 bottom-0 h-px"
                                    style={{ background: "var(--pp-ink)" }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 p-5 min-h-[420px]">
                {tab === "daily" && <DailyTab />}
                {tab === "project" && <ProjectTab />}
                {tab === "ai" && <AiTab />}
            </div>

            {/* Stamp footer */}
            <div
                className="px-5 py-3"
                style={{ borderTop: "1px solid var(--pp-line)" }}
            >
                <p className="pp-eyebrow">현재 토큰 · 색상 · 모서리 · 폰트 · 모드</p>
            </div>
        </div>
    );
}

// ── Daily ───────────────────────────────────────────────────
function DailyTab() {
    const todos = [
        { text: "AI 마케팅 특강 자료 정리", done: true },
        { text: "Q2 OKR 리뷰 미팅 14:00", done: true },
        { text: "주간 회고 작성", done: false },
        { text: "독서 30분 — 디자인 시스템", done: false },
    ];
    return (
        <div className="space-y-4">
            <div className="flex items-baseline justify-between">
                <span className="pp-eyebrow">2026</span>
                <span className="pp-eyebrow">WED · 청명</span>
            </div>
            <h3
                className="font-serif text-[32px] leading-tight"
                style={{ letterSpacing: "-0.02em", color: "var(--pp-ink)" }}
            >
                4월 29일
            </h3>
            <p className="pp-eyebrow opacity-70">음력 3월 13일 · W18</p>

            <div
                className="border-l-2 pl-3 italic text-sm leading-relaxed py-1"
                style={{
                    borderColor: "var(--pp-accent)",
                    fontFamily: "var(--planners-user-font, Georgia, serif)",
                    color: "var(--pp-ink-2)",
                }}
            >
                덜어낸 자리에 품격이 머문다.
            </div>

            <div className="space-y-2 pt-1">
                <p className="pp-eyebrow">오늘의 할 일</p>
                {todos.map((t, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                        <span
                            className="h-3.5 w-3.5 rounded-sm flex items-center justify-center shrink-0"
                            style={{
                                background: t.done ? "var(--pp-accent)" : "transparent",
                                border: `1px solid ${t.done ? "var(--pp-accent)" : "var(--pp-line-strong)"}`,
                            }}
                        >
                            {t.done && <Check className="h-2.5 w-2.5" style={{ color: "var(--pp-ink-on)" }} strokeWidth={3} />}
                        </span>
                        <span
                            className={t.done ? "line-through" : ""}
                            style={{
                                color: t.done ? "var(--pp-ink-4)" : "var(--pp-ink)",
                                fontFamily: "var(--planners-user-font, inherit)",
                            }}
                        >
                            {t.text}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
                <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                    style={{ background: "var(--pp-accent)", color: "var(--pp-ink-on)" }}
                >
                    에너지 4
                </span>
                <span
                    className="px-2.5 py-1 rounded-full text-[10px]"
                    style={{ background: "var(--pp-surface-alt)", color: "var(--pp-ink-3)" }}
                >
                    만족 5
                </span>
                <span
                    className="px-2.5 py-1 rounded-full text-[10px]"
                    style={{ background: "var(--pp-surface-alt)", color: "var(--pp-ink-3)" }}
                >
                    운동 30′
                </span>
            </div>
        </div>
    );
}

// ── Project ─────────────────────────────────────────────────
function ProjectTab() {
    return (
        <div className="space-y-5">
            <p
                className="text-[10px] font-mono uppercase tracking-[0.2em]"
                style={{ color: "var(--pp-accent)" }}
            >
                Project · Active
            </p>
            <h3
                className="font-serif text-[24px] leading-tight"
                style={{ letterSpacing: "-0.01em", color: "var(--pp-ink)" }}
            >
                Visual Migration<br />Maison v3
            </h3>
            <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                    { label: "Tasks", value: "17" },
                    { label: "Done",  value: "11" },
                    { label: "Days",  value: "8"  },
                ].map((s) => (
                    <div key={s.label}>
                        <p className="pp-eyebrow">{s.label}</p>
                        <p
                            className="font-serif text-[22px] mt-0.5"
                            style={{ color: "var(--pp-ink)", letterSpacing: "-0.02em" }}
                        >
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>
            <div className="pt-2">
                <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "var(--pp-surface-alt)" }}
                >
                    <div
                        className="h-full transition-[width] duration-500"
                        style={{ width: "64%", background: "var(--pp-accent)" }}
                    />
                </div>
                <p className="pp-eyebrow mt-2">PROGRESS · 64%</p>
            </div>

            {/* 미니 task 목록 */}
            <div className="pt-1 space-y-1.5">
                {[
                    { text: "토큰 시스템 적용", done: true },
                    { text: "다크모드 매핑", done: true },
                    { text: "라이브 프리뷰 설계", done: false },
                ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span
                            className="h-3 w-3 rounded-sm flex items-center justify-center shrink-0"
                            style={{
                                background: t.done ? "var(--pp-accent)" : "transparent",
                                border: `1px solid ${t.done ? "var(--pp-accent)" : "var(--pp-line-strong)"}`,
                            }}
                        >
                            {t.done && <Check className="h-2 w-2" style={{ color: "var(--pp-ink-on)" }} strokeWidth={3} />}
                        </span>
                        <span style={{ color: t.done ? "var(--pp-ink-4)" : "var(--pp-ink-2)" }}>
                            {t.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── AI Briefing ─────────────────────────────────────────────
function AiTab() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--pp-accent)" }}
                />
                <span className="pp-eyebrow">Morning Briefing · 08:00</span>
            </div>
            <h3
                className="font-serif text-[22px] leading-tight"
                style={{ letterSpacing: "-0.01em", color: "var(--pp-ink)" }}
            >
                오늘은 집중하기 좋은 날
            </h3>
            <p
                className="text-sm leading-[1.7]"
                style={{
                    color: "var(--pp-ink-2)",
                    fontFamily: "var(--planners-user-font, inherit)",
                }}
            >
                오전엔{" "}
                <strong style={{ color: "var(--pp-ink)", fontWeight: 600 }}>
                    AI 마케팅 특강 자료 정리
                </strong>
                를 끝내고, 14:00{" "}
                <strong style={{ color: "var(--pp-ink)", fontWeight: 600 }}>
                    Q2 OKR 리뷰 미팅
                </strong>
                에 들어가세요. 에너지가 평소보다 높습니다 — 어려운 일을 먼저 처리하기 좋은 날입니다.
            </p>

            <div
                className="rounded-md p-3 mt-2"
                style={{ background: "var(--pp-surface-alt)" }}
            >
                <p className="pp-eyebrow mb-1.5">Today&apos;s focus</p>
                <p
                    className="text-xs leading-relaxed"
                    style={{
                        color: "var(--pp-ink-2)",
                        fontFamily: "var(--planners-user-font, inherit)",
                    }}
                >
                    회의 사이 30분 빈 슬롯 두 번. 짧은 회고 한 편 정도가 들어갑니다.
                </p>
            </div>

            <div
                className="text-[11px] flex items-center gap-1.5 pt-1"
                style={{ color: "var(--pp-ink-3)" }}
            >
                <span
                    className="px-2 py-0.5 rounded font-mono uppercase tracking-widest text-[9px]"
                    style={{
                        background: "var(--pp-accent)",
                        color: "var(--pp-ink-on)",
                    }}
                >
                    Haiku 4.5
                </span>
                <span>· 친근함 톤 · 컨텍스트 4종</span>
            </div>
        </div>
    );
}
