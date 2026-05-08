"use client";

import { CellTextarea, type FrameworkData } from "./_shared";
import { LabeledInput, LabeledBox } from "./meeting";

export type BsIdea = { text: string; starred?: boolean };

export function BrainstormGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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

    const total = ensureMin.filter(i => i.text.trim()).length;
    const starred = ensureMin.filter(i => i.starred).length;
    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 집계 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="주제 · Topic" valKey="bs_topic" data={data} onChange={onChange} placeholder="예: 1인 사업자가 우리 플래너를 더 자주 쓰게 하려면?" />
                <div className="flex items-end gap-3">
                    <div>
                        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">총 아이디어</p>
                        <p className="text-xl font-bold text-neutral-700">{total}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">★ 선정</p>
                        <p className="text-xl font-bold text-amber-600">{starred}</p>
                    </div>
                </div>
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Brainstorming 룰</span> · ① 양 &gt; 질 (목표 30개+) ② 평가 금지 (다 적은 후 한 번에) ③ 다른 아이디어 위에 쌓기 ④ 엉뚱할수록 OK.
                별표는 평가 단계에서만 — 처음엔 다 받아 적기.
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 py-2 border-b border-neutral-100">Ideas · 떠오르는 대로 (★로 좋은 것 마킹)</p>
                <div className="divide-y divide-neutral-100">
                    {ensureMin.map((idea, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                            <button onClick={() => toggleStar(i)} className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-base ${idea.starred ? "text-amber-500" : "text-neutral-300 hover:text-amber-400"}`}>
                                ★
                            </button>
                            <input type="text" value={idea.text} onChange={e => update(i, { text: e.target.value })}
                                placeholder={i === 0 ? "예: 일요일 저녁 자동 주간 브리핑" : i === 1 ? "예: 동료 추천 시 양쪽에 1개월 무료" : "아이디어…"}
                                className="flex-1 px-1 py-1 text-xs bg-transparent border-b border-transparent focus:outline-none focus:border-neutral-300" />
                            {ensureMin.length > 1 && (
                                <button onClick={() => remove(i)} className="w-5 h-5 rounded text-neutral-300 hover:text-slate-700 hover:bg-neutral-100 text-sm leading-none">×</button>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={add} className="w-full py-2 border-t border-neutral-100 text-xs text-neutral-400 hover:bg-neutral-50 hover:text-[#6366F1]">+ 아이디어 추가</button>
            </div>

            <LabeledBox label="Criteria · 선정 기준" valKey="bs_criteria" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder={"예: 1주 내 시범 가능 / 외부 자원 X / 핵심 가치 강화"} />
            <LabeledBox label="Chosen · 최종 선택 (Top 1~3)" valKey="bs_chosen" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-300" textColor="text-slate-900" placeholder={"1. 자동 주간 브리핑 (개발 1주)\n2. 동료 추천 보상 (실험 2주)"} />
            <LabeledBox label="Next · 누가·언제·어떻게 시작" valKey="bs_next" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder="예: [홍길동] 자동 브리핑 와이어프레임 — 4/30까지" />
        </div>
    );
}

export function DecisionLogGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const reversibility = data["dl_reversibility"] ?? "";
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-2">
                <LabeledInput label="결정 일자" valKey="dl_date" data={data} onChange={onChange} placeholder="2026-04-27" />
                <LabeledInput label="결정자·승인자" valKey="dl_decider" data={data} onChange={onChange} placeholder="홍길동(대표) · 합의" />
                <LabeledInput label="검토 일정" valKey="dl_review_date" data={data} onChange={onChange} placeholder="3개월 후 · 2026-07-27" />
            </div>

            {/* Reversibility — Bezos Type 1 / Type 2 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Reversibility · 되돌릴 수 있는가? (Bezos)</p>
                <p className="text-[10px] text-neutral-500 mb-2">Type 1 (되돌리기 어려움) — 신중·다각 검토 / Type 2 (되돌리기 쉬움) — 빠르게 결정·실행</p>
                <div className="flex gap-2">
                    {[
                        { val: "type1", label: "Type 1 · 일방통행 문 (Irreversible)" },
                        { val: "type2", label: "Type 2 · 양방향 문 (Reversible)" },
                    ].map(opt => (
                        <button key={opt.val} onClick={() => onChange("dl_reversibility", opt.val)}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${reversibility === opt.val ? "bg-slate-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Decision Log</span> · 미래의 자신·후임자에게 보내는 편지.
                결과만 기록하면 무용 — <span className="font-semibold">결정 시점의 정보·가정·대안</span>까지 적어야 사후 학습 가능. 검토 일정 잡고 Actual 채우는 게 핵심.
            </div>

            <LabeledBox label="Decision · 결정 내용 (한 문장)" valKey="dl_decision" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-300" textColor="text-slate-900" placeholder="예: Q3에 모바일 앱 신규 개발 대신 기존 웹 PWA 강화에 집중한다." />
            <LabeledBox label="Context · 배경·맥락 (왜 결정해야 했나)" valKey="dl_context" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder="예: 사용자 60%가 데스크톱 / 모바일 개발 인력 0 / Q4에 펀딩 예정 — 리소스 우선순위 충돌" />
            <LabeledBox label="Assumptions · 전제·가정 (틀릴 수 있는 것)" valKey="dl_assumptions" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="- 모바일 사용자 비율은 6개월 내 60% 유지\n- PWA가 네이티브 앱과 경험 차이 작다\n- Q4 펀딩 성공 가능성 70%" />
            <LabeledBox label="Alternatives · 대안·기각 이유" valKey="dl_alternatives" data={data} onChange={onChange} color="bg-neutral-100 border-neutral-300" textColor="text-neutral-700" placeholder={"A) 네이티브 앱 동시 개발 — 인력 부족\nB) 외주 — 통제력 ↓ + 비용 부담\nC) 6개월 후로 미루기 — 시장 변화 리스크"} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Expected · 기대 결과" valKey="dl_expected" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder="예: PWA 완성 후 모바일 사용 +30% / 개발 비용 60% 절감 / Q4 펀딩 시 모바일 앱 본격 시작" />
                <LabeledBox label="Actual · 실제 결과 (검토 시 작성)" valKey="dl_actual" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="3개월 후 채우기 — 가설 vs 실제 격차 분석" />
            </div>

            <LabeledBox label="Lesson · 배운 것 (사후)" valKey="dl_lesson" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder="예: PWA 채택은 옳았으나, 모바일 알림 빠짐이 예상보다 큰 페인이었음 → 다음 결정 시 알림 인프라 우선 검토" />
        </div>
    );
}

export function EmotionLogGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const MOODS = ["기쁨", "평온", "감사", "설렘", "피곤", "불안", "짜증", "분노", "슬픔", "외로움"];
    const intensity = parseInt(data["emo_intensity"] ?? "3", 10);
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
                <LabeledInput label="Date · 일시" valKey="emo_date" data={data} onChange={onChange} placeholder="2026-04-27 14:30" />
                <LabeledInput label="장소·맥락" valKey="emo_context" data={data} onChange={onChange} placeholder="회의 직후 · 집·카페" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">CBT 인지행동치료식 감정일지</span> · 사건 → 감정 → 신체 신호 → 자동적 사고 → 다시 보기.
                감정에 <span className="font-semibold">이름 붙이기</span>가 첫 단계 — 모호한 &quot;안 좋다&quot; → 구체 &quot;무력감·좌절&quot;.
            </div>

            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-2">Mood · 오늘의 감정 (복수 선택 가능)</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {MOODS.map(m => {
                        const selected = (data["emo_mood"] ?? "").split(",").filter(Boolean).includes(m);
                        return (
                            <button key={m} onClick={() => {
                                const cur = (data["emo_mood"] ?? "").split(",").filter(Boolean);
                                const next = selected ? cur.filter(x => x !== m) : [...cur, m];
                                onChange("emo_mood", next.join(","));
                            }}
                                className={`px-3 py-1.5 rounded-full text-xs transition-all ${selected ? "bg-slate-900 text-white font-semibold" : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}>
                                {m}
                            </button>
                        );
                    })}
                </div>
                <div>
                    <p className="text-[10px] text-neutral-500 mb-1">Intensity · 강도 (1=미미 · 5=압도적)</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => onChange("emo_intensity", String(n))}
                                className={`flex-1 py-1.5 text-xs rounded ${intensity >= n ? "bg-slate-900 text-white font-bold" : "bg-white border border-neutral-200 text-neutral-400"}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <LabeledBox label="Trigger · 계기 (사실만)" valKey="emo_trigger" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="예: 회의에서 내 제안이 받아들여지지 않음 · 어머니 전화 못 받음" />
            <LabeledBox label="Body · 몸의 신호" valKey="emo_body" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="예: 어깨가 무겁다 · 가슴 두근 · 속이 답답 · 손이 차가워짐" />
            <LabeledBox label="Thought · 자동적 사고" valKey="emo_thought" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder='예: "역시 나는 부족해" / "팀에서 나만 뒤처져" / "이러다 잘릴 것 같아"' />
            <LabeledBox label="Reframe · 다시 본다면" valKey="emo_reflection" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder={"예: 한 번의 거절이 나를 정의하진 않는다. 다음 미팅에서 보강해 다시 제안하면 된다."} />

            {/* Pattern over time */}
            <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Pattern · 같은 감정 반복?</p>
                <p className="text-[10px] text-neutral-500 mb-1">최근에 같은 트리거·감정이 반복되는지 — 일지 누적 후 발견</p>
                <CellTextarea cellKey="emo_pattern" value={data["emo_pattern"] ?? ""} onChange={onChange} placeholder="예: 매주 월요일 회의 후 같은 무력감 — 발표 준비 부족이 진짜 원인일 수도" />
            </div>
        </div>
    );
}

export function GratitudeGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const SLOTS = [
        { n: 1, hint: "사람 — 누구 덕분에 좋았나" },
        { n: 2, hint: "사건 — 어떤 일이 좋았나" },
        { n: 3, hint: "나 자신 — 무엇을 잘했나" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 가이드 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <LabeledInput label="Date · 날짜" valKey="grat_date" data={data} onChange={onChange} placeholder="2026-04-27" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Three Good Things (Seligman)</span> · 매일 3가지를 <span className="font-semibold">왜 좋았는지</span>까지 적으면 6개월 후 우울감 ↓·행복감 ↑ 입증.
                구체적·일상적인 것이 더 효과적 — &quot;커피가 맛있었다&quot;가 &quot;인생 전체&quot;보다 강력.
            </div>

            <div className="rounded-xl p-4 bg-neutral-50 border border-neutral-200">
                <p className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider text-center mb-3">오늘 감사한 일 세 가지 — 왜 그것이 좋았는가까지</p>
                <div className="space-y-2">
                    {SLOTS.map(s => (
                        <div key={s.n} className="flex items-start gap-2">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold mt-1">{s.n}</div>
                            <div className="flex-1">
                                <p className="text-[10px] text-neutral-500 mb-0.5">{s.hint}</p>
                                <textarea value={data[`grat_${s.n}`] ?? ""} onChange={e => onChange(`grat_${s.n}`, e.target.value)}
                                    placeholder={s.n === 1 ? '예: 동료 김OO가 마감 직전 도와줘서 끝낼 수 있었음 — 평소 빚지고 있다고 느꼈는데 진심으로 도움을 받음.' : s.n === 2 ? '예: 점심에 햇볕 받으며 혼자 산책 — 머리가 비워져 오후 집중도 ↑.' : '예: 어려운 거절 메일을 미루지 않고 바로 보냄 — 평소 회피하던 패턴을 깸.'}
                                    rows={2}
                                    className="w-full resize-none bg-white/60 text-xs p-2 rounded border border-neutral-200 focus:outline-none focus:border-slate-700 leading-relaxed" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Highlight · 오늘의 하이라이트 (한 장면)" valKey="grat_highlight" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="예: 저녁에 가족과 같이 새 메뉴 시도하며 웃음" />
                <LabeledBox label="Tomorrow · 내일 기대하는 것" valKey="grat_tomorrow" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder="예: 새 책 시작 / 산책 코스 신규 시도" />
            </div>

            {/* Letter */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-900">Gratitude Letter (선택) · 누군가에게 한 줄 감사</p>
                <p className="text-[10px] text-neutral-500 mb-1">실제 보낼 수도, 자기에게만 쓸 수도. 보내는 사람 효과가 더 크다는 연구 多.</p>
                <CellTextarea cellKey="grat_letter" value={data["grat_letter"] ?? ""} onChange={onChange} placeholder='예: "지난주 발표 피드백, 진심으로 고마워. 너 덕분에 제안서 톤이 완전히 달라졌어."' />
            </div>
        </div>
    );
}

export function ReadingGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const rating = parseInt(data["read_rating"] ?? "0", 10);
    return (
        <div className="my-2 space-y-2">
            {/* 책 정보 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex gap-3 items-start">
                    <div className="shrink-0 w-12 h-16 bg-white border border-neutral-300 rounded flex items-center justify-center text-xl text-neutral-400 font-bold">B</div>
                    <div className="flex-1 space-y-1.5">
                        <input type="text" value={data["read_title"] ?? ""} onChange={e => onChange("read_title", e.target.value)}
                            placeholder="책·아티클 제목 (예: 아주 작은 습관의 힘)"
                            className="w-full px-2 py-1 text-sm font-bold bg-white/70 border border-neutral-200 rounded focus:outline-none focus:border-slate-700" />
                        <div className="grid grid-cols-3 gap-1.5">
                            <input type="text" value={data["read_author"] ?? ""} onChange={e => onChange("read_author", e.target.value)}
                                placeholder="저자 (예: 제임스 클리어)"
                                className="px-2 py-1 text-xs bg-white/70 border border-neutral-200 rounded focus:outline-none" />
                            <input type="text" value={data["read_genre"] ?? ""} onChange={e => onChange("read_genre", e.target.value)}
                                placeholder="장르 (자기계발·소설…)"
                                className="px-2 py-1 text-xs bg-white/70 border border-neutral-200 rounded focus:outline-none" />
                            <input type="text" value={data["read_date"] ?? ""} onChange={e => onChange("read_date", e.target.value)}
                                placeholder="완독일 2026-04-27"
                                className="px-2 py-1 text-xs bg-white/70 border border-neutral-200 rounded focus:outline-none" />
                        </div>
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-neutral-500 mr-1">평점</span>
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => onChange("read_rating", String(n === rating ? 0 : n))}
                                    className={`text-base ${rating >= n ? "text-amber-500" : "text-neutral-300 hover:text-neutral-400"}`}>
                                    ★
                                </button>
                            ))}
                            <span className="text-[10px] text-neutral-400 ml-1">{rating || "-"} / 5</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Active Reading</span> · 읽기는 끝이 아니라 시작.
                Highlights는 인용 그대로, Takeaways는 자기 말로 재진술 — <span className="font-semibold">자기 말로 못 쓰면 안 읽은 것</span>.
                Action 1개 = 책값을 회수하는 가장 빠른 방법.
            </div>

            <LabeledBox label="Why · 왜 이 책을 읽었나" valKey="read_why" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder="예: 새 습관 만들기에 계속 실패해서 시스템적 접근을 배우려고" />
            <LabeledBox label="Summary · 한 줄 요약 (자기 말로)" valKey="read_summary" data={data} onChange={onChange} placeholder="예: 목표가 아니라 시스템(정체성→과정→결과)을 바꿔라. 1% 개선을 매일 쌓으면 1년에 37배." />
            <LabeledBox label="Highlights · 밑줄 친 문장 (인용 그대로)" valKey="read_highlights" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder={'"매일 1%씩 나아지면 1년 후 37배 좋아진다."\n"습관은 정체성에 기반할 때 지속된다."'} />
            <LabeledBox label="Takeaways · 핵심 교훈 3가지 (자기 말로)" valKey="read_takeaways" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder={"1. 결과가 아니라 시스템을 바꿔라\n2. 정체성 기반 습관(\"나는 글 쓰는 사람\")\n3. 환경 디자인이 의지력보다 강하다"} />
            <LabeledBox label="Action · 이번 주 실천 1개" valKey="read_action" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder="예: 책상에 노트 펼쳐두기 (트리거 환경 디자인) → 매일 5분 글쓰기 시도" />
            <LabeledBox label="Connect · 다른 책·아이디어와 연결" valKey="read_connect" data={data} onChange={onChange} placeholder="예: Cal Newport Deep Work와 연결 — 환경 디자인이 집중력에도 작동" />
        </div>
    );
}

export function StandupGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const cells = [
        { key: "su_yesterday", label: "Yesterday · 어제 한 일",         hint: "결과·완성한 것 위주 (시간 X)",  color: "bg-neutral-50 border-neutral-200", text: "text-neutral-700",
          ph: "- Q2 캠페인 광고 카피 3안 완성\n- 디자인팀과 시안 리뷰 1회\n- 결제 API 버그 1건 수정" },
        { key: "su_today",     label: "Today · 오늘 할 일",            hint: "Top 1~3 — 오늘 끝낼 수 있는 단위", color: "bg-neutral-50 border-neutral-200",      text: "text-slate-900",
          ph: "- 카피 A/B 테스트 셋업\n- 클라 미팅 자료 초안\n- 1on1 (오후 2시)" },
        { key: "su_blockers",  label: "Blockers · 장애물·도움 필요", hint: "혼자 못 푸는 것만 — 빠르게 핸드오프", color: "bg-neutral-50 border-neutral-200",      text: "text-neutral-700",
          ph: "- 광고 예산 승인 대기 (대표) → 11시 전 확인 필요\n- 데이터 권한 → 데브옵스 도움" },
    ];
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Date" valKey="su_date" data={data} onChange={onChange} placeholder="2026-04-27 (월) 9:00" />
                <LabeledInput label="Team·Project" valKey="su_team" data={data} onChange={onChange} placeholder="플래너스 코어 / Q2 캠페인" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Daily Standup 룰</span> · 15분 이하·서서·전원 한 사람당 1~2분.
                상태 보고 X, <span className="font-semibold">동기화·블로커 해소</span>가 목적. 깊은 논의는 끝나고 따로.
            </div>

            <div className="grid md:grid-cols-3 gap-2">
                {cells.map(c => (
                    <div key={c.key} className={`rounded-lg p-3 border ${c.color} min-h-40`}>
                        <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                        <p className="text-[10px] text-neutral-500 mb-1">{c.hint}</p>
                        <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder={c.ph} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function WeeklyJournalGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 메타 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledInput label="Week · 주차" valKey="wj_week" data={data} onChange={onChange} placeholder="2026년 W17 · 04-21~04-27" />
                <LabeledInput label="이번 주 한 단어" valKey="wj_word" data={data} onChange={onChange} placeholder="예: 회복 / 도약 / 정리 / 시도" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">주간 저널</span> · 일간 일지가 영양소라면 주간 저널은 식단.
                일·관계·건강·내면 4축으로 나눠 쓰면 균형이 보임. <span className="font-semibold">감정 → 사실 → 의미</span> 순서로.
            </div>

            <LabeledBox label="Events · 이번 주 있었던 일 (사실)" valKey="wj_events" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder={"- 월: Q2 캠페인 킥오프\n- 화·수: 첫 발표 준비\n- 목: 발표 — 예상보다 호응 ↑\n- 금: 다음 단계 합의\n- 주말: 가족 모임"} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Wins · 잘 된 것" valKey="wj_wins" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder="- 발표 후 첫 클라이언트 미팅 따냄\n- 매일 6시 기상 유지" />
                <LabeledBox label="Lessons · 배운 것" valKey="wj_lessons" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="- 발표 슬라이드는 3장이 5장보다 강력\n- 회의 직후 저장하는 메모가 진짜 자산" />
            </div>

            <LabeledBox label="Feelings · 느낀 감정 (구체 단어로)" valKey="wj_feelings" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="예: 화요일 불안 → 목요일 안도감 / 금요일에는 자부심 + 약간의 공허" />

            <LabeledBox label="Relationships · 관계" valKey="wj_relationships" data={data} onChange={onChange} placeholder="누구와 깊은 대화? 누구를 더 만나고 싶은가? 갈등이 있었다면?" />

            <LabeledBox label="Insights · 인사이트·깨달음" valKey="wj_insights" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder='예: "준비 부족" 두려움이 사실은 "완벽하지 않은 모습 노출" 두려움이었다' />

            <LabeledBox label="Next Week Intention · 다음 주 의도" valKey="wj_next" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder={"한 단어: 정착\n핵심: 새 클라이언트 온보딩 \n습관: 매일 30분 운동 회복\n관계: 동료 김OO에게 점심 먼저 제안"} />
        </div>
    );
}

export function ZettelkastenGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    const TYPES = [
        { val: "fleeting",   label: "Fleeting · 즉흥 메모" },
        { val: "literature", label: "Literature · 출처 메모" },
        { val: "permanent",  label: "Permanent · 영속 메모" },
    ];
    const type = data["zet_type"] ?? "permanent";
    return (
        <div className="my-2 space-y-2">
            {/* 메타 카드 */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                    <div className="shrink-0 w-24">
                        <p className="text-[9px] text-neutral-500 font-semibold">ZETTEL ID</p>
                        <input type="text" value={data["zet_id"] ?? ""} onChange={e => onChange("zet_id", e.target.value)}
                            placeholder="202604271"
                            className="w-full mt-0.5 px-1 py-1 text-xs font-mono bg-white border border-neutral-200 rounded focus:outline-none" />
                    </div>
                    <div>
                        <p className="text-[9px] text-neutral-500 font-semibold">TITLE — 한 줄 제목 = 한 아이디어</p>
                        <input type="text" value={data["zet_title"] ?? ""} onChange={e => onChange("zet_title", e.target.value)}
                            placeholder="예: 환경 디자인이 의지력보다 강하다 (Atomic Habits)"
                            className="w-full mt-0.5 px-2 py-1 text-sm font-semibold bg-white border border-neutral-200 rounded focus:outline-none" />
                    </div>
                </div>
                {/* Type 토글 */}
                <div className="mt-2 flex gap-1.5">
                    {TYPES.map(t => (
                        <button key={t.val} onClick={() => onChange("zet_type", t.val)}
                            className={`flex-1 px-2 py-1.5 rounded text-[10px] font-semibold transition-all ${type === t.val ? "bg-slate-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Niklas Luhmann Zettelkasten</span> · 한 카드 = 한 원자 아이디어, 자기 말로.
                <span className="font-semibold"> 연결이 핵심</span> — 새 카드 만들 때 기존 카드와 link 1개+ 강제. 1년 누적되면 &quot;책이 저절로 써지는&quot; 시스템.
            </div>

            <LabeledBox label="Content · 내용 (자신의 언어, 문장 단위)" valKey="zet_content" data={data} onChange={onChange} placeholder={"환경이 행동을 결정한다. 책상 위에 펼쳐진 노트는 \"쓸 것\"이라는 신호. 휴대폰을 다른 방에 두면 의지력 없이도 집중이 시작된다.\n\n→ 핵심: 의지력은 유한한 자원. 환경 설계로 결정의 횟수 자체를 줄여야 한다."} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LabeledBox label="Source · 출처" valKey="zet_source" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-800" placeholder="제임스 클리어, 「아주 작은 습관의 힘」 6장 · p.142" />
                <LabeledBox label="Tags · 태그" valKey="zet_tags" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-800" placeholder="#habit #environment-design #willpower" />
            </div>

            <LabeledBox label="Links · 연결된 Zettel (반드시 1개+)" valKey="zet_links" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-slate-900" placeholder={"[[202604111-cal-newport-deep-work]] — 환경 격리로 집중 시간 ↑\n[[202602231-decision-fatigue]] — 결정 횟수가 의지력 고갈\n[[202603151-implementation-intentions]] — 환경 + 트리거 결합"} />

            <LabeledBox label="So what · 이 아이디어의 의미·내가 쓰는 곳" valKey="zet_sowhat" data={data} onChange={onChange} placeholder="플래너 앱 UX에 적용 — 매일 첫 화면에 1개 액션만 자동 노출(환경 신호)" />
        </div>
    );
}

export function MindmapGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
    return (
        <div className="my-2 space-y-2">
            {/* 메타 + 중심 */}
            <div className="rounded-xl p-3 bg-slate-100 border-2 border-slate-400 text-center">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Central Topic · 중심 주제</p>
                <input type="text" value={data["mind_central"] ?? ""} onChange={e => onChange("mind_central", e.target.value)}
                    placeholder="예: 1인 사업가 매출 100만원 → 500만원"
                    className="w-full mt-2 px-3 py-2 text-base font-bold text-center bg-white/70 border border-slate-300 rounded focus:outline-none" />
            </div>

            {/* 가이드 */}
            <div className="rounded-lg px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                💡 <span className="font-semibold">Tony Buzan Mind Map</span> · 중심 → 1차 가지(BOI: Basic Ordering Idea) 5~7개 → 하위 자유 확장.
                <span className="font-semibold"> 키워드 위주</span>, 문장 X. 자유 캔버스(Canvas 메뉴)에서 그림으로도 가능.
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 py-2 border-b border-neutral-100">Outline · 계층 구조 (Tab/Space로 들여쓰기)</p>
                <textarea value={data["mind_outline"] ?? ""} onChange={e => onChange("mind_outline", e.target.value)}
                    placeholder={"- 제품·서비스\n  - 기존 강의 패키지화\n  - 1:1 컨설팅 단가 ↑\n  - 구독형 코칭 (월 5명)\n- 채널\n  - 인스타·유튜브\n  - 뉴스레터\n  - 추천·리퍼럴\n- 가격·BM\n  - 프리미엄 라인\n  - 묶음 할인\n- 운영·자동화\n  - 결제·예약 자동화\n  - 콘텐츠 캘린더\n  - AI 어시스턴트\n- 학습·역량\n  - 카피라이팅\n  - 마케팅 분석"}
                    rows={16}
                    className="w-full resize-none px-3 py-2 text-xs font-mono placeholder:text-neutral-300 focus:outline-none leading-relaxed" />
            </div>

            <LabeledBox label="Top 3 가지 · 다음 액션" valKey="mind_top" data={data} onChange={onChange} color="bg-neutral-50 border-neutral-200" textColor="text-neutral-900" placeholder={"1. 구독형 코칭 시범 5명 (5월) — 가설 검증\n2. 인스타 콘텐츠 주 3편 (꾸준함)\n3. 결제·예약 자동화 v1 (6월)"} />
        </div>
    );
}
