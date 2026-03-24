/**
 * HeRo Supabase CRUD 함수
 * hit_results, career_profiles, resumes 테이블
 */
import { createClient } from './client';

const supabase = createClient();

// ── HIT 검사 ──

export async function fetchHitResults(memberId: string) {
    const { data, error } = await supabase
        .from('hit_results')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function saveHitResult(result: {
    member_id: string;
    test_type: string;
    scores: Record<string, unknown>;
    summary?: string;
}) {
    const { data, error } = await supabase
        .from('hit_results')
        .insert({ ...result, completed_at: new Date().toISOString() })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── 커리어 프로필 ──

export async function fetchCareerProfile(memberId: string) {
    const { data, error } = await supabase
        .from('career_profiles')
        .select('*')
        .eq('member_id', memberId)
        .single();
    if (error) return null;
    return data;
}

export async function upsertCareerProfile(memberId: string, profile: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('career_profiles')
        .upsert({
            member_id: memberId,
            ...profile,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'member_id' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── 이력서 ──

export async function fetchResumes(memberId: string) {
    const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('member_id', memberId)
        .order('is_primary', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function createResume(resume: {
    member_id: string;
    title: string;
    content: Record<string, unknown>;
    is_primary?: boolean;
}) {
    const { data, error } = await supabase
        .from('resumes')
        .insert(resume)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateResume(id: string, updates: Record<string, unknown>) {
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
        .from('resumes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteResume(id: string) {
    const { error } = await supabase.from('resumes').delete().eq('id', id);
    if (error) throw error;
}
