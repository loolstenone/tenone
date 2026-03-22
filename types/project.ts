// Ten:One™ Project & Job 구조

// ── 프로젝트 유형 ──
export type ProjectCategory = 'community' | 'client' | 'internal';

export type ProjectSubType =
    // 커뮤니티
    | '동아리 운영' | '경쟁 PT' | '네트워킹' | '교육'
    // 클라이언트
    | '캠페인' | '브랜딩' | '콘텐츠' | '컨설팅'
    // 내부
    | '서비스 개발' | '브랜드 운영' | '인프라';

export type ProjectStatus = '기획' | '진행' | '완료' | '보류' | '취소';

// ── 매체 유형 ──
export type MediaType = 'TV' | 'DG' | 'SNS' | 'OOH' | 'PR' | 'EVT' | 'PT' | 'NONE';

export const mediaTypeLabels: Record<MediaType, string> = {
    TV: 'TV/OTT', DG: '디지털', SNS: 'SNS', OOH: '옥외',
    PR: '홍보/PR', EVT: '이벤트', PT: '인쇄', NONE: '해당없음',
};

// ── 제작 유형 ──
export type ProductionType = 'VD' | 'GR' | 'WB' | 'CP' | 'AI' | '3D' | 'ED' | 'NONE';

export const productionTypeLabels: Record<ProductionType, string> = {
    VD: '영상', GR: '그래픽', WB: '웹/앱', CP: '카피',
    AI: 'AI 생성', '3D': '3D/VR', ED: '편집', NONE: '해당없음',
};

// ── 프로젝트 ──
export interface Project {
    id: string;
    code: string;              // PRJ-2026-0001
    name: string;
    category: ProjectCategory; // 대분류
    subType: ProjectSubType;   // 세부 유형
    status: ProjectStatus;
    pm: string;
    pmId: string;
    client?: string;           // 클라이언트명
    mediaTypes?: MediaType[];  // 프로젝트 매체 유형 (복수)
    startDate: string;
    endDate: string;
    description?: string;
    jobs: Job[];
    financials?: ProjectFinancials;
}

// ── Job ──
export type JobType = 'PR' | 'ME' | 'PT';       // 제작 | Media | PT
export type JobDetail = 'PL' | 'DO' | 'RE';     // 기획 | 실행 | Report

export interface Job {
    id: string;
    code: string;              // PRJ-2026-0001-PR-PL0001
    projectId: string;
    name: string;
    type: JobType;
    detail: JobDetail;
    mediaType?: MediaType;     // Job별 매체 유형
    productionType?: ProductionType; // Job별 제작 유형
    assignee: string;
    assigneeId: string;
    status: '대기' | '진행중' | '완료' | '보류';
    estimatedHours: number;
    actualHours: number;
    startDate: string;
    dueDate: string;
}

// ── 타임시트 엔트리 ──
export interface TimesheetEntry {
    id: string;
    date: string;
    projectCode: string;
    projectName: string;
    jobCode: string;
    jobName: string;
    hours: number;
    description?: string;
    submittedBy: string;
    submittedAt: string;
}

// ── 프로젝트 손익 ──
export interface ProjectFinancials {
    billing: number;
    exCost: number;
    revenue: number;
    inCost: number;
    profit: number;
}

// ── 라벨 ──
export const jobTypeLabels: Record<JobType, string> = {
    PR: '제작', ME: 'Media', PT: 'PT',
};

export const jobDetailLabels: Record<JobDetail, string> = {
    PL: '기획', DO: '실행', RE: 'Report',
};

export const categoryLabels: Record<ProjectCategory, string> = {
    community: '커뮤니티', client: '클라이언트', internal: '내부',
};

export const subTypeByCategory: Record<ProjectCategory, ProjectSubType[]> = {
    community: ['동아리 운영', '경쟁 PT', '네트워킹', '교육'],
    client: ['캠페인', '브랜딩', '콘텐츠', '컨설팅'],
    internal: ['서비스 개발', '브랜드 운영', '인프라'],
};

// ── 프로젝트 파일 ──
export type ProjectFileType = 'RFP' | '제안서' | '보고서' | '계약서' | '기타';

export interface ProjectFile {
    id: string;
    projectCode: string;
    name: string;
    type: ProjectFileType;
    format: 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'OTHER';
    fileUrl: string;
    fileSize: string;
    uploadedBy: string;
    uploadedAt: string;
}
