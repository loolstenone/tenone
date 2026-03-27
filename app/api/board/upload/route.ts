/**
 * 이미지 업로드 API (자동 최적화)
 * POST /api/board/upload (multipart/form-data)
 *
 * - 최대 1280px로 리사이즈
 * - WebP 변환 (80% 용량 절감)
 * - 원본 5MB 제한
 */
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = 'board-assets';
const MAX_WIDTH = 1280;
const WEBP_QUALITY = 80;

export async function POST(request: NextRequest) {
    try {
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

        const site = formData.get('site') as string || 'general';
        const buffer = Buffer.from(await file.arrayBuffer());

        // sharp로 리사이즈 + WebP 변환
        let optimized: Buffer;
        let ext = 'webp';
        try {
            const image = sharp(buffer);
            const metadata = await image.metadata();

            // 1280px 이하면 리사이즈 안 함
            if (metadata.width && metadata.width > MAX_WIDTH) {
                optimized = await image.resize(MAX_WIDTH, null, { withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer();
            } else {
                optimized = await image.webp({ quality: WEBP_QUALITY }).toBuffer();
            }
        } catch {
            // sharp 실패 시 원본 그대로 업로드
            optimized = buffer;
            ext = file.name.split('.').pop() || 'png';
        }

        const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
        const filePath = `${site}/${Date.now()}-${baseName}.${ext}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, optimized, {
                contentType: ext === 'webp' ? 'image/webp' : `image/${ext}`,
                upsert: true,
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
