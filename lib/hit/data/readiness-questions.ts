export interface LikertQuestion {
  id: string;
  text: string;
  reverse?: boolean;
  subscale: string;
}

export const readinessQuestions: LikertQuestion[] = [
  // === 자기이해 / 진로 탐색 (self_understanding) ===
  { id: 'ready_001', text: '나는 내 강점과 약점을 구체적으로 설명할 수 있다.', subscale: 'self_understanding' },
  { id: 'ready_002', text: '내가 일에서 중요하게 여기는 가치가 무엇인지 알고 있다.', subscale: 'self_understanding' },
  { id: 'ready_003', text: '나에게 맞는 직무와 산업 분야를 탐색해 본 경험이 있다.', subscale: 'self_understanding' },
  { id: 'ready_004', text: '향후 3~5년의 커리어 방향을 구체적으로 설정했다.', subscale: 'self_understanding' },
  { id: 'ready_005', text: '나의 업무 스타일과 선호하는 조직 문화를 파악하고 있다.', subscale: 'self_understanding' },
  { id: 'ready_006', text: '내가 원하는 직무에 필요한 역량이 무엇인지 모르겠다.', reverse: true, subscale: 'self_understanding' },
  { id: 'ready_007', text: '자기소개서에 나만의 차별화된 경험을 녹여낼 수 있다.', subscale: 'self_understanding' },
  { id: 'ready_008', text: '다양한 직무 탐색 활동(인터뷰, 현장방문 등)에 참여한 적이 있다.', subscale: 'self_understanding' },

  // === 포트폴리오 / 경험 축적 (portfolio) ===
  { id: 'ready_009', text: '지원하려는 분야와 관련된 프로젝트나 활동 경험이 있다.', subscale: 'portfolio' },
  { id: 'ready_010', text: '포트폴리오에 성과를 수치화하여 정리했다.', subscale: 'portfolio' },
  { id: 'ready_011', text: '인턴십, 공모전, 동아리 등에서 실무와 유사한 경험을 쌓았다.', subscale: 'portfolio' },
  { id: 'ready_012', text: '나의 작업물이나 결과물을 체계적으로 아카이빙하고 있다.', subscale: 'portfolio' },
  { id: 'ready_013', text: '실무에서 요구하는 도구나 기술을 사용해 본 경험이 있다.', subscale: 'portfolio' },
  { id: 'ready_014', text: '보여줄 만한 프로젝트 결과물이 아직 부족하다고 느낀다.', reverse: true, subscale: 'portfolio' },
  { id: 'ready_015', text: '경험에서 배운 점을 구조화하여 설명할 수 있다.', subscale: 'portfolio' },
  { id: 'ready_016', text: '지원 직무에 맞게 포트폴리오를 커스터마이징한 적이 있다.', subscale: 'portfolio' },

  // === 커뮤니케이션 / 면접 대비 (interview) ===
  { id: 'ready_017', text: '면접에서 나의 경험을 논리적으로 구조화하여 말할 수 있다.', subscale: 'interview' },
  { id: 'ready_018', text: '예상 질문 리스트를 만들고 답변을 준비해 본 적이 있다.', subscale: 'interview' },
  { id: 'ready_019', text: '압박 면접이나 돌발 질문에도 침착하게 대응할 자신이 있다.', subscale: 'interview' },
  { id: 'ready_020', text: '그룹 토론이나 프레젠테이션 면접에 대비한 경험이 있다.', subscale: 'interview' },
  { id: 'ready_021', text: 'STAR 기법 등 면접 답변 프레임워크를 활용할 수 있다.', subscale: 'interview' },
  { id: 'ready_022', text: '면접 상황에서 긴장하면 말하고 싶은 것을 제대로 전달하지 못한다.', reverse: true, subscale: 'interview' },
  { id: 'ready_023', text: '모의 면접을 통해 피드백을 받고 개선한 경험이 있다.', subscale: 'interview' },
  { id: 'ready_024', text: '비언어적 표현(표정, 자세, 시선)에도 신경을 쓰는 편이다.', subscale: 'interview' },

  // === 네트워크 / 실행력 (network) ===
  { id: 'ready_025', text: '관심 분야의 현직자와 대화하거나 멘토링을 받은 적이 있다.', subscale: 'network' },
  { id: 'ready_026', text: '취업 관련 커뮤니티나 네트워크에 적극적으로 참여하고 있다.', subscale: 'network' },
  { id: 'ready_027', text: '세미나, 컨퍼런스, 워크숍 등에 참석하여 인맥을 넓힌다.', subscale: 'network' },
  { id: 'ready_028', text: '정보를 수집만 하고 실제 행동으로 옮기지 못하는 경우가 많다.', reverse: true, subscale: 'network' },
  { id: 'ready_029', text: '채용 공고를 꾸준히 모니터링하고 지원 일정을 관리한다.', subscale: 'network' },
  { id: 'ready_030', text: '링크드인 등 프로페셔널 네트워크 프로필을 관리하고 있다.', subscale: 'network' },
  { id: 'ready_031', text: '관심 기업의 채용 프로세스와 문화를 미리 파악하려 노력한다.', subscale: 'network' },
  { id: 'ready_032', text: '취업 준비 계획을 구체적으로 세우고 실행에 옮기고 있다.', subscale: 'network' },
];
