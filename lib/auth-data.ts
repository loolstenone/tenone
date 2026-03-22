import { User } from '@/types/auth';

interface MockAccount {
    email: string;
    password: string;
    user: User;
}

// Staff accounts (registered via ERP)
const staffAccounts: MockAccount[] = [
    {
        email: 'lools@tenone.biz',
        password: 'Test1234!',
        user: {
            id: 'u1', name: 'Cheonil Jeon', email: 'lools@tenone.biz',
            role: 'Admin', accountType: 'staff', avatarInitials: 'CJ',
            brandAccess: ['tenone', 'luki', 'rook', 'hero', 'badak', 'madleap', 'madleague', 'youinone', 'fwn', '0gamja'],
            systemAccess: ['project', 'erp-hr', 'erp-finance', 'erp-admin', 'marketing', 'wiki'],
            createdAt: '2019-10-01',
        },
    },
    {
        email: 'manager@tenone.com',
        password: 'Test1234!',
        user: {
            id: 'u2', name: 'Sarah Kim', email: 'manager@tenone.com',
            role: 'Manager', accountType: 'staff', avatarInitials: 'SK',
            brandAccess: ['luki', 'badak'],
            systemAccess: ['project', 'erp-hr', 'marketing', 'wiki'],
            createdAt: '2024-06-01',
        },
    },
    {
        email: 'official@madleap.co.kr',
        password: 'Test1234!',
        user: {
            id: 'u3', name: '김준호', email: 'official@madleap.co.kr',
            role: 'Editor', accountType: 'staff', avatarInitials: 'JH',
            brandAccess: ['madleap', 'madleague'],
            systemAccess: ['project', 'marketing', 'wiki'],
            createdAt: '2025-03-01', company: 'MADLeap', phone: '010-1234-5678',
        },
    },
];

// Pre-registered member test accounts
const defaultMembers: MockAccount[] = [
    {
        email: 'member@test.com',
        password: 'Test1234!',
        user: {
            id: 'm1', name: '김회원', email: 'member@test.com',
            role: 'Member', accountType: 'member', avatarInitials: '김',
            brandAccess: [], systemAccess: [], createdAt: '2025-03-15',
            phone: '010-0000-0030',
            bio: '일반 회원 — Ten:One™ Universe 뉴스레터 구독자',
        },
    },
];

// Partner accounts (external partners)
const partnerAccounts: MockAccount[] = [
    {
        email: 'partner@test.com',
        password: 'Test1234!',
        user: {
            id: 'pt1', name: '박파트너', email: 'partner@test.com',
            role: 'Editor', accountType: 'partner', avatarInitials: '박',
            brandAccess: ['badak'],
            systemAccess: ['project', 'wiki'],
            createdAt: '2025-06-01',
            company: 'Creative Studio', phone: '010-0000-0010',
            bio: '외부 파트너 — Badak 네트워크 소속 크리에이티브 디렉터',
        },
    },
];

// Junior Partner accounts
const juniorPartnerAccounts: MockAccount[] = [
    {
        email: 'junior@test.com',
        password: 'Test1234!',
        user: {
            id: 'jp1', name: '이주니어', email: 'junior@test.com',
            role: 'Viewer', accountType: 'junior-partner', avatarInitials: '이',
            brandAccess: ['madleague'],
            systemAccess: ['wiki'],
            createdAt: '2026-01-15',
            company: 'Freelance', phone: '010-0000-0020',
            bio: '주니어 파트너 — MAD League 출신 프리랜서 마케터',
        },
    },
];

// Crew accounts (invited via /invite)
const crewAccounts: MockAccount[] = [
    {
        email: 'crew@test.com',
        password: 'Test1234!',
        user: {
            id: 'c1', name: '강리더', email: 'crew@test.com',
            role: 'Viewer', accountType: 'crew', avatarInitials: '강',
            brandAccess: ['madleap', 'madleague'],
            systemAccess: ['wiki'],
            createdAt: '2026-03-01',
            bio: 'MADLeap 5기 회장',
        },
    },
];

// Member accounts (self-registered via homepage)
const MEMBERS_STORAGE_KEY = 'tenone_members';

function getMembers(): MockAccount[] {
    if (typeof window === 'undefined') return defaultMembers;
    try {
        const stored = localStorage.getItem(MEMBERS_STORAGE_KEY);
        if (stored) {
            const saved: MockAccount[] = JSON.parse(stored);
            // Merge default members if not already present
            for (const dm of defaultMembers) {
                if (!saved.some(s => s.email === dm.email)) saved.push(dm);
            }
            return saved;
        }
        return [...defaultMembers];
    } catch { return [...defaultMembers]; }
}

function saveMembers(members: MockAccount[]) {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
}

// Password validation: must contain letters, numbers, and special characters
export function validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 8) return { valid: false, error: '비밀번호는 8자 이상이어야 합니다.' };
    if (!/[a-zA-Z]/.test(password)) return { valid: false, error: '비밀번호에 영문이 포함되어야 합니다.' };
    if (!/[0-9]/.test(password)) return { valid: false, error: '비밀번호에 숫자가 포함되어야 합니다.' };
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) return { valid: false, error: '비밀번호에 특수문자가 포함되어야 합니다.' };
    return { valid: true };
}

export function validateCredentials(email: string, password: string): User | null {
    const allAccounts = [...staffAccounts, ...partnerAccounts, ...juniorPartnerAccounts, ...crewAccounts, ...getMembers()];
    const account = allAccounts.find(a => a.email === email && a.password === password);
    return account?.user ?? null;
}

export function registerMember(name: string, email: string, password: string, company?: string, newsletterSubscribed?: boolean): { success: boolean; error?: string; user?: User } {
    const allAccounts = [...staffAccounts, ...partnerAccounts, ...juniorPartnerAccounts, ...crewAccounts, ...getMembers()];
    if (allAccounts.some(a => a.email === email)) {
        return { success: false, error: '이미 등록된 이메일입니다.' };
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) return { success: false, error: pwCheck.error };

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || name.slice(0, 2).toUpperCase();
    const user: User = {
        id: `m${Date.now()}`, name, email,
        role: 'Member', accountType: 'member', avatarInitials: initials,
        brandAccess: [], systemAccess: [], createdAt: new Date().toISOString().split('T')[0],
        company: company || undefined,
        newsletterSubscribed: newsletterSubscribed ?? false,
    };

    const members = getMembers();
    members.push({ email, password, user });
    saveMembers(members);

    return { success: true, user };
}

export function isStaffEmail(email: string): boolean {
    return staffAccounts.some(a => a.email === email);
}
