/**
 * AI 에이전트 — 게시 모듈
 * 생성된 콘텐츠를 관리자 게시 API로 실제 게시
 */
import type { GeneratedContent } from './writer';
import type { RouteResult } from './router';
import type { Post } from '@/types/board';

const SERVER_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

export interface PublishResult {
    success: boolean;
    post?: Post;
    error?: string;
    url?: string;
}

export async function publishContent(
    content: GeneratedContent,
    route: RouteResult,
    asDraft = false,
): Promise<PublishResult> {
    try {
        const response = await fetch(`${SERVER_URL}/api/board/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ADMIN_API_KEY}`,
            },
            body: JSON.stringify({
                site: route.site,
                board: route.board,
                title: content.title,
                content: content.content,
                excerpt: content.excerpt,
                category: content.category,
                tags: content.tags,
                status: asDraft ? 'draft' : 'published',
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            return { success: false, error: err.error || response.statusText };
        }

        const post = await response.json() as Post;

        // 사이트별 도메인 매핑
        const domainMap: Record<string, string> = {
            tenone: 'tenone.biz',
            madleague: 'madleague.net',
            madleap: 'madleap.co.kr',
            youinone: 'youinone.com',
            fwn: 'fwn.co.kr',
            badak: 'badak.biz',
            hero: 'hero.ne.kr',
            ogamja: '0gamja.com',
        };

        const domain = domainMap[route.site] || 'tenone.biz';
        const url = `https://${domain}/board/${route.board}/${post.id}`;

        return { success: true, post, url };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
