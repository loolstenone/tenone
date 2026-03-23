"use client";

import { useTheme } from "@/lib/theme-context";
import { useRef, useCallback } from "react";

export function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleToggle = useCallback(() => {
        const newBg = isDark ? "#ffffff" : "#0a0a0a";
        const transitions = [
            { from: "inset(0 100% 0 0)", to: "inset(0 0 0 0)" },
            { from: "inset(0 0 0 100%)", to: "inset(0 0 0 0)" },
            { from: "inset(0 0 100% 0)", to: "inset(0 0 0 0)" },
            { from: "inset(100% 0 0 0)", to: "inset(0 0 0 0)" },
            { from: "polygon(0 0, 0 0, 0 0)", to: "polygon(0 0, 200% 0, 0 200%)" },
            { from: "polygon(100% 0, 100% 0, 100% 0)", to: "polygon(100% 0, -100% 0, 100% 200%)" },
        ];
        const t = transitions[Math.floor(Math.random() * transitions.length)];
        const overlay = document.createElement("div");
        overlay.style.cssText = `position:fixed;inset:0;z-index:99999;background:${newBg};clip-path:${t.from};transition:clip-path 0.5s cubic-bezier(0.4,0,0.2,1);pointer-events:none;`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => { overlay.style.clipPath = t.to; });
        setTimeout(() => {
            toggleTheme();
            setTimeout(() => { overlay.style.opacity = "0"; overlay.style.transition = "opacity 0.15s ease"; setTimeout(() => overlay.remove(), 150); }, 50);
        }, 450);
    }, [isDark, toggleTheme]);

    return (
        <button
            ref={btnRef}
            onClick={handleToggle}
            className="relative shrink-0"
            style={{ width: 48, height: 26 }}
            title={isDark ? "라이트 모드" : "다크 모드"}
        >
            {/* 트랙 — 3D 입체 */}
            <div
                className="absolute inset-0 rounded-full transition-all duration-300"
                style={{
                    background: isDark
                        ? "linear-gradient(180deg, #1a1a1a 0%, #333 50%, #222 100%)"
                        : "linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 50%, #c0c0c0 100%)",
                    boxShadow: isDark
                        ? "inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.3)"
                        : "inset 0 2px 4px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.1)",
                }}
            />
            {/* 썸(dot) — 3D 구체 */}
            <div
                className="absolute top-[3px] rounded-full transition-all duration-300"
                style={{
                    width: 20,
                    height: 20,
                    left: isDark ? 25 : 3,
                    background: isDark
                        ? "radial-gradient(circle at 35% 35%, #fff 0%, #ddd 50%, #bbb 100%)"
                        : "radial-gradient(circle at 35% 35%, #555 0%, #333 50%, #111 100%)",
                    boxShadow: isDark
                        ? "0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2), inset 0 -1px 1px rgba(0,0,0,0.1)"
                        : "0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.1)",
                }}
            >
                {/* 하이라이트 반사 */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 6,
                        height: 4,
                        top: 4,
                        left: 5,
                        background: isDark
                            ? "radial-gradient(ellipse, rgba(255,255,255,0.7), transparent)"
                            : "radial-gradient(ellipse, rgba(255,255,255,0.3), transparent)",
                    }}
                />
            </div>
        </button>
    );
}
