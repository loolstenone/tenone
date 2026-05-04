// Shared template utilities — used by TemplatesView, DailyView, ProjectNotesTab

export interface TemplateMeta {
    id: string;
    key: string;
    label: string;
    body_md: string;
}

type FrameworkData = Record<string, string>;

const LABEL_MAP: Record<string, string> = {
    // BCG
    star: "⭐ Star", question: "❓ Question Mark", cow: "🐄 Cash Cow", dog: "🐕 Dog",
    // SWOT
    s: "S — Strengths", w: "W — Weaknesses", o: "O — Opportunities", t: "T — Threats",
    // 4P
    product: "Product", price: "Price", place: "Place", promotion: "Promotion",
    // Ansoff
    penetration: "시장 침투", product_dev: "제품 개발", market_dev: "시장 개발", diversification: "다각화",
    // Empathy Map
    says: "Say — 말하는 것", thinks: "Think — 생각하는 것", feels: "Feel — 느끼는 것",
    does: "Do — 행동하는 것", pains: "Pain — 고통", gains: "Gain — 이득",
    // Lean Canvas
    problem: "Problem — 문제", existing_alternatives: "Existing Alternatives — 기존 대안",
    solution: "Solution — 솔루션", key_metrics: "Key Metrics — 핵심 지표",
    uvp: "Unique Value Proposition — 고유 가치 제안", high_level_concept: "High-Level Concept — 고수준 개념",
    unfair_advantage: "Unfair Advantage — 경쟁 우위", channels: "Channels — 채널",
    customer_segments: "Customer Segments — 고객 세그먼트", early_adopters: "Early Adopters — 초기 사용자",
    cost_structure: "Cost Structure — 비용 구조", revenue_streams: "Revenue Streams — 수익 흐름",
    // Mandalart
    goal: "핵심 목표",
    t0: "테마 1", t1: "테마 2", t2: "테마 3", t3: "테마 4",
    t4: "테마 5", t5: "테마 6", t6: "테마 7", t7: "테마 8",
    // Eisenhower
    do_now: "Do — 긴급 × 중요 (즉시)",
    schedule_it: "Schedule — 비긴급 × 중요 (일정)",
    delegate: "Delegate — 긴급 × 비중요 (위임)",
    eliminate: "Eliminate — 비긴급 × 비중요 (제거)",
    // PEST
    political: "Political — 정치·법률", economic: "Economic — 경제",
    social: "Social — 사회·문화", technological: "Technological — 기술",
    // MoSCoW
    must: "Must have — 반드시", should: "Should have — 해야",
    could: "Could have — 있으면 좋음", wont: "Won't have — 이번엔 제외",
    // Quadrant (generic)
    q_axis_x: "X축", q_axis_y: "Y축",
    q1: "1사분면 (X+, Y+)", q2: "2사분면 (X−, Y+)",
    q3: "3사분면 (X−, Y−)", q4: "4사분면 (X+, Y−)",
    // Business Model Canvas (9 blocks)
    bmc_key_partners: "Key Partners — 핵심 파트너",
    bmc_key_activities: "Key Activities — 핵심 활동",
    bmc_key_resources: "Key Resources — 핵심 자원",
    bmc_value_propositions: "Value Propositions — 가치 제안",
    bmc_customer_relationships: "Customer Relationships — 고객 관계",
    bmc_channels: "Channels — 채널",
    bmc_customer_segments: "Customer Segments — 고객 세그먼트",
    bmc_cost_structure: "Cost Structure — 비용 구조",
    bmc_revenue_streams: "Revenue Streams — 수익 흐름",
    // Value Proposition Canvas
    vpc_products: "Products & Services — 제품·서비스",
    vpc_gain_creators: "Gain Creators — 이득 창출",
    vpc_pain_relievers: "Pain Relievers — 고통 해소",
    vpc_customer_jobs: "Customer Jobs — 고객 과업",
    vpc_gains: "Gains — 이득",
    vpc_pains: "Pains — 고통",
    // OKR
    okr_objective: "Objective — 목표",
    okr_kr1: "KR 1", okr_kr2: "KR 2", okr_kr3: "KR 3", okr_kr4: "KR 4", okr_kr5: "KR 5",
    okr_initiatives: "Initiatives — 실행 계획",
    // Persona
    persona_name: "이름",
    persona_age: "나이", persona_occupation: "직업", persona_location: "지역",
    persona_bio: "한줄 소개",
    persona_goals: "Goals — 목표",
    persona_frustrations: "Frustrations — 좌절·불만",
    persona_motivations: "Motivations — 동기",
    persona_behaviors: "Behaviors — 행동 패턴",
    persona_quote: "대표 발언 (Quote)",
    // Jobs-to-be-Done
    jtbd_situation: "Situation — 상황",
    jtbd_motivation: "Motivation — 동기",
    jtbd_outcome: "Expected Outcome — 기대 결과",
    jtbd_statement: "JTBD Statement — 한 문장 정의",
    jtbd_anxieties: "Anxieties — 불안 요소",
    jtbd_habits: "Habits — 기존 습관·대안",
    // RICE — items handled specially in export (rice_items JSON)
    rice_items: "RICE 우선순위 항목",
    // 5W1H
    who: "Who — 누가", what: "What — 무엇을", when: "When — 언제",
    where: "Where — 어디서", why: "Why — 왜", how: "How — 어떻게",
    // 5Why
    why_problem: "Problem — 문제",
    why_1: "Why 1", why_2: "Why 2", why_3: "Why 3", why_4: "Why 4", why_5: "Why 5",
    why_root: "Root Cause — 근본 원인",
    why_countermeasure: "Countermeasure — 대응책",
    // Ikigai
    ikigai_love: "What you LOVE — 좋아하는 것",
    ikigai_good: "What you're GOOD at — 잘하는 것",
    ikigai_needs: "What world NEEDS — 세상이 필요로 하는 것",
    ikigai_paid: "What you can be PAID for — 돈이 되는 것",
    ikigai_passion: "Passion — 열정",
    ikigai_mission: "Mission — 사명",
    ikigai_vocation: "Vocation — 직업",
    ikigai_profession: "Profession — 전문성",
    ikigai_core: "IKIGAI — 삶의 이유",
    // Porter 5
    p5_rivalry: "Competitive Rivalry — 기존 경쟁",
    p5_new_entrants: "Threat of New Entrants — 신규 진입",
    p5_substitutes: "Threat of Substitutes — 대체재",
    p5_buyers: "Bargaining Power of Buyers — 구매자 협상력",
    p5_suppliers: "Bargaining Power of Suppliers — 공급자 협상력",
    // SCAMPER
    scamper_s: "Substitute — 대체",
    scamper_c: "Combine — 결합",
    scamper_a: "Adapt — 응용",
    scamper_m: "Modify — 변형·확대·축소",
    scamper_p: "Put to another use — 다른 용도",
    scamper_e: "Eliminate — 제거",
    scamper_r: "Reverse / Rearrange — 역발상·재배치",
    // Kano
    kano_must: "Must-be — 당연한 품질",
    kano_performance: "One-dimensional — 성과 품질",
    kano_attractive: "Attractive — 감동 품질",
    kano_indifferent: "Indifferent — 무관심",
    kano_reverse: "Reverse — 역품질",
    // Pareto — array JSON
    pareto_items: "파레토 항목",
    // Fishbone
    fish_problem: "Problem — 문제",
    fish_people: "People — 사람",
    fish_process: "Process — 프로세스",
    fish_technology: "Technology — 기술",
    fish_environment: "Environment — 환경",
    fish_materials: "Materials — 자원",
    fish_measurement: "Measurement — 측정",
    // Journey Map — stages JSON
    journey_persona: "Persona — 대상",
    journey_stages: "고객 여정 단계",
    // KPT Retrospective
    kpt_keep: "Keep — 잘한 것·계속할 것",
    kpt_problem: "Problem — 문제·개선할 것",
    kpt_try: "Try — 새로 시도할 것",
    // OODA
    ooda_observe: "Observe — 관찰",
    ooda_orient: "Orient — 방향 설정",
    ooda_decide: "Decide — 결정",
    ooda_act: "Act — 실행",
    // Cornell
    cornell_cue: "Cue — 핵심 키워드·질문",
    cornell_notes: "Notes — 수업·강의·독서 내용",
    cornell_summary: "Summary — 요약·종합",
    // Decision Matrix — JSON (options × criteria)
    dm_options: "의사결정 옵션",
    // Feynman
    feynman_concept: "개념 — 가르치려는 주제",
    feynman_teach: "설명 — 6살에게 가르치듯",
    feynman_gaps: "허점 — 막힌 곳·애매한 곳",
    feynman_simplify: "단순화 — 비유·예시로 재표현",
    // 1on1
    oto_with: "상대 (With)",
    oto_date: "일시",
    oto_updates: "진행 상황 · 업데이트",
    oto_feedback: "피드백 (주고받은)",
    oto_blockers: "장애물 · 고민",
    oto_next: "다음 목표 · 액션",
    // Meeting
    mtg_title: "제목", mtg_date: "일시", mtg_attendees: "참석자", mtg_agenda: "안건",
    mtg_discussion: "논의 내용",
    mtg_decisions: "결정 사항",
    mtg_actions: "액션 아이템 (담당자·마감)",
    // Interview
    itv_name: "인터뷰이", itv_role: "역할·직업", itv_date: "일시",
    itv_goals: "목표·하고 있는 것",
    itv_pains: "문제·불편",
    itv_insights: "핵심 인사이트",
    itv_quotes: "인상 깊은 인용문",
    itv_surprises: "예상 밖의 발견",
    // AAR
    aar_planned: "계획된 것은 무엇이었나?",
    aar_actual: "실제로 일어난 일은?",
    aar_diff: "왜 차이가 났나?",
    aar_lessons: "배운 것 · 다음에 할 것",
    // Brainstorm — ideas JSON
    bs_topic: "브레인스토밍 주제",
    bs_ideas: "아이디어 목록",
    bs_criteria: "선정 기준",
    bs_chosen: "최종 선택",
    // Decision Log
    dl_date: "결정 일자", dl_decider: "결정자",
    dl_decision: "결정 내용",
    dl_context: "배경 · 맥락",
    dl_alternatives: "대안 · 기각한 것",
    dl_expected: "기대 결과",
    dl_actual: "실제 결과 (나중에 기록)",
    // Emotion Log
    emo_mood: "오늘의 기분 (이모지)",
    emo_intensity: "강도 (1~5)",
    emo_trigger: "계기 · 무슨 일이 있었나",
    emo_body: "몸의 신호",
    emo_thought: "떠오른 생각",
    emo_reflection: "다시 본다면",
    // Gratitude
    grat_1: "감사한 일 1",
    grat_2: "감사한 일 2",
    grat_3: "감사한 일 3",
    grat_highlight: "오늘의 하이라이트",
    grat_tomorrow: "내일을 위해 기대하는 것",
    // Reading
    read_title: "책·아티클 제목",
    read_author: "저자",
    read_date: "읽은 날짜",
    read_summary: "한 줄 요약",
    read_highlights: "하이라이트 (밑줄 친 문장들)",
    read_takeaways: "핵심 교훈 (3가지)",
    read_action: "실천에 옮길 것",
    // Standup
    su_yesterday: "어제 한 일",
    su_today: "오늘 할 일",
    su_blockers: "장애물 · 도움 필요",
    // Weekly Journal
    wj_week: "주차",
    wj_events: "있었던 일",
    wj_feelings: "느낀 감정",
    wj_insights: "인사이트 · 배움",
    wj_next: "다음 주 의도",
    // Zettelkasten
    zet_id: "Zettel ID",
    zet_title: "제목",
    zet_content: "내용 (원자적 아이디어 하나)",
    zet_source: "출처",
    zet_links: "연결된 Zettel들",
    zet_tags: "태그",
    // Mindmap Outline
    mind_central: "중심 주제",
    mind_outline: "계층 구조 (들여쓰기로)",
    // Time Block — JSON array
    tb_date: "날짜",
    tb_blocks: "시간 블록",
    // Daily Design
    dd_date: "날짜",
    dd_intention: "오늘의 의도",
    dd_priorities: "Top 3 우선순위",
    dd_schedule: "일정",
    dd_reflection: "저녁 회고",
    // Deep Work — JSON array
    dw_date: "날짜",
    dw_sessions: "딥워크 세션",
    // Pomodoro — JSON array
    pom_date: "날짜",
    pom_sessions: "포모도로 세션",
    // Habit Tracker — JSON
    ht_week: "주차",
    ht_habits: "습관 리스트",
    // Energy Map
    em_date: "날짜",
    em_levels: "시간대별 에너지",
    em_peaks: "피크 시간",
    em_lows: "저점 시간",
    em_notes: "패턴 메모",
    // Weekly Review
    wr_week: "주차",
    wr_wins: "Wins — 승리",
    wr_lessons: "Lessons — 배움",
    wr_blockers: "Blockers — 장애물",
    wr_next: "Next Week — 다음 주",
    // Weekly Win
    ww_week: "주차",
    ww_biggest: "이번 주 가장 큰 WIN",
    ww_other: "다른 WIN들",
    ww_celebrate: "어떻게 축하할까",
    // Monthly Theme
    mt_month: "월",
    mt_theme: "이번 달 테마 (한 문장)",
    mt_focus: "핵심 포커스",
    mt_wins: "기대하는 WIN",
    mt_habits: "만들 습관",
    mt_reflection: "월말 회고",
    // Quarterly
    q_quarter: "분기",
    q_goal: "분기 목표",
    q_m1: "Month 1",
    q_m2: "Month 2",
    q_m3: "Month 3",
    q_review: "분기 회고",
    // Year Plan — JSON (12 months)
    yr_year: "연도",
    yr_theme: "올해의 테마",
    yr_months: "월별 포커스",
    yr_milestones: "핵심 마일스톤",
    // Five Year
    fy_now: "현재 (0년)",
    fy_y1: "1년 후",
    fy_y2: "2년 후",
    fy_y3: "3년 후",
    fy_y5: "5년 후 (비전)",
    fy_principles: "지켜야 할 원칙",
    // Moving Average (90-day experiment)
    ma_experiment: "실험 제목",
    ma_hypothesis: "가설 (If ~ then ~)",
    ma_baseline: "시작점 (baseline)",
    ma_metric: "측정 지표",
    ma_target: "90일 후 목표",
    ma_checkins: "체크인 (30/60/90일)",
    ma_result: "결과",
    // Reverse Plan
    rp_goal: "최종 목표",
    rp_deadline: "마감일",
    rp_milestones: "거꾸로 마일스톤",
    rp_now: "오늘 시작할 일",
    // Sprint (2-week)
    sp_number: "스프린트 번호",
    sp_start: "시작일", sp_end: "종료일",
    sp_goal: "스프린트 목표",
    sp_commitments: "커밋먼트 (이번에 끝낼 것)",
    sp_stretch: "스트레치 (여유 있으면)",
    sp_retro: "스프린트 회고",
};

export function isSpecialTemplate(tpl: TemplateMeta): boolean {
    const k = tpl.key.toLowerCase();
    const l = tpl.label.toLowerCase();
    return k.includes("bcg") || l.includes("bcg")
        || k.includes("swot") || l.includes("swot")
        || ((k.includes("4p") || l.includes("4p")) && !k.includes("4ps"))
        || k.includes("ansoff") || l.includes("ansoff")
        || k.includes("9box") || k.includes("nine_box") || l.includes("9-box") || l.includes("9box")
        || k.includes("empathy") || l.includes("공감")
        || k.includes("lean") || l.includes("린 캔버스")
        || k.includes("mandalart") || l.includes("만다라")
        || k.includes("eisenhower") || l.includes("아이젠하워")
        || k.includes("pest") || l.includes("pest 분석")
        || k.includes("moscow") || l.includes("moscow")
        || k === "quadrant" || l.includes("4분면 매트릭스")
        || k.includes("business_canvas") || l.includes("비즈니스 모델 캔버스")
        || k === "vpc" || l.includes("value proposition canvas")
        || k === "okr" || l === "okr"
        || k.includes("persona") || l.includes("페르소나")
        || k.includes("jobs_to_be_done") || k.includes("jtbd") || l.includes("jobs-to-be-done")
        || k === "rice" || l.includes("rice")
        || k === "5w1h" || l.includes("5w1h")
        || k === "5why" || l.includes("5why") || l.includes("5 why")
        || k.includes("ikigai") || l.includes("ikigai") || l.includes("이키가이")
        || k.includes("porter") || l.includes("porter")
        || k.includes("scamper") || l.includes("scamper")
        || k === "kano" || l.includes("kano")
        || k.includes("pareto") || l.includes("파레토") || l.includes("80/20")
        || k.includes("fishbone") || l.includes("피쉬본") || l.includes("이시카와")
        || k.includes("journey") || l.includes("여정 지도") || l.includes("journey map")
        || k.includes("retrospective") || l.includes("kpt") || l.includes("회고")
        || k === "ooda" || l.includes("ooda")
        || k.includes("cornell") || l.includes("코넬")
        || k.includes("decision_matrix") || l.includes("의사결정 매트릭스")
        || k.includes("feynman") || l.includes("파인만")
        || k === "1on1" || l.includes("1:1 미팅")
        || k === "meeting" || l.includes("회의록")
        || k === "interview" || l.includes("사용자 인터뷰")
        || k === "after_action" || l.includes("after action")
        || k === "brainstorm" || l.includes("브레인스토밍")
        || k === "decision_log" || l.includes("의사결정 로그")
        || k === "emotion_log" || l.includes("감정 로그")
        || k === "gratitude" || l.includes("감사 일기")
        || k === "reading" || l.includes("독서 노트")
        || k === "standup" || l.includes("스탠드업")
        || k === "weekly_journal" || l.includes("주간 저널")
        || k === "zettelkasten" || l.includes("제텔카스텐")
        || k === "mindmap_outline" || l.includes("마인드맵")
        || k === "time_block" || l.includes("타임블록")
        || k === "daily_design" || l.includes("하루 설계")
        || k === "deep_work" || l.includes("딥워크")
        || k === "pomodoro" || l.includes("포모도로")
        || k === "habit_tracker" || l.includes("습관 트래커")
        || k === "energy_map" || l.includes("에너지 지도")
        || k === "weekly_review" || l.includes("주간 리뷰")
        || k === "weekly_win" || l.includes("주간 win")
        || k === "monthly_theme" || l.includes("월간 테마")
        || k === "quarterly" || l.includes("분기 계획")
        || k === "year_plan" || l.includes("연간 계획")
        || k === "five_year" || l.includes("5년 계획")
        || k === "moving_average" || l.includes("90일 실험")
        || k === "reverse_plan" || l.includes("역산 계획")
        || k === "sprint" || l.includes("스프린트");
}

export function exportFrameworkText(tpl: TemplateMeta, data: FrameworkData): string {
    const k = tpl.key.toLowerCase();
    const l = tpl.label.toLowerCase();
    const entries = Object.entries(data).filter(([, v]) => v.trim());
    if (!entries.length) return tpl.body_md;

    let out = `# ${tpl.label}\n\n`;
    if (k.includes("9box") || k.includes("nine_box") || l.includes("9box") || l.includes("9-box")) {
        out += entries.map(([key, val]) => `## ${key}\n${val}`).join("\n\n");
    } else if (k.includes("pareto") || l.includes("파레토") || l.includes("80/20")) {
        const raw = data["pareto_items"];
        if (raw?.trim()) {
            try {
                const items = JSON.parse(raw) as Array<{name: string; value: number}>;
                const sorted = [...items].sort((a, b) => b.value - a.value);
                const total = sorted.reduce((s, x) => s + x.value, 0) || 1;
                out += `| 순위 | 항목 | 값 | 비율 | 누적 |\n|---|---|---|---|---|\n`;
                let cum = 0;
                sorted.forEach((it, i) => {
                    cum += it.value;
                    out += `| ${i + 1} | ${it.name} | ${it.value} | ${(it.value/total*100).toFixed(1)}% | ${(cum/total*100).toFixed(1)}% |\n`;
                });
                out += "\n";
            } catch { out += raw; }
        }
    } else if (k.includes("journey") || l.includes("여정 지도")) {
        if (data["journey_persona"]?.trim()) out += `## Persona\n${data["journey_persona"]}\n\n`;
        const raw = data["journey_stages"];
        if (raw?.trim()) {
            try {
                const stages = JSON.parse(raw) as Array<{stage: string; action: string; thought: string; emotion: string; opportunity: string}>;
                out += `| 단계 | 행동 | 생각 | 감정 | 개선 기회 |\n|---|---|---|---|---|\n`;
                for (const s of stages) {
                    out += `| ${s.stage} | ${s.action} | ${s.thought} | ${s.emotion} | ${s.opportunity} |\n`;
                }
                out += "\n";
            } catch { out += raw; }
        }
    } else if (k === "year_plan" || l.includes("연간 계획")) {
        if (data["yr_year"]?.trim()) out += `# ${data["yr_year"]}\n\n`;
        if (data["yr_theme"]?.trim()) out += `**올해 테마:** ${data["yr_theme"]}\n\n`;
        const raw = data["yr_months"];
        if (raw?.trim()) {
            try {
                const months = JSON.parse(raw) as Array<{focus: string; goal: string}>;
                out += `| 월 | 포커스 | 목표 |\n|---|---|---|\n`;
                for (let i = 0; i < 12; i++) {
                    const m = months[i] ?? { focus: "", goal: "" };
                    out += `| ${i + 1}월 | ${m.focus ?? ""} | ${m.goal ?? ""} |\n`;
                }
                out += "\n";
            } catch { out += raw; }
        }
        if (data["yr_milestones"]?.trim()) out += `## 핵심 마일스톤\n${data["yr_milestones"]}\n`;
    } else if (k === "time_block" || l.includes("타임블록")) {
        if (data["tb_date"]?.trim()) out += `## ${data["tb_date"]}\n\n`;
        const raw = data["tb_blocks"];
        if (raw?.trim()) {
            try {
                const blocks = JSON.parse(raw) as Array<{start: string; end: string; task: string; category?: string}>;
                out += `| 시간 | 카테고리 | 할 일 |\n|---|---|---|\n`;
                for (const b of blocks) {
                    if (!b.task?.trim()) continue;
                    out += `| ${b.start}~${b.end} | ${b.category ?? ""} | ${b.task} |\n`;
                }
                out += "\n";
            } catch { out += raw; }
        }
    } else if (k === "deep_work" || l.includes("딥워크")) {
        if (data["dw_date"]?.trim()) out += `## ${data["dw_date"]} · 딥워크\n\n`;
        const raw = data["dw_sessions"];
        if (raw?.trim()) {
            try {
                const ss = JSON.parse(raw) as Array<{start: string; duration: number; task: string; result: string; distractions: string}>;
                for (const s of ss) {
                    if (!s.task?.trim()) continue;
                    out += `### ${s.start} (${s.duration}분) — ${s.task}\n`;
                    if (s.result) out += `- 결과: ${s.result}\n`;
                    if (s.distractions) out += `- 방해: ${s.distractions}\n`;
                    out += "\n";
                }
            } catch { out += raw; }
        }
    } else if (k === "pomodoro" || l.includes("포모도로")) {
        if (data["pom_date"]?.trim()) out += `## ${data["pom_date"]} · 포모도로\n\n`;
        const raw = data["pom_sessions"];
        if (raw?.trim()) {
            try {
                const ss = JSON.parse(raw) as Array<{task: string; completed: number; notes: string}>;
                out += `| 과업 | 🍅 | 메모 |\n|---|---|---|\n`;
                for (const s of ss) {
                    if (!s.task?.trim()) continue;
                    out += `| ${s.task} | ${"🍅".repeat(s.completed)} | ${s.notes ?? ""} |\n`;
                }
                out += "\n";
            } catch { out += raw; }
        }
    } else if (k === "habit_tracker" || l.includes("습관 트래커")) {
        if (data["ht_week"]?.trim()) out += `## ${data["ht_week"]} · 습관 트래커\n\n`;
        const raw = data["ht_habits"];
        if (raw?.trim()) {
            try {
                const habits = JSON.parse(raw) as Array<{name: string; days: boolean[]}>;
                out += `| 습관 | 월 | 화 | 수 | 목 | 금 | 토 | 일 | 달성 |\n|---|---|---|---|---|---|---|---|---|\n`;
                for (const h of habits) {
                    if (!h.name?.trim()) continue;
                    const done = h.days.filter(Boolean).length;
                    out += `| ${h.name} | ${h.days.map(d => d ? "✅" : "·").join(" | ")} | ${done}/7 |\n`;
                }
                out += "\n";
            } catch { out += raw; }
        }
    } else if (k === "energy_map" || l.includes("에너지 지도")) {
        if (data["em_date"]?.trim()) out += `## ${data["em_date"]} · 에너지 지도\n\n`;
        const raw = data["em_levels"];
        if (raw?.trim()) {
            try {
                const levels = JSON.parse(raw) as Array<{hour: number; level: number}>;
                out += `| 시각 | 에너지 |\n|---|---|\n`;
                for (const l2 of levels) {
                    if (l2.level > 0) out += `| ${String(l2.hour).padStart(2,"0")}:00 | ${"█".repeat(l2.level)} (${l2.level}/5) |\n`;
                }
                out += "\n";
            } catch { out += raw; }
        }
        if (data["em_peaks"]?.trim()) out += `**피크:** ${data["em_peaks"]}\n\n`;
        if (data["em_lows"]?.trim()) out += `**저점:** ${data["em_lows"]}\n\n`;
        if (data["em_notes"]?.trim()) out += `**패턴:** ${data["em_notes"]}\n`;
    } else if (k === "brainstorm" || l.includes("브레인스토밍")) {
        if (data["bs_topic"]?.trim()) out += `## 주제\n${data["bs_topic"]}\n\n`;
        const raw = data["bs_ideas"];
        if (raw?.trim()) {
            try {
                const ideas = JSON.parse(raw) as Array<{text: string; starred?: boolean}>;
                out += `## 아이디어\n`;
                for (const i of ideas) {
                    if (!i.text?.trim()) continue;
                    out += `${i.starred ? "⭐" : "-"} ${i.text}\n`;
                }
                out += "\n";
            } catch { out += raw; }
        }
        if (data["bs_criteria"]?.trim()) out += `## 선정 기준\n${data["bs_criteria"]}\n\n`;
        if (data["bs_chosen"]?.trim()) out += `## 최종 선택\n${data["bs_chosen"]}\n`;
    } else if (k.includes("decision_matrix") || l.includes("의사결정 매트릭스")) {
        const raw = data["dm_options"];
        if (raw?.trim()) {
            try {
                const parsed = JSON.parse(raw) as { criteria: Array<{name: string; weight: number}>; options: Array<{name: string; scores: number[]}> };
                out += `| 옵션 | ${parsed.criteria.map(c => `${c.name} (w${c.weight})`).join(" | ")} | 총점 |\n`;
                out += `|${"---|".repeat(parsed.criteria.length + 2)}\n`;
                const rows = parsed.options.map(op => {
                    const total = op.scores.reduce((s, v, i) => s + (v * (parsed.criteria[i]?.weight ?? 1)), 0);
                    return { op, total };
                }).sort((a, b) => b.total - a.total);
                for (const { op, total } of rows) {
                    out += `| ${op.name} | ${op.scores.join(" | ")} | **${total}** |\n`;
                }
                out += "\n";
            } catch { out += raw; }
        }
    } else if (k === "rice" || l.includes("rice")) {
        const raw = data["rice_items"];
        if (raw?.trim()) {
            try {
                const items = JSON.parse(raw) as Array<{name: string; reach: number; impact: number; confidence: number; effort: number}>;
                out += `| 항목 | Reach | Impact | Confidence | Effort | Score |\n|---|---|---|---|---|---|\n`;
                for (const it of items) {
                    const score = it.effort > 0 ? ((it.reach * it.impact * it.confidence) / it.effort).toFixed(1) : "—";
                    out += `| ${it.name} | ${it.reach} | ${it.impact} | ${it.confidence}% | ${it.effort} | ${score} |\n`;
                }
                out += "\n";
            } catch { out += raw; }
        }
    } else if (k.includes("mandalart") || l.includes("만다라")) {
        if (data["goal"]?.trim()) out += `## 핵심 목표\n${data["goal"]}\n\n`;
        for (let ti = 0; ti < 8; ti++) {
            const theme = data[`t${ti}`];
            if (!theme?.trim()) continue;
            out += `## ${theme}\n`;
            for (let ai = 0; ai < 8; ai++) {
                const a = data[`t${ti}_${ai}`];
                if (a?.trim()) out += `- ${a}\n`;
            }
            out += "\n";
        }
    } else {
        out += entries.map(([key, val]) => `## ${LABEL_MAP[key] || key}\n${val}`).join("\n\n");
    }
    return out;
}

export const tplDataKey = (id: string) => `myverse_tpl_data_${id}`;

/** Returns the best content for insertion: localStorage grid data if filled, else body_md */
export function resolveTemplateContent(tpl: TemplateMeta): string {
    if (typeof window === "undefined") return tpl.body_md;
    if (!isSpecialTemplate(tpl)) return tpl.body_md;
    try {
        const raw = window.localStorage.getItem(tplDataKey(tpl.id));
        if (!raw) return tpl.body_md;
        const data: FrameworkData = JSON.parse(raw);
        return exportFrameworkText(tpl, data);
    } catch {
        return tpl.body_md;
    }
}
