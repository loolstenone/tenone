/**
 * Culture Engine — WIO Orbi
 *
 * 조직 문화 핵심가치 관리, 가치 정합성 평가, 문화 건강도 측정.
 * 현재는 키워드 매칭 기반 (AI 미사용).
 *
 * Supabase 테이블: wio_culture_values, wio_culture_metrics (없으면 에러 핸들링)
 */

import { createClient } from '@/lib/supabase/client';

/* ══════════════════════════════════════════
   타입 정의
   ══════════════════════════════════════════ */

/** 핵심가치 */
export interface CultureValue {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  /** 행동 지표 — 이 가치를 실천하는 구체적 행동 목록 */
  behavioralIndicators: string[];
  /** 가중치 (0~1, 전체 합 = 1) */
  weight: number;
  /** 아이콘 이모지 또는 Lucide 아이콘명 */
  icon?: string;
  /** 활성 여부 */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 가치 정합성 평가 결과 */
export interface CultureFitResult {
  /** 종합 점수 (0~100) */
  score: number;
  /** 가치별 상세 피드백 */
  feedback: string[];
  /** 가치별 점수 */
  valueScores: { valueId: string; valueName: string; score: number; matchedKeywords: string[] }[];
}

/** 문화 건강도 지표 */
export interface CultureHealth {
  /** 핵심가치 활용도 — 문서/보고서에서 가치 키워드 언급 빈도 (0~100) */
  valueUsage: number;
  /** 양식 준수율 — 표준 양식 사용 비율 (0~100) */
  templateCompliance: number;
  /** 피드백 활성도 — 월간 피드백 참여율 (0~100) */
  feedbackActivity: number;
  /** 미팅 효율 — 미팅 시간 대비 결정 수 (0~100) */
  meetingEfficiency: number;
  /** 온보딩 완료율 — 신규 입사자 온보딩 프로세스 완료율 (0~100) */
  onboardingRate: number;
  /** 종합 점수 (가중 평균) */
  overallScore: number;
}

/* ══════════════════════════════════════════
   Supabase 헬퍼
   ══════════════════════════════════════════ */

function toCamel<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
  }
  return result as T;
}

/* ══════════════════════════════════════════
   핵심가치 CRUD
   ══════════════════════════════════════════ */

/** 핵심가치 목록 조회 */
export async function fetchCultureValues(
  tenantId: string,
): Promise<CultureValue[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from('wio_culture_values')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('weight', { ascending: false });

  if (error) {
    console.error('[culture] 핵심가치 조회 실패:', error.message);
    return [];
  }

  return (data || []).map((r: Record<string, unknown>) => {
    const v = toCamel<CultureValue>(r);
    // behavioral_indicators는 JSON 배열 컬럼
    if (typeof v.behavioralIndicators === 'string') {
      v.behavioralIndicators = JSON.parse(v.behavioralIndicators as unknown as string);
    }
    if (!Array.isArray(v.behavioralIndicators)) {
      v.behavioralIndicators = [];
    }
    return v;
  });
}

/** 핵심가치 생성/수정 */
export async function upsertCultureValue(
  tenantId: string,
  value: Partial<CultureValue>,
): Promise<CultureValue | null> {
  const sb = createClient();
  const now = new Date().toISOString();

  const row: Record<string, unknown> = {
    tenant_id: tenantId,
    name: value.name,
    description: value.description || '',
    behavioral_indicators: JSON.stringify(value.behavioralIndicators || []),
    weight: value.weight ?? 0.2,
    icon: value.icon || null,
    is_active: value.isActive ?? true,
    updated_at: now,
  };

  if (!value.id) {
    // 신규 생성
    row.created_at = now;
    const { data, error } = await sb
      .from('wio_culture_values')
      .insert(row)
      .select()
      .single();
    if (error) {
      console.error('[culture] 가치 생성 실패:', error.message);
      return null;
    }
    return parseCultureValue(data as Record<string, unknown>);
  }

  // 수정
  const { data, error } = await sb
    .from('wio_culture_values')
    .update(row)
    .eq('id', value.id)
    .select()
    .single();
  if (error) {
    console.error('[culture] 가치 수정 실패:', error.message);
    return null;
  }
  return parseCultureValue(data as Record<string, unknown>);
}

/** 핵심가치 비활성화 (소프트 삭제) */
export async function deleteCultureValue(valueId: string): Promise<boolean> {
  const sb = createClient();
  const { error } = await sb
    .from('wio_culture_values')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', valueId);

  if (error) {
    console.error('[culture] 가치 삭제 실패:', error.message);
    return false;
  }
  return true;
}

/* ══════════════════════════════════════════
   가치 정합성 평가
   ══════════════════════════════════════════ */

/**
 * 문서 내용의 가치 정합성을 평가한다.
 *
 * 방식: 각 핵심가치의 behavioralIndicators 키워드를
 * documentContent에서 매칭하여 점수를 산출.
 *
 * @param tenantId  테넌트 ID
 * @param documentContent  평가 대상 문서 내용 (기안서, 보고서 등)
 * @param valueIds  평가할 가치 ID 목록 (빈 배열이면 전체)
 */
export async function evaluateCultureFit(
  tenantId: string,
  documentContent: string,
  valueIds: string[] = [],
): Promise<CultureFitResult> {
  // 핵심가치 조회
  let values = await fetchCultureValues(tenantId);
  if (valueIds.length > 0) {
    values = values.filter(v => valueIds.includes(v.id));
  }

  if (values.length === 0) {
    return { score: 0, feedback: ['등록된 핵심가치가 없습니다.'], valueScores: [] };
  }

  // 문서 내용 정규화 (소문자, 공백 정리)
  const normalizedContent = documentContent.toLowerCase().replace(/\s+/g, ' ');

  const valueScores: CultureFitResult['valueScores'] = [];
  const feedback: string[] = [];

  let weightedSum = 0;
  let totalWeight = 0;

  for (const val of values) {
    const indicators = val.behavioralIndicators || [];
    if (indicators.length === 0) {
      valueScores.push({ valueId: val.id, valueName: val.name, score: 0, matchedKeywords: [] });
      feedback.push(`[${val.name}] 행동 지표가 정의되지 않았습니다.`);
      continue;
    }

    // 키워드 매칭
    const matchedKeywords: string[] = [];
    for (const indicator of indicators) {
      const normalizedIndicator = indicator.toLowerCase();
      if (normalizedContent.includes(normalizedIndicator)) {
        matchedKeywords.push(indicator);
      }
    }

    // 매칭 비율로 점수 산출 (0~100)
    const matchRatio = matchedKeywords.length / indicators.length;
    const score = Math.round(matchRatio * 100);

    valueScores.push({ valueId: val.id, valueName: val.name, score, matchedKeywords });

    // 피드백 생성
    if (score >= 80) {
      feedback.push(`[${val.name}] 우수 (${score}점) - ${matchedKeywords.length}/${indicators.length}개 지표 매칭`);
    } else if (score >= 50) {
      feedback.push(`[${val.name}] 보통 (${score}점) - 추가 반영이 필요합니다.`);
    } else {
      feedback.push(`[${val.name}] 미흡 (${score}점) - 핵심가치 반영이 부족합니다.`);
    }

    weightedSum += score * val.weight;
    totalWeight += val.weight;
  }

  // 종합 점수 (가중 평균)
  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return { score: overallScore, feedback, valueScores };
}

/* ══════════════════════════════════════════
   문화 건강도 집계
   ══════════════════════════════════════════ */

/**
 * 문화 건강도 집계
 *
 * 실제 데이터가 있으면 DB에서 조회하고, 없으면 기본값을 반환한다.
 * wio_culture_metrics 테이블에 월별 스냅샷이 저장되는 구조.
 */
export async function getCultureHealth(
  tenantId: string,
): Promise<CultureHealth> {
  const sb = createClient();

  // 가장 최근 메트릭 조회
  const { data, error } = await sb
    .from('wio_culture_metrics')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // 데이터 없으면 기본값 (테이블 미생성 시에도 안전)
    return {
      valueUsage: 0,
      templateCompliance: 0,
      feedbackActivity: 0,
      meetingEfficiency: 0,
      onboardingRate: 0,
      overallScore: 0,
    };
  }

  const row = data as Record<string, unknown>;
  const valueUsage = Number(row.value_usage ?? 0);
  const templateCompliance = Number(row.template_compliance ?? 0);
  const feedbackActivity = Number(row.feedback_activity ?? 0);
  const meetingEfficiency = Number(row.meeting_efficiency ?? 0);
  const onboardingRate = Number(row.onboarding_rate ?? 0);

  // 종합 점수: 5개 지표 균등 가중
  const overallScore = Math.round(
    (valueUsage + templateCompliance + feedbackActivity + meetingEfficiency + onboardingRate) / 5,
  );

  return {
    valueUsage,
    templateCompliance,
    feedbackActivity,
    meetingEfficiency,
    onboardingRate,
    overallScore,
  };
}

/**
 * 문화 건강도 메트릭 저장 (월별 스냅샷)
 */
export async function saveCultureMetrics(
  tenantId: string,
  metrics: Omit<CultureHealth, 'overallScore'>,
): Promise<boolean> {
  const sb = createClient();
  const overallScore = Math.round(
    (metrics.valueUsage + metrics.templateCompliance + metrics.feedbackActivity
      + metrics.meetingEfficiency + metrics.onboardingRate) / 5,
  );

  const { error } = await sb.from('wio_culture_metrics').insert({
    tenant_id: tenantId,
    value_usage: metrics.valueUsage,
    template_compliance: metrics.templateCompliance,
    feedback_activity: metrics.feedbackActivity,
    meeting_efficiency: metrics.meetingEfficiency,
    onboarding_rate: metrics.onboardingRate,
    overall_score: overallScore,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[culture] 메트릭 저장 실패:', error.message);
    return false;
  }
  return true;
}

/* ══════════════════════════════════════════
   내부 유틸
   ══════════════════════════════════════════ */

function parseCultureValue(row: Record<string, unknown>): CultureValue {
  const v = toCamel<CultureValue>(row);
  if (typeof v.behavioralIndicators === 'string') {
    v.behavioralIndicators = JSON.parse(v.behavioralIndicators as unknown as string);
  }
  if (!Array.isArray(v.behavioralIndicators)) {
    v.behavioralIndicators = [];
  }
  return v;
}
