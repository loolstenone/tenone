// 실제 HTML을 분석하여 SEO 점수를 산출하는 엔진
import Anthropic from '@anthropic-ai/sdk';

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
  tbt: number;                 // ms (Total Blocking Time)
  fcp: number;                 // ms (First Contentful Paint)
  si: number;                  // ms (Speed Index)
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
}

export interface AnalyzeOptions {
  pageSpeedApiKey?: string;
  anthropicApiKey?: string;
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

    return {
      score: Math.round((categories.performance?.score || 0) * 100),
      lcp: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
      cls: parseFloat((audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3)),
      tbt: Math.round(audits['total-blocking-time']?.numericValue || 0),
      fcp: Math.round(audits['first-contentful-paint']?.numericValue || 0),
      si: Math.round(audits['speed-index']?.numericValue || 0),
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

  const [pageSpeedData, geoTestResults] = await Promise.all([
    options?.pageSpeedApiKey ? fetchPageSpeed(normalizedUrl, options.pageSpeedApiKey) : Promise.resolve(null),
    options?.anthropicApiKey ? testGeoMention(normalizedUrl, domain, options.anthropicApiKey) : Promise.resolve([]),
  ]);

  // === 기술 SEO 분석 ===
  const techSeo: AnalysisItem[] = [];

  // 1. 페이지 로딩 속도 (PageSpeed API 또는 fetch 시간 기반)
  {
    let score = 15;
    let desc = '';
    if (pageSpeedData) {
      // 실제 PageSpeed 점수 사용
      const psScore = pageSpeedData.score;
      if (psScore >= 90) { score = 15; desc = `PageSpeed 점수 ${psScore}/100 — 우수 (LCP ${(pageSpeedData.lcp / 1000).toFixed(1)}s)`; }
      else if (psScore >= 50) { score = Math.round(psScore / 100 * 15); desc = `PageSpeed 점수 ${psScore}/100 — 개선 필요 (LCP ${(pageSpeedData.lcp / 1000).toFixed(1)}s)`; }
      else { score = Math.round(psScore / 100 * 15); desc = `PageSpeed 점수 ${psScore}/100 — 느림 (LCP ${(pageSpeedData.lcp / 1000).toFixed(1)}s)`; }
    } else {
      // fallback: fetch 시간 기반
      if (fetchTime < 1000) { score = 15; desc = `응답 시간 ${fetchTime}ms — 매우 빠름`; }
      else if (fetchTime < 2000) { score = 12; desc = `응답 시간 ${fetchTime}ms — 양호`; }
      else if (fetchTime < 3000) { score = 8; desc = `응답 시간 ${fetchTime}ms — 개선 권장`; }
      else if (fetchTime < 5000) { score = 5; desc = `응답 시간 ${fetchTime}ms — 느림`; }
      else { score = 2; desc = `응답 시간 ${fetchTime}ms — 매우 느림`; }
    }
    if (fetchError) { score = 0; desc = `사이트 접속 실패: ${fetchError}`; }
    techSeo.push({ name: '페이지 로딩 속도', score, maxScore: 15, status: getStatus(score, 15), description: desc, action: '이미지 최적화, 코드 분할, CDN 적용으로 LCP 2.5초 이하 달성' });
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

  // 4. 크롤링 접근성 (robots.txt, sitemap 체크)
  {
    let score = 0;
    const details: string[] = [];

    try {
      const origin = new URL(normalizedUrl).origin;
      const robotsRes = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) }).catch(() => null);
      if (robotsRes && robotsRes.ok) { score += 2; details.push('robots.txt 존재'); }
      else { details.push('robots.txt 없음'); }

      const sitemapRes = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(5000) }).catch(() => null);
      if (sitemapRes && sitemapRes.ok) { score += 3; details.push('sitemap.xml 존재'); }
      else { score += 0; details.push('sitemap.xml 없음'); }
    } catch { details.push('확인 실패'); }

    techSeo.push({ name: '크롤링 접근성', score, maxScore: 5, status: getStatus(score, 5), description: details.join(', '), action: 'robots.txt와 sitemap.xml 생성 후 Search Console 등록' });
  }

  // 5. 인덱싱 가능성 (noindex 체크)
  {
    const hasNoindex = /<meta[^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/i.test(html);
    const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
    let score = 3;
    const details: string[] = [];
    if (hasNoindex) { score = 0; details.push('noindex 태그 감지 — 검색 인덱싱 차단됨'); }
    else { details.push('noindex 없음'); }
    if (hasCanonical) { score += 2; details.push('canonical 태그 있음'); }
    else { details.push('canonical 태그 없음'); }
    techSeo.push({ name: '인덱싱 상태', score: Math.min(score, 5), maxScore: 5, status: getStatus(Math.min(score, 5), 5), description: details.join(', '), action: 'noindex 제거, canonical URL 설정' });
  }

  // 6. 깨진 링크 (페이지 내 링크 수 체크)
  {
    const linkCount = countPattern(html, /<a[^>]*href=["'][^"']*["']/gi);
    const brokenIndicator = countPattern(html, /404|not.?found/gi);
    let score = linkCount > 0 ? 4 : 2;
    if (brokenIndicator > 2) score = 2;
    techSeo.push({ name: '내부 링크', score, maxScore: 5, status: getStatus(score, 5), description: `페이지 내 링크 ${linkCount}개 발견`, action: '깨진 링크 정기 점검 및 수정' });
  }

  // 7. 구조화 데이터
  {
    const hasJsonLd = html.includes('application/ld+json');
    const hasMicrodata = /itemtype=["']https?:\/\/schema\.org/i.test(html);
    const score = hasJsonLd ? 5 : hasMicrodata ? 4 : 0;
    techSeo.push({ name: '구조화 데이터', score, maxScore: 5, status: getStatus(score, 5), description: hasJsonLd ? 'JSON-LD 구조화 데이터 적용됨' : hasMicrodata ? 'Microdata 스키마 적용됨' : '구조화 데이터 없음', action: 'JSON-LD 형식으로 Organization, FAQ, Product 스키마 추가' });
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
    contentSeo.push({ name: '콘텐츠 볼륨', score, maxScore: 5, status: getStatus(score, 5), description: `텍스트 약 ${wordCount}자 — ${wordCount < 500 ? 'thin content 우려' : wordCount > 3000 ? '충분한 콘텐츠' : '보통'}`, action: '핵심 페이지에 1,000자 이상 유용한 콘텐츠 작성' });
  }

  // 7. 언어 설정
  {
    const hasLang = /<html[^>]*lang=["'][^"']+["']/i.test(html);
    const score = hasLang ? 5 : 1;
    contentSeo.push({ name: '언어 설정', score, maxScore: 5, status: getStatus(score, 5), description: hasLang ? 'html lang 속성 설정됨' : 'html lang 속성 없음', action: '<html lang="ko"> 설정으로 검색엔진에 언어 명시' });
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
      description: hasFaqSchema ? 'FAQ 스키마 적용 — AI 인용 최적' : hasSchema ? '기본 스키마 있음, FAQ/HowTo 추가 권장' : '구조화 데이터 없음',
      action: 'FAQ, HowTo, Product 스키마 JSON-LD로 추가',
    },
    {
      name: '콘텐츠 인용 가능성',
      score: hasGoodContent ? 8 : 3,
      maxScore: 10,
      status: getStatus(hasGoodContent ? 8 : 3, 10),
      description: hasGoodContent ? '콘텐츠 품질 양호 — AI 인용 가능성 있음' : '콘텐츠 부족 — AI가 인용할 만한 정보 부족',
      action: '명확한 문장 구조, 팩트/데이터 기반 서술, Q&A 형식 콘텐츠 추가',
    },
    {
      name: '도메인 권위도',
      score: isKnownDomain ? 3 : 1,
      maxScore: 5,
      status: getStatus(isKnownDomain ? 3 : 1, 5),
      description: `도메인: ${domain}`,
      action: '양질의 콘텐츠 발행 + 관련 사이트 백링크 확보',
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
  };
}
