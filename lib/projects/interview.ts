/**
 * Ten:One™ 프로젝트 — AI 면접 예행연습 (interview.tenone.biz, 2026-10-13)
 * AI 시대 신입 채용 실종을 풍자하는 바이럴 테스트. 면접관인 척 질문 → 고른 답을 조합해 '결과 통지서'를 만든다
 *
 * 규칙
 * - 답변은 저장하지 않는다. 결과는 URL 코드(질문마다 a~d 한 글자)로만 재현 — DB·개인정보 없음
 * - ❌ 실존 기업·인물·제품 이름, 정부·공공기관 사칭 문구 (풍자 대상은 '현상'만)
 * - "재미로 보는 풍자 테스트, 실제 채용과 무관" 고지를 결과에 항상 둔다
 */

export type Axis = "human" | "cost" | "dopa" | "ai" | "spec";

export interface Answer { text: string; axis: Axis; line: string }
export interface Question { q: string; answers: Answer[] }

export const INTERVIEWER = "HR-0";

export const INTRO = [
    "안녕하십니까, 인간 지원자님.",
    `저는 귀하의 자기소개서를 0.003초 만에 읽은 AI 면접관 ${INTERVIEWER}입니다.`,
    "귀하가 회사 전기요금보다 가치 있는 존재인지 몇 가지만 확인하겠습니다. 솔직하게 답해 주십시오.",
];

export const QUESTIONS: Question[] = [
    {
        q: "우리 회사 AI 인턴은 전기만 주면 24시간 일합니다. 귀하의 최대 가동 시간은?",
        answers: [
            { text: "주 52시간을 지켜야 능률이 오릅니다.", axis: "human", line: "'주 52시간'이라는 고대 문헌을 아직 믿고 계신 점" },
            { text: "마감 앞이면 무박 3일도 버팁니다.", axis: "cost", line: "무박 3일을 자랑으로 말씀하신 점 (AI도 그렇게는 일하지 않습니다)" },
            { text: "충전기만 꽂아 주시면 됩니다.", axis: "ai", line: "본인을 충전식이라고 소개하신 점" },
            { text: "잠깐만요, 쇼츠 하나만 보고 답할게요.", axis: "dopa", line: "질문을 듣는 도중 쇼츠를 켜신 점" },
        ],
    },
    {
        q: "본 공고는 신입 채용입니다. 다만 경력 3년 같은 신입을 원합니다. 가장 혁신적인 경력은?",
        answers: [
            { text: "조별 과제 조장을 맡아 팀을 이끌었습니다.", axis: "human", line: "조별 과제 조장을 '리더십 경험'이라 부르신 점" },
            { text: "열정페이 인턴만 세 군데 했습니다.", axis: "cost", line: "무급 인턴 세 곳을 경력으로 세신 점" },
            { text: "생후 6개월에 창업해서 매각했습니다.", axis: "spec", line: "생후 6개월에 회사를 매각하셨다는 점 (기저귀 착용 중)" },
            { text: "제 경력은 AI가 더 잘 정리해 줄 겁니다.", axis: "ai", line: "자기소개서를 본인보다 AI가 더 잘 아는 점" },
        ],
    },
    {
        q: "팀장이 귀하의 기획서를 세 줄짜리 피드백과 함께 반려했습니다. 귀하의 반응은?",
        answers: [
            { text: "화장실에서 조용히 눈물을 닦습니다.", axis: "human", line: "반려 한 번에 눈물이 나는 생체 반응" },
            { text: "세 줄은 길어서 두 줄까지 읽었습니다.", axis: "dopa", line: "세 줄짜리 피드백을 끝까지 읽지 못한 점" },
            { text: "0.1초 만에 '감사합니다'와 수정본을 보냅니다.", axis: "ai", line: "감정을 0.1초 만에 지우는 능력 (사람 맞으십니까?)" },
            { text: "퇴근하고 집에서 조용히 고칩니다.", axis: "cost", line: "퇴근 후 무급 수정을 기본값으로 두신 점" },
        ],
    },
    {
        q: "AI 인턴의 한 달 운영비는 커피 두 잔 값입니다. 귀하의 희망 연봉은?",
        answers: [
            { text: "최저임금은 주셔야죠.", axis: "human", line: "생존에 필요한 최저임금을 요구하신 점" },
            { text: "식대만 주시면 됩니다.", axis: "cost", line: "식대만 받겠다는 공격적인 단가 경쟁" },
            { text: "연봉 대신 지분으로 받겠습니다.", axis: "spec", line: "신입이 연봉 대신 지분을 요구하신 점" },
            { text: "월 9,900원 구독제로 하시죠.", axis: "ai", line: "본인을 월 구독 상품으로 내놓으신 점" },
        ],
    },
    {
        q: "업무에 AI를 얼마나 활용하십니까?",
        answers: [
            { text: "중요한 건 직접 고민해서 씁니다.", axis: "human", line: "문서를 손수 쓰신다는 심각한 비효율" },
            { text: "사실 이 답변도 AI가 골라 줬습니다.", axis: "ai", line: "이 답변마저 AI가 골랐다는 자백" },
            { text: "프롬프트 관련 자격증만 12개입니다.", axis: "spec", line: "프롬프트 자격증 12개 (발급처 확인 불가)" },
            { text: "요약해 주는 AI 없으면 아무것도 못 읽습니다.", axis: "dopa", line: "요약 없이는 글을 읽지 못하는 점" },
        ],
    },
    {
        q: "토요일 밤 11시, 팀장에게서 '잠깐 통화 가능?' 메시지가 왔습니다.",
        answers: [
            { text: "주말엔 쉬어야 월요일에 일합니다.", axis: "human", line: "주말을 '쉬는 날'로 알고 계신 점" },
            { text: "3초 안에 '네! 가능합니다!'", axis: "cost", line: "토요일 밤 11시에 3초 만에 답하신 점" },
            { text: "읽고, 릴스를 마저 봅니다.", axis: "dopa", line: "팀장 메시지보다 릴스를 우선하신 점" },
            { text: "제 자동응답 AI가 대신 받습니다.", axis: "ai", line: "통화도 AI에게 외주를 주신 점" },
        ],
    },
    {
        q: "마지막 질문입니다. 귀하가 AI보다 나은 점을 하나만 말씀해 주십시오.",
        answers: [
            { text: "저에게는 마음이 있습니다.", axis: "human", line: "'마음'이라는 정량화할 수 없는 항목을 제출하신 점" },
            { text: "저도 껐다 켜면 다시 됩니다.", axis: "ai", line: "본인도 재부팅이 된다는 주장" },
            { text: "꿈에서 해외 명문대 세 곳에 합격했습니다.", axis: "spec", line: "꿈에서 받은 합격증을 첨부하신 점" },
            { text: "잠깐만요, 알림 좀 확인하고요.", axis: "dopa", line: "마지막 질문에서 알림을 확인하신 점" },
        ],
    },
];

export interface Verdict { axis: Axis; status: string; title: string; summary: string; closing: string }

export const VERDICTS: Record<Axis, Verdict> = {
    human: {
        axis: "human",
        status: "불합격",
        title: "순도 100% 탄소 생명체",
        summary: "귀하는 치명적인 '인간미' 과다로 불합격하셨습니다.",
        closing: "귀하를 채용하면 식대·4대 보험·휴가·감정 관리 비용이 발생합니다. 당사는 불평하지 않는 AI 인턴을 채용하기로 했습니다. 다만 귀하의 '마음'은 아직 학습 데이터에 없어, 언젠가 다시 연락드릴 수도 있습니다.",
    },
    cost: {
        axis: "cost",
        status: "예비 999번",
        title: "가성비 휴먼",
        summary: "귀하는 단가 경쟁력은 우수하나 AI보다 비싸서 예비 999번에 배정되셨습니다.",
        closing: "식대만 받고 주말에도 3초 만에 답하는 놀라운 가성비를 보여 주셨지만, AI 인턴은 식대도 받지 않습니다. 앞의 998명이 모두 포기하면 연락드리겠습니다. 그때까지 몸을 아끼십시오. 진심입니다.",
    },
    dopa: {
        axis: "dopa",
        status: "보류",
        title: "15초 집중력 보유자",
        summary: "귀하는 집중력 지속 시간 미달로 판정이 보류되었습니다.",
        closing: "면접 중 쇼츠·릴스·알림을 확인하신 횟수가 AI 면접관의 기록 한도를 넘었습니다. 이 통지서가 세 줄을 넘는 순간 귀하는 이미 다른 화면으로 넘어갔을 것으로 예측됩니다. 혹시 여기까지 읽으셨다면, 축하합니다. 성장하셨습니다.",
    },
    ai: {
        axis: "ai",
        status: "합격 취소",
        title: "AI 사칭 의심자",
        summary: "귀하는 너무 AI 같아서 합격이 취소되었습니다.",
        closing: "충전식이고, 감정을 0.1초 만에 지우며, 통화도 자동응답으로 받는 완벽한 지원자셨습니다. 그러나 추적 결과 귀하는 경쟁사 AI가 인간 지원자로 위장 침투한 것으로 의심됩니다. 보안상 합격을 취소합니다. 진짜 사람이시라면, 오늘은 산책을 권합니다.",
    },
    spec: {
        axis: "spec",
        status: "서류 재검토",
        title: "경력 같은 신입의 끝판왕",
        summary: "귀하는 신입치고 경력이 너무 화려해 서류 재검토 대상이 되셨습니다.",
        closing: "생후 창업, 자격증 12개, 꿈속 명문대 합격까지. 당사가 원한 '경력 같은 신입'을 정확히 구현하셨습니다. 문제는 당사도 그런 신입은 세상에 없다는 걸 이제 알게 되었다는 점입니다. 공고를 다시 쓰고 연락드리겠습니다.",
    },
};

/** 동점일 때 우선순위 — 선택지가 적은 판정이 먼저 (판정이 고르게 나오도록, 전 조합 분포 점검 2026-10-13) */
const AXIS_ORDER: Axis[] = ["spec", "dopa", "cost", "human", "ai"];
const LETTERS = ["a", "b", "c", "d"];

export function isValidCode(code: string) {
    return code.length === QUESTIONS.length && [...code].every((c, i) => {
        const idx = LETTERS.indexOf(c);
        return idx >= 0 && idx < QUESTIONS[i].answers.length;
    });
}

export const toCode = (picks: number[]) => picks.map(i => LETTERS[i]).join("");

function hash(s: string) {
    let h = 2166136261;
    for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
}

/** 결과 통지서 — 코드만으로 항상 같은 결과 (공유 링크·미리보기 이미지가 같은 내용) */
export function buildNotice(code: string) {
    const picks = [...code].map((c, i) => QUESTIONS[i].answers[LETTERS.indexOf(c)]);
    const score: Record<Axis, number> = { human: 0, cost: 0, dopa: 0, ai: 0, spec: 0 };
    for (const p of picks) score[p.axis]++;
    const top = [...AXIS_ORDER].sort((a, b) => score[b] - score[a])[0];
    const verdict = VERDICTS[top];

    // 판정 사유 = 판정 축의 답 먼저, 나머지는 질문 순서대로 — 3개
    const reasons = [...picks.filter(p => p.axis === top), ...picks.filter(p => p.axis !== top)].slice(0, 3).map(p => p.line);

    const h = hash(code);
    const replaceable = Math.min(99.9, 40 + ((score.ai + score.cost + score.dopa) / QUESTIONS.length) * 55 + (h % 50) / 10);
    return {
        code,
        verdict,
        reasons,
        applicantNo: `HUMAN-${String(h % 100000).padStart(5, "0")}`,
        replaceable: Math.round(replaceable * 10) / 10,
        humanity: Math.round((score.human / QUESTIONS.length) * 100),
    };
}

export type Notice = ReturnType<typeof buildNotice>;

export const SITE = {
    host: "interview.tenone.biz",
    url: "https://interview.tenone.biz",
    eyebrow: "AI 면접 예행연습",
    title: "인간 지원자 사전 검수",
    tagline: "실전 AI 면접 전에, 미리 떨어져 보세요.",
    meta: "7문항 · 2분 · 답변은 저장하지 않습니다",
    disclaimer: "재미로 보는 풍자 테스트입니다. 실제 채용·평가와 관계없고, 답변은 어디에도 저장하지 않습니다.",
    presented: "AI 면접관에게 떨어지셨나요? 정상입니다. Ten:One™은 효율보다 사람의 생각과 실행으로 기업과 사회의 문제를 풀어 갑니다.",
};
