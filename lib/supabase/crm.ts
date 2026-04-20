/**
 * CRM 모듈 Supabase CRUD
 * crm_people, crm_organizations, crm_deals, crm_activities
 */
import { createClient } from './client';
import type {
    Person, Organization, Deal, Activity,
    PersonType, PersonStatus, DealStage, OrgType, ActivityType,
} from '@/types/crm';

const supabase = createClient();

// ── 변환 유틸 ──

function rowToPerson(r: Record<string, unknown>): Person {
    return {
        id: r.id as string,
        name: r.name as string,
        email: (r.email as string) || '',
        phone: r.phone as string | undefined,
        type: r.type as PersonType,
        status: r.status as PersonStatus,
        company: r.company as string | undefined,
        position: r.position as string | undefined,
        avatarInitials: (r.avatar_initials as string) || '',
        brandAssociation: (r.brand_association as string[]) || [],
        tags: (r.tags as string[]) || [],
        source: (r.source as string) || '',
        cohort: r.cohort as string | undefined,
        lastContacted: r.last_contacted as string | undefined,
        notes: r.notes as string | undefined,
        createdAt: ((r.created_at as string) || '').split('T')[0],
        memberId: (r.member_id as string) || undefined,
        lifecycleStage: (r.lifecycle_stage as Person['lifecycleStage']) || undefined,
        lastTouchedAt: (r.last_touched_at as string) || undefined,
        doNotEmail: !!r.do_not_email,
        doNotContact: !!r.do_not_contact,
    };
}

function rowToOrg(r: Record<string, unknown>): Organization {
    return {
        id: r.id as string,
        name: r.name as string,
        type: r.type as OrgType,
        industry: r.industry as string | undefined,
        website: r.website as string | undefined,
        contactIds: (r.contact_ids as string[]) || [],
        brandAssociation: (r.brand_association as string[]) || [],
        status: r.status as 'Active' | 'Inactive',
        notes: r.notes as string | undefined,
        createdAt: ((r.created_at as string) || '').split('T')[0],
    };
}

function rowToDeal(r: Record<string, unknown>): Deal {
    return {
        id: r.id as string,
        title: r.title as string,
        organizationId: (r.organization_id as string) || '',
        contactId: (r.contact_id as string) || '',
        stage: r.stage as DealStage,
        value: Number(r.value) || 0,
        currency: (r.currency as string) || 'KRW',
        brandId: (r.brand_id as string) || '',
        expectedCloseDate: r.expected_close_date as string | undefined,
        notes: r.notes as string | undefined,
        createdAt: ((r.created_at as string) || '').split('T')[0],
        updatedAt: ((r.updated_at as string) || '').split('T')[0],
    };
}

function rowToActivity(r: Record<string, unknown>): Activity {
    return {
        id: r.id as string,
        type: r.type as ActivityType,
        title: r.title as string,
        description: r.description as string | undefined,
        personId: r.person_id as string | undefined,
        organizationId: r.organization_id as string | undefined,
        dealId: r.deal_id as string | undefined,
        date: ((r.date as string) || '').split('T')[0],
        createdAt: ((r.created_at as string) || '').split('T')[0],
    };
}

// ── People ──

export interface PeopleListParams {
    brandId?: string;
    type?: PersonType;
    status?: PersonStatus;
    search?: string;
    tags?: string[];
    cohort?: string;
    page?: number;
    limit?: number;
}

export async function fetchPeople(params: PeopleListParams = {}) {
    const { brandId = 'tenone', type, status, search, tags, cohort, page = 1, limit = 50 } = params;

    let query = supabase
        .from('crm_people')
        .select('*', { count: 'exact' })
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (cohort) query = query.eq('cohort', cohort);
    if (search) {
        const s = search.replace(/[\\%_(),."']/g, '').trim().slice(0, 200);
        if (s) query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,company.ilike.%${s}%`);
    }
    if (tags?.length) query = query.overlaps('tags', tags);

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return {
        people: ((data || []) as Record<string, unknown>[]).map(rowToPerson),
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
    };
}

export async function fetchPersonById(id: string): Promise<Person | null> {
    const { data, error } = await supabase.from('crm_people').select('*').eq('id', id).single();
    if (error) return null;
    return rowToPerson(data);
}

export async function createPerson(input: Partial<Person> & { name: string; brandId?: string }) {
    const row: Record<string, unknown> = {
        brand_id: input.brandId || 'tenone',
        name: input.name,
        email: input.email || '',
        phone: input.phone,
        type: input.type || 'Other',
        status: input.status || 'Lead',
        company: input.company,
        position: input.position,
        avatar_initials: input.avatarInitials || input.name.slice(0, 2),
        brand_association: input.brandAssociation || [],
        tags: input.tags || [],
        source: input.source || '',
        cohort: input.cohort,
        notes: input.notes,
    };
    const { data, error } = await supabase.from('crm_people').insert(row).select().single();
    if (error) throw error;
    return rowToPerson(data);
}

export async function updatePerson(id: string, input: Partial<Person>) {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) row.name = input.name;
    if (input.email !== undefined) row.email = input.email;
    if (input.phone !== undefined) row.phone = input.phone;
    if (input.type !== undefined) row.type = input.type;
    if (input.status !== undefined) row.status = input.status;
    if (input.company !== undefined) row.company = input.company;
    if (input.position !== undefined) row.position = input.position;
    if (input.avatarInitials !== undefined) row.avatar_initials = input.avatarInitials;
    if (input.brandAssociation !== undefined) row.brand_association = input.brandAssociation;
    if (input.tags !== undefined) row.tags = input.tags;
    if (input.source !== undefined) row.source = input.source;
    if (input.cohort !== undefined) row.cohort = input.cohort;
    if (input.notes !== undefined) row.notes = input.notes;
    if (input.lastContacted !== undefined) row.last_contacted = input.lastContacted;

    const { data, error } = await supabase.from('crm_people').update(row).eq('id', id).select().single();
    if (error) throw error;
    return rowToPerson(data);
}

export async function deletePerson(id: string) {
    const { error } = await supabase.from('crm_people').delete().eq('id', id);
    if (error) throw error;
}

// ── Organizations ──

export async function fetchOrganizations(brandId = 'tenone') {
    const { data, error } = await supabase
        .from('crm_organizations')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });
    if (error) throw error;

    // contactIds는 crm_org_contacts에서 가져와야 하지만, 우선은 빈 배열
    return (data || []).map(rowToOrg);
}

export async function fetchOrgById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase.from('crm_organizations').select('*').eq('id', id).single();
    if (error) return null;

    // 연관 연락처 조회
    const { data: contacts } = await supabase
        .from('crm_org_contacts')
        .select('person_id')
        .eq('organization_id', id);

    const org = rowToOrg(data);
    org.contactIds = (contacts || []).map((c: Record<string, unknown>) => c.person_id as string);
    return org;
}

export async function createOrganization(input: Partial<Organization> & { name: string; brandId?: string }) {
    const row: Record<string, unknown> = {
        brand_id: input.brandId || 'tenone',
        name: input.name,
        type: input.type || 'Partner',
        industry: input.industry,
        website: input.website,
        brand_association: input.brandAssociation || [],
        status: input.status || 'Active',
        notes: input.notes,
    };
    const { data, error } = await supabase.from('crm_organizations').insert(row).select().single();
    if (error) throw error;

    // contactIds 연결
    if (input.contactIds?.length) {
        const links = input.contactIds.map(pid => ({ organization_id: data.id, person_id: pid }));
        await supabase.from('crm_org_contacts').insert(links);
    }

    const org = rowToOrg(data);
    org.contactIds = input.contactIds || [];
    return org;
}

export async function updateOrganization(id: string, input: Partial<Organization>) {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) row.name = input.name;
    if (input.type !== undefined) row.type = input.type;
    if (input.industry !== undefined) row.industry = input.industry;
    if (input.website !== undefined) row.website = input.website;
    if (input.brandAssociation !== undefined) row.brand_association = input.brandAssociation;
    if (input.status !== undefined) row.status = input.status;
    if (input.notes !== undefined) row.notes = input.notes;

    const { data, error } = await supabase.from('crm_organizations').update(row).eq('id', id).select().single();
    if (error) throw error;

    // contactIds 갱신
    if (input.contactIds !== undefined) {
        await supabase.from('crm_org_contacts').delete().eq('organization_id', id);
        if (input.contactIds.length) {
            const links = input.contactIds.map(pid => ({ organization_id: id, person_id: pid }));
            await supabase.from('crm_org_contacts').insert(links);
        }
    }

    return rowToOrg(data);
}

export async function deleteOrganization(id: string) {
    const { error } = await supabase.from('crm_organizations').delete().eq('id', id);
    if (error) throw error;
}

// ── Deals ──

export async function fetchDeals(brandId = 'tenone', stage?: DealStage) {
    let query = supabase
        .from('crm_deals')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });
    if (stage) query = query.eq('stage', stage);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(rowToDeal);
}

export async function createDeal(input: Partial<Deal> & { title: string; brandId?: string }) {
    const row: Record<string, unknown> = {
        brand_id: input.brandId || 'tenone',
        title: input.title,
        organization_id: input.organizationId || null,
        contact_id: input.contactId || null,
        stage: input.stage || 'Lead',
        value: input.value || 0,
        currency: input.currency || 'KRW',
        expected_close_date: input.expectedCloseDate || null,
        notes: input.notes,
    };
    const { data, error } = await supabase.from('crm_deals').insert(row).select().single();
    if (error) throw error;
    return rowToDeal(data);
}

export async function updateDeal(id: string, input: Partial<Deal>) {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.title !== undefined) row.title = input.title;
    if (input.organizationId !== undefined) row.organization_id = input.organizationId;
    if (input.contactId !== undefined) row.contact_id = input.contactId;
    if (input.stage !== undefined) row.stage = input.stage;
    if (input.value !== undefined) row.value = input.value;
    if (input.currency !== undefined) row.currency = input.currency;
    if (input.expectedCloseDate !== undefined) row.expected_close_date = input.expectedCloseDate;
    if (input.notes !== undefined) row.notes = input.notes;

    const { data, error } = await supabase.from('crm_deals').update(row).eq('id', id).select().single();
    if (error) throw error;
    return rowToDeal(data);
}

export async function deleteDeal(id: string) {
    const { error } = await supabase.from('crm_deals').delete().eq('id', id);
    if (error) throw error;
}

// ── Activities ──

export async function fetchActivities(params: { brandId?: string; personId?: string; orgId?: string; dealId?: string; limit?: number } = {}) {
    const { brandId = 'tenone', personId, orgId, dealId, limit = 50 } = params;

    let query = supabase
        .from('crm_activities')
        .select('*')
        .eq('brand_id', brandId)
        .order('date', { ascending: false })
        .limit(limit);

    if (personId) query = query.eq('person_id', personId);
    if (orgId) query = query.eq('organization_id', orgId);
    if (dealId) query = query.eq('deal_id', dealId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(rowToActivity);
}

export async function createActivity(input: Partial<Activity> & { title: string; brandId?: string }) {
    const row: Record<string, unknown> = {
        brand_id: input.brandId || 'tenone',
        type: input.type || 'Note',
        title: input.title,
        description: input.description,
        person_id: input.personId || null,
        organization_id: input.organizationId || null,
        deal_id: input.dealId || null,
        date: input.date || new Date().toISOString(),
    };
    const { data, error } = await supabase.from('crm_activities').insert(row).select().single();
    if (error) throw error;
    return rowToActivity(data);
}

export async function deleteActivity(id: string) {
    const { error } = await supabase.from('crm_activities').delete().eq('id', id);
    if (error) throw error;
}

// ── 통계 (대시보드용) ──

export async function fetchCrmStats(brandId = 'tenone') {
    const [people, orgs, deals] = await Promise.all([
        supabase.from('crm_people').select('type, status', { count: 'exact' }).eq('brand_id', brandId),
        supabase.from('crm_organizations').select('type', { count: 'exact' }).eq('brand_id', brandId),
        supabase.from('crm_deals').select('stage, value').eq('brand_id', brandId),
    ]);

    const dealRows = deals.data || [];
    const pipelineValue = dealRows
        .filter((d: Record<string, unknown>) => !['Won', 'Lost'].includes(d.stage as string))
        .reduce((sum: number, d: Record<string, unknown>) => sum + Number(d.value), 0);
    const wonValue = dealRows
        .filter((d: Record<string, unknown>) => d.stage === 'Won')
        .reduce((sum: number, d: Record<string, unknown>) => sum + Number(d.value), 0);

    return {
        totalPeople: people.count || 0,
        totalOrgs: orgs.count || 0,
        totalDeals: dealRows.length,
        pipelineValue,
        wonValue,
    };
}
