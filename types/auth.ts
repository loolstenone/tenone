export type UserRole = 'Admin' | 'Manager' | 'Editor' | 'Viewer' | 'Member';
export type AccountType = 'staff' | 'member';
export type SystemAccess = 'project' | 'erp-hr' | 'erp-finance' | 'erp-admin' | 'marketing' | 'wiki';

/** 시스템 접근 권한 설명 */
export const SystemAccessInfo: Record<SystemAccess, { label: string; description: string }> = {
    'project': { label: 'Project', description: '프로젝트 관리, 스튜디오, 제작 워크플로우' },
    'erp-hr': { label: 'ERP · HR', description: '인력관리, 목표/성과, 근태, 급여 (CHO)' },
    'erp-finance': { label: 'ERP · Finance', description: '경비, 법인카드, 청구/지급 (CFO)' },
    'erp-admin': { label: 'ERP · Admin', description: '시스템 설정, 권한 관리, 전체 데이터 접근' },
    'marketing': { label: 'Marketing', description: '캠페인, 리드, 딜, 콘텐츠 마케팅' },
    'wiki': { label: 'Wiki', description: '사내 위키 열람 및 편집' },
};

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
}
