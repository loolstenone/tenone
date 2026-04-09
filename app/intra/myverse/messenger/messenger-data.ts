import { initialPeople, madleagueClubs } from "@/lib/people-data";
import { initialStaff } from "@/lib/staff-data";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   타입 정의
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export interface Message {
    id: string;
    from: string;
    text: string;
    time: string;
    type: 'chat' | 'notification';
    read: boolean;
}

export interface ChatThread {
    id: string;
    name: string;
    participants: string[];
    messages: Message[];
    isGroup: boolean;
    lastActive: string;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   데이터 준비
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export const activeCrewMembers = initialPeople.filter(p => p.category === 'crew' && p.membershipStatus === 'active');
export const youinoneMembers = activeCrewMembers.filter(p => p.type === 'youinone');
export const allianceMembers = activeCrewMembers.filter(p => p.type === 'youinone-alliance');
export const madleagueMembers = activeCrewMembers.filter(p => p.type === 'madleague-leader' || p.type === 'madleague-member');
export const madleagueByClub = madleagueClubs.map(club => ({
    club,
    members: madleagueMembers.filter(m => m.clubId === club.id),
})).filter(g => g.members.length > 0);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Mock 데이터 생성
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function generateNotifications(): Message[] {
    return [
        { id: 'n1', from: 'system', text: 'GPR 2026 Q1 자기평가 마감 D-3', time: '09:00', type: 'notification', read: false },
        { id: 'n2', from: 'system', text: '결재 요청: MADLeague 인사이트 투어링 예산 품의', time: '09:15', type: 'notification', read: false },
        { id: 'n3', from: 'system', text: '프로젝트 LUKI 2nd Single: 뮤직비디오 촬영 D-5', time: '어제', type: 'notification', read: true },
        { id: 'n4', from: 'system', text: '오늘 14:00 주간 팀 회의', time: '08:30', type: 'notification', read: true },
        { id: 'n5', from: 'system', text: 'Badak 3월 밋업 참석자 18/25명', time: '어제', type: 'notification', read: true },
    ];
}

export function generateMockChats(): ChatThread[] {
    return [
        {
            id: 'c1', name: 'Sarah Kim', participants: ['s1', 's2'], isGroup: false, lastActive: '10:32',
            messages: [
                { id: 'm1', from: 's2', text: '대표님, LUKI 2nd Single 컨셉 회의 일정 잡았습니다. 내일 오후 2시 어떠세요?', time: '10:15', type: 'chat', read: true },
                { id: 'm2', from: 's1', text: '좋아요. 김콘텐 팀장도 같이 참석하도록 해주세요.', time: '10:20', type: 'chat', read: true },
                { id: 'm3', from: 's2', text: '네, 콘텐츠팀이랑 AI팀도 같이 부를게요. 회의실 예약하겠습니다.', time: '10:32', type: 'chat', read: false },
            ],
        },
        {
            id: 'c2', name: '김준호', participants: ['s1', 's20'], isGroup: false, lastActive: '09:45',
            messages: [
                { id: 'm4', from: 's20', text: 'MADLeap 5기 1차 정기모임 참석자 30명 확정했습니다!', time: '09:30', type: 'chat', read: true },
                { id: 'm5', from: 's1', text: '수고했어요. 모임 장소는 어디로 잡았어요?', time: '09:35', type: 'chat', read: true },
                { id: 'm6', from: 's20', text: '성수동 위워크 4층 세미나룸이요. 케이터링도 진행 예정입니다.', time: '09:45', type: 'chat', read: true },
            ],
        },
        {
            id: 'c3', name: '경영진 회의', participants: ['s1', 's2', 's3', 's4'], isGroup: true, lastActive: '어제',
            messages: [
                { id: 'm7', from: 's3', text: '이번 달 신규 채용 2명 진행 중입니다.', time: '16:00', type: 'chat', read: true },
                { id: 'm8', from: 's4', text: '3월 경비 집행률 78%입니다.', time: '16:05', type: 'chat', read: true },
                { id: 'm9', from: 's2', text: '리제로스 시즌2 스폰서 기업 3곳 미팅 완료.', time: '16:15', type: 'chat', read: true },
                { id: 'm10', from: 's1', text: '좋아요. 스폰서 건은 이번 주 내로 제안서 보내주세요.', time: '16:20', type: 'chat', read: true },
            ],
        },
        {
            id: 'c4', name: 'LUKI 프로젝트', participants: ['s1', 's2', 's27', 's28', 's37', 's38'], isGroup: true, lastActive: '어제',
            messages: [
                { id: 'm11', from: 's27', text: '뮤직비디오 스토리보드 1차 완성했습니다.', time: '15:00', type: 'chat', read: true },
                { id: 'm12', from: 's37', text: 'AI 생성 배경 이미지 3종 테스트 완료.', time: '15:30', type: 'chat', read: true },
                { id: 'm13', from: 's28', text: '촬영 일정 다음 주 화~수로 잡을게요.', time: '15:45', type: 'chat', read: true },
            ],
        },
        {
            id: 'c5', name: '박기획', participants: ['s1', 's5'], isGroup: false, lastActive: '3/18',
            messages: [
                { id: 'm14', from: 's5', text: '2분기 사업계획서 초안 작성 완료했습니다.', time: '11:00', type: 'chat', read: true },
                { id: 'm15', from: 's1', text: '확인했어요. 코멘트 남겼으니 수정 후 다시 보내주세요.', time: '14:30', type: 'chat', read: true },
            ],
        },
    ];
}

export const todaySchedule = [
    { time: '10:00', title: '주간 팀 회의', type: '회의' },
    { time: '14:00', title: 'LUKI 컨셉 회의', type: '프로젝트' },
    { time: '16:00', title: 'Badak 밋업 준비', type: '이벤트' },
];

export const activeProjects = [
    { name: 'LUKI 2nd Single', progress: 45, dday: 'D-12' },
    { name: 'MADLeap 5기 운영', progress: 25, dday: '진행중' },
    { name: '리제로스 시즌2', progress: 10, dday: '기획중' },
];

export const pendingApprovals = [
    { title: '인사이트 투어링 예산', from: '한마케', amount: '5,000,000원' },
    { title: '콘텐츠팀 장비 구매', from: '김콘텐', amount: '2,300,000원' },
];

export const emojiGroups = [
    { group: '자주 쓰는', items: ['👍', '👏', '🙏', '💪', '🔥', '✅', '❤️', '😊'] },
    { group: '반응', items: ['😂', '🤔', '😮', '👀', '🎉', '💡', '⭐', '🚀'] },
    { group: '업무', items: ['📋', '📌', '📊', '💼', '🗓️', '⏰', '📎', '✏️'] },
    { group: '상태', items: ['🟢', '🟡', '🔴', '⏳', '✔️', '❌', '⚠️', '🔔'] },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   헬퍼 함수
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export const currentUserId = 's1';

export const getStaff = (id: string) => initialStaff.find(s => s.id === id);
export const getCrewPerson = (id: string) => activeCrewMembers.find(p => p.id === id);
export const getAnyPerson = (id: string) => getStaff(id) || getCrewPerson(id);
export const getStaffName = (id: string) => {
    const s = getStaff(id);
    if (s) return s.name;
    const c = getCrewPerson(id);
    if (c) return c.name;
    return '알 수 없음';
};
export const getStaffInitials = (id: string) => {
    const s = getStaff(id);
    if (s) return s.avatarInitials;
    const c = getCrewPerson(id);
    if (c) return c.avatarInitials;
    return '?';
};
export const getStaffPosition = (id: string) => {
    const s = getStaff(id);
    if (s) return `${s.department} · ${s.position}`;
    const c = getCrewPerson(id);
    if (c) return c.crewRole || c.type;
    return '';
};
