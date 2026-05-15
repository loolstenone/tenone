// AI 캠페인 기획서 타입 + 규칙 기반 Fallback 생성

import type { AnalysisResult } from './seo-analyzer';

export interface CampaignPlan {
  id: string;
  created_at: string;
  scan_url: string;
  generated_by: 'ai' | 'rule';

  background: {
    problem: string;
    cause: string;
    goal: string;
  };

  strategy: {
    target_stage: string;
    approach: string;
    duration: string;
    budget_suggestion: string;
  };

  actions: CampaignAction[];

  expected_outcome: string;
}

export interface CampaignAction {
  order: number;
  title: string;
  channel: string;
  content_type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  auto_creatable: boolean;
}

// Claude API 프롬프트
export function buildCampaignPrompt(scanResult: AnalysisResult): string {
  const issues = scanResult.topIssues.map(i => `- [${i.severity}] ${i.title}: ${i.description}`).join('\n');
  const seoItems = [...scanResult.techSeo, ...scanResult.contentSeo]
    .filter(i => i.status !== 'pass')
    .map(i => `- ${i.name}: ${i.description} → ${i.action}`)
    .join('\n');
  const geoItems = scanResult.geoChecks
    .map(c => `- ${c.platform}: ${c.mentioned ? '노출' : '미노출'} — ${c.details}`)
    .join('\n');
  const perfInfo = scanResult.performance
    ? `PageSpeed: ${scanResult.performance.score}/100, LCP: ${(scanResult.performance.lcp / 1000).toFixed(1)}s, CLS: ${scanResult.performance.cls}, TBT: ${scanResult.performance.tbt}ms`
    : `응답시간: ${scanResult.fetchTime}ms`;

  return `당신은 디지털 마케팅 전략가입니다. 아래 웹사이트 SEO/GEO 진단 결과를 분석하고, 구체적인 마케팅 캠페인 기획서를 JSON으로 작성하세요.

## 진단 대상
URL: ${scanResult.url}
종합 점수: ${scanResult.totalScore}/100 (SEO: ${scanResult.seoScore}, GEO: ${scanResult.geoScore}, 성능: ${scanResult.performanceScore})
등급: ${scanResult.grade}

## 상위 이슈
${issues}

## SEO 개선 필요 항목
${seoItems}

## AI 검색 노출 현황
${geoItems}

## 성능
${perfInfo}

## 요청
위 진단 결과를 기반으로 가장 효과적인 마케팅 캠페인 기획서를 작성하세요.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "background": {
    "problem": "가장 심각한 문제 1문장",
    "cause": "문제의 원인 1문장",
    "goal": "달성 목표 1문장 (구체적 수치 포함)"
  },
  "strategy": {
    "target_stage": "awareness|interest|consideration|purchase|retention",
    "approach": "전략 요약 1문장",
    "duration": "기간 (예: 2주)",
    "budget_suggestion": "예산 제안 (예: ₩500,000)"
  },
  "actions": [
    {
      "order": 1,
      "title": "구체적 액션 제목",
      "channel": "네이버 블로그|Google Ads|Meta|인스타그램|카카오|이메일|사이트 개선",
      "content_type": "blog_post|ad_copy|sns_post|email|landing_page|technical",
      "description": "상세 설명 2-3문장",
      "priority": "high|medium|low",
      "auto_creatable": true
    }
  ],
  "expected_outcome": "예상 효과 1문장"
}

actions는 3~5개, 우선순위가 높은 것부터 정렬. 한국어로 작성.`;
}

// V2.1 § 1.10 정직 원칙 — `generateFallbackPlan` 함수 완전 제거 (2026-05-15).
// Claude API 실패/키 없을 때 규칙 기반 가짜 기획서 반환은 정직하지 못함.
// advisor/campaign-plan API는 503/502 반환 + 사용자 안내.
