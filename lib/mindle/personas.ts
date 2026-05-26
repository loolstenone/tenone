// Mindle 페르소나 SSOT — Phase 1-C
//
// 4종 (founder · planner · reporter · marketer)
// 진입 경로: /mindle?persona=founder 등 query param

import { createAdminClient } from "@/lib/supabase/admin";

export interface MindlePersona {
    key: string;
    name_ko: string;
    description: string;
    tagline: string | null;
    icon_name: string;
    accent_color: string | null;
    default_categories: string[];
    sort_order: number;
}

/** 4 페르소나 fetch (캐시 가능) */
export async function fetchPersonas(): Promise<MindlePersona[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("mindle_personas")
        .select("key, name_ko, description, tagline, icon_name, accent_color, default_categories, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
    if (error) {
        console.error("[mindle/personas] fetch failed:", error.message);
        return [];
    }
    return (data ?? []) as MindlePersona[];
}

/** 단건 fetch */
export async function fetchPersona(key: string): Promise<MindlePersona | null> {
    const admin = createAdminClient();
    const { data } = await admin
        .from("mindle_personas")
        .select("key, name_ko, description, tagline, icon_name, accent_color, default_categories, sort_order")
        .eq("key", key)
        .eq("is_active", true)
        .maybeSingle();
    return (data as MindlePersona | null) ?? null;
}

/** 페르소나 키 검증 */
export const PERSONA_KEYS = ["founder", "planner", "reporter", "marketer"] as const;
export type PersonaKey = typeof PERSONA_KEYS[number];

export function isValidPersonaKey(key: string | undefined): key is PersonaKey {
    return !!key && (PERSONA_KEYS as readonly string[]).includes(key);
}
