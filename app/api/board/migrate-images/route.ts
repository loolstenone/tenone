/**
 * 기존 게시물의 base64 이미지를 Storage URL로 마이그레이션
 * POST /api/board/migrate-images?site=tenone
 *
 * 아임웹 스타일: 게시물 본문의 base64 이미지 → Storage 업로드 → URL 교체
 * 대표 이미지도 자동 추출/갱신
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = 'board-assets';

async function uploadBase64ToStorage(base64: string, path: string): Promise<string | null> {
    try {
        // data:image/png;base64,xxxxx → Buffer
        const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) return null;
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filePath = `${path}.${ext}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, buffer, {
                contentType: `image/${matches[1]}`,
                upsert: true,
            });
        if (error) {
            console.error('Storage upload error:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        return publicUrl;
    } catch (e) {
        console.error('uploadBase64ToStorage error:', e);
        return null;
    }
}

export async function POST(request: NextRequest) {
    const site = request.nextUrl.searchParams.get('site') || 'tenone';

    // 전체 게시물 가져오기
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, content, represent_image, site, board')
        .eq('site', site);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results: { id: string; title?: string; imagesConverted: number; representImageSet: boolean }[] = [];

    for (const post of (posts || [])) {
        let content = post.content as string;
        if (!content) continue;

        let imagesConverted = 0;
        let representImageSet = false;
        let firstUrl = '';

        // 본문 내 base64 이미지 찾기
        const base64Regex = /<img[^>]+src=["'](data:image\/[^"']+)["']/gi;
        let match;
        const replacements: { original: string; url: string }[] = [];

        while ((match = base64Regex.exec(content)) !== null) {
            const base64Src = match[1];
            const storagePath = `${site}/${post.board || 'general'}/${post.id}/${Date.now()}-${imagesConverted}`;
            const url = await uploadBase64ToStorage(base64Src, storagePath);
            if (url) {
                replacements.push({ original: base64Src, url });
                if (!firstUrl) firstUrl = url;
                imagesConverted++;
            }
        }

        // content 교체
        let updatedContent = content;
        for (const r of replacements) {
            updatedContent = updatedContent.replace(r.original, r.url);
        }

        // DB 업데이트
        if (imagesConverted > 0) {
            const updateData: Record<string, unknown> = {
                content: updatedContent,
                updated_at: new Date().toISOString(),
            };

            // 대표 이미지가 비었으면 첫 이미지 URL로 설정
            if (!post.represent_image && firstUrl) {
                updateData.represent_image = firstUrl;
                representImageSet = true;
            }

            const { error: updateError, count: updateCount } = await supabase.from('posts').update(updateData).eq('id', post.id);
            if (updateError) {
                console.error('Update failed for', post.id, updateError.message);
                (results as any).push({ id: post.id, error: updateError.message });
                continue;
            }
        } else if (!post.represent_image) {
            // base64가 아닌 URL 이미지가 이미 있는 경우
            const urlImgMatch = content.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
            if (urlImgMatch?.[1]) {
                await supabase.from('posts').update({
                    represent_image: urlImgMatch[1],
                    updated_at: new Date().toISOString(),
                }).eq('id', post.id);
                representImageSet = true;
            }
        }

        if (imagesConverted > 0 || representImageSet) {
            results.push({ id: post.id, imagesConverted, representImageSet, firstUrl: firstUrl?.substring(0, 200) || '' });
        }
    }

    return NextResponse.json({
        message: `Migrated ${results.length} posts`,
        totalPosts: posts?.length || 0,
        results,
    });
}
