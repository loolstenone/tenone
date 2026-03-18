import { Person, Organization, Deal, Activity } from '@/types/crm';

export const initialPeople: Person[] = [
    // Students (MADLeague/MADLeap)
    { id: 'p1', name: '김지은', email: 'jieun@univ.ac.kr', phone: '010-1111-1001', type: 'Student', status: 'Active', company: '서울대학교', position: '마케팅학과 3학년', avatarInitials: 'JE', brandAssociation: ['madleap'], tags: ['MADLeap 5기', '디지털 마케팅'], source: 'MADLeap', cohort: 'MADLeap 5기', createdAt: '2025-03-01' },
    { id: 'p2', name: '박민수', email: 'minsu@univ.ac.kr', type: 'Student', status: 'Active', company: '고려대학교', position: '광고홍보학과 4학년', avatarInitials: 'MS', brandAssociation: ['madleap', 'madleague'], tags: ['MADLeap 4기', '경쟁PT 우수'], source: 'MADLeap', cohort: 'MADLeap 4기', createdAt: '2024-03-01' },
    { id: 'p3', name: '이서연', email: 'seoyeon@univ.ac.kr', type: 'Student', status: 'Active', company: '부산대학교', position: '경영학과 3학년', avatarInitials: 'SY', brandAssociation: ['madleague'], tags: ['PAM 2기', '브랜딩'], source: 'MADLeague', cohort: 'PAM 2기', createdAt: '2025-03-15' },
    { id: 'p4', name: '정현우', email: 'hyunwoo@univ.ac.kr', type: 'Student', status: 'Alumni', company: '한양대학교', position: '시각디자인학과 졸업', avatarInitials: 'HW', brandAssociation: ['madleap'], tags: ['MADLeap 3기', '디자인', 'HeRo 후보'], source: 'MADLeap', cohort: 'MADLeap 3기', lastContacted: '2025-08-20', createdAt: '2023-03-01' },
    { id: 'p5', name: '최유나', email: 'yuna@univ.ac.kr', type: 'Student', status: 'Active', company: '제주대학교', position: '관광학과 2학년', avatarInitials: 'YN', brandAssociation: ['madleague'], tags: ['SUZAK 1기', '콘텐츠'], source: 'MADLeague', cohort: 'SUZAK 1기', createdAt: '2025-03-20' },

    // Professionals (Badak)
    { id: 'p6', name: 'Sarah Kim', email: 'sarah.kim@cjenm.com', phone: '010-1234-5678', type: 'Professional', status: 'Active', company: 'CJ ENM', position: 'Brand Manager', avatarInitials: 'SK', brandAssociation: ['badak', 'luki'], tags: ['엔터테인먼트', '파트너'], source: 'Badak', lastContacted: '2025-08-28', createdAt: '2024-06-01', notes: 'LUKI 데뷔 배급 핵심 파트너' },
    { id: 'p7', name: 'David Lee', email: 'david@vfx.kr', phone: '010-9876-5432', type: 'Professional', status: 'Active', company: 'Visual FX Studio', position: 'Creative Director', avatarInitials: 'DL', brandAssociation: ['badak', 'rook'], tags: ['3D', 'VFX', '외주'], source: 'Badak', lastContacted: '2025-07-15', createdAt: '2024-01-15', notes: 'RooK 3D 에셋 주 공급' },
    { id: 'p8', name: '한수진', email: 'sujin@digitalagency.kr', type: 'Professional', status: 'Active', company: 'Digital First', position: 'Account Director', avatarInitials: 'SJ', brandAssociation: ['badak'], tags: ['디지털', '퍼포먼스'], source: 'Badak', createdAt: '2024-08-01' },
    { id: 'p9', name: '오태영', email: 'taeyoung@startup.io', type: 'Professional', status: 'Active', company: 'GrowthLab', position: 'CMO', avatarInitials: 'TY', brandAssociation: ['badak', 'youinone'], tags: ['스타트업', '그로스'], source: 'Badak', createdAt: '2024-05-01' },
    { id: 'p10', name: '김도현', email: 'dohyun@adagency.com', type: 'Professional', status: 'Lead', company: 'HSAD', position: 'AE', avatarInitials: 'DH', brandAssociation: ['badak'], tags: ['광고', '기획'], source: 'Referral', createdAt: '2025-09-01' },

    // Mentors (YouInOne)
    { id: 'p11', name: '이준혁', email: 'junhyuk@youinone.com', type: 'Mentor', status: 'Active', company: 'YouInOne', position: '거점 멘토 (서울)', avatarInitials: 'JH', brandAssociation: ['youinone', 'madleap'], tags: ['멘토', '마케팅 전략'], source: 'MADLeap 출신', createdAt: '2024-01-01' },
    { id: 'p12', name: '박소현', email: 'sohyun@youinone.com', type: 'Mentor', status: 'Active', company: 'YouInOne', position: '거점 멘토 (부산)', avatarInitials: 'SH', brandAssociation: ['youinone', 'madleague'], tags: ['멘토', '브랜딩'], source: 'Badak 출신', createdAt: '2024-06-01' },
    { id: 'p13', name: '강민재', email: 'minjae@youinone.com', type: 'Mentor', status: 'Active', company: 'YouInOne', position: '선배 멘토', avatarInitials: 'MJ', brandAssociation: ['youinone'], tags: ['멘토', '콘텐츠'], source: 'MADLeague 출신', createdAt: '2025-01-01' },

    // Partner/Client contacts
    { id: 'p14', name: 'Minji Park', email: 'minji.vlog@gmail.com', phone: '010-5555-5555', type: 'Partner', status: 'Lead', company: 'Freelance', position: 'Influencer', avatarInitials: 'MP', brandAssociation: ['madleague'], tags: ['인플루언서', '앰배서더 후보'], source: 'MADLeague', lastContacted: '2025-09-01', createdAt: '2025-07-01', notes: 'MAD League Season 2 앰배서더 후보' },
    { id: 'p15', name: '장우성', email: 'wooseong@youngyang.go.kr', type: 'Client', status: 'Active', company: '경상북도 영양군', position: '지역활성화팀 주임', avatarInitials: 'WS', brandAssociation: ['madleague'], tags: ['지자체', '인사이트 투어링'], source: 'Direct', lastContacted: '2025-09-10', createdAt: '2025-08-01', notes: '인사이트 투어링 담당자' },
];

export const initialOrganizations: Organization[] = [
    { id: 'org1', name: 'CJ ENM', type: 'Partner', industry: '엔터테인먼트', website: 'https://cjenm.com', contactIds: ['p6'], brandAssociation: ['luki', 'badak'], status: 'Active', createdAt: '2024-06-01' },
    { id: 'org2', name: 'Visual FX Studio', type: 'Vendor', industry: 'VFX/3D', website: 'https://vfx.kr', contactIds: ['p7'], brandAssociation: ['rook'], status: 'Active', createdAt: '2024-01-15' },
    { id: 'org3', name: '경상북도 영양군', type: 'Client', industry: '지방자치단체', contactIds: ['p15'], brandAssociation: ['madleague'], status: 'Active', createdAt: '2025-08-01', notes: '인사이트 투어링 파트너' },
    { id: 'org4', name: '지평막걸리', type: 'Sponsor', industry: '식음료', website: 'https://jipyeong.co.kr', contactIds: [], brandAssociation: ['madleague'], status: 'Active', createdAt: '2025-01-01', notes: '경쟁PT 호스트 브랜드' },
    { id: 'org5', name: 'LG U+', type: 'Sponsor', industry: '통신', website: 'https://uplus.co.kr', contactIds: [], brandAssociation: ['madleague'], status: 'Active', createdAt: '2025-03-01', notes: '경쟁PT 호스트 브랜드' },
    { id: 'org6', name: 'Digital First', type: 'Partner', industry: '디지털 마케팅', contactIds: ['p8'], brandAssociation: ['badak'], status: 'Active', createdAt: '2024-08-01' },
    { id: 'org7', name: 'GrowthLab', type: 'Partner', industry: '스타트업', contactIds: ['p9'], brandAssociation: ['youinone'], status: 'Active', createdAt: '2024-05-01' },
    { id: 'org8', name: 'SBA 서울산업진흥원', type: 'Partner', industry: '공공기관', contactIds: [], brandAssociation: ['tenone'], status: 'Active', createdAt: '2024-01-01', notes: '심사위원 활동' },
];

export const initialDeals: Deal[] = [
    { id: 'd1', title: 'MADLeague 인사이트 투어링 - 영양군', organizationId: 'org3', contactId: 'p15', stage: 'Negotiation', value: 8000000, currency: 'KRW', brandId: 'madleague', expectedCloseDate: '2025-10-15', createdAt: '2025-08-15', updatedAt: '2025-09-10', notes: '2025 하반기 인사이트 투어링 프로그램' },
    { id: 'd2', title: '지평막걸리 경쟁PT 스폰서십', organizationId: 'org4', contactId: '', stage: 'Won', value: 5000000, currency: 'KRW', brandId: 'madleague', createdAt: '2025-01-20', updatedAt: '2025-02-10' },
    { id: 'd3', title: 'LG U+ Re:zeros 경쟁PT', organizationId: 'org5', contactId: '', stage: 'Won', value: 7000000, currency: 'KRW', brandId: 'madleague', createdAt: '2025-03-01', updatedAt: '2025-04-15' },
    { id: 'd4', title: 'CJ ENM LUKI 콜라보레이션', organizationId: 'org1', contactId: 'p6', stage: 'Proposal', value: 20000000, currency: 'KRW', brandId: 'luki', expectedCloseDate: '2025-12-01', createdAt: '2025-09-01', updatedAt: '2025-09-10' },
    { id: 'd5', title: 'RooK VFX 제작 계약', organizationId: 'org2', contactId: 'p7', stage: 'Contacted', value: 3000000, currency: 'KRW', brandId: 'rook', createdAt: '2025-09-05', updatedAt: '2025-09-05' },
    { id: 'd6', title: 'Badak 밋업 스폰서 (Digital First)', organizationId: 'org6', contactId: 'p8', stage: 'Lead', value: 1000000, currency: 'KRW', brandId: 'badak', createdAt: '2025-09-12', updatedAt: '2025-09-12' },
];

export const initialActivities: Activity[] = [
    { id: 'a1', type: 'Meeting', title: '영양군 인사이트 투어링 킥오프', description: '프로그램 일정 및 예산 논의', personId: 'p15', organizationId: 'org3', dealId: 'd1', date: '2025-09-10', createdAt: '2025-09-10' },
    { id: 'a2', type: 'Email', title: 'CJ ENM LUKI 콜라보 제안서 발송', personId: 'p6', organizationId: 'org1', dealId: 'd4', date: '2025-09-08', createdAt: '2025-09-08' },
    { id: 'a3', type: 'Call', title: 'David Lee RooK 프로젝트 논의', personId: 'p7', organizationId: 'org2', dealId: 'd5', date: '2025-09-05', createdAt: '2025-09-05' },
    { id: 'a4', type: 'Event', title: 'MADLeap 5기 OT', description: '신입 멤버 오리엔테이션', personId: 'p1', date: '2025-03-08', createdAt: '2025-03-08' },
    { id: 'a5', type: 'Meeting', title: 'YouInOne 멘토단 회의', description: '2025 하반기 멘토링 계획', personId: 'p11', date: '2025-09-01', createdAt: '2025-09-01' },
    { id: 'a6', type: 'Note', title: 'Badak 밋업 스폰서 아이디어', description: 'Digital First 한수진 대표와 밋업 협찬 논의 필요', personId: 'p8', dealId: 'd6', date: '2025-09-12', createdAt: '2025-09-12' },
    { id: 'a7', type: 'Email', title: 'MADLeague Season 2 앰배서더 제안', personId: 'p14', date: '2025-09-01', createdAt: '2025-09-01' },
    { id: 'a8', type: 'Meeting', title: '지평막걸리 경쟁PT 결과 보고', organizationId: 'org4', dealId: 'd2', date: '2025-04-20', createdAt: '2025-04-20' },
    { id: 'a9', type: 'Event', title: 'Re:zeros 경쟁PT 본선', description: '4팀 참가, LG U+ 본사', organizationId: 'org5', dealId: 'd3', date: '2025-04-10', createdAt: '2025-04-10' },
    { id: 'a10', type: 'Call', title: 'SBA 심사위원 일정 확인', organizationId: 'org8', date: '2025-08-25', createdAt: '2025-08-25' },
];
