/**
 * MADLeague 프로그램 목록 SSOT — 순서·이름·요약·그룹·한눈에 보기 데이터를 여기 한 곳에 둔다.
 * 프로그램 전체 페이지·탭 줄·홈·About·검색·각 상세 페이지 템플릿이 전부 이 파일로 렌더한다 (헤더 메뉴 이름은 lib/brand-site-menus.ts).
 * 순서 = 헤더 '프로그램' 하위 메뉴 순서 (경쟁 PT는 헤더 단독 메뉴라 맨 앞·featured).
 */

export type MadProgramGroup = 'challenge' | 'practice' | 'training' | 'connect';

/** 전체 프로그램 페이지의 4그룹 — 사람들이 10개를 한 번에 이해하게 묶는다 */
export const MAD_PROGRAM_GROUPS: { key: MadProgramGroup; label: string; eyebrow: string; desc: string }[] = [
  { key: 'challenge', label: '도전', eyebrow: 'CHALLENGE', desc: '과제를 받고, 경쟁하고, 결과로 증명한다.' },
  { key: 'practice', label: '실전', eyebrow: 'PRACTICE', desc: '기업·지역의 진짜 현장에서 일한다.' },
  { key: 'training', label: '훈련', eyebrow: 'TRAINING', desc: '한 분야를 집중 훈련하고 실전 프로젝트로 이어진다.' },
  { key: 'connect', label: '연결', eyebrow: 'CONNECT', desc: '경험을 커리어와 사람으로 연결한다.' },
];

/** 한눈에 보기 — 5개 키는 모든 프로그램이 똑같이 채운다 (비어 있으면 안 됨) */
export type MadProgramGlance = {
  /** 누가 참가하나 */
  who: string;
  /** 언제 열리나 */
  when: string;
  /** 어떻게 진행되나 */
  how: string;
  /** 참가비 */
  fee: string;
  /** 끝나면 무엇이 남나 */
  outcome: string;
};

export type MadProgram = {
  /** 신청서(forms.program)·테마 키와 같다 */
  key: string;
  href: string;
  title: string;
  /** 히어로 영문 eyebrow */
  eyebrow: string;
  /** 한 줄 요약 — 목록 카드·검색·메타 description */
  desc: string;
  group: MadProgramGroup;
  featured?: boolean;
  /** 강조색 — 기본 레드. HeRo 골드·RooKie 그린·Planner's 틸은 연계 브랜드 색 */
  accent?: string;
  glance: MadProgramGlance;
  /** 기업도 참여하는 프로그램 — CTA에 "기업으로 참여 문의" 버튼이 붙는다 */
  corporate?: boolean;
  /** 매드리거만 참가 — CTA 주 버튼이 "매드리거 등록"으로 고정 */
  madleaguerOnly?: boolean;
};

export const MAD_ACCENT = '#EC1D25';

export const MAD_PROGRAMS: MadProgram[] = [
  {
    key: 'competition',
    href: '/madleague/programs/competition',
    title: '경쟁 PT',
    eyebrow: 'COMPETITION',
    desc: '실제 기업 과제에 동아리가 경쟁한다.',
    group: 'challenge',
    featured: true,
    corporate: true,
    madleaguerOnly: true,
    glance: {
      who: '매드리그 공식 동아리 소속 매드리거 — 동아리별 4~6인 팀',
      when: '연 1~2회 회차 (상·하반기)',
      how: '기업 RFP → 클라이언트 OT → 지역 예선 → 본선 경쟁 프레젠테이션',
      fee: '무료',
      outcome: '순위·명예의 전당 · 포트폴리오 자동 반영 · 참가·수상 인증서',
    },
  },
  {
    key: 'creazy',
    href: '/madleague/programs/creazy',
    title: '크리에이지',
    eyebrow: 'CREATIVE & CRAZY',
    desc: '국제 광고제 출품 프로젝트 — 아이디어를 세계 무대에 올린다.',
    group: 'challenge',
    glance: {
      who: '마케팅·광고 업계 취업을 희망하는 대학생 — 2개 팀, 팀당 4~5명',
      when: '매년 11월 ~ 6월, 8개월',
      how: '팀 프로젝트 + 업계 선배 멘토링 → 광고제별 출품',
      fee: '프로그램 무료 · 출품비·제작비 본인 부담',
      outcome: '국제 광고제 출품작 2~3개 · 수상 도전',
    },
  },
  {
    key: 'dam',
    href: '/madleague/programs/dam',
    title: 'DAM 파티',
    eyebrow: 'DAM NETWORKING PARTY',
    desc: 'Draft Assembly Meeting — 대학생·현업·기업이 직접 만나는 네트워킹 파티.',
    group: 'connect',
    corporate: true,
    glance: {
      who: '대학생·취업 준비생 · 현업 선배 · 기업 인사 담당자',
      when: '시즌제 — 모집 공지 때 일정 안내',
      how: '1부 포트폴리오 소개(학생 3분·기업 8분) → 2부 자유 네트워킹',
      fee: '참가 확정 후 개별 안내',
      outcome: '기업·선배와의 직접 연결 · 사이드 프로젝트 기회',
    },
  },
  {
    key: 'im',
    href: '/madleague/programs/im',
    title: '아이디어 무브먼트',
    eyebrow: 'IDEA MOVEMENT',
    desc: '연말 전국 대학생 아이디어 쇼케이스 — 문제를 정의하고, 아이디어를 실행으로 옮긴다.',
    group: 'challenge',
    glance: {
      who: '전국 대학생 — 매드리거가 아니어도 참가 가능',
      when: '매년 연말',
      how: '문제 정의 → 아이디어 개발 → 쇼케이스 발표',
      fee: '무료',
      outcome: '아이디어 발표 경험 · 포트폴리오',
    },
  },
  {
    key: 'hero',
    href: '/madleague/programs/hero',
    title: '히어로 프로그램',
    eyebrow: 'HERO PROGRAM',
    desc: 'HeRo와 연계한 커리어 솔루션 — 진로 상담부터 인턴·채용 연결까지.',
    group: 'connect',
    accent: '#FFC000',
    glance: {
      who: '매드리거 · 광고·마케팅 취업을 준비하는 대학생',
      when: '상시 신청',
      how: '신청 → 커리어 상담 → HeRo 파트너 기업 인턴·채용 연결',
      fee: '무료',
      outcome: '진로 설계 · 인턴·채용 기회 · 활동 이력이 곧 서류',
    },
  },
  {
    key: 'rookie',
    href: '/madleague/programs/rookie',
    title: 'RooKie',
    eyebrow: 'ROOKIE',
    desc: '실전 크리에이티브를 훈련하고 실전 프로젝트에도 참여할 기회.',
    group: 'training',
    accent: '#00d255',
    glance: {
      who: '크리에이티브를 지망하는 매드리거·대학생',
      when: '기수제 — 모집 공지 때 일정 안내',
      how: '크리에이티브 훈련 과정 → RooK 실전 프로젝트 참여',
      fee: '모집 공지 때 안내',
      outcome: '실전 크리에이티브 역량 · 실전 프로젝트 참여 기회',
    },
  },
  {
    key: 'planners',
    href: '/madleague/programs/planners',
    title: "Planner's",
    eyebrow: "PLANNER'S",
    desc: '실전 전략 기획을 훈련하고 실전 프로젝트에도 참여할 기회.',
    group: 'training',
    accent: '#2DD4BF',
    glance: {
      who: '전략 기획을 지망하는 매드리거·대학생',
      when: '기수제 — 모집 공지 때 일정 안내',
      how: '전략 기획 훈련 과정 → 실전 프로젝트 참여',
      fee: '모집 공지 때 안내',
      outcome: '실전 전략 기획 역량 · 실전 프로젝트 참여 기회',
    },
  },
  {
    key: 'project',
    href: '/madleague/programs/project',
    title: 'PJT',
    eyebrow: 'PROJECT JOB TRAINING',
    desc: '기업의 실전 프로젝트를 현장에서 수행하는 OJT.',
    group: 'practice',
    corporate: true,
    madleaguerOnly: true,
    glance: {
      who: '매드리거 — 동아리·권역을 넘어 꾸리는 크로스 팀',
      when: '기업 과제가 생길 때 수시',
      how: '기업 실전 과제 → 크로스 팀 수행 → 결과 납품 · 기업 피드백',
      fee: '무료',
      outcome: '실무 경험 · 기업 피드백 · 포트폴리오',
    },
  },
  {
    key: 'markethon',
    href: '/madleague/programs/markethon',
    title: '마케톤',
    eyebrow: 'MARKETHON',
    desc: 'Marketing + Hacking + Marathon — 72시간의 열정.',
    group: 'challenge',
    accent: '#FFC000',
    madleaguerOnly: true,
    glance: {
      who: '매드리거만 — 전국 동아리가 한 공간에',
      when: '연 1회, 금요일 저녁 ~ 월요일 아침',
      how: '브리프 공개 → 즉석 팀 구성 → 실시간 멘토링 → 최종 발표',
      fee: '무료',
      outcome: '72시간의 결과물 · 전국 매드리거 네트워크',
    },
  },
  {
    key: 'insight-touring',
    href: '/madleague/programs/insight-touring',
    title: '인사이트 투어링',
    eyebrow: 'INSIGHT TOURING',
    desc: '지역·기업을 돌며 혁신 제안. 당신의 통찰이 지역을 바꾼다.',
    group: 'practice',
    corporate: true,
    madleaguerOnly: true,
    glance: {
      who: '매드리거',
      when: '지역·기업 섭외 때 비정기',
      how: '현장 투어 → 관찰·인터뷰 → 혁신 전략 제안서',
      fee: '무료',
      outcome: '현장 인사이트 · 전략 제안서 · 포트폴리오',
    },
  },
];

export function getMadProgram(key: string): MadProgram {
  const p = MAD_PROGRAMS.find((x) => x.key === key);
  if (!p) throw new Error(`MADLeague 프로그램 키 없음: ${key}`);
  return p;
}

/** 이전·다음 프로그램 (목록 순서 기준, 끝에서는 반대편으로 돈다) */
export function getMadProgramNeighbors(key: string): { prev: MadProgram; next: MadProgram } {
  const i = MAD_PROGRAMS.findIndex((x) => x.key === key);
  const n = MAD_PROGRAMS.length;
  return { prev: MAD_PROGRAMS[(i - 1 + n) % n], next: MAD_PROGRAMS[(i + 1) % n] };
}
