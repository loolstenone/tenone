import type { Person, MadLeagueClub } from '@/types/people';

// ── MADLeague 동아리 (알파벳 순) ──
export const madleagueClubs: MadLeagueClub[] = [
    { id: 'abc', name: 'ABC', region: '광주·전남', order: 1 },
    { id: 'adlle', name: 'ADlle', region: '대구·경북', order: 2 },
    { id: 'adzone', name: 'AD Zone', region: '고려대 세종', order: 3 },
    { id: 'madleap', name: 'MADLeap', region: '서울·경기', order: 4 },
    { id: 'pad', name: 'P:ad', region: '한림대', order: 5 },
    { id: 'pam', name: 'PAM', region: '부산·경남', order: 6 },
    { id: 'suzak', name: 'SUZAK', region: '제주', order: 7 },
];

// ── Mock People 데이터 ──
export const initialPeople: Person[] = [
    // ── 내부: 직원 (Staff) ──
    { id: 'p1', name: 'Cheonil Jeon', email: 'lools@tenone.biz', avatarInitials: 'CJ', category: 'internal', type: 'staff', membershipStatus: 'active', department: '경영기획', position: '대표', employeeId: '2019-0001', joinDate: '2019-10-01', tags: ['CEO', 'Founder'] },
    { id: 'p2', name: 'Sarah Kim', email: 'sarah@tenone.biz', avatarInitials: 'SK', category: 'internal', type: 'staff', membershipStatus: 'active', department: '사업총괄', position: '이사', employeeId: '2022-0001', joinDate: '2022-03-01', tags: ['CBO'] },
    { id: 'p3', name: '김인사', email: 'hr@tenone.biz', avatarInitials: '김', category: 'internal', type: 'staff', membershipStatus: 'active', department: '인사총괄', position: '이사', employeeId: '2023-0001', joinDate: '2023-01-02', tags: ['CHO'] },

    // ── 내부: Partner ──
    { id: 'p4', name: '장파트', email: 'jang@partner.com', avatarInitials: '장', category: 'internal', type: 'partner', membershipStatus: 'active', position: '외부 크리에이티브 디렉터', joinDate: '2025-01-15', approvedBy: 'Cheonil Jeon', bio: '프리랜서 크리에이티브 디렉터, LUKI 프로젝트 협업' },
    { id: 'p5', name: '윤컨설', email: 'yoon@consulting.co.kr', avatarInitials: '윤', category: 'internal', type: 'partner', membershipStatus: 'active', position: '브랜드 전략 컨설턴트', joinDate: '2025-06-01', approvedBy: 'Sarah Kim' },
    { id: 'p6', name: '임디자', email: 'lim@design.studio', avatarInitials: '임', category: 'internal', type: 'partner', membershipStatus: 'pending', position: '디자인 스튜디오 대표', joinDate: '2026-03-15', notes: '가입 승인 대기 중' },

    // ── 내부: Junior Partner ──
    { id: 'p7', name: '조주니', email: 'jo@univ.ac.kr', avatarInitials: '조', category: 'internal', type: 'junior-partner', membershipStatus: 'active', crewRole: 'MADLeap 4기 출신', joinDate: '2025-09-01', approvedBy: 'Sarah Kim', bio: 'MADLeap 4기 우수 멤버, YouInOne 프로젝트 참여' },

    // ── Crew: YouInOne 멤버 ──
    { id: 'p8', name: '한유인', email: 'han@youinone.com', avatarInitials: '한', category: 'crew', type: 'youinone', membershipStatus: 'active', crewRole: '기획', joinDate: '2024-03-01', bio: '퍼포먼스 마케터, Badak 출신' },
    { id: 'p9', name: '서유인', email: 'seo@youinone.com', avatarInitials: '서', category: 'crew', type: 'youinone', membershipStatus: 'active', crewRole: '콘텐츠', joinDate: '2024-05-01', bio: '콘텐츠 크리에이터, MADLeap 3기' },
    { id: 'p10', name: '오유인', email: 'oh@youinone.com', avatarInitials: '오', category: 'crew', type: 'youinone', membershipStatus: 'active', crewRole: '디자인', joinDate: '2024-07-01' },
    { id: 'p11', name: '차유인', email: 'cha@youinone.com', avatarInitials: '차', category: 'crew', type: 'youinone', membershipStatus: 'active', crewRole: '영상', joinDate: '2025-01-01' },
    { id: 'p12', name: '배유인', email: 'bae@youinone.com', avatarInitials: '배', category: 'crew', type: 'youinone', membershipStatus: 'active', crewRole: 'AI', joinDate: '2025-03-01' },

    // ── Crew: YouInOne Alliance ──
    { id: 'p13', name: '정얼라', email: 'jung@alliance.biz', avatarInitials: '정', category: 'crew', type: 'youinone-alliance', membershipStatus: 'active', crewRole: '(주)크리에이팅 대표', companyName: '(주)크리에이팅', joinDate: '2025-06-01' },
    { id: 'p14', name: '류얼라', email: 'ryu@alliance.biz', avatarInitials: '류', category: 'crew', type: 'youinone-alliance', membershipStatus: 'active', crewRole: '스타트업 "디자인랩" CEO', companyName: '디자인랩', joinDate: '2025-08-01' },

    // ── Crew: MADLeague 회장단 ──
    { id: 'p15', name: '강리더', email: 'kang@madleap.co.kr', avatarInitials: '강', category: 'crew', type: 'madleague-leader', membershipStatus: 'active', clubId: 'madleap', clubGeneration: 5, clubRole: '회장', madleagueStatus: 'active', crewRole: '회장', school: '한양대학교 광고홍보학과', joinDate: '2026-03-01' },
    { id: 'p16', name: '민대표', email: 'min@pam.kr', avatarInitials: '민', category: 'crew', type: 'madleague-leader', membershipStatus: 'active', clubId: 'pam', clubGeneration: 2, clubRole: '회장', madleagueStatus: 'active', crewRole: '회장', school: '부산대학교 경영학과', joinDate: '2025-03-01' },
    { id: 'p17', name: '이리더', email: 'lee@adlle.kr', avatarInitials: '이', category: 'crew', type: 'madleague-leader', membershipStatus: 'active', clubId: 'adlle', clubGeneration: 2, clubRole: '회장', madleagueStatus: 'active', crewRole: '회장', school: '경북대학교 미디어커뮤니케이션학과', joinDate: '2025-03-01' },
    { id: 'p18', name: '박리더', email: 'park@abc.kr', avatarInitials: '박', category: 'crew', type: 'madleague-leader', membershipStatus: 'active', clubId: 'abc', clubGeneration: 2, clubRole: '부회장', madleagueStatus: 'active', crewRole: '부회장', school: '전남대학교 광고학과', joinDate: '2025-03-01' },
    { id: 'p19', name: '최리더', email: 'choi@suzak.kr', avatarInitials: '최', category: 'crew', type: 'madleague-leader', membershipStatus: 'active', clubId: 'suzak', clubGeneration: 2, clubRole: '회장', madleagueStatus: 'active', crewRole: '회장', school: '제주대학교 경영학과', joinDate: '2025-03-01' },

    // ── Crew: MADLeague 일반 회원 (샘플) ──
    { id: 'p20', name: '김매드', email: 'kim.mad@univ.ac.kr', avatarInitials: '김', category: 'crew', type: 'madleague-member', membershipStatus: 'active', clubId: 'madleap', clubGeneration: 5, clubRole: '팀장', madleagueStatus: 'active', school: '중앙대학교 광고홍보학과', joinDate: '2026-03-01' },
    { id: 'p21', name: '이매드', email: 'lee.mad@univ.ac.kr', avatarInitials: '이', category: 'crew', type: 'madleague-member', membershipStatus: 'active', clubId: 'madleap', clubGeneration: 5, clubRole: '팀원', madleagueStatus: 'active', school: '건국대학교 마케팅학과', joinDate: '2026-03-01' },
    { id: 'p22', name: '박매드', email: 'park.mad@univ.ac.kr', avatarInitials: '박', category: 'crew', type: 'madleague-member', membershipStatus: 'active', clubId: 'madleap', clubGeneration: 4, clubRole: '팀장', madleagueStatus: 'ob', school: '성균관대학교 경영학과', joinDate: '2025-03-01' },
    { id: 'p23', name: '최매드', email: 'choi.mad@univ.ac.kr', avatarInitials: '최', category: 'crew', type: 'madleague-member', membershipStatus: 'active', clubId: 'pam', clubGeneration: 2, clubRole: '팀원', madleagueStatus: 'active', school: '동아대학교 광고홍보학과', joinDate: '2025-09-01' },
    { id: 'p24', name: '정매드', email: 'jung.mad@univ.ac.kr', avatarInitials: '정', category: 'crew', type: 'madleague-member', membershipStatus: 'active', clubId: 'adlle', clubGeneration: 2, clubRole: '총무', madleagueStatus: 'active', school: '계명대학교 경영학과', joinDate: '2025-09-01' },
    { id: 'p25', name: '한매드', email: 'han.mad@univ.ac.kr', avatarInitials: '한', category: 'crew', type: 'madleague-member', membershipStatus: 'active', clubId: 'abc', clubGeneration: 2, clubRole: '팀원', madleagueStatus: 'active', school: '조선대학교 마케팅학과', joinDate: '2025-09-01' },
    { id: 'p26', name: '오매드', email: 'oh.mad@univ.ac.kr', avatarInitials: '오', category: 'crew', type: 'madleague-member', membershipStatus: 'active', clubId: 'suzak', clubGeneration: 2, clubRole: '팀원', madleagueStatus: 'active', school: '제주대학교 관광학과', joinDate: '2025-09-01' },

    // ── 일반: 개인 ──
    { id: 'p27', name: '전천일', email: 'cheonil.jeon@gmail.com', avatarInitials: '천', category: 'general', type: 'individual', membershipStatus: 'active', joinDate: '2025-03-15', bio: '마케팅·광고 20년차' },
    { id: 'p28', name: '나관심', email: 'na@gmail.com', avatarInitials: '나', category: 'general', type: 'individual', membershipStatus: 'active', joinDate: '2026-01-10' },
    { id: 'p29', name: '도궁금', email: 'do@naver.com', avatarInitials: '도', category: 'general', type: 'individual', membershipStatus: 'pending', joinDate: '2026-03-18', notes: '가입 대기' },

    // ── 일반: 기업 ──
    { id: 'p30', name: 'TenOne Corp', email: 'lools@kakao.com', avatarInitials: 'T', category: 'general', type: 'company', membershipStatus: 'active', companyName: 'TenOne Corp', industry: '마케팅·광고', companySize: '50명', joinDate: '2025-03-15' },
    { id: 'p31', name: '(주)크리에이팅', email: 'info@creating.co.kr', avatarInitials: 'C', category: 'general', type: 'company', membershipStatus: 'active', companyName: '(주)크리에이팅', industry: '콘텐츠 제작', companySize: '15명', joinDate: '2025-06-01' },
    { id: 'p32', name: '디자인랩', email: 'hello@designlab.kr', avatarInitials: 'D', category: 'general', type: 'company', membershipStatus: 'active', companyName: '디자인랩', industry: '디자인', companySize: '8명', joinDate: '2025-08-01' },
];

// ── 라벨 매핑 ──
export const categoryLabels: Record<string, string> = {
    internal: '내부', crew: 'Crew', general: '일반',
};

export const typeLabels: Record<string, string> = {
    staff: '직원', partner: 'Partner', 'junior-partner': 'Junior Partner',
    youinone: 'YouInOne', 'youinone-alliance': 'YouInOne Alliance',
    'madleague-leader': 'MADLeague 회장단', 'madleague-member': 'MADLeague 멤버',
    individual: '개인', company: '기업',
};

export const statusLabels: Record<string, string> = {
    pending: '승인대기', active: '활성', 'leave-requested': '탈퇴요청', inactive: '비활성', rejected: '거절',
};

export const statusStyles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600', active: 'bg-green-50 text-green-600',
    'leave-requested': 'bg-red-50 text-red-500', inactive: 'bg-neutral-100 text-neutral-400',
    rejected: 'bg-red-50 text-red-600',
};
