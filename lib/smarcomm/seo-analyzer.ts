// 실제 HTML을 분석하여 SEO 점수를 산출하는 엔진
import Anthropic from '@anthropic-ai/sdk';
import { analyzeSchema, scoreSchema } from './analyzers/schema-validator';
import { fetchObservatoryGrade, scoreObservatory } from './analyzers/mozilla-observatory';

export interface AnalysisItem {
  name: string;
  score: number;
  maxScore: number;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  action: string;
}

export interface GeoCheckResult {
  platform: string;
  mentioned: boolean;
  details: string;
  /** V2.1 정직성 — true면 측정 불가(API 키 없음 등). Citability 분모 산입에서 제외 */
  skipped?: boolean;
}

export interface KeywordInsight {
  keyword: string;
  relevance: 'high' | 'medium' | 'low';
  found: boolean;
  suggestion: string;
}

export interface ContentGap {
  topic: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedFormat: string;
}

export interface DeepAnalysis {
  keywords: KeywordInsight[];
  contentGaps: ContentGap[];
  competitorHints: string[];
  actionPlan: { priority: number; category: string; action: string; impact: string; effort: string }[];
  pageDetails: {
    title: string;
    metaDescription: string;
    h1List: string[];
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonical: string;
    lang: string;
    imgCount: number;
    imgWithAlt: number;
    linkCount: number;
    textLength: number;
  };
}

export interface PerformanceData {
  score: number;               // 0~100
  lcp: number;                 // ms (Largest Contentful Paint)
  cls: number;                 // 점수 (Cumulative Layout Shift)
  tbt: number;                 // ms (Total Blocking Time, lab)
  fcp: number;                 // ms (First Contentful Paint)
  si: number;                  // ms (Speed Index)
  inp?: number | null;         // ms (Interaction to Next Paint) — Core Web Vitals 2024, CrUX field data
  inpSource?: 'field' | 'lab' | null;  // 측정 방식
}

export interface SubPageResult {
  url: string;
  title: string;
  hasMetaDescription: boolean;
  hasH1: boolean;
  textLength: number;
  imgCount: number;
  imgWithAlt: number;
  statusCode: number;
  issues: string[];
}

export interface AnalysisResult {
  url: string;
  faviconUrl: string;
  fetchTime: number;
  statusCode: number;
  totalScore: number;
  seoScore: number;
  geoScore: number;
  performanceScore: number;    // 0~100 (PageSpeed)
  grade: 'excellent' | 'good' | 'needs_work' | 'critical';
  techSeo: AnalysisItem[];
  contentSeo: AnalysisItem[];
  geoChecks: GeoCheckResult[];
  geoReadiness: AnalysisItem[];
  topIssues: { severity: 'high' | 'medium' | 'low'; title: string; description: string; action: string }[];
  deep?: DeepAnalysis;
  performance?: PerformanceData;
  subPages?: SubPageResult[];
  pagesAnalyzed?: number;
}

export interface AnalyzeOptions {
  pageSpeedApiKey?: string;
  anthropicApiKey?: string;
}

// --- 다중 페이지 크롤링 ---
function extractInternalLinks(html: string, baseUrl: string): string[] {
  const links: Set<string> = new Set();
  const origin = new URL(baseUrl).origin;
  const regex = /<a[^>]*href=["']([^"'#]*?)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let href = match[1].trim();
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
    try {
      const resolved = new URL(href, baseUrl).toString();
      if (resolved.startsWith(origin) && !resolved.match(/\.(jpg|jpeg|png|gif|svg|pdf|zip|css|js|ico|woff|woff2|ttf|eot)(\?|$)/i)) {
        // 중복/앵커/쿼리 제거
        const clean = resolved.split('?')[0].split('#')[0].replace(/\/$/, '');
        if (clean !== baseUrl.replace(/\/$/, '')) links.add(clean);
      }
    } catch {}
  }
  return Array.from(links).slice(0, 10); // 최대 10개 링크 추출
}

async function analyzeSubPage(url: string): Promise<SubPageResult | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SmarComm-Scanner/1.0)', 'Accept': 'text/html,*/*' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return { url, title: '', hasMetaDescription: false, hasH1: false, textLength: 0, imgCount: 0, imgWithAlt: 0, statusCode: res.status, issues: [`HTTP ${res.status}`] };

    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const hasMetaDesc = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html);
    const hasH1 = /<h1[^>]*>/i.test(html);
    const textOnly = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const imgCount = (html.match(/<img[^>]*>/gi) || []).length;
    const imgWithAlt = (html.match(/<img[^>]*alt=["'][^"']+["']/gi) || []).length;

    const issues: string[] = [];
    if (!title) issues.push('타이틀 없음');
    if (!hasMetaDesc) issues.push('메타 설명 없음');
    if (!hasH1) issues.push('H1 없음');
    if (textOnly.length < 300) issues.push('콘텐츠 부족');
    if (imgCount > 0 && imgWithAlt < imgCount / 2) issues.push('이미지 ALT 부족');

    return { url, title, hasMetaDescription: hasMetaDesc, hasH1, textLength: textOnly.length, imgCount, imgWithAlt, statusCode: res.status, issues };
  } catch {
    return null;
  }
}

function getGrade(score: number): AnalysisResult['grade'] {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'needs_work';
  return 'critical';
}

function getStatus(score: number, maxScore: number): AnalysisItem['status'] {
  const ratio = score / maxScore;
  if (ratio >= 0.7) return 'pass';
  if (ratio >= 0.4) return 'warning';
  return 'fail';
}

// HTML에서 태그 내용 추출 (정규식 기반, 서버사이드)
function extractTag(html: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const matches: string[] = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    matches.push(m[1].trim());
  }
  return matches;
}

function extractMeta(html: string, name: string): string | null {
  // name="..." or property="..."
  const regex = new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  if (match) return match[1];
  // content가 먼저 오는 경우
  const regex2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i');
  const match2 = html.match(regex2);
  return match2 ? match2[1] : null;
}

function countPattern(html: string, pattern: RegExp): number {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
}

// === PageSpeed Insights API ===
async function fetchPageSpeed(url: string, apiKey: string): Promise<PerformanceData | null> {
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&strategy=mobile`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return null;

    const data = await res.json();
    const audits = data.lighthouseResult?.audits;
    const categories = data.lighthouseResult?.categories;
    if (!audits || !categories) return null;

    // INP — CrUX field data (실제 사용자 측정값) 우선, fallback lab
    // 출처: Google CWV 2024 — INP가 FID 대체 (2024.03)
    let inp: number | null = null;
    let inpSource: 'field' | 'lab' | null = null;
    const fieldInp = data.loadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT_MS?.percentile;
    const originInp = data.originLoadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT_MS?.percentile;
    if (typeof fieldInp === 'number') { inp = fieldInp; inpSource = 'field'; }
    else if (typeof originInp === 'number') { inp = originInp; inpSource = 'field'; }
    else {
      const labInp = audits['interaction-to-next-paint']?.numericValue;
      if (typeof labInp === 'number' && labInp > 0) { inp = Math.round(labInp); inpSource = 'lab'; }
    }

    return {
      score: Math.round((categories.performance?.score || 0) * 100),
      lcp: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
      cls: parseFloat((audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3)),
      tbt: Math.round(audits['total-blocking-time']?.numericValue || 0),
      fcp: Math.round(audits['first-contentful-paint']?.numericValue || 0),
      si: Math.round(audits['speed-index']?.numericValue || 0),
      inp,
      inpSource,
    };
  } catch {
    return null;
  }
}

// === GEO 실제 멘션 테스트 (Claude API) ===
async function testGeoMention(
  url: string,
  domain: string,
  apiKey: string
): Promise<GeoCheckResult[]> {
  try {
    const client = new Anthropic({ apiKey });
    // 도메인에서 브랜드명 추출 (예: tenone.biz → tenone)
    const brandName = domain.replace(/^www\./, '').split('.')[0];

    const prompt = `다음 웹사이트와 관련된 서비스나 제품을 추천해줘: ${domain}
이 사이트가 어떤 서비스를 제공하는지 알고 있다면 알려주고, 유사한 경쟁 서비스도 함께 알려줘.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');

    const mentionedInResponse = responseText.toLowerCase().includes(brandName.toLowerCase()) ||
                                 responseText.toLowerCase().includes(domain.toLowerCase());

    // Claude 결과 기반으로 다른 AI 플랫폼 추정
    const hasGoodContent = mentionedInResponse;

    return [
      {
        platform: 'Claude',
        mentioned: mentionedInResponse,
        details: mentionedInResponse
          ? `Claude가 "${brandName}" 브랜드를 인식하고 있습니다 (실제 테스트)`
          : `Claude가 "${brandName}" 브랜드를 인식하지 못합니다 (실제 테스트)`,
      },
      {
        platform: 'ChatGPT',
        mentioned: hasGoodContent,
        details: hasGoodContent
          ? 'Claude 기반 추정 — 브랜드 인지도가 있어 ChatGPT에서도 노출 가능성 있음'
          : 'Claude 기반 추정 — 브랜드 인지도 부족으로 노출 가능성 낮음',
      },
      {
        platform: 'Perplexity',
        mentioned: hasGoodContent,
        details: hasGoodContent
          ? 'Claude 기반 추정 — 웹 검색 기반 AI이므로 노출 가능성 있음'
          : 'Claude 기반 추정 — 노출 가능성 낮음',
      },
      {
        platform: '네이버 AI (Cue)',
        mentioned: domain.endsWith('.kr') || domain.endsWith('.co.kr'),
        details: (domain.endsWith('.kr') || domain.endsWith('.co.kr'))
          ? '.kr 도메인 — 네이버 AI 노출 가능성 있음 (추정)'
          : '해외 도메인 — 네이버 AI 노출 가능성 낮음 (추정)',
      },
    ];
  } catch {
    return []; // 실패 시 빈 배열 → fallback으로 기존 추정 사용
  }
}

export async function analyzeUrl(url: string, options?: AnalyzeOptions): Promise<AnalysisResult> {
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  const startTime = Date.now();

  // 실제 HTML fetch
  let html = '';
  let statusCode = 0;
  let fetchError = '';
  let responseHeaders: Record<string, string> = {};

  // fetch 시도 (TLS 실패 시 재시도)
  const fetchWithRetry = async (url: string): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SmarComm-Scanner/1.0)',
          'Accept': 'text/html,application/xhtml+xml,*/*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        },
        redirect: 'follow',
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      // TLS 실패 시 http로 재시도
      if (url.startsWith('https://')) {
        const httpUrl = url.replace('https://', 'http://');
        const controller2 = new AbortController();
        const timer2 = setTimeout(() => controller2.abort(), 10000);
        try {
          const res = await fetch(httpUrl, {
            signal: controller2.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; SmarComm-Scanner/1.0)',
              'Accept': 'text/html,application/xhtml+xml,*/*',
            },
            redirect: 'follow',
          });
          clearTimeout(timer2);
          return res;
        } catch {
          clearTimeout(timer2);
        }
      }
      throw err;
    }
  };

  try {
    const res = await fetchWithRetry(normalizedUrl);
    statusCode = res.status;
    html = await res.text();

    res.headers.forEach((value, key) => {
      responseHeaders[key.toLowerCase()] = value;
    });
  } catch (e: unknown) {
    fetchError = e instanceof Error ? e.message : 'Unknown error';
    statusCode = 0;
  }

  const fetchTime = Date.now() - startTime;

  // === 외부 API 병렬 호출 (PageSpeed + GEO 멘션 테스트) ===
  const domain = (() => { try { return new URL(normalizedUrl).hostname; } catch { return ''; } })();

  const [pageSpeedData, geoTestResults, observatoryResult] = await Promise.all([
    options?.pageSpeedApiKey ? fetchPageSpeed(normalizedUrl, options.pageSpeedApiKey) : Promise.resolve(null),
    options?.anthropicApiKey ? testGeoMention(normalizedUrl, domain, options.anthropicApiKey) : Promise.resolve([]),
    fetchObservatoryGrade(domain),    // Phase 1.5.6 — best-effort, 실패 시 null
  ]);

  // === 기술 SEO 분석 ===
  const techSeo: AnalysisItem[] = [];

  // 1. 페이지 로딩 속도 — Core Web Vitals (LCP·CLS·INP) 명시
  // 출처: Google Core Web Vitals 2024 (web.dev/vitals), INP는 2024.03 FID 대체
  {
    let score = 15;
    let desc = '';
    if (pageSpeedData) {
      const psScore = pageSpeedData.score;
      const lcpSec = (pageSpeedData.lcp / 1000).toFixed(1);
      const cls = pageSpeedData.cls.toFixed(3);
      const inpText = pageSpeedData.inp != null
        ? ` · INP ${pageSpeedData.inp}ms${pageSpeedData.inpSource === 'field' ? '(실측)' : '(lab)'}`
        : '';
      const cwvText = `LCP ${lcpSec}s · CLS ${cls}${inpText}`;
      const cwvJudge =
        pageSpeedData.lcp <= 2500 && pageSpeedData.cls <= 0.1 && (pageSpeedData.inp == null || pageSpeedData.inp <= 200)
          ? '✓ Core Web Vitals 전 통과'
          : pageSpeedData.lcp <= 4000 && pageSpeedData.cls <= 0.25
            ? '△ Core Web Vitals 부분 통과'
            : '⛔ Core Web Vitals 미흡';

      if (psScore >= 90) { score = 15; desc = `${cwvJudge} · PageSpeed ${psScore}/100 (${cwvText}) (출처: Google CWV 2024)`; }
      else if (psScore >= 50) { score = Math.round(psScore / 100 * 15); desc = `${cwvJudge} · PageSpeed ${psScore}/100 (${cwvText}) (출처: Google CWV 2024)`; }
      else { score = Math.round(psScore / 100 * 15); desc = `${cwvJudge} · PageSpeed ${psScore}/100 (${cwvText}) (출처: Google CWV 2024)`; }
    } else {
      // fallback: fetch 시간 기반 (PageSpeed API 키 없음)
      if (fetchTime < 1000) { score = 15; desc = `응답 시간 ${fetchTime}ms — 매우 빠름 (PageSpeed 미사용)`; }
      else if (fetchTime < 2000) { score = 12; desc = `응답 시간 ${fetchTime}ms — 양호 (PageSpeed 미사용)`; }
      else if (fetchTime < 3000) { score = 8; desc = `응답 시간 ${fetchTime}ms — 개선 권장 (PageSpeed 미사용)`; }
      else if (fetchTime < 5000) { score = 5; desc = `응답 시간 ${fetchTime}ms — 느림 (PageSpeed 미사용)`; }
      else { score = 2; desc = `응답 시간 ${fetchTime}ms — 매우 느림 (PageSpeed 미사용)`; }
    }
    if (fetchError) { score = 0; desc = `사이트 접속 실패: ${fetchError}`; }
    techSeo.push({
      name: '페이지 로딩 속도',
      score, maxScore: 15,
      status: getStatus(score, 15),
      description: desc,
      action: 'LCP ≤ 2.5s · CLS ≤ 0.1 · INP ≤ 200ms 목표 (이미지 최적화·코드 분할·CDN)',
    });
  }

  // 2. 모바일 최적화 (viewport 메타태그 확인)
  {
    const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);
    const score = hasViewport ? 10 : 2;
    techSeo.push({ name: '모바일 최적화', score, maxScore: 10, status: getStatus(score, 10), description: hasViewport ? 'viewport 메타태그 설정됨' : 'viewport 메타태그 없음 — 모바일 표시 문제 가능', action: '<meta name="viewport" content="width=device-width, initial-scale=1"> 추가' });
  }

  // 3. HTTPS
  {
    const isHttps = normalizedUrl.startsWith('https://');
    const score = isHttps ? 5 : 0;
    techSeo.push({ name: 'HTTPS 적용', score, maxScore: 5, status: getStatus(score, 5), description: isHttps ? 'HTTPS 적용됨' : 'HTTP 사용 중 — 보안 경고 표시될 수 있음', action: 'SSL 인증서 적용 및 HTTPS 리다이렉트 설정' });
  }

  // 4. 크롤링 접근성 + AI 봇 access matrix + llms.txt (3 카드로 분리)
  let robotsText = '';
  let robotsExists = false;
  let sitemapExists = false;
  let llmsTxtExists = false;
  try {
    const origin = new URL(normalizedUrl).origin;
    const [robotsRes, sitemapRes, llmsRes] = await Promise.all([
      fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) }).catch(() => null),
      fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(5000) }).catch(() => null),
      fetch(`${origin}/llms.txt`, { signal: AbortSignal.timeout(5000) }).catch(() => null),
    ]);
    robotsExists = !!robotsRes && robotsRes.ok;
    if (robotsExists && robotsRes) robotsText = await robotsRes.text().catch(() => '');
    sitemapExists = !!sitemapRes && sitemapRes.ok;
    llmsTxtExists = !!llmsRes && llmsRes.ok;
  } catch { /* silent */ }

  // 4a. 크롤링 접근성 — robots.txt + sitemap.xml
  {
    let score = 0;
    const details: string[] = [];
    if (robotsExists) { score += 2; details.push('✓ robots.txt'); } else { details.push('⚠ robots.txt 없음'); }
    if (sitemapExists) { score += 3; details.push('✓ sitemap.xml'); } else { details.push('⛔ sitemap.xml 없음'); }
    const hasSitemapDirective = /(?:^|\n)\s*sitemap\s*:/i.test(robotsText);
    if (hasSitemapDirective) details.push('✓ robots.txt → Sitemap 디렉티브 포함');

    techSeo.push({
      name: '크롤링 접근성 (robots + sitemap)',
      score, maxScore: 5,
      status: getStatus(score, 5),
      description: `${details.join(' · ')} (출처: Google Search Central 가이드)`,
      action: sitemapExists
        ? (hasSitemapDirective ? '현 상태 유지' : 'robots.txt에 `Sitemap: https://도메인/sitemap.xml` 디렉티브 추가')
        : 'sitemap.xml 자동 생성 후 robots.txt에 디렉티브 추가, Google Search Console 등록',
    });
  }

  // 4b. AI 봇 Access Matrix — GPTBot·ClaudeBot·Google-Extended·PerplexityBot·Applebot-Extended (Citability)
  const AI_BOTS = [
    { name: 'GPTBot', provider: 'OpenAI' },
    { name: 'ClaudeBot', provider: 'Anthropic' },
    { name: 'Google-Extended', provider: 'Google' },
    { name: 'PerplexityBot', provider: 'Perplexity' },
    { name: 'Applebot-Extended', provider: 'Apple' },
  ];
  // 단순 파싱 — User-agent: X 블록의 Disallow: / 만 봄
  const checkBotDisallow = (botName: string): boolean => {
    if (!robotsText) return false; // robots.txt 없으면 default allow
    const lines = robotsText.split('\n');
    let inBlock = false;
    for (const line of lines) {
      const trimmed = line.trim();
      const uaMatch = trimmed.match(/^User-agent\s*:\s*(.+)$/i);
      if (uaMatch) {
        const ua = uaMatch[1].trim();
        inBlock = ua === '*' || ua.toLowerCase() === botName.toLowerCase();
        continue;
      }
      if (inBlock) {
        const disallowMatch = trimmed.match(/^Disallow\s*:\s*(.*)$/i);
        if (disallowMatch && disallowMatch[1].trim() === '/') return true;
      }
    }
    return false;
  };
  const botResults = AI_BOTS.map(bot => ({ ...bot, blocked: checkBotDisallow(bot.name) }));
  const allowedCount = botResults.filter(b => !b.blocked).length;
  {
    // 점수 — 5개 봇 중 허용된 수 (5/5 → 10점, 0/5 → 0점)
    const score = allowedCount * 2;
    techSeo.push({
      name: 'AI 봇 Access (5 플랫폼)',
      score, maxScore: 10,
      status: getStatus(score, 10),
      description: `허용 ${allowedCount}/5 · ${botResults.map(b => `${b.blocked ? '⛔' : '✓'} ${b.name}`).join(' · ')} (출처: OpenAI·Anthropic·Google·Perplexity·Apple 공식 봇 문서)`,
      action: allowedCount === 5
        ? '현 상태 유지 — AI 검색이 우리 콘텐츠 학습/인용 가능'
        : '차단된 봇이 의도였는지 확인. AI 검색 노출 원하면 robots.txt에서 해당 봇 허용',
    });
  }

  // 4c. llms.txt — AI 친화 콘텐츠 진입점 (Answer.AI 제안 표준)
  {
    const score = llmsTxtExists ? 5 : 0;
    techSeo.push({
      name: 'llms.txt (AI 친화 진입점)',
      score, maxScore: 5,
      status: getStatus(score, 5),
      description: llmsTxtExists
        ? '✓ llms.txt 존재 — AI 검색이 우리 사이트 구조를 빠르게 이해 (출처: Answer.AI 제안 표준 2024)'
        : '△ llms.txt 없음 — 신표준 (제안 단계). 도입하면 AI 검색 우선순위 가산 기대',
      action: llmsTxtExists
        ? '내용 정기 갱신 (새 페이지·정책 추가 시)'
        : '/llms.txt 작성: 핵심 페이지 URL + 한 줄 설명 (https://llmstxt.org/ 참조)',
    });
  }

  // 5a. 인덱싱 가능 — noindex 차단 여부 (단일 책임)
  {
    const hasNoindex = /<meta[^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/i.test(html);
    const score = hasNoindex ? 0 : 5;
    techSeo.push({
      name: '인덱싱 가능',
      score, maxScore: 5,
      status: getStatus(score, 5),
      description: hasNoindex
        ? '⛔ noindex 메타 태그 감지 — 검색엔진이 이 페이지를 색인하지 않음'
        : '✓ noindex 차단 없음 — 검색엔진이 이 페이지를 색인 가능 (출처: Google Search Central)',
      action: hasNoindex
        ? '의도하지 않았다면 <meta name="robots" content="noindex"> 제거'
        : '현 상태 유지',
    });
  }

  // 5b. Canonical URL — 정규 URL 명시 (단일 책임 분리)
  {
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const hasCanonical = !!canonicalMatch;
    const canonicalUrl = canonicalMatch?.[1] ?? '';
    const score = hasCanonical ? 5 : 0;
    techSeo.push({
      name: 'Canonical URL',
      score, maxScore: 5,
      status: getStatus(score, 5),
      description: hasCanonical
        ? `✓ canonical 태그 설정됨 (${canonicalUrl.length > 60 ? canonicalUrl.slice(0, 60) + '…' : canonicalUrl})`
        : '⚠ canonical 태그 없음 — 중복 콘텐츠 위험. Google이 정규 URL을 임의 추정 (출처: Google Search Central)',
      action: hasCanonical
        ? '현 상태 유지 — 다국어/모바일 변형 페이지 있다면 hreflang 추가 검토'
        : '<head>에 <link rel="canonical" href="이 페이지 정규 URL"> 추가',
    });
  }

  // 6. 사이트 링크 분류 (내부 vs 외부 + 깨진 링크 감지)
  // 정확한 이름: "내부 링크"가 아닌 "사이트 링크" — 모든 <a>를 분류
  {
    const linkHrefs: string[] = [];
    const linkRegex = /<a[^>]*href=["']([^"']*)["']/gi;
    let m;
    while ((m = linkRegex.exec(html)) !== null) linkHrefs.push(m[1]);

    const origin = (() => { try { return new URL(normalizedUrl).origin; } catch { return ''; } })();
    let internal = 0, external = 0, anchor = 0, special = 0;
    for (const href of linkHrefs) {
      if (!href) continue;
      if (href.startsWith('#')) { anchor++; continue; }
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) { special++; continue; }
      try {
        const resolved = new URL(href, normalizedUrl);
        if (resolved.origin === origin) internal++;
        else external++;
      } catch {
        // 잘못된 href — 깨진 링크로 간주
        special++;
      }
    }

    // 등급 — 내부 링크 수 기반 (Wikipedia 가이드: 페이지당 내부 10~50)
    let score = 0;
    let judgment = '';
    if (internal === 0) { score = 1; judgment = '내부 링크 없음 — 사이트 회유 동선 부재'; }
    else if (internal < 5) { score = 3; judgment = '내부 링크 부족 — 검색엔진이 사이트 구조 파악 어려움'; }
    else if (internal <= 50) { score = 5; judgment = '내부 링크 적정 범위'; }
    else { score = 4; judgment = '내부 링크 많음 — 우선순위 가중치 분산 우려'; }

    const total = internal + external + anchor + special;
    techSeo.push({
      name: '사이트 링크 분류',
      score, maxScore: 5,
      status: getStatus(score, 5),
      description: `내부 ${internal}개 · 외부 ${external}개 · 앵커 ${anchor}개 · 기타 ${special}개 (총 ${total}). ${judgment} (출처: HTML 직접 파싱, 페이지당 내부 10~50개 권장)`,
      action: internal < 5
        ? '본문에서 사이트 내 다른 페이지로 연결되는 링크를 5개 이상 만들 것 (Cornerstone 콘텐츠 가이드)'
        : '깨진 외부 링크 정기 점검 (HEAD 200 확인)',
    });
  }

  // 7. 구조화 데이터 — 자체 검증기 (필수 필드 + 권장 schema 누락 검사)
  const schemaAnalysis = analyzeSchema(html);
  {
    const schemaScored = scoreSchema(schemaAnalysis);
    // 0~10 점수를 0~5로 정규화 (기존 maxScore 호환)
    const score5 = Math.round(schemaScored.score / 2);
    techSeo.push({
      name: '구조화 데이터',
      score: score5,
      maxScore: 5,
      status: getStatus(score5, 5),
      description: schemaScored.description,
      action: schemaScored.action,
    });
  }

  // === 콘텐츠 SEO 분석 ===
  const contentSeo: AnalysisItem[] = [];

  // 1. 타이틀 태그
  {
    const titles = extractTag(html, 'title');
    const title = titles[0] || '';
    let score = 0;
    let desc = '';
    if (!title) { score = 0; desc = '타이틀 태그 없음'; }
    else if (title.length < 10) { score = 5; desc = `타이틀 "${title}" — 너무 짧음 (${title.length}자)`; }
    else if (title.length > 60) { score = 6; desc = `타이틀 "${title.substring(0, 30)}..." — 너무 김 (${title.length}자, 60자 이하 권장)`; }
    else { score = 10; desc = `타이틀 "${title}" — 적절한 길이 (${title.length}자)`; }
    contentSeo.push({ name: '타이틀 태그', score, maxScore: 10, status: getStatus(score, 10), description: desc, action: '30~60자 사이, 핵심 키워드 포함 타이틀 작성' });
  }

  // 2. 메타 디스크립션
  {
    const metaDesc = extractMeta(html, 'description');
    let score = 0;
    let desc = '';
    if (!metaDesc) { score = 0; desc = '메타 디스크립션 없음'; }
    else if (metaDesc.length < 50) { score = 3; desc = `메타 디스크립션 너무 짧음 (${metaDesc.length}자)`; }
    else if (metaDesc.length > 160) { score = 3; desc = `메타 디스크립션 너무 김 (${metaDesc.length}자, 160자 이하 권장)`; }
    else { score = 5; desc = `메타 디스크립션 설정됨 (${metaDesc.length}자)`; }
    contentSeo.push({ name: '메타 디스크립션', score, maxScore: 5, status: getStatus(score, 5), description: desc, action: '70~160자, 페이지 내용 요약 + CTA 포함' });
  }

  // 3. H1~H3 구조
  {
    const h1Count = countPattern(html, /<h1[^>]*>/gi);
    const h2Count = countPattern(html, /<h2[^>]*>/gi);
    const h3Count = countPattern(html, /<h3[^>]*>/gi);
    let score = 0;
    const details: string[] = [`H1: ${h1Count}개, H2: ${h2Count}개, H3: ${h3Count}개`];
    if (h1Count === 1) { score += 3; }
    else if (h1Count === 0) { score += 0; details.push('H1 태그 없음'); }
    else { score += 1; details.push('H1 중복'); }
    if (h2Count > 0) score += 1;
    if (h3Count > 0) score += 1;
    contentSeo.push({ name: 'H1~H3 구조', score: Math.min(score, 5), maxScore: 5, status: getStatus(Math.min(score, 5), 5), description: details.join(' — '), action: '페이지당 H1 1개, 논리적 H2→H3 계층 구조 유지' });
  }

  // 4. 이미지 ALT 태그
  {
    const imgTotal = countPattern(html, /<img[^>]*>/gi);
    const imgWithAlt = countPattern(html, /<img[^>]*alt=["'][^"']+["']/gi);
    const imgNoAlt = imgTotal - imgWithAlt;
    let score = 0;
    let desc = '';
    if (imgTotal === 0) { score = 3; desc = '이미지 없음'; }
    else {
      const altRatio = imgWithAlt / imgTotal;
      if (altRatio >= 0.9) { score = 5; desc = `이미지 ${imgTotal}개 중 ${imgWithAlt}개 ALT 설정 (${Math.round(altRatio * 100)}%)`; }
      else if (altRatio >= 0.5) { score = 3; desc = `이미지 ${imgTotal}개 중 ${imgNoAlt}개 ALT 누락 (${Math.round((1 - altRatio) * 100)}%)`; }
      else { score = 1; desc = `이미지 ${imgTotal}개 중 ${imgNoAlt}개 ALT 누락 (${Math.round((1 - altRatio) * 100)}%)`; }
    }
    contentSeo.push({ name: '이미지 ALT 태그', score, maxScore: 5, status: getStatus(score, 5), description: desc, action: '모든 이미지에 내용을 설명하는 ALT 태그 추가' });
  }

  // 5. OG 태그 (키워드 커버리지 대체)
  {
    const ogTitle = extractMeta(html, 'og:title');
    const ogDesc = extractMeta(html, 'og:description');
    const ogImage = extractMeta(html, 'og:image');
    let score = 0;
    const details: string[] = [];
    if (ogTitle) { score += 3; details.push('og:title 있음'); } else { details.push('og:title 없음'); }
    if (ogDesc) { score += 3; details.push('og:description 있음'); } else { details.push('og:description 없음'); }
    if (ogImage) { score += 4; details.push('og:image 있음'); } else { details.push('og:image 없음'); }
    contentSeo.push({ name: 'OG 태그 (소셜 공유)', score: Math.min(score, 10), maxScore: 10, status: getStatus(Math.min(score, 10), 10), description: details.join(', '), action: 'og:title, og:description, og:image 설정으로 SNS 공유 최적화' });
  }

  // 6. 콘텐츠 볼륨
  {
    const textOnly = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const wordCount = textOnly.length;
    let score = 0;
    if (wordCount > 3000) { score = 5; }
    else if (wordCount > 1000) { score = 3; }
    else if (wordCount > 300) { score = 2; }
    else { score = 1; }
    contentSeo.push({ name: '콘텐츠 볼륨', score, maxScore: 5, status: getStatus(score, 5), description: `텍스트 약 ${wordCount}자 — ${wordCount < 500 ? 'thin content 우려' : wordCount > 3000 ? '충분한 콘텐츠' : '보통'} · ⚠ 표면 측정 (길이만, 의미 깊이 보장 없음 — Phase 5 LLM 깊이 평가 추가 예정)`, action: '핵심 페이지에 1,000자 이상 유용한 콘텐츠 작성' });
  }

  // 7. 언어 설정
  {
    const hasLang = /<html[^>]*lang=["'][^"']+["']/i.test(html);
    const score = hasLang ? 5 : 1;
    contentSeo.push({
      name: '언어 설정',
      score, maxScore: 5,
      status: getStatus(score, 5),
      description: hasLang
        ? '✓ html lang 속성 설정됨 (출처: W3C HTML 표준)'
        : '⚠ html lang 속성 없음 — 검색엔진/번역기가 언어를 자동 추측 (출처: W3C)',
      action: hasLang ? '현 상태 유지' : '<html lang="ko"> 설정으로 검색엔진에 언어 명시',
    });
  }

  // 8. 보안 헤더 (Mozilla Observatory) — Phase 1.5.6 신규
  {
    const observatoryScored = scoreObservatory(observatoryResult);
    contentSeo.push({
      name: '보안 헤더 (Mozilla Observatory)',
      score: observatoryScored.score,
      maxScore: observatoryScored.maxScore,
      status: observatoryScored.maxScore === 0 ? 'pass' : getStatus(observatoryScored.score, observatoryScored.maxScore),
      description: observatoryScored.description,
      action: observatoryScored.action,
    });
  }

  // SEO 총점 계산
  const techTotal = techSeo.reduce((s, i) => s + i.score, 0);
  const techMax = techSeo.reduce((s, i) => s + i.maxScore, 0);
  const contentTotal = contentSeo.reduce((s, i) => s + i.score, 0);
  const contentMax = contentSeo.reduce((s, i) => s + i.maxScore, 0);
  const seoScore = Math.round(((techTotal + contentTotal) / (techMax + contentMax)) * 100);

  // === GEO 분석 (실제 테스트 + 구조화 데이터 기반 추정) ===
  const hasSchema = html.includes('application/ld+json') || /itemtype=["']https?:\/\/schema\.org/i.test(html);
  const hasFaqSchema = /FAQPage|faqpage/i.test(html);
  const hasProductSchema = /Product|product/i.test(html) && hasSchema;
  const hasGoodContent = (contentTotal / contentMax) > 0.6;
  const isKnownDomain = domain.includes('.com') || domain.includes('.co.kr') || domain.includes('.kr');

  // GEO 노출: 실제 테스트 결과가 있으면 사용, 없으면 추정
  const geoChecks: GeoCheckResult[] = geoTestResults.length > 0
    ? geoTestResults
    : [
      {
        platform: 'ChatGPT',
        mentioned: hasGoodContent && isKnownDomain,
        details: hasGoodContent && isKnownDomain ? '콘텐츠 품질 기반 노출 가능성 있음 (추정)' : '콘텐츠 부족 — 노출 가능성 낮음 (추정)',
      },
      {
        platform: 'Perplexity',
        mentioned: hasSchema && hasGoodContent,
        details: hasSchema && hasGoodContent ? '구조화 데이터 + 콘텐츠 기반 인용 가능성 있음 (추정)' : '구조화 데이터 부족 — 인용 가능성 낮음 (추정)',
      },
      {
        platform: 'Google AI Overview',
        mentioned: hasFaqSchema || (hasGoodContent && hasSchema),
        details: hasFaqSchema ? 'FAQ 스키마 감지 — AI 요약 포함 가능성 높음 (추정)' : '구조화 데이터 보강 필요 (추정)',
      },
      {
        platform: '네이버 AI (Cue)',
        mentioned: domain.endsWith('.kr') || domain.endsWith('.co.kr'),
        details: domain.endsWith('.kr') || domain.endsWith('.co.kr') ? '.kr 도메인 — 네이버 AI 노출 가능성 있음 (추정)' : '해외 도메인 — 네이버 AI 노출 가능성 낮음 (추정)',
      },
    ];

  const geoExposure = [20, 20, 20, 15];
  const geoExposureScore = geoChecks.reduce((s, c, i) => s + (c.mentioned ? geoExposure[i] : 0), 0);

  const geoReadiness: AnalysisItem[] = [
    {
      name: '구조화 데이터 AI 친화도',
      score: hasFaqSchema ? 10 : hasSchema ? 6 : hasProductSchema ? 5 : 2,
      maxScore: 10,
      status: getStatus(hasFaqSchema ? 10 : hasSchema ? 6 : 2, 10),
      description: hasFaqSchema
        ? '✓ FAQPage schema 적용 — AI 검색이 자주 인용하는 형식 (출처: Google AI Overview 인용 패턴)'
        : hasSchema
          ? '△ 기본 JSON-LD 있음, FAQPage/HowTo 추가 시 AI 인용 가능성 ↑ (출처: Schema.org)'
          : '⛔ 구조화 데이터 없음 — AI가 페이지 내용을 구조적으로 이해하기 어려움',
      action: hasFaqSchema
        ? '추가 권장: HowTo·Article·Product schema'
        : 'JSON-LD <script>에 Organization + FAQPage 최소 2종 추가 (Schema.org 표준)',
    },
    {
      name: '콘텐츠 인용 친화도',
      score: hasGoodContent ? 8 : 3,
      maxScore: 10,
      status: getStatus(hasGoodContent ? 8 : 3, 10),
      description: hasGoodContent
        ? '✓ 콘텐츠 깊이 양호 — AI가 추출할 만한 팩트 충분'
        : '⚠ 콘텐츠 깊이 부족 — AI가 명확히 인용할 정보 부족 (출처: SparkToro AI Search Research)',
      action: hasGoodContent
        ? 'Q&A 형식 + 짧은 단락 + 데이터 포인트 표시로 추출 가능성 추가 강화'
        : '핵심 페이지 1000자 이상 + 사실/숫자 기반 서술로 보강',
    },
    {
      // T4_UNKNOWN — 측정 불가 항목. 점수 영향 없도록 maxScore 0 (총합에서 빠짐)
      name: '도메인 권위도 (Authoritativeness)',
      score: 0,
      maxScore: 0,
      status: 'pass', // N/A 상태 표현 — UI에서 별도 처리 권장
      description: `📋 N/A — 정확한 권위도는 외부 백링크 도구(Ahrefs DR / Moz DA) 필요. Phase 4에서 연동 예정. 현재 도메인: ${domain} (출처: Google QRG § 3.3 Authoritativeness)`,
      action: '대기 — Ahrefs/Moz API 통합 후 실측. 그 전까지 양질의 콘텐츠 발행 + 외부 인용 확보로 자연 빌딩.',
    },
  ];

  const geoReadinessScore = geoReadiness.reduce((s, i) => s + i.score, 0);
  const geoReadinessMax = geoReadiness.reduce((s, i) => s + i.maxScore, 0);
  const geoScore = Math.round(((geoExposureScore + geoReadinessScore) / (75 + geoReadinessMax)) * 100);

  const performanceScore = pageSpeedData ? pageSpeedData.score : Math.round(Math.max(0, 100 - fetchTime / 50));
  const totalScore = pageSpeedData
    ? Math.round(seoScore * 0.4 + geoScore * 0.4 + performanceScore * 0.2)
    : Math.round(seoScore * 0.5 + geoScore * 0.5);

  // 상위 이슈: 점수가 낮은 항목 기반
  const allItems = [...techSeo, ...contentSeo, ...geoReadiness];
  const worstItems = allItems
    .map(item => ({ ...item, ratio: item.score / item.maxScore }))
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 3);

  const topIssues = worstItems.map((item, i) => ({
    severity: (i === 0 ? 'high' : i === 1 ? 'high' : 'medium') as 'high' | 'medium' | 'low',
    title: `${item.name} 개선 필요`,
    description: item.description,
    action: item.action,
  }));

  const geoMentionCount = geoChecks.filter(c => c.mentioned).length;
  if (geoMentionCount <= 1) {
    topIssues.unshift({
      severity: 'high',
      title: 'AI 검색 노출 가능성 낮음',
      description: `${4 - geoMentionCount}개 AI 플랫폼에서 노출 가능성이 낮은 것으로 추정됩니다.`,
      action: '구조화 데이터(FAQ, HowTo) + 팩트 기반 콘텐츠로 AI 인용 가능성 향상',
    });
    if (topIssues.length > 3) topIssues.pop();
  }

  // === 심화 분석 (Deep Analysis) ===
  const titles = extractTag(html, 'title');
  const pageTitle = titles[0] || '';
  const metaDescription = extractMeta(html, 'description') || '';
  const h1List = extractTag(html, 'h1').map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  const ogTitle = extractMeta(html, 'og:title') || '';
  const ogDescription = extractMeta(html, 'og:description') || '';
  const ogImage = extractMeta(html, 'og:image') || '';
  const canonical = (() => {
    const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    return m ? m[1] : '';
  })();
  const langAttr = (() => {
    const m = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
    return m ? m[1] : '';
  })();
  const imgTotal = countPattern(html, /<img[^>]*>/gi);
  const imgWithAltCount = countPattern(html, /<img[^>]*alt=["'][^"']+["']/gi);
  const linkCount = countPattern(html, /<a[^>]*href=["'][^"']*["']/gi);
  const textOnly = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  // 키워드 추출 (타이틀 + H1 + 메타에서)
  const titleWords = `${pageTitle} ${h1List.join(' ')} ${metaDescription}`.replace(/[^\w\uAC00-\uD7AF\s]/g, '').split(/\s+/).filter(w => w.length > 1);
  const wordFreq: Record<string, number> = {};
  titleWords.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const topKeywords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word]) => word);

  const keywords: KeywordInsight[] = topKeywords.map(kw => {
    const bodyCount = (textOnly.match(new RegExp(kw, 'gi')) || []).length;
    return {
      keyword: kw,
      relevance: bodyCount > 5 ? 'high' as const : bodyCount > 2 ? 'medium' as const : 'low' as const,
      found: bodyCount > 0,
      suggestion: bodyCount > 5 ? '본문에 충분히 사용됨' : bodyCount > 0 ? '사용 빈도를 높여 키워드 밀도 개선' : '본문에서 발견되지 않음 — 관련 콘텐츠 추가 필요',
    };
  });

  // 콘텐츠 갭 분석
  const contentGaps: ContentGap[] = [];
  if (!hasFaqSchema) contentGaps.push({ topic: 'FAQ 페이지', reason: 'FAQ 구조화 데이터 없음 — AI 검색에서 자주 인용되는 형식', priority: 'high', suggestedFormat: 'FAQ 페이지 + JSON-LD 마크업' });
  if (!html.includes('HowTo') && !html.includes('howto')) contentGaps.push({ topic: 'How-To 가이드', reason: 'HowTo 콘텐츠 없음 — Google AI Overview에서 자주 발췌', priority: 'high', suggestedFormat: '단계별 가이드 + HowTo 스키마' });
  if (textOnly.length < 2000) contentGaps.push({ topic: '상세 서비스 소개', reason: '텍스트 콘텐츠 부족 — 검색엔진이 페이지 주제를 파악하기 어려움', priority: 'high', suggestedFormat: '1,500자 이상 서비스/제품 상세 설명' });
  if (!metaDescription) contentGaps.push({ topic: '메타 디스크립션', reason: '메타 설명 없음 — 검색 결과 CTR에 직접 영향', priority: 'medium', suggestedFormat: '70~160자 매력적인 설명 + CTA' });
  if (!ogImage) contentGaps.push({ topic: 'OG 이미지', reason: 'SNS 공유 시 이미지 없음 — 공유 클릭율 저하', priority: 'medium', suggestedFormat: '1200x630px 대표 이미지' });
  if (h1List.length === 0) contentGaps.push({ topic: '메인 제목(H1)', reason: 'H1 태그 없음 — 페이지 주제를 검색엔진에 전달하지 못함', priority: 'high', suggestedFormat: '핵심 키워드 포함 H1 태그 1개' });

  // 경쟁사 힌트
  const competitorHints = [
    `${domain} 업종의 경쟁사 URL을 입력하면 SEO/GEO 점수를 직접 비교할 수 있습니다.`,
    hasSchema ? '구조화 데이터가 있어 경쟁사 대비 AI 노출에 유리한 위치입니다.' : '경쟁사가 구조화 데이터를 적용했다면 AI 검색에서 뒤처질 수 있습니다.',
    geoMentionCount >= 2 ? `AI 검색 ${geoMentionCount}개 플랫폼 노출 추정 — 업종 평균 이상일 가능성이 높습니다.` : 'AI 검색 노출이 부족합니다. 경쟁사보다 먼저 GEO 최적화를 시작하세요.',
  ];

  // 액션 플랜 (우선순위별 정렬)
  const actionPlan: DeepAnalysis['actionPlan'] = [];
  const failItems = allItems.filter(i => i.status === 'fail');
  const warnItems = allItems.filter(i => i.status === 'warning');

  failItems.forEach((item, i) => {
    actionPlan.push({
      priority: i + 1,
      category: techSeo.includes(item) ? '기술 SEO' : contentSeo.includes(item) ? '콘텐츠 SEO' : 'GEO',
      action: item.action,
      impact: '높음',
      effort: item.name.includes('구조화') || item.name.includes('스키마') ? '중간' : '낮음',
    });
  });
  warnItems.slice(0, 5).forEach((item, i) => {
    actionPlan.push({
      priority: failItems.length + i + 1,
      category: techSeo.includes(item) ? '기술 SEO' : contentSeo.includes(item) ? '콘텐츠 SEO' : 'GEO',
      action: item.action,
      impact: '중간',
      effort: '낮음',
    });
  });

  // 파비콘 URL 추출
  const faviconUrl = (() => {
    // <link rel="icon" ...> 또는 <link rel="shortcut icon" ...>
    const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
    if (iconMatch) {
      const href = iconMatch[1];
      if (href.startsWith('http')) return href;
      if (href.startsWith('//')) return 'https:' + href;
      try { return new URL(href, normalizedUrl).toString(); } catch { /* fall through */ }
    }
    // apple-touch-icon
    const appleMatch = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']*)["']/i);
    if (appleMatch) {
      const href = appleMatch[1];
      if (href.startsWith('http')) return href;
      if (href.startsWith('//')) return 'https:' + href;
      try { return new URL(href, normalizedUrl).toString(); } catch { /* fall through */ }
    }
    // fallback: /favicon.ico
    try { return new URL('/favicon.ico', normalizedUrl).toString(); } catch { return ''; }
  })();

  const deep: DeepAnalysis = {
    keywords,
    contentGaps,
    competitorHints,
    actionPlan,
    pageDetails: {
      title: pageTitle,
      metaDescription,
      h1List,
      ogTitle,
      ogDescription,
      ogImage,
      canonical,
      lang: langAttr,
      imgCount: imgTotal,
      imgWithAlt: imgWithAltCount,
      linkCount,
      textLength: textOnly.length,
    },
  };

  // === 다중 페이지 크롤링 (최대 5개 서브페이지) ===
  const internalLinks = extractInternalLinks(html, normalizedUrl);
  const subPagePromises = internalLinks.slice(0, 5).map(link => analyzeSubPage(link));
  const subPageResults = (await Promise.all(subPagePromises)).filter((r): r is SubPageResult => r !== null);

  // 서브페이지 이슈를 콘텐츠 갭에 반영
  const pagesWithoutMeta = subPageResults.filter(p => !p.hasMetaDescription).length;
  const pagesWithoutH1 = subPageResults.filter(p => !p.hasH1).length;
  if (subPageResults.length > 0 && pagesWithoutMeta > subPageResults.length / 2) {
    contentGaps.push({ topic: '서브페이지 메타 설명', reason: `분석한 ${subPageResults.length}개 페이지 중 ${pagesWithoutMeta}개에 메타 설명 없음`, priority: 'medium', suggestedFormat: '각 페이지별 고유한 70~160자 메타 설명' });
  }
  if (subPageResults.length > 0 && pagesWithoutH1 > subPageResults.length / 2) {
    contentGaps.push({ topic: '서브페이지 H1 태그', reason: `분석한 ${subPageResults.length}개 페이지 중 ${pagesWithoutH1}개에 H1 없음`, priority: 'medium', suggestedFormat: '각 페이지별 키워드 포함 H1 태그 1개' });
  }

  return {
    url: normalizedUrl,
    faviconUrl,
    fetchTime,
    statusCode,
    totalScore,
    seoScore,
    geoScore,
    performanceScore,
    grade: getGrade(totalScore),
    techSeo,
    contentSeo,
    geoChecks,
    geoReadiness,
    topIssues,
    deep,
    performance: pageSpeedData || undefined,
    subPages: subPageResults.length > 0 ? subPageResults : undefined,
    pagesAnalyzed: 1 + subPageResults.length,
  };
}
