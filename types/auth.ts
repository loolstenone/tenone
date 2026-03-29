export type UserRole = 'Admin' | 'Manager' | 'Editor' | 'Viewer' | 'Member';

// 회원 유형 (v2)
export type AccountType = 'staff' | 'partner' | 'junior-partner' | 'alliance' | 'madleaguer' | 'crew' | 'member';

// ERP 세부 시스템 접근
export type SystemAccess = 'project' | 'erp-hr' | 'erp-people' | 'erp-finance' | 'erp-sales' | 'erp-admin' | 'marketing' | 'wiki';

/** 시스템 접근 권한 설명 */
export const SystemAccessInfo: Record<SystemAccess, { label: string; description: string }> = {
    'project': { label: 'Project', description: '프로젝트 관리, 협업, 투입 인력' },
    'erp-hr': { label: 'ERP · HR', description: '내부 인력관리, 근태, 급여' },
    'erp-people': { label: 'ERP · People', description: '외부 인적자원 관리, HeRo 연계' },
    'erp-finance': { label: 'ERP · Finance', description: '손익, 청구/지급, Project 연계' },
    'erp-sales': { label: 'ERP · Sales', description: '영업 파이프라인, 계약 관리' },
    'erp-admin': { label: 'ERP · Admin', description: '시스템 설정, 권한 관리, 전체 데이터 접근' },
    'marketing': { label: 'SmarComm', description: 'AI 마케팅 커뮤니케이션' },
    'wiki': { label: 'Wiki', description: '지식경영, 라이브러리' },
};

// ── 인트라 모듈 (v2: DB module_access 기반) ──
export type IntraModule =
    | 'myverse' | 'townity' | 'project' | 'hero' | 'evolution'
    | 'smarcomm' | 'wiki' | 'erp' | 'vridge' | 'bums' | 'agent' | 'universe';

/** 모듈 메타 정보 */
export const IntraModuleInfo: Record<IntraModule, { label: string; description: string }> = {
    myverse: { label: 'Myverse', description: '개인 대시보드, 메신저, Todo' },
    townity: { label: 'Townity', description: '내외부 소통, 게시판, 일정' },
    project: { label: 'Project', description: '프로젝트 관리, 협업' },
    hero: { label: 'HeRo', description: '인재 평가, 커리어 개발' },
    evolution: { label: 'Evolution School', description: '교육 플랫폼' },
    smarcomm: { label: 'SmarComm', description: 'AI 마케팅 커뮤니케이션' },
    wiki: { label: 'Wiki', description: '지식경영, 라이브러리' },
    erp: { label: 'ERP', description: 'HR, People, Finance, Sales' },
    vridge: { label: 'Vridge', description: '경영 전략, GPR, Principle' },
    bums: { label: 'BUMS', description: '사이트/게시판/콘텐츠 통합 관리' },
    agent: { label: 'Agent', description: 'Universe AI 에이전트 시스템' },
    universe: { label: 'Universe', description: '유니버스 통합 관리 대시보드' },
};

/**
 * 회원 유형별 기본 모듈 접근 (신규 가입 시 자동 설정)
 * 실제 권한은 DB module_access[] 필드가 우선
 */
export const defaultModuleAccess: Record<AccountType, IntraModule[]> = {
    staff: ['myverse', 'townity', 'project', 'hero', 'evolution', 'smarcomm', 'wiki', 'erp', 'vridge', 'bums', 'universe'],
    partner: ['myverse', 'townity', 'project', 'hero', 'evolution', 'wiki'],
    'junior-partner': ['myverse', 'townity', 'hero', 'evolution'],
    alliance: ['myverse', 'townity', 'hero', 'evolution'],
    madleaguer: ['myverse', 'townity', 'project', 'hero', 'evolution', 'wiki'],
    crew: ['myverse', 'townity', 'project', 'hero', 'evolution', 'wiki'],
    member: [], // 인트라 접근 불가
};

// BUMS 권한
export type BumsRole = 'admin' | 'editor' | 'contributor';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    accountType: AccountType;
    primaryType?: string;
    avatarInitials: string;

    // 역할 & 소속
    roles?: string[];             // ['staff'], ['crew', 'madleaguer'] 등
    affiliations?: string[];      // ['madleague', 'badak'] 등 소속
    originSite?: string;          // 가입 경로 사이트

    // 접근 권한
    intraAccess?: boolean;        // 인트라 접근 가능 여부
    moduleAccess?: IntraModule[]; // DB 기반 모듈 접근 목록
    systemAccess?: SystemAccess[];// ERP 세부 권한
    brandAccess?: string[];       // 브랜드별 접근

    // 프로필
    company?: string;
    phone?: string;
    bio?: string;
    department?: string;
    employeeId?: string;
    position?: string;
    createdAt?: string;
    newsletterSubscribed?: boolean;

    // 포인트
    totalPoints?: number;
    grade?: string;

    // BUMS 권한
    bumsRole?: BumsRole;
    bumsSiteAccess?: string[];
}
