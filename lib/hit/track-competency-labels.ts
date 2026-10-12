/**
 * HIT B 직무 트랙 역량(sub_domain) 한글 이름 + 무엇을 보나 — 22개 트랙 × 6 (2026-10-12)
 * 원천 문항: hit_questions (test_type 'B', module 'competency', track_id). 새 트랙을 넣으면 여기에도 추가한다.
 */
export const TRACK_COMPETENCY_LABELS: Record<string, { label: string; what: string }> = {
  // 광고 기획
  consumer_insight: { label: '소비자 인사이트', what: '조사 자료에서 광고에 쓸 핵심 통찰을 뽑아내는 힘' },
  creative_concept: { label: '크리에이티브 콘셉트', what: '메시지를 하나로 좁혀 아이디어로 넓히는 힘' },
  media_planning: { label: '미디어 플래닝', what: '타깃과 예산에 맞게 매체를 조합하는 힘' },
  copy_story: { label: '카피·스토리', what: '짧은 말과 이야기로 가치를 전하는 힘' },
  campaign_execution: { label: '캠페인 실행', what: '제작·일정·협업을 관리해 캠페인을 완성하는 힘' },
  ad_measurement: { label: '광고 효과 측정', what: '목표 지표를 정하고 결과를 분석하는 힘' },
  // 브랜드 매니지먼트
  brand_strategy: { label: '브랜드 전략', what: '브랜드의 약속과 포지셔닝을 정하는 힘' },
  brand_identity: { label: '브랜드 아이덴티티', what: '이름·시각·말투를 브랜드답게 다듬는 힘' },
  brand_experience: { label: '브랜드 경험', what: '고객 접점의 경험을 설계하고 점검하는 힘' },
  consumer_research: { label: '소비자 조사', what: '조사를 설계하고 결론을 끌어내는 힘' },
  brand_portfolio: { label: '브랜드 포트폴리오', what: '여러 브랜드·라인의 관계를 정리하는 힘' },
  brand_health: { label: '브랜드 건강도', what: '브랜드 지표를 추적하고 성과로 설명하는 힘' },
  // 콘텐츠 마케팅
  content_strategy: { label: '콘텐츠 전략', what: '목적과 타깃에 맞게 콘텐츠를 기획하는 힘' },
  storytelling: { label: '스토리텔링', what: '정보를 이야기로 바꿔 관심을 끄는 힘' },
  platform_channel: { label: '플랫폼·채널', what: '플랫폼별 문법과 알고리즘을 이해하는 힘' },
  content_production: { label: '콘텐츠 제작', what: '기획부터 제작·업로드까지 직접 만드는 힘' },
  community: { label: '커뮤니티', what: '팬과 소통하고 참여를 이끄는 힘' },
  content_analytics: { label: '콘텐츠 분석', what: '반응 지표를 해석해 다음 기획에 반영하는 힘' },
  // 마케팅 전략
  market_analysis: { label: '시장 분석', what: '시장·경쟁 자료로 기회와 위협을 정리하는 힘' },
  stp: { label: 'STP', what: '고객을 나누고 타깃과 포지셔닝을 정하는 힘' },
  marketing_mix: { label: '마케팅 믹스', what: '제품·가격·유통·프로모션을 하나의 전략으로 묶는 힘' },
  campaign_planning: { label: '캠페인 기획', what: '목표부터 일정까지 기획서로 만드는 힘' },
  budget_kpi: { label: '예산·KPI', what: '목표 지표와 예산을 정하고 성과를 계산하는 힘' },
  cross_function: { label: '부서 간 협업', what: '여러 부서·파트너와 목표를 맞춰 실행하는 힘' },
  // 퍼포먼스 마케팅
  funnel_design: { label: '퍼널 설계', what: '고객 단계별 이탈 지점을 찾아 개선하는 힘' },
  ad_platform: { label: '광고 플랫폼 운영', what: '광고 계정을 세팅하고 타깃팅·입찰을 다루는 힘' },
  data_tracking: { label: '데이터 추적', what: '분석 도구로 유입과 전환을 측정하는 힘' },
  experiment: { label: '실험·테스트', what: '가설을 세우고 A/B 테스트로 검증하는 힘' },
  creative_optimization: { label: '소재 최적화', what: '성과 데이터로 광고 소재를 개선하는 힘' },
  roas_budget: { label: 'ROAS·예산', what: '광고 지표를 계산하고 예산을 옮기는 힘' },
  // 건설·건축
  architectural_design: { label: '설계', what: '도면과 설계 의도를 이해하고 다루는 힘' },
  construction_mgmt: { label: '시공 관리', what: '공정·원가·품질을 관리하는 힘' },
  materials: { label: '자재', what: '자재 특성과 선택 기준을 아는 힘' },
  safety_quality: { label: '안전·품질', what: '현장 안전과 품질 기준을 지키는 힘' },
  site_leadership: { label: '현장 리더십', what: '현장 인력과 협력사를 이끄는 힘' },
  supervision: { label: '감리', what: '시공이 기준대로 되는지 점검하는 힘' },
  // 교육·훈련
  teaching: { label: '강의·전달', what: '내용을 이해하기 쉽게 가르치는 힘' },
  curriculum_design: { label: '커리큘럼 설계', what: '학습 목표에 맞게 과정을 짜는 힘' },
  assessment: { label: '평가', what: '학습 성과를 측정하고 피드백하는 힘' },
  learner_support: { label: '학습자 지원', what: '학습자의 동기와 어려움을 돕는 힘' },
  edtech: { label: '에듀테크', what: '디지털 도구로 학습을 설계하는 힘' },
  edu_business: { label: '교육 사업', what: '교육 프로그램을 사업으로 운영하는 힘' },
  // 재무·금융
  financial_analysis: { label: '재무 분석', what: '재무제표와 숫자로 상황을 읽는 힘' },
  corporate_finance: { label: '기업 재무', what: '자금·투자 의사결정을 다루는 힘' },
  fin_reporting: { label: '재무 보고', what: '결산과 보고서를 정확히 만드는 힘' },
  investment: { label: '투자', what: '자산과 투자 대상을 평가하는 힘' },
  compliance: { label: '컴플라이언스', what: '규정과 내부 통제를 지키는 힘' },
  fintech: { label: '핀테크', what: '금융 서비스의 디지털 변화를 이해하는 힘' },
  // 외식·호스피탈리티
  cooking_skill: { label: '조리', what: '음식을 기준에 맞게 만드는 힘' },
  beverage: { label: '음료', what: '음료 메뉴를 이해하고 만드는 힘' },
  food_safety: { label: '위생·식품 안전', what: '위생 기준과 식품 안전을 지키는 힘' },
  hospitality_service: { label: '서비스', what: '손님을 맞이하고 만족시키는 힘' },
  restaurant_ops: { label: '매장 운영', what: '인력·재고·매출을 관리하는 힘' },
  fb_business: { label: 'F&B 사업', what: '메뉴·가격·상권을 사업으로 보는 힘' },
  // 인사·조직
  recruiting: { label: '채용', what: '좋은 사람을 찾고 뽑는 힘' },
  people_mgmt: { label: '인사 운영', what: '평가·보상·인사 제도를 운영하는 힘' },
  learning_dev: { label: '교육·육성', what: '구성원의 성장을 설계하는 힘' },
  org_culture: { label: '조직문화', what: '일하는 방식과 문화를 만드는 힘' },
  hr_analytics: { label: 'HR 데이터', what: '인사 데이터를 분석하는 힘' },
  hr_legal: { label: '노무·법규', what: '근로 관련 법과 규정을 아는 힘' },
  // IT 데이터
  data_processing: { label: '데이터 처리', what: '데이터를 모으고 정리하는 힘' },
  statistics: { label: '통계', what: '통계로 차이와 관계를 판단하는 힘' },
  visualization: { label: '시각화', what: '데이터를 한눈에 보이게 표현하는 힘' },
  ml_basics: { label: '머신러닝 기초', what: '예측 모델의 원리를 이해하는 힘' },
  data_eng: { label: '데이터 엔지니어링', what: '데이터 파이프라인을 만드는 힘' },
  biz_insight: { label: '비즈니스 인사이트', what: '분석 결과를 사업 결정으로 잇는 힘' },
  // IT 개발
  coding: { label: '코딩', what: '요구사항을 동작하는 코드로 만드는 힘' },
  architecture: { label: '설계·아키텍처', what: '시스템 구조를 설계하는 힘' },
  testing: { label: '테스트', what: '품질을 검증하고 버그를 잡는 힘' },
  dev_tools: { label: '개발 도구', what: '버전 관리·배포 도구를 다루는 힘' },
  dev_collab: { label: '개발 협업', what: '코드 리뷰와 협업으로 함께 만드는 힘' },
  dev_growth: { label: '기술 성장', what: '새 기술을 스스로 익히는 힘' },
  // IT 기획
  service_planning: { label: '서비스 기획', what: '사용자 문제를 서비스로 풀어내는 힘' },
  product_mgmt: { label: '프로덕트 관리', what: '우선순위를 정하고 제품을 이끄는 힘' },
  project_mgmt: { label: '프로젝트 관리', what: '일정·범위·리소스를 관리하는 힘' },
  ux_understanding: { label: 'UX 이해', what: '사용자 경험을 이해하고 반영하는 힘' },
  data_literacy: { label: '데이터 리터러시', what: '데이터로 판단 근거를 만드는 힘' },
  tech_literacy: { label: '기술 이해', what: '개발 구조를 이해하고 소통하는 힘' },
  // 법률·전문
  legal_knowledge: { label: '법률 지식', what: '법 체계와 주요 법리를 아는 힘' },
  legal_research: { label: '리서치', what: '판례·법령을 찾고 정리하는 힘' },
  contract_drafting: { label: '계약 작성', what: '계약서를 검토하고 작성하는 힘' },
  litigation: { label: '분쟁·소송', what: '분쟁을 분석하고 대응하는 힘' },
  ip_law: { label: '지식재산', what: '상표·저작권·특허를 다루는 힘' },
  compliance_legal: { label: '준법', what: '기업 준법 체계를 운영하는 힘' },
  // 물류·SCM
  scm_basics: { label: 'SCM 기초', what: '공급망 흐름을 이해하는 힘' },
  logistics_ops: { label: '물류 운영', what: '입출고·재고·배송을 운영하는 힘' },
  distribution: { label: '유통', what: '유통 채널과 흐름을 관리하는 힘' },
  trade_compliance: { label: '무역·통관', what: '수출입 절차와 규정을 다루는 힘' },
  logistics_analytics: { label: '물류 분석', what: '물류 데이터로 효율을 개선하는 힘' },
  logistics_leadership: { label: '물류 리더십', what: '물류 현장과 파트너를 이끄는 힘' },
  // 제조·생산
  production_planning: { label: '생산 계획', what: '수요에 맞게 생산을 계획하는 힘' },
  quality_mgmt: { label: '품질 관리', what: '품질 기준을 세우고 지키는 힘' },
  process_improvement: { label: '공정 개선', what: '공정의 낭비를 찾아 개선하는 힘' },
  supply_chain: { label: '공급망', what: '원자재와 협력사를 관리하는 힘' },
  safety_env: { label: '안전·환경', what: '현장 안전과 환경 기준을 지키는 힘' },
  mfg_leadership: { label: '현장 리더십', what: '생산 인력을 이끄는 힘' },
  // 미디어·방송 (program_planning = 2026-10-12 광고 트랙 media_planning과 키가 겹쳐 분리)
  program_planning: { label: '프로그램 기획', what: '시청자를 분석해 프로그램·영상 기획안을 쓰는 힘' },
  production_media: { label: '촬영·현장 제작', what: '카메라·조명·음향으로 현장을 담아내는 힘' },
  post_production: { label: '후반 작업', what: '편집·그래픽으로 완성도를 높이는 힘' },
  journalism: { label: '취재·보도', what: '사실을 확인하고 전달하는 힘' },
  digital_media: { label: '디지털 미디어', what: '디지털 채널에 맞게 콘텐츠를 다루는 힘' },
  media_industry: { label: '미디어 산업 이해', what: '방송·미디어 산업 구조를 아는 힘' },
  // 의료·보건
  clinical_knowledge: { label: '임상 지식', what: '질환과 처치에 대한 지식' },
  patient_care: { label: '환자 케어', what: '환자를 돌보고 소통하는 힘' },
  medical_teamwork: { label: '의료 협업', what: '의료진과 함께 일하는 힘' },
  medical_ethics: { label: '의료 윤리', what: '환자 안전과 윤리 기준을 지키는 힘' },
  health_admin: { label: '보건 행정', what: '의료 기관 운영과 행정을 다루는 힘' },
  digital_health: { label: '디지털 헬스', what: '의료의 디지털 전환을 이해하는 힘' },
  // 영업·사업개발
  needs_analysis: { label: '니즈 파악', what: '고객이 정말 원하는 것을 찾는 힘' },
  persuasion_sales: { label: '설득·제안', what: '고객에게 맞는 제안으로 설득하는 힘' },
  relationship: { label: '관계 관리', what: '고객과 오래 가는 관계를 만드는 힘' },
  pipeline_mgmt: { label: '파이프라인 관리', what: '영업 기회를 단계별로 관리하는 힘' },
  biz_development: { label: '사업 개발', what: '새 사업 기회를 찾고 만드는 힘' },
  sales_comm: { label: '영업 커뮤니케이션', what: '영업 현장에서 말하고 협상하는 힘' },
  // 서비스·CX
  customer_empathy: { label: '고객 공감', what: '고객의 입장에서 느끼고 이해하는 힘' },
  cs_operation: { label: 'CS 운영', what: '문의와 불만을 체계적으로 처리하는 힘' },
  cx_design: { label: 'CX 설계', what: '고객 여정의 경험을 설계하는 힘' },
  cx_analytics: { label: 'CX 분석', what: '고객 반응 데이터를 분석하는 힘' },
  service_resilience: { label: '서비스 회복력', what: '어려운 고객 상황에서도 흔들리지 않는 힘' },
  cx_leadership: { label: 'CX 리더십', what: '서비스 조직을 이끄는 힘' },
  // 스타트업
  business_model: { label: '비즈니스 모델', what: '돈을 버는 구조를 설계하는 힘' },
  startup_execution: { label: '실행력', what: '적은 자원으로 빠르게 실행하는 힘' },
  growth: { label: '그로스', what: '사용자와 매출을 키우는 힘' },
  funding: { label: '투자 유치', what: '투자자를 설득하고 자금을 확보하는 힘' },
  team_building: { label: '팀 빌딩', what: '함께할 사람을 모으고 이끄는 힘' },
  legal_admin: { label: '법무·행정', what: '창업에 필요한 법과 행정을 다루는 힘' },
  // UX 디자인
  user_research: { label: '사용자 리서치', what: '사용자를 관찰하고 문제를 찾는 힘' },
  interaction_design: { label: '인터랙션 디자인', what: '흐름과 동작을 설계하는 힘' },
  visual_design: { label: '비주얼 디자인', what: '보기 좋고 읽기 쉬운 화면을 만드는 힘' },
  design_tools: { label: '디자인 도구', what: '디자인 도구를 능숙하게 다루는 힘' },
  design_collab: { label: '디자인 협업', what: '기획·개발과 함께 만드는 힘' },
  design_growth: { label: '디자인 성장', what: '감각과 실력을 꾸준히 키우는 힘' },
};

export function trackCompetencyLabel(key: string): string {
  return TRACK_COMPETENCY_LABELS[key]?.label ?? key;
}
