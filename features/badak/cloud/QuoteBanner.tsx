'use client';

import { useMemo } from 'react';

const QUOTES = [
  { text: '젊은이여 그대 이름을 가치있게 하라', author: '앤드류 카네기' },
  { text: '시작하기에 가장 완벽한 곳은 바로 지금 당신이 있는 그곳이다', author: '다이터 F.' },
  { text: '말로 성장하는 것이 아니라 경청으로 성장한다', author: '케빈 레이너' },
  { text: '아직 위대한 일을 할 수 없다면, 작은 일을 위대하게 하라', author: '' },
  { text: '떠오르는 일이 있다면 작게라도 시도해보라. 실패해도 괜찮다. 그 시도가 쌓이면 좋아하는 일이 뭔지, 잘하는 일이 뭔지 알게 될 것이다. 그것이 인생의 영점 조준이다.', author: 'Badak' },
  { text: '꿈이 뭔지 모르겠다면, 지금 하고 싶은 일을 먼저 시작하라.', author: 'Badak' },
  { text: '뭔가 해보고 싶은 의지, 뭐라도 해보는 실행력. 그것이 지금 당신에게 필요한 역량이다.', author: 'Badak' },
  { text: '연결은 더 많은 기회를 만들어 낸다.', author: 'Badak' },
  { text: '리더와 팔로어는 역할이지, 직급이 아니다.', author: 'Badak' },
  { text: '우주는 한 눈에 볼 수 없다.', author: 'Badak' },
  { text: '만남과 관계 속에서 일이 만들어진다.', author: 'Badak' },
  { text: '모든 위대한 탄생은 끄적거림에서 시작된다.', author: 'Badak' },
  { text: '인생은 당신의 선택들이 모여 만들어진다.', author: '사르트르 인용' },
  { text: '하고 싶은 일들을 계속 하다 보면 실패하든, 성공하든 어느 한 곳, 한 방향에 점이 찍혀 있을 것이다. 그것이 당신이 좋아하는 일이다.', author: 'Badak' },
  { text: '어설픈 완벽주의는 일을 출발시키지 못한다.', author: 'Badak' },
  { text: '느린 것은 걱정하지 마라, 멈춰 서는 것을 두려워하라.', author: 'Badak' },
  { text: '열정은 얼마나 뜨거운가 보다, 얼마나 오래 가느냐가 더 중요하다.', author: 'Badak' },
  { text: '그대가 직면하는 모든 도전은 성장을 위한 기회이다.', author: '' },
];

export function QuoteBanner() {
  // 매 렌더 세션에서 한 번만 랜덤 선택 (hydration 안전)
  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  }, []);

  return (
    <div
      className="my-4 rounded-2xl px-5 py-5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,217,61,0.05) 0%, rgba(255,107,107,0.04) 100%)',
        border: '1px solid rgba(255,217,61,0.12)',
      }}
    >
      {/* 격언 텍스트 + 따옴표 */}
      <p
        className="text-[14px] font-medium leading-[1.7] text-white/70"
        style={{ letterSpacing: '-0.02em' }}
      >
        <span className="mr-1 text-[20px] font-serif leading-none" style={{ color: 'rgba(255,217,61,0.3)', verticalAlign: '-0.1em' }}>&ldquo;</span>
        {quote.text}
        <span className="ml-1 text-[20px] font-serif leading-none" style={{ color: 'rgba(255,217,61,0.3)', verticalAlign: '-0.1em' }}>&rdquo;</span>
      </p>

      {/* 출처 */}
      {quote.author && (
        <p className="mt-3 text-right text-[11px] text-white/30">
          — {quote.author}
        </p>
      )}
    </div>
  );
}
