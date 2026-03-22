// SmarComm 블로그 데이터

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: number; // 분
  published: boolean;
}

export const BLOG_CATEGORIES = ['전체', 'GEO/SEO', '광고', '그로스', '소재', 'CRM', '사례', '트렌드'];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1', slug: 'what-is-geo',
    title: 'GEO란? AI 검색 시대의 새로운 SEO',
    summary: 'ChatGPT, Perplexity, Gemini가 추천하는 브랜드가 되기 위한 GEO(Generative Engine Optimization) 전략을 소개합니다.',
    content: `AI 검색이 빠르게 성장하면서 기존 SEO만으로는 충분하지 않은 시대가 되었습니다. GEO(Generative Engine Optimization)는 AI가 생성하는 답변에서 브랜드가 인용(citation)되도록 최적화하는 새로운 전략입니다.

## GEO vs SEO의 차이

SEO는 검색 결과 페이지(SERP)에서 순위를 높이는 것이 목표입니다. 반면 GEO는 AI가 생성하는 답변에서 브랜드가 참조되는 것을 목표로 합니다.

## GEO 점수를 높이는 5가지 방법

1. **구조화 데이터 마크업**: FAQ, HowTo, Product 스키마를 추가하세요
2. **권위 있는 콘텐츠**: 통계, 인용, 전문가 인터뷰를 포함하세요
3. **E-E-A-T 강화**: 경험, 전문성, 권위성, 신뢰성을 증명하세요
4. **명확한 답변 구조**: 질문-답변 형태의 콘텐츠를 만드세요
5. **최신성 유지**: 정기적으로 콘텐츠를 업데이트하세요

SmarComm의 사이트 진단을 통해 현재 GEO 점수를 확인하고 개선 포인트를 파악해보세요.`,
    category: 'GEO/SEO', tags: ['GEO', 'AI', 'SEO'],
    author: 'SmarComm 팀', publishedAt: '2026-03-20', readTime: 5, published: true,
  },
  {
    id: 'b2', slug: 'roas-200-case-study',
    title: 'ROAS 200% 달성한 소상공인의 3개월 여정',
    summary: '네이버 SA + 인스타그램 광고를 병행하여 3개월 만에 ROAS 200%를 달성한 F&B 업체의 실전 사례입니다.',
    content: `서울 강남의 한 카페가 SmarComm을 활용하여 3개월 만에 ROAS 200%를 달성한 과정을 공유합니다.

## 시작: 사이트 진단부터

초기 GEO/SEO 진단 점수는 42점(Needs Work). 메타 디스크립션 누락, 모바일 최적화 미흡, 구조화 데이터 부재가 주요 이슈였습니다.

## 1개월차: 기초 SEO 개선

진단 결과를 바탕으로 메타태그 최적화, 이미지 alt 태그 추가, FAQ 스키마 마크업을 진행했습니다. 점수가 42점 → 65점으로 상승했습니다.

## 2개월차: 광고 집행 시작

네이버 SA 월 150만원 + 인스타그램 월 100만원으로 시작. SmarComm의 AI 소재 제작으로 카피 10종, 배너 5종을 생성하고 A/B 테스트를 진행했습니다.

## 3개월차: ROAS 200% 달성

A/B 테스트에서 승리한 소재를 집중 집행하고, 코호트 분석으로 재방문 고객에게 카카오 알림톡을 발송한 결과 ROAS 200%를 달성했습니다.`,
    category: '사례', tags: ['ROAS', '소상공인', '네이버SA'],
    author: 'SmarComm 팀', publishedAt: '2026-03-18', readTime: 7, published: true,
  },
  {
    id: 'b3', slug: 'marketing-kpi-guide',
    title: '마케터가 꼭 봐야 할 KPI 5가지',
    summary: 'CAC, LTV, ROAS, CTR, 전환율 — 마케팅 성과를 측정하기 위해 반드시 추적해야 할 핵심 지표를 설명합니다.',
    content: `마케팅 성과를 측정하지 않으면 개선할 수 없습니다. 이 글에서는 모든 마케터가 추적해야 할 5가지 핵심 KPI를 소개합니다.

## 1. CAC (Customer Acquisition Cost)

고객 한 명을 획득하는 데 드는 비용입니다. 총 마케팅 비용 ÷ 신규 고객 수로 계산합니다. 업종별 평균 CAC를 비교하여 효율성을 판단하세요.

## 2. LTV (Customer Lifetime Value)

고객 한 명이 생애 동안 제공하는 총 매출입니다. LTV:CAC 비율이 3:1 이상이면 건강한 상태입니다.

## 3. ROAS (Return on Ad Spend)

광고비 대비 매출입니다. ROAS 200%는 광고비 100만원으로 200만원 매출을 올렸다는 뜻입니다.

## 4. CTR (Click-Through Rate)

광고 노출 대비 클릭 비율입니다. 검색 광고 평균 CTR은 3~5%, 디스플레이 광고는 0.5~1%입니다.

## 5. 전환율 (Conversion Rate)

방문자 중 목표 행동(구매, 가입)을 완료한 비율입니다. 이커머스 평균 전환율은 2~3%입니다.

SmarComm의 매출 분석과 캠페인 보고서에서 이 지표들을 한눈에 확인할 수 있습니다.`,
    category: '그로스', tags: ['KPI', 'CAC', 'LTV', 'ROAS'],
    author: 'SmarComm 팀', publishedAt: '2026-03-15', readTime: 6, published: true,
  },
  {
    id: 'b4', slug: 'ad-copy-formulas',
    title: '클릭률 높은 광고 카피 작성법 5가지 공식',
    summary: '데이터로 검증된 광고 카피 공식 5가지를 예시와 함께 소개합니다. 네이버 SA, 메타 광고에 바로 적용해보세요.',
    content: `좋은 광고 카피는 클릭률(CTR)을 2~3배 높일 수 있습니다. 데이터로 검증된 5가지 공식을 소개합니다.

## 공식 1: 숫자 활용

"매출 300% 성장한 비결" — 구체적인 숫자는 신뢰감을 줍니다.

## 공식 2: 긴급성 부여

"오늘만 50% 할인" — FOMO(놓칠 두려움)를 자극합니다.

## 공식 3: 혜택 강조

"무료 진단으로 점수 확인" — 사용자가 얻는 가치를 명확히 합니다.

## 공식 4: 질문형 오프닝

"당신의 사이트, AI가 추천할까요?" — 궁금증을 유발합니다.

## 공식 5: 사회적 증거

"1,000개 기업이 선택한" — 다른 사람들의 선택을 보여줍니다.

SmarComm의 AI 소재 제작에서 이 공식들을 자동으로 적용한 카피를 생성해보세요.`,
    category: '소재', tags: ['카피라이팅', 'CTR', '광고'],
    author: 'SmarComm 팀', publishedAt: '2026-03-12', readTime: 4, published: true,
  },
  {
    id: 'b5', slug: 'conversion-optimization-3steps',
    title: '전환율 10배 높이기 — 3단계 프레임워크',
    summary: '퍼널 병목 찾기 → A/B 테스트 → 자동화 확장. 전환율 최적화의 실전 프레임워크를 단계별로 안내합니다.',
    content: `전환율 최적화(CRO)는 마케팅의 가장 효율적인 성장 레버입니다. 트래픽을 늘리지 않고도 매출을 2~3배 높일 수 있습니다.

## 1단계: 퍼널 병목 찾기

SmarComm 퍼널 분석에서 각 단계의 이탈률을 확인합니다. 이탈이 가장 많은 구간이 최우선 개선 대상입니다.

## 2단계: A/B 테스트로 검증

가설을 세우고 A/B 테스트로 검증합니다. 한 번에 하나의 변수만 바꿔야 원인을 정확히 파악할 수 있습니다.

## 3단계: 자동화로 확장

검증된 개선 사항을 자동화합니다. 이탈 사용자에게 자동 리마인더, 장바구니 이탈 시 카카오 알림톡 등을 설정하세요.

이 3단계를 반복하면 전환율이 지속적으로 개선됩니다. SmarComm의 퍼널 분석 → A/B 테스트 → 자동화를 활용해보세요.`,
    category: '그로스', tags: ['CRO', '전환율', 'A/B테스트'],
    author: 'SmarComm 팀', publishedAt: '2026-03-10', readTime: 5, published: true,
  },
  {
    id: 'b6', slug: 'ai-marketing-trends-2026',
    title: '2026 AI 마케팅 트렌드 — 지금 준비해야 할 5가지',
    summary: 'GEO, AI 소재 자동 생성, 예측 분석, 초개인화, 음성 검색 — 2026년 마케팅을 바꿀 AI 트렌드를 전망합니다.',
    content: `2026년 마케팅은 AI를 얼마나 잘 활용하느냐에 따라 성과가 갈릴 것입니다. 지금 준비해야 할 5가지 트렌드를 소개합니다.

## 1. GEO (Generative Engine Optimization)

AI 검색(ChatGPT, Perplexity)에서 브랜드가 추천되도록 최적화하는 전략이 필수가 됩니다.

## 2. AI 소재 자동 생성

광고 카피, 배너, 영상을 AI가 자동 생성하고 A/B 테스트로 최적화합니다.

## 3. 예측 분석

고객의 이탈, 구매, 업셀링을 AI가 예측하여 선제적 마케팅을 가능하게 합니다.

## 4. 초개인화 (Hyper-Personalization)

고객 개인의 행동 데이터에 기반한 1:1 맞춤 메시지가 표준이 됩니다.

## 5. 음성 검색 + 멀티모달

음성, 이미지, 텍스트를 넘나드는 멀티모달 검색에 대응해야 합니다.

SmarComm은 이 트렌드를 서비스에 반영하여 GEO 진단, AI 소재 제작, 코호트 기반 개인화를 지원합니다.`,
    category: '트렌드', tags: ['AI', 'GEO', '2026'],
    author: 'SmarComm 팀', publishedAt: '2026-03-08', readTime: 6, published: true,
  },
  // ── 추가 20개 글 ──
  {
    id: 'b7', slug: 'naver-sa-keyword-strategy',
    title: '네이버 검색광고 키워드 전략 — 소상공인 실전 가이드',
    summary: '월 50만원 예산으로 시작하는 네이버 SA 키워드 선정, 입찰가 설정, 품질지수 관리 방법.',
    content: `네이버 검색광고는 소상공인에게 가장 효과적인 광고 채널 중 하나입니다.\n\n## 키워드 선정 3원칙\n\n1. **구매 의도 키워드 우선**: "강남 카페 추천"보다 "강남 브런치 예약"이 전환율이 높습니다.\n2. **롱테일 키워드 활용**: 경쟁이 낮고 전환율이 높은 3~4단어 키워드를 찾으세요.\n3. **제외 키워드 설정**: 무관한 검색어를 차단하여 광고비 낭비를 줄입니다.\n\n## 품질지수 높이기\n\n광고 카피와 랜딩 페이지의 키워드 일치도를 높이면 품질지수가 올라가고, 같은 비용으로 더 높은 순위에 노출됩니다.`,
    category: '광고', tags: ['네이버SA', '키워드', '소상공인'],
    author: 'SmarComm 팀', publishedAt: '2026-03-06', readTime: 6, published: true,
  },
  {
    id: 'b8', slug: 'instagram-reels-marketing',
    title: '인스타그램 릴스 마케팅 — 조회수 10만 달성 전략',
    summary: '릴스 알고리즘의 핵심 요소와 바이럴을 만드는 콘텐츠 제작 노하우를 공개합니다.',
    content: `인스타그램 릴스는 현재 가장 도달률이 높은 콘텐츠 포맷입니다.\n\n## 릴스 알고리즘 핵심 요소\n\n1. **처음 3초의 훅**: 시청자의 주의를 잡는 오프닝이 핵심입니다.\n2. **완주율(Watch-Through Rate)**: 끝까지 보는 비율이 높을수록 더 많이 노출됩니다.\n3. **공유와 저장**: 좋아요보다 공유와 저장이 알고리즘에 더 큰 영향을 줍니다.\n\n## 바이럴 릴스 공식\n\n문제 제기(3초) → 해결책 제시(10초) → CTA(2초)의 15초 구조가 가장 효과적입니다.`,
    category: '소재', tags: ['인스타그램', '릴스', 'SNS'],
    author: 'SmarComm 팀', publishedAt: '2026-03-05', readTime: 5, published: true,
  },
  {
    id: 'b9', slug: 'email-open-rate-optimization',
    title: '이메일 오픈율 40% 만드는 제목 작성법',
    summary: '업계 평균 20%를 넘어 오픈율 40%를 달성하는 이메일 제목 작성 공식과 실전 사례.',
    content: `이메일 마케팅에서 제목은 오픈율을 결정하는 가장 중요한 요소입니다.\n\n## 오픈율 높은 제목 패턴 5가지\n\n1. **개인화**: "[이름]님, 점수가 변했습니다" — 개인화 제목은 오픈율 26% 상승\n2. **숫자 활용**: "3가지 방법으로 매출 2배" — 구체적 숫자가 신뢰감을 줍니다\n3. **긴급성**: "오늘까지만 — 무료 진단 리포트" — FOMO 심리 활용\n4. **질문형**: "경쟁사는 이미 하고 있는데, 당신은?" — 궁금증 유발\n5. **이모지**: 적절한 이모지 사용은 오픈율 10% 상승 (과용 주의)`,
    category: 'CRM', tags: ['이메일', '오픈율', '자동화'],
    author: 'SmarComm 팀', publishedAt: '2026-03-04', readTime: 4, published: true,
  },
  {
    id: 'b10', slug: 'google-ads-smart-bidding',
    title: 'Google Ads 스마트 입찰 완전 정복',
    summary: '타겟 CPA, 타겟 ROAS, 전환 극대화 — 자동 입찰 전략별 특징과 선택 기준을 안내합니다.',
    content: `Google의 스마트 입찰은 머신러닝으로 실시간 입찰가를 최적화합니다.\n\n## 전략별 특징\n\n1. **타겟 CPA**: 전환당 비용을 설정, 전환 데이터 30건 이상일 때 효과적\n2. **타겟 ROAS**: 광고비 대비 수익률 목표 설정, 이커머스에 적합\n3. **전환 극대화**: 예산 내 최대 전환 추구, 초기 캠페인에 적합\n4. **클릭 극대화**: 트래픽 확보가 목표일 때, 인지도 캠페인에 사용\n\n## 선택 가이드\n\n월 광고비 100만원 이하 → 클릭 극대화부터 시작\n전환 데이터 30건 이상 → 타겟 CPA 전환\n이커머스 매출 추적 가능 → 타겟 ROAS 적용`,
    category: '광고', tags: ['Google', '스마트입찰', 'CPA'],
    author: 'SmarComm 팀', publishedAt: '2026-03-03', readTime: 7, published: true,
  },
  {
    id: 'b11', slug: 'landing-page-ux-checklist',
    title: '랜딩 페이지 UX 체크리스트 15가지',
    summary: '전환율을 높이는 랜딩 페이지의 필수 요소 15가지를 체크리스트로 정리했습니다.',
    content: `좋은 랜딩 페이지는 방문자를 고객으로 전환합니다.\n\n## 필수 체크리스트\n\n1. 명확한 헤드라인 (3초 안에 가치 전달)\n2. 단일 CTA (하나의 행동만 유도)\n3. 사회적 증거 (리뷰, 로고, 숫자)\n4. 모바일 최적화 (60% 이상이 모바일)\n5. 로딩 속도 3초 이내\n6. 폼 필드 최소화 (3개 이하)\n7. 혜택 중심 카피 (기능 X → 혜택 O)\n8. 히어로 이미지/영상\n9. 스크롤 없이 CTA 보임\n10. 신뢰 배지/인증 표시`,
    category: '그로스', tags: ['랜딩페이지', 'UX', 'CRO'],
    author: 'SmarComm 팀', publishedAt: '2026-03-02', readTime: 5, published: true,
  },
  {
    id: 'b12', slug: 'kakao-alimtalk-guide',
    title: '카카오 알림톡 마케팅 — 시작부터 성과까지',
    summary: '비즈채널 개설부터 템플릿 심사, 세그먼트 타겟 발송까지 카카오 알림톡 A to Z.',
    content: `카카오 알림톡은 국내 마케팅에서 가장 높은 도달률(98%)을 자랑합니다.\n\n## 알림톡 vs 친구톡\n\n- 알림톡: 정보성 메시지 (건당 ~8원), 템플릿 심사 필요\n- 친구톡: 광고성 메시지 (건당 ~15원), 채널 추가 사용자만\n\n## 효과적인 알림톡 시나리오\n\n1. 가입 환영 메시지 (가입 즉시)\n2. 진단 완료 알림 (진단 후 1시간)\n3. 재방문 유도 (7일 미방문)\n4. 프로모션 안내 (시즌 이벤트)\n\n## 성과 측정\n\n발송률, 수신률, 클릭률을 추적하고 A/B 테스트로 메시지를 최적화하세요.`,
    category: 'CRM', tags: ['카카오', '알림톡', 'CRM'],
    author: 'SmarComm 팀', publishedAt: '2026-03-01', readTime: 6, published: true,
  },
  {
    id: 'b13', slug: 'schema-markup-seo',
    title: '구조화 데이터(Schema Markup)로 SEO 순위 올리기',
    summary: 'FAQ, HowTo, Product 스키마를 추가하여 리치 스니펫을 획득하고 검색 순위를 높이는 방법.',
    content: `구조화 데이터는 검색 엔진이 콘텐츠를 더 잘 이해하도록 돕는 마크업입니다.\n\n## 꼭 추가해야 할 스키마 3가지\n\n1. **FAQ 스키마**: 자주 묻는 질문을 마크업하면 검색 결과에 FAQ가 펼쳐집니다\n2. **HowTo 스키마**: 단계별 가이드를 마크업하면 풍부한 스니펫이 표시됩니다\n3. **Product 스키마**: 가격, 리뷰, 재고 정보가 검색 결과에 표시됩니다\n\n## GEO에 미치는 영향\n\n구조화 데이터가 있는 사이트는 AI 검색에서 인용될 확률이 40% 높습니다. SmarComm 진단에서 스키마 마크업 여부를 자동으로 검사합니다.`,
    category: 'GEO/SEO', tags: ['스키마', 'SEO', '리치스니펫'],
    author: 'SmarComm 팀', publishedAt: '2026-02-28', readTime: 5, published: true,
  },
  {
    id: 'b14', slug: 'meta-ads-creative-best-practices',
    title: 'Meta 광고 소재 — 성과가 좋은 크리에이티브의 공통점',
    summary: 'Facebook과 Instagram에서 CTR 3% 이상을 기록한 광고 소재들의 공통 패턴을 분석합니다.',
    content: `Meta 광고에서 소재는 성과의 70%를 결정합니다.\n\n## 고성과 소재의 5가지 공통점\n\n1. **UGC 스타일**: 광고처럼 보이지 않는 자연스러운 영상이 CTR 2배\n2. **텍스트 오버레이**: 음소거 시청이 85%이므로 자막/텍스트 필수\n3. **처음 1초**: 강렬한 비주얼로 스크롤 멈추기\n4. **명확한 CTA**: "지금 무료 진단" 같은 구체적 행동 유도\n5. **3:4 비율**: 모바일에서 가장 큰 면적을 차지하는 비율\n\n## A/B 테스트 팁\n\n한 번에 하나의 변수만 테스트하세요. 카피 vs 카피, 이미지 vs 이미지, CTA vs CTA.`,
    category: '소재', tags: ['Meta', '크리에이티브', 'CTR'],
    author: 'SmarComm 팀', publishedAt: '2026-02-26', readTime: 5, published: true,
  },
  {
    id: 'b15', slug: 'cohort-analysis-retention',
    title: '코호트 분석 실전 — 리텐션을 높이는 데이터 활용법',
    summary: '가입 시기별 사용자 그룹의 리텐션을 분석하고 이탈을 줄이는 실전 방법론.',
    content: `코호트 분석은 사용자의 장기적 행동 패턴을 이해하는 가장 강력한 분석 도구입니다.\n\n## 코호트 분석 3단계\n\n1. **히트맵 읽기**: D0(가입일) 대비 D7, D14, D30 리텐션 확인\n2. **이상치 발견**: 특정 코호트의 리텐션이 유독 높거나 낮은 원인 분석\n3. **액션 도출**: 리텐션이 급락하는 시점에 개입 (푸시, 이메일)\n\n## 실전 팁\n\n- D1 리텐션 70% 이상 → 온보딩 양호\n- D7 리텐션 30% 이하 → 핵심 가치 전달 실패\n- D30 리텐션 10% 이하 → 서비스 개선 시급`,
    category: '그로스', tags: ['코호트', '리텐션', '분석'],
    author: 'SmarComm 팀', publishedAt: '2026-02-24', readTime: 6, published: true,
  },
  {
    id: 'b16', slug: 'competitor-seo-analysis',
    title: '경쟁사 SEO 분석 방법 — 5단계 실전 프레임워크',
    summary: '경쟁사 사이트를 분석하여 우리 사이트의 SEO 개선 기회를 발견하는 체계적인 방법.',
    content: `경쟁사 분석은 SEO 전략 수립의 시작입니다.\n\n## 5단계 프레임워크\n\n1. **점수 비교**: SmarComm으로 경쟁사 사이트를 진단하여 GEO/SEO 점수를 비교합니다\n2. **키워드 갭 분석**: 경쟁사가 상위 랭킹하지만 우리는 없는 키워드를 찾습니다\n3. **콘텐츠 갭 분석**: 경쟁사가 다루지만 우리가 없는 콘텐츠 주제를 식별합니다\n4. **백링크 분석**: 경쟁사의 백링크 소스를 파악하여 우리도 확보합니다\n5. **기술 SEO 비교**: 페이지 속도, 모바일 최적화, 구조화 데이터를 비교합니다`,
    category: 'GEO/SEO', tags: ['경쟁사', 'SEO', '분석'],
    author: 'SmarComm 팀', publishedAt: '2026-02-22', readTime: 7, published: true,
  },
  {
    id: 'b17', slug: 'push-notification-best-practices',
    title: '푸시 알림 성과를 높이는 7가지 베스트 프랙티스',
    summary: '수신 동의율, 클릭률을 높이는 푸시 알림 전략과 타이밍, 메시지 작성법.',
    content: `웹/앱 푸시 알림은 무료이면서 즉시성이 높은 마케팅 채널입니다.\n\n## 7가지 베스트 프랙티스\n\n1. **수신 동의 타이밍**: 첫 방문이 아닌 2~3번째 방문에 요청 (수락률 2배)\n2. **제목 20자 이내**: 짧을수록 클릭률이 높습니다\n3. **개인화**: 이름, 최근 행동을 반영한 메시지\n4. **시간대**: 오전 10~11시, 오후 7~9시가 클릭률 최고\n5. **빈도 제한**: 일 1회, 주 3회 이하\n6. **딥링크**: 홈이 아닌 관련 페이지로 바로 이동\n7. **A/B 테스트**: 제목, 시간대, 이미지를 테스트`,
    category: 'CRM', tags: ['푸시', '알림', '클릭률'],
    author: 'SmarComm 팀', publishedAt: '2026-02-20', readTime: 4, published: true,
  },
  {
    id: 'b18', slug: 'marketing-automation-scenarios',
    title: '마케팅 자동화 시나리오 10선 — 바로 적용 가능',
    summary: '가입부터 재구매까지, 마케터가 바로 설정할 수 있는 자동화 시나리오 10가지.',
    content: `자동화는 적은 리소스로 지속적인 마케팅을 가능하게 합니다.\n\n## 바로 설정 가능한 10가지 시나리오\n\n1. 회원가입 환영 이메일 (즉시)\n2. 진단 완료 후 심화 리포트 안내 (1시간 후)\n3. 장바구니 이탈 리마인더 (3시간 후)\n4. 7일 미방문 재방문 유도 (D+7)\n5. 14일 미방문 인센티브 제공 (D+14)\n6. 생일 축하 메시지 (생일 당일)\n7. 유료 전환 감사 메일 (결제 즉시)\n8. 월간 활동 리포트 (매월 1일)\n9. 리뷰 요청 (서비스 이용 7일 후)\n10. 업셀링 제안 (특정 기능 3회 사용 시)`,
    category: 'CRM', tags: ['자동화', '시나리오', '이메일'],
    author: 'SmarComm 팀', publishedAt: '2026-02-18', readTime: 6, published: true,
  },
  {
    id: 'b19', slug: 'youtube-ads-format-guide',
    title: '유튜브 광고 포맷 가이드 — 어떤 것을 선택해야 할까?',
    summary: '프리롤, 범퍼, 인피드, 쇼츠 광고 — 목적에 맞는 유튜브 광고 포맷 선택법.',
    content: `유튜브는 국내 사용자 4,600만명의 최대 영상 플랫폼입니다.\n\n## 광고 포맷별 특징\n\n1. **프리롤 (TrueView In-Stream)**: 5초 후 스킵 가능, 브랜드 인지도에 효과적\n2. **범퍼 광고 (6초)**: 스킵 불가, 짧은 메시지 전달에 최적\n3. **인피드 광고**: 검색/추천에 노출, 관심사 타겟팅에 효과적\n4. **쇼츠 광고**: 세로형 숏폼, MZ세대 타겟에 효과적\n\n## 예산별 추천\n\n- 월 50만원 이하: 범퍼 + 인피드 조합\n- 월 100~300만원: 프리롤 + 인피드\n- 월 300만원 이상: 프리롤 + 범퍼 + 쇼츠 풀 퍼널`,
    category: '광고', tags: ['유튜브', '영상', '광고포맷'],
    author: 'SmarComm 팀', publishedAt: '2026-02-16', readTime: 5, published: true,
  },
  {
    id: 'b20', slug: 'data-driven-marketing-beginner',
    title: '데이터 기반 마케팅 입문 — 숫자를 읽는 마케터 되기',
    summary: '감이 아닌 데이터로 마케팅 의사결정을 하기 위한 입문자용 가이드.',
    content: `데이터 기반 마케팅은 감이 아닌 숫자로 의사결정하는 것입니다.\n\n## 시작하기\n\n1. **측정 가능한 목표 설정**: "매출 늘리기" X → "3월 ROAS 200% 달성" O\n2. **핵심 지표 정의**: 모든 것을 추적하지 말고, 북극성 지표 1개를 정하세요\n3. **데이터 수집 환경 구축**: 추적 코드 설치 → 이벤트 정의 → 대시보드 설정\n4. **주간 리뷰 습관**: 매주 데이터를 확인하고 인사이트를 기록하세요\n\n## 흔한 실수\n\n- 허영 지표(Vanity Metrics)에 빠지기: 팔로워 수보다 전환율이 중요\n- 데이터 과잉: 너무 많은 지표를 추적하면 아무것도 개선 못합니다`,
    category: '트렌드', tags: ['데이터', '분석', '입문'],
    author: 'SmarComm 팀', publishedAt: '2026-02-14', readTime: 5, published: true,
  },
  {
    id: 'b21', slug: 'facebook-pixel-setup',
    title: 'Meta Pixel 설치 가이드 — 전환 추적의 시작',
    summary: 'Meta Pixel을 사이트에 설치하고 맞춤 전환 이벤트를 설정하는 단계별 가이드.',
    content: `Meta Pixel은 Facebook/Instagram 광고의 성과 추적과 최적화에 필수입니다.\n\n## 설치 3단계\n\n1. Meta 비즈니스 관리자에서 Pixel ID 발급\n2. 사이트 <head>에 기본 코드 삽입\n3. 맞춤 전환 이벤트 설정 (Purchase, Lead 등)\n\n## 이벤트 설정\n\n기본 이벤트: PageView, ViewContent, AddToCart, Purchase\n맞춤 이벤트: SignUp, StartTrial, SubmitApplication\n\n## 주의사항\n\nios14.5+ 이후 추적 제한으로 서버 사이드 이벤트(Conversions API)도 함께 설정하는 것을 추천합니다.`,
    category: '광고', tags: ['Meta', 'Pixel', '전환추적'],
    author: 'SmarComm 팀', publishedAt: '2026-02-12', readTime: 5, published: true,
  },
  {
    id: 'b22', slug: 'content-marketing-roi',
    title: '콘텐츠 마케팅 ROI 측정법 — 블로그가 돈이 되는 순간',
    summary: '콘텐츠 마케팅의 투자 대비 수익을 측정하는 프레임워크와 실전 계산법.',
    content: `콘텐츠 마케팅은 장기적으로 가장 높은 ROI를 제공하는 마케팅 채널입니다.\n\n## ROI 측정 프레임워크\n\n1. **비용 산정**: 제작 비용 + 배포 비용 + 도구 비용\n2. **직접 수익**: 콘텐츠를 통한 전환 (검색 유입 → 가입 → 구매)\n3. **간접 수익**: 브랜드 인지도 상승, 검색 순위 개선\n4. **ROI 계산**: (수익 - 비용) / 비용 × 100\n\n## 실전 팁\n\nUTM 파라미터를 활용하여 블로그 → 가입 → 구매 전환을 추적하세요. SmarComm의 퍼널 분석에서 콘텐츠별 전환율을 확인할 수 있습니다.`,
    category: '그로스', tags: ['콘텐츠', 'ROI', '블로그'],
    author: 'SmarComm 팀', publishedAt: '2026-02-10', readTime: 6, published: true,
  },
  {
    id: 'b23', slug: 'ecommerce-seo-checklist',
    title: '이커머스 SEO 체크리스트 — 상품 페이지 최적화 12가지',
    summary: '쇼핑몰 상품 페이지의 SEO를 최적화하여 검색 유입을 늘리는 12가지 체크포인트.',
    content: `이커머스 사이트의 SEO는 상품 페이지에서 결정됩니다.\n\n## 12가지 체크리스트\n\n1. 고유한 제품 타이틀 (브랜드 + 제품명 + 핵심 키워드)\n2. 메타 디스크립션에 가격/혜택 포함\n3. 고화질 이미지 + Alt 텍스트\n4. Product 스키마 마크업\n5. 고객 리뷰 표시 (Review 스키마)\n6. 관련 상품 내부 링크\n7. 빵부스러기(Breadcrumb) 네비게이션\n8. 카테고리 페이지 최적화\n9. URL 구조 정리 (/category/product-name)\n10. 품절 상품 301 리다이렉트\n11. 페이지 속도 최적화 (이미지 압축)\n12. 모바일 구매 UX 최적화`,
    category: 'GEO/SEO', tags: ['이커머스', 'SEO', '쇼핑몰'],
    author: 'SmarComm 팀', publishedAt: '2026-02-08', readTime: 6, published: true,
  },
  {
    id: 'b24', slug: 'beauty-brand-marketing-case',
    title: '뷰티 브랜드 마케팅 성공 사례 — 월 매출 5배 성장기',
    summary: '인스타그램 + 인플루언서 + 네이버 쇼핑을 활용하여 6개월 만에 월 매출 5배를 달성한 뷰티 브랜드.',
    content: `소규모 뷰티 브랜드가 SmarComm을 활용하여 월 매출을 5배 성장시킨 사례입니다.\n\n## 전략 요약\n\n1. **인스타 릴스 집중**: 사용법 영상 30개 발행 → 팔로워 3배 증가\n2. **마이크로 인플루언서**: 1,000~10,000 팔로워 인플루언서 20명 협업\n3. **네이버 쇼핑 최적화**: 상품명/이미지/리뷰 최적화로 검색 순위 상승\n4. **카카오 알림톡**: 구매 고객 대상 재구매 유도 (건당 8원)\n5. **GEO 최적화**: AI 검색에서 "인기 스킨케어 추천"에 노출\n\n## 결과\n\n- 월 매출: 800만원 → 4,000만원 (6개월)\n- ROAS: 180% → 320%\n- 재구매율: 15% → 35%`,
    category: '사례', tags: ['뷰티', '사례', '인스타그램'],
    author: 'SmarComm 팀', publishedAt: '2026-02-06', readTime: 7, published: true,
  },
  {
    id: 'b25', slug: 'ab-test-statistical-significance',
    title: 'A/B 테스트 통계적 유의성 — 결과를 믿어도 될까?',
    summary: '95% 신뢰도, p-value, 최소 샘플 사이즈 — A/B 테스트 결과를 올바르게 해석하는 방법.',
    content: `A/B 테스트 결과를 잘못 해석하면 잘못된 결정을 내릴 수 있습니다.\n\n## 핵심 개념\n\n1. **통계적 유의성**: 결과가 우연이 아닌 확률 (보통 95% 이상 필요)\n2. **p-value**: 0.05 이하면 유의미한 차이\n3. **최소 샘플 사이즈**: 변형당 최소 1,000명 이상 필요 (전환율에 따라 다름)\n\n## 흔한 실수\n\n- 결과를 너무 일찍 확인하고 중단하기\n- 여러 변수를 동시에 바꾸기\n- 외부 요인(시즌, 요일) 무시하기\n- 승자를 정한 후 다시 테스트 안 하기\n\nSmarComm의 A/B 테스트 기능에서 자동으로 신뢰도와 샘플 사이즈를 계산합니다.`,
    category: '그로스', tags: ['A/B테스트', '통계', 'CRO'],
    author: 'SmarComm 팀', publishedAt: '2026-02-04', readTime: 6, published: true,
  },
  {
    id: 'b26', slug: 'local-seo-guide',
    title: '로컬 SEO 완전 정복 — 지역 검색 1위 만들기',
    summary: '구글 비즈니스 프로필, 네이버 플레이스, 지역 키워드 최적화로 동네 검색 1위를 차지하는 방법.',
    content: `"강남 카페", "홍대 맛집" — 지역 검색에서 상위에 노출되면 직접 방문 고객이 증가합니다.\n\n## 로컬 SEO 5단계\n\n1. **Google 비즈니스 프로필 완성**: 모든 항목을 빠짐없이 채우세요\n2. **네이버 플레이스 등록**: 사진 30장 이상, 메뉴/가격 정보 포함\n3. **NAP 일관성**: 이름, 주소, 전화번호를 모든 플랫폼에서 동일하게\n4. **지역 키워드 콘텐츠**: 블로그에 지역명 + 업종 키워드 콘텐츠 발행\n5. **리뷰 관리**: 리뷰에 성실하게 답글을 달면 순위가 올라갑니다\n\n## SmarComm 활용\n\n사이트 진단에서 로컬 SEO 요소를 자동 분석합니다.`,
    category: 'GEO/SEO', tags: ['로컬SEO', '지역검색', '네이버플레이스'],
    author: 'SmarComm 팀', publishedAt: '2026-02-02', readTime: 6, published: true,
  },
];

export function getPublishedPosts(): BlogPost[] {
  return BLOG_POSTS.filter(p => p.published).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
