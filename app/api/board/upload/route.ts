/**
 * 이미지 업로드 API
 * POST /api/board/upload (multipart/form-data)
 */
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/supabase/board';

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
        const path = `${site}/${Date.now()}-${file.name}`;

        const url = await uploadImage(file, path);

        return NextResponse.json({ url, filename: file.name, size: file.size });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
