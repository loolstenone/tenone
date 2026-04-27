"use client";

import { useEffect } from "react";

const COLOR_MAP: Record<string, { hex: string; dark: string }> = {
    teal:   { hex: "#0F766E", dark: "#0d5e56" },
    sage:   { hex: "#4A7C59", dark: "#3a6245" },
    slate:  { hex: "#475569", dark: "#334155" },
    rose:   { hex: "#BE185D", dark: "#9d1353" },
    amber:  { hex: "#B45309", dark: "#92400e" },
    indigo: { hex: "#4338CA", dark: "#3730a3" },
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
};

export function applyPlannersFont(key: string) {
    document.documentElement.setAttribute("data-planners-font", key);
    document.documentElement.style.setProperty("--planners-font", FONT_MAP[key] ?? FONT_MAP.serif);
}

export function PlannersThemeProvider() {
    useEffect(() => {
        const storedTheme = localStorage.getItem("planners_color_theme") || "teal";
        const storedFont = localStorage.getItem("planners_font_family") || "sans";
        applyPlannersTheme(storedTheme);
        applyPlannersFont(storedFont);
    }, []);

    return null;
}
