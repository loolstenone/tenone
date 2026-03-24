'use client';

import { Download, FileText } from 'lucide-react';

interface PageActionsProps {
  title?: string;
}

export default function PageActions({ title }: PageActionsProps) {
  const handlePDF = () => {
    window.print();
  };

  const handleDownload = () => {
    // CSV/데이터 다운로드 (향후 구현)
    const content = document.querySelector('main')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'smarcomm-report'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button onClick={handleDownload} title="데이터 내려받기"
        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-text-sub hover:bg-surface hover:text-text transition-colors">
        <Download size={13} /> 내려받기
      </button>
      <button onClick={handlePDF} title="PDF로 저장"
        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-text-sub hover:bg-surface hover:text-text transition-colors">
        <FileText size={13} /> PDF
      </button>
    </div>
  );
}
