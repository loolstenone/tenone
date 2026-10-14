"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AiTone } from "@/lib/myverse/types";
import { SettingsLayout } from "@/features/myverse/planner/SettingsLayout";
import { SettingsAi } from "@/features/myverse/planner/settings/SettingsAi";
import { SettingsNotifications } from "@/features/myverse/planner/settings/SettingsNotifications";
import { useSettingsSave } from "@/features/myverse/planner/settings/useSettingsSave";

export default function SettingsBehaviorPage() {
    const { save, showToast, toastMsg } = useSettingsSave();
    const [loading, setLoading] = useState(true);
    const [tone, setTone] = useState<AiTone>("friendly");
    const [contextScope, setContextScope] = useState<string[]>(["identity", "weekly", "monthly", "projects"]);
    const [trackingMetrics, setTrackingMetrics] = useState<string[]>([]);
    const [noteShortcuts, setNoteShortcuts] = useState<string[]>(["gratitude", "emotion"]);
    const [countryPref, setCountryPref] = useState<string[]>(["KR"]);
    const [projectLinks] = useState<Record<string, string | null>>(() => {
        if (typeof window === "undefined") return {};
        try { return JSON.parse(localStorage.getItem("myverse_tracking_projects") || "{}"); }
        catch { return {}; }
    });
    const [email, setEmail] = useState(true);
    const [push, setPush] = useState(false);
    const [pushSupported, setPushSupported] = useState(false);
    const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/myverse/settings");
            if (res.ok) {
                const d = await res.json();
                if (d.user) {
                    if (d.user.ai_tone) setTone(d.user.ai_tone);
                    if (d.user.ai_context_scope?.length) setContextScope(d.user.ai_context_scope);
                    if (Array.isArray(d.user.daily_tracking_metrics)) setTrackingMetrics(d.user.daily_tracking_metrics);
                    if (Array.isArray(d.user.daily_note_shortcuts)) setNoteShortcuts(d.user.daily_note_shortcuts);
                    if (Array.isArray(d.user.country_pref) && d.user.country_pref.length) setCountryPref(d.user.country_pref);
                    setEmail(!!d.user.notify_email_briefing);
                    setPush(!!d.user.notify_push_briefing);
                }
            }
            if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
                setPushSupported(true);
                setPushPermission(Notification.permission);
            }
            setLoading(false);
        })();
    }, []);

    if (loading) return <div className="py-16 text-center text-neutral-400 text-sm"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>;

    return (
        <SettingsLayout toast={toastMsg}>
            <div className="space-y-5">
                <SettingsAi
                    initialTone={tone}
                    initialContextScope={contextScope}
                    initialTrackingMetrics={trackingMetrics}
                    initialNoteShortcuts={noteShortcuts}
                    initialCountryPref={countryPref}
                    initialProjectLinks={projectLinks}
                    save={save}
                    showToast={showToast}
                />
                <SettingsNotifications
                    initialEmail={email}
                    initialPush={push}
                    initialPushSupported={pushSupported}
                    initialPushPermission={pushPermission}
                    save={save}
                    showToast={showToast}
                />
            </div>
        </SettingsLayout>
    );
}
