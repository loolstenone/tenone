"use client";

/**
 * SettingsLivePreview — 우측 sticky 라이브 프리뷰 (xl+)
 *
 * 핸드오프 디자인의 우측 패널. 사용자가 컬러·모서리·폰트·다크모드를 바꾸면
 * 즉시 시각적으로 반영된다. 전부 CSS 변수(--pp-*, --planners-accent, --planners-font,
 * --planners-user-font, html.myverse-dark)를 통해 자동 갱신되므로 별도 props 불필요.
 *
 * 3개 탭: 일간 · 프로젝트 · AI
 */

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

export function SettingsLivePreview() {
    const [tab, setTab] = useState<"daily" | "project" | "ai">("daily");

    return (
        <div
            className="pp-view rounded-xl overflow-hidden flex flex-col transition-all"
            style={{
                background: "var(--pp-bg)",
                border: "1px solid var(--pp-line)",
                color: "var(--pp-ink)",
                height: "440px",
            }}
        >
            {/* Header — eyebrow */}
            <div
                className="px-5 pt-4 pb-3 shrink-0 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--pp-line)" }}
            >
                <span className="pp-eyebrow">즉시 반영 미리 보기</span>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0" style={{ borderBottom: "1px solid var(--pp-line)" }}>
                {([
                    { key: "daily" as const,   label: "일간" },
                    { key: "project" as const, label: "프로젝트" },
                    { key: "ai" as const,      label: "AI 브리핑" },
                ]).map((t) => {
                    const active = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className="flex-1 px-3 py-2.5 text-[13px] font-mono uppercase tracking-[0.2em] transition-colors relative"
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

            {/* Content — scrollable, no visible scrollbar */}
            <div
                className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
            >
                {tab === "daily" && <DailyTab />}
                {tab === "project" && <ProjectTab />}
                {tab === "ai" && <AiTab />}
            </div>

            {/* Stamp footer */}
            <div
                className="px-5 py-2.5 shrink-0"
                style={{ borderTop: "1px solid var(--pp-line)" }}
            >
                <p className="pp-eyebrow">현재 토큰 · 색상 · 모서리 · 폰트 · 모드</p>
            </div>
        </div>
    );
}

// ── 일간 ─────────────────────────────────────────────────────
function DailyTab() {
    return (
        <div className="space-y-1.5">
            {/* ── 날짜 헤더 ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <ChevronLeft className="h-3.5 w-3.5" style={{ color: "var(--pp-ink-3)" }} />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span
                                className="text-[18px] font-semibold"
                                style={{ color: "var(--pp-ink)", fontFamily: "var(--planners-user-font, inherit)" }}
                            >
                                2026년 4월 29일
                            </span>
                            <span
                                className="text-[13px] px-1.5 py-0.5 rounded-full font-medium"
                                style={{ background: "var(--pp-accent)", color: "var(--pp-ink-on)" }}
                            >
                                오늘
                            </span>
                        </div>
                        <p className="text-[12px] mt-0.5" style={{ color: "var(--pp-ink-4)" }}>
                            ☁ 12°C 수요일 · 음력 3월 12일
                        </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--pp-ink-3)" }} />
                </div>
            </div>

            {/* ── 일정 & 업무 카드 ── */}
            <div
                className="rounded-xl p-3 space-y-2"
                style={{ background: "var(--pp-surface)", border: "1px solid var(--pp-line)" }}
            >
                <div className="flex items-center justify-between">
                    <h4 className="text-[12px] uppercase tracking-widest" style={{ color: "var(--pp-ink-4)" }}>
                        일정 &amp; 업무
                    </h4>
                    <span
                        className="text-[13px] px-1.5 py-0.5 rounded"
                        style={{ background: "var(--pp-surface-alt)", color: "var(--pp-ink-3)" }}
                    >
                        미완 2건
                    </span>
                </div>
                {[
                    { time: "10:00", tag: "급증", urgent: true, text: "상반기 업적 평가 배포", done: false },
                    { time: "11:30", tag: "완료", urgent: false, text: "사내 AI 공유화", done: true },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[13px]">
                        <span className="shrink-0" style={{ color: "var(--pp-ink-3)", minWidth: "34px" }}>
                            {item.time}
                        </span>
                        <span
                            className="px-1 py-px rounded text-[13px] shrink-0"
                            style={{
                                background: item.urgent ? "#FEE2E2" : "var(--pp-surface-alt)",
                                color: item.urgent ? "#EF4444" : "var(--pp-ink-3)",
                            }}
                        >
                            {item.tag}
                        </span>
                        <span
                            style={{
                                color: item.done ? "var(--pp-ink-4)" : "var(--pp-ink)",
                                textDecoration: item.done ? "line-through" : "none",
                                fontFamily: "var(--planners-user-font, inherit)",
                            }}
                        >
                            {item.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── 향후 일정 카드 ── */}
            <div
                className="rounded-xl p-3"
                style={{ background: "var(--pp-surface)", border: "1px solid var(--pp-line)" }}
            >
                <h4
                    className="text-[12px] uppercase tracking-widest mb-2"
                    style={{ color: "var(--pp-ink-4)" }}
                >
                    향후 일정 &amp; 업무
                </h4>
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[12px]">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--pp-accent)" }} />
                            <span style={{ color: "var(--pp-ink-2)", fontFamily: "var(--planners-user-font, inherit)" }}>
                                5/3(일) 김선아 멘토님 생신
                            </span>
                        </div>
                        <span className="text-[13px]" style={{ color: "var(--pp-ink-4)" }}>D-4</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[12px]">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#3B82F6" }} />
                            <span style={{ color: "var(--pp-ink-2)", fontFamily: "var(--planners-user-font, inherit)" }}>
                                5/7(목) 신한카드 최종 PT
                            </span>
                        </div>
                        <span className="text-[13px]" style={{ color: "var(--pp-ink-4)" }}>D-8</span>
                    </div>
                    {/* 범례 */}
                    <div
                        className="flex items-center gap-3 pt-2 mt-1"
                        style={{ borderTop: "1px solid var(--pp-line)" }}
                    >
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--pp-ink-4)" }}>
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--pp-accent)" }} />
                            기념일
                        </span>
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--pp-ink-4)" }}>
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#3B82F6" }} />
                            미팅
                        </span>
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--pp-ink-4)" }}>
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--pp-ink-3)" }} />
                            업무
                        </span>
                    </div>
                </div>
            </div>

            {/* ── 일간 기록 카드 ── */}
            <div
                className="rounded-xl p-3"
                style={{ background: "var(--pp-surface)", border: "1px solid var(--pp-line)" }}
            >
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[12px] uppercase tracking-widest" style={{ color: "var(--pp-ink-4)" }}>
                        일간 기록
                    </h4>
                    <span className="text-[13px]" style={{ color: "var(--pp-ink-3)" }}>수정</span>
                </div>
                <p className="text-[12px] mb-1.5" style={{ color: "var(--pp-ink-3)" }}>만족도 · 오늘 하루 만족</p>
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <span
                            key={n}
                            className="h-6 w-6 rounded text-[12px] flex items-center justify-center"
                            style={{
                                background: n === 4 ? "var(--pp-accent)" : "var(--pp-surface-alt)",
                                color: n === 4 ? "var(--pp-ink-on)" : "var(--pp-ink-3)",
                            }}
                        >
                            {n}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── 프로젝트 ─────────────────────────────────────────────────
function ProjectTab() {
    return (
        <div className="space-y-3">
            {/* 프로젝트 헤더 */}
            <div>
                <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-[13px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "#DCFCE7", color: "#16A34A" }}>진행중</span>
                    <span className="text-[13px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--pp-surface-alt)", color: "var(--pp-ink-3)" }}>비즈니스/사업</span>
                    <span className="text-[13px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--pp-surface-alt)", color: "var(--pp-ink-3)" }}>D-124</span>
                </div>
                <h3
                    className="text-sm font-semibold leading-snug"
                    style={{ color: "var(--pp-ink)", fontFamily: "var(--planners-user-font, inherit)" }}
                >
                    사이드프로젝트 SaaS<br />
                    InsightView MVP 런칭
                </h3>
                <p className="text-[12px] mt-1" style={{ color: "var(--pp-ink-4)" }}>2026-02-10 → 2026-08-31</p>
            </div>

            {/* 마일스톤 & 진행률 */}
            <div
                className="rounded-xl p-3"
                style={{ background: "var(--pp-surface)", border: "1px solid var(--pp-line)" }}
            >
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[12px] uppercase tracking-widest" style={{ color: "var(--pp-ink-4)" }}>전체 진행률</h4>
                    <span className="text-[13px] font-semibold" style={{ color: "var(--pp-ink)" }}>25%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "var(--pp-surface-alt)" }}>
                    <div className="h-full rounded-full" style={{ width: "25%", background: "var(--pp-accent)" }} />
                </div>
                <p className="text-[12px]" style={{ color: "var(--pp-ink-4)" }}>1 / 4 마일스톤 완료</p>
            </div>

            {/* 미니 task 목록 */}
            <div
                className="rounded-xl p-3 space-y-1.5"
                style={{ background: "var(--pp-surface)", border: "1px solid var(--pp-line)" }}
            >
                <h4 className="text-[12px] uppercase tracking-widest mb-2" style={{ color: "var(--pp-ink-4)" }}>체크리스트</h4>
                {[
                    { text: "워킹 리드 30명 인터뷰", done: true },
                    { text: "MVP v0 인터뷰 요약 1기능", done: true },
                    { text: "베타 5팀 한정 배포", done: false },
                    { text: "유료 전환 2팀", done: false },
                ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[13px]">
                        <span
                            className="h-3 w-3 rounded-sm flex items-center justify-center shrink-0"
                            style={{
                                background: t.done ? "var(--pp-accent)" : "transparent",
                                border: `1px solid ${t.done ? "var(--pp-accent)" : "var(--pp-line-strong)"}`,
                            }}
                        >
                            {t.done && <Check className="h-2 w-2" style={{ color: "var(--pp-ink-on)" }} strokeWidth={3} />}
                        </span>
                        <span
                            className={t.done ? "line-through" : ""}
                            style={{ color: t.done ? "var(--pp-ink-4)" : "var(--pp-ink-2)", fontFamily: "var(--planners-user-font, inherit)" }}
                        >
                            {t.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── AI 브리핑 ─────────────────────────────────────────────────
function AiTab() {
    return (
        <div className="space-y-3.5">
            <div className="flex items-center gap-2">
                <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--pp-accent)" }}
                />
                <span className="pp-eyebrow">모닝 브리핑 · 08:00</span>
            </div>
            <h3
                className="text-sm font-semibold leading-snug"
                style={{ color: "var(--pp-ink)", fontFamily: "var(--planners-user-font, inherit)" }}
            >
                오늘은 집중하기 좋은 날
            </h3>
            <p
                className="text-[13px] leading-[1.7]"
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
                className="rounded-xl p-3"
                style={{ background: "var(--pp-surface-alt)", border: "1px solid var(--pp-line)" }}
            >
                <p className="pp-eyebrow mb-1.5">오늘의 집중</p>
                <p
                    className="text-[13px] leading-relaxed"
                    style={{
                        color: "var(--pp-ink-2)",
                        fontFamily: "var(--planners-user-font, inherit)",
                    }}
                >
                    회의 사이 30분 빈 슬롯 두 번. 짧은 회고 한 편 정도가 들어갑니다.
                </p>
            </div>

            <div
                className="text-[13px] flex items-center gap-1.5"
                style={{ color: "var(--pp-ink-3)" }}
            >
                <span
                    className="px-2 py-0.5 rounded font-mono uppercase tracking-widest text-[13px]"
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
