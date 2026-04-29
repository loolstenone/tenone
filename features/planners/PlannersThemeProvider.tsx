"use client";

import { useEffect } from "react";

const COLOR_MAP: Record<string, { hex: string; dark: string }> = {
    teal:     { hex: "#0F766E", dark: "#0d5e56" },
    coral:    { hex: "#C2553D", dark: "#a34533" },
    slate:    { hex: "#475569", dark: "#334155" },
    rose:     { hex: "#BE185D", dark: "#9d1353" },
    amber:    { hex: "#B45309", dark: "#92400e" },
    indigo:   { hex: "#4338CA", dark: "#3730a3" },
    violet:   { hex: "#7C3AED", dark: "#6D28D9" },
    crimson:  { hex: "#DC2626", dark: "#B91C1C" },
    brown:    { hex: "#92400E", dark: "#78350f" },
    sky:      { hex: "#0369A1", dark: "#075985" },
    plum:     { hex: "#86198F", dark: "#701A75" },
    navy:     { hex: "#1E40AF", dark: "#1e3a8a" },
    mono:     { hex: "#171717", dark: "#0a0a0a" },
    charcoal: { hex: "#374151", dark: "#1f2937" },
};

// 모든 Planners 컴포넌트가 하드코딩하는 기본 teal 색상
const BASE = "#0F766E";
const BASE_DARK = "#0d5e56";

export function applyPlannersTheme(key: string) {
    const theme = COLOR_MAP[key] ?? COLOR_MAP.teal;
    const root = document.documentElement;
    root.style.setProperty("--planners-accent", theme.hex);
    root.style.setProperty("--planners-accent-dark", theme.dark);

    let el = document.getElementById("planners-theme-override");
    if (!el) {
        el = document.createElement("style");
        el.id = "planners-theme-override";
        document.head.appendChild(el);
    }

    const h = theme.hex;
    const d = theme.dark;

    // teal이 선택된 경우 오버라이드 불필요 (BASE와 동일)
    if (h === BASE) {
        el.textContent = "";
        return;
    }

    // 컴포넌트들이 BASE(#0F766E / #0d5e56)를 하드코딩하므로
    // 새 테마 색상으로 치환하는 CSS를 주입한다.
    el.textContent = `
[class~="bg-[${BASE}]"]{background-color:${h}!important}
[class~="hover:bg-[${BASE}]"]:hover{background-color:${h}!important}
[class~="text-[${BASE}]"]{color:${h}!important}
[class~="hover:text-[${BASE}]"]:hover{color:${h}!important}
[class~="border-[${BASE}]"]{border-color:${h}!important}
[class~="hover:border-[${BASE}]"]:hover{border-color:${h}!important}
[class~="focus:border-[${BASE}]"]:focus{border-color:${h}!important}
[class~="from-[${BASE}]"]{--tw-gradient-from:${h}!important}
[class~="to-[${BASE}]"]{--tw-gradient-to:${h}!important}
[class~="ring-[${BASE}]"]{--tw-ring-color:${h}!important}
[class~="accent-[${BASE}]"]{accent-color:${h}!important}
[class~="bg-[${BASE}]/5"]{background-color:color-mix(in srgb,${h} 5%,transparent)!important}
[class~="bg-[${BASE}]/10"]{background-color:color-mix(in srgb,${h} 10%,transparent)!important}
[class~="bg-[${BASE}]/20"]{background-color:color-mix(in srgb,${h} 20%,transparent)!important}
[class~="hover:bg-[${BASE}]/5"]:hover{background-color:color-mix(in srgb,${h} 5%,transparent)!important}
[class~="hover:bg-[${BASE}]/10"]:hover{background-color:color-mix(in srgb,${h} 10%,transparent)!important}
[class~="text-[${BASE}]/70"]{color:color-mix(in srgb,${h} 70%,transparent)!important}
[class~="bg-[${BASE_DARK}]"]{background-color:${d}!important}
[class~="hover:bg-[${BASE_DARK}]"]:hover{background-color:${d}!important}
[class~="text-[${BASE_DARK}]"]{color:${d}!important}
`;
}

const FONT_MAP: Record<string, string> = {
    serif:         '"Georgia", "Times New Roman", serif',
    "strong-serif": '"Playfair Display", "Georgia", "Times New Roman", serif',
    sans:          'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
    gothic:        '"Nanum Gothic", "Apple SD Gothic Neo", "Malgun Gothic", "Microsoft YaHei", sans-serif',
    mono:          '"Courier New", Courier, monospace',
    round:         '"Nunito", "Varela Round", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
};

export function applyPlannersFont(key: string) {
    let fontValue: string;
    if (key.startsWith("custom_")) {
        const idx = parseInt(key.slice(7), 10);
        try {
            const stored = localStorage.getItem("planners_custom_fonts");
            const customs: string[] = stored ? JSON.parse(stored) : [];
            fontValue = customs[idx] ? customs[idx] : FONT_MAP.sans;
        } catch {
            fontValue = FONT_MAP.sans;
        }
    } else {
        fontValue = FONT_MAP[key] ?? FONT_MAP.sans;
    }
    document.documentElement.setAttribute("data-planners-font", key);
    document.documentElement.style.setProperty("--planners-font", fontValue);
}

export function applyPlannersUserFont(key: string) {
    let fontValue: string;
    if (key.startsWith("custom_")) {
        const idx = parseInt(key.slice(7), 10);
        try {
            const stored = localStorage.getItem("planners_custom_fonts");
            const customs: string[] = stored ? JSON.parse(stored) : [];
            fontValue = customs[idx] ? customs[idx] : FONT_MAP.serif;
        } catch {
            fontValue = FONT_MAP.serif;
        }
    } else {
        fontValue = FONT_MAP[key] ?? FONT_MAP.serif;
    }
    document.documentElement.style.setProperty("--planners-user-font", fontValue);

    let el = document.getElementById("planners-user-font-style");
    if (!el) {
        el = document.createElement("style");
        el.id = "planners-user-font-style";
        document.head.appendChild(el);
    }
    el.textContent = `textarea,input[type="text"]{font-family:${fontValue}!important}`;
}

// ── 모서리 반경 테마 ─────────────────────────────────────────────
// sharp: 각짐 (0~2px) | subtle: 살짝 (4px) | soft: 기본 (현재 그대로)
export type PlannersRadius = "sharp" | "subtle" | "soft";

export function applyPlannersRadius(key: PlannersRadius) {
    let el = document.getElementById("planners-radius-override");
    if (!el) {
        el = document.createElement("style");
        el.id = "planners-radius-override";
        document.head.appendChild(el);
    }

    if (key === "soft") {
        el.textContent = "";
        return;
    }

    const lg = key === "sharp" ? "2px" : "6px";
    const md = key === "sharp" ? "2px" : "4px";
    const sm = key === "sharp" ? "1px" : "3px";

    // rounded-full (아바타·배지) 은 유지 — 그 외만 재정의
    el.textContent = `
.rounded-3xl:not(.rounded-full),.rounded-2xl:not(.rounded-full),.rounded-xl:not(.rounded-full){border-radius:${lg}!important}
.rounded-lg:not(.rounded-full){border-radius:${lg}!important}
.rounded-md:not(.rounded-full){border-radius:${md}!important}
.rounded:not(.rounded-full){border-radius:${sm}!important}
.rounded-sm:not(.rounded-full){border-radius:${sm}!important}
`;
}

// ── 라이트/다크 모드 (Phase 1 인프라) ─────────────────────────────
// mode: "light" | "dark" | "system"
// .planners-dark 클래스를 documentElement에 토글. 다른 브랜드 영향 없음.
export type PlannersThemeMode = "light" | "dark" | "system";

export function applyPlannersThemeMode(mode: PlannersThemeMode) {
    const root = document.documentElement;
    const dark = mode === "dark"
        || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("planners-dark", dark);
    root.dataset.plannersMode = mode;
}

export function PlannersThemeProvider() {
    useEffect(() => {
        const storedTheme = localStorage.getItem("planners_color_theme") || "teal";
        const storedFont = localStorage.getItem("planners_font_family") || "sans";
        const storedUserFont = localStorage.getItem("planners_user_font") || "serif";
        const storedMode = (localStorage.getItem("planners_theme_mode") as PlannersThemeMode) || "system";
        const storedRadius = (localStorage.getItem("planners_radius_theme") as PlannersRadius) || "soft";
        applyPlannersTheme(storedTheme);
        applyPlannersFont(storedFont);
        applyPlannersUserFont(storedUserFont);
        applyPlannersThemeMode(storedMode);
        applyPlannersRadius(storedRadius);

        // mode 변경 이벤트 — SettingsView 토글 시 즉시 반영
        function onModeChange(e: Event) {
            const mode = (e as CustomEvent<{ mode: PlannersThemeMode }>).detail?.mode ?? "system";
            applyPlannersThemeMode(mode);
        }
        // 시스템 다크 모드 변경 감지 (mode === "system" 일 때)
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        function onSystemChange() {
            const cur = (localStorage.getItem("planners_theme_mode") as PlannersThemeMode) || "system";
            if (cur === "system") applyPlannersThemeMode("system");
        }
        window.addEventListener("pp-theme-mode-change", onModeChange as EventListener);
        mq.addEventListener("change", onSystemChange);
        return () => {
            window.removeEventListener("pp-theme-mode-change", onModeChange as EventListener);
            mq.removeEventListener("change", onSystemChange);
            // 다른 브랜드로 이동 시 .planners-dark 제거 (영향 차단)
            document.documentElement.classList.remove("planners-dark");
            delete document.documentElement.dataset.plannersMode;
        };
    }, []);

    return null;
}
