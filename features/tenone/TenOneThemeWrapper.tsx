"use client";

import { ThemeProvider } from "@/lib/theme-context";

export function TenOneThemeWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <div className="tn-themed min-h-screen flex flex-col selection:bg-neutral-200"
                style={{ backgroundColor: "var(--tn-bg)", color: "var(--tn-text)" }}>
                {children}
            </div>
        </ThemeProvider>
    );
}
