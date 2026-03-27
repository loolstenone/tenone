/**
 * Certificate 모듈 Supabase CRUD
 * certificates
 */
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import type {
  Certificate,
  CreateCertificateInput, UpdateCertificateInput,
} from '@/types/certificate';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── 유틸 ──

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    const snakeKey = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
    result[snakeKey] = value;
  }
  return result;
}

function toCertificate(row: Record<string, unknown>): Certificate {
  return snakeToCamel(row) as unknown as Certificate;
}

// ── Certificate Number 생성 ──

function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TN-${year}-${random}`;
}

// ── Certificates ──

export async function fetchCertificates(
  brandId?: string,
  recipientEmail?: string
): Promise<Certificate[]> {
  let query = supabase
    .from('certificates')
    .select('*')
    .order('created_at', { ascending: false });

  if (brandId) query = query.eq('brand_id', brandId);
  if (recipientEmail) query = query.eq('recipient_email', recipientEmail);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toCertificate);
}

export async function fetchCertificateById(id: string): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return toCertificate(data);
}

export async function fetchCertificateByNumber(number: string): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_number', number)
    .single();
  if (error) return null;
  return toCertificate(data);
}

export async function createCertificate(input: CreateCertificateInput): Promise<Certificate> {
  const row: Record<string, unknown> = {
    brand_id: input.brandId,
    certificate_number: generateCertificateNumber(),
    title: input.title,
    type: input.type,
    status: input.status || 'draft',
    recipient_name: input.recipientName,
    recipient_email: input.recipientEmail || null,
    course_or_event: input.courseOrEvent || null,
    description: input.description || null,
    issued_at: input.status === 'issued' ? (input.issuedAt || new Date().toISOString()) : null,
    issuer_id: input.issuerId || null,
    template_id: input.templateId || null,
    metadata: input.metadata || null,
  };

  const { data, error } = await supabase
    .from('certificates')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return toCertificate(data);
}

export async function updateCertificate(id: string, input: UpdateCertificateInput): Promise<Certificate> {
  const row = camelToSnake(input as unknown as Record<string, unknown>);
  row.updated_at = new Date().toISOString();

  // status가 issued로 변경되면 issued_at 자동 설정
  if (input.status === 'issued' && !input.issuedAt) {
    row.issued_at = new Date().toISOString();
  }
  // status가 revoked로 변경되면 revoked_at 자동 설정
  if (input.status === 'revoked' && !input.revokedAt) {
    row.revoked_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('certificates')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toCertificate(data);
}

export async function bulkCreateCertificates(inputs: CreateCertificateInput[]): Promise<Certificate[]> {
  const rows = inputs.map(input => ({
    brand_id: input.brandId,
    certificate_number: generateCertificateNumber(),
    title: input.title,
    type: input.type,
    status: input.status || 'draft',
    recipient_name: input.recipientName,
    recipient_email: input.recipientEmail || null,
    course_or_event: input.courseOrEvent || null,
    description: input.description || null,
    issued_at: input.status === 'issued' ? (input.issuedAt || new Date().toISOString()) : null,
    issuer_id: input.issuerId || null,
    template_id: input.templateId || null,
    metadata: input.metadata || null,
  }));

  const { data, error } = await supabase
    .from('certificates')
    .insert(rows)
    .select();
  if (error) throw error;
  return (data || []).map(toCertificate);
}
