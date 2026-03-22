import type { PointLog, MemberPointSummary } from '@/types/point';

// ── Mock 포인트 로그 ──
export const initialPointLogs: PointLog[] = [
    // 텐원 (대표)
    { id: 'PL-001', memberId: 'staff-001', memberName: '텐원', category: 'project_complete', points: 500, balance: 4850, description: 'LUKI 1st Single 프로젝트 완료', referenceId: 'PRJ-2025-001', referenceType: 'project', createdAt: '2026-03-20', createdBy: '시스템' },
    { id: 'PL-002', memberId: 'staff-001', memberName: '텐원', category: 'education_complete', points: 200, balance: 4350, description: 'AI 크리에이터 워크숍 수료', referenceId: 'CRS-005', referenceType: 'course', createdAt: '2026-03-15', createdBy: '시스템' },
    { id: 'PL-003', memberId: 'staff-001', memberName: '텐원', category: 'gpr_evaluation', points: 300, balance: 4150, description: '2025 Q4 GPR 평가 반영', referenceId: 'GPR-Q4', referenceType: 'gpr', createdAt: '2026-01-10', createdBy: '시스템' },
    { id: 'PL-004', memberId: 'staff-001', memberName: '텐원', category: 'community_activity', points: 30, balance: 3850, description: 'Townity 게시글 작성', referenceId: 'POST-042', referenceType: 'post', createdAt: '2026-03-12', createdBy: '시스템' },
    { id: 'PL-005', memberId: 'staff-001', memberName: '텐원', category: 'mentor_bonus', points: 200, balance: 3820, description: '신규 크루 멘토링 완료', createdAt: '2026-02-28', createdBy: '시스템' },
    { id: 'PL-006', memberId: 'staff-001', memberName: '텐원', category: 'attendance_bonus', points: 150, balance: 3620, description: '2월 근태 우수', createdAt: '2026-03-01', createdBy: '시스템' },
    { id: 'PL-007', memberId: 'staff-001', memberName: '텐원', category: 'job_complete', points: 100, balance: 3470, description: 'LUKI 컨셉 기획 Job 완료', referenceId: 'JOB-001', referenceType: 'job', createdAt: '2026-02-20', createdBy: '시스템' },
    { id: 'PL-008', memberId: 'staff-001', memberName: '텐원', category: 'event_participation', points: 50, balance: 3370, description: 'Badak 밋업 #12 참여', referenceId: 'EVT-012', referenceType: 'event', createdAt: '2026-02-15', createdBy: '시스템' },

    // Sarah Kim (마케팅)
    { id: 'PL-101', memberId: 'staff-002', memberName: 'Sarah Kim', category: 'project_complete', points: 500, balance: 2300, description: 'MADLeap 4기 운영 프로젝트 완료', referenceId: 'PRJ-2025-005', referenceType: 'project', createdAt: '2026-03-18', createdBy: '시스템' },
    { id: 'PL-102', memberId: 'staff-002', memberName: 'Sarah Kim', category: 'education_complete', points: 200, balance: 1800, description: 'GPR 프레임워크 이해 수료', referenceId: 'CRS-002', referenceType: 'course', createdAt: '2026-03-05', createdBy: '시스템' },
    { id: 'PL-103', memberId: 'staff-002', memberName: 'Sarah Kim', category: 'job_complete', points: 100, balance: 1600, description: 'SNS 캠페인 실행 Job 완료', referenceId: 'JOB-015', referenceType: 'job', createdAt: '2026-02-25', createdBy: '시스템' },
    { id: 'PL-104', memberId: 'staff-002', memberName: 'Sarah Kim', category: 'community_activity', points: 30, balance: 1500, description: 'Wiki 문서 작성', referenceId: 'POST-038', referenceType: 'post', createdAt: '2026-02-20', createdBy: '시스템' },

    // 한마케 (마케팅팀장)
    { id: 'PL-201', memberId: 'staff-003', memberName: '한마케', category: 'project_complete', points: 500, balance: 3100, description: '브랜드 리뉴얼 프로젝트 완료', referenceId: 'PRJ-2025-008', referenceType: 'project', createdAt: '2026-03-10', createdBy: '시스템' },
    { id: 'PL-202', memberId: 'staff-003', memberName: '한마케', category: 'gpr_evaluation', points: 300, balance: 2600, description: '2025 Q4 GPR 평가 반영', referenceId: 'GPR-Q4', referenceType: 'gpr', createdAt: '2026-01-10', createdBy: '시스템' },
    { id: 'PL-203', memberId: 'staff-003', memberName: '한마케', category: 'education_complete', points: 200, balance: 2300, description: '리더십 코칭 과정 수료', referenceId: 'CRS-010', referenceType: 'course', createdAt: '2026-02-15', createdBy: '시스템' },
    { id: 'PL-204', memberId: 'staff-003', memberName: '한마케', category: 'mentor_bonus', points: 200, balance: 2100, description: '인턴 멘토링 완료', createdAt: '2026-02-01', createdBy: '시스템' },

    // 김콘텐 (콘텐츠)
    { id: 'PL-301', memberId: 'staff-004', memberName: '김콘텐', category: 'job_complete', points: 100, balance: 1650, description: '영상 편집 Job 완료', referenceId: 'JOB-020', referenceType: 'job', createdAt: '2026-03-19', createdBy: '시스템' },
    { id: 'PL-302', memberId: 'staff-004', memberName: '김콘텐', category: 'education_complete', points: 200, balance: 1550, description: 'AI 영상 생성 과정 수료', referenceId: 'CRS-008', referenceType: 'course', createdAt: '2026-03-01', createdBy: '시스템' },
    { id: 'PL-303', memberId: 'staff-004', memberName: '김콘텐', category: 'community_activity', points: 30, balance: 1350, description: '사내 공모전 참가', referenceId: 'EVT-015', referenceType: 'event', createdAt: '2026-02-10', createdBy: '시스템' },

    // 이수진 (파트너)
    { id: 'PL-401', memberId: 'partner-001', memberName: '이수진', category: 'project_complete', points: 500, balance: 1200, description: 'Badak 밋업 운영 완료', referenceId: 'PRJ-2025-012', referenceType: 'project', createdAt: '2026-03-15', createdBy: '시스템' },
    { id: 'PL-402', memberId: 'partner-001', memberName: '이수진', category: 'event_participation', points: 50, balance: 700, description: '인사이트 투어링 참여', referenceId: 'EVT-010', referenceType: 'event', createdAt: '2026-02-20', createdBy: '시스템' },

    // 크루 멤버들
    { id: 'PL-501', memberId: 'crew-001', memberName: '박크루', category: 'education_complete', points: 200, balance: 650, description: 'VRIEF Orientation 수료', referenceId: 'CRS-001', referenceType: 'course', createdAt: '2026-03-10', createdBy: '시스템' },
    { id: 'PL-502', memberId: 'crew-001', memberName: '박크루', category: 'community_activity', points: 30, balance: 450, description: '자유게시판 활동', referenceId: 'POST-050', referenceType: 'post', createdAt: '2026-03-08', createdBy: '시스템' },
    { id: 'PL-503', memberId: 'crew-001', memberName: '박크루', category: 'event_participation', points: 50, balance: 420, description: 'MADLeague 네트워킹 참여', referenceId: 'EVT-008', referenceType: 'event', createdAt: '2026-02-15', createdBy: '시스템' },

    { id: 'PL-601', memberId: 'crew-002', memberName: '최인턴', category: 'education_complete', points: 200, balance: 350, description: 'Mind Set 과정 수료', referenceId: 'CRS-003', referenceType: 'course', createdAt: '2026-03-05', createdBy: '시스템' },
    { id: 'PL-602', memberId: 'crew-002', memberName: '최인턴', category: 'community_activity', points: 30, balance: 150, description: 'QnA 답변 활동', referenceId: 'POST-055', referenceType: 'post', createdAt: '2026-02-28', createdBy: '시스템' },
];

// ── 멤버별 포인트 요약 ──
export const initialMemberPoints: MemberPointSummary[] = [
    { memberId: 'staff-001', memberName: '텐원', department: '기업 총괄', position: '대표이사', totalPoints: 4850, grade: 'Gold', thisMonthPoints: 730, thisQuarterPoints: 1580, lastActivity: '2026-03-20' },
    { memberId: 'staff-003', memberName: '한마케', department: '마케팅본부', position: '본부장', totalPoints: 3100, grade: 'Gold', thisMonthPoints: 500, thisQuarterPoints: 1200, lastActivity: '2026-03-10' },
    { memberId: 'staff-002', memberName: 'Sarah Kim', department: '마케팅본부', position: '매니저', totalPoints: 2300, grade: 'Silver', thisMonthPoints: 700, thisQuarterPoints: 830, lastActivity: '2026-03-18' },
    { memberId: 'staff-004', memberName: '김콘텐', department: '콘텐츠팀', position: '주임', totalPoints: 1650, grade: 'Silver', thisMonthPoints: 300, thisQuarterPoints: 530, lastActivity: '2026-03-19' },
    { memberId: 'partner-001', memberName: '이수진', department: '-', position: '파트너', totalPoints: 1200, grade: 'Silver', thisMonthPoints: 500, thisQuarterPoints: 550, lastActivity: '2026-03-15' },
    { memberId: 'crew-001', memberName: '박크루', department: '-', position: '크루', totalPoints: 650, grade: 'Bronze', thisMonthPoints: 230, thisQuarterPoints: 280, lastActivity: '2026-03-10' },
    { memberId: 'crew-002', memberName: '최인턴', department: '-', position: '크루', totalPoints: 350, grade: 'Bronze', thisMonthPoints: 200, thisQuarterPoints: 230, lastActivity: '2026-03-05' },
];
