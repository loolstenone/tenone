import { createClient } from './client';
import type { Campaign, Lead, ContentPost } from '@/types/marketing';

const supabase = createClient();

// ── Helper: DB row → Frontend type ──────────────────
function rowToCampaign(r: any): Campaign {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    status: r.status,
    brandId: r.brand_id || '',
    description: r.description || '',
    budget: Number(r.budget) || 0,
    spent: Number(r.spent) || 0,
    kpi: r.kpi || '',
    assignee: r.assignee || '',
    startDate: r.start_date || '',
    endDate: r.end_date || undefined,
    channels: r.channels || [],
    createdAt: r.created_at?.split('T')[0] || '',
  };
}

function rowToLead(r: any): Lead {
  return {
    id: r.id,
    name: r.name,
    company: r.company || undefined,
    email: r.email || '',
    phone: r.phone || undefined,
    stage: r.stage,
    source: r.source,
    value: Number(r.value) || 0,
    assignee: r.assignee || '',
    notes: r.notes || undefined,
    createdAt: r.created_at?.split('T')[0] || '',
    updatedAt: r.updated_at?.split('T')[0] || '',
  };
}

function rowToContent(r: any): ContentPost {
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    status: r.status,
    channel: r.channel || '',
    brandId: r.brand_id || '',
    assignee: r.assignee || '',
    publishDate: r.publish_date || undefined,
    engagement: r.engagement || undefined,
    createdAt: r.created_at?.split('T')[0] || '',
  };
}

// ── Campaigns ───────────────────────────────────────
export async function fetchCampaigns() {
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToCampaign);
}

export async function createCampaign(c: Omit<Campaign, 'id' | 'createdAt'>) {
  const { data, error } = await supabase.from('marketing_campaigns').insert({
    name: c.name, type: c.type, status: c.status, brand_id: c.brandId,
    description: c.description, budget: c.budget, spent: c.spent,
    kpi: c.kpi, assignee: c.assignee, start_date: c.startDate,
    end_date: c.endDate || null, channels: c.channels,
  }).select().single();
  if (error) throw error;
  return rowToCampaign(data);
}

export async function updateCampaign(id: string, updates: Partial<Campaign>) {
  const mapped: any = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.type !== undefined) mapped.type = updates.type;
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.brandId !== undefined) mapped.brand_id = updates.brandId;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.budget !== undefined) mapped.budget = updates.budget;
  if (updates.spent !== undefined) mapped.spent = updates.spent;
  if (updates.kpi !== undefined) mapped.kpi = updates.kpi;
  if (updates.assignee !== undefined) mapped.assignee = updates.assignee;
  if (updates.startDate !== undefined) mapped.start_date = updates.startDate;
  if (updates.endDate !== undefined) mapped.end_date = updates.endDate;
  if (updates.channels !== undefined) mapped.channels = updates.channels;
  mapped.updated_at = new Date().toISOString();

  const { error } = await supabase.from('marketing_campaigns').update(mapped).eq('id', id);
  if (error) throw error;
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from('marketing_campaigns').delete().eq('id', id);
  if (error) throw error;
}

// ── Leads ───────────────────────────────────────────
export async function fetchLeads() {
  const { data, error } = await supabase
    .from('marketing_leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToLead);
}

export async function createLead(l: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase.from('marketing_leads').insert({
    name: l.name, company: l.company || null, email: l.email,
    phone: l.phone || null, stage: l.stage, source: l.source,
    value: l.value, assignee: l.assignee, notes: l.notes || null,
  }).select().single();
  if (error) throw error;
  return rowToLead(data);
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const mapped: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.company !== undefined) mapped.company = updates.company;
  if (updates.email !== undefined) mapped.email = updates.email;
  if (updates.phone !== undefined) mapped.phone = updates.phone;
  if (updates.stage !== undefined) mapped.stage = updates.stage;
  if (updates.source !== undefined) mapped.source = updates.source;
  if (updates.value !== undefined) mapped.value = updates.value;
  if (updates.assignee !== undefined) mapped.assignee = updates.assignee;
  if (updates.notes !== undefined) mapped.notes = updates.notes;

  const { error } = await supabase.from('marketing_leads').update(mapped).eq('id', id);
  if (error) throw error;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from('marketing_leads').delete().eq('id', id);
  if (error) throw error;
}

// ── Content Posts ────────────────────────────────────
export async function fetchContentPosts() {
  const { data, error } = await supabase
    .from('marketing_content')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToContent);
}

export async function createContentPost(p: Omit<ContentPost, 'id' | 'createdAt'>) {
  const { data, error } = await supabase.from('marketing_content').insert({
    title: p.title, type: p.type, status: p.status,
    channel: p.channel, brand_id: p.brandId, assignee: p.assignee,
    publish_date: p.publishDate || null, engagement: p.engagement || 0,
  }).select().single();
  if (error) throw error;
  return rowToContent(data);
}

export async function updateContentPost(id: string, updates: Partial<ContentPost>) {
  const mapped: any = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) mapped.title = updates.title;
  if (updates.type !== undefined) mapped.type = updates.type;
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.channel !== undefined) mapped.channel = updates.channel;
  if (updates.brandId !== undefined) mapped.brand_id = updates.brandId;
  if (updates.assignee !== undefined) mapped.assignee = updates.assignee;
  if (updates.publishDate !== undefined) mapped.publish_date = updates.publishDate;
  if (updates.engagement !== undefined) mapped.engagement = updates.engagement;

  const { error } = await supabase.from('marketing_content').update(mapped).eq('id', id);
  if (error) throw error;
}

export async function deleteContentPost(id: string) {
  const { error } = await supabase.from('marketing_content').delete().eq('id', id);
  if (error) throw error;
}

// ── Stats ───────────────────────────────────────────
export async function fetchMarketingStats() {
  const [campaigns, leads, content] = await Promise.all([
    supabase.from('marketing_campaigns').select('status', { count: 'exact' }),
    supabase.from('marketing_leads').select('stage, value'),
    supabase.from('marketing_content').select('status', { count: 'exact' }),
  ]);

  const campaignData = campaigns.data || [];
  const leadData = leads.data || [];

  return {
    totalCampaigns: campaignData.length,
    activeCampaigns: campaignData.filter(c => c.status === 'Active').length,
    totalLeads: leadData.length,
    pipelineValue: leadData.reduce((sum, l) => sum + (Number(l.value) || 0), 0),
    wonLeads: leadData.filter(l => l.stage === 'Won').length,
    totalContent: (content.data || []).length,
  };
}
