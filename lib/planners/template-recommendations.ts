// 프로젝트 카테고리별 추천 템플릿 매핑 SSOT
// 키는 planners_templates 테이블의 key 컬럼과 일치

import type { ProjectCategory } from "./project-categories";

export const RECOMMEND_BY_CATEGORY: Record<ProjectCategory, string[]> = {
    // 학습/자기계발
    learning: ["cornell", "okr", "5why", "feynman", "reading", "habit_tracker", "weekly_review"],

    // 비즈니스/사업
    business: ["business_canvas", "lean", "swot", "rice", "okr", "4p", "porter", "decision_matrix"],

    // 창작/콘텐츠
    creative: ["empathy", "persona", "journey", "scamper", "brainstorm", "mindmap_outline"],

    // 헬스/웰빙
    health: ["habit_tracker", "weekly_review", "energy_map", "gratitude", "emotion_log"],

    // 여행/이벤트
    travel: ["5w1h", "moscow", "decision_matrix"],

    // 관계/네트워크
    network: ["1on1", "interview", "5w1h", "meeting"],

    // 재무/투자
    finance: ["okr", "decision_matrix", "quadrant"],

    // 운영/관리
    operations: ["okr", "kpt", "after_action", "retrospective", "standup", "weekly_review", "decision_log"],

    // 커스텀
    custom: [],
};

export function getRecommendedTemplateKeys(category: ProjectCategory | string | null | undefined): string[] {
    if (!category) return [];
    return RECOMMEND_BY_CATEGORY[category as ProjectCategory] ?? [];
}
