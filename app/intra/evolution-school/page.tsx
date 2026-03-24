"use client";

import { useState, useMemo, useEffect } from "react";
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
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Trophy,
  FileText,
} from "lucide-react";
import * as educationDb from "@/lib/supabase/education";
import { useAuth } from "@/lib/auth-context";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type CourseStatus = "미이수" | "학습중" | "이수완료";
type CategoryFilter = "전체" | "필수" | "전문" | "심화";
type StatusFilter = "전체" | "미이수" | "학습중" | "이수완료";
type TabId = "전체 과정" | "내 수료 현황" | "VRIEF" | "GPR";

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

interface Course {
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

const initialCourses: Course[] = [
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

/* ================================================================== */
/*  Icon map                                                           */
/* ================================================================== */

const courseIcons: Record<number, React.ReactNode> = {
  1: <Sparkles className="w-3.5 h-3.5" />,
  2: <BookOpen className="w-3.5 h-3.5" />,
  3: <Heart className="w-3.5 h-3.5" />,
  4: <Target className="w-3.5 h-3.5" />,
  5: <FlaskConical className="w-3.5 h-3.5" />,
  6: <Shield className="w-3.5 h-3.5" />,
  7: <Heart className="w-3.5 h-3.5" />,
  8: <Lightbulb className="w-3.5 h-3.5" />,
  9: <Megaphone className="w-3.5 h-3.5" />,
  10: <BarChart3 className="w-3.5 h-3.5" />,
  11: <Palette className="w-3.5 h-3.5" />,
  12: <PenTool className="w-3.5 h-3.5" />,
  13: <Brain className="w-3.5 h-3.5" />,
  14: <Users className="w-3.5 h-3.5" />,
  15: <Rocket className="w-3.5 h-3.5" />,
  16: <FolderKanban className="w-3.5 h-3.5" />,
  17: <LineChart className="w-3.5 h-3.5" />,
  18: <GraduationCap className="w-3.5 h-3.5" />,
  19: <Handshake className="w-3.5 h-3.5" />,
  20: <PenTool className="w-3.5 h-3.5" />,
};

/* ================================================================== */
/*  Helper components                                                  */
/* ================================================================== */

function CategoryBadge({ cat }: { cat: "필수" | "전문" | "심화" }) {
  const style = {
    필수: "bg-neutral-800 text-white",
    전문: "bg-neutral-200 text-neutral-700",
    심화: "bg-neutral-100 text-neutral-500",
  }[cat];
  return (
    <span className={clsx("px-1.5 py-0.5 rounded text-xs font-medium", style)}>
      {cat}
    </span>
  );
}

function StatusBadge({ status }: { status: CourseStatus }) {
  const style = {
    미이수: "bg-neutral-100 text-neutral-500",
    학습중: "bg-amber-50 text-amber-700 border border-amber-200",
    이수완료: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  }[status];
  const icon = {
    미이수: <XCircle className="w-3 h-3" />,
    학습중: <Play className="w-3 h-3" />,
    이수완료: <CheckCircle2 className="w-3 h-3" />,
  }[status];
  return (
    <span className={clsx("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium", style)}>
      {icon} {status}
    </span>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function EvolutionSchoolPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [activeTab, setActiveTab] = useState<TabId>("전체 과정");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("전체");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Quiz state
  const [quizCourseId, setQuizCourseId] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // ── Auth & DB sync ──
  const { user } = useAuth();

  useEffect(() => {
    educationDb.fetchCourses().then(({ courses: dbCourses }) => {
      if (dbCourses && dbCourses.length > 0) {
        // DB 과정이 있으면 state 업데이트 (Mock fallback 대체)
        const mapped: Course[] = dbCourses.map((dc: Record<string, unknown>) => ({
          id: Number(dc.id),
          title: String(dc.title ?? ""),
          subtitle: String(dc.subtitle ?? ""),
          category: (dc.category as Course["category"]) ?? "필수",
          duration: String(dc.duration ?? ""),
          durationMin: Number(dc.duration_min ?? 0),
          status: (dc.status as CourseStatus) ?? "미이수",
          score: dc.score != null ? Number(dc.score) : null,
          completedDate: dc.completed_date ? String(dc.completed_date) : null,
          description: String(dc.description ?? ""),
          objectives: Array.isArray(dc.objectives) ? dc.objectives as string[] : [],
          targetAudience: String(dc.target_audience ?? ""),
          instructor: String(dc.instructor ?? ""),
          quiz: Array.isArray(dc.quiz) ? dc.quiz as QuizQuestion[] : [],
        }));
        setCourses(mapped);
      }
    }).catch(() => {
      // DB 실패 시 Mock 데이터 유지
    });
  }, []);

  // ── Derived stats ──
  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter((c) => c.status === "이수완료");
    const completedCount = completed.length;
    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((s, c) => s + (c.score ?? 0), 0) / completed.length)
        : 0;
    const mandatoryIncomplete = courses.filter(
      (c) => c.category === "필수" && c.status !== "이수완료"
    ).length;
    return { total, completedCount, avgScore, mandatoryIncomplete };
  }, [courses]);

  const categoryCounts = useMemo(() => {
    const m = courses.filter((c) => c.category === "필수").length;
    const p = courses.filter((c) => c.category === "전문").length;
    const a = courses.filter((c) => c.category === "심화").length;
    return { 필수: m, 전문: p, 심화: a };
  }, [courses]);

  const completionByCategory = useMemo(() => {
    const calc = (cat: "필수" | "전문" | "심화") => {
      const all = courses.filter((c) => c.category === cat);
      const done = all.filter((c) => c.status === "이수완료");
      return { done: done.length, total: all.length };
    };
    return { 필수: calc("필수"), 전문: calc("전문"), 심화: calc("심화") };
  }, [courses]);

  // ── Filtered courses ──
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (categoryFilter !== "전체" && c.category !== categoryFilter) return false;
      if (statusFilter !== "전체" && c.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.subtitle.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [courses, categoryFilter, statusFilter, searchQuery]);

  // ── Actions ──
  const startLearning = (id: number) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "학습중" as CourseStatus } : c))
    );
    // DB 수강 등록 (비동기, 실패 무시)
    if (user?.id) {
      educationDb.enrollCourse(user.id, String(id)).catch(() => {});
    }
  };

  const openQuiz = (id: number) => {
    setQuizCourseId(id);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const submitQuiz = () => {
    if (quizCourseId === null) return;
    const course = courses.find((c) => c.id === quizCourseId);
    if (!course) return;

    let correct = 0;
    course.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) correct++;
    });

    const totalQ = 10;
    const answeredCorrect = correct;
    // Mock: 3 real questions, 7 placeholder = auto-correct
    const mockBonus = 7;
    const finalScore = Math.round(((answeredCorrect + mockBonus) / totalQ) * 100);

    setQuizScore(finalScore);
    setQuizSubmitted(true);

    if (finalScore >= 80) {
      const today = new Date().toISOString().split("T")[0];
      setCourses((prev) =>
        prev.map((c) =>
          c.id === quizCourseId
            ? { ...c, status: "이수완료" as CourseStatus, score: finalScore, completedDate: today }
            : c
        )
      );
      // DB 이수 완료 기록 (비동기, 실패 무시)
      if (user?.id) {
        educationDb.completeEnrollment(String(quizCourseId), finalScore).catch(() => {});
      }
    }
  };

  const closeQuiz = () => {
    setQuizCourseId(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const retakeQuiz = (id: number) => {
    openQuiz(id);
  };

  // ── Tab content ──
  const tabs: TabId[] = ["전체 과정", "내 수료 현황", "VRIEF", "GPR"];

  const quizCourse = quizCourseId !== null ? courses.find((c) => c.id === quizCourseId) : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">Evolution School</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Ten:One™ 교육 과정 · 역량 개발</p>
      </div>

      {/* ── Top Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "전체 과정", value: `${stats.total}개`, icon: <BookOpen className="w-3.5 h-3.5" /> },
          {
            label: "내 이수",
            value: `${stats.completedCount}/${stats.total}`,
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          },
          { label: "평균 점수", value: `${stats.avgScore}점`, icon: <Award className="w-3.5 h-3.5" /> },
          {
            label: "필수 미이수",
            value: `${stats.mandatoryIncomplete}건`,
            icon: <AlertTriangle className="w-3.5 h-3.5" />,
            warn: stats.mandatoryIncomplete > 0,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={clsx(
              "border rounded-lg p-3",
              s.warn ? "border-amber-200 bg-amber-50/50" : "border-neutral-200 bg-white"
            )}
          >
            <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
              {s.icon}
              <span className="text-xs font-medium uppercase tracking-wide">{s.label}</span>
            </div>
            <p className={clsx("text-sm font-semibold", s.warn ? "text-amber-700" : "text-neutral-900")}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-neutral-200 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-3 py-2 text-xs font-medium border-b-2 transition-colors",
              activeTab === tab
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  TAB 1: 전체 과정                                                */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "전체 과정" && (
        <>
          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Category */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-400 mr-1">구분</span>
              {(["전체", "필수", "전문", "심화"] as CategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={clsx(
                    "px-2 py-1 rounded text-[11px] font-medium transition-colors",
                    categoryFilter === cat
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  )}
                >
                  {cat}
                  {cat !== "전체" && (
                    <span className="ml-0.5 opacity-60">({categoryCounts[cat]})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-400 mr-1">상태</span>
              {(["전체", "미이수", "학습중", "이수완료"] as StatusFilter[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={clsx(
                    "px-2 py-1 rounded text-[11px] font-medium transition-colors",
                    statusFilter === st
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative ml-auto">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
              <input
                type="text"
                placeholder="과정 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md w-48 focus:outline-none focus:border-neutral-400 bg-white"
              />
            </div>
          </div>

          {/* Course grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredCourses.map((course) => {
              const isExpanded = expandedId === course.id;
              return (
                <div
                  key={course.id}
                  className="border border-neutral-200 rounded-lg bg-white overflow-hidden"
                >
                  {/* Card header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : course.id)}
                    className="w-full text-left p-3.5 hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Number badge */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                        <span className="text-xs font-bold">
                          {String(course.id).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-medium text-neutral-900 truncate">
                            {course.title}
                          </h3>
                          <CategoryBadge cat={course.category} />
                        </div>
                        <p className="text-xs text-neutral-400 mb-1.5">{course.subtitle}</p>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                            <Clock className="w-3 h-3" /> {course.duration}
                          </span>
                          <StatusBadge status={course.status} />
                          {course.status === "이수완료" && course.score !== null && (
                            <span className="text-xs font-medium text-emerald-600">
                              {course.score}/100
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand icon */}
                      <div className="flex-shrink-0 text-neutral-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 p-4 bg-neutral-50/30">
                      <div className="space-y-3">
                        {/* Description */}
                        <div>
                          <h4 className="text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> 강의 설명
                          </h4>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {course.description}
                          </p>
                        </div>

                        {/* Objectives */}
                        <div>
                          <h4 className="text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                            <Target className="w-3 h-3" /> 학습 목표
                          </h4>
                          <ul className="space-y-0.5">
                            {course.objectives.map((obj, i) => (
                              <li key={i} className="text-xs text-neutral-600 flex items-start gap-1.5">
                                <span className="text-neutral-400 mt-0.5">-</span>
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Meta */}
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-neutral-400">대상</span>
                            <p className="text-neutral-700 mt-0.5">{course.targetAudience}</p>
                          </div>
                          <div>
                            <span className="text-neutral-400">소요 시간</span>
                            <p className="text-neutral-700 mt-0.5">{course.duration}</p>
                          </div>
                          <div>
                            <span className="text-neutral-400">강사/출처</span>
                            <p className="text-neutral-700 mt-0.5">{course.instructor}</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-1">
                          {course.status === "미이수" && (
                            <button
                              onClick={() => startLearning(course.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 text-white rounded-md text-xs font-medium hover:bg-neutral-700 transition-colors"
                            >
                              <Play className="w-3 h-3" /> 학습 시작
                            </button>
                          )}
                          {course.status === "학습중" && (
                            <button
                              onClick={() => openQuiz(course.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 text-white rounded-md text-xs font-medium hover:bg-neutral-700 transition-colors"
                            >
                              <FlaskConical className="w-3 h-3" /> 학습 완료 &rarr; 퀴즈
                            </button>
                          )}
                          {course.status === "이수완료" && (
                            <button
                              onClick={() => retakeQuiz(course.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-50 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" /> 재시험
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12 text-neutral-400 text-xs">
              조건에 맞는 과정이 없습니다.
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  TAB 2: 내 수료 현황                                              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "내 수료 현황" && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="border border-neutral-200 rounded-lg bg-white p-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">이수 현황 요약</h3>

            {/* Overall progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                <span>전체 이수율</span>
                <span>
                  {stats.completedCount}/{stats.total} (
                  {Math.round((stats.completedCount / stats.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div
                  className="bg-neutral-800 rounded-full h-2 transition-all"
                  style={{ width: `${(stats.completedCount / stats.total) * 100}%` }}
                />
              </div>
            </div>

            {/* By category */}
            <div className="grid grid-cols-3 gap-3">
              {(["필수", "전문", "심화"] as const).map((cat) => {
                const d = completionByCategory[cat];
                return (
                  <div key={cat} className="bg-neutral-50 rounded-md p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CategoryBadge cat={cat} />
                      <span className="text-[11px] text-neutral-500">
                        {d.done}/{d.total}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div
                        className="bg-neutral-600 rounded-full h-1.5 transition-all"
                        style={{ width: d.total > 0 ? `${(d.done / d.total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed courses table */}
          <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> 이수 완료 과정
              </h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500">
                  <th className="text-left px-4 py-2 font-medium">#</th>
                  <th className="text-left px-4 py-2 font-medium">과정명</th>
                  <th className="text-left px-4 py-2 font-medium">구분</th>
                  <th className="text-left px-4 py-2 font-medium">이수일</th>
                  <th className="text-left px-4 py-2 font-medium">점수</th>
                  <th className="text-left px-4 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {courses
                  .filter((c) => c.status === "이수완료")
                  .map((c) => (
                    <tr key={c.id} className="border-t border-neutral-100 hover:bg-neutral-50/50">
                      <td className="px-4 py-2.5 text-neutral-400 font-mono">
                        {String(c.id).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-800 font-medium">{c.title}</td>
                      <td className="px-4 py-2.5">
                        <CategoryBadge cat={c.category} />
                      </td>
                      <td className="px-4 py-2.5 text-neutral-500">{c.completedDate}</td>
                      <td className="px-4 py-2.5 text-emerald-600 font-medium">{c.score}/100</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                {courses.filter((c) => c.status === "이수완료").length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                      이수 완료한 과정이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Incomplete courses table */}
          <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-neutral-400" /> 미이수 과정
              </h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500">
                  <th className="text-left px-4 py-2 font-medium">#</th>
                  <th className="text-left px-4 py-2 font-medium">과정명</th>
                  <th className="text-left px-4 py-2 font-medium">구분</th>
                  <th className="text-left px-4 py-2 font-medium">소요 시간</th>
                  <th className="text-left px-4 py-2 font-medium">상태</th>
                  <th className="text-left px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {courses
                  .filter((c) => c.status !== "이수완료")
                  .map((c) => (
                    <tr key={c.id} className="border-t border-neutral-100 hover:bg-neutral-50/50">
                      <td className="px-4 py-2.5 text-neutral-400 font-mono">
                        {c.category === "필수" && c.status === "미이수" && (
                          <span className="mr-1" title="필수 미이수">⚠️</span>
                        )}
                        {String(c.id).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-800 font-medium">{c.title}</td>
                      <td className="px-4 py-2.5">
                        <CategoryBadge cat={c.category} />
                      </td>
                      <td className="px-4 py-2.5 text-neutral-500">{c.duration}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        {c.status === "미이수" ? (
                          <button
                            onClick={() => startLearning(c.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 text-white rounded text-xs font-medium hover:bg-neutral-700"
                          >
                            <Play className="w-2.5 h-2.5" /> 학습 시작
                          </button>
                        ) : c.status === "학습중" ? (
                          <button
                            onClick={() => openQuiz(c.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 text-white rounded text-xs font-medium hover:bg-neutral-700"
                          >
                            <FlaskConical className="w-2.5 h-2.5" /> 퀴즈
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  TAB 3: VRIEF                                                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "VRIEF" && (
        <div className="space-y-5">
          {/* Overview */}
          <div className="border border-neutral-200 rounded-lg bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-semibold text-neutral-900">VRIEF 프레임워크</h3>
            </div>
            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              VRIEF는 Ten:One의 핵심 전략 수립 프레임워크로, 데이터 기반 의사결정을 위한 5단계
              프로세스를 제공합니다. 모든 기획·전략 업무에 VRIEF를 적용하여 체계적인 성과를
              도출합니다.
            </p>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {[
                { step: "V", label: "Verify", desc: "현상 확인 및 조사" },
                { step: "R", label: "Research", desc: "가설 수립 및 검증" },
                { step: "I", label: "Insight", desc: "핵심 인사이트 도출" },
                { step: "E", label: "Execute", desc: "전략 수립 및 실행" },
                { step: "F", label: "Feedback", desc: "결과 측정 및 환류" },
              ].map((s, i) => (
                <div key={s.step} className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-bold mb-1">
                    {s.step}
                  </div>
                  <p className="text-xs font-medium text-neutral-700">{s.label}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{s.desc}</p>
                  {i < 4 && (
                    <ArrowRight className="w-3 h-3 text-neutral-300 mx-auto mt-1 hidden lg:block" />
                  )}
                </div>
              ))}
            </div>

            <a
              href="/intra/wiki"
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Wiki에서 VRIEF 전체 가이드 보기
            </a>
          </div>

          {/* VRIEF course card expanded */}
          {(() => {
            const vrief = courses.find((c) => c.id === 5);
            if (!vrief) return null;
            return (
              <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                      <span className="text-xs font-bold">05</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-neutral-900">{vrief.title}</h3>
                        <CategoryBadge cat={vrief.category} />
                        <StatusBadge status={vrief.status} />
                        {vrief.score !== null && (
                          <span className="text-xs font-medium text-emerald-600">
                            {vrief.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">{vrief.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-100 p-4 bg-neutral-50/30 space-y-3">
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">강의 설명</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{vrief.description}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">학습 목표</h4>
                    <ul className="space-y-0.5">
                      {vrief.objectives.map((o, i) => (
                        <li key={i} className="text-xs text-neutral-600 flex items-start gap-1.5">
                          <span className="text-neutral-400 mt-0.5">-</span> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-neutral-400">대상</span>
                      <p className="text-neutral-700 mt-0.5">{vrief.targetAudience}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">소요 시간</span>
                      <p className="text-neutral-700 mt-0.5">{vrief.duration}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">강사/출처</span>
                      <p className="text-neutral-700 mt-0.5">{vrief.instructor}</p>
                    </div>
                  </div>
                  {vrief.status === "이수완료" && (
                    <div className="pt-1">
                      <button
                        onClick={() => retakeQuiz(vrief.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-50"
                      >
                        <RotateCcw className="w-3 h-3" /> 재시험
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  TAB 4: GPR                                                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "GPR" && (
        <div className="space-y-5">
          {/* Overview */}
          <div className="border border-neutral-200 rounded-lg bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-semibold text-neutral-900">GPR 성장 철학</h3>
            </div>
            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              GPR(Goal &middot; Plan &middot; Result)은 Ten:One 구성원의 개인 및 팀 성장을 위한
              핵심 프레임워크입니다. 명확한 목표 설정, 실행 가능한 계획 수립, 측정 가능한 결과
              도출의 사이클을 반복하여 지속적인 성장을 추구합니다.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                {
                  step: "G",
                  label: "Goal",
                  desc: "SMART한 목표를 설정합니다. 구체적이고 측정 가능하며 달성 가능한 목표를 수립합니다.",
                },
                {
                  step: "P",
                  label: "Plan",
                  desc: "목표 달성을 위한 구체적인 실행 계획을 수립합니다. 마일스톤과 타임라인을 정합니다.",
                },
                {
                  step: "R",
                  label: "Result",
                  desc: "결과를 측정하고 회고합니다. 학습한 것을 다음 Goal에 반영하여 성장 사이클을 완성합니다.",
                },
              ].map((s) => (
                <div key={s.step} className="bg-neutral-50 rounded-md p-3">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-bold mb-2">
                    {s.step}
                  </div>
                  <p className="text-[11px] font-semibold text-neutral-700 mb-1">{s.label}</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <a
              href="/intra/wiki"
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Wiki에서 GPR 가이드북 보기
            </a>
          </div>

          {/* GPR course card expanded */}
          {(() => {
            const gpr = courses.find((c) => c.id === 4);
            if (!gpr) return null;
            return (
              <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                      <span className="text-xs font-bold">04</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-neutral-900">{gpr.title}</h3>
                        <CategoryBadge cat={gpr.category} />
                        <StatusBadge status={gpr.status} />
                        {gpr.score !== null && (
                          <span className="text-xs font-medium text-emerald-600">
                            {gpr.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">{gpr.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-100 p-4 bg-neutral-50/30 space-y-3">
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">강의 설명</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{gpr.description}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">학습 목표</h4>
                    <ul className="space-y-0.5">
                      {gpr.objectives.map((o, i) => (
                        <li key={i} className="text-xs text-neutral-600 flex items-start gap-1.5">
                          <span className="text-neutral-400 mt-0.5">-</span> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-neutral-400">대상</span>
                      <p className="text-neutral-700 mt-0.5">{gpr.targetAudience}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">소요 시간</span>
                      <p className="text-neutral-700 mt-0.5">{gpr.duration}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">강사/출처</span>
                      <p className="text-neutral-700 mt-0.5">{gpr.instructor}</p>
                    </div>
                  </div>
                  {gpr.status === "이수완료" && (
                    <div className="pt-1">
                      <button
                        onClick={() => retakeQuiz(gpr.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-50"
                      >
                        <RotateCcw className="w-3 h-3" /> 재시험
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  Quiz Modal                                                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {quizCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl mx-4">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-3 flex items-center justify-between rounded-t-xl z-10">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  퀴즈: {quizCourse.title}
                </h3>
                <p className="text-xs text-neutral-400">10문제 / 80점 이상 이수</p>
              </div>
              <button
                onClick={closeQuiz}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Real questions (3) */}
              {quizCourse.quiz.map((q, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs font-medium text-neutral-800">
                    <span className="text-neutral-400 mr-1">Q{i + 1}.</span> {q.q}
                  </p>
                  <div className="space-y-1 pl-4">
                    {q.options.map((opt, oi) => {
                      const selected = quizAnswers[i] === oi;
                      const isCorrect = quizSubmitted && q.answer === oi;
                      const isWrong = quizSubmitted && selected && q.answer !== oi;
                      return (
                        <label
                          key={oi}
                          className={clsx(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded text-xs cursor-pointer transition-colors",
                            selected && !quizSubmitted && "bg-neutral-100",
                            isCorrect && "bg-emerald-50 text-emerald-700",
                            isWrong && "bg-red-50 text-red-600",
                            !selected && !isCorrect && !isWrong && "hover:bg-neutral-50"
                          )}
                        >
                          <input
                            type="radio"
                            name={`q-${i}`}
                            disabled={quizSubmitted}
                            checked={selected}
                            onChange={() =>
                              setQuizAnswers((prev) => ({ ...prev, [i]: oi }))
                            }
                            className="w-3 h-3 accent-neutral-800"
                          />
                          <span>{opt}</span>
                          {isCorrect && (
                            <CheckCircle2 className="w-3 h-3 ml-auto text-emerald-500" />
                          )}
                          {isWrong && <XCircle className="w-3 h-3 ml-auto text-red-400" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Placeholder questions (Q4~Q10) */}
              {[4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div key={n} className="space-y-1">
                  <p className="text-xs text-neutral-300">
                    <span className="mr-1">Q{n}.</span> 추가 문제 준비 중...
                  </p>
                  <div className="pl-4">
                    {[1, 2, 3, 4].map((o) => (
                      <div key={o} className="flex items-center gap-2 px-2.5 py-1 text-xs text-neutral-200">
                        <div className="w-3 h-3 rounded-full border border-neutral-200" />
                        <div className="h-2 w-24 bg-neutral-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-5 py-3 rounded-b-xl">
              {!quizSubmitted ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-400">
                    {Object.keys(quizAnswers).length}/3 답변 완료 (나머지 7문제는 자동 정답 처리)
                  </p>
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length < 3}
                    className={clsx(
                      "px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
                      Object.keys(quizAnswers).length >= 3
                        ? "bg-neutral-800 text-white hover:bg-neutral-700"
                        : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    )}
                  >
                    제출
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={clsx(
                        "text-sm font-semibold",
                        quizScore !== null && quizScore >= 80
                          ? "text-emerald-600"
                          : "text-red-500"
                      )}
                    >
                      {quizScore !== null && quizScore >= 80
                        ? "이수 완료!"
                        : "미달 (80점 미만)"}
                    </p>
                    <p className="text-xs text-neutral-400">점수: {quizScore}/100</p>
                  </div>
                  <div className="flex gap-2">
                    {quizScore !== null && quizScore < 80 && (
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                          setQuizScore(null);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 text-white rounded-md text-xs font-medium hover:bg-neutral-700"
                      >
                        <RefreshCw className="w-3 h-3" /> 재시도
                      </button>
                    )}
                    <button
                      onClick={closeQuiz}
                      className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-50"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
