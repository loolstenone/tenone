// 프로젝트 카테고리 SSOT — 8종 + custom
// 각 카테고리는 추천 템플릿·기본 추적 메트릭·커스텀 필드 스펙을 가진다.

export type ProjectCategory =
    | "learning" | "business" | "creative" | "health"
    | "travel" | "network" | "finance" | "operations" | "custom";

export interface CategoryMeta {
    key: ProjectCategory;
    label: string;
    description: string;
    icon: string;             // lucide-react 아이콘 이름
    color: string;            // hex
    suggested_metrics: Array<"energy" | "satisfaction" | "mood" | "study" | "faith" | "exercise" | "health">;
    custom_fields: Array<{ key: string; label: string; type: "text" | "number" | "date" | "url" }>;
}

export const PROJECT_CATEGORIES: CategoryMeta[] = [
    {
        key: "learning",
        label: "학습/자기계발",
        description: "공부·자격증·평생학습",
        icon: "GraduationCap",
        color: "#0F766E",
        suggested_metrics: ["study", "satisfaction", "energy"],
        custom_fields: [
            { key: "subject", label: "과목/영역", type: "text" },
            { key: "textbook", label: "교재/강의", type: "text" },
            { key: "exam_date", label: "시험·평가일", type: "date" },
            { key: "progress_pct", label: "진도(%)", type: "number" },
        ],
    },
    {
        key: "business",
        label: "비즈니스/사업",
        description: "창업·운영·매출",
        icon: "Briefcase",
        color: "#1D4ED8",
        suggested_metrics: ["energy", "satisfaction"],
        custom_fields: [
            { key: "client", label: "클라이언트", type: "text" },
            { key: "revenue_target", label: "매출 목표", type: "number" },
            { key: "deadline", label: "마감일", type: "date" },
            { key: "stage", label: "단계", type: "text" },
        ],
    },
    {
        key: "creative",
        label: "창작/콘텐츠",
        description: "글·디자인·영상·음악",
        icon: "Palette",
        color: "#9333EA",
        suggested_metrics: ["energy", "mood", "satisfaction"],
        custom_fields: [
            { key: "medium", label: "매체", type: "text" },
            { key: "release_date", label: "발표·출간일", type: "date" },
            { key: "series", label: "시리즈/시즌", type: "text" },
            { key: "platform", label: "플랫폼", type: "url" },
        ],
    },
    {
        key: "health",
        label: "헬스/웰빙",
        description: "운동·다이어트·명상",
        icon: "HeartPulse",
        color: "#DC2626",
        suggested_metrics: ["exercise", "health", "energy", "mood"],
        custom_fields: [
            { key: "exercise_type", label: "운동 종류", type: "text" },
            { key: "frequency", label: "빈도(회/주)", type: "number" },
            { key: "target_metric", label: "목표 지표", type: "text" },
            { key: "checkpoint_date", label: "측정일", type: "date" },
        ],
    },
    {
        key: "travel",
        label: "여행/이벤트",
        description: "여행·결혼·기념일·행사",
        icon: "MapPin",
        color: "#EA580C",
        suggested_metrics: ["mood", "satisfaction"],
        custom_fields: [
            { key: "destination", label: "목적지/장소", type: "text" },
            { key: "depart_date", label: "시작일", type: "date" },
            { key: "return_date", label: "종료일", type: "date" },
            { key: "companions", label: "동행", type: "text" },
        ],
    },
    {
        key: "network",
        label: "관계/네트워크",
        description: "인맥·CRM·커뮤니티",
        icon: "Users",
        color: "#0891B2",
        suggested_metrics: ["satisfaction"],
        custom_fields: [
            { key: "person", label: "주요 인물", type: "text" },
            { key: "channel", label: "접점·채널", type: "text" },
            { key: "next_action_date", label: "다음 액션일", type: "date" },
        ],
    },
    {
        key: "finance",
        label: "재무/투자",
        description: "자산·투자·살림",
        icon: "Wallet",
        color: "#059669",
        suggested_metrics: ["satisfaction"],
        custom_fields: [
            { key: "asset_type", label: "자산 종류", type: "text" },
            { key: "target_amount", label: "목표 금액", type: "number" },
            { key: "horizon_date", label: "목표 시점", type: "date" },
        ],
    },
    {
        key: "operations",
        label: "운영/관리",
        description: "팀·KPI·운영 개선",
        icon: "BarChart3",
        color: "#475569",
        suggested_metrics: ["energy", "satisfaction"],
        custom_fields: [
            { key: "team", label: "팀/조직", type: "text" },
            { key: "kpi", label: "핵심 KPI", type: "text" },
            { key: "review_cycle", label: "리뷰 주기", type: "text" },
        ],
    },
    {
        key: "custom",
        label: "커스텀",
        description: "자유로운 도모",
        icon: "Sparkles",
        color: "#737373",
        suggested_metrics: [],
        custom_fields: [],
    },
];

export function getCategoryMeta(key: ProjectCategory | string | null | undefined): CategoryMeta {
    return PROJECT_CATEGORIES.find((c) => c.key === key) ?? PROJECT_CATEGORIES[PROJECT_CATEGORIES.length - 1];
}
