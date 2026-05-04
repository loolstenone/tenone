"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import {
    applyPlannersTheme,
    applyPlannersFont,
    applyPlannersUserFont,
    applyPlannersThemeMode,
    applyPlannersRadius,
    type PlannersThemeMode,
    type PlannersRadius,
} from "@/features/planners/PlannersThemeProvider";
import {
    SettingsStylePresets,
    matchPreset,
    type SettingsPreset,
} from "@/features/planners/SettingsStylePresets";
import { GroupMarker } from "@/features/planners/SettingsLayout";

// ── 상수 ─────────────────────────────────────────────────────────────────────

const COLOR_THEMES = [
    { key: "mono",     label: "Mono",    hex: "#171717" },
    { key: "charcoal", label: "Charcoal",hex: "#374151" },
    { key: "slate",    label: "Slate",   hex: "#475569" },
    { key: "brown",    label: "Brown",   hex: "#92400E" },
    { key: "mustard",  label: "Mustard", hex: "#A16207" },
    { key: "amber",    label: "Amber",   hex: "#B45309" },
    { key: "orange",   label: "Orange",  hex: "#C2410C" },
    { key: "coral",    label: "Coral",   hex: "#C2553D" },
    { key: "crimson",  label: "Crimson", hex: "#DC2626" },
    { key: "rose",     label: "Rose",    hex: "#BE185D" },
    { key: "plum",     label: "Plum",    hex: "#86198F" },
    { key: "violet",   label: "Violet",  hex: "#7C3AED" },
    { key: "indigo",   label: "Indigo",  hex: "#4338CA" },
    { key: "navy",     label: "Navy",    hex: "#1E40AF" },
    { key: "sky",      label: "Sky",     hex: "#0369A1" },
    { key: "teal",     label: "Teal",    hex: "#0F766E" },
    { key: "emerald",  label: "Emerald", hex: "#047857" },
    { key: "olive",    label: "Olive",   hex: "#4D7C0F" },
];

const RADIUS_THEMES: { key: PlannersRadius; label: string; desc: string; preview: string }[] = [
    { key: "sharp",  label: "Sharp",  desc: "각진 모서리",  preview: "0px" },
    { key: "subtle", label: "Subtle", desc: "살짝 둥근",   preview: "4px" },
    { key: "soft",   label: "Soft",   desc: "기본 (둥근)", preview: "12px" },
];

const PP_FONT_OPTIONS = [
    { key: "serif",        label: "Serif",    desc: "클래식 · 종이 감성",       fontClass: "font-serif" },
    { key: "strong-serif", label: "강한 세리프", desc: "묵직 · 고급 (Playfair)",  fontClass: "font-serif font-bold" },
    { key: "sans",         label: "Sans",     desc: "모던 · 깔끔",              fontClass: "font-sans" },
    { key: "gothic",       label: "고딕",      desc: "나눔고딕 · 한국어",         fontClass: "font-sans" },
    { key: "mono",         label: "Mono",     desc: "정밀 · 코드",              fontClass: "font-mono" },
    { key: "round",        label: "둥근",      desc: "부드러움 · 친근함",         fontClass: "font-sans" },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
    save: (patch: Record<string, unknown>) => Promise<void>;
    showToast: (text: string, ok?: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SettingsTheme({ save: _save, showToast: _showToast }: Props) {
    const [colorTheme, setColorTheme]         = useState("teal");
    const [radiusTheme, setRadiusTheme]       = useState<PlannersRadius>("soft");
    const [fontFamily, setFontFamily]         = useState("sans");
    const [themeMode, setThemeMode]           = useState<PlannersThemeMode>("system");
    const [userFontFamily, setUserFontFamily] = useState("serif");
    const [customFonts, setCustomFonts]       = useState<string[]>(["", "", "", "", "", ""]);
    const [styleAdvancedOpen, setStyleAdvancedOpen] = useState(false);

    // localStorage 초기화
    useEffect(() => {
        if (typeof window === "undefined") return;
        const savedTheme  = localStorage.getItem("myverse_color_theme");
        const savedFont   = localStorage.getItem("myverse_font_family");
        const savedUser   = localStorage.getItem("myverse_user_font");
        const savedMode   = localStorage.getItem("myverse_theme_mode") as PlannersThemeMode | null;
        const savedRadius = localStorage.getItem("myverse_radius_theme") as PlannersRadius | null;
        if (savedTheme)  setColorTheme(savedTheme);
        if (savedFont)   setFontFamily(savedFont);
        if (savedUser)   setUserFontFamily(savedUser);
        if (savedMode === "light" || savedMode === "dark" || savedMode === "system") setThemeMode(savedMode);
        if (savedRadius === "sharp" || savedRadius === "subtle" || savedRadius === "soft") setRadiusTheme(savedRadius);
        try {
            const savedCustom = localStorage.getItem("myverse_custom_fonts");
            if (savedCustom) setCustomFonts(JSON.parse(savedCustom));
        } catch { /* ignore */ }
    }, []);

    // ── Apply helpers ─────────────────────────────────────────────────────────

    function applyTheme(key: string) {
        setColorTheme(key);
        localStorage.setItem("myverse_color_theme", key);
        applyPlannersTheme(key);
    }

    function applyMode(mode: PlannersThemeMode) {
        setThemeMode(mode);
        localStorage.setItem("myverse_theme_mode", mode);
        applyPlannersThemeMode(mode);
        window.dispatchEvent(new CustomEvent("pp-theme-mode-change", { detail: { mode } }));
    }

    function applyFont(key: string) {
        setFontFamily(key);
        localStorage.setItem("myverse_font_family", key);
        applyPlannersFont(key);
    }

    function applyUserFont(key: string) {
        setUserFontFamily(key);
        localStorage.setItem("myverse_user_font", key);
        applyPlannersUserFont(key);
    }

    function applyRadius(key: PlannersRadius) {
        setRadiusTheme(key);
        localStorage.setItem("myverse_radius_theme", key);
        applyPlannersRadius(key);
    }

    function applyPreset(p: SettingsPreset) {
        setColorTheme(p.color);
        setRadiusTheme(p.radius);
        setFontFamily(p.font);
        setUserFontFamily(p.userFont);
        setThemeMode(p.mode);
        localStorage.setItem("myverse_color_theme",  p.color);
        localStorage.setItem("myverse_radius_theme", p.radius);
        localStorage.setItem("myverse_font_family",  p.font);
        localStorage.setItem("myverse_user_font",    p.userFont);
        localStorage.setItem("myverse_theme_mode",   p.mode);
        applyPlannersTheme(p.color);
        applyPlannersRadius(p.radius);
        applyPlannersFont(p.font);
        applyPlannersUserFont(p.userFont);
        applyPlannersThemeMode(p.mode);
        window.dispatchEvent(new CustomEvent("pp-theme-mode-change", { detail: { mode: p.mode } }));
    }

    const currentPresetKey = matchPreset(colorTheme, radiusTheme, fontFamily, userFontFamily, themeMode);

    // ── JSX ───────────────────────────────────────────────────────────────────

    return (
        <>
            <GroupMarker group="style" no="02" label="스타일" />

            {/* 스타일 프리셋 */}
            <section id="sec-style-presets" className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="mb-1">
                    <h2 className="text-sm font-semibold text-neutral-900">스타일 프리셋</h2>
                </div>
                <p className="text-xs text-neutral-400 mb-4">한 번 탭으로 화면 모드 · 컬러 · 모서리 · 폰트 2종을 동시에 바꿉니다.</p>
                <SettingsStylePresets
                    activePresetKey={currentPresetKey}
                    onApply={applyPreset}
                />
                {/* 모바일 전용: 고급 설정 토글 */}
                <button
                    type="button"
                    onClick={() => setStyleAdvancedOpen(o => !o)}
                    className="lg:hidden mt-4 w-full flex items-center justify-center gap-1 py-2 text-xs text-neutral-500 hover:text-[#0F766E] transition-colors"
                >
                    {styleAdvancedOpen ? "고급 설정 접기 ▲" : "고급 설정 직접 조정 ▼"}
                </button>
            </section>

            {/* 모바일: styleAdvancedOpen 일 때만 / PC: 항상 표시 */}
            <div className={`space-y-5 ${styleAdvancedOpen ? "" : "hidden lg:block lg:space-y-5"}`}>

                {/* 화면 모드 */}
                <section id="sec-display" className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-900">화면 모드</h2>
                            <p className="text-[11px] text-neutral-400 mt-0.5">배터리 절약, 눈 피로 감소 등을 위해 필요한 모드를 선택하세요.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {([
                            { key: "light",  label: "라이트", icon: Sun },
                            { key: "system", label: "시스템", icon: Monitor },
                            { key: "dark",   label: "다크",   icon: Moon },
                        ] as const).map((m) => {
                            const active = themeMode === m.key;
                            const Icon = m.icon;
                            return (
                                <button
                                    key={m.key}
                                    onClick={() => applyMode(m.key)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                        active
                                            ? "border-[#0F766E] text-[#0F766E] bg-[#0F766E]/5"
                                            : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
                    {themeMode === "system" && (
                        <p className="mt-2 text-[11px] text-neutral-400">사용하고 있는 기기의 설정에 따릅니다.</p>
                    )}
                </section>

                {/* 컬러 테마 */}
                <section id="sec-color" className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">컬러 테마</h2>
                    <div className="grid grid-cols-6 sm:grid-cols-9 gap-x-4 gap-y-3">
                        {COLOR_THEMES.map((t) => {
                            const active = colorTheme === t.key;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => applyTheme(t.key)}
                                    title={t.label}
                                    className="flex flex-col items-center gap-1.5 group"
                                >
                                    <span
                                        className={`h-8 w-8 rounded-full transition-all ${
                                            active ? "scale-110" : "group-hover:scale-105"
                                        }`}
                                        style={{
                                            backgroundColor: t.hex,
                                            outline: active ? `3px solid ${t.hex}` : "none",
                                            outlineOffset: "3px",
                                        }}
                                    />
                                    <span className={`text-[10px] font-mono ${active ? "text-neutral-900 font-semibold" : "text-neutral-400"}`}>
                                        {t.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 모서리 */}
                <section id="sec-radius" className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">모서리</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {RADIUS_THEMES.map((r) => {
                            const active = radiusTheme === r.key;
                            return (
                                <button
                                    key={r.key}
                                    onClick={() => applyRadius(r.key)}
                                    className={`flex flex-col items-center gap-2 p-3 border-2 transition-colors ${
                                        active
                                            ? "border-[#0F766E] bg-[#0F766E]/5"
                                            : "border-neutral-200 hover:border-neutral-300"
                                    }`}
                                >
                                    <div className="w-8 h-8" style={{ borderRadius: r.preview, backgroundColor: "var(--pp-ink)" }} />
                                    <span className={`text-xs font-semibold ${active ? "text-[#0F766E]" : "text-neutral-600"}`}>
                                        {r.label}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">{r.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 폰트 */}
                <section id="sec-font" className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">폰트</h2>
                    <div className="space-y-6">
                        {/* 화면 글꼴 */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-0.5">화면 글꼴</p>
                            <p className="text-[10px] text-neutral-400 mb-3">메뉴·버튼·라벨 등 화면 전체에 적용</p>
                            <div className="grid grid-cols-3 gap-2">
                                {PP_FONT_OPTIONS.map((f) => {
                                    const active = fontFamily === f.key;
                                    return (
                                        <button
                                            key={f.key}
                                            onClick={() => applyFont(f.key)}
                                            className={`flex flex-col py-3 px-3 rounded-lg text-left border-2 transition-colors ${
                                                active ? "border-[#0F766E] bg-[#0F766E]/5" : "border-neutral-200 hover:border-neutral-300"
                                            }`}
                                        >
                                            <span className={`text-xl mb-1 ${f.fontClass} ${active ? "text-[#0F766E]" : "text-neutral-900"}`}>Aa</span>
                                            <span className={`text-xs font-semibold leading-tight ${active ? "text-[#0F766E]" : "text-neutral-600"}`}>{f.label}</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{f.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {/* 입력 글꼴 */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-0.5">입력 글꼴</p>
                            <p className="text-[10px] text-neutral-400 mb-3">노트·할 일 등 직접 입력하는 내용에 적용</p>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {PP_FONT_OPTIONS.map((f) => {
                                    const active = userFontFamily === f.key;
                                    return (
                                        <button
                                            key={f.key}
                                            onClick={() => applyUserFont(f.key)}
                                            className={`flex flex-col py-3 px-3 rounded-lg text-left border-2 transition-colors ${
                                                active ? "border-[#0F766E] bg-[#0F766E]/5" : "border-neutral-200 hover:border-neutral-300"
                                            }`}
                                        >
                                            <span className={`text-xl mb-1 ${f.fontClass} ${active ? "text-[#0F766E]" : "text-neutral-900"}`}>Aa</span>
                                            <span className={`text-xs font-semibold leading-tight ${active ? "text-[#0F766E]" : "text-neutral-600"}`}>{f.label}</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{f.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-neutral-400 mb-2">직접 입력 — 글꼴 이름을 입력하세요. 예: &apos;Noto Sans KR&apos;, Georgia</p>
                            <div className="grid grid-cols-3 gap-2">
                                {customFonts.map((cf, idx) => {
                                    const key = `custom_${idx}`;
                                    const active = userFontFamily === key;
                                    return (
                                        <div
                                            key={idx}
                                            className={`rounded-lg border-2 transition-colors overflow-hidden ${
                                                active ? "border-[#0F766E]" : "border-neutral-200"
                                            }`}
                                        >
                                            <button
                                                onClick={() => { if (cf.trim()) applyUserFont(key); }}
                                                disabled={!cf.trim()}
                                                className={`w-full py-3 px-3 text-left transition-colors disabled:opacity-40 ${
                                                    active ? "bg-[#0F766E]/5" : "hover:bg-neutral-50"
                                                }`}
                                            >
                                                <span
                                                    className={`block text-xl mb-1 ${active ? "text-[#0F766E]" : "text-neutral-900"}`}
                                                    style={{ fontFamily: cf.trim() || undefined }}
                                                >
                                                    Aa
                                                </span>
                                                <span className={`block text-xs font-semibold leading-tight ${active ? "text-[#0F766E]" : "text-neutral-400"}`}>
                                                    커스텀 {idx + 1}
                                                </span>
                                            </button>
                                            <div className="px-2 pb-2">
                                                <input
                                                    type="text"
                                                    value={cf}
                                                    placeholder="font-family"
                                                    onChange={(e) => {
                                                        const next = [...customFonts];
                                                        next[idx] = e.target.value;
                                                        setCustomFonts(next);
                                                        localStorage.setItem("myverse_custom_fonts", JSON.stringify(next));
                                                        if (userFontFamily === key) applyUserFont(key);
                                                    }}
                                                    className="w-full text-[10px] border border-neutral-200 rounded px-1.5 py-1 focus:outline-none focus:border-[#0F766E] bg-white text-neutral-700 placeholder:text-neutral-300"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

            </div>{/* end advanced wrapper */}
        </>
    );
}
