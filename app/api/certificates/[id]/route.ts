/**
 * Certificate Detail API
 * GET /api/certificates/:id
 * PUT /api/certificates/:id
 */
import { NextRequest, NextResponse } from 'next/server';
import * as certDb from '@/lib/supabase/certificate';
import type { UpdateCertificateInput } from '@/types/certificate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const certificate = await certDb.fetchCertificateById(id);
    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }
    return NextResponse.json(certificate);
  } catch (error) {
    console.error('fetchCertificateById error:', error);
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json() as UpdateCertificateInput;
    const certificate = await certDb.updateCertificate(id, body);
    return NextResponse.json(certificate);
  } catch (error) {
    console.error('updateCertificate error:', error);
    return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 });
  }
}
