"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSetting, setSetting } from "@/lib/supabase/settings";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => {},
    isDark: false,
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        // 즉시: localStorage에서 먼저 로드 (깜빡임 방지)
        const saved = localStorage.getItem("tenone-theme") as Theme | null;
        if (saved) {
            setTheme(saved);
            document.documentElement.setAttribute("data-theme", saved);
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }

        // 비동기: DB에서 로드 (로그인 사용자)
        getSetting<{ v: Theme }>('tenone', 'theme', 'tenone-theme').then(result => {
            if (result && typeof result === 'object' && 'v' in result) {
                const dbTheme = result.v;
                if (dbTheme && dbTheme !== (saved || 'dark')) {
                    setTheme(dbTheme);
                    document.documentElement.setAttribute("data-theme", dbTheme);
                    localStorage.setItem("tenone-theme", dbTheme);
                }
            }
        }).catch(() => {});
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const next = prev === "light" ? "dark" : "light";
            localStorage.setItem("tenone-theme", next);
            document.documentElement.setAttribute("data-theme", next);
            setSetting('tenone', 'theme', { v: next }, 'tenone-theme').catch(() => {});
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    );
}
