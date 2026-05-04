"use client";

import { CellTextarea, type FrameworkData } from "./_shared";
import { LabeledInput, LabeledBox } from "./meeting";

export type RiceItem = { name: string; reach: number; impact: number; confidence: number; effort: number };
export type ParetoItem = { name: string; value: number };
export type JourneyStage = { stage: string; action: string; thought: string; emotion: string; opportunity: string };

export function EmpathyMapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const top = [
        { key: "says",   label: "Says · 말하는 것",     hint: "인터뷰·리뷰·SNS에서 직접 한 말 (그대로)", color: "bg-neutral-50 border border-neutral-200", text: "text-slate-800",
          ph: "예: \"매주 화요일 새벽 2시까지 엑셀로 정리해요\"\n\"이게 진짜 짜증나는 게…\"" },
        { key: "thinks", label: "Thinks · 생각하는 것", hint: "말은 안 하지만 행동·표정에서 추론",      color: "bg-neutral-50 border border-neutral-200", text: "text-slate-800",
          ph: "예: \"이걸 하는 게 맞나?\"\n\"동료보다 뒤처지는 거 같아\"" },
        { key: "does",   label: "Does · 행동하는 것",   hint: "관찰 가능한 행동 — 빈도·맥락",            color: "bg-slate-50 border border-slate-300", text: "text-slate-900",
          ph: "예: 매주 화요일 야근\n월 1회 SaaS 구독 비교\n주말에 유튜브 강의 시청" },
        { key: "feels",  label: "Feels · 느끼는 것",    hint: "감정 단어로 — 짜증·불안·자신감 등",       color: "bg-neutral-50 border border-neutral-200", text: "text-neutral-700",
          ph: "예: 마감 전 불안\n작업 끝나고 허무함\n동료 인정받을 때 자신감" },
    ];
    const bottom = [
        { key: "pains", label: "Pains · 고통·두려움",     hint: "장애물·짜증·실패·리스크",         color: "bg-neutral-50 border border-neutral-200", text: "text-neutral-800",
          ph: "- 도구가 너무 복잡해 시간 낭비\n- 진척도가 안 보여 동기 저하\n- 야근 누적으로 번아웃 우려" },
        { key: "gains", label: "Gains · 바라는 것·이득", hint: "성공·기쁨·이상적 결과 — 측정 가능하게", color: "bg-neutral-50 border border-neutral-200", text: "text-neutral-800",
          ph: "- 주 5시간 절감\n- 본인 성장 가시화\n- 팀에서 \"믿을 수 있는 사람\" 평가" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* Persona meta */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
                <LabeledInput label="Persona · 누구를 위해?" valKey="em_persona" data={data} onChange={onChange} placeholder="예: 30대 1인 마케터 박지현" />
                <LabeledInput label="Goal · 그가 원하는 것" valKey="em_goal" data={data} onChange={onChange} placeholder="예: 야근 없이 캠페인 효율 ↑" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
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


export function MandalartGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const themeLayout = ["t0", "t1", "t2", "t3", null, "t4", "t5", "t6", "t7"] as const;

    function innerLayout(ti: number) {
        return [0, 1, 2, 3, null, 4, 5, 6, 7].map(ai =>
            ai === null ? `t${ti}` : `t${ti}_${ai}`
        );
    }

    const cellBase = "rounded border text-[9px] font-semibold leading-tight p-1 flex flex-col";
    const actionCell = "bg-white border-neutral-200 text-neutral-600";
    const themeCell = "bg-neutral-50 border-neutral-200 text-slate-900 font-bold";
    const goalCell = "bg-slate-900 border-slate-900 text-white font-extrabold";

    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
                <LabeledInput label="기간" valKey="mdl_period" data={data} onChange={onChange} placeholder="2026년 · Q2 · 100일 챌린지" />
                <LabeledInput label="검토 주기" valKey="mdl_review" data={data} onChange={onChange} placeholder="매주 일요일 · 매월 1일" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">오타니 쇼헤이 식 만다라트</span> · 중앙 = 한 줄 핵심 목표.
                8테마는 목표를 이루기 위한 영역(체력·기술·인간관계·정신력 등). 각 테마의 8실행은 <span className="font-semibold">이번 주에 시작 가능한 구체 행동</span>.
            </div>

            <div className="overflow-x-auto">
            <div className="grid grid-cols-3 gap-1 min-w-[420px]">
                {themeLayout.map((themeKey) => {
                    const isCenter = themeKey === null;

                    if (isCenter) {
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


export function PersonaGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">User Persona</span> · 한 명의 가상 인물에 N명 인터뷰 데이터를 응축.
                <span className="font-semibold"> 실제 데이터에서 추출</span>한 디테일이 없으면 픽션. 인터뷰 3~5명 후 작성 권장.
            </div>

            {/* 프로필 헤더 */}
            <div className="rounded-xl p-4 bg-neutral-50 border border-neutral-200">
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
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 min-h-28">
                    <p className="text-xs font-bold text-neutral-700">Frustrations · 좌절·짜증</p>
                    <p className="text-[10px] text-neutral-500 mb-1">반복적·구체적 불편</p>
                    <CellTextarea cellKey="persona_frustrations" value={data["persona_frustrations"] ?? ""} onChange={onChange} placeholder={"- 도구가 너무 많아 매번 정보 옮김\n- 클라 보고서 매주 새로 만들기 노가다\n- 진척도 안 보여 동기 저하"} />
                </div>
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 min-h-28">
                    <p className="text-xs font-bold text-neutral-800">Motivations · 동기·가치관</p>
                    <p className="text-[10px] text-neutral-500 mb-1">왜 이 일을 하는가</p>
                    <CellTextarea cellKey="persona_motivations" value={data["persona_motivations"] ?? ""} onChange={onChange} placeholder={"- 자기 시간 통제\n- 커리어 자산 축적\n- 가족과의 시간 확보"} />
                </div>
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 min-h-28">
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Scenario · 우리 제품을 쓰는 하루</p>
                <p className="text-[10px] text-neutral-500 mb-1">아침 → 일과 → 저녁 — 우리 제품이 어디 끼어드는지</p>
                <CellTextarea cellKey="persona_scenario" value={data["persona_scenario"] ?? ""} onChange={onChange} placeholder={"7AM 모닝 브리핑 받고 오늘 우선순위 확인\n10AM 클라 미팅 전 회의록 자동 정리\n6PM 일일 회고로 마감 — 야근 없이 퇴근"} />
            </div>
        </div>
    );
}

export function JtbdGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Clayton Christensen JTBD</span> · 사람들은 제품을 &quot;사는&quot; 게 아니라 &quot;고용&quot;한다.
                Job = 진보(progress)를 만드는 동기. <span className="font-semibold">Forces of Progress 4축</span> = Push(현재 불만) + Pull(새 매력) ↔ Anxiety(걱정) + Habit(관성).
            </div>

            {/* 3단 구조 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 min-h-32">
                    <p className="text-xs font-bold text-slate-800">Situation · 상황</p>
                    <p className="text-[10px] text-neutral-500 mb-1">언제·어디서·왜 — 트리거 순간</p>
                    <CellTextarea cellKey="jtbd_situation" value={data["jtbd_situation"] ?? ""} onChange={onChange} placeholder={"- 일요일 저녁 7~10시\n- 한 주 시작 전 막막함 느낄 때\n- 노트북 앞에서 빈 화면 응시"} />
                </div>
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 min-h-32">
                    <p className="text-xs font-bold text-neutral-800">Motivation · 동기</p>
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
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 min-h-24">
                    <p className="text-xs font-bold text-neutral-800">Anxiety · 불안 (멈추는 힘)</p>
                    <p className="text-[10px] text-neutral-500 mb-1">새 도구로 갈 때 걱정</p>
                    <CellTextarea cellKey="jtbd_anxieties" value={data["jtbd_anxieties"] ?? ""} onChange={onChange} placeholder={"- 데이터 이전 번거로움\n- AI가 잘못 추천하면?\n- 또 다른 학습 비용"} />
                </div>
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 min-h-24">
                    <p className="text-xs font-bold text-neutral-600">Habit · 기존 대안·관성</p>
                    <p className="text-[10px] text-neutral-500 mb-1">지금 어떻게 우회하고 있는가</p>
                    <CellTextarea cellKey="jtbd_habits" value={data["jtbd_habits"] ?? ""} onChange={onChange} placeholder={"- Notion + 종이 노트 병행\n- 매주 일요일 고정 루틴\n- ChatGPT에 직접 물어보기"} />
                </div>
            </div>

            {/* Hire / Fire criteria */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Hire / Fire · 채용·해고 기준</p>
                <p className="text-[10px] text-neutral-500 mb-1">우리 제품을 &quot;고용&quot;하려면 무엇이 필요? &quot;해고&quot;당하지 않으려면?</p>
                <CellTextarea cellKey="jtbd_hire" value={data["jtbd_hire"] ?? ""} onChange={onChange} placeholder={"Hire: 첫 5분 안에 가치 보임 + 데이터 자동 임포트\nFire: AI 추천 정확도 < 70% · 월 1회 이상 답답한 순간"} />
            </div>
        </div>
    );
}

export function RiceGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Topic · 우선순위 대상" valKey="rice_topic" data={data} onChange={onChange} placeholder="예: Q3 백로그 후보 / 채용 후보 / 기능 후보" />
                <LabeledInput label="Period · 평가 기간" valKey="rice_period" data={data} onChange={onChange} placeholder="2026 Q3 (분기 안에 시작·완성)" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Intercom RICE</span> · 직감을 숫자로. <span className="font-semibold">Score = (Reach × Impact × Confidence%) ÷ Effort</span>
                <br/>Reach: 분기 영향 사용자 수 · Impact: 0.25/0.5/1/2/3 (미미·낮음·중·고·대박) · Confidence: 0~100% · Effort: 인-월(PM).
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
                                            <button onClick={() => remove(idx)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-neutral-100 text-sm leading-none">×</button>
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

            {/* Top decision */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">★ Top 1~3 · 다음 분기 착수</p>
                <p className="text-[10px] text-neutral-500 mb-1">점수만 보지 말고 의존성·전략 적합도 함께 판단</p>
                <CellTextarea cellKey="rice_top" value={data["rice_top"] ?? ""} onChange={onChange} placeholder={"1. (점수 1240) 신규 가입 자동 온보딩 — Q3 핵심 OKR\n2. (점수 980) 결제 재시도 큐 — 의존성 ↓\n3. (점수 720) 모바일 알림 — 후순위지만 빠름"} />
            </div>
        </div>
    );
}

export function FiveW1HGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "who",   label: "Who",   sub: "누가 · 대상자",      hint: "주체·관계자·청중·이해관계자",     color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "주최: 마케팅팀\n대상: 25~35세 1인 사업가\n승인: 대표" },
        { key: "what",  label: "What",  sub: "무엇을 · 핵심 행동", hint: "한 문장으로 정의된 행위·결과물",   color: "bg-neutral-50 border-neutral-200", text: "text-slate-900",
          ph: "Q2 신규 가입 캠페인 런칭 — 광고 + 인플루언서 + 콘텐츠 3축 운영" },
        { key: "when",  label: "When",  sub: "언제 · 기간·시점",   hint: "시작·종료·마일스톤",               color: "bg-neutral-50 border-neutral-200", text: "text-neutral-800",
          ph: "2026-04-01 ~ 04-28 (4주)\nM1: 4/8 광고 라이브\nM2: 4/15 1차 리포트" },
        { key: "where", label: "Where", sub: "어디서 · 채널·장소", hint: "물리·디지털 채널",                 color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "Meta·Google 광고\n인스타·유튜브 콜라보\n자사 블로그·뉴스레터" },
        { key: "why",   label: "Why",   sub: "왜 · 목적·근거",     hint: "이걸 안 하면 어떻게 되는가?",      color: "bg-neutral-50 border-neutral-200", text: "text-neutral-700",
          ph: "MAU 정체 → 매출 성장 둔화\n경쟁사 대비 인지도 격차\n분기 OKR 핵심" },
        { key: "how",   label: "How",   sub: "어떻게 · 방법·자원", hint: "단계·예산·도구·인력",              color: "bg-neutral-50 border-neutral-200", text: "text-neutral-700",
          ph: "광고비 800만원\n인플 협업 5건 (각 50만원)\n콘텐츠 8편 자체 제작" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <LabeledInput label="Topic · 주제" valKey="w5h1_topic" data={data} onChange={onChange} placeholder="예: Q2 신규 가입 캠페인 / 채용 / 신제품 런칭" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Summary · 한 줄 요약</p>
                <p className="text-[10px] text-neutral-500 mb-1">6칸을 한 문장으로 — &quot;[Who]가 [Why] 위해 [When] [Where]에서 [What]을 [How] 한다&quot;</p>
                <textarea value={data["w5h1_summary"] ?? ""} onChange={e => onChange("w5h1_summary", e.target.value)}
                    placeholder="예: 마케팅팀이 MAU 정체를 깨기 위해 4월 한 달간 Meta·인플 채널에서 신규 가입 1,500명을 광고비 800만원으로 확보한다."
                    rows={2}
                    className="w-full mt-1 resize-none bg-white text-sm p-2 rounded border border-neutral-200 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

export function FiveWhyGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const whys = [1, 2, 3, 4, 5];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
                <LabeledInput label="발생일" valKey="why_date" data={data} onChange={onChange} placeholder="2026-04-27" />
                <LabeledInput label="관련자·시스템" valKey="why_owner" data={data} onChange={onChange} placeholder="결제팀 · 결제 API" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Toyota 5Why</span> · 사람을 탓하지 말고 시스템·프로세스를 탓하라.
                각 답이 다음 &quot;왜?&quot;를 자연스럽게 부르면 OK. 5번 안에 안 닿으면 문제 정의가 너무 클 가능성 ↑.
            </div>

            {/* Problem */}
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-300">
                <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">Problem · 문제 정의 (5W1H로 구체화)</p>
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
                            <div className={`flex-1 rounded-lg p-2 border ${hasPrev ? "bg-neutral-50 border-neutral-200" : "bg-neutral-50 border-neutral-200"}`}>
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Verify · 어떻게 효과를 검증할까?</p>
                <p className="text-[10px] text-neutral-500 mb-1">대응책이 실제로 작동했음을 확인할 지표·기간</p>
                <textarea value={data["why_verify"] ?? ""} onChange={e => onChange("why_verify", e.target.value)}
                    placeholder={"예: 적용 후 2주 동안 결제 실패율 < 0.1% 유지 시 종료 · 미달 시 다른 근본원인 가능성 재탐색"} rows={2}
                    className="w-full mt-1 resize-none bg-white text-xs p-2 rounded border border-neutral-200 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

export function IkigaiGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Ikigai (生き甲斐)</span> · 일본 오키나와 장수 마을의 &quot;아침에 일어날 이유&quot;.
                4원 채우기 → 2개씩 교집합(Passion·Mission·Profession·Vocation) → 4원 모두 겹치는 한 점이 Ikigai.
                <span className="font-semibold"> 명사가 아닌 동사</span>로 적어야 살아 있는 답이 나옴.
            </div>

            {/* 4대 원 */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl p-3 bg-slate-50 border-2 border-slate-300">
                    <p className="text-xs font-bold text-neutral-700">LOVE · 좋아하는 것</p>
                    <p className="text-[10px] text-neutral-500 mb-1">시간 가는 줄 모르는 일 · 하기만 해도 즐거움</p>
                    <CellTextarea cellKey="ikigai_love" value={data["ikigai_love"] ?? ""} onChange={onChange} placeholder={"- 사람들과 이야기 나누기\n- 글쓰기·정리하기\n- 새로운 도구·서비스 시도하기"} />
                </div>
                <div className="rounded-2xl p-3 bg-slate-50 border-2 border-slate-300">
                    <p className="text-xs font-bold text-slate-800">GOOD AT · 잘하는 것</p>
                    <p className="text-[10px] text-neutral-500 mb-1">남들이 칭찬하는 것 · 자연스럽게 빠른 일</p>
                    <CellTextarea cellKey="ikigai_good" value={data["ikigai_good"] ?? ""} onChange={onChange} placeholder={"- 복잡한 정보를 구조로 정리\n- 사람·아이디어 연결\n- 빠른 의사결정"} />
                </div>
                <div className="rounded-2xl p-3 bg-neutral-50 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-800">WORLD NEEDS · 세상이 필요로 하는 것</p>
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
                    <div className="rounded-lg p-2 bg-neutral-50 border border-neutral-200">
                        <p className="text-[10px] font-bold text-neutral-700">Passion · 열정 (Love × Good at)</p>
                        <p className="text-[10px] text-neutral-500 mb-1">즐겁고 잘하지만 돈은 안 됨 — 취미·열정</p>
                        <CellTextarea cellKey="ikigai_passion" value={data["ikigai_passion"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-slate-50 border border-neutral-200">
                        <p className="text-[10px] font-bold text-neutral-800">Mission · 사명 (Love × Needs)</p>
                        <p className="text-[10px] text-neutral-500 mb-1">즐겁고 의미 있지만 잘하진 못함 — 사명</p>
                        <CellTextarea cellKey="ikigai_mission" value={data["ikigai_mission"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-neutral-50 border border-neutral-200">
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
                    className="w-full mt-1 resize-none bg-white/60 text-sm p-2 rounded border border-neutral-200 focus:outline-none text-center font-medium leading-relaxed" />
            </div>

            {/* Next steps */}
            <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Next · 90일 동안 시도할 한 가지</p>
                <p className="text-[10px] text-neutral-500 mb-1">Ikigai를 작게 검증할 실험</p>
                <CellTextarea cellKey="ikigai_next" value={data["ikigai_next"] ?? ""} onChange={onChange} placeholder={"예: 매주 수요일 7~9PM, 1인 사업가 1명 무료 컨설팅 → 90일 후 12명 인터뷰 인사이트 정리"} />
            </div>
        </div>
    );
}

export function Porter5Grid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cellClass = "rounded-lg p-2.5 border min-h-28";
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Industry · 산업·시장" valKey="p5_industry" data={data} onChange={onChange} placeholder="예: 국내 1인 사업자용 SaaS 플래너 시장" />
                <LabeledInput label="Time horizon · 분석 시점" valKey="p5_horizon" data={data} onChange={onChange} placeholder="2026 Q2 · 향후 12개월" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Michael Porter 5 Forces</span> · 산업 매력도(=평균 수익률) 결정 5요인.
                각 칸에 <span className="font-semibold">사실·증거 + 강도(상·중·하)</span>까지 표기. 5개 모두 강하면 시장 매력도 ↓.
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div />
                <div className={`${cellClass} bg-neutral-50 border-neutral-200`}>
                    <p className="text-[10px] font-bold text-slate-800">New Entrants · 신규 진입</p>
                    <p className="text-[9px] text-neutral-500 mb-1">진입장벽·자본·기술·규제</p>
                    <CellTextarea cellKey="p5_new_entrants" value={data["p5_new_entrants"] ?? ""} onChange={onChange} placeholder="예: AI로 SaaS 진입장벽 ↓ — 6개월 내 유사 서비스 5개+ 예상 [강도: 상]" />
                </div>
                <div />

                <div className={`${cellClass} bg-neutral-50 border-neutral-200`}>
                    <p className="text-[10px] font-bold text-slate-800">Suppliers · 공급자 협상력</p>
                    <p className="text-[9px] text-neutral-500 mb-1">우리에게 자원·인프라 제공</p>
                    <CellTextarea cellKey="p5_suppliers" value={data["p5_suppliers"] ?? ""} onChange={onChange} placeholder="예: OpenAI·Claude API 가격 인상 시 즉각 영향 [강도: 중] / 대체 LLM 다양화로 협상력 ↓" />
                </div>
                <div className={`${cellClass} bg-slate-100 border-2 border-slate-700`}>
                    <p className="text-[10px] font-bold text-slate-900">Rivalry · 기존 경쟁</p>
                    <p className="text-[9px] text-neutral-500 mb-1">동종 경쟁사 강도</p>
                    <CellTextarea cellKey="p5_rivalry" value={data["p5_rivalry"] ?? ""} onChange={onChange} placeholder="예: Notion·Sunsama·Motion 강력 / 가격 경쟁 시작 / 차별화 = AI 코치 [강도: 상]" />
                </div>
                <div className={`${cellClass} bg-neutral-50 border-neutral-200`}>
                    <p className="text-[10px] font-bold text-slate-900">Buyers · 구매자 협상력</p>
                    <p className="text-[9px] text-neutral-500 mb-1">고객 가격·전환 비용</p>
                    <CellTextarea cellKey="p5_buyers" value={data["p5_buyers"] ?? ""} onChange={onChange} placeholder="예: 1인 사업자는 가격 민감 / 14일 무료로 쉽게 이탈 [강도: 중·상]" />
                </div>

                <div />
                <div className={`${cellClass} bg-neutral-50 border-neutral-200`}>
                    <p className="text-[10px] font-bold text-neutral-800">Substitutes · 대체재</p>
                    <p className="text-[9px] text-neutral-500 mb-1">동일 가치 다른 형태</p>
                    <CellTextarea cellKey="p5_substitutes" value={data["p5_substitutes"] ?? ""} onChange={onChange} placeholder="예: 종이 플래너 / Notion + ChatGPT 조합 / 비서·코치 고용 [강도: 중]" />
                </div>
                <div />
            </div>

            {/* Strategic implications */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Strategy · 전략적 시사점 (어디로 갈 것인가)</p>
                <p className="text-[10px] text-neutral-500 mb-1">5가지 힘에 어떻게 대응? 진입장벽 ↑·차별화·대체재 회피</p>
                <CellTextarea cellKey="p5_strategy" value={data["p5_strategy"] ?? ""} onChange={onChange} placeholder={"1. AI 코치 차별화 → 데이터 학습 효과로 후발 주자 따라잡기 어려움\n2. B2B 채널 (커뮤니티·교육기관) 락인 — 대체재 회피\n3. 가격 경쟁 회피 — 가치 기반 가격 유지"} />
            </div>
        </div>
    );
}

export function ScamperGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "scamper_s", letter: "S", label: "Substitute · 대체",         hint: "재료·사람·프로세스·규칙을 다른 것으로", prompt: "어떤 부품·요소를 대체하면 더 좋을까?",
          color: "bg-neutral-50 border-neutral-200", text: "text-neutral-700",
          ph: "예: 종이 매뉴얼 → 영상 튜토리얼 / 이메일 응대 → AI 챗봇 1차" },
        { key: "scamper_c", letter: "C", label: "Combine · 결합",            hint: "두 가지를 합쳐 새 가치 창출",         prompt: "다른 제품·서비스·기능과 합치면?",
          color: "bg-neutral-50 border-neutral-200", text: "text-neutral-700",
          ph: "예: 플래너 + AI 코치 / 회의록 + 자동 액션 추적" },
        { key: "scamper_a", letter: "A", label: "Adapt · 응용",              hint: "다른 분야·문맥의 해법을 가져와 적용",   prompt: "이걸 다른 곳/시기에 적용하면?",
          color: "bg-neutral-50 border-neutral-200", text: "text-neutral-800",
          ph: "예: 음식 배달 추적 UX → SaaS 온보딩 진척도 표시" },
        { key: "scamper_m", letter: "M", label: "Modify · 변형·확대·축소",   hint: "크기·빈도·강도·형태를 바꾸기",         prompt: "더 크게? 더 작게? 더 자주?",
          color: "bg-neutral-50 border-neutral-200", text: "text-slate-900",
          ph: "예: 1년 플랜 → 90일 챌린지 / 주간 회의 → 일일 5분 스탠드업" },
        { key: "scamper_p", letter: "P", label: "Put to other use · 다른 용도", hint: "원래 용도 외 다른 곳에 쓸 수 있나",  prompt: "이걸 누가, 어디서, 또 쓸 수 있을까?",
          color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "예: B2C 플래너 → 1인 사업가용 OKR / 학생용 시간표" },
        { key: "scamper_e", letter: "E", label: "Eliminate · 제거",          hint: "없어도 되는 것을 과감히 빼기",         prompt: "이걸 제거하면 뭐가 단순해질까?",
          color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "예: 가입 단계 5 → 2 / 설정 옵션 30개 → 핵심 5개" },
        { key: "scamper_r", letter: "R", label: "Reverse · 역발상·재배치",   hint: "순서 뒤집기·반대로 하기",              prompt: "거꾸로 하면? 사용자가 만들면?",
          color: "bg-neutral-100 border-neutral-200", text: "text-neutral-700",
          ph: "예: 우리가 가르치는 강의 → 사용자끼리 가르치는 커뮤니티 / 결제 후 사용 → 사용 후 결제" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <LabeledInput label="Subject · 개선 대상" valKey="scamper_subject" data={data} onChange={onChange} placeholder="예: 우리 플래너 앱 / 회의 프로세스 / 신규 가입 플로우" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Top 3 · 시도해볼 아이디어</p>
                <p className="text-[10px] text-neutral-500 mb-1">7가지 중 가장 끌리는 3개 — 다음 스프린트에 작게 검증</p>
                <textarea value={data["scamper_top"] ?? ""} onChange={e => onChange("scamper_top", e.target.value)}
                    placeholder={"1. (M) 일일 5분 스탠드업 시범 — 다음 주 월요일\n2. (C) 회의록 + 자동 액션 추적 프로토타입 — 2주 내\n3. (E) 설정 옵션 30→5 단순화 — 디자인 시안 1주"} rows={3}
                    className="w-full mt-1 resize-none bg-white text-xs p-2 rounded border border-neutral-200 focus:outline-none leading-relaxed" />
            </div>
        </div>
    );
}

export function ParetoGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Subject · 분석 대상" valKey="pareto_subject" data={data} onChange={onChange} placeholder="예: 매출 / CS 문의 유형 / 시간 사용 / 고객 이탈 원인" />
                <LabeledInput label="Period · 기간" valKey="pareto_period" data={data} onChange={onChange} placeholder="2026 Q2 (3개월)" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Pareto 80/20</span> · 결과의 80%는 원인의 20%에서.
                상위 누적 80%까지가 <span className="font-semibold">Vital Few</span> — 여기에 자원·집중을 몰아라. 나머지는 자동화하거나 버려라.
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
                            <button onClick={() => remove(idx)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-neutral-100 text-sm leading-none">×</button>
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

            {/* Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Insight · 발견" valKey="pareto_insight" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="예: 매출의 80%가 상위 3개 패키지에서 나옴. 나머지 12개는 합쳐도 20%." />
                <LabeledBox label="Action · 다음 행동" valKey="pareto_action" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder="- 상위 3개 마케팅·운영 강화\n- 하위 12개 중 6개는 단계적 종료" />
            </div>
        </div>
    );
}

export function FishboneGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const bones = [
        { key: "fish_people",      label: "People · 사람",       hint: "스킬·교육·동기·소통·역할 분담", color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "- 신입 온보딩 부족\n- 백업 인력 X\n- 책임 소재 모호" },
        { key: "fish_process",     label: "Process · 프로세스",  hint: "절차·흐름·승인·핸드오프",        color: "bg-neutral-50 border-neutral-200", text: "text-slate-900",
          ph: "- 검수 단계 병목\n- 핸드오프 정보 누락\n- 우선순위 잦은 변경" },
        { key: "fish_technology",  label: "Technology · 기술",   hint: "도구·시스템·자동화·버그",        color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "- 모니터링 알림 미설정\n- 결제 API 재시도 큐 X\n- 레거시 의존" },
        { key: "fish_environment", label: "Environment · 환경",  hint: "조직·문화·외부 요인",            color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "- 분기말 부담 누적\n- 원격·대면 혼재\n- 시장 급변" },
        { key: "fish_materials",   label: "Materials · 자원",    hint: "예산·인프라·데이터",              color: "bg-neutral-50 border-neutral-200", text: "text-neutral-800",
          ph: "- 분석용 데이터 통합 안 됨\n- 예산 부족\n- 외부 라이선스 만료" },
        { key: "fish_measurement", label: "Measurement · 측정", hint: "지표·KPI·관찰 방법",              color: "bg-neutral-50 border-neutral-200", text: "text-neutral-700",
          ph: "- 결제 실패율 미추적\n- KPI 정의 모호\n- 사후 측정 only" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* Problem head */}
            <div className="rounded-xl p-3 bg-slate-100 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">Problem · 문제 (물고기 머리)</p>
                <p className="text-[10px] text-neutral-500 mb-1">관찰 가능한 결과·증상으로 — 5W1H로 구체화</p>
                <textarea value={data["fish_problem"] ?? ""} onChange={e => onChange("fish_problem", e.target.value)}
                    placeholder="예: 4/26 18:00~18:15 결제 API 응답 지연으로 142건 결제가 실패함"
                    rows={2}
                    className="w-full mt-1 resize-none bg-white/60 text-sm p-2 rounded border border-slate-200 focus:outline-none leading-relaxed" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Ishikawa 6M</span> · 문제의 잠재 원인을 6범주로 빠짐없이 탐색.
                각 카테고리별로 <span className="font-semibold">&quot;왜?&quot;를 3번</span> 물어 깊이 내려가기. 가설 다발 → 검증 우선순위.
            </div>

            {/* 6 bones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {bones.map(b => (
                    <div key={b.key} className={`rounded-lg p-3 border ${b.color} min-h-28`}>
                        <p className={`text-xs font-bold ${b.text}`}>{b.label}</p>
                        <p className="text-[10px] text-neutral-500 mb-1">{b.hint}</p>
                        <CellTextarea cellKey={b.key} value={data[b.key] ?? ""} onChange={onChange} placeholder={b.ph} />
                    </div>
                ))}
            </div>

            {/* Top causes + Verify */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Top 3 · 가장 유력한 원인 + 검증 방법</p>
                <p className="text-[10px] text-neutral-500 mb-1">데이터·실험으로 어떻게 확인할 것인가</p>
                <CellTextarea cellKey="fish_top" value={data["fish_top"] ?? ""} onChange={onChange} placeholder={"1. (Tech) 결제 API 타임아웃 30s 너무 김 — 로그 분석으로 평균/최악 응답 시간 확인\n2. (Process) 외부 PG 장애 시 재시도 없음 — 트래픽 시뮬레이션 테스트\n3. (Measurement) 알림 미설정 — 즉시 모니터링 + 알림 룰 추가"} />
            </div>
        </div>
    );
}

export function JourneyMapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Persona · 대상 고객" valKey="journey_persona" data={data} onChange={onChange} placeholder="예: 30대 1인 마케터 박지현" />
                <LabeledInput label="Scope · 여정 범위" valKey="journey_scope" data={data} onChange={onChange} placeholder="예: 광고 노출 → 90일 유료 전환" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
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
                                        className="w-full resize-none px-1.5 py-1 text-xs bg-neutral-50 border border-neutral-200 rounded focus:outline-none focus:bg-white focus:border-slate-700" />
                                </td>
                                <td className="px-1 py-2 text-center">
                                    {stages.length > 1 && (
                                        <button onClick={() => remove(idx)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-neutral-100 text-sm leading-none">×</button>
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Top 3 · 가장 시급한 개선 기회</p>
                <p className="text-[10px] text-neutral-500 mb-1">감정 점수가 가장 낮은 구간 우선. 담당·기한까지.</p>
                <CellTextarea cellKey="journey_top" value={data["journey_top"] ?? ""} onChange={onChange} placeholder={"1. Onboarding 첫 5분 — 체크리스트 v1 (홍길동, ~05-10)\n2. Retention 주차별 리포트 — 자동 발송 (김영희, ~05-20)\n3. Advocacy 초대 보상 — A/B 테스트 (박철수, ~06-01)"} />
            </div>
        </div>
    );
}
