import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrl } from '@/lib/smarcomm/seo-analyzer';
import { computeIndex } from '@/lib/smarcomm/index-calculator';
import { runAIProbes } from '@/lib/smarcomm/ai-probes';
import { extractFromSite, type BrandFacts } from '@/lib/smarcomm/analyzers/fact-extractor';
import { analyzeSchema } from '@/lib/smarcomm/analyzers/schema-validator';
import { generateSchemaSuggestions } from '@/lib/smarcomm/schema-generator';
import { generateExecSummary, buildActionPlanLLM } from '@/lib/smarcomm/exec-summary';
import { computeBrandJourney } from '@/lib/smarcomm/brand-journey';
import { detectFlagsFromProbes, suggestActionsLLM } from '@/lib/smarcomm/airm';
import { computeDiscoveryDetail } from '@/lib/smarcomm/diagnostics-v21';
import { analyzeBrandPersonalityLLM } from '@/lib/smarcomm/brand-personality-llm';
import { createAdminClient } from '@/lib/supabase/admin';

// short_id 생성 — URL friendly 12자 (충돌 확률 무시 가능)
function generateShortId(length = 12): string {
  const chars = 'abcdefghijkmnopqrstuvwxyz23456789'; // 헷갈리는 문자(0,1,l,o) 제외
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, requester_email, industry } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL이 필요합니다' }, { status: 400 });
    }

    // URL 정규화
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: '유효하지 않은 URL입니다' }, { status: 400 });
    }

    // 분석 → 자사 사실 추출 → AI Probe (Phase 2.5 sequential)
    const domain = extractDomain(normalizedUrl);

    const result = await analyzeUrl(normalizedUrl, {
      pageSpeedApiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    if (result.statusCode === 0) {
      return NextResponse.json(
        { error: '사이트에 접속할 수 없습니다. URL을 확인해주세요.' },
        { status: 422 }
      );
    }

    // 자사 사실 추출 + Schema 자동 생성 (Phase 2.5 + 3.1)
    let siteTruth: BrandFacts | null = null;
    let schemaSuggestions: ReturnType<typeof generateSchemaSuggestions> = [];
    try {
      const htmlRes = await fetch(normalizedUrl, { signal: AbortSignal.timeout(8000) }).catch(() => null);
      const html = htmlRes ? await htmlRes.text() : '';
      if (html) {
        const schemaInfo = analyzeSchema(html);
        siteTruth = extractFromSite(html, schemaInfo.found, {
          title: result.deep?.pageDetails.title,
          description: result.deep?.pageDetails.metaDescription,
          ogTitle: result.deep?.pageDetails.ogTitle,
          ogDescription: result.deep?.pageDetails.ogDescription,
        });
        // Phase 3.1 — Schema JSON-LD 자동 생성
        schemaSuggestions = generateSchemaSuggestions({
          domain,
          url: normalizedUrl,
          siteName: result.deep?.pageDetails.title?.split(/[—|–\-]/)[0].trim(),
          siteTruth,
          title: result.deep?.pageDetails.title,
          description: result.deep?.pageDetails.metaDescription,
          ogImage: result.deep?.pageDetails.ogImage,
          existingTypes: schemaInfo.foundTypes,
        });
      }
    } catch (e) {
      console.error('[smarcomm/scan] siteTruth/schema extraction failed:', e);
    }

    const aiProbeReport = await runAIProbes(domain, siteTruth, industry).catch((e) => {
      console.error('[smarcomm/scan] AI probes failed:', e);
      return null;
    });

    // AI Probe 결과를 result.geoChecks로 반영 (5 플랫폼 실측 → 추정 대체)
    if (aiProbeReport) {
      result.geoChecks = Object.values(aiProbeReport.platforms).map(p => ({
        platform: p.platform,
        mentioned: !p.skipped && p.summary.mentionCount > 0,
        details: p.skipped
          ? `📋 ${p.skipReason}`
          : `실측 ${p.summary.mentionCount}/${p.summary.totalQueries} 언급 · 평균 순위 ${p.summary.avgPosition ? p.summary.avgPosition.toFixed(1) : 'N/A'}`,
        skipped: p.skipped,   // V2.1 정직성 — Citability 분모 정규화용
      }));
    }

    // SmarComm Index 계산 (SSOT) — AI probe 반영 후
    const breakdown = computeIndex(result);

    // Phase 3 부가 데이터 — schemaSuggestions + actionPlan + execSummary를 breakdown에 보존
    // V2.1 § 1.10 정직 — buildActionPlan(18 룰 휴리스틱) 폐기, LLM 추천으로 교체
    const actionPlan = await buildActionPlanLLM(result, breakdown).catch(() => null);
    const execSummary = await generateExecSummary(result, breakdown).catch(() => null);

    // V2.0 § 3-A SSOT-6 — AI Brand Journey 4지표 + 6 차원 계산 (probe 있을 때만)
    const brandJourney = aiProbeReport ? computeBrandJourney(aiProbeReport) : null;

    // V2.1 § 3-A SSOT-7 — Discovery sub-engine detail (AI SOV·인용 출처·할루시네이션)
    const discoveryDetail = aiProbeReport ? await computeDiscoveryDetail(aiProbeReport) : null;

    // V2.1 § 1.10 — Brand Personality LLM 동적 분석 (36 유형 임의 매핑 폐기)
    const allCards = [...result.techSeo, ...result.contentSeo, ...result.geoReadiness];
    const topPassing = allCards.filter(i => i.maxScore > 0 && i.score / i.maxScore >= 0.9).slice(0, 5);
    const topFailing = allCards.filter(i => i.maxScore > 0 && i.score / i.maxScore < 0.4).slice(0, 5);
    const brandPersonality = await analyzeBrandPersonalityLLM(
        { index: breakdown.index, findability: breakdown.findability, trust: breakdown.trust, citability: breakdown.citability },
        topPassing,
        topFailing,
    ).catch(() => null);

    breakdown.schemaSuggestions = schemaSuggestions;
    breakdown.actionPlan = actionPlan;
    breakdown.execSummary = execSummary;
    breakdown.brandJourney = brandJourney;
    breakdown.discoveryDetail = discoveryDetail;
    breakdown.brandPersonality = brandPersonality;

    // ── DB 저장 ──
    let shortId: string | null = null;
    try {
      const admin = createAdminClient();
      const domain = extractDomain(normalizedUrl);
      // short_id 충돌 회피 — 최대 3회 재시도
      for (let attempt = 0; attempt < 3; attempt++) {
        const candidate = generateShortId();
        const { error: insertError } = await admin
          .from('smarcomm_scans')
          .insert({
            short_id: candidate,
            requester_email: requester_email?.trim() || null,
            url: normalizedUrl,
            domain,
            industry: industry?.trim() || null,
            smarcomm_index: breakdown.index,
            findability_score: breakdown.findability,
            trust_score: breakdown.trust,
            citability_score: breakdown.citability,
            performance_score: result.performanceScore,
            grade: breakdown.grade,
            fetch_time_ms: result.fetchTime,
            status_code: result.statusCode,
            pages_analyzed: result.pagesAnalyzed ?? 1,
            favicon_url: result.faviconUrl,
            analysis: result,
            breakdown: breakdown,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일
          });

        if (!insertError) {
          shortId = candidate;
          break;
        }
        // unique 충돌이면 재시도, 그 외에는 break
        if (!insertError.message?.includes('duplicate') && !insertError.message?.includes('unique')) {
          console.error('[smarcomm/scan] DB insert failed:', insertError.message);
          break;
        }
      }

      // 서브페이지 + AI probe 결과 저장
      if (shortId) {
        // scan_id 조회
        const { data: scanRow } = await admin
          .from('smarcomm_scans')
          .select('id')
          .eq('short_id', shortId)
          .single();

        if (scanRow?.id) {
          // 서브페이지
          if (result.subPages && result.subPages.length > 0) {
            await admin.from('smarcomm_scan_pages').insert(
              result.subPages.map(p => ({
                scan_id: scanRow.id,
                url: p.url,
                title: p.title || null,
                has_meta_description: p.hasMetaDescription,
                has_h1: p.hasH1,
                text_length: p.textLength,
                img_count: p.imgCount,
                img_with_alt: p.imgWithAlt,
                status_code: p.statusCode || null,
                issues: p.issues || [],
              }))
            );
          }

          // AI Probe 응답들 — 5 플랫폼 × N 질문
          if (aiProbeReport) {
            const allAnswers = Object.values(aiProbeReport.platforms)
              .filter(p => !p.skipped)
              .flatMap(p => p.answers);

            // V2.0 § 3-C AIRM — 자동 flag 생성 + 권장 액션 INSERT
            try {
              const detectedFlags = detectFlagsFromProbes(allAnswers);
              if (detectedFlags.length > 0) {
                const tenantId = body.tenant_id ?? 'tenone-demo';
                const { data: flagRows } = await admin
                  .from('smarcomm_ai_flags')
                  .insert(detectedFlags.map(f => ({
                    tenant_id: tenantId,
                    probe_scan_id: scanRow.id,
                    platform: f.platform,
                    query: f.query,
                    response_excerpt: f.response_excerpt,
                    flag_type: f.flag_type,
                    severity: f.severity,
                    confidence: f.confidence,
                    notes: f.notes ?? null,
                  })))
                  .select('id, flag_type');
                // 각 flag → LLM 권장 액션 자동 등록 (§ 1.10 정직 원칙 — 휴리스틱 폐기)
                if (flagRows && flagRows.length > 0) {
                  const brand = domain.replace(/^www\./, '').split('.')[0];
                  const actionRows: Record<string, unknown>[] = [];
                  // 병렬 LLM 호출 — 각 flag별 추천
                  const suggestions = await Promise.all(
                    flagRows.map(async (_, i) => {
                      const detected = detectedFlags[i];
                      if (!detected) return null;
                      return suggestActionsLLM(detected, brand);
                    })
                  );
                  for (let i = 0; i < flagRows.length; i++) {
                    const fr = flagRows[i];
                    const sugs = suggestions[i];
                    if (!sugs || sugs.length === 0) continue;
                    for (const s of sugs) {
                      const descWithReason = s.reason
                        ? `${s.description}\n\n🤖 LLM 판정: ${s.reason}`
                        : s.description;
                      actionRows.push({
                        flag_id: fr.id,
                        tenant_id: tenantId,
                        action_type: s.action_type,
                        title: s.title,
                        description: descWithReason,
                        role: s.role,
                        expected_axis: s.expected_axis,
                        expected_impact: s.expected_impact,
                        status: 'todo',
                      });
                    }
                  }
                  if (actionRows.length > 0) {
                    await admin.from('smarcomm_airm_actions').insert(actionRows);
                  }
                }
              }
            } catch (airmErr) {
              console.error('[smarcomm/scan] AIRM auto-flag failed:', airmErr);
            }

            if (allAnswers.length > 0) {
              await admin.from('smarcomm_ai_probes').insert(
                allAnswers.map(a => ({
                  scan_id: scanRow.id,
                  platform: a.platform,
                  category: a.category,
                  query: a.query,
                  raw_response: a.rawResponse,
                  citations: a.citations || null,
                  mentioned: a.detection.mentioned,
                  position: a.detection.position,
                  accuracy: a.detection.accuracy,
                  // V2.0 § 3-A SSOT-6 — sentiment/reasoning/attributes도 extracted_facts JSONB에 함께 저장
                  extracted_facts: (a.detection.extractedFacts || a.detection.factComparison || a.detection.sentiment || a.detection.reasoning || a.detection.attributes)
                    ? {
                        facts: a.detection.extractedFacts,
                        comparison: a.detection.factComparison,
                        sentiment: a.detection.sentiment,
                        sentimentConfidence: a.detection.sentimentConfidence,
                        reasoning: a.detection.reasoning,
                        attributes: a.detection.attributes,
                      }
                    : null,
                  measured_at: a.measuredAt,
                  cost_usd: a.costUsd || null,
                }))
              );
            }
          }
        }
      }
    } catch (dbErr) {
      // DB 실패해도 분석 결과는 응답 (best-effort 저장)
      console.error('[smarcomm/scan] DB save error:', dbErr);
    }

    // 응답 — 기존 결과 + Index breakdown + share ID
    return NextResponse.json({
      ...result,
      breakdown,
      shortId,
      reportUrl: shortId ? `/smarcomm/report/${shortId}` : null,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
