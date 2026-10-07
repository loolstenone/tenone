// 통합 관리 > 사이트 현황 (/api/intra/sites/status) 응답 타입
import type { ContentSource } from "@/lib/brand-site-menus";

export interface MenuStatus {
    label: string;
    path: string;
    adminHref: string | null;
    unit: string;
    /** null = 조회 실패 또는 고정 페이지 */
    count: number | null;
    /** 처리 대기 (미답변 문의·심사 대기 등) */
    pending: number | null;
    kind: ContentSource["kind"];
}

export interface SiteStatus {
    slug: string;
    name: string | null;
    tier: string | null;
    lifecycle: string | null;
    hosting: string | null;
    isOpen: boolean;
    /** member_brand_joins (탈퇴 제외) */
    members: number;
    /** ums_posts (통합 게시판) */
    posts: number;
    /** contact_submissions form_type 접두어 = slug */
    inquiries: number;
    openInquiries: number;
    /** 메뉴 레지스트리 미등록 사이트는 null */
    menus: MenuStatus[] | null;
}
