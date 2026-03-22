export type UserRole = 'Admin' | 'Manager' | 'Editor' | 'Viewer' | 'Member';

// People 기반 계정 유형
export type AccountType = 'staff' | 'partner' | 'junior-partner' | 'crew' | 'member';

export type SystemAccess = 'project' | 'erp-hr' | 'erp-finance' | 'erp-admin' | 'marketing' | 'wiki';

/** 시스템 접근 권한 설명 */
export const SystemAccessInfo: Record<SystemAccess, { label: string; description: string }> = {
    'project': { label: 'Project', description: '프로젝트 관리, 스튜디오, 제작 워크플로우' },
    'erp-hr': { label: 'ERP · HR', description: '인력관리, 목표/성과, 근태, 급여' },
    'erp-finance': { label: 'ERP · Finance', description: '경비, 법인카드, 청구/지급' },
    'erp-admin': { label: 'ERP · Admin', description: '시스템 설정, 권한 관리, 전체 데이터 접근' },
    'marketing': { label: 'Marketing', description: '캠페인, 리드, 딜, 콘텐츠 마케팅' },
    'wiki': { label: 'Wiki', description: '사내 위키 열람 및 편집' },
};

// ── Intra 모듈별 접근 정책 ──
export type IntraModule = 'myverse' | 'myverse-full' | 'comm' | 'comm-full' | 'project' | 'erp' | 'hero' | 'education' | 'wiki' | 'wiki-full' | 'cms';

/**
 * People 유형별 Intra 접근 권한
 * - staff: 직원 (전체, SystemAccess 기반 세부 제어)
 * - partner: 외부 파트너 (제한적 접근)
 * - junior-partner: 주니어 파트너 (더 제한적)
 * - crew: YouInOne/MADLeague 멤버 (최소 접근)
 * - member: 일반 가입자 (Intra 접근 불가)
 */
export const accountTypeAccess: Record<AccountType, IntraModule[]> = {
    staff: ['myverse-full', 'comm-full', 'project', 'erp', 'hero', 'education', 'wiki-full', 'cms'],
    partner: ['myverse', 'comm', 'project', 'hero', 'education', 'wiki'],
    'junior-partner': ['myverse', 'comm', 'project', 'hero', 'education', 'wiki'],
    crew: ['myverse', 'comm', 'project', 'hero', 'education', 'wiki'],
    member: [], // Intra 접근 불가
};

/**
 * 모듈별 접근 범위 설명
 * - myverse: 메신저, Todo만
 * - myverse-full: 메신저, Todo, 결재, GPR, 근태, 급여, 경비
 * - comm: 공지(읽기), 자유게시판, 전체일정(공개만)
 * - comm-full: 공지(읽기/쓰기), 자유게시판, 전체일정
 * - wiki: 기본 교육 (Culture, Onboarding)
 * - wiki-full: 전체 Wiki (가이드, 템플릿, 레퍼런스 포함)
 * - project: SystemAccess 기반 세부 제어
 * - erp: SystemAccess 기반 세부 제어
 * - cms: 관리자 전용
 */

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    accountType: AccountType;
    avatarInitials: string;
    brandAccess: string[];
    systemAccess: SystemAccess[];
    company?: string;
    phone?: string;
    bio?: string;
    createdAt?: string;
    newsletterSubscribed?: boolean;
}
