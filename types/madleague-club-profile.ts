/**
 * MADLeague 동아리 소개 템플릿 — mad_clubs.profile (jsonb)
 * 동아리 소개서 4종(ADlle·PAM·SUZAK·합본 포트폴리오) 공통 구조를 표준화 (2026-10-10)
 * 동아리명·지역·로고·대표색은 mad_clubs 기본 칸(직원 관리), 한 줄 소개 = mad_clubs.description, 창립 연도 = established_year
 */

export interface ClubValue { title: string; desc?: string }
export interface ClubStat { label: string; value: string }
export interface ClubTeam { name: string; desc?: string; fit?: string }
export interface ClubScheduleItem { when: string; title: string; desc?: string }
export interface ClubProgram { title: string; desc?: string }
export interface ClubProject { year?: string; client: string; title: string; type?: string; result?: string; link?: string }
export interface ClubAward { year: string; contest: string; prize: string; work?: string }
export interface ClubNetwork { name: string; kind?: string }
export interface ClubChannel { label: string; url: string }

export interface ClubRecruit {
  status?: 'open' | 'closed';
  period?: string;
  target?: string;
  process?: string;
  link?: string;
}

export interface ClubProfile {
  /** 정식 명칭 (예: 부산지역대학생연합광고연구회) */
  full_name?: string;
  slogan?: string;
  /** 참여 대학 */
  universities?: string;
  intro?: string;
  values?: ClubValue[];
  stats?: ClubStat[];
  teams?: ClubTeam[];
  programs?: ClubProgram[];
  schedule?: ClubScheduleItem[];
  projects?: ClubProject[];
  awards?: ClubAward[];
  network?: ClubNetwork[];
  recruit?: ClubRecruit;
  contact_email?: string;
  channels?: ClubChannel[];
}

/** 편집기·검증이 함께 쓰는 목록형 섹션 정의 */
export interface ListFieldDef { key: string; label: string; long?: boolean; required?: boolean; max: number; placeholder?: string; url?: boolean }
export interface ListSectionDef { key: keyof ClubProfile; title: string; hint?: string; maxItems: number; fields: ListFieldDef[] }

export const CLUB_LIST_SECTIONS: ListSectionDef[] = [
  { key: 'values', title: '핵심 가치', hint: '동아리가 중요하게 여기는 것 (예: Think · Design · Action)', maxItems: 6, fields: [
    { key: 'title', label: '키워드', required: true, max: 40 },
    { key: 'desc', label: '설명', long: true, max: 300 },
  ] },
  { key: 'stats', title: '숫자로 보는 동아리', hint: '기준 시점을 함께 적어 주세요 (예: 누적 부원 · 130명 (2024.5))', maxItems: 6, fields: [
    { key: 'label', label: '항목', required: true, max: 30, placeholder: '누적 부원' },
    { key: 'value', label: '값', required: true, max: 30, placeholder: '130명 (2024.5)' },
  ] },
  { key: 'teams', title: '팀 구성', hint: '부서·팀별 하는 일과 이런 사람을 찾는다', maxItems: 8, fields: [
    { key: 'name', label: '팀 이름', required: true, max: 40 },
    { key: 'desc', label: '하는 일', long: true, max: 400 },
    { key: 'fit', label: '이런 사람', max: 120, placeholder: '#아이디어 #논리 #발표' },
  ] },
  { key: 'programs', title: '주요 활동', hint: '스터디·해커톤·특강·기업 탐방·매거진 등', maxItems: 10, fields: [
    { key: 'title', label: '활동 이름', required: true, max: 60 },
    { key: 'desc', label: '설명', long: true, max: 400 },
  ] },
  { key: 'schedule', title: '연간 일정', maxItems: 12, fields: [
    { key: 'when', label: '시기', required: true, max: 30, placeholder: '3월' },
    { key: 'title', label: '일정', required: true, max: 60 },
    { key: 'desc', label: '설명', max: 200 },
  ] },
  { key: 'projects', title: '프로젝트', hint: '기업 연계·공모전·사이드 프로젝트 (MAD League 경쟁 PT 수상은 자동 표시)', maxItems: 30, fields: [
    { key: 'year', label: '연도', max: 10, placeholder: '2024' },
    { key: 'client', label: '기업·기관', required: true, max: 60 },
    { key: 'title', label: '프로젝트', required: true, max: 100 },
    { key: 'type', label: '유형', max: 30, placeholder: '기업 연계 / 공모전 / 사이드' },
    { key: 'result', label: '결과', max: 60 },
    { key: 'link', label: '자료 링크', max: 500, url: true },
  ] },
  { key: 'awards', title: '수상 내역', hint: '최근 연도부터 자동 정렬됩니다', maxItems: 100, fields: [
    { key: 'year', label: '연도', required: true, max: 10, placeholder: '2024' },
    { key: 'contest', label: '대회', required: true, max: 100 },
    { key: 'prize', label: '수상', required: true, max: 60 },
    { key: 'work', label: '작품', max: 100 },
  ] },
  { key: 'network', title: '멘토·교육 네트워크', hint: '특강·멘토링·탐방을 함께한 기업·기관 (개인 이름은 적지 않습니다)', maxItems: 30, fields: [
    { key: 'name', label: '기업·기관', required: true, max: 60 },
    { key: 'kind', label: '형태', max: 30, placeholder: '특강 / 멘토링 / 탐방' },
  ] },
  { key: 'channels', title: '채널', hint: '인스타그램·블로그·유튜브·카카오채널 등 공식 채널', maxItems: 8, fields: [
    { key: 'label', label: '이름', required: true, max: 30, placeholder: '인스타그램' },
    { key: 'url', label: '주소', required: true, max: 500, url: true, placeholder: 'https://' },
  ] },
];
