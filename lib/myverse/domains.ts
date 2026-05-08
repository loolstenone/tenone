// Myverse 9 영역 SSOT — 5축 메타데이터로 자동 분류되는 일상 영역
//
// 8 데이터 영역 + 1 횡단축(사람):
//   body·work·study·daily·schedule·travel·move·relation + _people
//
// 모든 capture 테이블의 `domain` 컬럼이 이 키 중 하나를 가진다.
// 분류 엔진(lib/myverse/classification/)이 이 정의를 참조해 자동 라우팅한다.

export type DomainKey =
    | "body"      // 운동·식사·수면 (헬스킷·구글핏·음식 사진)
    | "work"      // 업무·회의·프로젝트 (캘린더 미팅·근무 시간대·노션)
    | "study"     // 강의·필기·자기학습 (강의 영상·OCR·반복 학습 위치)
    | "daily"     // 일상·일기·여가 (자유 기록·집·카페·여가 시간대)
    | "schedule"  // 일정·약속·기념일 (캘린더 직접 입력)
    | "travel"    // 여행 (평소 거점에서 30km+ + 1박 이상)
    | "move"      // 이동 (GPS 백그라운드)
    | "relation"; // 관계 (얼굴 인식·contacts 매칭·미팅 참석자)

/** 사람(횡단축) — 데이터 영역이 아니라 모든 영역을 가로지르는 필터 키 */
export type CrossAxis = "_people";

export interface DomainMeta {
    key: DomainKey;
    label_ko: string;
    label_en: string;
    color_hex: string;
    color_tw: string;       // Tailwind class prefix (예: "emerald" → bg-emerald-500)
    icon_name: string;       // Lucide 아이콘 이름
    description: string;
    /** 앱 내 페이지 경로 — 사이드바·드롭다운 등 모든 UI가 이 값을 참조 */
    app_href: string;
    /** 이 도메인으로 분류되기 위한 결정적 단서 (우선순위 순) */
    rule_hints: string[];
    /** Pillar 그룹핑 — 사이드바 4 Pillars 멘탈 모델 */
    pillar: "me" | "do" | "time";
}

export const DOMAINS: Record<DomainKey, DomainMeta> = {
    body: {
        key: "body",
        label_ko: "BODY",
        label_en: "Body",
        color_hex: "#10B981",
        color_tw: "emerald",
        icon_name: "Heart",
        description: "운동·식사·수면 — 몸의 흔적",
        app_href: "/myverse/app/body",
        rule_hints: [
            "헬스킷·구글핏 동기화 데이터",
            "헬스장·체육관 GPS",
            "음식 사진 (Vision API 인식)",
            "수면 세션",
        ],
        pillar: "me",
    },
    work: {
        key: "work",
        label_ko: "업무",
        label_en: "Work",
        color_hex: "#3B82F6",
        color_tw: "blue",
        icon_name: "Briefcase",
        description: "회의·프로젝트·업무 노트",
        app_href: "/myverse/app/work",
        rule_hints: [
            "캘린더 미팅 매칭",
            "사무실 거점 GPS",
            "근무 시간대 (평일 9–18시 기본, 사용자별 학습)",
            "노션·구글닥 임포트",
            "프로젝트 활성 시기",
        ],
        pillar: "do",
    },
    study: {
        key: "study",
        label_ko: "공부",
        label_en: "Study",
        color_hex: "#A855F7",
        color_tw: "purple",
        icon_name: "BookOpen",
        description: "강의·필기·자기학습",
        app_href: "/myverse/app/study",
        rule_hints: [
            "강의 영상 시청 시간 누적",
            "OCR로 추출한 학습 텍스트",
            "도서관·카페 등 학습 패턴 위치",
            "코스 진도 (외부 LMS 연동)",
        ],
        pillar: "do",
    },
    daily: {
        key: "daily",
        label_ko: "일상",
        label_en: "Daily",
        color_hex: "#F59E0B",
        color_tw: "amber",
        icon_name: "Coffee",
        description: "일기·기분·자유 기록",
        app_href: "/myverse/app/lifestyle",  // /app/daily는 플래너 오늘 뷰
        rule_hints: [
            "집 거점 GPS",
            "여가 시간대 (저녁·주말)",
            "다른 영역에 매칭되지 않는 자유 기록 (기본값)",
        ],
        pillar: "me",
    },
    schedule: {
        key: "schedule",
        label_ko: "일정",
        label_en: "Schedule",
        color_hex: "#0F766E",
        color_tw: "teal",
        icon_name: "Calendar",
        description: "캘린더 약속·기념일·공휴일",
        app_href: "/myverse/app/schedule",
        rule_hints: [
            "캘린더 직접 입력",
            "공휴일·기념일 등 시간 의미 강한 항목",
        ],
        pillar: "time",
    },
    travel: {
        key: "travel",
        label_ko: "여행",
        label_en: "Travel",
        color_hex: "#EC4899",
        color_tw: "pink",
        icon_name: "Plane",
        description: "여행 — 평소 거점에서 30km+ 이탈, 1박 이상",
        app_href: "/myverse/app/travel",
        rule_hints: [
            "평소 거점에서 30km 이상 이탈",
            "1박 이상 체류",
            "공항·역 GPS 통과",
            "사진 GPS가 평소 위치에서 벗어남",
        ],
        pillar: "time",
    },
    move: {
        key: "move",
        label_ko: "이동",
        label_en: "Move",
        color_hex: "#6B7280",
        color_tw: "gray",
        icon_name: "Navigation",
        description: "GPS 자동 — 일/주/월/년 동선",
        app_href: "/myverse/app/move",
        rule_hints: [
            "GPS 백그라운드 추적",
            "이동 거리·수단·시간 자동 추정",
        ],
        pillar: "time",
    },
    relation: {
        key: "relation",
        label_ko: "관계",
        label_en: "Relation",
        color_hex: "#EF4444",
        color_tw: "red",
        icon_name: "Users",
        description: "사람과의 만남 — 횡단축 'people'은 모든 영역을 가로지름",
        app_href: "/myverse/app/relation",
        rule_hints: [
            "얼굴 인식으로 contacts 매칭",
            "미팅 참석자 자동 등록",
            "단체 사진",
            "people_axis[]가 비어있지 않은 데이터",
        ],
        pillar: "me",
    },
};

/** 9 도메인 키 배열 (UI iteration 용) */
export const DOMAIN_KEYS: DomainKey[] = [
    "body", "work", "study", "daily", "schedule", "travel", "move", "relation",
];

/** Pillar 그룹핑 — 사이드바 4 Pillars 단축 모델 */
export type PillarKey = "me" | "do" | "time" | "share";

export interface PillarMeta {
    key: PillarKey;
    label_ko: string;
    icon_name: string;
    domains?: DomainKey[];   // share Pillar는 도메인 없음
}

export const PILLARS: PillarMeta[] = [
    { key: "me",    label_ko: "나",     icon_name: "User",      domains: ["body", "daily", "relation"] },
    { key: "do",    label_ko: "일",     icon_name: "Briefcase", domains: ["work", "study"] },
    { key: "time",  label_ko: "시간",   icon_name: "Clock",     domains: ["schedule", "move", "travel"] },
    { key: "share", label_ko: "나누기", icon_name: "Share2" },
];

// ── Lane SSOT — 5 lane 1차 네비게이션 (IA 재구성, 세션 119~) ─────────
//
// IA 진단: 시간 줌 9개 + AI surface 6개 + 소셜 surface 5개로 분산됨.
// 사용자 멘탈 모델은 (오늘/기록/AI/연결/도구) 4동사로 수렴 → Lane으로 표현.
//
// PILLARS는 Lane "기록" 안의 9영역 그룹핑으로만 의미를 가짐 (사용자에게 직접 노출되지 않음).

export type LaneKey = "today" | "record" | "ai" | "connect" | "work";

export interface LaneMeta {
    key: LaneKey;
    label_ko: string;
    icon_name: string;          // Lucide
    app_href: string;            // 진입점
    description: string;
}

export const LANES: LaneMeta[] = [
    {
        key: "today",
        label_ko: "오늘",
        icon_name: "Sunrise",
        app_href: "/myverse/app/today",
        description: "지금·여기 — 흔적, 일과, 코치 카드, 빠른 기록 한 화면",
    },
    {
        key: "record",
        label_ko: "기록",
        icon_name: "Camera",
        app_href: "/myverse/app/traces",
        description: "흔적 타임라인 — 9영역 필터·시간 줌·사람 횡단축",
    },
    {
        key: "ai",
        label_ko: "AI",
        icon_name: "Sparkles",
        app_href: "/myverse/app/ask",
        description: "묻기·코치·일기·캡슐 — 내 데이터의 AI 통찰",
    },
    {
        key: "connect",
        label_ko: "연결",
        icon_name: "Share2",
        app_href: "/myverse/app/feed",
        description: "피드·DM·Verse·@handle — 외부와의 연결",
    },
    {
        key: "work",
        label_ko: "도구",
        icon_name: "LayoutTemplate",
        app_href: "/myverse/app/projects",
        description: "프로젝트·캔버스·작업·템플릿 — Planner's 자산 (Easy 모드 숨김 가능)",
    },
];

/** Lane 키 → 그 lane에 속하는 페이지 경로 prefix들 — 활성 상태 판정용 */
export const LANE_PATHS: Record<LaneKey, string[]> = {
    today: ["/myverse/app/today", "/myverse/app/index", "/myverse/app/daily"],
    record: [
        "/myverse/app/traces",
        "/myverse/app/lifestyle",
        "/myverse/app/body", "/myverse/app/work", "/myverse/app/study",
        "/myverse/app/relation", "/myverse/app/schedule", "/myverse/app/move",
        "/myverse/app/travel", "/myverse/app/with",
        "/myverse/app/weekly", "/myverse/app/monthly", "/myverse/app/yearly",
    ],
    ai: ["/myverse/app/ask", "/myverse/app/coach", "/myverse/app/diary", "/myverse/app/insights", "/myverse/app/capsules", "/myverse/app/ai-briefing"],
    connect: ["/myverse/app/feed", "/myverse/app/dm", "/myverse/app/verse", "/myverse/app/notifications"],
    work: ["/myverse/app/projects", "/myverse/app/canvas", "/myverse/app/tasks", "/myverse/app/templates", "/myverse/app/contacts", "/myverse/app/personal"],
};

export function laneForPath(pathname: string): LaneKey | null {
    for (const lane of LANES) {
        if (LANE_PATHS[lane.key].some(p => pathname === p || pathname.startsWith(p + "/"))) {
            return lane.key;
        }
    }
    return null;
}

/** 캡처 모드 */
export type CaptureMode = "active" | "auto" | "imported";

export const CAPTURE_MODE_LABEL: Record<CaptureMode, string> = {
    active:   "직접 입력",
    auto:     "자동 수집",
    imported: "외부 임포트",
};

/** 공개 범위 */
export type Visibility = "private" | "friends" | "public";

export const VISIBILITY_LABEL: Record<Visibility, string> = {
    private: "나만",
    friends: "친구",
    public:  "전체 공개",
};

/** 5축 메타데이터 타입 (DB JSONB 스키마) */
export interface TimeAxis {
    at?: string;              // ISO datetime
    date?: string;            // YYYY-MM-DD
    day_of_week?: string;     // 'sun'..'sat'
    period?: "dawn" | "morning" | "afternoon" | "evening" | "night";
    calendar_match_id?: string;
}

export interface GeoAxis {
    lat?: number;
    lng?: number;
    base_id?: string;         // members.activity_bases[].id 매칭
    base_name?: string;       // 매칭된 거점 이름 (예: "사무실")
    reverse_address?: string;
    accuracy_m?: number;
}

export interface ContextAxis {
    prev_activity?: string;
    next_activity?: string;
    recurring_pattern?: string; // 'weekly_mon_10am' 등
    project_id?: string;
    base_visit_count?: number;  // 이 거점 누적 방문 횟수
}

/** 도메인 키 검증 */
export function isValidDomain(key: string): key is DomainKey {
    return DOMAIN_KEYS.includes(key as DomainKey);
}

/** 9 영역 색상 매핑 (Tailwind 동적 클래스 작성용) */
export function domainBgClass(key: DomainKey): string {
    return `bg-${DOMAINS[key].color_tw}-50`;
}
export function domainDotClass(key: DomainKey): string {
    return `bg-${DOMAINS[key].color_tw}-500`;
}
export function domainTextClass(key: DomainKey): string {
    return `text-${DOMAINS[key].color_tw}-700`;
}
