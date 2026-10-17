// 플래너'스 PAD(PDF) → 플래너'스 AI 들어오는 길 (2026-10-18 핸드오프 5번)
// PDF 페이지 유형마다 버튼 하나 = /planners/ai/from/{key}. 도착하면 그 페이지에 맞는 안내·글이 이미 채워져 있고,
// '이 페이지로 시작하기'를 누르면 (로그인·처음 설정을 거쳐도) 앱의 생각 쏟아내기 칸에 그 글이 들어가 있다
// ❌ key를 바꾸지 않는다 - PDF에 박힌 주소다. 새 유형은 추가만

export type PadFromKey = "daily" | "weekly" | "monthly" | "yearly" | "project" | "pi";

export interface PadFromPreset {
    key: PadFromKey;
    /** PAD 페이지 이름 (PDF 표기) */
    page: string;
    title: string;
    lead: string;
    /** 생각 쏟아내기 칸에 미리 채울 글 (사용자가 고쳐 쓴다) */
    prompt: string;
    /** 사진으로 옮길 때 안내 */
    photo: string;
    /** 시작하기 누르면 갈 앱 화면 */
    appPath: string;
}

export const PAD_FROM: Record<PadFromKey, PadFromPreset> = {
    daily: {
        key: "daily",
        page: "Daily",
        title: "오늘 쓴 페이지, 그대로 옮겨 오세요",
        lead: "PAD에 적은 할 일과 일정을 다시 칠 필요 없습니다. 사진 한 장이면 할 일·일정·메모로 나눠 제안합니다.",
        prompt: "오늘 PAD에 적은 것들:\n",
        photo: "Daily 페이지를 화면 그대로 캡처하거나 찍어서 '사진으로'에 올리세요. 불렛 저널 기호(• × > ○)도 알아봅니다.",
        appPath: "/planners/app/daily",
    },
    weekly: {
        key: "weekly",
        page: "Weekly",
        title: "이번 주 계획을 플래너'스 AI로",
        lead: "주간 페이지에 적은 일을 요일별로 옮기고, 못 끝낸 일은 빈 시간에 다시 놓아 드립니다.",
        prompt: "이번 주 PAD 주간 페이지에 적은 계획:\n",
        photo: "Weekly 페이지를 캡처해 '사진으로'에 올리면 요일별 할 일로 나눠 제안합니다.",
        appPath: "/planners/app/daily",
    },
    monthly: {
        key: "monthly",
        page: "Monthly",
        title: "이달의 일정, 한 번에 옮기기",
        lead: "월간 달력에 적은 약속과 마감을 날짜에 맞춰 일정으로 넣습니다.",
        prompt: "이번 달 PAD 월간 페이지에 적은 일정:\n",
        photo: "Monthly 달력을 캡처해 '사진으로'에 올리면 날짜별 일정으로 나눠 제안합니다.",
        appPath: "/planners/app/daily",
    },
    yearly: {
        key: "yearly",
        page: "Yearly",
        title: "올해의 목표를 오늘 할 일로",
        lead: "연간 페이지의 목표를 프로젝트로 만들면, 플래너'스 AI가 할 일과 날짜로 나눠 제안합니다.",
        prompt: "올해 이루고 싶은 목표:\n",
        photo: "Yearly 페이지를 캡처해 '사진으로'에 올려도 됩니다. 목표는 프로젝트로 옮겨 나눠 보세요.",
        appPath: "/planners/app/daily",
    },
    project: {
        key: "project",
        page: "Project",
        title: "프로젝트 페이지를 이어서 관리하기",
        lead: "목표·마일스톤·할 일을 옮겨 두면 리스트·칸반·간트로 보고, 마감을 넘기면 미리 알려 드립니다.",
        prompt: "진행 중인 프로젝트와 해야 할 일:\n",
        photo: "Project 페이지를 캡처해 '사진으로'에 올리면 할 일로 나눠 제안합니다.",
        appPath: "/planners/app/daily",
    },
    pi: {
        key: "pi",
        page: "Personal Identity",
        title: "나의 정체성, 모든 계획의 기준으로",
        lead: "PAD의 Personal Identity(P.I)에 쓴 비전·미션·가치를 플래너'스 AI의 정체성에 옮겨 두면, 계획을 세울 때마다 기준이 됩니다.",
        prompt: "",
        photo: "P.I 페이지를 보며 정체성 화면에 옮겨 적으세요. 쓰는 법과 사례는 '이야기 › 쓰는 법'에 있습니다.",
        appPath: "/planners/app/personal",
    },
};

export const PAD_FROM_KEYS = Object.keys(PAD_FROM) as PadFromKey[];

export const isPadFromKey = (k: string): k is PadFromKey => k in PAD_FROM;

/** 로그인·처음 설정을 거쳐도 앱까지 이어지게 (주소 파라미터는 처음 설정에서 사라진다) */
export const PAD_FROM_STORAGE = "planners_pad_from";
