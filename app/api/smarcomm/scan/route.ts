import { NextRequest, NextResponse } from 'next/server';
import { runFullScan, extractDomain } from '@/lib/smarcomm/run-scan';
import { getApiUser } from '@/lib/api-guard';
import { isPublicHttpUrl } from '@/lib/url-guard';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, requester_email, industry, tenant_id } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL이 필요합니다' }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: '유효하지 않은 URL입니다' }, { status: 400 });
    }

    const domain = extractDomain(normalizedUrl);
    if (!domain) {
      return NextResponse.json({ error: '유효하지 않은 URL입니다' }, { status: 400 });
    }
    // SSRF 차단 — 서버가 대신 접속하므로 공개 http(s) 주소만 (사설망·루프백·메타데이터 주소 거부, 2026-10-11)
    if (!(await isPublicHttpUrl(normalizedUrl))) {
      return NextResponse.json({ error: '공개 웹사이트 주소만 분석할 수 있습니다' }, { status: 400 });
    }
    // 공개 진단은 데모 테넌트에만 기록 — body의 tenant_id는 직원만 지정 가능
    const user = await getApiUser(request);
    const safeTenant = user?.isStaff && typeof tenant_id === 'string' ? tenant_id : undefined;

    const result = await runFullScan({
      url: normalizedUrl,
      requester_email: typeof requester_email === 'string' ? requester_email.slice(0, 200) : undefined,
      industry: typeof industry === 'string' ? industry.slice(0, 100) : undefined,
      tenant_id: safeTenant,
    });

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
