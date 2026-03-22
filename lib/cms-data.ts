import {
    CmsSite, CmsBoard, CmsBoardPost, CmsComment, CmsWidget, CmsPost,
    BoardOptionSettings, BoardDesignSettings,
} from '@/types/cms';

// ── 기본값 ──

const defaultOptions: BoardOptionSettings = {
    secretPostMode: 'optional',
    secretRequirePassword: false,
    secretHideTitle: false,
    secretRequirePasswordOnView: false,
    newBadgeDuration: 1,
    writeButtonDisplay: 'always',
    commentOrder: 'asc',
    allowFeaturedImage: true,
    allowTimeRestriction: false,
    authorDisplayType: 'nickname',
    titleTemplateLocked: false,
    bodyPlaceholder: '',
};

const defaultDesign: BoardDesignSettings = {
    showBoardName: true,
    showTotalCount: true,
    showProfileImage: true,
    showSearchBar: true,
    showLightbox: true,
    showAuthor: true,
    showDate: true,
    showNumber: true,
    showCategory: false,
    showViews: true,
    showCommentCount: true,
    showLikes: true,
    showShare: true,
    showPrint: true,
    rowsPerPage: 10,
    rowSpacing: 20,
    pinNoticeOnAllPages: false,
    titleFontSize: 14,
    metaFontSize: 12,
    layout: 'list-thumb',
};

// ── Sites ──

export const initialSites: CmsSite[] = [
    {
        id: 'site-tenone', name: 'Ten:One™', slug: 'tenone', domain: 'tenone.biz',
        description: 'Ten:One Universe 공식 사이트', siteType: 'internal', status: 'active',
        createdAt: '2020-03-11', updatedAt: '2025-08-31',
    },
    {
        id: 'site-luki', name: 'LUKI', slug: 'luki', domain: 'luki.ai',
        description: 'AI 4인조 걸그룹 LUKI 공식 사이트', brandId: 'luki', siteType: 'brand', status: 'active',
        createdAt: '2025-08-31', updatedAt: '2025-08-31',
    },
    {
        id: 'site-madleague', name: 'MAD League', slug: 'madleague', domain: 'madleague.net',
        description: '대학생 마케팅/광고 프로젝트 연합', brandId: 'madleague', siteType: 'brand', status: 'active',
        createdAt: '2022-07-18', updatedAt: '2025-08-31',
    },
    {
        id: 'site-rook', name: 'RooK', slug: 'rook', domain: 'rook.co.kr',
        description: '인공지능 크리에이터 플랫폼', brandId: 'rook', siteType: 'brand', status: 'active',
        createdAt: '2025-08-29', updatedAt: '2025-08-29',
    },
    {
        id: 'site-badak', name: 'Badak', slug: 'badak', domain: 'badak.biz',
        description: '마케팅/광고 네트워킹 커뮤니티', brandId: 'badak', siteType: 'brand', status: 'active',
        createdAt: '2021-02-08', updatedAt: '2025-08-31',
    },
];

// ── Boards ──

export const initialBoards: CmsBoard[] = [
    // TenOne 사이트 게시판
    {
        id: 'board-tenone-newsroom', siteId: 'site-tenone', name: '뉴스룸', slug: 'newsroom',
        description: 'Ten:One Universe 소식', boardType: 'general', skinType: 'card',
        visibility: 'public', listPermission: 'all', readPermission: 'all', writePermission: 'staff', commentPermission: 'member',
        allowComments: true, allowAttachments: true, allowSecretPost: false, allowSecretComment: false, allowScheduledPost: true,
        useCategories: true,
        categories: [
            { id: 'cat-1', name: '브랜드', slug: 'brand', order: 1 },
            { id: 'cat-2', name: '프로젝트', slug: 'project', order: 2 },
            { id: 'cat-3', name: '네트워크', slug: 'network', order: 3 },
            { id: 'cat-4', name: '교육', slug: 'education', order: 4 },
        ],
        postsPerPage: 12, sortOrder: 'latest',
        options: defaultOptions,
        design: defaultDesign,
        createdAt: '2020-03-11', updatedAt: '2025-08-31',
    },
    {
        id: 'board-tenone-works', siteId: 'site-tenone', name: 'Works', slug: 'works',
        description: 'Ten:One Universe 포트폴리오', boardType: 'gallery', skinType: 'card',
        visibility: 'public', listPermission: 'all', readPermission: 'all', writePermission: 'staff', commentPermission: 'member',
        allowComments: true, allowAttachments: true, allowSecretPost: false, allowSecretComment: false, allowScheduledPost: true,
        useCategories: true,
        categories: [
            { id: 'cat-w1', name: 'AI', slug: 'ai', order: 1 },
            { id: 'cat-w2', name: '브랜딩', slug: 'branding', order: 2 },
            { id: 'cat-w3', name: '콘텐츠', slug: 'content', order: 3 },
        ],
        postsPerPage: 12, sortOrder: 'latest',
        options: defaultOptions,
        design: { ...defaultDesign, layout: 'grid-thumb-text' },
        createdAt: '2020-03-11', updatedAt: '2025-08-31',
    },
    {
        id: 'board-tenone-notice', siteId: 'site-tenone', name: '공지사항', slug: 'notice',
        description: '내부 공지사항', boardType: 'notice', skinType: 'list',
        visibility: 'staff', listPermission: 'staff', readPermission: 'staff', writePermission: 'admin', commentPermission: 'staff',
        allowComments: true, allowAttachments: true, allowSecretPost: false, allowSecretComment: false, allowScheduledPost: true,
        useCategories: true,
        categories: [
            { id: 'cat-n1', name: 'HR', slug: 'hr', order: 1 },
            { id: 'cat-n2', name: '경영', slug: 'management', order: 2 },
            { id: 'cat-n3', name: '일반', slug: 'general', order: 3 },
        ],
        postsPerPage: 20, sortOrder: 'pinned-first',
        options: defaultOptions,
        design: defaultDesign,
        createdAt: '2020-03-11', updatedAt: '2025-08-31',
    },
    {
        id: 'board-tenone-recruit', siteId: 'site-tenone', name: '채용', slug: 'recruit',
        description: 'Ten:One 채용 공고', boardType: 'recruit', skinType: 'card',
        visibility: 'public', listPermission: 'all', readPermission: 'all', writePermission: 'staff', commentPermission: 'member',
        allowComments: false, allowAttachments: true, allowSecretPost: false, allowSecretComment: false, allowScheduledPost: true,
        useCategories: false,
        categories: [],
        postsPerPage: 10, sortOrder: 'latest',
        options: defaultOptions,
        design: defaultDesign,
        createdAt: '2025-01-01', updatedAt: '2025-08-31',
    },

    // MAD League 사이트 게시판
    {
        id: 'board-mad-notice', siteId: 'site-madleague', name: '공지사항', slug: 'notice',
        description: 'MAD League 공지', boardType: 'notice', skinType: 'list',
        visibility: 'intra', listPermission: 'intra', readPermission: 'intra', writePermission: 'staff', commentPermission: 'intra',
        allowComments: true, allowAttachments: true, allowSecretPost: false, allowSecretComment: false, allowScheduledPost: true,
        useCategories: false,
        categories: [],
        postsPerPage: 20, sortOrder: 'pinned-first',
        options: defaultOptions,
        design: defaultDesign,
        createdAt: '2022-07-18', updatedAt: '2025-08-31',
    },
    {
        id: 'board-mad-gallery', siteId: 'site-madleague', name: '활동 갤러리', slug: 'gallery',
        description: 'MAD League 활동 사진', boardType: 'gallery', skinType: 'gallery',
        visibility: 'public', listPermission: 'all', readPermission: 'all', writePermission: 'intra', commentPermission: 'member',
        allowComments: true, allowAttachments: true, allowSecretPost: false, allowSecretComment: false, allowScheduledPost: false,
        useCategories: true,
        categories: [
            { id: 'cat-mg1', name: '프로젝트', slug: 'project', order: 1 },
            { id: 'cat-mg2', name: '네트워킹', slug: 'networking', order: 2 },
            { id: 'cat-mg3', name: '교육', slug: 'education', order: 3 },
        ],
        postsPerPage: 20, sortOrder: 'latest',
        options: defaultOptions,
        design: { ...defaultDesign, layout: 'grid-thumb-text' },
        createdAt: '2022-07-18', updatedAt: '2025-08-31',
    },
    {
        id: 'board-mad-faq', siteId: 'site-madleague', name: 'FAQ', slug: 'faq',
        description: 'MAD League 자주 묻는 질문', boardType: 'faq', skinType: 'list',
        visibility: 'public', listPermission: 'all', readPermission: 'all', writePermission: 'staff', commentPermission: 'all',
        allowComments: false, allowAttachments: false, allowSecretPost: false, allowSecretComment: false, allowScheduledPost: false,
        useCategories: false,
        categories: [],
        postsPerPage: 50, sortOrder: 'pinned-first',
        options: defaultOptions,
        design: defaultDesign,
        createdAt: '2022-07-18', updatedAt: '2025-08-31',
    },

    // LUKI 사이트 게시판
    {
        id: 'board-luki-video', siteId: 'site-luki', name: '영상', slug: 'video',
        description: 'LUKI 뮤직비디오, 콘텐츠', boardType: 'video', skinType: 'video',
        visibility: 'public', listPermission: 'all', readPermission: 'all', writePermission: 'staff', commentPermission: 'member',
        allowComments: true, allowAttachments: false, allowSecretPost: false, allowSecretComment: false, allowScheduledPost: true,
        useCategories: true,
        categories: [
            { id: 'cat-lv1', name: 'MV', slug: 'mv', order: 1 },
            { id: 'cat-lv2', name: '비하인드', slug: 'behind', order: 2 },
            { id: 'cat-lv3', name: '콘텐츠', slug: 'content', order: 3 },
        ],
        postsPerPage: 12, sortOrder: 'latest',
        options: defaultOptions,
        design: { ...defaultDesign, layout: 'grid-image' },
        createdAt: '2025-08-31', updatedAt: '2025-08-31',
    },

    // Badak 사이트 게시판
    {
        id: 'board-badak-free', siteId: 'site-badak', name: '자유게시판', slug: 'free',
        description: '업계 자유 토론', boardType: 'general', skinType: 'list',
        visibility: 'intra', listPermission: 'member', readPermission: 'member', writePermission: 'member', commentPermission: 'member',
        allowComments: true, allowAttachments: true, allowSecretPost: true, allowSecretComment: true, allowScheduledPost: false,
        useCategories: true,
        categories: [
            { id: 'cat-bf1', name: '잡담', slug: 'chat', order: 1 },
            { id: 'cat-bf2', name: '정보공유', slug: 'info', order: 2 },
            { id: 'cat-bf3', name: '구인/구직', slug: 'job', order: 3 },
        ],
        postsPerPage: 20, sortOrder: 'latest',
        options: defaultOptions,
        design: defaultDesign,
        createdAt: '2021-02-08', updatedAt: '2025-08-31',
    },
    {
        id: 'board-badak-event', siteId: 'site-badak', name: '이벤트', slug: 'event',
        description: '네트워킹 이벤트 & 밋업', boardType: 'event', skinType: 'card',
        visibility: 'public', listPermission: 'all', readPermission: 'all', writePermission: 'staff', commentPermission: 'member',
        allowComments: true, allowAttachments: true, allowSecretPost: false, allowSecretComment: false, allowScheduledPost: true,
        useCategories: false,
        categories: [],
        postsPerPage: 10, sortOrder: 'latest',
        options: defaultOptions,
        design: defaultDesign,
        createdAt: '2021-02-08', updatedAt: '2025-08-31',
    },
];

// ── Board Posts ──

export const initialBoardPosts: CmsBoardPost[] = [
    // TenOne 뉴스룸
    {
        id: 'bp-1', boardId: 'board-tenone-newsroom', siteId: 'site-tenone',
        title: 'LUKI — AI 4인조 걸그룹 데뷔', summary: '파괴된 행성 루미나의 빛의 조각이 되어 지구에 불시착한 네 명의 소녀들.',
        body: '파괴된 행성 "루미나"의 빛의 조각이 되어 지구에 불시착한 네 명의 소녀들. 하이틴 판타지와 SF를 결합한 AI 아이돌 그룹이 데뷔했습니다.',
        status: 'published', categoryId: 'cat-1', isPinned: true, isRecommended: true, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: 'LUKI 데뷔 비주얼 이미지',
        attachments: [], tags: ['AI', 'K-Pop', '데뷔'], publishedAt: '2025-08-31',
        viewCount: 1245, commentCount: 8, createdAt: '2025-08-31', updatedAt: '2025-08-31',
    },
    {
        id: 'bp-2', boardId: 'board-tenone-newsroom', siteId: 'site-tenone',
        title: 'RooK — 인공지능 크리에이터 플랫폼 런칭', summary: '인공지능으로 다양한 창작 활동을 하는 사람들과 만나보세요.',
        body: '인공지능으로 다양한 창작 활동을 하는 사람들과 만나보자는 생각에 인공지능 크리에이터 루크를 만들었습니다.',
        status: 'published', categoryId: 'cat-1', isPinned: false, isRecommended: true, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: 'RooK 플랫폼 키 비주얼',
        attachments: [], tags: ['AI', '크리에이터'], publishedAt: '2025-08-29',
        viewCount: 892, commentCount: 5, createdAt: '2025-08-29', updatedAt: '2025-08-29',
    },
    {
        id: 'bp-3', boardId: 'board-tenone-newsroom', siteId: 'site-tenone',
        title: 'MADzine — 마케팅/광고 매거진 창간', summary: '마케팅, 광고에 미친(MAD) 우리들의 이야기.',
        body: '마케팅, 광고에 미친(MAD) 우리들의 이야기. 형식도, 주기도 없는 새로운 마케팅/광고 매거진이 창간되었습니다.',
        status: 'published', categoryId: 'cat-1', isPinned: false, isRecommended: false, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: 'MADzine 창간호 표지',
        attachments: [], tags: ['매거진', '마케팅'], publishedAt: '2025-04-03',
        viewCount: 567, commentCount: 3, createdAt: '2025-04-03', updatedAt: '2025-04-03',
    },
    {
        id: 'bp-4', boardId: 'board-tenone-newsroom', siteId: 'site-tenone',
        title: '전국 5개 권역 네트워크 완성', summary: '제주 수작이 합류하며 전국 MAD League 네트워크가 완성되었습니다.',
        body: '제주 수작이 합류하며 서울경기, 대구경북, 부산경남, 광주전남, 제주까지 전국 MAD League 네트워크가 완성되었습니다.',
        status: 'published', categoryId: 'cat-3', isPinned: false, isRecommended: false, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: '전국 네트워크 지도',
        attachments: [], tags: ['네트워크', 'MAD League'], publishedAt: '2025-01-13',
        viewCount: 412, commentCount: 2, createdAt: '2025-01-13', updatedAt: '2025-01-13',
    },
    {
        id: 'bp-5', boardId: 'board-tenone-newsroom', siteId: 'site-tenone',
        title: 'MAD League X 지평주조 — 경쟁 PT', summary: '지평주조 탄생 100주년을 맞아 경쟁 PT를 진행했습니다.',
        body: '지평주조 탄생 100주년을 맞아 전국 3개 연합 동아리가 마케팅 계획 경쟁 PT를 진행했습니다.',
        status: 'published', categoryId: 'cat-2', isPinned: false, isRecommended: true, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: '경쟁 PT 현장 사진',
        attachments: [], tags: ['경쟁PT', '프로젝트'], publishedAt: '2024-09-27',
        viewCount: 738, commentCount: 12, createdAt: '2024-09-27', updatedAt: '2024-09-27',
    },

    // TenOne Works
    {
        id: 'bp-6', boardId: 'board-tenone-works', siteId: 'site-tenone',
        title: 'LUKI — AI 아이돌 그룹', summary: 'AI 4인조 걸그룹 LUKI 프로젝트',
        body: '하이틴 판타지와 SF를 결합한 AI 아이돌 그룹.',
        status: 'published', categoryId: 'cat-w1', isPinned: false, isRecommended: true, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: 'LUKI 데뷔 비주얼 이미지',
        attachments: [], tags: ['AI', 'K-Pop'], publishedAt: '2025-08-31',
        viewCount: 2100, commentCount: 15, createdAt: '2025-08-31', updatedAt: '2025-08-31',
    },
    {
        id: 'bp-7', boardId: 'board-tenone-works', siteId: 'site-tenone',
        title: 'RooK — AI 크리에이터 플랫폼', summary: '인공지능 크리에이터 플랫폼',
        body: '인공지능으로 다양한 창작 활동을 하는 사람들의 플랫폼.',
        status: 'published', categoryId: 'cat-w1', isPinned: false, isRecommended: true, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: 'RooK 플랫폼 키 비주얼',
        attachments: [], tags: ['AI', '크리에이터'], publishedAt: '2025-08-29',
        viewCount: 1560, commentCount: 7, createdAt: '2025-08-29', updatedAt: '2025-08-29',
    },
    {
        id: 'bp-8', boardId: 'board-tenone-works', siteId: 'site-tenone',
        title: '0gamja — 캐릭터 브랜드', summary: '하찮지만 귀여운 감자들의 공감 이야기',
        body: '인공지능 시대일수록 사람이어야만 하는 이유. 하찮지만 귀여운 감자들의 공감 이야기.',
        status: 'published', categoryId: 'cat-w2', isPinned: false, isRecommended: false, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: '0gamja 캐릭터 일러스트',
        attachments: [], tags: ['캐릭터', '브랜드'], publishedAt: '2024-01-17',
        viewCount: 980, commentCount: 4, createdAt: '2024-01-17', updatedAt: '2024-01-17',
    },

    // TenOne 공지사항
    {
        id: 'bp-9', boardId: 'board-tenone-notice', siteId: 'site-tenone',
        title: '2026년 1분기 경영 계획 공유', summary: '2026년 1분기 주요 사업 방향과 목표를 공유합니다.',
        body: '2026년 1분기 주요 사업 방향과 목표를 공유합니다. 첨부된 자료를 확인해주세요.',
        status: 'published', categoryId: 'cat-n2', isPinned: true, isRecommended: false, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원',
        attachments: [], tags: ['경영', '계획'], publishedAt: '2026-01-02',
        noticeStart: '2026-01-02', noticeEnd: '2026-03-31',
        viewCount: 45, commentCount: 0, createdAt: '2026-01-02', updatedAt: '2026-01-02',
    },
    {
        id: 'bp-10', boardId: 'board-tenone-notice', siteId: 'site-tenone',
        title: '신규 직원 온보딩 프로세스 안내', summary: '새로 합류하시는 분들을 위한 온보딩 절차를 안내합니다.',
        body: '새로 합류하시는 분들을 위한 온보딩 절차를 안내합니다.',
        status: 'published', categoryId: 'cat-n1', isPinned: false, isRecommended: false, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원',
        attachments: [], tags: ['HR', '온보딩'], publishedAt: '2025-12-15',
        viewCount: 32, commentCount: 1, createdAt: '2025-12-15', updatedAt: '2025-12-15',
    },

    // TenOne 채용
    {
        id: 'bp-11', boardId: 'board-tenone-recruit', siteId: 'site-tenone',
        title: 'AI 콘텐츠 크리에이터 모집', summary: 'AI 도구를 활용한 콘텐츠 제작 담당자를 모집합니다.',
        body: 'AI 도구를 활용한 콘텐츠 제작 담당자를 모집합니다. LUKI, RooK 프로젝트에 참여하게 됩니다.',
        status: 'published', isPinned: true, isRecommended: true, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원',
        attachments: [], tags: ['채용', 'AI', '크리에이터'], publishedAt: '2026-03-01',
        position: 'AI 콘텐츠 크리에이터', employmentType: '정규', salaryRange: '협의',
        deadline: '2026-04-30', applyUrl: 'https://tenone.biz/recruit/ai-creator',
        viewCount: 320, commentCount: 0, createdAt: '2026-03-01', updatedAt: '2026-03-01',
    },

    // MAD League 공지
    {
        id: 'bp-12', boardId: 'board-mad-notice', siteId: 'site-madleague',
        title: '2026 상반기 MAD League 신규 기수 모집', summary: '2026 상반기 MAD League 8기를 모집합니다.',
        body: '2026 상반기 MAD League 8기를 모집합니다. 마케팅/광고에 관심 있는 대학생이라면 누구나 지원 가능합니다.',
        status: 'published', isPinned: true, isRecommended: false, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원',
        attachments: [], tags: ['모집', '8기'], publishedAt: '2026-02-15',
        noticeStart: '2026-02-15', noticeEnd: '2026-03-31',
        viewCount: 256, commentCount: 5, createdAt: '2026-02-15', updatedAt: '2026-02-15',
    },

    // MAD League 갤러리
    {
        id: 'bp-13', boardId: 'board-mad-gallery', siteId: 'site-madleague',
        title: '지평주조 경쟁 PT 현장', summary: '지평주조 100주년 기념 마케팅 경쟁 PT 사진',
        body: '전국 3개 연합 동아리가 참여한 경쟁 PT 현장입니다.',
        status: 'published', categoryId: 'cat-mg1', isPinned: false, isRecommended: true, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: '경쟁 PT 현장 사진',
        attachments: [], tags: ['경쟁PT', '지평주조'], publishedAt: '2024-09-27',
        viewCount: 489, commentCount: 8, createdAt: '2024-09-27', updatedAt: '2024-09-27',
    },

    // MAD League FAQ
    {
        id: 'bp-14', boardId: 'board-mad-faq', siteId: 'site-madleague',
        title: 'MAD League에 가입하려면 어떻게 하나요?', summary: '',
        body: 'MAD League에 가입하려면 어떻게 하나요?',
        status: 'published', isPinned: true, isRecommended: false, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원',
        attachments: [], tags: ['가입'], publishedAt: '2022-08-01',
        answer: 'MAD League는 매 학기마다 신규 기수를 모집합니다. 공식 사이트의 모집 공지를 확인하시고 지원서를 제출해주세요. 서류 심사 → 면접 → 합류 순서로 진행됩니다.',
        answerStatus: '완료',
        viewCount: 1230, commentCount: 0, createdAt: '2022-08-01', updatedAt: '2025-06-01',
    },
    {
        id: 'bp-15', boardId: 'board-mad-faq', siteId: 'site-madleague',
        title: '활동 기간과 주요 활동은 무엇인가요?', summary: '',
        body: '활동 기간과 주요 활동은 무엇인가요?',
        status: 'published', isPinned: false, isRecommended: false, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원',
        attachments: [], tags: ['활동'], publishedAt: '2022-08-01',
        answer: '한 기수당 6개월 활동합니다. 주요 활동은 실전 마케팅 프로젝트, 기업 경쟁 PT, 네트워킹 행사, 스터디 등입니다.',
        answerStatus: '완료',
        viewCount: 890, commentCount: 0, createdAt: '2022-08-01', updatedAt: '2025-06-01',
    },

    // LUKI 영상
    {
        id: 'bp-16', boardId: 'board-luki-video', siteId: 'site-luki',
        title: 'LUKI — Debut MV "Light Fragment"', summary: 'LUKI 데뷔곡 Light Fragment 뮤직비디오',
        body: 'LUKI 데뷔곡 Light Fragment 공식 뮤직비디오입니다.',
        status: 'published', categoryId: 'cat-lv1', isPinned: true, isRecommended: true, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: 'LUKI MV 썸네일',
        attachments: [], tags: ['MV', '데뷔'], publishedAt: '2025-08-31',
        videoUrl: 'https://youtube.com/watch?v=example', videoDuration: '3:42',
        viewCount: 15600, commentCount: 124, createdAt: '2025-08-31', updatedAt: '2025-08-31',
    },

    // Badak 자유게시판
    {
        id: 'bp-17', boardId: 'board-badak-free', siteId: 'site-badak',
        title: '요즘 광고 업계 트렌드 어떤가요?', summary: '최근 광고 업계 흐름이 궁금합니다.',
        body: '최근 광고 업계 흐름이 궁금합니다. AI 활용도 늘고 있다고 하는데, 실제 현장에서는 어떤가요?',
        status: 'published', categoryId: 'cat-bf2', isPinned: false, isRecommended: false, isSecret: false,
        authorId: 'user-1', authorName: '마케터A',
        attachments: [], tags: ['트렌드', 'AI'], publishedAt: '2026-03-15',
        viewCount: 67, commentCount: 4, createdAt: '2026-03-15', updatedAt: '2026-03-15',
    },

    // Badak 이벤트
    {
        id: 'bp-18', boardId: 'board-badak-event', siteId: 'site-badak',
        title: '2026 Spring Networking Day', summary: '봄맞이 마케팅/광고 네트워킹 데이',
        body: '마케팅/광고 업계 종사자들을 위한 네트워킹 이벤트입니다.',
        status: 'published', isPinned: true, isRecommended: true, isSecret: false,
        authorId: 'staff-ceo', authorName: '텐원', image: '네트워킹 이벤트 포스터',
        attachments: [], tags: ['네트워킹', '밋업'], publishedAt: '2026-03-01',
        eventDate: '2026-04-12T14:00:00', eventEndDate: '2026-04-12T18:00:00',
        eventLocation: '서울 강남구 테헤란로', capacity: 50, fee: 0,
        registrationStatus: '모집중',
        viewCount: 180, commentCount: 12, createdAt: '2026-03-01', updatedAt: '2026-03-01',
    },
];

// ── Comments ──

export const initialComments: CmsComment[] = [
    {
        id: 'comment-1', postId: 'bp-1', authorId: 'user-2', authorName: '김마케',
        body: 'LUKI 정말 기대됩니다! AI 아이돌이라니 신선하네요.',
        isSecret: false, createdAt: '2025-09-01', updatedAt: '2025-09-01',
    },
    {
        id: 'comment-2', postId: 'bp-1', authorId: 'user-3', authorName: '이광고',
        body: '세계관이 탄탄하네요. 다음 활동도 기대합니다!',
        isSecret: false, createdAt: '2025-09-02', updatedAt: '2025-09-02',
    },
    {
        id: 'comment-3', postId: 'bp-17', authorId: 'user-4', authorName: '박광고',
        body: 'AI 활용은 확실히 늘고 있어요. 특히 소규모 에이전시에서 많이 쓰고 있습니다.',
        isSecret: false, createdAt: '2026-03-15', updatedAt: '2026-03-15',
    },
    {
        id: 'comment-4', postId: 'bp-17', authorId: 'user-5', authorName: '최크리',
        body: '이건 비밀인데... 우리 회사도 올해부터 AI 도입 검토 중이에요.',
        isSecret: true, createdAt: '2026-03-16', updatedAt: '2026-03-16',
    },
];

// ── Widgets ──

export const initialWidgets: CmsWidget[] = [
    {
        id: 'widget-1', name: '뉴스룸 최신글', boardId: 'board-tenone-newsroom',
        displayCount: 5, displayStyle: 'card', sortBy: 'latest',
        showDate: true, showAuthor: false, showImage: true,
    },
    {
        id: 'widget-2', name: '인기 Works', boardId: 'board-tenone-works',
        displayCount: 4, displayStyle: 'thumbnail', sortBy: 'views',
        showDate: false, showAuthor: false, showImage: true,
    },
    {
        id: 'widget-3', name: '추천 콘텐츠', boardId: 'board-tenone-newsroom',
        displayCount: 3, displayStyle: 'list', sortBy: 'recommended',
        showDate: true, showAuthor: true, showImage: false,
    },
];

// ── 하위 호환: 기존 CmsPost (newsroom/works 페이지용) ──

export const initialPosts: CmsPost[] = [
    {
        id: 'cms-1', title: 'LUKI — AI 4인조 걸그룹 데뷔',
        summary: '파괴된 행성 "루미나"의 빛의 조각이 되어 지구에 불시착한 네 명의 소녀들. 하이틴 판타지와 SF를 결합한 AI 아이돌 그룹이 데뷔했습니다.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2025-08-31', brandId: 'luki', image: 'LUKI 데뷔 비주얼 이미지',
        externalLink: 'https://youtube.com/@LUKI-AIdol', tags: ['AI', 'K-Pop', '데뷔'],
        createdAt: '2025-08-31', updatedAt: '2025-08-31'
    },
    {
        id: 'cms-2', title: 'RooK — 인공지능 크리에이터 플랫폼 런칭',
        summary: '인공지능으로 다양한 창작 활동을 하는 사람들과 만나보자는 생각에 인공지능 크리에이터 루크를 만들었습니다.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2025-08-29', brandId: 'rook', image: 'RooK 플랫폼 키 비주얼',
        externalLink: 'http://RooK.co.kr', tags: ['AI', '크리에이터'],
        createdAt: '2025-08-29', updatedAt: '2025-08-29'
    },
    {
        id: 'cms-3', title: 'MADzine — 마케팅/광고 매거진 창간',
        summary: '마케팅, 광고에 미친(MAD) 우리들의 이야기. 형식도, 주기도 없는 새로운 마케팅/광고 매거진이 창간되었습니다.',
        body: '', category: '콘텐츠', channels: ['newsroom'], status: 'Published',
        date: '2025-04-03', image: 'MADzine 창간호 표지', tags: ['매거진', '마케팅'],
        createdAt: '2025-04-03', updatedAt: '2025-04-03'
    },
    {
        id: 'cms-4', title: 'DAM Be — MAD League 캐릭터 개발',
        summary: '최상위 포식자이자 영리한 한국의 노란목 담비를 MAD League의 캐릭터로 상징화했습니다.',
        body: '', category: '브랜드', channels: ['newsroom'], status: 'Published',
        date: '2025-03-31', image: 'DAM Be 캐릭터 일러스트', tags: ['캐릭터', '브랜딩'],
        createdAt: '2025-03-31', updatedAt: '2025-03-31'
    },
    {
        id: 'cms-5', title: '전국 5개 권역 네트워크 완성',
        summary: '제주 수작이 합류하며 서울경기, 대구경북, 부산경남, 광주전남, 제주까지 전국 MAD League 네트워크가 완성되었습니다.',
        body: '', category: '네트워크', channels: ['newsroom'], status: 'Published',
        date: '2025-01-13', image: '전국 네트워크 지도', tags: ['네트워크', 'MAD League'],
        createdAt: '2025-01-13', updatedAt: '2025-01-13'
    },
    {
        id: 'cms-6', title: 'MAD League X 지평주조 — 경쟁 PT',
        summary: '지평주조 탄생 100주년을 맞아 전국 3개 연합 동아리가 마케팅 계획 경쟁 PT를 진행했습니다.',
        body: '', category: '프로젝트', channels: ['newsroom'], status: 'Published',
        date: '2024-09-27', image: '경쟁 PT 현장 사진', tags: ['경쟁PT', '프로젝트'],
        createdAt: '2024-09-27', updatedAt: '2024-09-27'
    },
    {
        id: 'cms-7', title: 'ChangeUp — 인공지능 시대 인재 양성',
        summary: '기업가 정신을 가르치는 선생님들과 함께 학생들의 창업 아이디어를 실현하도록 돕는 프로그램을 시작했습니다.',
        body: '', category: '교육', channels: ['works', 'newsroom'], status: 'Published',
        date: '2024-05-18', brandId: 'youinone', image: 'ChangeUp 프로그램 현장',
        externalLink: 'http://ChangeUp.company', tags: ['인재양성', '창업'],
        createdAt: '2024-05-18', updatedAt: '2024-05-18'
    },
    {
        id: 'cms-8', title: '0gamja — 캐릭터 브랜드 런칭',
        summary: '인공지능 시대일수록 사람이어야만 하는 이유. 하찮지만 귀여운 감자들의 공감 이야기.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2024-01-17', brandId: '0gamja', image: '0gamja 캐릭터 일러스트',
        externalLink: 'http://0gamja.com', tags: ['캐릭터', '브랜드'],
        createdAt: '2024-01-17', updatedAt: '2024-01-17'
    },
    {
        id: 'cms-9', title: 'FWN — 패션 위크 네트워크',
        summary: '전세계 패션 위크를 네트워킹하고 한국 브랜드의 세계 진출을 돕는 패션 산업의 나침반.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2023-09-25', brandId: 'fwn', image: 'FWN 패션위크 현장',
        externalLink: 'http://FWN.co.kr', tags: ['패션', '네트워크'],
        createdAt: '2023-09-25', updatedAt: '2023-09-25'
    },
    {
        id: 'cms-10', title: 'YouInOne — 프로젝트 그룹 출범',
        summary: '사회와 기업의 고민을 해결하는 프로젝트 그룹. 소규모 기업 연합 얼라이언스로 연대합니다.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2023-05-15', brandId: 'youinone', image: 'YouInOne 팀 사진',
        externalLink: 'http://YouInOne.com', tags: ['프로젝트', '연합'],
        createdAt: '2023-05-15', updatedAt: '2023-05-15'
    },
    {
        id: 'cms-11', title: 'MAD League — 대학생 프로젝트 연합 출범',
        summary: '실전 프로젝트를 통해 마케팅/광고 업계로 진출하고자 하는 학생들에게 기회를 제공합니다.',
        body: '', category: '네트워크', channels: ['works', 'newsroom'], status: 'Published',
        date: '2022-07-18', brandId: 'madleague', image: 'MAD League 출범 현장',
        externalLink: 'http://MADLeague.net', tags: ['대학생', '연합'],
        createdAt: '2022-07-18', updatedAt: '2022-07-18'
    },
    {
        id: 'cms-12', title: 'Badak.biz — 네트워킹 커뮤니티 오픈',
        summary: '바닥 좁다고 했잖아. 마케팅/광고 업계 다양한 사람들을 만나고 이야기할 수 있는 커뮤니티.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2021-02-08', brandId: 'badak', image: 'Badak 밋업 현장 사진',
        externalLink: 'http://badak.biz', tags: ['네트워킹', '커뮤니티'],
        createdAt: '2021-02-08', updatedAt: '2021-02-08'
    },
    {
        id: 'cms-13', title: 'Ten:One™ Universe — 세계관의 시작',
        summary: '과거의 아이디어와 계획들을 세상에 꺼내 놓기로 결심하며 Ten:One™ 사이트를 오픈했습니다.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2020-03-11', brandId: 'tenone', image: 'Ten:One™ 오리지널 사이트',
        tags: ['시작', '세계관'],
        createdAt: '2020-03-11', updatedAt: '2020-03-11'
    },
];
