/**
 * MADLeague 프로그램 목록 SSOT — 순서·이름·요약·그룹·한눈에 보기 데이터를 여기 한 곳에 둔다.
 * 프로그램 전체 페이지·탭 줄·홈·About·검색·각 상세 페이지 템플릿이 전부 이 파일로 렌더한다 (헤더 메뉴 이름은 lib/brand-site-menus.ts).
 * 순서 = 헤더 '프로그램' 하위 메뉴 순서 — MADLeague 직접 운영 먼저, 연계(다른 브랜드 운영) 뒤 (경쟁 PT는 헤더 단독 메뉴라 맨 앞·featured).
 */

export type MadProgramGroup = 'challenge' | 'practice' | 'connect' | 'partner';

/** 전체 프로그램 페이지의 4그룹 — 사람들이 10개를 한 번에 이해하게 묶는다.
 *  partner(연계) = 유니버스 다른 브랜드가 운영하는 프로그램 (2026-10-09 사용자 결정):
 *    MADLeague에서는 맛보기 → 정식은 그 서비스에 신청해 사용 → 경험·데이터는 본인 동의로 연계돼 풀 서비스·풀 데이터.
 *    텐원은 하나의 회사, 서비스만 다르다 — 계정(Ten:One ID)은 하나, 서비스 첫 이용 동의 + 서비스 간 연계 동의 */
export const MAD_PROGRAM_GROUPS: { key: MadProgramGroup; label: string; eyebrow: string; desc: string }[] = [
  { key: 'challenge', label: '도전', eyebrow: 'CHALLENGE', desc: '과제를 받고, 경쟁하고, 결과로 증명한다.' },
  { key: 'practice', label: '실전', eyebrow: 'PRACTICE', desc: '기업·지역의 진짜 현장에서 일한다.' },
  { key: 'connect', label: '연결', eyebrow: 'CONNECT', desc: '학생·현업·기업이 직접 만난다.' },
  { key: 'partner', label: '연계', eyebrow: 'WITH UNIVERSE', desc: 'MADLeague에서 맛보고, 그 브랜드에서 제대로 쓴다. 경험은 이어진다.' },
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
  /** 히어로 영문 eyebrow — 브랜드명은 공식 표기 그대로 (HeRo·RooK·Planner's 대문자 변환 금지, 부록 B) */
  eyebrow: string;
  /** 한 줄 요약 — 목록 카드·검색·메타 description */
  desc: string;
  group: MadProgramGroup;
  featured?: boolean;
  /** 히어로 부제 한 줄 — 모든 프로그램이 같은 자리·같은 스타일로 (2026-10-09 통일) */
  tagline: string;
  /** 강조색 — 레드 하나로 통일. 예외는 히어로 프로그램 골드뿐 (브랜드 가이드 "HeRo 프로그램만 골드") */
  accent?: string;
  /** MADLeague가 직접 운영하는 프로그램만 — 연계 프로그램은 주인 브랜드가 정한다 */
  glance?: MadProgramGlance;
  /** 연계 프로그램 — 주인 브랜드와 역할 나누기 */
  partner?: MadProgramPartner;
  /** 기업도 참여하는 프로그램 — CTA에 "기업으로 참여 문의" 버튼이 붙는다 */
  corporate?: boolean;
  /** 매드리거만 참가 — CTA 주 버튼이 "매드리거 등록"으로 고정 */
  madleaguerOnly?: boolean;
};

export type MadProgramPartner = {
  /** 주인 브랜드 표기 (공식 표기 그대로) */
  brand: string;
  /** 주인 브랜드 사이트 경로 — CrossSiteLink가 공식 주소로 바꾼다. 없으면 연결 버튼 숨김 */
  href?: string;
  /** 버튼 문구 */
  linkLabel?: string;
  /** ① 맛보기 — MADLeague 안에서 가볍게 경험하는 것 */
  taste: string[];
  /** ② 정식 — 주인 브랜드에 신청해서 쓰는 풀 서비스 */
  full: string[];
  /** ③ 연계 — 본인 동의 시 오가는 경험·데이터 (브랜드별 별도 동의, 개인정보보호법 제18조) */
  link: string[];
};

export const MAD_ACCENT = '#EC1D25';

export const MAD_PROGRAMS: MadProgram[] = [
  {
    key: 'competition',
    href: '/madleague/programs/competition',
    title: '경쟁 PT',
    eyebrow: 'COMPETITION',
    desc: '실제 기업 과제에 동아리가 경쟁한다.',
    tagline: '제안에서 끝나지 않는다. 실행까지 간다.',
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
    tagline: '강의가 아니다. 업계 선배들과 함께 하는 프로젝트다.',
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
    tagline: '우리와 맞는 인재, 나와 맞는 기업 — 이력서 밖에서 만난다.',
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
    tagline: '아이디어로 세상을 바꾼다.',
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
    key: 'project',
    href: '/madleague/programs/project',
    title: 'PJT',
    eyebrow: 'PROJECT JOB TRAINING',
    desc: '기업의 실전 프로젝트를 현장에서 수행하는 OJT.',
    tagline: '현장에서 배우고, 현장에서 성장한다.',
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
    tagline: '3일 동안 잠도 잊고, 한계까지 밀어붙인다.',
    group: 'challenge',
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
    tagline: '현장의 목소리를 듣고, 매드리거의 시선으로 제안한다.',
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
  {
    key: 'hero',
    href: '/madleague/programs/hero',
    title: '히어로 프로그램',
    eyebrow: 'WITH HeRo',
    desc: '커리어는 HeRo에서 — 매드리거의 진로 고민을 HeRo로 연결한다.',
    tagline: '매드리그에서 쌓은 경험, 커리어 설계는 HeRo와 함께.',
    group: 'partner',
    accent: '#FFC000',
    partner: {
      brand: 'HeRo',
      href: '/hero',
      linkLabel: 'HeRo에서 시작하기',
      taste: ['HIT 미니 — 20문항·3분, 나의 영웅 유형 미리보기 (이 페이지에서 바로)', '매드리거 대상 커리어 특강·상담 회차'],
      full: ['HIT 풀 리포트·심화 진단', 'AI 커리어 상담', '현업 멘토 커리어 코칭', 'Journey — 목표·데일리 체크인'],
      link: ['경쟁 PT 수상·활동 인증서 → HeRo 커리어 프로필', 'HIT 진단 결과 → 매드리그 팀 구성·포트폴리오'],
    },
  },
  {
    key: 'rookie',
    href: '/madleague/programs/rookie',
    title: 'RooKie',
    eyebrow: 'WITH RooK',
    desc: '크리에이티브 실전은 RooK에서 — RooK 실전 프로젝트로 연결한다.',
    tagline: '크리에이티브 실전 무대는 RooK이 연다.',
    group: 'partner',
    partner: {
      brand: 'RooK',
      href: '/rook/projects',
      linkLabel: 'RooK 실전 프로젝트 보기',
      taste: ['모집 중인 RooK 실전 프로젝트 미리보기 — 이 페이지와 프로그램 목록에 함께 노출', '매드리거 대상 크리에이티브 원데이 과제'],
      full: ['RooK 실전 크리에이티브 프로젝트 참가 신청·선발', '현업 크리에이터와 프로젝트 수행', 'RooK 참가 인증서'],
      link: ['RooK 프로젝트 결과물 → 매드리거 포트폴리오', '매드리그 경쟁 PT 이력 → RooK 선발 참고'],
    },
  },
  {
    key: 'planners',
    href: '/madleague/programs/planners',
    title: "Planner's",
    eyebrow: "WITH Planner's",
    desc: "전략 기획 훈련은 Planner's에서 — 매드리거를 Planner's로 연결한다.",
    tagline: "기획자의 훈련은 Planner's가 맡는다.",
    group: 'partner',
    partner: {
      brand: "Planner's",
      href: '/planners/projects',
      linkLabel: "Planner's 훈련 프로젝트 보기",
      taste: ['매드리거 대상 전략 기획 원데이 클래스', "Planner's 기획 도구 체험"],
      full: ['실전 전략 기획 훈련 과정', '실전 프로젝트 참여'],
      link: ["Planner's 훈련 기록 → 매드리거 포트폴리오", '매드리그 경쟁 PT 기획서 → 훈련 과제로'],
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
