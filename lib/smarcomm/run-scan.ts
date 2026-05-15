// SmarComm 전체 스캔 파이프라인 — scan/route.ts + cron rescan 공유
// V2.0 Phase 5 Item 1

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

function generateShortId(length = 12): string {
  const chars = 'abcdefghijkmnopqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export interface RunScanOptions {
  url: string;
  requester_email?: string | null;
  industry?: string | null;
  tenant_id?: string;
}

export interface RunScanResult {
  shortId: string | null;
  reportUrl: string | null;
  breakdown: ReturnType<typeof computeIndex>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export async function runFullScan(opts: RunScanOptions): Promise<RunScanResult> {
  const { url, requester_email, industry, tenant_id = 'tenone-demo' } = opts;

  const domain = extractDomain(url);

  const result = await analyzeUrl(url, {
    pageSpeedApiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });

  if (result.statusCode === 0) {
    throw new Error('사이트에 접속할 수 없습니다.');
  }

  // 자사 사실 추출 + Schema 자동 생성
  let siteTruth: BrandFacts | null = null;
  let schemaSuggestions: ReturnType<typeof generateSchemaSuggestions> = [];
  try {
    const htmlRes = await fetch(url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
    const html = htmlRes ? await htmlRes.text() : '';
    if (html) {
      const schemaInfo = analyzeSchema(html);
      siteTruth = extractFromSite(html, schemaInfo.found, {
        title: result.deep?.pageDetails.title,
        description: result.deep?.pageDetails.metaDescription,
        ogTitle: result.deep?.pageDetails.ogTitle,
        ogDescription: result.deep?.pageDetails.ogDescription,
      });
      schemaSuggestions = generateSchemaSuggestions({
        domain,
        url,
        siteName: result.deep?.pageDetails.title?.split(/[—|–\-]/)[0].trim(),
        siteTruth,
        title: result.deep?.pageDetails.title,
        description: result.deep?.pageDetails.metaDescription,
        ogImage: result.deep?.pageDetails.ogImage,
        existingTypes: schemaInfo.foundTypes,
      });
    }
  } catch (e) {
    console.error('[runFullScan] siteTruth/schema extraction failed:', e);
  }

  const aiProbeReport = await runAIProbes(domain, siteTruth, industry ?? undefined).catch((e) => {
    console.error('[runFullScan] AI probes failed:', e);
    return null;
  });

  if (aiProbeReport) {
    result.geoChecks = Object.values(aiProbeReport.platforms).map(p => ({
      platform: p.platform,
      mentioned: !p.skipped && p.summary.mentionCount > 0,
      details: p.skipped
        ? `📋 ${p.skipReason}`
        : `실측 ${p.summary.mentionCount}/${p.summary.totalQueries} 언급 · 평균 순위 ${p.summary.avgPosition ? p.summary.avgPosition.toFixed(1) : 'N/A'}`,
      skipped: p.skipped,
    }));
  }

  const breakdown = computeIndex(result);

  const actionPlan = await buildActionPlanLLM(result, breakdown).catch(() => null);
  const execSummary = await generateExecSummary(result, breakdown).catch(() => null);

  const brandJourney = aiProbeReport ? computeBrandJourney(aiProbeReport) : null;
  const discoveryDetail = aiProbeReport ? await computeDiscoveryDetail(aiProbeReport) : null;

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

  // DB 저장
  let shortId: string | null = null;
  try {
    const admin = createAdminClient();
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = generateShortId();
      const { error: insertError } = await admin
        .from('smarcomm_scans')
        .insert({
          short_id: candidate,
          requester_email: requester_email?.trim() || null,
          url,
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
          breakdown,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (!insertError) {
        shortId = candidate;
        break;
      }
      if (!insertError.message?.includes('duplicate') && !insertError.message?.includes('unique')) {
        console.error('[runFullScan] DB insert failed:', insertError.message);
        break;
      }
    }

    if (shortId) {
      const { data: scanRow } = await admin
        .from('smarcomm_scans')
        .select('id')
        .eq('short_id', shortId)
        .single();

      if (scanRow?.id) {
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

        if (aiProbeReport) {
          const allAnswers = Object.values(aiProbeReport.platforms)
            .filter(p => !p.skipped)
            .flatMap(p => p.answers);

          try {
            const detectedFlags = detectFlagsFromProbes(allAnswers);
            if (detectedFlags.length > 0) {
              const { data: flagRows } = await admin
                .from('smarcomm_ai_flags')
                .insert(detectedFlags.map(f => ({
                  tenant_id: tenant_id,
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

              if (flagRows && flagRows.length > 0) {
                const brand = domain.replace(/^www\./, '').split('.')[0];
                const actionRows: Record<string, unknown>[] = [];
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
                      tenant_id,
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
            console.error('[runFullScan] AIRM auto-flag failed:', airmErr);
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
    console.error('[runFullScan] DB save error:', dbErr);
  }

  return {
    ...result,
    breakdown,
    shortId,
    reportUrl: shortId ? `/smarcomm/report/${shortId}` : null,
  };
}
