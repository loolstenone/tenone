/**
 * 직원 입사 권한 묶음 + 인사 고지·보안 서약 문안 버전 (2026-10-10)
 *   입사 등록(ERP › HR › 구성원 등록) 때 묶음 하나를 고르면 member_roles가 한 번에 들어간다 (lib/staff-lifecycle.ts)
 *   직무 권한(인사·급여·재무·회계)은 묶음에 넣지 않는다 — 마스터가 Standard › 권한 체계에서 따로 부여 (lib/staff-duties.ts)
 *   묶음을 바꾸면 이미 입사한 사람에게는 소급되지 않는다 (입사 때 한 번 부여)
 */
export interface RoleGrant { role: string; context: "universe" | "system" | "module" }

export const STAFF_PRESETS = [
    {
        key: "staff",
        label: "기본 직원",
        desc: "Workspace · 프로젝트 · Wiki",
        roles: [
            { role: "staff", context: "universe" },
            { role: "intra_access", context: "system" },
            { role: "myverse", context: "module" },
            { role: "project", context: "module" },
            { role: "wiki", context: "module" },
        ] as RoleGrant[],
    },
    {
        key: "manager",
        label: "매니저",
        desc: "기본 직원 + Intelligence(유니버스 현황) 열람",
        roles: [
            { role: "manager", context: "universe" },
            { role: "intra_access", context: "system" },
            { role: "myverse", context: "module" },
            { role: "project", context: "module" },
            { role: "wiki", context: "module" },
            { role: "universe", context: "module" },
        ] as RoleGrant[],
    },
] as const;

export type StaffPresetKey = (typeof STAFF_PRESETS)[number]["key"];
export const presetOf = (key: string) => STAFF_PRESETS.find(p => p.key === key);

export const EMPLOYMENT_TYPES = ["정규직", "계약직", "인턴", "프리랜서"] as const;

/** 입사 상태 — tenone_staff_profiles.status */
export const STAFF_STATUS_LABEL: Record<string, string> = {
    invited: "초대 수락 대기",
    onboarding: "첫 로그인 · 확인 대기",
    active: "재직",
    offboarded: "퇴사",
};

/** 첫 로그인 확인 문안 — 바꾸면 버전을 올린다 (hr_consent에 버전이 기록됨) */
export const HR_NOTICE_VERSION = "2026-10-10";
export const SECURITY_PLEDGE_VERSION = "2026-10-10";

export const HR_NOTICE_ITEMS = [
    ["처리 목적", "근로계약 이행 · 인사·근태·급여·평가 관리 · 법정 신고"],
    ["처리 항목", "이름 · 이메일 · 연락처 · 사번 · 부서 · 직위 · 입사일 · 고용형태 · 근태 · 급여 · 평가 · (선택) 비상연락처"],
    ["보관 기간", "재직 중 + 퇴직 후 3년 (근로기준법 제42조 근로자명부·계약서류), 이후 파기"],
    ["열람 범위", "본인 · 담당 직무(인사·급여·재무·회계)만 — 다른 직원은 조직도(이름·부서·직위)만 봅니다"],
] as const;

export const SECURITY_PLEDGE_ITEMS = [
    "업무로 알게 된 회원·고객·회사 정보를 업무 목적 밖으로 쓰거나 외부에 제공하지 않습니다.",
    "계정을 다른 사람과 함께 쓰지 않고, 비밀번호·키를 공유하지 않습니다.",
    "퇴사 후에도 업무상 알게 된 비밀을 유지하며, 회사 자료는 퇴사 시 반납·삭제합니다.",
] as const;
