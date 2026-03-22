"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  Rocket,
  BookOpen,
  CheckSquare,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Check,
  Clock,
  Award,
  Shield,
  Heart,
  Globe,
  Brain,
  Zap,
  Target,
  AlertCircle,
  BarChart3,
  Megaphone,
  Palette,
  Bot,
  Users,
  Lightbulb,
  TrendingUp,
  Network,
  Pencil,
  Briefcase,
  Database,
} from "lucide-react";
import Link from "next/link";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type TabId = "intro" | "checklist" | "required" | "advanced";

interface ChecklistItem {
  id: string;
  text: string;
  mandatory?: boolean;
  score?: number | null;
  status: "incomplete" | "complete" | "exempt";
  completedDate?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface CourseData {
  id: string;
  title: string;
  duration: string;
  icon: React.ElementType;
  status: "incomplete" | "complete";
  score: number | null;
  content: React.ReactNode;
  quiz: QuizQuestion[];
}

/* ================================================================== */
/*  Tab Config                                                         */
/* ================================================================== */

const tabs: { id: TabId; label: string }[] = [
  { id: "intro", label: "소개" },
  { id: "checklist", label: "온보딩 체크리스트" },
  { id: "required", label: "필수 이수 과정" },
  { id: "advanced", label: "심화 과정" },
];

/* ================================================================== */
/*  Checklist Data                                                     */
/* ================================================================== */

const initialChecklist: { period: string; label: string; items: ChecklistItem[] }[] = [
  {
    period: "Day 1",
    label: "시스템 셋업",
    items: [
      { id: "d1-1", text: "Intra 계정 생성 및 로그인", status: "incomplete" },
      { id: "d1-2", text: "Myverse 프로필 완성 (사진, 자기소개, 목표/가치)", status: "incomplete" },
      { id: "d1-3", text: "메신저 접속 및 팀 채팅방 참여", status: "incomplete" },
      { id: "d1-4", text: "조직도 확인 및 직속 상사 인사", status: "incomplete" },
    ],
  },
  {
    period: "Week 1",
    label: "문화 이해",
    items: [
      { id: "w1-1", text: "Culture & Mind Set 교육 이수", mandatory: true, score: null, status: "incomplete" },
      { id: "w1-2", text: "Principle 10 교육 이수", mandatory: true, score: null, status: "incomplete" },
      { id: "w1-3", text: "Ten:One™ Universe 입문 이수", mandatory: true, score: null, status: "incomplete" },
      { id: "w1-4", text: "팀 소개 미팅 참석", status: "incomplete" },
      { id: "w1-5", text: "Handbook 숙독", status: "incomplete" },
    ],
  },
  {
    period: "Month 1",
    label: "업무 시작",
    items: [
      { id: "m1-1", text: "VRIEF 프레임워크 교육 이수", mandatory: true, score: null, status: "incomplete" },
      { id: "m1-2", text: "GPR 교육 이수", mandatory: true, score: null, status: "incomplete" },
      { id: "m1-3", text: "첫 GPR 목표 설정 (상사와 합의)", status: "incomplete" },
      { id: "m1-4", text: "첫 프로젝트 참여", status: "incomplete" },
      { id: "m1-5", text: "VRIEF 실습 (1건 이상)", status: "incomplete" },
    ],
  },
];

/* ================================================================== */
/*  Course Data                                                        */
/* ================================================================== */

const buildCourses = (): CourseData[] => [
  {
    id: "universe",
    title: "Ten:One™ Universe 입문",
    duration: "30분",
    icon: Globe,
    status: "incomplete",
    score: null,
    content: (
      <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
        <p className="font-medium text-neutral-800">세계관 구조</p>
        <p>Ten:One™ Universe는 다양한 브랜드가 하나의 세계관 안에서 유기적으로 연결된 생태계입니다. 각 브랜드는 고유한 역할을 가지며, 공통된 가치와 비전 아래 협력합니다.</p>
        <p className="font-medium text-neutral-800">브랜드 생태계</p>
        <p>AI Idol, AI Creator, Community, Project Group, Fashion, Character, Corporate, Startup, Content 등 다양한 카테고리의 브랜드가 존재하며, Parent, Collaboration, Rivals, Support 등의 관계로 연결됩니다.</p>
        <p className="font-medium text-neutral-800">Vision House</p>
        <p>Philosophy(연결은 더 많은 기회를 만들어 낸다) → Mission(연결하고 조직하고 실행하라) → Vision(We are Planner — 10,000명의 기획자를 발굴하고 연결한다) → Goal(기획자 생태계의 중심이 된다)</p>
        <p className="font-medium text-neutral-800">Core Values</p>
        <p>본질(Essence) — 본질에 집중하라. 속도(Speed) — 빠르게 실행하라. 이행(Carry Out) — 말이 아니라 행동으로 증명하라.</p>
      </div>
    ),
    quiz: [
      {
        question: "Ten:One™ Universe의 Vision은 무엇인가?",
        options: [
          "글로벌 기업이 된다",
          "We are Planner — 10,000명의 기획자를 발굴하고 연결한다",
          "AI 기술의 선두주자가 된다",
          "대한민국 최고의 스타트업이 된다",
        ],
        answer: 1,
      },
      {
        question: "브랜드 간 관계 유형에 해당하지 않는 것은?",
        options: ["Parent", "Collaboration", "Acquisition", "Rivals"],
        answer: 2,
      },
      {
        question: "Ten:One™의 Philosophy는?",
        options: [
          "기술이 세상을 바꾼다",
          "연결은 더 많은 기회를 만들어 낸다",
          "빠르게 실패하고 빠르게 배워라",
          "고객이 최우선이다",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "principle10",
    title: "Principle 10",
    duration: "45분",
    icon: Award,
    status: "incomplete",
    score: null,
    content: (
      <div className="space-y-2.5 text-xs text-neutral-600 leading-relaxed">
        <p className="font-medium text-neutral-800">10대 원칙</p>
        {[
          ["1. 본질에 집중하라", "화려한 것에 현혹되지 말고, 근본적인 문제와 가치에 집중한다."],
          ["2. 속도를 최우선으로 삼아라", "완벽보다 빠른 실행을 택한다. 시장은 기다려주지 않는다."],
          ["3. 말이 아니라 행동으로 증명하라", "계획만 세우지 말고, 실행하고 결과로 보여준다."],
          ["4. 연결하고 조직하고 실행하라", "혼자가 아닌 함께, 체계적으로 움직인다."],
          ["5. 실패를 두려워하지 마라", "실패는 학습이다. 빠르게 실패하고 빠르게 배운다."],
          ["6. 항상 왜(Why)를 물어라", "관성적으로 일하지 말고, 목적과 이유를 끊임없이 질문한다."],
          ["7. 기획자처럼 사고하라", "문제를 발견하고, 해결책을 설계하고, 실행까지 책임진다."],
          ["8. 나의 성장이 우리의 성장이다", "개인의 발전이 조직 전체를 성장시킨다."],
          ["9. 데이터로 판단하라", "감이 아닌 근거로 의사결정한다."],
          ["10. 세계관을 확장하라", "현재에 머무르지 말고, 더 큰 그림을 그린다."],
        ].map(([title, desc]) => (
          <div key={title}>
            <p className="font-medium text-neutral-800">{title}</p>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    ),
    quiz: [
      {
        question: "Principle 8은 무엇인가?",
        options: [
          "데이터로 판단하라",
          "나의 성장이 우리의 성장이다",
          "세계관을 확장하라",
          "속도를 최우선으로 삼아라",
        ],
        answer: 1,
      },
      {
        question: "'실패를 두려워하지 마라'는 몇 번째 원칙인가?",
        options: ["3번", "5번", "7번", "9번"],
        answer: 1,
      },
      {
        question: "기획자처럼 사고하라에서 기획자의 역할에 포함되지 않는 것은?",
        options: ["문제 발견", "해결책 설계", "외부 보고", "실행 책임"],
        answer: 2,
      },
    ],
  },
  {
    id: "culture",
    title: "Culture & Mind Set",
    duration: "30분",
    icon: Brain,
    status: "incomplete",
    score: null,
    content: (
      <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
        <p className="font-medium text-neutral-800">본질 (Essence)</p>
        <p>화려한 것에 현혹되지 않고, 본질적인 가치에 집중합니다. 문제의 핵심을 꿰뚫고, 진짜 중요한 것에 에너지를 쏟습니다.</p>
        <p className="font-medium text-neutral-800">속도 (Speed)</p>
        <p>완벽을 기다리지 않습니다. 80%의 완성도로 빠르게 실행하고, 피드백을 통해 개선합니다. 시장과 기회는 기다려주지 않습니다.</p>
        <p className="font-medium text-neutral-800">이행 (Carry Out)</p>
        <p>말이 아닌 행동, 계획이 아닌 실행. 결과로 증명하는 문화입니다. 회의보다 실행, 보고서보다 프로토타입을 중시합니다.</p>
        <p className="font-medium text-neutral-800">Plan · Connect · Expand</p>
        <p>기획하고(Plan), 연결하고(Connect), 확장한다(Expand). 이것이 텐원이 일하는 방식의 근간입니다. 모든 프로젝트와 의사결정은 이 세 축을 기준으로 움직입니다.</p>
      </div>
    ),
    quiz: [
      {
        question: "텐원의 3대 Core Value에 해당하지 않는 것은?",
        options: ["본질 (Essence)", "속도 (Speed)", "혁신 (Innovation)", "이행 (Carry Out)"],
        answer: 2,
      },
      {
        question: "'80%의 완성도로 빠르게 실행한다'는 어떤 가치와 관련되는가?",
        options: ["본질", "속도", "이행", "연결"],
        answer: 1,
      },
      {
        question: "Plan · Connect · Expand에서 Connect의 의미는?",
        options: ["인터넷 연결", "사람과 자원을 연결", "해외 진출", "데이터 연동"],
        answer: 1,
      },
    ],
  },
  {
    id: "gpr",
    title: "GPR",
    duration: "60분",
    icon: Target,
    status: "incomplete",
    score: null,
    content: (
      <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
        <p className="font-medium text-neutral-800">GPR이란?</p>
        <p>Goal(원대한 꿈) → Plan(가설) → Result(학습). 텐원의 목표 관리 및 성과 체계입니다.</p>
        <p className="font-medium text-neutral-800">5대 원칙</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Goal은 원대하게 — 도전적이고 영감을 주는 목표를 세운다</li>
          <li>Plan은 가설이다 — 계획은 검증할 가설이지, 지켜야 할 약속이 아니다</li>
          <li>Result는 학습이다 — 성공/실패가 아닌, 배운 것을 기록한다</li>
          <li>주기적으로 회고한다 — 매주/매월 GPR을 점검하고 조정한다</li>
          <li>라인 스톱 — 방향이 틀리면 즉시 멈추고 재설정한다</li>
        </ul>
        <p className="font-medium text-neutral-800">운영 사이클</p>
        <p>분기 → 월간 → 주간 단위로 GPR을 설정하고 회고합니다. 분기 GPR이 가장 상위 목표이며, 월간/주간으로 쪼개어 실행합니다.</p>
        <p className="font-medium text-neutral-800">라인 스톱</p>
        <p>잘못된 방향으로 가고 있다고 판단되면 누구나 라인 스톱을 요청할 수 있습니다. 직급에 관계없이, 문제를 발견하면 즉시 멈추고 재논의합니다.</p>
      </div>
    ),
    quiz: [
      {
        question: "GPR에서 P(Plan)의 의미는?",
        options: ["확정된 계획", "가설", "프로세스", "프로젝트"],
        answer: 1,
      },
      {
        question: "라인 스톱을 요청할 수 있는 사람은?",
        options: ["팀장급 이상만", "C-Level만", "누구나", "HR팀만"],
        answer: 2,
      },
      {
        question: "GPR의 운영 사이클 단위가 아닌 것은?",
        options: ["분기", "월간", "주간", "연간"],
        answer: 3,
      },
    ],
  },
  {
    id: "vrief",
    title: "VRIEF",
    duration: "60분",
    icon: Zap,
    status: "incomplete",
    score: null,
    content: (
      <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
        <p className="font-medium text-neutral-800">VRIEF 프레임워크란?</p>
        <p>텐원의 기획 방법론입니다. 체계적인 3단계 프로세스를 통해 문제를 분석하고 전략을 수립합니다.</p>
        <p className="font-medium text-neutral-800">Step 1: 조사 · 분석</p>
        <p>시장, 경쟁사, 고객, 내부 역량을 조사합니다. 데이터를 수집하고, 현황을 객관적으로 파악합니다. 감이 아닌 근거를 기반으로 시작합니다.</p>
        <p className="font-medium text-neutral-800">Step 2: 가설 검증</p>
        <p>조사 결과를 바탕으로 가설을 세우고 검증합니다. 빠른 프로토타이핑과 테스트를 통해 가설의 유효성을 확인합니다.</p>
        <p className="font-medium text-neutral-800">Step 3: 전략 수립</p>
        <p>검증된 가설을 바탕으로 실행 전략을 수립합니다. 목표, 일정, 담당자, KPI를 명확히 정의하고, 실행에 옮깁니다.</p>
      </div>
    ),
    quiz: [
      {
        question: "VRIEF의 Step 1은 무엇인가?",
        options: ["가설 검증", "전략 수립", "조사 · 분석", "실행 · 모니터링"],
        answer: 2,
      },
      {
        question: "VRIEF Step 2에서 가설 검증의 핵심 방법은?",
        options: ["장기간 리서치", "빠른 프로토타이핑과 테스트", "전문가 의견 수렴", "보고서 작성"],
        answer: 1,
      },
      {
        question: "VRIEF Step 3 전략 수립에 포함되지 않는 것은?",
        options: ["목표 정의", "담당자 배정", "KPI 설정", "경쟁사 인수"],
        answer: 3,
      },
    ],
  },
  {
    id: "security",
    title: "정보보안",
    duration: "20분",
    icon: Shield,
    status: "incomplete",
    score: null,
    content: (
      <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
        <p className="font-medium text-neutral-800">비밀번호 정책</p>
        <p>최소 12자 이상, 영문 대소문자 + 숫자 + 특수문자 조합. 90일마다 변경 필수. 이전 5회 사용한 비밀번호 재사용 불가.</p>
        <p className="font-medium text-neutral-800">데이터 취급</p>
        <p>사내 데이터는 승인된 도구와 저장소에서만 취급합니다. 외부 클라우드, 개인 이메일로의 전송은 금지됩니다. 고객 데이터는 암호화하여 저장하며, 접근 권한이 있는 인원만 열람 가능합니다.</p>
        <p className="font-medium text-neutral-800">보안 사고 보고</p>
        <p>보안 사고 발견 시 즉시 IT 보안팀(security@tenone.biz)에 보고합니다. 보고 지연 시 추가 책임이 부과될 수 있습니다.</p>
      </div>
    ),
    quiz: [
      {
        question: "비밀번호 최소 길이는?",
        options: ["8자", "10자", "12자", "16자"],
        answer: 2,
      },
      {
        question: "비밀번호 변경 주기는?",
        options: ["30일", "60일", "90일", "180일"],
        answer: 2,
      },
      {
        question: "보안 사고 발견 시 가장 먼저 해야 할 일은?",
        options: ["팀장에게 보고", "IT 보안팀에 즉시 보고", "자체 해결 시도", "회의 요청"],
        answer: 1,
      },
    ],
  },
  {
    id: "harassment",
    title: "괴롭힘 예방",
    duration: "20분",
    icon: Heart,
    status: "incomplete",
    score: null,
    content: (
      <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
        <p className="font-medium text-neutral-800">직장 내 괴롭힘 유형</p>
        <p>언어적 괴롭힘(모욕, 비하), 신체적 괴롭힘, 업무 관련 괴롭힘(과도한 업무 부여, 업무 배제), 사적 괴롭힘(사생활 간섭, 회식 강요) 등이 해당됩니다.</p>
        <p className="font-medium text-neutral-800">신고 절차</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>1단계: HR팀 또는 익명 신고 채널로 접수</li>
          <li>2단계: 사실 확인 조사 (7일 이내)</li>
          <li>3단계: 징계위원회 심의</li>
          <li>4단계: 조치 및 결과 통보</li>
        </ul>
        <p className="font-medium text-neutral-800">보호 조치</p>
        <p>신고자에 대한 불이익 처분은 엄격히 금지됩니다. 필요 시 부서 이동, 근무 장소 변경 등의 보호 조치가 이루어집니다.</p>
      </div>
    ),
    quiz: [
      {
        question: "다음 중 직장 내 괴롭힘에 해당하는 것은?",
        options: ["합리적인 업무 지시", "과도한 업무 부여", "성과 피드백", "팀 회의"],
        answer: 1,
      },
      {
        question: "괴롭힘 신고 접수 후 사실 확인 조사 기한은?",
        options: ["3일", "7일", "14일", "30일"],
        answer: 1,
      },
      {
        question: "괴롭힘 신고자에 대한 불이익 처분은?",
        options: ["경우에 따라 가능", "팀장 승인 시 가능", "엄격히 금지", "HR 판단에 따름"],
        answer: 2,
      },
    ],
  },
];

/* ================================================================== */
/*  Advanced Courses Data                                              */
/* ================================================================== */

const advancedCourses = [
  { title: "기획 심화", duration: "90분", icon: Lightbulb, desc: "전략 기획, 사업 기획, 프로젝트 기획의 실무 프로세스와 프레임워크를 학습합니다." },
  { title: "마케팅 전략", duration: "60분", icon: Megaphone, desc: "디지털 마케팅, 퍼포먼스 마케팅, 그로스 해킹의 핵심 개념과 실행 방법을 다룹니다." },
  { title: "광고 기획", duration: "60분", icon: BarChart3, desc: "광고 매체 이해, 타겟팅 전략, 크리에이티브 기획, ROAS 분석 방법을 학습합니다." },
  { title: "브랜딩", duration: "45분", icon: Award, desc: "브랜드 아이덴티티, 포지셔닝, 스토리텔링, 브랜드 가이드라인 수립 방법을 다룹니다." },
  { title: "콘텐츠 제작", duration: "60분", icon: Pencil, desc: "영상, 이미지, 텍스트 콘텐츠 기획과 제작 프로세스, 플랫폼별 최적화 전략을 학습합니다." },
  { title: "AI 활용", duration: "90분", icon: Bot, desc: "생성형 AI 도구 활용법, 프롬프트 엔지니어링, AI 기반 업무 자동화 실습을 진행합니다." },
  { title: "커뮤니티 운영", duration: "45분", icon: Users, desc: "온라인 커뮤니티 구축, 운영 전략, 멤버 관리, 이벤트 기획 방법을 다룹니다." },
  { title: "창업 기초", duration: "90분", icon: Rocket, desc: "비즈니스 모델 캔버스, 린 스타트업, 시장 검증, 투자 유치 기초를 학습합니다." },
  { title: "PM (프로젝트 매니지먼트)", duration: "60분", icon: Briefcase, desc: "애자일, 스크럼, 칸반 등 프로젝트 관리 방법론과 도구 활용법을 다룹니다." },
  { title: "데이터 분석", duration: "60분", icon: Database, desc: "데이터 수집, 정리, 시각화, 인사이트 도출의 기본 프로세스를 학습합니다." },
  { title: "리더십", duration: "45분", icon: TrendingUp, desc: "팀 리더십, 커뮤니케이션, 갈등 관리, 피드백 스킬을 실습합니다." },
  { title: "네트워킹", duration: "30분", icon: Network, desc: "효과적인 네트워킹 전략, 관계 구축, 협업 파트너십 형성 방법을 학습합니다." },
  { title: "디자인 씽킹", duration: "60분", icon: Palette, desc: "공감 → 정의 → 아이디어 → 프로토타입 → 테스트의 5단계 프로세스를 실습합니다." },
];

/* ================================================================== */
/*  Sub-Components                                                     */
/* ================================================================== */

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-600 font-medium">
          온보딩 진행률: {completed}/{total} 완료 ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-neutral-800 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "incomplete" | "complete" | "exempt" }) {
  const map = {
    incomplete: { label: "미완료", cls: "bg-neutral-100 text-neutral-500" },
    complete: { label: "완료", cls: "bg-neutral-800 text-white" },
    exempt: { label: "면제", cls: "bg-neutral-200 text-neutral-500" },
  };
  const s = map[status];
  return <span className={clsx("text-xs px-1.5 py-0.5 rounded-sm font-medium", s.cls)}>{s.label}</span>;
}

/* ================================================================== */
/*  Quiz Component                                                     */
/* ================================================================== */

function QuizPanel({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const handleSubmit = () => {
    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);
    setSubmitted(true);
    onComplete(score);
  };

  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="border-t border-neutral-100 mt-4 pt-4 space-y-4">
      <p className="text-xs font-medium text-neutral-800">퀴즈 ({questions.length}문제)</p>
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="space-y-1.5">
          <p className="text-xs text-neutral-700 font-medium">
            {qIdx + 1}. {q.question}
          </p>
          <div className="grid grid-cols-1 gap-1">
            {q.options.map((opt, oIdx) => {
              const selected = answers[qIdx] === oIdx;
              const isCorrect = submitted && oIdx === q.answer;
              const isWrong = submitted && selected && oIdx !== q.answer;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelect(qIdx, oIdx)}
                  disabled={submitted}
                  className={clsx(
                    "text-left text-xs px-3 py-1.5 border transition-colors",
                    submitted
                      ? isCorrect
                        ? "border-neutral-800 bg-neutral-800 text-white"
                        : isWrong
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-neutral-100 bg-white text-neutral-400"
                      : selected
                      ? "border-neutral-800 bg-neutral-50"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {questions.length < 10 && (
        <p className="text-xs text-neutral-400 italic">* 추가 문제 준비 중 (현재 {questions.length}문제 / 총 10문제)</p>
      )}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={clsx(
            "text-xs px-4 py-1.5 font-medium transition-colors",
            allAnswered
              ? "bg-neutral-800 text-white hover:bg-neutral-700"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
          )}
        >
          제출하기
        </button>
      ) : (
        <div className="text-xs">
          {(() => {
            const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
            const score = Math.round((correct / questions.length) * 100);
            const pass = score >= 80;
            return (
              <div className={clsx("px-3 py-2 border", pass ? "border-neutral-300 bg-neutral-50" : "border-red-200 bg-red-50")}>
                <span className="font-medium">{score}점</span>
                <span className="mx-1.5">·</span>
                <span>{correct}/{questions.length} 정답</span>
                <span className="mx-1.5">·</span>
                <span className={pass ? "text-neutral-800 font-medium" : "text-red-600 font-medium"}>
                  {pass ? "통과" : "미통과 (80점 이상 필요)"}
                </span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("intro");

  /* ── Checklist state ── */
  const [checklist, setChecklist] = useState(initialChecklist);

  const toggleItem = (periodIdx: number, itemIdx: number) => {
    setChecklist((prev) => {
      const next = prev.map((p, pi) => {
        if (pi !== periodIdx) return p;
        return {
          ...p,
          items: p.items.map((item, ii) => {
            if (ii !== itemIdx) return item;
            const newStatus = item.status === "complete" ? "incomplete" as const : "complete" as const;
            return {
              ...item,
              status: newStatus,
              completedDate: newStatus === "complete" ? "2026-03-21" : undefined,
            };
          }),
        };
      });
      return next;
    });
  };

  const cycleStatus = (periodIdx: number, itemIdx: number) => {
    setChecklist((prev) => {
      const next = prev.map((p, pi) => {
        if (pi !== periodIdx) return p;
        return {
          ...p,
          items: p.items.map((item, ii) => {
            if (ii !== itemIdx) return item;
            const order: ChecklistItem["status"][] = ["incomplete", "complete", "exempt"];
            const curIdx = order.indexOf(item.status);
            const newStatus = order[(curIdx + 1) % 3];
            return {
              ...item,
              status: newStatus,
              completedDate: newStatus === "complete" ? "2026-03-21" : undefined,
            };
          }),
        };
      });
      return next;
    });
  };

  const totalItems = checklist.reduce((a, p) => a + p.items.length, 0);
  const completedItems = checklist.reduce(
    (a, p) => a + p.items.filter((i) => i.status === "complete" || i.status === "exempt").length,
    0
  );

  /* ── Course state ── */
  const [courses, setCourses] = useState<CourseData[]>(buildCourses);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState<string | null>(null);

  const handleQuizComplete = (courseId: string, score: number) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, score, status: score >= 80 ? ("complete" as const) : ("incomplete" as const) }
          : c
      )
    );
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Rocket className="w-4 h-4 text-neutral-400" />
          <h1 className="text-lg font-bold text-neutral-900">온보딩</h1>
        </div>
        <p className="text-xs text-neutral-500">
          Ten:One™에 오신 것을 환영합니다. 함께 성장할 준비를 시작하세요.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-neutral-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={clsx(
              "px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
              activeTab === t.id
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ TAB 1: 소개 ═══════════════ */}
      {activeTab === "intro" && (
        <div className="space-y-8">
          {/* 텐원의 존재 이유 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900">텐원의 존재 이유</h2>
            <div className="border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs text-neutral-500 italic leading-relaxed">
                &ldquo;가치로 연결된 거대한 세계관을 만들기로 했다.&rdquo;
              </p>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Ten:One™ Universe는 인재를 발굴하고, 연결하고, 기업과 사회의 문제를 해결하는 생태계입니다.
              단순한 회사가 아닌, 기획자들이 모여 더 큰 가치를 만들어내는 세계관입니다.
            </p>
          </section>

          {/* 우리는 누구인가 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900">우리는 누구인가</h2>
            <div className="space-y-2">
              {[
                {
                  label: "기획자",
                  desc: "문제를 발견하고, 해결책을 설계하고, 일이 되게 만드는 사람들",
                },
                {
                  label: "다양한 구성원",
                  desc: "직원, Partner, Crew — 다양한 형태로 참여하는 구성원들",
                },
                {
                  label: "We are Planner",
                  desc: "10,000명의 기획자를 발굴하고 연결한다",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 border border-neutral-200 bg-white px-4 py-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">{item.label}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 교육의 필요성 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900">교육의 필요성</h2>
            <div className="border border-neutral-200 bg-white p-4 space-y-2.5">
              {[
                "텐원은 독특한 문화와 일하는 방식을 가지고 있습니다",
                "Culture, Principle 10, VRIEF, GPR — 이것들을 이해하는 것이 첫걸음",
                "교육은 의무가 아니라 성장의 시작점입니다",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckSquare className="w-3 h-3 text-neutral-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-neutral-600">{text}</p>
                </div>
              ))}
              <div className="border-t border-neutral-100 pt-2.5 mt-2.5">
                <p className="text-xs text-neutral-500 italic">
                  &ldquo;나의 성장이 우리의 성장이다&rdquo; — Principle 8
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════ TAB 2: 온보딩 체크리스트 ═══════════════ */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          <ProgressBar completed={completedItems} total={totalItems} />

          {checklist.map((period, pIdx) => (
            <section key={period.period} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">{period.period}</span>
                <span className="text-xs text-neutral-400">— {period.label}</span>
                <span className="text-xs text-neutral-400 ml-auto">
                  {period.items.filter((i) => i.status === "complete" || i.status === "exempt").length}/{period.items.length}
                </span>
              </div>

              <div className="border border-neutral-200 bg-white divide-y divide-neutral-100">
                {period.items.map((item, iIdx) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleItem(pIdx, iIdx)}
                      className={clsx(
                        "w-4 h-4 border shrink-0 flex items-center justify-center transition-colors",
                        item.status === "complete"
                          ? "bg-neutral-800 border-neutral-800"
                          : item.status === "exempt"
                          ? "bg-neutral-300 border-neutral-300"
                          : "border-neutral-300 hover:border-neutral-400"
                      )}
                    >
                      {(item.status === "complete" || item.status === "exempt") && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {item.mandatory && (
                          <span className="text-xs px-1 py-0 bg-neutral-800 text-white font-medium shrink-0">필수</span>
                        )}
                        <p
                          className={clsx(
                            "text-xs truncate",
                            item.status === "complete" ? "text-neutral-400 line-through" : "text-neutral-700"
                          )}
                        >
                          {item.text}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    {item.score !== undefined && item.score !== null && (
                      <span className="text-xs text-neutral-500 font-mono shrink-0">
                        {item.score}/100 {item.score >= 80 ? "✓" : "✗"}
                      </span>
                    )}

                    {/* Status badge - click to cycle */}
                    <button onClick={() => cycleStatus(pIdx, iIdx)} title="상태 변경">
                      <StatusBadge status={item.status} />
                    </button>

                    {/* Completion date */}
                    {item.completedDate && (
                      <span className="text-xs text-neutral-400 shrink-0">{item.completedDate}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ═══════════════ TAB 3: 필수 이수 과정 ═══════════════ */}
      {activeTab === "required" && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500 mb-4">
            온보딩 기간 내 반드시 완료해야 하는 교육입니다. 퀴즈 80점 이상 통과 시 이수 처리됩니다.
          </p>

          {courses.map((course) => {
            const Icon = course.icon;
            const isExpanded = expandedCourse === course.id;
            const isQuizOpen = quizOpen === course.id;

            return (
              <div key={course.id} className="border border-neutral-200 bg-white">
                {/* Course header */}
                <button
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-neutral-100 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800">{course.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neutral-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {course.duration}
                      </span>
                      <StatusBadge status={course.status} />
                      {course.score !== null && (
                        <span className="text-xs font-mono text-neutral-500">
                          {course.score}점
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>

                {/* Course content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-neutral-100">
                    <div className="pt-3">{course.content}</div>

                    {/* Quiz section */}
                    {!isQuizOpen ? (
                      <button
                        onClick={() => setQuizOpen(course.id)}
                        className="mt-4 text-xs px-4 py-1.5 bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-colors"
                      >
                        퀴즈 시작
                      </button>
                    ) : (
                      <QuizPanel
                        questions={course.quiz}
                        onComplete={(score) => handleQuizComplete(course.id, score)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════ TAB 4: 심화 과정 ═══════════════ */}
      {activeTab === "advanced" && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-500">
            온보딩 이후 역량 개발을 위한 심화 과정입니다. 관심 분야를 선택하여 학습하세요.
          </p>

          <div className="grid md:grid-cols-2 gap-2.5">
            {advancedCourses.map((course) => {
              const Icon = course.icon;
              return (
                <Link
                  key={course.title}
                  href="/intra/wiki/education"
                  className="border border-neutral-200 bg-white p-3.5 hover:border-neutral-300 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-neutral-200 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-neutral-800">{course.title}</p>
                        <span className="text-xs text-neutral-400 flex items-center gap-0.5 shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          {course.duration}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{course.desc}</p>
                      <span className="text-xs text-neutral-400 mt-2 inline-block group-hover:text-neutral-600 transition-colors">
                        학습하기 →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-neutral-200 pt-4 text-xs text-neutral-400">
        온보딩 관련 문의: HR팀 (hr@tenone.biz)
      </div>
    </div>
  );
}
