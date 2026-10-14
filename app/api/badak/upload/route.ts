import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';
import { shrinkImage } from '@/lib/image-rules.mjs';

const supabase = createAdminClient();

// POST: 이미지 업로드 (Supabase Storage)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  // 파일 크기 제한 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  // 공개 이미지 크기 규칙 (lib/image-rules.mjs) — 원본 그대로 올리지 않는다
  const original = Buffer.from(await file.arrayBuffer());
  const shrunk = file.type.startsWith('image/') ? await shrinkImage(sharp, original) : null;
  const ext = shrunk ? 'webp' : (file.name.split('.').pop() || 'jpg');
  const fileName = `badak/${user.id}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, shrunk ?? original, {
      cacheControl: '3600',
      contentType: shrunk ? 'image/webp' : file.type,
      upsert: false,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path);

  return NextResponse.json({ url: urlData.publicUrl });
}
