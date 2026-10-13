/**
 * HeRo 팀 진단 — 팀 설문 (2026-10-13 사용자 결정: 팀장 신청 → 팀원과 동시 설문, 서로 말하기 껄끄러운 것을 드러내 팀 빌딩을 돕는다)
 * 응답 1~5 → 0~100 (reverse는 뒤집음). 개인 응답은 누구에게도 보이지 않는다
 * 리포트: 팀원(팀장 제외) 응답 GROUP_FLOOR(5)명 이상일 때만 — 영역별 팀원 평균 · 팀장 점수 · 인식 차이 · 서술(무작위 순서)
 */
import { GROUP_FLOOR } from "@/lib/hero/group-stats";

export interface SurveyItem { id: string; dim: string; text: string; leaderText?: string; reverse?: boolean }

export const SURVEY_DIMS = [
    { key: "trust", label: "신뢰", low: "서로의 일을 믿고 맡기기 어렵습니다. 실수를 감추게 되고 일이 겹치거나 비게 됩니다.", tip: "각자 이번 주 실수 하나와 배운 점을 나누는 짧은 회고를 정례화하세요. 팀장이 먼저 자기 실수를 꺼내면 빨라집니다." },
    { key: "voice", label: "솔직하게 말하기", low: "반대 의견이나 모르는 것을 말하기 어려운 분위기입니다. 문제가 늦게 드러납니다.", tip: "회의 끝에 '반대 의견 한 가지씩'을 돌아가며 말하는 순서를 두고, 의견은 글로 먼저 받아 보세요." },
    { key: "roles", label: "역할", low: "누가 무엇을 책임지는지 흐립니다. 공이 넘어가지 않거나 같은 일을 두 번 합니다.", tip: "업무마다 '결정하는 사람 1명'을 적은 역할표를 만들어 팀 전체가 보는 곳에 두세요." },
    { key: "goals", label: "목표", low: "팀이 왜 이 일을 하는지, 무엇이 먼저인지 공감대가 약합니다.", tip: "분기 목표 3개와 하지 않을 일 3개를 함께 정하고, 우선순위가 바뀔 때는 이유를 같이 알리세요." },
    { key: "conflict", label: "갈등 다루기", low: "부딪힘을 피하거나 말하지 못한 불만이 쌓여 있습니다.", tip: "불만은 사람이 아니라 '상황·영향·요청' 순서로 말하는 규칙을 정하고, 1:1 대화 시간을 정기적으로 두세요." },
    { key: "load", label: "업무 부담", low: "일이 몇 사람에게 몰리거나 감당하기 어렵다고 느낍니다.", tip: "각자 맡은 일과 걸리는 시간을 한 번 펼쳐 놓고, 몰린 일을 나누거나 미룰 일을 정하세요." },
    { key: "recognition", label: "인정·피드백", low: "잘한 일이 제때 인정받지 못하고, 도움이 되는 피드백이 적습니다.", tip: "주간 회의에 '이번 주 고마웠던 일' 한 가지를 넣고, 피드백은 일이 끝난 바로 뒤에 짧게 주세요." },
    { key: "leader", label: "팀장과의 관계", low: "팀장과 편하게 이야기하거나 결정을 납득하기 어렵습니다.", tip: "팀장이 결정의 이유를 먼저 설명하고, 팀원별 30분 1:1을 2주에 한 번 잡아 보세요." },
] as const;

export const SURVEY_ITEMS: SurveyItem[] = [
    { id: "t1", dim: "trust", text: "팀원들이 맡은 일을 해낼 거라고 믿는다" },
    { id: "t2", dim: "trust", text: "실수를 털어놓아도 탓하지 않을 거라고 느낀다" },
    { id: "v1", dim: "voice", text: "회의에서 반대 의견을 편하게 말할 수 있다" },
    { id: "v2", dim: "voice", text: "모르는 것을 물어보기 어렵지 않다" },
    { id: "r1", dim: "roles", text: "내가 무엇을 책임지는지 분명하다" },
    { id: "r2", dim: "roles", text: "누가 무엇을 맡고 있는지 팀원 모두 안다" },
    { id: "g1", dim: "goals", text: "팀이 왜 이 일을 하는지 공감한다" },
    { id: "g2", dim: "goals", text: "우선순위가 자주 바뀌어 혼란스럽다", reverse: true },
    { id: "c1", dim: "conflict", text: "의견이 부딪히면 사람이 아니라 일 중심으로 풀어낸다" },
    { id: "c2", dim: "conflict", text: "말하지 못한 불만이 팀 안에 쌓여 있다", reverse: true },
    { id: "w1", dim: "load", text: "일이 몇 사람에게만 몰려 있지 않다" },
    { id: "w2", dim: "load", text: "지금 업무량은 감당할 만하다" },
    { id: "p1", dim: "recognition", text: "잘한 일은 제때 인정받는다" },
    { id: "p2", dim: "recognition", text: "일에 도움이 되는 피드백을 자주 받는다" },
    { id: "l1", dim: "leader", text: "팀장과 편하게 이야기할 수 있다", leaderText: "팀원들이 나와 편하게 이야기한다" },
    { id: "l2", dim: "leader", text: "팀장의 결정이 납득된다", leaderText: "팀원들이 내 결정을 납득한다" },
];

export const SURVEY_SCALE = ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"];

export const SURVEY_OPEN = [
    { id: "hard_to_say", text: "팀에서 말하기 어려웠지만 바뀌었으면 하는 것" },
    { id: "doing_well", text: "우리 팀이 잘하고 있는 것" },
] as const;

export interface SurveyAnswer { answers: Record<string, number>; hard_to_say?: string; doing_well?: string }

/** 저장 전 검증 — 16문항 전부 1~5, 서술은 각 500자 */
export function normalizeSurvey(raw: unknown): SurveyAnswer | null {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const a = (r.answers && typeof r.answers === "object" ? r.answers : {}) as Record<string, unknown>;
    const answers: Record<string, number> = {};
    for (const it of SURVEY_ITEMS) {
        const v = a[it.id];
        if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5) return null;
        answers[it.id] = v;
    }
    const text = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 500) : "");
    return { answers, hard_to_say: text(r.hard_to_say), doing_well: text(r.doing_well) };
}

function dimScores(s: SurveyAnswer) {
    return Object.fromEntries(SURVEY_DIMS.map(d => {
        const vals = SURVEY_ITEMS.filter(i => i.dim === d.key).map(i => {
            const v = s.answers[i.id];
            const n = ((v - 1) / 4) * 100;
            return i.reverse ? 100 - n : n;
        });
        return [d.key, Math.round(vals.reduce((x, y) => x + y, 0) / vals.length)];
    })) as Record<string, number>;
}

const shuffle = <T,>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
};

/** 팀 설문 리포트 — 팀원 응답이 GROUP_FLOOR 미만이면 null */
export function buildSurveyReport(members: SurveyAnswer[], leader: SurveyAnswer | null) {
    if (members.length < GROUP_FLOOR) return null;
    const per = members.map(dimScores);
    const lead = leader ? dimScores(leader) : null;
    const dims = SURVEY_DIMS.map(d => {
        const avg = Math.round(per.reduce((x, p) => x + p[d.key], 0) / per.length);
        const leaderScore = lead ? lead[d.key] : null;
        const gap = leaderScore === null ? null : leaderScore - avg;
        return { key: d.key, label: d.label, team: avg, leader: leaderScore, gap };
    });
    const issues = dims.filter(d => d.team < 50).sort((a, b) => a.team - b.team)
        .map(d => { const m = SURVEY_DIMS.find(x => x.key === d.key)!; return { label: d.label, text: m.low, tip: m.tip }; });
    const blindSpots = dims.filter(d => d.gap !== null && Math.abs(d.gap) >= 20).map(d => ({
        label: d.label,
        text: d.gap! > 0
            ? `팀장은 ${d.leader}점으로 보지만 팀원 평균은 ${d.team}점입니다. 팀장이 생각하는 것보다 팀원들이 어렵게 느끼는 부분입니다.`
            : `팀장은 ${d.leader}점으로 보지만 팀원 평균은 ${d.team}점입니다. 팀원들은 팀장이 걱정하는 것보다 괜찮게 느끼고 있습니다.`,
    }));
    const strengths = dims.filter(d => d.team >= 75).map(d => d.label);
    const open = (k: "hard_to_say" | "doing_well") => shuffle(members.map(m => m[k]).filter((x): x is string => !!x));
    return { respondents: members.length, dims, issues, blindSpots, strengths, hardToSay: open("hard_to_say"), doingWell: open("doing_well") };
}

export type SurveyReport = NonNullable<ReturnType<typeof buildSurveyReport>>;
