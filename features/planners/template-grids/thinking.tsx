"use client";

import { CellTextarea, type FrameworkData } from "./_shared";
import { LabeledInput, LabeledBox } from "./meeting";

export type DmCriterion = { name: string; weight: number };
export type DmOption = { name: string; scores: number[] };

export function KptGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "kpt_keep",    label: "Keep",    sub: "잘한 것 · 계속할 것",   color: "bg-neutral-50 border-neutral-200", text: "text-slate-900",
          ph: "- 데일리 스탠드업 10분 룰 지킴 → 회의 효율 ↑\n- 페어 코딩으로 신규 멤버 온보딩 가속" },
        { key: "kpt_problem", label: "Problem", sub: "문제 · 개선할 것",      color: "bg-neutral-50 border-neutral-200", text: "text-neutral-700",
          ph: "- 스프린트 후반에 PR 리뷰가 몰림\n- 기획-개발 핸드오프에서 정보 누락" },
        { key: "kpt_try",     label: "Try",     sub: "새로 시도할 것",        color: "bg-neutral-50 border-neutral-200", text: "text-neutral-800",
          ph: "- PR 리뷰 데드라인 24h 룰 도입\n- 핸드오프 체크리스트 v1 시범" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-3 gap-2">
                <LabeledInput label="Sprint·기간" valKey="kpt_sprint" data={data} onChange={onChange} placeholder="W18 · 2026-04-21~04-27" />
                <LabeledInput label="Team·팀" valKey="kpt_team" data={data} onChange={onChange} placeholder="플래너스 코어팀" />
                <LabeledInput label="Facilitator·진행" valKey="kpt_facilitator" data={data} onChange={onChange} placeholder="이름" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
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

export function OodaGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "ooda_observe", label: "Observe · 관찰", sub: "사실·데이터·신호 — 해석 X",            color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "예: 경쟁사 A가 가격 30% 인하 발표 / 우리 주간 전환율 2주 연속 ↓ / 고객 지원 문의 50% ↑" },
        { key: "ooda_orient",  label: "Orient · 방향",  sub: "내 가정·선입견 점검 — 가장 중요한 단계", color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "예: 우리 가정 \"경쟁사는 프리미엄 시장 X\"가 흔들림 / 고객은 가격에 우리 생각보다 민감 / 1순위 차별화 = 가격 X, 자동화" },
        { key: "ooda_decide",  label: "Decide · 결정",  sub: "옵션 1~3개 중 1개 선택",                 color: "bg-neutral-50 border-neutral-200", text: "text-neutral-800",
          ph: "옵션:\nA) 가격 동결 + 자동화 메시지 강화 (선택)\nB) 가격 인하 따라가기\nC) 무대응 + 데이터 추가 수집 2주" },
        { key: "ooda_act",     label: "Act · 실행",     sub: "작게·빠르게 → 다시 Observe",             color: "bg-neutral-50 border-neutral-200", text: "text-slate-900",
          ph: "이번 주: \"AI 자동화 ROI\" 캠페인 + 기존 고객 케이스 영상 / 다음 화요일 결과 측정" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
                <LabeledInput label="Situation · 상황" valKey="ooda_situation" data={data} onChange={onChange} placeholder="예: 경쟁사 가격 공세 대응 / 마감 임박 위기 대응" />
                <LabeledInput label="Cycle · 사이클 주기" valKey="ooda_cycle" data={data} onChange={onChange} placeholder="예: 매일 30분 / 주 1회 / 분기" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">John Boyd OODA Loop</span> · 공군 도그파이트에서 유래.
                <span className="font-semibold"> 빠른 사이클이 곧 우위</span> — 상대보다 한 번 더 도는 쪽이 이긴다. <span className="font-semibold">Orient가 가장 중요</span> — 잘못된 가정 위 결정은 무용지물.
            </div>

            {/* 4단계 */}
            <div className="space-y-1.5">
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
                            <p className="text-[10px] text-neutral-500 mb-1">{s.sub}</p>
                            <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange} placeholder={s.ph} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Next loop */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">⟳ Next Loop · 다음 사이클 트리거·체크포인트</p>
                <p className="text-[10px] text-neutral-500 mb-1">언제 다시 Observe로 돌아갈 것인가? 어떤 신호를 보고?</p>
                <CellTextarea cellKey="ooda_next" value={data["ooda_next"] ?? ""} onChange={onChange} placeholder="예: 다음 화요일 9AM 전환율 측정 / 경쟁사 추가 액션 즉시 트리거" />
            </div>
        </div>
    );
}

export function CornellGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-2">
                <LabeledInput label="Subject · 과목·주제" valKey="cornell_subject" data={data} onChange={onChange} placeholder="예: 강화학습 / 마케팅 워크숍" />
                <LabeledInput label="Date · 날짜" valKey="cornell_date" data={data} onChange={onChange} placeholder="2026-04-27" />
                <LabeledInput label="Source · 출처" valKey="cornell_source" data={data} onChange={onChange} placeholder="강의명 · 책 · 영상 링크" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Walter Pauk Cornell Notes</span> · 듣기→정리→복습의 3단 시스템.
                <span className="font-semibold"> 24h 안에 Cue+Summary 채우기</span>가 핵심 — 그래야 장기 기억으로 넘어감.
            </div>

            <div className="rounded-lg border border-neutral-300 overflow-hidden bg-white">
                {/* Top: Cue (left) + Notes (right) */}
                <div className="grid grid-cols-[1fr_2fr]">
                    <div className="border-r border-neutral-300 bg-neutral-50 p-3">
                        <p className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider">Cue · 핵심 키워드·질문</p>
                        <p className="text-[10px] text-neutral-500 mb-1">강의 후 채우기 · 복습 시 이것만 보고 Notes 떠올리기</p>
                        <textarea value={data["cornell_cue"] ?? ""} onChange={e => onChange("cornell_cue", e.target.value)}
                            placeholder={"강화학습이란?\n보상 함수 설계 원리\nExploration vs Exploitation\n적용 사례 3가지"} rows={12}
                            className="w-full mt-1 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
                    </div>
                    <div className="bg-white p-3">
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Notes · 본문</p>
                        <p className="text-[10px] text-neutral-500 mb-1">수업·강의·독서 내용 — 자유롭게</p>
                        <textarea value={data["cornell_notes"] ?? ""} onChange={e => onChange("cornell_notes", e.target.value)}
                            placeholder={"강화학습은 시행착오로 배우는 ML 분야...\n\n핵심 3요소:\n- Agent: 행동 주체\n- Reward: 보상 신호 (양수/음수)\n- Environment: 상호작용 공간\n\n주요 도전: 즉시 보상 vs 장기 보상 균형"} rows={12}
                            className="w-full mt-1 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
                    </div>
                </div>
                {/* Bottom: Summary */}
                <div className="border-t-2 border-neutral-300 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Summary · 요약 (내 언어로)</p>
                    <p className="text-[10px] text-neutral-500 mb-1">강의 후 24h 안에 — 한 단락으로 압축</p>
                    <textarea value={data["cornell_summary"] ?? ""} onChange={e => onChange("cornell_summary", e.target.value)}
                        placeholder='예: 강화학습은 "보상으로 행동을 학습하는 AI". 핵심은 Agent가 Environment와 상호작용하며 보상을 누적 최대화하는 정책을 찾는 것. 가장 큰 도전은 단기 보상에 집착하지 않고 장기 가치도 추구하는 균형 (Exploration ↔ Exploitation).'
                        rows={4}
                        className="w-full mt-1 resize-none bg-transparent text-xs placeholder:text-neutral-400 focus:outline-none leading-relaxed" />
                </div>
            </div>

            <LabeledBox label="Questions · 더 알아볼 것" valKey="cornell_questions" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="- Reward function 설계 베스트 프랙티스?\n- 실제 비즈니스 적용 사례?" />
        </div>
    );
}

export function DecisionMatrixGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Decision · 결정 안건" valKey="dm_decision" data={data} onChange={onChange} placeholder="예: Q3 핵심 채널 선정 / 새 도구 도입 / 채용 후보 비교" />
                <LabeledInput label="Decider · 결정자" valKey="dm_decider" data={data} onChange={onChange} placeholder="대표 · 팀 합의" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Weighted Decision Matrix</span> · 직감 vs 분석 사이의 다리.
                <span className="font-semibold"> 기준 가중치 × 옵션 점수</span> · 점수 1~5(높을수록 유리). 총점 = Σ(점수 × 가중치). 1등이 직감과 다르면 — 가중치를 다시 봐라.
            </div>
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
                                            <button onClick={() => removeOption(oi)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-neutral-100 text-sm leading-none">×</button>
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

            {/* Decision + sanity check */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Final Decision · 최종 결정" valKey="dm_final" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="1등 옵션 + 결정 이유 한 줄" />
                <LabeledBox label="Sanity check · 직감 vs 점수" valKey="dm_sanity" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="직감과 다르면 가중치를 다시. 일치하면 빨리 실행." />
            </div>
        </div>
    );
}

export function FeynmanGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "feynman_concept",  label: "1. Concept · 주제 한 줄",          hint: "가르치려는 개념·내용을 한 줄로",         color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "예: 강화학습이란 무엇인가? / OAuth 2.0 동작 원리 / Cash Flow Statement 읽는 법" },
        { key: "feynman_teach",    label: "2. Teach · 6살에게 설명하듯",      hint: "전문용어·약어 금지 — 일상 단어로만",      color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
          ph: "예: 강화학습은 강아지에게 간식 주면서 훈련시키는 것과 같아. 잘하면 점수를 주고, 못하면 점수를 안 줘. 강아지(컴퓨터)는 점수를 많이 받는 행동을 점점 더 자주 하게 돼." },
        { key: "feynman_gaps",     label: "3. Gaps · 막힌 곳·애매한 곳",      hint: "설명하다 막힌 부분 = 진짜 모르는 부분",   color: "bg-neutral-50 border-neutral-200", text: "text-neutral-700",
          ph: "예: \"점수를 어떻게 정하지?\"에서 막힘 — Reward function 설계 원리 다시 공부\n\"왜 강화학습이 지도학습보다 어렵지?\" — Exploration vs Exploitation 이해 부족" },
        { key: "feynman_simplify", label: "4. Simplify · 비유·예시로 다시",   hint: "갭을 메운 후 더 짧고 명료하게",          color: "bg-neutral-50 border-neutral-200", text: "text-slate-900",
          ph: "예: 강화학습 = \"시행착오로 배우는 컴퓨터\". 핵심 3요소: 행동 / 보상 / 환경. 자전거 처음 배울 때처럼 — 넘어지면 (음수 보상) 다시 시도, 잘 가면 (양수 보상) 그 방법을 기억." },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
                <LabeledInput label="대상 청자" valKey="feynman_audience" data={data} onChange={onChange} placeholder="예: 6살 / 비전공자 동료 / 신입 인턴" />
                <LabeledInput label="검증 시점" valKey="feynman_verify" data={data} onChange={onChange} placeholder="언제 누구에게 실제로 설명해볼까?" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
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
            <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">5. Repeat · 다시 사이클로 돌아가기</p>
                <p className="text-[10px] text-neutral-500 mb-1">막힘이 사라질 때까지 — 다음에 보강할 갭·읽을 자료</p>
                <CellTextarea cellKey="feynman_repeat" value={data["feynman_repeat"] ?? ""} onChange={onChange} placeholder={"- Sutton & Barto 2장 다시 읽기\n- 동료에게 5분 발표 후 피드백\n- 1주일 뒤 다시 설명해보기"} />
            </div>
        </div>
    );
}
