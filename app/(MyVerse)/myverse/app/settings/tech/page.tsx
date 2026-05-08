"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ActivityBase } from "@/lib/myverse/types";
import { ALL_NAV_OPTIONS, MOBILE_NAV_STORAGE_KEY, MOBILE_NAV_DEFAULT } from "@/features/myverse/planner/MobileBottomNav";
import { SettingsLayout } from "@/features/myverse/planner/SettingsLayout";
import { SettingsIntegrations } from "@/features/myverse/planner/settings/SettingsIntegrations";
import { SettingsBases } from "@/features/myverse/planner/settings/SettingsBases";
import { SettingsExport } from "@/features/myverse/planner/settings/SettingsExport";
import { useSettingsSave } from "@/features/myverse/planner/settings/useSettingsSave";

function MobileNavSection() {
    const [selected, setSelected] = useState<string[]>(MOBILE_NAV_DEFAULT);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(MOBILE_NAV_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length === 5) setSelected(parsed);
            }
        } catch { /* ignore */ }
    }, []);

    function toggle(id: string) {
        setSelected(prev => {
            const next = prev.includes(id)
                ? prev.filter(i => i !== id)
                : prev.length >= 5 ? prev : [...prev, id];
            localStorage.setItem(MOBILE_NAV_STORAGE_KEY, JSON.stringify(next));
            window.dispatchEvent(new CustomEvent("myverse-mobile-nav-change"));
            return next;
        });
    }

    const full = selected.length >= 5;
    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-5 md:hidden">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xs uppercase tracking-widest text-neutral-400">스마트폰 하단 메뉴</h2>
                    <p className="text-[11px] text-neutral-400 mt-0.5">5개 선택 ({selected.length}/5)</p>
                </div>
                <button
                    onClick={() => { setSelected(MOBILE_NAV_DEFAULT); localStorage.setItem(MOBILE_NAV_STORAGE_KEY, JSON.stringify(MOBILE_NAV_DEFAULT)); window.dispatchEvent(new CustomEvent("myverse-mobile-nav-change")); }}
                    className="text-[11px] text-neutral-400 hover:text-[#6366F1]"
                >기본값으로</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {ALL_NAV_OPTIONS.map((opt: { id: string; label: string }) => {
                    const on = selected.includes(opt.id);
                    return (
                        <button
                            key={opt.id}
                            onClick={() => toggle(opt.id)}
                            disabled={!on && full}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                                on ? "bg-[#6366F1] text-white border-[#6366F1]"
                                : full ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed"
                                : "bg-white text-neutral-600 border-neutral-200 hover:border-[#6366F1]"
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${on ? "bg-white" : "bg-neutral-300"}`} />
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default function SettingsTechPage() {
    const { save, showToast, toastMsg } = useSettingsSave();
    const [loading, setLoading] = useState(true);
    const [bases, setBases] = useState<ActivityBase[]>([]);
    const [sub, setSub] = useState<{ status: string; expires: string | null; is_pdf_buyer: boolean }>({ status: "free", expires: null, is_pdf_buyer: false });

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/myverse/settings");
            if (res.ok) {
                const d = await res.json();
                if (d.user) {
                    if (Array.isArray(d.user.activity_bases)) setBases(d.user.activity_bases);
                    setSub({ status: d.user.subscription_status || "free", expires: d.user.subscription_expires_at || null, is_pdf_buyer: !!d.user.is_pdf_buyer });
                }
            }
            setLoading(false);
        })();
    }, []);

    if (loading) return <div className="py-16 text-center text-neutral-400 text-sm"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>;

    return (
        <SettingsLayout toast={toastMsg}>
            <div className="space-y-5">
                <SettingsIntegrations
                    showToast={showToast}
                    afterLocationSlot={
                        <SettingsBases initialBases={bases} save={save} showToast={showToast} />
                    }
                />
                <SettingsExport sub={sub} showToast={showToast} />
                <MobileNavSection />
            </div>
        </SettingsLayout>
    );
}
