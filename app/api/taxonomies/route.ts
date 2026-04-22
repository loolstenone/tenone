import { NextResponse } from 'next/server';
import { getAllTaxonomies } from '@/lib/supabase/taxonomies';

export async function GET() {
  const taxonomies = await getAllTaxonomies();
  return NextResponse.json(taxonomies);
}
