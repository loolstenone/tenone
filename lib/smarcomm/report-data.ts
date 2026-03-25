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

// ── 리포트 템플릿 시스템 (아드리엘 패턴 + 퍼널 분석) ──
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'funnel' | 'industry' | 'role' | 'channel' | 'analysis' | 'kr-channel';
  tags: string[]; // 직급별/직종별/업종별/기능별 다중 태그
  dataSources: string[];
  chartIds: string[];
  isNew?: boolean;
  isRecommended?: boolean;
}

export const TAG_GROUPS = {
  직급별: ['실무자', '경영진', '관리자'],
  직종별: ['전문가', '대행사'],
  업종별: ['이커머스', '소규모 비즈니스', 'B2B SaaS', '로컬', '앱'],
  기능별: ['광고', '분석', '검색', '소셜', 'SEO', 'CRM', 'GEO'],
};

export const REPORT_TEMPLATES: ReportTemplate[] = [
  // ── 퍼널 분석 퍼널 뷰 (6개) ──
  { id: 'ft1', name: 'Full Funnel Overview', description: 'Awareness→Advocacy 6단계 전체 퍼널 성과를 한눈에', category: 'funnel', tags: ['실무자', '전문가', '분석'], dataSources: ['GA4', 'Google Ads', 'Meta'], chartIds: ['c1', 'c2', 'c8', 'c9', 'c10', 'c12'], isRecommended: true },
  { id: 'ft2', name: 'Awareness 집중 분석', description: '노출, 도달, CPM — 인지 단계 심층 분석', category: 'funnel', tags: ['실무자', '광고'], dataSources: ['Google Ads', 'Meta'], chartIds: ['c1', 'c2', 'c7'] },
  { id: 'ft3', name: 'Interest → Consideration 전환', description: '클릭→체류→이탈 — 관심에서 고려로 넘어가는 구간 분석', category: 'funnel', tags: ['실무자', '전문가', '분석'], dataSources: ['GA4'], chartIds: ['c3', 'c8', 'c15'] },
  { id: 'ft4', name: 'Purchase 전환 최적화', description: '전환율, CPA, ROAS — 구매 단계 집중 분석', category: 'funnel', tags: ['실무자', '전문가', '광고'], dataSources: ['Google Ads', 'Meta', '네이버SA'], chartIds: ['c4', 'c10', 'c19'] },
  { id: 'ft5', name: 'Retention & Advocacy', description: '재방문, 재구매, NPS, 리뷰 — 유지와 추천 분석', category: 'funnel', tags: ['실무자', 'CRM'], dataSources: ['GA4', 'CRM'], chartIds: ['c12', 'c13', 'c14'] },
  { id: 'ft6', name: 'Funnel 기간 비교', description: '이번 달 vs 지난 달 퍼널 성과 오버레이 비교', category: 'funnel', tags: ['경영진', '분석'], dataSources: ['GA4', 'Google Ads', 'Meta'], chartIds: ['c8', 'c9', 'c10', 'c4'] },

  // ── 업종별 퍼널 분석 (4개) ──
  { id: 'it1', name: 'E-Commerce 퍼널 분석', description: '상품 조회→장바구니→결제→재구매까지 이커머스 퍼널', category: 'industry', tags: ['이커머스', '전문가', '광고'], dataSources: ['GA4', 'Google Ads', 'Meta'], chartIds: ['c1', 'c4', 'c10', 'c13', 'c19'] },
  { id: 'it2', name: 'B2B SaaS 퍼널 분석', description: '트래픽→트라이얼→활성화→유료전환→확장까지 SaaS 퍼널', category: 'industry', tags: ['B2B SaaS', '전문가', '분석'], dataSources: ['GA4', 'Google Ads'], chartIds: ['c1', 'c8', 'c9', 'c12', 'c17'] },
  { id: 'it3', name: '로컬 비즈니스 퍼널 분석', description: '검색→방문→예약→재방문→리뷰까지 오프라인 비즈니스 퍼널', category: 'industry', tags: ['로컬', '소규모 비즈니스', 'SEO'], dataSources: ['GA4', '네이버SA', 'GSC'], chartIds: ['c2', 'c5', 'c7', 'c14'] },
  { id: 'it4', name: '앱 서비스 퍼널 분석', description: '설치→온보딩→핵심 행동→구독→리텐션까지 앱 퍼널', category: 'industry', tags: ['앱', '전문가', '분석'], dataSources: ['GA4'], chartIds: ['c1', 'c15', 'c12', 'c13'] },

  // ── 역할별 대시보드 (5개) ──
  { id: 'rt1', name: '다채널 성과 파악 대시보드', description: '여러 플랫폼 광고 데이터를 한 곳에서 관리', category: 'role', tags: ['실무자', '광고'], dataSources: ['Google Ads', 'Meta', '네이버SA', '카카오'], chartIds: ['c1', 'c2', 'c3', 'c4', 'c18', 'c19'], isRecommended: true },
  { id: 'rt2', name: '경영진 성과 보고 대시보드', description: '광고 성과와 현황을 빠르게 확인하고 의사결정', category: 'role', tags: ['경영진', '광고'], dataSources: ['Google Ads', 'Meta', '네이버SA'], chartIds: ['c4', 'c10', 'c19'] },
  { id: 'rt3', name: '대행사 리포팅 대시보드', description: '클라이언트별 보고서를 몇 분 만에 생성', category: 'role', tags: ['대행사', '전문가', '광고'], dataSources: ['Google Ads', 'Meta', '네이버SA'], chartIds: ['c1', 'c2', 'c4', 'c19', 'c17'] },
  { id: 'rt4', name: '다채널 크리에이티브 대시보드', description: '광고 소재별 성과와 A/B 테스트 효율 비교', category: 'role', tags: ['전문가', '광고'], dataSources: ['Google Ads', 'Meta'], chartIds: ['c18', 'c4', 'c2'] },
  { id: 'rt5', name: '팀 KPI 측정 대시보드', description: '팀 전체의 마케팅 KPI를 한눈에 추적', category: 'role', tags: ['대행사', '실무자', '관리자'], dataSources: ['Google Ads', 'Meta', 'GA4'], chartIds: ['c1', 'c4', 'c10', 'c19'] },

  // ── 채널 특화 대시보드 (6개) ──
  { id: 'ct1', name: 'Google Ads 성과 분석', description: '캠페인, 키워드, 소재별 전환 분석', category: 'channel', tags: ['전문가', '검색', '광고'], dataSources: ['Google Ads'], chartIds: ['c2', 'c4', 'c18', 'c19'] },
  { id: 'ct2', name: 'Meta (FB/IG) 광고 분석', description: 'Facebook + Instagram 광고 통합 성과', category: 'channel', tags: ['전문가', '소셜', '광고'], dataSources: ['Meta'], chartIds: ['c2', 'c4', 'c18', 'c19'] },
  { id: 'ct3', name: 'GA4 데이터 트래킹', description: '드래그앤드롭 위젯으로 GA4 대시보드 구성', category: 'channel', tags: ['전문가', '분석'], dataSources: ['GA4'], chartIds: ['c1', 'c3', 'c15', 'c16'] },
  { id: 'ct4', name: 'GA4 + Meta 통합 분석', description: 'GA4와 메타 데이터를 나란히 비교', category: 'channel', tags: ['전문가', '분석'], dataSources: ['GA4', 'Meta'], chartIds: ['c1', 'c2', 'c4', 'c12'] },
  { id: 'ct5', name: 'Google Search Console', description: 'SEO 데이터를 인사이트로 변환', category: 'channel', tags: ['전문가', 'SEO'], dataSources: ['GSC'], chartIds: ['c5', 'c7'] },
  { id: 'ct6', name: '올채널 통합 리포트', description: '모든 채널의 데이터를 하나의 리포트에서', category: 'channel', tags: ['실무자', '경영진', '광고'], dataSources: ['Google Ads', 'Meta', '네이버SA', '카카오', 'GA4'], chartIds: ['c1', 'c2', 'c3', 'c4', 'c8', 'c10', 'c12', 'c19'], isRecommended: true },

  // ── 한국 매체 특화 (SmarComm 차별화 — 아드리엘보다 강화) ──
  { id: 'kr1', name: '네이버 검색광고 대시보드', description: '네이버 SA 캠페인/키워드/품질지수 실시간 모니터링', category: 'kr-channel', tags: ['전문가', '검색', '광고'], dataSources: ['네이버SA'], chartIds: ['c2', 'c4', 'c7', 'c19'], isNew: true },
  { id: 'kr2', name: '네이버 GFA + 쇼핑 통합', description: '네이버 성과형 디스플레이(GFA) + 쇼핑 검색 통합 성과', category: 'kr-channel', tags: ['이커머스', '전문가', '광고'], dataSources: ['네이버SA', '네이버GFA'], chartIds: ['c2', 'c4', 'c18', 'c19'], isNew: true },
  { id: 'kr3', name: '카카오 모먼트 대시보드', description: '카카오 키워드/디스플레이 광고 성과 분석', category: 'kr-channel', tags: ['전문가', '광고'], dataSources: ['카카오'], chartIds: ['c2', 'c4', 'c19'], isNew: true },
  { id: 'kr4', name: '카카오 비즈메시지 성과', description: '알림톡/친구톡 발송 성과 + CRM 연계 분석', category: 'kr-channel', tags: ['실무자', 'CRM'], dataSources: ['카카오'], chartIds: ['c17'], isNew: true },
  { id: 'kr5', name: '네이버 + 카카오 통합 대시보드', description: '네이버 SA + 카카오 모먼트 한국 매체 통합', category: 'kr-channel', tags: ['실무자', '광고'], dataSources: ['네이버SA', '카카오'], chartIds: ['c2', 'c4', 'c19'], isNew: true },
  { id: 'kr6', name: '한국 올채널 통합 (네이버+카카오+구글+메타)', description: '국내 4대 매체 통합 퍼널 분석 리포트', category: 'kr-channel', tags: ['경영진', '관리자', '광고'], dataSources: ['네이버SA', '카카오', 'Google Ads', 'Meta'], chartIds: ['c1', 'c2', 'c4', 'c8', 'c10', 'c19'], isNew: true, isRecommended: true },

  // ── 분석/전략 심화 (4개) ──
  { id: 'an1', name: '마케팅 비용 분석 대시보드', description: '채널별 광고비, ROI, 예산 효율 분석', category: 'analysis', tags: ['실무자', '광고'], dataSources: ['Google Ads', 'Meta', '네이버SA'], chartIds: ['c19', 'c4', 'c10'] },
  { id: 'an2', name: '이커머스 매출 관리 대시보드', description: '매출 성과 모니터링, 전환 지표 추적', category: 'analysis', tags: ['이커머스', '전문가', '광고'], dataSources: ['GA4', 'Google Ads', 'Meta'], chartIds: ['c4', 'c10', 'c13', 'c19'] },
  { id: 'an3', name: 'CRM 캠페인 성과 분석', description: '푸시/이메일/카카오 캠페인 통합 성과 분석', category: 'analysis', tags: ['실무자', 'CRM'], dataSources: ['CRM'], chartIds: ['c17'], isNew: true },
  { id: 'an4', name: 'AI 가시성 분석 대시보드', description: 'ChatGPT/Perplexity/Gemini에서 브랜드 멘션 추적', category: 'analysis', tags: ['전문가', 'GEO'], dataSources: ['AI API'], chartIds: ['c5', 'c7'], isNew: true },
];

export const TEMPLATE_CATEGORIES = [
  { key: 'funnel', label: '퍼널 뷰', count: 6 },
  { key: 'industry', label: '업종별', count: 4 },
  { key: 'role', label: '역할별', count: 5 },
  { key: 'channel', label: '글로벌 채널', count: 6 },
  { key: 'kr-channel', label: '한국 매체', count: 6 },
  { key: 'analysis', label: '분석/전략', count: 4 },
];

export const SAVED_REPORTS: Report[] = [
  { id: 'sr1', name: '진단 / GEO·SEO 관련', description: 'SmarComm. Index 진단 관련 차트 모음', category: '진단', charts: [], starred: true, createdAt: '2026-03-01', updatedAt: '2026-03-21' },
  { id: 'sr2', name: '마케팅 / 캠페인 관련', description: '채널별 캠페인 성과 차트 모음', category: '마케팅', charts: [], starred: true, createdAt: '2026-03-05', updatedAt: '2026-03-20' },
  { id: 'sr3', name: '비즈니스 / 매출 관련', description: '매출, ROAS, CPA 등 비즈니스 지표 차트', category: '비즈니스', charts: [], starred: true, createdAt: '2026-03-08', updatedAt: '2026-03-19' },
  { id: 'sr4', name: 'KPI / 목표 관련', description: '전사 KPI 모니터링용 차트', category: 'KPI', charts: [], starred: true, createdAt: '2026-03-10', updatedAt: '2026-03-18' },
  { id: 'sr5', name: 'CRM / 고객 관계', description: 'CRM 캠페인 성과와 고객 분석', category: 'CRM', charts: [], starred: true, createdAt: '2026-03-12', updatedAt: '2026-03-17' },
];
