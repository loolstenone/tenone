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
export type HitModule = 'base' | 'mbti' | 'disc' | 'personality_type' | 'behavior_type' | 'character_core' | 'aptitude_core' | 'character_deep' | 'aptitude_deep' | 'personality' | 'riasec' | 'competency' | 'readiness';

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
  harmony: number;       // 조직 화합력
  breakthrough: number;  // 돌파 의지력
  guard: number;         // 원칙 수호력
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

  // CH core 인성 (신규)
  chIntegrity?: number;
  chRelational?: number;
  chEmotional?: number;
  chEthics?: number;
  chGrowth?: number;

  // AP core 적성 (신규)
  apTop3Code?: string;
  apScores?: APCoreScores;

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

// ── PT 성격유형 점수 ──
export interface PTScores {
  eScore: number;   // 0-100 (E 방향 %)
  nScore: number;   // 0-100 (N 방향 %)
  tScore: number;   // 0-100 (T 방향 %)
  jScore: number;   // 0-100 (J 방향 %)
  type: string;     // 'INTJ' 등 (호환용)
  eGrade: 'STRONG' | 'MID' | 'WEAK';
  nGrade: 'STRONG' | 'MID' | 'WEAK';
  tGrade: 'STRONG' | 'MID' | 'WEAK';
  jGrade: 'STRONG' | 'MID' | 'WEAK';
  fakingFlag: boolean;
}

// ── BT 행동유형 점수 ──
export interface BTScores {
  d: number;         // 0-100 (배합 %)
  i: number;
  s: number;
  c: number;
  primary: string;   // 'D'|'I'|'S'|'C'
  secondary: string;
  lowest: string;
  darkPattern: boolean; // D 과잉 패턴 탐지
}

// ── CH Core 인성 5대 영역 점수 ──
export interface CHCoreScores {
  integrity: number;   // 성실성 0-100
  relational: number;  // 대인관계 0-100
  emotional: number;   // 정서안정성 0-100
  ethics: number;      // 윤리성 0-100
  growth: number;      // 성장지향성 0-100
  darkPreFlag: boolean; // 다크 패턴 사전 탐지
}

// ── AP Core 적성 Holland 6유형 점수 ──
export interface APCoreScores {
  R: number;  // 현실형
  I: number;  // 탐구형
  A: number;  // 예술형
  S: number;  // 사회형
  E: number;  // 기업형
  C: number;  // 관습형
  top3Code: string;  // 예: 'EAI'
  scores: Record<string, number>;
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

// ── CH Deep 심화 (14하위영역 + 5영역 재산출 + 다크 탐지) ──

export interface CHDeepScores {
  subscales: {
    conscience: number;
    self_discipline: number;
    perfectionism: number;
    warmth: number;
    social_boldness: number;
    sensitivity: number;
    tension: number;
    optimism: number;
    control: number;
    independence: number;
    suspicion: number;
    openness: number;
    adventure: number;
    intellect: number;
  };
  precise: {
    integrity: number;
    relational: number;
    emotional: number;
    ethics: number;
    growth: number;
  };
  darkTypes: {
    narcissism: boolean;
    machiavellianism: boolean;
    psychopathy: boolean;
    sociopathy: boolean;
  };
  decoyFakingFlag: boolean;
}

// ── AP Deep 심화 (흥미-효능감 매트릭스) ──

export type APMatrixCell = '최적영역' | '탐색학습필요' | '소진리스크' | '비관심영역';

export interface APDeepScores {
  interest: { R: number; I: number; A: number; S: number; E: number; C: number };
  efficacy: { R: number; I: number; A: number; S: number; E: number; C: number };
  total: { R: number; I: number; A: number; S: number; E: number; C: number };
  matrix: { R: APMatrixCell; I: APMatrixCell; A: APMatrixCell; S: APMatrixCell; E: APMatrixCell; C: APMatrixCell };
  top3TotalCode: string;
}
