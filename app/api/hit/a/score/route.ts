import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitAResult } from '@/lib/supabase/hit';
import { scoreMBTI, scoreDISC, scoreBase, scoreUF, match64Type, deriveSPower } from '@/lib/hit/scoring';
import { selectModules } from '@/lib/hit/report-assembler';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return errorResponse('sessionToken은 필수입니다.', 400);
    }

    const session = await getHitSession(sessionToken);
    if (!session) {
      return errorResponse('세션을 찾을 수 없습니다.', 404);
    }

    if (session.status !== 'in_progress') {
      return errorResponse('이미 완료된 세션입니다.', 400);
    }

    const responses = await getHitResponses(session.id);
    if (responses.length === 0) {
      return errorResponse('응답 데이터가 없습니다.', 400);
    }

    // 채점
    const mbti = scoreMBTI(responses);
    const disc = scoreDISC(responses);
    const base = scoreBase(responses);
    const uf = scoreUF(responses);
    const typeProfile = match64Type(mbti, disc);
    const sPower = deriveSPower(mbti, disc);

    // AI 내러티브 (실패해도 결과 생성 진행)
    let aiNarrative: string | null = null;
    try {
      let apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        try {
          const fs = require('fs'), path = require('path');
          const envPath = path.join(process.cwd(), '.env.local');
          if (fs.existsSync(envPath)) {
            for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
              if (line.startsWith('ANTHROPIC_API_KEY=')) {
                apiKey = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                break;
              }
            }
          }
        } catch {}
      }
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found');
      const anthropic = new Anthropic({ apiKey });
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: 'You are a personality assessment expert. Write in Korean. Provide a warm, insightful 2-3 paragraph analysis. 절대 이모지, 이모티콘, 특수문자(★●▶ 등)를 사용하지 마세요. 순수 텍스트만 사용하세요. 마크다운 헤딩(#)도 사용하지 마세요.',
        messages: [{
          role: 'user',
          content: `Analyze this personality profile:\n` +
            `MBTI: ${mbti.type} (E${mbti.eScore} S${mbti.sScore} T${mbti.tScore} J${mbti.jScore})\n` +
            `DISC: ${disc.primary} (subtype: ${disc.subtype}, D${disc.d} I${disc.i} S${disc.s} C${disc.c})\n` +
            `64 Type: ${typeProfile.code} "${typeProfile.nameKo}"\n` +
            `S-Power: Strategic${sPower.strategic} Execution${sPower.execution} Creativity${sPower.creativity} Interpersonal${sPower.interpersonal} Analytical${sPower.analytical}\n` +
            `Base factor: ${base.summary}\n\n` +
            `Write a personalized narrative that weaves these results together into a coherent personality portrait.`,
        }],
      });
      const textBlock = msg.content.find(b => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        aiNarrative = textBlock.text;
      }
    } catch (aiError) {
      console.error('[HIT A Score] AI 내러티브 생성 실패:', aiError);
    }

    // 모듈 선택
    const modulesUsed = selectModules({
      discD: disc.d, discI: disc.i, discS: disc.s, discC: disc.c,
      discPrimary: disc.primary, discSubtype: disc.subtype,
      mbtiType: mbti.type,
      mbtiEScore: mbti.eScore, mbtiSScore: mbti.sScore,
      mbtiTScore: mbti.tScore, mbtiJScore: mbti.jScore,
      sPowerScores: sPower,
      ufScores: uf,
    });

    // 결과 저장
    const result = await createHitAResult({
      session_id: session.id,
      member_id: session.member_id || null,
      mbti_type: mbti.type,
      mbti_e_score: mbti.eScore,
      mbti_s_score: mbti.sScore,
      mbti_t_score: mbti.tScore,
      mbti_j_score: mbti.jScore,
      disc_primary: disc.primary,
      disc_subtype: disc.subtype,
      disc_d_score: disc.d,
      disc_i_score: disc.i,
      disc_s_score: disc.s,
      disc_c_score: disc.c,
      base_summary: base.summary,
      base_scores: base.scores,
      type_code: typeProfile.code,
      type_name_ko: typeProfile.nameKo,
      type_nickname: typeProfile.nickname,
      type_category: typeProfile.category,
      type_traits: typeProfile.traits,
      type_careers: typeProfile.careers,
      ai_narrative: aiNarrative,
      s_power_scores: sPower,
      modules_used: modulesUsed,
      // UF 기저요인 9영역
      uf_sibling: uf.sibling,
      uf_parent: uf.parent,
      uf_family: uf.family,
      uf_peer: uf.peer,
      uf_self: uf.self,
      uf_temperament: uf.temperament,
      uf_economic: uf.economic,
      uf_trauma: uf.trauma,
      uf_cultural: uf.cultural,
    });

    // 세션 완료 처리
    await updateHitSession(sessionToken, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    return successResponse({ resultId: result.id }, 201);
  } catch (error) {
    console.error('[HIT A Score] 채점 오류:', error);
    const message = error instanceof Error ? error.message : '채점 처리 실패';
    return errorResponse(message, 500);
  }
}
