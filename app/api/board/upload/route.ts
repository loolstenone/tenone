/**
 * 이미지 업로드 API (자동 최적화)
 * POST /api/board/upload (multipart/form-data)
 *
 * - 공개 이미지 크기 규칙 lib/image-rules.mjs (긴 변 2000px · WebP · 움직이는 GIF 유지)
 * - 원본 5MB 제한
 * - 로그인 회원만 (비로그인 업로드로 저장소 남용 방지)
 */
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireMember } from '@/lib/api-guard';
import { shrinkImage } from '@/lib/image-rules.mjs';

const supabase = createAdminClient();

const BUCKET = 'board-assets';

export async function POST(request: NextRequest) {
    try {
        const auth = await requireMember(request);
        if (auth instanceof NextResponse) return auth;

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
        }

        const site = String(formData.get('site') || 'general').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'general';
        const buffer = Buffer.from(await file.arrayBuffer());

        // 크기 규칙대로 줄이기 — 읽지 못하는 형식(SVG 등)만 원본 그대로
        const shrunk = await shrinkImage(sharp, buffer);
        const optimized: Buffer = shrunk ?? buffer;
        const ext = shrunk ? 'webp' : (file.name.split('.').pop() || 'png');

        const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
        const filePath = `${site}/${Date.now()}-${baseName}.${ext}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, optimized, {
                contentType: shrunk ? 'image/webp' : file.type,
                upsert: false,
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

        const saved = Math.round((1 - optimized.length / buffer.length) * 100);

        return NextResponse.json({
            url: publicUrl,
            filename: `${baseName}.${ext}`,
            originalSize: buffer.length,
            optimizedSize: optimized.length,
            saved: `${saved}%`,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
