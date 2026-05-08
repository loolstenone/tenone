"use client";

// Myverse 4 Pillars 사이드바 — 9 영역을 4 그룹으로 단축한 멘탈 모델
//   나(Me): BODY · 일상 · 관계
//   일(Do): 업무 · 공부
//   시간(Time): 일정 · 이동 · 여행
//   나누기(Share): Verse 통합 타임라인 · @handle 공개 페이지
//
// 9 영역 SSOT: lib/myverse/domains.ts (DOMAINS · PILLARS · app_href)
// 자동 배지: GET /api/myverse/domains/activity 로 최근 7일 도메인별 활동 수.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User, Briefcase, Clock, Share2,
    Heart, Coffee, Users,
    BookOpen, Calendar, Navigation, Plane,
    Orbit, AtSign, Bot, Settings, HelpCircle,
    type LucideIcon,
} from "lucide-react";
import { DOMAINS, PILLARS, type DomainKey, type PillarKey } from "@/lib/myverse/domains";

// ── 아이콘 맵 (icon_name → Lucide component) ──────────────────
const DOMAIN_ICON_MAP: Record<DomainKey, LucideIcon> = {
    body:     Heart,
    daily:    Coffee,
    relation: Users,
    work:     Briefcase,
    study:    BookOpen,
    schedule: Calendar,
    move:     Navigation,
    travel:   Plane,
};

const PILLAR_ICON_MAP: Record<PillarKey, LucideIcon> = {
    me:    User,
    do:    Briefcase,
    time:  Clock,
    share: Share2,
};

// ── 플래너·나누기·시스템 — 9영역 SSOT 밖의 앱 전용 항목 ──────
interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    color?: string;
    note?: string;
}

interface LocalGroup {
    key: string;
    label: string;
    icon: LucideIcon;
    items: NavItem[];
}

const LOCAL_GROUPS: LocalGroup[] = [
    {
        key: "share",
        label: "나누기",
        icon: Share2,
        items: [
            { label: "Verse 타임라인", href: "/myverse/app/verse",  icon: Orbit, color: "#6366F1" },
            { label: "AI 코칭",        href: "/myverse/app/coach", icon: Bot,   color: "#6366F1" },
            // @handle은 아래에서 동적으로 렌더
        ],
    },
    {
        key: "system",
        label: "시스템",
        icon: Settings,
        items: [
            { label: "설정",   href: "/myverse/app/settings", icon: Settings,   color: "#6B7280" },
            { label: "도움말", href: "/myverse/app/help",     icon: HelpCircle, color: "#6B7280" },
        ],
    },
];

// ── 공통 NavLink ───────────────────────────────────────────────
function NavLink({
    href,
    icon: Icon,
    label,
    color,
    active,
    badge,
}: {
    href: string;
    icon: LucideIcon;
    label: string;
    color?: string;
    active: boolean;
    badge?: number;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${
                active
                    ? "text-[#6366F1] bg-[#6366F1]/5 font-semibold border-r-2 border-[#6366F1]"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
        >
            <Icon
                className="h-3.5 w-3.5"
                style={!active && color ? { color } : undefined}
            />
            <span className="flex-1">{label}</span>
            {badge && badge > 0 ? (
                <span
                    className={`text-[10px] tabular-nums px-1.5 rounded-full ${
                        active
                            ? "bg-[#6366F1] text-white"
                            : "bg-neutral-100 text-neutral-500"
                    }`}
                    title="최근 7일 활동"
                >
                    {badge > 99 ? "99+" : badge}
                </span>
            ) : null}
        </Link>
    );
}

// ── 섹션 헤더 ─────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return (
        <div className="px-4 mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-400">
            <Icon className="h-3 w-3" />
            {label}
        </div>
    );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export function MyverseSidebar({ handle }: { handle: string | null }) {
    const pathname = usePathname();
    const [counts, setCounts] = useState<Partial<Record<DomainKey, number>>>({});

    function isActive(href: string): boolean {
        if (href === pathname) return true;
        return pathname.startsWith(href + "/");
    }

    // SSOT 기반 9영역 pillar 그룹 (me / do / time)
    const domainPillars = PILLARS.filter(p => p.domains && p.domains.length > 0);

    // 자동 배지 — 최근 7일 도메인별 활동 (포커스 복귀 시 갱신)
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const r = await fetch("/api/myverse/domains/activity");
                if (!r.ok) return;
                const d = await r.json();
                if (!cancelled) setCounts(d.counts ?? {});
            } catch {}
        }
        void load();
        const onVis = () => { if (document.visibilityState === "visible") void load(); };
        document.addEventListener("visibilitychange", onVis);
        return () => { cancelled = true; document.removeEventListener("visibilitychange", onVis); };
    }, []);

    return (
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-neutral-200 bg-white">
            <div className="flex-1 overflow-y-auto py-4">

                {/* ── 9영역 (SSOT) ── */}
                {domainPillars.map((pillar, idx) => (
                    <div key={pillar.key} className={idx > 0 ? "mt-4" : ""}>
                        <SectionHeader
                            icon={PILLAR_ICON_MAP[pillar.key]}
                            label={pillar.label_ko}
                        />
                        <ul className="space-y-px">
                            {(pillar.domains ?? []).map(domainKey => {
                                const domain = DOMAINS[domainKey];
                                const active = isActive(domain.app_href);
                                return (
                                    <li key={domainKey}>
                                        <NavLink
                                            href={domain.app_href}
                                            icon={DOMAIN_ICON_MAP[domainKey]}
                                            label={domain.label_ko}
                                            color={domain.color_hex}
                                            active={active}
                                            badge={counts[domainKey]}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {/* ── 플래너·나누기·시스템 (앱 전용) ── */}
                {LOCAL_GROUPS.map(group => (
                    <div key={group.key} className="mt-4">
                        <SectionHeader icon={group.icon} label={group.label} />
                        <ul className="space-y-px">
                            {group.items.map(item => (
                                <li key={item.href}>
                                    <NavLink
                                        href={item.href}
                                        icon={item.icon}
                                        label={item.label}
                                        color={item.color}
                                        active={isActive(item.href)}
                                    />
                                </li>
                            ))}

                            {/* 나누기 그룹 — @handle 동적 노출 */}
                            {group.key === "share" && (
                                <li>
                                    <Link
                                        href={handle ? `/myverse/${handle}` : "/myverse/app/settings/handle"}
                                        className={`flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${
                                            handle && pathname === `/myverse/${handle}`
                                                ? "text-[#6366F1] bg-[#6366F1]/5 font-semibold border-r-2 border-[#6366F1]"
                                                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                                        }`}
                                    >
                                        <AtSign className="h-3.5 w-3.5" style={{ color: "#6366F1" }} />
                                        <span className="flex-1 font-mono">
                                            {handle ? `@${handle}` : "핸들 등록"}
                                        </span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                ))}
            </div>

        </aside>
    );
}
