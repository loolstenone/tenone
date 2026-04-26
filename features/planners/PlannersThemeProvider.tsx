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
    // ⚠️ 반드시 ~= (whitespace-separated word 매치) 사용.
    // *= (substring match)는 hover:bg-[hex]/5 같은 변형까지 모두 잡아서
    // !important로 항상 색이 덮이는 치명적 버그를 만든다.
    el.textContent = `
[class~="bg-[${h}]"]{background-color:var(--planners-accent)!important}
[class~="hover:bg-[${h}]"]:hover{background-color:var(--planners-accent)!important}
[class~="text-[${h}]"]{color:var(--planners-accent)!important}
[class~="hover:text-[${h}]"]:hover{color:var(--planners-accent)!important}
[class~="border-[${h}]"]{border-color:var(--planners-accent)!important}
[class~="hover:border-[${h}]"]:hover{border-color:var(--planners-accent)!important}
[class~="focus:border-[${h}]"]:focus{border-color:var(--planners-accent)!important}
[class~="from-[${h}]"]{--tw-gradient-from:var(--planners-accent)!important}
[class~="to-[${h}]"]{--tw-gradient-to:var(--planners-accent)!important}
[class~="ring-[${h}]"]{--tw-ring-color:var(--planners-accent)!important}
[class~="bg-[${h}]/5"]{background-color:color-mix(in srgb,var(--planners-accent) 5%,transparent)!important}
[class~="bg-[${h}]/10"]{background-color:color-mix(in srgb,var(--planners-accent) 10%,transparent)!important}
[class~="bg-[${h}]/20"]{background-color:color-mix(in srgb,var(--planners-accent) 20%,transparent)!important}
[class~="hover:bg-[${h}]/5"]:hover{background-color:color-mix(in srgb,var(--planners-accent) 5%,transparent)!important}
[class~="hover:bg-[${h}]/10"]:hover{background-color:color-mix(in srgb,var(--planners-accent) 10%,transparent)!important}
[class~="text-[${h}]/70"]{color:color-mix(in srgb,var(--planners-accent) 70%,transparent)!important}
[class~="bg-[${d}]"]{background-color:var(--planners-accent-dark)!important}
[class~="hover:bg-[${d}]"]:hover{background-color:var(--planners-accent-dark)!important}
[class~="text-[${d}]"]{color:var(--planners-accent-dark)!important}
`;
}

export function PlannersThemeProvider() {
    useEffect(() => {
        const stored = localStorage.getItem("planners_color_theme") || "teal";
        applyPlannersTheme(stored);
    }, []);

    return null;
}
