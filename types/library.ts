// ── Library 공통 타입 ──

/** 공통 카테고리 — 다양한 자료 형태를 수용하는 분류 체계 */
export type LibraryCategory =
    | '전략·기획' | '템플릿·양식' | '레퍼런스·벤치마크'
    | '브랜드·디자인' | '마케팅·콘텐츠' | '커뮤니티·교육'
    | '인사·재무' | '기술·도구' | '계약·법무' | '기타';

export const libraryCategoryOptions: LibraryCategory[] = [
    '전략·기획', '템플릿·양식', '레퍼런스·벤치마크',
    '브랜드·디자인', '마케팅·콘텐츠', '커뮤니티·교육',
    '인사·재무', '기술·도구', '계약·법무', '기타',
];

/** 파일 형식 */
export type FileFormat = 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'PNG' | 'JPG' | 'MP4' | 'URL' | 'OTHER';

/** Library 소스 (어느 Library에 속하는지) */
export type LibrarySource = 'myverse' | 'wiki' | 'cms';

/** 보기 권한 */
export type LibraryPermission = 'all' | 'staff' | 'partner' | 'admin';

export const libraryPermissionLabels: Record<LibraryPermission, string> = {
    all: '전체',
    staff: 'Staff Only',
    partner: 'Partner 이상',
    admin: 'Admin Only',
};

/** Library 아이템 */
export interface LibraryItem {
    id: string;
    title: string;
    description: string;
    category: LibraryCategory;
    source: LibrarySource;
    format: FileFormat;
    fileUrl?: string;
    fileSize?: string;
    tags: string[];
    author: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    /** 보기 권한 */
    permission: LibraryPermission;
    /** 프로젝트 연결 */
    projectCode?: string;
    projectName?: string;
    /** 소셜 */
    bookmarkCount: number;
    viewCount: number;
    /** Wiki 즐겨찾기 참조 */
    isWikiBookmark?: boolean;
    wikiItemId?: string;
}

/** 즐겨찾기 레코드 */
export interface LibraryBookmark {
    id: string;
    userId: string;
    itemId: string;
    source: LibrarySource;
    createdAt: string;
}

/** 파일 형식별 뱃지 색상 */
export const formatBadgeColor: Record<FileFormat, string> = {
    PDF: 'bg-red-50 text-red-600',
    DOCX: 'bg-blue-50 text-blue-600',
    PPTX: 'bg-orange-50 text-orange-600',
    XLSX: 'bg-green-50 text-green-600',
    PNG: 'bg-violet-50 text-violet-600',
    JPG: 'bg-violet-50 text-violet-600',
    MP4: 'bg-pink-50 text-pink-600',
    URL: 'bg-cyan-50 text-cyan-600',
    OTHER: 'bg-neutral-100 text-neutral-500',
};
