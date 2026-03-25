// 마케팅 대시보드 Mock 데이터
import { getChartColors } from '@/lib/smarcomm/chart-palette';

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: 'active' | 'paused' | 'ended' | 'draft';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate: string;
}

export interface Creative {
  id: string;
  type: 'text' | 'banner' | 'video';
  title: string;
  status: 'draft' | 'active' | 'archived';
  channel: string;
  createdAt: string;
}

export interface SalesEntry {
  month: string;
  revenue: number;
  adSpend: number;
  conversions: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'campaign' | 'video' | 'season' | 'content';
  color: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'lead' | 'meeting' | 'progress' | 'contract';
  lastContact: string;
  note: string;
}

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: '봄 시즌 프로모션', channel: '메타 (FB/IG)', status: 'active', budget: 3000000, spent: 1850000, impressions: 245000, clicks: 4800, conversions: 120, startDate: '2026-03-01', endDate: '2026-03-31' },
  { id: 'c2', name: '브랜드 인지도 캠페인', channel: '네이버 SA', status: 'active', budget: 2000000, spent: 980000, impressions: 180000, clicks: 3200, conversions: 85, startDate: '2026-03-10', endDate: '2026-04-10' },
  { id: 'c3', name: '신제품 런칭 영상광고', channel: '유튜브', status: 'draft', budget: 5000000, spent: 0, impressions: 0, clicks: 0, conversions: 0, startDate: '2026-04-01', endDate: '2026-04-30' },
  { id: 'c4', name: '리타겟팅 캠페인', channel: '구글 Ads', status: 'paused', budget: 1500000, spent: 720000, impressions: 95000, clicks: 1800, conversions: 45, startDate: '2026-02-15', endDate: '2026-03-15' },
  { id: 'c5', name: '카카오 친구 확보', channel: '카카오모먼트', status: 'ended', budget: 1000000, spent: 980000, impressions: 120000, clicks: 2400, conversions: 310, startDate: '2026-02-01', endDate: '2026-02-28' },
];

export const MOCK_CREATIVES: Creative[] = [
  { id: 'cr1', type: 'text', title: '봄 할인 네이버 SA 카피', status: 'active', channel: '네이버 SA', createdAt: '2026-03-15' },
  { id: 'cr2', type: 'banner', title: '신제품 인스타 배너 1080x1080', status: 'active', channel: '메타', createdAt: '2026-03-12' },
  { id: 'cr3', type: 'video', title: '브랜드 소개 15초 영상', status: 'draft', channel: '유튜브', createdAt: '2026-03-18' },
  { id: 'cr4', type: 'text', title: '리타겟팅 구글 RSA 헤드라인', status: 'active', channel: '구글', createdAt: '2026-03-10' },
  { id: 'cr5', type: 'banner', title: '카드뉴스 5장 세트', status: 'archived', channel: '메타', createdAt: '2026-03-05' },
];

export const MOCK_SALES: SalesEntry[] = [
  { month: '2025-10', revenue: 12000000, adSpend: 3500000, conversions: 180 },
  { month: '2025-11', revenue: 15000000, adSpend: 4200000, conversions: 220 },
  { month: '2025-12', revenue: 22000000, adSpend: 5800000, conversions: 350 },
  { month: '2026-01', revenue: 14000000, adSpend: 3800000, conversions: 195 },
  { month: '2026-02', revenue: 18000000, adSpend: 4500000, conversions: 260 },
  { month: '2026-03', revenue: 20000000, adSpend: 5200000, conversions: 290 },
];

const _cc = getChartColors(7);
const _typeColor: Record<string, string> = { campaign: _cc[0], season: _cc[2], video: _cc[1], content: _cc[3] };

export const MOCK_CALENDAR: CalendarEvent[] = [
  { id: 'e1', title: '봄 시즌 프로모션 시작', date: '2026-03-01', type: 'campaign', color: _typeColor.campaign },
  { id: 'e2', title: '화이트데이 이벤트', date: '2026-03-14', type: 'season', color: _typeColor.season },
  { id: 'e3', title: '브랜드 영상 촬영', date: '2026-03-20', type: 'video', color: _typeColor.video },
  { id: 'e4', title: '신제품 런칭', date: '2026-04-01', type: 'campaign', color: _typeColor.campaign },
  { id: 'e5', title: '블로그 콘텐츠 발행', date: '2026-03-25', type: 'content', color: _typeColor.content },
  { id: 'e6', title: '어린이날 캠페인 준비', date: '2026-04-20', type: 'season', color: _typeColor.season },
  { id: 'e7', title: '유튜브 영상광고 집행', date: '2026-04-05', type: 'video', color: _typeColor.video },
];

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: '김마케팅', company: '굿프레시 F&B', email: 'kim@goodfresh.co.kr', status: 'contract', lastContact: '2026-03-18', note: 'Lite 플랜 계약 완료' },
  { id: 'l2', name: '이브랜드', company: '스타일온 패션', email: 'lee@styleon.kr', status: 'progress', lastContact: '2026-03-20', note: '소재 제작 진행 중' },
  { id: 'l3', name: '박디지털', company: '테크하우스', email: 'park@techhouse.io', status: 'meeting', lastContact: '2026-03-19', note: '3/25 미팅 예약' },
  { id: 'l4', name: '최사장', company: '맛있는 김치', email: 'choi@kimchi.kr', status: 'lead', lastContact: '2026-03-21', note: '무료 진단 완료, 미팅 유도 필요' },
  { id: 'l5', name: '정실장', company: '그린뷰티', email: 'jung@greenbeauty.com', status: 'lead', lastContact: '2026-03-15', note: 'SNS 광고 관심' },
];

export function formatCurrency(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
  if (num >= 10000) return `${Math.round(num / 10000).toLocaleString()}만`;
  return num.toLocaleString();
}

export function getStatusLabel(status: Campaign['status']): string {
  const map = { active: '진행 중', paused: '일시정지', ended: '종료', draft: '준비 중' };
  return map[status];
}

export function getStatusColor(status: Campaign['status']): string {
  const c = getChartColors(7);
  const map = { active: c[0], paused: c[2], ended: c[3], draft: c[4] };
  return map[status];
}

export function getLeadStatusLabel(status: Lead['status']): string {
  const map = { lead: '리드', meeting: '미팅', progress: '진행', contract: '계약' };
  return map[status];
}

export function getLeadStatusColor(status: Lead['status']): string {
  const c = getChartColors(7);
  const map = { lead: c[3], meeting: c[1], progress: c[2], contract: c[0] };
  return map[status];
}
