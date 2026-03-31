/**
 * User Settings CRUD
 * localStorage → Supabase 전환을 위한 범용 설정 저장소
 *
 * 패턴: DB 우선, 실패 시 localStorage fallback
 */
import { createClient } from './client';

const supabase = createClient();

/**
 * 설정 값 가져오기
 * DB 우선 → localStorage fallback
 */
export async function getSetting<T = unknown>(
    app: string,
    key: string,
    localStorageKey?: string,
): Promise<T | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('not authenticated');

        const { data, error } = await supabase
            .from('user_settings')
            .select('value')
            .eq('user_id', user.id)
            .eq('app', app)
            .eq('key', key)
            .single();

        if (!error && data) return data.value as T;
    } catch {
        // DB 실패 → localStorage fallback
    }

    // localStorage fallback
    if (localStorageKey && typeof window !== 'undefined') {
        try {
            const raw = localStorage.getItem(localStorageKey);
            if (raw) return JSON.parse(raw) as T;
        } catch {
            const raw = localStorage.getItem(localStorageKey);
            return raw as unknown as T;
        }
    }

    return null;
}

/**
 * 설정 값 저장 (upsert)
 * DB + localStorage 동시 저장 (오프라인 대비)
 */
export async function setSetting<T = unknown>(
    app: string,
    key: string,
    value: T,
    localStorageKey?: string,
): Promise<void> {
    // localStorage에도 항상 백업
    if (localStorageKey && typeof window !== 'undefined') {
        try {
            localStorage.setItem(localStorageKey, typeof value === 'string' ? value : JSON.stringify(value));
        } catch { /* quota exceeded 등 무시 */ }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('user_settings')
            .upsert({
                user_id: user.id,
                app,
                key,
                value: typeof value === 'object' ? value : { v: value },
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,app,key',
            });
    } catch {
        // DB 저장 실패는 무시 (localStorage에 이미 저장됨)
    }
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

        await supabase
            .from('user_settings')
            .delete()
            .eq('user_id', user.id)
            .eq('app', app)
            .eq('key', key);
    } catch {
        // 무시
    }
}
