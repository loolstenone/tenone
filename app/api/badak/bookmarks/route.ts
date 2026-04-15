import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// GET: 내 북마크 목록
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('badak_bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ bookmarks: data || [] });
}

// POST: 북마크 추가
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { item_type, item_id, title, subtitle } = body;
  if (!item_type || !item_id || !title) {
    return NextResponse.json({ error: 'item_type, item_id, title required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('badak_bookmarks')
    .insert({ user_id: user.id, item_type, item_id, title, subtitle })
    .select()
    .single();

  if (error) {
    // 중복 북마크 (unique 위반)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ bookmark: data });
}

// DELETE: 북마크 삭제
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bookmarkId = searchParams.get('id');
  const itemType = searchParams.get('item_type');
  const itemId = searchParams.get('item_id');

  let query = supabase.from('badak_bookmarks').delete().eq('user_id', user.id);

  if (bookmarkId) {
    query = query.eq('id', bookmarkId);
  } else if (itemType && itemId) {
    query = query.eq('item_type', itemType).eq('item_id', itemId);
  } else {
    return NextResponse.json({ error: 'id or (item_type + item_id) required' }, { status: 400 });
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
