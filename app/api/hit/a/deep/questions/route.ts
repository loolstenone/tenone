import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const sb = createAdminClient();

  const { data, error } = await sb
    .from('hit_questions')
    .select('id, module, question_text, sub_domain, reverse_scored, alert_code')
    .eq('test_type', 'A')
    .in('module', ['character_deep', 'aptitude_deep'])
    .order('module')
    .order('question_index');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ questions: data ?? [] });
}
