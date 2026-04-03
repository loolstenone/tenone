export interface LikertQuestion {
  id: string;
  text: string;
  reverse?: boolean;
  subscale: string;
}

export interface CompetencyQuestion extends LikertQuestion {
  track?: string;
}

export const competencyQuestions: CompetencyQuestion[] = [
  // ============================================================
  // COMMON COMPETENCIES (24 questions, 8 subscales × 3 each)
  // ============================================================

  // --- problem_solving ---
  { id: 'comp_001', text: '문제의 근본 원인을 파악하려고 노력한다.', subscale: 'problem_solving' },
  { id: 'comp_002', text: '복잡한 문제를 작은 단위로 나누어 접근한다.', subscale: 'problem_solving' },
  { id: 'comp_003', text: '문제 상황에서 여러 해결책을 비교 검토하는 편이다.', subscale: 'problem_solving' },

  // --- communication ---
  { id: 'comp_004', text: '내 생각을 상대방이 이해하기 쉽게 전달할 수 있다.', subscale: 'communication' },
  { id: 'comp_005', text: '다른 사람의 의견을 경청하고 핵심을 정확히 파악한다.', subscale: 'communication' },
  { id: 'comp_006', text: '글로 작성한 내용이 명확하다는 평가를 받는다.', subscale: 'communication' },

  // --- self_management ---
  { id: 'comp_007', text: '업무 우선순위를 정하고 계획적으로 시간을 관리한다.', subscale: 'self_management' },
  { id: 'comp_008', text: '스트레스 상황에서도 감정을 조절하며 업무에 집중한다.', subscale: 'self_management' },
  { id: 'comp_009', text: '마감 관리가 부족해 일정이 밀리는 경우가 있다.', reverse: true, subscale: 'self_management' },

  // --- collaboration ---
  { id: 'comp_010', text: '팀 프로젝트에서 역할을 분담하고 조율하는 것을 잘한다.', subscale: 'collaboration' },
  { id: 'comp_011', text: '의견 충돌이 있어도 건설적으로 합의점을 찾는다.', subscale: 'collaboration' },
  { id: 'comp_012', text: '다른 팀원의 기여를 인정하고 피드백을 나눈다.', subscale: 'collaboration' },

  // --- learning_agility ---
  { id: 'comp_013', text: '새로운 도구나 기술을 빠르게 습득하는 편이다.', subscale: 'learning_agility' },
  { id: 'comp_014', text: '실패 경험에서 교훈을 얻고 다음에 적용한다.', subscale: 'learning_agility' },
  { id: 'comp_015', text: '변화하는 환경에 적응하는 것이 어렵게 느껴진다.', reverse: true, subscale: 'learning_agility' },

  // --- initiative ---
  { id: 'comp_016', text: '지시를 기다리기보다 먼저 행동으로 옮기는 편이다.', subscale: 'initiative' },
  { id: 'comp_017', text: '개선할 점을 발견하면 적극적으로 제안한다.', subscale: 'initiative' },
  { id: 'comp_018', text: '주어진 업무 외에 추가적인 가치를 만들려 노력한다.', subscale: 'initiative' },

  // --- customer_focus ---
  { id: 'comp_019', text: '고객이나 이용자의 입장에서 먼저 생각하는 편이다.', subscale: 'customer_focus' },
  { id: 'comp_020', text: '사용자 피드백을 적극적으로 수집하고 반영하려 한다.', subscale: 'customer_focus' },
  { id: 'comp_021', text: '고객 만족보다 내부 효율이 더 중요하다고 생각한다.', reverse: true, subscale: 'customer_focus' },

  // --- digital_literacy ---
  { id: 'comp_022', text: '디지털 도구(협업툴, 분석툴 등)를 능숙하게 사용한다.', subscale: 'digital_literacy' },
  { id: 'comp_023', text: 'AI나 자동화 도구를 업무에 적극 활용한다.', subscale: 'digital_literacy' },
  { id: 'comp_024', text: '새로운 소프트웨어를 배우는 것이 부담스럽다.', reverse: true, subscale: 'digital_literacy' },

  // ============================================================
  // TRACK-SPECIFIC COMPETENCIES (24 questions, 5 tracks)
  // ============================================================

  // --- marketing_strategy (5 questions) ---
  { id: 'comp_025', text: '시장 환경을 분석하여 전략적 방향을 설정할 수 있다.', subscale: 'strategic_thinking', track: 'marketing_strategy' },
  { id: 'comp_026', text: '경쟁사 동향과 시장 트렌드를 체계적으로 파악한다.', subscale: 'market_analysis', track: 'marketing_strategy' },
  { id: 'comp_027', text: '장단기 마케팅 계획을 수립하고 실행한 경험이 있다.', subscale: 'planning', track: 'marketing_strategy' },
  { id: 'comp_028', text: '데이터를 기반으로 마케팅 의사결정을 내릴 수 있다.', subscale: 'data_driven', track: 'marketing_strategy' },
  { id: 'comp_029', text: '다양한 이해관계자와 협업하여 프로젝트를 이끈 경험이 있다.', subscale: 'stakeholder_mgmt', track: 'marketing_strategy' },

  // --- branding (5 questions) ---
  { id: 'comp_030', text: '브랜드 아이덴티티를 명확하게 정의하고 표현할 수 있다.', subscale: 'brand_identity', track: 'branding' },
  { id: 'comp_031', text: '브랜드의 이야기를 매력적으로 전달하는 능력이 있다.', subscale: 'storytelling', track: 'branding' },
  { id: 'comp_032', text: '시각적 요소(로고, 컬러, 타이포)에 대한 감각이 있다.', subscale: 'visual_sense', track: 'branding' },
  { id: 'comp_033', text: '모든 접점에서 일관된 브랜드 경험을 유지하는 것이 중요하다.', subscale: 'consistency', track: 'branding' },
  { id: 'comp_034', text: '소비자의 니즈와 행동 패턴을 깊이 이해하려 노력한다.', subscale: 'consumer_insight', track: 'branding' },

  // --- advertising (5 questions) ---
  { id: 'comp_035', text: '광고 크리에이티브 콘셉트를 기획한 경험이 있다.', subscale: 'creative_concept', track: 'advertising' },
  { id: 'comp_036', text: '매체별 특성을 이해하고 미디어 믹스를 계획할 수 있다.', subscale: 'media_planning', track: 'advertising' },
  { id: 'comp_037', text: '설득력 있는 카피를 작성하는 데 자신이 있다.', subscale: 'copy_writing', track: 'advertising' },
  { id: 'comp_038', text: '캠페인 일정과 예산을 관리하며 집행한 경험이 있다.', subscale: 'campaign_mgmt', track: 'advertising' },
  { id: 'comp_039', text: '타깃 오디언스의 행동을 변화시키는 메시지를 구성할 수 있다.', subscale: 'persuasion', track: 'advertising' },

  // --- content (5 questions) ---
  { id: 'comp_040', text: '다양한 형식(글, 영상, 카드뉴스 등)의 콘텐츠를 제작할 수 있다.', subscale: 'content_creation', track: 'content' },
  { id: 'comp_041', text: '플랫폼별 특성에 맞는 콘텐츠 전략을 세울 수 있다.', subscale: 'platform_knowledge', track: 'content' },
  { id: 'comp_042', text: '팔로워·구독자 참여를 유도하는 콘텐츠를 기획한다.', subscale: 'audience_engagement', track: 'content' },
  { id: 'comp_043', text: 'SEO 원리를 이해하고 검색 최적화 콘텐츠를 작성할 수 있다.', subscale: 'seo', track: 'content' },
  { id: 'comp_044', text: '콘텐츠 캘린더를 관리하고 발행 일정을 조율한 경험이 있다.', subscale: 'editorial', track: 'content' },

  // --- data_performance (4 questions) ---
  { id: 'comp_045', text: 'GA, SQL 등 분석 도구를 활용하여 데이터를 해석할 수 있다.', subscale: 'analytics', track: 'data_performance' },
  { id: 'comp_046', text: 'A/B 테스트를 설계하고 결과를 분석한 경험이 있다.', subscale: 'ab_testing', track: 'data_performance' },
  { id: 'comp_047', text: '전환 퍼널을 분석하여 개선점을 도출할 수 있다.', subscale: 'funnel_optimization', track: 'data_performance' },
  { id: 'comp_048', text: '데이터 분석 결과를 보고서로 정리하여 공유할 수 있다.', subscale: 'reporting', track: 'data_performance' },
];
