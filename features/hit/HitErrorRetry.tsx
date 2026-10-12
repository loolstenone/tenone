'use client';

import { AlertCircle } from 'lucide-react';

/** HIT 공용 오류 표시 + 다시 시도 (2026-10-12) */
export default function HitErrorRetry({ message, onRetry, retryLabel = '다시 시도', className = '' }: {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div role="alert" className={`flex flex-col items-center gap-3 text-center ${className}`}>
      <div className="flex items-start gap-2 text-sm text-red-600 break-keep">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
      </div>
      <button type="button" onClick={onRetry} className="px-5 py-2 bg-[#E53935] text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
        {retryLabel}
      </button>
    </div>
  );
}
