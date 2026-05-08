"use client";

import { SettingsLayout } from "@/features/myverse/planner/SettingsLayout";
import { SettingsTheme } from "@/features/myverse/planner/settings/SettingsTheme";
import { useSettingsSave } from "@/features/myverse/planner/settings/useSettingsSave";

export default function SettingsStylePage() {
    const { save, showToast, toastMsg } = useSettingsSave();
    return (
        <SettingsLayout toast={toastMsg}>
            <SettingsTheme save={save} showToast={showToast} />
        </SettingsLayout>
    );
}
