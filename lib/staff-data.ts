import { StaffMember, Division } from '@/types/staff';

export const initialStaff: StaffMember[] = [
    {
        id: 's1', employeeId: '2019-0001', name: 'Cheonil Jeon', email: 'lools@tenone.biz',
        role: 'Admin', accessLevel: ['office', 'project', 'erp-hr', 'erp-finance', 'erp-admin'],
        division: 'Management', department: '경영기획', position: '대표',
        brandAssociation: ['tenone', 'luki', 'rook', 'hero', 'badak', 'madleap', 'madleague', 'youinone', 'fwn', '0gamja'],
        startDate: '2019-10-01', status: 'Active', phone: '010-2795-1001',
        avatarInitials: 'CJ', bio: '가치로 연결된 세계관을 만드는 사람',
        goals: '10,000명의 기획자를 발굴하고 연결한다', values: '본질, 속도, 이행',
        createdAt: '2019-10-01', updatedAt: '2025-03-01',
    },
    {
        id: 's2', employeeId: '2024-0001', name: 'Sarah Kim', email: 'manager@tenone.com',
        role: 'Manager', accessLevel: ['office', 'project'],
        division: 'Business', department: '브랜드관리', position: '매니저',
        brandAssociation: ['luki', 'badak'], startDate: '2024-06-01', status: 'Active',
        avatarInitials: 'SK', createdAt: '2024-06-01', updatedAt: '2025-01-15',
    },
    {
        id: 's3', employeeId: '2025-0001', name: '김준호', email: 'official@madleap.co.kr',
        role: 'Editor', accessLevel: ['office'],
        division: 'Support', department: '커뮤니티운영', position: '주임',
        brandAssociation: ['madleap', 'madleague'], startDate: '2025-03-01', status: 'Active',
        phone: '010-1234-5678', avatarInitials: 'JH',
        bio: 'MADLeap 5기 출신, 서울·경기 동아리 운영 담당',
        createdAt: '2025-03-01', updatedAt: '2025-03-01',
    },
];

// 조직 구조
export const divisions: { id: Division; name: string; departments: string[] }[] = [
    { id: 'Management', name: '관리부서', departments: ['경영기획', '인사', '회계/재무'] },
    { id: 'Business', name: '사업부서', departments: ['브랜드관리', '파트너십', '영업'] },
    { id: 'Production', name: '제작부서', departments: ['콘텐츠제작', '디자인', 'AI크리에이티브'] },
    { id: 'Support', name: '지원부서', departments: ['커뮤니티운영', '교육(Evolution School)', 'MADLeague운영'] },
];

export const positions = ['대표', '이사', '팀장', '매니저', '선임', '주임', '사원', '인턴'];

// 부문별 기본 권한
export const divisionDefaultAccess: Record<Division, string[]> = {
    Management: ['office', 'project', 'erp-hr', 'erp-finance'],
    Business: ['office', 'project'],
    Production: ['office'],
    Support: ['office'],
};

export const accessOptions = [
    { id: 'office', label: 'Office', desc: '기본 사내 시스템 접근' },
    { id: 'project', label: 'Project', desc: '프로젝트 관리, 스튜디오, 워크플로우' },
    { id: 'erp-hr', label: 'ERP · HR', desc: '인력관리, 목표/성과, 근태, 급여 (CHO)' },
    { id: 'erp-finance', label: 'ERP · Finance', desc: '경비, 법인카드, 청구/지급 (CFO)' },
    { id: 'erp-admin', label: 'ERP · Admin', desc: '시스템 설정, 권한 관리, 전체 데이터 접근' },
    { id: 'marketing', label: 'Marketing', desc: '캠페인, 리드, 딜, 콘텐츠 마케팅' },
    { id: 'wiki', label: 'Wiki', desc: '사내 위키 열람 및 편집' },
];

export const brandOptions = [
    { id: 'tenone', name: 'Ten:One™' },
    { id: 'badak', name: 'Badak' },
    { id: 'madleap', name: 'MADLeap' },
    { id: 'madleague', name: 'MAD League' },
    { id: 'youinone', name: 'YouInOne' },
    { id: 'hero', name: 'HeRo' },
    { id: 'rook', name: 'RooK' },
    { id: 'luki', name: 'LUKI' },
    { id: 'fwn', name: 'FWN' },
    { id: '0gamja', name: '0gamja' },
];
