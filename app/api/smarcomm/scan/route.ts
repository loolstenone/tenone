import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrl } from '@/lib/smarcomm/seo-analyzer';
import { computeIndex } from '@/lib/smarcomm/index-calculator';
import { fetchBacklinkData } from '@/lib/smarcomm/analyzers/backlink-authority';
import { fetchIndustryBenchmark } from '@/lib/smarcomm/analyzers/industry-benchmark';
import { fetchWikidataEntity } from '@/lib/smarcomm/analyzers/wikidata-knowledge-graph';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, industry } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL이 필요합니다' }, { status: 400 });
    }

    // URL 유효성 간단 체크
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: '유효하지 않은 URL입니다' }, { status: 400 });
    }

    const result = await analyzeUrl(normalizedUrl, {
      pageSpeedApiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    // 사이트 접속 실패 시 에러 반환
    if (result.statusCode === 0) {
      return NextResponse.json(
        { error: '사이트에 접속할 수 없습니다. URL을 확인해주세요.' },
        { status: 422 }
      );
    }

    const domain = new URL(normalizedUrl).hostname.replace(/^www\./, '');
    const [backlinkData, wikidata] = await Promise.all([
        fetchBacklinkData(domain).catch(() => undefined),
        fetchWikidataEntity(domain).catch(() => null),
    ]);
    const breakdown = computeIndex(result, backlinkData, wikidata ?? undefined);

    const benchmark = await fetchIndustryBenchmark(
        industry || 'general',
        { findability: breakdown.findability, trust: breakdown.trust, citability: breakdown.citability, index: breakdown.index }
    ).catch(() => null);

    return NextResponse.json({ ...result, breakdown, benchmark, wikidata });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
