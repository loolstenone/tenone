/**
 * Members Supabase CRUD 함수
 * 회원 관리 (조회, 수정, 역할 변경, 검색)
 */
import { createClient } from './client';

const supabase = createClient();

export interface MemberRow {
    id: string;
    auth_id: string | null;
    email: string;
    name: string;
    account_type: string;
    primary_type: string;
    roles: string[];
    affiliations: string[];
    origin_site: string;
    intra_access: boolean;
    module_access: string[];
    system_access: string[];
    brand_access: string[];
    phone: string | null;
    avatar_url: string | null;
    avatar_initials: string;
    bio: string | null;
    company: string | null;
    position: string | null;
    department: string | null;
    employee_id: string | null;
    role: string;
    groups: string[];
    skills: string[];
    total_points: number;
    grade: string;
    newsletter_subscribed: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_login_at: string | null;
}

// ── 조회 ──

export async function fetchMembers(options?: {
    accountType?: string;
    search?: string;
    intraAccess?: boolean;
    limit?: number;
    offset?: number;
}) {
    let query = supabase.from('members').select('*', { count: 'exact' });

    if (options?.accountType && options.accountType !== 'all') {
        query = query.eq('account_type', options.accountType);
    }
    if (options?.intraAccess !== undefined) {
        query = query.eq('intra_access', options.intraAccess);
    }
    if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }

    query = query.order('created_at', { ascending: false });
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options?.limit || 20) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { members: (data || []) as MemberRow[], total: count || 0 };
}

export async function fetchMemberById(id: string) {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;
    return data as MemberRow;
}

// ── 수정 ──

export async function updateMember(id: string, updates: Partial<MemberRow>) {
    const row: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
    delete row.id;
    delete row.auth_id;
    delete row.created_at;

    const { data, error } = await supabase
        .from('members')
        .update(row)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as MemberRow;
}

// ── 역할 변경 ──

export async function changeMemberType(id: string, newType: string, newModuleAccess: string[]) {
    const { data, error } = await supabase
        .from('members')
        .update({
            account_type: newType,
            primary_type: newType,
            intra_access: newType !== 'member',
            module_access: newModuleAccess,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as MemberRow;
}

// ── 역할 추가/제거 ──

export async function addRole(id: string, role: string) {
    const member = await fetchMemberById(id);
    if (!member) throw new Error('Member not found');
    const roles = [...new Set([...(member.roles || []), role])];
    return updateMember(id, { roles } as Partial<MemberRow>);
}

export async function removeRole(id: string, role: string) {
    const member = await fetchMemberById(id);
    if (!member) throw new Error('Member not found');
    const roles = (member.roles || []).filter((r: string) => r !== role);
    return updateMember(id, { roles } as Partial<MemberRow>);
}

// ── 소속 관리 ──

export async function addAffiliation(id: string, affiliation: string) {
    const member = await fetchMemberById(id);
    if (!member) throw new Error('Member not found');
    const affiliations = [...new Set([...(member.affiliations || []), affiliation])];
    return updateMember(id, { affiliations } as Partial<MemberRow>);
}

// ── 직원 등록 (관리자용) ──

export async function createStaffMember(data: {
    email: string;
    name: string;
    department: string;
    position: string;
    employee_id: string;
    system_access: string[];
}) {
    const { data: member, error } = await supabase
        .from('members')
        .insert({
            email: data.email,
            name: data.name,
            account_type: 'staff',
            primary_type: 'staff',
            roles: ['staff'],
            avatar_initials: data.name.substring(0, 2).toUpperCase(),
            department: data.department,
            position: data.position,
            employee_id: data.employee_id,
            system_access: data.system_access,
            intra_access: true,
            module_access: ['myverse', 'townity', 'project', 'hero', 'evolution', 'smarcomm', 'wiki', 'erp', 'vridge', 'bums'],
            role: 'Editor',
            origin_site: 'tenone.biz',
        })
        .select()
        .single();
    if (error) throw error;
    return member as MemberRow;
}

// ── 통계 ──

export async function getMemberStats() {
    const { data, error } = await supabase.from('members').select('account_type, is_active');
    if (error) throw error;

    const stats = {
        total: data?.length || 0,
        staff: 0,
        partner: 0,
        alliance: 0,
        madleaguer: 0,
        crew: 0,
        member: 0,
        active: 0,
        inactive: 0,
    };

    data?.forEach((m: { account_type: string; is_active: boolean }) => {
        const type = m.account_type as keyof typeof stats;
        if (type in stats) (stats[type] as number)++;
        if (m.is_active) stats.active++;
        else stats.inactive++;
    });

    return stats;
}
