/**
 * 사이트 브랜딩 이미지 업로드 API
 * POST /api/sites/upload (multipart/form-data)
 *
 * - field: file (이미지)
 * - field: siteId (사이트 식별자)
 * - field: type (logo | favicon | og)
 *
 * 파비콘은 32x32 ICO/PNG 유지, 나머지는 WebP 변환
 */
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = 'site-branding';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const siteId = formData.get('siteId') as string;
        const type = formData.get('type') as 'logo' | 'favicon' | 'og';

        if (!file || !siteId || !type) {
            return NextResponse.json({ error: 'file, siteId, type 필수' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: '이미지만 업로드 가능' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: '파일 크기 5MB 초과' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let optimized: Buffer;
        let ext: string;
        let contentType: string;

        if (type === 'favicon') {
            // 파비콘: 32x32 PNG 변환
            optimized = await sharp(buffer).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
            ext = 'png';
            contentType = 'image/png';
        } else if (type === 'og') {
            // OG: 1200x630 리사이즈 + WebP
            optimized = await sharp(buffer).resize(1200, 630, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
            ext = 'webp';
            contentType = 'image/webp';
        } else {
            // 로고: 최대 400px 너비 + WebP
            const meta = await sharp(buffer).metadata();
            const img = sharp(buffer);
            if (meta.width && meta.width > 400) {
                optimized = await img.resize(400, null, { withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
            } else {
                optimized = await img.webp({ quality: 90 }).toBuffer();
            }
            ext = 'webp';
            contentType = 'image/webp';
        }

        const filePath = `${siteId}/${type}.${ext}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, optimized, { contentType, upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

        // 캐시 버스팅
        const url = `${publicUrl}?v=${Date.now()}`;

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Site upload error:', error);
        return NextResponse.json({ error: '업로드 실패' }, { status: 500 });
    }
}
