/**
 * BUMS 권한 체크 유틸리티
 *
 * 권한 모델:
 * - admin: 전체 사이트 접근, 모든 CRUD
 * - editor: site_access에 포함된 사이트 글 작성/수정/삭제
 * - contributor: site_access에 포함된 사이트 글 작성만 (수정/삭제 불가, 본인 글만 수정)
 */

import type { User, CmsRole } from "@/types/auth";

export function canAccessSite(user: User | null, siteId: string): boolean {
    if (!user) return false;
    if (user.cmsRole === 'admin') return true;
    if (!user.cmsSiteAccess) return false;
    return user.cmsSiteAccess.includes(siteId);
}

export function canCreatePost(user: User | null, siteId: string): boolean {
    if (!user) return false;
    if (user.cmsRole === 'admin') return true;
    if (!canAccessSite(user, siteId)) return false;
    return user.cmsRole === 'editor' || user.cmsRole === 'contributor';
}

export function canEditPost(user: User | null, siteId: string, authorId?: string): boolean {
    if (!user) return false;
    if (user.cmsRole === 'admin') return true;
    if (!canAccessSite(user, siteId)) return false;
    if (user.cmsRole === 'editor') return true;
    // contributor: only own posts
    if (user.cmsRole === 'contributor' && authorId === user.id) return true;
    return false;
}

export function canDeletePost(user: User | null, siteId: string): boolean {
    if (!user) return false;
    if (user.cmsRole === 'admin') return true;
    if (!canAccessSite(user, siteId)) return false;
    return user.cmsRole === 'editor';
}

export function canManageSite(user: User | null): boolean {
    if (!user) return false;
    return user.cmsRole === 'admin';
}

export function canManageBoard(user: User | null, siteId: string): boolean {
    if (!user) return false;
    if (user.cmsRole === 'admin') return true;
    if (!canAccessSite(user, siteId)) return false;
    return user.cmsRole === 'editor';
}

export function getCmsRoleLabel(role: CmsRole): string {
    switch (role) {
        case 'admin': return 'BUMS Admin';
        case 'editor': return 'Editor';
        case 'contributor': return 'Contributor';
    }
}
