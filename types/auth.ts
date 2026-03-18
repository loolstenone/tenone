export type UserRole = 'Admin' | 'Manager' | 'Editor' | 'Viewer' | 'Member';
export type AccountType = 'staff' | 'member';
export type SystemAccess = 'studio' | 'erp-crm' | 'erp-hr' | 'erp-finance' | 'erp-admin' | 'marketing' | 'wiki';

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
