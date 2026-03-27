/**
 * Certificate API
 * GET  /api/certificates?brandId=&email=
 * POST /api/certificates  (single or bulk)
 */
import { NextRequest, NextResponse } from 'next/server';
import * as certDb from '@/lib/supabase/certificate';
import type { CreateCertificateInput } from '@/types/certificate';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brandId') || undefined;
  const email = searchParams.get('email') || undefined;

  try {
    const certificates = await certDb.fetchCertificates(brandId, email);
    return NextResponse.json(certificates);
  } catch (error) {
    console.error('fetchCertificates error:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Bulk create: body가 배열인 경우
    if (Array.isArray(body)) {
      for (const item of body) {
        if (!item.brandId || !item.title || !item.type || !item.recipientName) {
          return NextResponse.json(
            { error: 'Each item requires brandId, title, type, recipientName' },
            { status: 400 }
          );
        }
      }
      const certificates = await certDb.bulkCreateCertificates(body as CreateCertificateInput[]);
      return NextResponse.json(certificates, { status: 201 });
    }

    // Single create
    const input = body as CreateCertificateInput;
    if (!input.brandId || !input.title || !input.type || !input.recipientName) {
      return NextResponse.json(
        { error: 'brandId, title, type, recipientName are required' },
        { status: 400 }
      );
    }

    const certificate = await certDb.createCertificate(input);
    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error('createCertificate error:', error);
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
  }
}
