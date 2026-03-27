/**
 * Certificate Verify API (Public, no auth)
 * GET /api/certificates/verify?number=TN-2026-A3F2K1
 */
import { NextRequest, NextResponse } from 'next/server';
import * as certDb from '@/lib/supabase/certificate';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get('number');

  if (!number) {
    return NextResponse.json(
      { error: 'number parameter is required' },
      { status: 400 }
    );
  }

  try {
    const certificate = await certDb.fetchCertificateByNumber(number);

    if (!certificate) {
      return NextResponse.json({
        valid: false,
        message: '해당 번호의 인증서를 찾을 수 없습니다.',
      });
    }

    if (certificate.status === 'revoked') {
      return NextResponse.json({
        valid: false,
        message: '취소된 인증서입니다.',
        certificate: {
          certificateNumber: certificate.certificateNumber,
          title: certificate.title,
          status: certificate.status,
          revokedAt: certificate.revokedAt,
        },
      });
    }

    // 공개 검증: 민감하지 않은 필드만 반환
    return NextResponse.json({
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        title: certificate.title,
        type: certificate.type,
        status: certificate.status,
        recipientName: certificate.recipientName,
        courseOrEvent: certificate.courseOrEvent,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    console.error('verifyCertificate error:', error);
    return NextResponse.json({ error: 'Failed to verify certificate' }, { status: 500 });
  }
}
