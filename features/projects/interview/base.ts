import { SITE } from "@/lib/projects/interview";

/** 화면 안 링크 기준 경로 — 공식 주소(interview.tenone.biz)에선 '', tenone.biz·로컬에선 '/interview' */
export function interviewBase(host: string | null | undefined) {
    return host?.split(":")[0] === SITE.host ? "" : "/interview";
}
