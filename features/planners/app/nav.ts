// Planner's AI 플래너 앱 메뉴 SSOT — MyVerse에서 옮겨 온 핵심 화면만 (app/(Planners)/CLAUDE.md '이전 계획' 4단계)
// 개인 OS 화면(캡처·흔적·일기·피드·이력서 등)은 MyVerse(동결)에 남는다 — 여기에 넣지 않는다
export const APP_BASE = "/planners/app";

export interface AppNavItem { key: string; label: string; icon: string; href: string }
export interface AppNavGroup { label: string; items: AppNavItem[] }

export const PLANNERS_APP_NAV: AppNavGroup[] = [
    {
        label: "계획",
        items: [
            { key: "daily", label: "오늘", icon: "wb_twilight", href: `${APP_BASE}/daily` },
            { key: "weekly", label: "주간", icon: "view_week", href: `${APP_BASE}/weekly` },
            { key: "monthly", label: "월간", icon: "calendar_month", href: `${APP_BASE}/monthly` },
            { key: "yearly", label: "연간", icon: "calendar_today", href: `${APP_BASE}/yearly` },
            { key: "schedule", label: "일정", icon: "event", href: `${APP_BASE}/schedule` },
        ],
    },
    {
        label: "실행",
        items: [
            { key: "projects", label: "프로젝트", icon: "folder_managed", href: `${APP_BASE}/projects` },
            { key: "tasks", label: "할 일", icon: "checklist", href: `${APP_BASE}/tasks` },
            { key: "time", label: "시간 기록", icon: "timer", href: `${APP_BASE}/time` },
        ],
    },
    {
        label: "생각",
        items: [
            { key: "canvas", label: "캔버스", icon: "draw", href: `${APP_BASE}/canvas` },
            { key: "templates", label: "템플릿", icon: "frame_source", href: `${APP_BASE}/templates` },
            { key: "personal", label: "정체성", icon: "castle", href: `${APP_BASE}/personal` },
        ],
    },
    {
        label: "연결",
        items: [
            { key: "contacts", label: "연락처", icon: "contacts", href: `${APP_BASE}/contacts` },
            { key: "ai-briefing", label: "AI 브리핑", icon: "auto_awesome", href: `${APP_BASE}/ai-briefing` },
        ],
    },
];

export function isAppNavActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
}

/** AI 플래너 앱 화면인가 — 사이트 헤더·푸터를 숨길 때 (공식 도메인에서 /app/* 로 들어와도 같은 화면) */
export function isPlannersAppPath(pathname: string): boolean {
    return /^\/(planners\/)?app(\/|$)/.test(pathname);
}
