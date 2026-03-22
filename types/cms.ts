// Ten:One™ CMS 시스템 타입 정의
// 구조: Site > Board > Post

// ── 사이트 ──

export type SiteType = 'internal' | 'brand' | 'external';
export type SiteStatus = 'active' | 'maintenance' | 'inactive';

export interface CmsSite {
    id: string;
    name: string;
    slug: string;
    domain: string;
    description: string;
    brandId?: string;
    siteType: SiteType;
    status: SiteStatus;
    faviconUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// ── 게시판 ──

export type BoardType =
    | 'general'   // 일반 게시판
    | 'notice'    // 공지사항
    | 'gallery'   // 갤러리/포트폴리오
    | 'video'     // 영상 게시판
    | 'faq'       // FAQ
    | 'qna'       // Q&A
    | 'commerce'  // 커머스/상품
    | 'recruit'   // 구인/채용
    | 'event';    // 이벤트/행사

export type SkinType = 'list' | 'card' | 'gallery' | 'video';

export type BoardPermissionLevel = 'all' | 'member' | 'intra' | 'staff' | 'admin';

export type BoardVisibility = 'public' | 'intra' | 'staff';

export type SortOrder = 'latest' | 'popular' | 'pinned-first';

export interface CmsBoardCategory {
    id: string;
    name: string;
    slug: string;
    order: number;
}

// 레이아웃 변형
export type ListLayout = 'list-thumb' | 'list-detail' | 'list-image' | 'list-text';
export type GridLayout = 'grid-thumb-text' | 'grid-text-thumb' | 'grid-image' | 'grid-text';
export type MasonryLayout = 'masonry-thumb-text' | 'masonry-image' | 'masonry-full' | 'masonry-text';
export type BoardLayout = ListLayout | GridLayout | MasonryLayout;

export type AuthorDisplayType = 'nickname' | 'name' | 'id' | 'anonymous';
export type SecretPostMode = 'disabled' | 'optional' | 'always';
export type CommentOrder = 'asc' | 'desc';
export type NewBadgeDuration = 0 | 1 | 3 | 7 | 14 | 30;
export type WriteButtonDisplay = 'always' | 'logged-in' | 'hidden';

// 게시판 디자인 설정
export interface BoardDesignSettings {
    // 구성 요소 표시
    showBoardName: boolean;
    showTotalCount: boolean;
    showProfileImage: boolean;
    showSearchBar: boolean;
    showLightbox: boolean;

    // 리스트 항목 표시
    showAuthor: boolean;
    showDate: boolean;
    showNumber: boolean;
    showCategory: boolean;
    showViews: boolean;
    showCommentCount: boolean;
    showLikes: boolean;
    showShare: boolean;
    showPrint: boolean;

    // 리스트 설정
    rowsPerPage: number;
    rowSpacing: number;
    pinNoticeOnAllPages: boolean;

    // 텍스트 크기
    titleFontSize: number;
    metaFontSize: number;

    // 레이아웃
    layout: BoardLayout;
}

// 게시판 옵션 설정
export interface BoardOptionSettings {
    // 비밀글 세부
    secretPostMode: SecretPostMode;
    secretRequirePassword: boolean;
    secretHideTitle: boolean;
    secretRequirePasswordOnView: boolean;

    // 옵션
    newBadgeDuration: NewBadgeDuration;
    writeButtonDisplay: WriteButtonDisplay;
    commentOrder: CommentOrder;

    // 글쓰기
    allowFeaturedImage: boolean;
    allowTimeRestriction: boolean;
    timeRestrictionStart?: string;
    timeRestrictionEnd?: string;

    // 작성자 표시
    authorDisplayType: AuthorDisplayType;

    // 양식
    titleTemplate?: string;
    titleTemplateLocked: boolean;
    bodyPlaceholder?: string;
    defaultBodyTemplate?: string;
}

export interface CmsBoard {
    id: string;
    siteId: string;
    name: string;
    slug: string;
    description?: string;
    boardType: BoardType;
    skinType: SkinType;
    visibility: BoardVisibility;

    // 권한 (4칸: 목록/읽기/글작성/댓글)
    listPermission: BoardPermissionLevel;
    readPermission: BoardPermissionLevel;
    writePermission: BoardPermissionLevel;
    commentPermission: BoardPermissionLevel;

    // 기능 설정
    allowComments: boolean;
    allowAttachments: boolean;
    allowSecretPost: boolean;
    allowSecretComment: boolean;
    allowScheduledPost: boolean;

    // 카테고리
    useCategories: boolean;
    categories: CmsBoardCategory[];

    // 표시 설정
    postsPerPage: number;
    sortOrder: SortOrder;

    // 상세 옵션
    options: BoardOptionSettings;

    // 디자인
    design: BoardDesignSettings;

    createdAt: string;
    updatedAt: string;
}

/** 게시판 유형 정보 */
export const BoardTypeInfo: Record<BoardType, { label: string; description: string; icon: string }> = {
    general: { label: '일반', description: '기본 게시판 (제목/본문/이미지)', icon: 'FileText' },
    notice: { label: '공지사항', description: '공지 기간, 고정글 지원', icon: 'Bell' },
    gallery: { label: '갤러리', description: '이미지 중심 게시판', icon: 'Image' },
    video: { label: '영상', description: 'YouTube/Vimeo 영상 게시판', icon: 'Video' },
    faq: { label: 'FAQ', description: '질문/답변 구조', icon: 'HelpCircle' },
    qna: { label: 'Q&A', description: '질문/답변 + 답변 상태 추적', icon: 'MessageSquare' },
    commerce: { label: '커머스', description: '상품 관리 (가격, 재고, 옵션)', icon: 'ShoppingBag' },
    recruit: { label: '채용/구인', description: '포지션, 고용형태, 마감일', icon: 'Briefcase' },
    event: { label: '이벤트', description: '일시, 장소, 모집인원, 참가비', icon: 'Calendar' },
};

// ── 게시글 ──

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'private';

export type EmploymentType = '정규' | '계약' | '인턴' | '프리랜서';
export type SaleStatus = '판매중' | '품절' | '종료';
export type RegistrationStatus = '모집중' | '마감' | '종료';
export type AnswerStatus = '대기' | '완료';

export interface CmsAttachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
}

export interface CmsBoardPost {
    id: string;
    boardId: string;
    siteId: string;
    title: string;
    summary: string;
    body: string;
    status: PostStatus;
    categoryId?: string;

    // 플래그
    isPinned: boolean;
    isRecommended: boolean;
    isSecret: boolean;

    // 작성자
    authorId: string;
    authorName: string;

    // 미디어
    image?: string;
    attachments: CmsAttachment[];
    tags: string[];

    // 일시
    publishedAt?: string;
    scheduledAt?: string;

    // 통계
    viewCount: number;
    commentCount: number;

    // ── 유형별 확장 필드 (optional) ──

    // video
    videoUrl?: string;
    videoDuration?: string;

    // commerce
    price?: number;
    stock?: number;
    productOptions?: string[];
    saleStatus?: SaleStatus;
    productImages?: string[];

    // recruit
    position?: string;
    employmentType?: EmploymentType;
    salaryRange?: string;
    deadline?: string;
    applyUrl?: string;

    // event
    eventDate?: string;
    eventEndDate?: string;
    eventLocation?: string;
    capacity?: number;
    fee?: number;
    registrationStatus?: RegistrationStatus;

    // faq/qna
    answer?: string;
    answerStatus?: AnswerStatus;

    // notice
    noticeStart?: string;
    noticeEnd?: string;

    createdAt: string;
    updatedAt: string;
}

// ── 댓글 ──

export interface CmsComment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    body: string;
    isSecret: boolean;
    parentId?: string; // 대댓글
    createdAt: string;
    updatedAt: string;
}

// ── 위젯 ──

export type WidgetDisplayStyle = 'list' | 'card' | 'thumbnail';
export type WidgetSortBy = 'latest' | 'views' | 'recommended';

export interface CmsWidget {
    id: string;
    name: string;
    boardId: string;
    displayCount: number;
    displayStyle: WidgetDisplayStyle;
    sortBy: WidgetSortBy;
    showDate: boolean;
    showAuthor: boolean;
    showImage: boolean;
}

// ── 하위 호환: 기존 CmsPost 타입 (newsroom/works에서 사용) ──

export type CmsChannel = 'works' | 'newsroom';
export type CmsCategory = '브랜드' | '프로젝트' | '네트워크' | '교육' | '콘텐츠' | '공지';
export type CmsStatus = 'Draft' | 'Published' | 'Archived';

export interface CmsPost {
    id: string;
    title: string;
    summary: string;
    body: string;
    category: CmsCategory;
    channels: CmsChannel[];
    status: CmsStatus;
    date: string;
    brandId?: string;
    image?: string;
    externalLink?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}
