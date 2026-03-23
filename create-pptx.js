const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Ten:One™";
pres.title = "TenOne Universe 사이트 기획서";

// === Design System ===
const C = {
  bg: "0F0F1A",
  bgLight: "1A1A2E",
  bgCard: "16213E",
  primary: "6366F1",
  primaryLight: "818CF8",
  accent: "A855F7",
  white: "FFFFFF",
  gray: "94A3B8",
  grayLight: "CBD5E1",
  grayDark: "64748B",
  success: "10B981",
  warning: "F59E0B",
  error: "EF4444",
  info: "3B82F6",
};

const mkShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.3 });

// =====================================================
// SLIDE 1: 표지
// =====================================================
let s1 = pres.addSlide();
s1.background = { color: C.bg };

// 좌측 장식 바
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.primary } });

// 상단 얇은 라인
s1.addShape(pres.shapes.RECTANGLE, { x: 0.08, y: 0, w: 9.92, h: 0.02, fill: { color: C.primary, transparency: 40 } });

s1.addText("SITE PLANNING DOCUMENT", {
  x: 1.0, y: 1.0, w: 8, h: 0.4,
  fontSize: 12, fontFace: "Arial", color: C.primaryLight, charSpacing: 6, bold: true
});

s1.addText([
  { text: "Ten", options: { color: C.white, bold: true } },
  { text: ":", options: { color: C.primary, bold: true } },
  { text: "One", options: { color: C.white, bold: true } },
  { text: "™", options: { color: C.grayDark, fontSize: 28 } },
  { text: " Universe", options: { color: C.grayLight, bold: false } },
], { x: 1.0, y: 1.6, w: 8, h: 1.0, fontSize: 44, fontFace: "Arial" });

s1.addText("사이트 기획서", {
  x: 1.0, y: 2.6, w: 8, h: 0.6,
  fontSize: 28, fontFace: "Arial", color: C.grayLight, bold: false
});

s1.addShape(pres.shapes.RECTANGLE, { x: 1.0, y: 3.4, w: 1.5, h: 0.04, fill: { color: C.primary } });

s1.addText([
  { text: "멀티 브랜드 생태계 통합 관리 플랫폼", options: { breakLine: true, color: C.gray } },
  { text: "가치로 연결된 하나의 거대한 세계관", options: { color: C.grayDark } },
], { x: 1.0, y: 3.7, w: 8, h: 0.8, fontSize: 14, fontFace: "Arial" });

s1.addText("2026.03", {
  x: 1.0, y: 4.8, w: 3, h: 0.4,
  fontSize: 12, fontFace: "Arial", color: C.grayDark
});

// =====================================================
// SLIDE 2: 목차
// =====================================================
let s2 = pres.addSlide();
s2.background = { color: C.bg };

s2.addText("Contents", {
  x: 0.8, y: 0.4, w: 8, h: 0.6,
  fontSize: 32, fontFace: "Arial", color: C.white, bold: true, margin: 0
});

s2.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.05, w: 1.2, h: 0.04, fill: { color: C.primary } });

const tocItems = [
  { num: "01", title: "프로젝트 개요", desc: "서비스 정의 · 핵심 철학 · 기술 스택" },
  { num: "02", title: "사이트 구조", desc: "퍼블릭 포털 · 인트라 오피스 · 사이트맵" },
  { num: "03", title: "퍼블릭 페이지", desc: "랜딩 · About · Universe · Brands · History · Contact" },
  { num: "04", title: "인트라 오피스", desc: "ERP(CRM/HR) · Marketing · Studio · Wiki" },
  { num: "05", title: "데이터 모델", desc: "엔티티 관계 · 데이터 규모 · 타입 시스템" },
  { num: "06", title: "디자인 시스템", desc: "컬러 · 컴포넌트 · 레이아웃 패턴" },
  { num: "07", title: "현황 분석", desc: "완성도 매트릭스 · 이슈 · 리스크" },
  { num: "08", title: "개발 로드맵", desc: "6단계 구현 계획 · 우선순위" },
];

tocItems.forEach((item, i) => {
  const y = 1.4 + i * 0.5;
  s2.addText(item.num, {
    x: 0.8, y, w: 0.6, h: 0.4,
    fontSize: 16, fontFace: "Consolas", color: C.primary, bold: true, margin: 0
  });
  s2.addText(item.title, {
    x: 1.5, y, w: 3, h: 0.4,
    fontSize: 15, fontFace: "Arial", color: C.white, bold: true, margin: 0
  });
  s2.addText(item.desc, {
    x: 4.5, y, w: 5, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: C.grayDark, margin: 0
  });
  if (i < tocItems.length - 1) {
    s2.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: y + 0.42, w: 8.4, h: 0.005, fill: { color: C.bgCard } });
  }
});

// =====================================================
// SLIDE 3: 프로젝트 개요
// =====================================================
let s3 = pres.addSlide();
s3.background = { color: C.bg };

s3.addText("01", { x: 0.8, y: 0.3, w: 1, h: 0.5, fontSize: 14, fontFace: "Consolas", color: C.primary, bold: true, margin: 0 });
s3.addText("프로젝트 개요", { x: 0.8, y: 0.6, w: 8, h: 0.5, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
s3.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.15, w: 1.0, h: 0.04, fill: { color: C.primary } });

// 서비스 정의 카드
s3.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 4.0, h: 2.0, fill: { color: C.bgCard }, shadow: mkShadow() });
s3.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 4.0, h: 0.04, fill: { color: C.primary } });
s3.addText("서비스 정의", { x: 1.1, y: 1.65, w: 3.5, h: 0.35, fontSize: 14, fontFace: "Arial", color: C.primaryLight, bold: true, margin: 0 });
s3.addText([
  { text: "퍼블릭 포털", options: { bold: true, color: C.white, breakLine: true } },
  { text: "브랜드 쇼케이스, 세계관 소개, 멤버/파트너 모집", options: { color: C.gray, breakLine: true, fontSize: 11 } },
  { text: "", options: { breakLine: true, fontSize: 6 } },
  { text: "인트라 오피스", options: { bold: true, color: C.white, breakLine: true } },
  { text: "ERP(CRM/HR), 마케팅, 스튜디오, 위키 통합 관리", options: { color: C.gray, fontSize: 11 } },
], { x: 1.1, y: 2.1, w: 3.5, h: 1.3, fontSize: 13, fontFace: "Arial", margin: 0 });

// 기술 스택 카드
s3.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.5, w: 4.0, h: 2.0, fill: { color: C.bgCard }, shadow: mkShadow() });
s3.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.5, w: 4.0, h: 0.04, fill: { color: C.accent } });
s3.addText("기술 스택", { x: 5.5, y: 1.65, w: 3.5, h: 0.35, fontSize: 14, fontFace: "Arial", color: C.accent, bold: true, margin: 0 });

const techStack = [
  ["Framework", "Next.js 16 + React 19"],
  ["Language", "TypeScript (strict)"],
  ["Styling", "Tailwind CSS v4"],
  ["Deploy", "Google Cloud Run"],
  ["Data", "Mock (DB 미연동)"],
];
techStack.forEach((t, i) => {
  s3.addText(t[0], { x: 5.5, y: 2.1 + i * 0.24, w: 1.3, h: 0.22, fontSize: 10, fontFace: "Consolas", color: C.primaryLight, margin: 0 });
  s3.addText(t[1], { x: 6.8, y: 2.1 + i * 0.24, w: 2.2, h: 0.22, fontSize: 10, fontFace: "Arial", color: C.grayLight, margin: 0 });
});

// 핵심 철학
s3.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.8, w: 8.4, h: 1.4, fill: { color: C.bgLight } });

const values = [
  { title: "본질 Essence", desc: "변하지 않을 가치에\n집요하게 집중한다", color: C.primary },
  { title: "속도 Speed", desc: "옳은 방향을 확인하며\n빠르게 전진한다", color: C.accent },
  { title: "이행 Carry Out", desc: "본질이 확인되면\n바로 실행에 옮긴다", color: C.success },
];
values.forEach((v, i) => {
  const x = 1.2 + i * 2.8;
  s3.addShape(pres.shapes.OVAL, { x: x, y: 3.95, w: 0.08, h: 0.08, fill: { color: v.color } });
  s3.addText(v.title, { x: x + 0.2, y: 3.9, w: 2.2, h: 0.25, fontSize: 12, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
  s3.addText(v.desc, { x: x + 0.2, y: 4.2, w: 2.2, h: 0.8, fontSize: 10, fontFace: "Arial", color: C.gray, margin: 0 });
});

// =====================================================
// SLIDE 4: 사이트 구조
// =====================================================
let s4 = pres.addSlide();
s4.background = { color: C.bg };

s4.addText("02", { x: 0.8, y: 0.3, w: 1, h: 0.5, fontSize: 14, fontFace: "Consolas", color: C.primary, bold: true, margin: 0 });
s4.addText("사이트 구조", { x: 0.8, y: 0.6, w: 8, h: 0.5, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
s4.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.15, w: 1.0, h: 0.04, fill: { color: C.primary } });

// 3 columns: Public / Auth / Intra
const cols = [
  {
    title: "Public", color: C.primary,
    pages: ["/ (랜딩)", "/about (소개·철학)", "/universe (관계도·Wheel)", "/brands (포트폴리오)", "/history (연대기)", "/contact (신청·의뢰)", "/profile (내 정보)"]
  },
  {
    title: "Auth", color: C.warning,
    pages: ["/login (로그인)", "/signup (회원가입)", "개인/기업 계정", "Mock 인증"]
  },
  {
    title: "Intra Office", color: C.accent,
    pages: ["ERP — CRM (People·Segments·Import)", "ERP — HR (Staff·GPR)", "Marketing (Campaign·Lead·Deal)", "Marketing (Content·Analytics)", "Studio (Brands·Assets·Schedule)", "Studio Workflow (Kanban·Pipeline)", "Wiki (Culture·Onboarding)"]
  },
];

cols.forEach((col, ci) => {
  const x = 0.8 + ci * 3.1;
  s4.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.8, h: 3.8, fill: { color: C.bgCard }, shadow: mkShadow() });
  s4.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.8, h: 0.04, fill: { color: col.color } });
  s4.addText(col.title, { x: x + 0.2, y: 1.65, w: 2.4, h: 0.35, fontSize: 15, fontFace: "Arial", color: col.color, bold: true, margin: 0 });
  col.pages.forEach((p, pi) => {
    s4.addText(p, { x: x + 0.2, y: 2.15 + pi * 0.38, w: 2.4, h: 0.35, fontSize: 10, fontFace: "Arial", color: C.grayLight, margin: 0 });
  });
});

// =====================================================
// SLIDE 5: 퍼블릭 페이지 상세
// =====================================================
let s5 = pres.addSlide();
s5.background = { color: C.bg };

s5.addText("03", { x: 0.8, y: 0.3, w: 1, h: 0.5, fontSize: 14, fontFace: "Consolas", color: C.primary, bold: true, margin: 0 });
s5.addText("퍼블릭 페이지", { x: 0.8, y: 0.6, w: 8, h: 0.5, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
s5.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.15, w: 1.0, h: 0.04, fill: { color: C.primary } });

const pubPages = [
  { name: "Landing (/)", sections: "Hero · Universe Brands · Core Value · Latest · CTA", status: "완성" },
  { name: "About (/about)", sections: "Synchronicity 스토리 · Universe Manual · Value Connector · 20개 타임라인", status: "완성" },
  { name: "Universe (/universe)", sections: "SVG 관계도(10노드) · 7단계 Wheel · Vision House", status: "완성" },
  { name: "Brands (/brands)", sections: "9개 카테고리 필터 · 10개 브랜드 카드 · 외부링크", status: "완성" },
  { name: "History (/history)", sections: "연도 필터 · 세로 타임라인 · 20개 이벤트(2019~2025)", status: "완성" },
  { name: "Contact (/contact)", sections: "멤버신청 폼(6필드) · 프로젝트 의뢰 폼(6필드)", status: "UI만" },
  { name: "Profile (/profile)", sections: "기본정보 · 직원정보(Staff) · 기업정보(Biz)", status: "UI만" },
];

// Table header
s5.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.45, w: 8.4, h: 0.4, fill: { color: C.bgCard } });
s5.addText("페이지", { x: 0.9, y: 1.45, w: 2.0, h: 0.4, fontSize: 11, fontFace: "Arial", color: C.primaryLight, bold: true, margin: 0, valign: "middle" });
s5.addText("주요 섹션/기능", { x: 3.0, y: 1.45, w: 4.5, h: 0.4, fontSize: 11, fontFace: "Arial", color: C.primaryLight, bold: true, margin: 0, valign: "middle" });
s5.addText("상태", { x: 7.8, y: 1.45, w: 1.2, h: 0.4, fontSize: 11, fontFace: "Arial", color: C.primaryLight, bold: true, margin: 0, valign: "middle", align: "center" });

pubPages.forEach((p, i) => {
  const y = 1.9 + i * 0.48;
  if (i % 2 === 0) s5.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.45, fill: { color: C.bgLight, transparency: 50 } });
  s5.addText(p.name, { x: 0.9, y, w: 2.0, h: 0.45, fontSize: 11, fontFace: "Arial", color: C.white, bold: true, margin: 0, valign: "middle" });
  s5.addText(p.sections, { x: 3.0, y, w: 4.5, h: 0.45, fontSize: 9.5, fontFace: "Arial", color: C.gray, margin: 0, valign: "middle" });
  const statusColor = p.status === "완성" ? C.success : C.warning;
  s5.addShape(pres.shapes.RECTANGLE, { x: 8.0, y: y + 0.1, w: 0.8, h: 0.25, fill: { color: statusColor, transparency: 80 } });
  s5.addText(p.status, { x: 8.0, y: y + 0.1, w: 0.8, h: 0.25, fontSize: 9, fontFace: "Arial", color: statusColor, bold: true, align: "center", valign: "middle", margin: 0 });
});

// =====================================================
// SLIDE 6: 인트라 — ERP
// =====================================================
let s6 = pres.addSlide();
s6.background = { color: C.bg };

s6.addText("04", { x: 0.8, y: 0.3, w: 1, h: 0.5, fontSize: 14, fontFace: "Consolas", color: C.primary, bold: true, margin: 0 });
s6.addText("인트라 오피스 — ERP", { x: 0.8, y: 0.6, w: 8, h: 0.5, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
s6.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.15, w: 1.0, h: 0.04, fill: { color: C.primary } });

// CRM Card
s6.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 4.0, h: 3.6, fill: { color: C.bgCard }, shadow: mkShadow() });
s6.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 4.0, h: 0.04, fill: { color: C.info } });
s6.addText("CRM", { x: 1.1, y: 1.65, w: 3.5, h: 0.35, fontSize: 16, fontFace: "Arial", color: C.info, bold: true, margin: 0 });

const crmFeatures = [
  { name: "People", desc: "15명 연락처 · 검색/필터 · 추가/수정 모달", data: "학생5, 현업5, 멘토3, 기타2" },
  { name: "Segments", desc: "6개 세그먼트 자동 분류", data: "타입별·상태별 필터" },
  { name: "Import", desc: "드래그앤드롭 파일 업로드 UI", data: "CSV/XLSX (미구현)" },
];
crmFeatures.forEach((f, i) => {
  const y = 2.2 + i * 0.95;
  s6.addShape(pres.shapes.OVAL, { x: 1.1, y: y + 0.05, w: 0.06, h: 0.06, fill: { color: C.info } });
  s6.addText(f.name, { x: 1.3, y, w: 1.5, h: 0.25, fontSize: 12, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
  s6.addText(f.desc, { x: 1.3, y: y + 0.28, w: 3.2, h: 0.25, fontSize: 9.5, fontFace: "Arial", color: C.gray, margin: 0 });
  s6.addText(f.data, { x: 1.3, y: y + 0.55, w: 3.2, h: 0.2, fontSize: 9, fontFace: "Arial", color: C.grayDark, margin: 0 });
});

// HR Card
s6.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.5, w: 4.0, h: 3.6, fill: { color: C.bgCard }, shadow: mkShadow() });
s6.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.5, w: 4.0, h: 0.04, fill: { color: C.success } });
s6.addText("HR", { x: 5.5, y: 1.65, w: 3.5, h: 0.35, fontSize: 16, fontFace: "Arial", color: C.success, bold: true, margin: 0 });

const hrFeatures = [
  { name: "Staff Management", desc: "3명 직원 · 사번/부서/직위/권한", data: "4부문: 경영·사업·제작·지원" },
  { name: "GPR", desc: "목표-계획-결과 관리", data: "9개 목표 · 7단계 워크플로우" },
  { name: "평가 시스템", desc: "자기평가 → 상사평가", data: "5점 등급 (기대이하~탁월)" },
];
hrFeatures.forEach((f, i) => {
  const y = 2.2 + i * 0.95;
  s6.addShape(pres.shapes.OVAL, { x: 5.5, y: y + 0.05, w: 0.06, h: 0.06, fill: { color: C.success } });
  s6.addText(f.name, { x: 5.7, y, w: 1.8, h: 0.25, fontSize: 12, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
  s6.addText(f.desc, { x: 5.7, y: y + 0.28, w: 3.2, h: 0.25, fontSize: 9.5, fontFace: "Arial", color: C.gray, margin: 0 });
  s6.addText(f.data, { x: 5.7, y: y + 0.55, w: 3.2, h: 0.2, fontSize: 9, fontFace: "Arial", color: C.grayDark, margin: 0 });
});

// =====================================================
// SLIDE 7: 인트라 — Marketing & Studio
// =====================================================
let s7 = pres.addSlide();
s7.background = { color: C.bg };

s7.addText("04", { x: 0.8, y: 0.3, w: 1, h: 0.5, fontSize: 14, fontFace: "Consolas", color: C.primary, bold: true, margin: 0 });
s7.addText("인트라 오피스 — Marketing & Studio", { x: 0.8, y: 0.6, w: 8, h: 0.5, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
s7.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.15, w: 1.0, h: 0.04, fill: { color: C.primary } });

// Marketing modules (2x3 grid)
const mktModules = [
  { name: "Campaigns", desc: "6개 캠페인\n예산/집행 추적", color: C.warning },
  { name: "Leads", desc: "7단계 칸반\n드래그앤드롭", color: C.info },
  { name: "Deals", desc: "6단계 파이프라인\n단계별 금액", color: C.accent },
  { name: "Content", desc: "6개 콘텐츠\n채널별 관리", color: C.success },
  { name: "Analytics", desc: "KPI 대시보드\n퍼널 차트", color: C.primary },
  { name: "Activities", desc: "10개 활동 기록\n타입별 분류", color: C.error },
];

s7.addText("Marketing", { x: 0.8, y: 1.4, w: 3, h: 0.3, fontSize: 14, fontFace: "Arial", color: C.warning, bold: true, margin: 0 });

mktModules.forEach((m, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  const x = 0.8 + col * 1.55;
  const y = 1.85 + row * 1.15;
  s7.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.4, h: 1.0, fill: { color: C.bgCard }, shadow: mkShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.4, h: 0.03, fill: { color: m.color } });
  s7.addText(m.name, { x: x + 0.1, y: y + 0.1, w: 1.2, h: 0.25, fontSize: 11, fontFace: "Arial", color: m.color, bold: true, margin: 0 });
  s7.addText(m.desc, { x: x + 0.1, y: y + 0.4, w: 1.2, h: 0.5, fontSize: 8.5, fontFace: "Arial", color: C.gray, margin: 0 });
});

// Studio modules
const studioModules = [
  { name: "Brands & IPs", desc: "10개 브랜드\n카드 그리드", color: C.accent },
  { name: "Kanban Board", desc: "8개 태스크\n5단계 보드", color: C.info },
  { name: "Pipeline", desc: "6개 콘텐츠\n6단계 파이프", color: C.success },
  { name: "Projects", desc: "5개 프로젝트\n진행률 추적", color: C.primary },
  { name: "Schedule", desc: "캘린더/리스트\n이벤트 관리", color: C.warning },
  { name: "Automation", desc: "4개 자동화 규칙\n트리거→액션", color: C.error },
];

s7.addText("Studio", { x: 5.4, y: 1.4, w: 3, h: 0.3, fontSize: 14, fontFace: "Arial", color: C.accent, bold: true, margin: 0 });

studioModules.forEach((m, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  const x = 5.4 + col * 1.55;
  const y = 1.85 + row * 1.15;
  s7.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.4, h: 1.0, fill: { color: C.bgCard }, shadow: mkShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.4, h: 0.03, fill: { color: m.color } });
  s7.addText(m.name, { x: x + 0.1, y: y + 0.1, w: 1.2, h: 0.25, fontSize: 11, fontFace: "Arial", color: m.color, bold: true, margin: 0 });
  s7.addText(m.desc, { x: x + 0.1, y: y + 0.4, w: 1.2, h: 0.5, fontSize: 8.5, fontFace: "Arial", color: C.gray, margin: 0 });
});

// Bottom note
s7.addText("모든 데이터는 Mock 기반 — 새로고침 시 리셋됨. Backend/DB 연동 필요.", {
  x: 0.8, y: 4.9, w: 8.4, h: 0.4,
  fontSize: 10, fontFace: "Arial", color: C.grayDark, italic: true, margin: 0
});

// =====================================================
// SLIDE 8: 데이터 모델
// =====================================================
let s8 = pres.addSlide();
s8.background = { color: C.bg };

s8.addText("05", { x: 0.8, y: 0.3, w: 1, h: 0.5, fontSize: 14, fontFace: "Consolas", color: C.primary, bold: true, margin: 0 });
s8.addText("데이터 모델", { x: 0.8, y: 0.6, w: 8, h: 0.5, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
s8.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.15, w: 1.0, h: 0.04, fill: { color: C.primary } });

// 핵심 숫자
const dataStats = [
  { num: "30+", label: "타입 정의", color: C.primary },
  { num: "80+", label: "Mock 레코드", color: C.accent },
  { num: "10", label: "브랜드", color: C.success },
  { num: "6", label: "Context 도메인", color: C.warning },
];

dataStats.forEach((d, i) => {
  const x = 0.8 + i * 2.3;
  s8.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.0, h: 1.0, fill: { color: C.bgCard }, shadow: mkShadow() });
  s8.addText(d.num, { x, y: 1.55, w: 2.0, h: 0.5, fontSize: 28, fontFace: "Arial", color: d.color, bold: true, align: "center", margin: 0 });
  s8.addText(d.label, { x, y: 2.05, w: 2.0, h: 0.35, fontSize: 11, fontFace: "Arial", color: C.gray, align: "center", margin: 0 });
});

// Entity table
const entities = [
  ["Brand", "10", "핵심 마스터 — 모든 엔티티의 FK"],
  ["Person", "15", "학생5 · 현업5 · 멘토3 · 기타2"],
  ["Organization", "8", "파트너 · 클라이언트 · 스폰서"],
  ["Deal", "6", "1M ~ 20M KRW"],
  ["StaffMember", "3", "Admin · Manager · Editor"],
  ["GprGoal", "9", "직원당 2~5개"],
  ["Campaign", "6", "1M ~ 20M 예산"],
  ["Lead", "6", "500K ~ 15M 가치"],
  ["WorkflowTask", "8", "Backlog ~ Done"],
  ["PipelineItem", "6", "Idea ~ Published"],
  ["BrandProject", "5", "15% ~ 80% 진행률"],
];

s8.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.8, w: 8.4, h: 0.35, fill: { color: C.bgCard } });
s8.addText("엔티티", { x: 0.9, y: 2.8, w: 2.0, h: 0.35, fontSize: 10, fontFace: "Arial", color: C.primaryLight, bold: true, margin: 0, valign: "middle" });
s8.addText("건수", { x: 3.0, y: 2.8, w: 1.0, h: 0.35, fontSize: 10, fontFace: "Arial", color: C.primaryLight, bold: true, margin: 0, valign: "middle", align: "center" });
s8.addText("비고", { x: 4.2, y: 2.8, w: 4.8, h: 0.35, fontSize: 10, fontFace: "Arial", color: C.primaryLight, bold: true, margin: 0, valign: "middle" });

entities.forEach((e, i) => {
  const y = 3.2 + i * 0.22;
  if (i % 2 === 0) s8.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.22, fill: { color: C.bgLight, transparency: 50 } });
  s8.addText(e[0], { x: 0.9, y, w: 2.0, h: 0.22, fontSize: 9, fontFace: "Consolas", color: C.white, margin: 0, valign: "middle" });
  s8.addText(e[1], { x: 3.0, y, w: 1.0, h: 0.22, fontSize: 9, fontFace: "Arial", color: C.primaryLight, bold: true, margin: 0, valign: "middle", align: "center" });
  s8.addText(e[2], { x: 4.2, y, w: 4.8, h: 0.22, fontSize: 8.5, fontFace: "Arial", color: C.gray, margin: 0, valign: "middle" });
});

// =====================================================
// SLIDE 9: 디자인 시스템
// =====================================================
let s9 = pres.addSlide();
s9.background = { color: C.bg };

s9.addText("06", { x: 0.8, y: 0.3, w: 1, h: 0.5, fontSize: 14, fontFace: "Consolas", color: C.primary, bold: true, margin: 0 });
s9.addText("디자인 시스템", { x: 0.8, y: 0.6, w: 8, h: 0.5, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
s9.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.15, w: 1.0, h: 0.04, fill: { color: C.primary } });

// Color palette
s9.addText("Color Palette", { x: 0.8, y: 1.45, w: 3, h: 0.3, fontSize: 13, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
const colors = [
  { name: "Primary", hex: "6366F1", label: "Indigo" },
  { name: "Accent", hex: "A855F7", label: "Purple" },
  { name: "Success", hex: "10B981", label: "Emerald" },
  { name: "Warning", hex: "F59E0B", label: "Amber" },
  { name: "Info", hex: "3B82F6", label: "Blue" },
  { name: "Error", hex: "EF4444", label: "Red" },
  { name: "BG", hex: "000000", label: "Black" },
  { name: "Card", hex: "18181B", label: "Zinc-900" },
];

colors.forEach((c, i) => {
  const row = Math.floor(i / 4);
  const col = i % 4;
  const x = 0.8 + col * 2.2;
  const y = 1.85 + row * 0.7;
  s9.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.35, h: 0.35, fill: { color: c.hex } });
  s9.addText(c.name, { x: x + 0.45, y, w: 1.5, h: 0.2, fontSize: 10, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
  s9.addText(c.label, { x: x + 0.45, y: y + 0.18, w: 1.5, h: 0.17, fontSize: 8, fontFace: "Consolas", color: C.grayDark, margin: 0 });
});

// Component patterns
s9.addText("Component Patterns", { x: 0.8, y: 3.4, w: 4, h: 0.3, fontSize: 13, fontFace: "Arial", color: C.white, bold: true, margin: 0 });

const patterns = [
  { name: "카드", usage: "브랜드, 캠페인, 프로젝트" },
  { name: "테이블", usage: "People, Staff, Content" },
  { name: "칸반 보드", usage: "Leads, Deals, Tasks, Pipeline" },
  { name: "모달", usage: "PersonModal, TaskModal, AutomationBuilder" },
  { name: "배지", usage: "상태, 타입, 우선순위" },
  { name: "타임라인", usage: "History, About" },
];

patterns.forEach((p, i) => {
  const col = Math.floor(i / 3);
  const row = i % 3;
  const x = 0.8 + col * 4.5;
  const y = 3.85 + row * 0.45;
  s9.addShape(pres.shapes.OVAL, { x, y: y + 0.08, w: 0.06, h: 0.06, fill: { color: C.primary } });
  s9.addText(p.name, { x: x + 0.2, y, w: 1.0, h: 0.35, fontSize: 11, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
  s9.addText(p.usage, { x: x + 1.2, y, w: 3.0, h: 0.35, fontSize: 10, fontFace: "Arial", color: C.gray, margin: 0 });
});

// =====================================================
// SLIDE 10: 현황 분석 — 완성도 매트릭스
// =====================================================
let s10 = pres.addSlide();
s10.background = { color: C.bg };

s10.addText("07", { x: 0.8, y: 0.3, w: 1, h: 0.5, fontSize: 14, fontFace: "Consolas", color: C.primary, bold: true, margin: 0 });
s10.addText("현황 분석", { x: 0.8, y: 0.6, w: 8, h: 0.5, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
s10.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.15, w: 1.0, h: 0.04, fill: { color: C.primary } });

// Big number
s10.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 2.5, h: 1.6, fill: { color: C.bgCard }, shadow: mkShadow() });
s10.addText("~25%", { x: 0.8, y: 1.6, w: 2.5, h: 0.8, fontSize: 42, fontFace: "Arial", color: C.warning, bold: true, align: "center", margin: 0 });
s10.addText("전체 완성도", { x: 0.8, y: 2.4, w: 2.5, h: 0.4, fontSize: 13, fontFace: "Arial", color: C.gray, align: "center", margin: 0 });

// Progress bars
const progress = [
  { name: "UI/UX", pct: 90, color: C.success },
  { name: "상태관리 (Context)", pct: 85, color: C.success },
  { name: "타입 시스템", pct: 95, color: C.success },
  { name: "Backend API", pct: 0, color: C.error },
  { name: "Database", pct: 0, color: C.error },
  { name: "인증 (실제)", pct: 0, color: C.error },
  { name: "테스트", pct: 0, color: C.error },
  { name: "배포", pct: 5, color: C.error },
];

progress.forEach((p, i) => {
  const y = 1.5 + i * 0.2;
  const x = 3.6;
  s10.addText(p.name, { x, y, w: 1.8, h: 0.18, fontSize: 8.5, fontFace: "Arial", color: C.grayLight, margin: 0, valign: "middle" });
  s10.addShape(pres.shapes.RECTANGLE, { x: x + 1.9, y: y + 0.03, w: 3.5, h: 0.12, fill: { color: C.bgLight } });
  if (p.pct > 0) s10.addShape(pres.shapes.RECTANGLE, { x: x + 1.9, y: y + 0.03, w: 3.5 * (p.pct / 100), h: 0.12, fill: { color: p.color } });
  s10.addText(p.pct + "%", { x: x + 5.5, y, w: 0.5, h: 0.18, fontSize: 8, fontFace: "Consolas", color: p.color, margin: 0, valign: "middle", align: "right" });
});

// Issues
s10.addText("핵심 이슈", { x: 0.8, y: 3.5, w: 3, h: 0.3, fontSize: 14, fontFace: "Arial", color: C.error, bold: true, margin: 0 });

const issues = [
  "데이터 영속성 0% — 새로고침 시 모든 데이터 리셋",
  "인증 보안 없음 — 비밀번호 평문 하드코딩",
  "폼 제출 미작동 — Contact, Import 등 작동 안 함",
  ".env 파일 없음 — 환경 변수 관리 체계 없음",
  "API 라우트 0개 — app/api/ 디렉토리 자체 없음",
  "테스트 0개 — 테스트 프레임워크 미설치",
];

issues.forEach((issue, i) => {
  const y = 3.9 + i * 0.27;
  s10.addShape(pres.shapes.OVAL, { x: 0.9, y: y + 0.06, w: 0.06, h: 0.06, fill: { color: C.error } });
  s10.addText(issue, { x: 1.1, y, w: 8, h: 0.25, fontSize: 9.5, fontFace: "Arial", color: C.gray, margin: 0 });
});

// =====================================================
// SLIDE 11: 개발 로드맵
// =====================================================
let s11 = pres.addSlide();
s11.background = { color: C.bg };

s11.addText("08", { x: 0.8, y: 0.3, w: 1, h: 0.5, fontSize: 14, fontFace: "Consolas", color: C.primary, bold: true, margin: 0 });
s11.addText("개발 로드맵", { x: 0.8, y: 0.6, w: 8, h: 0.5, fontSize: 28, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
s11.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.15, w: 1.0, h: 0.04, fill: { color: C.primary } });

const phases = [
  { num: "Phase 1", title: "기반 인프라", period: "1~2주", items: ".env · DB(Supabase) · Prisma ORM · Auth.js · API 구조", color: C.error, priority: "최고" },
  { num: "Phase 2", title: "데이터 영속화", period: "2~3주", items: "Brand · User · CRM · Staff/GPR · Marketing · Workflow DB 전환", color: C.warning, priority: "높음" },
  { num: "Phase 3", title: "프론트엔드 연동", period: "1~2주", items: "Context→API 전환 · 폼 제출 · SWR/React Query", color: C.warning, priority: "높음" },
  { num: "Phase 4", title: "기능 보완", period: "2~3주", items: "Wiki 콘텐츠 · 실제 Analytics · 파일 업로드 · Excel Import", color: C.info, priority: "중간" },
  { num: "Phase 5", title: "배포", period: "1주", items: "Dockerfile · docker-compose · GCP Cloud Run · CI/CD · 도메인", color: C.info, priority: "중간" },
  { num: "Phase 6", title: "품질 관리", period: "병행", items: "Vitest 단위 테스트 · Playwright E2E · ESLint/Prettier", color: C.success, priority: "병행" },
];

phases.forEach((p, i) => {
  const y = 1.5 + i * 0.65;

  // Timeline dot and line
  s11.addShape(pres.shapes.OVAL, { x: 0.95, y: y + 0.12, w: 0.14, h: 0.14, fill: { color: p.color } });
  if (i < phases.length - 1) {
    s11.addShape(pres.shapes.RECTANGLE, { x: 1.005, y: y + 0.28, w: 0.03, h: 0.5, fill: { color: C.bgCard } });
  }

  // Content
  s11.addText(p.num, { x: 1.3, y, w: 1.0, h: 0.25, fontSize: 10, fontFace: "Consolas", color: p.color, bold: true, margin: 0 });
  s11.addText(p.title, { x: 2.3, y, w: 2.0, h: 0.25, fontSize: 13, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
  s11.addText(p.period, { x: 4.3, y, w: 1.0, h: 0.25, fontSize: 10, fontFace: "Arial", color: p.color, margin: 0 });
  s11.addText(p.items, { x: 1.3, y: y + 0.28, w: 7.5, h: 0.3, fontSize: 9, fontFace: "Arial", color: C.gray, margin: 0 });

  // Priority badge
  s11.addShape(pres.shapes.RECTANGLE, { x: 8.5, y: y + 0.02, w: 0.7, h: 0.22, fill: { color: p.color, transparency: 80 } });
  s11.addText(p.priority, { x: 8.5, y: y + 0.02, w: 0.7, h: 0.22, fontSize: 8, fontFace: "Arial", color: p.color, bold: true, align: "center", valign: "middle", margin: 0 });
});

// =====================================================
// SLIDE 12: 마무리
// =====================================================
let s12 = pres.addSlide();
s12.background = { color: C.bg };

s12.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.primary } });

s12.addText([
  { text: "Ten", options: { color: C.white, bold: true } },
  { text: ":", options: { color: C.primary, bold: true } },
  { text: "One", options: { color: C.white, bold: true } },
  { text: "™", options: { color: C.grayDark, fontSize: 24 } },
], { x: 1.0, y: 1.5, w: 8, h: 0.8, fontSize: 40, fontFace: "Arial" });

s12.addText("Beyond the Limit, Universe of Possibilities.", {
  x: 1.0, y: 2.3, w: 8, h: 0.5,
  fontSize: 16, fontFace: "Arial", color: C.grayDark, italic: true
});

s12.addShape(pres.shapes.RECTANGLE, { x: 1.0, y: 3.0, w: 1.5, h: 0.04, fill: { color: C.primary } });

s12.addText([
  { text: "lools@tenone.biz", options: { breakLine: true, color: C.gray } },
  { text: "open.kakao.com/me/tenone", options: { color: C.grayDark } },
], { x: 1.0, y: 3.3, w: 5, h: 0.6, fontSize: 12, fontFace: "Arial" });

s12.addText("Thank You", {
  x: 1.0, y: 4.3, w: 8, h: 0.6,
  fontSize: 24, fontFace: "Arial", color: C.primaryLight, bold: true
});

// =====================================================
// SAVE
// =====================================================
pres.writeFile({ fileName: "C:/Projects/tenone/TenOne_기획서.pptx" })
  .then(() => console.log("PPTX created successfully!"))
  .catch(err => console.error("Error:", err));
