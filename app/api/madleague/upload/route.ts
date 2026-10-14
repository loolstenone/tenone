import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { shrinkImage } from '@/lib/image-rules.mjs';

export const runtime = 'nodejs';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES_PER_POST = 5;

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
]);

export async function POST(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: 'INVALID_FORM' }, { status: 400 }); }

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'NO_FILE' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'FILE_TOO_LARGE' }, { status: 400 });
  if (!ALLOWED_MIME.has(file.type)) return NextResponse.json({ error: 'INVALID_FILE_TYPE' }, { status: 400 });

  // 이미지는 공개 이미지 크기 규칙대로 줄여서 (lib/image-rules.mjs) — 문서·영상은 그대로
  const original = Buffer.from(await file.arrayBuffer());
  const shrunk = file.type.startsWith('image/') ? await shrinkImage(sharp, original) : null;
  const ext = shrunk ? 'webp' : (file.name.split('.').pop()?.toLowerCase() ?? 'bin');
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await sb.storage.from('mad-community').upload(path, shrunk ?? original, {
    contentType: shrunk ? 'image/webp' : file.type,
    upsert: false,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = sb.storage.from('mad-community').getPublicUrl(path);

  const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';

  return NextResponse.json({ url: publicUrl, type, name: file.name, size: file.size });
}

export { MAX_FILES_PER_POST };
