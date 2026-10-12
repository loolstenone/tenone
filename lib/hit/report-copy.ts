/**
 * HIT 결과 리포트 문구 SSOT (2026-10-12) — A·B·C~GAP 결과 화면이 같은 기준·같은 말로 읽히게
 *
 * 점수 읽는 법 (전 검사 공통):
 *   0~100 = 내가 1~7점으로 답한 값의 환산 ((평균-1)/6×100). 4점 '보통이다' = 50.
 *   다른 사람과 비교한 순위(백분위)가 아니다.
 * 구간 = 저장된 등급과 같은 기준 (scoring-b/c gradeScore: 75/50/25)
 */

export type ScoreBand = 'strong' | 'solid' | 'grow' | 'focus';

export const BAND_INFO: Record<ScoreBand, { label: string; range: string; tone: string; bar: string }> = {
  strong: { label: '뚜렷한 강점', range: '75 이상', tone: 'bg-emerald-50 text-emerald-700', bar: 'bg-neutral-900' },
  solid: { label: '갖춰짐', range: '50~74', tone: 'bg-neutral-100 text-neutral-700', bar: 'bg-neutral-500' },
  grow: { label: '보완하면 좋음', range: '25~49', tone: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400' },
  focus: { label: '우선 보완', range: '25 미만', tone: 'bg-orange-50 text-orange-700', bar: 'bg-orange-400' },
};

export function scoreBand(v: number): ScoreBand {
  if (v >= 75) return 'strong';
  if (v >= 50) return 'solid';
  if (v >= 25) return 'grow';
  return 'focus';
}

export const SCORE_GUIDE = {
  title: '점수 읽는 법',
  lines: [
    '0~100점은 내가 각 문항에 1~7점으로 답한 값을 바꾼 점수입니다. "보통이다"(4점)로 답하면 50점이에요.',
    '다른 사람과 비교한 순위가 아닙니다. 나 스스로 얼마나 "그렇다"고 느끼는지를 보여 줍니다.',
    '그래서 점수 자체보다 내 안에서 어디가 높고 낮은지, 그 차이를 보는 것이 더 중요합니다.',
  ],
};

/** 차원 정의 — what: 무엇을 보나 / hi(75+) · mid(50~74) · low(50 미만) 해석 */
export interface DimensionCopy { label: string; what: string; hi: string; mid: string; low: string }

export function interpret(d: DimensionCopy, v: number): string {
  if (v >= 75) return d.hi;
  if (v >= 50) return d.mid;
  return d.low;
}

// ── HIT B 핵심역량 ──
export const CORE_COPY: Record<string, DimensionCopy> = {
  problem_solving: {
    label: '문제해결', what: '문제를 정의하고, 원인을 찾고, 해결책을 만드는 힘',
    hi: '복잡한 상황에서도 핵심을 짚고 방향을 세웁니다. 팀 과제에서 "정리하는 사람"을 맡기 좋습니다.',
    mid: '익숙한 문제는 스스로 풀어냅니다. 낯선 문제를 만나면 원인 → 대안 → 검증 순서로 적어 보세요.',
    low: '문제 앞에서 막막함이 먼저 올 수 있어요. "무엇이 문제인가"를 한 문장으로 적는 연습부터 시작해 보세요.',
  },
  communication: {
    label: '소통', what: '내 생각을 상대가 이해하게 전하고, 상대의 말을 정확히 듣는 힘',
    hi: '말과 글로 생각을 분명하게 전합니다. 발표·설득·조율이 필요한 자리에서 힘을 냅니다.',
    mid: '1:1 대화는 편하게 해냅니다. 결론을 먼저 말하는 연습을 하면 발표와 보고가 훨씬 좋아집니다.',
    low: '생각은 있는데 꺼내기가 어려울 수 있어요. 회의 전에 말할 내용을 세 줄로 적어 가는 것부터 해 보세요.',
  },
  initiative: {
    label: '주도성', what: '시키기 전에 할 일을 찾고 먼저 움직이는 힘',
    hi: '기회를 보면 먼저 손을 듭니다. 새 프로젝트를 시작하고 끌고 가는 역할에 잘 맞습니다.',
    mid: '맡은 일은 책임 있게 해냅니다. 작은 것 하나를 먼저 제안해 보는 경험이 쌓이면 주도성이 자랍니다.',
    low: '분명한 지시가 있을 때 더 편할 수 있어요. 이번 주에 스스로 정한 작은 목표 하나를 끝내 보세요.',
  },
  collaboration: {
    label: '협업', what: '다른 사람과 역할을 나누고 함께 결과를 만드는 힘',
    hi: '팀 안에서 역할을 맞추고 분위기를 살립니다. 여러 사람이 함께하는 프로젝트에서 빛납니다.',
    mid: '함께 일하는 데 큰 어려움이 없습니다. 의견이 다를 때 상대 입장을 먼저 정리해 주면 신뢰가 커집니다.',
    low: '혼자 하는 편이 더 편할 수 있어요. 팀 과제에서 진행 상황을 먼저 공유하는 것부터 시작해 보세요.',
  },
  self_management: {
    label: '자기관리', what: '시간·에너지·감정을 스스로 관리해 꾸준히 해내는 힘',
    hi: '계획을 세우고 끝까지 지킵니다. 마감과 여러 일을 동시에 다루는 환경에서도 흔들림이 적습니다.',
    mid: '해야 할 일은 해냅니다. 하루 할 일을 아침에 세 개만 정해 두면 리듬이 더 안정됩니다.',
    low: '컨디션과 일정이 자주 흔들릴 수 있어요. 일주일 단위로 "꼭 할 일 한 가지"를 정하고 지켜 보세요.',
  },
  learning_agility: {
    label: '학습민첩성', what: '처음 하는 일을 빨리 배우고, 경험에서 교훈을 얻는 힘',
    hi: '새로운 도구와 일을 빠르게 익힙니다. 변화가 잦은 직무와 신입 시기에 큰 무기가 됩니다.',
    mid: '배우면 해냅니다. 해 본 일을 짧게 되돌아보는 기록을 남기면 배우는 속도가 붙습니다.',
    low: '처음 하는 일이 부담스러울 수 있어요. 새로 배울 것 하나를 작게 쪼개서 일주일에 한 조각씩 익혀 보세요.',
  },
};

export const INSIGHT_COPY: Record<string, DimensionCopy> = {
  self_understanding: {
    label: '자기 이해', what: '내 강점·가치·맞는 환경을 알고 설명할 수 있는 정도',
    hi: '내가 어떤 사람이고 무엇을 원하는지 분명합니다. 자기소개와 면접에서 설득력이 생깁니다.',
    mid: '대략은 알고 있습니다. HIT A 결과를 내 말로 세 문장 요약해 보면 훨씬 선명해집니다.',
    low: '아직 나를 설명할 말이 부족할 수 있어요. HIT A의 강점과 유형을 먼저 읽어 보는 것이 출발점입니다.',
  },
  job_understanding: {
    label: '직무 이해', what: '희망 직무가 실제로 하는 일·필요한 역량·성장 경로를 아는 정도',
    hi: '희망 직무를 구체적으로 압니다. 준비할 것과 우선순위를 스스로 정할 수 있습니다.',
    mid: '직무의 큰 그림은 압니다. 현직자 한 명에게 하루 일과를 들어 보면 이해가 깊어집니다.',
    low: '직무가 실제로 어떤 일인지 아직 흐릿할 수 있어요. 채용 공고 다섯 개를 모아 공통 요구 역량을 적어 보세요.',
  },
};

export const EFFICACY_INFO = {
  what: '효능감은 "이 분야의 일을 내가 해낼 수 있다"는 자신감입니다. HIT A의 흥미("끌린다")와 겹쳐 보면 어디에 힘을 쓸지 보입니다.',
};

export const HOLLAND_COPY: Record<string, { label: string; what: string }> = {
  R: { label: '현실형', what: '손과 도구로 무언가를 만들고 다루는 일' },
  I: { label: '탐구형', what: '분석하고 원리를 파고드는 일' },
  A: { label: '예술형', what: '새로운 것을 표현하고 창작하는 일' },
  S: { label: '사회형', what: '사람을 돕고 가르치고 연결하는 일' },
  E: { label: '진취형', what: '이끌고 설득하고 기회를 만드는 일' },
  C: { label: '관습형', what: '정리하고 체계를 세우고 꼼꼼히 관리하는 일' },
};

// ── HIT C ──
export const READINESS_COPY: Record<string, DimensionCopy> = {
  self: {
    label: '진로 자기 이해', what: '왜 이 직무인지, 나와 어떻게 맞는지 설명할 수 있는 정도',
    hi: '지원 동기를 내 경험으로 설명할 수 있습니다.', mid: '방향은 있습니다. "왜 이 직무인가"를 내 경험 하나와 연결해 적어 보세요.',
    low: '왜 이 직무인지 아직 말로 하기 어려울 수 있어요. HIT A·B 결과에서 근거를 찾아보세요.',
  },
  portfolio: {
    label: '포트폴리오', what: '내 역량을 보여 줄 결과물이 정리되어 있는 정도',
    hi: '보여 줄 결과물이 준비되어 있습니다.', mid: '결과물은 있습니다. 문제 → 내 역할 → 결과 순서로 한 장씩 정리해 보세요.',
    low: '보여 줄 결과물이 부족할 수 있어요. 학회·공모전·동아리 활동 하나를 결과물로 남기는 것부터 시작하세요.',
  },
  interview: {
    label: '면접', what: '내 경험을 질문에 맞게 말할 준비가 된 정도',
    hi: '경험을 질문에 맞춰 말할 준비가 되어 있습니다.', mid: '말할 거리는 있습니다. 예상 질문 다섯 개에 답을 소리 내어 연습해 보세요.',
    low: '면접 상황이 낯설 수 있어요. 1분 자기소개 하나를 완성하는 것부터 해 보세요.',
  },
  network: {
    label: '네트워킹', what: '희망 분야 사람들과 연결되어 정보와 조언을 얻는 정도',
    hi: '분야 사람들과 연결되어 정보를 얻고 있습니다.', mid: '아는 사람은 있습니다. 이번 달에 현직자 한 명에게 커피챗을 요청해 보세요.',
    low: '분야 사람을 만날 통로가 아직 없을 수 있어요. 학교 선배·동아리 OB 한 명에게 연락하는 것부터 시작하세요.',
  },
  skill_readiness: {
    label: '스킬 준비', what: '희망 직무에 필요한 도구·기술을 다룰 수 있는 정도',
    hi: '직무에 필요한 도구와 기술을 갖추고 있습니다.', mid: '기본은 갖췄습니다. 채용 공고에 자주 나오는 도구 하나를 실습 결과물로 남겨 보세요.',
    low: '필요한 기술이 아직 부족할 수 있어요. 공고 다섯 개에서 공통 도구를 찾아 하나부터 익혀 보세요.',
  },
  action_readiness: {
    label: '실행 준비', what: '지원·준비를 실제 행동으로 옮기고 있는 정도',
    hi: '준비를 행동으로 옮기고 있습니다.', mid: '움직이고는 있습니다. 주간 단위로 지원·준비 목표를 숫자로 정해 보세요.',
    low: '생각에 비해 행동이 늦을 수 있어요. 이번 주 할 일 한 가지를 정해 나의 저니 목표에 적어 보세요.',
  },
  track: {
    label: '직무 트랙 준비', what: '희망 직무 트랙에서 요구하는 준비를 갖춘 정도',
    hi: '희망 직무 트랙의 준비가 탄탄합니다.', mid: '트랙 준비가 진행 중입니다.', low: '트랙에 맞춘 준비를 더 쌓아 보세요.',
  },
};

export const ONBOARDING_COPY: Record<string, DimensionCopy> = {
  org_adaptation: {
    label: '조직 적응', what: '새 조직의 규칙·문화에 맞춰 자리 잡는 힘',
    hi: '새 환경에 빨리 자리 잡습니다.', mid: '적응에 큰 어려움은 없습니다. 첫 달에는 관찰하고 질문하는 시간을 의식적으로 가져 보세요.',
    low: '새 환경이 부담스러울 수 있어요. 입사 전 회사의 일하는 방식을 미리 알아 두면 도움이 됩니다.',
  },
  learning_speed: {
    label: '학습 속도', what: '업무를 빠르게 익히는 힘',
    hi: '업무를 빨리 익힙니다.', mid: '배우면 해냅니다. 배운 것을 바로 메모로 남기는 습관이 속도를 올립니다.',
    low: '처음엔 익히는 데 시간이 걸릴 수 있어요. 모르는 것을 모아 두었다가 한 번에 묻는 방법이 좋습니다.',
  },
  relationship_building: {
    label: '관계 형성', what: '동료·선배와 신뢰 관계를 만드는 힘',
    hi: '동료와 빠르게 신뢰를 쌓습니다.', mid: '관계를 무난하게 만듭니다. 먼저 인사하고 점심을 제안하는 작은 시도가 큰 차이를 만듭니다.',
    low: '먼저 다가가는 것이 어려울 수 있어요. 한 사람과 깊이 친해지는 것부터 목표로 해 보세요.',
  },
  feedback_acceptance: {
    label: '피드백 수용', what: '지적과 조언을 성장 재료로 받아들이는 힘',
    hi: '피드백을 성장의 재료로 씁니다.', mid: '피드백을 받아들입니다. 받은 피드백을 다음 결과물에 반영했는지 스스로 확인해 보세요.',
    low: '피드백이 상처로 느껴질 수 있어요. "무엇을 바꾸면 좋을까요?"라고 먼저 묻는 연습을 해 보세요.',
  },
};

export const DECISION_COPY: DimensionCopy = {
  label: '진로 결정 확신', what: '첫 직무를 분명히, 내 판단으로 정했는가',
  hi: '가고 싶은 방향이 분명하고 스스로 정했습니다.', mid: '방향은 정했지만 확신이 더 필요합니다. 직무 경험(인턴·프로젝트)으로 확인해 보세요.',
  low: '아직 방향을 고르는 중입니다. 괜찮습니다 — HIT A·B 결과의 "최적 영역"부터 좁혀 보세요.',
};

// ── HIT A ──
export const CH_COPY: Record<string, DimensionCopy> = {
  integrity: {
    label: '성실성', what: '맡은 일을 책임지고 끝까지 해내는 태도',
    hi: '약속과 마감을 지키는 사람으로 신뢰를 얻습니다.', mid: '맡은 일은 해냅니다. 마무리 점검 습관이 신뢰를 더 키웁니다.', low: '일정이 밀릴 때가 있을 수 있어요. 작은 약속부터 지키는 경험을 쌓아 보세요.',
  },
  relational: {
    label: '대인관계', what: '다른 사람을 배려하고 좋은 관계를 맺는 태도',
    hi: '사람들과 따뜻한 관계를 만듭니다.', mid: '관계를 무난하게 유지합니다.', low: '관계에서 에너지가 많이 들 수 있어요. 나와 잘 맞는 소수와의 관계부터 챙기세요.',
  },
  emotional: {
    label: '정서 안정', what: '압박과 변화 속에서 마음의 균형을 지키는 힘',
    hi: '압박 속에서도 차분함을 유지합니다.', mid: '대체로 안정적입니다. 지칠 때 회복하는 나만의 방법을 정해 두세요.', low: '스트레스에 쉽게 흔들릴 수 있어요. 쉬는 시간과 회복 루틴을 먼저 확보하세요.',
  },
  ethics: {
    label: '윤리성', what: '옳고 그름의 기준을 지키는 태도',
    hi: '원칙을 지키는 사람으로 신뢰받습니다.', mid: '기본 원칙을 지킵니다.', low: '상황에 따라 기준이 흔들릴 수 있어요. 나만의 원칙 세 가지를 적어 보세요.',
  },
  growth: {
    label: '성장 지향', what: '더 나아지려고 배우고 도전하는 태도',
    hi: '배우고 도전하는 데서 에너지를 얻습니다.', mid: '필요할 때 배웁니다. 분기마다 배울 것 하나를 정해 보세요.', low: '변화보다 안정이 편할 수 있어요. 아주 작은 새 시도 하나부터 해 보세요.',
  },
};

export const DISC_COPY: Record<string, { label: string; what: string }> = {
  D: { label: '주도형', what: '목표를 향해 빠르게 결정하고 밀어붙입니다' },
  I: { label: '사교형', what: '사람을 모으고 분위기를 띄우며 설득합니다' },
  S: { label: '안정형', what: '꾸준하고 차분하게 팀을 받쳐 줍니다' },
  C: { label: '신중형', what: '정확성과 기준을 중시하며 꼼꼼히 확인합니다' },
};

export const SPOWER_LABELS: Record<string, string> = {
  strategic: '전략적 사고', execution: '실행 추진력', creativity: '창의성', interpersonal: '대인관계',
  analytical: '분석적 판단', harmony: '조직 화합', breakthrough: '돌파 의지', guard: '원칙 수호',
};

/** 결과 단계(journey_stage) 표기 — 검사마다 같은 4단계 말 */
export const STAGE_LABELS: Record<string, string> = {
  ready: '출발 준비 완료', developing: '준비 진행 중', exploring: '탐색 단계', discovering: '발견 단계',
};
export const STAGE_DESC: Record<string, string> = {
  ready: '방향과 준비가 모두 갖춰졌습니다. 이제 실행에 집중할 때입니다.',
  developing: '방향은 잡혔고 준비가 진행 중입니다. 보완 영역을 채우면 다음 단계로 갑니다.',
  exploring: '여러 방향을 살펴보는 중입니다. 강점이 보이는 쪽부터 좁혀 가면 됩니다.',
  discovering: '나와 직무를 알아가는 출발점입니다. 지금 단계에서 가장 자연스러운 상태예요.',
};

/** 텍스트를 2문장 단위 문단으로 — 해설을 숨 쉬게 */
export function toParagraphs(text: string, perParagraph = 2): string[] {
  const clean = text.replace(/\r/g, '').trim();
  const blocks = clean.split(/\n{1,}/).map(s => s.trim()).filter(Boolean);
  const out: string[] = [];
  for (const b of blocks) {
    // 목록·소제목 줄(• - · 1. / '…:'로 끝남)은 그대로 한 줄
    if (/^[•\-·▪]|^\d+[.)]\s/.test(b) || /[:：]$/.test(b)) { out.push(b); continue; }
    const sentences = b.match(/[^.!?。]+[.!?。]+["”’)]*\s*|[^.!?。]+$/g)?.map(s => s.trim()).filter(Boolean) ?? [b];
    for (let i = 0; i < sentences.length; i += perParagraph) out.push(sentences.slice(i, i + perParagraph).join(' '));
  }
  return out;
}
