/**
 * 인트라 게시판·콘텐츠 관리 공통 헬퍼
 * - /api/board/* 응답(camelCase)을 인트라 목록용 행(snake_case)으로 변환
 * - 게시판 분류: 관리자 작성(운영 콘텐츠) / 회원 작성(커뮤니티)
 */

export interface IntraPostRow {
    id: string; site: string; board: string; title: string; content: string;
    excerpt: string; category: string; status: string; author_type: string;
    author_id: string | null; author_name: string | null; guest_nickname: string | null;
    represent_image: string; tags: string[];
    view_count: number; like_count: number; comment_count: number;
    is_pinned: boolean; created_at: string;
}

export interface IntraBoardConfig {
    id: string; site: string; slug: string; name: string; description: string;
    categories: string[]; sortOrder?: number; visibility?: string; boardType?: string;
    permissions?: { read: string; write: string; comment: string };
}

/** 회원이 글을 쓸 수 있는 게시판인지 (write 권한이 all/member) */
export function isMemberBoard(cfg?: IntraBoardConfig): boolean {
    return !!cfg && cfg.permissions?.write !== 'admin';
}

export function writerLabel(cfg?: IntraBoardConfig): string {
    return isMemberBoard(cfg) ? '회원 작성' : '관리자 작성';
}

export function normalizePost(p: Record<string, unknown>): IntraPostRow {
    return {
        id: p.id as string,
        site: p.site as string,
        board: p.board as string,
        title: (p.title as string) ?? '',
        content: (p.content as string) ?? '',
        excerpt: (p.excerpt as string) ?? '',
        category: (p.category as string) ?? '',
        status: (p.status as string) ?? 'published',
        author_type: (p.authorType as string) ?? 'member',
        author_id: (p.authorId as string | null) ?? null,
        author_name: (p.authorName as string | null) ?? null,
        guest_nickname: null,
        represent_image: (p.representImage as string) ?? '',
        tags: (p.tags as string[]) ?? [],
        view_count: (p.viewCount as number) ?? 0,
        like_count: (p.likeCount as number) ?? 0,
        comment_count: (p.commentCount as number) ?? 0,
        is_pinned: !!p.isPinned,
        created_at: (p.createdAt as string) ?? '',
    };
}

/** 게시판 설정 + 게시글(전 상태) 로드. siteId='all'이면 전 사이트 */
export async function loadIntraBoardData(siteId: string): Promise<{ configs: IntraBoardConfig[]; posts: IntraPostRow[] }> {
    const configRes = await fetch(siteId === 'all' ? '/api/board/configs' : `/api/board/configs?site=${siteId}`);
    const configs: IntraBoardConfig[] = configRes.ok ? ((await configRes.json()).configs ?? []) : [];

    const sites = siteId === 'all' ? Array.from(new Set(configs.map(c => c.site))) : [siteId];
    const lists = await Promise.all(sites.map(async site => {
        const res = await fetch(`/api/board/posts?site=${site}&status=all&limit=500`);
        if (!res.ok) return [];
        const d = await res.json();
        return ((d.posts ?? []) as Record<string, unknown>[]).map(normalizePost);
    }));
    return { configs, posts: lists.flat() };
}

export function editorHref(opts: { id?: string; site?: string; board?: string }): string {
    const q = new URLSearchParams();
    if (opts.id) q.set('id', opts.id);
    if (opts.site && opts.site !== 'all') q.set('site', opts.site);
    if (opts.board) q.set('board', opts.board);
    const s = q.toString();
    return `/intra/ums/sites/content/edit${s ? `?${s}` : ''}`;
}
