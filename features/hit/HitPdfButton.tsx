'use client';

import { Download } from 'lucide-react';

interface HitPdfButtonProps {
  resultId: string;
  typeCode: string;
}

export default function HitPdfButton({ resultId, typeCode }: HitPdfButtonProps) {
  const handleDownload = () => {
    // Open report page in new tab — user can print/save as PDF from there
    window.open(`/hero/hit/a/report/${resultId}`, '_blank');
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-6 py-3 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors print-keep"
    >
      <Download className="h-4 w-4" />
      PDF 보고서 다운로드
    </button>
  );
}
