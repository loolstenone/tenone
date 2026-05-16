import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildCampaignPrompt } from '@/lib/smarcomm/campaign-plan';
import type { AnalysisResult } from '@/lib/smarcomm/seo-analyzer';
import type { CampaignPlan } from '@/lib/smarcomm/campaign-plan';
import { requireAuth } from '@/lib/supabase/api-utils';

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAuth();
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { scanResult } = body as { scanResult: AnalysisResult };

    if (!scanResult || !scanResult.url) {
      return NextResponse.json({ error: '진단 결과가 필요합니다' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // V2.1 § 1.10 정직 원칙 — 휴리스틱 fallback 폐기. API 키 없으면 503.
    if (!apiKey) {
      return NextResponse.json({
        error: 'ANTHROPIC_API_KEY 미설정 — AI 어드바이저 사용 불가',
        hint: '정직 원칙에 따라 휴리스틱 대체 응답은 제공하지 않습니다. 환경변수 ANTHROPIC_API_KEY 설정 후 재시도하세요.',
      }, { status: 503 });
    }

    try {
      const client = new Anthropic({ apiKey });
      const prompt = buildCampaignPrompt(scanResult);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('');

      // JSON 파싱 (```json ... ``` 블록 처리)
      let jsonStr = responseText.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      const plan: CampaignPlan = {
        id: Math.random().toString(36).substring(2, 10),
        created_at: new Date().toISOString(),
        scan_url: scanResult.url,
        generated_by: 'ai',
        background: parsed.background,
        strategy: parsed.strategy,
        actions: parsed.actions,
        expected_outcome: parsed.expected_outcome,
      };

      return NextResponse.json(plan);
    } catch (aiError) {
      console.error('Claude API error:', aiError);
      return NextResponse.json({
        error: 'AI 어드바이저 호출 실패',
        hint: 'API 키 만료/한도 초과일 수 있습니다. 정직 원칙에 따라 휴리스틱 대체 응답은 제공하지 않습니다.',
      }, { status: 502 });
    }
  } catch (error) {
    console.error('Campaign plan error:', error);
    return NextResponse.json(
      { error: '기획서 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
