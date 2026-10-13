/**
 * HeRo 팀 진단 — 자동 리포트 (서버 전용). 입력 = 참여자들의 최근 기본 성향 검사, 출력 = 비율·평균·해석 문장
 * ❌ 개인 단위 값·이름은 넣지 않는다. 기업에 가는 것은 이 결과뿐
 */
import { discShares, interestShares, workBalance, type HitRow } from "@/lib/hero/group-stats";

export const TEAM_CONSENT_VERSION = "2026-10-13";
export const TEAM_CONSENT = {
    purpose: "팀 진단 묶음 통계 작성 (팀 전체의 성향 비율·평균)",
    items: "기본 성향 검사 결과 (행동 유형·일하는 방식·흥미 유형)",
    retention: "팀 진단에서 나가거나 탈퇴할 때까지",
    note: "회사에는 팀 전체의 비율과 평균만 보이고, 내 이름과 개인 검사 결과는 보이지 않습니다. 다만 인원이 적은 팀은 통계로 구성원의 성향이 짐작될 수 있습니다. 참여하지 않아도 불이익이 없습니다.",
};

const GAP_PCT = 15;

const GAP_TEXT: Record<string, { gap: string; hire: string }> = {
    D: { gap: "방향을 정하고 밀어붙이는 사람이 적습니다. 결정이 늦어지거나 일이 흐지부지될 수 있습니다.", hire: "목표를 세우고 끝까지 끌고 가는 추진형" },
    I: { gap: "사람을 모으고 분위기를 띄우는 사람이 적습니다. 바깥과의 소통이나 협업 제안이 약할 수 있습니다.", hire: "관계를 넓히고 설득하는 소통형" },
    S: { gap: "꾸준히 실행하고 팀을 받치는 사람이 적습니다. 시작은 많은데 마무리와 운영이 흔들릴 수 있습니다.", hire: "맡은 일을 안정적으로 끝내는 실행형" },
    C: { gap: "따져 보고 기준을 세우는 사람이 적습니다. 실수나 품질 문제가 늦게 드러날 수 있습니다.", hire: "데이터와 기준으로 점검하는 분석형" },
};

const DOMINANT_GUIDE: Record<string, string> = {
    D: "추진형이 많은 팀입니다. 속도는 빠르지만 의견이 부딪히기 쉽습니다. 결정 권한과 기준을 미리 정해 두고, 조용한 사람의 의견을 따로 묻는 시간을 두세요.",
    I: "소통형이 많은 팀입니다. 아이디어와 활기가 넘치지만 마무리가 흐려질 수 있습니다. 회의 끝에 '누가 언제까지'를 꼭 정리하세요.",
    S: "안정형이 많은 팀입니다. 서로 배려하고 꾸준하지만 변화를 늦게 받아들일 수 있습니다. 바뀌는 이유를 충분히 설명하고 작은 단계로 나눠 시작하세요.",
    C: "분석형이 많은 팀입니다. 꼼꼼하고 정확하지만 결정이 늦어질 수 있습니다. '이 정도면 충분하다'는 기준과 마감을 먼저 합의하세요.",
};

const AXIS_SKEW: Record<string, { left: string; right: string }> = {
    mbti_e_score: { left: "말하며 정리하는 사람이 많아 회의가 길어질 수 있습니다. 안건을 미리 공유하면 생각을 정리한 뒤 말하는 사람도 참여하기 쉽습니다.", right: "혼자 정리한 뒤 말하는 사람이 많아 회의에서 말이 적을 수 있습니다. 글로 의견을 먼저 받는 방식이 잘 맞습니다." },
    mbti_s_score: { left: "사실과 경험을 중시하는 사람이 많습니다. 새로운 시도는 근거와 사례를 함께 보여 줄 때 잘 받아들여집니다.", right: "가능성과 큰 그림을 보는 사람이 많습니다. 실행 단계와 일정이 빠지지 않게 챙기는 역할을 정해 두세요." },
    mbti_t_score: { left: "논리와 기준으로 결정하는 사람이 많습니다. 피드백이 차갑게 느껴지지 않도록 인정과 고마움을 함께 전하세요.", right: "사람과 관계를 살피는 사람이 많습니다. 어려운 결정은 기준을 먼저 합의해 두면 미루지 않게 됩니다." },
    mbti_j_score: { left: "계획을 세우고 지키는 사람이 많습니다. 갑작스러운 변경은 이유와 함께 일찍 알려 주세요.", right: "상황에 맞춰 움직이는 사람이 많습니다. 중요한 마감은 중간 점검일을 함께 정해 두세요." },
};

export function buildTeamReport(rows: HitRow[]) {
    const roles = discShares(rows);
    const axes = workBalance(rows);
    const interests = interestShares(rows);

    const dominant = [...roles].sort((a, b) => b.pct - a.pct)[0];
    const gaps = roles.filter(r => r.pct < GAP_PCT).map(r => ({ key: r.key, role: r.role, text: GAP_TEXT[r.key].gap, hire: GAP_TEXT[r.key].hire }));
    const skews = axes.flatMap(a => {
        if (a.leftPct >= 70) return [{ axis: `${a.left} 쪽`, text: AXIS_SKEW[a.key].left }];
        if (a.leftPct <= 30) return [{ axis: `${a.right} 쪽`, text: AXIS_SKEW[a.key].right }];
        return [];
    });

    return {
        respondents: rows.length,
        roles: roles.map(({ count: _c, ...r }) => r),
        axes,
        interests: interests.filter(i => i.count > 0).map(({ count: _c, ...r }) => r),
        dominant: dominant ? { role: dominant.role, guide: DOMINANT_GUIDE[dominant.key] } : null,
        gaps,
        skews,
        hireSuggestion: gaps.length ? `다음 채용에서는 ${gaps.map(g => g.hire).join(", ")}을 찾아보세요.` : "네 가지 역할이 고르게 있습니다. 다음 채용은 맡을 일에 필요한 역량을 우선해서 보세요.",
    };
}

export type TeamReport = ReturnType<typeof buildTeamReport>;
