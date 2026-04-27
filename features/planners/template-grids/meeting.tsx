"use client";

import { CellTextarea, type FrameworkData } from "./_shared";

export function LabeledInput({ label, valKey, data, onChange, placeholder, type = "text" }: {
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

export function LabeledBox({ label, sub, valKey, data, onChange, placeholder, color = "bg-neutral-50 border-neutral-200", textColor = "text-neutral-700" }: {
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

export function OneOnOneGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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

export function MeetingGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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

export function InterviewGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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

export function AarGrid({ data, onChange }: { data: FrameworkData; onChange: (key: string, val: string) => void }) {
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
