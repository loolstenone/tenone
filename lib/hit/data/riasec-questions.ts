export interface LikertQuestion {
  id: string;
  text: string;
  reverse?: boolean;
  subscale: string;
}

export const riasecQuestions: LikertQuestion[] = [
  // === R: 현실형 (Realistic) ===
  { id: 'riasec_001', text: '웹사이트나 앱의 기술적 문제를 직접 해결하는 것이 흥미롭다.', subscale: 'R' },
  { id: 'riasec_002', text: '프레젠테이션 자료나 인쇄물의 물리적 완성도를 직접 확인하고 손보는 편이다.', subscale: 'R' },
  { id: 'riasec_003', text: '이벤트 현장에서 부스를 세팅하거나 장비를 직접 다루는 일이 즐겁다.', subscale: 'R' },
  { id: 'riasec_004', text: '촬영 장비나 편집 소프트웨어 같은 도구를 다루는 데 자신이 있다.', subscale: 'R' },
  { id: 'riasec_005', text: '마케팅 자동화 툴이나 CRM 시스템의 기술적 세팅을 직접 해보고 싶다.', subscale: 'R' },
  { id: 'riasec_006', text: '눈에 보이는 결과물(영상, 굿즈, 인쇄물 등)을 만들어냈을 때 성취감을 느낀다.', subscale: 'R' },
  { id: 'riasec_007', text: 'HTML, CSS 같은 기본 코드를 만져서 웹페이지를 수정하는 것이 재미있다.', subscale: 'R' },
  { id: 'riasec_008', text: '사무실에서 기획만 하는 것보다 현장에 나가서 직접 실행하는 일이 더 끌린다.', subscale: 'R' },
  { id: 'riasec_009', text: '디테일한 수작업이 필요한 컨텐츠 제작에서 높은 집중력을 발휘한다.', subscale: 'R' },
  { id: 'riasec_010', text: '기술적 이슈가 생기면 매뉴얼을 보고 직접 해결하는 쪽을 선호한다.', subscale: 'R' },

  // === I: 탐구형 (Investigative) ===
  { id: 'riasec_011', text: '소비자 행동의 심리적 원리를 깊이 파고드는 것에 흥미가 있다.', subscale: 'I' },
  { id: 'riasec_012', text: '캠페인 성과가 왜 그렇게 나왔는지 원인을 분석하는 과정이 재미있다.', subscale: 'I' },
  { id: 'riasec_013', text: 'GA(구글 애널리틱스) 데이터에서 숨겨진 패턴을 발견하면 짜릿하다.', subscale: 'I' },
  { id: 'riasec_014', text: 'A/B 테스트 가설을 세우고 결과를 검증하는 과정에 보람을 느낀다.', subscale: 'I' },
  { id: 'riasec_015', text: '업계 리포트나 연구 논문을 읽으며 인사이트를 얻는 것이 즐겁다.', subscale: 'I' },
  { id: 'riasec_016', text: '겉으로 보이는 트렌드 너머에 있는 구조적 원인을 이해하고 싶다.', subscale: 'I' },
  { id: 'riasec_017', text: 'SQL이나 엑셀 피벗을 써서 데이터를 직접 분석하는 것에 흥미가 있다.', subscale: 'I' },
  { id: 'riasec_018', text: '모르는 것이 생기면 끝까지 파고들어서 이해해야 직성이 풀린다.', subscale: 'I' },
  { id: 'riasec_019', text: '시장 조사를 설계하거나 설문을 구조화하는 작업이 흥미롭다.', subscale: 'I' },
  { id: 'riasec_020', text: '꼼꼼한 리서치보다는 빠른 실행으로 결과를 확인하는 편이 낫다.', reverse: true, subscale: 'I' },

  // === A: 예술형 (Artistic) ===
  { id: 'riasec_021', text: '브랜드의 비주얼 아이덴티티나 캠페인 영상을 직접 기획해보고 싶다.', subscale: 'A' },
  { id: 'riasec_022', text: '카피라이팅, 영상 편집, 디자인 등 크리에이티브 작업에 시간 가는 줄 모른다.', subscale: 'A' },
  { id: 'riasec_023', text: '잘 만든 광고나 브랜딩을 보면 강한 감정적 반응이 일어난다.', subscale: 'A' },
  { id: 'riasec_024', text: '남들이 생각하지 못한 독창적인 캠페인 콘셉트를 떠올리는 것이 즐겁다.', subscale: 'A' },
  { id: 'riasec_025', text: '정해진 템플릿보다 백지에서 자유롭게 아이디어를 전개하는 것을 선호한다.', subscale: 'A' },
  { id: 'riasec_026', text: '컬러, 타이포그래피, 레이아웃 등 시각적 요소에 대한 감각이 있다고 생각한다.', subscale: 'A' },
  { id: 'riasec_027', text: '전시회, 브랜드 팝업스토어, 크리에이티브 컨퍼런스에 자주 다니는 편이다.', subscale: 'A' },
  { id: 'riasec_028', text: '매번 같은 포맷의 보고서를 작성하는 일은 금방 지루해진다.', subscale: 'A' },
  { id: 'riasec_029', text: '참신한 아이디어보다 검증된 방식의 정확한 실행이 더 중요하다고 본다.', reverse: true, subscale: 'A' },
  { id: 'riasec_030', text: '나만의 미적 기준이 뚜렷하고 작업물의 톤앤매너에 민감한 편이다.', subscale: 'A' },

  // === S: 사회형 (Social) ===
  { id: 'riasec_031', text: '신입 동료에게 업무를 알려주거나 멘토링하는 일에 보람을 느낀다.', subscale: 'S' },
  { id: 'riasec_032', text: '프로젝트에서 팀원 간 의견 차이를 조율하는 역할을 자연스럽게 맡는다.', subscale: 'S' },
  { id: 'riasec_033', text: '동료나 후배의 성장을 돕는 일에 시간을 투자하는 것이 아깝지 않다.', subscale: 'S' },
  { id: 'riasec_034', text: '1:1 면담이나 코칭을 통해 사람의 변화를 이끌어내는 것에 적성이 있다.', subscale: 'S' },
  { id: 'riasec_035', text: '기업의 사회적 가치 창출이나 CSR 활동에 참여하고 싶은 마음이 크다.', subscale: 'S' },
  { id: 'riasec_036', text: '비영리 프로젝트나 사회 공헌 캠페인에 자발적으로 시간을 내는 편이다.', subscale: 'S' },
  { id: 'riasec_037', text: '클라이언트나 동료의 고충을 듣고 공감하는 것이 자연스럽다.', subscale: 'S' },
  { id: 'riasec_038', text: 'HR, 교육 기획, 커뮤니티 운영 같은 사람 중심의 일에 관심이 있다.', subscale: 'S' },
  { id: 'riasec_039', text: '팀 작업보다 혼자 조용히 몰입하는 것이 더 편하고 효율적이다.', reverse: true, subscale: 'S' },
  { id: 'riasec_040', text: '다양한 사람들과 소통하며 함께 만들어가는 업무 환경이 좋다.', subscale: 'S' },

  // === E: 기업형 (Enterprising) ===
  { id: 'riasec_041', text: '팀이나 조직을 이끌거나 새로운 사업을 시작하는 데 관심이 크다.', subscale: 'E' },
  { id: 'riasec_042', text: '미팅에서 내 의견을 설득력 있게 전달해 상대의 동의를 이끌어내는 편이다.', subscale: 'E' },
  { id: 'riasec_043', text: '새로운 시장 기회나 비즈니스 아이디어를 발견하면 가슴이 뛴다.', subscale: 'E' },
  { id: 'riasec_044', text: '매출이나 KPI 같은 명확한 성과 지표가 있을 때 동기부여가 된다.', subscale: 'E' },
  { id: 'riasec_045', text: '불확실하더라도 큰 성과가 기대되는 쪽을 선택하는 편이다.', subscale: 'E' },
  { id: 'riasec_046', text: '경쟁 PT나 공모전처럼 승부가 걸린 상황에서 오히려 에너지가 솟는다.', subscale: 'E' },
  { id: 'riasec_047', text: '프로젝트의 전략적 방향을 결정하고 팀을 이끄는 포지션을 원한다.', subscale: 'E' },
  { id: 'riasec_048', text: '업계 사람들과의 네트워킹과 관계 구축에 적극적으로 투자한다.', subscale: 'E' },
  { id: 'riasec_049', text: '고정 급여보다 성과에 연동되는 인센티브 구조가 더 매력적이다.', subscale: 'E' },
  { id: 'riasec_050', text: '직접 이끌기보다 누군가의 지시에 따라 움직이는 것이 더 마음 편하다.', reverse: true, subscale: 'E' },

  // === C: 관습형 (Conventional) ===
  { id: 'riasec_051', text: '대량의 캠페인 데이터를 분류하고 체계적으로 정리하는 작업이 성에 맞는다.', subscale: 'C' },
  { id: 'riasec_052', text: '명확한 가이드라인과 프로세스에 따라 일하는 환경이 편하다.', subscale: 'C' },
  { id: 'riasec_053', text: '예산 관리, 정산, 미디어 바잉 비용 계산 등 숫자 업무에 능숙하다.', subscale: 'C' },
  { id: 'riasec_054', text: '보고서나 제안서를 제출하기 전에 오탈자와 수치를 반복 점검하는 편이다.', subscale: 'C' },
  { id: 'riasec_055', text: '팀의 업무 워크플로우를 표준화하고 효율을 높이는 것에 관심이 있다.', subscale: 'C' },
  { id: 'riasec_056', text: '반복적이더라도 정확하게 처리해야 하는 업무를 꾸준히 잘 해낸다.', subscale: 'C' },
  { id: 'riasec_057', text: '매출 리포트, 광고비 정산 같은 숫자 기반 업무가 부담보다 흥미에 가깝다.', subscale: 'C' },
  { id: 'riasec_058', text: '구조 없이 자유롭게 진행되는 프로젝트에서는 불안감을 느끼는 편이다.', subscale: 'C' },
  { id: 'riasec_059', text: '스프레드시트, 대시보드, 프로젝트 관리 툴을 다루는 것이 익숙하다.', subscale: 'C' },
  { id: 'riasec_060', text: '세세한 디테일을 체크하는 것보다 전체 전략적 방향을 잡는 게 더 중요하다.', reverse: true, subscale: 'C' },
];
