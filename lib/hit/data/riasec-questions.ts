export interface LikertQuestion {
  id: string;
  text: string;
  reverse?: boolean;
  subscale: string;
}

export const riasecQuestions: LikertQuestion[] = [
  // === R: 현실형 (Realistic) ===
  { id: 'riasec_001', text: '기계를 조립하거나 수리하는 활동을 좋아한다.', subscale: 'R' },
  { id: 'riasec_002', text: '손으로 직접 무언가를 만드는 작업이 즐겁다.', subscale: 'R' },
  { id: 'riasec_003', text: '야외 활동이나 신체를 쓰는 일을 선호한다.', subscale: 'R' },
  { id: 'riasec_004', text: '도구나 장비를 다루는 데 자신이 있다.', subscale: 'R' },
  { id: 'riasec_005', text: '실험 장비나 기술 장치를 조작하는 것에 흥미가 있다.', subscale: 'R' },
  { id: 'riasec_006', text: '구체적이고 실질적인 결과물이 나오는 일이 보람차다.', subscale: 'R' },
  { id: 'riasec_007', text: '컴퓨터 하드웨어나 전자기기를 다루는 것을 즐긴다.', subscale: 'R' },
  { id: 'riasec_008', text: '사무실에 앉아 하는 일보다 현장 작업이 더 끌린다.', subscale: 'R' },
  { id: 'riasec_009', text: '정밀한 수작업이 필요한 일에 집중력을 발휘한다.', subscale: 'R' },
  { id: 'riasec_010', text: '기술적인 문제를 직접 손으로 해결하는 것을 선호한다.', subscale: 'R' },

  // === I: 탐구형 (Investigative) ===
  { id: 'riasec_011', text: '과학적 원리를 탐구하고 연구하는 것에 흥미가 있다.', subscale: 'I' },
  { id: 'riasec_012', text: '복잡한 문제의 원인을 분석하는 과정이 재미있다.', subscale: 'I' },
  { id: 'riasec_013', text: '데이터를 수집하고 패턴을 발견하는 일을 즐긴다.', subscale: 'I' },
  { id: 'riasec_014', text: '가설을 세우고 검증하는 과정에 보람을 느낀다.', subscale: 'I' },
  { id: 'riasec_015', text: '논문이나 전문 서적을 읽는 것이 즐겁다.', subscale: 'I' },
  { id: 'riasec_016', text: '현상의 이면에 있는 원리를 이해하고 싶다.', subscale: 'I' },
  { id: 'riasec_017', text: '수학적이거나 통계적인 분석에 흥미가 있다.', subscale: 'I' },
  { id: 'riasec_018', text: '지적 호기심이 강해서 끊임없이 질문한다.', subscale: 'I' },
  { id: 'riasec_019', text: '실험이나 조사를 설계하는 일이 흥미롭다.', subscale: 'I' },
  { id: 'riasec_020', text: '깊이 있는 연구보다 빠른 실행이 더 중요하다.', reverse: true, subscale: 'I' },

  // === A: 예술형 (Artistic) ===
  { id: 'riasec_021', text: '창작 활동이나 예술적 표현을 즐긴다.', subscale: 'A' },
  { id: 'riasec_022', text: '글쓰기, 그림, 음악 등 창의적 활동에 시간을 많이 쓴다.', subscale: 'A' },
  { id: 'riasec_023', text: '아름다운 것을 보면 강한 감정적 반응이 생긴다.', subscale: 'A' },
  { id: 'riasec_024', text: '독창적인 아이디어를 떠올리는 것이 즐겁다.', subscale: 'A' },
  { id: 'riasec_025', text: '정해진 틀 없이 자유롭게 표현하는 것을 선호한다.', subscale: 'A' },
  { id: 'riasec_026', text: '디자인이나 시각적 요소에 대한 감각이 있다고 생각한다.', subscale: 'A' },
  { id: 'riasec_027', text: '공연이나 전시 등 문화예술 활동에 자주 참여한다.', subscale: 'A' },
  { id: 'riasec_028', text: '반복적이고 정형화된 작업은 지루하게 느껴진다.', subscale: 'A' },
  { id: 'riasec_029', text: '창의성보다 정확성이 더 중요하다고 생각한다.', reverse: true, subscale: 'A' },
  { id: 'riasec_030', text: '나만의 스타일이나 미적 기준이 뚜렷하다.', subscale: 'A' },

  // === S: 사회형 (Social) ===
  { id: 'riasec_031', text: '다른 사람들을 가르치거나 돕는 일에 보람을 느낀다.', subscale: 'S' },
  { id: 'riasec_032', text: '팀원 간의 갈등을 중재하는 역할을 잘 한다.', subscale: 'S' },
  { id: 'riasec_033', text: '사람들의 성장을 지원하는 일에 관심이 많다.', subscale: 'S' },
  { id: 'riasec_034', text: '상담이나 코칭 활동에 적성이 있다고 느낀다.', subscale: 'S' },
  { id: 'riasec_035', text: '사회적 문제 해결에 기여하고 싶다.', subscale: 'S' },
  { id: 'riasec_036', text: '봉사활동이나 사회공헌에 시간을 투자하는 편이다.', subscale: 'S' },
  { id: 'riasec_037', text: '다른 사람의 이야기를 듣고 공감하는 것이 자연스럽다.', subscale: 'S' },
  { id: 'riasec_038', text: '교육이나 복지 분야에서 일하는 것에 관심이 있다.', subscale: 'S' },
  { id: 'riasec_039', text: '혼자 일하는 것이 다른 사람과 함께하는 것보다 편하다.', reverse: true, subscale: 'S' },
  { id: 'riasec_040', text: '사람들과 소통하며 협력하는 환경을 선호한다.', subscale: 'S' },

  // === E: 기업형 (Enterprising) ===
  { id: 'riasec_041', text: '조직을 이끌거나 사업을 운영하는 데 관심이 있다.', subscale: 'E' },
  { id: 'riasec_042', text: '다른 사람을 설득하여 내 의견에 동의하게 만드는 것을 잘한다.', subscale: 'E' },
  { id: 'riasec_043', text: '새로운 사업 기회를 발견하면 흥분된다.', subscale: 'E' },
  { id: 'riasec_044', text: '영업, 마케팅 등 성과가 명확한 일이 동기부여가 된다.', subscale: 'E' },
  { id: 'riasec_045', text: '리스크를 감수하더라도 큰 목표를 추구한다.', subscale: 'E' },
  { id: 'riasec_046', text: '경쟁 상황에서 오히려 활력을 느낀다.', subscale: 'E' },
  { id: 'riasec_047', text: '프로젝트의 방향과 전략을 결정하는 역할이 좋다.', subscale: 'E' },
  { id: 'riasec_048', text: '네트워킹이나 인맥 관리에 적극적이다.', subscale: 'E' },
  { id: 'riasec_049', text: '안정적인 급여보다 성과에 따른 보상을 선호한다.', subscale: 'E' },
  { id: 'riasec_050', text: '남을 이끄는 것보다 지시를 따르는 것이 편하다.', reverse: true, subscale: 'E' },

  // === C: 관습형 (Conventional) ===
  { id: 'riasec_051', text: '데이터를 정리하고 체계적으로 관리하는 것을 잘한다.', subscale: 'C' },
  { id: 'riasec_052', text: '정해진 절차와 규칙에 따라 일하는 것이 편하다.', subscale: 'C' },
  { id: 'riasec_053', text: '숫자나 수치를 다루는 작업에 능숙하다.', subscale: 'C' },
  { id: 'riasec_054', text: '서류나 문서를 꼼꼼하게 검토하는 편이다.', subscale: 'C' },
  { id: 'riasec_055', text: '업무 프로세스를 표준화하고 효율화하는 데 관심이 있다.', subscale: 'C' },
  { id: 'riasec_056', text: '정확하고 반복적인 작업을 꾸준히 해내는 것에 자신 있다.', subscale: 'C' },
  { id: 'riasec_057', text: '회계, 재무 등 숫자 기반의 업무에 흥미가 있다.', subscale: 'C' },
  { id: 'riasec_058', text: '체계 없이 자유롭게 진행되는 업무가 불편하다.', subscale: 'C' },
  { id: 'riasec_059', text: '스프레드시트나 데이터베이스를 다루는 것이 익숙하다.', subscale: 'C' },
  { id: 'riasec_060', text: '세밀한 확인 작업보다 큰 그림을 보는 것이 더 중요하다.', reverse: true, subscale: 'C' },
];
