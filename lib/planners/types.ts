// Planner's Planner AI — 타입 정의

export type PlannerMode = 'weekly' | 'all_in_one';
export type SubscriptionStatus = 'free' | 'active' | 'expired';
export type AiTone = 'professional' | 'friendly' | 'brief';
export type ProjectStatus = 'active' | 'completed' | 'archived' | 'paused';

export interface PlannerUser {
    id: string;
    member_id: string;
    mode: PlannerMode;
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
    updated_at: string;
}

export interface PlannerTask {
    id: string;
    text: string;
    status: 'todo' | 'done' | 'carried' | 'cancelled';
    parent_id?: string | null;
    priority?: 'low' | 'normal' | 'high' | null;
    time?: string | null;
    project_id?: string | null;   // Phase 2 — 프로젝트 태그
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

export function todayString(): string {
    return formatDate(new Date());
}
