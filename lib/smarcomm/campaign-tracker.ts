// 캠페인 실행 추적 + Before/After 비교 + 개선 제안

import type { AnalysisResult } from './seo-analyzer';
import type { CampaignPlan } from './campaign-plan';

// 액션 실행 상태 추적
export interface ActionExecution {
  action_index: number;
  title: string;
  channel: string;
  status: 'pending' | 'in_progress' | 'published' | 'completed';
  published_url?: string;       // 게시된 URL
  published_at?: string;
  notes?: string;
}

// 캠페인 실행 전체 상태
export interface CampaignExecution {
  id: string;
  plan_id: string;
  scan_url: string;
  created_at: string;

  // Before 스캔 (기획서 생성 시점)
  before_scan: {
    scanned_at: string;
    total_score: number;
    seo_score: number;
    geo_score: number;
    performance_score: number;
  };

  // After 스캔 (재스캔 시점)
  after_scan?: {
    scanned_at: string;
    total_score: number;
    seo_score: number;
    geo_score: number;
    performance_score: number;
  };

  // 각 액션 실행 상태
  actions: ActionExecution[];

  // 모니터링 알림
  alerts: MonitoringAlert[];

  // AI 개선 제안
  improvement_suggestions?: string[];
}

export interface MonitoringAlert {
  id: string;
  type: 'score_change' | 'action_reminder' | 'opportunity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

// Before/After 점수 변화 계산
export function calculateScoreChanges(before: CampaignExecution['before_scan'], after: CampaignExecution['after_scan']) {
  if (!after) return null;

  return {
    total: { before: before.total_score, after: after.total_score, change: after.total_score - before.total_score },
    seo: { before: before.seo_score, after: after.seo_score, change: after.seo_score - before.seo_score },
    geo: { before: before.geo_score, after: after.geo_score, change: after.geo_score - before.geo_score },
    performance: { before: before.performance_score, after: after.performance_score, change: after.performance_score - before.performance_score },
  };
}

// 알림 생성 (점수 변화 기반)
export function generateAlerts(changes: ReturnType<typeof calculateScoreChanges>, execution: CampaignExecution): MonitoringAlert[] {
  if (!changes) return [];
  const alerts: MonitoringAlert[] = [];
  const now = new Date().toISOString();

  if (changes.total.change > 10) {
    alerts.push({
      id: Math.random().toString(36).substring(2, 8),
      type: 'score_change',
      severity: 'info',
      title: '종합 점수 크게 상승!',
      message: `종합 점수가 ${changes.total.before}점에서 ${changes.total.after}점으로 ${changes.total.change}점 상승했습니다.`,
      created_at: now,
      read: false,
    });
  }

  if (changes.total.change < -5) {
    alerts.push({
      id: Math.random().toString(36).substring(2, 8),
      type: 'score_change',
      severity: 'warning',
      title: '종합 점수 하락 감지',
      message: `종합 점수가 ${changes.total.before}점에서 ${changes.total.after}점으로 ${Math.abs(changes.total.change)}점 하락했습니다. 원인을 확인하세요.`,
      created_at: now,
      read: false,
    });
  }

  if (changes.seo.change > 15) {
    alerts.push({
      id: Math.random().toString(36).substring(2, 8),
      type: 'score_change',
      severity: 'info',
      title: 'SEO 점수 대폭 개선',
      message: `SEO 점수가 ${changes.seo.before}→${changes.seo.after}로 ${changes.seo.change}점 상승. 적용한 개선사항이 효과를 보고 있습니다.`,
      created_at: now,
      read: false,
    });
  }

  // 미완료 액션 알림
  const pendingActions = execution.actions.filter(a => a.status === 'pending' || a.status === 'in_progress');
  if (pendingActions.length > 0 && execution.after_scan) {
    alerts.push({
      id: Math.random().toString(36).substring(2, 8),
      type: 'action_reminder',
      severity: 'info',
      title: `미완료 액션 ${pendingActions.length}개`,
      message: `아직 실행하지 않은 액션: ${pendingActions.map(a => a.title).join(', ')}`,
      created_at: now,
      read: false,
    });
  }

  return alerts;
}

// AI 개선 제안 생성 (규칙 기반 — Claude 대체)
export function generateImprovementSuggestions(
  changes: ReturnType<typeof calculateScoreChanges>,
  execution: CampaignExecution
): string[] {
  if (!changes) return ['재스캔을 실행하면 Before/After 비교가 가능합니다.'];

  const suggestions: string[] = [];

  if (changes.total.change > 0) {
    suggestions.push(`종합 점수가 ${changes.total.change}점 상승했습니다. 현재 전략이 효과적이므로 계속 진행하세요.`);
  }

  if (changes.seo.change < 5 && execution.actions.some(a => a.status === 'published')) {
    suggestions.push('SEO 개선이 미미합니다. 구조화 데이터(JSON-LD)와 메타태그를 다시 점검해보세요.');
  }

  if (changes.geo.change < 3) {
    suggestions.push('AI 검색 노출(GEO)은 콘텐츠 축적이 필요합니다. 블로그 글을 꾸준히 발행하세요.');
  }

  if (changes.performance.change < 0) {
    suggestions.push('성능이 하락했습니다. 이미지 최적화와 불필요한 스크립트를 제거하세요.');
  }

  const completedRate = execution.actions.filter(a => a.status === 'published' || a.status === 'completed').length / execution.actions.length;
  if (completedRate < 0.5) {
    suggestions.push(`실행률 ${Math.round(completedRate * 100)}%. 남은 액션을 완료하면 더 큰 효과를 기대할 수 있습니다.`);
  }

  if (changes.total.after >= 70) {
    suggestions.push('목표 점수(70점)에 도달했습니다! 다음 단계로 광고 매체 연동을 고려해보세요.');
  }

  return suggestions.length > 0 ? suggestions : ['현재 상태를 유지하면서 주기적으로 재스캔하세요.'];
}

// sessionStorage 키
const EXECUTION_KEY = 'campaignExecution';

export function saveExecution(exec: CampaignExecution) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(EXECUTION_KEY, JSON.stringify(exec));
  }
}

export function loadExecution(): CampaignExecution | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(EXECUTION_KEY);
  return stored ? JSON.parse(stored) : null;
}

// 캠페인 기획서 → 실행 추적 객체 생성
export function createExecution(plan: CampaignPlan, scanResult: AnalysisResult): CampaignExecution {
  return {
    id: Math.random().toString(36).substring(2, 10),
    plan_id: plan.id,
    scan_url: plan.scan_url,
    created_at: new Date().toISOString(),
    before_scan: {
      scanned_at: new Date().toISOString(),
      total_score: scanResult.totalScore,
      seo_score: scanResult.seoScore,
      geo_score: scanResult.geoScore,
      performance_score: scanResult.performanceScore,
    },
    actions: plan.actions.map(a => ({
      action_index: a.order,
      title: a.title,
      channel: a.channel,
      status: 'pending' as const,
    })),
    alerts: [],
  };
}
