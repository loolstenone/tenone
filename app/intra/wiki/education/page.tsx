"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Target,
  Search,
  FlaskConical,
  BarChart3,
  X,
  RefreshCw,
  Lightbulb,
  Shield,
  Heart,
  Users,
  Megaphone,
  Palette,
  Brain,
  Rocket,
  FolderKanban,
  LineChart,
  Handshake,
  PenTool,
  Sparkles,
  GraduationCap,
  Play,
  RotateCcw,
} from "lucide-react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type CourseStatus = "미이수" | "학습중" | "퀴즈대기" | "이수완료";
type TabId = "전체" | "필수" | "전문" | "심화" | "VRIEF" | "GPR";

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // 0-based index
}

interface Course {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  category: "필수" | "전문" | "심화";
  status: CourseStatus;
  score: number | null;
  progress: number;
  description: string;
  quiz: QuizQuestion[];
}

/* ================================================================== */
/*  Course Data                                                        */
/* ================================================================== */

const initialCourses: Course[] = [
  // ── 필수 과정 (7) ──
  {
    id: 1,
    title: "Ten:One™ Universe 입문",
    subtitle: "World Building",
    duration: "30분",
    category: "필수",
    status: "이수완료",
    score: 100,
    progress: 100,
    description:
      "Ten:One™ Universe의 세계관, 브랜드 구조, 핵심 철학을 이해합니다. 멀티 브랜드 생태계의 작동 원리와 각 브랜드의 역할을 학습합니다.",
    quiz: [
      {
        q: "Ten:One™ Universe의 핵심 철학은?",
        options: [
          "경쟁을 통한 성장",
          "연결은 더 많은 기회를 만들어 낸다",
          "독립적 브랜드 운영",
          "이익 극대화",
        ],
        answer: 1,
      },
      {
        q: "Ten:One™의 비전은?",
        options: [
          "We are Planner",
          "We are Designer",
          "We are Developer",
          "We are Creator",
        ],
        answer: 0,
      },
      { q: "Ten:One™의 선언일은?", options: ["2018.01.01", "2019.10.01", "2020.03.15", "2021.07.01"], answer: 1 },
      { q: "Ten:One™의 미션은?", options: ["연결하고 조직하고 실행하라", "빠르게 성장하라", "혁신을 추구하라", "최고가 되어라"], answer: 0 },
      { q: "Ten:One™ Universe의 브랜드 카테고리가 아닌 것은?", options: ["AI Idol", "Community", "Fashion", "Banking"], answer: 3 },
      { q: "Ten:One™의 Goal은?", options: ["Who is the Next?", "Be the Best", "Go Global", "Think Big"], answer: 0 },
      { q: "Ten:One™의 전략 키워드는?", options: ["약한 연결 고리", "강한 독립", "절대 권력", "수직 통합"], answer: 0 },
      { q: "멀티 브랜드 생태계의 핵심 장점은?", options: ["비용 절감", "시너지와 연결", "단순화", "표준화"], answer: 1 },
      { q: "Ten:One™의 브랜드 간 관계 유형이 아닌 것은?", options: ["Parent", "Collaboration", "Rivals", "Acquisition"], answer: 3 },
      { q: "Ten:One™ Universe의 핵심 가치는?", options: ["본질·속도·이행", "빠름·정확·효율", "혁신·도전·성장", "신뢰·협력·공유"], answer: 0 },
    ],
  },
  {
    id: 2,
    title: "Principle 10",
    subtitle: "Core Principles",
    duration: "45분",
    category: "필수",
    status: "이수완료",
    score: 90,
    progress: 100,
    description:
      "Ten:One™의 10대 핵심 원칙을 학습합니다. 조직의 의사결정과 행동 기준이 되는 원칙들을 깊이 이해합니다.",
    quiz: [
      {
        q: "Principle 10의 목적은?",
        options: [
          "법적 규정 준수",
          "조직의 의사결정과 행동 기준",
          "마케팅 전략",
          "재무 관리",
        ],
        answer: 1,
      },
      {
        q: "Principle 10은 몇 개의 원칙으로 구성되어 있는가?",
        options: ["5개", "7개", "10개", "15개"],
        answer: 2,
      },
      { q: "원칙이 적용되는 범위는?", options: ["경영진만", "전 구성원", "외부 파트너", "고객만"], answer: 1 },
      { q: "원칙 위반 시 대응 방식은?", options: ["즉시 해고", "학습과 개선 기회 제공", "벌금 부과", "무시"], answer: 1 },
      { q: "원칙의 우선순위는?", options: ["이익 > 원칙", "원칙 > 이익", "상황에 따라 다름", "팀장 판단"], answer: 1 },
      { q: "원칙은 언제 수정 가능한가?", options: ["매년", "전 구성원 합의 시", "경영진 결정", "수정 불가"], answer: 1 },
      { q: "원칙 학습의 주기는?", options: ["입사 시 1회", "분기별", "연간", "수시"], answer: 3 },
      { q: "원칙과 규칙의 차이는?", options: ["같다", "원칙은 방향, 규칙은 구체적 행동", "규칙이 상위", "관계 없음"], answer: 1 },
      { q: "새로운 원칙 제안은 누가 할 수 있는가?", options: ["CEO만", "경영진만", "전 구성원", "외부 컨설턴트"], answer: 2 },
      { q: "원칙이 충돌할 때 판단 기준은?", options: ["상위 원칙 우선", "다수결", "팀장 결정", "본질에 가까운 쪽"], answer: 3 },
    ],
  },
  {
    id: 3,
    title: "Culture & Mind Set",
    subtitle: "본질 · 속도 · 이행",
    duration: "30분",
    category: "필수",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "Ten:One™의 3대 핵심 가치인 본질·속도·이행을 학습합니다. 일하는 방식의 기반이 되는 마인드셋을 내면화합니다.",
    quiz: [
      {
        q: "Ten:One™의 3대 핵심 가치는?",
        options: [
          "혁신·도전·성장",
          "본질·속도·이행",
          "신뢰·협력·공유",
          "자유·책임·성과",
        ],
        answer: 1,
      },
      {
        q: "'본질'이 의미하는 바는?",
        options: [
          "표면적 트렌드 추종",
          "변하지 않을 가치에 집요하게 집중",
          "빠른 실행",
          "수익 극대화",
        ],
        answer: 1,
      },
      { q: "'속도'의 핵심은?", options: ["무조건 빨리", "방향을 확인하며 빠르게 전진", "야근", "자동화"], answer: 1 },
      { q: "'이행'이 뜻하는 것은?", options: ["계획 수립", "본질 확인 후 즉시 실행", "보고서 작성", "회의 참석"], answer: 1 },
      { q: "마인드셋이 중요한 이유는?", options: ["평가 기준", "일하는 방식의 기반", "채용 조건", "급여 결정"], answer: 1 },
      { q: "본질 파악의 첫 단계는?", options: ["데이터 수집", "근본 원인 질문", "벤치마크", "회의 소집"], answer: 1 },
      { q: "속도를 내기 위한 전제조건은?", options: ["인력 증원", "올바른 방향 설정", "야근 확대", "도구 도입"], answer: 1 },
      { q: "이행 문화에서 피해야 할 것은?", options: ["빠른 실행", "완벽주의로 인한 지연", "작은 실험", "피드백 수용"], answer: 1 },
      { q: "세 가치의 순서가 중요한 이유는?", options: ["알파벳 순", "본질 확인 → 속도 → 실행의 논리적 흐름", "역사적 순서", "관계 없음"], answer: 1 },
      { q: "Culture & Mind Set 교육의 궁극적 목표는?", options: ["시험 통과", "가치의 내면화", "인증 취득", "승진"], answer: 1 },
    ],
  },
  {
    id: 4,
    title: "GPR",
    subtitle: "Goal · Plan · Result",
    duration: "60분",
    category: "필수",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "GPR(Goal·Plan·Result) 성장 철학을 학습합니다. 목표 설정, 계획 수립, 결과 회고의 순환 구조를 이해하고 실무에 적용합니다.",
    quiz: [
      {
        q: "GPR에서 Goal의 성격은?",
        options: [
          "현실적 예측치",
          "원대한 꿈",
          "KPI 숫자",
          "상사가 정한 할당량",
        ],
        answer: 1,
      },
      {
        q: "GPR의 순환 구조에서 Result 다음은?",
        options: ["종료", "다음 Goal에 학습 반영", "보고서 작성", "휴식"],
        answer: 1,
      },
      { q: "GPR에서 Plan의 핵심은?", options: ["완벽한 계획", "가설 기반 실험", "상세 일정표", "예산 편성"], answer: 1 },
      { q: "라인 스톱이란?", options: ["퇴근", "전제가 무너졌을 때 과감히 멈추기", "프로젝트 취소", "팀 해체"], answer: 1 },
      { q: "GPR 평가의 3요소가 아닌 것은?", options: ["목표 달성도", "성장 기여도", "프로세스 충실도", "근태 관리"], answer: 3 },
      { q: "GPR의 계층 구조는?", options: ["개인→팀", "기업→부문→팀→개인", "팀→기업", "부문→개인"], answer: 1 },
      { q: "GPR에서 가장 중요한 것은?", options: ["목표 달성", "목표를 향해 성장하는 것", "보고서 품질", "숫자 달성률"], answer: 1 },
      { q: "GPR 업데이트 주기는?", options: ["연 1회", "분기별", "수시/주간", "월 1회"], answer: 2 },
      { q: "GPR과 OKR의 관계는?", options: ["동일하다", "GPR은 OS, OKR은 App", "OKR이 상위", "관계 없음"], answer: 1 },
      { q: "GPR의 궁극적 목적은?", options: ["평가", "성장", "관리", "보고"], answer: 1 },
    ],
  },
  {
    id: 5,
    title: "VRIEF 프레임워크",
    subtitle: "조사 → 가설검증 → 전략수립",
    duration: "60분",
    category: "필수",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "VRIEF(조사·분석 → 가설 검증 → 전략 수립) 프레임워크를 학습합니다. 일하는 방식의 핵심 도구를 실무에 적용하는 방법을 익힙니다.",
    quiz: [
      {
        q: "VRIEF의 첫 번째 단계는?",
        options: ["전략 수립", "가설 검증", "조사·분석", "실행"],
        answer: 2,
      },
      {
        q: "VRIEF에서 PPT 대신 먼저 해야 할 것은?",
        options: [
          "디자인",
          "스토리(서술형)로 정리",
          "회의 소집",
          "데이터 수집",
        ],
        answer: 1,
      },
      { q: "가설 검증의 핵심 방법은?", options: ["대규모 투자", "MVP/파일럿 테스트", "설문조사만", "전문가 자문만"], answer: 1 },
      { q: "가설이 틀렸을 때 해야 할 일은?", options: ["무시하고 진행", "Step 1(본질)로 돌아가기", "프로젝트 종료", "책임자 교체"], answer: 1 },
      { q: "VRIEF의 산출물 순서는?", options: ["전략서→가설→문제정의", "문제정의→검증결과→전략서", "전략서→문제정의→가설", "가설→전략서→문제정의"], answer: 1 },
      { q: "VRIEF에서 AI 도구의 역할은?", options: ["불필요", "적극 활용", "제한적 사용", "금지"], answer: 1 },
      { q: "반복(Iteration) 루프의 의미는?", options: ["같은 일 반복", "학습을 통한 지속 개선", "야근", "회의 반복"], answer: 1 },
      { q: "전략 수립 단계의 핵심 요소가 아닌 것은?", options: ["타임라인", "리소스 배분", "RACI 매트릭스", "개인 감정"], answer: 3 },
      { q: "VRIEF와 GPR의 관계는?", options: ["동일하다", "VRIEF는 일하는 방식, GPR은 목표 관리", "서로 무관", "GPR이 VRIEF를 포함"], answer: 1 },
      { q: "VRIEF 적용 시 가장 중요한 태도는?", options: ["완벽주의", "가설 기반 사고와 빠른 검증", "보고서 작성 능력", "회의 진행 능력"], answer: 1 },
    ],
  },
  {
    id: 6,
    title: "정보보안",
    subtitle: "Security Policy",
    duration: "20분",
    category: "필수",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "회사 정보보안 정책과 개인정보 보호 원칙을 학습합니다. 데이터 취급 기준과 보안 사고 대응 절차를 이해합니다.",
    quiz: [
      { q: "정보보안의 3대 요소는?", options: ["기밀성·무결성·가용성", "속도·정확·안전", "암호화·백업·복구", "인증·권한·감사"], answer: 0 },
      { q: "개인정보 유출 시 첫 번째 조치는?", options: ["삭제", "즉시 보안팀 보고", "무시", "자체 해결"], answer: 1 },
      { q: "비밀번호 관리 원칙으로 올바른 것은?", options: ["같은 비밀번호 재사용", "주기적 변경 + 복잡도 유지", "메모지에 기록", "공유 가능"], answer: 1 },
      { q: "외부 USB 사용 정책은?", options: ["자유 사용", "승인 후 사용", "전면 금지", "개인 판단"], answer: 1 },
      { q: "피싱 메일 대응 방법은?", options: ["링크 클릭", "첨부파일 열기", "보안팀 신고", "무시"], answer: 2 },
      { q: "사내 자료 외부 공유 원칙은?", options: ["자유 공유", "승인 절차 필수", "불가능", "팀장 구두 승인"], answer: 1 },
      { q: "퇴직 시 정보 처리 원칙은?", options: ["개인 보관 가능", "모든 사내 정보 반납·삭제", "선택적 삭제", "해당 없음"], answer: 1 },
      { q: "클라우드 서비스 사용 원칙은?", options: ["아무거나 사용", "승인된 서비스만 사용", "개인 계정으로 사용", "사용 금지"], answer: 1 },
      { q: "보안 교육 주기는?", options: ["입사 시 1회", "연 1회 이상", "필요 시만", "분기별"], answer: 1 },
      { q: "보안 사고의 가장 큰 원인은?", options: ["해킹", "자연재해", "내부 인적 실수", "시스템 오류"], answer: 2 },
    ],
  },
  {
    id: 7,
    title: "괴롭힘 예방",
    subtitle: "Workplace Harassment Prevention",
    duration: "20분",
    category: "필수",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "직장 내 괴롭힘의 정의, 유형, 예방 방법 및 신고 절차를 학습합니다. 건강한 조직 문화를 만들기 위한 구성원의 역할을 이해합니다.",
    quiz: [
      { q: "직장 내 괴롭힘의 법적 정의 요건이 아닌 것은?", options: ["지위·관계 우위 이용", "업무 적정 범위 초과", "신체적·정신적 고통", "1회성 실수"], answer: 3 },
      { q: "괴롭힘 목격 시 올바른 행동은?", options: ["무시", "피해자 지원 및 신고", "가해자 직접 처벌", "소문 퍼뜨리기"], answer: 1 },
      { q: "괴롭힘 신고 채널은?", options: ["SNS", "HR 또는 내부 신고 채널", "외부 언론", "개인 블로그"], answer: 1 },
      { q: "괴롭힘 예방을 위한 조직의 역할이 아닌 것은?", options: ["예방 교육", "신고 채널 운영", "피해자 보호", "사건 은폐"], answer: 3 },
      { q: "정당한 업무 지시와 괴롭힘의 차이는?", options: ["없다", "업무 적정 범위 내 여부", "직급 차이", "성별"], answer: 1 },
      { q: "신고자 보호 원칙으로 옳은 것은?", options: ["비밀 보장 + 불이익 금지", "신고자 공개", "신고자 부서 이동", "신고자 평가 반영"], answer: 0 },
      { q: "괴롭힘 유형에 해당하지 않는 것은?", options: ["폭언·욕설", "업무 배제", "사적 심부름 강요", "업무 협조 요청"], answer: 3 },
      { q: "괴롭힘 발생 시 회사의 조치 기한은?", options: ["제한 없음", "즉시 조사 착수", "1년 이내", "피해자 요청 시만"], answer: 1 },
      { q: "2차 피해란?", options: ["추가 괴롭힘", "신고로 인한 불이익·소문", "자연재해", "시스템 오류"], answer: 1 },
      { q: "건강한 조직 문화의 핵심은?", options: ["성과 중심", "상호 존중과 소통", "경쟁 강화", "개인 성과 극대화"], answer: 1 },
    ],
  },
  // ── 전문 과정 (7) ──
  {
    id: 8,
    title: "기획",
    subtitle: "Strategic Planning",
    duration: "90분",
    category: "전문",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "전략적 기획의 프레임워크와 실무 방법론을 학습합니다. 문제 정의, 목표 설정, 실행 계획 수립의 전 과정을 다룹니다.",
    quiz: [
      { q: "기획의 첫 단계는?", options: ["실행", "문제 정의", "보고", "예산 편성"], answer: 1 },
      { q: "SWOT 분석의 S는?", options: ["Speed", "Strength", "Strategy", "System"], answer: 1 },
      { q: "기획서의 핵심 구성요소가 아닌 것은?", options: ["목표", "실행 계획", "예산", "개인 감정"], answer: 3 },
      { q: "전략과 전술의 차이는?", options: ["같다", "전략은 방향, 전술은 구체적 방법", "전술이 상위", "관계 없음"], answer: 1 },
      { q: "기획 역량 중 가장 중요한 것은?", options: ["PPT 디자인", "논리적 사고", "빠른 타이핑", "영어 능력"], answer: 1 },
      { q: "벤치마킹의 올바른 접근은?", options: ["그대로 복사", "핵심 원리를 이해하고 적용", "무시", "비교만"], answer: 1 },
      { q: "기획 검증 방법은?", options: ["직감", "데이터 기반 검증", "상사 승인만", "다수결"], answer: 1 },
      { q: "기획에서 이해관계자 분석이 중요한 이유는?", options: ["형식적 절차", "실행력 확보를 위한 합의", "보고서 분량", "인사 평가"], answer: 1 },
      { q: "좋은 목표의 조건(SMART)에서 M은?", options: ["Money", "Measurable", "Mission", "Management"], answer: 1 },
      { q: "기획 실패의 가장 큰 원인은?", options: ["예산 부족", "잘못된 문제 정의", "인력 부족", "기술 부족"], answer: 1 },
    ],
  },
  {
    id: 9,
    title: "마케팅",
    subtitle: "Marketing",
    duration: "90분",
    category: "전문",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "디지털 마케팅의 핵심 개념과 실무 전략을 학습합니다. 타겟 분석, 채널 전략, 성과 측정의 전 과정을 다룹니다.",
    quiz: [
      { q: "마케팅 4P가 아닌 것은?", options: ["Product", "Price", "Place", "People"], answer: 3 },
      { q: "타겟 마케팅의 첫 단계는?", options: ["광고 집행", "시장 세분화", "가격 결정", "제품 출시"], answer: 1 },
      { q: "CTR의 의미는?", options: ["Cost To Revenue", "Click Through Rate", "Customer Trust Rating", "Content Type Ratio"], answer: 1 },
      { q: "퍼널(Funnel)의 순서는?", options: ["구매→인지→관심", "인지→관심→전환→유지", "유지→전환→인지", "관심→인지→구매"], answer: 1 },
      { q: "CRM의 목적은?", options: ["비용 절감", "고객 관계 관리 및 유지", "직원 관리", "재고 관리"], answer: 1 },
      { q: "A/B 테스트란?", options: ["두 가지 버전 비교 실험", "알파벳 순 정렬", "A팀 vs B팀", "예산 분배"], answer: 0 },
      { q: "SEO의 목적은?", options: ["광고비 증가", "검색엔진 상위 노출", "디자인 개선", "보안 강화"], answer: 1 },
      { q: "콘텐츠 마케팅의 핵심은?", options: ["광고 물량", "가치 있는 콘텐츠로 고객 유인", "할인 이벤트", "콜드콜"], answer: 1 },
      { q: "ROAS의 의미는?", options: ["Return On Ad Spend", "Rate Of Annual Sales", "Revenue Over All Sources", "Reach Of Active Subscribers"], answer: 0 },
      { q: "고객 여정 맵의 목적은?", options: ["사무실 배치도", "고객 경험 전 과정 시각화", "물류 경로", "조직도"], answer: 1 },
    ],
  },
  {
    id: 10,
    title: "광고",
    subtitle: "Advertising",
    duration: "90분",
    category: "전문",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "디지털 광고 플랫폼 운영과 크리에이티브 전략을 학습합니다. 매체 선택, 예산 최적화, 성과 분석 방법을 익힙니다.",
    quiz: [
      { q: "CPC 과금 방식이란?", options: ["노출당 과금", "클릭당 과금", "전환당 과금", "시간당 과금"], answer: 1 },
      { q: "리타겟팅 광고란?", options: ["신규 고객 타겟", "방문 이력 기반 재노출", "경쟁사 타겟", "무작위 노출"], answer: 1 },
      { q: "광고 크리에이티브에서 가장 중요한 것은?", options: ["화려한 디자인", "타겟에 맞는 메시지", "긴 텍스트", "유명인 활용"], answer: 1 },
      { q: "CPM의 M은?", options: ["Month", "Mille (1000)", "Marketing", "Media"], answer: 1 },
      { q: "광고 성과 측정의 핵심 지표가 아닌 것은?", options: ["CTR", "CPA", "ROAS", "BMI"], answer: 3 },
      { q: "네이티브 광고란?", options: ["자국 언어 광고", "콘텐츠와 자연스럽게 어우러지는 광고", "TV 광고", "옥외 광고"], answer: 1 },
      { q: "광고 예산 최적화의 핵심은?", options: ["최대 지출", "ROI 기반 배분", "균등 분배", "최소 지출"], answer: 1 },
      { q: "광고 피로도란?", options: ["광고팀 피로", "동일 광고 반복 노출로 인한 효과 저하", "예산 소진", "매체 오류"], answer: 1 },
      { q: "프로그래매틱 광고란?", options: ["수동 광고 구매", "자동화된 실시간 광고 구매", "프로그램 내 광고", "무료 광고"], answer: 1 },
      { q: "광고 캠페인 기획의 첫 단계는?", options: ["매체 선택", "목표 설정", "크리에이티브 제작", "예산 편성"], answer: 1 },
    ],
  },
  {
    id: 11,
    title: "브랜딩",
    subtitle: "Brand Building",
    duration: "60분",
    category: "전문",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "브랜드 전략의 기초부터 실행까지를 학습합니다. 브랜드 아이덴티티, 포지셔닝, 커뮤니케이션 전략을 다룹니다.",
    quiz: [
      { q: "브랜드 아이덴티티란?", options: ["로고만", "브랜드가 지향하는 총체적 이미지", "가격 정책", "유통 채널"], answer: 1 },
      { q: "브랜드 포지셔닝의 목적은?", options: ["가격 경쟁", "소비자 마음속 차별화된 위치 확보", "매출 증대만", "경쟁사 모방"], answer: 1 },
      { q: "브랜드 에쿼티란?", options: ["브랜드 자산/가치", "주식 가치", "부동산 가치", "현금 보유액"], answer: 0 },
      { q: "톤 앤 매너의 역할은?", options: ["인테리어", "브랜드의 일관된 커뮤니케이션 스타일", "가격 설정", "유통 전략"], answer: 1 },
      { q: "리브랜딩이 필요한 시점이 아닌 것은?", options: ["시장 변화", "타겟 변경", "실적 하락", "로고가 예뻐서"], answer: 3 },
      { q: "브랜드 스토리텔링의 핵심은?", options: ["허위 과장", "진정성 있는 이야기", "기술적 사양", "가격 정보"], answer: 1 },
      { q: "브랜드 가이드라인에 포함되지 않는 것은?", options: ["로고 사용법", "컬러 팔레트", "타이포그래피", "직원 급여표"], answer: 3 },
      { q: "멀티 브랜드 전략의 장점은?", options: ["관리 용이", "다양한 시장 세그먼트 공략", "비용 절감", "단순화"], answer: 1 },
      { q: "브랜드 충성도를 높이는 핵심 요인은?", options: ["낮은 가격", "일관된 경험과 가치 제공", "광고 물량", "할인 이벤트"], answer: 1 },
      { q: "Ten:One™의 브랜드 전략 특징은?", options: ["단일 브랜드", "멀티 브랜드 생태계", "OEM 전략", "노브랜드"], answer: 1 },
    ],
  },
  {
    id: 12,
    title: "콘텐츠 제작",
    subtitle: "Content Creation",
    duration: "60분",
    category: "전문",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "효과적인 콘텐츠 기획, 제작, 배포 전략을 학습합니다. 다양한 형태의 콘텐츠 제작 방법론과 퍼포먼스 측정을 다룹니다.",
    quiz: [
      { q: "콘텐츠 기획의 첫 단계는?", options: ["촬영", "타겟 오디언스 분석", "편집", "배포"], answer: 1 },
      { q: "효과적인 헤드라인의 조건이 아닌 것은?", options: ["명확함", "호기심 유발", "관련성", "길이가 길수록 좋다"], answer: 3 },
      { q: "콘텐츠 캘린더의 목적은?", options: ["휴일 확인", "체계적 콘텐츠 발행 계획", "개인 일정 관리", "회의 일정"], answer: 1 },
      { q: "숏폼 콘텐츠의 핵심은?", options: ["긴 스토리", "초반 3초 내 후킹", "고화질만", "자막 없이"], answer: 1 },
      { q: "콘텐츠 재활용(Repurposing)이란?", options: ["같은 콘텐츠 반복", "하나의 콘텐츠를 다양한 형태로 변환", "오래된 콘텐츠 삭제", "경쟁사 콘텐츠 복사"], answer: 1 },
      { q: "콘텐츠 성과 측정 지표가 아닌 것은?", options: ["조회수", "참여율", "공유수", "건물 층수"], answer: 3 },
      { q: "SEO 친화적 콘텐츠 작성법은?", options: ["키워드 무작위 삽입", "자연스러운 키워드 활용 + 구조화", "이미지만 사용", "텍스트 최소화"], answer: 1 },
      { q: "콘텐츠 톤 앤 보이스란?", options: ["목소리 크기", "브랜드에 맞는 글쓰기 스타일", "배경 음악", "녹음 품질"], answer: 1 },
      { q: "UGC(User Generated Content)의 장점은?", options: ["비용 절감만", "진정성 + 참여도 향상", "품질 보장", "통제 용이"], answer: 1 },
      { q: "콘텐츠 A/B 테스트의 목적은?", options: ["콘텐츠 삭제", "최적의 버전 찾기", "팀원 평가", "예산 배분"], answer: 1 },
    ],
  },
  {
    id: 13,
    title: "인공지능",
    subtitle: "AI & Prompt Engineering",
    duration: "90분",
    category: "전문",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "AI 기초 개념과 프롬프트 엔지니어링 실무를 학습합니다. LLM 활용, 프롬프트 설계, AI 도구 활용 전략을 다룹니다.",
    quiz: [
      { q: "LLM이란?", options: ["Large Language Model", "Low Level Memory", "Linear Logic Module", "Local Link Manager"], answer: 0 },
      { q: "프롬프트 엔지니어링이란?", options: ["AI 하드웨어 설계", "AI에게 효과적으로 지시하는 기술", "프로그래밍 언어", "네트워크 설정"], answer: 1 },
      { q: "좋은 프롬프트의 조건이 아닌 것은?", options: ["명확한 지시", "맥락 제공", "원하는 형식 지정", "모호할수록 좋다"], answer: 3 },
      { q: "할루시네이션이란?", options: ["AI 꿈", "AI가 사실이 아닌 정보를 생성", "AI 오류 코드", "AI 학습 방법"], answer: 1 },
      { q: "AI 활용 시 주의사항이 아닌 것은?", options: ["결과 검증", "기밀 정보 입력 주의", "저작권 확인", "무조건 신뢰"], answer: 3 },
      { q: "Few-shot 프롬프팅이란?", options: ["적은 예산", "예시를 포함한 프롬프트", "짧은 프롬프트", "한 번만 사용"], answer: 1 },
      { q: "AI 도구 선택 시 고려사항이 아닌 것은?", options: ["보안", "비용", "기능 적합성", "UI 색상"], answer: 3 },
      { q: "Chain of Thought 프롬프팅이란?", options: ["연쇄 프롬프트", "단계적 사고를 유도하는 기법", "자동 번역", "데이터 연결"], answer: 1 },
      { q: "AI의 한계가 아닌 것은?", options: ["실시간 정보 부족", "맥락 이해 한계", "할루시네이션", "텍스트 생성 불가"], answer: 3 },
      { q: "Ten:One™에서 AI를 활용하는 핵심 영역은?", options: ["단순 반복 업무만", "기획·콘텐츠·분석 전 영역", "인사 평가만", "재무 회계만"], answer: 1 },
    ],
  },
  {
    id: 14,
    title: "커뮤니티 운영",
    subtitle: "Community Management",
    duration: "60분",
    category: "전문",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "온라인 커뮤니티 구축, 운영, 성장 전략을 학습합니다. 멤버 관리, 콘텐츠 운영, 참여율 향상 방법을 다룹니다.",
    quiz: [
      { q: "커뮤니티 운영의 핵심 목표는?", options: ["회원 수만 늘리기", "활발한 참여와 가치 공유", "광고 수익", "데이터 수집"], answer: 1 },
      { q: "커뮤니티 가이드라인의 목적은?", options: ["규제 강화", "건강한 소통 환경 조성", "회원 제한", "법적 보호만"], answer: 1 },
      { q: "커뮤니티 참여율을 높이는 방법이 아닌 것은?", options: ["정기 이벤트", "멤버 인정/보상", "양질의 콘텐츠", "광고 폭탄"], answer: 3 },
      { q: "커뮤니티 매니저의 핵심 역량은?", options: ["코딩", "소통과 공감 능력", "회계", "법률 지식"], answer: 1 },
      { q: "트롤링 대응 원칙은?", options: ["무시", "기준에 따른 일관된 대응", "맞대응", "차단만"], answer: 1 },
      { q: "커뮤니티 성장 단계가 아닌 것은?", options: ["시작", "성장", "성숙", "폭파"], answer: 3 },
      { q: "온보딩의 목적은?", options: ["회원 가입만", "신규 멤버의 빠른 적응 지원", "데이터 수집", "광고 노출"], answer: 1 },
      { q: "커뮤니티 지표 중 가장 중요한 것은?", options: ["가입자 수", "활성 참여율", "페이지뷰", "좋아요 수"], answer: 1 },
      { q: "앰배서더 프로그램이란?", options: ["직원 교육", "열성 멤버를 통한 커뮤니티 확산", "광고 캠페인", "이벤트 운영"], answer: 1 },
      { q: "커뮤니티 위기 대응의 핵심은?", options: ["무시", "빠른 소통과 투명한 대응", "삭제", "법적 조치"], answer: 1 },
    ],
  },
  // ── 심화 과정 (6) ──
  {
    id: 15,
    title: "창업",
    subtitle: "Startup & Entrepreneurship",
    duration: "120분",
    category: "심화",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "창업 프로세스의 전체 흐름을 학습합니다. 아이디어 검증, 비즈니스 모델, 팀 빌딩, 자금 조달의 핵심을 다룹니다.",
    quiz: [
      { q: "린 스타트업의 핵심 원리는?", options: ["대규모 투자", "Build-Measure-Learn", "완벽한 계획", "빠른 고용"], answer: 1 },
      { q: "MVP의 목적은?", options: ["완성품 출시", "최소 비용으로 가설 검증", "투자 유치", "특허 출원"], answer: 1 },
      { q: "비즈니스 모델 캔버스의 구성 요소가 아닌 것은?", options: ["가치 제안", "고객 세그먼트", "수익 구조", "사무실 인테리어"], answer: 3 },
      { q: "PMF(Product-Market Fit)란?", options: ["제품 생산 공장", "제품이 시장 수요에 부합하는 상태", "가격 전략", "마케팅 계획"], answer: 1 },
      { q: "창업팀에서 가장 중요한 것은?", options: ["학력", "경력", "팀원 간 신뢰와 보완성", "자본금"], answer: 2 },
      { q: "피봇(Pivot)이란?", options: ["포기", "사업 방향의 전략적 전환", "투자 유치", "상장"], answer: 1 },
      { q: "VC 투자 라운드 순서는?", options: ["Series A→Seed", "Seed→Series A→B→C", "IPO→Seed", "Series C→A"], answer: 1 },
      { q: "Go-to-Market 전략이란?", options: ["해외 진출", "제품을 시장에 출시하는 전략", "퇴근 전략", "비용 절감"], answer: 1 },
      { q: "번아웃 예방의 핵심은?", options: ["더 열심히", "지속 가능한 페이스 유지", "야근 확대", "휴가 금지"], answer: 1 },
      { q: "창업에서 실패의 의미는?", options: ["끝", "학습 기회", "능력 부족 증명", "재기 불가"], answer: 1 },
    ],
  },
  {
    id: 16,
    title: "프로젝트 매니지먼트",
    subtitle: "Project Management",
    duration: "90분",
    category: "심화",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "프로젝트 관리의 핵심 방법론과 도구를 학습합니다. 스코프 관리, 일정 관리, 리스크 관리, 이해관계자 관리를 다룹니다.",
    quiz: [
      { q: "애자일의 핵심 가치가 아닌 것은?", options: ["개인과 상호작용", "작동하는 소프트웨어", "고객과 협력", "문서 중심 프로세스"], answer: 3 },
      { q: "스프린트의 일반적 기간은?", options: ["1일", "1~4주", "3개월", "1년"], answer: 1 },
      { q: "간트 차트의 용도는?", options: ["예산 관리", "일정 시각화", "인사 관리", "마케팅 분석"], answer: 1 },
      { q: "리스크 관리의 첫 단계는?", options: ["회피", "리스크 식별", "전가", "수용"], answer: 1 },
      { q: "RACI에서 A는?", options: ["Accountable", "Available", "Active", "Automatic"], answer: 0 },
      { q: "스코프 크리프란?", options: ["빠른 진행", "범위가 통제 없이 확대되는 현상", "프로젝트 축소", "팀 축소"], answer: 1 },
      { q: "회고(Retrospective)의 목적은?", options: ["책임 추궁", "지속적 개선을 위한 학습", "성과 평가", "보고서 작성"], answer: 1 },
      { q: "스탠드업 미팅의 특징은?", options: ["2시간 이상", "15분 내외, 짧고 집중", "월 1회", "서면으로"], answer: 1 },
      { q: "프로젝트 성공의 3대 제약은?", options: ["시간·비용·범위", "인력·장비·공간", "기술·디자인·마케팅", "전략·실행·평가"], answer: 0 },
      { q: "칸반 보드의 기본 컬럼은?", options: ["상중하", "To Do·In Progress·Done", "ABC", "1234"], answer: 1 },
    ],
  },
  {
    id: 17,
    title: "데이터 분석",
    subtitle: "Data Analytics",
    duration: "90분",
    category: "심화",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "데이터 기반 의사결정을 위한 분석 방법론을 학습합니다. 데이터 수집, 가공, 시각화, 인사이트 도출의 전 과정을 다룹니다.",
    quiz: [
      { q: "데이터 분석의 첫 단계는?", options: ["시각화", "문제 정의 및 가설 설정", "보고", "모델링"], answer: 1 },
      { q: "정량 데이터와 정성 데이터의 차이는?", options: ["없다", "숫자 vs 비숫자(텍스트/감정)", "크기 차이", "중요도 차이"], answer: 1 },
      { q: "A/B 테스트의 핵심 원리는?", options: ["직감", "통제 변인을 두고 비교 실험", "무작위 선택", "다수결"], answer: 1 },
      { q: "상관관계와 인과관계의 차이는?", options: ["같다", "상관은 함께 변하는 것, 인과는 원인-결과", "인과가 상관의 일부", "관계 없음"], answer: 1 },
      { q: "데이터 시각화의 목적은?", options: ["예쁜 그래프", "복잡한 데이터를 이해하기 쉽게 전달", "보고서 분량 채우기", "기술 과시"], answer: 1 },
      { q: "코호트 분석이란?", options: ["비용 분석", "동일 특성 그룹의 행동 패턴 추적", "경쟁사 분석", "인사 분석"], answer: 1 },
      { q: "데이터 클렌징이란?", options: ["데이터 삭제", "오류/중복/결측 데이터 정리", "데이터 암호화", "데이터 백업"], answer: 1 },
      { q: "대시보드의 핵심 원칙은?", options: ["최대한 많은 정보", "핵심 지표를 한눈에", "화려한 디자인", "실시간만"], answer: 1 },
      { q: "데이터 편향(Bias)이란?", options: ["정확한 데이터", "체계적으로 치우친 데이터 수집/분석", "대용량 데이터", "실시간 데이터"], answer: 1 },
      { q: "데이터 기반 의사결정의 핵심은?", options: ["데이터만 맹신", "데이터 + 맥락 + 판단의 조합", "직감 배제", "AI에 위임"], answer: 1 },
    ],
  },
  {
    id: 18,
    title: "리더십 & 코칭",
    subtitle: "Leadership & Coaching",
    duration: "60분",
    category: "심화",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "리더십의 핵심 역량과 코칭 스킬을 학습합니다. 팀 빌딩, 동기 부여, 피드백, 1:1 미팅 등의 실무 방법을 다룹니다.",
    quiz: [
      { q: "서번트 리더십이란?", options: ["지시형 리더십", "구성원을 섬기고 성장을 돕는 리더십", "방임형 리더십", "카리스마 리더십"], answer: 1 },
      { q: "효과적인 피드백의 원칙은?", options: ["인신 공격", "구체적 행동에 대한 적시 피드백", "한 번에 모아서", "익명으로"], answer: 1 },
      { q: "1:1 미팅의 주인공은?", options: ["리더", "팀원", "HR", "경영진"], answer: 1 },
      { q: "심리적 안전감이란?", options: ["물리적 안전", "실수나 의견 표현 시 불이익을 받지 않는 환경", "보안 시스템", "보험 가입"], answer: 1 },
      { q: "코칭과 멘토링의 차이는?", options: ["같다", "코칭은 질문으로 이끌기, 멘토링은 경험 공유", "멘토링이 상위", "관계 없음"], answer: 1 },
      { q: "동기 부여에서 가장 효과적인 것은?", options: ["금전적 보상만", "내재적 동기 + 인정 + 성장 기회", "위협", "경쟁 유도"], answer: 1 },
      { q: "갈등 관리의 첫 단계는?", options: ["무시", "갈등의 근본 원인 파악", "한쪽 편들기", "징계"], answer: 1 },
      { q: "위임의 핵심 원칙은?", options: ["모든 것 위임", "권한과 책임을 함께 부여", "결과만 요구", "지시만 하기"], answer: 1 },
      { q: "팀 빌딩의 핵심은?", options: ["회식", "공동 목표와 신뢰 구축", "경쟁 유도", "규율 강화"], answer: 1 },
      { q: "리더의 가장 중요한 역할은?", options: ["지시", "방향 제시와 구성원 성장 지원", "관리 감독", "보고"], answer: 1 },
    ],
  },
  {
    id: 19,
    title: "네트워킹 전략",
    subtitle: "Networking Strategy",
    duration: "60분",
    category: "심화",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "효과적인 네트워킹의 원칙과 전략을 학습합니다. 약한 연결의 힘, 관계 구축, 협업 네트워크 형성 방법을 다룹니다.",
    quiz: [
      { q: "'약한 연결의 힘' 이론의 핵심은?", options: ["친한 친구가 중요", "느슨한 관계가 새로운 기회를 제공", "네트워크 불필요", "강한 연결만 중요"], answer: 1 },
      { q: "효과적인 네트워킹의 원칙은?", options: ["받기만", "주고받기(Give & Take)", "자기 PR만", "명함 수집"], answer: 1 },
      { q: "온라인 네트워킹의 핵심 플랫폼은?", options: ["게임", "LinkedIn 등 전문 네트워크", "쇼핑몰", "뉴스 사이트"], answer: 1 },
      { q: "네트워킹에서 피해야 할 행동은?", options: ["경청", "가치 제공", "일방적 요구", "꾸준한 소통"], answer: 2 },
      { q: "관계 유지의 핵심은?", options: ["필요할 때만 연락", "정기적이고 진정성 있는 소통", "선물 공세", "과도한 연락"], answer: 1 },
      { q: "커뮤니티 기반 네트워킹의 장점은?", options: ["비용 절감", "공통 관심사를 통한 자연스러운 관계 형성", "의무적 참여", "형식적 교류"], answer: 1 },
      { q: "네트워킹의 궁극적 목적은?", options: ["인맥 자랑", "상호 성장과 기회 창출", "취업", "투자 유치만"], answer: 1 },
      { q: "소개 요청 시 예절은?", options: ["무작정 요청", "맥락과 이유를 명확히 설명", "강요", "제3자 통해 압박"], answer: 1 },
      { q: "Ten:One™의 네트워킹 철학은?", options: ["폐쇄적 운영", "연결은 더 많은 기회를 만들어 낸다", "독립적 성장", "경쟁 중심"], answer: 1 },
      { q: "네트워킹 ROI를 높이는 방법은?", options: ["무작위 참석", "목적에 맞는 선택적 참여 + 후속 관리", "고비용 이벤트만", "온라인만"], answer: 1 },
    ],
  },
  {
    id: 20,
    title: "디자인 씽킹",
    subtitle: "Design Thinking",
    duration: "60분",
    category: "심화",
    status: "미이수",
    score: null,
    progress: 0,
    description:
      "디자인 씽킹의 5단계 프로세스를 학습합니다. 공감, 정의, 아이디어, 프로토타입, 테스트의 실무 적용 방법을 다룹니다.",
    quiz: [
      { q: "디자인 씽킹의 첫 단계는?", options: ["프로토타입", "공감(Empathize)", "테스트", "정의"], answer: 1 },
      { q: "디자인 씽킹의 5단계 순서는?", options: ["정의→공감→테스트→아이디어→프로토타입", "공감→정의→아이디어→프로토타입→테스트", "테스트→공감→정의→프로토타입→아이디어", "아이디어→프로토타입→테스트→공감→정의"], answer: 1 },
      { q: "'공감' 단계에서 하는 일은?", options: ["솔루션 설계", "사용자의 니즈와 감정 이해", "프로토타입 제작", "테스트 실행"], answer: 1 },
      { q: "HMW(How Might We) 질문이란?", options: ["문제 회피", "문제를 기회로 재정의하는 질문 기법", "해결책 제시", "평가 질문"], answer: 1 },
      { q: "브레인스토밍의 핵심 규칙은?", options: ["비판 우선", "판단 유보 + 양 추구", "침묵", "한 명만 발언"], answer: 1 },
      { q: "프로토타입의 목적은?", options: ["완성품 제작", "빠르게 아이디어를 시각화하고 테스트", "투자 유치", "특허 출원"], answer: 1 },
      { q: "디자인 씽킹에서 실패의 의미는?", options: ["실력 부족", "빠른 학습 기회", "프로젝트 종료", "책임 추궁 대상"], answer: 1 },
      { q: "사용자 여정 맵의 용도는?", options: ["물류 경로", "사용자 경험 전 과정 시각화", "조직도", "재무 흐름"], answer: 1 },
      { q: "수렴적 사고와 발산적 사고의 관계는?", options: ["하나만 사용", "번갈아 사용하며 최적 해결책 도출", "발산만 중요", "수렴만 중요"], answer: 1 },
      { q: "디자인 씽킹과 VRIEF의 공통점은?", options: ["없다", "문제 본질 파악 + 가설 검증 + 반복", "PPT 중심", "숫자 중심"], answer: 1 },
    ],
  },
];

/* ================================================================== */
/*  VRIEF & GPR Content                                                */
/* ================================================================== */

const vriefOutline = [
  { step: 1, title: "조사 · 분석", desc: "문제 본질 파악 & 초기 Big Idea 구상", icon: Search },
  { step: 2, title: "가설 검증", desc: "MVP나 파일럿으로 빠르게 테스트", icon: FlaskConical },
  { step: 3, title: "전략 수립", desc: "일정·예산·인력·책임자 명확히", icon: BarChart3 },
];

const gprOutline = [
  { phase: "Goal", label: "위대한 질문", desc: "우리가 진정 도달하고 싶은 곳은 어디인가?", icon: Target },
  { phase: "Plan", label: "용감한 실험", desc: "어떻게 하면 그곳에 도달할 수 있을까?", icon: FlaskConical },
  { phase: "Result", label: "정직한 학습", desc: "우리는 무엇을 달성했고, 무엇을 배웠는가?", icon: BarChart3 },
];

/* ================================================================== */
/*  Category icon mapping                                              */
/* ================================================================== */

const courseIcons: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Sparkles, 2: Target, 3: Heart, 4: Target, 5: Search,
  6: Shield, 7: Users, 8: Lightbulb, 9: Megaphone, 10: Megaphone,
  11: Palette, 12: PenTool, 13: Brain, 14: Users, 15: Rocket,
  16: FolderKanban, 17: LineChart, 18: GraduationCap, 19: Handshake, 20: Lightbulb,
};

/* ================================================================== */
/*  Tabs                                                               */
/* ================================================================== */

const tabs: { id: TabId; label: string }[] = [
  { id: "전체", label: "전체" },
  { id: "필수", label: "필수" },
  { id: "전문", label: "전문" },
  { id: "심화", label: "심화" },
  { id: "VRIEF", label: "VRIEF" },
  { id: "GPR", label: "GPR" },
];

/* ================================================================== */
/*  Status helpers                                                     */
/* ================================================================== */

function statusColor(s: CourseStatus) {
  switch (s) {
    case "이수완료":
      return "bg-neutral-900 text-white";
    case "학습중":
      return "bg-neutral-200 text-neutral-700";
    case "퀴즈대기":
      return "bg-neutral-300 text-neutral-800";
    default:
      return "bg-neutral-100 text-neutral-500";
  }
}

function categoryColor(c: string) {
  switch (c) {
    case "필수":
      return "bg-neutral-800 text-white";
    case "전문":
      return "bg-neutral-500 text-white";
    case "심화":
      return "bg-neutral-300 text-neutral-800";
    default:
      return "bg-neutral-100 text-neutral-500";
  }
}

/* ================================================================== */
/*  Quiz Modal                                                         */
/* ================================================================== */

function QuizModal({
  course,
  onClose,
  onComplete,
}: {
  course: Course;
  onClose: () => void;
  onComplete: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    course.quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    const s = correct * 10;
    setScore(s);
    setSubmitted(true);
  };

  const passed = score >= 80;
  const allAnswered = Object.keys(answers).length === course.quiz.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4 border border-neutral-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">{course.title} - 퀴즈</p>
            <p className="text-xs text-neutral-400">
              10문제 / 80점 이상 이수
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Questions */}
        {!submitted ? (
          <div className="p-5 space-y-6">
            {course.quiz.map((q, qIdx) => (
              <div key={qIdx} className="space-y-2">
                <p className="text-xs font-semibold text-neutral-800">
                  <span className="text-neutral-400 mr-1">Q{qIdx + 1}.</span>
                  {q.q}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 text-xs cursor-pointer border transition-colors",
                        answers[qIdx] === optIdx
                          ? "border-neutral-800 bg-neutral-50"
                          : "border-neutral-100 hover:border-neutral-300"
                      )}
                    >
                      <input
                        type="radio"
                        name={`q-${qIdx}`}
                        checked={answers[qIdx] === optIdx}
                        onChange={() => handleSelect(qIdx, optIdx)}
                        className="accent-neutral-800"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={clsx(
                "w-full py-2.5 text-xs font-semibold transition-colors",
                allAnswered
                  ? "bg-neutral-900 text-white hover:bg-neutral-800"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              )}
            >
              제출하기 ({Object.keys(answers).length}/10)
            </button>
          </div>
        ) : (
          /* Result */
          <div className="p-5 space-y-5">
            <div className="text-center py-6 space-y-3">
              {passed ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-neutral-800 mx-auto" />
                  <p className="text-lg font-bold">이수 완료!</p>
                  <p className="text-sm text-neutral-500">
                    {score}점으로 합격했습니다
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-neutral-400 mx-auto" />
                  <p className="text-lg font-bold">재시도 필요</p>
                  <p className="text-sm text-neutral-500">
                    {score}점 (80점 이상 필요)
                  </p>
                </>
              )}
            </div>

            {/* Answer review */}
            <div className="space-y-3">
              {course.quiz.map((q, qIdx) => {
                const isCorrect = answers[qIdx] === q.answer;
                return (
                  <div
                    key={qIdx}
                    className={clsx(
                      "p-3 border text-xs",
                      isCorrect
                        ? "border-neutral-200 bg-neutral-50"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">
                          Q{qIdx + 1}. {q.q}
                        </p>
                        {!isCorrect && (
                          <p className="text-neutral-500 mt-1">
                            정답: {q.options[q.answer]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              {passed ? (
                <button
                  onClick={() => onComplete(score)}
                  className="flex-1 py-2.5 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  확인
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                      setScore(0);
                    }}
                    className="flex-1 py-2.5 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    재시도
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 text-xs font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    닫기
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Course Card                                                        */
/* ================================================================== */

function CourseCard({
  course,
  onStartQuiz,
  onMarkLearning,
}: {
  course: Course;
  onStartQuiz: () => void;
  onMarkLearning: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = courseIcons[course.id] || BookOpen;

  return (
    <div className="border border-neutral-200 bg-white">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Number badge */}
          <div className="w-7 h-7 bg-neutral-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-neutral-500">
              {String(course.id).padStart(2, "0")}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Icon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <p className="text-sm font-semibold">{course.title}</p>
              <span className="text-xs text-neutral-400">
                {course.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={clsx(
                  "text-xs px-1.5 py-0.5 font-medium",
                  categoryColor(course.category)
                )}
              >
                {course.category}
              </span>
              <span className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-500 border border-neutral-100 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {course.duration}
              </span>
              <span
                className={clsx(
                  "text-xs px-1.5 py-0.5 font-medium",
                  statusColor(course.status)
                )}
              >
                {course.status}
              </span>
              {course.score !== null && (
                <span className="text-xs text-neutral-500 font-medium">
                  {course.score}/100
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1 bg-neutral-100 w-full">
              <div
                className="h-1 bg-neutral-800 transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>

          {/* Chevron */}
          <div className="shrink-0">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-600 leading-relaxed mt-3">
            {course.description}
          </p>
          <div className="flex gap-2 mt-3">
            {course.status === "미이수" && (
              <button
                onClick={onMarkLearning}
                className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                학습 시작
              </button>
            )}
            {(course.status === "학습중" || course.status === "퀴즈대기") && (
              <button
                onClick={onStartQuiz}
                className="text-xs px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-1"
              >
                <Award className="w-3 h-3" />
                학습 완료 (퀴즈 응시)
              </button>
            )}
            {course.status === "이수완료" && (
              <button
                onClick={onStartQuiz}
                className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                다시 풀기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("전체");
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [quizCourse, setQuizCourse] = useState<Course | null>(null);

  /* Stats */
  const total = courses.length;
  const requiredDone = courses.filter(
    (c) => c.category === "필수" && c.status === "이수완료"
  ).length;
  const requiredTotal = courses.filter((c) => c.category === "필수").length;
  const proDone = courses.filter(
    (c) => c.category === "전문" && c.status === "이수완료"
  ).length;
  const proTotal = courses.filter((c) => c.category === "전문").length;
  const advDone = courses.filter(
    (c) => c.category === "심화" && c.status === "이수완료"
  ).length;
  const advTotal = courses.filter((c) => c.category === "심화").length;
  const completedCourses = courses.filter((c) => c.status === "이수완료");
  const avgScore =
    completedCourses.length > 0
      ? Math.round(
          completedCourses.reduce((a, c) => a + (c.score || 0), 0) /
            completedCourses.length
        )
      : 0;

  /* Filter */
  const filteredCourses = (() => {
    switch (activeTab) {
      case "필수":
        return courses.filter((c) => c.category === "필수");
      case "전문":
        return courses.filter((c) => c.category === "전문");
      case "심화":
        return courses.filter((c) => c.category === "심화");
      case "VRIEF":
        return courses.filter((c) => c.id === 5);
      case "GPR":
        return courses.filter((c) => c.id === 4);
      default:
        return courses;
    }
  })();

  /* Handlers */
  const handleMarkLearning = (id: number) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "학습중" as CourseStatus, progress: 50 } : c
      )
    );
  };

  const handleQuizComplete = (id: number, score: number) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: (score >= 80 ? "이수완료" : "퀴즈대기") as CourseStatus,
              score: score >= 80 ? score : c.score,
              progress: score >= 80 ? 100 : 75,
            }
          : c
      )
    );
    setQuizCourse(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-neutral-400" />
          <h1 className="text-base font-bold text-neutral-900">Education</h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Ten:One™ 교육 허브 - 필수, 전문, 심화 과정을 학습하고 퀴즈로 이수합니다
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-0 border border-neutral-200">
        {[
          { label: "전체 과정", value: `${total}개` },
          { label: "필수 이수", value: `${requiredDone}/${requiredTotal}` },
          { label: "전문 이수", value: `${proDone}/${proTotal}` },
          { label: "심화 이수", value: `${advDone}/${advTotal}` },
          { label: "평균 점수", value: completedCourses.length > 0 ? `${avgScore}점` : "-" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={clsx(
              "p-3 text-center bg-white",
              i < 4 && "border-r border-neutral-200"
            )}
          >
            <p className="text-lg font-bold text-neutral-900">{s.value}</p>
            <p className="text-xs text-neutral-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 flex gap-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-neutral-800 text-neutral-800"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pb-12">
        {/* VRIEF special content */}
        {activeTab === "VRIEF" && (
          <div className="space-y-4 mb-6">
            <div className="border border-neutral-900 bg-neutral-900 text-white p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">VRIEF Framework</p>
                  <p className="text-xs text-neutral-300 mt-1">
                    일하는 방식 - How We Work. PPT 먼저 켜지 말고 스토리(서술형)로 먼저 정리한다.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs px-2 py-0.5 bg-neutral-800">Agile 방식</span>
                    <span className="text-xs px-2 py-0.5 bg-neutral-800">지속 업데이트</span>
                    <span className="text-xs px-2 py-0.5 bg-neutral-800">AI · 디지털 협업</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-0">
              {vriefOutline.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-neutral-800 text-white flex items-center justify-center text-xs font-bold">
                        {s.step}
                      </div>
                      <Icon className="w-3.5 h-3.5 text-neutral-400" />
                      <p className="text-xs font-bold">{s.title}</p>
                    </div>
                    <p className="text-xs text-neutral-500">{s.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="border border-neutral-200 bg-white p-3 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <p className="text-xs text-neutral-500">
                가설이 틀렸다면 Step 1으로 돌아가 본질을 재논의합니다. 완료 후에도 회고를 통해 다음 사이클에 학습을 반영합니다.
              </p>
            </div>

            <p className="text-xs font-semibold text-neutral-700 pt-2">관련 과정</p>
          </div>
        )}

        {/* GPR special content */}
        {activeTab === "GPR" && (
          <div className="space-y-4 mb-6">
            <div className="border border-neutral-900 bg-neutral-900 text-white p-5">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">GPR Guidebook</p>
                  <p className="text-xs text-neutral-300 mt-1">
                    Goal · Plan · Result - 목표는 예측이 아닙니다. 원대한 꿈입니다.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs px-2 py-0.5 bg-neutral-800">성장 중심</span>
                    <span className="text-xs px-2 py-0.5 bg-neutral-800">학습 순환</span>
                    <span className="text-xs px-2 py-0.5 bg-neutral-800">정직한 회고</span>
                    <span className="text-xs px-2 py-0.5 bg-neutral-800">원대한 목표</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-0">
              {gprOutline.map((g) => {
                const Icon = g.icon;
                return (
                  <div key={g.phase} className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-3.5 h-3.5 text-neutral-400" />
                      <div>
                        <p className="text-xs font-bold">{g.phase}</p>
                        <p className="text-xs text-neutral-400">{g.label}</p>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 italic">{g.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="border border-neutral-200 bg-white p-3 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <p className="text-xs text-neutral-500">
                Result에서 배운 학습은 다음 Goal에 반영됩니다. GPR은 계속 순환하는 성장 엔진입니다.
              </p>
            </div>

            <p className="text-xs font-semibold text-neutral-700 pt-2">관련 과정</p>
          </div>
        )}

        {/* Course cards */}
        <div className="space-y-0">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onStartQuiz={() => setQuizCourse(course)}
              onMarkLearning={() => handleMarkLearning(course.id)}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-xs text-neutral-400">
            해당 카테고리에 과정이 없습니다
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-100 pt-4 pb-8">
        <p className="text-xs text-neutral-300">
          교육 과정에 대한 문의는 HR 또는 Wiki 관리자에게 연락하세요.
        </p>
      </div>

      {/* Quiz Modal */}
      {quizCourse && (
        <QuizModal
          course={quizCourse}
          onClose={() => setQuizCourse(null)}
          onComplete={(score) => handleQuizComplete(quizCourse.id, score)}
        />
      )}
    </div>
  );
}
