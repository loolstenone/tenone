'use client';

/**
 * WIO UI — BottomSheet
 *
 * 모바일 친화 바텀 시트 쉘. 진입/퇴장 애니메이션, 딤 배경, 스크롤 잠금,
 * 핸들 바, 닫기 버튼, 안전영역 패딩을 제공한다.
 *
 * 크로스 브랜드 공유 컴포넌트. `features/badak/MemberProfileSheet` 등
 * 기존 바텀시트 패턴을 일반화한 것.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type BottomSheetTheme = 'dark' | 'light';

export interface BottomSheetProps {
  /** 열림 상태 — false → 마운트 유지 + 슬라이드 아웃 애니메이션 */
  open: boolean;
  onClose: () => void;
  /** 헤더 슬롯 — 이름/아바타 등 */
  header?: ReactNode;
  /** 본문 */
  children: ReactNode;
  /** 최대 너비 (px). 기본 860 */
  maxWidth?: number;
  /** 최대 높이 (vh). 기본 80 */
  maxHeightVh?: number;
  /** 테마 — dark(기본) | light */
  theme?: BottomSheetTheme;
  /** 닫기 버튼 표시. 기본 true */
  showCloseButton?: boolean;
  /** 핸들 바 표시. 기본 true */
  showHandle?: boolean;
  /** 딤 클릭 시 닫기. 기본 true */
  closeOnBackdropClick?: boolean;
}

const THEMES: Record<BottomSheetTheme, {
  bg: string; border: string; handle: string; closeBg: string; closeColor: string;
}> = {
  dark: {
    bg: '#1a1a2e',
    border: 'rgba(255,255,255,0.08)',
    handle: 'rgba(255,255,255,0.12)',
    closeBg: 'rgba(255,255,255,0.06)',
    closeColor: 'rgba(255,255,255,0.3)',
  },
  light: {
    bg: '#ffffff',
    border: 'rgba(0,0,0,0.08)',
    handle: 'rgba(0,0,0,0.12)',
    closeBg: 'rgba(0,0,0,0.05)',
    closeColor: 'rgba(0,0,0,0.4)',
  },
};

export function BottomSheet({
  open,
  onClose,
  header,
  children,
  maxWidth = 860,
  maxHeightVh = 80,
  theme = 'dark',
  showCloseButton = true,
  showHandle = true,
  closeOnBackdropClick = true,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const t = THEMES[theme];

  useEffect(() => {
    if (!open) {
      setMounted(false);
      return;
    }
    requestAnimationFrame(() => setMounted(true));
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          background: mounted ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
          transition: 'background 0.25s ease',
          backdropFilter: 'blur(2px)',
        }}
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* 시트 */}
      <div
        className="fixed bottom-0 left-1/2 z-[9999] w-full -translate-x-1/2 overflow-hidden rounded-t-2xl"
        style={{
          maxWidth,
          background: t.bg,
          border: `1px solid ${t.border}`,
          borderBottom: 'none',
          transform: `translateX(-50%) translateY(${mounted ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          maxHeight: `${maxHeightVh}vh`,
          overflowY: 'auto',
        }}
      >
        {/* 핸들 */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full" style={{ background: t.handle }} />
          </div>
        )}

        {/* 닫기 버튼 */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 transition-colors hover:opacity-80"
            style={{ background: t.closeBg, color: t.closeColor }}
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* 헤더 슬롯 */}
        {header}

        {/* 본문 */}
        {children}

        {/* Safe area */}
        <div className="h-8" />
      </div>
    </>
  );
}
