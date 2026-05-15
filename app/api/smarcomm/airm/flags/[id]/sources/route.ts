import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/smarcomm/airm/flags/[id]/sources
// Returns stored sources for a given flag
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: flagId } = await params;

  const { data, error } = await supabaseAdmin
    .from('smarcomm_ai_flag_sources')
    .select('id, url, title, snippet, source_type, relevance_score, fetched_at')
    .eq('flag_id', flagId)
    .order('relevance_score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sources: data ?? [] });
}

// POST /api/smarcomm/airm/flags/[id]/sources
// Triggers Serper search to find AI training sources for the flag's claim,
// stores Top N results, and returns them.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: flagId } = await params;

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { sources: [], status: 'api_key_missing' },
      { status: 200 }
    );
  }

  // Fetch flag details to build the search query
  const { data: flag, error: flagError } = await supabaseAdmin
    .from('smarcomm_ai_flags')
    .select('id, tenant_id, claim, flag_type, severity')
    .eq('id', flagId)
    .single();

  if (flagError || !flag) {
    return NextResponse.json({ error: '플래그를 찾을 수 없습니다' }, { status: 404 });
  }

  // Build search query from the flag claim
  const searchQuery = flag.claim
    ? `${flag.claim} site:wikipedia.org OR site:news.ycombinator.com OR site:arxiv.org`
    : flag.flag_type;

  // Call Serper API
  let serperResults: SerperResult[] = [];
  try {
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: searchQuery, num: 10 }),
    });

    if (!serperRes.ok) {
      throw new Error(`Serper API error: ${serperRes.status}`);
    }

    const serperData = await serperRes.json();
    serperResults = (serperData.organic ?? []) as SerperResult[];
  } catch (err) {
    console.error('[flag-sources] Serper fetch error:', err);
    return NextResponse.json(
      { sources: [], status: 'search_error', message: String(err) },
      { status: 200 }
    );
  }

  // Delete old results for this flag before inserting fresh ones
  await supabaseAdmin
    .from('smarcomm_ai_flag_sources')
    .delete()
    .eq('flag_id', flagId);

  // Map and insert
  const rows = serperResults.slice(0, 10).map((r, i) => ({
    flag_id: flagId,
    tenant_id: flag.tenant_id,
    url: r.link,
    title: r.title ?? null,
    snippet: r.snippet ?? null,
    source_type: detectSourceType(r.link),
    relevance_score: Math.max(0, 1 - i * 0.09), // rank-based decay
  }));

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('smarcomm_ai_flag_sources')
    .insert(rows)
    .select('id, url, title, snippet, source_type, relevance_score, fetched_at');

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ sources: inserted ?? [], status: 'ok' });
}

// ── helpers

interface SerperResult {
  link: string;
  title?: string;
  snippet?: string;
  source?: string;
}

function detectSourceType(url: string): string {
  if (/wikipedia\.org|wiki\./i.test(url)) return 'wiki';
  if (/\.gov|official|press|newsroom/i.test(url)) return 'official';
  if (
    /news|reuters|bbc|cnn|yonhap|chosun|joongang|hani|naver\.com\/news/i.test(url)
  )
    return 'news';
  if (/forum|reddit|stackoverflow|quora|community/i.test(url)) return 'forum';
  if (/blog|medium|substack|tistory|brunch/i.test(url)) return 'blog';
  return 'other';
}
