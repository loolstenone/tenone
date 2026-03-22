// Ten:One™ 포인트 시스템

// ── 등급 (Bronze ~ Diamond) ──
export type GradeLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export const gradeConfig: Record<GradeLevel, {
    label: string;
    minPoints: number;
    maxPoints: number | null; // Diamond는 상한 없음
    color: string;
    bgColor: string;
    icon: string;
}> = {
    Bronze:   { label: 'Bronze',   minPoints: 0,    maxPoints: 999,  color: 'text-amber-700',   bgColor: 'bg-amber-50',    icon: '🥉' },
    Silver:   { label: 'Silver',   minPoints: 1000, maxPoints: 2999, color: 'text-neutral-500',  bgColor: 'bg-neutral-50',  icon: '🥈' },
    Gold:     { label: 'Gold',     minPoints: 3000, maxPoints: 5999, color: 'text-yellow-600',  bgColor: 'bg-yellow-50',   icon: '🥇' },
    Platinum: { label: 'Platinum', minPoints: 6000, maxPoints: 9999, color: 'text-blue-600',    bgColor: 'bg-blue-50',     icon: '💎' },
    Diamond:  { label: 'Diamond',  minPoints: 10000, maxPoints: null, color: 'text-purple-600', bgColor: 'bg-purple-50',   icon: '👑' },
};

export const gradeLevels: GradeLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

/** 포인트로 등급 산출 */
export function getGradeByPoints(points: number): GradeLevel {
    if (points >= 10000) return 'Diamond';
    if (points >= 6000)  return 'Platinum';
    if (points >= 3000)  return 'Gold';
    if (points >= 1000)  return 'Silver';
    return 'Bronze';
}

/** 다음 등급까지 남은 포인트 */
export function getPointsToNextGrade(points: number): { nextGrade: GradeLevel | null; remaining: number } {
    const current = getGradeByPoints(points);
    const idx = gradeLevels.indexOf(current);
    if (idx >= gradeLevels.length - 1) return { nextGrade: null, remaining: 0 };
    const next = gradeLevels[idx + 1];
    return { nextGrade: next, remaining: gradeConfig[next].minPoints - points };
}

// ── 포인트 부여 사유 ──
export type PointCategory =
    | 'project_complete'    // 프로젝트 완료
    | 'job_complete'        // Job 완료
    | 'education_complete'  // 교육 이수
    | 'gpr_evaluation'      // GPR 평가 반영
    | 'community_activity'  // 커뮤니티 활동 (게시글, 댓글)
    | 'attendance_bonus'    // 근태 우수
    | 'mentor_bonus'        // 멘토링
    | 'event_participation' // 이벤트 참여
    | 'admin_adjust'        // 관리자 조정
    | 'penalty';            // 감점

export const pointCategoryLabels: Record<PointCategory, string> = {
    project_complete:    '프로젝트 완료',
    job_complete:        'Job 완료',
    education_complete:  '교육 이수',
    gpr_evaluation:      'GPR 평가',
    community_activity:  '커뮤니티 활동',
    attendance_bonus:    '근태 우수',
    mentor_bonus:        '멘토링',
    event_participation: '이벤트 참여',
    admin_adjust:        '관리자 조정',
    penalty:             '감점',
};

/** 카테고리별 기본 부여 포인트 */
export const defaultPointValues: Record<PointCategory, number> = {
    project_complete:    500,
    job_complete:        100,
    education_complete:  200,
    gpr_evaluation:      300,
    community_activity:  30,
    attendance_bonus:    150,
    mentor_bonus:        200,
    event_participation: 50,
    admin_adjust:        0,
    penalty:             -100,
};

// ── 포인트 로그 ──
export interface PointLog {
    id: string;
    memberId: string;
    memberName: string;
    category: PointCategory;
    points: number;          // 양수: 적립, 음수: 차감
    balance: number;         // 해당 시점 잔액
    description: string;
    referenceId?: string;    // 관련 프로젝트/교육/GPR ID
    referenceType?: 'project' | 'job' | 'course' | 'gpr' | 'post' | 'event';
    createdAt: string;
    createdBy: string;       // 시스템 or 관리자 이름
}

// ── 멤버별 포인트 요약 ──
export interface MemberPointSummary {
    memberId: string;
    memberName: string;
    department?: string;
    position?: string;
    totalPoints: number;
    grade: GradeLevel;
    thisMonthPoints: number;
    thisQuarterPoints: number;
    lastActivity: string;    // 마지막 포인트 변동일
}
