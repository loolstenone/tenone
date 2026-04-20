import { createClient } from './client';

export type CapabilityKey =
    | 'community' | 'meetup' | 'club' | 'portfolio'
    | 'membership' | 'course' | 'showcase' | 'subscription' | 'purchase';

export interface Capability {
    key: CapabilityKey;
    name_ko: string;
    description: string | null;
    built_in_roles: string[];
    created_at: string;
}

export interface BrandCapability {
    brand_id: string;
    capability_key: CapabilityKey;
    enabled: boolean;
    config: Record<string, unknown>;
    activated_at: string;
}

export interface MemberCapabilityRole {
    id: string;
    member_id: string;
    brand_id: string;
    capability_key: CapabilityKey;
    role: string;
    context: Record<string, unknown>;
    valid_from: string;
    valid_until: string | null;
    created_at: string;
}

export interface CapabilityAggregation {
    brand_id: string;
    capability_key: CapabilityKey;
    role: string;
    valid_from: string;
}

// ── 레지스트리 조회 ──

export async function getCapabilities(): Promise<Capability[]> {
    const supabase = createClient();
    const { data } = await supabase
        .from('capabilities')
        .select('*')
        .order('key');
    return (data ?? []) as Capability[];
}

export async function getBrandCapabilities(brandId: string): Promise<BrandCapability[]> {
    const supabase = createClient();
    const { data } = await supabase
        .from('brand_capabilities')
        .select('*')
        .eq('brand_id', brandId)
        .eq('enabled', true);
    return (data ?? []) as BrandCapability[];
}

// ── 회원 capability 역할 조회 ──

export async function getMemberCapabilityRoles(
    memberId: string,
    brandId?: string
): Promise<MemberCapabilityRole[]> {
    const supabase = createClient();
    let query = supabase
        .from('member_capability_roles')
        .select('*')
        .eq('member_id', memberId)
        .is('valid_until', null)
        .order('valid_from', { ascending: false });

    if (brandId) {
        query = query.eq('brand_id', brandId);
    }

    const { data } = await query;
    return (data ?? []) as MemberCapabilityRole[];
}

export async function getCapabilityAggregation(memberId: string): Promise<CapabilityAggregation[]> {
    const supabase = createClient();
    const { data } = await supabase
        .from('member_capability_roles')
        .select('brand_id, capability_key, role, valid_from')
        .eq('member_id', memberId)
        .is('valid_until', null)
        .order('valid_from', { ascending: false });
    return (data ?? []) as CapabilityAggregation[];
}

export async function hasBrandCapability(
    memberId: string,
    brandId: string,
    capabilityKey: CapabilityKey,
    role?: string
): Promise<boolean> {
    const supabase = createClient();
    let query = supabase
        .from('member_capability_roles')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', memberId)
        .eq('brand_id', brandId)
        .eq('capability_key', capabilityKey)
        .is('valid_until', null);

    if (role) {
        query = query.eq('role', role);
    }

    const { count } = await query;
    return (count ?? 0) > 0;
}

// ── 역할 부여 / 취소 ──

export async function assignCapabilityRole(params: {
    memberId: string;
    brandId: string;
    capabilityKey: CapabilityKey;
    role: string;
    context?: Record<string, unknown>;
}): Promise<MemberCapabilityRole | null> {
    const supabase = createClient();

    // 동일 조합 활성 레코드 중복 방지
    const { count } = await supabase
        .from('member_capability_roles')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', params.memberId)
        .eq('brand_id', params.brandId)
        .eq('capability_key', params.capabilityKey)
        .eq('role', params.role)
        .is('valid_until', null);

    if ((count ?? 0) > 0) return null;

    const { data, error } = await supabase
        .from('member_capability_roles')
        .insert({
            member_id: params.memberId,
            brand_id: params.brandId,
            capability_key: params.capabilityKey,
            role: params.role,
            context: params.context ?? {},
        })
        .select()
        .single();

    if (error) return null;
    return data as MemberCapabilityRole;
}

export async function revokeCapabilityRole(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from('member_capability_roles')
        .update({ valid_until: new Date().toISOString() })
        .eq('id', id);
    return !error;
}

// ── 어드민 — 브랜드별 회원 목록 ──

export async function getMembersByCapability(params: {
    brandId: string;
    capabilityKey: CapabilityKey;
    role?: string;
}): Promise<MemberCapabilityRole[]> {
    const supabase = createClient();
    let query = supabase
        .from('member_capability_roles')
        .select('*')
        .eq('brand_id', params.brandId)
        .eq('capability_key', params.capabilityKey)
        .is('valid_until', null)
        .order('valid_from', { ascending: false });

    if (params.role) {
        query = query.eq('role', params.role);
    }

    const { data } = await query;
    return (data ?? []) as MemberCapabilityRole[];
}
