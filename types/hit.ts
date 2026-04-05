/**
 * HIT (HeRo Integrated Test) 타입 정의
 */

// ── 문항 ──

export interface MBTIQuestion {
  id: string;           // 'mbti_001' ~ 'mbti_080'
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  text: string;
  options: [
    { label: string; value: string },  // 예: { label: "...", value: "E" }
    { label: string; value: string },  // 예: { label: "...", value: "I" }
  ];
}

export interface DISCQuestion {
  id: string;           // 'disc_001' ~ 'disc_040'
  source: 'pre' | 'main';
  text: string;
  options: [
    { label: string; value: 'D' | 'I' | 'S' | 'C' },
    { label: string; value: 'D' | 'I' | 'S' | 'C' },
    { label: string; value: 'D' | 'I' | 'S' | 'C' },
    { label: string; value: 'D' | 'I' | 'S' | 'C' },
  ];
}

export interface BaseQuestion {
  id: string;           // 'base_001' ~ 'base_008'
  text: string;
  options: [
    { label: string; value: 'D' | 'I' | 'S' | 'C' },
    { label: string; value: 'D' | 'I' | 'S' | 'C' },
    { label: string; value: 'D' | 'I' | 'S' | 'C' },
    { label: string; value: 'D' | 'I' | 'S' | 'C' },
  ];
}

export type HitQuestion = MBTIQuestion | DISCQuestion | BaseQuestion;

// ── 세션 ──

export type HitTestType = 'A' | 'B';
export type HitSessionStatus = 'in_progress' | 'completed' | 'abandoned';
export type HitModule = 'base' | 'mbti' | 'disc' | 'personality' | 'riasec' | 'competency' | 'readiness';

export interface HitSession {
  id: string;
  memberId: string | null;
  sessionToken: string;
  testType: HitTestType;
  status: HitSessionStatus;
  currentModule: HitModule;
  currentIndex: number;
  startedAt: string;
  completedAt: string | null;
  tenantId: string;
  brandId: string;
}

// ── 응답 ──

export interface HitResponse {
  id: string;
  sessionId: string;
  module: HitModule;
  questionId: string;
  questionIndex: number;
  selectedOption: number;
  optionValue: string;
  responseTimeMs: number | null;
  answeredAt: string;
}

// ── 채점 결과 ──

export interface MBTIScores {
  eScore: number;  // 0-100 (0=극I, 100=극E)
  sScore: number;  // 0-100 (0=극N, 100=극S)
  tScore: number;  // 0-100 (0=극F, 100=극T)
  jScore: number;  // 0-100 (0=극P, 100=극J)
  type: string;    // 'INTJ' 등
}

export interface DISCScores {
  d: number;       // 0-100
  i: number;
  s: number;
  c: number;
  primary: string;   // 'D','I','S','C'
  subtype: string;   // 'DI','DIS' 등
}

export interface SPowerScores {
  strategic: number;     // 전략적 사고
  execution: number;     // 실행 추진력
  creativity: number;    // 창의성
  interpersonal: number; // 대인관계
  analytical: number;    // 분석적 판단
}

/** UF (Underlying Factors) 기저요인 9영역 점수 (0~100) */
export interface UFScores {
  sibling: number;       // 형제관계·협력
  parent: number;        // 부모관계·정서
  family: number;        // 가정정서·자원
  peer: number;          // 또래·학교
  self: number;          // 자기개념·사회역량
  temperament: number;   // 기질적 본능
  economic: number;      // 경제적 환경
  trauma: number;        // 트라우마·전환점
  cultural: number;      // 문화·세대·교육
}

// ── 64유형 프로필 ──

export interface TypeProfile {
  code: string;         // 'D-INTJ'
  nameKo: string;       // '전략적인 목표 달성가'
  nickname: string;     // 'Iron Innovator'
  category: string;     // '분석형', '외교형' 등
  traits: string;       // 특징 설명
  careers: string;      // 직업 방향
  jobs: string;         // 관련 직업
}

// ── HIT A 결과 ──

export interface HitAResult {
  id: string;
  sessionId: string;
  memberId: string | null;

  // MBTI
  mbtiType: string;
  mbtiEScore: number;
  mbtiSScore: number;
  mbtiTScore: number;
  mbtiJScore: number;

  // DISC
  discPrimary: string;
  discSubtype: string;
  discDScore: number;
  discIScore: number;
  discSScore: number;
  discCScore: number;

  // 기저요인 (UF)
  baseSummary: string;
  baseScores: Record<string, number>;  // DEPRECATED
  ufScores?: UFScores;

  // 64유형
  typeCode: string;
  typeNameKo: string;
  typeNickname: string;
  typeCategory: string;
  typeTraits: string;
  typeCareers: string;

  // AI + S-Power
  aiNarrative: string | null;
  sPowerScores: SPowerScores | null;

  createdAt: string;
}

// ── API 입력 ──

export interface CreateSessionInput {
  memberId?: string;
  testType: HitTestType;
}

export interface SaveResponseInput {
  sessionToken: string;
  questionId: string;
  module: HitModule;
  questionIndex: number;
  selectedOption: number;
  optionValue: string;
  responseTimeMs?: number;
}

// ── HIT B 타입 ──

export interface LikertQuestion {
  id: string;
  text: string;
  reverse?: boolean;
  subscale: string;
}

export interface CompetencyQuestion extends LikertQuestion {
  track?: string;
}

export type CompetencyTrack = 'marketing_strategy' | 'branding' | 'advertising' | 'content' | 'data_performance';

export interface HitBResult {
  id: string;
  sessionId: string;
  memberId: string | null;
  hitAResultId: string | null;
  personalityScores: Record<string, number>;
  darkTriadFlags: Record<string, boolean>;
  riasecR: number;
  riasecI: number;
  riasecA: number;
  riasecS: number;
  riasecE: number;
  riasecC: number;
  hollandCode: string;
  competencyCommon: Record<string, number>;
  competencyTrack: string;
  competencyTrackScores: Record<string, number>;
  readinessSelf: number;
  readinessPortfolio: number;
  readinessInterview: number;
  readinessNetwork: number;
  readinessTotal: number;
  readinessGrade: string;
  readinessGaps: string[];
  aiReport: string | null;
  journeyStage: string;
  createdAt: string;
}
