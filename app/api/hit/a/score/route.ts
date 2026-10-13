import { NextRequest } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitAResult } from '@/lib/supabase/hit';
import { scorePT, scoreBT, scoreCH, scoreAP, scoreUF, summarizeUF, match64Type, calcSpower8d, scoreMBTI, scoreDISC, detectDistortion, computeCrossPatterns, type UFQuestionMeta } from '@/lib/hit/scoring';
import { createAdminClient } from '@/lib/supabase/admin';
import { HIT_A_UF_MODULE } from '@/lib/hit/a-modules';
import { selectModules } from '@/lib/hit/report-assembler';
import { canAccess } from '@/lib/hit/membership';
import { getMembershipTier } from '@/lib/hit/membership-server';
import Anthropic from '@anthropic-ai/sdk';
import { HIT_NARRATIVE_MODEL } from '@/lib/hit/ai';
import { applyHeroTypeFromDb } from '@/lib/hit/hero-type';

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
    // 본인 세션만 채점 (2026-10-12)
    const auth = await requireMember(request);
    if (auth instanceof Response) return auth;
    if (session.member_id !== auth.memberId) return errorResponse('세션을 찾을 수 없습니다.', 404);

    if (session.status !== 'in_progress') {
      return errorResponse('이미 완료된 세션입니다.', 400);
    }

    const responses = await getHitResponses(session.id);
    if (responses.length === 0) {
      return errorResponse('응답 데이터가 없습니다.', 400);
    }

    // 채점 — PT + BT + CH + AP → S-Power 4모듈 교차
    const pt = scorePT(responses);
    const bt = scoreBT(responses);
    const ch = scoreCH(responses);
    const ap = scoreAP(responses);

    // UF 기저요인 — 회원 세션만, 문항 메타는 DB 원천. 회원 리포트 전용 (S-Power·매칭 미사용, 2026-10-12)
    let uf: ReturnType<typeof scoreUF> = null;
    if (session.member_id) {
      const { data: ufMeta } = await createAdminClient()
        .from('hit_questions')
        .select('id, sub_domain, reverse_scored, scoring_key')
        .eq('test_type', 'A')
        .eq('module', HIT_A_UF_MODULE);
      uf = scoreUF(responses, (ufMeta ?? []) as UFQuestionMeta[]);
    }
    const ufSummary = uf ? (summarizeUF(uf) || null) : null;

    // 하위 호환 (64유형 매칭, 리포트 모듈 선택에 사용)
    const mbti = scoreMBTI(responses);  // PT 래핑
    const disc = scoreDISC(responses);  // BT 래핑
    const typeProfile = await applyHeroTypeFromDb(match64Type(mbti, disc)); // 유형 이름·별명·특성·방향 = DB hit_hero_types (2026-10-13)

    // S-Power: 4모듈 교차 (UF 제외)
    const sPower = calcSpower8d(pt, bt, ch, ap);

    // DISC × MBTI 교차 패턴 8개
    const crossPatterns = computeCrossPatterns(bt, pt);

    // PT 강도 등급 저장용
    const ptGrades = {
      e: pt.eGrade, n: pt.nGrade, t: pt.tGrade, j: pt.jGrade,
    };

    // 왜곡 탐지 (관리자 전용 — 내담자 비노출)
    const distortion = detectDistortion(responses, pt);

    // AI 내러티브 (실패해도 결과 생성 진행)
    let aiNarrative: string | null = null;
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found');
      const anthropic = new Anthropic({ apiKey });
      const msg = await anthropic.messages.create({
        model: HIT_NARRATIVE_MODEL,
        max_tokens: 1000,
        system: 'You are a personality assessment expert. Write in Korean. Provide a warm, insightful 2-3 paragraph analysis. 절대 이모지, 이모티콘, 특수문자(★●▶ 등)를 사용하지 마세요. 순수 텍스트만 사용하세요. 마크다운 헤딩(#)도 사용하지 마세요.',
        messages: [{
          role: 'user',
          content: `Analyze this personality profile:\n` +
            `PT(성격): ${pt.type} (E${pt.eScore} N${pt.nScore} T${pt.tScore} J${pt.jScore})\n` +
            `BT(행동): ${bt.primary} (D${bt.d} I${bt.i} S${bt.s} C${bt.c})\n` +
            `64유형: ${typeProfile.code} "${typeProfile.nameKo}"\n` +
            `CH(인성): 성실성${ch.integrity} 대인관계${ch.relational} 정서안정${ch.emotional} 윤리성${ch.ethics} 성장지향${ch.growth}\n` +
            `AP(적성): Top3=${ap.top3Code} (R${ap.R} I${ap.I} A${ap.A} S${ap.S} E${ap.E} C${ap.C})\n` +
            `S-Power: 전략${sPower.strategic} 실행${sPower.execution} 창의${sPower.creativity} 대인${sPower.interpersonal} 분석${sPower.analytical} 화합${sPower.harmony} 돌파${sPower.breakthrough} 원칙${sPower.guard}\n` +
            (ufSummary ? `기저요인: ${ufSummary}\n` : '') + `\n` +
            `검사 결과를 통합하여 이 사람의 성격·강점·적성을 한국어로 2-3단락 분석해주세요.`,
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
      sPowerScores: sPower as unknown as Record<string, number>,
      ufScores: uf ?? undefined,
      ufTraumaExposure: uf?.traumaExposure ?? null,
      apTop3Code: ap.top3Code,
      chScores: { integrity: ch.integrity, relational: ch.relational, emotional: ch.emotional, ethics: ch.ethics, growth: ch.growth },
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
      disc_intensity: bt.intensity,
      base_summary: ufSummary,
      base_scores: uf ?? {},
      type_code: typeProfile.code,
      type_name_ko: typeProfile.nameKo,
      type_nickname: typeProfile.nickname,
      type_category: typeProfile.category,
      type_traits: typeProfile.traits,
      type_careers: typeProfile.careers,
      ai_narrative: aiNarrative,
      s_power_scores: sPower,
      modules_used: modulesUsed,
      // UF 기저요인 9영역 (비회원 = null)
      uf_sibling: uf?.sibling ?? null,
      uf_parent: uf?.parent ?? null,
      uf_family: uf?.family ?? null,
      uf_peer: uf?.peer ?? null,
      uf_self: uf?.self ?? null,
      uf_temperament: uf?.temperament ?? null,
      uf_economic: uf?.economic ?? null,
      uf_trauma: uf?.trauma ?? null,
      uf_cultural: uf?.cultural ?? null,
      uf_trauma_exposure: uf?.traumaExposure ?? null, // 전환점 게이트 (2026-10-13)
      // CH core 5영역 (신규)
      ch_integrity: ch.integrity,
      ch_relational: ch.relational,
      ch_emotional: ch.emotional,
      ch_ethics: ch.ethics,
      ch_growth: ch.growth,
      // AP core 적성
      ap_top3_code: ap.top3Code,
      ap_scores: ap.scores,
      // 교차 패턴 + PT 강도 등급
      cross_patterns: crossPatterns,
      pt_grades: ptGrades,
    });

    // 응답 품질 신호 — 운영자 전용, 결과·매칭에 쓰지 않는다 (/hero/hit/method 5항)
    // '다크 트라이어드' 사전 플래그는 2026-10-12 폐지: 주도성 문항 몇 개로 성격장애 경향을 추정하는 것은 타당도 근거가 없다
    const hasAdminFlag = distortion.fakingFlag || distortion.inconsistencyFlag || distortion.patternFlag;

    if (hasAdminFlag) {
      try {
        const { createAdminClient: createClient } = await import('@/lib/supabase/admin');
        const supabase = await createClient();

        // 왜곡 탐지: faking + inconsistency + pattern
        if (distortion.fakingFlag || distortion.inconsistencyFlag || distortion.patternFlag) {
          await supabase.from('hit_admin_flags').insert({
            member_id: session.member_id || null,
            session_id: session.id,
            flag_type: 'distortion',
            flag_score: [
              distortion.fakingFlag       ? 40 : 0,
              distortion.inconsistencyFlag ? 35 : 0,
              distortion.patternFlag       ? 25 : 0,
            ].reduce((a, b) => a + b, 0),
            flag_detail: {
              faking:        distortion.fakingFlag,
              inconsistency: distortion.inconsistencyFlag,
              pattern:       distortion.patternFlag,
              ...distortion.detail,
            },
          });
        }
      } catch (flagErr) {
        console.warn('[HIT A Score] 플래그 저장 실패 (결과 저장은 완료됨):', flagErr);
      }
    }

    // 세션 완료 처리
    await updateHitSession(sessionToken, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    // 멤버십 tier에 따른 응답 모드 결정
    const tier = await getMembershipTier(session.member_id);
    const resultMode = canAccess(tier, 'HIT_A_RESULT_FULL') ? 'full' : 'teaser';

    return successResponse({ resultId: result.id, resultMode, tier }, 201);
  } catch (error) {
    console.error('[HIT A Score] 채점 오류:', error);
    return errorResponse('채점 처리 실패', 500); // 내부 오류 문구는 로그로만 (2026-10-12)
  }
}
