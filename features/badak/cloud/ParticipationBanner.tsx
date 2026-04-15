'use client';

import { useMemo } from 'react';

// 참여 독려 문구 — 바닥장/모임 참여를 이끄는 공감형 메시지
const MESSAGES = [
  // 사용자 제공
  {
    text: '내가 하고 있는 일을 남에게 설명하고 가르칠 수 있다면\n그게 전문가 아니겠어?',
    sub: '당신의 경험, 바닥에서 나눠보세요',
  },
  {
    text: '일하면서 터득한 노하우를 나누고, 수익도 얻을 수 있다면.',
    sub: '바닥장으로 시작해보세요',
  },
  {
    text: '유튜브 조회수보다\n직접 만나는 게 더 확실하다',
    sub: '오프라인에서 연결되는 힘',
  },
  // 추가 10개
  {
    text: '혼자 고민하다 지치셨나요?\n같은 고민 가진 사람이 바로 여기 있어요.',
    sub: '나만 이런 게 아니었어',
  },
  {
    text: '책에서 못 찾은 답,\n지금 현장에서 뛰고 있는 사람에게 물어보세요.',
    sub: '실무 경험이 곧 커리큘럼이에요',
  },
  {
    text: '당신의 3년이\n누군가에게는 10년치 힌트가 됩니다.',
    sub: '경험의 가치를 다시 보세요',
  },
  {
    text: '연결이 기회를 만든다.\n모임 하나가 커리어의 터닝포인트가 되기도 해요.',
    sub: '우연한 만남이 인생을 바꾼다',
  },
  {
    text: '완벽하게 준비되길 기다리다간\n영원히 못 나가요. 일단 나와봐요.',
    sub: '시작이 반이에요',
  },
  {
    text: '내가 별것 아니라고 생각하는 경험이\n다른 사람에겐 엄청난 인사이트예요.',
    sub: '당신이 모르는 당신의 가치',
  },
  {
    text: '강의실이 아닌 밥상머리에서 배운 게\n더 오래 남더라.',
    sub: '진짜 배움은 사람 사이에서',
  },
  {
    text: '오늘 나눈 이야기 하나가\n내일 누군가의 결정을 바꿀 수 있어요.',
    sub: '말 한마디의 파급력',
  },
  {
    text: '전문가는 어딘가에 있는 게 아니라\n지금 일하고 있는 당신이에요.',
    sub: '현장이 곧 실력이다',
  },
  {
    text: '나만 이런 고민 하는 줄 알았는데.\n여기 다 같은 사람들이었어.',
    sub: '같은 고민, 같이 해결해요',
  },
];

interface ParticipationBannerProps {
  /** 같은 페이지에 여러 배너를 쓸 때 다른 문구가 나오도록 offset 전달 */
  offset?: number;
}

export function ParticipationBanner({ offset = 0 }: ParticipationBannerProps) {
  const msg = useMemo(() => {
    const idx = (Math.floor(Math.random() * MESSAGES.length) + offset) % MESSAGES.length;
    return MESSAGES[idx];
  }, [offset]);

  return (
    <div
      className="my-5 rounded-2xl px-5 py-5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,217,61,0.07) 0%, rgba(96,165,250,0.04) 100%)',
        border: '1px solid rgba(255,217,61,0.15)',
      }}
    >
      {/* 아이콘 + 라벨 */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="text-[13px]">💡</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,217,61,0.4)' }}>
          Badak 이야기
        </span>
      </div>

      {/* 본문 */}
      <p
        className="text-[15px] font-bold leading-[1.65] text-white/85 whitespace-pre-line"
        style={{ letterSpacing: '-0.03em' }}
      >
        {msg.text}
      </p>

      {/* 서브 문구 */}
      <p className="mt-2.5 text-[11px] text-white/30" style={{ letterSpacing: '-0.01em' }}>
        — {msg.sub}
      </p>
    </div>
  );
}
