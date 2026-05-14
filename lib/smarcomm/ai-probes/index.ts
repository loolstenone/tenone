// AIProbe 5 플랫폼 오케스트레이터
//
// 5 플랫폼을 병렬로 호출 → 표준 결과 합성 → Citability 점수 산출 + AI Visibility Map 데이터.

import type { Question, BrandContext } from '../question-bank';
import { buildQuestions, brandFromDomain } from '../question-bank';
import type { BrandFacts } from '../analyzers/fact-extractor';
import {
    type AIPlatform,
    type AIProbeReport,
    type PlatformResult,
    type ProbeAnswer,
    AI_PLATFORM_META,
} from './types';
import { probeClaude } from './claude';
import { probeChatGPT } from './chatgpt';
import { probePerplexity } from './perplexity';
import { probeNaverCue } from './naver-cue';
import { probeGoogleAIO } from './google-aio';

export async function runAIProbes(
    domain: string,
    siteTruth: BrandFacts | null,
    industry?: string,
): Promise<AIProbeReport> {
    const brand = brandFromDomain(domain);
    const ctx: BrandContext = { brand, industry, market: domain.endsWith('.kr') || domain.endsWith('.co.kr') ? 'kr' : 'global' };
    const questions = buildQuestions(ctx);

    // 5 플랫폼 병렬 호출 — 키 없는 것은 자동 skip
    const [claude, chatgpt, perplexity, naverCue, googleAIO] = await Promise.all([
        probeClaude(questions, brand, siteTruth),
        probeChatGPT(questions, brand, siteTruth),
        probePerplexity(questions, brand, siteTruth),
        probeNaverCue(questions, brand, siteTruth),
        probeGoogleAIO(questions, brand, siteTruth),
    ]);

    const platforms: Record<AIPlatform, PlatformResult> = {
        'claude': claude,
        'chatgpt': chatgpt,
        'perplexity': perplexity,
        'naver-cue': naverCue,
        'google-aio': googleAIO,
    };

    // Citability 점수 — 활성 플랫폼 평균 mentionRate × 가중치
    const activePlatforms = Object.values(platforms).filter(p => !p.skipped);
    const avgMentionRate = activePlatforms.length > 0
        ? activePlatforms.reduce((s, p) => s + p.summary.mentionRate, 0) / activePlatforms.length
        : 0;
    // 활성 플랫폼이 1개뿐이면 신뢰도 ↓ (실측 부족) — 5점 만점 중 비례 가산
    const platformConfidence = activePlatforms.length / 5;
    const citabilityScore = Math.round(avgMentionRate * 70 + platformConfidence * 30);

    // 카테고리별 노출 — AI Visibility Map용
    const allAnswers: ProbeAnswer[] = activePlatforms.flatMap(p => p.answers);
    const categories = Array.from(new Set(allAnswers.map(a => a.category)));
    const byCategory = categories.map(cat => {
        const inCat = allAnswers.filter(a => a.category === cat);
        const mentioned = inCat.filter(a => a.detection.mentioned);
        const platformsMentioned = Array.from(new Set(mentioned.map(a => a.platform)));
        return {
            category: cat,
            mentionRate: inCat.length > 0 ? mentioned.length / inCat.length : 0,
            platformsMentioned,
        };
    }).sort((a, b) => b.mentionRate - a.mentionRate);

    return {
        brand,
        questions,
        platforms,
        citabilityScore,
        byCategory,
    };
}

export { AI_PLATFORM_META };
export type { AIPlatform, AIProbeReport, PlatformResult, ProbeAnswer };
