// SmarComm 가이드 문서 데이터

export interface GuideStep {
  title: string;
  content: string;
  tip?: string;
}

export interface Guide {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: GuideStep[];
  relatedLinks: { label: string; href: string }[];
}

export const GUIDES: Guide[] = [
  {
    id: 'site-scan',
    category: '사이트 분석',
    title: 'GEO/SEO 사이트 진단하기',
    description: 'URL 하나로 AI 검색 노출 상태와 검색 최적화를 동시에 점검하는 방법을 안내합니다.',
    steps: [
      { title: 'Step 1. URL 입력', content: '워크스페이스 > 사이트 진단 메뉴에서 분석하고 싶은 사이트의 URL을 입력합니다. https:// 프로토콜을 포함해주세요. 입력 후 "진단 시작" 버튼을 클릭하면 분석이 시작됩니다.', tip: '하위 페이지(예: /about, /products)도 개별 분석이 가능합니다.' },
      { title: 'Step 2. 분석 진행', content: '사이트 크롤링 → 기술 SEO 분석 → 콘텐츠 SEO 분석 → AI 검색 노출 확인 → 점수 산출의 5단계를 거칩니다. 약 30초~2분 정도 소요됩니다.', tip: 'Google Sites, Wix 등 일부 플랫폼은 TLS 설정에 따라 분석 시간이 더 걸릴 수 있습니다.' },
      { title: 'Step 3. SmarComm. Index 리포트 확인', content: '종합 점수(SEO 50% + GEO 50%)와 6각형 레이더 차트로 현재 상태를 한눈에 파악합니다. 등급은 Excellent(80+), Good(60+), Needs Work(40+), Critical(40 미만)로 구분됩니다.' },
      { title: 'Step 4. 상위 이슈 확인', content: '가장 시급한 이슈 3개가 severity(HIGH/MEDIUM/LOW)와 함께 표시됩니다. 각 이슈에는 구체적인 개선 액션이 포함되어 있습니다.' },
      { title: 'Step 5. 브랜드 커뮤니케이션 성격 확인', content: '16가지 브랜드 성격 유형 중 사이트에 맞는 유형이 자동으로 분석됩니다. 소비자와의 관계, 커뮤니케이션 방식, 추천 개선 방향이 제시됩니다.', tip: '같은 URL을 반복 진단하면 점수 변화를 추적할 수 있습니다.' },
      { title: 'Step 6. 심화 분석 (회원 전용)', content: '페이지 상세 정보, 키워드 분석, 콘텐츠 갭 분석, 경쟁사 인사이트, 개선 액션 플랜은 로그인 후 전체 확인이 가능합니다.' },
    ],
    relatedLinks: [
      { label: '사이트 진단 바로가기', href: '/dashboard/scan' },
      { label: '퍼널 분석', href: '/dashboard/funnel' },
      { label: '용어 사전', href: '/dashboard/glossary' },
    ],
  },
  {
    id: 'creative',
    category: '소재 제작',
    title: 'AI로 광고 소재 제작하기',
    description: '브랜드 가이드 기반으로 텍스트 카피, 배너, 영상 소재를 AI가 자동 생성합니다.',
    steps: [
      { title: 'Step 1. 소재 유형 선택', content: '텍스트 카피, 배너/이미지, 영상 중 제작할 소재 유형을 선택합니다.' },
      { title: 'Step 2. 브리프 입력', content: '제품/서비스 설명, 타깃 고객, 톤앤매너, 채널(네이버 SA, 메타 등)을 입력합니다. 구체적일수록 더 정확한 소재가 생성됩니다.', tip: '예시: "20대 여성 타깃 봄 신상 원피스 네이버 SA 카피, 혜택 강조 톤"' },
      { title: 'Step 3. AI 소재 생성', content: 'AI가 브랜드 가이드(로고, 컬러, 톤)를 적용하여 3~5개 변형 소재를 자동 생성합니다.' },
      { title: 'Step 4. 소재 검토 및 수정', content: '생성된 소재를 확인하고 필요한 부분을 수정합니다. 마음에 드는 소재를 아카이브에 저장하세요.' },
      { title: 'Step 5. A/B 테스트 설계', content: '변형 소재 중 2개를 선택하여 A/B 테스트를 설계하면, 데이터로 더 나은 소재를 선택할 수 있습니다.', tip: '혜택 강조 vs 긴급성 강조, 이미지 중심 vs 텍스트 중심 등 하나의 변수만 바꿔 테스트하세요.' },
    ],
    relatedLinks: [
      { label: '소재 제작 바로가기', href: '/dashboard/creative' },
      { label: '소재 아카이브', href: '/dashboard/archive' },
      { label: 'A/B 테스트', href: '/dashboard/abtest' },
    ],
  },
  {
    id: 'funnel',
    category: '데이터 분석',
    title: '퍼널 분석으로 이탈 구간 찾기',
    description: '방문→진단→가입→활성화→유료 전환까지 어디서 고객을 잃고 있는지 파악합니다.',
    steps: [
      { title: 'Step 1. 퍼널 단계 이해', content: 'SmarComm 퍼널은 5단계입니다: 사이트 방문 → 무료 진단 → 회원가입 → 리포트 열람(활성화) → 유료 전환. 각 단계별 이탈률이 시각적으로 표시됩니다.' },
      { title: 'Step 2. 이탈률 분석', content: '각 단계 사이의 이탈률(%)과 이탈 인원수가 표시됩니다. 이탈이 가장 많은 구간을 우선 개선하세요.' },
      { title: 'Step 3. 전환율 카드 확인', content: '방문→진단, 진단→가입, 가입→활성화, 활성화→유료 각 구간의 전환율과 전월 대비 변화율을 확인합니다.' },
      { title: 'Step 4. SmarComm 인사이트 활용', content: 'AI가 분석한 인사이트를 참고하여 개선 전략을 수립하세요. 예: "리테스트 3회 완료 사용자의 유료 전환율이 2.3배 높음"', tip: '기간 필터(7일/30일/90일)를 활용하여 시기별 변화를 비교하세요.' },
    ],
    relatedLinks: [
      { label: '퍼널 분석 바로가기', href: '/dashboard/funnel' },
      { label: '코호트 분석', href: '/dashboard/cohort' },
      { label: '사용자 여정', href: '/dashboard/journey' },
    ],
  },
  {
    id: 'email-automation',
    category: 'CRM 마케팅',
    title: '이메일 자동화 시나리오 설정하기',
    description: '가입부터 재방문 유도까지, 자동 이메일 시나리오를 설정하여 지속적인 관계를 유지합니다.',
    steps: [
      { title: 'Step 1. 자동화 시나리오 이해', content: 'SmarComm은 5가지 기본 자동화 시나리오를 제공합니다: 회원가입 환영 → 진단 완료 후 심화 안내 → 7일 미방문 알림 → 14일 미방문 인센티브 → 월간 리포트.' },
      { title: 'Step 2. 트리거 설정', content: '각 시나리오의 트리거(발동 조건)를 설정합니다. 예: "회원가입 즉시", "진단 완료 24시간 후", "7일간 미방문 시".' },
      { title: 'Step 3. 이메일 콘텐츠 작성', content: '제목, 본문, CTA 버튼을 작성합니다. AI가 초안을 자동 생성하며, 브랜드 가이드가 적용됩니다.', tip: '오픈율이 높은 제목 패턴: "점수가 변했습니다", "경쟁사가 앞서고 있습니다"' },
      { title: 'Step 4. A/B 테스트 (선택)', content: '제목이나 CTA를 2가지 버전으로 테스트하여 오픈율/클릭율이 높은 버전을 자동 선택합니다.' },
      { title: 'Step 5. 발송 및 성과 분석', content: '발송 후 오픈율, 클릭율, 전환율을 추적합니다. 성과가 낮은 이메일은 AI가 개선안을 제안합니다.' },
    ],
    relatedLinks: [
      { label: '이메일 마케팅 바로가기', href: '/dashboard/crm/email' },
      { label: '푸시 메시지', href: '/dashboard/crm/push' },
      { label: '카카오 메시지', href: '/dashboard/crm/kakao' },
    ],
  },
  {
    id: 'cohort',
    category: '데이터 분석',
    title: '코호트 분석으로 리텐션 측정하기',
    description: '동일 시기에 가입한 고객 그룹의 재방문율을 히트맵으로 분석합니다.',
    steps: [
      { title: 'Step 1. 리텐션 히트맵 읽기', content: 'D0(가입일)부터 D30까지의 재방문율이 색상으로 표시됩니다. 녹색(60%+)은 양호, 주황(30~40%)은 보통, 빨강(20% 미만)은 개선 필요입니다.' },
      { title: 'Step 2. 코호트 그룹 이해', content: '자동 코호트(무료 진단만 완료, 가입 후 비활성, 이탈 위험군 등)와 커스텀 코호트(업종별, 점수별)로 분류됩니다.' },
      { title: 'Step 3. 커스텀 코호트 생성', content: '"코호트 생성" 버튼으로 조건을 조합하여 새 그룹을 만들 수 있습니다. 예: "소상공인 업종 AND 점수 40점 이하"', tip: '이탈 위험군 코호트를 만들어 자동 푸시/이메일 트리거를 설정하세요.' },
      { title: 'Step 4. 코호트 기반 캠페인 실행', content: '특정 코호트를 타겟으로 이메일, 푸시, 카카오 메시지 캠페인을 실행할 수 있습니다.' },
    ],
    relatedLinks: [
      { label: '코호트 분석 바로가기', href: '/dashboard/cohort' },
      { label: '퍼널 분석', href: '/dashboard/funnel' },
      { label: 'CRM 고객 관리', href: '/dashboard/crm' },
    ],
  },
  // ══════ 데이터 연동 가이드 ══════
  {
    id: 'tracking-setup',
    category: '데이터 연동',
    title: '사이트 추적 코드 설치하기',
    description: '사이트에 추적 코드 1줄을 설치하면 방문자 행동, 퍼널, 코호트, A/B 테스트 데이터를 자동 수집합니다.',
    steps: [
      { title: 'Step 1. 추적 코드 발급', content: '워크스페이스 설정 > 외부 연동 > "추적 코드 발급"을 클릭합니다. 워크스페이스별로 고유한 추적 키(WS-xxx)가 생성됩니다.' },
      { title: 'Step 2. 코드 복사', content: '발급된 스크립트 태그 1줄을 복사합니다. 예: <script src="https://sdk.smarcomm.com/sc.js" data-key="WS-xxx"></script>', tip: '이 코드 하나로 페이지뷰, 세션, 디바이스 정보가 자동 수집됩니다. 별도 설정이 필요 없습니다.' },
      { title: 'Step 3. 사이트에 설치', content: '사이트의 <head> 태그 안에 복사한 코드를 붙여넣습니다. WordPress는 테마 설정의 "헤더 스크립트"에, Cafe24/쇼피파이는 추적 코드 설정에 입력하세요.', tip: 'GTM(Google Tag Manager)을 사용 중이라면 "커스텀 HTML" 태그로 추가할 수도 있습니다.' },
      { title: 'Step 4. 설치 확인', content: '코드 설치 후 워크스페이스 설정 > 외부 연동에서 "연결 확인" 버튼을 클릭합니다. 사이트에서 데이터가 수신되면 초록색 "연결됨" 표시가 나타납니다.' },
      { title: 'Step 5. 커스텀 이벤트 설정 (선택)', content: '기본 수집(페이지뷰, 세션) 외에 구매, 회원가입, 버튼 클릭 등을 추적하려면 이벤트 관리 메뉴에서 이벤트를 정의하고 코드를 추가합니다. 예: sc.track("purchase", {amount: 39000})', tip: '이벤트를 설정하면 퍼널 분석과 코호트에서 실제 전환 데이터를 볼 수 있습니다.' },
    ],
    relatedLinks: [
      { label: '워크스페이스 설정', href: '/dashboard/profile' },
      { label: '이벤트 관리', href: '/dashboard/events' },
      { label: '퍼널 분석', href: '/dashboard/funnel' },
    ],
  },
  {
    id: 'google-ads-connect',
    category: '데이터 연동',
    title: 'Google Ads 연동하기',
    description: 'Google Ads 계정을 연결하면 캠페인, 키워드, 노출/클릭/전환/비용 데이터가 자동으로 수집됩니다.',
    steps: [
      { title: 'Step 1. 외부 연동 메뉴 진입', content: '워크스페이스 설정 > 외부 연동 탭으로 이동합니다. 광고 매체 섹션에서 "Google Ads"를 찾습니다.' },
      { title: 'Step 2. Google 계정 로그인', content: '"연결하기" 버튼을 클릭하면 Google OAuth 로그인 창이 열립니다. Google Ads를 관리하는 Google 계정으로 로그인하세요.', tip: 'MCC(관리자 계정)로 로그인하면 하위 계정의 데이터도 한번에 연동됩니다.' },
      { title: 'Step 3. 권한 승인', content: 'SmarComm이 Google Ads 데이터를 읽을 수 있도록 "허용"을 클릭합니다. 읽기 전용 권한만 요청하며, 광고를 수정하거나 예산을 변경하지 않습니다.' },
      { title: 'Step 4. 계정 선택', content: '여러 Google Ads 계정이 있는 경우 SmarComm에서 데이터를 가져올 계정을 선택합니다.' },
      { title: 'Step 5. 데이터 수집 시작', content: '연동 완료 후 SmarComm이 매시간 자동으로 데이터를 수집합니다. 캠페인별 노출, 클릭, CTR, 전환, CPA, ROAS가 광고 집행 페이지에 실시간 표시됩니다.', tip: '최초 연동 시 최근 90일 데이터를 일괄 수집합니다. 이후에는 매시간 업데이트됩니다.' },
    ],
    relatedLinks: [
      { label: '워크스페이스 설정', href: '/dashboard/profile' },
      { label: '광고 집행', href: '/dashboard/campaigns' },
      { label: '캠페인 보고서', href: '/dashboard/reports' },
    ],
  },
  {
    id: 'meta-ads-connect',
    category: '데이터 연동',
    title: 'Meta (Facebook/Instagram) 광고 연동하기',
    description: 'Meta 비즈니스 계정을 연결하면 Facebook, Instagram 광고 성과 데이터가 자동 수집됩니다.',
    steps: [
      { title: 'Step 1. Meta 비즈니스 관리자 확인', content: '연동 전에 Meta 비즈니스 관리자(business.facebook.com)에서 광고 계정이 설정되어 있는지 확인하세요.', tip: '비즈니스 관리자가 없으면 business.facebook.com에서 무료로 생성할 수 있습니다.' },
      { title: 'Step 2. 외부 연동에서 Meta 연결', content: '워크스페이스 설정 > 외부 연동 > "Meta Ads" 연결하기를 클릭합니다.' },
      { title: 'Step 3. Facebook 로그인 및 권한 승인', content: 'Facebook 로그인 후 광고 계정 읽기 권한을 승인합니다. ads_read, insights 권한만 요청하며 광고를 수정하지 않습니다.' },
      { title: 'Step 4. 광고 계정 & 픽셀 선택', content: '데이터를 가져올 광고 계정과 Meta Pixel을 선택합니다. 픽셀 데이터를 연동하면 전환 추적이 더 정확해집니다.' },
      { title: 'Step 5. 데이터 확인', content: '연동 후 광고 집행 페이지에서 캠페인별 도달, 노출, 클릭, 전환, 비용, ROAS를 확인합니다. Instagram과 Facebook 데이터가 통합 표시됩니다.' },
    ],
    relatedLinks: [
      { label: '워크스페이스 설정', href: '/dashboard/profile' },
      { label: '광고 집행', href: '/dashboard/campaigns' },
      { label: '매출 분석', href: '/dashboard/analytics' },
    ],
  },
  {
    id: 'naver-sa-connect',
    category: '데이터 연동',
    title: '네이버 검색광고 연동하기',
    description: '네이버 검색광고 API를 연결하면 캠페인, 키워드, 품질지수, 클릭/노출/비용 데이터를 수집합니다.',
    steps: [
      { title: 'Step 1. 네이버 검색광고 API 키 발급', content: 'searchad.naver.com에 로그인 > 도구 > API 관리에서 API 라이선스와 시크릿 키를 발급받습니다.', tip: '광고 관리 권한이 있는 계정으로 로그인해야 API 키를 발급받을 수 있습니다.' },
      { title: 'Step 2. SmarComm에 API 키 입력', content: '워크스페이스 설정 > 외부 연동 > "네이버 검색광고"에서 발급받은 API 라이선스, 시크릿 키, 고객 ID를 입력합니다.' },
      { title: 'Step 3. 연결 확인', content: '"연결 테스트" 버튼을 클릭하여 API 키가 유효한지 확인합니다. 성공하면 캠페인 목록이 표시됩니다.' },
      { title: 'Step 4. 데이터 수집 범위 설정', content: '수집할 캠페인을 선택하거나 전체 수집을 설정합니다. 키워드별 품질지수, 평균 클릭 비용, 노출 순위 데이터가 포함됩니다.' },
      { title: 'Step 5. 보고서 활용', content: '수집된 데이터는 광고 집행과 캠페인 보고서에서 확인합니다. 네이버 SA의 키워드별 성과를 Google Ads, Meta 광고와 함께 비교 분석할 수 있습니다.', tip: '파워링크, 쇼핑검색 등 상품별 데이터도 자동 분류됩니다.' },
    ],
    relatedLinks: [
      { label: '워크스페이스 설정', href: '/dashboard/profile' },
      { label: '광고 집행', href: '/dashboard/campaigns' },
      { label: '데이터 리포트', href: '/dashboard/data-reports' },
    ],
  },
  {
    id: 'kakao-connect',
    category: '데이터 연동',
    title: '카카오 비즈메시지 연동하기',
    description: '카카오 비즈채널을 연결하면 알림톡, 친구톡 발송과 성과 추적이 가능합니다.',
    steps: [
      { title: 'Step 1. 카카오 비즈채널 개설', content: '카카오톡 채널 관리자센터(center-pf.kakao.com)에서 비즈니스 채널을 개설합니다. 사업자등록증이 필요합니다.', tip: '이미 카카오톡 채널이 있다면 비즈니스 전환만 하면 됩니다.' },
      { title: 'Step 2. 비즈메시지 API 신청', content: '카카오 비즈니스(business.kakao.com)에서 비즈메시지 API를 신청합니다. 승인까지 1~3 영업일 소요됩니다.' },
      { title: 'Step 3. 발신 프로필 등록', content: 'API 승인 후 발신 프로필(카카오톡 채널)을 등록하고, 알림톡 템플릿을 심사받습니다. 템플릿 심사는 보통 1~2일 소요됩니다.', tip: '자주 사용하는 템플릿: 회원가입 환영, 결제 완료, 배송 안내, 이벤트 안내' },
      { title: 'Step 4. SmarComm에 연동', content: '워크스페이스 설정 > 외부 연동 > "카카오 비즈메시지"에서 API 키와 발신 프로필을 등록합니다.' },
      { title: 'Step 5. 메시지 발송 및 성과 확인', content: '카카오 메뉴에서 코호트 세그먼트를 선택하고 메시지를 발송합니다. 발송 수, 수신율, 클릭율이 자동 추적됩니다.', tip: '알림톡(건당 ~8원)은 정보성, 친구톡(건당 ~15원)은 광고성 메시지에 사용하세요.' },
    ],
    relatedLinks: [
      { label: '카카오 메시지', href: '/dashboard/crm/kakao' },
      { label: '코호트', href: '/dashboard/cohort' },
      { label: '고객 관리', href: '/dashboard/crm' },
    ],
  },
  {
    id: 'ga4-connect',
    category: '데이터 연동',
    title: 'Google Analytics 4 연동하기',
    description: 'GA4를 연결하면 사이트 트래픽, 사용자 행동, 전환 데이터를 SmarComm에서 통합 분석합니다.',
    steps: [
      { title: 'Step 1. GA4 속성 확인', content: 'analytics.google.com에서 GA4 속성이 설정되어 있는지 확인합니다. UA(유니버설 애널리틱스)가 아닌 GA4를 사용해야 합니다.', tip: 'GA4가 아직 없다면 analytics.google.com에서 새 속성을 만들고, 사이트에 GA4 태그를 설치하세요.' },
      { title: 'Step 2. SmarComm에서 연결', content: '워크스페이스 설정 > 외부 연동 > "Google Analytics"에서 "연결하기"를 클릭합니다.' },
      { title: 'Step 3. Google 로그인 및 속성 선택', content: 'Google OAuth 로그인 후 데이터를 가져올 GA4 속성을 선택합니다. 여러 사이트를 운영 중이라면 해당 사이트의 속성을 선택하세요.' },
      { title: 'Step 4. 데이터 통합 확인', content: 'GA4의 세션, 사용자, 페이지뷰, 이벤트 데이터가 SmarComm 퍼널과 코호트에 반영됩니다. SmarComm 자체 추적 코드와 GA4 데이터를 교차 검증할 수 있습니다.', tip: 'GA4 데이터와 SmarComm 추적 코드를 함께 사용하면 더 정확한 분석이 가능합니다.' },
    ],
    relatedLinks: [
      { label: '워크스페이스 설정', href: '/dashboard/profile' },
      { label: '퍼널 분석', href: '/dashboard/funnel' },
      { label: '매출 분석', href: '/dashboard/analytics' },
    ],
  },
  {
    id: 'email-setup',
    category: '데이터 연동',
    title: '이메일 발송 설정하기',
    description: '이메일 발송 서비스를 연동하면 드립 캠페인, 뉴스레터, 트리거 이메일을 자동 발송합니다.',
    steps: [
      { title: 'Step 1. 발송 서비스 선택', content: 'SmarComm은 3가지 이메일 발송 서비스를 지원합니다: AWS SES(가장 저렴, 건당 ~0.1원), SendGrid(쉬운 설정), Mailchimp(풍부한 템플릿). 워크스페이스 설정 > 외부 연동에서 선택하세요.', tip: '소규모(월 1만건 미만)는 SendGrid 무료 플랜, 대규모(월 10만건 이상)는 AWS SES를 추천합니다.' },
      { title: 'Step 2. 도메인 인증', content: '발송할 도메인(예: @yourbrand.com)의 DNS에 SPF, DKIM 레코드를 추가합니다. 이 설정이 없으면 이메일이 스팸으로 분류됩니다.', tip: 'DNS 설정이 어려우면 IT 담당자나 도메인 호스팅 업체에 문의하세요. 설정 방법 안내 이메일을 발송해드립니다.' },
      { title: 'Step 3. 발신자 정보 설정', content: '보내는 사람 이름(예: SmarComm 팀)과 회신 이메일 주소를 설정합니다.' },
      { title: 'Step 4. 테스트 발송', content: '설정 완료 후 본인 이메일로 테스트 메일을 발송하여 수신 여부와 디자인을 확인합니다.' },
      { title: 'Step 5. 자동화 시나리오 연결', content: '이메일 발송이 설정되면 자동화 규칙에서 "이메일 발송" 액션을 사용할 수 있습니다. 예: 7일 미방문 시 자동 리마인더, 진단 완료 후 심화 리포트 안내.', tip: '이메일 오픈율 업계 평균은 20~25%입니다. 제목에 개인화(이름, 회사명)를 넣으면 오픈율이 26% 증가합니다.' },
    ],
    relatedLinks: [
      { label: '이메일 마케팅', href: '/dashboard/crm/email' },
      { label: '자동화', href: '/dashboard/workflow/automation' },
      { label: '코호트', href: '/dashboard/cohort' },
    ],
  },
  {
    id: 'push-setup',
    category: '데이터 연동',
    title: '푸시 알림 설정하기',
    description: '웹/앱 푸시 알림을 설정하면 사용자에게 실시간 메시지를 전달합니다.',
    steps: [
      { title: 'Step 1. 웹 푸시 vs 앱 푸시', content: '웹 푸시: 사이트 방문자에게 브라우저 알림 발송 (별도 앱 불필요, 무료). 앱 푸시: 모바일 앱 사용자에게 알림 발송 (Firebase FCM 연동 필요).', tip: '앱이 없는 경우 웹 푸시부터 시작하세요. SmarComm 추적 코드를 설치하면 웹 푸시가 자동 활성화됩니다.' },
      { title: 'Step 2. 알림 권한 요청 설정', content: '사용자가 사이트를 방문했을 때 "알림을 받으시겠습니까?" 팝업이 표시되는 시점과 디자인을 설정합니다. 첫 방문 즉시보다 2~3번째 방문 시 요청하면 수락률이 2배 높습니다.' },
      { title: 'Step 3. 세그먼트별 발송', content: '코호트에서 정의한 세그먼트(이탈 위험군, VIP 고객 등)를 대상으로 맞춤 메시지를 발송합니다.' },
      { title: 'Step 4. 성과 추적', content: '발송 수, 수신율, 클릭율이 자동 추적됩니다. A/B 테스트로 메시지 제목과 내용을 최적화하세요.', tip: '푸시 메시지는 짧을수록 효과적입니다. 20자 이내 제목 + 50자 이내 본문을 권장합니다.' },
    ],
    relatedLinks: [
      { label: '푸시 메시지', href: '/dashboard/crm/push' },
      { label: '코호트', href: '/dashboard/cohort' },
      { label: '자동화', href: '/dashboard/workflow/automation' },
    ],
  },
  {
    id: 'naver-searchadvisor',
    category: '데이터 연동',
    title: '네이버 서치어드바이저 연동하기',
    description: '네이버 검색에서의 노출, 클릭, 키워드 순위 데이터를 연동하여 SEO 성과를 추적합니다.',
    steps: [
      { title: 'Step 1. 네이버 서치어드바이저 등록', content: 'searchadvisor.naver.com에서 사이트를 등록합니다. HTML 태그, 파일 업로드, DNS 인증 중 하나로 사이트 소유권을 확인합니다.', tip: 'HTML 메타 태그 방식이 가장 간편합니다. <head>에 태그 한 줄만 추가하면 됩니다.' },
      { title: 'Step 2. 사이트맵 제출', content: '서치어드바이저에서 사이트맵(sitemap.xml) URL을 제출합니다. 네이버 봇이 사이트를 효율적으로 크롤링할 수 있습니다.' },
      { title: 'Step 3. SmarComm 연동', content: '워크스페이스 설정 > 외부 연동 > "네이버 서치어드바이저"에서 네이버 로그인 후 사이트를 선택합니다.' },
      { title: 'Step 4. SEO 성과 모니터링', content: '네이버 검색 노출수, 클릭수, 평균 순위가 SmarComm 사이트 진단과 데이터 리포트에 반영됩니다. GEO/SEO 진단 점수 변화와 실제 검색 성과를 교차 확인할 수 있습니다.' },
    ],
    relatedLinks: [
      { label: '사이트 진단', href: '/dashboard/scan' },
      { label: '데이터 리포트', href: '/dashboard/data-reports' },
      { label: '워크스페이스 설정', href: '/dashboard/profile' },
    ],
  },
  {
    id: 'conversion-tracking',
    category: '데이터 연동',
    title: '전환 추적 설정하기',
    description: '구매, 회원가입, 상담 신청 등 비즈니스 목표를 정의하고 추적하는 방법을 안내합니다.',
    steps: [
      { title: 'Step 1. 전환 이벤트 정의', content: '이벤트 관리에서 추적할 전환 행동을 정의합니다. 일반적인 전환: 회원가입(signup), 구매(purchase), 상담 신청(inquiry), 다운로드(download), 장바구니 담기(add_to_cart).', tip: '처음에는 가장 중요한 전환 1~2개만 설정하세요. 회원가입과 구매가 일반적입니다.' },
      { title: 'Step 2. 전환 코드 설치', content: '정의한 전환 이벤트가 발생하는 페이지에 추적 코드를 추가합니다. 예: 구매 완료 페이지에 sc.track("purchase", {amount: 39000, product: "Lite 플랜"})을 삽입합니다.' },
      { title: 'Step 3. 광고 매체별 전환 연동', content: '각 광고 매체(Google, Meta, 네이버)의 전환 추적과 SmarComm 전환을 매핑합니다. 이를 통해 어떤 채널의 어떤 광고가 전환에 기여했는지 파악할 수 있습니다.' },
      { title: 'Step 4. 퍼널에서 전환 확인', content: '설정한 전환 이벤트가 퍼널 분석에 자동 반영됩니다. 각 단계별 전환율과 이탈률을 확인하고 개선 포인트를 찾으세요.' },
      { title: 'Step 5. ROAS 계산', content: '광고비(매체 API에서 자동 수집) ÷ 전환 매출(전환 추적에서 수집) = ROAS가 자동 계산됩니다. 매출 분석과 캠페인 보고서에서 채널별 ROAS를 비교하세요.', tip: '전환 추적이 정확해야 ROAS도 정확합니다. 설치 후 반드시 테스트 전환을 발생시켜 데이터가 정상 수집되는지 확인하세요.' },
    ],
    relatedLinks: [
      { label: '이벤트 관리', href: '/dashboard/events' },
      { label: '퍼널 분석', href: '/dashboard/funnel' },
      { label: '매출 분석', href: '/dashboard/analytics' },
      { label: '캠페인 보고서', href: '/dashboard/reports' },
    ],
  },
  {
    id: 'integration-checklist',
    category: '데이터 연동',
    title: '연동 체크리스트 — 무엇부터 해야 할까?',
    description: '사업 규모와 상황에 따라 어떤 연동을 먼저 해야 하는지 우선순위를 안내합니다.',
    steps: [
      { title: '1순위: 사이트 진단 (지금 바로 가능)', content: 'URL만 입력하면 GEO/SEO 점수를 즉시 확인합니다. 별도 설치나 연동이 필요 없습니다. 가장 먼저 진단을 실행하여 현재 상태를 파악하세요.' },
      { title: '2순위: 추적 코드 설치 (10분)', content: '사이트에 코드 1줄을 설치하면 방문자 행동 데이터를 수집합니다. 퍼널, 코호트, 이벤트 분석이 실데이터로 전환됩니다.', tip: '추적 코드 설치는 워드프레스, Cafe24, 쇼피파이 등 대부분의 플랫폼에서 5분이면 완료됩니다.' },
      { title: '3순위: 주력 광고 매체 1개 연동 (5분)', content: '현재 가장 많이 사용하는 광고 매체 하나를 먼저 연동하세요. 네이버 SA를 주로 쓴다면 네이버를, 인스타 광고를 주로 쓴다면 Meta를 연결합니다. OAuth 로그인만 하면 됩니다.' },
      { title: '4순위: 전환 추적 설정 (30분)', content: '추적 코드가 설치된 상태에서 구매/가입 등 핵심 전환 이벤트를 정의합니다. 이것이 설정되면 ROAS가 자동 계산됩니다.' },
      { title: '5순위: 메시지 채널 연동 (상황에 따라)', content: '이메일: 가장 쉬움 (SendGrid 무료 플랜으로 시작). 카카오: 비즈채널 필요 (1~3일 소요). 푸시: 추적 코드 설치 시 자동 활성화.' },
      { title: '6순위: 나머지 매체 추가 연동', content: 'Google Ads, GA4, 네이버 서치어드바이저 등을 추가로 연동하여 멀티채널 통합 분석 환경을 완성합니다.', tip: '모든 연동을 한번에 할 필요는 없습니다. 가장 효과가 큰 것부터 하나씩 추가하세요.' },
    ],
    relatedLinks: [
      { label: '사이트 진단', href: '/dashboard/scan' },
      { label: '워크스페이스 설정', href: '/dashboard/profile' },
      { label: '이벤트 관리', href: '/dashboard/events' },
    ],
  },
  {
    id: 'process-overview',
    category: '서비스 프로세스',
    title: 'SmarComm 5단계 마케팅 프로세스',
    description: '진단→기획→제작→실행→결과 — SmarComm의 핵심 마케팅 순환 프로세스를 이해합니다.',
    steps: [
      { title: '1단계: 진단 — 브랜드 현재 상태를 안다', content: '사이트 진단으로 GEO/SEO 점수를 측정하고, 사용자 여정으로 고객 접점을 분석합니다. 퍼널 분석에서 전환 병목을 찾고, 코호트로 이탈 위험군을 식별합니다. 이벤트 관리로 추적할 행동을 정의하세요.', tip: '진단 리포트가 기획의 입력값이 됩니다. 정확한 진단이 효과적인 기획의 시작입니다.' },
      { title: '2단계: 기획 — 무엇을 할지 계획한다', content: '진단에서 발견된 개선 포인트를 기반으로 프로젝트를 생성합니다. 칸반 보드에서 세부 태스크를 관리하고, 마케팅 캘린더로 실행 일정을 수립합니다.', tip: '예시: GEO 점수 35점 → "GEO 개선 프로젝트" 생성 → 칸반에 "FAQ 스키마 추가", "블로그 콘텐츠 발행" 태스크 등록' },
      { title: '3단계: 제작 — 소재를 만든다', content: 'AI 소재 제작으로 카피, 배너, 영상을 생성합니다. 콘텐츠 파이프라인에서 제작 진행 상황을 추적하고(아이디어→기획→제작→리뷰→예약→발행), 완성된 소재는 소재 아카이브에 보관합니다.', tip: '칸반의 제작 태스크와 파이프라인이 연동됩니다.' },
      { title: '4단계: 실행 — 세상에 내보낸다', content: '아카이브의 소재를 광고 집행(네이버/메타/구글)으로 연결합니다. A/B 테스트로 소재와 랜딩 효과를 검증합니다. CRM으로 리드를 관리하고 푸시/이메일/카카오로 옴니채널 메시지를 발송합니다. 자동화로 반복 업무를 줄이세요.', tip: '코호트 세그먼트를 푸시/이메일/카카오 타겟으로 직접 활용할 수 있습니다.' },
      { title: '5단계: 결과 — 효과를 본다', content: '매출 분석에서 ROAS와 전환 추이를 확인합니다. 캠페인 보고서에서 채널별 성과를 비교합니다. 데이터 리포트에서 진단~실행 전 과정을 포함하는 통합 보고서를 생성하세요.', tip: '통합 보고서: ①진단 요약(점수 변화) ②기획 요약(목표/프로젝트) ③제작 요약(소재 수/유형) ④실행 요약(채널별 집행) ⑤결과 분석(ROAS/CPA/ROI)' },
      { title: '순환: 결과에서 다시 진단으로', content: '결과 보고서의 인사이트를 기반으로 사이트를 재진단합니다. 점수 변화(초기 vs 현재)를 추적하여 마케팅 효과를 수치로 증명하세요. 이 순환을 통해 성과가 지속적으로 개선됩니다.' },
    ],
    relatedLinks: [
      { label: '사이트 진단', href: '/dashboard/scan' },
      { label: '프로젝트', href: '/dashboard/workflow/projects' },
      { label: '소재 제작', href: '/dashboard/creative' },
      { label: '광고 집행', href: '/dashboard/campaigns' },
      { label: '데이터 리포트', href: '/dashboard/data-reports' },
    ],
  },
  {
    id: 'data-flow',
    category: '서비스 프로세스',
    title: '단계별 데이터 흐름 이해하기',
    description: '각 단계에서 생성된 데이터가 다음 단계로 어떻게 연결되는지 안내합니다.',
    steps: [
      { title: '진단 → 기획 연결', content: '사이트 진단의 개선 포인트가 프로젝트의 태스크로 연결됩니다. 예: "메타 디스크립션 누락" → 칸반에 태스크 자동 생성. 퍼널의 병목 구간이 사용자 여정 설계의 기반이 됩니다.', tip: '진단 결과 하단의 "프로젝트 생성 →" 버튼을 활용하세요.' },
      { title: '기획 → 제작 연결', content: '칸반 보드의 제작 태스크가 콘텐츠 파이프라인의 아이디어 단계로 이관됩니다. 프로젝트에서 필요한 소재 목록이 소재 제작 요청으로 연결됩니다.' },
      { title: '제작 → 실행 연결', content: '파이프라인에서 Published로 완료된 소재가 소재 아카이브에 저장됩니다. 아카이브의 승인된 소재를 캠페인 생성 시 바로 선택할 수 있습니다.' },
      { title: '실행 → 결과 연결', content: '광고 집행 데이터(노출, 클릭, 전환)가 자동으로 결과 보고서에 수집됩니다. CRM의 전환 고객 데이터와 채널별 발송 성과가 통합 리포트에 포함됩니다.' },
      { title: '결과 → 진단 순환', content: '결과 보고서의 인사이트를 바탕으로 사이트를 재진단합니다. 점수 변화(초기 vs 현재)를 추적하여 마케팅 효과를 수치로 증명하세요.' },
    ],
    relatedLinks: [
      { label: '워크플로우 현황', href: '/dashboard/workflow' },
      { label: '칸반 보드', href: '/dashboard/workflow/kanban' },
      { label: '콘텐츠 파이프라인', href: '/dashboard/workflow/pipeline' },
    ],
  },
  {
    id: 'kanban-guide',
    category: '워크플로우',
    title: '칸반 보드로 태스크 관리하기',
    description: '드래그앤드롭으로 마케팅 태스크를 Backlog→To Do→In Progress→Review→Done 흐름으로 관리합니다.',
    steps: [
      { title: 'Step 1. 태스크 생성', content: '"새 태스크" 버튼 또는 각 컬럼의 + 버튼으로 태스크를 생성합니다. 제목, 설명, 우선순위(Urgent/High/Medium/Low), 채널, 담당자, 마감일, 태그를 설정하세요.' },
      { title: 'Step 2. 드래그앤드롭 이동', content: '태스크 카드를 잡아서 원하는 컬럼으로 끌어다 놓습니다. 작업 시작 시 In Progress로, 리뷰 요청 시 Review로, 완료 시 Done으로 이동하세요.' },
      { title: 'Step 3. 필터 활용', content: '채널별(네이버/메타/구글 등)과 우선순위별 필터로 원하는 태스크만 표시합니다.', tip: '우선순위별 왼쪽 테두리 색상: Urgent(빨강), High(주황), Medium/Low(회색)' },
      { title: 'Step 4. 태스크 수정/삭제', content: '태스크 카드를 클릭하면 수정 모달이 열립니다. 내용 변경, 담당자 재배정, 마감일 조정, 삭제가 가능합니다.' },
    ],
    relatedLinks: [
      { label: '칸반 보드', href: '/dashboard/workflow/kanban' },
      { label: '프로젝트', href: '/dashboard/workflow/projects' },
      { label: '파이프라인', href: '/dashboard/workflow/pipeline' },
    ],
  },
  {
    id: 'pipeline-guide',
    category: '워크플로우',
    title: '콘텐츠 파이프라인 사용하기',
    description: '소재 제작 흐름을 아이디어→기획→제작→리뷰→예약→발행 6단계로 추적합니다.',
    steps: [
      { title: 'Step 1. 파이프라인 단계 이해', content: '6단계: Idea(아이디어) → Scripting(기획) → Production(제작) → Review(리뷰) → Scheduled(예약) → Published(발행). 각 단계별 콘텐츠 수가 표시됩니다.' },
      { title: 'Step 2. 콘텐츠 이동', content: '콘텐츠 카드를 드래그하여 다음 단계로 이동합니다. AI 생성 소재는 반짝임 아이콘으로 표시됩니다.' },
      { title: 'Step 3. 채널 필터', content: '채널별 필터로 특정 채널의 콘텐츠만 확인할 수 있습니다.' },
      { title: 'Step 4. 소재 아카이브 연동', content: 'Published 단계에 도달한 소재는 소재 아카이브에 자동 보관됩니다. 아카이브에서 캠페인 집행으로 바로 연결 가능합니다.' },
    ],
    relatedLinks: [
      { label: '파이프라인', href: '/dashboard/workflow/pipeline' },
      { label: '소재 제작', href: '/dashboard/creative' },
      { label: '소재 아카이브', href: '/dashboard/archive' },
    ],
  },
  {
    id: 'automation-guide',
    category: '워크플로우',
    title: '자동화 규칙 설정하기',
    description: '트리거→조건→액션 구조로 반복 업무를 자동화합니다.',
    steps: [
      { title: 'Step 1. 트리거 선택', content: '자동화 발동 시점을 선택합니다: Task 상태 변경, 새 콘텐츠 생성, 스케줄(주기적), 수동 실행.' },
      { title: 'Step 2. 조건 설정', content: '트리거에 추가 조건을 설정합니다. 예: 상태=Done AND 우선순위=High. 조건이 없으면 항상 실행됩니다.', tip: '조건은 여러 개 추가 가능하며 모두 만족해야 실행됩니다 (AND 논리).' },
      { title: 'Step 3. 액션 설정', content: '실행할 동작: Task 이동, 알림 전송, Task 생성, 상태 변경. 여러 액션 동시 설정 가능합니다.' },
      { title: 'Step 4. 활성화', content: '토글 스위치로 자동화를 켜고 끕니다. 최근 실행 시각이 카드에 표시됩니다.' },
    ],
    relatedLinks: [
      { label: '자동화', href: '/dashboard/workflow/automation' },
      { label: '칸반 보드', href: '/dashboard/workflow/kanban' },
      { label: '파이프라인', href: '/dashboard/workflow/pipeline' },
    ],
  },
  {
    id: 'project-guide',
    category: '워크플로우',
    title: '프로젝트로 캠페인 관리하기',
    description: '캠페인 단위의 프로젝트를 생성하고 Phase별 진행률을 추적합니다.',
    steps: [
      { title: 'Step 1. 프로젝트 생성', content: '캠페인이나 주요 이니셔티브 단위로 프로젝트를 생성합니다. 프로젝트명, 설명, 채널, 시작/종료일을 설정하세요.' },
      { title: 'Step 2. Phase 추적', content: '5단계 Phase: Planning → Development → Review → Launch → Complete. 현재 Phase가 진행 바에 시각적으로 표시됩니다.' },
      { title: 'Step 3. 태스크 연결', content: '관련된 칸반 태스크들이 프로젝트에 연결됩니다. 태스크 완료에 따라 진행률이 자동 갱신됩니다.' },
      { title: 'Step 4. 필터 및 현황', content: '채널별/상태별 필터로 프로젝트를 분류하세요. 활성 프로젝트 수, 전체 수, 평균 진행률이 요약됩니다.', tip: '프로젝트를 진단 결과와 연결하면 전체 흐름(진단→기획→제작→실행→결과)을 추적할 수 있습니다.' },
    ],
    relatedLinks: [
      { label: '프로젝트', href: '/dashboard/workflow/projects' },
      { label: '칸반 보드', href: '/dashboard/workflow/kanban' },
      { label: '캘린더', href: '/dashboard/calendar' },
    ],
  },
];
