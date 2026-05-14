// SmarComm Index PDF 리포트 다운로드
// GET /api/smarcomm/report/pdf?id={scanId}
// — 본인 소유 스캔 결과만 접근 가능 (RLS + user_id 검증)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { SmarCommReportPDF } from '@/lib/smarcomm/report-pdf';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'id 파라미터가 필요합니다' }, { status: 400 });
    }

    const supabase = await createClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 스캔 결과 조회 (RLS가 user_id 검증, 이중 체크)
    const { data: scan, error } = await supabase
        .from('smarcomm_scan_results')
        .select('domain, url, industry, findability, trust, citability, index_score, grade, scanned_at, score_delta, breakdown, benchmark')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error || !scan) {
        return NextResponse.json({ error: '스캔 결과를 찾을 수 없습니다' }, { status: 404 });
    }

    try {
        const buffer = await renderToBuffer(
            React.createElement(SmarCommReportPDF, { data: scan })
        );

        const filename = `smarcomm-${scan.domain}-${new Date(scan.scanned_at).toISOString().slice(0, 10)}.pdf`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': buffer.byteLength.toString(),
                'Cache-Control': 'private, no-cache',
            },
        });
    } catch (err) {
        console.error('[smarcomm-pdf] render error:', err);
        return NextResponse.json({ error: 'PDF 생성 중 오류가 발생했습니다' }, { status: 500 });
    }
}
