import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface GenerateRequest {
  type: 'text' | 'banner' | 'video';
  prompt: string;
  channel?: string;
  content_type?: string;
  context?: string; // 기획서에서 넘어온 배경 정보
}

// 채널별 제약 조건
const CHANNEL_SPECS: Record<string, string> = {
  '네이버 블로그': '1500~2000자, H2/H3 구조, 자연스러운 키워드 삽입, 이미지 위치 [이미지] 표시',
  'Google Ads': '반응형 검색광고: 헤드라인 15개(30자 이내) + 설명 4개(90자 이내)',
  'Meta': '본문 125자 이내 + 헤드라인 40자 이내 + CTA',
  '인스타그램': '본문 300자 이내 + 해시태그 10~15개 + 이모지 적절히',
  '카카오': '알림톡: 변수 #{이름} 포함, 1000자 이내',
  '이메일': '제목 40자 이내 + HTML 본문 + CTA 버튼 문구',
  '사이트 개선': '웹사이트에 추가할 텍스트 콘텐츠',
};

function buildCreativePrompt(req: GenerateRequest): string {
  const channelSpec = req.channel ? CHANNEL_SPECS[req.channel] || '' : '';
  const contextInfo = req.context ? `\n\n## 캠페인 배경\n${req.context}` : '';

  if (req.type === 'text') {
    return `당신은 한국 디지털 마케팅 카피라이터입니다.
다음 조건에 맞는 마케팅 텍스트 소재를 3개 변형으로 생성하세요.${contextInfo}

## 요청
${req.prompt}

## 채널 규격
${channelSpec || '일반 마케팅 카피 (자유 형식)'}

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "creatives": [
    {
      "title": "소재 제목/헤드라인",
      "body": "본문 내용",
      "cta": "CTA 문구 (있으면)",
      "hashtags": ["해시태그1", "해시태그2"]
    }
  ]
}

한국어로 작성. 변형 3개. 각 변형은 톤이나 각도를 다르게.`;
  }

  if (req.type === 'banner') {
    return `당신은 디지털 광고 배너 기획자입니다.
다음 조건에 맞는 배너 광고 기획을 3개 변형으로 생성하세요.${contextInfo}

## 요청
${req.prompt}

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "creatives": [
    {
      "title": "배너 헤드카피",
      "body": "서브카피 + 레이아웃 설명",
      "cta": "CTA 버튼 문구",
      "image_prompt": "이미지 생성 AI에 넣을 영어 프롬프트"
    }
  ]
}

한국어로 작성 (image_prompt만 영어). 변형 3개.`;
  }

  // video
  return `당신은 영상 광고 기획자입니다.
다음 조건에 맞는 영상 광고 스토리보드를 생성하세요.${contextInfo}

## 요청
${req.prompt}

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "creatives": [
    {
      "title": "영상 제목",
      "body": "씬별 스토리보드 (씬1: ... / 씬2: ... / 씬3: ...)",
      "cta": "엔딩 CTA 문구",
      "duration": "15초"
    }
  ]
}

한국어로 작성. 변형 2개.`;
}

// Claude API 실패 시 규칙 기반 생성
function generateFallback(req: GenerateRequest): { title: string; body: string; cta?: string; hashtags?: string[] }[] {
  const keyword = req.prompt.slice(0, 20);
  return [
    {
      title: `${keyword} — 지금 시작하세요`,
      body: `${req.prompt}\n\n전문가가 추천하는 솔루션으로 효과를 직접 확인해보세요.`,
      cta: '무료 상담 신청',
      hashtags: ['마케팅', 'AI', '디지털마케팅'],
    },
    {
      title: `왜 ${keyword}이 중요한가요?`,
      body: `많은 기업이 이미 시작했습니다. 늦기 전에 지금 확인하세요.`,
      cta: '자세히 보기',
    },
    {
      title: `${keyword} 성공 사례`,
      body: `실제 데이터로 증명된 효과. 다음은 당신의 차례입니다.`,
      cta: '사례 확인',
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateRequest;

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: '프롬프트를 입력해주세요' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey });
        const prompt = buildCreativePrompt(body);

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          messages: [{ role: 'user', content: prompt }],
        });

        const responseText = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === 'text')
          .map(block => block.text)
          .join('');

        let jsonStr = responseText.trim();
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();

        const parsed = JSON.parse(jsonStr);
        return NextResponse.json({ creatives: parsed.creatives, generated_by: 'ai' });
      } catch (aiError) {
        console.error('Claude API error, falling back:', aiError);
      }
    }

    // Fallback
    const fallback = generateFallback(body);
    return NextResponse.json({ creatives: fallback, generated_by: 'rule' });
  } catch (error) {
    console.error('Creative generation error:', error);
    return NextResponse.json({ error: '소재 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
}
