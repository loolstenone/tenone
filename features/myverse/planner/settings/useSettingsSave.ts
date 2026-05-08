"use client";

import { useState, useCallback } from "react";

export function useSettingsSave() {
    const [saving, setSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const showToast = useCallback((text: string, ok = true) => {
        setToastMsg({ text, ok });
        setTimeout(() => setToastMsg(null), 3000);
    }, []);

    async function save(patch: Record<string, unknown>) {
        setSaving(true);
        try {
            const res = await fetch("/api/myverse/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            if (res.ok) {
                showToast("저장되었습니다");
            } else {
                const err = await res.json().catch(() => ({}));
                showToast(`저장 실패: ${err.error || res.status}`, false);
            }
        } catch (e) {
            showToast(`네트워크 오류: ${(e as Error).message}`, false);
        } finally {
            setSaving(false);
        }
    }

    return { save, saving, showToast, toastMsg };
}
