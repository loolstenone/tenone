/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export type CourseStatus = "미이수" | "학습중" | "이수완료";
export type CategoryFilter = "전체" | "필수" | "전문" | "심화";
export type StatusFilter = "전체" | "미이수" | "학습중" | "이수완료";
export type TabId = "전체 과정" | "내 수료 현황" | "VRIEF" | "GPR";

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface Course {
  id: number;
  title: string;
  subtitle: string;
  category: "필수" | "전문" | "심화";
  duration: string;
  durationMin: number;
  status: CourseStatus;
  score: number | null;
  completedDate: string | null;
  description: string;
  objectives: string[];
  targetAudience: string;
  instructor: string;
  quiz: QuizQuestion[];
}

/* ================================================================== */
/*  Course Data (20 courses)                                           */
/* ================================================================== */

export const initialCourses: Course[] = [
  // ── 필수 (7) ──
  {
    id: 1,
    title: "Ten:One™ Universe 입문",
    subtitle: "Introduction to Ten:One Universe",
    category: "필수",
    duration: "30분",
    durationMin: 30,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "Ten:One Universe의 세계관과 브랜드 생태계를 이해하는 입문 과정입니다. Vision House 구조를 통해 각 브랜드의 역할과 관계를 파악하고, 전체 유니버스의 방향성을 학습합니다.",
    objectives: [
      "Ten:One Universe 세계관의 핵심 구조를 이해한다",
      "Vision House 프레임워크를 설명할 수 있다",
      "각 브랜드의 역할과 상호 관계를 파악한다",
      "유니버스 확장 전략의 기본 원리를 이해한다",
    ],
    targetAudience: "전 직원 (신입 필수)",
    instructor: "텐원 경영기획실",
    quiz: [
      {
        q: "Ten:One Universe의 핵심 철학은?",
        options: [
          "이윤 극대화",
          "브랜드 간 시너지와 생태계 성장",
          "단일 브랜드 집중",
          "외부 투자 유치",
        ],
        answer: 1,
      },
      {
        q: "Vision House의 최상위 요소는?",
        options: ["Mission", "Vision", "Values", "Strategy"],
        answer: 1,
      },
      {
        q: "Ten:One의 브랜드 관계 유형이 아닌 것은?",
        options: ["Parent", "Collaboration", "Rivals", "Acquisition"],
        answer: 3,
      },
    ],
  },
  {
    id: 2,
    title: "Principle 10",
    subtitle: "Ten Core Principles",
    category: "필수",
    duration: "45분",
    durationMin: 45,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "Ten:One의 10대 핵심 원칙을 심도있게 학습합니다. 각 원칙이 실무에서 어떻게 적용되는지 사례와 함께 이해하고, 의사결정의 기준으로 활용하는 방법을 배웁니다.",
    objectives: [
      "10대 원칙을 모두 열거하고 설명할 수 있다",
      "각 원칙의 실무 적용 사례를 이해한다",
      "원칙 기반 의사결정 프로세스를 습득한다",
    ],
    targetAudience: "전 직원",
    instructor: "텐원 경영기획실",
    quiz: [
      {
        q: "Principle 10 중 첫 번째 원칙은?",
        options: ["속도", "본질", "협업", "창의"],
        answer: 1,
      },
      {
        q: "원칙 기반 의사결정의 핵심은?",
        options: [
          "상사의 판단 따르기",
          "원칙을 기준으로 스스로 판단",
          "다수결",
          "외부 컨설팅",
        ],
        answer: 1,
      },
      {
        q: "Principle 10이 적용되는 범위는?",
        options: [
          "경영진만",
          "마케팅 부서만",
          "전 직원·전 프로젝트",
          "외부 파트너만",
        ],
        answer: 2,
      },
    ],
  },
  {
    id: 3,
    title: "Culture & Mind Set",
    subtitle: "Organizational Culture",
    category: "필수",
    duration: "30분",
    durationMin: 30,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "본질·속도·이행의 3대 문화 코드를 중심으로 Ten:One의 조직문화를 이해합니다. 구성원으로서 갖추어야 할 마인드셋과 행동 양식을 학습합니다.",
    objectives: [
      "본질·속도·이행의 의미를 정확히 이해한다",
      "일상 업무에서 문화 코드를 실천하는 방법을 안다",
      "Ten:One의 조직문화가 성과에 미치는 영향을 이해한다",
    ],
    targetAudience: "전 직원 (신입 필수)",
    instructor: "텐원 인사팀",
    quiz: [
      {
        q: "Ten:One의 3대 문화 코드가 아닌 것은?",
        options: ["본질", "속도", "안정", "이행"],
        answer: 2,
      },
      {
        q: "'이행'이 의미하는 것은?",
        options: [
          "계획만 세우기",
          "말한 것을 반드시 실행하는 것",
          "이직 준비",
          "보고서 작성",
        ],
        answer: 1,
      },
      {
        q: "문화 코드의 적용 대상은?",
        options: ["리더만", "신입만", "전 구성원", "외부 파트너"],
        answer: 2,
      },
    ],
  },
  {
    id: 4,
    title: "GPR",
    subtitle: "Goal · Plan · Result",
    category: "필수",
    duration: "60분",
    durationMin: 60,
    status: "이수완료",
    score: 90,
    completedDate: "2026-02-01",
    description:
      "GPR(Goal·Plan·Result)은 Ten:One의 핵심 성장 프레임워크입니다. 목표 설정부터 계획 수립, 결과 측정까지의 전 과정을 체계적으로 학습하고, 개인과 팀의 성장을 위한 실전 도구를 익힙니다.",
    objectives: [
      "GPR 프레임워크의 3단계 구조를 이해한다",
      "SMART 목표 설정법을 GPR에 적용할 수 있다",
      "Plan 단계에서 구체적인 실행 계획을 수립한다",
      "Result 측정 및 회고 프로세스를 수행할 수 있다",
    ],
    targetAudience: "전 직원",
    instructor: "텐원 인사팀",
    quiz: [
      {
        q: "GPR에서 G는 무엇을 의미하는가?",
        options: ["Growth", "Goal", "Guide", "Grade"],
        answer: 1,
      },
      {
        q: "GPR 사이클의 올바른 순서는?",
        options: [
          "Plan→Goal→Result",
          "Goal→Result→Plan",
          "Goal→Plan→Result",
          "Result→Plan→Goal",
        ],
        answer: 2,
      },
      {
        q: "GPR의 Result 단계에서 가장 중요한 것은?",
        options: [
          "상사 보고",
          "수치 달성률만 확인",
          "회고와 다음 Goal 연결",
          "보상 산정",
        ],
        answer: 2,
      },
    ],
  },
  {
    id: 5,
    title: "VRIEF 프레임워크",
    subtitle: "VRIEF Framework",
    category: "필수",
    duration: "60분",
    durationMin: 60,
    status: "이수완료",
    score: 100,
    completedDate: "2026-01-15",
    description:
      "VRIEF는 조사(Verify)→가설검증(Research)→전략수립(Insight·Execute·Feedback)의 5단계 프레임워크입니다. 데이터 기반 의사결정과 전략 수립의 표준 프로세스를 습득합니다.",
    objectives: [
      "VRIEF 5단계 프로세스를 완벽히 이해한다",
      "각 단계별 산출물과 도구를 활용할 수 있다",
      "실제 프로젝트에 VRIEF를 적용할 수 있다",
      "가설 검증 방법론을 실무에 적용한다",
    ],
    targetAudience: "전 직원 (기획·전략 부서 필수)",
    instructor: "텐원 전략기획실",
    quiz: [
      {
        q: "VRIEF의 V는 무엇인가?",
        options: ["Vision", "Value", "Verify", "Validate"],
        answer: 2,
      },
      {
        q: "VRIEF 프로세스의 올바른 순서는?",
        options: [
          "Research→Verify→Insight→Execute→Feedback",
          "Verify→Research→Insight→Execute→Feedback",
          "Insight→Verify→Research→Execute→Feedback",
          "Verify→Insight→Research→Execute→Feedback",
        ],
        answer: 1,
      },
      {
        q: "VRIEF에서 가장 중요한 단계는?",
        options: [
          "모든 단계가 순환적으로 중요",
          "Verify만 중요",
          "Execute만 중요",
          "Feedback은 선택",
        ],
        answer: 0,
      },
    ],
  },
  {
    id: 6,
    title: "정보보안",
    subtitle: "Information Security",
    category: "필수",
    duration: "20분",
    durationMin: 20,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "조직 내 정보보안 정책과 개인정보 보호 규정을 학습합니다. 일상 업무에서의 보안 수칙과 사고 발생 시 대응 절차를 이해합니다.",
    objectives: [
      "정보보안 정책의 핵심 내용을 이해한다",
      "개인정보 보호 규정을 준수할 수 있다",
      "보안 사고 발생 시 대응 절차를 안다",
    ],
    targetAudience: "전 직원 (연 1회 필수)",
    instructor: "텐원 정보보안팀",
    quiz: [
      {
        q: "비밀번호 관리의 기본 원칙은?",
        options: [
          "쉽게 기억할 수 있는 것",
          "모든 서비스 동일 비밀번호",
          "주기적 변경 + 복잡도 확보",
          "메모장에 기록",
        ],
        answer: 2,
      },
      {
        q: "개인정보 유출 발견 시 첫 번째 행동은?",
        options: [
          "무시한다",
          "즉시 보안팀에 보고",
          "동료에게만 알린다",
          "SNS에 공유한다",
        ],
        answer: 1,
      },
      {
        q: "사내 문서 외부 반출 시 필요한 것은?",
        options: ["아무것도 필요 없음", "동료 승인", "상급자 승인", "자유롭게 가능"],
        answer: 2,
      },
    ],
  },
  {
    id: 7,
    title: "괴롭힘 예방",
    subtitle: "Workplace Harassment Prevention",
    category: "필수",
    duration: "20분",
    durationMin: 20,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "직장 내 괴롭힘의 유형과 판단 기준을 학습하고, 예방 및 대응 방법을 이해합니다. 건강한 조직문화를 만들기 위한 구성원의 역할을 배웁니다.",
    objectives: [
      "직장 내 괴롭힘의 법적 정의와 유형을 안다",
      "괴롭힘 발생 시 신고 및 대응 절차를 이해한다",
      "예방을 위한 일상적 실천 방법을 습득한다",
    ],
    targetAudience: "전 직원 (연 1회 필수)",
    instructor: "텐원 인사팀",
    quiz: [
      {
        q: "직장 내 괴롭힘에 해당하지 않는 것은?",
        options: [
          "반복적 무시",
          "업무상 합리적 지시",
          "인격 모독적 발언",
          "부당한 업무 배제",
        ],
        answer: 1,
      },
      {
        q: "괴롭힘을 목격했을 때 올바른 행동은?",
        options: [
          "모른 척 한다",
          "피해자에게만 위로한다",
          "신고 절차를 통해 보고한다",
          "가해자에게 직접 항의한다",
        ],
        answer: 2,
      },
      {
        q: "괴롭힘 예방의 가장 중요한 요소는?",
        options: [
          "강력한 처벌",
          "상호 존중의 조직 문화",
          "CCTV 설치",
          "익명 신고함",
        ],
        answer: 1,
      },
    ],
  },

  // ── 전문 (7) ──
  {
    id: 8,
    title: "기획",
    subtitle: "Strategic Planning",
    category: "전문",
    duration: "90분",
    durationMin: 90,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "전략 기획의 기본 프레임워크부터 실전 기획서 작성까지를 다룹니다. SWOT, 3C, STP 등 핵심 분석 도구와 기획 프로세스를 체계적으로 학습합니다.",
    objectives: [
      "전략 기획의 기본 프레임워크를 이해한다",
      "SWOT, 3C, STP 분석을 실무에 적용할 수 있다",
      "설득력 있는 기획서를 작성할 수 있다",
      "기획안의 실행 가능성을 평가할 수 있다",
    ],
    targetAudience: "기획·전략 부서, 팀 리더",
    instructor: "텐원 전략기획실",
    quiz: [
      {
        q: "SWOT 분석에서 S는?",
        options: ["Strategy", "Strength", "System", "Speed"],
        answer: 1,
      },
      {
        q: "STP에서 P는?",
        options: ["Planning", "Positioning", "Pricing", "Promotion"],
        answer: 1,
      },
      {
        q: "기획서의 핵심 요소가 아닌 것은?",
        options: ["문제 정의", "해결 방안", "기대 효과", "개인 소감"],
        answer: 3,
      },
    ],
  },
  {
    id: 9,
    title: "마케팅",
    subtitle: "Marketing Fundamentals",
    category: "전문",
    duration: "90분",
    durationMin: 90,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "디지털 마케팅의 핵심 개념과 실전 전략을 학습합니다. 퍼포먼스 마케팅, 콘텐츠 마케팅, 그로스 해킹 등 현대 마케팅의 주요 방법론을 다룹니다.",
    objectives: [
      "디지털 마케팅의 핵심 채널과 전략을 이해한다",
      "퍼포먼스 마케팅 지표를 분석할 수 있다",
      "콘텐츠 마케팅 전략을 수립할 수 있다",
    ],
    targetAudience: "마케팅 부서, 콘텐츠 팀",
    instructor: "텐원 마케팅팀",
    quiz: [
      {
        q: "CAC의 의미는?",
        options: [
          "Content Acquisition Cost",
          "Customer Acquisition Cost",
          "Channel Analysis Chart",
          "Campaign Approval Checklist",
        ],
        answer: 1,
      },
      {
        q: "퍼포먼스 마케팅의 핵심 지표가 아닌 것은?",
        options: ["CTR", "CPC", "ROAS", "GDP"],
        answer: 3,
      },
      {
        q: "그로스 해킹의 핵심은?",
        options: [
          "대규모 광고 집행",
          "데이터 기반 실험과 빠른 반복",
          "브랜드 이미지 제고",
          "TV 광고",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 10,
    title: "광고",
    subtitle: "Advertising & Media",
    category: "전문",
    duration: "90분",
    durationMin: 90,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "온라인·오프라인 광고 매체의 특성과 광고 전략 수립 방법을 학습합니다. 매체 믹스, 크리에이티브 기획, 광고 성과 측정의 전 과정을 다룹니다.",
    objectives: [
      "주요 광고 매체의 특성을 이해한다",
      "매체 믹스 전략을 수립할 수 있다",
      "광고 성과 측정 및 최적화 방법을 안다",
    ],
    targetAudience: "마케팅·광고 부서",
    instructor: "텐원 마케팅팀",
    quiz: [
      {
        q: "CPM의 의미는?",
        options: [
          "Cost Per Mile",
          "Cost Per Mille (1000 노출당 비용)",
          "Click Per Minute",
          "Campaign Performance Metric",
        ],
        answer: 1,
      },
      {
        q: "리타겟팅 광고의 원리는?",
        options: [
          "신규 고객만 타겟",
          "기존 방문자를 다시 타겟",
          "경쟁사 고객 타겟",
          "랜덤 타겟",
        ],
        answer: 1,
      },
      {
        q: "A/B 테스트의 목적은?",
        options: [
          "디자인 취향 결정",
          "데이터 기반으로 더 효과적인 안을 선택",
          "예산 절감",
          "보고서 작성",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 11,
    title: "브랜딩",
    subtitle: "Brand Strategy & Identity",
    category: "전문",
    duration: "60분",
    durationMin: 60,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "브랜드 전략 수립과 아이덴티티 구축의 전 과정을 학습합니다. 브랜드 포지셔닝, 네이밍, 비주얼 아이덴티티, 브랜드 경험 설계를 다룹니다.",
    objectives: [
      "브랜드 전략의 핵심 요소를 이해한다",
      "브랜드 포지셔닝 맵을 작성할 수 있다",
      "일관된 브랜드 경험을 설계할 수 있다",
    ],
    targetAudience: "브랜드·마케팅 부서, 디자인 팀",
    instructor: "텐원 브랜드전략팀",
    quiz: [
      {
        q: "브랜드 아이덴티티의 핵심 구성 요소가 아닌 것은?",
        options: ["로고", "컬러", "주가", "타이포그래피"],
        answer: 2,
      },
      {
        q: "브랜드 포지셔닝이란?",
        options: [
          "매장 위치 선정",
          "소비자 인식 속 차별화된 위치 확보",
          "가격 전략",
          "광고 위치 선정",
        ],
        answer: 1,
      },
      {
        q: "브랜드 에쿼티의 핵심은?",
        options: [
          "재무적 가치만",
          "브랜드가 가진 무형의 자산 가치",
          "직원 수",
          "사무실 면적",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 12,
    title: "콘텐츠 제작",
    subtitle: "Content Production",
    category: "전문",
    duration: "60분",
    durationMin: 60,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "영상, 이미지, 텍스트 등 다양한 콘텐츠 제작의 기본기와 플랫폼별 최적화 전략을 학습합니다. 기획부터 제작, 배포까지의 콘텐츠 파이프라인을 다룹니다.",
    objectives: [
      "콘텐츠 제작의 전체 프로세스를 이해한다",
      "플랫폼별 콘텐츠 최적화 전략을 수립할 수 있다",
      "콘텐츠 캘린더를 기획하고 관리할 수 있다",
    ],
    targetAudience: "콘텐츠·마케팅 부서",
    instructor: "텐원 콘텐츠팀",
    quiz: [
      {
        q: "콘텐츠 제작 시 가장 먼저 해야 할 것은?",
        options: ["촬영", "편집", "타겟 및 목적 정의", "업로드"],
        answer: 2,
      },
      {
        q: "숏폼 콘텐츠의 적정 길이는?",
        options: ["30초~1분", "10분~20분", "1시간 이상", "5분~10분"],
        answer: 0,
      },
      {
        q: "콘텐츠 캘린더의 주요 목적은?",
        options: [
          "일정 시각화만",
          "체계적인 제작·배포 관리",
          "디자인 참고",
          "예산 관리",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 13,
    title: "인공지능",
    subtitle: "AI & Machine Learning",
    category: "전문",
    duration: "90분",
    durationMin: 90,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "인공지능과 머신러닝의 기본 개념을 이해하고, 비즈니스에서의 AI 활용 전략을 학습합니다. 생성형 AI, 프롬프트 엔지니어링, AI 윤리 등을 다룹니다.",
    objectives: [
      "AI/ML의 기본 개념과 주요 용어를 이해한다",
      "생성형 AI를 업무에 효과적으로 활용할 수 있다",
      "프롬프트 엔지니어링 기법을 습득한다",
      "AI 활용 시 윤리적 고려사항을 이해한다",
    ],
    targetAudience: "전 직원 (기술 부서 필수)",
    instructor: "텐원 AI연구팀",
    quiz: [
      {
        q: "생성형 AI의 대표적 예시가 아닌 것은?",
        options: ["ChatGPT", "DALL-E", "Excel", "Midjourney"],
        answer: 2,
      },
      {
        q: "프롬프트 엔지니어링이란?",
        options: [
          "하드웨어 설계",
          "AI에게 효과적인 질문/지시를 작성하는 기술",
          "데이터베이스 설계",
          "네트워크 구성",
        ],
        answer: 1,
      },
      {
        q: "AI 활용 시 가장 중요한 윤리적 고려사항은?",
        options: [
          "속도 최적화",
          "편향성 확인과 개인정보 보호",
          "비용 절감",
          "UI 디자인",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 14,
    title: "커뮤니티 운영",
    subtitle: "Community Management",
    category: "전문",
    duration: "60분",
    durationMin: 60,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "온라인/오프라인 커뮤니티의 구축과 운영 전략을 학습합니다. 멤버 참여 유도, 갈등 관리, 커뮤니티 성장 전략 등 실전 운영 노하우를 다룹니다.",
    objectives: [
      "커뮤니티 구축의 핵심 원칙을 이해한다",
      "멤버 참여율을 높이는 전략을 수립할 수 있다",
      "커뮤니티 내 갈등 상황에 대응할 수 있다",
    ],
    targetAudience: "커뮤니티·마케팅 부서",
    instructor: "텐원 커뮤니티팀",
    quiz: [
      {
        q: "건강한 커뮤니티의 핵심 요소는?",
        options: [
          "멤버 수만 중요",
          "공유 가치와 활발한 상호작용",
          "엄격한 규칙",
          "빈번한 이벤트",
        ],
        answer: 1,
      },
      {
        q: "커뮤니티 운영에서 가장 어려운 점은?",
        options: [
          "가입자 모집",
          "지속적인 참여 유도와 관계 관리",
          "디자인",
          "기술 구현",
        ],
        answer: 1,
      },
      {
        q: "커뮤니티 성장의 핵심 지표는?",
        options: ["가입자 수만", "DAU/MAU와 참여율", "매출만", "포스팅 수만"],
        answer: 1,
      },
    ],
  },

  // ── 심화 (6) ──
  {
    id: 15,
    title: "창업",
    subtitle: "Entrepreneurship",
    category: "심화",
    duration: "120분",
    durationMin: 120,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "스타트업 창업의 A to Z를 다룹니다. 아이디어 검증, 비즈니스 모델 수립, 팀 빌딩, 투자 유치, 법률·회계 기초까지 창업에 필요한 전반적인 지식을 학습합니다.",
    objectives: [
      "린 스타트업 방법론을 이해하고 적용할 수 있다",
      "비즈니스 모델 캔버스를 작성할 수 있다",
      "MVP를 기획하고 검증할 수 있다",
      "투자 유치 프로세스를 이해한다",
    ],
    targetAudience: "창업 관심자, 사내 벤처 팀",
    instructor: "텐원 경영지원실",
    quiz: [
      {
        q: "MVP의 의미는?",
        options: [
          "Most Valuable Player",
          "Minimum Viable Product",
          "Maximum Value Proposition",
          "Minimum Variable Price",
        ],
        answer: 1,
      },
      {
        q: "린 스타트업의 핵심 사이클은?",
        options: [
          "기획→개발→출시",
          "Build→Measure→Learn",
          "투자→개발→매각",
          "아이디어→특허→생산",
        ],
        answer: 1,
      },
      {
        q: "피봇(Pivot)이란?",
        options: [
          "사업 포기",
          "핵심 가설을 변경하여 방향 전환",
          "추가 투자 유치",
          "팀 해체",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 16,
    title: "프로젝트 매니지먼트",
    subtitle: "Project Management",
    category: "심화",
    duration: "90분",
    durationMin: 90,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "프로젝트 관리의 핵심 방법론과 실전 도구를 학습합니다. 애자일, 스크럼, 칸반 등 현대적 PM 방법론과 리스크 관리, 이해관계자 관리를 다룹니다.",
    objectives: [
      "애자일/스크럼/칸반의 차이를 이해한다",
      "프로젝트 일정과 리소스를 효과적으로 관리할 수 있다",
      "리스크 식별 및 대응 전략을 수립할 수 있다",
    ],
    targetAudience: "PM, 팀 리더, 프로젝트 참여자",
    instructor: "텐원 PMO",
    quiz: [
      {
        q: "스크럼에서 스프린트의 일반적인 기간은?",
        options: ["1일", "1~4주", "3개월", "6개월"],
        answer: 1,
      },
      {
        q: "칸반 보드의 핵심 원칙은?",
        options: [
          "WIP 제한과 흐름 시각화",
          "엄격한 일정 관리",
          "개인 성과 측정",
          "문서 중심 관리",
        ],
        answer: 0,
      },
      {
        q: "프로젝트 리스크 관리의 첫 단계는?",
        options: ["리스크 회피", "리스크 식별", "리스크 전가", "리스크 수용"],
        answer: 1,
      },
    ],
  },
  {
    id: 17,
    title: "데이터 분석",
    subtitle: "Data Analytics",
    category: "심화",
    duration: "90분",
    durationMin: 90,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "데이터 기반 의사결정을 위한 분석 방법론과 도구를 학습합니다. 데이터 수집, 정제, 분석, 시각화의 전 과정과 비즈니스 인사이트 도출 방법을 다룹니다.",
    objectives: [
      "데이터 분석의 기본 프로세스를 이해한다",
      "주요 분석 도구를 활용할 수 있다",
      "데이터 시각화를 통해 인사이트를 전달할 수 있다",
    ],
    targetAudience: "데이터·기획·마케팅 부서",
    instructor: "텐원 데이터팀",
    quiz: [
      {
        q: "데이터 분석의 올바른 순서는?",
        options: [
          "시각화→수집→분석",
          "수집→정제→분석→시각화",
          "분석→수집→보고",
          "보고→분석→수집",
        ],
        answer: 1,
      },
      {
        q: "상관관계와 인과관계의 차이는?",
        options: [
          "같은 의미",
          "상관관계는 연관성, 인과관계는 원인-결과",
          "인과관계가 상관관계에 포함",
          "차이 없음",
        ],
        answer: 1,
      },
      {
        q: "데이터 시각화의 핵심 원칙은?",
        options: [
          "최대한 복잡하게",
          "명확하고 정직한 데이터 표현",
          "3D 차트 사용",
          "색상 최대한 많이",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 18,
    title: "리더십",
    subtitle: "Leadership & Management",
    category: "심화",
    duration: "60분",
    durationMin: 60,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "현대 조직에서 요구되는 리더십의 핵심 역량을 학습합니다. 서번트 리더십, 코칭, 피드백, 동기부여 등 실전 리더십 스킬을 다룹니다.",
    objectives: [
      "다양한 리더십 스타일을 이해하고 상황에 맞게 적용한다",
      "효과적인 피드백 기법을 습득한다",
      "팀 동기부여와 성과 관리 방법을 안다",
    ],
    targetAudience: "팀 리더, 관리자, 리더십 후보",
    instructor: "텐원 리더십센터",
    quiz: [
      {
        q: "서번트 리더십의 핵심은?",
        options: [
          "지시와 통제",
          "구성원을 섬기고 성장을 돕는 것",
          "성과만 중시",
          "권위적 리더십",
        ],
        answer: 1,
      },
      {
        q: "효과적인 피드백의 원칙이 아닌 것은?",
        options: [
          "구체적으로",
          "적시에",
          "인격이 아닌 행동에 대해",
          "공개적으로 질책",
        ],
        answer: 3,
      },
      {
        q: "리더십 발휘에 가장 중요한 것은?",
        options: ["직급", "신뢰와 소통", "보상 체계", "사무실 크기"],
        answer: 1,
      },
    ],
  },
  {
    id: 19,
    title: "네트워킹",
    subtitle: "Professional Networking",
    category: "심화",
    duration: "60분",
    durationMin: 60,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "비즈니스 네트워킹의 전략과 실전 기법을 학습합니다. 관계 구축, 유지, 활용의 전 과정과 온/오프라인 네트워킹 방법론을 다룹니다.",
    objectives: [
      "전략적 네트워킹의 원칙을 이해한다",
      "효과적인 자기소개와 대화 기법을 습득한다",
      "네트워크를 구축하고 유지하는 방법을 안다",
    ],
    targetAudience: "전 직원 (영업·사업개발 부서 권장)",
    instructor: "텐원 사업개발팀",
    quiz: [
      {
        q: "네트워킹에서 가장 중요한 것은?",
        options: [
          "명함 많이 모으기",
          "상호 가치 교환과 신뢰 구축",
          "SNS 팔로워 늘리기",
          "파티 참석",
        ],
        answer: 1,
      },
      {
        q: "약한 연결(Weak Ties)의 가치는?",
        options: [
          "가치 없음",
          "새로운 정보와 기회 접근",
          "강한 연결보다 못함",
          "시간 낭비",
        ],
        answer: 1,
      },
      {
        q: "네트워크 유지의 핵심은?",
        options: [
          "필요할 때만 연락",
          "정기적인 소통과 가치 제공",
          "선물 보내기",
          "매일 연락",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 20,
    title: "디자인 씽킹",
    subtitle: "Design Thinking",
    category: "심화",
    duration: "60분",
    durationMin: 60,
    status: "미이수",
    score: null,
    completedDate: null,
    description:
      "사용자 중심의 문제 해결 방법론인 디자인 씽킹을 학습합니다. 공감, 정의, 아이디어 도출, 프로토타이핑, 테스트의 5단계 프로세스를 실전 워크숍 형태로 다룹니다.",
    objectives: [
      "디자인 씽킹 5단계를 이해하고 적용할 수 있다",
      "사용자 공감 기법을 활용할 수 있다",
      "빠른 프로토타이핑과 테스트 방법을 안다",
    ],
    targetAudience: "전 직원 (기획·디자인·개발 부서 권장)",
    instructor: "텐원 디자인팀",
    quiz: [
      {
        q: "디자인 씽킹의 첫 번째 단계는?",
        options: ["정의", "공감", "아이디어 도출", "프로토타이핑"],
        answer: 1,
      },
      {
        q: "프로토타이핑의 목적은?",
        options: [
          "완벽한 제품 제작",
          "빠르게 아이디어를 검증",
          "투자자 설득",
          "특허 출원",
        ],
        answer: 1,
      },
      {
        q: "디자인 씽킹의 핵심 원칙은?",
        options: [
          "기술 중심",
          "사용자 중심",
          "비용 중심",
          "일정 중심",
        ],
        answer: 1,
      },
    ],
  },
];
