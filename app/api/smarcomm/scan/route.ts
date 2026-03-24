import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrl } from '@/lib/smarcomm/seo-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
