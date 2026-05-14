// 네이버 Cue Probe — 공식 API 없음, 헤드리스 또는 N/A
//
// Naver Cue 검색은 공식 API 미공개 (2026-05 기준).
// 옵션 1: Playwright/Puppeteer 헤드리스 (서버사이드 자원 큼)
// 옵션 2: 일단 N/A 표시, Phase 4에서 검토
//
// 현재: 항상 skipped 반환.

import type { Question } from '../question-bank';
import type { BrandFacts } from '../analyzers/fact-extractor';
import { type PlatformResult, skippedPlatform } from './types';

export async function probeNaverCue(
    _questions: Question[],
    _brand: string,
    _siteTruth: BrandFacts | null,
    _apiKey?: string,
): Promise<PlatformResult> {
    return skippedPlatform(
        'naver-cue',
        '네이버 Cue 공식 API 없음 — Phase 4 헤드리스 구현 검토 중'
    );
}
