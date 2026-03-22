import { GprGoal } from '@/types/gpr';

export const initialGprGoals: GprGoal[] = [
    // Cheonil Jeon (s1)
    { id: 'gpr1', staffId: 's1', level: 'GPR-III', title: '10,000명의 기획자 발굴 네트워크 구축', description: 'MADLeague 전국 확장 + Badak 네트워킹 활성화를 통한 기획자 풀 확대', kpi: '연간 네트워크 가입자 500명 이상', weight: 30, status: 'In Progress', progress: 25, dueDate: '2025-12-31', agreedBy: 's1', agreedAt: '2025-01-15', period: '2025', createdAt: '2025-01-10', updatedAt: '2025-09-01' },
    { id: 'gpr2', staffId: 's1', level: 'GPR-II', title: 'MADLeague 인사이트 투어링 성공적 운영', description: '영양군 지역 활동가와 학생 연계 프로그램 실행', kpi: '참가 학생 30명, 기업 만족도 4.0 이상', weight: 25, status: 'In Progress', progress: 60, dueDate: '2025-10-15', agreedBy: 's1', agreedAt: '2025-08-01', period: '2025-Q3', createdAt: '2025-07-20', updatedAt: '2025-09-10' },
    { id: 'gpr3', staffId: 's1', level: 'GPR-II', title: 'LUKI 데뷔 캠페인 완료', description: 'AI 4인조 걸그룹 LUKI 공식 데뷔 및 콘텐츠 배포', kpi: '유튜브 구독자 1,000명', weight: 20, status: 'Evaluated', progress: 100, selfRating: 5, selfComment: '성공적으로 데뷔 완료. 예상보다 높은 초기 반응', selfEvaluatedAt: '2025-09-05', supervisorRating: 4, supervisorComment: '데뷔는 성공적이나 후속 콘텐츠 전략 보강 필요', supervisorId: 's1', evaluatedAt: '2025-09-10', period: '2025-Q3', createdAt: '2025-06-01', updatedAt: '2025-09-10' },
    { id: 'gpr4', staffId: 's1', level: 'GPR-I', title: '주간 콘텐츠 파이프라인 운영', description: 'Badak, MADLeague, FWN 채널 주기적 콘텐츠 발행', kpi: '주 3회 이상 콘텐츠 발행', weight: 15, status: 'In Progress', progress: 70, agreedBy: 's1', agreedAt: '2025-01-15', period: '2025', createdAt: '2025-01-10', updatedAt: '2025-09-12' },
    { id: 'gpr5', staffId: 's1', level: 'GPR-II', title: 'VRIEF 프레임워크 매드리그 교육 적용', description: '매드리그 대학생 대상 VRIEF 3Step 교육 프로그램 운영', kpi: '교육 참여 학생 50명, 만족도 4.5', weight: 10, status: 'In Progress', progress: 40, dueDate: '2025-11-30', period: '2025-Q4', createdAt: '2025-09-01', updatedAt: '2025-09-15' },

    // Sarah Kim (s2)
    { id: 'gpr6', staffId: 's2', level: 'GPR-II', title: 'LUKI 브랜드 파트너십 3건 확보', description: 'CJ ENM, 음원 유통사 등 파트너십 체결', kpi: '파트너십 계약 3건', weight: 40, status: 'Pending Approval', progress: 0, dueDate: '2025-12-31', period: '2025-Q4', createdAt: '2025-09-15', updatedAt: '2025-09-15' },
    { id: 'gpr7', staffId: 's2', level: 'GPR-I', title: 'Badak 밋업 월 1회 운영', description: '현업자 네트워킹 밋업 정기 개최', kpi: '월 1회 20명 참가', weight: 30, status: 'Agreed', progress: 30, agreedBy: 's1', agreedAt: '2025-09-01', period: '2025', createdAt: '2025-08-20', updatedAt: '2025-09-10' },

    // 김준호 (s3)
    { id: 'gpr8', staffId: 's3', level: 'GPR-I', title: 'MADLeap 5기 운영 관리', description: '5기 멤버 모집, OT, 정기 모임 운영', kpi: '신규 멤버 30명 모집, 잔존율 80%', weight: 50, status: 'In Progress', progress: 55, agreedBy: 's1', agreedAt: '2025-03-15', period: '2025', createdAt: '2025-03-01', updatedAt: '2025-09-10' },
    { id: 'gpr9', staffId: 's3', level: 'GPR-II', title: '경쟁PT 프로그램 기획', description: '2025 하반기 경쟁PT 호스트 브랜드 섭외 및 프로그램 설계', kpi: '호스트 브랜드 2개 확보', weight: 30, status: 'Draft', progress: 0, period: '2025-Q4', createdAt: '2025-09-10', updatedAt: '2025-09-10' },
];

export const ratingLabels: Record<number, string> = {
    1: '기대 이하',
    2: '개선 필요',
    3: '기대 충족',
    4: '기대 초과',
    5: '탁월',
};
