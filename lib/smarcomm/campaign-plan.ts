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

// Claude API 실패 시 규칙 기반 기획서 생성
export function generateFallbackPlan(scanResult: AnalysisResult): CampaignPlan {
  const actions: CampaignAction[] = [];
  let order = 1;

  // topIssues 기반 액션 생성
  for (const issue of scanResult.topIssues) {
    if (issue.title.includes('구조화 데이터')) {
      actions.push({
        order: order++,
        title: 'FAQ/HowTo 구조화 데이터(JSON-LD) 추가',
        channel: '사이트 개선',
        content_type: 'technical',
        description: '검색엔진과 AI가 콘텐츠를 더 잘 이해할 수 있도록 FAQ, HowTo, Organization 스키마를 JSON-LD 형식으로 추가합니다.',
        priority: 'high',
        auto_creatable: false,
      });
    }
    if (issue.title.includes('AI 검색') || issue.title.includes('GEO')) {
      actions.push({
        order: order++,
        title: 'AI 검색 최적화 콘텐츠 3편 작성',
        channel: '네이버 블로그',
        content_type: 'blog_post',
        description: '핵심 서비스/제품에 대한 상세 설명, 비교 분석, FAQ 형식의 블로그 글을 작성하여 AI 검색 엔진에서 인용될 가능성을 높입니다.',
        priority: 'high',
        auto_creatable: true,
      });
    }
    if (issue.title.includes('크롤링') || issue.title.includes('robots') || issue.title.includes('sitemap')) {
      actions.push({
        order: order++,
        title: 'robots.txt + sitemap.xml 생성',
        channel: '사이트 개선',
        content_type: 'technical',
        description: '검색엔진 크롤링 접근성을 개선하기 위해 robots.txt와 sitemap.xml을 생성하고 Search Console에 등록합니다.',
        priority: 'high',
        auto_creatable: false,
      });
    }
  }

  // 콘텐츠 SEO 문제 기반
  const ogIssue = scanResult.contentSeo.find(i => i.name.includes('OG') && i.status !== 'pass');
  if (ogIssue) {
    actions.push({
      order: order++,
      title: 'OG 태그 + 소셜 공유 이미지 설정',
      channel: '사이트 개선',
      content_type: 'technical',
      description: 'og:title, og:description, og:image를 설정하여 SNS 공유 시 매력적인 미리보기를 제공합니다.',
      priority: 'medium',
      auto_creatable: false,
    });
  }

  // 콘텐츠 갭 기반
  if (scanResult.deep?.contentGaps) {
    for (const gap of scanResult.deep.contentGaps.slice(0, 2)) {
      if (gap.topic !== 'OG 이미지') {
        actions.push({
          order: order++,
          title: `${gap.topic} 콘텐츠 제작`,
          channel: '사이트 개선',
          content_type: 'blog_post',
          description: `${gap.reason}. ${gap.suggestedFormat} 형식으로 제작을 권장합니다.`,
          priority: gap.priority,
          auto_creatable: true,
        });
      }
    }
  }

  // 최대 5개로 제한
  const finalActions = actions.slice(0, 5);

  // 가장 심각한 문제 찾기
  const mainIssue = scanResult.topIssues[0];
  const lowScore = scanResult.seoScore < scanResult.geoScore ? 'SEO' : 'GEO';

  return {
    id: Math.random().toString(36).substring(2, 10),
    created_at: new Date().toISOString(),
    scan_url: scanResult.url,
    generated_by: 'rule',

    background: {
      problem: mainIssue?.title || `${lowScore} 점수가 낮아 검색 노출에 불리합니다`,
      cause: mainIssue?.description || '웹사이트 최적화가 부족한 상태입니다',
      goal: `종합 점수 ${scanResult.totalScore}점 → 70점 이상 달성`,
    },

    strategy: {
      target_stage: scanResult.geoScore < 30 ? 'awareness' : 'consideration',
      approach: '기술적 SEO 개선 + AI 검색 최적화 콘텐츠 강화',
      duration: '4주',
      budget_suggestion: '₩0 (자체 개선)',
    },

    actions: finalActions,

    expected_outcome: `SEO ${scanResult.seoScore}점 → 80점, GEO ${scanResult.geoScore}점 → 40점 이상 개선 목표`,
  };
}
