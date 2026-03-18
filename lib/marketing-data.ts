import { Campaign, Lead, ContentPost } from '@/types/marketing';

export const initialCampaigns: Campaign[] = [
    { id: 'camp1', name: 'LUKI 데뷔 캠페인', type: 'Brand', status: 'Completed', brandId: 'luki', description: 'AI 4인조 걸그룹 LUKI 공식 데뷔 론칭', budget: 15000000, spent: 12000000, kpi: '유튜브 구독자 1,000명', assignee: 'Cheonil Jeon', startDate: '2025-07-01', endDate: '2025-09-30', channels: ['YouTube', 'Instagram', 'TikTok'], createdAt: '2025-06-15' },
    { id: 'camp2', name: 'MADLeague 인사이트 투어링', type: 'Event', status: 'Active', brandId: 'madleague', description: '영양군 지역 활동가와 학생 연계 프로그램', budget: 8000000, spent: 3000000, kpi: '참가 학생 30명, 기업 만족도 4.0', assignee: 'Cheonil Jeon', startDate: '2025-09-01', endDate: '2025-11-30', channels: ['오프라인', 'SNS'], createdAt: '2025-08-01' },
    { id: 'camp3', name: 'Badak 월간 밋업', type: 'Event', status: 'Active', brandId: 'badak', description: '마케팅·광고 현업자 월 1회 소규모 유료 밋업', budget: 2000000, spent: 600000, kpi: '월 20명 참가, 유료 전환', assignee: 'Sarah Kim', startDate: '2025-09-01', channels: ['카카오', '오프라인'], createdAt: '2025-08-20' },
    { id: 'camp4', name: 'RooK AI 크리에이터 쇼케이스', type: 'Content', status: 'Draft', brandId: 'rook', description: 'AI 생성 아트워크 온라인 전시', budget: 5000000, spent: 0, kpi: '전시 방문 500명', assignee: 'Cheonil Jeon', startDate: '2025-11-01', channels: ['Website', 'Instagram'], createdAt: '2025-09-10' },
    { id: 'camp5', name: 'MADLeap 5기 모집', type: 'Brand', status: 'Completed', brandId: 'madleap', description: '2025 서울·경기 대학생 동아리 5기 모집', budget: 1000000, spent: 800000, kpi: '지원자 100명, 선발 30명', assignee: '김준호', startDate: '2025-01-15', endDate: '2025-03-01', channels: ['Instagram', '대학 게시판'], createdAt: '2025-01-10' },
    { id: 'camp6', name: 'CJ ENM LUKI 콜라보', type: 'Partnership', status: 'Active', brandId: 'luki', description: 'CJ ENM과 LUKI IP 활용 콜라보레이션', budget: 20000000, spent: 0, kpi: '콜라보 콘텐츠 3건', assignee: 'Sarah Kim', startDate: '2025-10-01', channels: ['TV', 'Digital'], createdAt: '2025-09-01' },
];

export const initialLeads: Lead[] = [
    { id: 'lead1', name: '이상호', company: '스타트업 코리아', email: 'sangho@startup.kr', stage: 'Qualified', source: 'Badak', value: 5000000, assignee: 'Sarah Kim', notes: '마케팅 대행 관심', createdAt: '2025-09-10', updatedAt: '2025-09-15' },
    { id: 'lead2', name: '박지영', company: '뷰티브랜드 A', email: 'jiyoung@beauty.com', phone: '010-3333-4444', stage: 'Proposal', source: 'Referral', value: 10000000, assignee: 'Cheonil Jeon', notes: 'LUKI 모델 활용 제안', createdAt: '2025-09-05', updatedAt: '2025-09-12' },
    { id: 'lead3', name: '김태준', company: '지역관광공사', email: 'taejun@tourism.go.kr', stage: 'New', source: 'Event', value: 8000000, assignee: 'Cheonil Jeon', notes: '인사이트 투어링 확장 논의', createdAt: '2025-09-14', updatedAt: '2025-09-14' },
    { id: 'lead4', name: '정수민', email: 'sumin@agency.kr', company: '디지털 에이전시 B', stage: 'Contacted', source: 'Website', value: 3000000, assignee: 'Sarah Kim', createdAt: '2025-09-12', updatedAt: '2025-09-13' },
    { id: 'lead5', name: '홍민석', company: '패션브랜드 C', email: 'minseok@fashion.com', stage: 'Negotiation', source: 'Direct', value: 15000000, assignee: 'Cheonil Jeon', notes: 'FWN 패션위크 파트너십', createdAt: '2025-08-20', updatedAt: '2025-09-10' },
    { id: 'lead6', name: '윤서아', email: 'seoa@univ.ac.kr', stage: 'Won', source: 'MADLeague', value: 500000, assignee: '김준호', notes: '매드리그 경쟁PT 호스트 연결', createdAt: '2025-08-01', updatedAt: '2025-09-01' },
];

export const initialContentPosts: ContentPost[] = [
    { id: 'cp1', title: '마케팅 트렌드 위클리 #38', type: 'Newsletter', status: 'Published', channel: 'Badak', brandId: 'badak', assignee: 'Cheonil Jeon', publishDate: '2025-09-16', engagement: 245, createdAt: '2025-09-14' },
    { id: 'cp2', title: 'LUKI "Starlight" MV Behind', type: 'Video', status: 'Published', channel: 'YouTube', brandId: 'luki', assignee: 'Cheonil Jeon', publishDate: '2025-09-10', engagement: 1200, createdAt: '2025-09-08' },
    { id: 'cp3', title: '공모전 정보 모음 9월', type: 'Article', status: 'Scheduled', channel: 'MADLeague', brandId: 'madleague', assignee: '김준호', publishDate: '2025-09-18', createdAt: '2025-09-15' },
    { id: 'cp4', title: '서울패션위크 2025 프리뷰', type: 'Article', status: 'Draft', channel: 'FWN', brandId: 'fwn', assignee: 'Cheonil Jeon', createdAt: '2025-09-12' },
    { id: 'cp5', title: '감자의 하루 ep.12', type: 'SNS', status: 'Published', channel: '0gamja', brandId: '0gamja', assignee: 'Cheonil Jeon', publishDate: '2025-09-14', engagement: 89, createdAt: '2025-09-13' },
    { id: 'cp6', title: 'MADLeap 5기 활동 브이로그', type: 'Shorts', status: 'Scheduled', channel: 'MADLeap', brandId: 'madleap', assignee: '김준호', publishDate: '2025-09-20', createdAt: '2025-09-16' },
];
