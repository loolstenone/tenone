export type StaffRole = 'Admin' | 'Manager' | 'Editor' | 'Viewer';
export type StaffStatus = 'Active' | 'On Leave' | 'Resigned';

export type SystemAccess = 'office' | 'project' | 'erp-hr' | 'erp-finance' | 'erp-admin' | 'marketing' | 'wiki';

export type Division = 'Management' | 'Business' | 'Production' | 'Support';

export interface StaffMember {
    id: string;
    // 시스템 입력 영역 (관리자만 수정)
    employeeId: string;
    name: string;
    email: string;
    role: StaffRole;
    accessLevel: SystemAccess[];
    division: Division;
    department: string;
    position: string;
    brandAssociation: string[];
    startDate: string;
    status: StaffStatus;
    // 개인 수정 영역
    phone?: string;
    avatarUrl?: string;
    avatarInitials: string;
    emergencyContact?: string;
    bio?: string;
    goals?: string;
    values?: string;
    createdAt: string;
    updatedAt: string;
}
