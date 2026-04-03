/**
 * User Settings CRUD
 * localStorage → Supabase 전환 (DB-first, localStorage fallback)
 *
 * 테이블 스키마:
 *   user_settings (member_id UUID PK, settings JSONB, updated_at)
 *   settings JSONB 구조: { "[app]": { "[key]": value } }
 */
import { createClient } from './client';

const supabase = createClient();

// ── 전체 settings JSONB 가져오기 ──
async function fetchAllSettings(memberId: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('member_id', memberId)
        .maybeSingle();
    if (error || !data) return {};
    return (data.settings as Record<string, unknown>) || {};
}

// ── 전체 settings JSONB 저장 (upsert) ──
async function saveAllSettings(memberId: string, settings: Record<string, unknown>): Promise<void> {
    await supabase
        .from('user_settings')
        .upsert({ member_id: memberId, settings, updated_at: new Date().toISOString() }, {
            onConflict: 'member_id',
        });
}

/**
 * 설정 값 가져오기 (DB 우선 → localStorage fallback)
 */
export async function getSetting<T = unknown>(
    app: string,
    key: string,
    localStorageKey?: string,
): Promise<T | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('not authenticated');

        const all = await fetchAllSettings(user.id);
        const appSettings = (all[app] as Record<string, unknown>) || {};
        if (key in appSettings) return appSettings[key] as T;
    } catch {
        // DB 실패 → localStorage fallback
    }

    if (localStorageKey && typeof window !== 'undefined') {
        try {
            const raw = localStorage.getItem(localStorageKey);
            if (raw !== null) return JSON.parse(raw) as T;
        } catch {
            const raw = localStorage.getItem(localStorageKey);
            return raw as unknown as T;
        }
    }

    return null;
}

/**
 * 설정 값 저장 (DB + localStorage 동시 저장)
 */
export async function setSetting<T = unknown>(
    app: string,
    key: string,
    value: T,
    localStorageKey?: string,
): Promise<void> {
    // localStorage 백업 (오프라인 대비)
    if (localStorageKey && typeof window !== 'undefined') {
        try {
            localStorage.setItem(localStorageKey, typeof value === 'string' ? value : JSON.stringify(value));
        } catch { /* quota exceeded 무시 */ }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const all = await fetchAllSettings(user.id);
        const appSettings = (all[app] as Record<string, unknown>) || {};
        const updated = { ...all, [app]: { ...appSettings, [key]: value } };
        await saveAllSettings(user.id, updated);
    } catch {
        // DB 저장 실패 무시 (localStorage에 저장됨)
    }
}

/**
 * 앱의 전체 설정 객체 저장 (bulk upsert)
 */
export async function setAppSettings<T extends Record<string, unknown>>(
    app: string,
    values: T,
    localStorageKey?: string,
): Promise<void> {
    if (localStorageKey && typeof window !== 'undefined') {
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(values));
        } catch { /* 무시 */ }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const all = await fetchAllSettings(user.id);
        const updated = { ...all, [app]: values };
        await saveAllSettings(user.id, updated);
    } catch { /* 무시 */ }
}

/**
 * 앱의 전체 설정 객체 가져오기
 */
export async function getAppSettings<T extends Record<string, unknown>>(
    app: string,
    localStorageKey?: string,
): Promise<T | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('not authenticated');

        const all = await fetchAllSettings(user.id);
        if (app in all && all[app]) return all[app] as T;
    } catch { /* fallback */ }

    if (localStorageKey && typeof window !== 'undefined') {
        try {
            const raw = localStorage.getItem(localStorageKey);
            if (raw) return JSON.parse(raw) as T;
        } catch { /* 무시 */ }
    }

    return null;
}

/**
 * 설정 삭제
 */
export async function deleteSetting(
    app: string,
    key: string,
    localStorageKey?: string,
): Promise<void> {
    if (localStorageKey && typeof window !== 'undefined') {
        localStorage.removeItem(localStorageKey);
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const all = await fetchAllSettings(user.id);
        const appSettings = { ...((all[app] as Record<string, unknown>) || {}) };
        delete appSettings[key];
        const updated = { ...all, [app]: appSettings };
        await saveAllSettings(user.id, updated);
    } catch { /* 무시 */ }
}
