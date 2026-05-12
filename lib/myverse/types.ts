// Planner's Planner AI — 타입 정의

export type PlannerMode = 'weekly' | 'all_in_one' | 'custom';

/** Custom 모드에서 토글 가능한 메뉴 키 (필수 메뉴 제외). */
export type CustomMenuKey = 'weekly' | 'monthly' | 'yearly' | 'time' | 'contacts' | 'canvas';

/** Custom 모드에서 항상 노출되는 필수 메뉴 키. */
export const REQUIRED_MENU_KEYS = ['index', 'daily', 'personal', 'templates', 'community'] as const;

export const CUSTOM_TOGGLE_KEYS: CustomMenuKey[] = ['weekly', 'monthly', 'yearly', 'time', 'contacts', 'canvas'];
export type SubscriptionStatus = 'free' | 'active' | 'expired';
export type AiTone = 'professional' | 'friendly' | 'brief';
export type ProjectStatus = 'active' | 'completed' | 'archived' | 'paused';

/**
 * 사용자 역할 — 템플릿 추천·AI 브리핑 컨텍스트·특화 뷰에 활용
 * null = 미선택 (온보딩 스킵 가능)
 */
export type PlannerRole =
    | 'office_worker'   // 직장인
    | 'student'         // 대학생
    | 'researcher'      // 연구원/교수
    | 'designer'        // 디자이너
    | 'developer'       // 개발자
    | 'creator'         // 크리에이터
    | 'sales'           // 영업
    | 'planner'         // 기획자
    | 'athlete'         // 운동/피트니스
    | 'entrepreneur';   // 창업가/프리랜서

export const PLANNER_ROLE_META: Record<PlannerRole, { label: string; desc: string }> = {
    office_worker: { label: '직장인',         desc: '업무·회의·보고·프로젝트' },
    student:       { label: '대학생',         desc: '수업·과제·시험·시간표' },
    researcher:    { label: '연구원/교수',     desc: '논문·실험·강의·문헌' },
    designer:      { label: '디자이너',        desc: '브리프·무드보드·피드백' },
    developer:     { label: '개발자',         desc: '스프린트·이슈·회고' },
    creator:       { label: '크리에이터',      desc: '콘텐츠 캘린더·스크립트' },
    sales:         { label: '영업',           desc: '고객·파이프라인·팔로업' },
    planner:       { label: '기획자',         desc: '전략·프레임워크·브리프' },
    athlete:       { label: '운동/피트니스',   desc: '트레이닝 로그·루틴' },
    entrepreneur:  { label: '창업가/프리랜서', desc: '린캔버스·OKR·네트워킹' },
};

export interface PlannerUser {
    id: string;
    member_id: string;
    mode: PlannerMode;
    user_role: PlannerRole | null;
    subscription_status: SubscriptionStatus;
    subscription_expires_at: string | null;
    subscription_price: number;
    is_pdf_buyer: boolean;
    pdf_buyer_verified_at: string | null;
    ai_morning_time: string;
    ai_evening_time: string;
    ai_tone: AiTone;
    ai_context_scope: string[];
    onboarding_completed: boolean;
    time_tracking: boolean;
    custom_menus: CustomMenuKey[];
    created_at: string;
    updated_at: string;
}

export interface PlannerIdentity {
    id: string;
    member_id: string;
    // Inside-Out
    inside_who: string | null;
    inside_values: string[] | null;
    inside_strengths: string[] | null;
    inside_vision: string | null;
    // Outside-In
    outside_position: string | null;
    outside_perception: string | null;
    outside_opportunities: string | null;
    // Vision House
    vision_foundation: string | null;
    vision_walls: string | null;
    vision_roof: string | null;
    // Step 4: Objective + Key Results
    vision_statement: string | null;
    mission_statement: string | null;
    key_results: Array<{ id: string; category: string; text: string }>;
    execution_plan: string | null;
    resume?: ResumeData;
    updated_at: string;
}

// 이력서 — 인적사항·학력·경력·수상·강의·심사·기타활동 (PDF 이력서 표준)
export interface ResumeData {
    /** 인적사항 */
    personal?: {
        name_ko?: string;
        name_en?: string;
        name_hanja?: string;
        birth?: string;        // YYYY-MM-DD or 자유 형식
        address?: string;
        phone?: string;
        email?: string;
        homepage?: string;
        photo_url?: string;
    };
    /** 학력 — 최신순 */
    education?: Array<{ id: string; school: string; major?: string; period?: string; status?: string }>;
    /** 병적 사항 */
    military?: { period?: string; status?: string; notes?: string };
    /** 경력 — 최신순 */
    career?: Array<{ id: string; company: string; role?: string; period?: string; description?: string }>;
    /** 수상 경력 */
    awards?: Array<{ id: string; year?: string; title: string; project?: string; client?: string; org?: string }>;
    /** 업무 경험 분야 (ATL/BTL/디지털/브랜드 컨설팅 등) */
    experience_areas?: Array<{ id: string; area: string; description?: string }>;
    /** 브랜드 카테고리 경험 (금융/육아/헬스케어 등) */
    brand_categories?: Array<{ id: string; category: string; brands: string }>;
    /** 강의 경력 */
    lectures?: Array<{ id: string; org: string; topic?: string; year?: string }>;
    /** 심사 경력 */
    judging?: Array<{ id: string; org: string; period?: string; role?: string }>;
    /** 기타 활동 (운영중/종료 사이트·커뮤니티) */
    side_projects?: Array<{ id: string; name: string; url?: string; status: "active" | "ended"; period?: string; description?: string }>;
    /** 자격증 */
    certifications?: Array<{ id: string; name: string; issuer?: string; year?: string }>;
    /** 기술 */
    skills?: Array<{ id: string; name: string; level?: "초급" | "중급" | "고급" | "전문" }>;
    /** 어학 */
    languages?: Array<{ id: string; name: string; level?: string; score?: string }>;
    /** 포트폴리오 (기간·프로젝트명·내용) */
    portfolio?: Array<{ id: string; period?: string; project?: string; description?: string }>;
    /** 자기소개 */
    self_introduction?: string;
    /** 지원동기 */
    motivation?: string;
    /** 직무역량 */
    competency?: string;
    /** 입사후포부 */
    aspiration?: string;
    /** 요점정리 */
    summary?: string;
    /** 활성 섹션 ID 목록 (사용자가 체크한 것) */
    active_sections?: string[];
}

// 활동 거점 — 사무실·집·체육관 등. 시간 트래커·캘린더 자동 라벨링용
export interface ActivityBase {
    id: string;
    name: string;
    type: "home" | "office" | "study" | "gym" | "cafe" | "other";
    address?: string;
    lat?: number;
    lng?: number;
    color?: string;
    isPrimary?: boolean;
}

export type TaskQuadrant = '급중' | '급경' | '완중' | '완경';

/** Personal OS Task 분류 — 일정/비용/인력/관리/일반 */
export type TaskType = 'normal' | 'milestone' | 'finance' | 'people' | 'admin';

export interface PlannerTask {
    id: string;
    text: string;
    /** todo·doing(진행)·done·carried(자동이월)·cancelled·hold(보류)·moved(다른 날로 수동 이동) */
    status: 'todo' | 'doing' | 'done' | 'carried' | 'cancelled' | 'hold' | 'moved';
    parent_id?: string | null;
    /** 경중완급 사분면 — 급중(긴급·중요) | 급경(긴급·쉬운) | 완중(여유·중요) | 완경(여유·쉬운) */
    priority?: TaskQuadrant | null;
    time?: string | null;
    project_id?: string | null;   // Phase 2 — 프로젝트 태그
    memo?: string | null;         // 업무 메모
    /** moved 상태일 때 이동된 대상 날짜 (YYYY-MM-DD) */
    moved_to?: string | null;
    /** 다른 날에서 이동되어 들어온 경우 출처 날짜 */
    moved_from?: string | null;
    /** Personal OS — 일정 통합 운영: 일반/마일스톤/비용/인력/관리 */
    type?: TaskType | null;
    /** type='finance' 일 때 사용 */
    amount?: number | null;
    currency?: string | null;
    vendor_person_id?: string | null;
    /** type='people' 일 때 — 담당 Person */
    assignee_person_id?: string | null;
    waiting_on_person_id?: string | null;
    /** 출처 추적 (note/email/calendar에서 승격) */
    source?: 'note' | 'email' | 'calendar' | 'inbox' | null;
    source_note_id?: string | null;
    source_block_id?: string | null;
    source_email_id?: string | null;
    /** 생성 시각 (승격된 task 식별용) */
    created_at?: string | null;
    /** 간트 차트용 — 지속 일수 (기본 1, 시작=date, 종료=date+duration_days-1) */
    duration_days?: number | null;
    /** 간트 의존성 — 이 task가 시작되려면 먼저 완료되어야 할 task id 목록 (Finish-to-Start) */
    depends_on?: string[] | null;
}

export interface PlannerDaily {
    id: string;
    member_id: string;
    date: string;
    tasks: PlannerTask[];
    notes: string | null;
    notes_secondary: string | null;
    energy_level: number | null;
    satisfaction_level: number | null;
    mood_level: number | null;
    exercise_type: string | null;
    exercise_minutes: number | null;
    exercise_distance: number | null;
    exercise_note: string | null;
    bp_systolic: number | null;
    bp_diastolic: number | null;
    blood_sugar: number | null;
    body_weight: number | null;
    body_temp: number | null;
    health_note: string | null;
    study_level: number | null;
    study_note: string | null;
    faith_level: number | null;
    faith_note: string | null;
    weather_temp: number | null;
    weather_code: number | null;
    daily_result: string | null;
    daily_result_category: string | null;
    created_at: string;
    updated_at: string;
}

export interface PlannerWeekly {
    id: string;
    member_id: string;
    year: number;
    week: number;
    week_start: string;
    week_end: string;
    vrief_what: string | null;
    vrief_why: string | null;
    vrief_how: string | null;
    gpr_goal: string | null;
    gpr_plan: string | null;
    gpr_result: string | null;
    reflection: string | null;
    updated_at: string;
}

export interface PlannerProject {
    id: string;
    member_id: string;
    title: string;
    cover_id: string | null;
    status: ProjectStatus;
    start_date: string | null;
    end_date: string | null;
    completed_at: string | null;
    order_index: number;
    color: string;
    created_at: string;
    updated_at: string;
    // Phase 1 — 카테고리·커스텀
    category?: string | null;
    custom_fields?: Record<string, unknown>;
    tags?: string[];
    visibility?: "private" | "team" | "public_link";
    tracking_metrics?: string[];
    // Phase 5 — 회고 (5F)
    retrospective?: ProjectRetrospective | null;
    // Phase 6 — 공유·협업
    public_token?: string | null;
    collaborators?: ProjectCollaborator[];
}

export interface ProjectCollaborator {
    email: string;
    role: "viewer" | "editor";
    invited_at: string;
}

export interface ProjectRetrospective {
    fact: string;          // 무엇을 했는가
    feeling: string;       // 어떤 감정/경험이었는가
    finding: string;       // 배운 것 (Identity Key Results 후보)
    future: string;        // 다음에 어떻게
    feedback: string;      // 피드백
    completed_at: string;  // ISO timestamp
}

export interface PlannerProjectMilestone {
    id: string;
    project_id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    done_at: string | null;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface PlannerProjectVrief {
    id: string;
    project_id: string;
    research_situation: string | null;
    research_data: Array<{ source: string; finding: string }>;
    research_insight: string | null;
    hypothesis_statement: string | null;
    hypothesis_assumptions: string[] | null;
    hypothesis_risks: string | null;
    validation_method: string | null;
    validation_findings: string | null;
    validation_conclusion: string | null;
    strategy_objective: string | null;
    strategy_approach: string | null;
    strategy_key_actions: string[] | null;
    strategy_success_criteria: string | null;
}

export interface PlannerProjectGpr {
    id: string;
    project_id: string;
    goal: string | null;
    key_results: string[] | null;
    plan: string | null;
    progress: number;
    obstacles: string | null;
    learnings: string | null;
    result: string | null;
}

export interface PlannerBriefing {
    id: string;
    member_id: string;
    briefing_type: 'morning' | 'midday' | 'evening';
    briefing_date: string;
    content: string;
    context_snapshot: unknown;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

// Week 계산 헬퍼
export function getISOWeek(date: Date): { year: number; week: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { year: d.getUTCFullYear(), week };
}

export function getWeekBoundaries(year: number, week: number): { start: string; end: string } {
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const weekStart = new Date(jan4);
    weekStart.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    return {
        start: weekStart.toISOString().slice(0, 10),
        end: weekEnd.toISOString().slice(0, 10),
    };
}

export function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

// 로컬 타임존 기준 YYYY-MM-DD — 날짜 비교·표시에 사용
export function localDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayString(): string {
    return localDateStr(new Date());
}

// Myverse aliases — session 115 rename (Planner* → Myverse*)
export type MyverseMode = PlannerMode;
export type MyverseUser = PlannerUser;
export type MyverseRole = PlannerRole;
export const MYVERSE_ROLE_META = PLANNER_ROLE_META;
export type MyverseDaily = PlannerDaily;
export type MyverseTask = PlannerTask;
export type MyverseWeekly = PlannerWeekly;
export type MyverseIdentity = PlannerIdentity;
export type MyverseProject = PlannerProject;
