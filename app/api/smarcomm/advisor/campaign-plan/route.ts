import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildCampaignPrompt, generateFallbackPlan } from '@/lib/smarcomm/campaign-plan';
import type { AnalysisResult } from '@/lib/smarcomm/seo-analyzer';
import type { CampaignPlan } from '@/lib/smarcomm/campaign-plan';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scanResult } = body as { scanResult: AnalysisResult };

    if (!scanResult || !scanResult.url) {
      return NextResponse.json({ error: '진단 결과가 필요합니다' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Claude API 시도
    if (apiKey) {
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
        console.error('Claude API error, falling back to rule-based:', aiError);
      }
    }

    // Fallback: 규칙 기반 기획서
    const fallbackPlan = generateFallbackPlan(scanResult);
    return NextResponse.json(fallbackPlan);
  } catch (error) {
    console.error('Campaign plan error:', error);
    return NextResponse.json(
      { error: '기획서 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
