/**
 * 코어 프로그램 모듈 — 브랜드별 회차 방 주소 (사이트 창구)
 * 회차 방은 창구 사이트마다 같은 컴포넌트(features/programs/RoundTabs)를 쓴다. 새 브랜드 창구는 여기 한 줄.
 */
export const PROGRAM_ROOM_BASE: Record<string, string> = {
    madleague: "/madleague/pt",
    rook: "/rook/projects",
    hero: "/hero/programs",
    planners: "/planners/projects",
};

/** 회차 방 주소 — 주인 브랜드 창구 기준 (없으면 첫 창구, 그래도 없으면 /{brand}/programs) */
export function programRoomPath(round: { id: string; brand_id: string; channels?: string[] }, tab?: string): string {
    return `${roomBase(round)}/${round.id}${tab ? `?tab=${tab}` : ""}`;
}

function roomBase(round: { brand_id: string; channels?: string[] }): string {
    const site = PROGRAM_ROOM_BASE[round.brand_id] ? round.brand_id : (round.channels ?? []).find(c => PROGRAM_ROOM_BASE[c]);
    return site ? PROGRAM_ROOM_BASE[site] : `/${round.brand_id}/programs`;
}

/** 팀 구성·관리 화면 */
export function programTeamsPath(round: { id: string; brand_id: string; channels?: string[] }): string {
    return `${roomBase(round)}/${round.id}/teams`;
}

/** 팀 초대 링크 (주인 브랜드 창구) */
export function programJoinPath(round: { brand_id: string; channels?: string[] }, code: string): string {
    return `${roomBase(round)}/join/${code}`;
}

/** 결과 발표·취소 시 다시 그릴 공개 화면 (사이트별) */
export const PROGRAM_PUBLIC_PATHS: Record<string, string[]> = {
    madleague: ["/madleague/programs/competition", "/madleague"],
};

export const PROGRAM_KIND_LABEL: Record<string, string> = { competition: "경쟁 PT", project: "프로젝트", program: "프로그램", course: "교육 과정" };
export const PROGRAM_STATUS_LABEL: Record<string, string> = { upcoming: "모집 예정", ongoing: "진행 중", completed: "종료", cancelled: "취소" };
