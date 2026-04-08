'use client';

import { FileText } from 'lucide-react';

interface HitPdfButtonProps {
  resultId: string;
  typeCode: string;
}

export default function HitPdfButton({ resultId, typeCode }: HitPdfButtonProps) {
  const handleOpen = () => {
    // Open full report page in new tab — user can print/save as PDF from there
    window.open(`/hero/hit/a/report/${resultId}`, '_blank');
  };

  return (
    <button
      onClick={handleOpen}
      className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-xl hover:border-neutral-400 hover:bg-neutral-50 transition-colors print-keep"
    >
      <FileText className="h-4 w-4 text-neutral-500" />
      전체 보고서 보기
    </button>
  );
}
