import type { SkyInfo } from '@/types/badak';

// ── 순환 프롬프트 ──

export const PROMPTS = [
  '어떤 걸 하고 싶으세요?',
  '요즘 어떤 고민이 있으세요?',
  '어떤 사람을 만나고 싶으세요?',
  '지금 가장 필요한 건 뭔가요?',
  '다음 단계로 뭘 준비하고 있어요?',
];


// ── 시간대별 하늘 ──

export function getTimeBasedSky(): SkyInfo {
  const hour = new Date().getHours();
  // 다크 테마 시간대별 그라데이션
  if (hour >= 5 && hour < 8)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #2d1b3d 40%, #1a1a2e 100%)', period: 'dawn' };
  if (hour >= 8 && hour < 11)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #1a1a2e 100%)', period: 'morning' };
  if (hour >= 11 && hour < 15)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #1a2332 40%, #1a1a2e 100%)', period: 'day' };
  if (hour >= 15 && hour < 18)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #2a1f1a 40%, #1a1a2e 100%)', period: 'afternoon' };
  if (hour >= 18 && hour < 21)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #2d1b2e 40%, #1a1a2e 100%)', period: 'sunset' };
  return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #1a1a2e 100%)', period: 'night' };
}

// ── 배지 색상 맵 ──

export const BADGE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  '모임 확정': { bg: 'rgba(46, 213, 115, 0.12)', color: '#2ed573', border: 'rgba(46, 213, 115, 0.25)' },
  '니즈 모이는 중': { bg: 'rgba(255, 200, 87, 0.12)', color: '#ffd93d', border: 'rgba(255, 200, 87, 0.25)' },
  '마감 임박': { bg: 'rgba(255, 107, 107, 0.12)', color: '#ff6b6b', border: 'rgba(255, 107, 107, 0.25)' },
  'Next Stage 스토리': { bg: 'rgba(116, 185, 255, 0.12)', color: '#74b9ff', border: 'rgba(116, 185, 255, 0.25)' },
};
