import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

async function requireAdmin(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (member?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return { userId: user.id };
}

const VALID_INQUIRY_STATUSES = ['pending', 'in_progress', 'resolved', 'closed'] as const;

// POST: 문의 접수 (공개)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, message, category } = body;

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: '이름과 문의 내용은 필수입니다' }, { status: 400 });
  }

  const { error } = await supabase.from('contact_submissions').insert({
    form_type: 'badak_inquiry',
    name: name.trim(),
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    message: message.trim(),
    extra: { category: category || '일반' },
    status: 'pending',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true }, { status: 201 });
}

// GET: 문의 목록 조회 (인트라 전용)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabase
    .from('contact_submissions')
    .select('id, form_type, name, email, phone, message, extra, status, created_at')
    .eq('form_type', 'badak_inquiry')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ inquiries: data || [] });
}

// PATCH: 문의 상태 변경 (인트라 전용)
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { id, status, note } = body;
  if (!id || !status) return NextResponse.json({ error: 'id, status required' }, { status: 400 });
  if (!VALID_INQUIRY_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // note를 extra에 병합하기 위해 현재 extra 먼저 조회
  const { data: existing } = await supabase
    .from('contact_submissions')
    .select('extra')
    .eq('id', id)
    .single();

  const newExtra = { ...(existing?.extra || {}), ...(note ? { note } : {}) };
  const { data, error } = await supabase
    .from('contact_submissions')
    .update({ status, extra: newExtra })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ inquiry: data });
}
