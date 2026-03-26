import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 개인정보 마스킹 (전화번호, 이메일)
function maskPII(text: string): string {
    return text
        .replace(/\d{2,3}-\d{3,4}-\d{4}/g, '***-****-****')
        .replace(/0\d{9,10}/g, '***********')
        .replace(/[\w.-]+@[\w.-]+\.\w+/g, '***@***.***');
}

// URL 추출
function extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    return text.match(urlRegex) || [];
}

/**
 * POST /api/trendhunter/collect
 * 모든 크롤러가 데이터를 보내는 통합 수집 엔드포인트
 */
export async function POST(request: NextRequest) {
    try {
        // API 키 인증
        const authHeader = request.headers.get('Authorization');
        const apiKey = process.env.TRENDHUNTER_API_KEY;
        if (apiKey && authHeader !== `Bearer ${apiKey}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Batch mode: array of items
        if (Array.isArray(body.items)) {
            const results = { inserted: 0, errors: 0 };
            for (const item of body.items) {
                if (!item.source || !item.message) { results.errors++; continue; }
                const masked = maskPII(item.message);
                const urls = extractUrls(item.message);
                const { error } = await supabase.from('collected_data').insert({
                    source_type: item.source,
                    source_name: item.room || 'unknown',
                    topic: item.topic,
                    author: item.sender,
                    title: item.title,
                    content: masked,
                    content_type: item.content_type || 'text',
                    url: item.url,
                    has_urls: urls.length > 0,
                    extracted_urls: urls.length > 0 ? urls : null,
                    metadata: { ...item.metadata, original_timestamp: item.timestamp },
                    collected_at: item.timestamp || new Date().toISOString(),
                });
                if (error) results.errors++; else results.inserted++;
            }
            return NextResponse.json({ ok: true, mode: 'batch', ...results });
        }

        const {
            source,       // kakao, kakao_ext, web, discord, rss, news, smarcomm
            room,         // 방 이름 / 사이트명
            topic,        // 주제 코드
            sender,       // 작성자 닉네임
            title,        // 제목 (게시글)
            message,      // 본문
            url,          // 원본 URL
            content_type, // text, article, post, comment, link
            mode,         // full, digest (외부 방)
            metadata,     // 추가 정보 (좋아요 수 등)
            timestamp,    // ISO timestamp
        } = body;

        if (!source || !message) {
            return NextResponse.json({ error: 'source and message are required' }, { status: 400 });
        }

        const maskedContent = maskPII(message);
        const urls = extractUrls(message);

        // digest 모드: 원본 저장하지 않고 임시 버퍼에만
        if (mode === 'digest') {
            // digest 모드는 별도 배치에서 처리
            // 여기서는 임시 저장만
            const { error } = await supabase.from('collected_data').insert({
                source_type: source,
                source_name: room || 'unknown',
                topic,
                author: sender,
                title,
                content: maskedContent,
                content_type: content_type || 'text',
                url,
                has_urls: urls.length > 0,
                extracted_urls: urls.length > 0 ? urls : null,
                metadata: { ...metadata, mode: 'digest', original_timestamp: timestamp },
                collected_at: timestamp || new Date().toISOString(),
            });

            if (error) {
                console.error('Collect (digest) error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ ok: true, mode: 'digest' });
        }

        // full 모드: 원본 저장
        const { error } = await supabase.from('collected_data').insert({
            source_type: source,
            source_name: room || 'unknown',
            topic,
            author: sender,
            title,
            content: maskedContent,
            content_type: content_type || 'text',
            url,
            has_urls: urls.length > 0,
            extracted_urls: urls.length > 0 ? urls : null,
            metadata: { ...metadata, original_timestamp: timestamp },
            collected_at: timestamp || new Date().toISOString(),
        });

        if (error) {
            console.error('Collect error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // URL이 있으면 url_archive에도 저장
        if (urls.length > 0) {
            const urlInserts = urls.map(u => ({
                source_type: source,
                source_name: room || 'unknown',
                url: u,
                author: sender,
            }));
            await supabase.from('url_archive').insert(urlInserts);
        }

        return NextResponse.json({ ok: true, mode: 'full', urls_found: urls.length });
    } catch (err) {
        console.error('Collect endpoint error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
