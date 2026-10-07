/**
 * 창구 사이트별 프로그램 화면 테마 — 회차 방·팀 구성·초대·인증서가 같은 컴포넌트를 쓰고 색·경로만 다르다.
 * 새 창구는 여기 한 줄 + lib/programs/paths.ts PROGRAM_ROOM_BASE 한 줄.
 */
export interface ProgramTheme {
    site: string;
    accent: string;
    /** 회차 목록(워크스페이스) */
    listHref: string;
    listLabel: string;
    /** 회차 방 기본 경로 (/{base}/{id}) */
    roomBase: string;
    /** 인증서 화면 */
    certificateHref: string;
    printBase: string;
    verifyBase: string;
    /** 인쇄물에 적는 진위 확인 주소 (공식 도메인) */
    verifyHost: string;
}

export const PROGRAM_THEMES: Record<string, ProgramTheme> = {
    madleague: {
        site: "madleague", accent: "#EC1D25", listHref: "/madleague/pt", listLabel: "PT WORKSPACE", roomBase: "/madleague/pt",
        certificateHref: "/madleague/member/certificate", printBase: "/madleague/certificate/print", verifyBase: "/madleague/certificate/verify",
        verifyHost: "madleague.net/certificate/verify",
    },
    rook: {
        site: "rook", accent: "#00d255", listHref: "/rook/projects", listLabel: "PROJECTS", roomBase: "/rook/projects",
        certificateHref: "/rook/certificate", printBase: "/rook/certificate/print", verifyBase: "/rook/certificate/verify",
        verifyHost: "rook.co.kr/certificate/verify",
    },
    hero: {
        site: "hero", accent: "#E53935", listHref: "/hero/programs", listLabel: "PROGRAMS", roomBase: "/hero/programs",
        certificateHref: "/hero/certificate", printBase: "/hero/certificate/print", verifyBase: "/hero/certificate/verify",
        verifyHost: "hero.ne.kr/certificate/verify",
    },
};
