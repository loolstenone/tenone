/**
 * 서비스 간 연계 동의 레지스트리 (코어) — sql/service-links.sql · 개인정보보호법 제18조 제2항 제1호
 *
 * 텐원은 하나의 회사, 서비스만 다르다. 한 서비스의 데이터를 다른 서비스에서 쓰려면 서비스별 별도 동의가 필요하다.
 * 동의 화면은 이 레지스트리의 목적·항목·보유기간·거부권을 그대로 보여준다 (문구 = 법정 고지).
 *
 * - key는 불변 약속 (DB member_service_links.scope). 바꾸지 말고 새 키를 만든다
 * - 고지 문구를 바꾸면 version을 올린다 (기존 동의는 유지 — 중요 변경이면 재동의 설계)
 * - live=false: 동의는 받을 수 있지만 받는 쪽 화면이 아직 없음 → 동의 버튼 대신 "준비 중"
 * - 받는 쪽 서비스는 데이터를 읽기 전에 반드시 hasServiceLink()로 확인 (lib/service-links-server.ts)
 */

export type ServiceLinkDef = {
  key: string;
  /** 데이터를 주는 서비스 (ums_sites.slug) */
  source: string;
  /** 데이터를 받는 서비스 */
  target: string;
  /** 짧은 이름 — 버튼·목록 */
  label: string;
  /** 고지: 이용 목적 */
  purpose: string;
  /** 고지: 연계 항목 */
  items: string[];
  version: string;
  live: boolean;
};

export const SERVICE_LINK_BRAND_NAMES: Record<string, string> = {
  madleague: 'MADLeague',
  hero: 'HeRo',
  rook: 'RooK',
  planners: "Planner's",
  madleap: 'MADLeap',
  badak: 'Badak',
};

/** 고지: 보유·이용 기간 (모든 연계 공통) */
export const SERVICE_LINK_RETENTION = '동의를 철회하거나 두 서비스 중 하나를 탈퇴할 때까지. 철회하면 받는 서비스에서 더 이상 보이지 않습니다.';
/** 고지: 거부 권리와 불이익 (모든 연계 공통) */
export const SERVICE_LINK_REFUSAL = '동의하지 않아도 각 서비스는 그대로 이용할 수 있습니다. 거부해도 불이익은 없습니다.';

export const SERVICE_LINKS: ServiceLinkDef[] = [
  {
    key: 'madleague.certificates>hero.profile',
    source: 'madleague',
    target: 'hero',
    label: 'MADLeague 인증서 → HeRo 커리어 프로필',
    purpose: 'HeRo 커리어 상담·코칭에서 MADLeague 활동 경력을 함께 보기 위해',
    items: ['MADLeague에서 발급한 인증서의 구분(참가·수상·활동)', '프로그램·회차 이름', '결과(순위·상 이름)', '발급일·인증서 코드'],
    version: 'link-2026-10-09',
    live: true,
  },
  {
    key: 'hero.hit_type>madleague.portfolio',
    source: 'hero',
    target: 'madleague',
    label: 'HeRo HIT 영웅 유형 → MADLeague 포트폴리오',
    purpose: 'MADLeague 포트폴리오·팀 구성에서 나의 강점 유형을 보여주기 위해',
    items: ['HIT 영웅 유형 이름·코드', '강점 요약'],
    version: 'link-2026-10-09',
    live: false,
  },
  {
    key: 'rook.program_results>madleague.portfolio',
    source: 'rook',
    target: 'madleague',
    label: 'RooK 프로젝트 결과 → MADLeague 포트폴리오',
    purpose: 'MADLeague 포트폴리오에 RooK 실전 프로젝트 이력을 함께 보여주기 위해',
    items: ['RooK 프로젝트 이름', '팀·역할', '결과·인증서 코드'],
    version: 'link-2026-10-09',
    live: false,
  },
  {
    key: 'planners.program_results>madleague.portfolio',
    source: 'planners',
    target: 'madleague',
    label: "Planner's 훈련 기록 → MADLeague 포트폴리오",
    purpose: "MADLeague 포트폴리오에 Planner's 훈련·프로젝트 이력을 함께 보여주기 위해",
    items: ["Planner's 프로젝트 이름", '팀·역할', '결과·인증서 코드'],
    version: 'link-2026-10-09',
    live: false,
  },
];

export function getServiceLink(key: string): ServiceLinkDef | undefined {
  return SERVICE_LINKS.find((l) => l.key === key);
}

export function brandName(slug: string): string {
  return SERVICE_LINK_BRAND_NAMES[slug] ?? slug;
}
