'use client';

import { MessageCircle } from 'lucide-react';

/**
 * 섹션별 "히어로에게 물어보기" 버튼
 * 클릭 시 채팅 패널을 열고 해당 섹션 관련 질문을 자동 입력
 */
export default function AskHeroButton({
  question,
  onAsk,
}: {
  question: string;
  onAsk: (q: string) => void;
}) {
  return (
    <button
      onClick={() => onAsk(question)}
      className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#E53935] transition-colors mt-2"
    >
      <MessageCircle className="h-3 w-3" />
      히어로에게 물어보기
    </button>
  );
}
