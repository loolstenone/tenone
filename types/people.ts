// Ten:One™ People 시스템 타입 정의

// ── 대분류 ──
export type PeopleCategory = 'internal' | 'crew' | 'general';

// ── 세부 유형 ──
export type InternalType = 'staff' | 'partner' | 'junior-partner';
export type CrewType = 'youinone' | 'youinone-alliance' | 'madleague-leader' | 'madleague-member';
export type GeneralType = 'individual' | 'company';

export type PeopleType = InternalType | CrewType | GeneralType;

// ── 가입 상태 ──
export type MembershipStatus = 'pending' | 'active' | 'leave-requested' | 'inactive' | 'rejected';

// ── MADLeague 동아리 ──
export interface MadLeagueClub {
    id: string;
    name: string;
    region: string;
    order: number; // 알파벳 순
}

export type MadLeagueMemberStatus = 'active' | 'ob';
export type MadLeagueClubRole = '회장' | '부회장' | '총무' | '팀장' | '팀원';

// ── Person 인터페이스 ──
export interface Person {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatarInitials: string;

    // 분류
    category: PeopleCategory;
    type: PeopleType;
    membershipStatus: MembershipStatus;

    // 내부용 (staff/partner/junior-partner)
    department?: string;
    position?: string;
    employeeId?: string;

    // Crew용
    crewRole?: string; // YouInOne 역할, Alliance 소속 등
    clubId?: string; // MADLeague 동아리 ID
    clubGeneration?: number; // 기수
    clubRole?: MadLeagueClubRole; // 동아리 내 역할 (회장/부회장/총무/팀장/팀원)
    madleagueStatus?: MadLeagueMemberStatus; // 현멤버/OB
    school?: string; // 학교명

    // 현업자용 (partner/professional)
    professionalCompany?: string; // 회사/소속
    professionalPosition?: string; // 직무/직책

    // 일반용
    companyName?: string; // 기업 회원
    industry?: string;
    companySize?: string;

    // 공통
    bio?: string;
    tags?: string[];
    joinDate: string;
    approvedBy?: string;
    approvedAt?: string;
    leaveRequestedAt?: string;
    leaveApprovedBy?: string;
    notes?: string;
}
