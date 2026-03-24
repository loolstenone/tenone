// ============================================
// Ten:One™ 통합 게시판 타입 정의
// ============================================

// ── 사이트 코드 ──
export type SiteCode =
    | 'tenone'
    | 'madleague'
    | 'madleap'
    | 'youinone'
    | 'fwn'
    | 'badak'
    | 'hero'
    | 'ogamja';

// ── 게시판 설정 ──

export interface BoardSettings {
    defaultView: 'card' | 'list';
    postsPerPage: number;
    pagination: 'page' | 'infinite';
    allowGuestPost: boolean;
    allowGuestComment: boolean;
    requireApproval: boolean;
    useRepresentImage: boolean;
    theme?: string;
}

export interface BoardConfig {
    id: string;
    site: SiteCode;
    slug: string;
    name: string;
    description: string;
    categories: string[];
    settings: BoardSettings;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

// ── 게시글 ──

export type PostStatus = 'published' | 'draft' | 'hidden' | 'deleted';
export type AuthorType = 'member' | 'guest' | 'admin' | 'agent';

export interface Post {
    id: string;
    site: SiteCode;
    board: string;           // board slug
    title: string;
    content: string;         // HTML
    excerpt: string;
    category: string;
    tags: string[];
    representImage: string;
    status: PostStatus;

    // 작성자
    authorType: AuthorType;
    authorId: string | null;
    guestNickname: string | null;
    guestPassword?: string;  // 응답에는 제외
    guestEmail: string | null;

    // 카운트
    viewCount: number;
    likeCount: number;
    commentCount: number;
    bookmarkCount: number;

    // 플래그
    isPinned: boolean;

    // 날짜
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;

    // 조인 데이터 (선택)
    authorName?: string;     // members 테이블에서 조인
    authorAvatar?: string;
    attachments?: Attachment[];
    isLiked?: boolean;       // 현재 유저 기준
    isBookmarked?: boolean;
}

// ── 댓글 ──

export type CommentStatus = 'active' | 'hidden' | 'deleted';

export interface Comment {
    id: string;
    postId: string;
    parentId: string | null;
    content: string;

    authorType: 'member' | 'guest';
    authorId: string | null;
    guestNickname: string | null;
    guestPassword?: string;

    likeCount: number;
    status: CommentStatus;

    createdAt: string;
    updatedAt: string;

    // 조인 데이터
    authorName?: string;
    authorAvatar?: string;
    isLiked?: boolean;
    replies?: Comment[];     // 대댓글
}

// ── 첨부파일 ──

export interface Attachment {
    id: string;
    postId: string;
    filename: string;
    filepath: string;
    filesize: number;
    mimetype: string;
    downloadCount: number;
    createdAt: string;
}

// ── 좋아요 / 북마크 ──

export interface Like {
    id: string;
    userId: string;
    targetType: 'post' | 'comment';
    targetId: string;
    createdAt: string;
}

export interface Bookmark {
    id: string;
    userId: string;
    postId: string;
    createdAt: string;
}

// ── API 요청/응답 타입 ──

export interface CreatePostInput {
    site: SiteCode;
    board: string;
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    representImage?: string;
    status?: PostStatus;
    isPinned?: boolean;
    // 비회원
    guestNickname?: string;
    guestPassword?: string;
    guestEmail?: string;
    // 첨부파일 ID (미리 업로드 후)
    attachmentIds?: string[];
}

export interface UpdatePostInput {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    representImage?: string;
    status?: PostStatus;
    isPinned?: boolean;
    // 비회원 수정 시
    guestPassword?: string;
}

export interface PostListParams {
    site: SiteCode;
    board?: string;
    category?: string;
    tag?: string;
    status?: PostStatus;
    search?: string;
    sort?: 'latest' | 'popular' | 'comments' | 'views';
    period?: 'all' | 'today' | 'week' | 'month' | 'year';
    page?: number;
    limit?: number;
}

export interface PostListResponse {
    posts: Post[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateCommentInput {
    postId: string;
    parentId?: string;
    content: string;
    guestNickname?: string;
    guestPassword?: string;
}

// ── 관리자 API (AI 에이전트용) ──

export interface AdminPostInput {
    site: SiteCode;
    board: string;
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    representImage?: string;
    status?: PostStatus;
    isPinned?: boolean;
    authorType?: 'admin' | 'agent';
}

// ── 게시판 통계 ──

export interface BoardStats {
    site: SiteCode;
    board: string;
    totalPosts: number;
    totalComments: number;
    totalViews: number;
    todayPosts: number;
    popularPosts: Post[];
}
