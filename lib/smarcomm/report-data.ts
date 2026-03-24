// SmarComm 데이터 리포트 시스템

export interface ReportChart {
  id: string;
  type: 'insight' | 'funnel' | 'retention' | 'userpath';
  title: string;
  period: string;
  description?: string;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  charts: ReportChart[];
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CHART_TYPE_MAP = {
  insight: { label: '인사이트', color: '#059669', bg: '#ECFDF5' },
  funnel: { label: '퍼널', color: '#DC2626', bg: '#FEF2F2' },
  retention: { label: '리텐션', color: '#7C3AED', bg: '#F5F3FF' },
  userpath: { label: '유저 패스', color: '#D97706', bg: '#FFFBEB' },
};

export const AVAILABLE_CHARTS: ReportChart[] = [
  { id: 'c1', type: 'insight', title: '신규 방문 사용자 추이', period: '일별, 최근 7일' },
  { id: 'c2', type: 'insight', title: '마케팅 채널별 유입', period: '일별, 최근 7일' },
  { id: 'c3', type: 'insight', title: '평균 체류 시간', period: '일별, 최근 7일' },
  { id: 'c4', type: 'insight', title: '전환율', period: '일별, 최근 7일' },
  { id: 'c5', type: 'insight', title: 'SmarComm. Index 점수 분포', period: '최근 30일' },
  { id: 'c6', type: 'insight', title: '업종별 진단 비율', period: '최근 30일' },
  { id: 'c7', type: 'insight', title: '일별 진단 요청 수', period: '일별, 최근 30일' },
  { id: 'c8', type: 'funnel', title: '방문→진단 전환율', period: '최근 7일' },
  { id: 'c9', type: 'funnel', title: '진단→가입 전환율', period: '최근 7일' },
  { id: 'c10', type: 'funnel', title: '가입→유료 전환율', period: '최근 30일' },
  { id: 'c11', type: 'funnel', title: '랜딩 페이지 퍼널 분석', period: '최근 3일' },
  { id: 'c12', type: 'retention', title: '가입 후 재방문율', period: '일별, 최근 7일' },
  { id: 'c13', type: 'retention', title: '유료 전환 후 리텐션', period: '주별, 최근 4주' },
  { id: 'c14', type: 'retention', title: '리포트 열람 리텐션', period: '일별, 최근 7일' },
  { id: 'c15', type: 'userpath', title: '주요 이벤트까지 유저 흐름', period: '최근 3일' },
  { id: 'c16', type: 'userpath', title: '이탈 전 사용자 행동 경로', period: '최근 7일' },
  { id: 'c17', type: 'insight', title: 'CRM 캠페인 성과 분석', period: '최근 30일' },
  { id: 'c18', type: 'insight', title: '소재별 클릭율 비교', period: '최근 7일' },
  { id: 'c19', type: 'insight', title: '광고비 vs 매출 추이', period: '주별, 최근 8주' },
  { id: 'c20', type: 'funnel', title: '소재 체험→유료 전환', period: '최근 30일' },
];

export const INSIGHT_REPORTS: Report[] = [
  {
    id: 'ir1', name: 'SmarComm. Growth Report', description: '신규 사용자 유입부터 유료 전환까지 전반적인 성장 상태를 진단합니다.',
    category: '분석', charts: [
      { id: 'c1', type: 'insight', title: '신규 방문 사용자 추이', period: '일별, 최근 7일' },
      { id: 'c7', type: 'insight', title: '일별 진단 요청 수', period: '일별, 최근 30일' },
      { id: 'c8', type: 'funnel', title: '방문→진단 전환율', period: '최근 7일' },
      { id: 'c12', type: 'retention', title: '가입 후 재방문율', period: '일별, 최근 7일' },
    ],
    starred: false, createdAt: '2026-03-15', updatedAt: '2026-03-21',
  },
  {
    id: 'ir2', name: 'SmarComm. Index 인사이트', description: '진단 데이터를 분석하여 어떤 경로를 거치는지, 어디서 이탈하는지 한눈에 확인합니다.',
    category: '분석 템플릿', charts: [
      { id: 'c5', type: 'insight', title: 'SmarComm. Index 점수 분포', period: '최근 30일' },
      { id: 'c6', type: 'insight', title: '업종별 진단 비율', period: '최근 30일' },
      { id: 'c9', type: 'funnel', title: '진단→가입 전환율', period: '최근 7일' },
      { id: 'c15', type: 'userpath', title: '주요 이벤트까지 유저 흐름', period: '최근 3일' },
    ],
    starred: false, createdAt: '2026-03-10', updatedAt: '2026-03-20',
  },
  {
    id: 'ir3', name: 'SmarComm. CRM Report', description: 'CRM 캠페인의 성과를 분석하고, 사용자 여정을 최적화합니다.',
    category: '분석', charts: [
      { id: 'c17', type: 'insight', title: 'CRM 캠페인 성과 분석', period: '최근 30일' },
      { id: 'c13', type: 'retention', title: '유료 전환 후 리텐션', period: '주별, 최근 4주' },
      { id: 'c16', type: 'userpath', title: '이탈 전 사용자 행동 경로', period: '최근 7일' },
    ],
    starred: false, createdAt: '2026-03-12', updatedAt: '2026-03-19',
  },
];

export const SAVED_REPORTS: Report[] = [
  { id: 'sr1', name: '진단 / GEO·SEO 관련', description: 'SmarComm. Index 진단 관련 차트 모음', category: '진단', charts: [], starred: true, createdAt: '2026-03-01', updatedAt: '2026-03-21' },
  { id: 'sr2', name: '마케팅 / 캠페인 관련', description: '채널별 캠페인 성과 차트 모음', category: '마케팅', charts: [], starred: true, createdAt: '2026-03-05', updatedAt: '2026-03-20' },
  { id: 'sr3', name: '비즈니스 / 매출 관련', description: '매출, ROAS, CPA 등 비즈니스 지표 차트', category: '비즈니스', charts: [], starred: true, createdAt: '2026-03-08', updatedAt: '2026-03-19' },
  { id: 'sr4', name: 'KPI / 목표 관련', description: '전사 KPI 모니터링용 차트', category: 'KPI', charts: [], starred: true, createdAt: '2026-03-10', updatedAt: '2026-03-18' },
  { id: 'sr5', name: 'CRM / 고객 관계', description: 'CRM 캠페인 성과와 고객 분석', category: 'CRM', charts: [], starred: true, createdAt: '2026-03-12', updatedAt: '2026-03-17' },
];

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  charts: string[];
}

export const TEMPLATE_CATEGORIES = [
  { key: '진단', label: '진단', icon: '🔍' },
  { key: '마케팅', label: '마케팅', icon: '📢' },
  { key: '비즈니스', label: '비즈니스', icon: '💼' },
  { key: 'KPI', label: 'KPI', icon: '🎯' },
  { key: 'CRM', label: 'CRM', icon: '👥' },
];

export const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'rt1', name: 'GEO·SEO 진단 리포트', description: '검색 엔진 최적화 현황 종합 분석', category: '진단', charts: ['geo-score', 'seo-keywords'] },
  { id: 'rt2', name: '월간 마케팅 성과', description: '채널별 캠페인 성과 월간 리포트', category: '마케팅', charts: ['channel-performance', 'campaign-roi'] },
  { id: 'rt3', name: '매출·ROAS 분석', description: '매출 추이와 광고 수익률 분석', category: '비즈니스', charts: ['revenue-trend', 'roas'] },
  { id: 'rt4', name: 'KPI 대시보드', description: '전사 핵심 지표 모니터링', category: 'KPI', charts: ['kpi-overview', 'goal-progress'] },
  { id: 'rt5', name: 'CRM 캠페인 리포트', description: '고객 세그먼트별 캠페인 효과 분석', category: 'CRM', charts: ['crm-segments', 'engagement'] },
];
