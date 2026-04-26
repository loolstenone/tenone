"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    LayoutTemplate, Search, Loader2, X, FileText, Calendar, BookOpen,
    ChevronRight, Heart, Copy, Check,
} from "lucide-react";
import { isSpecialTemplate as isSpecial, exportFrameworkText as exportFwText, tplDataKey } from "@/lib/planners/templates";
import {
    Q_TONE, Q_TEXT, CellTextarea, QuadrantGrid as SharedQuadrantGrid,
    type FrameworkData as SharedFrameworkData,
    type QuadrantDef as SharedQuadrantDef,
} from "./template-grids/_shared";
import {
    SwotGrid, FourPGrid, AnsoffGrid, BcgGrid, NineBoxGrid,
    EisenhowerGrid, PestGrid, MoscowGrid, QuadrantBlankGrid, KanoGrid,
} from "./template-grids/quadrants";
import { LeanCanvasGrid, BmcGrid, VpcGrid, OkrGrid } from "./template-grids/canvas";

interface Template {
    id: string;
    key: string;
    category: string;
    subcategory: string | null;
    label: string;
    description: string | null;
    body_md: string;
}

export type FrameworkData = SharedFrameworkData;

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; bar: string }> = {
    framework: {
        label: "FrameWorkBook",
        icon: <BookOpen className="h-3 w-3" />,
        color: "text-slate-800",
        bg: "bg-slate-50 border-slate-200",
        bar: "bg-slate-700",
    },
    schedule: {
        label: "Schedule",
        icon: <Calendar className="h-3 w-3" />,
        color: "text-slate-900",
        bg: "bg-slate-50 border-slate-300",
        bar: "bg-slate-900",
    },
    note: {
        label: "Note",
        icon: <FileText className="h-3 w-3" />,
        color: "text-stone-800",
        bg: "bg-stone-50 border-stone-200",
        bar: "bg-stone-700",
    },
};

// CellTextarea, QuadrantGrid, QuadrantDef, Q_TONE, Q_TEXT 는 ./template-grids/_shared 에서 import 사용
type QuadrantDef = SharedQuadrantDef;
const QuadrantGrid = SharedQuadrantGrid;

// ── 특수 프레임워크 렌더러 ────────────────────────────────────────────


// Q_TONE · Q_TEXT 는 ./template-grids/_shared 에서 import 사용




function EmpathyMapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const top = [
        { key: "says",   label: "Says · 말하는 것",     hint: "인터뷰·리뷰·SNS에서 직접 한 말 (그대로)", color: "bg-slate-50 border border-slate-200", text: "text-slate-800",
          ph: "예: \"매주 화요일 새벽 2시까지 엑셀로 정리해요\"\n\"이게 진짜 짜증나는 게…\"" },
        { key: "thinks", label: "Thinks · 생각하는 것", hint: "말은 안 하지만 행동·표정에서 추론",      color: "bg-slate-50 border border-slate-200", text: "text-slate-800",
          ph: "예: \"이걸 하는 게 맞나?\"\n\"동료보다 뒤처지는 거 같아\"" },
        { key: "does",   label: "Does · 행동하는 것",   hint: "관찰 가능한 행동 — 빈도·맥락",            color: "bg-slate-50 border border-slate-300", text: "text-slate-900",
          ph: "예: 매주 화요일 야근\n월 1회 SaaS 구독 비교\n주말에 유튜브 강의 시청" },
        { key: "feels",  label: "Feels · 느끼는 것",    hint: "감정 단어로 — 짜증·불안·자신감 등",       color: "bg-slate-50 border border-slate-200", text: "text-stone-700",
          ph: "예: 마감 전 불안\n작업 끝나고 허무함\n동료 인정받을 때 자신감" },
    ];
    const bottom = [
        { key: "pains", label: "Pains · 고통·두려움",     hint: "장애물·짜증·실패·리스크",         color: "bg-stone-50 border border-stone-300", text: "text-stone-800",
          ph: "- 도구가 너무 복잡해 시간 낭비\n- 진척도가 안 보여 동기 저하\n- 야근 누적으로 번아웃 우려" },
        { key: "gains", label: "Gains · 바라는 것·이득", hint: "성공·기쁨·이상적 결과 — 측정 가능하게", color: "bg-stone-50 border border-stone-200", text: "text-stone-800",
          ph: "- 주 5시간 절감\n- 본인 성장 가시화\n- 팀에서 \"믿을 수 있는 사람\" 평가" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* Persona meta */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2">
                <LabeledInput label="Persona · 누구를 위해?" valKey="em_persona" data={data} onChange={onChange} placeholder="예: 30대 1인 마케터 박지현" />
                <LabeledInput label="Goal · 그가 원하는 것" valKey="em_goal" data={data} onChange={onChange} placeholder="예: 야근 없이 캠페인 효율 ↑" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">Dave Gray Empathy Map</span> · 머릿속에 있는 한 사람의 입장이 되어보기.
                Says·Does는 <span className="font-semibold">관찰</span>, Thinks·Feels는 <span className="font-semibold">추론</span> — 분리해야 가설이 명확해짐.
            </div>

            {/* 4사분면 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {top.map(c => (
                    <div key={c.key} className={`rounded-lg p-3 min-h-32 ${c.color}`}>
                        <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                        <p className="text-[10px] text-neutral-500 mb-1">{c.hint}</p>
                        <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder={c.ph} />
                    </div>
                ))}
            </div>

            {/* Pains / Gains */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {bottom.map(c => (
                    <div key={c.key} className={`rounded-lg p-3 min-h-24 ${c.color}`}>
                        <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                        <p className="text-[10px] text-neutral-500 mb-1">{c.hint}</p>
                        <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder={c.ph} />
                    </div>
                ))}
            </div>

            {/* Insights */}
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-300">
                <p className="text-xs font-bold text-slate-900">Insights · 핵심 통찰 (제품·서비스에 줄 메시지)</p>
                <p className="text-[10px] text-neutral-500 mb-1">6사분면을 종합 — &quot;이 사람을 위해 우리가 무엇을 할까?&quot;</p>
                <CellTextarea cellKey="em_insights" value={data["em_insights"] ?? ""} onChange={onChange} placeholder={"- 진척도 시각화 + 자동 리포트가 핵심 차별화\n- 도구 복잡도가 진입장벽 → 첫 5분 온보딩 단순화 우선"} />
            </div>
        </div>
    );
}


function MandalartGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    // Spatial positions: t0→(0,0) t1→(0,1) t2→(0,2) t3→(1,0) center→(1,1) t4→(1,2) t5→(2,0) t6→(2,1) t7→(2,2)
    // Inner cell positions within each 3×3 block follow the same spatial layout
    const themeLayout = ["t0", "t1", "t2", "t3", null, "t4", "t5", "t6", "t7"] as const;

    function innerLayout(ti: number) {
        // Returns 9 cell keys in spatial order; center = the theme itself
        return [0, 1, 2, 3, null, 4, 5, 6, 7].map(ai =>
            ai === null ? `t${ti}` : `t${ti}_${ai}`
        );
    }

    const cellBase = "rounded border text-[9px] font-semibold leading-tight p-1 flex flex-col";
    const actionCell = "bg-white border-neutral-200 text-neutral-600";
    const themeCell = "bg-stone-50 border-stone-300 text-slate-900 font-bold";
    const goalCell = "bg-slate-900 border-slate-900 text-white font-extrabold";

    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2">
                <LabeledInput label="기간" valKey="mdl_period" data={data} onChange={onChange} placeholder="2026년 · Q2 · 100일 챌린지" />
                <LabeledInput label="검토 주기" valKey="mdl_review" data={data} onChange={onChange} placeholder="매주 일요일 · 매월 1일" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">오타니 쇼헤이 식 만다라트</span> · 중앙 = 한 줄 핵심 목표.
                8테마는 목표를 이루기 위한 영역(체력·기술·인간관계·정신력 등). 각 테마의 8실행은 <span className="font-semibold">이번 주에 시작 가능한 구체 행동</span>.
            </div>

            <div className="overflow-x-auto">
            <div className="grid grid-cols-3 gap-1 min-w-[420px]">
                {themeLayout.map((themeKey) => {
                    const isCenter = themeKey === null;

                    if (isCenter) {
                        // Center block: goal + 8 themes
                        return (
                            <div key="center" className="grid grid-cols-3 gap-0.5">
                                {themeLayout.map((tk, innerIdx) => {
                                    const isGoal = tk === null;
                                    return (
                                        <div key={innerIdx} className={`${cellBase} min-h-12 ${isGoal ? goalCell : themeCell}`}>
                                            <span className="text-[8px] opacity-70">{isGoal ? "목표" : `테마${innerIdx < 4 ? innerIdx + 1 : innerIdx}`}</span>
                                            <textarea
                                                value={isGoal ? (data["goal"] ?? "") : (data[tk!] ?? "")}
                                                onChange={e => onChange(isGoal ? "goal" : tk!, e.target.value)}
                                                placeholder={isGoal ? "핵심 목표" : `테마 ${innerIdx}`}
                                                rows={2}
                                                className="flex-1 w-full resize-none bg-transparent placeholder:opacity-30 focus:outline-none text-[9px] leading-tight mt-0.5"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }

                    const ti = parseInt(themeKey.replace("t", ""), 10);
                    const cells = innerLayout(ti);
                    const themeLabel = `테마 ${ti + 1}`;

                    return (
                        <div key={themeKey} className="grid grid-cols-3 gap-0.5">
                            {cells.map((cellKey, pos) => {
                                const isThemeCenter = cellKey === themeKey;
                                return (
                                    <div key={pos} className={`${cellBase} min-h-12 ${isThemeCenter ? themeCell : actionCell}`}>
                                        {isThemeCenter && <span className="text-[8px] opacity-60">{themeLabel}</span>}
                                        <textarea
                                            value={data[cellKey] ?? ""}
                                            onChange={e => onChange(cellKey, e.target.value)}
                                            placeholder={isThemeCenter ? "테마" : "실행"}
                                            rows={2}
                                            className="flex-1 w-full resize-none bg-transparent placeholder:opacity-25 focus:outline-none text-[9px] leading-tight mt-0.5"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <p className="text-[9px] text-neutral-400 mt-2 text-center">중앙 블록에 핵심 목표 + 8테마 → 각 블록에 테마별 실행 8개</p>
            </div>
        </div>
    );
}








function PersonaGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">User Persona</span> · 한 명의 가상 인물에 N명 인터뷰 데이터를 응축.
                <span className="font-semibold"> 실제 데이터에서 추출</span>한 디테일이 없으면 픽션. 인터뷰 3~5명 후 작성 권장.
            </div>

            {/* 프로필 헤더 */}
            <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 w-14 h-14 rounded-full bg-white border-2 border-slate-400 flex items-center justify-center text-2xl text-slate-400 font-bold">
                        ?
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <input
                            type="text"
                            value={data["persona_name"] ?? ""}
                            onChange={e => onChange("persona_name", e.target.value)}
                            placeholder="이름 (예: 박지현 — 1인 마케터)"
                            className="w-full px-2 py-1 text-sm font-bold bg-white/70 border border-slate-200 rounded focus:outline-none focus:border-slate-700"
                        />
                        <div className="grid grid-cols-3 gap-1">
                            <input type="text" value={data["persona_age"] ?? ""} onChange={e => onChange("persona_age", e.target.value)} placeholder="33세" className="px-2 py-1 text-xs bg-white/70 border border-slate-200 rounded focus:outline-none" />
                            <input type="text" value={data["persona_occupation"] ?? ""} onChange={e => onChange("persona_occupation", e.target.value)} placeholder="1인 마케터·프리랜서" className="px-2 py-1 text-xs bg-white/70 border border-slate-200 rounded focus:outline-none" />
                            <input type="text" value={data["persona_location"] ?? ""} onChange={e => onChange("persona_location", e.target.value)} placeholder="서울 마포구" className="px-2 py-1 text-xs bg-white/70 border border-slate-200 rounded focus:outline-none" />
                        </div>
                        <input
                            type="text"
                            value={data["persona_bio"] ?? ""}
                            onChange={e => onChange("persona_bio", e.target.value)}
                            placeholder="한줄 소개 (예: 5년차 마케터, 작년부터 독립해 SaaS 3곳 운영 보조)"
                            className="w-full px-2 py-1 text-xs bg-white/70 border border-slate-200 rounded focus:outline-none"
                        />
                        <input
                            type="text"
                            value={data["persona_tech"] ?? ""}
                            onChange={e => onChange("persona_tech", e.target.value)}
                            placeholder="자주 쓰는 도구 (예: Notion · Slack · ChatGPT · 인스타그램)"
                            className="w-full px-2 py-1 text-xs bg-white/70 border border-slate-200 rounded focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* 4분면 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-300 min-h-28">
                    <p className="text-xs font-bold text-slate-900">Goals · 목표</p>
                    <p className="text-[10px] text-neutral-500 mb-1">측정 가능한 결과</p>
                    <CellTextarea cellKey="persona_goals" value={data["persona_goals"] ?? ""} onChange={onChange} placeholder={"- 야근 없이 월 500만원 매출\n- 클라이언트 3곳 → 5곳 확장\n- 본업 외 콘텐츠로 월 100만원"} />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 min-h-28">
                    <p className="text-xs font-bold text-stone-700">Frustrations · 좌절·짜증</p>
                    <p className="text-[10px] text-neutral-500 mb-1">반복적·구체적 불편</p>
                    <CellTextarea cellKey="persona_frustrations" value={data["persona_frustrations"] ?? ""} onChange={onChange} placeholder={"- 도구가 너무 많아 매번 정보 옮김\n- 클라 보고서 매주 새로 만들기 노가다\n- 진척도 안 보여 동기 저하"} />
                </div>
                <div className="rounded-lg p-3 bg-stone-50 border border-stone-200 min-h-28">
                    <p className="text-xs font-bold text-stone-800">Motivations · 동기·가치관</p>
                    <p className="text-[10px] text-neutral-500 mb-1">왜 이 일을 하는가</p>
                    <CellTextarea cellKey="persona_motivations" value={data["persona_motivations"] ?? ""} onChange={onChange} placeholder={"- 자기 시간 통제\n- 커리어 자산 축적\n- 가족과의 시간 확보"} />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 min-h-28">
                    <p className="text-xs font-bold text-slate-800">Behaviors · 행동·일상</p>
                    <p className="text-[10px] text-neutral-500 mb-1">실제 관찰된 패턴</p>
                    <CellTextarea cellKey="persona_behaviors" value={data["persona_behaviors"] ?? ""} onChange={onChange} placeholder={"- 출근 7~8시 모닝 루틴\n- 매주 일요일 저녁 주간 리뷰\n- 주말 유튜브로 학습 1~2시간"} />
                </div>
            </div>

            {/* Quote */}
            <div className="rounded-xl p-3 bg-white border-l-4 border-slate-500">
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Quote · 대표 발언 (인터뷰에서 그대로)</p>
                <p className="text-[10px] text-neutral-500 mb-1">패러프레이즈 X — 본인 입에서 나온 표현 그대로</p>
                <textarea
                    value={data["persona_quote"] ?? ""}
                    onChange={e => onChange("persona_quote", e.target.value)}
                    placeholder={'예: "그냥 빠르게 쓰고 싶어요. 설정이 너무 많으면 지쳐요. 로그인하고 바로 일 시작하면 좋겠어요."'}
                    rows={3}
                    className="w-full mt-1 resize-none bg-transparent text-xs italic text-neutral-700 placeholder:text-neutral-400 focus:outline-none leading-relaxed"
                />
            </div>

            {/* Scenario */}
            <div className="rounded-xl p-3 bg-stone-50 border border-stone-200">
                <p className="text-xs font-bold text-stone-900">Scenario · 우리 제품을 쓰는 하루</p>
                <p className="text-[10px] text-neutral-500 mb-1">아침 → 일과 → 저녁 — 우리 제품이 어디 끼어드는지</p>
                <CellTextarea cellKey="persona_scenario" value={data["persona_scenario"] ?? ""} onChange={onChange} placeholder={"7AM 모닝 브리핑 받고 오늘 우선순위 확인\n10AM 클라 미팅 전 회의록 자동 정리\n6PM 일일 회고로 마감 — 야근 없이 퇴근"} />
            </div>
        </div>
    );
}

function JtbdGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* JTBD 한 문장 */}
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">JTBD Statement · 한 문장 정의</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">&quot;[상황]일 때, 나는 [동기]하고 싶다, 그래서 [결과]를 얻고 싶다&quot;</p>
                <textarea
                    value={data["jtbd_statement"] ?? ""}
                    onChange={e => onChange("jtbd_statement", e.target.value)}
                    placeholder="예: 일요일 저녁 한 주를 계획할 때, AI에게 우선순위 정리를 맡기고 싶다, 그래서 월요일 아침에 망설이지 않고 시작하고 싶다"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/60 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none p-2 rounded border border-slate-200 leading-relaxed"
                />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">Clayton Christensen JTBD</span> · 사람들은 제품을 &quot;사는&quot; 게 아니라 &quot;고용&quot;한다.
                Job = 진보(progress)를 만드는 동기. <span className="font-semibold">Forces of Progress 4축</span> = Push(현재 불만) + Pull(새 매력) ↔ Anxiety(걱정) + Habit(관성).
            </div>

            {/* 3단 구조 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 min-h-32">
                    <p className="text-xs font-bold text-slate-800">Situation · 상황</p>
                    <p className="text-[10px] text-neutral-500 mb-1">언제·어디서·왜 — 트리거 순간</p>
                    <CellTextarea cellKey="jtbd_situation" value={data["jtbd_situation"] ?? ""} onChange={onChange} placeholder={"- 일요일 저녁 7~10시\n- 한 주 시작 전 막막함 느낄 때\n- 노트북 앞에서 빈 화면 응시"} />
                </div>
                <div className="rounded-lg p-3 bg-stone-50 border border-stone-200 min-h-32">
                    <p className="text-xs font-bold text-stone-800">Motivation · 동기</p>
                    <p className="text-[10px] text-neutral-500 mb-1">기능적 + 감정적 + 사회적</p>
                    <CellTextarea cellKey="jtbd_motivation" value={data["jtbd_motivation"] ?? ""} onChange={onChange} placeholder={"기능: 우선순위 자동 정리\n감정: 불안 ↓ 자신감 ↑\n사회: 동료에게 \"준비된 사람\" 보이기"} />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-300 min-h-32">
                    <p className="text-xs font-bold text-slate-900">Outcome · 결과</p>
                    <p className="text-[10px] text-neutral-500 mb-1">측정 가능한 진보</p>
                    <CellTextarea cellKey="jtbd_outcome" value={data["jtbd_outcome"] ?? ""} onChange={onChange} placeholder={"- 월요일 9시에 첫 작업 바로 시작\n- 주간 회고 시간 30분 → 10분\n- 마감 미스 0건"} />
                </div>
            </div>

            {/* Push·Pull / Anxiety·Habit (4 forces) */}
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider mt-2">4 Forces of Progress</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-300 min-h-24">
                    <p className="text-xs font-bold text-slate-900">Push · 현재 불만 (떠나는 힘)</p>
                    <p className="text-[10px] text-neutral-500 mb-1">기존 도구·방식의 짜증</p>
                    <CellTextarea cellKey="jtbd_push" value={data["jtbd_push"] ?? ""} onChange={onChange} placeholder={"- Notion에 매번 같은 회의록 템플릿 복사\n- 우선순위 정리에 1시간씩 소요"} />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-300 min-h-24">
                    <p className="text-xs font-bold text-slate-900">Pull · 새로운 매력 (당기는 힘)</p>
                    <p className="text-[10px] text-neutral-500 mb-1">우리 제품이 약속하는 더 나은 미래</p>
                    <CellTextarea cellKey="jtbd_pull" value={data["jtbd_pull"] ?? ""} onChange={onChange} placeholder={"- AI가 알아서 정리해주는 마법\n- 동료들이 \"어떻게 그렇게 빠르게?\" 묻기"} />
                </div>
                <div className="rounded-lg p-3 bg-stone-50 border border-stone-200 min-h-24">
                    <p className="text-xs font-bold text-stone-800">Anxiety · 불안 (멈추는 힘)</p>
                    <p className="text-[10px] text-neutral-500 mb-1">새 도구로 갈 때 걱정</p>
                    <CellTextarea cellKey="jtbd_anxieties" value={data["jtbd_anxieties"] ?? ""} onChange={onChange} placeholder={"- 데이터 이전 번거로움\n- AI가 잘못 추천하면?\n- 또 다른 학습 비용"} />
                </div>
                <div className="rounded-lg p-3 bg-stone-50 border border-stone-200 min-h-24">
                    <p className="text-xs font-bold text-neutral-600">Habit · 기존 대안·관성</p>
                    <p className="text-[10px] text-neutral-500 mb-1">지금 어떻게 우회하고 있는가</p>
                    <CellTextarea cellKey="jtbd_habits" value={data["jtbd_habits"] ?? ""} onChange={onChange} placeholder={"- Notion + 종이 노트 병행\n- 매주 일요일 고정 루틴\n- ChatGPT에 직접 물어보기"} />
                </div>
            </div>

            {/* Hire / Fire criteria */}
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-300">
                <p className="text-xs font-bold text-stone-900">Hire / Fire · 채용·해고 기준</p>
                <p className="text-[10px] text-neutral-500 mb-1">우리 제품을 &quot;고용&quot;하려면 무엇이 필요? &quot;해고&quot;당하지 않으려면?</p>
                <CellTextarea cellKey="jtbd_hire" value={data["jtbd_hire"] ?? ""} onChange={onChange} placeholder={"Hire: 첫 5분 안에 가치 보임 + 데이터 자동 임포트\nFire: AI 추천 정확도 < 70% · 월 1회 이상 답답한 순간"} />
            </div>
        </div>
    );
}

type RiceItem = { name: string; reach: number; impact: number; confidence: number; effort: number };

function RiceGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const items: RiceItem[] = (() => {
        try { return data["rice_items"] ? JSON.parse(data["rice_items"]) : []; }
        catch { return []; }
    })();
    const ensureMin = items.length === 0 ? [{ name: "", reach: 0, impact: 1, confidence: 100, effort: 1 }] : items;

    const save = (next: RiceItem[]) => onChange("rice_items", JSON.stringify(next));
    const update = (idx: number, patch: Partial<RiceItem>) => {
        const next = [...ensureMin];
        next[idx] = { ...next[idx], ...patch };
        save(next);
    };
    const add = () => save([...ensureMin, { name: "", reach: 0, impact: 1, confidence: 100, effort: 1 }]);
    const remove = (idx: number) => save(ensureMin.filter((_, i) => i !== idx));

    const score = (it: RiceItem) => it.effort > 0 ? (it.reach * it.impact * it.confidence / 100) / it.effort : 0;
    const sorted = [...ensureMin].map((it, i) => ({ it, i, s: score(it) })).sort((a, b) => b.s - a.s);

    return (
        <div className="my-2 space-y-2">
            <div className="text-[10px] text-neutral-500 leading-relaxed px-1">
                <strong>Score = (Reach × Impact × Confidence%) ÷ Effort</strong> · Impact 1~3(미미·보통·대박), Confidence 0~100%, Effort 인-월(PM)
            </div>
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="px-2 py-2 text-left w-8">#</th>
                            <th className="px-2 py-2 text-left">항목</th>
                            <th className="px-2 py-2 text-center w-16">Reach</th>
                            <th className="px-2 py-2 text-center w-16">Impact</th>
                            <th className="px-2 py-2 text-center w-20">Conf %</th>
                            <th className="px-2 py-2 text-center w-16">Effort</th>
                            <th className="px-2 py-2 text-right w-20">Score</th>
                            <th className="px-2 py-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {ensureMin.map((it, idx) => {
                            const s = score(it);
                            const rank = sorted.findIndex(x => x.i === idx) + 1;
                            const isTop = rank === 1 && s > 0;
                            return (
                                <tr key={idx} className={`border-t border-neutral-100 ${isTop ? "bg-slate-50" : ""}`}>
                                    <td className="px-2 py-1.5 text-neutral-400 text-[10px]">{isTop ? <span className="text-slate-900 font-bold">★</span> : rank}</td>
                                    <td className="px-2 py-1.5">
                                        <input type="text" value={it.name} onChange={e => update(idx, { name: e.target.value })}
                                            placeholder="기능·아이디어"
                                            className="w-full px-1.5 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <input type="number" min={0} value={it.reach} onChange={e => update(idx, { reach: +e.target.value })}
                                            className="w-full px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <select value={it.impact} onChange={e => update(idx, { impact: +e.target.value })}
                                            className="w-full px-1 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300">
                                            <option value={0.25}>0.25</option><option value={0.5}>0.5</option>
                                            <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                                        </select>
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <input type="number" min={0} max={100} value={it.confidence} onChange={e => update(idx, { confidence: +e.target.value })}
                                            className="w-full px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <input type="number" min={0.5} step={0.5} value={it.effort} onChange={e => update(idx, { effort: +e.target.value })}
                                            className="w-full px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    <td className={`px-2 py-1.5 text-right font-mono font-bold ${isTop ? "text-slate-900" : s > 0 ? "text-neutral-700" : "text-neutral-300"}`}>
                                        {s > 0 ? s.toFixed(1) : "—"}
                                    </td>
                                    <td className="px-1 text-center">
                                        {ensureMin.length > 1 && (
                                            <button onClick={() => remove(idx)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">
                + 항목 추가
            </button>
        </div>
    );
}

function FiveW1HGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "who",   label: "Who",   sub: "누가 · 대상자",      hint: "주체·관계자·청중·이해관계자",     color: "bg-slate-50 border-slate-200", text: "text-slate-800",
          ph: "주최: 마케팅팀\n대상: 25~35세 1인 사업가\n승인: 대표" },
        { key: "what",  label: "What",  sub: "무엇을 · 핵심 행동", hint: "한 문장으로 정의된 행위·결과물",   color: "bg-slate-50 border-slate-300", text: "text-slate-900",
          ph: "Q2 신규 가입 캠페인 런칭 — 광고 + 인플루언서 + 콘텐츠 3축 운영" },
        { key: "when",  label: "When",  sub: "언제 · 기간·시점",   hint: "시작·종료·마일스톤",               color: "bg-stone-50 border-stone-200", text: "text-stone-800",
          ph: "2026-04-01 ~ 04-28 (4주)\nM1: 4/8 광고 라이브\nM2: 4/15 1차 리포트" },
        { key: "where", label: "Where", sub: "어디서 · 채널·장소", hint: "물리·디지털 채널",                 color: "bg-slate-50 border-slate-200", text: "text-slate-800",
          ph: "Meta·Google 광고\n인스타·유튜브 콜라보\n자사 블로그·뉴스레터" },
        { key: "why",   label: "Why",   sub: "왜 · 목적·근거",     hint: "이걸 안 하면 어떻게 되는가?",      color: "bg-slate-50 border-slate-200", text: "text-stone-700",
          ph: "MAU 정체 → 매출 성장 둔화\n경쟁사 대비 인지도 격차\n분기 OKR 핵심" },
        { key: "how",   label: "How",   sub: "어떻게 · 방법·자원", hint: "단계·예산·도구·인력",              color: "bg-stone-50 border-stone-200", text: "text-stone-700",
          ph: "광고비 800만원\n인플 협업 5건 (각 50만원)\n콘텐츠 8편 자체 제작" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200">
                <LabeledInput label="Topic · 주제" valKey="w5h1_topic" data={data} onChange={onChange} placeholder="예: Q2 신규 가입 캠페인 / 채용 / 신제품 런칭" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">기획·보도 5W1H</span> · 어떤 안건이든 6칸이 채워지면 누구에게 설명해도 통한다.
                Why가 약하면 다른 칸이 다 흔들림 — Why부터 시작.
            </div>

            {/* 6칸 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                {cells.map(c => (
                    <div key={c.key} className={`rounded-lg p-3 border ${c.color} min-h-32`}>
                        <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                        <p className="text-[10px] text-neutral-500">{c.sub}</p>
                        <p className="text-[10px] text-neutral-400 italic mb-1">{c.hint}</p>
                        <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder={c.ph} />
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-300">
                <p className="text-xs font-bold text-stone-900">Summary · 한 줄 요약</p>
                <p className="text-[10px] text-neutral-500 mb-1">6칸을 한 문장으로 — &quot;[Who]가 [Why] 위해 [When] [Where]에서 [What]을 [How] 한다&quot;</p>
                <textarea value={data["w5h1_summary"] ?? ""} onChange={e => onChange("w5h1_summary", e.target.value)}
                    placeholder="예: 마케팅팀이 MAU 정체를 깨기 위해 4월 한 달간 Meta·인플 채널에서 신규 가입 1,500명을 광고비 800만원으로 확보한다."
                    rows={2}
                    className="w-full mt-1 resize-none bg-white text-sm p-2 rounded border border-stone-200 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

function FiveWhyGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const whys = [1, 2, 3, 4, 5];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2">
                <LabeledInput label="발생일" valKey="why_date" data={data} onChange={onChange} placeholder="2026-04-27" />
                <LabeledInput label="관련자·시스템" valKey="why_owner" data={data} onChange={onChange} placeholder="결제팀 · 결제 API" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">Toyota 5Why</span> · 사람을 탓하지 말고 시스템·프로세스를 탓하라.
                각 답이 다음 &quot;왜?&quot;를 자연스럽게 부르면 OK. 5번 안에 안 닿으면 문제 정의가 너무 클 가능성 ↑.
            </div>

            {/* Problem */}
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-300">
                <p className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">Problem · 문제 정의 (5W1H로 구체화)</p>
                <textarea value={data["why_problem"] ?? ""} onChange={e => onChange("why_problem", e.target.value)}
                    placeholder={"예: 4/26 18:00~18:15 동안 결제 API 응답 지연으로 142건 결제가 실패함."} rows={2}
                    className="w-full mt-1.5 resize-none bg-white/60 text-xs p-2 rounded border border-slate-200 focus:outline-none leading-relaxed" />
            </div>
            {/* 5 Whys ladder */}
            <div className="space-y-1.5">
                {whys.map((n, i) => {
                    const key = `why_${n}`;
                    const prev = i === 0 ? data["why_problem"] : data[`why_${n - 1}`];
                    const hasPrev = (prev ?? "").trim().length > 0;
                    return (
                        <div key={key} className="flex items-start gap-2">
                            <div className="shrink-0 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${hasPrev ? "bg-slate-200 text-slate-900 border-2 border-slate-700" : "bg-neutral-100 text-neutral-400 border border-neutral-200"}`}>
                                    Why<br/>{n}
                                </div>
                                {n < 5 && <div className={`w-px flex-1 ${hasPrev ? "bg-slate-400" : "bg-neutral-200"} my-1`} style={{ minHeight: 12 }} />}
                            </div>
                            <div className={`flex-1 rounded-lg p-2 border ${hasPrev ? "bg-stone-50 border-stone-200" : "bg-neutral-50 border-neutral-200"}`}>
                                <p className="text-[10px] text-neutral-500">왜 그럴까?</p>
                                <textarea value={data[key] ?? ""} onChange={e => onChange(key, e.target.value)}
                                    placeholder={hasPrev ? `${n}번째 '왜'에 대한 답…` : "이전 단계를 먼저 채워주세요"}
                                    disabled={!hasPrev} rows={2}
                                    className="w-full mt-0.5 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed disabled:opacity-50" />
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Root + Countermeasure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-400">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Root Cause · 근본 원인</p>
                    <p className="text-[10px] text-neutral-500 mb-1">시스템·프로세스 차원의 진짜 원인</p>
                    <CellTextarea cellKey="why_root" value={data["why_root"] ?? ""} onChange={onChange} placeholder="예: 결제 API 호출 시 외부 PG 타임아웃 임계값이 30s로 설정되어 있고, 재시도 큐가 없음." />
                </div>
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-300">
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Countermeasure · 대응책</p>
                    <p className="text-[10px] text-neutral-500 mb-1">단기 응급 + 장기 시스템 개선</p>
                    <CellTextarea cellKey="why_countermeasure" value={data["why_countermeasure"] ?? ""} onChange={onChange} placeholder={"단기: 타임아웃 10s + 즉시 재시도 1회\n장기: [백엔드팀] 결제 재시도 큐 도입 · 모니터링 알림 · ~05-20"} />
                </div>
            </div>

            {/* 검증 + 재발 방지 */}
            <div className="rounded-xl p-3 bg-stone-50 border border-stone-300">
                <p className="text-xs font-bold text-stone-900">Verify · 어떻게 효과를 검증할까?</p>
                <p className="text-[10px] text-neutral-500 mb-1">대응책이 실제로 작동했음을 확인할 지표·기간</p>
                <textarea value={data["why_verify"] ?? ""} onChange={e => onChange("why_verify", e.target.value)}
                    placeholder={"예: 적용 후 2주 동안 결제 실패율 < 0.1% 유지 시 종료 · 미달 시 다른 근본원인 가능성 재탐색"} rows={2}
                    className="w-full mt-1 resize-none bg-white text-xs p-2 rounded border border-stone-200 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

function IkigaiGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">Ikigai (生き甲斐)</span> · 일본 오키나와 장수 마을의 &quot;아침에 일어날 이유&quot;.
                4원 채우기 → 2개씩 교집합(Passion·Mission·Profession·Vocation) → 4원 모두 겹치는 한 점이 Ikigai.
                <span className="font-semibold"> 명사가 아닌 동사</span>로 적어야 살아 있는 답이 나옴.
            </div>

            {/* 4대 원 */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl p-3 bg-slate-50 border-2 border-slate-300">
                    <p className="text-xs font-bold text-stone-700">LOVE · 좋아하는 것</p>
                    <p className="text-[10px] text-neutral-500 mb-1">시간 가는 줄 모르는 일 · 하기만 해도 즐거움</p>
                    <CellTextarea cellKey="ikigai_love" value={data["ikigai_love"] ?? ""} onChange={onChange} placeholder={"- 사람들과 이야기 나누기\n- 글쓰기·정리하기\n- 새로운 도구·서비스 시도하기"} />
                </div>
                <div className="rounded-2xl p-3 bg-slate-50 border-2 border-slate-300">
                    <p className="text-xs font-bold text-slate-800">GOOD AT · 잘하는 것</p>
                    <p className="text-[10px] text-neutral-500 mb-1">남들이 칭찬하는 것 · 자연스럽게 빠른 일</p>
                    <CellTextarea cellKey="ikigai_good" value={data["ikigai_good"] ?? ""} onChange={onChange} placeholder={"- 복잡한 정보를 구조로 정리\n- 사람·아이디어 연결\n- 빠른 의사결정"} />
                </div>
                <div className="rounded-2xl p-3 bg-stone-50 border-2 border-stone-300">
                    <p className="text-xs font-bold text-stone-800">WORLD NEEDS · 세상이 필요로 하는 것</p>
                    <p className="text-[10px] text-neutral-500 mb-1">주변 사람·사회가 진짜 원하는 것</p>
                    <CellTextarea cellKey="ikigai_needs" value={data["ikigai_needs"] ?? ""} onChange={onChange} placeholder={"- 일과 삶의 우선순위 정리 도구\n- 1인 사업가 운영 자동화\n- 세대 간 지혜 전수"} />
                </div>
                <div className="rounded-2xl p-3 bg-slate-50 border-2 border-slate-700">
                    <p className="text-xs font-bold text-slate-900">PAID FOR · 돈이 되는 것</p>
                    <p className="text-[10px] text-neutral-500 mb-1">시장이 비용을 지불하는 가치</p>
                    <CellTextarea cellKey="ikigai_paid" value={data["ikigai_paid"] ?? ""} onChange={onChange} placeholder={"- B2B SaaS 컨설팅\n- 강의·교육 콘텐츠\n- AI 자동화 구축"} />
                </div>
            </div>

            {/* 교집합 4개 */}
            <div className="rounded-xl p-3 bg-white border border-neutral-200">
                <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-2">2원 교집합 — 4가지 상태</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="rounded-lg p-2 bg-slate-50 border border-slate-200">
                        <p className="text-[10px] font-bold text-stone-700">Passion · 열정 (Love × Good at)</p>
                        <p className="text-[10px] text-neutral-500 mb-1">즐겁고 잘하지만 돈은 안 됨 — 취미·열정</p>
                        <CellTextarea cellKey="ikigai_passion" value={data["ikigai_passion"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-slate-50 border border-stone-200">
                        <p className="text-[10px] font-bold text-stone-800">Mission · 사명 (Love × Needs)</p>
                        <p className="text-[10px] text-neutral-500 mb-1">즐겁고 의미 있지만 잘하진 못함 — 사명</p>
                        <CellTextarea cellKey="ikigai_mission" value={data["ikigai_mission"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-slate-50 border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-800">Profession · 직업 (Good at × Paid)</p>
                        <p className="text-[10px] text-neutral-500 mb-1">잘하고 돈도 되지만 즐겁진 않음 — 일</p>
                        <CellTextarea cellKey="ikigai_profession" value={data["ikigai_profession"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-slate-50 border border-slate-300">
                        <p className="text-[10px] font-bold text-slate-900">Vocation · 천직 (Needs × Paid)</p>
                        <p className="text-[10px] text-neutral-500 mb-1">의미 있고 돈도 되지만 잘하지 못함 — 의무</p>
                        <CellTextarea cellKey="ikigai_vocation" value={data["ikigai_vocation"] ?? ""} onChange={onChange} />
                    </div>
                </div>
            </div>

            {/* Core */}
            <div className="rounded-xl p-3 bg-slate-100 border-2 border-slate-700">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider text-center">IKIGAI · 삶의 이유 (4가지 모두 교집합)</p>
                <p className="text-[10px] text-center text-neutral-600 mb-1">한 줄로 — &quot;나는 ___을 하기 위해 산다&quot;</p>
                <textarea value={data["ikigai_core"] ?? ""} onChange={e => onChange("ikigai_core", e.target.value)}
                    placeholder="예: 1인 사업가가 자기다운 방식으로 일·삶을 설계하도록 돕는다"
                    rows={2}
                    className="w-full mt-1 resize-none bg-white/60 text-sm p-2 rounded border border-stone-300 focus:outline-none text-center font-medium leading-relaxed" />
            </div>

            {/* Next steps */}
            <div className="rounded-lg p-3 bg-stone-50 border border-stone-200">
                <p className="text-xs font-bold text-stone-900">Next · 90일 동안 시도할 한 가지</p>
                <p className="text-[10px] text-neutral-500 mb-1">Ikigai를 작게 검증할 실험</p>
                <CellTextarea cellKey="ikigai_next" value={data["ikigai_next"] ?? ""} onChange={onChange} placeholder={"예: 매주 수요일 7~9PM, 1인 사업가 1명 무료 컨설팅 → 90일 후 12명 인터뷰 인사이트 정리"} />
            </div>
        </div>
    );
}

function Porter5Grid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cellClass = "rounded-lg p-2.5 border min-h-20";
    return (
        <div className="my-2 grid grid-cols-3 gap-2">
            <div />
            <div className={`${cellClass} bg-slate-50 border-slate-200`}>
                <p className="text-[10px] font-bold text-slate-800">New Entrants</p>
                <p className="text-[9px] text-neutral-400">신규 진입</p>
                <CellTextarea cellKey="p5_new_entrants" value={data["p5_new_entrants"] ?? ""} onChange={onChange} />
            </div>
            <div />

            <div className={`${cellClass} bg-slate-50 border-slate-200`}>
                <p className="text-[10px] font-bold text-slate-800">Suppliers</p>
                <p className="text-[9px] text-neutral-400">공급자 협상력</p>
                <CellTextarea cellKey="p5_suppliers" value={data["p5_suppliers"] ?? ""} onChange={onChange} />
            </div>
            <div className={`${cellClass} bg-slate-100 border-2 border-slate-700`}>
                <p className="text-[10px] font-bold text-slate-900">Rivalry</p>
                <p className="text-[9px] text-neutral-500">기존 경쟁</p>
                <CellTextarea cellKey="p5_rivalry" value={data["p5_rivalry"] ?? ""} onChange={onChange} />
            </div>
            <div className={`${cellClass} bg-slate-50 border-slate-300`}>
                <p className="text-[10px] font-bold text-slate-900">Buyers </p>
                <p className="text-[9px] text-neutral-400">구매자 협상력</p>
                <CellTextarea cellKey="p5_buyers" value={data["p5_buyers"] ?? ""} onChange={onChange} />
            </div>

            <div />
            <div className={`${cellClass} bg-stone-50 border-stone-200`}>
                <p className="text-[10px] font-bold text-stone-800">Substitutes</p>
                <p className="text-[9px] text-neutral-400">대체재</p>
                <CellTextarea cellKey="p5_substitutes" value={data["p5_substitutes"] ?? ""} onChange={onChange} />
            </div>
            <div />
        </div>
    );
}

function ScamperGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "scamper_s", letter: "S", label: "Substitute · 대체",         hint: "재료·사람·프로세스·규칙을 다른 것으로", prompt: "어떤 부품·요소를 대체하면 더 좋을까?",
          color: "bg-slate-50 border-slate-200", text: "text-stone-700",
          ph: "예: 종이 매뉴얼 → 영상 튜토리얼 / 이메일 응대 → AI 챗봇 1차" },
        { key: "scamper_c", letter: "C", label: "Combine · 결합",            hint: "두 가지를 합쳐 새 가치 창출",         prompt: "다른 제품·서비스·기능과 합치면?",
          color: "bg-stone-50 border-stone-200", text: "text-stone-700",
          ph: "예: 플래너 + AI 코치 / 회의록 + 자동 액션 추적" },
        { key: "scamper_a", letter: "A", label: "Adapt · 응용",              hint: "다른 분야·문맥의 해법을 가져와 적용",   prompt: "이걸 다른 곳/시기에 적용하면?",
          color: "bg-stone-50 border-stone-200", text: "text-stone-800",
          ph: "예: 음식 배달 추적 UX → SaaS 온보딩 진척도 표시" },
        { key: "scamper_m", letter: "M", label: "Modify · 변형·확대·축소",   hint: "크기·빈도·강도·형태를 바꾸기",         prompt: "더 크게? 더 작게? 더 자주?",
          color: "bg-slate-50 border-slate-300", text: "text-slate-900",
          ph: "예: 1년 플랜 → 90일 챌린지 / 주간 회의 → 일일 5분 스탠드업" },
        { key: "scamper_p", letter: "P", label: "Put to other use · 다른 용도", hint: "원래 용도 외 다른 곳에 쓸 수 있나",  prompt: "이걸 누가, 어디서, 또 쓸 수 있을까?",
          color: "bg-slate-50 border-slate-200", text: "text-slate-800",
          ph: "예: B2C 플래너 → 1인 사업가용 OKR / 학생용 시간표" },
        { key: "scamper_e", letter: "E", label: "Eliminate · 제거",          hint: "없어도 되는 것을 과감히 빼기",         prompt: "이걸 제거하면 뭐가 단순해질까?",
          color: "bg-slate-50 border-slate-200", text: "text-slate-800",
          ph: "예: 가입 단계 5 → 2 / 설정 옵션 30개 → 핵심 5개" },
        { key: "scamper_r", letter: "R", label: "Reverse · 역발상·재배치",   hint: "순서 뒤집기·반대로 하기",              prompt: "거꾸로 하면? 사용자가 만들면?",
          color: "bg-neutral-100 border-neutral-200", text: "text-neutral-700",
          ph: "예: 우리가 가르치는 강의 → 사용자끼리 가르치는 커뮤니티 / 결제 후 사용 → 사용 후 결제" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200">
                <LabeledInput label="Subject · 개선 대상" valKey="scamper_subject" data={data} onChange={onChange} placeholder="예: 우리 플래너 앱 / 회의 프로세스 / 신규 가입 플로우" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">Bob Eberle SCAMPER</span> · 7가지 자극으로 기존 제품·프로세스를 재발명.
                각 글자는 &quot;질문&quot; — 정답이 아니라 가능성 탐색. <span className="font-semibold">평가는 나중</span>, 일단 많이 써라.
            </div>

            {/* 7글자 */}
            <div className="space-y-1.5">
                {cells.map(c => (
                    <div key={c.key} className={`rounded-lg p-3 border ${c.color} flex items-start gap-3`}>
                        <div className={`shrink-0 w-9 h-9 rounded-full bg-white border-2 flex items-center justify-center font-bold ${c.text}`}>
                            {c.letter}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                            <p className="text-[10px] text-neutral-500">{c.hint}</p>
                            <p className="text-[10px] text-neutral-400 italic mb-1">❓ {c.prompt}</p>
                            <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder={c.ph} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Top idea */}
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-300">
                <p className="text-xs font-bold text-stone-900">Top 3 · 시도해볼 아이디어</p>
                <p className="text-[10px] text-neutral-500 mb-1">7가지 중 가장 끌리는 3개 — 다음 스프린트에 작게 검증</p>
                <textarea value={data["scamper_top"] ?? ""} onChange={e => onChange("scamper_top", e.target.value)}
                    placeholder={"1. (M) 일일 5분 스탠드업 시범 — 다음 주 월요일\n2. (C) 회의록 + 자동 액션 추적 프로토타입 — 2주 내\n3. (E) 설정 옵션 30→5 단순화 — 디자인 시안 1주"} rows={3}
                    className="w-full mt-1 resize-none bg-white text-xs p-2 rounded border border-stone-200 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}


type ParetoItem = { name: string; value: number };
function ParetoGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const items: ParetoItem[] = (() => {
        try { return data["pareto_items"] ? JSON.parse(data["pareto_items"]) : []; }
        catch { return []; }
    })();
    const ensureMin = items.length === 0 ? [{ name: "", value: 0 }] : items;
    const save = (next: ParetoItem[]) => onChange("pareto_items", JSON.stringify(next));
    const update = (idx: number, patch: Partial<ParetoItem>) => {
        const next = [...ensureMin]; next[idx] = { ...next[idx], ...patch }; save(next);
    };
    const add = () => save([...ensureMin, { name: "", value: 0 }]);
    const remove = (idx: number) => save(ensureMin.filter((_, i) => i !== idx));

    const sorted = [...ensureMin].filter(x => x.value > 0).sort((a, b) => b.value - a.value);
    const total = sorted.reduce((s, x) => s + x.value, 0) || 1;
    const maxVal = sorted[0]?.value || 1;

    let cum = 0;
    const rows = sorted.map((it) => {
        cum += it.value;
        return { ...it, pct: it.value / total * 100, cumPct: cum / total * 100, barPct: it.value / maxVal * 100 };
    });

    return (
        <div className="my-2 space-y-3">
            <div className="text-[10px] text-neutral-500 px-1">
                <strong>80/20 파레토</strong> · 상위 20% 항목이 80%의 결과를 만든다
            </div>
            {/* 입력 테이블 */}
            <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <div className="bg-neutral-50 px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex gap-2">
                    <span className="flex-1">항목</span>
                    <span className="w-24 text-right">값</span>
                    <span className="w-6"></span>
                </div>
                {ensureMin.map((it, idx) => (
                    <div key={idx} className="flex gap-2 px-3 py-1.5 border-t border-neutral-100 items-center">
                        <input type="text" value={it.name} onChange={e => update(idx, { name: e.target.value })}
                            placeholder="항목명"
                            className="flex-1 px-2 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        <input type="number" min={0} value={it.value} onChange={e => update(idx, { value: +e.target.value })}
                            className="w-24 px-2 py-1 text-xs text-right bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        {ensureMin.length > 1 && (
                            <button onClick={() => remove(idx)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">
                + 항목 추가
            </button>
            {/* 시각화 */}
            {rows.length > 0 && (
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 space-y-1.5">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-2">시각화 (내림차순 + 누적%)</p>
                    {rows.map((r, i) => {
                        const isVital = r.cumPct <= 80;
                        return (
                            <div key={i} className="space-y-0.5">
                                <div className="flex items-center gap-2 text-[11px]">
                                    <span className="w-4 text-neutral-400">{i + 1}</span>
                                    <span className="flex-1 truncate font-medium">{r.name}</span>
                                    <span className={`tabular-nums ${isVital ? "text-slate-900 font-bold" : "text-neutral-500"}`}>{r.pct.toFixed(1)}%</span>
                                    <span className="w-14 text-right text-neutral-400 tabular-nums">누적 {r.cumPct.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${isVital ? "bg-slate-900" : "bg-neutral-400"}`} style={{ width: `${r.barPct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                    <p className="text-[10px] text-slate-700 mt-2 pt-2 border-t border-neutral-200">
                        <strong>Vital Few (누적 80% 이내)</strong> — 여기에 집중하세요.
                    </p>
                </div>
            )}
        </div>
    );
}

function FishboneGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const bones = [
        { key: "fish_people", label: "People · 사람", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "fish_process", label: "Process · 프로세스", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
        { key: "fish_technology", label: "Technology · 기술", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "fish_environment", label: "Environment · 환경", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-800" },
        { key: "fish_materials", label: "Materials · 자원", emoji: "", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
        { key: "fish_measurement", label: "Measurement · 측정", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-stone-700" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* Problem head */}
            <div className="rounded-xl p-3 bg-slate-100 border-2 border-slate-400 relative">
                <div className="flex items-center gap-2">
                    <span className="text-xl"></span>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">Problem · 문제 (물고기 머리)</p>
                        <textarea value={data["fish_problem"] ?? ""} onChange={e => onChange("fish_problem", e.target.value)}
                            placeholder="해결하려는 문제를 한 문장으로…"
                            rows={1}
                            className="w-full mt-1 resize-none bg-white/60 text-sm p-1.5 rounded border border-slate-200 focus:outline-none" />
                    </div>
                </div>
            </div>
            {/* 6 bones */}
            <div className="grid grid-cols-2 gap-2">
                {bones.map(b => (
                    <div key={b.key} className={`rounded-lg p-3 border ${b.color} min-h-24`}>
                        <p className={`text-xs font-bold ${b.text}`}>{b.label}</p>
                        <CellTextarea cellKey={b.key} value={data[b.key] ?? ""} onChange={onChange} placeholder="원인들을 줄바꿈으로…" />
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-neutral-400 text-center">각 카테고리별로 "왜?"를 여러 번 물어 하위 원인을 내려가보세요.</p>
        </div>
    );
}

type JourneyStage = { stage: string; action: string; thought: string; emotion: string; opportunity: string };
function JourneyMapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: JourneyStage[] = [
        { stage: "Awareness · 인지", action: "검색 · SNS 발견 · 추천 듣기", thought: "이런 게 있구나, 진짜 도움될까?", emotion: "🤔", opportunity: "광고 카피·후기 노출 강화" },
        { stage: "Consideration · 고려", action: "비교·리뷰·체험 신청", thought: "다른 거랑 뭐가 다르지? 가격은?", emotion: "🧐", opportunity: "1분 데모 영상·비교표·14일 무료" },
        { stage: "Onboarding · 첫 사용", action: "가입·튜토리얼·첫 작업", thought: "복잡한가? 첫 5분에 가치 보일까?", emotion: "😟", opportunity: "체크리스트·실시간 코칭·첫 성공 보상" },
        { stage: "Retention · 유지·습관화", action: "주 3회+ 사용 · 다른 기능 발견", thought: "이거 없으면 일이 안 되네", emotion: "😊", opportunity: "주간 리포트·성과 시각화·뱃지" },
        { stage: "Advocacy · 추천·확산", action: "동료 추천 · 후기 작성", thought: "다른 사람도 알면 좋겠다", emotion: "🤩", opportunity: "초대 보상·앰버서더 프로그램" },
    ];
    const stages: JourneyStage[] = (() => {
        try {
            const parsed = data["journey_stages"] ? JSON.parse(data["journey_stages"]) : null;
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT;
        } catch { return DEFAULT; }
    })();
    const save = (next: JourneyStage[]) => onChange("journey_stages", JSON.stringify(next));
    const update = (idx: number, patch: Partial<JourneyStage>) => {
        const next = [...stages]; next[idx] = { ...next[idx], ...patch }; save(next);
    };
    const add = () => save([...stages, { stage: "새 단계", action: "", thought: "", emotion: "", opportunity: "" }]);
    const remove = (idx: number) => save(stages.filter((_, i) => i !== idx));

    return (
        <div className="my-2 space-y-2">
            {/* Persona + Scope */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Persona · 대상 고객" valKey="journey_persona" data={data} onChange={onChange} placeholder="예: 30대 1인 마케터 박지현" />
                <LabeledInput label="Scope · 여정 범위" valKey="journey_scope" data={data} onChange={onChange} placeholder="예: 광고 노출 → 90일 유료 전환" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">Customer Journey Map</span> · 행동(관찰) + 생각(추론) + 감정(공감) + 기회(개입점)를 한 줄로.
                감정에 <span className="font-semibold">이모지·1~5점</span>으로 강도 표시하면 구간별 페인 즉시 보임. 가장 낮은 감정 = 가장 큰 기회.
            </div>

            {/* Stage table */}
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs" style={{ minWidth: 640 }}>
                    <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="px-2 py-2 text-left w-40">단계</th>
                            <th className="px-2 py-2 text-left">행동</th>
                            <th className="px-2 py-2 text-left">생각</th>
                            <th className="px-2 py-2 text-center w-16">감정</th>
                            <th className="px-2 py-2 text-left">개선 기회</th>
                            <th className="w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {stages.map((s, idx) => (
                            <tr key={idx} className="border-t border-neutral-100 align-top">
                                <td className="px-2 py-2">
                                    <input type="text" value={s.stage} onChange={e => update(idx, { stage: e.target.value })}
                                        className="w-full px-1.5 py-1 text-xs font-semibold bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                </td>
                                <td className="px-2 py-2">
                                    <textarea value={s.action} onChange={e => update(idx, { action: e.target.value })}
                                        rows={2}
                                        className="w-full resize-none px-1.5 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                </td>
                                <td className="px-2 py-2">
                                    <textarea value={s.thought} onChange={e => update(idx, { thought: e.target.value })}
                                        rows={2}
                                        className="w-full resize-none px-1.5 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <input type="text" value={s.emotion} onChange={e => update(idx, { emotion: e.target.value })}
                                        className="w-full px-1 py-1 text-center text-base bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                </td>
                                <td className="px-2 py-2">
                                    <textarea value={s.opportunity} onChange={e => update(idx, { opportunity: e.target.value })}
                                        rows={2}
                                        className="w-full resize-none px-1.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white focus:border-slate-700" />
                                </td>
                                <td className="px-1 py-2 text-center">
                                    {stages.length > 1 && (
                                        <button onClick={() => remove(idx)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">
                + 단계 추가
            </button>

            {/* Top opportunities */}
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-300">
                <p className="text-xs font-bold text-stone-900">Top 3 · 가장 시급한 개선 기회</p>
                <p className="text-[10px] text-neutral-500 mb-1">감정 점수가 가장 낮은 구간 우선. 담당·기한까지.</p>
                <CellTextarea cellKey="journey_top" value={data["journey_top"] ?? ""} onChange={onChange} placeholder={"1. Onboarding 첫 5분 — 체크리스트 v1 (홍길동, ~05-10)\n2. Retention 주차별 리포트 — 자동 발송 (김영희, ~05-20)\n3. Advocacy 초대 보상 — A/B 테스트 (박철수, ~06-01)"} />
            </div>
        </div>
    );
}

function KptGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "kpt_keep",    label: "Keep",    sub: "잘한 것 · 계속할 것",   color: "bg-slate-50 border-slate-300", text: "text-slate-900",
          ph: "- 데일리 스탠드업 10분 룰 지킴 → 회의 효율 ↑\n- 페어 코딩으로 신규 멤버 온보딩 가속" },
        { key: "kpt_problem", label: "Problem", sub: "문제 · 개선할 것",      color: "bg-slate-50 border-slate-200", text: "text-stone-700",
          ph: "- 스프린트 후반에 PR 리뷰가 몰림\n- 기획-개발 핸드오프에서 정보 누락" },
        { key: "kpt_try",     label: "Try",     sub: "새로 시도할 것",        color: "bg-stone-50 border-stone-200", text: "text-stone-800",
          ph: "- PR 리뷰 데드라인 24h 룰 도입\n- 핸드오프 체크리스트 v1 시범" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2">
                <LabeledInput label="Sprint·기간" valKey="kpt_sprint" data={data} onChange={onChange} placeholder="W18 · 2026-04-21~04-27" />
                <LabeledInput label="Team·팀" valKey="kpt_team" data={data} onChange={onChange} placeholder="플래너스 코어팀" />
                <LabeledInput label="Facilitator·진행" valKey="kpt_facilitator" data={data} onChange={onChange} placeholder="이름" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">진행 순서</span> · Keep(5분) → Problem(10분) → Try(10분, 다음 스프린트 실행 가능 1~3개로 좁히기).
                Try는 반드시 <span className="font-semibold">담당자·기한</span>까지 정해야 다음 회고에서 점검 가능.
            </div>

            {/* 3 카테고리 */}
            <div className="grid md:grid-cols-3 gap-2">
                {cells.map(c => (
                    <div key={c.key} className={`rounded-lg p-3 border ${c.color} min-h-44`}>
                        <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                        <p className="text-[10px] text-neutral-500 mb-1">{c.sub}</p>
                        <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder={c.ph} />
                    </div>
                ))}
            </div>

            {/* Top Try with owner & deadline */}
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-300">
                <p className="text-xs font-bold text-slate-900">Top Try · 다음 스프린트 핵심 시도 (1~3개)</p>
                <p className="text-[10px] text-neutral-500 mb-2">담당·기한이 있어야 회고가 의미를 가진다.</p>
                <textarea value={data["kpt_top_try"] ?? ""} onChange={e => onChange("kpt_top_try", e.target.value)}
                    placeholder={"- [홍길동] PR 리뷰 24h 룰 시범 · ~05-04\n- [김영희] 핸드오프 체크리스트 v1 작성 · ~05-02"} rows={3}
                    className="w-full mt-1 resize-none bg-white text-xs p-2 rounded border border-slate-200 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

function OodaGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "ooda_observe", label: "Observe", sub: "관찰 · 무엇이 일어나고 있나", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "ooda_orient", label: "Orient", sub: "방향 설정 · 맥락·가정 점검", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
        { key: "ooda_decide", label: "Decide", sub: "결정 · 어떻게 움직일까", emoji: "", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
        { key: "ooda_act", label: "Act", sub: "실행 · 그리고 다시 관찰", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
    ];
    return (
        <div className="my-2 space-y-1.5">
            {steps.map((s, i) => (
                <div key={s.key} className="flex items-start gap-2">
                    <div className="shrink-0 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold ${s.text}`}>
                            {i + 1}
                        </div>
                        {i < 3 && <div className="w-px flex-1 bg-neutral-300 my-1" style={{ minHeight: 20 }} />}
                    </div>
                    <div className={`flex-1 rounded-lg p-3 border ${s.color}`}>
                        <p className={`text-xs font-bold ${s.text}`}>{s.label}</p>
                        <p className="text-[10px] text-neutral-500">{s.sub}</p>
                        <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange} />
                    </div>
                </div>
            ))}
            <p className="text-[10px] text-neutral-400 text-center pt-1">⟳ 반복되는 루프 — Act 후 다시 Observe로</p>
        </div>
    );
}

function CornellGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 rounded-lg border-2 border-neutral-300 overflow-hidden bg-white">
            {/* Top: Cue (left) + Notes (right) */}
            <div className="grid grid-cols-[1fr_2fr]">
                <div className="border-r border-neutral-300 bg-stone-50 p-3">
                    <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Cue</p>
                    <p className="text-[9px] text-neutral-500">핵심 키워드 · 질문</p>
                    <textarea value={data["cornell_cue"] ?? ""} onChange={e => onChange("cornell_cue", e.target.value)}
                        placeholder="핵심 키워드들…" rows={10}
                        className="w-full mt-2 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
                </div>
                <div className="bg-white p-3">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Notes</p>
                    <p className="text-[9px] text-neutral-500">수업·강의·독서 내용</p>
                    <textarea value={data["cornell_notes"] ?? ""} onChange={e => onChange("cornell_notes", e.target.value)}
                        placeholder="본 내용을 자유롭게…" rows={10}
                        className="w-full mt-2 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
                </div>
            </div>
            {/* Bottom: Summary */}
            <div className="border-t-2 border-neutral-300 bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Summary</p>
                <p className="text-[9px] text-neutral-500">요약 · 종합 — 내 언어로 다시 쓰기</p>
                <textarea value={data["cornell_summary"] ?? ""} onChange={e => onChange("cornell_summary", e.target.value)}
                    placeholder="오늘 배운 것을 한 단락으로 요약…" rows={4}
                    className="w-full mt-2 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

type DmCriterion = { name: string; weight: number };
type DmOption = { name: string; scores: number[] };
function DecisionMatrixGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT = { criteria: [{ name: "기준 1", weight: 3 }, { name: "기준 2", weight: 2 }], options: [{ name: "옵션 A", scores: [0, 0] }, { name: "옵션 B", scores: [0, 0] }] };
    const parsed: { criteria: DmCriterion[]; options: DmOption[] } = (() => {
        try {
            const p = data["dm_options"] ? JSON.parse(data["dm_options"]) : null;
            return p && Array.isArray(p.criteria) && Array.isArray(p.options) ? p : DEFAULT;
        } catch { return DEFAULT; }
    })();
    const save = (next: typeof parsed) => onChange("dm_options", JSON.stringify(next));

    const updateCriterion = (i: number, patch: Partial<DmCriterion>) => {
        const next = { ...parsed, criteria: [...parsed.criteria] };
        next.criteria[i] = { ...next.criteria[i], ...patch };
        save(next);
    };
    const updateOption = (i: number, patch: Partial<DmOption>) => {
        const next = { ...parsed, options: [...parsed.options] };
        next.options[i] = { ...next.options[i], ...patch };
        save(next);
    };
    const updateScore = (optIdx: number, crIdx: number, val: number) => {
        const next = { ...parsed, options: [...parsed.options] };
        const scores = [...(next.options[optIdx].scores || [])];
        while (scores.length < parsed.criteria.length) scores.push(0);
        scores[crIdx] = val;
        next.options[optIdx] = { ...next.options[optIdx], scores };
        save(next);
    };
    const addCriterion = () => save({ ...parsed, criteria: [...parsed.criteria, { name: "새 기준", weight: 1 }], options: parsed.options.map(o => ({ ...o, scores: [...o.scores, 0] })) });
    const removeCriterion = (i: number) => save({ ...parsed, criteria: parsed.criteria.filter((_, x) => x !== i), options: parsed.options.map(o => ({ ...o, scores: o.scores.filter((_, x) => x !== i) })) });
    const addOption = () => save({ ...parsed, options: [...parsed.options, { name: "새 옵션", scores: parsed.criteria.map(() => 0) }] });
    const removeOption = (i: number) => save({ ...parsed, options: parsed.options.filter((_, x) => x !== i) });

    const totals = parsed.options.map(op => op.scores.reduce((s, v, i) => s + (v * (parsed.criteria[i]?.weight ?? 1)), 0));
    const maxTotal = Math.max(...totals, 1);
    const rank = (i: number) => [...totals].map((t, idx) => ({ t, idx })).sort((a, b) => b.t - a.t).findIndex(x => x.idx === i) + 1;

    return (
        <div className="my-2 space-y-2">
            <p className="text-[10px] text-neutral-500 px-1">
                <strong>기준 가중치 × 옵션 점수</strong> — 점수는 1~5 (높을수록 유리). 총점 = Σ(점수 × 가중치)
            </p>
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-[10px] text-neutral-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-2 py-2 text-left">옵션 ↓ / 기준 →</th>
                            {parsed.criteria.map((c, i) => (
                                <th key={i} className="px-2 py-2 text-center">
                                    <input type="text" value={c.name} onChange={e => updateCriterion(i, { name: e.target.value })}
                                        className="w-24 text-center font-semibold bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-neutral-500 focus:outline-none" />
                                    <div className="flex items-center gap-1 justify-center mt-1 text-[9px] text-neutral-400 normal-case">
                                        w
                                        <input type="number" min={1} max={9} value={c.weight} onChange={e => updateCriterion(i, { weight: +e.target.value })}
                                            className="w-8 text-center px-1 py-0.5 bg-white border border-neutral-200 rounded text-xs" />
                                        {parsed.criteria.length > 1 && (
                                            <button onClick={() => removeCriterion(i)} className="text-neutral-300 hover:text-slate-700 text-xs">×</button>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-2 py-2 text-right w-20">총점</th>
                            <th className="w-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {parsed.options.map((op, oi) => {
                            const r = rank(oi);
                            const isTop = r === 1 && totals[oi] > 0;
                            return (
                                <tr key={oi} className={`border-t border-neutral-100 ${isTop ? "bg-slate-50" : ""}`}>
                                    <td className="px-2 py-2">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-neutral-400 shrink-0">{isTop ? <span className="text-slate-900 font-bold">★</span> : r}</span>
                                            <input type="text" value={op.name} onChange={e => updateOption(oi, { name: e.target.value })}
                                                className="flex-1 px-1 py-1 text-xs font-medium bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                        </div>
                                    </td>
                                    {parsed.criteria.map((_, ci) => (
                                        <td key={ci} className="px-2 py-2 text-center">
                                            <select value={op.scores[ci] ?? 0} onChange={e => updateScore(oi, ci, +e.target.value)}
                                                className="w-14 px-1 py-1 text-center text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300">
                                                {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </td>
                                    ))}
                                    <td className={`px-2 py-2 text-right font-mono font-bold ${isTop ? "text-slate-900" : "text-neutral-700"}`}>
                                        {totals[oi]}
                                        {totals[oi] > 0 && (
                                            <div className="h-1 bg-neutral-200 rounded-full overflow-hidden mt-1">
                                                <div className={`h-full ${isTop ? "bg-slate-900" : "bg-neutral-400"}`} style={{ width: `${totals[oi] / maxTotal * 100}%` }} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-1 text-center">
                                        {parsed.options.length > 1 && (
                                            <button onClick={() => removeOption(oi)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2">
                <button onClick={addOption} className="flex-1 py-1.5 border border-dashed border-neutral-300 rounded-lg text-[11px] text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">+ 옵션</button>
                <button onClick={addCriterion} className="flex-1 py-1.5 border border-dashed border-neutral-300 rounded-lg text-[11px] text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">+ 기준</button>
            </div>
        </div>
    );
}

function FeynmanGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "feynman_concept",  label: "1. Concept · 주제 한 줄",          hint: "가르치려는 개념·내용을 한 줄로",         color: "bg-slate-50 border-slate-200", text: "text-slate-800",
          ph: "예: 강화학습이란 무엇인가? / OAuth 2.0 동작 원리 / Cash Flow Statement 읽는 법" },
        { key: "feynman_teach",    label: "2. Teach · 6살에게 설명하듯",      hint: "전문용어·약어 금지 — 일상 단어로만",      color: "bg-slate-50 border-slate-200", text: "text-slate-800",
          ph: "예: 강화학습은 강아지에게 간식 주면서 훈련시키는 것과 같아. 잘하면 점수를 주고, 못하면 점수를 안 줘. 강아지(컴퓨터)는 점수를 많이 받는 행동을 점점 더 자주 하게 돼." },
        { key: "feynman_gaps",     label: "3. Gaps · 막힌 곳·애매한 곳",      hint: "설명하다 막힌 부분 = 진짜 모르는 부분",   color: "bg-slate-50 border-slate-200", text: "text-stone-700",
          ph: "예: \"점수를 어떻게 정하지?\"에서 막힘 — Reward function 설계 원리 다시 공부\n\"왜 강화학습이 지도학습보다 어렵지?\" — Exploration vs Exploitation 이해 부족" },
        { key: "feynman_simplify", label: "4. Simplify · 비유·예시로 다시",   hint: "갭을 메운 후 더 짧고 명료하게",          color: "bg-slate-50 border-slate-300", text: "text-slate-900",
          ph: "예: 강화학습 = \"시행착오로 배우는 컴퓨터\". 핵심 3요소: 행동 / 보상 / 환경. 자전거 처음 배울 때처럼 — 넘어지면 (음수 보상) 다시 시도, 잘 가면 (양수 보상) 그 방법을 기억." },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2">
                <LabeledInput label="대상 청자" valKey="feynman_audience" data={data} onChange={onChange} placeholder="예: 6살 / 비전공자 동료 / 신입 인턴" />
                <LabeledInput label="검증 시점" valKey="feynman_verify" data={data} onChange={onChange} placeholder="언제 누구에게 실제로 설명해볼까?" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">Feynman Technique</span> · &quot;설명할 수 없으면 모르는 것이다.&quot;
                4단계 사이클: 개념 → 단순 설명 → 막힌 곳 발견 → 재학습 후 단순화. <span className="font-semibold">완벽한 1회보다 거친 N회</span>.
            </div>

            {/* 4단계 */}
            <div className="space-y-1.5">
                {steps.map((s, i) => (
                    <div key={s.key} className={`rounded-lg p-3 border ${s.color}`}>
                        <div className="flex items-start gap-2">
                            <div className={`shrink-0 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold ${s.text}`}>{i + 1}</div>
                            <div className="flex-1">
                                <p className={`text-xs font-bold ${s.text}`}>{s.label}</p>
                                <p className="text-[10px] text-neutral-500 mb-1">{s.hint}</p>
                                <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange} placeholder={s.ph} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cycle again */}
            <div className="rounded-lg p-3 bg-stone-50 border border-stone-300">
                <p className="text-xs font-bold text-stone-900">5. Repeat · 다시 사이클로 돌아가기</p>
                <p className="text-[10px] text-neutral-500 mb-1">막힘이 사라질 때까지 — 다음에 보강할 갭·읽을 자료</p>
                <CellTextarea cellKey="feynman_repeat" value={data["feynman_repeat"] ?? ""} onChange={onChange} placeholder={"- Sutton & Barto 2장 다시 읽기\n- 동료에게 5분 발표 후 피드백\n- 1주일 뒤 다시 설명해보기"} />
            </div>
        </div>
    );
}

function LabeledInput({ label, valKey, data, onChange, placeholder, type = "text" }: {
    label: string; valKey: string; data: FrameworkData; onChange: (k: string, v: string) => void; placeholder?: string; type?: string;
}) {
    return (
        <label className="block">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
            <input type={type} value={data[valKey] ?? ""} onChange={e => onChange(valKey, e.target.value)}
                placeholder={placeholder}
                className="w-full mt-1 px-2 py-1.5 text-xs bg-white border border-neutral-200 rounded focus:outline-none focus:border-[#0F766E]" />
        </label>
    );
}

function LabeledBox({ label, sub, valKey, data, onChange, placeholder, color = "bg-neutral-50 border-neutral-200", textColor = "text-neutral-700" }: {
    label: string; sub?: string; valKey: string; data: FrameworkData; onChange: (k: string, v: string) => void; placeholder?: string; color?: string; textColor?: string;
}) {
    return (
        <div className={`rounded-lg p-3 border ${color}`}>
            <p className={`text-xs font-bold ${textColor}`}>{label}</p>
            {sub && <p className="text-[10px] text-neutral-500">{sub}</p>}
            <CellTextarea cellKey={valKey} value={data[valKey] ?? ""} onChange={onChange} placeholder={placeholder} />
        </div>
    );
}

function OneOnOneGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2">
                <LabeledInput label="With · 상대" valKey="oto_with" data={data} onChange={onChange} placeholder="이름" />
                <LabeledInput label="관계" valKey="oto_role" data={data} onChange={onChange} placeholder="팀원 · 매니저 · 멘토" />
                <LabeledInput label="일시" valKey="oto_date" data={data} onChange={onChange} placeholder="2026-04-27 14:00" />
            </div>

            {/* 10분 / 10분 / 10분 구조 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">권장 구조</span> · 상대 이야기(15분) → 내 이야기(10분) → 다음 액션(5분).
                일/사람/성장 3축으로 균형 있게.
            </div>

            {/* Their agenda first — 1on1의 핵심 */}
            <LabeledBox label="Their Agenda · 상대가 먼저 꺼낸 주제" valKey="oto_their_agenda" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="요즘 어떻게 지내요? — 상대가 가장 말하고 싶은 것부터" />

            {/* Updates */}
            <LabeledBox label="Updates · 진행 상황·성과" valKey="oto_updates" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" placeholder="지난 1on1 이후 진척 · 마무리한 일 · 진행 중인 일" />

            {/* Blockers / Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Blockers · 막힌 것·도움 필요" valKey="oto_blockers" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" placeholder="혼자 풀기 어려운 문제 · 의사결정 필요한 것" />
                <LabeledBox label="Concerns · 고민·우려" valKey="oto_concerns" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" placeholder="팀·프로세스·관계·번아웃 등" />
            </div>

            {/* Feedback 양방향 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Feedback to them · 내가 줄 피드백" valKey="oto_feedback_to" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="강점·잘한 일 · 개선 포인트(SBI: 상황·행동·영향)" />
                <LabeledBox label="Feedback from them · 내가 받은 피드백" valKey="oto_feedback_from" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="상대가 나(매니저·동료)에게 준 피드백" />
            </div>

            {/* Growth */}
            <LabeledBox label="Growth · 성장·커리어" valKey="oto_growth" data={data} onChange={onChange} placeholder="장기 커리어 방향 · 배우고 싶은 것 · 시도하고 싶은 도전" />

            {/* Next */}
            <LabeledBox label="Next · 다음 액션·합의 사항" valKey="oto_next" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="- 누가 무엇을 언제까지&#10;- 다음 1on1까지 시도해볼 것" />
        </div>
    );
}

function MeetingGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* Header — 메타 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <LabeledInput label="제목" valKey="mtg_title" data={data} onChange={onChange} placeholder="예: Q2 마케팅 전략 회의" />
                    <LabeledInput label="일시" valKey="mtg_date" data={data} onChange={onChange} placeholder="2026-04-27 14:00~15:00" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <LabeledInput label="장소·매체" valKey="mtg_location" data={data} onChange={onChange} placeholder="회의실 A · Zoom · Teams" />
                    <LabeledInput label="진행자" valKey="mtg_facilitator" data={data} onChange={onChange} placeholder="이름" />
                </div>
                <LabeledInput label="참석자" valKey="mtg_attendees" data={data} onChange={onChange} placeholder="홍길동(기획), 김영희(개발), 박철수(디자인)" />
            </div>

            {/* 목적 + 안건 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Objective · 회의 목적" valKey="mtg_objective" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="이 회의가 끝나면 무엇이 결정/완성되어 있어야 하는가?" />
                <LabeledBox label="Agenda · 안건" valKey="mtg_agenda" data={data} onChange={onChange} placeholder="1. 지난 액션 점검 (5분)&#10;2. 핵심 안건 (20분)&#10;3. 결정·할당 (10분)&#10;4. 다음 단계 합의 (5분)" />
            </div>

            {/* 논의 */}
            <LabeledBox label="Discussion · 논의 내용" valKey="mtg_discussion" data={data} onChange={onChange} placeholder="안건별 핵심 논점·의견·근거를 정리. 누가 어떤 입장이었는지." />

            {/* 결정 + 액션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Decisions · 결정 사항" valKey="mtg_decisions" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="- A안 채택&#10;- 예산 1,500만원 확정&#10;- 4/30까지 1차 시안 완성" />
                <LabeledBox label="Action Items · 액션 아이템" valKey="mtg_actions" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="- [홍길동] 시안 3안 제작 · 4/30&#10;- [김영희] API 스펙 초안 · 5/2&#10;- [박철수] 컬러 팔레트 확정 · 5/3" />
            </div>

            {/* 보류/리스크 + 다음 회의 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Parked · 보류·이슈" valKey="mtg_parked" data={data} onChange={onChange} placeholder="이번엔 못 정한 것 · 추가 확인 필요" />
                <LabeledBox label="Next Meeting · 다음 회의" valKey="mtg_next" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="일시 · 안건 · 사전 준비물" />
            </div>
        </div>
    );
}

function InterviewGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    <LabeledInput label="인터뷰이" valKey="itv_name" data={data} onChange={onChange} placeholder="이름·익명" />
                    <LabeledInput label="역할·직업" valKey="itv_role" data={data} onChange={onChange} placeholder="예: 30대 마케터" />
                    <LabeledInput label="일시" valKey="itv_date" data={data} onChange={onChange} placeholder="2026-04-27" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <LabeledInput label="채널·방법" valKey="itv_channel" data={data} onChange={onChange} placeholder="대면 · Zoom · 전화 · 30분" />
                    <LabeledInput label="가설·검증 목적" valKey="itv_hypothesis" data={data} onChange={onChange} placeholder="이 인터뷰로 무엇을 확인하려는가?" />
                </div>
            </div>

            {/* The Mom Test 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">Mom Test 원칙</span> · 의견·미래계획·칭찬 ❌ → 과거의 구체 행동·금전·시간 데이터 ✅.
                &quot;~할 것 같다&quot;가 아니라 &quot;지난주에 ~했다&quot;를 끌어내라.
            </div>

            {/* Past behavior — 과거 행동 (가장 중요) */}
            <LabeledBox label="Past Behavior · 과거에 어떻게 해결했나?" valKey="itv_past" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="최근에 [문제]를 마주쳤을 때 무엇을 했는지 · 시간·돈을 얼마나 썼는지" />

            {/* Goals + Pains 양립 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Goals · 목표·하고 있는 것" valKey="itv_goals" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="요즘 가장 신경 쓰는 일·목표" />
                <LabeledBox label="Pains · 문제·불편" valKey="itv_pains" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" placeholder="가장 짜증나는 순간 · 비효율 · 답답함" />
            </div>

            {/* Workarounds — 현재 대처 */}
            <LabeledBox label="Workarounds · 현재 대처 방법" valKey="itv_workarounds" data={data} onChange={onChange} placeholder="지금 어떻게 우회하고 있는가? 어떤 도구·서비스 쓰고 있는가?" />

            {/* Quotes — 직접 인용 (그대로) */}
            <div className="rounded-lg p-3 bg-white border-l-4 border-slate-500">
                <p className="text-xs font-bold text-slate-700">Quotes · 인상 깊은 인용문 (그대로)</p>
                <p className="text-[10px] text-neutral-500 mb-1">상대 입에서 나온 표현 그대로 따옴. 패러프레이즈 X — 발견 디스커션의 원료.</p>
                <textarea value={data["itv_quotes"] ?? ""} onChange={e => onChange("itv_quotes", e.target.value)}
                    placeholder={'"매주 화요일 새벽 2시까지 엑셀로 정리해요…"\n"이게 진짜 짜증나는 게…"'} rows={4}
                    className="w-full mt-1 resize-none bg-transparent text-xs italic text-neutral-700 placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
            </div>

            {/* Surprises + Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Surprises · 예상 밖의 발견" valKey="itv_surprises" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" placeholder="가설과 다른 것 · 의외의 행동·맥락" />
                <LabeledBox label="Insights · 핵심 인사이트" valKey="itv_insights" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="이 인터뷰가 우리 의사결정에 주는 메시지 1~2줄" />
            </div>

            {/* Next steps */}
            <LabeledBox label="Next · 다음 단계·검증 항목" valKey="itv_next" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="추가 인터뷰 대상 · 프로토타입 검증 · 다른 가설 테스트" />
        </div>
    );
}

function AarGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "aar_planned", label: "계획된 것은 무엇이었나?", hint: "원래 의도·목표·예상 결과", color: "bg-slate-50 border-slate-200", text: "text-slate-800",
          ph: "예: Q2 캠페인으로 신규 가입 1,500명 확보 · 4주 진행 · 광고비 800만원" },
        { key: "aar_actual",  label: "실제로 일어난 일은?",     hint: "관찰 가능한 사실만 — 해석 X",   color: "bg-slate-50 border-slate-200", text: "text-slate-800",
          ph: "예: 신규 가입 1,180명 (목표의 79%) · 4주차 광고 전환율 급락 · 콘텐츠 1편 누락" },
        { key: "aar_diff",    label: "왜 차이가 났나?",         hint: "원인 분석 — 잘된 것·안 된 것 모두", color: "bg-stone-50 border-stone-200", text: "text-stone-800",
          ph: "잘된 것: 1~2주차 후킹 카피 적중 · 인플 협업 확장\n안 된 것: 3주차 크리에이티브 피로 · 검수 병목" },
        { key: "aar_lessons", label: "배운 것 · 다음에 할 것",  hint: "재현 가능한 교훈으로 일반화",     color: "bg-slate-50 border-slate-300", text: "text-slate-900",
          ph: "교훈: 4주 캠페인은 2주차에 크리에이티브 리프레시가 필수\n다음: [홍길동] 크리에이티브 풀 사전 확보 · 다음 캠페인 D-7" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2">
                <LabeledInput label="Event·이벤트" valKey="aar_event" data={data} onChange={onChange} placeholder="예: Q2 신규 가입 캠페인" />
                <LabeledInput label="기간" valKey="aar_period" data={data} onChange={onChange} placeholder="2026-04-01 ~ 04-28" />
                <LabeledInput label="참여자·관계자" valKey="aar_team" data={data} onChange={onChange} placeholder="마케팅 4 · 디자인 2 · 외부 인플 3" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">AAR 4질문 (US Army)</span> · 비난 X · 사실과 해석을 분리.
                &quot;실제 일어난 일&quot;은 데이터·관찰만, &quot;왜&quot;에서 해석·원인. 결과는 <span className="font-semibold">재현 가능한 교훈</span>으로 끝나야 자산이 됨.
            </div>

            {/* 4단계 */}
            <div className="space-y-1.5">
                {steps.map((s, i) => (
                    <div key={s.key} className={`rounded-lg p-3 border ${s.color}`}>
                        <div className="flex items-start gap-2">
                            <div className={`shrink-0 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold ${s.text}`}>{i + 1}</div>
                            <div className="flex-1">
                                <p className={`text-xs font-bold ${s.text}`}>{s.label}</p>
                                <p className="text-[10px] text-neutral-500 mb-1">{s.hint}</p>
                                <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange} placeholder={s.ph} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sustain / Improve 액션 분리 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-300">
                    <p className="text-xs font-bold text-slate-900">Sustain · 계속할 것</p>
                    <p className="text-[10px] text-neutral-500 mb-1">조직 자산으로 굳혀야 할 패턴</p>
                    <CellTextarea cellKey="aar_sustain" value={data["aar_sustain"] ?? ""} onChange={onChange} placeholder="후킹 카피 A/B 테스트 절차 → 표준 매뉴얼화" />
                </div>
                <div className="rounded-lg p-3 bg-stone-50 border border-stone-300">
                    <p className="text-xs font-bold text-stone-900">Improve · 고칠 것</p>
                    <p className="text-[10px] text-neutral-500 mb-1">담당·기한이 있어야 액션</p>
                    <CellTextarea cellKey="aar_improve" value={data["aar_improve"] ?? ""} onChange={onChange} placeholder="- [김영희] 검수 워크플로 재설계 · ~05-15" />
                </div>
            </div>
        </div>
    );
}

type BsIdea = { text: string; starred?: boolean };
function BrainstormGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const ideas: BsIdea[] = (() => {
        try { return data["bs_ideas"] ? JSON.parse(data["bs_ideas"]) : []; }
        catch { return []; }
    })();
    const ensureMin = ideas.length === 0 ? [{ text: "" }] : ideas;
    const save = (next: BsIdea[]) => onChange("bs_ideas", JSON.stringify(next));
    const update = (i: number, patch: Partial<BsIdea>) => {
        const next = [...ensureMin]; next[i] = { ...next[i], ...patch }; save(next);
    };
    const add = () => save([...ensureMin, { text: "" }]);
    const remove = (i: number) => save(ensureMin.filter((_, x) => x !== i));
    const toggleStar = (i: number) => update(i, { starred: !ensureMin[i].starred });

    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-300">
                <LabeledInput label="주제 · Topic" valKey="bs_topic" data={data} onChange={onChange} placeholder="무엇에 대해 아이디어를 낼까?" />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 py-2 border-b border-neutral-100">Ideas · 떠오르는 대로</p>
                <div className="divide-y divide-neutral-100">
                    {ensureMin.map((idea, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                            <button onClick={() => toggleStar(i)} className={`shrink-0 w-6 h-6 rounded flex items-center justify-center ${idea.starred ? "text-slate-700" : "text-neutral-300 hover:text-slate-500"}`}>
                                {idea.starred ? "" : ""}
                            </button>
                            <input type="text" value={idea.text} onChange={e => update(i, { text: e.target.value })}
                                placeholder="아이디어…"
                                className="flex-1 px-1 py-1 text-xs bg-transparent border-b border-transparent focus:outline-none focus:border-neutral-300" />
                            {ensureMin.length > 1 && (
                                <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={add} className="w-full py-2 border-t border-neutral-100 text-xs text-neutral-400 hover:bg-neutral-50 hover:text-[#0F766E]">+ 아이디어 추가</button>
            </div>
            <LabeledBox label="Criteria · 선정 기준" valKey="bs_criteria" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Chosen · 최종 선택" valKey="bs_chosen" data={data} onChange={onChange} color="bg-slate-50 border-slate-400" textColor="text-slate-900" />
        </div>
    );
}

function DecisionLogGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="결정 일자" valKey="dl_date" data={data} onChange={onChange} placeholder="YYYY-MM-DD" />
                <LabeledInput label="결정자" valKey="dl_decider" data={data} onChange={onChange} />
            </div>
            <LabeledBox label="Decision · 결정 내용" valKey="dl_decision" data={data} onChange={onChange} color="bg-slate-50 border-slate-400" textColor="text-slate-900" placeholder="무엇을 결정했나" />
            <LabeledBox label="Context · 배경·맥락" valKey="dl_context" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Alternatives · 대안·기각한 것" valKey="dl_alternatives" data={data} onChange={onChange} color="bg-neutral-100 border-neutral-300" textColor="text-neutral-600" />
            <div className="grid md:grid-cols-2 gap-2">
                <LabeledBox label="Expected · 기대 결과" valKey="dl_expected" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
                <LabeledBox label="Actual · 실제 결과" valKey="dl_actual" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="나중에 돌아와 기록" />
            </div>
        </div>
    );
}

function EmotionLogGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const moods = ["", "", "", "", "", "", "", "", "", ""];
    const intensity = parseInt(data["emo_intensity"] ?? "3", 10);
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-2">오늘의 기분</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {moods.map(m => (
                        <button key={m} onClick={() => onChange("emo_mood", m)}
                            className={`w-9 h-9 rounded-full text-lg transition-all ${data["emo_mood"] === m ? "bg-white ring-2 ring-slate-700 scale-110" : "bg-white/50 hover:bg-white hover:scale-105"}`}>
                            {m}
                        </button>
                    ))}
                </div>
                <div>
                    <p className="text-[10px] text-neutral-500 mb-1">강도</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => onChange("emo_intensity", String(n))}
                                className={`flex-1 py-1 text-xs rounded ${intensity >= n ? "bg-slate-900 text-white font-bold" : "bg-white border border-slate-200 text-neutral-400"}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <LabeledBox label="Trigger · 계기" valKey="emo_trigger" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="무슨 일이 있었나?" />
            <LabeledBox label="Body · 몸의 신호" valKey="emo_body" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="어깨가 무겁다, 가슴이 두근거린다…" />
            <LabeledBox label="Thought · 떠오른 생각" valKey="emo_thought" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Reflection · 다시 본다면" valKey="emo_reflection" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
        </div>
    );
}

function GratitudeGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-4 bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider text-center mb-3">오늘 감사한 일 세 가지</p>
                <div className="space-y-2">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="flex items-start gap-2">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">{n}</div>
                            <textarea value={data[`grat_${n}`] ?? ""} onChange={e => onChange(`grat_${n}`, e.target.value)}
                                placeholder={`감사한 일 ${n}`} rows={2}
                                className="flex-1 resize-none bg-white/60 text-xs p-2 rounded border border-stone-200 focus:outline-none focus:border-slate-700 leading-relaxed" />
                        </div>
                    ))}
                </div>
            </div>
            <LabeledBox label="Highlight · 오늘의 하이라이트" valKey="grat_highlight" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            <LabeledBox label="Tomorrow · 내일 기대하는 것" valKey="grat_tomorrow" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
        </div>
    );
}

function ReadingGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex gap-3 items-start">
                    <div className="shrink-0 w-12 h-16 bg-white border-2 border-stone-400 rounded flex items-center justify-center text-xl"></div>
                    <div className="flex-1 space-y-1.5">
                        <input type="text" value={data["read_title"] ?? ""} onChange={e => onChange("read_title", e.target.value)}
                            placeholder="책·아티클 제목"
                            className="w-full px-2 py-1 text-sm font-bold bg-white/70 border border-stone-200 rounded focus:outline-none focus:border-slate-700" />
                        <div className="grid grid-cols-2 gap-1.5">
                            <input type="text" value={data["read_author"] ?? ""} onChange={e => onChange("read_author", e.target.value)}
                                placeholder="저자"
                                className="px-2 py-1 text-xs bg-white/70 border border-stone-200 rounded focus:outline-none" />
                            <input type="text" value={data["read_date"] ?? ""} onChange={e => onChange("read_date", e.target.value)}
                                placeholder="읽은 날짜"
                                className="px-2 py-1 text-xs bg-white/70 border border-stone-200 rounded focus:outline-none" />
                        </div>
                    </div>
                </div>
            </div>
            <LabeledBox label="Summary · 한 줄 요약" valKey="read_summary" data={data} onChange={onChange} />
            <LabeledBox label="Highlights · 밑줄 친 문장들" valKey="read_highlights" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Takeaways · 핵심 교훈 (3가지)" valKey="read_takeaways" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="1.&#10;2.&#10;3." />
            <LabeledBox label="Action · 실천에 옮길 것" valKey="read_action" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
        </div>
    );
}

function StandupGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "su_yesterday", label: "Yesterday · 어제 한 일", emoji: "", color: "bg-neutral-50 border-neutral-200", text: "text-neutral-600" },
        { key: "su_today", label: "Today · 오늘 할 일", emoji: "", color: "bg-slate-50 border-slate-300", text: "text-slate-900" },
        { key: "su_blockers", label: "Blockers · 장애물·도움 필요", emoji: "", color: "bg-slate-50 border-slate-200", text: "text-stone-700" },
    ];
    return (
        <div className="my-2 grid md:grid-cols-3 gap-2">
            {cells.map(c => (
                <div key={c.key} className={`rounded-lg p-3 border ${c.color} min-h-36`}>
                    <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder="- 항목…" />
                </div>
            ))}
        </div>
    );
}

function WeeklyJournalGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Week · 주차" valKey="wj_week" data={data} onChange={onChange} placeholder="예: 2026년 W17" />
            <LabeledBox label="Events · 있었던 일" valKey="wj_events" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Feelings · 느낀 감정" valKey="wj_feelings" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
            <LabeledBox label="Insights · 배움·인사이트" valKey="wj_insights" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Next Week Intention · 다음 주 의도" valKey="wj_next" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
        </div>
    );
}

function ZettelkastenGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                    <div className="shrink-0 w-16">
                        <p className="text-[9px] text-neutral-500 font-semibold">ZETTEL ID</p>
                        <input type="text" value={data["zet_id"] ?? ""} onChange={e => onChange("zet_id", e.target.value)}
                            placeholder="202604251"
                            className="w-full mt-0.5 px-1 py-1 text-xs font-mono bg-white border border-neutral-200 rounded focus:outline-none" />
                    </div>
                    <div>
                        <p className="text-[9px] text-neutral-500 font-semibold">TITLE</p>
                        <input type="text" value={data["zet_title"] ?? ""} onChange={e => onChange("zet_title", e.target.value)}
                            placeholder="제목 (원자적 아이디어 하나)"
                            className="w-full mt-0.5 px-2 py-1 text-sm font-semibold bg-white border border-neutral-200 rounded focus:outline-none" />
                    </div>
                </div>
            </div>
            <LabeledBox label="Content · 내용" valKey="zet_content" data={data} onChange={onChange} placeholder="자신의 언어로, 문장 단위로…" />
            <div className="grid grid-cols-2 gap-2">
                <LabeledBox label="Source · 출처" valKey="zet_source" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
                <LabeledBox label="Tags · 태그" valKey="zet_tags" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" placeholder="#tag1 #tag2" />
            </div>
            <LabeledBox label="Links · 연결된 Zettel" valKey="zet_links" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="[[202604111]] ..." />
        </div>
    );
}

function MindmapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-100 border-2 border-slate-400 text-center">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Central Topic · 중심 주제</p>
                <input type="text" value={data["mind_central"] ?? ""} onChange={e => onChange("mind_central", e.target.value)}
                    placeholder="마인드맵의 가운데 (한 단어·한 구절)"
                    className="w-full mt-2 px-3 py-2 text-sm font-bold text-center bg-white/70 border border-slate-300 rounded focus:outline-none" />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 py-2 border-b border-neutral-100">Outline · 계층 구조 (Tab으로 들여쓰기)</p>
                <textarea value={data["mind_outline"] ?? ""} onChange={e => onChange("mind_outline", e.target.value)}
                    placeholder={"- 1차 가지\n  - 2차 가지\n    - 3차 가지\n- 또 다른 1차 가지"}
                    rows={14}
                    className="w-full resize-none px-3 py-2 text-xs font-mono placeholder:text-neutral-300 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

type TbBlock = { start: string; end: string; task: string; category: string };
function TimeBlockGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: TbBlock[] = [
        { start: "09:00", end: "10:00", task: "", category: "집중" },
        { start: "10:00", end: "11:00", task: "", category: "집중" },
        { start: "13:00", end: "14:00", task: "", category: "협업" },
        { start: "15:00", end: "16:00", task: "", category: "행정" },
    ];
    const blocks: TbBlock[] = (() => {
        try { const p = data["tb_blocks"] ? JSON.parse(data["tb_blocks"]) : null; return Array.isArray(p) && p.length > 0 ? p : DEFAULT; }
        catch { return DEFAULT; }
    })();
    const save = (next: TbBlock[]) => onChange("tb_blocks", JSON.stringify(next));
    const update = (i: number, patch: Partial<TbBlock>) => { const n = [...blocks]; n[i] = { ...n[i], ...patch }; save(n); };
    const add = () => save([...blocks, { start: "", end: "", task: "", category: "" }]);
    const remove = (i: number) => save(blocks.filter((_, x) => x !== i));
    const CATEGORIES = ["집중", "협업", "행정", "학습", "휴식", "식사"];
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Date · 날짜" valKey="tb_date" data={data} onChange={onChange} placeholder="YYYY-MM-DD" />
            <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <div className="bg-neutral-50 px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex gap-2">
                    <span className="w-32">시작 ~ 종료</span>
                    <span className="w-24">카테고리</span>
                    <span className="flex-1">할 일</span>
                    <span className="w-6"></span>
                </div>
                {blocks.map((b, i) => (
                    <div key={i} className="flex gap-2 px-3 py-1.5 border-t border-neutral-100 items-center">
                        <div className="w-32 flex items-center gap-1">
                            <input type="text" value={b.start} onChange={e => update(i, { start: e.target.value })}
                                placeholder="09:00" className="w-14 px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                            <span className="text-neutral-300 text-xs">~</span>
                            <input type="text" value={b.end} onChange={e => update(i, { end: e.target.value })}
                                placeholder="10:00" className="w-14 px-1 py-1 text-xs text-center bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        </div>
                        <select value={b.category} onChange={e => update(i, { category: e.target.value })}
                            className="w-24 px-1 py-1 text-[11px] bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300">
                            <option value="">–</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="text" value={b.task} onChange={e => update(i, { task: e.target.value })}
                            placeholder="할 일" className="flex-1 px-2 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        {blocks.length > 1 && (
                            <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-[#0F766E] hover:border-[#0F766E]">+ 블록 추가</button>
        </div>
    );
}

function DailyDesignGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Date · 날짜" valKey="dd_date" data={data} onChange={onChange} />
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-400">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Intention · 오늘의 의도</p>
                <textarea value={data["dd_intention"] ?? ""} onChange={e => onChange("dd_intention", e.target.value)}
                    placeholder="오늘은 어떤 사람으로 살고 싶은가?"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/60 text-xs p-2 rounded border border-stone-200 focus:outline-none leading-relaxed" />
            </div>
            <LabeledBox label="Top 3 · 핵심 우선순위" valKey="dd_priorities" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="1.&#10;2.&#10;3." />
            <LabeledBox label="Schedule · 일정" valKey="dd_schedule" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Reflection · 저녁 회고" valKey="dd_reflection" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" placeholder="오늘 한 일, 배운 것, 느낀 것…" />
        </div>
    );
}

type DwSession = { start: string; duration: number; task: string; result: string; distractions: string };
function DeepWorkGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: DwSession[] = [{ start: "09:00", duration: 90, task: "", result: "", distractions: "" }];
    const ss: DwSession[] = (() => {
        try { const p = data["dw_sessions"] ? JSON.parse(data["dw_sessions"]) : null; return Array.isArray(p) && p.length > 0 ? p : DEFAULT; }
        catch { return DEFAULT; }
    })();
    const save = (next: DwSession[]) => onChange("dw_sessions", JSON.stringify(next));
    const update = (i: number, patch: Partial<DwSession>) => { const n = [...ss]; n[i] = { ...n[i], ...patch }; save(n); };
    const add = () => save([...ss, { start: "", duration: 60, task: "", result: "", distractions: "" }]);
    const remove = (i: number) => save(ss.filter((_, x) => x !== i));
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Date · 날짜" valKey="dw_date" data={data} onChange={onChange} />
            {ss.map((s, i) => (
                <div key={i} className="rounded-lg p-3 bg-slate-50 border border-slate-300 space-y-2 relative">
                    {ss.length > 1 && (
                        <button onClick={() => remove(i)} className="absolute top-2 right-2 w-5 h-5 rounded text-slate-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                    )}
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Session {i + 1}</p>
                    <div className="flex gap-2 items-center">
                        <div>
                            <span className="text-[9px] text-neutral-500">시작</span>
                            <input type="text" value={s.start} onChange={e => update(i, { start: e.target.value })}
                                placeholder="09:00" className="w-16 ml-1 px-2 py-1 text-xs text-center bg-white border border-slate-200 rounded focus:outline-none" />
                        </div>
                        <div>
                            <span className="text-[9px] text-neutral-500">분</span>
                            <input type="number" value={s.duration} onChange={e => update(i, { duration: +e.target.value })}
                                className="w-14 ml-1 px-2 py-1 text-xs text-center bg-white border border-slate-200 rounded focus:outline-none" />
                        </div>
                    </div>
                    <input type="text" value={s.task} onChange={e => update(i, { task: e.target.value })}
                        placeholder="과업 — 무엇에 집중했나"
                        className="w-full px-2 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded focus:outline-none" />
                    <textarea value={s.result} onChange={e => update(i, { result: e.target.value })}
                        placeholder="결과 — 무엇을 완성했나" rows={2}
                        className="w-full resize-none px-2 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none leading-relaxed" />
                    <textarea value={s.distractions} onChange={e => update(i, { distractions: e.target.value })}
                        placeholder="방해 요소 — 무엇이 흐름을 끊었나" rows={1}
                        className="w-full resize-none px-2 py-1.5 text-[11px] bg-white/60 border border-slate-200 rounded focus:outline-none text-stone-700 leading-relaxed" />
                </div>
            ))}
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-400">+ 세션 추가</button>
        </div>
    );
}

type PomSession = { task: string; completed: number; notes: string };
function PomodoroGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: PomSession[] = [{ task: "", completed: 0, notes: "" }];
    const ss: PomSession[] = (() => {
        try { const p = data["pom_sessions"] ? JSON.parse(data["pom_sessions"]) : null; return Array.isArray(p) && p.length > 0 ? p : DEFAULT; }
        catch { return DEFAULT; }
    })();
    const save = (next: PomSession[]) => onChange("pom_sessions", JSON.stringify(next));
    const update = (i: number, patch: Partial<PomSession>) => { const n = [...ss]; n[i] = { ...n[i], ...patch }; save(n); };
    const add = () => save([...ss, { task: "", completed: 0, notes: "" }]);
    const remove = (i: number) => save(ss.filter((_, x) => x !== i));
    const totalTomatoes = ss.reduce((s, x) => s + x.completed, 0);
    return (
        <div className="my-2 space-y-2">
            <div className="flex items-center justify-between">
                <LabeledInput label="Date · 날짜" valKey="pom_date" data={data} onChange={onChange} />
                <div className="ml-3 shrink-0 text-right">
                    <p className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">총 </p>
                    <p className="text-xl font-bold text-slate-700">{totalTomatoes}</p>
                </div>
            </div>
            <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <div className="bg-neutral-50 px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex gap-2">
                    <span className="flex-1">과업</span>
                    <span className="w-40">완료</span>
                    <span className="w-40">메모</span>
                    <span className="w-6"></span>
                </div>
                {ss.map((s, i) => (
                    <div key={i} className="flex gap-2 px-3 py-1.5 border-t border-neutral-100 items-center">
                        <input type="text" value={s.task} onChange={e => update(i, { task: e.target.value })}
                            placeholder="과업" className="flex-1 px-2 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        <div className="w-40 flex items-center gap-1">
                            <button onClick={() => update(i, { completed: Math.max(0, s.completed - 1) })} className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-xs">−</button>
                            <span className="flex-1 text-center text-sm">
                                {s.completed > 0 ? "".repeat(Math.min(s.completed, 8)) + (s.completed > 8 ? `+${s.completed - 8}` : "") : <span className="text-neutral-300">–</span>}
                            </span>
                            <button onClick={() => update(i, { completed: s.completed + 1 })} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-xs">+</button>
                        </div>
                        <input type="text" value={s.notes} onChange={e => update(i, { notes: e.target.value })}
                            placeholder="메모" className="w-40 px-2 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        {ss.length > 1 && (
                            <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400">+ 과업 추가</button>
        </div>
    );
}

type HabitEntry = { name: string; days: boolean[] };
function HabitTrackerGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: HabitEntry[] = [
        { name: "", days: [false, false, false, false, false, false, false] },
        { name: "", days: [false, false, false, false, false, false, false] },
    ];
    const habits: HabitEntry[] = (() => {
        try {
            const p = data["ht_habits"] ? JSON.parse(data["ht_habits"]) : null;
            return Array.isArray(p) && p.length > 0 ? p.map(h => ({ ...h, days: (h.days || []).concat(Array(7).fill(false)).slice(0, 7) })) : DEFAULT;
        } catch { return DEFAULT; }
    })();
    const save = (next: HabitEntry[]) => onChange("ht_habits", JSON.stringify(next));
    const update = (i: number, patch: Partial<HabitEntry>) => { const n = [...habits]; n[i] = { ...n[i], ...patch }; save(n); };
    const toggle = (i: number, d: number) => { const days = [...habits[i].days]; days[d] = !days[d]; update(i, { days }); };
    const add = () => save([...habits, { name: "", days: [false, false, false, false, false, false, false] }]);
    const remove = (i: number) => save(habits.filter((_, x) => x !== i));
    const DOW = ["월", "화", "수", "목", "금", "토", "일"];
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Week · 주차" valKey="ht_week" data={data} onChange={onChange} placeholder="예: 2026년 W17" />
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-[10px] text-neutral-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-2 py-2 text-left">습관</th>
                            {DOW.map(d => <th key={d} className="px-1 py-2 w-10 text-center">{d}</th>)}
                            <th className="px-2 py-2 w-12 text-center">달성</th>
                            <th className="w-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {habits.map((h, i) => {
                            const done = h.days.filter(Boolean).length;
                            return (
                                <tr key={i} className="border-t border-neutral-100">
                                    <td className="px-2 py-1">
                                        <input type="text" value={h.name} onChange={e => update(i, { name: e.target.value })}
                                            placeholder="예: 아침 명상 10분"
                                            className="w-full px-1 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                                    </td>
                                    {h.days.map((d, di) => (
                                        <td key={di} className="px-1 py-1 text-center">
                                            <button onClick={() => toggle(i, di)} className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-all ${d ? "bg-slate-900 text-white scale-105" : "bg-neutral-100 text-neutral-300 hover:bg-neutral-200"}`}>
                                                {d ? "" : ""}
                                            </button>
                                        </td>
                                    ))}
                                    <td className={`px-2 py-1 text-center font-mono font-bold ${done === 7 ? "text-slate-900" : done >= 4 ? "text-stone-600" : "text-neutral-400"}`}>
                                        {done}/7
                                    </td>
                                    <td className="px-1 text-center">
                                        {habits.length > 1 && (
                                            <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-stone-100 text-sm leading-none">×</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400">+ 습관 추가</button>
        </div>
    );
}

type EnergyPoint = { hour: number; level: number };
function EnergyMapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 ~ 22
    const levels: EnergyPoint[] = (() => {
        try {
            const p = data["em_levels"] ? JSON.parse(data["em_levels"]) : null;
            if (!Array.isArray(p)) return HOURS.map(h => ({ hour: h, level: 0 }));
            return HOURS.map(h => p.find((x: EnergyPoint) => x.hour === h) ?? { hour: h, level: 0 });
        } catch { return HOURS.map(h => ({ hour: h, level: 0 })); }
    })();
    const save = (next: EnergyPoint[]) => onChange("em_levels", JSON.stringify(next));
    const setLevel = (hour: number, level: number) => {
        const next = levels.map(l => l.hour === hour ? { ...l, level } : l);
        save(next);
    };
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Date · 날짜" valKey="em_date" data={data} onChange={onChange} />
            <div className="rounded-lg p-3 bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-2">시간대별 에너지 (0~5, 클릭해서 조정)</p>
                <div className="flex gap-0.5 items-end h-32">
                    {levels.map(l => (
                        <div key={l.hour} className="flex-1 flex flex-col items-center gap-1">
                            <div className="flex-1 w-full flex flex-col justify-end">
                                {[5, 4, 3, 2, 1].map(n => (
                                    <button key={n} onClick={() => setLevel(l.hour, n === l.level ? 0 : n)}
                                        className={`h-4 border-t border-white transition-all ${
                                            l.level >= n
                                                ? n >= 4 ? "bg-slate-900" : n >= 2 ? "bg-slate-500" : "bg-slate-300"
                                                : "bg-neutral-100 hover:bg-neutral-200"
                                        }`} />
                                ))}
                            </div>
                            <span className="text-[8px] text-neutral-400 tabular-nums">{String(l.hour).padStart(2,"0")}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <LabeledBox label="Peaks · 피크 시간" valKey="em_peaks" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
                <LabeledBox label="Lows · 저점 시간" valKey="em_lows" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
            </div>
            <LabeledBox label="Patterns · 패턴 메모" valKey="em_notes" data={data} onChange={onChange} />
        </div>
    );
}

function WeeklyReviewGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Week · 주차" valKey="wr_week" data={data} onChange={onChange} />
            <LabeledBox label="Wins · 이번 주 승리" valKey="wr_wins" data={data} onChange={onChange} color="bg-slate-50 border-slate-400" textColor="text-slate-900" />
            <LabeledBox label="Lessons · 배운 것" valKey="wr_lessons" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Blockers · 장애물" valKey="wr_blockers" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
            <LabeledBox label="Next Week · 다음 주" valKey="wr_next" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
        </div>
    );
}

function WeeklyWinGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Week · 주차" valKey="ww_week" data={data} onChange={onChange} />
            <div className="rounded-xl p-4 bg-stone-50 border-2 border-stone-400">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider text-center">이번 주 가장 큰 WIN</p>
                <textarea value={data["ww_biggest"] ?? ""} onChange={e => onChange("ww_biggest", e.target.value)}
                    placeholder="자랑스러운 단 하나의 성취"
                    rows={3}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-medium p-3 rounded border border-stone-300 focus:outline-none text-center leading-relaxed" />
            </div>
            <LabeledBox label="Other Wins · 다른 성취들" valKey="ww_other" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            <LabeledBox label="Celebrate · 어떻게 축하할까" valKey="ww_celebrate" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" />
        </div>
    );
}

function MonthlyThemeGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <LabeledInput label="Month · 월" valKey="mt_month" data={data} onChange={onChange} placeholder="예: 2026년 5월" />
            <div className="rounded-xl p-4 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider text-center">이번 달 테마</p>
                <textarea value={data["mt_theme"] ?? ""} onChange={e => onChange("mt_theme", e.target.value)}
                    placeholder="한 문장으로 — 예: '깊이 있는 집중의 달'"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-medium p-3 rounded border border-slate-300 focus:outline-none text-center leading-relaxed" />
            </div>
            <LabeledBox label="Focus · 핵심 포커스" valKey="mt_focus" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Wins · 기대하는 WIN" valKey="mt_wins" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            <LabeledBox label="Habits · 만들 습관" valKey="mt_habits" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
            <LabeledBox label="Reflection · 월말 회고" valKey="mt_reflection" data={data} onChange={onChange} placeholder="월말에 돌아와 기록" />
        </div>
    );
}

function QuarterlyGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="Quarter · 분기" valKey="q_quarter" data={data} onChange={onChange} placeholder="예: 2026 Q2" />
            </div>
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">분기 목표</p>
                <textarea value={data["q_goal"] ?? ""} onChange={e => onChange("q_goal", e.target.value)}
                    placeholder="3개월 뒤 달성하고 싶은 한 가지"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-medium p-2 rounded border border-slate-300 focus:outline-none leading-relaxed" />
            </div>
            <div className="grid md:grid-cols-3 gap-2">
                {[
                    { key: "q_m1", label: "Month 1", color: "bg-stone-50 border-stone-200", text: "text-stone-800" },
                    { key: "q_m2", label: "Month 2", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
                    { key: "q_m3", label: "Month 3", color: "bg-slate-50 border-slate-200", text: "text-slate-800" },
                ].map(m => (
                    <div key={m.key} className={`rounded-lg p-3 border ${m.color} min-h-28`}>
                        <p className={`text-xs font-bold ${m.text}`}>{m.label}</p>
                        <CellTextarea cellKey={m.key} value={data[m.key] ?? ""} onChange={onChange} placeholder="이 달의 포커스·행동…" />
                    </div>
                ))}
            </div>
            <LabeledBox label="Quarter Review · 분기 회고" valKey="q_review" data={data} onChange={onChange} placeholder="분기 끝에 돌아와 기록" />
        </div>
    );
}

type YrMonth = { focus: string; goal: string };
function YearPlanGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const MONTHS_LBL = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const EMPTY: YrMonth = { focus: "", goal: "" };
    const months: YrMonth[] = (() => {
        try {
            const p = data["yr_months"] ? JSON.parse(data["yr_months"]) : null;
            if (!Array.isArray(p)) return Array(12).fill(null).map(() => ({ ...EMPTY }));
            return Array(12).fill(null).map((_, i) => p[i] ?? { ...EMPTY });
        } catch { return Array(12).fill(null).map(() => ({ ...EMPTY })); }
    })();
    const save = (next: YrMonth[]) => onChange("yr_months", JSON.stringify(next));
    const update = (i: number, patch: Partial<YrMonth>) => { const n = [...months]; n[i] = { ...n[i], ...patch }; save(n); };

    return (
        <div className="my-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="Year · 연도" valKey="yr_year" data={data} onChange={onChange} placeholder="2026" />
                <LabeledInput label="Theme · 올해 테마" valKey="yr_theme" data={data} onChange={onChange} placeholder="한 문장으로" />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                {MONTHS_LBL.map((lbl, i) => {
                    const quarter = Math.floor(i / 3);
                    const qColors = ["bg-slate-50 border-slate-300", "bg-stone-50 border-stone-200", "bg-slate-50 border-slate-200", "bg-slate-50 border-slate-200"];
                    return (
                        <div key={i} className={`rounded-lg p-2 border ${qColors[quarter]} min-h-24`}>
                            <p className="text-[10px] font-bold text-neutral-600">{lbl}</p>
                            <input type="text" value={months[i].focus} onChange={e => update(i, { focus: e.target.value })}
                                placeholder="포커스"
                                className="w-full mt-1 px-1 py-1 text-[10px] font-medium bg-white/60 border border-neutral-200 rounded focus:outline-none" />
                            <textarea value={months[i].goal} onChange={e => update(i, { goal: e.target.value })}
                                placeholder="목표" rows={2}
                                className="w-full mt-1 resize-none px-1 py-1 text-[10px] bg-transparent border border-transparent rounded focus:outline-none focus:bg-white/60 focus:border-neutral-200 leading-tight" />
                        </div>
                    );
                })}
            </div>
            <LabeledBox label="Milestones · 핵심 마일스톤" valKey="yr_milestones" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-800" placeholder="연중 꼭 달성할 것들" />
        </div>
    );
}

function FiveYearGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "fy_now", label: "Now · 현재", badge: "0Y", color: "bg-neutral-50 border-neutral-200", text: "text-neutral-600", strong: false },
        { key: "fy_y1",  label: "1년 후",    badge: "+1Y", color: "bg-slate-50 border-slate-300", text: "text-slate-900", strong: false },
        { key: "fy_y2",  label: "2년 후",    badge: "+2Y", color: "bg-slate-50 border-slate-200", text: "text-slate-800", strong: false },
        { key: "fy_y3",  label: "3년 후",    badge: "+3Y", color: "bg-slate-50 border-slate-200", text: "text-slate-800", strong: false },
        { key: "fy_y5",  label: "5년 후 · 비전", badge: "+5Y", color: "bg-stone-50 border-stone-400", text: "text-stone-800", strong: true },
    ];
    return (
        <div className="my-2 space-y-1.5">
            {steps.map((s, i) => (
                <div key={s.key} className="flex items-start gap-2">
                    <div className="shrink-0 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold tracking-wider ${s.strong ? "border-slate-700 text-slate-900" : "border-slate-300 text-slate-500"}`}>
                            {s.badge}
                        </div>
                        {i < 4 && <div className="w-px flex-1 bg-neutral-300 my-1" style={{ minHeight: 24 }} />}
                    </div>
                    <div className={`flex-1 rounded-lg p-3 border ${s.color}`}>
                        <p className={`text-xs font-bold ${s.text}`}>{s.label}</p>
                        <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange} placeholder={i === 4 ? "어떤 모습·삶으로 살고 있을까" : "그때 나는 무엇을 하고 있을까"} />
                    </div>
                </div>
            ))}
            <div className="rounded-lg p-3 bg-slate-50 border-2 border-slate-700 mt-3">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">지켜야 할 원칙</p>
                <CellTextarea cellKey="fy_principles" value={data["fy_principles"] ?? ""} onChange={onChange} placeholder="5년의 여정에서 타협하지 않을 가치" />
            </div>
        </div>
    );
}

function MovingAverageGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">90-Day Experiment</p>
                <input type="text" value={data["ma_experiment"] ?? ""} onChange={e => onChange("ma_experiment", e.target.value)}
                    placeholder="실험 제목 — 예: '아침 운동 90일 실험'"
                    className="w-full mt-2 px-2 py-1.5 text-sm font-bold bg-white/70 border border-slate-300 rounded focus:outline-none" />
            </div>
            <LabeledBox label="Hypothesis · 가설" valKey="ma_hypothesis" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" placeholder="If ~ then ~" />
            <div className="grid md:grid-cols-3 gap-2">
                <LabeledBox label="Baseline · 시작점" valKey="ma_baseline" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-700" />
                <LabeledBox label="Metric · 측정 지표" valKey="ma_metric" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-slate-800" />
                <LabeledBox label="Target · 90일 목표" valKey="ma_target" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" />
            </div>
            <LabeledBox label="Check-ins · 30/60/90일" valKey="ma_checkins" data={data} onChange={onChange} placeholder="Day 30:&#10;Day 60:&#10;Day 90:" />
            <LabeledBox label="Result · 결과" valKey="ma_result" data={data} onChange={onChange} color="bg-slate-50 border-slate-200" textColor="text-stone-700" placeholder="실험 종료 후 기록" />
        </div>
    );
}

function ReversePlanGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-400">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider text-center">Goal · 최종 목표</p>
                <textarea value={data["rp_goal"] ?? ""} onChange={e => onChange("rp_goal", e.target.value)}
                    placeholder="무엇을 달성했을 때 '성공'인가"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-bold p-2 rounded border border-stone-300 focus:outline-none text-center leading-relaxed" />
                <input type="text" value={data["rp_deadline"] ?? ""} onChange={e => onChange("rp_deadline", e.target.value)}
                    placeholder="마감일 (YYYY-MM-DD)"
                    className="w-full mt-2 px-2 py-1 text-xs text-center bg-white/60 border border-stone-200 rounded focus:outline-none" />
            </div>
            <div className="relative pl-8">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-400" />
                <div className="space-y-2">
                    <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 relative">
                        <div className="absolute -left-[18px] top-4 w-3 h-3 rounded-full bg-slate-700 border-2 border-white" />
                        <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Milestones · 거꾸로 마일스톤</p>
                        <CellTextarea cellKey="rp_milestones" value={data["rp_milestones"] ?? ""} onChange={onChange} placeholder="마감 1주 전에는…&#10;1개월 전에는…&#10;3개월 전에는…&#10;오늘부터는…" />
                    </div>
                    <div className="rounded-lg p-3 bg-slate-50 border-2 border-slate-700 relative">
                        <div className="absolute -left-[18px] top-4 w-3 h-3 rounded-full bg-slate-900 border-2 border-white" />
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Today · 오늘 시작할 일</p>
                        <CellTextarea cellKey="rp_now" value={data["rp_now"] ?? ""} onChange={onChange} placeholder="가장 먼저 취할 작은 행동" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SprintGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <div className="grid grid-cols-3 gap-2">
                    <LabeledInput label="Sprint #" valKey="sp_number" data={data} onChange={onChange} placeholder="25" />
                    <LabeledInput label="Start · 시작일" valKey="sp_start" data={data} onChange={onChange} />
                    <LabeledInput label="End · 종료일" valKey="sp_end" data={data} onChange={onChange} />
                </div>
            </div>
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Sprint Goal</p>
                <textarea value={data["sp_goal"] ?? ""} onChange={e => onChange("sp_goal", e.target.value)}
                    placeholder="이번 스프린트에서 가장 중요한 한 가지"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-bold p-2 rounded border border-slate-300 focus:outline-none leading-relaxed" />
            </div>
            <LabeledBox label="Commitments · 끝낼 것" valKey="sp_commitments" data={data} onChange={onChange} color="bg-slate-50 border-slate-300" textColor="text-slate-900" placeholder="- [ ] 항목 1&#10;- [ ] 항목 2" />
            <LabeledBox label="Stretch · 여유 있으면" valKey="sp_stretch" data={data} onChange={onChange} color="bg-stone-50 border-stone-200" textColor="text-stone-800" />
            <LabeledBox label="Retro · 스프린트 회고" valKey="sp_retro" data={data} onChange={onChange} placeholder="스프린트 끝에 돌아와 기록 (무엇이 잘 됐나 / 안 됐나 / 바꿀 것)" />
        </div>
    );
}

function getFrameworkBilingualName(tpl: Template): string | null {
    const k = tpl.key.toLowerCase();
    const l = tpl.label.toLowerCase();
    if (k.includes("empathy") || l.includes("공감")) return "Empathy Map";
    if (k.includes("lean") || l.includes("린 캔버스")) return "Lean Canvas";
    if (k.includes("mandalart") || l.includes("만다라")) return "Mandalart";
    if (k.includes("eisenhower") || l.includes("아이젠하워")) return "Eisenhower Matrix";
    if (k.includes("pest")) return "PEST Analysis";
    if (k.includes("moscow")) return "MoSCoW Prioritization";
    if (k === "quadrant") return "Quadrant Matrix";
    if (k.includes("business_canvas") || l.includes("비즈니스 모델 캔버스")) return "Business Model Canvas";
    if (k === "vpc" || l.includes("value proposition")) return "Value Proposition Canvas";
    if (k === "okr") return "Objectives & Key Results";
    if (k.includes("persona") || l.includes("페르소나")) return "User Persona";
    if (k.includes("jobs_to_be_done") || k.includes("jtbd") || l.includes("jobs-to-be-done")) return "Jobs-to-be-Done";
    if (k === "rice") return "RICE Prioritization";
    if (k === "5w1h") return "5W1H";
    if (k === "5why") return "5 Whys";
    if (k.includes("ikigai")) return "Ikigai";
    if (k.includes("porter")) return "Porter's Five Forces";
    if (k.includes("scamper")) return "SCAMPER";
    if (k === "kano") return "Kano Model";
    if (k.includes("pareto") || l.includes("80/20")) return "Pareto Principle (80/20)";
    if (k.includes("fishbone") || l.includes("피쉬본")) return "Fishbone (Ishikawa)";
    if (k.includes("journey") || l.includes("여정 지도")) return "Customer Journey Map";
    if (k.includes("retrospective") || l.includes("kpt")) return "KPT Retrospective";
    if (k === "ooda") return "OODA Loop";
    if (k.includes("cornell") || l.includes("코넬")) return "Cornell Notes";
    if (k.includes("decision_matrix") || l.includes("의사결정 매트릭스")) return "Decision Matrix";
    if (k.includes("feynman") || l.includes("파인만")) return "Feynman Technique";
    if (k === "1on1") return "1:1 Meeting Log";
    if (k === "meeting") return "Meeting Minutes";
    if (k === "interview") return "User Interview";
    if (k === "after_action") return "After Action Review";
    if (k === "brainstorm") return "Brainstorming";
    if (k === "decision_log") return "Decision Log";
    if (k === "emotion_log") return "Emotion Log";
    if (k === "gratitude") return "Gratitude Journal";
    if (k === "reading") return "Reading Notes";
    if (k === "standup") return "Daily Standup";
    if (k === "weekly_journal") return "Weekly Journal";
    if (k === "zettelkasten") return "Zettelkasten";
    if (k === "mindmap_outline") return "Mind Map Outline";
    if (k === "time_block") return "Time Blocking";
    if (k === "daily_design") return "Daily Design";
    if (k === "deep_work") return "Deep Work Sessions";
    if (k === "pomodoro") return "Pomodoro Tracker";
    if (k === "habit_tracker") return "Habit Tracker";
    if (k === "energy_map") return "Energy Map";
    if (k === "weekly_review") return "Weekly Review";
    if (k === "weekly_win") return "Weekly Wins";
    if (k === "monthly_theme") return "Monthly Theme";
    if (k === "quarterly") return "Quarterly Plan";
    if (k === "year_plan") return "Year Plan (12-Month Map)";
    if (k === "five_year") return "5-Year Vision";
    if (k === "moving_average") return "90-Day Experiment";
    if (k === "reverse_plan") return "Reverse Planning";
    if (k === "sprint") return "Sprint (2-Week)";
    if (k.includes("bcg") || l.includes("bcg")) return "BCG Matrix";
    if (k.includes("ansoff") || l.includes("ansoff")) return "Ansoff Matrix";
    if (k.includes("swot") || l.includes("swot")) return "SWOT Analysis";
    if ((k.includes("4p") || l.includes("4p")) && !k.includes("4ps")) return "4P Marketing Mix";
    if (k.includes("9box") || k.includes("nine_box") || l.includes("9-box") || l.includes("9box")) return "9-Box Grid";
    return null;
}

function renderSpecial(
    tpl: Template,
    data: FrameworkData,
    onChange: (key: string, val: string) => void,
): React.ReactNode | null {
    const k = tpl.key.toLowerCase();
    const l = tpl.label.toLowerCase();
    if (k.includes("bcg") || l.includes("bcg")) return <BcgGrid data={data} onChange={onChange} />;
    if (k.includes("swot") || l.includes("swot")) return <SwotGrid data={data} onChange={onChange} />;
    if ((k.includes("4p") || l.includes("4p")) && !k.includes("4ps")) return <FourPGrid data={data} onChange={onChange} />;
    if (k.includes("ansoff") || l.includes("ansoff")) return <AnsoffGrid data={data} onChange={onChange} />;
    if (k.includes("9box") || k.includes("nine_box") || l.includes("9-box") || l.includes("9box")) return <NineBoxGrid data={data} onChange={onChange} />;
    if (k.includes("empathy") || l.includes("공감")) return <EmpathyMapGrid data={data} onChange={onChange} />;
    if (k.includes("lean") || l.includes("린 캔버스")) return <LeanCanvasGrid data={data} onChange={onChange} />;
    if (k.includes("mandalart") || l.includes("만다라")) return <MandalartGrid data={data} onChange={onChange} />;
    if (k.includes("eisenhower") || l.includes("아이젠하워")) return <EisenhowerGrid data={data} onChange={onChange} />;
    if (k.includes("pest") || l.includes("pest 분석")) return <PestGrid data={data} onChange={onChange} />;
    if (k.includes("moscow") || l.includes("moscow")) return <MoscowGrid data={data} onChange={onChange} />;
    if (k === "quadrant" || l.includes("4분면 매트릭스")) return <QuadrantBlankGrid data={data} onChange={onChange} />;
    if (k.includes("business_canvas") || l.includes("비즈니스 모델 캔버스")) return <BmcGrid data={data} onChange={onChange} />;
    if (k === "vpc" || l.includes("value proposition canvas")) return <VpcGrid data={data} onChange={onChange} />;
    if (k === "okr" || l === "okr") return <OkrGrid data={data} onChange={onChange} />;
    if (k.includes("persona") || l.includes("페르소나")) return <PersonaGrid data={data} onChange={onChange} />;
    if (k.includes("jobs_to_be_done") || k.includes("jtbd") || l.includes("jobs-to-be-done")) return <JtbdGrid data={data} onChange={onChange} />;
    if (k === "rice") return <RiceGrid data={data} onChange={onChange} />;
    if (k === "5w1h") return <FiveW1HGrid data={data} onChange={onChange} />;
    if (k === "5why") return <FiveWhyGrid data={data} onChange={onChange} />;
    if (k.includes("ikigai") || l.includes("이키가이")) return <IkigaiGrid data={data} onChange={onChange} />;
    if (k.includes("porter")) return <Porter5Grid data={data} onChange={onChange} />;
    if (k.includes("scamper")) return <ScamperGrid data={data} onChange={onChange} />;
    if (k === "kano") return <KanoGrid data={data} onChange={onChange} />;
    if (k.includes("pareto") || l.includes("파레토") || l.includes("80/20")) return <ParetoGrid data={data} onChange={onChange} />;
    if (k.includes("fishbone") || l.includes("피쉬본")) return <FishboneGrid data={data} onChange={onChange} />;
    if (k.includes("journey") || l.includes("여정 지도")) return <JourneyMapGrid data={data} onChange={onChange} />;
    if (k.includes("retrospective") || l.includes("kpt")) return <KptGrid data={data} onChange={onChange} />;
    if (k === "ooda") return <OodaGrid data={data} onChange={onChange} />;
    if (k.includes("cornell") || l.includes("코넬")) return <CornellGrid data={data} onChange={onChange} />;
    if (k.includes("decision_matrix") || l.includes("의사결정 매트릭스")) return <DecisionMatrixGrid data={data} onChange={onChange} />;
    if (k.includes("feynman") || l.includes("파인만")) return <FeynmanGrid data={data} onChange={onChange} />;
    if (k === "1on1") return <OneOnOneGrid data={data} onChange={onChange} />;
    if (k === "meeting") return <MeetingGrid data={data} onChange={onChange} />;
    if (k === "interview") return <InterviewGrid data={data} onChange={onChange} />;
    if (k === "after_action") return <AarGrid data={data} onChange={onChange} />;
    if (k === "brainstorm") return <BrainstormGrid data={data} onChange={onChange} />;
    if (k === "decision_log") return <DecisionLogGrid data={data} onChange={onChange} />;
    if (k === "emotion_log") return <EmotionLogGrid data={data} onChange={onChange} />;
    if (k === "gratitude") return <GratitudeGrid data={data} onChange={onChange} />;
    if (k === "reading") return <ReadingGrid data={data} onChange={onChange} />;
    if (k === "standup") return <StandupGrid data={data} onChange={onChange} />;
    if (k === "weekly_journal") return <WeeklyJournalGrid data={data} onChange={onChange} />;
    if (k === "zettelkasten") return <ZettelkastenGrid data={data} onChange={onChange} />;
    if (k === "mindmap_outline") return <MindmapGrid data={data} onChange={onChange} />;
    if (k === "time_block") return <TimeBlockGrid data={data} onChange={onChange} />;
    if (k === "daily_design") return <DailyDesignGrid data={data} onChange={onChange} />;
    if (k === "deep_work") return <DeepWorkGrid data={data} onChange={onChange} />;
    if (k === "pomodoro") return <PomodoroGrid data={data} onChange={onChange} />;
    if (k === "habit_tracker") return <HabitTrackerGrid data={data} onChange={onChange} />;
    if (k === "energy_map") return <EnergyMapGrid data={data} onChange={onChange} />;
    if (k === "weekly_review") return <WeeklyReviewGrid data={data} onChange={onChange} />;
    if (k === "weekly_win") return <WeeklyWinGrid data={data} onChange={onChange} />;
    if (k === "monthly_theme") return <MonthlyThemeGrid data={data} onChange={onChange} />;
    if (k === "quarterly") return <QuarterlyGrid data={data} onChange={onChange} />;
    if (k === "year_plan") return <YearPlanGrid data={data} onChange={onChange} />;
    if (k === "five_year") return <FiveYearGrid data={data} onChange={onChange} />;
    if (k === "moving_average") return <MovingAverageGrid data={data} onChange={onChange} />;
    if (k === "reverse_plan") return <ReversePlanGrid data={data} onChange={onChange} />;
    if (k === "sprint") return <SprintGrid data={data} onChange={onChange} />;
    return null;
}

export function renderFramework(
    key: string,
    label: string,
    data: FrameworkData,
    onChange: (k: string, v: string) => void,
): React.ReactNode | null {
    return renderSpecial(
        { key, label, id: '', category: '', subcategory: null, description: null, body_md: '' },
        data,
        onChange,
    );
}

const isSpecialTemplate = isSpecial;

// ── 마크다운 렌더러 ──────────────────────────────────────────────────
function renderMd(md: string): React.ReactNode {
    const lines = md.split("\n");
    const nodes: React.ReactNode[] = [];
    let i = 0;

    function inlineRender(text: string): React.ReactNode {
        const parts: React.ReactNode[] = [];
        let rest = text;
        let key = 0;
        while (rest.length > 0) {
            const boldMatch = rest.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
            const italicMatch = rest.match(/^(.*?)_(.+?)_(.*)/s);
            if (boldMatch && (!italicMatch || boldMatch[1].length <= italicMatch[1].length)) {
                if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
                parts.push(<strong key={key++} className="font-semibold text-neutral-900">{boldMatch[2]}</strong>);
                rest = boldMatch[3];
            } else if (italicMatch) {
                if (italicMatch[1]) parts.push(<span key={key++}>{italicMatch[1]}</span>);
                parts.push(<em key={key++} className="italic text-neutral-700">{italicMatch[2]}</em>);
                rest = italicMatch[3];
            } else {
                parts.push(<span key={key++}>{rest}</span>);
                rest = "";
            }
        }
        return parts.length === 1 ? parts[0] : <>{parts}</>;
    }

    while (i < lines.length) {
        const line = lines[i];
        if (line.startsWith("### ")) {
            nodes.push(<h3 key={i} className="text-xs font-semibold text-neutral-700 mt-4 mb-1 uppercase tracking-wider">{line.slice(4)}</h3>);
            i++; continue;
        }
        if (line.startsWith("## ")) {
            nodes.push(<h2 key={i} className="text-sm font-semibold text-neutral-800 mt-5 mb-2 border-b border-neutral-100 pb-1">{line.slice(3)}</h2>);
            i++; continue;
        }
        if (line.startsWith("# ")) {
            nodes.push(<h1 key={i} className="font-serif text-base text-neutral-900 mt-5 mb-2">{line.slice(2)}</h1>);
            i++; continue;
        }
        if (line.match(/^[-*]{3,}$/)) {
            nodes.push(<hr key={i} className="border-neutral-200 my-3" />);
            i++; continue;
        }
        if (line.startsWith("|")) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
            const rows = tableLines.filter(l => !l.match(/^\|[-| :]+\|$/));
            nodes.push(
                <div key={i} className="overflow-x-auto my-3">
                    <table className="w-full text-xs border-collapse">
                        <tbody>
                            {rows.map((r, ri) => {
                                const cells = r.split("|").slice(1, -1).map(c => c.trim());
                                return (
                                    <tr key={ri} className={ri === 0 ? "bg-neutral-50" : "border-t border-neutral-100"}>
                                        {cells.map((c, ci) => (
                                            ri === 0
                                                ? <th key={ci} className="text-left px-2 py-1 font-medium text-neutral-600">{c}</th>
                                                : <td key={ci} className="px-2 py-1 text-neutral-700">{inlineRender(c)}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
            continue;
        }
        if (line.match(/^- \[[ x]\] /)) {
            const items: React.ReactNode[] = [];
            while (i < lines.length && lines[i].match(/^- \[[ x]\] /)) {
                const checked = lines[i][3] === "x";
                const text = lines[i].slice(6);
                items.push(
                    <li key={i} className="flex items-start gap-2 py-0.5">
                        <span className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded border-2 flex items-center justify-center text-[9px] font-bold ${checked ? "bg-[#0F766E] border-[#0F766E] text-white" : "border-neutral-300"}`}>
                            {checked && ""}
                        </span>
                        <span className={`text-xs leading-snug ${checked ? "line-through text-neutral-400" : "text-neutral-700"}`}>{inlineRender(text)}</span>
                    </li>
                );
                i++;
            }
            nodes.push(<ul key={`chk-${i}`} className="space-y-0.5 my-2">{items}</ul>);
            continue;
        }
        if (line.match(/^[-*] /) || line.match(/^\d+\. /)) {
            const items: React.ReactNode[] = [];
            const isOrdered = line.match(/^\d+\. /);
            while (i < lines.length && (lines[i].match(/^[-*] /) || lines[i].match(/^\d+\. /))) {
                const text = lines[i].replace(/^[-*] /, "").replace(/^\d+\. /, "");
                items.push(<li key={i} className="text-xs text-neutral-700 leading-snug py-0.5 pl-1">{inlineRender(text)}</li>);
                i++;
            }
            const cls = "my-2 space-y-0.5 " + (isOrdered ? "list-decimal list-inside" : "list-disc list-inside");
            nodes.push(isOrdered ? <ol key={`ol-${i}`} className={cls}>{items}</ol> : <ul key={`ul-${i}`} className={cls}>{items}</ul>);
            continue;
        }
        if (line.startsWith("    ") || line.startsWith("\t")) {
            nodes.push(
                <div key={i} className="ml-4 pl-3 border-l-2 border-neutral-200 py-0.5">
                    <span className="text-xs text-neutral-400">{inlineRender(line.trim())}</span>
                </div>
            );
            i++; continue;
        }
        if (line.trim() === "") {
            nodes.push(<div key={i} className="h-2" />);
            i++; continue;
        }
        nodes.push(<p key={i} className="text-xs text-neutral-700 leading-relaxed">{inlineRender(line)}</p>);
        i++;
    }
    return <>{nodes}</>;
}

// ── localStorage 키 ──────────────────────────────────────────────────
const FAV_KEY = "planners_tpl_favorites";
const dataKey = tplDataKey;

// ── 메인 컴포넌트 ────────────────────────────────────────────────────
const VALID_CATS = ["all", "framework", "schedule", "note", "favorites"] as const;
type CatType = typeof VALID_CATS[number];

export function TemplatesView() {
    const searchParams = useSearchParams();
    const initialCat = (() => {
        const c = searchParams.get("category");
        return (VALID_CATS as readonly string[]).includes(c ?? "") ? (c as CatType) : "all";
    })();

    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [cat, setCat] = useState<CatType>(initialCat);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Template | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState(false);
    const [tplData, setTplData] = useState<FrameworkData>({});

    useEffect(() => {
        try {
            const raw = localStorage.getItem(FAV_KEY);
            if (raw) setFavorites(new Set(JSON.parse(raw)));
        } catch { /* noop */ }
    }, []);

    // 템플릿 선택 시 데이터 초기화 (Templates 페이지는 저장고 — 데이터 저장 없음)
    useEffect(() => {
        setTplData({});
    }, [selected?.id]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/templates`);
            if (res.ok) {
                const d = await res.json();
                setTemplates(d.templates || []);
            }
            setLoading(false);
        })();
    }, []);

    function toggleFavorite(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            try { localStorage.setItem(FAV_KEY, JSON.stringify([...next])); } catch { /* noop */ }
            return next;
        });
    }

    const handleCellChange = useCallback((key: string, val: string) => {
        if (!selected) return;
        setTplData(prev => ({ ...prev, [key]: val }));
    }, [selected]);

    async function copyToClipboard() {
        if (!selected) return;
        const text = isSpecialTemplate(selected)
            ? exportFwText(selected, tplData)
            : selected.body_md;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* noop */ }
    }

    const filtered = useMemo(() => {
        let list = templates;
        if (cat === "favorites") list = list.filter(t => favorites.has(t.id));
        else if (cat !== "all") list = list.filter(t => t.category === cat);
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(t =>
                t.label.toLowerCase().includes(q) ||
                (t.description ?? "").toLowerCase().includes(q) ||
                (t.subcategory ?? "").toLowerCase().includes(q)
            );
        }
        return list;
    }, [templates, cat, query, favorites]);

    const counts = useMemo(() => {
        const c = { all: templates.length, framework: 0, schedule: 0, note: 0, favorites: 0 };
        templates.forEach(t => {
            if (t.category === "framework") c.framework++;
            else if (t.category === "schedule") c.schedule++;
            else if (t.category === "note") c.note++;
            if (favorites.has(t.id)) c.favorites++;
        });
        return c;
    }, [templates, favorites]);

    const grouped = useMemo(() => {
        const groups: Record<string, Template[]> = {};
        filtered.forEach(t => {
            const key = t.category;
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });
        return groups;
    }, [filtered]);

    const TABS = [
        { id: "all" as const, label: "전체" },
        { id: "framework" as const, label: "FrameWorkBook" },
        { id: "schedule" as const, label: "Schedule" },
        { id: "note" as const, label: "Note" },
        { id: "favorites" as const, label: "즐겨찾기" },
    ];

    const hasData = Object.values(tplData).some(v => v.trim());

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            <div className="flex items-center gap-3 mb-2">
                <LayoutTemplate className="h-6 w-6 text-[#0F766E]" />
                <h1 className="font-serif text-3xl text-neutral-900">Templates</h1>
            </div>
            <p className="text-sm text-neutral-500 mb-8">
                기획자의 사고 틀. Schedule · Note · FrameWorkBook. 프레임워크는 바로 채워 쓸 수 있습니다.
            </p>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="이름·설명 검색"
                    className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0F766E]"
                />
            </div>

            {/* 탭 필터 */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
                {TABS.map(tab => {
                    const meta = tab.id !== "all" && tab.id !== "favorites" ? CATEGORY_META[tab.id] : null;
                    const isActive = cat === tab.id;
                    const isFav = tab.id === "favorites";
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setCat(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                                isActive
                                    ? isFav
                                        ? "bg-slate-900 text-white"
                                        : "bg-[#0F766E] text-white"
                                    : isFav
                                        ? "bg-white border border-neutral-200 text-slate-700 hover:bg-slate-50"
                                        : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                            }`}
                        >
                            {isFav && <Heart className="h-3 w-3" fill={isActive ? "currentColor" : "none"} />}
                            {meta && <span className="opacity-70">{meta.icon}</span>}
                            {tab.label}
                            {counts[tab.id] > 0 && (
                                <span className="opacity-60">({counts[tab.id]})</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="py-16 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mx-auto" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 text-sm">
                    {cat === "favorites"
                        ? <><Heart className="h-8 w-8 mx-auto mb-3 text-neutral-200" />즐겨찾기한 템플릿이 없습니다.<br /><span className="text-xs">카드의 하트를 눌러 저장하세요.</span></>
                        : query ? `"${query}"에 대한 템플릿이 없습니다.` : "등록된 템플릿이 없습니다."
                    }
                </div>
            ) : cat === "all" ? (
                <div className="space-y-8">
                    {["framework", "schedule", "note"].map(catKey => {
                        const items = grouped[catKey];
                        if (!items?.length) return null;
                        const meta = CATEGORY_META[catKey];
                        return (
                            <div key={catKey}>
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 w-fit ${meta.bg}`}>
                                    <span className={meta.color}>{meta.icon}</span>
                                    <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                                    <span className={`text-[10px] opacity-60 ${meta.color}`}>{items.length}개</span>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {items.map(tpl => (
                                        <TemplateCard
                                            key={tpl.id}
                                            tpl={tpl}
                                            isFavorite={favorites.has(tpl.id)}
                                            onToggleFavorite={(e) => toggleFavorite(tpl.id, e)}
                                            onClick={() => setSelected(tpl)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map(tpl => (
                        <TemplateCard
                            key={tpl.id}
                            tpl={tpl}
                            isFavorite={favorites.has(tpl.id)}
                            onToggleFavorite={(e) => toggleFavorite(tpl.id, e)}
                            onClick={() => setSelected(tpl)}
                        />
                    ))}
                </div>
            )}

            {/* 모달 */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="px-6 py-4 border-b border-neutral-200 flex items-start justify-between gap-4 shrink-0">
                            <div className="min-w-0">
                                {(() => {
                                    const meta = CATEGORY_META[selected.category];
                                    return (
                                        <div className={`flex items-center gap-1.5 mb-2 w-fit px-2 py-1 rounded border text-[10px] font-medium ${meta?.bg} ${meta?.color}`}>
                                            {meta?.icon}
                                            {meta?.label || selected.category}
                                            {selected.subcategory && (
                                                <><ChevronRight className="h-2.5 w-2.5 opacity-50" /><span className="opacity-70">{selected.subcategory}</span></>
                                            )}
                                        </div>
                                    );
                                })()}
                                <h3 className="font-serif text-xl text-neutral-900 leading-tight">{selected.label}</h3>
                                {(() => {
                                    const en = getFrameworkBilingualName(selected);
                                    return en && en !== selected.label
                                        ? <p className="text-xs text-neutral-400 font-medium mt-0.5">{en}</p>
                                        : null;
                                })()}
                                {selected.description && (
                                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{selected.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={(e) => toggleFavorite(selected.id, e)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                        favorites.has(selected.id)
                                            ? "text-slate-700 bg-slate-100 hover:bg-slate-200"
                                            : "text-neutral-400 hover:bg-neutral-100 hover:text-slate-700"
                                    }`}
                                    title="즐겨찾기"
                                >
                                    <Heart className="h-4 w-4" fill={favorites.has(selected.id) ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* 본문 */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            {(() => {
                                const special = renderSpecial(selected, tplData, handleCellChange);
                                if (special) {
                                    return (
                                        <div>
                                            {special}
                                            {selected.body_md.trim() && (
                                                <details className="mt-4 border-t border-neutral-100 pt-4">
                                                    <summary className="text-[10px] text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-600 select-none">
                                                        작성 가이드 보기
                                                    </summary>
                                                    <div className="bg-neutral-50 rounded-lg p-4 mt-2">
                                                        {renderMd(selected.body_md)}
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="bg-neutral-50 rounded-lg p-5 min-h-32">
                                        {renderMd(selected.body_md)}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* 푸터 */}
                        <div className="px-6 py-3 border-t border-neutral-100 flex items-center justify-between shrink-0">
                            <span className="text-[11px] text-neutral-400">
                                {isSpecialTemplate(selected)
                                    ? hasData ? "연습용 입력입니다. 여기서 입력한 내용은 저장되지 않습니다." : "각 셀을 클릭해 바로 입력하세요."
                                    : 'Daily · 프로젝트 노트에서 "템플릿 삽입"으로 사용하세요.'
                                }
                            </span>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                {copied ? <Check className="h-3 w-3 text-[#0F766E]" /> : <Copy className="h-3 w-3" />}
                                {copied ? "복사됨" : hasData ? "내용 복사" : "마크다운 복사"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── 템플릿 카드 ──────────────────────────────────────────────────────
function TemplateCard({
    tpl, isFavorite, onToggleFavorite, onClick,
}: {
    tpl: Template;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
    onClick: () => void;
}) {
    const meta = CATEGORY_META[tpl.category];
    const isSpecial = isSpecialTemplate(tpl);

    const previewLines = tpl.body_md
        .split("\n")
        .filter(l => l.trim() && !l.match(/^#{1,3} /) && !l.match(/^[-*]{3,}$/) && !l.startsWith("|"))
        .slice(0, 3)
        .map(l => l.replace(/^[-*\d.[\]x ]+/, "").replace(/\*\*/g, "").replace(/_/g, "").trim())
        .filter(Boolean);

    return (
        <div className="group relative bg-white border border-neutral-200 rounded-xl hover:border-[#0F766E]/40 hover:shadow-sm transition-all overflow-hidden cursor-pointer">
            <div className={`h-1 w-full ${meta?.bar ?? "bg-neutral-300"}`} />

            <button
                onClick={onToggleFavorite}
                className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
                    isFavorite
                        ? "text-slate-700 bg-slate-100 opacity-100"
                        : "text-neutral-300 bg-white/80 opacity-0 group-hover:opacity-100"
                }`}
                title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
            >
                <Heart className="h-3 w-3" fill={isFavorite ? "currentColor" : "none"} />
            </button>

            <div className="p-4" onClick={onClick}>
                <div className="flex items-center gap-1.5 mb-2.5">
                    <span className={`flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border ${meta?.bg} ${meta?.color}`}>
                        {meta?.icon}
                        {meta?.label || tpl.category}
                    </span>
                    {tpl.subcategory && (
                        <span className="text-[9px] text-neutral-400 truncate">{tpl.subcategory}</span>
                    )}
                    {isSpecial && (
                        <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            채울 수 있음
                        </span>
                    )}
                </div>

                <h4 className="font-semibold text-neutral-900 text-sm leading-snug mb-2 group-hover:text-[#0F766E] transition-colors pr-6">
                    {tpl.label}
                </h4>

                {tpl.description && (
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-3">
                        {tpl.description}
                    </p>
                )}

                {previewLines.length > 0 && !isSpecial && (
                    <div className="bg-neutral-50 rounded-md px-3 py-2 space-y-0.5">
                        {previewLines.map((l, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
                                <span className="text-[10px] text-neutral-400 truncate">{l}</span>
                            </div>
                        ))}
                    </div>
                )}

                {isSpecial && (
                    <div className="bg-slate-50 rounded-md px-3 py-2 flex items-center gap-2">
                        <div className="grid grid-cols-2 gap-0.5 shrink-0">
                            {[0,1,2,3].map(n => <div key={n} className="w-3 h-3 rounded-sm bg-slate-300" />)}
                        </div>
                        <span className="text-[10px] text-slate-500">클릭해서 바로 채우기</span>
                    </div>
                )}
            </div>
        </div>
    );
}
