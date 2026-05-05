"use client";

import { CellTextarea, type FrameworkData } from "./_shared";
import { LabeledInput, LabeledBox } from "./meeting";

/* ─────────────────────── 공유 타입 ─────────────────────── */

export type TbBlock = { start: string; end: string; task: string; category: string };
export type DwSession = { start: string; duration: number; task: string; result: string; distractions: string };
export type PomSession = { task: string; completed: number; notes: string };
export type HabitEntry = { name: string; days: boolean[] };
export type EnergyPoint = { hour: number; level: number };
export type YrMonth = { focus: string; goal: string };

/* ─────────────────────── TimeBlockGrid ─────────────────────── */

export function TimeBlockGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Date · 날짜" valKey="tb_date" data={data} onChange={onChange} placeholder="2026-04-27 (월)" />
                <LabeledInput label="Top 3 · 오늘의 핵심" valKey="tb_top3" data={data} onChange={onChange} placeholder="1) 캠페인 리포트 2) 신규 가입 분석 3) 1on1 준비" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Cal Newport Time Blocking</span> · 모든 시간을 블록으로 — &quot;빈 시간 = 낭비될 시간&quot;.
                Top 3에 90~120분 블록을 <span className="font-semibold">오전</span>에 배치. 회의·이메일은 오후. 종일 다 못 지켜도 OK — 다음 날 재구성.
            </div>
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
                            <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-neutral-100 text-sm leading-none">×</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-[#6366F1] hover:border-[#6366F1]">+ 블록 추가</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Wins · 잘 지킨 블록" valKey="tb_wins" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="예: 09~11 캠페인 리포트 완성 (90분 풀집중)" />
                <LabeledBox label="Slips · 못 지킨 이유·재배치" valKey="tb_slips" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="예: 14시 협업 블록 미팅 연장 → 분석은 내일 오전으로" />
            </div>
        </div>
    );
}

/* ─────────────────────── DailyDesignGrid ─────────────────────── */

export function DailyDesignGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Date · 날짜" valKey="dd_date" data={data} onChange={onChange} placeholder="2026-04-27 (월)" />
                <LabeledInput label="컨디션 · 1~5" valKey="dd_condition" data={data} onChange={onChange} placeholder="잠 7h · 컨디션 4 · 운동 X" />
            </div>
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-300">
                <p className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider">Intention · 오늘의 의도</p>
                <p className="text-[10px] text-neutral-500 mb-1">&quot;오늘 나는 ___한 사람이다&quot; — 정체성 기반 한 줄</p>
                <textarea value={data["dd_intention"] ?? ""} onChange={e => onChange("dd_intention", e.target.value)}
                    placeholder='예: "오늘 나는 마감을 지키고 동료에게 친절한 사람이다."'
                    rows={2}
                    className="w-full mt-1 resize-none bg-white/60 text-xs p-2 rounded border border-neutral-200 focus:outline-none leading-relaxed" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Daily Design</span> · 시간이 아니라 <span className="font-semibold">하루 자체를 디자인</span>한다.
                Top 3로 우선순위 압축 → 시간표로 구체화 → 저녁 회고로 학습 사이클 완성.
            </div>
            <LabeledBox label="Top 3 · 핵심 우선순위 (Most Important Tasks)" valKey="dd_priorities" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder={"1. 캠페인 리포트 1차 초안 (90분)\n2. 디자인팀 시안 리뷰 (45분)\n3. 이번 주 1on1 준비"} />
            <LabeledBox label="Schedule · 일정·시간 블록" valKey="dd_schedule" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder={"09:00~10:30 캠페인 리포트 (집중)\n10:30~11:00 메일·슬랙 처리\n11:00~12:00 시안 리뷰\n13:00~14:00 점심·산책\n14:00~15:00 1on1 준비\n15:00~ 회의·즉흥 대응"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Energy Plan · 에너지 배치" valKey="dd_energy" data={data} onChange={onChange} placeholder="피크(09~11): 집중 작업 · 저점(14~15): 행정·산책" />
                <LabeledBox label="Avoid · 오늘 안 할 것" valKey="dd_avoid" data={data} onChange={onChange} placeholder="- 슬랙 알림 ON 상태로 깊은 작업 X\n- 회의 5개 이상 X" />
            </div>
            <LabeledBox label="Reflection · 저녁 회고 (3 lines)" valKey="dd_reflection" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder={"잘된 것: 오전 90분 풀집중으로 리포트 70% 완성\n배운 것: 슬랙 알림 OFF로 효율 1.5배\n내일: 시안 리뷰가 30분 늦어짐 — 시간 버퍼 필요"} />
        </div>
    );
}

/* ─────────────────────── DeepWorkGrid ─────────────────────── */

export function DeepWorkGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: DwSession[] = [{ start: "09:00", duration: 90, task: "", result: "", distractions: "" }];
    const ss: DwSession[] = (() => {
        try { const p = data["dw_sessions"] ? JSON.parse(data["dw_sessions"]) : null; return Array.isArray(p) && p.length > 0 ? p : DEFAULT; }
        catch { return DEFAULT; }
    })();
    const save = (next: DwSession[]) => onChange("dw_sessions", JSON.stringify(next));
    const update = (i: number, patch: Partial<DwSession>) => { const n = [...ss]; n[i] = { ...n[i], ...patch }; save(n); };
    const add = () => save([...ss, { start: "", duration: 60, task: "", result: "", distractions: "" }]);
    const remove = (i: number) => save(ss.filter((_, x) => x !== i));
    const totalMin = ss.reduce((sum, x) => sum + (x.duration || 0), 0);
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    <LabeledInput label="Date · 날짜" valKey="dw_date" data={data} onChange={onChange} placeholder="2026-04-27" />
                    <LabeledInput label="목표 시간" valKey="dw_goal" data={data} onChange={onChange} placeholder="예: 4시간" />
                    <div>
                        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">총 누적</p>
                        <p className="text-base font-bold text-slate-700 mt-1">{totalMin}분 · {Math.floor(totalMin / 60)}시간 {totalMin % 60}분</p>
                    </div>
                </div>
                <LabeledInput label="Why · 왜 이걸 하나" valKey="dw_why" data={data} onChange={onChange} placeholder="예: 분기 OKR 핵심 지표 — 이번 주 마무리해야 다음 단계 진행" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Cal Newport Deep Work</span> · 산만함 없이 <span className="font-semibold">90분 단위</span>로.
                전·후 명확한 시작/끝, 휴대폰은 다른 방, 결과를 측정 가능한 산출물로. 진짜 가치는 시간 ÷ 산출물이 아니라 시간 × 집중도.
            </div>
            {ss.map((s, i) => (
                <div key={i} className="rounded-lg p-3 bg-slate-50 border border-slate-300 space-y-2 relative">
                    {ss.length > 1 && (
                        <button onClick={() => remove(i)} className="absolute top-2 right-2 w-5 h-5 rounded text-slate-300 hover:text-slate-700 hover:bg-neutral-100 text-sm leading-none">×</button>
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
                        placeholder="예: 분기 OKR 리포트 초안 — 1.5시간 풀집중"
                        className="w-full px-2 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded focus:outline-none" />
                    <textarea value={s.result} onChange={e => update(i, { result: e.target.value })}
                        placeholder="결과 — 무엇을 완성했나 (구체 산출물). 예: 1~3장 초안 완성, 그래프 4개" rows={2}
                        className="w-full resize-none px-2 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none leading-relaxed" />
                    <textarea value={s.distractions} onChange={e => update(i, { distractions: e.target.value })}
                        placeholder="방해 요소 — 무엇이 흐름을 끊었나 (예: 슬랙 알림 3회 · 4시쯤 졸림)" rows={1}
                        className="w-full resize-none px-2 py-1.5 text-[11px] bg-white/60 border border-slate-200 rounded focus:outline-none text-neutral-700 leading-relaxed" />
                </div>
            ))}
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-400">+ 세션 추가</button>
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Lesson · 오늘 배운 것 (집중 패턴·트리거)</p>
                <p className="text-[10px] text-neutral-500 mb-1">언제 가장 잘 됐나? 무엇이 흐름을 끊는가?</p>
                <CellTextarea cellKey="dw_lesson" value={data["dw_lesson"] ?? ""} onChange={onChange} placeholder={"- 오전 9~11시가 최고 집중 시간 — 회의 절대 금지\n- 휴대폰 다른 방 두면 1.5배 깊어짐\n- 점심 후 30분 산책 → 오후 집중 회복"} />
            </div>
        </div>
    );
}

/* ─────────────────────── PomodoroGrid ─────────────────────── */

export function PomodoroGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3">
                <div className="flex-1 grid grid-cols-2 gap-2">
                    <LabeledInput label="Date · 날짜" valKey="pom_date" data={data} onChange={onChange} placeholder="2026-04-27" />
                    <LabeledInput label="목표 토마토" valKey="pom_goal" data={data} onChange={onChange} placeholder="예: 12개 (= 5시간 집중)" />
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">총 토마토</p>
                    <p className="text-2xl font-bold text-slate-700">{totalTomatoes} <span className="text-xs font-normal text-neutral-500">/ {totalTomatoes * 25}분</span></p>
                </div>
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Pomodoro Technique</span> · 25분 집중 + 5분 휴식 = 1 토마토.
                4 토마토마다 15~30분 긴 휴식. <span className="font-semibold">중간에 끊기면 그 토마토는 0</span> — 다시 시작.
                알림 차단·핸드폰 멀리·한 가지 일만.
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
                                {s.completed > 0 ? "🍅".repeat(Math.min(s.completed, 8)) + (s.completed > 8 ? `+${s.completed - 8}` : "") : <span className="text-neutral-300">–</span>}
                            </span>
                            <button onClick={() => update(i, { completed: s.completed + 1 })} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-xs">+</button>
                        </div>
                        <input type="text" value={s.notes} onChange={e => update(i, { notes: e.target.value })}
                            placeholder="메모" className="w-40 px-2 py-1 text-xs bg-transparent border border-transparent rounded focus:outline-none focus:bg-white focus:border-neutral-300" />
                        {ss.length > 1 && (
                            <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-neutral-100 text-sm leading-none">×</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400">+ 과업 추가</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Interruptions · 방해 발생" valKey="pom_interruptions" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="- 11시쯤 슬랙 알림 (긴급 X) · 미루지 못함\n- 점심 후 졸림 — 토마토 1개 깨짐" />
                <LabeledBox label="Insights · 오늘의 패턴" valKey="pom_insights" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="- 오전 4토마토 = 최고 집중 / 오후 50% 효율\n- 회의 직후 토마토 시작은 어려움" />
            </div>
        </div>
    );
}

/* ─────────────────────── HabitTrackerGrid ─────────────────────── */

export function HabitTrackerGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const DEFAULT: HabitEntry[] = [
        { name: "", days: [false, false, false, false, false, false, false] },
        { name: "", days: [false, false, false, false, false, false, false] },
    ];
    const habits: HabitEntry[] = (() => {
        try {
            const p = data["ht_habits"] ? JSON.parse(data["ht_habits"]) : null;
            return Array.isArray(p) && p.length > 0 ? p.map((h: HabitEntry) => ({ ...h, days: (h.days || []).concat(Array(7).fill(false)).slice(0, 7) })) : DEFAULT;
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Week · 주차" valKey="ht_week" data={data} onChange={onChange} placeholder="예: 2026년 W17 (04-21~04-27)" />
                <LabeledInput label="Identity · 되고 싶은 사람" valKey="ht_identity" data={data} onChange={onChange} placeholder="예: 매일 글 쓰는 사람 / 건강한 30대" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">James Clear Atomic Habits</span> · 시스템 &gt; 목표.
                <span className="font-semibold"> 2분 룰</span>로 시작 (예: 30분 운동 → 운동복 입기). 빠진 날은 다음 날 무조건 복귀 — &quot;Never miss twice.&quot;
            </div>
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
                                                {d ? "✓" : ""}
                                            </button>
                                        </td>
                                    ))}
                                    <td className={`px-2 py-1 text-center font-mono font-bold ${done === 7 ? "text-slate-900" : done >= 4 ? "text-neutral-600" : "text-neutral-400"}`}>
                                        {done}/7
                                    </td>
                                    <td className="px-1 text-center">
                                        {habits.length > 1 && (
                                            <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-neutral-100 text-sm leading-none">×</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button onClick={add} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400">+ 습관 추가</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="What worked · 잘 된 것" valKey="ht_worked" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="예: 알람 5분 일찍 → 명상 7/7 / 식후 산책 5/7" />
                <LabeledBox label="What broke · 깨진 이유·재설계" valKey="ht_broke" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="예: 운동 4/7 — 퇴근 후 피로 → 다음 주 점심시간 변경" />
            </div>
        </div>
    );
}

/* ─────────────────────── EnergyMapGrid ─────────────────────── */

export function EnergyMapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
                <LabeledInput label="Date · 날짜" valKey="em_date" data={data} onChange={onChange} placeholder="2026-04-27" />
                <LabeledInput label="컨디션 메모" valKey="em_condition" data={data} onChange={onChange} placeholder="잠 6h · 운동 X · 커피 2잔" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">에너지 매핑</span> · 시간이 아니라 <span className="font-semibold">에너지가 자원</span>이다.
                1주일 트래킹하면 본인의 피크 패턴이 보임 → 가장 어려운 일을 피크에 배치, 단순 작업을 저점에. 5점 = 최고, 0 = 회복 필요.
            </div>
            <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200">
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
                            <span className="text-[8px] text-neutral-400 tabular-nums">{String(l.hour).padStart(2, "0")}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Peaks · 피크 시간 (4~5점)" valKey="em_peaks" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="예: 09~11시 · 15~16시 — 가장 어려운 일 배치" />
                <LabeledBox label="Lows · 저점 시간 (0~2점)" valKey="em_lows" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-700" placeholder="예: 14시·17시 — 행정·이메일·산책" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Boost · 에너지 올리는 것" valKey="em_boost" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="- 아침 산책 20분\n- 점심 후 짧은 낮잠\n- 동료와 짧은 대화" />
                <LabeledBox label="Drain · 에너지 빨리는 것" valKey="em_drain" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="- 알림 ON 상태로 메일 답장 30분\n- 점심 과식\n- 회의 연속 3개" />
            </div>
            <LabeledBox label="Patterns · 1주일 추적 후 발견" valKey="em_notes" data={data} onChange={onChange} placeholder="예: 화·목요일이 월·수보다 평균 1점 높음 — 운동 다음 날 효과 확인 / 회의 후 회복에 30분 필요" />
        </div>
    );
}

/* ─────────────────────── WeeklyReviewGrid ─────────────────────── */

export function WeeklyReviewGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Week · 주차" valKey="wr_week" data={data} onChange={onChange} placeholder="2026년 W17 · 04-21~04-27" />
                <LabeledInput label="컨디션 · 1~5" valKey="wr_condition" data={data} onChange={onChange} placeholder="평균 4 · 잠 6.5h · 운동 3회" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">David Allen GTD Weekly Review</span> · 한 주의 모든 열린 고리를 점검·정리.
                일요일 저녁 30~60분이 다음 주를 결정. <span className="font-semibold">Wins → Lessons → Blockers → Next</span>.
            </div>
            <LabeledBox label="Wins · 이번 주 승리" valKey="wr_wins" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-300" textColor="text-slate-900" placeholder={"- Q2 캠페인 1차 시안 완성\n- 신규 고객 미팅 2건\n- 매일 아침 6시 기상 유지"} />
            <LabeledBox label="Lessons · 배운 것" valKey="wr_lessons" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder={"- 시안 리뷰는 미팅보다 비동기 코멘트가 빠름\n- 회의 직전 15분 준비 = 회의 효율 2배"} />
            <LabeledBox label="Blockers · 장애물·미해결" valKey="wr_blockers" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-700" placeholder={"- 결제 API 재시도 큐 — 백엔드 일정 미정\n- 디자인팀 신규 멤버 온보딩 지연"} />
            <LabeledBox label="Next Week · 다음 주 의도·핵심" valKey="wr_next" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder={"한 단어: 정착\nTop 3:\n  1. 신규 고객 온보딩 마무리\n  2. 캠페인 본격 라이브\n  3. 재시도 큐 PR 리뷰\n습관: 매일 30분 산책"} />
        </div>
    );
}

/* ─────────────────────── WeeklyWinGrid ─────────────────────── */

export function WeeklyWinGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <LabeledInput label="Week · 주차" valKey="ww_week" data={data} onChange={onChange} placeholder="2026년 W17" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Win Journaling</span> · 성취 기록은 자기효능감의 누적.
                작은 것도 기록 — 나중에 어려운 시기에 꺼내볼 자산이 됨.
            </div>
            <div className="rounded-xl p-4 bg-neutral-50 border border-neutral-300">
                <p className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider text-center">이번 주 가장 큰 WIN</p>
                <textarea value={data["ww_biggest"] ?? ""} onChange={e => onChange("ww_biggest", e.target.value)}
                    placeholder='예: "신규 고객 첫 미팅에서 우리만의 차별점이 통한다는 확신을 얻었다."'
                    rows={3}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-medium p-3 rounded border border-neutral-200 focus:outline-none text-center leading-relaxed" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Work · 일에서의 성취" valKey="ww_work" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="- 시안 3안 완성·1안 채택\n- 발표 슬라이드 13장 → 5장으로 압축" />
                <LabeledBox label="Life · 삶에서의 성취" valKey="ww_life" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="- 가족과 새 메뉴 시도\n- 헬스 3회 / 5km 신기록" />
            </div>
            <LabeledBox label="Other Wins · 작은 승리들" valKey="ww_other" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder="자잘하지만 기록할 만한 것 — 새 카페 발견·책 1권 완독·새 자동화 1개 등" />
            <LabeledBox label="Celebrate · 어떻게 축하할까" valKey="ww_celebrate" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-700" placeholder="예: 토요일 저녁 좋은 식당 / 오랫동안 미뤄둔 책 1시간 / 좋아하는 음악 1시간 무엇도 안 하기" />
        </div>
    );
}

/* ─────────────────────── MonthlyThemeGrid ─────────────────────── */

export function MonthlyThemeGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Month · 월" valKey="mt_month" data={data} onChange={onChange} placeholder="2026년 5월" />
                <LabeledInput label="이전 달과의 연결" valKey="mt_prev" data={data} onChange={onChange} placeholder="4월 회고 핵심 1줄" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">CGP Grey Theme System</span> · 한 달 = 한 가지 정신.
                구체 목표가 아닌 <span className="font-semibold">방향성</span>으로 — &quot;운동 5kg&quot; 대신 &quot;몸을 챙기는 달&quot;. 부드럽지만 일관된다.
            </div>
            <div className="rounded-xl p-4 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider text-center">이번 달 테마 (한 단어 + 한 문장)</p>
                <textarea value={data["mt_theme"] ?? ""} onChange={e => onChange("mt_theme", e.target.value)}
                    placeholder='예: "정착의 달 — 4월에 시작한 것들을 안정화하고 시스템으로 만든다."'
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-medium p-3 rounded border border-slate-300 focus:outline-none text-center leading-relaxed" />
            </div>
            <LabeledBox label="Focus · 핵심 포커스 (3가지 이내)" valKey="mt_focus" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder={"1. 신규 고객 온보딩 표준화\n2. 결제 안정성 시스템\n3. 콘텐츠 채널 구독자 +1,000"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Wins · 기대하는 WIN" valKey="mt_wins" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="월말 자랑하고 싶은 것 1~3가지" />
                <LabeledBox label="Habits · 만들 습관" valKey="mt_habits" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder="- 매일 30분 운동\n- 매주 일요일 저녁 30분 주간 회고" />
            </div>
            <LabeledBox label="Reflection · 월말 회고 (다음 달에 작성)" valKey="mt_reflection" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder="테마대로 살았는가? 다음 달 테마는?" />
        </div>
    );
}

/* ─────────────────────── QuarterlyGrid ─────────────────────── */

export function QuarterlyGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Quarter · 분기" valKey="q_quarter" data={data} onChange={onChange} placeholder="2026 Q2 · 04~06" />
                <LabeledInput label="Year theme · 연간 테마와 연결" valKey="q_year_theme" data={data} onChange={onChange} placeholder="올해 테마: 정착·시스템화" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">90일 분기 플랜</span> · 1년은 너무 멀고 1주는 너무 짧다.
                90일 = <span className="font-semibold">의미 있는 변화가 일어나기 충분</span>한 시간. OKR·12-Week-Year의 단위.
            </div>
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">분기 목표 (Top 1~3 OKR)</p>
                <textarea value={data["q_goal"] ?? ""} onChange={e => onChange("q_goal", e.target.value)}
                    placeholder={"O: 1인 사업가 100명이 우리 플래너로 매주 일요일 회고를 한다\nKR1: 유료 가입 100명 (현재 12)\nKR2: 주 1회 이상 사용 비율 60% (현재 35%)\nKR3: NPS 50+ (현재 측정 X)"}
                    rows={5}
                    className="w-full mt-2 resize-none bg-white/70 text-xs p-2 rounded border border-slate-300 focus:outline-none leading-relaxed" />
            </div>
            <div className="grid md:grid-cols-3 gap-2">
                {[
                    { key: "q_m1", label: "Month 1 · 시작·셋업",      color: "bg-neutral-50 border-neutral-200",  text: "text-neutral-800",
                      ph: "포커스: 가입 플로우 단순화\n핵심: 결제 안정화·온보딩 v1" },
                    { key: "q_m2", label: "Month 2 · 가속·실험",      color: "bg-neutral-50 border-neutral-200",  text: "text-slate-900",
                      ph: "포커스: 채널 실험\nA/B: 카피 3안·인플 2명·뉴스레터 8편" },
                    { key: "q_m3", label: "Month 3 · 측정·다음 분기", color: "bg-neutral-50 border-neutral-200", text: "text-slate-800",
                      ph: "포커스: 회고·시스템화\n결과 측정·Q3 계획 수립" },
                ].map(m => (
                    <div key={m.key} className={`rounded-lg p-3 border ${m.color} min-h-32`}>
                        <p className={`text-xs font-bold ${m.text}`}>{m.label}</p>
                        <CellTextarea cellKey={m.key} value={data[m.key] ?? ""} onChange={onChange} placeholder={m.ph} />
                    </div>
                ))}
            </div>
            <LabeledBox label="Quarter Review · 분기 회고 (분기 종료 시)" valKey="q_review" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder="OKR 달성률 · 다음 분기 가져갈 교훈 · 버릴 가설" />
        </div>
    );
}

/* ─────────────────────── YearPlanGrid ─────────────────────── */

export function YearPlanGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Year · 연도" valKey="yr_year" data={data} onChange={onChange} placeholder="2026" />
                <LabeledInput label="Theme · 올해 테마 (한 단어 + 한 문장)" valKey="yr_theme" data={data} onChange={onChange} placeholder='예: "정착" — 작년에 시작한 것을 굳히는 해' />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">12개월 시즌 디자인</span> · 매 달이 똑같으면 1년이 지루.
                계절·일정·체력 곡선에 따라 <span className="font-semibold">시즌별 색깔</span>을 — 봄 시도·여름 가속·가을 수확·겨울 회복.
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                {MONTHS_LBL.map((lbl, i) => {
                    const quarter = Math.floor(i / 3);
                    const qColors = ["bg-neutral-50 border-neutral-200", "bg-neutral-50 border-neutral-200", "bg-neutral-50 border-neutral-200", "bg-neutral-50 border-neutral-200"];
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
            <LabeledBox label="Milestones · 핵심 마일스톤 (날짜 + 이정표)" valKey="yr_milestones" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder={"03-31: 시즌 1 출시\n06-30: 100명 베타 · NPS 50+\n09-30: 유료 200명 · 첫 흑자 월\n12-31: 시즌 2 종료 · 다음 해 계획"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Habits · 1년 동안 굳힐 습관" valKey="yr_habits" data={data} onChange={onChange} placeholder="- 매일 아침 6시 기상\n- 매주 일요일 주간 회고\n- 매달 1회 분기 점검" />
                <LabeledBox label="Anti-goals · 하지 않을 것" valKey="yr_anti" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="- SNS 알림 ON 상태로 일하기 X\n- 검증 없는 신규 시도 X" />
            </div>
        </div>
    );
}

/* ─────────────────────── FiveYearGrid ─────────────────────── */

export function FiveYearGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const steps = [
        { key: "fy_now", label: "Now · 현재",      badge: "0Y",  color: "bg-neutral-50 border-neutral-200", text: "text-neutral-600", strong: false },
        { key: "fy_y1",  label: "1년 후",           badge: "+1Y", color: "bg-neutral-50 border-neutral-200",    text: "text-slate-900",   strong: false },
        { key: "fy_y2",  label: "2년 후",           badge: "+2Y", color: "bg-neutral-50 border-neutral-200",    text: "text-slate-800",   strong: false },
        { key: "fy_y3",  label: "3년 후",           badge: "+3Y", color: "bg-neutral-50 border-neutral-200",    text: "text-slate-800",   strong: false },
        { key: "fy_y5",  label: "5년 후 · 비전",    badge: "+5Y", color: "bg-neutral-50 border-neutral-300",    text: "text-neutral-800",   strong: true  },
    ];
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">5년 비전 → 역산</span> · 5년 후 나(Now+5)에서 거꾸로 내려와 1년 후 무엇이 진실이어야 하는가.
                숫자보다 <span className="font-semibold">상태·정체성</span>으로 — &quot;매출 N억&quot; 보다 &quot;100명 사업가가 우리를 매주 쓴다&quot;.
            </div>
            <div className="space-y-1.5">
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
                            <CellTextarea cellKey={s.key} value={data[s.key] ?? ""} onChange={onChange}
                                placeholder={
                                    i === 0 ? "예: 1인 베타 운영 · 첫 12명 유료 · 월 매출 100만원" :
                                    i === 1 ? "예: 유료 200명 · 첫 흑자 월 · 채널 자동화 v1" :
                                    i === 2 ? "예: 1,000명 · 외부 코치 5명 합류 · 카테고리 1위 인지" :
                                    i === 3 ? "예: 5,000명 · 팀 8명 · 해외 시장 1개국 베타" :
                                    "예: \"한국 1인 사업가의 일·삶 운영 OS\" 카테고리 정의 · 10,000명+ 매주 사용 · 자기다움으로 돈 버는 사람들의 표준 도구"
                                } />
                        </div>
                    </div>
                ))}
            </div>
            <div className="rounded-lg p-3 bg-slate-50 border-2 border-slate-700">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">지켜야 할 원칙 — 5년 동안 타협 X</p>
                <CellTextarea cellKey="fy_principles" value={data["fy_principles"] ?? ""} onChange={onChange} placeholder={"- 사용자가 우리보다 우리 제품을 더 잘 알게 만들지 않는다 (단순함)\n- 짧은 호흡으로 큰 약속을 깨지 않는다\n- 팀 한 명 한 명의 성장이 회사 성장보다 빠르다"} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Worst case · 최악의 시나리오" valKey="fy_worst" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="실패해도 잃지 않을 것 · 회복 경로" />
                <LabeledBox label="Identity · 5년 후 정체성" valKey="fy_identity" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="나는 어떤 사람으로 불릴까? 어떤 평판이 되어 있을까?" />
            </div>
        </div>
    );
}

/* ─────────────────────── MovingAverageGrid ─────────────────────── */

export function MovingAverageGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">90-Day Experiment</p>
                <input type="text" value={data["ma_experiment"] ?? ""} onChange={e => onChange("ma_experiment", e.target.value)}
                    placeholder="예: '구독형 코칭 시범 90일 실험'"
                    className="w-full mt-2 px-2 py-1.5 text-sm font-bold bg-white/70 border border-slate-300 rounded focus:outline-none" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">90일 실험 (Brian Moran 12 Week Year)</span> · 기간을 짧게 해 긴급함을 만든다.
                가설·지표·목표를 처음부터 정의 — <span className="font-semibold">실패해도 학습</span>이 남게.
            </div>
            <LabeledBox label="Hypothesis · 가설" valKey="ma_hypothesis" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="예: 월 19만원 구독형 코칭을 1:1 30분 + 비동기 코멘트로 제공하면, 90일 안에 5명 유료 가입 + NPS 50+를 만들 수 있다." />
            <div className="grid md:grid-cols-3 gap-2">
                <LabeledBox label="Baseline · 시작점" valKey="ma_baseline" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-700" placeholder="현재: 구독 0명 · 1:1 컨설팅 월 2건 (60만원)" />
                <LabeledBox label="Metric · 측정 지표" valKey="ma_metric" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder="가입자 수 · 90일 유지율 · NPS" />
                <LabeledBox label="Target · 90일 목표" valKey="ma_target" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="5명 가입 · 80% 유지 · NPS 50+" />
            </div>
            <LabeledBox label="Check-ins · 30/60/90일 점검" valKey="ma_checkins" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder={"Day 30: 첫 2명 가입 · 시간 부족 호소 → 비동기 비중 ↑\nDay 60: 4명 / 1명 이탈 — 가격 부담\nDay 90: ___"} />
            <LabeledBox label="Result · 결과 + Decision" valKey="ma_result" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder={"예: 가입 4명 · 유지 75% · NPS 60 — 가격은 적정, 콘텐츠 깊이가 차별화\n결정: 본격 런칭 (시즌 2부터 정식 BM)"} />
        </div>
    );
}

/* ─────────────────────── ReversePlanGrid ─────────────────────── */

export function ReversePlanGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-300">
                <p className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider text-center">Goal · 최종 목표</p>
                <textarea value={data["rp_goal"] ?? ""} onChange={e => onChange("rp_goal", e.target.value)}
                    placeholder='예: "Q3 종료 시점에 유료 가입자 200명 확보"'
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/70 text-sm font-bold p-2 rounded border border-neutral-200 focus:outline-none text-center leading-relaxed" />
                <input type="text" value={data["rp_deadline"] ?? ""} onChange={e => onChange("rp_deadline", e.target.value)}
                    placeholder="마감일 — 2026-09-30"
                    className="w-full mt-2 px-2 py-1 text-xs text-center bg-white/60 border border-neutral-200 rounded focus:outline-none" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Backwards Planning (NASA)</span> · 미래에서 현재로 거꾸로.
                마감에서 출발해 <span className="font-semibold">&quot;그러려면 그 전에 무엇이 진실이어야 하는가?&quot;</span> 반복. 종착 → 중간 → 시작.
            </div>
            <div className="relative pl-8">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-400" />
                <div className="space-y-2">
                    <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200 relative">
                        <div className="absolute -left-[18px] top-4 w-3 h-3 rounded-full bg-slate-700 border-2 border-white" />
                        <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Milestones · 거꾸로 마일스톤</p>
                        <CellTextarea cellKey="rp_milestones" value={data["rp_milestones"] ?? ""} onChange={onChange} placeholder={"마감 1주 전 (09-23): 200명 안정 운영 — 자동 온보딩·결제 안정\n1개월 전 (08-30): 150명 — 주력 채널 고도화\n3개월 전 (06-30): 50명 — 가설 검증 마무리\n오늘 (04-27): 가입 12명 — 첫 50명 채널·가격 가설 정립"} />
                    </div>
                    <div className="rounded-lg p-3 bg-slate-50 border-2 border-slate-700 relative">
                        <div className="absolute -left-[18px] top-4 w-3 h-3 rounded-full bg-slate-900 border-2 border-white" />
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Today · 이번 주 시작할 일</p>
                        <CellTextarea cellKey="rp_now" value={data["rp_now"] ?? ""} onChange={onChange} placeholder="예: 첫 50명 채널 가설 3개 작성 + 1주 내 인터뷰 5명" />
                    </div>
                </div>
            </div>
            <LabeledBox label="Risks · 가장 큰 장애물 + 대응" valKey="rp_risks" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder={"- 채널 효율 저조 → 6주차 점검 후 피벗 / 6/15까지 새 가설\n- 가격 저항 → 등급제 도입 옵션"} />
        </div>
    );
}

/* ─────────────────────── SprintGrid ─────────────────────── */

export function SprintGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-3 gap-2">
                <LabeledInput label="Sprint #" valKey="sp_number" data={data} onChange={onChange} placeholder="W17·#25" />
                <LabeledInput label="Start · 시작일" valKey="sp_start" data={data} onChange={onChange} placeholder="2026-04-21" />
                <LabeledInput label="End · 종료일" valKey="sp_end" data={data} onChange={onChange} placeholder="2026-05-04 (2주)" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Sprint (Scrum/Shape Up)</span> · 1~4주의 시간 박스 안에 한 가지 의미 있는 산출물.
                <span className="font-semibold"> Goal &gt; Backlog</span> — 목표가 없으면 단순 To-do. Stretch는 진짜 여유 있을 때만.
            </div>
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-400">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Sprint Goal · 한 문장</p>
                <p className="text-[10px] text-neutral-500">스프린트 끝에 자랑할 결과물 — 시연 가능한 단위</p>
                <textarea value={data["sp_goal"] ?? ""} onChange={e => onChange("sp_goal", e.target.value)}
                    placeholder='예: "구독형 코칭 시범 페이지 + 결제 + 첫 5명 가입 처리까지 완성"'
                    rows={2}
                    className="w-full mt-1 resize-none bg-white/70 text-sm font-semibold p-2 rounded border border-slate-300 focus:outline-none leading-relaxed" />
            </div>
            <LabeledBox label="Commitments · 끝낼 것 (체크박스)" valKey="sp_commitments" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder={"- [ ] 시범 페이지 디자인 시안 1안\n- [ ] 결제 플로우 구현\n- [ ] 첫 5명 가입·온보딩 가이드"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Stretch · 여유 있으면" valKey="sp_stretch" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="- [ ] A/B 테스트 셋업\n- [ ] 리퍼럴 코드 v1" />
                <LabeledBox label="Risks · 위험 + 대응" valKey="sp_risks" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="- PG 연동 일정 불확실 → 4/30까지 대안 결정\n- 디자이너 휴가 (5/2~5/4) — 미리 시안 확정" />
            </div>
            <LabeledBox label="Retro · 스프린트 회고 (종료 시 작성)" valKey="sp_retro" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder={"잘 됨: 결제 플로우 예상보다 빨리 완성\n안 됨: 디자인 시안 2회 리뷰 → 1회로 줄일 방법\n바꿀 것: 스프린트 시작 시 디자이너와 우선순위 합의 강화"} />
        </div>
    );
}
