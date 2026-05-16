// SmarComm AIRM SSOT — V2.0 § 3-C
//
// 발견(Detection) 자동 분류 + 교정(Cleansing) 액션 매핑 로직.
// scan API가 호출해서 AI Probe 응답을 분석 → 자동 flag 생성.

import type { ProbeAnswer } from './ai-probes/types';

export type FlagType =
    | 'negative_sentiment'
    | 'wrong_fact'
    | 'competitor_confusion'
    | 'missing_brand'
    | 'outdated_info';

export type FlagSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FlagStatus = 'open' | 'in_review' | 'in_action' | 'verified_fixed' | 'wont_fix' | 'duplicate';

export interface DetectedFlag {
    flag_type: FlagType;
    severity: FlagSeverity;
    confidence: number;
    platform: string;
    query: string;
    response_excerpt: string;
    notes?: string;
}

export type ActionType =
    | 'update_wiki'
    | 'press_release'
    | 'media_interview'
    | 'schema_update'
    | 'social_response'
    | 'remove_old_content'
    | 'submit_correction'
    | 'create_content'
    | 'other';

export type AssigneeRole = 'marketer' | 'dev' | 'writer' | 'designer' | 'partner_team';

export interface SuggestedAction {
    action_type: ActionType;
    title: string;
    description: string;
    role: AssigneeRole;
    expected_axis: 'awareness' | 'depth' | 'trust' | 'sentiment';
    expected_impact: number; // 0~50
}

// ── Flag 유형 메타 ──
export const FLAG_TYPE_META: Record<FlagType, { label: string; icon: string; defaultSeverity: FlagSeverity; tip: string }> = {
    negative_sentiment:   { label: '부정 답변',       icon: '⚠️', defaultSeverity: 'high',     tip: 'AI가 우리 브랜드에 부정적 톤으로 응답' },
    wrong_fact:           { label: '사실 오류',       icon: '❌', defaultSeverity: 'critical', tip: 'AI가 잘못된 가격·기능·정체성 정보 제공' },
    competitor_confusion: { label: '경쟁사 혼동',     icon: '🔀', defaultSeverity: 'high',     tip: 'AI가 경쟁사와 우리를 혼동' },
    missing_brand:        { label: '누락',            icon: '👻', defaultSeverity: 'medium',   tip: '마땅히 언급되어야 할 응답에서 누락' },
    outdated_info:        { label: '옛 정보',         icon: '🕰️', defaultSeverity: 'medium',   tip: 'AI가 옛 정보(이전 정책·구버전)를 제공' },
};

export const FLAG_STATUS_META: Record<FlagStatus, { label: string; color: string }> = {
    open:           { label: '신규 발견',  color: '#DC2626' },
    in_review:      { label: '검토 중',    color: '#F59E0B' },
    in_action:      { label: '교정 중',    color: '#3B82F6' },
    verified_fixed: { label: '검증 완료',  color: '#10B981' },
    wont_fix:       { label: '미처리 결정', color: '#6B7280' },
    duplicate:      { label: '중복',       color: '#9CA3AF' },
};

export const SEVERITY_META: Record<FlagSeverity, { label: string; color: string }> = {
    low:      { label: '낮음',  color: '#6B7280' },
    medium:   { label: '보통',  color: '#F59E0B' },
    high:     { label: '높음',  color: '#EA580C' },
    critical: { label: '심각',  color: '#DC2626' },
};

export const ACTION_TYPE_META: Record<ActionType, { label: string; icon: string }> = {
    update_wiki:         { label: '위키 갱신',      icon: '📚' },
    press_release:       { label: '보도자료 배포',   icon: '📰' },
    media_interview:     { label: '매체 인터뷰',     icon: '🎙️' },
    schema_update:       { label: 'Schema 갱신',     icon: '🔧' },
    social_response:     { label: '소셜 대응',       icon: '💬' },
    remove_old_content:  { label: '옛 콘텐츠 정리',  icon: '🗑️' },
    submit_correction:   { label: '정정 요청',       icon: '✉️' },
    create_content:      { label: '신규 콘텐츠',     icon: '✍️' },
    other:               { label: '기타',           icon: '🔗' },
};

// ── AI Probe 응답에서 자동 flag 생성 ──
// scan API에서 호출. AI Probe 결과 배열 → flag 후보 배열
export function detectFlagsFromProbes(answers: ProbeAnswer[]): DetectedFlag[] {
    const flags: DetectedFlag[] = [];

    for (const a of answers) {
        const d = a.detection;
        const excerpt = a.rawResponse.slice(0, 500);

        // ① 부정 sentiment + mentioned — § 1.10 정직 원칙: LLM 실측만 flag 생성
        if (
            d.mentioned &&
            d.analysisSource === 'llm' &&
            d.sentiment === 'negative' &&
            (d.sentimentConfidence ?? 0) > 0.5
        ) {
            flags.push({
                flag_type: 'negative_sentiment',
                severity: (d.sentimentConfidence ?? 0) > 0.8 ? 'critical' : 'high',
                confidence: d.sentimentConfidence ?? 0.5,
                platform: a.platform,
                query: a.query,
                response_excerpt: excerpt,
                notes: `LLM 분류 — sentiment=negative, confidence=${((d.sentimentConfidence ?? 0) * 100).toFixed(0)}%`,
            });
        }

        // ② 사실 오류 — wrong fact
        if (d.mentioned && d.factComparison && d.factComparison.some(c => c.match === 'wrong')) {
            const wrongs = d.factComparison.filter(c => c.match === 'wrong');
            flags.push({
                flag_type: 'wrong_fact',
                severity: wrongs.length >= 2 ? 'critical' : 'high',
                confidence: 0.85,
                platform: a.platform,
                query: a.query,
                response_excerpt: excerpt,
                notes: `잘못된 사실: ${wrongs.map(w => `${w.field}(사이트:${w.siteValue ?? '?'} → AI:${w.aiValue ?? '?'})`).join(', ').slice(0, 200)}`,
            });
        }

        // ③ 누락 — brand_direct 카테고리인데 미언급
        if (a.category === 'brand_direct' && !d.mentioned) {
            flags.push({
                flag_type: 'missing_brand',
                severity: 'medium',
                confidence: 0.9,
                platform: a.platform,
                query: a.query,
                response_excerpt: excerpt,
                notes: '브랜드 직접 질문에 답변 누락',
            });
        }

        // ④ 경쟁사 혼동 — competitor 카테고리이고 응답에 경쟁사 이름이 우리 자리에 있을 때
        // (간단 휴리스틱: competitor 카테고리 + 우리 미언급 + 응답에 'vs' 후 다른 브랜드명)
        // TODO Phase 5 — 경쟁사 사전 매핑 + 의미 분석

        // ⑤ outdated — 응답에 "2022", "2023" 등 옛 연도 표현 + 우리 정보 (Phase 5)
    }

    return flags;
}

// ── 플래그 → 권장 액션 매핑 ──
/**
 * @deprecated V2.1 § 1.10 정직 원칙 — 5 flag_type × 2~3 action 임의 매핑은 휴리스틱.
 * 신규 코드는 `suggestActionsLLM`을 사용 (Claude Haiku로 flag 컨텍스트 기반 추천).
 */
export function suggestActions(flag: DetectedFlag): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    switch (flag.flag_type) {
        case 'negative_sentiment':
            actions.push({
                action_type: 'social_response',
                title: '부정 답변 출처 추적 및 공식 대응',
                description: '부정 정보의 원본을 추적(커뮤니티·리뷰)하고 공식 채널에서 해명 또는 정정 요청',
                role: 'marketer',
                expected_axis: 'sentiment',
                expected_impact: 25,
            });
            actions.push({
                action_type: 'press_release',
                title: '긍정 사실 강화 — 보도자료/케이스 스터디',
                description: '부정 답변을 압도할 만한 긍정 신호를 권위 매체에 노출',
                role: 'writer',
                expected_axis: 'sentiment',
                expected_impact: 20,
            });
            break;

        case 'wrong_fact':
            actions.push({
                action_type: 'schema_update',
                title: 'JSON-LD Schema 갱신으로 사실 명시',
                description: 'Organization·Service Entity의 정확한 가격·기능·소개를 Schema.org 표준으로 사이트 head에 삽입',
                role: 'dev',
                expected_axis: 'depth',
                expected_impact: 30,
            });
            actions.push({
                action_type: 'update_wiki',
                title: '위키피디아·기업 정보 사이트 정정',
                description: '잘못된 정보가 등재된 외부 매체 찾아 정정 요청',
                role: 'marketer',
                expected_axis: 'depth',
                expected_impact: 25,
            });
            actions.push({
                action_type: 'create_content',
                title: '공식 FAQ/About 페이지 보강',
                description: '잘못 알려진 사실을 명확히 답하는 FAQ·About 항목 추가 (FAQPage Schema 동반)',
                role: 'writer',
                expected_axis: 'depth',
                expected_impact: 15,
            });
            break;

        case 'competitor_confusion':
            actions.push({
                action_type: 'create_content',
                title: '경쟁사 비교 콘텐츠 작성',
                description: '"X vs 우리 브랜드" 비교 콘텐츠로 차별점·강점 명확히',
                role: 'writer',
                expected_axis: 'trust',
                expected_impact: 20,
            });
            actions.push({
                action_type: 'schema_update',
                title: 'Organization sameAs 보강',
                description: '공식 SNS·등재 사이트 URL을 Organization.sameAs에 추가 — Entity 정체성 강화',
                role: 'dev',
                expected_axis: 'depth',
                expected_impact: 15,
            });
            break;

        case 'missing_brand':
            actions.push({
                action_type: 'press_release',
                title: '권위 매체 노출 강화',
                description: '업종 직접 검색에서 누락 → 뉴스·매거진·디렉토리 등재 시도',
                role: 'marketer',
                expected_axis: 'awareness',
                expected_impact: 30,
            });
            actions.push({
                action_type: 'create_content',
                title: '브랜드 직접 키워드 페이지 제작',
                description: '브랜드명 + 정체성을 명확히 답하는 단일 페이지 (Organization Schema 포함)',
                role: 'writer',
                expected_axis: 'awareness',
                expected_impact: 20,
            });
            break;

        case 'outdated_info':
            actions.push({
                action_type: 'remove_old_content',
                title: '옛 콘텐츠 archive/리다이렉트',
                description: '옛 정보가 있는 페이지를 301 리다이렉트 또는 noindex 처리',
                role: 'dev',
                expected_axis: 'depth',
                expected_impact: 15,
            });
            actions.push({
                action_type: 'press_release',
                title: '최신 정보 재배포',
                description: '최신 상품·정책·인물 정보를 새 보도자료로 권위 매체 배포',
                role: 'writer',
                expected_axis: 'depth',
                expected_impact: 20,
            });
            break;
    }

    return actions;
}

// ─────────────────────────────────────────────────────────────
// V2.1 § 1.10 정직 — LLM 기반 액션 추천
//
// 휴리스틱 suggestActions 폐기. Claude Haiku에게 flag 컨텍스트 주고 추천.
// 비용: ~$0.001/flag (작은 호출)
// API 키 없으면 null — UI에서 "LLM 미가용" 안내
// ─────────────────────────────────────────────────────────────

const AIRM_SYSTEM_PROMPT = `당신은 마케팅 평판 관리 전문가입니다.
AI가 우리 브랜드에 대해 보인 부정·오답·혼동·누락·옛정보 답변 1건을 보고
교정 액션 1~3개를 추천합니다.

반드시 다음 JSON으로만 응답 (코드 펜스 불필요):
{
  "actions": [
    {
      "action_type": "update_wiki" | "press_release" | "media_interview" | "schema_update" | "social_response" | "remove_old_content" | "submit_correction" | "create_content" | "other",
      "title": "한 줄 액션 제목 (≤40자)",
      "description": "구체적 실행 방법 (≤120자)",
      "role": "marketer" | "dev" | "writer" | "designer" | "partner_team",
      "expected_axis": "awareness" | "depth" | "trust" | "sentiment",
      "expected_impact": 5~40,
      "reason": "왜 이 액션이 효과적인지 한 줄 (≤80자)"
    }
  ]
}

지침:
- flag_type별 적합한 액션 선택 (wrong_fact → schema_update·update_wiki, negative_sentiment → social_response·press_release 등)
- expected_impact: SmarComm Index 점수 변화 추정 (보수적, 5~40)
- 역할은 액션 성격에 맞게 (코드 = dev, 외부 매체 = marketer, 문구 = writer)`;

interface LlmAirmResponse {
    actions?: unknown[];
}

export interface SuggestedActionLlm extends SuggestedAction {
    reason: string;
    source: 'llm';
}

export async function suggestActionsLLM(
    flag: DetectedFlag,
    brand: string,
    apiKey?: string,
): Promise<SuggestedActionLlm[] | null> {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) return null;

    // dynamic import — server-only로 클라이언트 번들 분리
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: key });

    const flagMeta = FLAG_TYPE_META[flag.flag_type];

    try {
        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 800,
            system: AIRM_SYSTEM_PROMPT,
            messages: [{
                role: 'user',
                content: `BRAND: "${brand}"

FLAG:
- type: ${flag.flag_type} (${flagMeta.label})
- severity: ${flag.severity}
- platform: ${flag.platform}
- query: "${flag.query}"
- 응답 단편: ${flag.response_excerpt.slice(0, 400)}
${flag.notes ? `- notes: ${flag.notes}` : ''}

위 플래그를 해소할 교정 액션 1~3개를 JSON으로 답하세요.`,
            }],
        });

        const text = response.content
            .filter((b): b is Extract<typeof response.content[number], { type: 'text' }> => b.type === 'text')
            .map(b => b.text).join('');

        const parsed = parseJsonRobustAirm<LlmAirmResponse>(text);
        if (!parsed || !Array.isArray(parsed.actions)) return null;

        const validActionType: ActionType[] = ['update_wiki', 'press_release', 'media_interview', 'schema_update', 'social_response', 'remove_old_content', 'submit_correction', 'create_content', 'other'];
        const validRole: AssigneeRole[] = ['marketer', 'dev', 'writer', 'designer', 'partner_team'];
        const validAxis = ['awareness', 'depth', 'trust', 'sentiment'] as const;

        return parsed.actions
            .map(a => {
                if (typeof a !== 'object' || a === null) return null;
                const o = a as Record<string, unknown>;
                const action_type = typeof o.action_type === 'string' && validActionType.includes(o.action_type as ActionType)
                    ? o.action_type as ActionType
                    : 'other';
                const role = typeof o.role === 'string' && validRole.includes(o.role as AssigneeRole)
                    ? o.role as AssigneeRole
                    : 'marketer';
                const expected_axis = typeof o.expected_axis === 'string' && validAxis.includes(o.expected_axis as typeof validAxis[number])
                    ? o.expected_axis as typeof validAxis[number]
                    : 'awareness';
                const title = typeof o.title === 'string' ? o.title.slice(0, 80) : '';
                if (!title) return null;
                return {
                    action_type,
                    title,
                    description: typeof o.description === 'string' ? o.description.slice(0, 200) : '',
                    role,
                    expected_axis,
                    expected_impact: typeof o.expected_impact === 'number'
                        ? Math.max(5, Math.min(40, Math.round(o.expected_impact)))
                        : 15,
                    reason: typeof o.reason === 'string' ? o.reason.slice(0, 200) : '',
                    source: 'llm' as const,
                };
            })
            .filter((a): a is SuggestedActionLlm => a !== null);
    } catch (err) {
        console.error('[suggestActionsLLM] failed:', (err as Error).message);
        return null;
    }
}

function parseJsonRobustAirm<T>(text: string): T | null {
    try { return JSON.parse(text) as T; } catch { /* continue */ }
    const fence = text.match(/```(?:json)?\s*([\s\S]+?)```/);
    if (fence) {
        try { return JSON.parse(fence[1].trim()) as T; } catch { /* continue */ }
    }
    const block = text.match(/\{[\s\S]+\}/);
    if (block) {
        try { return JSON.parse(block[0]) as T; } catch { /* fall through */ }
    }
    return null;
}
