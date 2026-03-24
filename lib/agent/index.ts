/**
 * Ten:One™ AI 에이전트 — 메인 진입점
 * 지시 파싱 → 리서치 → 생성 → 분기 → 게시
 */
import { research, type ResearchResult } from './researcher';
import { generateContent, type GeneratedContent } from './writer';
import { routeContent, type RouteResult } from './router';
import { publishContent, type PublishResult } from './publisher';
import type { SiteCode } from '@/types/board';

// ── 타입 ──

export type AgentPhase = 'parsing' | 'researching' | 'generating' | 'routing' | 'reviewing' | 'publishing' | 'done' | 'error';

export interface AgentTask {
    id: string;
    instruction: string;
    phase: AgentPhase;
    site?: SiteCode;
    board?: string;
    topic?: string;
    researchOnly: boolean;
    autoPublish: boolean;
    research?: ResearchResult;
    content?: GeneratedContent;
    route?: RouteResult;
    publish?: PublishResult;
    error?: string;
    createdAt: string;
    updatedAt: string;
    tokenUsage: { input: number; output: number };
}

export interface ParsedInstruction {
    topic: string;
    site?: SiteCode;
    board?: string;
    researchOnly: boolean;
    multiSites?: SiteCode[];
    model?: string;
}

// ── 지시 파싱 ──

const SITE_KEYWORDS: Record<string, SiteCode> = {
    '텐원': 'tenone', 'tenone': 'tenone',
    '매드리그': 'madleague', 'madleague': 'madleague',
    '매드립': 'madleap', 'madleap': 'madleap',
    '유인원': 'youinone', 'youinone': 'youinone',
    '바닥': 'badak', 'badak': 'badak',
    '히어로': 'hero', 'hero': 'hero',
    '공감자': 'ogamja', '0gamja': 'ogamja', 'ogamja': 'ogamja',
    'fwn': 'fwn',
};

export function parseInstruction(instruction: string): ParsedInstruction {
    const lower = instruction.toLowerCase();

    // 리서치만 요청인지
    const researchOnly = /리서치만|검색만|조사만|찾아만/.test(instruction);

    // 사이트 감지
    let site: SiteCode | undefined;
    const multiSites: SiteCode[] = [];

    for (const [keyword, code] of Object.entries(SITE_KEYWORDS)) {
        if (lower.includes(keyword)) {
            if (!site) site = code;
            if (!multiSites.includes(code)) multiSites.push(code);
        }
    }

    // 멀티 사이트 감지 ("둘 다 올려", "모두 올려")
    const isMulti = /둘\s*다|모두|전부/.test(instruction);

    // 토픽 추출 — 사이트명/동사 등 제거 후 핵심 주제
    let topic = instruction;
    // 사이트 관련 키워드 제거
    for (const keyword of Object.keys(SITE_KEYWORDS)) {
        topic = topic.replace(new RegExp(keyword, 'gi'), '');
    }
    // 지시 동사 제거
    topic = topic
        .replace(/에\s*(올려|게시|발행|작성|써)[줘주]*/g, '')
        .replace(/(찾아|검색|조사|리서치)[줘주서]*/g, '')
        .replace(/(만들어|생성|작성)[줘주]*/g, '')
        .replace(/(블로그|게시판|사이트)/g, '')
        .replace(/할\s*만한|도움될\s*만한|올릴\s*만한/g, '')
        .replace(/요즘\s*뜨는|최근/g, '')
        .replace(/콘텐츠|글|포스트/g, '')
        .replace(/에\s*대해/g, '')
        .trim()
        .replace(/\s+/g, ' ');

    // 모델 선택
    let model: string | undefined;
    if (/고품질|상세|opus/i.test(instruction)) {
        model = 'claude-opus-4-6';
    }

    return {
        topic: topic || instruction,
        site: isMulti ? undefined : site,
        researchOnly,
        multiSites: isMulti ? multiSites : undefined,
        model,
    };
}

// ── 에이전트 실행 ──

export async function runAgent(
    instruction: string,
    onPhaseChange?: (phase: AgentPhase, data?: Partial<AgentTask>) => void,
): Promise<AgentTask> {
    const task: AgentTask = {
        id: crypto.randomUUID(),
        instruction,
        phase: 'parsing',
        researchOnly: false,
        autoPublish: process.env.AGENT_AUTO_PUBLISH === 'true',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tokenUsage: { input: 0, output: 0 },
    };

    const updatePhase = (phase: AgentPhase, data?: Partial<AgentTask>) => {
        task.phase = phase;
        task.updatedAt = new Date().toISOString();
        if (data) Object.assign(task, data);
        onPhaseChange?.(phase, task);
    };

    try {
        // 1. 지시 파싱
        updatePhase('parsing');
        const parsed = parseInstruction(instruction);
        task.topic = parsed.topic;
        task.site = parsed.site;
        task.researchOnly = parsed.researchOnly;

        // 2. 리서치
        updatePhase('researching');
        const researchResult = await research(parsed.topic);
        task.research = researchResult;

        // 리서치만 요청인 경우
        if (parsed.researchOnly) {
            updatePhase('done', { research: researchResult });
            return task;
        }

        // 3. 콘텐츠 생성
        updatePhase('generating');
        const targetSite = parsed.site || 'tenone';
        const content = await generateContent(targetSite, researchResult, parsed.model);
        task.content = content;

        // 4. 사이트 분기
        updatePhase('routing');
        const route = await routeContent(
            content.title,
            content.excerpt,
            parsed.site,
            parsed.board,
        );
        task.route = route;

        // 5. 리뷰 대기 (autoPublish가 false면 여기서 멈춤)
        if (!task.autoPublish) {
            updatePhase('reviewing');
            return task;
        }

        // 6. 게시
        updatePhase('publishing');
        const publishResult = await publishContent(content, route);
        task.publish = publishResult;

        updatePhase('done');
        return task;

    } catch (error) {
        task.error = error instanceof Error ? error.message : 'Unknown error';
        updatePhase('error');
        return task;
    }
}

/**
 * 리뷰 후 게시 실행
 */
export async function confirmAndPublish(
    task: AgentTask,
    asDraft = false,
): Promise<PublishResult> {
    if (!task.content || !task.route) {
        return { success: false, error: 'No content or route to publish' };
    }

    const result = await publishContent(task.content, task.route, asDraft);
    task.publish = result;
    task.phase = result.success ? 'done' : 'error';
    return result;
}

/**
 * 멀티 사이트 게시
 */
export async function publishToMultipleSites(
    task: AgentTask,
    sites: SiteCode[],
    asDraft = false,
): Promise<PublishResult[]> {
    if (!task.content) {
        return [{ success: false, error: 'No content to publish' }];
    }

    const results: PublishResult[] = [];
    for (const site of sites) {
        const route: RouteResult = {
            site,
            board: task.route?.board || 'insights',
            reason: 'multi-site publish',
        };
        const result = await publishContent(task.content, route, asDraft);
        results.push(result);
    }

    return results;
}
